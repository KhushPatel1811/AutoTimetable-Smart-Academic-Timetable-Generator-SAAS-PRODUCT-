import { BookMarked, Search, Filter, RefreshCcw, Building2, BookOpen, Eye, Trash2, ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import Sidebar from "../../../Components/Dashboard/Sidebar";
import ProfileNavbar from "../Profile/ProfileNavbar";
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import API from "../../../config/api";

interface SavedTimetable {
    _id: string;
    divisionName: string;
    departmentName: string;
    semester?: number;
    updatedAt: string;
    createdAt: string;
}

type SortField = "divisionName" | "departmentName" | "updatedAt";
type SortOrder = "asc" | "desc";

function Timetables() {
    const navigate = useNavigate();
    const [timetables, setTimetables] = useState<SavedTimetable[]>([]);
    const [departments, setDepartments] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    const [search, setSearch] = useState("");
    const [departmentFilter, setDepartmentFilter] = useState("");
    const [sortBy, setSortBy] = useState<SortField>("updatedAt");
    const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const handleMenuToggle = () => setIsSidebarOpen(prev => !prev);
    const handleSidebarClose = () => setIsSidebarOpen(false);

    const fetchTimetables = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API}/saved-timetables`, {
                params: { search, departmentFilter, sortBy, sortOrder },
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            setTimetables(response.data.timetables || []);
            setDepartments(response.data.departments || []);
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            toast.error(error.response?.data?.message || "Failed to load timetables");
        } finally {
            setLoading(false);
        }
    }, [search, departmentFilter, sortBy, sortOrder]);

    useEffect(() => {
        fetchTimetables();
    }, [fetchTimetables]);

    async function deleteTimetable(id: string, divisionName: string) {
        if (!confirm(`Are you sure you want to delete the timetable for ${divisionName}?`)) return;
        try {
            await axios.delete(`${API}/saved-timetables/${id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            toast.success("Timetable deleted successfully");
            setTimeout(() => fetchTimetables(), 1500);
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            toast.error(error.response?.data?.message || "Delete failed");
        }
    }

    function toggleSort(field: SortField) {
        if (sortBy === field) {
            setSortOrder(prev => prev === "asc" ? "desc" : "asc");
        } else {
            setSortBy(field);
            setSortOrder("asc");
        }
    }

    function SortIcon({ field }: { field: SortField }) {
        if (sortBy !== field) return <ChevronsUpDown className="w-3 h-3 text-slate-300" />;
        return sortOrder === "asc"
            ? <ChevronUp className="w-3 h-3 text-indigo-500" />
            : <ChevronDown className="w-3 h-3 text-indigo-500" />;
    }

    return (
        <div className="flex h-screen w-screen overflow-hidden bg-slate-50">
            <Sidebar isOpen={isSidebarOpen} onClose={handleSidebarClose} />

            <div className="flex-1 h-full overflow-y-auto animate-page">
                <div className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
                    <ProfileNavbar content="Timetables Management" onMenuToggle={handleMenuToggle} />
                    <ToastContainer position="top-right" autoClose={2000} />
                </div>

                <div className="pt-6 px-4 sm:px-6 lg:px-8 pb-8 max-w-7xl mx-auto space-y-8">

                    {/* HEADER CARD */}
                    <div className="bg-linear-to-r from-indigo-600 to-indigo-500 rounded-3xl p-6 lg:p-10 shadow-2xl shadow-indigo-100 border border-indigo-400/20 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 group-hover:scale-110 transition-transform duration-700" />
                        <div className="relative z-10 flex flex-col lg:flex-row gap-6 lg:items-center lg:justify-between">
                            <div className="flex items-center gap-4 lg:gap-6">
                                <div className="p-4 lg:p-5 bg-white/20 backdrop-blur-xl rounded-3xl shadow-inner border border-white/30">
                                    <BookMarked className="w-7 h-7 lg:w-8 lg:h-8 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight">Saved Timetables</h1>
                                    <p className="text-indigo-100 font-bold text-xs lg:text-sm tracking-wide uppercase">
                                        View and manage all saved division timetables
                                    </p>
                                </div>
                            </div>
                            <div className="badge-indigo bg-white/20! text-white! border-white/30!">
                                {timetables.length} Saved
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
                                placeholder="Search division or department..."
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
                                    <option key={dept} value={dept}>{dept}</option>
                                ))}
                            </select>
                        </div>

                        <div className="relative group">
                            <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors pointer-events-none" />
                            <select
                                className="input-box py-3! pl-11! bg-white! cursor-pointer appearance-none"
                                value={`${sortBy}_${sortOrder}`}
                                onChange={e => {
                                    const [field, order] = e.target.value.split("_");
                                    setSortBy(field as SortField);
                                    setSortOrder(order as SortOrder);
                                }}
                            >
                                <option value="updatedAt_desc">Latest Updated</option>
                                <option value="updatedAt_asc">Oldest Updated</option>
                                <option value="divisionName_asc">Division A–Z</option>
                                <option value="divisionName_desc">Division Z–A</option>
                                <option value="departmentName_asc">Department A–Z</option>
                            </select>
                        </div>

                        <button
                            className="secondary-btn w-full py-3! flex items-center justify-center gap-2 group"
                            onClick={() => { setSearch(""); setDepartmentFilter(""); setSortBy("updatedAt"); setSortOrder("desc"); }}
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
                                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">All Saved Timetables</h3>
                            </div>
                            <div className="badge-indigo">
                                {loading ? "Loading..." : `${timetables.length} Records`}
                            </div>
                        </div>

                        {/* DESKTOP TABLE */}
                        <div className="hidden lg:block overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-slate-100 text-[11px] font-black text-slate-400 uppercase tracking-widest">
                                        <th className="p-6">Sr No</th>
                                        <th className="p-6 cursor-pointer select-none" onClick={() => toggleSort("divisionName")}>
                                            <span className="flex items-center gap-1">Division Name <SortIcon field="divisionName" /></span>
                                        </th>
                                        <th className="p-6 cursor-pointer select-none" onClick={() => toggleSort("departmentName")}>
                                            <span className="flex items-center gap-1">Department <SortIcon field="departmentName" /></span>
                                        </th>
                                        <th className="p-6">Semester</th>
                                        <th className="p-6 cursor-pointer select-none" onClick={() => toggleSort("updatedAt")}>
                                            <span className="flex items-center gap-1">Last Updated <SortIcon field="updatedAt" /></span>
                                        </th>
                                        <th className="p-6 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    {timetables.map((tt, index) => (
                                        <tr key={tt._id} className="group hover:bg-slate-50/80 transition-colors border-b border-slate-50 last:border-none">
                                            <td className="p-6 font-black text-slate-300 text-lg">
                                                {(index + 1).toString().padStart(2, "0")}
                                            </td>
                                            <td className="p-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center font-black bg-indigo-50 text-indigo-600 text-sm">
                                                        {tt.divisionName.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="font-black text-slate-800">{tt.divisionName}</div>
                                                        <div className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">Division</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-6">
                                                <span className="px-3 py-1.5 bg-slate-100 text-slate-600 font-black text-[10px] rounded-lg tracking-widest uppercase">
                                                    {tt.departmentName}
                                                </span>
                                            </td>
                                            <td className="p-6">
                                                {tt.semester
                                                    ? <span className="font-mono text-xs text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-100">Sem {tt.semester}</span>
                                                    : <span className="text-slate-300 text-xs">—</span>
                                                }
                                            </td>
                                            <td className="p-6 text-slate-500 font-bold text-xs italic">
                                                {new Date(tt.updatedAt).toLocaleDateString(undefined, {
                                                    year: "numeric", month: "long", day: "numeric"
                                                })}
                                            </td>
                                            <td className="p-6 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        className="secondary-btn py-2! px-4! flex items-center gap-1.5"
                                                        onClick={() => navigate(`/timetables/preview/${tt._id}`)}
                                                    >
                                                        <Eye className="w-3.5 h-3.5" /> Preview
                                                    </button>
                                                    <button
                                                        className="delete-btn"
                                                        onClick={() => deleteTimetable(tt._id, tt.divisionName)}
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
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
                            {timetables.map((tt, index) => (
                                <div key={tt._id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h2 className="font-black text-slate-800 text-lg">{tt.divisionName}</h2>
                                            <p className="text-xs text-slate-400 uppercase font-bold">{tt.departmentName}</p>
                                        </div>
                                        <span className="font-bold text-slate-400">#{index + 1}</span>
                                    </div>
                                    {tt.semester && (
                                        <div>
                                            <p className="text-xs font-bold text-slate-400 uppercase mb-1">Semester</p>
                                            <span className="font-mono text-xs text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-100">
                                                Sem {tt.semester}
                                            </span>
                                        </div>
                                    )}
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase mb-1">Last Updated</p>
                                        <p className="text-sm text-slate-600">
                                            {new Date(tt.updatedAt).toLocaleDateString(undefined, {
                                                year: "numeric", month: "long", day: "numeric"
                                            })}
                                        </p>
                                    </div>
                                    <div className="flex gap-3">
                                        <button
                                            className="secondary-btn flex-1 py-2! flex items-center justify-center gap-1.5"
                                            onClick={() => navigate(`/timetables/preview/${tt._id}`)}
                                        >
                                            <Eye className="w-3.5 h-3.5" /> Preview
                                        </button>
                                        <button
                                            className="delete-btn flex-1 flex items-center justify-center gap-1.5"
                                            onClick={() => deleteTimetable(tt._id, tt.divisionName)}
                                        >
                                            <Trash2 className="w-3.5 h-3.5 shrink-0" />
                                            <span>Delete</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* LOADING STATE */}
                        {loading && (
                            <div className="p-20 text-center space-y-4 opacity-40">
                                <BookMarked className="w-12 h-12 text-slate-200 mx-auto animate-pulse" />
                                <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Loading timetables...</p>
                            </div>
                        )}

                        {/* EMPTY STATE */}
                        {!loading && timetables.length === 0 && (
                            <div className="p-20 text-center space-y-4 opacity-40">
                                <BookMarked className="w-12 h-12 text-slate-200 mx-auto" />
                                <p className="text-xs font-black text-slate-500 uppercase tracking-widest">
                                    No saved timetables found
                                </p>
                                <p className="text-xs text-slate-400">Generate a timetable and click Save to store it here.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Timetables;
