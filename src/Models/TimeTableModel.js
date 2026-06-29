import mongoose from "mongoose";

const ScheduleSlotSchema = new mongoose.Schema({
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
    roomNumber: {
        type: String,
        default: "-"
    },
    free: {
        type: Boolean,
        default: false
    }
}, { _id: false });

const DayScheduleSchema = new mongoose.Schema({
    day: {
        type: String,
        required: true
    },
    slots: {
        type: [ScheduleSlotSchema],
        default: []
    }
}, { _id: false });

const DivisionScheduleSchema = new mongoose.Schema({
    divisionName: {
        type: String,
        required: true
    },
    schedule: [DayScheduleSchema]
}, { _id: false });

const timeTableSchema = new mongoose.Schema({
    instituteId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },

    departmentName: {
        type: String,
        required: true
    },

    semester: {
        type: Number,
        required: true
    },

    totalDivisions: {
        type: Number,
        required: true
    },

    totalDays: {
        type: Number,
        required: true
    },

    dayStartTime: {
        type: String,
        required: true
    },

    lecturesPerDay: {
        type: Number,
        required: true
    },

    lectureDuration: {
        type: Number,
        required: true
    },

    labDuration: {
        type: Number,
        required: true
    },

    breakDurations: {
        type: [Number],
        default: []
    },

    timeSlots: {
        type: [String],
        default: []
    },

    version: {
        type: Number,
        default: 1
    },

    isLatest: {
        type: Boolean,
        default: true
    },

    status: {
        type: String,
        enum: ["Generating", "Completed", "Failed"],
        default: "Completed"
    },

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    divisions: [DivisionScheduleSchema]
}, {
    timestamps: true
});

timeTableSchema.index({
    instituteId: 1,
    departmentName: 1,
    semester: 1,
    isLatest: 1
});

const TimeTable = mongoose.model('TimeTable', timeTableSchema)

export default TimeTable
