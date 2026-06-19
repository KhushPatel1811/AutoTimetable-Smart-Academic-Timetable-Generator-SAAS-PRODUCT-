import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema({
    instituteId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    instituteInfo: {
        name: { type: String, default: "" },
        code: { type: String, default: "" },
        address: { type: String, default: "" },
        email: { type: String, default: "" },
        phone: { type: String, default: "" }
    },
    academicYear: {
        label: { type: String, default: "2024-25" },
        startsOn: { type: String, default: "" },
        endsOn: { type: String, default: "" }
    },
    workingDays: {
        type: [String],
        default: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
    },
    lectureDuration: {
        type: Number,
        default: 60
    },
    labDuration: {
        type: Number,
        default: 120
    },
    breaks: {
        type: [{ label: String, duration: Number }],
        default: []
    },
    theme: {
        mode: { type: String, enum: ["Light", "Dark", "System"], default: "Light" },
        accent: { type: String, default: "Indigo" },
        compactTables: { type: Boolean, default: false }
    },
    userManagement: {
        allowInvites: { type: Boolean, default: true },
        defaultRole: { type: String, default: "Staff" }
    },
    security: {
        twoFactorRequired: { type: Boolean, default: false },
        sessionTimeoutMinutes: { type: Number, default: 60 }
    },
    backup: {
        autoBackup: { type: Boolean, default: false },
        frequency: { type: String, enum: ["Daily", "Weekly", "Monthly"], default: "Weekly" },
        lastBackupAt: { type: Date }
    }
}, { timestamps: true });

const Settings = mongoose.model("Settings", settingsSchema);

export default Settings;
