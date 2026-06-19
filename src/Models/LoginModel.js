import mongoose, { mongo }  from 'mongoose'
import bcrypt  from 'bcrypt'

const userSchema = new mongoose.Schema({
    userName: {
        type:String,
        required: [true, 'Name Is Required']
    },
    instituteName: {
        type: String,
        required: [true, 'College Name Is Required'],
        minLength: [3, "Institute Name must be at least 3 characters"],
        maxLength: [50, "Institute Name cannot exceed 50 characters"],
        match:[/^[A-Za-z0-9\s.,&()-]+$/, 'College Name Should Contain Only Characters']
    },
    email: {
        type: String,
        required: [true, 'Email Is Required'],
        match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-z]{2,}$/, 'Email Is Invalid'],
        lowercase:true,
        unique: true
    },
    phoneNumber: {
        type: String,
        required: [true, 'Phone Number Is Required'],
        match: [/^[0-9]{10}$/, 'Phone Number Must Contain 10 Digits']
    },
    role: {
        type: String,
        required: [true, 'Role Is Required'],
        enum: ['Admin', 'Teacher', 'Student'],
        default: 'Student'
    },
    instituteId: {
        type: String,
        required: [true, 'Institute Id Is Required'],
        trim: true,
        index: true
    },
    password: {
        type: String,
        required: [true, 'Password Is Required'],
        match: [/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+]).{6,}$/, 'Password must contain at least 6 characters, including uppercase, lowercase, number, and special character']
    }
},
{
    timestamps: true
})

const User = mongoose.model('User', userSchema);

export default User;