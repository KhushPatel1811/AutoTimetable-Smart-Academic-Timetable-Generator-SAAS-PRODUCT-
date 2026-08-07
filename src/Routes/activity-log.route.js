import express from "express";
import ActivityLog from "../Models/ActivityLogModel.js";
import authMiddleware from "../Middleware/AuthMiddleware.js";
import founderMiddleware from "../Middleware/FounderMiddleware.js";

const router = express.Router();

// All activity-log routes require authentication AND founder status
router.use(authMiddleware, founderMiddleware);

// ─── GET LOGS (search + filter + pagination + sorting) ───────────────────────
router.get("/", async (req, res) => {
    try {
        const {
            search,
            moduleFilter,
            actionFilter,
            statusFilter,
            userFilter,
            instituteFilter,
            dateFrom,
            dateTo,
            sortOrder = "desc",
            page = "1",
            limit = "20",
        } = req.query;

        const filter = {};

        // Text search across description, action, userName, userEmail
        if (search) {
            filter.$or = [
                { description: { $regex: search, $options: "i" } },
                { action:      { $regex: search, $options: "i" } },
                { userName:    { $regex: search, $options: "i" } },
                { userEmail:   { $regex: search, $options: "i" } },
            ];
        }

        if (moduleFilter)    filter.module       = moduleFilter;
        if (actionFilter)    filter.action       = actionFilter;
        if (statusFilter)    filter.status       = statusFilter;
        if (userFilter)      filter.userEmail    = { $regex: userFilter, $options: "i" };
        if (instituteFilter) filter.instituteId  = instituteFilter;

        if (dateFrom || dateTo) {
            filter.createdAt = {};
            if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
            if (dateTo)   filter.createdAt.$lte = new Date(new Date(dateTo).setHours(23, 59, 59, 999));
        }

        const pageNum  = Math.max(1, parseInt(page, 10));
        const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
        const skip     = (pageNum - 1) * limitNum;
        const sortDir  = sortOrder === "asc" ? 1 : -1;

        const [logs, total] = await Promise.all([
            ActivityLog.find(filter)
                .sort({ createdAt: sortDir })
                .skip(skip)
                .limit(limitNum),
            ActivityLog.countDocuments(filter),
        ]);

        return res.status(200).json({
            logs,
            pagination: {
                total,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(total / limitNum),
            },
        });
    } catch (err) {
        console.error("ACTIVITY LOG FETCH ERROR:", err);
        return res.status(500).json({ message: err.message });
    }
});

// ─── EXPORT LOGS (CSV or TXT) ────────────────────────────────────────────────
router.get("/export", async (req, res) => {
    try {
        const {
            search,
            moduleFilter,
            actionFilter,
            statusFilter,
            userFilter,
            dateFrom,
            dateTo,
            format = "csv",
        } = req.query;

        const filter = {};

        if (search) {
            filter.$or = [
                { description: { $regex: search, $options: "i" } },
                { action:      { $regex: search, $options: "i" } },
                { userName:    { $regex: search, $options: "i" } },
            ];
        }
        if (moduleFilter) filter.module     = moduleFilter;
        if (actionFilter) filter.action     = actionFilter;
        if (statusFilter) filter.status     = statusFilter;
        if (userFilter)   filter.userEmail  = { $regex: userFilter, $options: "i" };
        if (dateFrom || dateTo) {
            filter.createdAt = {};
            if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
            if (dateTo)   filter.createdAt.$lte = new Date(new Date(dateTo).setHours(23, 59, 59, 999));
        }

        // Cap export at 5000 rows
        const logs = await ActivityLog.find(filter).sort({ createdAt: -1 }).limit(5000);

        const columns = ["Date & Time", "User", "Email", "Role", "Module", "Action", "Description", "Status", "IP Address"];

        if (format === "csv") {
            const header = columns.join(",");
            const rows = logs.map(l =>
                [
                    `"${new Date(l.createdAt).toLocaleString()}"`,
                    `"${l.userName}"`,
                    `"${l.userEmail}"`,
                    `"${l.userRole}"`,
                    `"${l.module}"`,
                    `"${l.action}"`,
                    `"${(l.description || "").replace(/"/g, '""')}"`,
                    `"${l.status}"`,
                    `"${l.ipAddress}"`,
                ].join(",")
            );
            const csv = [header, ...rows].join("\n");

            res.setHeader("Content-Type", "text/csv");
            res.setHeader("Content-Disposition", `attachment; filename="activity-logs-${Date.now()}.csv"`);
            return res.send(csv);
        }

        // TXT format
        const separator = "─".repeat(120);
        const headerLine = columns.map(c => c.padEnd(20)).join(" | ");
        const rows = logs.map(l =>
            [
                new Date(l.createdAt).toLocaleString().padEnd(20),
                (l.userName || "").padEnd(20),
                (l.userEmail || "").padEnd(25),
                (l.userRole || "").padEnd(10),
                (l.module || "").padEnd(15),
                (l.action || "").padEnd(15),
                (l.description || "").substring(0, 50).padEnd(50),
                (l.status || "").padEnd(12),
                (l.ipAddress || "").padEnd(15),
            ].join(" | ")
        );
        const txt = ["ACTIVITY LOG EXPORT", `Generated: ${new Date().toLocaleString()}`, separator, headerLine, separator, ...rows, separator].join("\n");

        res.setHeader("Content-Type", "text/plain");
        res.setHeader("Content-Disposition", `attachment; filename="activity-logs-${Date.now()}.txt"`);
        return res.send(txt);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
});

// ─── DISTINCT VALUES for filter dropdowns ────────────────────────────────────
router.get("/meta", async (_req, res) => {
    try {
        const [modules, actions, statuses] = await Promise.all([
            ActivityLog.distinct("module"),
            ActivityLog.distinct("action"),
            ActivityLog.distinct("status"),
        ]);
        return res.status(200).json({ modules, actions, statuses });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
});

export default router;
