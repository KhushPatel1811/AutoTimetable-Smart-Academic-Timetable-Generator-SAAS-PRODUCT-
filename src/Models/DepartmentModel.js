import mongoose from 'mongoose'

const departmentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },

    departmentName: {
        type: String,
        required: [true, 'Department Name Is Required'],
        trim: true,
        match:[/^[A-Za-z0-9 ]+$/, 'Department Name Should Not Contain Special Characters']
    },

    departmentId: {
        type: String,
        trim: true,
        unique: true,
        required: [true, 'Department Id Is Required']
    },

    instituteId: {
    type: String,
    required: true
    }
}, {
    timestamps: true
})

departmentSchema.index({instituteId: 1, departmentName: 1},
    {unique: true}
)

const Department = mongoose.model('Department', departmentSchema)

export default Department;