import { useEffect, useState } from "react";
import { Pencil, KeyRound, ShieldCheck, Mail, Building2, UserCircle2, LayoutDashboard } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../../Components/Dashboard/Sidebar";
import ProfileNavbar from "./ProfileNavbar";
import ProfileCard from "./ProfileCard";

function Profile() {
    interface UserProfile {
        _id: string;
        instituteId: string;
        userName: string;
        instituteName: string;
        phoneNumber: string;
        email: string;
        role: string;
        createdAt: string; // Adjusted from Date object since localStorage returns string types
        updatedAt: string;
    }

    const navigate = useNavigate();
    const [user, setUser] = useState<UserProfile | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        const storedUser = localStorage.getItem('user') || null;
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        console.log(user)
    }, []);

    return (
        <div className="flex h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden">
            {/* Control Sidebar Element Navigation Node */}
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)}/>

            {/* Dashboard Workspace Main Frame */}
            <div className="flex-1 flex flex-col h-full overflow-y-auto custom-scrollbar">
                <ProfileNavbar onMenuToggle={() => setIsSidebarOpen(true)} content="Account Settings Panel" />

                <div className="p-6 md:p-10 max-w-400 w-full mx-auto space-y-10">
                    
                    {/* Header Heading Text Section */}
                    <div className="text-left space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-600/10">
                                <ShieldCheck className="w-5 h-5 text-white" />
                            </div>
                            <h1 className="text-3xl font-black text-white tracking-tight">
                                User <span className="text-indigo-400">Profile</span>
                            </h1>
                        </div>
                        <p className="text-slate-400 text-sm font-medium max-w-xl">
                            Manage your personal identification records, institutional details, and security configurations.
                        </p>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-8 items-start">
                        
                        {/* Profile Visualization Sticky Avatar Card Wrapper */}
                        {/* <div className="w-full lg:w-[380px] shrink-0 lg:sticky lg:top-6">
                            <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden shadow-xl">
                                <div className="h-24 bg-gradient-to-r from-indigo-600 to-purple-600 relative opacity-90" />
                                <div className="px-6 pb-8 -mt-12 relative z-10"> */}
                                    <ProfileCard />
                                {/* </div> */}
                            {/* </div> */}
                        {/* </div> */}

                        {/* Detailed Registration Configuration Data Area */}
                        <div className="flex-1 w-full space-y-6">
                            <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden shadow-xl">
                                
                                {/* Info Panel Sub-Header */}
                                <div className="p-6 border-b border-white/5 bg-white/2 flex items-center justify-between flex-wrap gap-4">
                                    <div className="flex items-center gap-2.5">
                                        <div className="p-2 bg-white/5 border border-white/10 rounded-lg text-indigo-400">
                                            <LayoutDashboard className="w-4 h-4" />
                                        </div>
                                        <h3 className="text-xs font-black text-slate-200 uppercase tracking-widest">Profile Details</h3>
                                    </div>
                                    
                                    <button className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all group cursor-pointer"onClick={() => navigate('/profile/edit')}>
                                        <Pencil size={12} className="group-hover:rotate-12 transition-transform text-indigo-400" />
                                        Update Profile
                                    </button>
                                </div>

                                {/* Form Read-Only Data Fields Grid */}
                                <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                            <UserCircle2 className="w-3 h-3 text-indigo-400" /> Full Name
                                        </label>
                                        <div className="w-full px-4 py-3 bg-white/2 border border-white/5 rounded-xl font-bold text-slate-200 text-sm">
                                            {user?.userName || "Not Configured"}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                            <Building2 className="w-3 h-3 text-indigo-400" /> Institute Name
                                        </label>
                                        <div className="w-full px-4 py-3 bg-white/2 border border-white/5 rounded-xl font-black text-indigo-400 text-sm">
                                            {user?.instituteName || "Not Configured"}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                            <Mail className="w-3 h-3 text-indigo-400" /> Email Address
                                        </label>
                                        <div className="w-full px-4 py-3 bg-white/2 border border-white/5 rounded-xl font-bold text-slate-200 text-sm">
                                            {user?.email || "Not Configured"}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                            <KeyRound className="w-3 h-3 text-indigo-400" /> Phone Number
                                        </label>
                                        <div className="w-full px-4 py-3 bg-white/2 border border-white/5 rounded-xl font-mono text-xs text-slate-400">
                                            {user?.phoneNumber || "Null Pointer Node"}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                            <KeyRound className="w-3 h-3 text-indigo-400" /> User Role
                                        </label>
                                        <div className="w-full px-4 py-3 bg-white/2 border border-white/5 rounded-xl font-mono text-xs text-slate-400">
                                            {user?.role || "Null Pointer Node"}
                                        </div>
                                    </div>
                                </div>

                                {/* Security Action Operations Area Footer */}
                                <div className="p-6 bg-white/2 border-t border-white/5">
                                    <button className="flex items-center gap-2 px-5 py-3 text-xs font-black text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/10 transition-colors cursor-pointer" onClick={()=>navigate('/auth/changePassword')}>
                                        <KeyRound size={14} />
                                        Change Password
                                    </button>
                                </div>
                            </div>
                            
                            {/* Standard Status Notice Layout Element */}
                            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 flex flex-wrap items-center justify-between gap-4">
                                <div className="flex items-center gap-3.5">
                                    <div className="w-10 h-10 bg-indigo-600/10 border border-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-400 shadow-sm">
                                        <ShieldCheck className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-slate-200 text-xs">Security System Protocol</h4>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Engine Compliance Sync Active</p>
                                    </div>
                                </div>
                                <div className="px-3 py-1 text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full">
                                    Active Account
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Profile;