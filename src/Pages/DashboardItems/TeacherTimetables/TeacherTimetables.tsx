import { GraduationCap, Search, Filter, RefreshCcw, Building2, Eye, Download, ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import Sidebar from "../../../Components/Dashboard/Sidebar";
import ProfileNavbar from "../Profile/ProfileNavbar";
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import API from "../../../config/api";

interface Teacher {
    teacherId: string;
    teacherName: string;
    teacherEmail: string;
    teacherDepartments?: string[];
    teacherDepartment?: string;
    teacherAvailability: string;
}

interface Department {
    departmentName: string;
}

type SortField = "teacherName" | "teacherId";
type SortOrder = "asc" | "desc";

function TeacherTimetables() {
    const navigate = useNavigate();
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(false);
    const [downloadingId, setDownloadingId] = useState<string | null>(null);

    const [search, setSearch] = useState("");
    const [departmentFilter, setDepartmentFilter] = useState("");
    const [sortField, setSortField] = useState<SortField>("teacherName");
    const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const handleMenuToggle = () => setIsSidebarOpen(prev => !prev);
    const handleSidebarClose = () => setIsSidebarOpen(false);

    const fetchTeachers = useCallback(async () => {
        setLoading(true);
        try {
            const [teacherRes, deptRes] = await Promise.all([
                axios.get(`${API}/teachers`, {
                    params: { search, departmentFilter },
                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                }),
                axios.get(`${API}/departments`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                }),
            ]);
            setTeachers(teacherRes.data.teachers || []);
            setDepartments(deptRes.data.department || []);
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            toast.error(error.response?.data?.message || "Failed to load teachers");
        } finally {
            setLoading(false);
        }
    }, [search, departmentFilter]);

    useEffect(() => {
        fetchTeachers();
    }, [fetchTeachers]);

    const sortedTeachers = [...teachers].sort((a, b) => {
        const aVal = a[sortField] || "";
        const bVal = b[sortField] || "";
        return sortOrder === "asc"
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal);
    });

    function toggleSort(field: SortField) {
        if (sortField === field) {
            setSortOrder(prev => prev === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortOrder("asc");
        }
    }

    function SortIcon({ field }: { field: SortField }) {
        if (sortField !== field) return <ChevronsUpDown className="w-3 h-3 text-slate-300" />;
        return sortOrder === "asc"
            ? <ChevronUp className="w-3 h-3 text-indigo-500" />
            : <ChevronDown className="w-3 h-3 text-indigo-500" />;
    }

    async function handleDownload(teacher: Teacher) {
        setDownloadingId(teacher.teacherId);
        try {
            // Fetch teacher timetable slots
            const response = await axios.get(`${API}/saved-timetables/teacher/${teacher.teacherId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });

            const { slots, teacher: teacherData } = response.data;
            const user = JSON.parse(localStorage.getItem("user") || "{}");
            const instituteName = user.instituteName || "Institute";

            // Build printable HTML for PDF
            const html = buildTeacherTimetableHtml(teacherData, slots, instituteName);

            const win = window.open("", "_blank");
            if (!win) {
                toast.error("Popup blocked. Please allow popups to download PDF.");
                return;
            }
            win.document.write(html);
            win.document.close();
            win.focus();
            setTimeout(() => win.print(), 600);
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            toast.error(error.response?.data?.message || "Failed to generate timetable");
        } finally {
            setDownloadingId(null);
        }
    }

    function buildTeacherTimetableHtml(teacher: any, slots: any[], instituteName: string): string {
        // Group by day
        const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
        const dayOrder = days.reduce((acc, d, i) => ({ ...acc, [d]: i }), {} as Record<string, number>);

        const grouped: Record<string, any[]> = {};
        for (const slot of slots) {
            if (!grouped[slot.day]) grouped[slot.day] = [];
            grouped[slot.day].push(slot);
        }

        const sortedDays = Object.keys(grouped).sort((a, b) => (dayOrder[a] ?? 99) - (dayOrder[b] ?? 99));

        const rows = sortedDays.map(day => {
            return grouped[day].map((slot, i) => `
                <tr>
                    ${i === 0 ? `<td rowspan="${grouped[day].length}" style="background:#f8fafc;font-weight:900;text-align:center;vertical-align:middle;border:1px solid #e2e8f0;padding:8px;color:#4f46e5;">${day}</td>` : ''}
                    <td style="border:1px solid #e2e8f0;padding:8px;">${slot.timeSlot}</td>
                    <td style="border:1px solid #e2e8f0;padding:8px;font-weight:700;">${slot.subject}</td>
                    <td style="border:1px solid #e2e8f0;padding:8px;">${slot.subjectCode || "-"}</td>
                    <td style="border:1px solid #e2e8f0;padding:8px;"><span style="background:${slot.subjectType === 'Lab' ? '#ecfdf5' : '#eef2ff'};color:${slot.subjectType === 'Lab' ? '#059669' : '#4f46e5'};padding:2px 8px;border-radius:4px;font-size:10px;font-weight:900;">${slot.subjectType}</span></td>
                    <td style="border:1px solid #e2e8f0;padding:8px;">${slot.division}</td>
                    <td style="border:1px solid #e2e8f0;padding:8px;">${slot.room}</td>
                </tr>
            `).join('');
        }).join('');

        const depts = (teacher.teacherDepartments?.join(", ") || teacher.teacherDepartment || "—");

        return `<!DOCTYPE html>
<html>
<head>
    <title>Timetable - ${teacher.teacherName}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; font-size: 12px; color: #1e293b; padding: 20px; }
        .header { text-align: center; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 3px solid #4f46e5; }
        .header h1 { font-size: 20px; font-weight: 900; color: #1e293b; }
        .header h2 { font-size: 14px; font-weight: 700; color: #6366f1; margin-top: 4px; }
        .info-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 20px; background: #f8fafc; padding: 12px; border-radius: 8px; border: 1px solid #e2e8f0; }
        .info-item label { font-size: 9px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em; color: #94a3b8; display: block; }
        .info-item span { font-size: 12px; font-weight: 700; color: #1e293b; }
        table { width: 100%; border-collapse: collapse; }
        thead tr { background: #4f46e5; }
        thead th { color: white; padding: 10px 8px; text-align: left; font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em; border: 1px solid #4338ca; }
        .footer { margin-top: 20px; text-align: center; font-size: 9px; color: #94a3b8; }
        @page { margin: 15mm; size: A4 portrait; }
        @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
    </style>
</head>
<body>
    <div class="header">
        <h1>${instituteName}</h1>
        <h2>Teacher Timetable — ${teacher.teacherName}</h2>
    </div>
    <div class="info-grid">
        <div class="info-item"><label>Teacher ID</label><span>${teacher.teacherId}</span></div>
        <div class="info-item"><label>Email</label><span>${teacher.teacherEmail}</span></div>
        <div class="info-item"><label>Department(s)</label><span>${depts}</span></div>
    </div>
    <table>
        <thead>
            <tr>
                <th>Day</th>
                <th>Time</th>
                <th>Subject</th>
                <th>Code</th>
                <th>Type</th>
                <th>Division</th>
                <th>Room</th>
            </tr>
        </thead>
        <tbody>
            ${rows || '<tr><td colspan="7" style="text-align:center;padding:20px;color:#94a3b8;">No classes assigned</td></tr>'}
        </tbody>
    </table>
    <div class="footer">Generated on ${new Date().toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })} • ${instituteName}</div>
</body>
</html>`;
    }

    const getDepts = (teacher: Teacher) => {
        if (teacher.teacherDepartments && teacher.teacherDepartments.length > 0) {
            return teacher.teacherDepartments.join(", ");
        }
        return teacher.teacherDepartment || "—";
    };

    return (
        <div className="flex h-screen w-screen overflow-hidden bg-slate-50">
            <Sidebar isOpen={isSidebarOpen} onClose={handleSidebarClose} />

            <div className="flex-1 h-full overflow-y-auto animate-page">
                <div className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
                    <ProfileNavbar content="Teacher Timetables" onMenuToggle={handleMenuToggle} />
                    <ToastContainer position="top-right" autoClose={2000} />
                </div>

                <div className="pt-6 px-4 sm:px-6 lg:px-8 pb-8 max-w-7xl mx-auto space-y-8">

                    {/* HEADER CARD */}
                    <div className="bg-linear-to-r from-indigo-600 to-indigo-500 rounded-3xl p-6 lg:p-10 shadow-2xl shadow-indigo-100 border border-indigo-400/20 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 group-hover:scale-110 transition-transform duration-700" />
                        <div className="relative z-10 flex flex-col lg:flex-row gap-6 lg:items-center lg:justify-between">
                            <div className="flex items-center gap-4 lg:gap-6">
                                <div className="p-4 lg:p-5 bg-white/20 backdrop-blur-xl rounded-3xl shadow-inner border border-white/30">
                                    <GraduationCap className="w-7 h-7 lg:w-8 lg:h-8 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight">Teacher Timetables</h1>
                                    <p className="text-indigo-100 font-bold text-xs lg:text-sm tracking-wide uppercase">
                                        View and download individual teacher schedules
                                    </p>
                                </div>
                            </div>
                            <div className="badge-indigo bg-white/20! text-white! border-white/30!">
                                {teachers.length} Teachers
                            </div>
                        </div>
                    </div>

                    {/* FILTER BAR */}
                    <div className="premium-card p-4! grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-50/50">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                            <input
                                type="text"
                                className="input-box py-3! pl-11! bg-white!"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Search by name or ID..."
                            />
                        </div>

                        <div className="relative group">
                            <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors pointer-events-none" />
                            <select
                                className="input-box py-3! pl-11! bg-white! cursor-pointer appearance-none"
                                value={departmentFilter}
                                onChange={e => setDepartmentFilter(e.target.value)}
                            >
                                <option value="">All Departments</option>
                                {departments.map(dept => (
                                    <option key={dept.departmentName} value={dept.departmentName}>{dept.departmentName}</option>
                                ))}
                            </select>
                        </div>

                        <div className="relative group">
                            <select
                                className="input-box py-3! bg-white! cursor-pointer appearance-none"
                                value={`${sortField}_${sortOrder}`}
                                onChange={e => {
                                    const [field, order] = e.target.value.split("_");
                                    setSortField(field as SortField);
                                    setSortOrder(order as SortOrder);
                                }}
                            >
                                <option value="teacherName_asc">Name A–Z</option>
                                <option value="teacherName_desc">Name Z–A</option>
                                <option value="teacherId_asc">ID Ascending</option>
                                <option value="teacherId_desc">ID Descending</option>
                            </select>
                        </div>

                        <button
                            className="secondary-btn w-full py-3! flex items-center justify-center gap-2 group"
                            onClick={() => { setSearch(""); setDepartmentFilter(""); setSortField("teacherName"); setSortOrder("asc"); }}
                        >
                            <RefreshCcw size={16} className="group-hover:rotate-180 transition-transform duration-500" />
                            Reset Filters
                        </button>
                    </div>

                    {/* TABLE CARD */}
                    <div className="premium-card p-0! overflow-hidden">
                        <div className="p-5 lg:p-8 border-b border-slate-100 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between bg-slate-50/50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                                    <Filter className="w-4 h-4" />
                                </div>
                                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Faculty Schedule Index</h3>
                            </div>
                            <div className="badge-indigo">
                                {loading ? "Loading..." : `${sortedTeachers.length} Records`}
                            </div>
                        </div>

                        {/* DESKTOP TABLE */}
                        <div className="hidden lg:block overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-slate-100 text-[11px] font-black text-slate-400 uppercase tracking-widest">
                                        <th className="p-6">Sr No</th>
                                        <th className="p-6 cursor-pointer select-none" onClick={() => toggleSort("teacherName")}>
                                            <span className="flex items-center gap-1">Teacher Name <SortIcon field="teacherName" /></span>
                                        </th>
                                        <th className="p-6 cursor-pointer select-none" onClick={() => toggleSort("teacherId")}>
                                            <span className="flex items-center gap-1">Teacher ID <SortIcon field="teacherId" /></span>
                                        </th>
                                        <th className="p-6">Departments</th>
                                        <th className="p-6">Status</th>
                                        <th className="p-6 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    {sortedTeachers.map((teacher, index) => (
                                        <tr key={teacher.teacherId} className="group hover:bg-slate-50/80 transition-colors border-b border-slate-50 last:border-none">
                                            <td className="p-6 font-black text-slate-300 text-lg">
                                                {(index + 1).toString().padStart(2, "0")}
                                            </td>
                                            <td className="p-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-black bg-indigo-50 text-indigo-600">
                                                        {teacher.teacherName.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="font-black text-slate-800 text-base">{teacher.teacherName}</div>
                                                        <div className="text-[10px] text-slate-400 font-bold">{teacher.teacherEmail}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-6">
                                                <span className="font-mono text-xs text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-100">
                                                    {teacher.teacherId}
                                                </span>
                                            </td>
                                            <td className="p-6">
                                                <div className="flex flex-wrap gap-1">
                                                    {(teacher.teacherDepartments?.length ? teacher.teacherDepartments : [teacher.teacherDepartment || "—"]).map(dept => (
                                                        <span key={dept} className="px-2 py-1 bg-slate-100 text-slate-600 font-black text-[10px] rounded-lg tracking-widest uppercase">
                                                            {dept}
                                                        </span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="p-6">
                                                <div className={`badge-${teacher.teacherAvailability === 'Available' ? 'emerald' : teacher.teacherAvailability === 'Busy' ? 'indigo' : 'rose'} px-4! py-2! inline-flex items-center gap-2`}>
                                                    <div className={`w-1.5 h-1.5 rounded-full ${teacher.teacherAvailability === 'Available' ? 'bg-emerald-500' : 'bg-rose-500'} animate-pulse`} />
                                                    {teacher.teacherAvailability === 'Busy' ? 'In a Class' : teacher.teacherAvailability}
                                                </div>
                                            </td>
                                            <td className="p-6 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        className="secondary-btn py-2! px-4! flex items-center gap-1.5"
                                                        onClick={() => navigate(`/teacher-timetables/preview/${teacher.teacherId}`)}
                                                    >
                                                        <Eye className="w-3.5 h-3.5" /> View
                                                    </button>
                                                    <button
                                                        className="add-btn py-2! px-4! flex items-center gap-1.5"
                                                        disabled={downloadingId === teacher.teacherId}
                                                        onClick={() => handleDownload(teacher)}
                                                    >
                                                        <Download className="w-3.5 h-3.5" />
                                                        {downloadingId === teacher.teacherId ? "..." : "PDF"}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* MOBILE CARDS */}
                        <div className="lg:hidden p-4 space-y-4">
                            {sortedTeachers.map((teacher, index) => (
                                <div key={teacher.teacherId} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black">
                                                {teacher.teacherName.charAt(0)}
                                            </div>
                                            <div>
                                                <h2 className="font-black text-slate-800">{teacher.teacherName}</h2>
                                                <p className="text-xs text-slate-400">{teacher.teacherEmail}</p>
                                            </div>
                                        </div>
                                        <span className="font-bold text-slate-400">#{index + 1}</span>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase mb-1">Teacher ID</p>
                                        <span className="font-mono text-xs text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-100">
                                            {teacher.teacherId}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase mb-1">Departments</p>
                                        <p className="text-sm text-slate-600">{getDepts(teacher)}</p>
                                    </div>
                                    <div className="flex gap-3">
                                        <button
                                            className="secondary-btn flex-1 py-2! flex items-center justify-center gap-1.5"
                                            onClick={() => navigate(`/teacher-timetables/preview/${teacher.teacherId}`)}
                                        >
                                            <Eye className="w-3.5 h-3.5" /> View
                                        </button>
                                        <button
                                            className="add-btn flex-1 py-2! flex items-center justify-center gap-1.5"
                                            disabled={downloadingId === teacher.teacherId}
                                            onClick={() => handleDownload(teacher)}
                                        >
                                            <Download className="w-3.5 h-3.5" />
                                            {downloadingId === teacher.teacherId ? "Downloading..." : "Download PDF"}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* LOADING STATE */}
                        {loading && (
                            <div className="p-20 text-center space-y-4 opacity-40">
                                <GraduationCap className="w-12 h-12 text-slate-200 mx-auto animate-pulse" />
                                <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Loading teachers...</p>
                            </div>
                        )}

                        {/* EMPTY STATE */}
                        {!loading && sortedTeachers.length === 0 && (
                            <div className="p-20 text-center space-y-4 opacity-40">
                                <GraduationCap className="w-12 h-12 text-slate-200 mx-auto" />
                                <p className="text-xs font-black text-slate-500 uppercase tracking-widest">No teachers found</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TeacherTimetables;
