import express from "express";
import TimeTable from "../Models/timetableModel.js";
import authMiddleware from "../Middleware/AuthMiddleware.js";
import generateEmptyTimetable, { buildLectureQueue } from "../Services/TimeTableGenerator.js";
import { solveUsingORTools } from "../Services/ORToolsService.js";

const router = express.Router();

router.post("/generate", authMiddleware, async (req, res) => {

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
        labDuration
    } = req.body;

    try {

        const {
            subjects,
            teachers,
            rooms,
            divisions
        } = await generateEmptyTimetable({
            instituteId,
            departmentName,
            semester,
            totalDivisions,
            totalDays,
            totalSlotsPerDay
        });

        console.log("Subjects:", subjects.length);
        console.log("Teachers:", teachers.length);
        console.log("Rooms:", rooms.length);
        console.log("Divisions:", divisions.length);

        if (subjects.length === 0) {
            return res.status(400).json({
                message: "No subjects found."
            });
        }

        if (teachers.length === 0) {
            return res.status(400).json({
                message: "No teachers found."
            });
        }

        if (rooms.length === 0) {
            return res.status(400).json({
                message: "No rooms found."
            });
        }

const lectureQueue = buildLectureQueue(
    subjects,
    lectureDuration,
    labDuration
);

const result = await solveUsingORTools({
    totalDays,
    totalSlotsPerDay,

    divisions: divisions.map(d => ({
        name: d.divisionName
    })),

    teachers: teachers.map(t => ({
        id: t.teacherId,
        name: t.teacherName
    })),

    rooms: rooms.map(r => ({
        id: r.roomId,
        name: r.roomName,
        type: r.roomType
    })),

    lectures: lectureQueue.map((l, index) => ({
        id: index,
        subject: l.subjectName,
        subjectCode: l.subjectCode,
        teacherIds: l.teacherIds,
        roomType: l.preferredRoomType,
        roomName: rooms.find(r => r.roomType === l.preferredRoomType)?.roomName || rooms[0]?.roomName || "-",
        duration: l.duration,
        type: l.subjectType
    }))
});

if (!result.success || !Array.isArray(result.timetable)) {
    return res.status(400).json({
        message: "Unable to generate a valid timetable with the current constraints."
    });
}

const allocatedDivisions = result.timetable.map(d => ({
  divisionName: d.division,
  schedule: d.schedule.map(day => ({
    day: day.day,
    slots: day.slots.map(slot => ({
      subjectName: slot.subject,
      subjectCode: slot.subjectCode || "-",
      subjectType: slot.type,
      teacherName: slot.teacher,
      roomNumber: slot.room || slot.roomType || "-",
      free: slot.type === "Free"
    }))
  }))
}));

        console.log(`Timetable generated: ${allocatedDivisions.length} divisions`);

        const timetable = new TimeTable({
            instituteId,
            departmentName,
            semester,
            totalDivisions,
            totalDays,
            dayStartTime,
            dayEndTime,
            lectureDuration,
            labDuration,
            divisions: allocatedDivisions
        });

        await timetable.save();

        const generatedSlots = Array.from(
            { length: totalSlotsPerDay },
            (_, i) => `Slot ${i + 1}`
        );

        return res.json({
            timetable,
            generatedSlots,
            divisions: allocatedDivisions
        });

    } catch (err) {

        console.error(err);

        return res.status(500).json({
            message: err.message
        });

    }

});

router.get("/history", authMiddleware, async (req, res) => {
    try {
        const history = await TimeTable.find()
            .sort({ createdAt: -1 })
            .limit(10);

        res.status(200).json(history);

    } catch {

        res.status(500).json({
            message: "Error fetching history"
        });

    }
});

export default router;
