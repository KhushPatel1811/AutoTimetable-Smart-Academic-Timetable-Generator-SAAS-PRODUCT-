import mongoose from "mongoose";

const activityLogSchema = new mongoose.Schema(
    {
        // Who performed the action
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            index: true,
        },
        userName: { type: String, default: "System" },
        userEmail: { type: String, default: "" },
        userRole: { type: String, default: "" },

        // Tenancy
        instituteId: {
            type: mongoose.Schema.Types.ObjectId,
            index: true,
        },

        // What happened
        module: {
            type: String,
            required: true,
            enum: [
                "Authentication",
                "Teacher",
                "Subject",
                "Room",
                "Department",
                "Timetable",
                "SavedTimetable",
                "Settings",
                "System",
                "Profile",
            ],
        },
        action: {
            type: String,
            required: true,
            // e.g. "Login", "Create", "Update", "Delete", "Generate", "Save", "Print", "Logout", "PasswordChange", "ProfileUpdate"
        },
        description: {
            type: String,
            default: "",
        },

        // Optional diff
        previousValue: {
            type: mongoose.Schema.Types.Mixed,
            default: null,
        },
        newValue: {
            type: mongoose.Schema.Types.Mixed,
            default: null,
        },

        // Request metadata
        ipAddress: { type: String, default: "" },
        userAgent: { type: String, default: "" },

        // Outcome
        status: {
            type: String,
            enum: ["Success", "Failed", "Unauthorized"],
            default: "Success",
        },
    },
    {
        timestamps: true, // createdAt, updatedAt
    }
);

// Compound indexes for efficient querying
activityLogSchema.index({ instituteId: 1, createdAt: -1 });
activityLogSchema.index({ userId: 1, createdAt: -1 });
activityLogSchema.index({ module: 1, createdAt: -1 });

const ActivityLog = mongoose.model("ActivityLog", activityLogSchema);

export default ActivityLog;
