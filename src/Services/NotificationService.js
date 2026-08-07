import Notification from "../Models/NotificationModel.js";

// Title map for known types
const TYPE_TITLES = {
    timetable_generated: "Timetable Generated",
    timetable_updated: "Timetable Updated",
    timetable_saved: "Timetable Saved",
    timetable_published: "Timetable Published",
    teacher_added: "Teacher Added",
    teacher_removed: "Teacher Removed",
    teacher_department_changed: "Department Changed",
    subject_assignment_changed: "Subject Updated",
    general: "Notification",
};

/**
 * Creates a notification for an institute.
 * Silently ignores errors so it never breaks the main operation.
 *
 * @param {Object} params
 * @param {string|ObjectId} params.instituteId
 * @param {string} params.type
 * @param {string} params.message
 * @param {string} [params.title]
 * @param {Object} [params.metadata]
 */
async function createNotification({ instituteId, type, message, title, metadata = {} }) {
    try {
        const resolvedTitle = title || TYPE_TITLES[type] || "Notification";
        await Notification.create({ instituteId, type, title: resolvedTitle, message, metadata });
    } catch (err) {
        console.error("[NotificationService] Failed to create notification:", err.message);
    }
}

export default createNotification;
