import express from "express";
import TimeTable from "../Models/timetableModel.js";
import authMiddleware from "../Middleware/AuthMiddleware.js";
import generateEmptyTimetable, {
    buildLectureQueue,
    allocateSubjects
} from "../Services/TimeTableGenerator.js";

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

        console.log("Lecture Queue:", lectureQueue.length);

        const allocatedDivisions = allocateSubjects(
            lectureQueue,
            divisions,
            teachers,
            rooms,
            totalSlotsPerDay
        );

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