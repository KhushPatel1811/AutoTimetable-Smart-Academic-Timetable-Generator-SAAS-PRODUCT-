import express from 'express'
import Room from '../Models/RoomModel.js'
import Department from '../Models/DepartmentModel.js'

const router = express.Router()

router.get('/', async(req, resp, next)=>{
    const {search, departmentFilter, availabilityFilter} = req.query

    const filter = {}

    try {

        if(search) {
            filter.$or = [
                {roomName: {$regex: search, $options: 'i'}},
                {roomId: {$regex: search, $options: 'i'}}
            ]
        }

        if(departmentFilter) {
            filter.departmentName = departmentFilter 
        }

        if(availabilityFilter) {
            filter.roomStatus = availabilityFilter
        }

        const rooms = await Room.find(filter)

        return resp.status(200).json({rooms})
    }
    catch(err) {
        return resp.status(500).json({message: err.message})
    }
})


router.post('/add', async(req, resp, next)=>{
    console.log("BACKEND RECEIVING ROOM DATA", req.body)
    try {
        const rooms = []
        let nextId = 1
        const user = await Room.findOne().sort({roomId: -1}).select('roomId')
        const lastRoomId = user?.roomId

        if(typeof lastRoomId == 'string' && lastRoomId.startsWith('ROOM')) {
            const num = Number(lastRoomId.replace('ROOM',''))

            if(!isNaN(num)) {
                nextId = num + 1
            }
        }

        
        for(const roomData of req.body.Rooms) {
            const departmentId = await Department.findOne({departmentName: req.body.departmentName}).select('departmentId')
            
            rooms.push({
                roomId: `ROOM${String(nextId).padStart(4,'0')}`,
                roomName: roomData.roomName,
                roomType: roomData.roomType,
                roomStatus: roomData.roomStatus,
                departmentName: roomData.departmentName,
                departmentId: departmentId,
                instituteId: roomData.instituteId,
                userId: roomData.userId
            })
            nextId++
        }
        
        const savedRooms = await Room.insertMany(rooms)

        return resp.status(200).json({savedRooms})
    }
    catch(err) {
        return resp.status(500).json({message: err.message})
    }
})


router.get('/edit/:roomId', async(req,resp,next)=>{
    try {
        const room = await Room.findOne({roomId: req.params.roomId})

        return resp.status(200).json({room})
    }
    catch(err) {
        return resp.status(500).json({message: err.message})
    }
})


router.put('/edit/:roomId', async(req, resp, next)=>{
    const {roomName, roomType, roomStatus, departmentName} = req.body
    try {
        const room = await Room.findOne({roomId: req.params.roomId})

        if(!room) {
            return resp.status(404).json({message: 'Room Not Found'})
        }

        const updateRoom = await Room.updateOne(
            {roomId: req.params.roomId},
            {$set: {roomName, roomType, roomStatus, departmentName}}
        )

        return resp.status(200).json({updateRoom})
    }
    catch(err) {
        return resp.status(500).json({message: err.message})
    }
})


router.delete('/delete/:roomId', async(req,resp,next)=>{
    try {
        const response = await Room.deleteOne({roomId: req.params.roomId})
        console.log('DELETED DATA:',response)

        return resp.status(200).json({response})
    }
    catch(err) {
        return resp.status(500).json({message: err.message})
    }
})

export default router