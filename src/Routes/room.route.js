import express from 'express'
import Room from '../Models/RoomModel.js'
import Department from '../Models/DepartmentModel.js'
import Room_Registration_Middleware from '../Middleware/Room_Registration_Middleware.js'
import { validationResult } from 'express-validator'
import authMiddleware from '../Middleware/AuthMiddleware.js'

const router = express.Router()

router.get('/', authMiddleware, async (req, resp, next) => {
    const { search, departmentFilter, availabilityFilter } = req.query
    const instituteId = req.user.instituteId

    const filter = { instituteId }

    try {
        if (search) {
            filter.$or = [
                { roomName: { $regex: search, $options: 'i' } },
                { roomId: { $regex: search, $options: 'i' } }
            ]
        }

        if (departmentFilter) {
            filter.departmentName = departmentFilter
        }

        if (availabilityFilter) {
            filter.roomStatus = availabilityFilter
        }

        const rooms = await Room.find(filter)
        return resp.status(200).json({ rooms })
    }
    catch (err) {
        return resp.status(500).json({ message: err.message })
    }
})

router.post('/add', authMiddleware, Room_Registration_Middleware, async (req, resp, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return resp.status(400).json({ success: false, errors: errors.array() })
    }

    try {
        const instituteId = req.user.instituteId
        const userId = req.user.id

        const rooms = []
        let nextId = 1
        
        // Scope ID generation to institute
        const lastRoom = await Room.findOne({ instituteId }).sort({ roomId: -1 }).select('roomId')
        const lastRoomId = lastRoom?.roomId

        if (typeof lastRoomId == 'string' && lastRoomId.startsWith('ROOM')) {
            const num = Number(lastRoomId.replace('ROOM', ''))
            if (!isNaN(num)) {
                nextId = num + 1
            }
        }

        for (const roomData of req.body.Rooms) {
            const department = await Department.findOne({ 
                departmentName: roomData.departmentName,
                instituteId 
            }).select('departmentId')

            rooms.push({
                roomId: `ROOM${String(nextId).padStart(4, '0')}`,
                instituteId,
                userId,
                roomName: roomData.roomName,
                roomType: roomData.roomType,
                roomStatus: roomData.roomStatus,
                departmentName: roomData.departmentName,
                departmentId: department?.departmentId
            })
            nextId++
        }

        const savedRooms = await Room.insertMany(rooms)
        return resp.status(200).json({ savedRooms })
    }
    catch (err) {
        return resp.status(500).json({ message: err.message })
    }
})

router.get('/edit/:roomId', authMiddleware, async (req, resp, next) => {
    try {
        const instituteId = req.user.instituteId
        const room = await Room.findOne({ 
            roomId: req.params.roomId,
            instituteId 
        })

        if (!room) {
            return resp.status(404).json({ message: 'Room Not Found' })
        }

        return resp.status(200).json({ room })
    }
    catch (err) {
        return resp.status(500).json({ message: err.message })
    }
})

router.put('/edit/:roomId', authMiddleware, Room_Registration_Middleware, async (req, resp, next) => {
    const { roomName, roomType, roomStatus, departmentName } = req.body
    const instituteId = req.user.instituteId

    try {
        const room = await Room.findOne({ roomId: req.params.roomId, instituteId })

        if (!room) {
            return resp.status(404).json({ message: 'Room Not Found' })
        }

        const updateRoom = await Room.updateOne(
            { roomId: req.params.roomId, instituteId },
            { $set: { roomName, roomType, roomStatus, departmentName } }
        )

        return resp.status(200).json({ updateRoom })
    }
    catch (err) {
        return resp.status(500).json({ message: err.message })
    }
})

router.delete('/delete/:roomId', authMiddleware, async (req, resp, next) => {
    try {
        const instituteId = req.user.instituteId
        
        const room = await Room.findOne({ roomId: req.params.roomId, instituteId })
        if (!room) {
            return resp.status(404).json({ message: 'Room Not Found' })
        }

        const response = await Room.deleteOne({ roomId: req.params.roomId, instituteId })
        return resp.status(200).json({ response })
    }
    catch (err) {
        return resp.status(500).json({ message: err.message })
    }
})

export default router