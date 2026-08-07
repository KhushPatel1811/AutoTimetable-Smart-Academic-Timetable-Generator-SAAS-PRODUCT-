import {
    User, LayoutDashboard, Calendar, Users, BookOpen, DoorOpen,
    Layers, LogOut, X, ShieldCheck, GraduationCap, BookMarked, ClipboardList
} from "lucide-react";
import { useLocation, useNavigate, Link } from "react-router-dom";

interface SidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
}

function Sidebar({ isOpen, onClose }: SidebarProps) {
    const navigate   = useNavigate();
    const location   = useLocation();
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    const role       = storedUser?.role      || "Admin";
    const isFounder  = storedUser?.isFounder === true;
    const userName   = storedUser?.userName  || "User";

    // ── Admin menu (no Notifications — lives in the bell icon instead) ──
    const adminMenuItems = [
        { icon: LayoutDashboard, label: "Dashboard",          href: "/dashboard" },
        { icon: Calendar,        label: "Generate Timetable", href: "/generate" },
        { icon: Users,           label: "Teachers",           href: "/teachers" },
        { icon: BookOpen,        label: "Subjects",           href: "/subjects" },
        { icon: DoorOpen,        label: "Rooms",              href: "/rooms" },
        { icon: Layers,          label: "Departments",        href: "/departments" },
        { icon: BookMarked,      label: "Timetables",         href: "/timetables" },
        { icon: GraduationCap,   label: "Teacher Timetables", href: "/teacher-timetables" },
        { icon: User,            label: "Profile",            href: "/profile" },
        // Founder-only
        ...(isFounder ? [{ icon: ClipboardList, label: "Activity Logs", href: "/activity-logs" }] : []),
    ];

    // ── Teacher menu (no Notifications — lives in the bell icon instead) ──
    const teacherMenuItems = [
        { icon: LayoutDashboard, label: "Dashboard",    href: "/teacher/dashboard" },
        { icon: Calendar,        label: "My Timetable", href: "/teacher/my-timetable" },
        { icon: User,            label: "My Profile",   href: "/teacher/profile" },
    ];

    const menuItems = role === "Teacher" ? teacherMenuItems : adminMenuItems;

    const handleLogout = () => {
        localStorage.clear();
        navigate("/auth/login");
    };

    return (
        <>
            {/* Mobile overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-40 md:hidden cursor-pointer"
                    onClick={onClose}
                />
            )}

            <aside
                className={`bg-slate-950 w-72 fixed md:sticky top-0 h-screen z-[100] transition-all duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] flex flex-col border-r border-white/5
                    ${isOpen ? "translate-x-0 pointer-events-auto" : "-translate-x-full pointer-events-none md:translate-x-0 md:pointer-events-auto"}`}
            >
                {/* Branding */}
                <div className="p-6 border-b border-white/5 relative group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-indigo-600/20 transition-all duration-1000" />
                    <div className="flex items-center gap-4 relative z-10 pr-10 md:pr-0">
                        <div className="p-3 bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-500/20 rotate-3 group-hover:rotate-0 transition-transform duration-500 shrink-0">
                            <ShieldCheck className="w-6 h-6 text-white" />
                        </div>
                        <div className="space-y-0.5 min-w-0">
                            <h2 className="text-white font-black tracking-tight text-lg leading-none truncate">
                                Infinite <span className="text-indigo-400">Scheduler</span>
                            </h2>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Campus Portal</p>
                        </div>
                    </div>
                    {/* Close button — clearly visible */}
                    <button
                        onClick={onClose}
                        aria-label="Close sidebar"
                        className="md:hidden absolute top-5 right-5 z-20 p-2 rounded-xl bg-white/10 border border-white/15 text-slate-300 hover:bg-rose-500/20 hover:text-rose-400 transition-all duration-200 cursor-pointer"
                    >
                        <X size={18} strokeWidth={2.5} />
                    </button>
                </div>

                {/* Nav links */}
                <nav className="flex-1 px-4 py-5 space-y-1 overflow-y-auto custom-scrollbar">
                    {menuItems.map((item) => {
                        const Icon     = item.icon;
                        const isActive =
                            location.pathname === item.href ||
                            (item.href !== "/dashboard" &&
                             item.href !== "/teacher/dashboard" &&
                             location.pathname.startsWith(item.href));

                        return (
                            <Link
                                to={item.href}
                                key={item.label}
                                onClick={onClose}
                                className={`flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-300 group cursor-pointer
                                    ${isActive
                                        ? "bg-indigo-600 text-white shadow-xl shadow-indigo-600/20"
                                        : "text-slate-400 hover:text-white hover:bg-white/5"}`}
                            >
                                <Icon size={18} className={`shrink-0 ${isActive ? "text-white" : "text-slate-500 group-hover:text-indigo-400"} transition-colors`} />
                                <span className="text-[11px] font-black uppercase tracking-widest">{item.label}</span>
                                {isActive && <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.8)]" />}
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div className="p-4 mt-auto border-t border-white/5">
                    <div className="bg-white/5 rounded-2xl p-4 border border-white/5 space-y-4">
                        <div className="flex items-center gap-3 px-1">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 border border-white/20 flex items-center justify-center font-black text-white text-xs shrink-0">
                                {userName.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[11px] font-black text-white truncate uppercase tracking-tight">{userName}</p>
                                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">{role} Access</p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl bg-white/5 hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 border border-transparent hover:border-rose-500/20 transition-all duration-300 group cursor-pointer"
                        >
                            <LogOut size={14} className="group-hover:-translate-x-0.5 transition-transform" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Sign Out</span>
                        </button>
                    </div>
                    <div className="text-center mt-4 flex items-center justify-center gap-2">
                        <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" />
                        <p className="text-[8px] font-black text-slate-600 uppercase tracking-[0.4em]">System Connected</p>
                    </div>
                </div>
            </aside>
        </>
    );
}

export default Sidebar;
