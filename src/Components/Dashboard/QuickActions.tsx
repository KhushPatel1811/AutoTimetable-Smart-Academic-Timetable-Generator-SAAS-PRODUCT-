import { CalendarPlus, UserPlus, BookPlus, DoorClosed, Eye, Zap } from "lucide-react";

function QuickActions() {
    const actions = [
        {
            icon: CalendarPlus,
            title: 'Generate New TimeTable',
            description: 'Create Optimized Schedule Instantly',
            color: 'from-indigo-500 to-purple-500',
            hover_color: 'from-indigo-100 to-purple-100',
            shadow: 'shadow-indigo-500/30'
        },
        {
            icon: UserPlus,
            title: 'Add Teacher',
            description: 'Register New Faculty Member',
            color: 'from-blue-500 to-cyan-500',
            hover_color: 'from-blue-100 to-cyan-100',
            shadow: 'shadow-blue-500/30'
        },
        {
            icon: BookPlus,
            title: 'Add Subject',
            description: 'Create new Course Entry',
            color: 'from-purple-500 to-pink-500',
            hover_color: 'from-purple-100 to-pink-100',
            shadow: 'shadow-purple-500/30'
        },
        {
            icon: DoorClosed,
            title: 'Allocate Rooms',
            description: 'Manage Classroom assignments',
            color: 'from-green-500 to-emerald-500',
            hover_color: 'from-green-100 to-emerald-100',
            shadow: 'shadow-green-500/30'
        },
        {
            icon: Eye,
            title: 'View TimeTable',
            description: 'Browse All Generated Schedules',
            color: 'from-orange-500 to-amber-500',
            hover_color: 'from-orange-100 to-amber-100',
            shadow: 'shadow-orange-500/30'
        }
    ]
    return(
        <>
            <div className="flex m-5 mt-8">
                <Zap stroke="indigo" />
                <span>Quick Actions</span>
            </div>

            <div className="flex flex-wrap -mt-5">
                {
                    actions.map((item, index) => {
                        const Icon = item.icon

                        return (
                            <div key={index} className={`border border-gray-50 w-80 rounded-xl m-5 p-7 hover:shadow-2xl ${item.shadow} backdrop-blur-sm hover:bg-linear-to-br ${item.hover_color} cursor-pointer group`}>
                                <div>
                                    <Icon className={`bg-linear-to-br ${item.color} w-fit rounded-xl p-2 group-hover:scale-110 transition-transform duration-600`} size={60} stroke='white' />
                                </div>

                                <div className="mt-4">
                                    <span className="font-bold text-sm">{item.title}</span>
                                    <div className="text-gray-500 text-xs">{item.description}</div>
                                </div>
                            </div>
                        )
                    })
                }
            </div>
        </>
    ) 
}

export default QuickActions;