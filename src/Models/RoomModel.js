import mongoose from 'mongoose'

const roomSchema = new mongoose.Schema({
    roomName: {
        type: String,
        trim: true,
        required: [true, 'Room Name Is Required'],
    },

    roomId: {
        type:String, 
        trim: true,
        unique: true,
        required: [true, 'Room Id Is Required']
    },


    roomType: {
        type: String,
        trim: true,
        required: [true, 'Room Type Is Required'],
        enum: ['Lecture', 'Lab', 'Seminar', 'Auditorium']
    },
    
    roomStatus: {
        type: String,
        trim: true,
        required: [true, 'Room Availability Is Required'],
        enum: ['Available', 'Occupied', 'Under Maintenance'], message:'Invalid Room Status',
        default: 'Available'
    },
    
    departmentName: {
        type: String,
        trim: true,
        required: [true, 'Department Name Is Required']
    }
},{
    timestamps: true
})

const Room = mongoose.model('Room', roomSchema)

export default Room;