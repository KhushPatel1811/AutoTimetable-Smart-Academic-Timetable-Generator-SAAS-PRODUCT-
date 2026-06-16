import mongoose, { mongo }  from "mongoose";
import { match } from "node:assert";

const SubjectSchema = new mongoose.Schema({
    instituteId: {
        type: String, 
        required: [true, 'Institute Id Is Required']
    },

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User Id Is Required']
    },

    subjectId: {
        type: String,
        trim: true,
        unique: true,
        required: [true, 'Subject Id Is Required'],
    },

    subjectName: {
        type: String,
        trim: true,
        required: [true, 'Subject Name Is Required'],
    },

    subjectCode: {
        type: String,
        trim: true,
        unique: true,
        required: [true, 'Subject Code Is Required']
    },

    semester: {
        type: Number,
        required: [true, 'Semester Is Required'],
        match:(/^[0-9]+$/, 'Semester Should Contain Only Numbers')
    },

    departmentName: {
        type: String,
        required: [true, 'Department Name Is Required']
    },

    subjectType: {
        type: String,
        required: [true, 'Subject Type Is Required'],
        enum:['Lecture', 'Lab', 'Lecture + Lab'], message:'Invalid Subject Type',
        default: 'Lecture'
    },

    weekly_Lecture_Hour: {
        type: Number,
        required: [true, 'Weekly Lecture Hours Is Required'],
        match:(/^[0-9]+$/, 'Weekly Lecture Per Hour Should Contain Numbers')
    },

    weekly_Lab_Hour: {
        type: Number,
        required: [true, 'Weekly Lab Hours Is Required'],
        match:(/^[0-9]+$/, 'Weekly Lab Hours Should Contain Only Numbers')
    },
    preferred_Room_Type: {
        type: String,
        required: [true, 'Preferred room Type Is Required'],
        enum:['Lecture', 'Lab', 'Seminar', 'Auditorium'], message:'Invalid Preferred Room Type',
        default: 'Lecture'
    },

    teacherName: {
        type: [String],
        required: [true, 'Teacher Name Is Required'],
        default: []
    },
},{
    timestamps: true
})

const Subject = mongoose.model('Subject', SubjectSchema)

export default Subject;