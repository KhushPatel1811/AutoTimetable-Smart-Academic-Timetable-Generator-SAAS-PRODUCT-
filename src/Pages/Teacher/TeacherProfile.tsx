import { useEffect, useState } from "react";
import { KeyRound, ShieldCheck, Mail, Building2, UserCircle2, BookOpen, Lock, Phone, GraduationCap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "../../Components/Dashboard/Sidebar";
import ProfileNavbar from "../DashboardItems/Profile/ProfileNavbar";
import { toast, ToastContainer } from "react-toastify";
import API from "../../config/api";

interface TeacherProfile {
    teacherId: string;
    teacherName: string;
    teacherEmail: string;
    teacherPhoneNumber: string;
    teacherDepartments?: string[];
    teacherDepartment?: string;
    teacherAvailability: string;
    Subjects?: { subjects: string }[];
}

function TeacherProfile() {
    const navigate = useNavigate();
    const [teacher, setTeacher] = useState<TeacherProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const handleMenuToggle = () => setIsSidebarOpen(prev => !prev);
    const handleSidebarClose = () => setIsSidebarOpen(false);

    const user = JSON.parse(localStorage.getItem("user") || "{}");

    useEffect(() => {
        async function fetchTeacher() {
            try {
                const response = await axios.get(`${API}/teachers/id`, {
                    params: { email: user?.email },
                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                });
                setTeacher(response.data?.response);
            } catch (err: unknown) {
                const error = err as { response?: { data?: { message?: string } } };
                toast.error(error.response?.data?.message || "Failed to load profile");
            } finally {
                setLoading(false);
            }
        }
        if (user?.email) fetchTeacher();
    }, []);

    const departments = teacher?.teacherDepartments?.length
        ? teacher.teacherDepartments
        : teacher?.teacherDepartment ? [teacher.teacherDepartment] : [];

    const subjects = teacher?.Subjects?.map(s => s.subjects).filter(Boolean) || [];

    return (
        <div className="flex h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden">
            <Sidebar isOpen={isSidebarOpen} onClose={handleSidebarClose} />
            <ToastContainer position="top-right" autoClose={2000} />

            <div className="flex-1 flex flex-col h-full overflow-y-auto custom-scrollbar">
                <ProfileNavbar content="My Profile" onMenuToggle={handleMenuToggle} />

                <div className="p-6 md:p-10 max-w-3xl w-full mx-auto space-y-10">
                    {/* Header */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-600/10">
                                <GraduationCap className="w-5 h-5 text-white" />
                            </div>
                            <h1 className="text-3xl font-black text-white tracking-tight">
                                My <span className="text-indigo-400">Profile</span>
                            </h1>
                        </div>
                        <p className="text-slate-400 text-sm font-medium">
                            View your academic profile. Contact your administrator to update assignments and department details.
                        </p>
                    </div>

                    {loading ? (
                        <div className="bg-white/5 border border-white/10 rounded-3xl p-16 text-center opacity-40">
                            <GraduationCap className="w-10 h-10 mx-auto text-slate-400 animate-pulse" />
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-4">Loading profile...</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Identity Card */}
                            <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden shadow-xl">
                                <div className="p-6 border-b border-white/5 bg-white/2 flex items-center gap-2.5">
                                    <div className="p-2 bg-white/5 border border-white/10 rounded-lg text-indigo-400">
                                        <UserCircle2 className="w-4 h-4" />
                                    </div>
                                    <h3 className="text-xs font-black text-slate-200 uppercase tracking-widest">Personal Information</h3>
                                </div>
                                <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                            <UserCircle2 className="w-3 h-3 text-indigo-400" /> Full Name
                                        </label>
                                        <div className="w-full px-4 py-3 bg-white/2 border border-white/5 rounded-xl font-bold text-slate-200 text-sm">
                                            {teacher?.teacherName || "—"}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                            <KeyRound className="w-3 h-3 text-indigo-400" /> Teacher ID
                                        </label>
                                        <div className="w-full px-4 py-3 bg-white/2 border border-white/5 rounded-xl font-mono text-xs text-indigo-400">
                                            {teacher?.teacherId || "—"}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                            <Mail className="w-3 h-3 text-indigo-400" /> Email Address
                                        </label>
                                        <div className="w-full px-4 py-3 bg-white/2 border border-white/5 rounded-xl font-bold text-slate-200 text-sm">
                                            {teacher?.teacherEmail || "—"}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                            <Phone className="w-3 h-3 text-indigo-400" /> Phone Number
                                        </label>
                                        <div className="w-full px-4 py-3 bg-white/2 border border-white/5 rounded-xl font-mono text-xs text-slate-400">
                                            {teacher?.teacherPhoneNumber || "—"}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Academic Information — READ ONLY */}
                            <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden shadow-xl">
                                <div className="p-6 border-b border-white/5 bg-white/2 flex items-center justify-between">
                                    <div className="flex items-center gap-2.5">
                                        <div className="p-2 bg-white/5 border border-white/10 rounded-lg text-amber-400">
                                            <Building2 className="w-4 h-4" />
                                        </div>
                                        <h3 className="text-xs font-black text-slate-200 uppercase tracking-widest">Academic Assignments</h3>
                                    </div>
                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                                        <Lock className="w-3 h-3 text-amber-400" />
                                        <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider">Admin Only</span>
                                    </div>
                                </div>
                                <div className="p-6 md:p-8 space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                            <Building2 className="w-3 h-3 text-amber-400" /> Department(s) Assigned
                                        </label>
                                        {departments.length > 0 ? (
                                            <div className="flex flex-wrap gap-2 px-4 py-3 bg-white/2 border border-white/5 rounded-xl min-h-[46px]">
                                                {departments.map(dept => (
                                                    <span key={dept} className="px-3 py-1 bg-indigo-500/20 border border-indigo-500/20 text-indigo-400 rounded-lg text-xs font-black">
                                                        {dept}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="w-full px-4 py-3 bg-white/2 border border-white/5 rounded-xl text-slate-500 text-xs">Not assigned</div>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                            <BookOpen className="w-3 h-3 text-amber-400" /> Teaching Subjects
                                        </label>
                                        {subjects.length > 0 ? (
                                            <div className="flex flex-wrap gap-2 px-4 py-3 bg-white/2 border border-white/5 rounded-xl min-h-[46px]">
                                                {subjects.map(sub => (
                                                    <span key={sub} className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 rounded-lg text-xs font-black">
                                                        {sub}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="w-full px-4 py-3 bg-white/2 border border-white/5 rounded-xl text-slate-500 text-xs">No subjects assigned</div>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Availability Status</label>
                                        <div className="w-full px-4 py-3 bg-white/2 border border-white/5 rounded-xl">
                                            <span className={`px-3 py-1 rounded-lg text-xs font-black uppercase ${teacher?.teacherAvailability === 'Available' ? 'bg-emerald-500/20 text-emerald-400' : teacher?.teacherAvailability === 'Busy' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-rose-500/20 text-rose-400'}`}>
                                                {teacher?.teacherAvailability || "—"}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl">
                                        <p className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                                            ℹ️ Academic assignments are managed by your administrator only. Contact admin for any changes.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Security Actions */}
                            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex items-center justify-between flex-wrap gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-indigo-600/10 border border-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-400">
                                        <ShieldCheck className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-slate-200 text-xs">Security Settings</h4>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Update your password</p>
                                    </div>
                                </div>
                                <button
                                    className="flex items-center gap-2 px-5 py-3 text-xs font-black text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/10 transition-colors cursor-pointer"
                                    onClick={() => navigate('/auth/changePassword')}
                                >
                                    <KeyRound size={14} />
                                    Change Password
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default TeacherProfile;
