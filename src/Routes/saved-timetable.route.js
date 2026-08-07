import express from "express";
import SavedTimetable from "../Models/SavedTimetableModel.js";
import Teacher from "../Models/TeacherModel.js";
import authMiddleware from "../Middleware/AuthMiddleware.js";
import roleMiddleware from "../Middleware/RoleMiddleware.js";
import createNotification from "../Services/NotificationService.js";
import logActivity from "../Services/ActivityLogService.js";
import User from "../Models/LoginModel.js";

const router = express.Router();

// ─── SAVE TIMETABLE (upsert per division) ────────────────────────────────────
router.post("/save", authMiddleware, roleMiddleware("Admin"), async (req, res) => {
    try {
        const {
            departmentName,
            semester,
            divisionName,
            timeSlots,
            totalDays,
            dayStartTime,
            schedule,
            sourceTimeTableId,
        } = req.body;

        const instituteId = req.user.instituteId;
        const savedBy = req.user.id;

        if (!divisionName || !departmentName || !schedule) {
            return res.status(400).json({ message: "divisionName, departmentName, and schedule are required" });
        }

        // Fetch institute name for PDF generation later
        const userDoc = await User.findById(savedBy).select("instituteName");
        const instituteName = userDoc?.instituteName || "";

        const existing = await SavedTimetable.findOne({ instituteId, divisionName });

        let saved;
        let isUpdate = false;

        if (existing) {
            // Update existing
            isUpdate = true;
            saved = await SavedTimetable.findOneAndUpdate(
                { instituteId, divisionName },
                {
                    $set: {
                        departmentName,
                        semester,
                        timeSlots,
                        totalDays,
                        dayStartTime,
                        schedule,
                        sourceTimeTableId,
                        savedBy,
                        instituteName,
                    },
                },
                { new: true }
            );
        } else {
            saved = await SavedTimetable.create({
                instituteId,
                instituteName,
                departmentName,
                semester,
                divisionName,
                timeSlots,
                totalDays,
                dayStartTime,
                schedule,
                sourceTimeTableId,
                savedBy,
            });
        }

        // Notification
        await createNotification({
            instituteId,
            type: isUpdate ? "timetable_updated" : "timetable_saved",
            message: isUpdate
                ? `Timetable for ${divisionName} was updated and saved.`
                : `Timetable for ${divisionName} was saved successfully.`,
            metadata: { divisionName, departmentName, semester },
        });

        await logActivity({ req, module: "SavedTimetable", action: isUpdate ? "Update" : "Save", description: `Timetable for ${divisionName} (${departmentName}) ${isUpdate ? "updated" : "saved"}.`, newValue: { divisionName, departmentName, semester } });

        return res.status(200).json({
            success: true,
            message: isUpdate ? "Timetable updated successfully" : "Timetable saved successfully",
            saved,
        });
    } catch (err) {
        console.error("SAVE TIMETABLE ERROR:", err);
        return res.status(500).json({ message: err.message || "Internal server error" });
    }
});

// ─── GET ALL SAVED TIMETABLES (with search + filter) ────────────────────────
router.get("/", authMiddleware, roleMiddleware("Admin"), async (req, res) => {
    try {
        const { search, departmentFilter, semesterFilter, sortBy = "updatedAt", sortOrder = "desc" } = req.query;
        const instituteId = req.user.instituteId;

        const filter = { instituteId };

        if (search) {
            filter.$or = [
                { divisionName: { $regex: search, $options: "i" } },
                { departmentName: { $regex: search, $options: "i" } },
            ];
        }
        if (departmentFilter) filter.departmentName = departmentFilter;
        if (semesterFilter)   filter.semester = Number(semesterFilter);

        const sortField = ["updatedAt", "createdAt", "divisionName", "departmentName"].includes(sortBy)
            ? sortBy
            : "updatedAt";
        const sortDir = sortOrder === "asc" ? 1 : -1;

        const timetables = await SavedTimetable.find(filter)
            .sort({ [sortField]: sortDir })
            .select("_id divisionName departmentName semester updatedAt createdAt timeSlots");

        // Unique departments for filter dropdown
        const departments = await SavedTimetable.distinct("departmentName", { instituteId });

        return res.status(200).json({ timetables, departments });
    } catch (err) {
        console.error("FETCH SAVED TIMETABLES ERROR:", err);
        return res.status(500).json({ message: err.message });
    }
});

// ─── GET SINGLE SAVED TIMETABLE PREVIEW ──────────────────────────────────────
router.get("/:id", authMiddleware, async (req, res) => {
    try {
        const instituteId = req.user.instituteId;
        const timetable = await SavedTimetable.findOne({ _id: req.params.id, instituteId });

        if (!timetable) {
            return res.status(404).json({ message: "Timetable not found" });
        }

        return res.status(200).json({ timetable });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
});

// ─── DELETE SAVED TIMETABLE ───────────────────────────────────────────────────
router.delete("/:id", authMiddleware, roleMiddleware("Admin"), async (req, res) => {
    try {
        const instituteId = req.user.instituteId;
        const timetable = await SavedTimetable.findOne({ _id: req.params.id, instituteId });

        if (!timetable) {
            return res.status(404).json({ message: "Timetable not found" });
        }

        await SavedTimetable.deleteOne({ _id: req.params.id, instituteId });

        await logActivity({
            req,
            module: "SavedTimetable",
            action: "Delete",
            description: `Saved timetable deleted for ${timetable.divisionName} (${timetable.departmentName}).`,
            previousValue: { divisionName: timetable.divisionName, departmentName: timetable.departmentName },
        });

        return res.status(200).json({ message: "Timetable deleted successfully" });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
});

// ─── GET TEACHER TIMETABLE (derived from saved timetables) ──────────────────
router.get("/teacher/:teacherId", authMiddleware, async (req, res) => {
    try {
        const instituteId = req.user.instituteId;
        const { teacherId } = req.params;

        const teacher = await Teacher.findOne({ teacherId, instituteId });
        if (!teacher) {
            return res.status(404).json({ message: "Teacher not found" });
        }

        const teacherName = teacher.teacherName;

        // Find all slots across all saved timetables where this teacher is assigned
        const allTimetables = await SavedTimetable.find({ instituteId });

        const teacherSlots = [];

        for (const tt of allTimetables) {
            for (const day of tt.schedule) {
                for (let slotIndex = 0; slotIndex < day.slots.length; slotIndex++) {
                    const slot = day.slots[slotIndex];
                    if (
                        slot.teacherName === teacherName ||
                        slot.teacherId === teacherId
                    ) {
                        teacherSlots.push({
                            day: day.day,
                            slotIndex,
                            timeSlot: tt.timeSlots?.[slotIndex] || `Slot ${slotIndex + 1}`,
                            subject: slot.subjectName,
                            subjectCode: slot.subjectCode,
                            subjectType: slot.subjectType,
                            division: tt.divisionName,
                            department: tt.departmentName,
                            room: slot.roomNumber,
                        });
                    }
                }
            }
        }

        return res.status(200).json({
            teacher: {
                teacherId: teacher.teacherId,
                teacherName: teacher.teacherName,
                teacherEmail: teacher.teacherEmail,
                teacherDepartments: teacher.teacherDepartments || [teacher.teacherDepartment],
            },
            slots: teacherSlots,
        });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
});

export default router;
