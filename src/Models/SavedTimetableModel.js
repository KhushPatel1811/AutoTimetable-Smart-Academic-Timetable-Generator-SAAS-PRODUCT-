import mongoose from "mongoose";
 
const SavedScheduleSlotSchema = new mongoose.Schema({
    slotIndex: {
        type: Number,
        default: 0
    },
    subjectName: {
        type: String,
        default: "Free"
    },
    subjectCode: {
        type: String,
        default: "-"
    },
    subjectType: {
        type: String,
        enum: ["Lecture", "Lab", "Lecture + Lab", "Break", "Free"],
        default: "Free"
    },
    teacherName: {
        type: String,
        default: "-"
    },
    teacherId: {
        type: String,
        default: "-"
    },
    roomNumber: {
        type: String,
        default: "-"
    },
    free: {
        type: Boolean,
        default: false
    },
    isBreak: {
        type: Boolean,
        default: false
    }
}, { _id: false });
 
const SavedDayScheduleSchema = new mongoose.Schema({
    day: {
        type: String,
        required: true
    },
    slots: {
        type: [SavedScheduleSlotSchema],
        default: []
    }
}, { _id: false });
 
const savedTimeTableSchema = new mongoose.Schema({
    instituteId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },
 
    instituteName: {
        type: String,
        default: ""
    },
 
    departmentName: {
        type: String,
        required: true
    },
 
    semester: {
        type: Number,
        required: true
    },
 
    divisionName: {
        type: String,
        required: true
    },
 
    timeSlots: {
        type: [String],
        default: []
    },
 
    totalDays: {
        type: Number,
        default: 0
    },
 
    dayStartTime: {
        type: String,
        default: ""
    },
 
    schedule: {
        type: [SavedDayScheduleSchema],
        default: []
    },
 
    sourceTimeTableId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "TimeTable"
    },
 
    savedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
}, {
    timestamps: true
});
 
// A saved timetable is uniquely identified by
// institute + department + semester + division.
savedTimeTableSchema.index({
    instituteId: 1,
    departmentName: 1,
    semester: 1,
    divisionName: 1
}, {
    unique: true
});
 
const SavedTimeTable = mongoose.model('SavedTimeTable', savedTimeTableSchema)
 
export default SavedTimeTable