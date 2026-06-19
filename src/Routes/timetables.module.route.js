import express from "express";
import TimeTable from "../Models/timetableModel.js";
import authMiddleware from "../Middleware/AuthMiddleware.js";
import { generateTimetablePdf } from "../Services/TimetablePdfService.js";

const router = express.Router();

const buildFilter = (query) => {
    const filter = {};

    if (query.instituteId) filter.instituteId = query.instituteId;
    if (query.departmentName) filter.departmentName = query.departmentName;
    if (query.semester) filter.semester = Number(query.semester);

    return filter;
};

router.get("/latest", authMiddleware, async (req, res) => {
    const timetable = await TimeTable.findOne(buildFilter(req.query)).sort({ createdAt: -1 });

    if (!timetable) {
        return res.status(404).json({ message: "No timetable found." });
    }

    res.json({ timetable });
});

router.get("/history", authMiddleware, async (req, res) => {
    const { search = "", page = 1, limit = 12 } = req.query;
    const filter = buildFilter(req.query);

    if (search) {
        filter.$or = [
            { departmentName: { $regex: search, $options: "i" } },
            { "divisions.divisionName": { $regex: search, $options: "i" } }
        ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [items, total] = await Promise.all([
        TimeTable.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
        TimeTable.countDocuments(filter)
    ]);

    res.json({ items, total, page: Number(page), limit: Number(limit) });
});

router.get("/:id", authMiddleware, async (req, res) => {
    const timetable = await TimeTable.findById(req.params.id);

    if (!timetable) {
        return res.status(404).json({ message: "Timetable not found." });
    }

    res.json({ timetable });
});

router.get("/:id/pdf", authMiddleware, async (req, res) => {
    const timetable = await TimeTable.findById(req.params.id);

    if (!timetable) {
        return res.status(404).json({ message: "Timetable not found." });
    }

    const pdf = generateTimetablePdf(timetable);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="timetable-${timetable._id}.pdf"`);
    res.send(pdf);
});

router.get("/:id/share", authMiddleware, async (req, res) => {
    const timetable = await TimeTable.findById(req.params.id).select("_id departmentName semester version createdAt");

    if (!timetable) {
        return res.status(404).json({ message: "Timetable not found." });
    }

    res.json({
        shareUrl: `${req.protocol}://${req.get("host")}/timetables/view/${timetable._id}`,
        timetable
    });
});

export default router;
