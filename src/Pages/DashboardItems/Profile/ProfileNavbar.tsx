import { Menu, Search, Bell, Command, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

interface ProfileNavbarProps {
    onMenuToggle?: () => void;
    content: string;
}

function ProfileNavbar({ onMenuToggle, content }: ProfileNavbarProps) {
    interface User {
        adminName: string;
        email: string;
    }

    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    return (
        <div className="flex items-center justify-between w-full gap-4">
            
            {/* Left Context Group */}
            <div className="flex items-center gap-3 sm:gap-6 min-w-0">
                {/* Mobile Hamburger Trigger */}
                <button 
                    type="button"
                    onClick={onMenuToggle}
                    className="md:hidden p-2.5 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 shrink-0"
                >
                    <Menu size={18} />
                </button>

                {/* Global Command Search Bar - Responsive Hidden */}
                <div className="hidden xl:flex items-center gap-4 px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100 group focus-within:ring-2 focus-within:ring-indigo-100 transition-all shrink-0">
                    <Search className="w-4 h-4 text-slate-400" />
                    <input 
                        type="text" 
                        placeholder="Search matrix..." 
                        className="bg-transparent border-none outline-none text-xs font-bold text-slate-600 placeholder:text-slate-300 w-40"
                    />
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-white border border-slate-200 rounded-lg shadow-xs">
                        <Command className="w-3 h-3 text-slate-400" />
                        <span className="text-[10px] font-black text-slate-400">K</span>
                    </div>
                </div>

                <div className="h-8 w-[1px] bg-slate-200 hidden xl:block mx-1" />

                {/* Text Breadcrumb/Content Heading */}
                <div className="flex flex-col min-w-0">
                    <h2 className="text-xs sm:text-sm font-black text-slate-800 uppercase tracking-widest truncate max-w-[140px] sm:max-w-[260px] md:max-w-none">
                        {content}
                    </h2>
                    <div className="flex items-center gap-1.5 mt-0.5">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shrink-0" />
                        <span className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] truncate">
                            Operational Console
                        </span>
                    </div>
                </div>
            </div>

            {/* Right Control Profile Group */}
            <div className="flex items-center gap-3 sm:gap-6 shrink-0">
                
                {/* Notifications Alert Hub */}
                <div className="flex items-center">
                    <button type="button" className="p-2 sm:p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all relative">
                        <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                        <div className="absolute top-2 right-2 w-2 h-2 bg-indigo-600 rounded-full border-2 border-white" />
                    </button>
                </div>

                {/* Active Administrative Account Panel */}
                <button 
                    type="button"
                    onClick={() => navigate('/profile')} 
                    className="flex items-center gap-2 sm:gap-4 pl-2 sm:pl-4 pr-1.5 sm:pr-2 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl sm:rounded-2xl transition-all hover:shadow-md hover:shadow-slate-100 group cursor-pointer select-none"
                >
                    {/* Identity Metadata String Meta */}
                    <div className="text-right hidden md:block">
                        <p className="text-[11px] font-black text-slate-900 uppercase leading-none truncate max-w-[120px]">
                            {user?.userName || 'Authority'}
                        </p>
                        <p className="text-[9px] font-bold text-indigo-500 uppercase tracking-tighter mt-1">
                            {user?.role || 'Authorized'}
                        </p>
                    </div>

                    {/* Badge Initial Thumbnail */}
                    <div className="relative shrink-0">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-indigo-600 flex items-center justify-center font-black text-white text-xs sm:text-sm shadow-md shadow-indigo-100 group-hover:rotate-6 transition-transform">
                            {user?.userName ? user.userName.charAt(0).toUpperCase() : 'A'}
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
                    </div>
                </button>
            </div>
        </div>
    );
}

export default ProfileNavbar;