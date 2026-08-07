import { Calendar, User, Bell, GraduationCap, ChevronRight } from "lucide-react";
import Sidebar from "../../Components/Dashboard/Sidebar";
import ProfileNavbar from "../DashboardItems/Profile/ProfileNavbar";
import { ToastContainer } from "react-toastify";
import { useNavigate } from "react-router";
import { useEffect, useState } from "react";

function TeacherDashboard() {
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const handleMenuToggle = () => setIsSidebarOpen(prev => !prev);
    const handleSidebarClose = () => setIsSidebarOpen(false);

    useEffect(() => {
        const stored = localStorage.getItem("user");
        if (stored) setUser(JSON.parse(stored));
    }, []);

    const quickLinks = [
        {
            icon: Calendar,
            title: "My Timetable",
            description: "View your weekly class schedule",
            href: "/teacher/my-timetable",
            color: "from-indigo-600 to-indigo-500",
            shadow: "shadow-indigo-100",
        },
        {
            icon: User,
            title: "My Profile",
            description: "View your academic profile details",
            href: "/teacher/profile",
            color: "from-emerald-600 to-emerald-500",
            shadow: "shadow-emerald-100",
        },
        {
            icon: Bell,
            title: "Notifications",
            description: "Stay updated with institute announcements",
            href: "/notifications",
            color: "from-amber-600 to-amber-500",
            shadow: "shadow-amber-100",
        },
    ];

    return (
        <div className="flex h-screen w-screen overflow-hidden bg-slate-50">
            <Sidebar isOpen={isSidebarOpen} onClose={handleSidebarClose} />

            <div className="flex-1 flex flex-col h-full overflow-y-auto animate-page">
                <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 py-4">
                    <ProfileNavbar content="Teacher Dashboard" onMenuToggle={handleMenuToggle} />
                </div>
                <ToastContainer position="top-right" autoClose={2000} />

                <main className="p-8 max-w-5xl w-full mx-auto space-y-10">
                    {/* WELCOME HERO */}
                    <div className="bg-linear-to-r from-indigo-600 to-indigo-500 rounded-[2.5rem] p-10 shadow-2xl shadow-indigo-100 border border-white/10 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -mr-24 -mt-24 group-hover:scale-110 transition-transform duration-700" />
                        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6">
                            <div className="p-5 bg-white/20 backdrop-blur-2xl rounded-4xl shadow-inner border border-white/30">
                                <GraduationCap className="w-10 h-10 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight">
                                    Welcome, {user?.userName || "Teacher"}
                                </h1>
                                <p className="text-indigo-100 font-bold text-sm uppercase tracking-widest opacity-80 mt-2">
                                    {user?.instituteName || "Your Institute"} • Teacher Portal
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* QUICK ACCESS */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="h-6 w-1.5 bg-indigo-600 rounded-full shadow-[0_0_10px_rgba(79,70,229,0.3)]" />
                            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Quick Access</h3>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            {quickLinks.map((item, index) => {
                                const Icon = item.icon;
                                return (
                                    <button
                                        key={index}
                                        onClick={() => navigate(item.href)}
                                        className="premium-card p-6! flex items-center gap-5 group hover:-translate-y-1 transition-all duration-300 text-left cursor-pointer"
                                    >
                                        <div className={`flex items-center justify-center w-14 h-14 rounded-3xl bg-linear-to-br ${item.color} ${item.shadow} shadow-lg shrink-0 group-hover:rotate-6 transition-transform`}>
                                            <Icon size={24} stroke="white" strokeWidth={2.5} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-black text-slate-800 text-sm">{item.title}</p>
                                            <p className="text-[10px] text-slate-400 font-bold mt-0.5">{item.description}</p>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
                                    </button>
                                );
                            })}
                        </div>
                    </section>

                    {/* INFO NOTICE */}
                    <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6">
                        <p className="text-xs font-black text-indigo-600 uppercase tracking-widest mb-2">Portal Access</p>
                        <p className="text-sm text-slate-600 font-medium">
                            Your timetable is automatically derived from the institute's saved schedule. Contact your administrator for changes to your department assignments, subjects, or availability.
                        </p>
                    </div>
                </main>
            </div>
        </div>
    );
}

export default TeacherDashboard;
