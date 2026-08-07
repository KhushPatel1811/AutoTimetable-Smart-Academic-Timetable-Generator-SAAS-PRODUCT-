import { Calendar, Search, RefreshCcw, Printer, Filter } from "lucide-react";
import Sidebar from "../../Components/Dashboard/Sidebar";
import ProfileNavbar from "../DashboardItems/Profile/ProfileNavbar";
import { useEffect, useState, useCallback, useRef } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import API from "../../config/api";

interface TimetableSlot {
    day: string;
    slotIndex: number;
    timeSlot: string;
    subject: string;
    subjectCode: string;
    subjectType: string;
    division: string;
    department: string;
    room: string;
}

interface TeacherData {
    teacherId: string;
    teacherName: string;
    teacherEmail: string;
    teacherDepartments?: string[];
}

function TeacherMyTimetable() {
    const [slots, setSlots] = useState<TimetableSlot[]>([]);
    const [teacher, setTeacher] = useState<TeacherData | null>(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [dayFilter, setDayFilter] = useState("");
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const printRef = useRef<HTMLDivElement>(null);

    const handleMenuToggle = () => setIsSidebarOpen(prev => !prev);
    const handleSidebarClose = () => setIsSidebarOpen(false);

    const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    // Teacher's teacherId comes from their linked profile
    // We identify the teacher by matching the logged-in user's email to a teacher record
    const fetchMyTimetable = useCallback(async () => {
        setLoading(true);
        try {
            const user = JSON.parse(localStorage.getItem("user") || "{}");
            const email = user?.email;

            console.log("Logged in user:", user);
            console.log("Email:", email);

            if (!email) {
                toast.error("Could not identify your account");
                setLoading(false);
                return;
            }

            // Find teacher record by email
            const teacherRes = await axios.get(`${API}/teachers/id`, {
                params: { email },
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            console.log("Teacher API:", teacherRes.data);

            const teacherRecord = teacherRes.data?.response;
            if (!teacherRecord) {
                toast.error("Teacher profile not found. Contact your administrator.");
                setLoading(false);
                return;
            }

            setTeacher({
                teacherId: teacherRecord.teacherId,
                teacherName: teacherRecord.teacherName,
                teacherEmail: teacherRecord.teacherEmail,
                teacherDepartments: teacherRecord.teacherDepartments || [teacherRecord.teacherDepartment],
            });

            // Fetch timetable for this teacher
            const ttRes = await axios.get(`${API}/saved-timetables/teacher/${teacherRecord.teacherId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            console.log("Timetable API:", ttRes.data);

            setSlots(ttRes.data.slots || []);
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            toast.error(error.response?.data?.message || "Failed to load timetable");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMyTimetable();
    }, [fetchMyTimetable]);

    const filteredSlots = slots.filter(slot => {
        const matchesSearch = !search ||
            slot.subject.toLowerCase().includes(search.toLowerCase()) ||
            slot.division.toLowerCase().includes(search.toLowerCase()) ||
            slot.room.toLowerCase().includes(search.toLowerCase());
        const matchesDay = !dayFilter || slot.day === dayFilter;
        return matchesSearch && matchesDay;
    });

    // Group by day for structured display
    const groupedByDay = DAYS.reduce((acc, day) => {
        const daySlots = filteredSlots.filter(s => s.day === day);
        if (daySlots.length > 0) acc[day] = daySlots.sort((a, b) => a.slotIndex - b.slotIndex);
        return acc;
    }, {} as Record<string, TimetableSlot[]>);

    const handlePrint = () => {
        const content = printRef.current?.innerHTML || "";
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        const instituteName = user.instituteName || "Institute";
        const win = window.open("", "_blank");
        if (!win) { toast.error("Popup blocked"); return; }
        win.document.write(`
            <!DOCTYPE html><html><head>
            <title>My Timetable</title>
            <style>
                * { margin:0; padding:0; box-sizing:border-box; }
                body { font-family:Arial,sans-serif; font-size:11px; padding:20px; color:#1e293b; }
                h1 { font-size:18px; font-weight:900; text-align:center; margin-bottom:4px; }
                .sub { text-align:center; color:#6366f1; font-size:11px; font-weight:700; margin-bottom:16px; }
                table { width:100%; border-collapse:collapse; margin-bottom:20px; }
                thead th { background:#4f46e5; color:white; padding:8px; font-size:10px; font-weight:900; text-transform:uppercase; border:1px solid #4338ca; }
                td { border:1px solid #e2e8f0; padding:8px; }
                .day-header { background:#f8fafc; font-weight:900; color:#4f46e5; font-size:11px; text-transform:uppercase; letter-spacing:0.1em; padding:6px 8px; }
                .badge { padding:2px 8px; border-radius:4px; font-size:9px; font-weight:900; }
                .lab { background:#ecfdf5; color:#059669; }
                .lec { background:#eef2ff; color:#4f46e5; }
                @page { margin:15mm; }
                @media print { body { -webkit-print-color-adjust:exact; print-color-adjust:exact; } }
            </style></head><body>
            <h1>${instituteName}</h1>
            <div class="sub">${teacher?.teacherName || ""} • ${teacher?.teacherId || ""}</div>
            ${content}
            </body></html>
        `);
        win.document.close();
        setTimeout(() => win.print(), 500);
    };

    return (
        <div className="flex h-screen w-screen overflow-hidden bg-slate-50">
            <Sidebar isOpen={isSidebarOpen} onClose={handleSidebarClose} />

            <div className="flex-1 h-full overflow-y-auto animate-page">
                <div className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
                    <ProfileNavbar content="My Timetable" onMenuToggle={handleMenuToggle} />
                    <ToastContainer position="top-right" autoClose={2000} />
                </div>

                <div className="pt-6 px-4 sm:px-6 lg:px-8 pb-8 max-w-7xl mx-auto space-y-8">

                    {/* HEADER */}
                    <div className="bg-linear-to-r from-indigo-600 to-indigo-500 rounded-3xl p-6 lg:p-10 shadow-2xl shadow-indigo-100 border border-indigo-400/20 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 group-hover:scale-110 transition-transform duration-700" />
                        <div className="relative z-10 flex flex-col lg:flex-row gap-6 lg:items-center lg:justify-between">
                            <div className="flex items-center gap-4 lg:gap-6">
                                <div className="p-4 lg:p-5 bg-white/20 backdrop-blur-xl rounded-3xl shadow-inner border border-white/30">
                                    <Calendar className="w-7 h-7 lg:w-8 lg:h-8 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight">My Timetable</h1>
                                    <p className="text-indigo-100 font-bold text-xs lg:text-sm tracking-wide uppercase">
                                        {teacher ? `${teacher.teacherName} • ${teacher.teacherId}` : "Loading your schedule..."}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={handlePrint}
                                disabled={slots.length === 0}
                                className="bg-white px-6 py-3 lg:px-8 lg:py-4 rounded-2xl font-black text-indigo-600 text-sm shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 w-full lg:w-auto justify-center"
                            >
                                <Printer className="w-4 h-4" /> Print Schedule
                            </button>
                        </div>
                    </div>

                    {/* FILTER BAR */}
                    <div className="premium-card p-4! grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50/50">
                        <div className="relative group md:col-span-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                            <input
                                type="text"
                                className="input-box py-3! pl-11! bg-white!"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Search subject, division, room..."
                            />
                        </div>
                        <div className="relative group">
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors pointer-events-none" />
                            <select
                                className="input-box py-3! pl-11! bg-white! cursor-pointer appearance-none"
                                value={dayFilter}
                                onChange={e => setDayFilter(e.target.value)}
                            >
                                <option value="">All Days</option>
                                {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>
                        <button
                            className="secondary-btn w-full py-3! flex items-center justify-center gap-2 group"
                            onClick={() => { setSearch(""); setDayFilter(""); }}
                        >
                            <RefreshCcw size={16} className="group-hover:rotate-180 transition-transform duration-500" />
                            Reset Filters
                        </button>
                    </div>

                    {/* TIMETABLE TABLE */}
                    <div ref={printRef} className="space-y-6">
                        {loading ? (
                            <div className="premium-card p-20! text-center space-y-4 opacity-40">
                                <Calendar className="w-12 h-12 text-slate-200 mx-auto animate-pulse" />
                                <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Loading your schedule...</p>
                            </div>
                        ) : slots.length === 0 ? (
                            <div className="premium-card p-20! text-center space-y-4 opacity-40">
                                <Calendar className="w-12 h-12 text-slate-200 mx-auto" />
                                <p className="text-xs font-black text-slate-500 uppercase tracking-widest">No timetable assigned yet</p>
                                <p className="text-xs text-slate-400">Your timetable will appear here once the admin saves the institute schedule.</p>
                            </div>
                        ) : Object.keys(groupedByDay).length === 0 ? (
                            <div className="premium-card p-20! text-center space-y-4 opacity-40">
                                <Filter className="w-12 h-12 text-slate-200 mx-auto" />
                                <p className="text-xs font-black text-slate-500 uppercase tracking-widest">No results match your filters</p>
                            </div>
                        ) : (
                            Object.entries(groupedByDay).map(([day, daySlots]) => (
                                <div key={day} className="premium-card p-0! overflow-hidden">
                                    <div className="p-5 border-b border-slate-100 bg-indigo-50 flex items-center justify-between">
                                        <h3 className="text-sm font-black text-indigo-700 uppercase tracking-wider">{day}</h3>
                                        <span className="badge-indigo">{daySlots.length} {daySlots.length === 1 ? "Class" : "Classes"}</span>
                                    </div>

                                    {/* Desktop */}
                                    <div className="hidden lg:block overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className="border-b border-slate-100 text-[11px] font-black text-slate-400 uppercase tracking-widest">
                                                    <th className="p-5">Time</th>
                                                    <th className="p-5">Subject</th>
                                                    <th className="p-5">Code</th>
                                                    <th className="p-5">Type</th>
                                                    <th className="p-5">Division</th>
                                                    <th className="p-5">Department</th>
                                                    <th className="p-5">Room</th>
                                                </tr>
                                            </thead>
                                            <tbody className="text-sm">
                                                {daySlots.map((slot, i) => (
                                                    <tr key={i} className="hover:bg-slate-50/80 transition-colors border-b border-slate-50 last:border-none">
                                                        <td className="p-5">
                                                            <span className="text-xs font-bold text-slate-600 whitespace-nowrap">{slot.timeSlot}</span>
                                                        </td>
                                                        <td className="p-5">
                                                            <div className="font-black text-slate-800">{slot.subject}</div>
                                                        </td>
                                                        <td className="p-5">
                                                            <span className="font-mono text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">{slot.subjectCode || "—"}</span>
                                                        </td>
                                                        <td className="p-5">
                                                            <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase ${slot.subjectType === "Lab" ? "bg-emerald-50 text-emerald-600" : "bg-indigo-50 text-indigo-600"}`}>
                                                                {slot.subjectType}
                                                            </span>
                                                        </td>
                                                        <td className="p-5">
                                                            <span className="font-black text-slate-700">{slot.division}</span>
                                                        </td>
                                                        <td className="p-5">
                                                            <span className="px-2 py-1 bg-slate-100 text-slate-600 text-[10px] font-black rounded-lg uppercase">{slot.department}</span>
                                                        </td>
                                                        <td className="p-5">
                                                            <span className="text-slate-600 font-bold">{slot.room}</span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Mobile */}
                                    <div className="lg:hidden p-4 space-y-3">
                                        {daySlots.map((slot, i) => (
                                            <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 space-y-2">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <p className="font-black text-slate-800">{slot.subject}</p>
                                                        <p className="text-xs text-slate-400">{slot.timeSlot}</p>
                                                    </div>
                                                    <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${slot.subjectType === "Lab" ? "bg-emerald-50 text-emerald-600" : "bg-indigo-50 text-indigo-600"}`}>
                                                        {slot.subjectType}
                                                    </span>
                                                </div>
                                                <div className="flex flex-wrap gap-2 text-xs">
                                                    <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold">Division: {slot.division}</span>
                                                    <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold">Room: {slot.room}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TeacherMyTimetable;
