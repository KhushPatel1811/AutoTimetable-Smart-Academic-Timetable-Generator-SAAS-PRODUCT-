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
        // Open the preview page in a new tab with ?print=1 so it
        // auto-triggers the browser print dialog once the timetable
        // has loaded — giving the exact same visual as the view page.
        window.open(
            `/teacher-timetables/preview/${teacher.teacherId}?print=1`,
            "_blank"
        );
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
                                                        className="secondary-btn py-2! px-4! flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200"
                                                        onClick={() => navigate(`/teacher-timetables/preview/${teacher.teacherId}`)}
                                                    >
                                                        <Eye className="w-3.5 h-3.5" /> View
                                                    </button>
                                                    <button
                                                        className="add-btn py-2! px-4! flex items-center gap-1.5"
                                                        onClick={() => handleDownload(teacher)}
                                                    >
                                                        <Download className="w-3.5 h-3.5" />
                                                        PDF
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
                                            className="secondary-btn flex-1 py-2! flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200"
                                            onClick={() => navigate(`/teacher-timetables/preview/${teacher.teacherId}`)}
                                        >
                                            <Eye className="w-3.5 h-3.5" /> View
                                        </button>
                                        <button
                                            className="add-btn flex-1 py-2! flex items-center justify-center gap-1.5"
                                            onClick={() => handleDownload(teacher)}
                                        >
                                            <Download className="w-3.5 h-3.5" />
                                            Download PDF
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
