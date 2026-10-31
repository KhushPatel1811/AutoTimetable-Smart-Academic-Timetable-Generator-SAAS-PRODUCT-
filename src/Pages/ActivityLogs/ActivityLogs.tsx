import { ClipboardList, Search, Filter, RefreshCcw, Download,ChevronLeft, ChevronRight, Calendar, User, Layers,CheckCircle, XCircle, AlertCircle} from "lucide-react";
import Sidebar from "../../Components/Dashboard/Sidebar";
import ProfileNavbar from "../DashboardItems/Profile/ProfileNavbar";
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import API from "../../config/api";

interface ActivityLog {
    _id: string;
    userName: string;
    userEmail: string;
    userRole: string;
    module: string;
    action: string;
    description: string;
    status: "Success" | "Failed" | "Unauthorized";
    ipAddress: string;
    createdAt: string;
}

interface Pagination {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

const STATUS_BADGE: Record<string, string> = {
    Success:      "bg-emerald-50 text-emerald-700 border border-emerald-100",
    Failed:       "bg-rose-50 text-rose-700 border border-rose-100",
    Unauthorized: "bg-amber-50 text-amber-700 border border-amber-100",
};

const MODULES = [
    "Authentication", "Teacher", "Subject", "Room",
    "Department", "Timetable", "SavedTimetable", "Settings", "System", "Profile",
];
const STATUSES = ["Success", "Failed", "Unauthorized"];

function ActivityLogs() {
    const [logs, setLogs]               = useState<ActivityLog[]>([]);
    const [pagination, setPagination]   = useState<Pagination>({ total: 0, page: 1, limit: 20, totalPages: 1 });
    const [loading, setLoading]         = useState(false);
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [availActions, setAvailActions] = useState<string[]>([]);

    const [search,   setSearch]   = useState("");
    const [mod,      setMod]      = useState("");
    const [action,   setAction]   = useState("");
    const [status,   setStatus]   = useState("");
    const [userFilt, setUserFilt] = useState("");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo,   setDateTo]   = useState("");
    const [page,     setPage]     = useState(1);

    const authH = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

    // Load distinct action values for filter dropdown
    useEffect(() => {
        axios.get(`${API}/activity-logs/meta`, { headers: authH() })
            .then(r => setAvailActions(r.data.actions ?? []))
            .catch(() => {});
    }, []);

    const fetchLogs = useCallback(async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API}/activity-logs`, {
                params: {
                    search:       search   || undefined,
                    moduleFilter: mod      || undefined,
                    actionFilter: action   || undefined,
                    statusFilter: status   || undefined,
                    userFilter:   userFilt || undefined,
                    dateFrom:     dateFrom || undefined,
                    dateTo:       dateTo   || undefined,
                    page,
                    limit: 20,
                },
                headers: authH(),
            });
            setLogs(res.data.logs ?? []);
            setPagination(res.data.pagination ?? { total: 0, page: 1, limit: 20, totalPages: 1 });
        } catch (err: unknown) {
            const e = err as { response?: { data?: { message?: string } } };
            toast.error(e.response?.data?.message || "Failed to load activity logs");
        } finally {
            setLoading(false);
        }
    }, [search, mod, action, status, userFilt, dateFrom, dateTo, page]);

    useEffect(() => { 
        fetchLogs(); 
    }, [fetchLogs]);

    function resetFilters() {
        setSearch(""); setMod(""); setAction(""); setStatus("");
        setUserFilt(""); setDateFrom(""); setDateTo(""); setPage(1);
    }

    async function handleExport(format: "csv" | "txt") {
        try {
            const res = await axios.get(`${API}/activity-logs/export`, {
                params: {
                    search:       search   || undefined,
                    moduleFilter: mod      || undefined,
                    actionFilter: action   || undefined,
                    statusFilter: status   || undefined,
                    userFilter:   userFilt || undefined,
                    dateFrom:     dateFrom || undefined,
                    dateTo:       dateTo   || undefined,
                    format,
                },
                headers: authH(),
                responseType: "blob",
            });
            const url  = URL.createObjectURL(res.data);
            const a    = document.createElement("a");
            a.href     = url;
            a.download = `activity-logs-${Date.now()}.${format}`;
            a.click();
            URL.revokeObjectURL(url);
        } catch {
            toast.error("Export failed");
        }
    }

    function fmt(d: string) {
        return new Date(d).toLocaleString(undefined, {
            year: "numeric", month: "short", day: "numeric",
            hour: "2-digit", minute: "2-digit",
        });
    }

    function StatusBadge({ s }: { s: string }) {
        const icons: Record<string, JSX.Element> = {
            Success:      <CheckCircle  className="w-3 h-3" />,
            Failed:       <XCircle      className="w-3 h-3" />,
            Unauthorized: <AlertCircle  className="w-3 h-3" />,
        };
        return (
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase ${STATUS_BADGE[s] || STATUS_BADGE.Success}`}>
                {icons[s]} {s}
            </span>
        );
    }

    // Visible page range (max 5 buttons)
    function pageRange() {
        const start = Math.max(1, Math.min(page - 2, pagination.totalPages - 4));
        return Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => start + i);
    }

    return (
        <div className="flex h-screen w-screen overflow-hidden bg-slate-50">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className="flex-1 h-full overflow-y-auto animate-page">
                <div className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
                    <ProfileNavbar content="Activity Logs" onMenuToggle={() => setSidebarOpen(p => !p)} />
                    <ToastContainer position="top-right" autoClose={2000} />
                </div>

                <div className="pt-6 px-4 sm:px-6 lg:px-8 pb-8 max-w-7xl mx-auto space-y-8">

                    {/* Header */}
                    <div className="bg-gradient-to-r from-indigo-600 to-indigo-500 rounded-3xl p-6 lg:p-10 shadow-2xl shadow-indigo-100 border border-indigo-400/20 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 group-hover:scale-110 transition-transform duration-700" />
                        <div className="relative z-10 flex flex-col lg:flex-row gap-6 lg:items-center lg:justify-between">
                            <div className="flex items-center gap-4 lg:gap-6">
                                <div className="p-4 lg:p-5 bg-white/20 backdrop-blur-xl rounded-3xl shadow-inner border border-white/30">
                                    <ClipboardList className="w-7 h-7 lg:w-8 lg:h-8 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight">Activity Logs</h1>
                                    <p className="text-indigo-100 font-bold text-xs lg:text-sm tracking-wide uppercase">
                                        Complete audit trail — Founder access only
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-3 flex-wrap">
                                <button onClick={() => handleExport("csv")}
                                    className="flex items-center gap-2 bg-white/15 border border-white/25 text-white px-5 py-3 rounded-xl text-xs font-black uppercase hover:bg-white/25 transition-all cursor-pointer">
                                    <Download className="w-3.5 h-3.5" /> Export CSV
                                </button>
                                <button onClick={() => handleExport("txt")}
                                    className="flex items-center gap-2 bg-white/15 border border-white/25 text-white px-5 py-3 rounded-xl text-xs font-black uppercase hover:bg-white/25 transition-all cursor-pointer">
                                    <Download className="w-3.5 h-3.5" /> Export TXT
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Filter bar */}
                    <div className="premium-card p-4! grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-slate-50/50">
                        <div className="relative group sm:col-span-2 lg:col-span-2">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                            <input type="text" className="input-box py-3! pl-11! bg-white!" placeholder="Search description, user, email…"
                                value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
                        </div>

                        <div className="relative group">
                            <Layers className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                            <select className="input-box py-3! pl-11! bg-white! cursor-pointer appearance-none"
                                value={mod} onChange={e => { setMod(e.target.value); setPage(1); }}>
                                <option value="">All Modules</option>
                                {MODULES.map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                        </div>

                        <div className="relative group">
                            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                            <select className="input-box py-3! pl-11! bg-white! cursor-pointer appearance-none"
                                value={action} onChange={e => { setAction(e.target.value); setPage(1); }}>
                                <option value="">All Actions</option>
                                {availActions.map(a => <option key={a} value={a}>{a}</option>)}
                            </select>
                        </div>

                        <div className="relative group">
                            <CheckCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                            <select className="input-box py-3! pl-11! bg-white! cursor-pointer appearance-none"
                                value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}>
                                <option value="">All Statuses</option>
                                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>

                        <div className="relative group">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                            <input type="text" className="input-box py-3! pl-11! bg-white!" placeholder="Filter by email…"
                                value={userFilt} onChange={e => { setUserFilt(e.target.value); setPage(1); }} />
                        </div>

                        <div className="relative group">
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                            <input type="date" className="input-box py-3! pl-11! bg-white!"
                                value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(1); }} />
                        </div>

                        <div className="relative group">
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                            <input type="date" className="input-box py-3! pl-11! bg-white!"
                                value={dateTo} onChange={e => { setDateTo(e.target.value); setPage(1); }} />
                        </div>

                        <button onClick={resetFilters}
                            className="secondary-btn w-full py-3! flex items-center justify-center gap-2 group cursor-pointer">
                            <RefreshCcw size={16} className="group-hover:rotate-180 transition-transform duration-500" />
                            Reset Filters
                        </button>
                    </div>

                    {/* Table */}
                    <div className="premium-card p-0! overflow-hidden">
                        <div className="p-5 lg:p-8 border-b border-slate-100 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between bg-slate-50/50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                                    <Filter className="w-4 h-4" />
                                </div>
                                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Audit Trail</h3>
                            </div>
                            <div className="badge-indigo">
                                {loading ? "Loading…" : `${pagination.total.toLocaleString()} Records`}
                            </div>
                        </div>

                        {/* Desktop table */}
                        <div className="hidden lg:block overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-slate-100 text-[11px] font-black text-slate-400 uppercase tracking-widest">
                                        <th className="p-5 w-40">Date & Time</th>
                                        <th className="p-5">User</th>
                                        <th className="p-5">Module</th>
                                        <th className="p-5">Action</th>
                                        <th className="p-5">Description</th>
                                        <th className="p-5">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    {logs.map((log, i) => (
                                        <tr key={log._id}
                                            className={`border-b border-slate-50 last:border-none hover:bg-indigo-50/20 transition-colors ${i % 2 === 0 ? "bg-white" : "bg-slate-50/30"}`}>
                                            <td className="p-5">
                                                <span className="text-[10px] font-bold text-slate-600 whitespace-nowrap">{fmt(log.createdAt)}</span>
                                            </td>
                                            <td className="p-5">
                                                <p className="font-black text-slate-800 text-xs">{log.userName}</p>
                                                <p className="text-[10px] text-slate-400">{log.userEmail}</p>
                                                <span className="text-[9px] font-black text-indigo-500 uppercase">{log.userRole}</span>
                                            </td>
                                            <td className="p-5">
                                                <span className="px-2.5 py-1 bg-slate-100 text-slate-600 font-black text-[10px] rounded-lg uppercase tracking-wider">
                                                    {log.module}
                                                </span>
                                            </td>
                                            <td className="p-5">
                                                <span className="font-black text-slate-700 text-xs">{log.action}</span>
                                            </td>
                                            <td className="p-5 max-w-xs">
                                                <p className="text-xs text-slate-600 line-clamp-2">{log.description}</p>
                                            </td>
                                            <td className="p-5">
                                                <StatusBadge s={log.status} />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile cards */}
                        <div className="lg:hidden p-4 space-y-3">
                            {logs.map(log => (
                                <div key={log._id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3">
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <p className="font-black text-slate-800 text-xs">{log.userName}</p>
                                            <p className="text-[10px] text-slate-400">{log.userEmail}</p>
                                        </div>
                                        <StatusBadge s={log.status} />
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 font-black text-[9px] rounded uppercase">{log.module}</span>
                                        <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 font-black text-[9px] rounded uppercase">{log.action}</span>
                                    </div>
                                    <p className="text-xs text-slate-600">{log.description}</p>
                                    <p className="text-[9px] text-slate-400 font-bold">{fmt(log.createdAt)}</p>
                                </div>
                            ))}
                        </div>

                        {/* Loading */}
                        {loading && (
                            <div className="p-20 text-center space-y-4 opacity-40">
                                <ClipboardList className="w-12 h-12 text-slate-200 mx-auto animate-pulse" />
                                <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Loading logs…</p>
                            </div>
                        )}

                        {/* Empty */}
                        {!loading && logs.length === 0 && (
                            <div className="p-20 text-center space-y-4 opacity-40">
                                <ClipboardList className="w-12 h-12 text-slate-200 mx-auto" />
                                <p className="text-xs font-black text-slate-500 uppercase tracking-widest">No activity logs found</p>
                                <p className="text-xs text-slate-400">Actions performed in the system will appear here.</p>
                            </div>
                        )}

                        {/* Pagination */}
                        {pagination.totalPages > 1 && (
                            <div className="p-5 border-t border-slate-100 flex items-center justify-between bg-slate-50/50 flex-wrap gap-3">
                                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                                    Page {pagination.page} of {pagination.totalPages} &nbsp;·&nbsp; {pagination.total.toLocaleString()} total
                                </p>
                                <div className="flex items-center gap-2">
                                    <button disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}
                                        className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer">
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>
                                    {pageRange().map(pg => (
                                        <button key={pg} onClick={() => setPage(pg)}
                                            className={`w-8 h-8 rounded-xl text-[11px] font-black transition-all cursor-pointer
                                                ${pg === page
                                                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
                                                    : "bg-white border border-slate-200 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600"}`}>
                                            {pg}
                                        </button>
                                    ))}
                                    <button disabled={page >= pagination.totalPages} onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                                        className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer">
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ActivityLogs;
