import ActivityLog from "../Models/ActivityLogModel.js";

/**
 * Centralized activity logger.
 * Never throws — logging failures must never break the main request.
 *
 * @param {Object} params
 * @param {Object}  params.req           - Express request (to extract IP, userAgent, user)
 * @param {string}  params.module        - Module enum value
 * @param {string}  params.action        - Action string (e.g. "Login", "Create", "Delete")
 * @param {string}  [params.description] - Human-readable detail
 * @param {*}       [params.previousValue]
 * @param {*}       [params.newValue]
 * @param {string}  [params.status]      - "Success" | "Failed" | "Unauthorized"
 * @param {Object}  [params.userOverride] - Explicit user data when req.user is not populated
 */
async function logActivity({
    req,
    module,
    action,
    description = "",
    previousValue = null,
    newValue = null,
    status = "Success",
    userOverride = null,
}) {
    try {
        const user = userOverride || req?.user || {};

        const ipAddress =
            req?.headers?.["x-forwarded-for"]?.split(",")[0]?.trim() ||
            req?.socket?.remoteAddress ||
            req?.connection?.remoteAddress ||
            "";

        const userAgent = req?.headers?.["user-agent"] || "";

        await ActivityLog.create({
            userId:        user.id   || user._id   || null,
            userName:      user.userName  || user.name   || "System",
            userEmail:     user.email     || "",
            userRole:      user.role      || "",
            instituteId:   user.instituteId || null,
            module,
            action,
            description,
            previousValue,
            newValue,
            ipAddress,
            userAgent,
            status,
        });
    } catch (err) {
        // Log to console only — never propagate
        console.error("[ActivityLog] Failed to write log:", err.message);
    }
}

export default logActivity;
