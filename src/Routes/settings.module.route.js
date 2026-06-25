import express from "express";
import Settings from "../Models/SettingsModel.js";
import TimeTable from "../Models/timetableModel.js";
import Subject from "../Models/SubjectModel.js";
import Teacher from "../Models/TeacherModel.js";
import Room from "../Models/RoomModel.js";
import Department from "../Models/DepartmentModel.js";
import authMiddleware from "../Middleware/AuthMiddleware.js";

const router = express.Router();

const defaultSettings = (instituteId) => ({
    instituteId,
    instituteInfo: {},
    academicYear: {},
    workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    lectureDuration: 60,
    labDuration: 120,
    breaks: [],
    theme: {},
    userManagement: {},
    security: {},
    backup: {}
});

router.get("/", authMiddleware, async (req, res) => {
    try {
        const instituteId = req.user.instituteId;
        const settings = await Settings.findOne({ instituteId }) || defaultSettings(instituteId);
        res.json({ settings });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post("/", authMiddleware, async (req, res) => {
    try {
        const instituteId = req.user.instituteId;
        const userId = req.user.id;

        const settings = await Settings.findOneAndUpdate(
            { instituteId },
            { $set: { ...req.body, instituteId, userId } },
            { upsert: true, new: true, runValidators: true }
        );

        res.json({ message: "Settings saved.", settings });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.put("/", authMiddleware, async (req, res) => {
    try {
        const instituteId = req.user.instituteId;

        const settings = await Settings.findOneAndUpdate(
            { instituteId },
            { $set: req.body },
            { new: true, runValidators: true }
        );

        if (!settings) {
            return res.status(404).json({ message: "Settings not found." });
        }

        res.json({ message: "Settings updated.", settings });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post("/backup", authMiddleware, async (req, res) => {
    try {
        const instituteId = req.user.instituteId;

        const [settings, timetables, subjects, teachers, rooms, departments] = await Promise.all([
            Settings.findOne({ instituteId }),
            TimeTable.find({ instituteId }),
            Subject.find({ instituteId }),
            Teacher.find({ instituteId }),
            Room.find({ instituteId }),
            Department.find({ instituteId })
        ]);

        await Settings.findOneAndUpdate(
            { instituteId },
            { $set: { "backup.lastBackupAt": new Date() } },
            { upsert: true }
        );

        res.json({
            exportedAt: new Date(),
            settings,
            timetables,
            subjects,
            teachers,
            rooms,
            departments
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post("/restore", authMiddleware, async (req, res) => {
    try {
        const instituteId = req.user.instituteId;
        const { settings } = req.body;

        if (!settings) {
            return res.status(400).json({ message: "Settings data is required." });
        }

        const restored = await Settings.findOneAndUpdate(
            { instituteId },
            { $set: { ...settings, instituteId } },
            { upsert: true, new: true, runValidators: true }
        );

        res.json({ message: "Settings restored.", settings: restored });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

export default router;
