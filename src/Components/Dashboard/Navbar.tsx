import React, { useEffect, useState } from "react";
import axios from 'axios';
import { Asterisk, Circle, School } from 'lucide-react';

interface UserProfileData {
    adminName: string;
    instituteName: string;
    email: string;
    role: string;
    phoneNumber: string;
}

function Navbar() {
    const [userData, setUserData] = useState<UserProfileData | null>(null);
    const [time, setTime] = useState<string>('');

    const days: string[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months: string[] = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    useEffect(() => {
        // Set initial clock time instantly on component mount
        setTime(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }));
        
        async function fetchDashboardProfile() {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`http://localhost:1000/dashboard`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                
                // Expecting response.data to contain user profile details
                if (response.data && response.data.user) {
                    setUserData(response.data.user);
                } else if (response.data) {
                    setUserData(response.data);
                }
            }
            catch(err: any) {
                console.error('Failed to retrieve secure dashboard telemetry context:', err);
            }
        }

        fetchDashboardProfile();

        const timer = setInterval(() => {
            setTime(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }));
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const currentDate = new Date();

    return (
        <nav className="w-full">
            {/* Premium Dark Glassmorphism Banner Card Container */}
            <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border border-white/10 rounded-2xl p-6 md:p-8 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
                
                {/* Meta-Badge Sub-Row */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 pb-4">
                    <div className="flex items-center gap-2">
                        <Asterisk className="text-indigo-400 animate-spin-slow" size={18} />
                        <span className="text-xs font-black uppercase tracking-widest text-indigo-300">
                            Dashboard Workspace
                        </span>
                    </div>
                    
                    {/* Optional Institutional Badge */}
                    {userData?.instituteName && (
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300 text-xs font-bold">
                            <School size={12} className="text-indigo-400" />
                            {userData.instituteName}
                        </div>
                    )}
                </div>

                {/* Primary Welcome Heading Text Structure */}
                <div className="mt-5 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                        <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                            Hello, {userData?.userName || 'Academic Lead'}
                        </h1>
                        <span className="text-2xl md:text-3xl animate-bounce duration-1000">👋</span>
                    </div>
                    <p className="text-slate-400 text-sm font-medium max-w-xl">
                        Ready to optimize your department coordinates, room schedules, and timetables today?
                    </p>
                </div>

                {/* Live System Time / Clock Data Footer Row */}
                <div className="flex flex-wrap items-center justify-between gap-4 mt-6 pt-4 border-t border-white/5 text-xs md:text-sm text-slate-400 font-medium">
                    <div className="flex items-center gap-2">
                        <Circle fill="#34d399" stroke="#34d399" size={8} className="animate-pulse" />
                        <span className="tracking-wide text-slate-300">
                            {days[currentDate.getDay()]}, {months[currentDate.getMonth()]} {currentDate.getDate()}, {currentDate.getFullYear()}
                        </span>
                    </div>

                    <div className="font-mono bg-white/5 border border-white/5 px-3 py-1.5 rounded-xl text-indigo-300 font-bold shadow-inner">
                        {time || "00:00 AM"}
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;