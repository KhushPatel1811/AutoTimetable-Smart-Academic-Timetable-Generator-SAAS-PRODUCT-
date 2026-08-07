import mongoose from "mongoose";

/**
 * SavedTimetable — stores a saved snapshot of a generated timetable.
 * One record per division per institute.
 * If admin regenerates and saves, existing record is updated (upsert).
 */
const savedScheduleSlotSchema = new mongoose.Schema({
    subjectName:  { type: String, default: "Free" },
    subjectCode:  { type: String, default: "-" },
    subjectType:  {
        type: String,
        enum: ["Lecture", "Lab", "Lecture + Lab", "Break", "Free"],
        default: "Free"
    },
    teacherName:  { type: String, default: "-" },
    teacherId:    { type: String, default: "-" },
    roomNumber:   { type: String, default: "-" },
    free:         { type: Boolean, default: false }
}, { _id: false });

const savedDayScheduleSchema = new mongoose.Schema({
    day:   { type: String, required: true },
    slots: { type: [savedScheduleSlotSchema], default: [] }
}, { _id: false });

const savedTimetableSchema = new mongoose.Schema(
    {
        instituteId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        instituteName: {
            type: String,
            default: "",
        },

        departmentName: {
            type: String,
            required: true,
        },

        semester: {
            type: Number,
        },

        divisionName: {
            type: String,
            required: true,
        },

        timeSlots: {
            type: [String],
            default: [],
        },

        totalDays: {
            type: Number,
        },

        dayStartTime: {
            type: String,
        },

        schedule: {
            type: [savedDayScheduleSchema],
            default: [],
        },

        // Reference to the source generated timetable
        sourceTimeTableId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "TimeTable",
        },

        savedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    },
    {
        timestamps: true,
    }
);

// Unique: one saved timetable per division per institute
savedTimetableSchema.index(
    { instituteId: 1, divisionName: 1 },
    { unique: true }
);

const SavedTimetable = mongoose.model("SavedTimetable", savedTimetableSchema);

export default SavedTimetable;
