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
    const { instituteId } = req.query;

    if (!instituteId) {
        return res.status(400).json({ message: "instituteId is required." });
    }

    const settings = await Settings.findOne({ instituteId }) || defaultSettings(instituteId);
    res.json({ settings });
});

router.post("/", authMiddleware, async (req, res) => {
    const { instituteId } = req.body;

    if (!instituteId) {
        return res.status(400).json({ message: "instituteId is required." });
    }

    const settings = await Settings.findOneAndUpdate(
        { instituteId },
        { $set: req.body },
        { upsert: true, new: true, runValidators: true }
    );

    res.json({ message: "Settings saved.", settings });
});

router.put("/", authMiddleware, async (req, res) => {
    const { instituteId } = req.body;

    if (!instituteId) {
        return res.status(400).json({ message: "instituteId is required." });
    }

    const settings = await Settings.findOneAndUpdate(
        { instituteId },
        { $set: req.body },
        { new: true, runValidators: true }
    );

    if (!settings) {
        return res.status(404).json({ message: "Settings not found." });
    }

    res.json({ message: "Settings updated.", settings });
});

router.post("/backup", authMiddleware, async (req, res) => {
    const { instituteId } = req.body;

    if (!instituteId) {
        return res.status(400).json({ message: "instituteId is required." });
    }

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
});

router.post("/restore", authMiddleware, async (req, res) => {
    const { instituteId, settings } = req.body;

    if (!instituteId || !settings) {
        return res.status(400).json({ message: "instituteId and settings are required." });
    }

    const restored = await Settings.findOneAndUpdate(
        { instituteId },
        { $set: { ...settings, instituteId } },
        { upsert: true, new: true, runValidators: true }
    );

    res.json({ message: "Settings restored.", settings: restored });
});

export default router;
