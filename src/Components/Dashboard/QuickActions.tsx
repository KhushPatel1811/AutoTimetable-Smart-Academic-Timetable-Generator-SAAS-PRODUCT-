import React from "react";
import { CalendarPlus, UserPlus, BookPlus, DoorClosed, Eye, Zap } from "lucide-react";

function QuickActions() {
    const actions = [
        {
            icon: CalendarPlus,
            title: 'Generate Timetable',
            description: 'Create optimized schedules instantly.',
            color: 'from-indigo-500 to-purple-500',
            glow: 'group-hover:shadow-indigo-500/20',
            border: 'hover:border-indigo-500/30'
        },
        {
            icon: UserPlus,
            title: 'Add Teacher',
            description: 'Register new faculty profiles.',
            color: 'from-blue-500 to-cyan-500',
            glow: 'group-hover:shadow-blue-500/20',
            border: 'hover:border-blue-500/30'
        },
        {
            icon: BookPlus,
            title: 'Add Subject',
            description: 'Create new course curricula.',
            color: 'from-purple-500 to-pink-500',
            glow: 'group-hover:shadow-purple-500/20',
            border: 'hover:border-purple-500/30'
        },
        {
            icon: DoorClosed,
            title: 'Allocate Rooms',
            description: 'Manage classroom constraints.',
            color: 'from-green-500 to-emerald-500',
            glow: 'group-hover:shadow-green-500/20',
            border: 'hover:border-green-500/30'
        },
        {
            icon: Eye,
            title: 'View Timetable',
            description: 'Browse all active coordinates.',
            color: 'from-orange-500 to-amber-500',
            glow: 'group-hover:shadow-orange-500/20',
            border: 'hover:border-orange-500/30'
        }
    ];

    return (
        <div className="px-4 sm:px-6 md:px-3 mx-3 mt-8 space-y-6">
            
            {/* Component Header Label Row */}
            <div className="flex items-center gap-2.5 text-white font-black text-xs uppercase tracking-widest bg-white/5 w-fit px-4 py-2 rounded-xl border border-white/10 shadow-inner">
                <Zap stroke="#6366f1" fill="#6366f1" className="w-4 h-4 animate-pulse" />
                <span>Quick Actions</span>
            </div>

            {/* Fully Responsive Grid System Wrapper */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
                {actions.map((item, index) => {
                    const Icon = item.icon;

                    return (
                        <div 
                            key={index} 
                            className={`group relative bg-white/5 border border-white/10 rounded-2xl p-6 transition-all duration-300 hover:bg-white/10 hover:-translate-y-1 hover:shadow-2xl ${item.glow} ${item.border} cursor-pointer flex flex-col justify-between`}
                        >
                            {/* Icon Background Frame Wrapper */}
                            <div className="mb-5">
                                <div className={`bg-gradient-to-br ${item.color} w-fit rounded-xl p-3 shadow-lg group-hover:scale-110 transition-transform duration-500`}>
                                    <Icon className="w-6 h-6 text-white" />
                                </div>
                            </div>

                            {/* Text Content Block */}
                            <div className="space-y-1">
                                <h3 className="font-black text-sm text-white tracking-tight group-hover:text-indigo-400 transition-colors">
                                    {item.title}
                                </h3>
                                <p className="text-slate-400 text-xs font-medium leading-relaxed">
                                    {item.description}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default QuickActions;