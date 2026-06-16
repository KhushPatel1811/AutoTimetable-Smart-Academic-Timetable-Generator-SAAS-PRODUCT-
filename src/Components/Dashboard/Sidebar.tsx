import React from "react";
import { User, LayoutDashboard, Calendar, Users, BookOpen, DoorOpen, Layers, FileText, BarChart3, Settings, LogOut, X, ShieldCheck } from "lucide-react";
import { useLocation, useNavigate, Link } from "react-router-dom"; // Switched to Link to prevent full page reloads

interface SidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
}

function Sidebar({ isOpen, onClose }: SidebarProps) {
    const navigate = useNavigate();
    const location = useLocation();
    
    // Safety check parsing local storage profile elements
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    const role = storedUser?.role || "Admin"; 
    const userName = storedUser?.adminName || storedUser?.name || "User";

    // Cleaned up navigation mapping categories using clean, premium user-friendly naming protocols
    const menuItemsByRole = {
        Admin: [
            { icon: LayoutDashboard, label: "Overview", href: "/dashboard" },
            { icon: Calendar, label: "Generate Timetable", href: "/generate" },
            { icon: Users, label: "Faculty Members", href: "/teachers" },
            { icon: BookOpen, label: "Courses & Subjects", href: "/subjects" },
            { icon: DoorOpen, label: "Classrooms & Rooms", href: "/rooms" },
            { icon: Layers, label: "Departments", href: "/departments" },
            { icon: FileText, label: "All Timetables", href: "/timetables" },
            { icon: User, label: "Admin Profile", href: "/profile" },
            { icon: BarChart3, label: "Analytics & Reports", href: "/reports" },
            { icon: Settings, label: "System Settings", href: "/settings" }
        ],
        Teacher: [
            { icon: LayoutDashboard, label: "Overview", href: "/dashboard" },
            { icon: Calendar, label: "My Availability", href: "/availability" },
            { icon: FileText, label: "My Timetable", href: "/my-timetable" },
            { icon: User, label: "Teacher Profile", href: "/profile" },
        ],
        Student: [
            { icon: LayoutDashboard, label: "Overview", href: "/dashboard" },
            { icon: Users, label: "Faculty Directory", href: "/teacher-availability" },
            { icon: FileText, label: "Class Timetable", href: "/my-timetable" },
            { icon: User, label: "Student Profile", href: "/profile" },
        ]
    };

    const menuItems = menuItemsByRole[role as keyof typeof menuItemsByRole] || [];

    const handleLogout = () => {
        localStorage.clear();
        navigate('/auth/login');
    };

    return (
        <>
            {/* Mobile Overlay Background Panel */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-40 md:hidden transition-opacity duration-500" 
                    onClick={onClose}
                />
            )}

            {/* Sidebar Structural Frame Wrapper */}
            <aside className={`
                bg-slate-950 w-72 fixed md:sticky top-0 h-screen z-50 transition-all duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] flex flex-col border-r border-white/5
                ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                {/* Branding Core Section */}
                <div className="p-8 pb-10 border-b border-white/5 relative group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-indigo-600/20 transition-all duration-1000" />
                    
                    <div className="flex items-center gap-4 relative z-10">
                        <div className="p-3 bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-500/20 rotate-3 group-hover:rotate-0 transition-transform duration-500">
                            <ShieldCheck className="w-6 h-6 text-white" />
                        </div>
                        <div className="space-y-0.5">
                            <h2 className="text-white font-black tracking-tight text-lg leading-none">Infinite <span className="text-indigo-400">Scheduler</span></h2>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Campus Portal</p>
                        </div>
                    </div>

                    {/* Mobile Close Button */}
                    <button onClick={onClose} className="md:hidden absolute top-6 right-6 p-2 text-slate-500 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Primary Navigation Router Connections */}
                <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto custom-scrollbar">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.href || (item.href !== '/dashboard' && location.pathname.startsWith(item.href));
                        
                        return (
                            <Link 
                                to={item.href} 
                                key={item.label} 
                                onClick={onClose}
                                className={`flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-300 group
                                    ${isActive 
                                        ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' 
                                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <Icon size={18} className={`${isActive ? 'text-white' : 'text-slate-500 group-hover:text-indigo-400'} transition-colors`} />
                                <span className="text-[11px] font-black uppercase tracking-widest">{item.label}</span>
                                {isActive && <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.8)]" />}
                            </Link>
                        );
                    })}
                </nav>

                {/* User Profile Footer Card Area */}
                <div className="p-4 mt-auto border-t border-white/5 bg-slate-950">
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

                        {/* Standardized Sign-out Action element */}
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