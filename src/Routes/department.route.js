import express from 'express'
import Department_Registration_Middleware from '../Middleware/Department_Registration_Middleware.js'
import { validationResult } from 'express-validator'
import Department from '../Models/DepartmentModel.js'
import authMiddleware from '../Middleware/AuthMiddleware.js'

const router = express.Router()


router.get('/', authMiddleware, async (req, resp, next) => {
    try {
        const instituteId = req.user.instituteId
        const department = await Department.find({ instituteId })
        return resp.status(200).json({ department })
    }
    catch (err) {
        return resp.status(500).json({ message: err.message })
    }
})

router.post('/add', authMiddleware, Department_Registration_Middleware(), async (req, resp, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return resp.status(400).json({ errors: errors.array() })
    }

    try {
        const instituteId = req.user.instituteId
        const userId = req.user.id

        // Scope ID generation to institute
        const lastDept = await Department.findOne({ instituteId }).sort({ 'departmentId': -1 }).select('departmentId')
        const lastDepartmentId = lastDept?.departmentId
        let nextId = 1

        if (typeof lastDepartmentId === 'string' && lastDepartmentId.startsWith('DEPT')) {
            const num = Number(lastDepartmentId.replace('DEPT', ''))
            if (!isNaN(num)) {
                nextId = num + 1
            }
        }

        const departmentToInsert = []
        const { DepartmentName } = req.body

        for (const dept of DepartmentName) {
            const existingDepartment = await Department.findOne({
                instituteId,
                departmentName: dept.departmentName
            })

            if (existingDepartment) {
                return resp.status(400).json({
                    message: `${dept.departmentName} Already Exists`
                })
            }

            departmentToInsert.push({
                instituteId,
                userId,
                departmentId: `DEPT${String(nextId).padStart(4, '0')}`,
                departmentName: dept.departmentName
            })
            nextId++;
        }

        await Department.insertMany(departmentToInsert)
        return resp.status(201).json({ message: 'Departments Registered Successfully' })
    }
    catch (err) {
        return resp.status(500).json({ message: err.message })
    }
})

router.get('/edit/:departmentId', authMiddleware, async (req, resp, next) => {
    try {
        const instituteId = req.user.instituteId
        const department = await Department.findOne({ 
            departmentId: req.params.departmentId,
            instituteId 
        })

        if (!department) {
            return resp.status(404).json({ message: 'Department Not Found' })
        }

        return resp.status(200).json({ department })
    }
    catch (err) {
        return resp.status(500).json({ message: err.message })
    }
})

router.put('/edit', authMiddleware, Department_Registration_Middleware(), async (req, resp, next) => {
    try {
        const instituteId = req.user.instituteId
        const { departmentId, departmentName } = req.body

        const department = await Department.findOne({ departmentId, instituteId })

        if (!department) {
            return resp.status(404).json({ message: 'Department Not Found' })
        }

        const response = await Department.findOneAndUpdate(
            { departmentId, instituteId },
            { $set: { departmentName } },
            { new: true, runValidators: true }
        )

        return resp.status(200).json({ response })
    }
    catch (err) {
        return resp.status(500).json({ message: err.message })
    }
})

router.delete('/delete/:departmentId', authMiddleware, async (req, resp, next) => {
    try {
        const instituteId = req.user.instituteId
        const department = await Department.findOne({ 
            departmentId: req.params.departmentId,
            instituteId 
        })

        if (!department) {
            return resp.status(404).json({ message: 'Department Not Found' })
        }

        const response = await Department.deleteOne({ 
            departmentId: req.params.departmentId,
            instituteId 
        })

        return resp.status(200).json({ response })
    }
    catch (err) {
        return resp.status(500).json({ message: err.message })
    }
})

export default router