import mongoose from 'mongoose' 

const teacherSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true, 
    },

    
    teacherName: {
        type: String,
        required: true,
        trim: true,
        minLength: [3, "Name must be at least 3 characters"],
        maxLength: [50, "Name cannot exceed 50 characters"],
        match: [/^[A-Za-z0-9\s.,&()-]+$/, "Name contains invalid characters"],
    },

    instituteName: {
    type: String,
    required: [true, 'Institute Name Is Required'],
    minLength: [3, "Institute Name must be at least 3 characters"],
    maxLength: [100, "Institute Name cannot exceed 100 characters"],
    match:[/^[A-Za-z0-9\s.,&()-]+$/, 'Institute Name contains invalid characters']
    },


    teacherEmail: {
        type: String,
        required: [true, 'Teacher Email Is Required'],
        trim: true,
        unique: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Invalid email format"],
    },

    teacherId: {
        type: String,
        required: [true, 'Teacher ID Is Required'],
        trim: true,
        unique: true,
        uppercase: true,
        minLength: [3, "Teacher ID must be at least 3 characters"],
        maxLength: [50, "Teacher ID cannot exceed 50 characters"],
    },

    teacherPhoneNumber: {
        type:String,
        required: [true, 'Phone Number Is Required'],
        match: [/^[0-9]{10}$/, 'Phone Number Must Contain 10 Digits']
    },

    teacherDepartment: {
        type: String,
        required: [true, 'Department Is Required'],
        trim: true
    },

    Subjects: [
        {
            subjects: {
                type: String, 
                required: true
            }
        }
    ],

    teacherAvailability: {
        type: String,
        enum: ['Available', 'Busy', 'On Leave'], message: 'Invalid Teacher Availability Status',
        default: 'Available'
    },

    instituteId: {
        type: String,
        required: true
    },
}, 
    {
        timestamps: true
    }
)

const Teacher = mongoose.model('Teacher', teacherSchema)

export default Teacher