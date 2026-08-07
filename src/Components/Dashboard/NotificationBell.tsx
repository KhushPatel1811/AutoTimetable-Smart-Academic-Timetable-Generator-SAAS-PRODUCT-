import { Bell, CheckCheck, Trash2, ExternalLink, X } from "lucide-react";
import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import API from "../../config/api";

interface Notification {
    _id: string;
    title: string;
    message: string;
    type: string;
    isRead: boolean;
    createdAt: string;
}

const TYPE_COLOR: Record<string, string> = {
    timetable_generated:       "bg-indigo-500",
    timetable_updated:         "bg-indigo-500",
    timetable_saved:           "bg-emerald-500",
    timetable_published:       "bg-emerald-500",
    teacher_added:             "bg-emerald-500",
    teacher_removed:           "bg-rose-500",
    teacher_department_changed:"bg-amber-500",
    subject_assignment_changed:"bg-blue-500",
    general:                   "bg-slate-400",
};

function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const m = Math.floor(diff / 60000);
    const h = Math.floor(diff / 3600000);
    if (m < 1)  return "Just now";
    if (m < 60) return `${m}m ago`;
    if (h < 24) return `${h}h ago`;
    return new Date(dateStr).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function NotificationBell() {
    const navigate              = useNavigate();
    const ref                   = useRef<HTMLDivElement>(null);
    const [open, setOpen]       = useState(false);
    const [items, setItems]     = useState<Notification[]>([]);
    const [unread, setUnread]   = useState(0);
    const [loading, setLoading] = useState(false);

    const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

    // ── Poll unread count every 30 seconds ──────────────────────────────────
    const fetchCount = useCallback(async () => {
        try {
            const res = await axios.get(`${API}/notifications/unread-count`, { headers: authHeaders() });
            setUnread(res.data.count ?? 0);
        } catch { /* silent */ }
    }, []);

    useEffect(() => {
        fetchCount();
        const id = setInterval(fetchCount, 30_000);
        return () => clearInterval(id);
    }, [fetchCount]);

    // ── Load notifications when dropdown opens ───────────────────────────────
    const fetchNotifications = useCallback(async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API}/notifications`, {
                params: { limit: 15, sortOrder: "desc" },
                headers: authHeaders(),
            });
            setItems(res.data.notifications ?? []);
            setUnread(res.data.unreadCount ?? 0);
        } catch { /* silent */ }
        finally { setLoading(false); }
    }, []);

    useEffect(() => {
        if (open) fetchNotifications();
    }, [open, fetchNotifications]);

    // ── Close on outside click ───────────────────────────────────────────────
    useEffect(() => {
        function handler(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        }
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    // ── Actions ──────────────────────────────────────────────────────────────
    async function markOne(id: string) {
        try {
            await axios.patch(`${API}/notifications/${id}/read`, {}, { headers: authHeaders() });
            setItems(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
            setUnread(prev => Math.max(0, prev - 1));
        } catch { /* silent */ }
    }

    async function markAll() {
        try {
            await axios.patch(`${API}/notifications/mark-all-read`, {}, { headers: authHeaders() });
            setItems(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnread(0);
        } catch { /* silent */ }
    }

    async function clearAll() {
        try {
            await axios.delete(`${API}/notifications/clear-all`, { headers: authHeaders() });
            setItems([]);
            setUnread(0);
        } catch { /* silent */ }
    }

    return (
        <div ref={ref} className="relative">
            {/* Bell button */}
            <button
                type="button"
                onClick={() => setOpen(prev => !prev)}
                className="relative p-2 sm:p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all cursor-pointer"
                aria-label="Notifications"
            >
                <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                {unread > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center bg-rose-500 text-white text-[9px] font-black rounded-full border-2 border-white px-0.5 animate-pulse">
                        {unread > 99 ? "99+" : unread}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {open && (
                <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl shadow-slate-200/80 border border-slate-200 z-[200] overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50">
                        <div className="flex items-center gap-2">
                            <Bell className="w-4 h-4 text-indigo-600" />
                            <span className="text-xs font-black text-slate-800 uppercase tracking-widest">Notifications</span>
                            {unread > 0 && (
                                <span className="bg-rose-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">{unread}</span>
                            )}
                        </div>
                        <div className="flex items-center gap-1">
                            {unread > 0 && (
                                <button onClick={markAll} title="Mark all read"
                                    className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all cursor-pointer">
                                    <CheckCheck className="w-3.5 h-3.5" />
                                </button>
                            )}
                            <button onClick={clearAll} title="Clear all"
                                className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all cursor-pointer">
                                <Trash2 className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => setOpen(false)}
                                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all cursor-pointer">
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>

                    {/* List */}
                    <div className="max-h-[360px] overflow-y-auto custom-scrollbar">
                        {loading ? (
                            <div className="p-8 text-center">
                                <Bell className="w-6 h-6 text-slate-200 mx-auto animate-pulse mb-2" />
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Loading…</p>
                            </div>
                        ) : items.length === 0 ? (
                            <div className="p-8 text-center">
                                <Bell className="w-6 h-6 text-slate-200 mx-auto mb-2" />
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No notifications</p>
                            </div>
                        ) : (
                            items.map(n => (
                                <div
                                    key={n._id}
                                    className={`flex items-start gap-3 px-4 py-3 border-b border-slate-50 last:border-none transition-colors cursor-pointer
                                        ${n.isRead ? "bg-white hover:bg-slate-50" : "bg-indigo-50/50 hover:bg-indigo-50"}`}
                                    onClick={() => { if (!n.isRead) markOne(n._id); }}
                                >
                                    {/* Dot */}
                                    <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${TYPE_COLOR[n.type] || "bg-slate-400"} ${n.isRead ? "opacity-30" : ""}`} />

                                    <div className="flex-1 min-w-0">
                                        <p className={`text-xs font-black truncate ${n.isRead ? "text-slate-500" : "text-slate-800"}`}>
                                            {n.title || "Notification"}
                                        </p>
                                        <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed line-clamp-2">{n.message}</p>
                                        <p className="text-[9px] text-slate-400 font-bold mt-1">{timeAgo(n.createdAt)}</p>
                                    </div>

                                    {!n.isRead && (
                                        <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full shrink-0 mt-1.5 animate-pulse" />
                                    )}
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer — view all */}
                    <div className="px-4 py-3 border-t border-slate-100 bg-slate-50">
                        <button
                            onClick={() => { setOpen(false); navigate("/notifications"); }}
                            className="w-full flex items-center justify-center gap-2 py-2 text-[10px] font-black text-indigo-600 hover:text-indigo-700 uppercase tracking-widest transition-colors cursor-pointer"
                        >
                            <ExternalLink className="w-3 h-3" /> View All Notifications
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
