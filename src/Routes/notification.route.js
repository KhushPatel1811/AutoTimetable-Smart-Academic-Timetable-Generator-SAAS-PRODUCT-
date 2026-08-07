import express from "express";
import Notification from "../Models/NotificationModel.js";
import authMiddleware from "../Middleware/AuthMiddleware.js";

const router = express.Router();

// ─── GET NOTIFICATIONS (with search + filter + sorting) ──────────────────────
router.get("/", authMiddleware, async (req, res) => {
    try {
        const { search, typeFilter, isRead, dateFrom, dateTo, sortOrder = "desc", limit } = req.query;
        const instituteId = req.user.instituteId;

        const filter = { instituteId };

        if (search) {
            filter.$or = [
                { message: { $regex: search, $options: "i" } },
                { title:   { $regex: search, $options: "i" } },
            ];
        }
        if (typeFilter) filter.type = typeFilter;
        if (isRead !== undefined && isRead !== "") {
            filter.isRead = isRead === "true";
        }
        if (dateFrom || dateTo) {
            filter.createdAt = {};
            if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
            if (dateTo)   filter.createdAt.$lte = new Date(new Date(dateTo).setHours(23, 59, 59, 999));
        }

        const sortDir = sortOrder === "asc" ? 1 : -1;
        const limitNum = limit ? Math.min(200, parseInt(limit, 10)) : undefined;

        let query = Notification.find(filter).sort({ createdAt: sortDir });
        if (limitNum) query = query.limit(limitNum);

        const notifications = await query;
        const unreadCount = await Notification.countDocuments({ instituteId, isRead: false });

        return res.status(200).json({ notifications, unreadCount });
    } catch (err) {
        console.error("NOTIFICATIONS FETCH ERROR:", err);
        return res.status(500).json({ message: err.message });
    }
});

// ─── GET UNREAD COUNT (for bell icon badge) ───────────────────────────────────
router.get("/unread-count", authMiddleware, async (req, res) => {
    try {
        const instituteId = req.user.instituteId;
        const count = await Notification.countDocuments({ instituteId, isRead: false });
        return res.status(200).json({ count });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
});

// ─── MARK ALL AS READ ─────────────────────────────────────────────────────────
// NOTE: must come BEFORE /:id routes to avoid "mark-all-read" being matched as an id
router.patch("/mark-all-read", authMiddleware, async (req, res) => {
    try {
        const instituteId = req.user.instituteId;
        await Notification.updateMany({ instituteId, isRead: false }, { $set: { isRead: true } });
        return res.status(200).json({ message: "All notifications marked as read" });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
});

// ─── CLEAR ALL ────────────────────────────────────────────────────────────────
router.delete("/clear-all", authMiddleware, async (req, res) => {
    try {
        const instituteId = req.user.instituteId;
        await Notification.deleteMany({ instituteId });
        return res.status(200).json({ message: "All notifications cleared" });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
});

// ─── MARK ONE AS READ ─────────────────────────────────────────────────────────
router.patch("/:id/read", authMiddleware, async (req, res) => {
    try {
        const instituteId = req.user.instituteId;
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, instituteId },
            { $set: { isRead: true } },
            { new: true }
        );
        if (!notification) return res.status(404).json({ message: "Notification not found" });
        return res.status(200).json({ notification });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
});

export default router;
