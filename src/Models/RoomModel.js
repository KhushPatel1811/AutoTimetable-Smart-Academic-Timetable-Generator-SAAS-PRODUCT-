import mongoose from 'mongoose'

const roomSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref:' User',
        required: [true, 'User Id Is Required']
    },

    instituteId: {
        type:String,
        ref: 'Teacher',
        required: [true, 'Institute Id Is Required']
    },

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
        enum: {
            values:['Lecture', 'Lab', 'Seminar', 'Auditorium'],
            message: 'Invalid Room Type'
        },
        default: 'Lecture'
    },
    
    roomStatus: {
        type: String,
        trim: true,
        required: [true, 'Room Availability Is Required'],
        enum: {
            values: ['Available', 'Occupied', 'Under Maintenance'],
            message:'Invalid Room Status',
        },
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