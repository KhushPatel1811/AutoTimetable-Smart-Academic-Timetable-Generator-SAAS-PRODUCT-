import React, { useEffect, useState } from "react";
import { Users, BookOpen, DoorOpen, Layers, Calendar, Activity } from "lucide-react";
import axios from "axios";

function StatisticCards() {
    const [counts, setCounts] = useState({
        teachers: 0,
        subjects: 0,
        rooms: 0,
        departments: 0,
        timetables: 0
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                const config = {
                    headers: { Authorization: `Bearer ${token}` }
                };

                // Concurrent fetch request handling utilizing system token configurations
                const [t, s, r, d] = await Promise.all([
                    axios.get('http://localhost:1000/teachers', config),
                    axios.get('http://localhost:1000/subjects', config),
                    axios.get('http://localhost:1000/rooms', config),
                    axios.get('http://localhost:1000/departments', config)
                ]);

                setCounts({
                    teachers: t.data.teacher?.length || t.data?.length || 0,
                    subjects: s.data.subjects?.length || s.data?.length || 0,
                    rooms: r.data.rooms?.length || r.data?.length || 0,
                    departments: d.data.department?.length || d.data?.length || 0,
                    timetables: 1 // Baseline fallback generation count
                });
            } catch (err) {
                console.error("Dashboard statistics compilation failure:", err);
            }
        };
        fetchData();
    }, []);

    // Cleaned up presentation structures mapping cleanly to application architecture
    const stats = [
        { icon: Users, label: 'Total Faculty', count: counts.teachers, color: 'from-indigo-600 to-indigo-500', shadow: 'shadow-indigo-500/10', trend: 'Active' },
        { icon: BookOpen, label: 'Total Subjects', count: counts.subjects, color: 'from-emerald-600 to-emerald-500', shadow: 'shadow-emerald-500/10', trend: 'Verified' },
        { icon: DoorOpen, label: 'Classrooms', count: counts.rooms, color: 'from-amber-600 to-amber-500', shadow: 'shadow-amber-500/10', trend: 'Allocated' },
        { icon: Layers, label: 'Departments', count: counts.departments, color: 'from-rose-600 to-rose-500', shadow: 'shadow-rose-500/10', trend: 'Linked' },
        { icon: Calendar, label: 'Saved Schedules', count: counts.timetables, color: 'from-violet-600 to-violet-500', shadow: 'shadow-violet-500/10', trend: 'Up to date' }
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 px-4 sm:px-6 md:px-3 mx-3">
            {stats.map((item, index) => {
                const Icon = item.icon;
                return (
                    <div 
                        key={index} 
                        className="bg-white/5 border border-white/10 rounded-[2rem] p-6 group hover:-translate-y-1.5 transition-all duration-300 hover:bg-white/10 hover:border-indigo-500/20 shadow-xl"
                    >
                        <div className="flex flex-col h-full space-y-6">
                            {/* Graphic Header Block */}
                            <div className="flex justify-between items-start">
                                <div className={`flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${item.color} shadow-lg ${item.shadow} group-hover:rotate-6 transition-transform flex-shrink-0`}>
                                    <Icon size={22} className="text-white" strokeWidth={2.5} />
                                </div>
                                <div className="text-right space-y-1">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</p>
                                    <h4 className="text-3xl font-black text-white tracking-tight">{item.count}</h4>
                                </div>
                            </div>

                            {/* Activity Baseline Analytics Status Footer */}
                            <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                    <Activity className="w-3 h-3 text-emerald-400 animate-pulse" />
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">{item.trend}</span>
                                </div>
                                <div className="w-1.5 h-1.5 bg-white/10 rounded-full group-hover:bg-indigo-500 transition-colors duration-300" />
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export default StatisticCards;