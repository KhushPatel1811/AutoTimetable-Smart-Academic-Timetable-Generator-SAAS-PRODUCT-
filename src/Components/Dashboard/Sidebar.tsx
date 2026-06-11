import {User, LayoutDashboard, Calendar, Users, BookOpen, DoorOpen, Layers, FileText, BarChart3, Settings, LogOut, X} from "lucide-react";

interface SidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
}

function Sidebar({ isOpen, onClose }: SidebarProps) {

    const storedUser = JSON.parse(localStorage.getItem("user")); // admin, teacher, student
    const role = storedUser?.role
    console.log(role)

        const menuItemsByRole = {
        Admin: [
            { icon: User, label: "Profile", href: "/profile" },
            { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
            { icon: Calendar, label: "Generate TimeTable", href: "/generate" },
            { icon: Users, label: "Teachers", href: "/teachers" },
            { icon: BookOpen, label: "Subjects", href: "/subjects" },
            { icon: DoorOpen, label: "Rooms", href: "/rooms" },
            { icon: Layers, label: "Divisions / Departments", href: "/departments" },
            { icon: FileText, label: "TimeTable", href: "/timetables" },
            { icon: BarChart3, label: "Reports", href: "/reports" },
            { icon: Settings, label: "Settings", href: "/settings" }
        ],

        Teacher: [
            { icon: User, label: "Profile", href: "/profile" },
            { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
            { icon: Calendar, label: "My Availability", href: "/availability" },
            { icon: FileText, label: "My Timetable", href: "/my-timetable" }
        ],

        Student: [
            { icon: User, label: "Profile", href: "/profile" },
            { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
            { icon: Users, label: "Teacher Availability", href: "/teacher-availability" },
            { icon: FileText, label: "My Timetable", href: "/my-timetable" }
        ]
    };

    const menuItems = menuItemsByRole[role as keyof typeof menuItemsByRole] || []
    console.log(menuItems)

    return(
        <>
        {/* Mobile Overlay */}
        {isOpen && (
            <div 
                className="fixed top-0 h-screen inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden transition-opacity" 
                onClick={onClose}
            />
        )}

        <aside className={`
            bg-purple-950 w-70 fixed md:sticky top-0 h-screen z-50 transition-transform duration-300 ease-in-out flex flex-col shadow-2xl md:shadow-none
            ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
            <div className="flex border-b border-gray-500 pb-12 pt-4 pl-3 justify-between items-start">        
                <div className="flex">
                    <div className="bg-purple-600 m-2 p-2 rounded-xl shadow-[0_0_10px_rgba(126,34,206,0.5)]">
                        <Calendar stroke="white" size={30} />
                    </div>

                    <div className="text-xl text-white font-bold mt-2 ml-2">
                        AutoTimeTable
                        <br />
                        <div className="text-gray-200 font-normal text-sm">
                            Smart Scheduling
                        </div>
                    </div>
                </div>

                {/* Mobile Close Button */}
                <button onClick={onClose} className="md:hidden p-4 text-white hover:bg-purple-900/50 rounded-bl-xl transition-colors">
                    <X size={24} />
                </button>
            </div>

            <nav className="flex flex-col text-white mt-5 border-b border-gray-500 pb-5 overflow-y-auto max-h-[calc(100vh-250px)] [scrollbar-thin] [scrollbar-color:#4b2185_transparent]">
                {
                    menuItems.map((item)=>{
                        const Icon = item.icon
                        const isActive: boolean = window.location.pathname === item.href
                        return (
                            <a href={item.href} key={item.label} className={`flex m-2 p-2 hover:bg-linear-to-br from-blue-400 to-purple-400 hover:rounded-xl transition-all duration-200 ${isActive ? 'bg-linear-to-br from-blue-400 to-purple-400 rounded-xl' : '' }`}>
                                <Icon size={20} />
                                <span className="ml-2.5">{item.label}</span>
                            </a>
                        )
                    })
                }
            </nav>

            <div className="text-white mt-auto p-2">
                <button className={`flex p-2 w-full hover:bg-linear-to-br from-blue-400 to-purple-400 hover:rounded-xl cursor-pointer transition-all mb-7`}>
                    <LogOut stroke="white" size={20}/>
                    <span className="ml-2.5">LogOut</span>
                </button>
            </div>
        </aside>
        </>
    )
}

export default Sidebar;