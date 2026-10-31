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
// ─── SAVE / UPDATE TIMETABLE ────────────────────────────────────────────────
// If a timetable already exists for the same institute, department,
// semester and division, update it.
// Otherwise, create a new timetable.
router.post(
    "/save",
    authMiddleware,
    roleMiddleware("Admin"),
    async (req, res) => {
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
                return res.status(400).json({
                    message:
                        "divisionName, departmentName, and schedule are required",
                });
            }

            // Fetch institute name
            const userDoc = await User.findById(savedBy).select(
                "instituteName"
            );

            const instituteName = userDoc?.instituteName || "";

            // Find the timetable belonging to this exact class/division
            const existing = await SavedTimetable.findOne({
                instituteId,
                departmentName,
                semester,
                divisionName,
            });

            let saved;
            let isUpdate = false;

            if (existing) {
                // ---------------------------------------------------------
                // EXISTING TIMETABLE
                // Update ONLY this specific timetable.
                // ---------------------------------------------------------

                isUpdate = true;

                saved = await SavedTimetable.findByIdAndUpdate(
                    existing._id,
                    {
                        $set: {
                            departmentName,
                            semester,
                            divisionName,
                            timeSlots,
                            totalDays,
                            dayStartTime,
                            schedule,
                            sourceTimeTableId,
                            savedBy,
                            instituteName,
                        },
                    },
                    {
                        new: true,
                        runValidators: true,
                    }
                );
            } else {
                // ---------------------------------------------------------
                // NEW TIMETABLE
                // ---------------------------------------------------------

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
                type: isUpdate
                    ? "timetable_updated"
                    : "timetable_saved",

                message: isUpdate
                    ? `Timetable for ${divisionName} was updated successfully.`
                    : `Timetable for ${divisionName} was saved successfully.`,

                metadata: {
                    timetableId: saved._id,
                    divisionName,
                    departmentName,
                    semester,
                },
            });

            // Activity log
            await logActivity({
                req,
                module: "SavedTimetable",
                action: isUpdate ? "Update" : "Save",

                description: isUpdate
                    ? `Timetable for ${divisionName} (${departmentName}, Semester ${semester}) was updated.`
                    : `Timetable for ${divisionName} (${departmentName}, Semester ${semester}) was saved.`,

                newValue: {
                    timetableId: saved._id,
                    divisionName,
                    departmentName,
                    semester,
                },
            });

            return res.status(isUpdate ? 200 : 201).json({
                success: true,

                message: isUpdate
                    ? "Timetable updated successfully"
                    : "Timetable saved successfully",

                action: isUpdate ? "updated" : "created",

                saved,
            });
        } catch (err) {
            console.error("SAVE/UPDATE TIMETABLE ERROR:", err);

            return res.status(500).json({
                message: err.message || "Internal server error",
            });
        }
    }
);



// ─── GET TEACHER TIMETABLE (derived from saved timetables) ──────────────────
// ─── GET TEACHER TIMETABLE ───────────────────────────────────────────────────
// Derived automatically from all saved division timetables.
//
// Teacher timetable is NOT stored separately.
// It is generated from the teacher assigned inside each division timetable.
//
// Example:
// Division A:
// Monday 10:00-11:00 → DBMS → Teacher TCH0001
//
// becomes:
//
// Teacher TCH0001:
// Monday 10:00-11:00 → DBMS → Division A
//
router.get(
    "/teacher/:teacherId",
    authMiddleware,
    async (req, res) => {
        console.log("🔥 TEACHER TIMETABLE ROUTE HIT 🔥");

        try {
            const instituteId = req.user.instituteId;
            const { teacherId } = req.params;

            console.log("=================================");
            console.log("REQUESTED TEACHER ID:", teacherId);
            console.log("REQUESTED INSTITUTE ID:", instituteId);

            // ============================================================
            // 1. FIND TEACHER
            // ============================================================

            const teacher = await Teacher.findOne({
                teacherId,
                instituteId,
            }).lean();

            if (!teacher) {
                return res.status(404).json({
                    success: false,
                    message: "Teacher not found",
                });
            }

            // ============================================================
            // 2. GET ALL SAVED TIMETABLES
            //
            // Each document represents ONE division.
            // ============================================================

            const allTimetables = await SavedTimetable.find({
                instituteId,
            })
                .sort({ updatedAt: -1 })
                .lean();

            if (!allTimetables.length) {
                return res.status(200).json({
                    success: true,
                    teacher: {
                        teacherId: teacher.teacherId,
                        teacherName: teacher.teacherName,
                        teacherEmail: teacher.teacherEmail,
                        teacherDepartments:
                            teacher.teacherDepartments ||
                            (
                                teacher.teacherDepartment
                                    ? [teacher.teacherDepartment]
                                    : []
                            ),
                    },
                    days: [],
                    slots: [],
                });
            }

            // ============================================================
            // 3. DAY ORDER
            // ============================================================

            const dayOrder = {
                Monday: 1,
                Tuesday: 2,
                Wednesday: 3,
                Thursday: 4,
                Friday: 5,
                Saturday: 6,
                Sunday: 7,
            };

            // ============================================================
            // 4. BUILD COMPLETE TIME ROWS
            //
            // IMPORTANT:
            //
            // We use schedule[].slots[] because THAT contains breaks.
            //
            // timetable.timeSlots does NOT contain:
            //
            // 11:00 - 11:15
            // 13:15 - 13:30
            //
            // Therefore we cannot use:
            //
            // timetable.timeSlots[slotIndex]
            //
            // for the complete timetable.
            //
            // ALSO IMPORTANT:
            //
            // We scope the row-map construction to timetables belonging
            // to this teacher's own department(s).  This prevents a
            // shorter (or longer) break from a completely different
            // department from overwriting the correct break duration for
            // this teacher's timetable.
            // ============================================================

            // Collect the teacher's departments for filtering
            const teacherDepts = new Set(
                [
                    ...(teacher.teacherDepartments || []),
                    ...(teacher.teacherDepartment ? [teacher.teacherDepartment] : []),
                ].map(d => d.trim().toLowerCase())
            );

            // Use department-scoped timetables for building the row structure.
            // Fall back to all timetables only if teacher has no department data.
            const structureTimetables =
                teacherDepts.size > 0
                    ? allTimetables.filter(t =>
                          t.departmentName &&
                          teacherDepts.has(t.departmentName.trim().toLowerCase())
                      )
                    : allTimetables;

            // If teacher's department has no saved timetables, fall back to all
            const rowSourceTimetables =
                structureTimetables.length > 0
                    ? structureTimetables
                    : allTimetables;

            const timetableRowsMap = new Map();

            for (const timetable of rowSourceTimetables) {
                if (!Array.isArray(timetable.schedule)) {
                    continue;
                }

                for (const dayData of timetable.schedule) {
                    if (!Array.isArray(dayData.slots)) {
                        continue;
                    }

                    for (
                        let scheduleIndex = 0;
                        scheduleIndex < dayData.slots.length;
                        scheduleIndex++
                    ) {
                        const slot = dayData.slots[scheduleIndex];

                        if (!slot) {
                            continue;
                        }

                        const key = `${scheduleIndex}`;

                        if (!timetableRowsMap.has(key)) {
                            timetableRowsMap.set(key, {
                                slotIndex: scheduleIndex,
                                timeSlot: null,
                                isBreak: false,
                                breakLabel: null,
                            });
                        }

                        const row = timetableRowsMap.get(key);

                        // ------------------------------------------------
                        // DETECT BREAK FROM ACTUAL SAVED SLOT
                        // ------------------------------------------------

                        const isBreak =
                            slot.isBreak === true ||
                            slot.subjectType === "Break" ||
                            (
                                typeof slot.subjectName === "string" &&
                                /^\d{1,2}:\d{2}\s*-\s*\d{1,2}:\d{2}$/.test(
                                    slot.subjectName.trim()
                                ) &&
                                slot.subjectCode === "-"
                            );

                        if (isBreak) {
                            row.isBreak = true;

                            // Only set the break label/timeSlot the first time
                            // we encounter this slot index.
                            // This prevents a shorter break from a different
                            // department's timetable from overwriting the
                            // correct break duration.
                            if (!row.timeSlot) {
                                row.breakLabel =
                                    slot.subjectName ||
                                    slot.label ||
                                    "Break";

                                // The break contains its OWN time.
                                row.timeSlot =
                                    slot.subjectName ||
                                    slot.label ||
                                    "Break";
                            }
                        }
                    }
                }
            }

            // ============================================================
            // 5. ADD ACTUAL TEACHING TIMES
            //
            // For non-break slots, map against timeSlots correctly.
            //
            // Example:
            //
            // schedule:
            //
            // 0 -> 09:00 - 10:00
            // 1 -> 10:00 - 11:00
            // 2 -> BREAK
            // 3 -> 11:15 - 12:15
            // 4 -> 12:15 - 13:15
            // 5 -> BREAK
            // 6 -> 13:30 - 14:30
            // 7 -> 14:30 - 15:30
            //
            // timeSlots:
            //
            // 0 -> 09:00 - 10:00
            // 1 -> 10:00 - 11:00
            // 2 -> 11:15 - 12:15
            // 3 -> 12:15 - 13:15
            // 4 -> 13:30 - 14:30
            // 5 -> 14:30 - 15:30
            //
            // ============================================================

            for (const timetable of rowSourceTimetables) {
                if (!Array.isArray(timetable.schedule)) {
                    continue;
                }

                for (const dayData of timetable.schedule) {
                    if (!Array.isArray(dayData.slots)) {
                        continue;
                    }

                    let teachingSlotIndex = 0;

                    for (
                        let scheduleIndex = 0;
                        scheduleIndex < dayData.slots.length;
                        scheduleIndex++
                    ) {
                        const slot = dayData.slots[scheduleIndex];

                        if (!slot) {
                            continue;
                        }

                        const isBreak =
                            slot.isBreak === true ||
                            slot.subjectType === "Break" ||
                            (
                                typeof slot.subjectName === "string" &&
                                /^\d{1,2}:\d{2}\s*-\s*\d{1,2}:\d{2}$/.test(
                                    slot.subjectName.trim()
                                ) &&
                                slot.subjectCode === "-"
                            );

                        // ------------------------------------------------
                        // BREAK
                        // ------------------------------------------------

                        if (isBreak) {
                            continue;
                        }

                        const row =
                            timetableRowsMap.get(
                                `${scheduleIndex}`
                            );

                        if (row && !row.timeSlot) {
                            row.timeSlot =
                                timetable.timeSlots?.[
                                    teachingSlotIndex
                                ] ||
                                `Slot ${scheduleIndex + 1}`;
                        }

                        teachingSlotIndex++;
                    }
                }
            }

            // ============================================================
            // 6. BUILD TEACHER ASSIGNMENTS
            //
            // This is where ALL DIVISIONS are merged.
            // ============================================================

            const assignmentsMap = new Map();

            for (const timetable of allTimetables) {
                if (!Array.isArray(timetable.schedule)) {
                    continue;
                }

                for (const dayData of timetable.schedule) {
                    if (!Array.isArray(dayData.slots)) {
                        continue;
                    }

                    for (
                        let scheduleIndex = 0;
                        scheduleIndex < dayData.slots.length;
                        scheduleIndex++
                    ) {
                        const slot =
                            dayData.slots[scheduleIndex];

                        if (!slot) {
                            continue;
                        }

                        // ================================================
                        // BREAKS ARE NOT TEACHER ASSIGNMENTS
                        // ================================================

                        const isBreak =
                            slot.isBreak === true ||
                            slot.subjectType === "Break" ||
                            (
                                typeof slot.subjectName === "string" &&
                                /^\d{1,2}:\d{2}\s*-\s*\d{1,2}:\d{2}$/.test(
                                    slot.subjectName.trim()
                                ) &&
                                slot.subjectCode === "-"
                            );

                        if (isBreak) {
                            continue;
                        }

                        // ================================================
                        // CHECK TEACHER
                        // ================================================

                        const isThisTeacher =
                            slot.teacherId === teacherId ||
                            (
                                slot.teacherName &&
                                slot.teacherName ===
                                    teacher.teacherName
                            );

                        if (!isThisTeacher) {
                            continue;
                        }

                        // ================================================
                        // CREATE DAY + SLOT KEY
                        // ================================================

                        const key =
                            `${dayData.day}-${scheduleIndex}`;

                        if (!assignmentsMap.has(key)) {
                            assignmentsMap.set(key, []);
                        }

                        // ================================================
                        // PREVENT DUPLICATE ASSIGNMENT
                        // ================================================

                        const existing =
                            assignmentsMap.get(key);

                        const alreadyExists =
                            existing.some(
                                (item) =>
                                    item.division ===
                                        timetable.divisionName &&
                                    item.subjectCode ===
                                        slot.subjectCode
                            );

                        if (alreadyExists) {
                            continue;
                        }

                        // ================================================
                        // ADD DIVISION ASSIGNMENT
                        // ================================================

                        existing.push({
                            subject:
                                slot.subjectName ||
                                slot.subject ||
                                "Unknown Subject",

                            subjectCode:
                                slot.subjectCode || "",

                            subjectType:
                                slot.subjectType ||
                                "Lecture",

                            division:
                                timetable.divisionName ||
                                "—",

                            department:
                                timetable.departmentName ||
                                "—",

                            room:
                                slot.roomNumber ||
                                slot.room ||
                                "—",

                            teacherName:
                                slot.teacherName ||
                                teacher.teacherName,

                            teacherId:
                                slot.teacherId ||
                                teacherId,
                        });
                    }
                }
            }

            // ============================================================
            // 7. CREATE FINAL DAYS
            //
            // Every day gets EVERY timetable row.
            // ============================================================

            const availableDays = new Set();

            for (const timetable of allTimetables) {
                if (!Array.isArray(timetable.schedule)) {
                    continue;
                }

                for (const dayData of timetable.schedule) {
                    availableDays.add(dayData.day);
                }
            }

            const sortedDays = Array.from(
                availableDays
            ).sort(
                (a, b) =>
                    (dayOrder[a] || 99) -
                    (dayOrder[b] || 99)
            );

            const days = sortedDays.map((day) => {
                const daySlots = Array.from(
                    timetableRowsMap.values()
                )
                    .sort(
                        (a, b) =>
                            a.slotIndex -
                            b.slotIndex
                    )
                    .map((row) => {
                        const key =
                            `${day}-${row.slotIndex}`;

                        const assignments =
                            assignmentsMap.get(key) ||
                            [];

                        // ----------------------------------------------
                        // If teacher has assignment here
                        // ----------------------------------------------

                        if (assignments.length > 0) {
                            return {
                                slotIndex:
                                    row.slotIndex,

                                timeSlot:
                                    row.timeSlot ||
                                    `Slot ${
                                        row.slotIndex + 1
                                    }`,

                                isBreak: false,

                                assignments,
                            };
                        }

                        // ----------------------------------------------
                        // If this is a REAL break
                        // ----------------------------------------------

                        if (row.isBreak) {
                            return {
                                slotIndex:
                                    row.slotIndex,

                                timeSlot:
                                    row.timeSlot ||
                                    row.breakLabel ||
                                    "Break",

                                isBreak: true,

                                breakLabel:
                                    row.breakLabel ||
                                    "Break",

                                assignments: [],
                            };
                        }

                        // ----------------------------------------------
                        // Teacher is not assigned
                        // ----------------------------------------------

                        return {
                            slotIndex:
                                row.slotIndex,

                            timeSlot:
                                row.timeSlot ||
                                `Slot ${
                                    row.slotIndex + 1
                                }`,

                            isBreak: false,

                            assignments: [],
                        };
                    });

                return {
                    day,
                    slots: daySlots,
                };
            });

            // ============================================================
            // 8. FLAT SLOTS ARRAY
            //
            // Kept for compatibility if your existing frontend expects
            // response.data.slots.
            // ============================================================

            const flatSlots = [];

            for (const dayData of days) {
                for (const slot of dayData.slots) {
                    if (slot.assignments.length > 0) {
                        for (const assignment of slot.assignments) {
                            flatSlots.push({
                                day: dayData.day,
                                slotIndex:
                                    slot.slotIndex,
                                timeSlot:
                                    slot.timeSlot,

                                subject:
                                    assignment.subject,

                                subjectCode:
                                    assignment.subjectCode,

                                subjectType:
                                    assignment.subjectType,

                                division:
                                    assignment.division,

                                department:
                                    assignment.department,

                                room:
                                    assignment.room,

                                isBreak: false,
                            });
                        }
                    } else if (slot.isBreak) {
                        flatSlots.push({
                            day: dayData.day,
                            slotIndex:
                                slot.slotIndex,
                            timeSlot:
                                slot.timeSlot,

                            subject: "Break",
                            subjectCode: "-",
                            subjectType: "Break",

                            division: "",
                            department: "",
                            room: "",

                            isBreak: true,

                            label:
                                slot.breakLabel ||
                                "Break",
                        });
                    }
                }
            }

            // ============================================================
            // 9. RESPONSE
            // ============================================================

            return res.status(200).json({
                success: true,

                teacher: {
                    teacherId:
                        teacher.teacherId,

                    teacherName:
                        teacher.teacherName,

                    teacherEmail:
                        teacher.teacherEmail,

                    teacherDepartments:
                        teacher.teacherDepartments ||
                        (
                            teacher.teacherDepartment
                                ? [
                                      teacher.teacherDepartment,
                                  ]
                                : []
                        ),
                },

                days,

                slots: flatSlots,
            });
        } catch (err) {
            console.error(
                "🔥 GET TEACHER TIMETABLE ERROR 🔥"
            );

            console.error(err);

            return res.status(500).json({
                success: false,
                message:
                    err instanceof Error
                        ? err.message
                        : "Failed to load teacher timetable",
            });
        }
    }
);



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



export default router;
