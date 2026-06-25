import express from 'express'
import Subject_Registration_Middleware from '../Middleware/Subject_Registration_Middleware.js'
import Subject from '../Models/SubjectModel.js'
import { validationResult } from 'express-validator'
import { Regex } from 'lucide-react'
import authMiddleware from '../Middleware/AuthMiddleware.js'
import Teacher from '../Models/TeacherModel.js'
const router = express.Router()

router.get('/', authMiddleware, async (req, resp, next) => {
    const { search, departmentFilter, semesterFilter, type } = req.query
    const instituteId = req.user.instituteId
    const filter = { instituteId }

    try {
        if (search) {
            filter.$or = [
                { subjectName: { $regex: search, $options: 'i' } },
                { subjectCode: { $regex: search, $options: 'i' } }
            ]
        }

        if (departmentFilter) {
            filter.departmentName = { $regex: `^${departmentFilter}$`, $options: 'i' };
        }

        if (semesterFilter) {
            filter.semester = Number(semesterFilter)
        }

        if (type) {
            filter.subjectType = type
        }

        const subjects = await Subject.find(filter)
        return resp.status(200).json({ subjects })
    }
    catch (err) {
        return resp.status(500).json({ message: err.message })
    }
})

router.post("/add", authMiddleware, async (req, res) => {
  try {
    const instituteId = req.user.instituteId;
    const subjects = [];

    const last = await Subject.findOne({ instituteId }).sort({ subjectId: -1 });
    let nextId = 1;

    if (last?.subjectId?.startsWith("SUB")) {
      nextId = Number(last.subjectId.replace("SUB", "")) + 1;
    }

    for (const sub of req.body.Subjects) {
      subjects.push({
        subjectId: `SUB${String(nextId).padStart(4, "0")}`,
        subjectName: sub.subjectName,
        subjectCode: sub.subjectCode,
        semester: sub.semester,
        departmentName: sub.departmentName,
        subjectType: sub.subjectType,
        weekly_Lecture_Hour: sub.weekly_Lecture_Hour,
        weekly_Lab_Hour: sub.weekly_Lab_Hour,
        preferred_Room_Type: sub.preferredRoomType,
        instituteId,
        // ✅ MUST BE ARRAY OF OBJECT IDS
        teachers: sub.teachers,
      });

      nextId++;
    }

    const result = await Subject.insertMany(subjects);
    res.status(200).json({success: true,data: result,});
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});



router.get('/edit/:subjectId', authMiddleware, async (req, resp) => {
    try {
        const instituteId = req.user.instituteId;
        const subject = await Subject.findOne({ subjectId: req.params.subjectId, instituteId}).populate("teachers", "teacherName teacherId");

        if (!subject) {
            return resp.status(404).json({message: "Subject Not Found"});
        }
        console.log(JSON.stringify(subject, null, 2));

        const teacher = await Teacher.find({instituteId, teacherDepartment: subject.departmentName})
        console.log('TEACHER:', teacher)
        return resp.status(200).json({ subject, teacher });
    }
    catch (err) {
        return resp.status(500).json({message: err.message});
    }
});



router.put('/edit/:subjectId', authMiddleware, Subject_Registration_Middleware, async (req, resp, next) => {
    const { subjectName, subjectCode, semester, departmentName, subjectType, weekly_Lecture_Hour, weekly_Lab_Hour, preferred_Room_Type, teachers } = req.body
    const { subjectId } = req.params
    const instituteId = req.user.instituteId

    try {
        const subject = await Subject.findOneAndUpdate(
            { subjectId, instituteId },
            { subjectName, subjectCode, semester, departmentName, subjectType, weekly_Lecture_Hour, weekly_Lab_Hour, preferred_Room_Type, teachers },
            { new: true, runValidators: true }
        )

        if (!subject) {
            return resp.status(404).json({ message: 'Subject Not Found' })
        }
        return resp.status(200).json({ subject })
    }
    catch (err) {
        return resp.status(500).json({ message: err.message })
    }
})

router.delete('/delete/:id', authMiddleware, async (req, resp, next) => {
    try {
        const instituteId = req.user.instituteId
        const subject = await Subject.findOne({ subjectId: req.params.id, instituteId })

        if (!subject) {
            return resp.status(404).json({ message: 'Subject Not Found' })
        }

        const response = await Subject.deleteOne({ subjectId: req.params.id, instituteId })
        return resp.status(200).json({ response })
    }
    catch (err) {
        return resp.status(500).json({ message: err.message })
    }
})


export default router