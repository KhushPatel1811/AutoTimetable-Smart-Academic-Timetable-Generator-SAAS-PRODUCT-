import { useEffect, useState } from "react";
import axios from "axios";
import { BookOpen, GraduationCap, FlaskConical, Layers3, Search, RefreshCcw, Building2, UserRound, Filter, Binary } from "lucide-react";
import Sidebar from "../../../Components/Dashboard/Sidebar";
import ProfileNavbar from "../Profile/ProfileNavbar";
import { useNavigate } from "react-router";
import { toast, ToastContainer } from "react-toastify";

function Subjects() {
    const navigate = useNavigate();
    interface Subject {
        subjectId: string;
        subjectName: string;
        subjectCode: string;
        subjectType: string;
        departmentName: string;
        semester: number;
        teachers: string[];
    }

    interface Department {
        departmentName: string;
    }

    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);

    const [search, setSearch] = useState("");
    const [departmentFilter, setDepartmentFilter] = useState("");
    const [semesterFilter, setSemesterFilter] = useState("");
    const [type, setType] = useState("");

    useEffect(() => {
        async function fetchData() {
            try {
                const config = {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                };
                const [res, dept] = await Promise.all([
                    axios.get("http://localhost:1000/subjects", {
                        ...config,
                        params: { search, departmentFilter, semesterFilter, type }
                    }),
                    axios.get("http://localhost:1000/departments", config)
                ]);
                setSubjects(res.data.subjects);
                setDepartments(dept.data.department);
            } catch (err: unknown) {
                const error = err as { response?: { data?: { message?: string } } };
                toast.error(error.response?.data?.message || "Failed to load subjects");
            }
        }
        fetchData();
    }, [search, departmentFilter, semesterFilter, type]);

    const deleteSubject = async (id: string) => {
        if (!confirm("Remove this subject from the official curriculum?")) return;
        try {
            await axios.delete(`http://localhost:1000/subjects/delete/${id}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            toast.success("Curriculum updated: Subject removed");
            setTimeout(() => window.location.reload(), 2000);
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            toast.error(error.response?.data?.message || 'Purge request failed');
        }
    };

    const stats = [
        { icon: BookOpen, title: "Curriculum Total", count: subjects.length, color: "from-indigo-600 to-indigo-500", shadow: "shadow-indigo-100" },
        { icon: GraduationCap, title: "Primary Lectures", count: subjects.filter((s) => s.subjectType?.toUpperCase() === "LECTURE").length, color: "from-emerald-600 to-emerald-500", shadow: "shadow-emerald-100" },
        { icon: FlaskConical, title: "Laboratory Units", count: subjects.filter((s) => s.subjectType?.toUpperCase() === "LAB").length, color: "from-amber-600 to-amber-500", shadow: "shadow-amber-100" },
        { icon: Binary, title: "Hybrid Modules", count: subjects.filter((s) => s.subjectType?.toUpperCase() === "LECTURE + LAB").length, color: "from-rose-600 to-rose-500", shadow: "shadow-rose-100" }
    ];

    return (
        <div className="flex h-screen w-screen bg-slate-50 overflow-hidden">
            <Sidebar />

            <div className="flex-1 flex flex-col h-full overflow-y-auto animate-page">
                <div className="sticky top-0 z-50 bg-white border-b border-slate-200 px-6 py-4">
                    <ProfileNavbar content="Subject Management System" />
                    <ToastContainer position="top-right" autoClose={2000} />
                </div>

                <div className="p-8 max-w-400 w-full mx-auto space-y-10">
                    {/* Page Header */}
                    <div className="bg-linear-to-r from-indigo-600 to-indigo-500 rounded-[2.5rem] p-10 shadow-2xl shadow-indigo-100 flex flex-col md:flex-row items-center justify-between gap-8 border border-white/10 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -mr-32 -mt-32 group-hover:scale-110 transition-transform duration-700" />
                        
                        <div className="flex items-center space-x-8 relative z-10">
                            <div className="p-6 bg-white/20 backdrop-blur-2xl rounded-4xl shadow-inner border border-white/30">
                                <BookOpen className="w-10 h-10 text-white" />
                            </div>
                            <div>
                                <h1 className="text-4xl font-black text-white tracking-tight">Subject Registry</h1>
                                <p className="text-indigo-100 font-bold text-sm tracking-widest opacity-80 uppercase mt-1">Manage academic modules & workload</p>
                            </div>
                        </div>

                        <button 
                            className="bg-white px-10 py-5 rounded-2xl font-black text-indigo-600 text-sm shadow-2xl hover:shadow-indigo-200 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer relative z-10 uppercase tracking-[0.2em]" 
                            onClick={() => navigate("/subjects/add")}>
                            + Define New Subject
                        </button>  
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {stats.map((item, index) => (
                            <div key={index} className="premium-card p-6! flex items-center gap-6 group hover:-translate-y-1 transition-all duration-300">
                                <div className={`flex items-center justify-center w-16 h-16 rounded-3xl bg-linear-to-br ${item.color} ${item.shadow} shadow-lg shrink-0 group-hover:rotate-6 transition-transform`}>
                                    <item.icon size={28} stroke="white" strokeWidth={2.5} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.title}</p>
                                    <h4 className="text-3xl font-black text-slate-900 mt-0.5">{item.count}</h4>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Filter Bar */}
                    <div className="premium-card p-4! grid grid-cols-1 md:grid-cols-5 gap-4 bg-slate-50/50">
                        <div className="relative group md:col-span-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                            <input type="text" className="input-box py-3! pl-11! bg-white!" value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Search subjects..." />
                        </div>

                        <div className="relative group">
                            <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors pointer-events-none" />
                            <select className="input-box py-3! pl-11! bg-white! cursor-pointer appearance-none" value={departmentFilter} onChange={(e)=>setDepartmentFilter(e.target.value)}>
                                <option value="">All Departments</option>
                                {departments?.map((dept) => <option key={dept.departmentName} value={dept.departmentName}>{dept.departmentName}</option>)}
                            </select>
                        </div>

                        <div className="relative group">
                            <UserRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors pointer-events-none" />
                            <select className="input-box py-3! pl-11! bg-white! cursor-pointer appearance-none" value={semesterFilter} onChange={(e)=>setSemesterFilter(e.target.value)}>
                                <option value="">Target Semester</option>
                                {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(s => <option key={s + 100} value={s}>Class {s}</option>)}
                            </select>
                        </div>

                        <div className="relative group">
                            <Layers3 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors pointer-events-none" />
                            <select className="input-box py-3! pl-11! bg-white! cursor-pointer appearance-none" value={type} onChange={(e)=>setType(e.target.value)}>
                                <option value="">Category</option>
                                <option value="Lecture">Lecture</option>
                                <option value="Lab">Laboratory</option>
                                <option value="Lecture + Lab">Hybrid</option>
                            </select>
                        </div>

                        <button className="secondary-btn w-full py-3! flex items-center justify-center gap-2 group" onClick={() => { setSearch(''); setDepartmentFilter(''); setSemesterFilter(''); setType(''); }}>
                            <RefreshCcw size={16} className="group-hover:rotate-180 transition-transform duration-500" />
                            Reset Matrix
                        </button>
                    </div>

                    {/* Table Container */}
                    <div className="premium-card p-0! overflow-hidden">
                        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                                    <Filter className="w-4 h-4" />
                                </div>
                                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Active Curriculum Registry</h3>
                            </div>
                            <div className="badge-indigo">Verified Content</div>
                        </div>

                        <div className="overflow-x-auto custom-scrollbar">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                        <th className="p-8">Subject Identity</th>
                                        <th className="p-8">Classification</th>
                                        <th className="p-8">Academic Span</th>
                                        <th className="p-8">Instructional Node</th>
                                        <th className="p-8 text-right">Operations</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {subjects.map((s) => {
                                        const typeNorm = s.subjectType?.toUpperCase() || "";
                                        let badgeClasses = "bg-indigo-50 text-indigo-700 border border-indigo-100/80";
                                        let dotClasses = "bg-indigo-500";
                                        
                                        if (typeNorm.includes("LECTURE + LAB")) {
                                            badgeClasses = "bg-rose-50 text-rose-700 border border-rose-100/80";
                                            dotClasses = "bg-rose-500";
                                        } else if (typeNorm.includes("LAB")) {
                                            badgeClasses = "bg-amber-50 text-amber-700 border border-amber-100/80";
                                            dotClasses = "bg-amber-500";
                                        }

                                        return (
                                            <tr key={s.subjectId} className="group hover:bg-slate-50/70 transition-colors border-b border-slate-50 last:border-none">
                                                <td className="p-8">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center font-black text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                                            {s.subjectName.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <div className="font-black text-slate-800 text-base">{s.subjectName}</div>
                                                            <div className="text-[10px] font-mono text-indigo-500 uppercase font-black">{s.subjectCode}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-8">
                                                    <div className={`${badgeClasses} px-4 py-2 inline-flex items-center gap-2 rounded-xl text-xs font-black tracking-wide uppercase`}>
                                                        <div className={`w-1.5 h-1.5 rounded-full ${dotClasses} opacity-80`} />
                                                        {s.subjectType}
                                                    </div>
                                                </td>
                                                <td className="p-8">
                                                    <div className="font-bold text-slate-700">{s.departmentName}</div>
                                                    <div className="text-[10px] text-slate-400 font-black uppercase tracking-tighter">Level: {s.semester}</div>
                                                </td>
                                                <td className="p-8">
                                                    <span className="px-3 py-1.5 bg-blue-50 text-blue-700 font-black text-[10px] rounded-lg tracking-widest uppercase border border-blue-100/50">
                                                        {s.teachers?.length || 0} Assignees
                                                    </span>
                                                </td>
                                                <td className="p-8 text-right">
                                                    <div className="flex items-center justify-end gap-3 transition-all">
                                                        <button onClick={() => navigate(`/subjects/edit/${s.subjectId}`)} className="secondary-btn p-3!">
                                                            Edit
                                                        </button>
                                                        <button onClick={() => deleteSubject(s.subjectId)} className="delete-btn">
                                                            Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                            {(!subjects || subjects.length === 0) && (
                                <div className="p-32 text-center space-y-4 opacity-30 grayscale">
                                    <BookOpen className="w-16 h-16 mx-auto text-slate-200" />
                                    <p className="font-black uppercase tracking-[0.4em] text-xs">Curriculum Registry Empty</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Subjects;