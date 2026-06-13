import express from 'express'
import Subject_Registration_Middleware from '../Middleware/Subject_Registration_Middleware.js'
import Subject from '../Models/SubjectModel.js'
import { validationResult } from 'express-validator'
import { Regex } from 'lucide-react'
const router = express.Router()

router.get('/', async(req, resp, next)=>{
    const {search, departmentFilter, semesterFilter, type} = req.query
    const filter = {}

    try {

        if(search) {
            filter.$or = [
            {subjectName: {$regex: search, $options: 'i'}},
            {subjectCode: {$regex: search, $options: 'i'}}
            ]
        }
        
        if(departmentFilter) {
            filter.departmentName = departmentFilter
        }


        if(semesterFilter) {
            filter.semester = Number(semesterFilter)
        }
        
        if(type) {
            filter.subjectType = type
        }
        
        const subjects = await Subject.find(filter)
        return resp.status(200).json({subjects})
    }
    catch(err) {
        return resp.status(500).json({message: err.message})
    }
})



router.post('/add', Subject_Registration_Middleware, async(req, resp, next)=>{
    console.log('SUBJECT REGISTRATION DATA RECEIVED IN BACKEND', req.body)

    const {subjectName, subjectCode, semester, departmentName, subjectType, weekly_Lecture_Hour, weekly_Lab_Hour, preferred_Room_Types} = req.body

    const errors = validationResult(req)

    if(!errors.isEmpty()) {
        return resp.status(400).json({success: false, message: errors.array()})
    }

    try {
        const subjects = []

        const lastUser = await Subject.findOne().sort({subjectId: -1}).select('subjectId')
        const lastSubjectId = lastUser?.subjectId
        let nextId = 1

        if(typeof lastSubjectId === 'string' && lastSubjectId.startsWith('SUB')) {
            const num = Number(lastSubjectId.replace('SUB', ''))

            if(!isNaN(num)) {
                nextId = num + 1;
            }
        }

        for(const subject of req.body.Subjects) {
            subjects.push({
                subjectId: `SUB${String(nextId).padStart(4, '0')}`,
                userId: req.body.userId,
                instituteId: req.body.instituteId,
                ...subject
            })
            nextId++
        }

        const savedSubjects = await Subject.insertMany(subjects)

        return resp.status(200).json({savedSubjects})
    }
    catch(err) {
        return resp.status(500).json({message: err.message})
    }
})


router.get('/edit/:subjectId', async(req,resp,next)=>{
    try {
        const subject = await Subject.findOne({subjectId: req.params.subjectId})

        if(!subject) {
            return resp.status(404).json({message: 'Subject Not Found'})
        }
        
        return resp.status(200).json({subject})
    }
    catch(err) {
        return resp.status(500).json({message: err.message})
    }
})



router.put('/edit', Subject_Registration_Middleware, async(req,resp,next)=>{
    const {subjectId, subjectName, subjectCode, semester, departmentName, subjectType, weekly_Lecture_Hour, weekly_Lab_Hour, preferred_Room_Type, teacherName} = req.body

    try {
        const subject  = await Subject.findOneAndUpdate(
            {subjectId},
            {subjectName, subjectCode, semester, departmentName, subjectType, weekly_Lecture_Hour, weekly_Lab_Hour, preferred_Room_Type, teacherName},
            {new: true, runValidators: true}
        )

        if(!subject) {
            return resp.status(404).json({message: 'Subject Not Found'})
        }
        return resp.status(200).json({subject})
    }
    catch(err) {
        return resp.status(500).json({message: err.message})
    }
})



router.delete('/delete/:id', async(req,resp, next)=>{
    
    try {
        const subject = await Subject.findOne({subjectId: req.params.id})

        if(!subject) {
            return resp.status(404).json({message: 'Subject Not Found'})
        }

        const response = await Subject.deleteOne({subjectId: req.params.id})

        return resp.status(200).json({response})
    }
    catch(err) {
        return resp.status(500).json({message: err.message})
    }
})


export default router