import React, { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";

const months: string[] = [
    'January', 'February', 'March', 'April', 'May', 'June', 
    'July', 'August', 'September', 'October', 'November', 'December'
];

function ProfileCard() {
    interface User {
        _id: string;
        adminName: string;
        instituteName: string;
        email: string;
        createdAt: string; // Updated to string since localStorage dates parse as ISO strings
    }

    const [user, setUser] = useState<User | null>(null);
    const [date, setDate] = useState<string>('');

    useEffect(() => {
        const storedUser = localStorage.getItem('user') || null;
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    useEffect(() => {
        if (!user?.createdAt) return;
        
        const createdAt = new Date(user.createdAt);
        const day = createdAt.getDate();
        const month = months[createdAt.getMonth()];
        const year = createdAt.getFullYear();
        setDate(`${day} ${month}, ${year}`);
    }, [user]);

    // Generate initials safely or fallback to placeholder
    const userInitial = user?.userName?.charAt(0)?.toUpperCase()+ user?.userName?.charAt(1)?.toUpperCase() || "?";

    return (
        <div className="w-full max-w-sm mx-auto flex flex-col bg-white/[0.02] border border-white/10 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-md">
            
            {/* Top Banner Accent Decoration */}
            <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 h-24 w-full opacity-80" />
            
            {/* Profile Avatar Container */}
            <div className="flex justify-center z-10 -mt-11">
                <div className="flex items-center justify-center bg-slate-900 border border-white/20 rounded-full w-22 h-22 text-3xl font-black text-indigo-400 shadow-xl select-none">
                    {userInitial}
                </div>
            </div>

            {/* Profile Information Block */}
            <div className="px-6 pb-6 pt-4 flex flex-col items-center text-center space-y-5">
                
                {/* Admin Name details */}
                <div className="space-y-1">
                    <h2 className="text-xl font-black text-white tracking-tight">
                        {user?.userName || "Loading profile..."}
                    </h2>
                </div>

                {/* Account Role Badge */}
                <div className="flex items-center gap-1.5 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-xs font-bold text-indigo-400">
                    <ShieldCheck size={14} />
                    <span>{user?.role}</span>
                </div>

                {/* Subtext Registration Metadata Footer */}
                <div className="w-full pt-4 border-t border-white/5 space-y-1">
                    <p className="text-xs font-bold text-slate-300 tracking-wide uppercase">
                        {user?.instituteName || "No Institute Data"}
                    </p>
                    {date && (
                        <p className="text-[10px] font-medium text-slate-500">
                            Registered: {date}
                        </p>
                    )}
                </div>
                
            </div>
        </div>
    );
}

export default ProfileCard;