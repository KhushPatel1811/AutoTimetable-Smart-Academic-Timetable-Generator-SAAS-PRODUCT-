import { useEffect, useState } from "react"
import { Building2, CircleCheck, LayoutGrid, LockKeyhole, Wrench, RefreshCcw, Search, Filter, Home } from 'lucide-react'
import Sidebar from "../../../Components/Dashboard/Sidebar"
import ProfileNavbar from "../Profile/ProfileNavbar"
import { useNavigate } from "react-router"
import axios from "axios"
import { toast, ToastContainer } from "react-toastify"

function Rooms() {
    const navigate = useNavigate()

    interface Department {
        departmentName: string
    }

    interface Room {
        roomName: string,
        roomId: string,
        roomType: string,
        roomStatus: string,
        departmentName: string
    }

    const [roomData, setRoomData] = useState<Room[]>([])
    const [departmentData, setDepartmentData] = useState<Department[] | null>([])
    
    const [search, setSearch] = useState('')
    const [departmentFilter, setDepartmentFilter] = useState('')
    const [availabilityFilter, setAvailabilityFilter] = useState('')

    useEffect(() => {
        async function fetchData() {
            try {
                const responseDepartment = await axios.get('http://localhost:1000/departments')
                setDepartmentData(responseDepartment.data?.department)

                const responseRoom = await axios.get('http://localhost:1000/rooms', {
                    params: { search, departmentFilter, availabilityFilter }
                })
                setRoomData(responseRoom.data?.rooms)
            }
            catch(err: any) {
                console.log('Error Occurred:', err)
            }
        }
        fetchData()
    }, [search, departmentFilter, availabilityFilter])

    const stats = [
        { icon: LayoutGrid, title: 'Total Rooms', count: roomData.length || 0, color: 'from-indigo-600 to-indigo-500', shadow: 'shadow-indigo-100' },
        { icon: CircleCheck, title: 'Available', count: roomData.filter(t => t.roomStatus === 'Available').length || 0, color: 'from-emerald-600 to-emerald-500', shadow: 'shadow-emerald-100' },
        { icon: LockKeyhole, title: 'Occupied', count: roomData.filter(t => t.roomStatus === 'Occupied').length || 0, color: 'from-amber-600 to-amber-500', shadow: 'shadow-amber-100' },
        { icon: Wrench, title: 'Maintenance', count: roomData.filter(t => t.roomStatus === 'Under Maintenance').length || 0, color: 'from-rose-600 to-rose-500', shadow: 'shadow-rose-100' }
    ]

    async function deleteRoom(id: string) {
        if(confirm('Are you sure you want to delete this room?')) { 
            try {
                await axios.delete(`http://localhost:1000/rooms/delete/${id}`)
                toast.success('Room deleted successfully')
                setTimeout(() => window.location.reload(), 2000)
            } catch(err: any) {
                toast.error('Failed to delete room')
            }
        }
    }

    return (
        <div className="flex h-screen w-screen bg-slate-50 overflow-hidden">
            <Sidebar />

            <div className="flex-1 flex flex-col h-full overflow-y-auto animate-page">
                <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                    <ProfileNavbar content="Room Management System" />
                    <ToastContainer position="top-right" autoClose={2000} />
                </div>

                <div className="p-8 max-w-[1600px] w-full mx-auto space-y-10">
                    {/* Hero Banner */}
                    <div className="bg-linear-to-r from-indigo-600 to-indigo-500 rounded-[2.5rem] p-10 shadow-2xl shadow-indigo-100 flex flex-col md:flex-row items-center justify-between gap-8 border border-white/10 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -mr-32 -mt-32 group-hover:scale-110 transition-transform duration-700" />
                        
                        <div className="flex items-center space-x-8 relative z-10">
                            <div className="p-6 bg-white/20 backdrop-blur-2xl rounded-[2rem] shadow-inner border border-white/30">
                                <Home className="w-10 h-10 text-white" />
                            </div>
                            <div>
                                <h1 className="text-4xl font-black text-white tracking-tight">Room Inventory</h1>
                                <p className="text-indigo-100 font-bold text-sm tracking-widest opacity-80 uppercase mt-1">Manage classrooms, labs, and facilities</p>
                            </div>
                        </div>

                        <button 
                            className="bg-white px-10 py-5 rounded-2xl font-black text-indigo-600 text-sm shadow-2xl hover:shadow-indigo-200 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer relative z-10 uppercase tracking-[0.2em]" 
                            onClick={() => navigate('/rooms/add')}>
                            + Add New Room
                        </button>  
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {stats.map((item, index) => (
                            <div key={index} className="premium-card !p-6 flex items-center gap-6 group hover:-translate-y-1 transition-all duration-300">
                                <div className={`flex items-center justify-center w-16 h-16 rounded-[1.5rem] bg-linear-to-br ${item.color} ${item.shadow} shadow-lg shrink-0 group-hover:rotate-6 transition-transform`}>
                                    <item.icon size={28} stroke="white" strokeWidth={2.5} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.title}</p>
                                    <h4 className="text-3xl font-black text-slate-900 mt-0.5">{item.count}</h4>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Filter Bar */}
                    <div className="premium-card !p-4 grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-50/50">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                            <input type="text" className="input-box !py-3 !pl-11 !bg-white" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by room name or ID..." />
                        </div>

                        <div className="relative group">
                            <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors pointer-events-none" />
                            <select className="input-box !py-3 !pl-11 !bg-white cursor-pointer appearance-none" value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)}>
                                <option value="">All Departments</option>
                                {departmentData?.map(dept => <option key={dept.departmentName} value={dept.departmentName}>{dept.departmentName}</option>)}
                            </select>
                        </div>

                        <div className="relative group">
                            <LayoutGrid className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors pointer-events-none" />
                            <select className="input-box !py-3 !pl-11 !bg-white cursor-pointer appearance-none" value={availabilityFilter} onChange={(e) => setAvailabilityFilter(e.target.value)}>
                                <option value="">All Statuses</option>
                                <option value="Available">Available</option>
                                <option value="Occupied">Occupied</option>
                                <option value="Under Maintenance">Maintenance</option>
                            </select>
                        </div>

                        <button className="secondary-btn w-full !py-3 flex items-center justify-center gap-2 group" onClick={() => { setSearch(''); setDepartmentFilter(''); setAvailabilityFilter(''); }}>
                            <RefreshCcw size={16} className="group-hover:rotate-180 transition-transform duration-500" />
                            Reset Filters
                        </button>
                    </div>

                    {/* Room Table */}
                    <div className="premium-card !p-0 overflow-hidden">
                        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                                    <Filter className="w-4 h-4" />
                                </div>
                                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Active Room List</h3>
                            </div>
                            <div className="badge-indigo">Verified List</div>
                        </div>

                        <div className="overflow-x-auto custom-scrollbar">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                        <th className="p-8">Room Info</th>
                                        <th className="p-8">Type</th>
                                        <th className="p-8">Department</th>
                                        <th className="p-8">Status</th>
                                        <th className="p-8 text-right">Actions</th>
                                    </tr>
                                </thead>

                                <tbody className="text-sm">
                                    {roomData?.map((room, index) => {
                                        const isMaintenance = room.roomStatus === 'Under Maintenance';
                                        
                                        return (
                                            <tr 
                                                key={index} 
                                                className={`border-b border-slate-50 last:border-none transition-colors hover:bg-slate-50/50
                                                    ${isMaintenance ? 'bg-rose-50/20' : ''}`}
                                            >
                                                <td className="p-8">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center font-black text-slate-400">
                                                            {room.roomName.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <div className="font-black text-slate-800 text-base">{room.roomName}</div>
                                                            <div className="text-[10px] font-mono text-indigo-500 uppercase font-black">{room.roomId}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-8">
                                                    <div className="badge-indigo !px-4 !py-2 inline-flex items-center gap-2">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-slate-400 opacity-40" />
                                                        {room.roomType}
                                                    </div>
                                                </td>
                                                <td className="p-8">
                                                    <span className="px-3 py-1.5 bg-slate-100 text-slate-600 font-black text-[10px] rounded-lg tracking-widest uppercase">
                                                        {room.departmentName}
                                                    </span>
                                                </td>
                                                <td className="p-8">
                                                    <div className={`px-4 py-2 inline-flex items-center gap-2 rounded-xl text-xs font-black tracking-wide uppercase
                                                        ${room.roomStatus === 'Available' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 
                                                          room.roomStatus === 'Occupied' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 
                                                          'bg-rose-50 text-rose-700 border border-rose-200'}
                                                    `}>
                                                        <div className={`w-1.5 h-1.5 rounded-full animate-pulse
                                                            ${room.roomStatus === 'Available' ? 'bg-emerald-500' : 
                                                              room.roomStatus === 'Occupied' ? 'bg-indigo-500' : 
                                                              'bg-rose-500 shadow-xs shadow-rose-200'}
                                                        `} />
                                                        {room.roomStatus}
                                                    </div>
                                                </td>
                                                <td className="p-8 text-right w-48">
                                                    <div className="flex items-center justify-end gap-3 transition-all">
                                                        <button className="secondary-btn !p-3" onClick={() => navigate(`/rooms/edit/${room.roomId}`)}>
                                                            Edit
                                                        </button>
                                                        <button className="delete-btn" onClick={() => deleteRoom(room.roomId)}>
                                                            Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>  
                            </table>
                            {(!roomData || roomData.length === 0) && (
                                <div className="p-32 text-center space-y-4 opacity-30 grayscale">
                                    <LayoutGrid className="w-16 h-16 mx-auto text-slate-200" />
                                    <p className="font-black uppercase tracking-[0.4em] text-xs">No Rooms Found</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Rooms;