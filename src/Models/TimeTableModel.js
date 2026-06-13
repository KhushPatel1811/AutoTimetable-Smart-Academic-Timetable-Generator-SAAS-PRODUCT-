import { Moon } from 'lucide-react'
import mongoose from 'mongoose'

//! 1. Define the innermost schema for individual lecture/lab slots
const ScheduleSlotSchema = new mongoose.Schema ({
    subjectName: { 
        type: String, 
        required: [true, 'Subject Name Is Required' ]
    },

    subjectCode: { 
        type: String, 
        required: [true, 'Subject Code Is Required'] 
    },

    teacherName: { 
        type: String, 
        required: [true, 'Teacher Name Is Required'] 
    },

    roomNumber: { 
        type: String, 
        required: [true, 'Room Number Is Required'] 
    },

    subjectType: {
        type: String, 
        enum: ['Lecture', 'Lab', 'Lecture + Lab'], 
        required: [true, 'Subject Type Is Required'] 
    }
})




//! 2. Define the schema for a single day, using a Map for dynamic timeSlot keys
const DayScheduleSchema = new mongoose.Schema({
    day: {
        type: String,
        required: [true, 'Day Is Required']
    },

    slots: {
        type: Map,
        of: ScheduleSlotSchema,
        default:[]
    }   
})



//! 3. Define the schema for an entire division's weekly breakdown

const DivisionScheduleSchema = new mongoose.Schema({
    divisionName: {
        type: String,
        required: [true, 'Division Name Is Required']
    },

    schedule: [DayScheduleSchema]
})




//! 4. Define the root Timetable schema with metadata and configuration values
const timeTableSchema = new mongoose.Schema({
    departmentName: { 
        type: String, 
        required: [true, 'Department Name Is Required'] 
    },

    semester: { 
        type: Number, 
        required: [true, 'Semester Is Required'] 
    },

    totalDivisions: { 
        type: Number, 
        required: [true, 'Total Divisions Is Required'] 
    },

    totalDays: { 
        type: Number, 
        required: [true, 'Total Days Is Required'] 
    },

    dayStartTime: { 
        type: String, 
        required: [true, 'Day StartTime Is Required'] 
    },

    dayEndTime: { 
        type: String, 
        required: [true, 'Day EndTime Is Required'] 
    },
    
    lectureDuration: { 
        type: Number, 
        required: [true, 'Lecture Duration Is Required'] 
    },

    labDuration: { 
        type: Number, 
        required: [true, 'Lab Duration Is Required'] 
    },

    version: { 
        type: Number, 
        default: 1 
    },

    isLatest: { 
        type: Boolean, 
        default: true 
    },

    divisions: [DivisionScheduleSchema]
}, {
    timestamps: true
})

const TimeTable = mongoose.model('TimeTable', timeTableSchema)

export default TimeTable