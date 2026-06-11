import express from 'express'
import Department_Registration_Middleware from '../Middleware/Department_Registration_Middleware.js'
import { validationResult } from 'express-validator'
import Department from '../Models/DepartmentModel.js'

const router = express.Router()


router.get('/', async(req,resp,next)=>{
    try {
        const department = await Department.find()

        return resp.status(200).json({department})
    }
    catch(err) {
        return resp.status(500).json({message: err.message})
    }
})



router.post('/add', Department_Registration_Middleware(), async(req, resp, next)=>{
    const errors = validationResult(req)
    if(!errors.isEmpty()) {
        return resp.status(400).json({errors: errors.array()})
    }

    const lastUser = await Department.findOne().sort({'departmentId': -1}).select('departmentId')
    const lastDepartmentId = lastUser?.departmentId
    let nextId = 1

    if(typeof lastDepartmentId === 'string' && lastDepartmentId.startsWith('DEPT')) {
        const num = Number(lastDepartmentId.replace('DEPT', ''))
        
        if(!isNaN(num)) {
            nextId = num + 1
        }
    }


    try {
        const departmentToInsert = []

        const {DepartmentName, instituteId, userId} = req.body
        for(const dept of DepartmentName) {
            const existingDepartment = await Department.findOne({
                instituteId,
                departmentName: dept.departmentName
            })

            if(existingDepartment) {
                return resp.status(400).json({
                    message: `${dept.departmentName} Already Exists`
                })
            }

            departmentToInsert.push({
                instituteId,
                userId,
                departmentId: `DEPT${String(nextId).padStart(4, '0')}`,
                departmentName : dept.departmentName
            })
            nextId++;
        }

        await Department.insertMany(departmentToInsert)

        return resp.status(201).json({message: 'Departments Registered Successfully'})
    }
    catch(err) {
        return resp.status(500).json({message: err.message})
    }
})


router.get('/edit/:departmentId', async(req,resp,next)=>{
    try {
        console.log('DEPARTMENT ID:', req.params.departmentId)

        const department = await Department.findOne({departmentId: req.params.departmentId})

        if(!department) {
            return resp.status(404).json({message: 'Department Not Found'})
        }

        console.log('DEPARTMENT:',department)
        return resp.status(200).json({department})
    }
    catch(err) {
        return resp.status(500).json({message: err.message})
    }
})


router.put('/edit', Department_Registration_Middleware(), async(req,resp,next)=>{
    try {
        const department = await Department.findOne({departmentId: req.body.departmentId})

        if(!department) {
            return resp.status(404).json({message: 'Department Not Found'})
        }

        const response = await Department.findOneAndUpdate(
            {departmentId: req.body.departmentId},
            {$set: {departmentName: req.body.departmentName},},
            {new: true, runValidators: true}
        )

        return resp.status(200).json({response})
    }
    catch(err) {
        return resp.status(500).json({message: err.message})
    }
})

router.delete('/delete/:departmentId', async(req,resp,next)=>{
    try {
        const department = await Department.findOne({departmentId: req.params.departmentId})

        if(!department) {
            return resp.status(404).json({message: 'Department Not Found'})
        }

        const response = await Department.deleteOne({departmentId: req.params.departmentId})

        return resp.status(200).json({response})
    }
    catch(err) {
        return resp.status(500).json({message: err.message})
    }
})

export default router