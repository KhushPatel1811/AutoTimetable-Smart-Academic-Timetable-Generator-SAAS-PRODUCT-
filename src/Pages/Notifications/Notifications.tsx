import { Bell, Search, Filter, RefreshCcw, CheckCheck, Check, Calendar } from "lucide-react";
import Sidebar from "../../Components/Dashboard/Sidebar";
import ProfileNavbar from "../DashboardItems/Profile/ProfileNavbar";
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import API from "../../config/api";

interface Notification {
    _id: string;
    type: string;
    message: string;
    isRead: boolean;
    createdAt: string;
    metadata?: Record<string, any>;
}

const TYPE_LABELS: Record<string, string> = {
    timetable_generated: "Timetable Generated",
    timetable_updated: "Timetable Updated",
    timetable_saved: "Timetable Saved",
    timetable_published: "Timetable Published",
    teacher_added: "Teacher Added",
    teacher_removed: "Teacher Removed",
    teacher_department_changed: "Department Changed",
    subject_assignment_changed: "Subject Assignment",
    general: "General",
};

const TYPE_COLORS: Record<string, string> = {
    timetable_generated: "badge-indigo",
    timetable_updated: "badge-indigo",
    timetable_saved: "badge-emerald",
    timetable_published: "badge-emerald",
    teacher_added: "badge-emerald",
    teacher_removed: "badge-rose",
    teacher_department_changed: "badge-indigo",
    subject_assignment_changed: "badge-indigo",
    general: "badge-indigo",
};

function Notifications() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);

    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState("");
    const [readFilter, setReadFilter] = useState("");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const handleMenuToggle = () => setIsSidebarOpen(prev => !prev);
    const handleSidebarClose = () => setIsSidebarOpen(false);

    const fetchNotifications = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API}/notifications`, {
                params: {
                    search: search || undefined,
                    typeFilter: typeFilter || undefined,
                    isRead: readFilter !== "" ? readFilter : undefined,
                    dateFrom: dateFrom || undefined,
                    dateTo: dateTo || undefined,
                },
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            setNotifications(response.data.notifications || []);
            setUnreadCount(response.data.unreadCount || 0);
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            toast.error(error.response?.data?.message || "Failed to load notifications");
        } finally {
            setLoading(false);
        }
    }, [search, typeFilter, readFilter, dateFrom, dateTo]);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    async function markAsRead(id: string) {
        try {
            await axios.patch(`${API}/notifications/${id}/read`, {}, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch {
            toast.error("Failed to mark as read");
        }
    }

    async function markAllAsRead() {
        try {
            await axios.patch(`${API}/notifications/mark-all-read`, {}, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
            toast.success("All notifications marked as read");
        } catch {
            toast.error("Failed to mark all as read");
        }
    }

    function resetFilters() {
        setSearch("");
        setTypeFilter("");
        setReadFilter("");
        setDateFrom("");
        setDateTo("");
    }

    function formatTime(dateStr: string) {
        const date = new Date(dateStr);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return "Just now";
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    }

    return (
        <div className="flex h-screen w-screen overflow-hidden bg-slate-50">
            <Sidebar isOpen={isSidebarOpen} onClose={handleSidebarClose} />

            <div className="flex-1 h-full overflow-y-auto animate-page">
                <div className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
                    <ProfileNavbar content="Notifications" onMenuToggle={handleMenuToggle} />
                    <ToastContainer position="top-right" autoClose={2000} />
                </div>

                <div className="pt-6 px-4 sm:px-6 lg:px-8 pb-8 max-w-7xl mx-auto space-y-8">

                    {/* HEADER */}
                    <div className="bg-linear-to-r from-indigo-600 to-indigo-500 rounded-3xl p-6 lg:p-10 shadow-2xl shadow-indigo-100 border border-indigo-400/20 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 group-hover:scale-110 transition-transform duration-700" />
                        <div className="relative z-10 flex flex-col lg:flex-row gap-6 lg:items-center lg:justify-between">
                            <div className="flex items-center gap-4 lg:gap-6">
                                <div className="p-4 lg:p-5 bg-white/20 backdrop-blur-xl rounded-3xl shadow-inner border border-white/30 relative">
                                    <Bell className="w-7 h-7 lg:w-8 lg:h-8 text-white" />
                                    {unreadCount > 0 && (
                                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center">
                                            {unreadCount > 9 ? "9+" : unreadCount}
                                        </span>
                                    )}
                                </div>
                                <div>
                                    <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight">Notifications</h1>
                                    <p className="text-indigo-100 font-bold text-xs lg:text-sm tracking-wide uppercase">
                                        {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}` : "All caught up"}
                                    </p>
                                </div>
                            </div>
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    className="bg-white px-6 py-3 lg:px-8 lg:py-4 rounded-2xl font-black text-indigo-600 text-sm shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer uppercase tracking-wider flex items-center gap-2 w-full lg:w-auto justify-center"
                                >
                                    <CheckCheck className="w-4 h-4" /> Mark All Read
                                </button>
                            )}
                        </div>
                    </div>

                    {/* FILTER BAR */}
                    <div className="premium-card p-4! grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 bg-slate-50/50">
                        <div className="relative group lg:col-span-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                            <input
                                type="text"
                                className="input-box py-3! pl-11! bg-white!"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Search messages..."
                            />
                        </div>

                        <select
                            className="input-box py-3! bg-white! cursor-pointer appearance-none"
                            value={typeFilter}
                            onChange={e => setTypeFilter(e.target.value)}
                        >
                            <option value="">All Types</option>
                            {Object.entries(TYPE_LABELS).map(([val, label]) => (
                                <option key={val} value={val}>{label}</option>
                            ))}
                        </select>

                        <select
                            className="input-box py-3! bg-white! cursor-pointer appearance-none"
                            value={readFilter}
                            onChange={e => setReadFilter(e.target.value)}
                        >
                            <option value="">All Status</option>
                            <option value="false">Unread</option>
                            <option value="true">Read</option>
                        </select>

                        <div className="relative group">
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                            <input
                                type="date"
                                className="input-box py-3! pl-11! bg-white!"
                                value={dateFrom}
                                onChange={e => setDateFrom(e.target.value)}
                                placeholder="From date"
                            />
                        </div>

                        <button
                            className="secondary-btn w-full py-3! flex items-center justify-center gap-2 group"
                            onClick={resetFilters}
                        >
                            <RefreshCcw size={16} className="group-hover:rotate-180 transition-transform duration-500" />
                            Reset
                        </button>
                    </div>

                    {/* NOTIFICATIONS TABLE */}
                    <div className="premium-card p-0! overflow-hidden">
                        <div className="p-5 lg:p-8 border-b border-slate-100 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between bg-slate-50/50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                                    <Filter className="w-4 h-4" />
                                </div>
                                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Activity Log</h3>
                            </div>
                            <div className="badge-indigo">
                                {loading ? "Loading..." : `${notifications.length} Notifications`}
                            </div>
                        </div>

                        {/* Desktop Table */}
                        <div className="hidden lg:block overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-slate-100 text-[11px] font-black text-slate-400 uppercase tracking-widest">
                                        <th className="p-6">Sr No</th>
                                        <th className="p-6">Message</th>
                                        <th className="p-6">Type</th>
                                        <th className="p-6">Time</th>
                                        <th className="p-6">Status</th>
                                        <th className="p-6 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    {notifications.map((n, index) => (
                                        <tr key={n._id} className={`group transition-colors border-b border-slate-50 last:border-none ${n.isRead ? "bg-white" : "bg-indigo-50/30"}`}>
                                            <td className="p-6 font-black text-slate-300 text-lg">
                                                {(index + 1).toString().padStart(2, "0")}
                                            </td>
                                            <td className="p-6">
                                                <div className={`font-bold text-sm ${n.isRead ? "text-slate-600" : "text-slate-900"}`}>
                                                    {n.message}
                                                </div>
                                            </td>
                                            <td className="p-6">
                                                <span className={`${TYPE_COLORS[n.type] || "badge-indigo"} text-[10px]!`}>
                                                    {TYPE_LABELS[n.type] || n.type}
                                                </span>
                                            </td>
                                            <td className="p-6 text-slate-500 font-bold text-xs italic whitespace-nowrap">
                                                {formatTime(n.createdAt)}
                                            </td>
                                            <td className="p-6">
                                                {n.isRead ? (
                                                    <span className="badge-emerald text-[10px]!">Read</span>
                                                ) : (
                                                    <span className="badge-rose text-[10px]!">Unread</span>
                                                )}
                                            </td>
                                            <td className="p-6 text-right">
                                                {!n.isRead && (
                                                    <button
                                                        className="secondary-btn py-2! px-4! flex items-center gap-1.5 ml-auto"
                                                        onClick={() => markAsRead(n._id)}
                                                    >
                                                        <Check className="w-3.5 h-3.5" /> Mark Read
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Cards */}
                        <div className="lg:hidden p-4 space-y-3">
                            {notifications.map((n, index) => (
                                <div key={n._id} className={`rounded-2xl border shadow-sm p-4 space-y-3 ${n.isRead ? "bg-white border-slate-200" : "bg-indigo-50 border-indigo-100"}`}>
                                    <div className="flex justify-between items-start gap-3">
                                        <p className={`font-bold text-sm flex-1 ${n.isRead ? "text-slate-600" : "text-slate-900"}`}>
                                            {n.message}
                                        </p>
                                        <span className="font-bold text-slate-400 text-xs">#{index + 1}</span>
                                    </div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className={`${TYPE_COLORS[n.type] || "badge-indigo"} text-[10px]!`}>
                                            {TYPE_LABELS[n.type] || n.type}
                                        </span>
                                        <span className="text-xs text-slate-400 font-bold">{formatTime(n.createdAt)}</span>
                                        {n.isRead
                                            ? <span className="badge-emerald text-[10px]!">Read</span>
                                            : <span className="badge-rose text-[10px]!">Unread</span>
                                        }
                                    </div>
                                    {!n.isRead && (
                                        <button
                                            className="secondary-btn py-2! px-4! flex items-center gap-1.5 text-xs"
                                            onClick={() => markAsRead(n._id)}
                                        >
                                            <Check className="w-3.5 h-3.5" /> Mark as Read
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Loading State */}
                        {loading && (
                            <div className="p-20 text-center space-y-4 opacity-40">
                                <Bell className="w-12 h-12 text-slate-200 mx-auto animate-pulse" />
                                <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Loading notifications...</p>
                            </div>
                        )}

                        {/* Empty State */}
                        {!loading && notifications.length === 0 && (
                            <div className="p-20 text-center space-y-4 opacity-40">
                                <Bell className="w-12 h-12 text-slate-200 mx-auto" />
                                <p className="text-xs font-black text-slate-500 uppercase tracking-widest">No notifications found</p>
                                <p className="text-xs text-slate-400">Notifications will appear here as activity happens in your institute.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Notifications;
