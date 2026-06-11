import { Users, BookOpen, DoorOpen, Layers, Calendar, TrendingUp } from "lucide-react";


function StatisticCards() {
    const stats = [
        {icon: Users, label: 'Total Teachers', color:'from-blue-500 to-cyan-500', hover_color:'from-blue-100 to-cyan-100', shadow_color:'shadow-blue-500/30'},
        {icon: BookOpen, label: 'Total Subjects', color: 'from-purple-500 to-pink-500', hover_color: 'from-purple-100 to-pink-100', shadow_color:'shadow-purple-500/30'},
        {icon: DoorOpen, label: 'Total Rooms', color:'from-green-500 to-emerald-500', hover_color:'from-green-100 to-emerald-100', shadow_color: 'shadow-green-500/30'},
        {icon: Layers, label: 'Total Divisions', color:'from-orange-500 to-amber-500', hover_color:'from-orange-100 to-amber-100', shadow_color: 'shadow-orange-500/30'},
        {icon: Calendar, label: 'TimeTable Generated', color:'from-indigo-500 to-purple-500', hover_color:'from-indigo-100 to-purple-100', shadow_color: 'shadow-indigo-500/30'}
    ]
    return(
        <>
            <div className="flex flex-wrap">
                {
                    stats.map((item, index)=>{
                        const Icon = item.icon
                        
                        return(
                            <div key={index} className={`border border-gray-50 w-75 m-3 ml-5 mr-5 mt-5 p-4 h-40 rounded-xl hover:shadow-2xl ${item.shadow_color} hover:bg-linear-to-br ${item.hover_color} group`}>
                                <div className={`bg-linear-to-br ${item.color} p-4.5 w-fit rounded-xl group-hover:scale-110 transition-transform duration-600`}>
                                    <Icon stroke="white"/>
                                </div>

                                <div className="mt-8 text-gray-500">{item.label}</div>
                            </div>
                        )
                    })
                }
            </div>
        </>
    )
}

export default StatisticCards;