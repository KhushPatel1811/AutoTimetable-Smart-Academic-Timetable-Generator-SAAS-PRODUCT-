import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
    {
        instituteId: {
            type: mongoose.Schema.Types.ObjectId,
            required: [true, "Institute ID is required"],
            index: true,
        },

        type: {
            type: String,
            required: [true, "Notification type is required"],
            enum: [
                "timetable_generated",
                "timetable_updated",
                "timetable_saved",
                "timetable_published",
                "teacher_added",
                "teacher_removed",
                "teacher_department_changed",
                "subject_assignment_changed",
                "general"
            ],
            default: "general",
        },

        // Short title shown in the bell dropdown
        title: {
            type: String,
            trim: true,
            default: "",
        },

        message: {
            type: String,
            required: [true, "Message is required"],
            trim: true,
        },

        isRead: {
            type: Boolean,
            default: false,
        },

        metadata: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
        },
    },
    {
        timestamps: true,
    }
);

// Compound index for efficient querying
notificationSchema.index({ instituteId: 1, isRead: 1, createdAt: -1 });

// ── 24-hour TTL: MongoDB auto-deletes documents after 86400 seconds ──
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
