import express from "express";
import TimeTable from "../Models/TimeTableModel.js";
import authMiddleware from "../Middleware/AuthMiddleware.js";
import generateEmptyTimetable, { buildLectureQueue } from "../Services/TimeTableGenerator.js";
import { solveUsingORTools } from "../Services/ORToolsService.js";

const router = express.Router();

/**
 * =========================
 * GENERATE TIMETABLE
 * =========================
 */
router.post("/generate", authMiddleware, async (req, res) => {
    try {
        const {
            instituteId,
            departmentName,
            semester,
            totalDivisions,
            totalDays,
            totalSlotsPerDay,
            dayStartTime,
            dayEndTime,
            lectureDuration,
            labDuration,
            breakDurations = [],
            breakSlots = [],
            slotLabels = []
        } = req.body;

        // -----------------------------
        // VALIDATION
        // -----------------------------
        if (!instituteId || !departmentName) {
            return res.status(400).json({
                message: "InstituteId and departmentName are required"
            });
        }

        const safeSemester =
            semester !== "" && semester !== undefined && semester !== null
                ? Number(semester)
                : undefined;

        // -----------------------------
        // GENERATE BASE STRUCTURE
        // -----------------------------
        const {
            subjects,
            teachers,
            rooms,
            divisions
        } = await generateEmptyTimetable({
            instituteId,
            departmentName,
            semester: safeSemester,
            totalDivisions,
            totalDays,
            totalSlotsPerDay
        });

        if (!subjects?.length) {
            return res.status(400).json({ message: "No subjects found" });
        }

        if (!teachers?.length) {
            return res.status(400).json({ message: "No teachers found" });
        }

        if (!rooms?.length) {
            return res.status(400).json({ message: "No rooms found" });
        }

        // -----------------------------
        // BUILD LECTURE QUEUE
        // -----------------------------
        const lectureQueue = buildLectureQueue(subjects, lectureDuration, labDuration);

// ADD THIS 👇
lectureQueue.sort(() => Math.random() - 0.5);

        if (!lectureQueue?.length) {
            return res.status(400).json({
                message: "Lecture queue empty. Check subject configuration."
            });
        }

        console.log(
  "ROOMS SENT TO SOLVER:",
  JSON.stringify(rooms, null, 2)
);

        // -----------------------------
        // CALL OR-TOOLS SOLVER
        // -----------------------------
        const result = await solveUsingORTools({
            totalDays,
            totalSlotsPerDay,
            breakSlots,

            divisions: divisions.map(d => ({
                name: d.divisionName
            })),

            teachers: teachers.map(t => ({
                id: t._id?.toString(),
                teacherId: t.teacherId?.toString(),
                name: t.teacherName,
                teacherName: t.teacherName
            })),

            rooms: rooms.map(r => ({
                id: r.roomId?.toString() || r._id?.toString(),
                name: r.roomName,
                type: r.roomType
            })),

            lectures: lectureQueue.map((l, index) => ({
                id: index,
                subject: l.subjectName,
                subjectCode: l.subjectCode,
                teacherIds: l.teacherIds || [],
                roomType: l.preferredRoomType,
                duration: l.duration,
                type: l.subjectType
            }))
        });

//         console.log("=========== OR TOOLS OUTPUT ===========");

// console.log(
//   JSON.stringify(result, null, 2)
// );

// console.log("=======================================");


// console.log(
//   "FIRST ORTOOLS SLOT:",
//   JSON.stringify(result.timetable[0].schedule[0].slots[0], null, 2)
// );

        // -----------------------------
        // VALIDATE SOLVER OUTPUT
        // -----------------------------
        if (!result || !result.success || !Array.isArray(result.timetable)) {
            return res.status(400).json({
                message: "Timetable generation failed due to constraints"
            });
        }

        // -----------------------------
        // NORMALIZE OUTPUT
        // -----------------------------
        const allocatedDivisions = result.timetable.map(div => ({
            divisionName: div.division || "Unknown Division",
            schedule: (div.schedule || []).map(day => ({
                day: day.day,
                slots: (day.slots || []).map(slot => ({
    subjectName: slot.subjectName || "-",
    subjectCode: slot.subjectCode || "-",
    subjectType: slot.subjectType || "Free",
    teacherName: slot.teacherName || "-",
    roomNumber: slot.roomNumber || "-",
    free: slot.subjectType === "Free" || !slot.subjectName || slot.subjectName === "-"
}))
            }))
        }));

//         console.log(
//   "FIRST MAPPED SLOT:",
//   JSON.stringify(allocatedDivisions[0].schedule[0].slots[0], null, 2)
// );
        // -----------------------------
        // SAVE TO DB
        // -----------------------------
        const timetable = new TimeTable({
            instituteId,
            departmentName,
            semester: safeSemester,
            totalDivisions,
            totalDays,
            dayStartTime,
            dayEndTime,
            lectureDuration,
            labDuration,
            breakDurations,
            breakSlots,
            timeSlots: slotLabels,
            divisions: allocatedDivisions
        });

        await timetable.save();

        // -----------------------------
        // RESPONSE
        // -----------------------------
        const generatedSlots =
            slotLabels?.length > 0
                ? slotLabels
                : Array.from(
                      { length: totalSlotsPerDay },
                      (_, i) => `Slot ${i + 1}`
                  );

        return res.status(200).json({
            success: true,
            timetable,
            generatedSlots,
            divisions: allocatedDivisions
        });

    } catch (err) {
        console.error("TIMETABLE ERROR:", err);

        return res.status(500).json({
            success: false,
            message: err.message || "Internal server error"
        });
    }
});

/**
 * =========================
 * HISTORY API
 * =========================
 */
router.get("/history", authMiddleware, async (req, res) => {
    try {
        const history = await TimeTable.find()
            .sort({ createdAt: -1 })
            .limit(10);

        return res.status(200).json(history);
    } catch (err) {
        console.error("HISTORY ERROR:", err);

        return res.status(500).json({
            message: "Error fetching history"
        });
    }
});

export default router;