import express from 'express'
import Teacher from '../Models/TeacherModel.js'
import TeacherRegistrationMiddleware from '../Middleware/Teacher_Registration_Middleware.js'
import authMiddleware from '../Middleware/AuthMiddleware.js'
import { validationResult } from 'express-validator'
import TeacherUpdateMiddleware from '../Middleware/Teacher_Update_Middleware.js'

const router = express.Router()


router.get('/', async(req,resp,next) => {
    const {search, departmentFilter, availabilityFilter} = req.query

    const filter = {}

    if(search) {
        filter.$or = [
            {teacherName: {$regex: search, $options: 'i'}},
            {teacherId: {$regex: search, $options: 'i'}}
        ]
    }

    if(departmentFilter) {
        filter.teacherDepartment = departmentFilter
    }

    if(availabilityFilter) {
        filter.teacherAvailability = availabilityFilter
    }

    try {
        const teachers = await Teacher.find(filter)
        resp.status(200).json({teachers})
    }
    catch(err) {
        resp.status(500).json({message: err.message})
    }
})



router.post('/add',authMiddleware, TeacherRegistrationMiddleware() ,async (req, resp, next) => {
    const {teacherName, instituteName, teacherEmail, teacherPhoneNumber, teacherDepartment, teacherAvailability, Subjects}  = req.body
    const instituteId = req.user.instituteId

    console.log('BACKEND RECEIVING NEW TEACHER DATA')
    console.log('Data: ', req.body)
    console.log('Subjects: ',req.body.Subjects);
    console.log('Subjects TYPE: ',typeof req.body.Subjects);
    

    const errors = validationResult(req) 
    if(!errors.isEmpty()) {
        return resp.status(400).json({message: 'Validation Failed', errors:errors.array()})
    }

    try {
        const lastUser = await Teacher.findOne().sort({'teacherId': -1}).select('teacherId')
        const lastTeacherId = lastUser?.teacherId
        let nextId = 1

        if(typeof lastTeacherId === 'string' && lastTeacherId.startsWith('TCH')) {
            const num = Number(lastTeacherId.replace('TCH', ''))

            if(!isNaN(num)) {
                nextId = num + 1
            }
        }

        
        const teacher = new Teacher({
            userId: req.user.id,
            instituteId,
            teacherId: `TCH${String(nextId).padStart(4, '0')}`,
            teacherName, 
            instituteName,
            teacherEmail,
            teacherPhoneNumber,
            teacherDepartment,
            teacherAvailability,
            Subjects
        })
        
        await teacher.save()
        
        resp.status(201).json({message: 'Teacher Registered Successfully'})
    }
    catch(err) {
        resp.status(500).json({message: err.message})
    }
})

router.post('/edit', authMiddleware, TeacherUpdateMiddleware(), async(req,resp,next)=>{
    const errors = validationResult(req)
    if(!errors.isEmpty()) {
        return resp.status(400).json({message: 'Validation Failed', error: errors.array()})
    }

    const {teacherId, teacherName, teacherEmail, teacherPhoneNumber, teacherDepartment, teacherAvailability, Subjects}  = req.body

    try {
        const teacher = await Teacher.findOne({teacherId})

        if(!teacher) {
            return resp.status(404).json({message: 'Teacher Not Found'})
        }

        const updateTeacher = await Teacher.findOneAndUpdate(
            {teacherId},
            {$set: {teacherName, teacherEmail, teacherPhoneNumber, teacherDepartment, teacherAvailability, Subjects},}, 
            {new:true, runValidators:true}
        ).select('-password')

        resp.status(200).json({updateTeacher})
    }
    catch(err) {
        return resp.status(500).json({message: err.message})
    }
})


router.get('/edit/:teacherId', authMiddleware, async(req,resp,next)=>{
    try {
        console.log("Teacher Id", req.params.teacherId)
        const teacher = await Teacher.findOne({teacherId: req.params.teacherId})

        if(!teacher) {
            return resp.status(404).json({message: 'Teacher Not Found'})
        }

        console.log('TEACHER: ',teacher)
        console.log(teacher.Subjects)
        resp.status(200).json({teacher})
    }
    catch(err) {
        return resp.status(500).json({message: err.message})
    }
})


router.delete('/delete/:teacherId', async(req,resp,next)=>{
    try {
        console.log('TEACHER ID:', req.params.teacherId)
        const teacher = await Teacher.findOne({teacherId: req.params.teacherId})

        console.log('TEACHER FOUND:', teacher)

        if(!teacher) {
            return resp.status(404).json({message: 'Teacher Not Found'})
        }

        const response = await Teacher.deleteOne({teacherId: req.params.teacherId})

        console.log('DELETED RECORD:', response)
        return resp.status(200).json({response})
    }
    catch(err) {
        return resp.status(500).json({message: err.message})
    }
})


router.get('/fetchDetails', async (req, res) => {
    const { department, subject } = req.query;

    console.log('Department Name from query:', department);
    console.log('SUBJECT RECEIVED IN BACKEND:', subject);

    try {
        // validation
        if (!department?.trim() || !subject?.trim()) {
            return res.status(400).json({
                message: 'Department and Subject are required'
            });
        }

        const teachers = await Teacher.find({
            teacherDepartment: department,
            "Subjects.subjects": subject
        }).select('teacherId teacherName');

        console.log('TEACHER DATA:', teachers);

        // optional: better UX instead of treating as error
        if (teachers.length === 0) {
            return res.status(404).json({
                message: 'No teachers found',
                teachers: []
            });
        }

        return res.status(200).json({
            teachers
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            message: err.message
        });
    }
});

export default router