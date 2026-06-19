import express from "express";
import TimeTable from "../Models/timetableModel.js";
import Teacher from "../Models/TeacherModel.js";
import Room from "../Models/RoomModel.js";
import Subject from "../Models/SubjectModel.js";
import Department from "../Models/DepartmentModel.js";
import authMiddleware from "../Middleware/AuthMiddleware.js";

const router = express.Router();

const baseFilter = (query) => {
    const filter = {};
    if (query.instituteId) filter.instituteId = query.instituteId;
    if (query.departmentName) filter.departmentName = query.departmentName;
    if (query.semester) filter.semester = Number(query.semester);
    return filter;
};

router.get("/dashboard", authMiddleware, async (req, res) => {
    const filter = baseFilter(req.query);
    const [timetables, teachers, rooms, subjects, departments] = await Promise.all([
        TimeTable.countDocuments(filter),
        Teacher.countDocuments(req.query.instituteId ? { instituteId: req.query.instituteId } : {}),
        Room.countDocuments(req.query.instituteId ? { instituteId: req.query.instituteId } : {}),
        Subject.countDocuments(req.query.instituteId ? { instituteId: req.query.instituteId } : {}),
        Department.countDocuments(req.query.instituteId ? { instituteId: req.query.instituteId } : {})
    ]);

    res.json({ timetables, teachers, rooms, subjects, departments });
});

router.get("/teacher-workload", authMiddleware, async (req, res) => {
    const data = await TimeTable.aggregate([
        { $match: baseFilter(req.query) },
        { $unwind: "$divisions" },
        { $unwind: "$divisions.schedule" },
        { $unwind: "$divisions.schedule.slots" },
        { $match: { "divisions.schedule.slots.subjectType": { $in: ["Lecture", "Lab"] } } },
        {
            $group: {
                _id: "$divisions.schedule.slots.teacherName",
                lectures: { $sum: { $cond: [{ $eq: ["$divisions.schedule.slots.subjectType", "Lecture"] }, 1, 0] } },
                labs: { $sum: { $cond: [{ $eq: ["$divisions.schedule.slots.subjectType", "Lab"] }, 1, 0] } },
                total: { $sum: 1 }
            }
        },
        { $sort: { total: -1 } }
    ]);

    res.json({ data });
});

router.get("/room-utilization", authMiddleware, async (req, res) => {
    const data = await TimeTable.aggregate([
        { $match: baseFilter(req.query) },
        { $unwind: "$divisions" },
        { $unwind: "$divisions.schedule" },
        { $unwind: "$divisions.schedule.slots" },
        { $match: { "divisions.schedule.slots.roomNumber": { $nin: ["-", "", null] } } },
        {
            $group: {
                _id: "$divisions.schedule.slots.roomNumber",
                usedSlots: { $sum: 1 },
                labs: { $sum: { $cond: [{ $eq: ["$divisions.schedule.slots.subjectType", "Lab"] }, 1, 0] } },
                lectures: { $sum: { $cond: [{ $eq: ["$divisions.schedule.slots.subjectType", "Lecture"] }, 1, 0] } }
            }
        },
        { $sort: { usedSlots: -1 } }
    ]);

    res.json({ data });
});

router.get("/subject-allocation", authMiddleware, async (req, res) => {
    const data = await TimeTable.aggregate([
        { $match: baseFilter(req.query) },
        { $unwind: "$divisions" },
        { $unwind: "$divisions.schedule" },
        { $unwind: "$divisions.schedule.slots" },
        { $match: { "divisions.schedule.slots.subjectType": { $in: ["Lecture", "Lab"] } } },
        {
            $group: {
                _id: "$divisions.schedule.slots.subjectName",
                total: { $sum: 1 },
                lectures: { $sum: { $cond: [{ $eq: ["$divisions.schedule.slots.subjectType", "Lecture"] }, 1, 0] } },
                labs: { $sum: { $cond: [{ $eq: ["$divisions.schedule.slots.subjectType", "Lab"] }, 1, 0] } }
            }
        },
        { $sort: { total: -1 } }
    ]);

    res.json({ data });
});

router.get("/generation", authMiddleware, async (req, res) => {
    const data = await TimeTable.aggregate([
        { $match: baseFilter(req.query) },
        {
            $group: {
                _id: { departmentName: "$departmentName", semester: "$semester" },
                versions: { $sum: 1 },
                latestGeneratedAt: { $max: "$createdAt" },
                divisions: { $max: "$totalDivisions" },
                days: { $max: "$totalDays" }
            }
        },
        { $sort: { latestGeneratedAt: -1 } }
    ]);

    res.json({ data });
});

router.get("/department-statistics", authMiddleware, async (req, res) => {
    const instituteFilter = req.query.instituteId ? { instituteId: req.query.instituteId } : {};
    const [departments, teachers, rooms, subjects] = await Promise.all([
        Department.aggregate([{ $match: instituteFilter }, { $group: { _id: "$departmentName", total: { $sum: 1 } } }]),
        Teacher.aggregate([{ $match: instituteFilter }, { $group: { _id: "$teacherDepartment", total: { $sum: 1 } } }]),
        Room.aggregate([{ $match: instituteFilter }, { $group: { _id: "$departmentName", total: { $sum: 1 } } }]),
        Subject.aggregate([{ $match: instituteFilter }, { $group: { _id: "$departmentName", total: { $sum: 1 } } }])
    ]);

    res.json({ departments, teachers, rooms, subjects });
});

export default router;
