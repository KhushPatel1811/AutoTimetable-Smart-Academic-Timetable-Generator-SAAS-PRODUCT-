import mongoose, { mongo }  from "mongoose";
import { match } from "node:assert";

const SubjectSchema = new mongoose.Schema({
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
        match:(/^[0-9]$/, 'Semester Should Contain Only Numbers')
    },

    departmentName: {
        type: String,
        required: [true, 'Department Name Is Required']
    },

    subjectType: {
        type: String,
        required: [true, 'Subject Type Is Required'],
        enum:['Lecture', 'Lab', 'Lecture_&_Lab'], message:'Invalid Subject Type',
        default: 'Lecture'
    },

    weekly_Lecture_Hours: {
        type: Number,
        required: [true, 'Weekly Lecture Hours Is Required'],
        match:(/^[0-9]+$/, 'Weekly Lecture Per Hour Should Contain Numbers')
    },

    weekly_Lab_Hours: {
        type: Number,
        required: [true, 'Weekly Lab Hours Is Required'],
        match:(/^[0-9]+$/, 'Weekly Lab Hours Should Contain Only Numbers')
    },
    preferred_Room_Type: {
        type: String,
        required: [true, 'Preferred room Type Is Required'],
        enum:['Lecture', 'Lab', 'Seminar', 'Auditorium'], message:'Invalid Preferred Room Type',
        default: 'Lecture'
    }
})

const Subject = mongoose.model('Subject', SubjectSchema)

export default Subject;