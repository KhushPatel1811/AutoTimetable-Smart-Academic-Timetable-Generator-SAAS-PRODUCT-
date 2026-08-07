import express from 'express'
import Teacher from '../Models/TeacherModel.js'
import TeacherRegistrationMiddleware from '../Middleware/Teacher_Registration_Middleware.js'
import authMiddleware from '../Middleware/AuthMiddleware.js'
import roleMiddleware from '../Middleware/RoleMiddleware.js'
import { validationResult } from 'express-validator'
import TeacherUpdateMiddleware from '../Middleware/Teacher_Update_Middleware.js'
import createNotification from '../Services/NotificationService.js'
import logActivity from '../Services/ActivityLogService.js'

const router = express.Router()

// ─── GET TEACHER BY EMAIL ─────────────────────────────────────────────────────
router.get('/id', authMiddleware, async (req, resp) => {
    const { email } = req.query
    const instituteId = req.user.instituteId

    try {
        const response = await Teacher.findOne({ teacherEmail: email, instituteId })
        if (!response) {
            return resp.status(404).json({ message: 'Teacher Not Found' })
        }
        return resp.status(200).json({ response })
    }
    catch (err) {
        return resp.status(500).json({ message: err.message })
    }
})

// ─── GET ALL TEACHERS (with search + filters) ────────────────────────────────
router.get('/', authMiddleware, async (req, resp) => {
    const { search, departmentFilter, availabilityFilter } = req.query
    const instituteId = req.user.instituteId
    const filter = { instituteId }

    if (search) {
        filter.$or = [
            { teacherName: { $regex: search, $options: 'i' } },
            { teacherId: { $regex: search, $options: 'i' } }
        ]
    }

    // Support both legacy single-dept and new multi-dept
    if (departmentFilter) {
        filter.$or = filter.$or
            ? [...filter.$or, { teacherDepartments: departmentFilter }, { teacherDepartment: departmentFilter }]
            : [{ teacherDepartments: departmentFilter }, { teacherDepartment: departmentFilter }]
    }

    if (availabilityFilter) {
        filter.teacherAvailability = availabilityFilter
    }

    try {
        const teachers = await Teacher.find(filter)
        resp.status(200).json({ teachers })
    }
    catch (err) {
        resp.status(500).json({ message: err.message })
    }
})

// ─── ADD TEACHER ─────────────────────────────────────────────────────────────
router.post('/add', authMiddleware, roleMiddleware('Admin'), TeacherRegistrationMiddleware(), async (req, resp) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return resp.status(400).json({ message: 'Validation Failed', errors: errors.array() })
    }

    const {
        teacherName, teacherEmail, teacherPhoneNumber,
        teacherDepartments, teacherDepartment,
        teacherAvailability, Subjects
    } = req.body
    const instituteId = req.user.instituteId
    const userId = req.user.id

    try {
        const lastTch = await Teacher.findOne({ instituteId }).sort({ teacherId: -1 }).select('teacherId')
        const lastTeacherId = lastTch?.teacherId
        let nextId = 1

        if (typeof lastTeacherId === 'string' && lastTeacherId.startsWith('TCH')) {
            const num = Number(lastTeacherId.replace('TCH', ''))
            if (!isNaN(num)) nextId = num + 1
        }

        // Support both legacy (single dept string) and new (array)
        const depts = Array.isArray(teacherDepartments) && teacherDepartments.length > 0
            ? teacherDepartments
            : teacherDepartment
                ? [teacherDepartment]
                : []

        const teacher = new Teacher({
            userId,
            instituteId,
            teacherId: `TCH${String(nextId).padStart(4, '0')}`,
            teacherName,
            teacherEmail,
            teacherPhoneNumber,
            teacherDepartments: depts,
            teacherDepartment: depts[0] || '',
            teacherAvailability,
            Subjects
        })

        await teacher.save()

        await Promise.all([
            createNotification({
                instituteId,
                type: 'teacher_added',
                message: `Teacher ${teacherName} was added to the system.`,
                metadata: { teacherName, teacherId: teacher.teacherId, departments: depts }
            }),
            logActivity({ req, module: "Teacher", action: "Create", description: `Teacher added: ${teacherName} (${teacher.teacherId}).`, newValue: { teacherName, teacherEmail, departments: depts } }),
        ]);

        resp.status(201).json({ message: 'Teacher Registered Successfully' })
    }
    catch (err) {
        resp.status(500).json({ message: err.message })
    }
})

// ─── EDIT TEACHER ─────────────────────────────────────────────────────────────
router.put('/edit/:teacherId', authMiddleware, roleMiddleware('Admin'), TeacherUpdateMiddleware(), async (req, resp) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return resp.status(400).json({ message: 'Validation Failed', error: errors.array() })
    }

    const {
        teacherName, teacherEmail, teacherPhoneNumber,
        teacherDepartments, teacherDepartment,
        teacherAvailability, Subjects
    } = req.body
    const { teacherId } = req.params
    const instituteId = req.user.instituteId

    try {
        const depts = Array.isArray(teacherDepartments) && teacherDepartments.length > 0
            ? teacherDepartments
            : teacherDepartment
                ? [teacherDepartment]
                : []

        const prevTeacher = await Teacher.findOne({ teacherId, instituteId })
        const prevDepts = prevTeacher?.teacherDepartments || []

        const updateTeacher = await Teacher.findOneAndUpdate(
            { teacherId, instituteId },
            {
                $set: {
                    teacherName, teacherEmail, teacherPhoneNumber,
                    teacherDepartments: depts,
                    teacherDepartment: depts[0] || '',
                    teacherAvailability, Subjects
                }
            },
            { new: true, runValidators: true }
        ).select('-password')

        if (!updateTeacher) {
            return resp.status(404).json({ message: 'Teacher Not Found' })
        }

        // Notify if department changed
        const deptsChanged = JSON.stringify(prevDepts.sort()) !== JSON.stringify(depts.sort())
        if (deptsChanged) {
            await createNotification({
                instituteId,
                type: 'teacher_department_changed',
                message: `Teacher ${teacherName} department assignment was updated.`,
                metadata: { teacherName, teacherId, oldDepartments: prevDepts, newDepartments: depts }
            })
        }

        await logActivity({ req, module: "Teacher", action: "Update", description: `Teacher updated: ${teacherName} (${teacherId}).`, previousValue: { teacherName: prevTeacher?.teacherName }, newValue: { teacherName, departments: depts } });

        resp.status(200).json({ updateTeacher })
    }
    catch (err) {
        return resp.status(500).json({ message: err.message })
    }
})

// ─── GET SINGLE TEACHER FOR EDIT ────────────────────────────────────────────
router.get('/edit/:teacherId', authMiddleware, async (req, resp) => {
    try {
        const instituteId = req.user.instituteId
        const teacher = await Teacher.findOne({ teacherId: req.params.teacherId, instituteId })

        if (!teacher) {
            return resp.status(404).json({ message: 'Teacher Not Found' })
        }

        resp.status(200).json({ teacher })
    }
    catch (err) {
        return resp.status(500).json({ message: err.message })
    }
})

// ─── DELETE TEACHER ───────────────────────────────────────────────────────────
router.delete('/delete/:teacherId', authMiddleware, roleMiddleware('Admin'), async (req, resp) => {
    try {
        const instituteId = req.user.instituteId
        const teacher = await Teacher.findOne({ teacherId: req.params.teacherId, instituteId })

        if (!teacher) {
            return resp.status(404).json({ message: 'Teacher Not Found' })
        }

        await Teacher.deleteOne({ teacherId: req.params.teacherId, instituteId })

        await Promise.all([
            createNotification({
                instituteId,
                type: 'teacher_removed',
                message: `Teacher ${teacher.teacherName} was removed from the system.`,
                metadata: { teacherName: teacher.teacherName, teacherId: teacher.teacherId }
            }),
            logActivity({ req, module: "Teacher", action: "Delete", description: `Teacher deleted: ${teacher.teacherName} (${teacher.teacherId}).`, previousValue: { teacherName: teacher.teacherName } }),
        ]);

        return resp.status(200).json({ message: 'Teacher deleted successfully' })
    }
    catch (err) {
        return resp.status(500).json({ message: err.message })
    }
})

// ─── FETCH DETAILS BY DEPT + SUBJECT ────────────────────────────────────────
router.get('/fetchDetails', authMiddleware, async (req, res) => {
    const { department, subject } = req.query
    const instituteId = req.user.instituteId

    try {
        if (!department?.trim() || !subject?.trim()) {
            return res.status(400).json({ message: 'Department and Subject are required' })
        }

        const teachers = await Teacher.find({
            $or: [
                { teacherDepartments: department },
                { teacherDepartment: department }
            ],
            "Subjects.subjects": subject,
            instituteId
        }).select('teacherId teacherName')

        if (teachers.length === 0) {
            return res.status(404).json({ message: 'No teachers found', teachers: [] })
        }

        return res.status(200).json({ teachers })
    }
    catch (err) {
        return res.status(500).json({ message: err.message })
    }
})

export default router
