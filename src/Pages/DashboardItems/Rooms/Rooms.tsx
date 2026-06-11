import { useEffect, useState } from "react"
import {Building2, CircleCheck, LayoutGrid, LockKeyhole, UserRound, Users, Wrench, RefreshCcw, Search} from 'lucide-react'
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

    interface Rooms {
        roomName: string,
        roomId: string,
        roomType: string,
        roomStatus: string,
        departmentName: string
    }

    
    
    //! Data Storing States
    const [isSideBarOpen, setIsSideBarOpen] = useState<boolean>(true)
    const [departmentData, setDepartmentData] = useState<Department[] | null>([])
    const [roomData, setRoomData] = useState<Rooms[]>([])
    
    
    const roomsCard = [
        {icon: LayoutGrid, title: 'Total Rooms', count:roomData.length || 0, label:'All registered Spaces', color:'from-purple-500 to-indigo-500'},
        {icon: CircleCheck, title: 'Available Rooms', count:roomData.filter(t=> t.roomStatus === 'Available').length || 0, label:'Ready For Allocation', color:'from-green-500 to-emerald-500'},
        {icon: LockKeyhole, title: 'Occupied Rooms', count:roomData.filter(t=> t.roomStatus === 'Occupied').length || 0, label:'Active Lecture In Progress', color:'from-orange-500 to-amber-500'},
        {icon: Wrench, title:'Rooms Under Maintenance', count:roomData.filter(t=> t.roomStatus === 'Under Maintenance').length || 0, label:'Temporarily Not Available', color:'from-pink-500 to-rose-500'}
    ]
    
    
    //! Search Filters State
    const [search, setSearch] = useState<string | null>()
    const [departmentFilter, setDepartmentFilter] = useState<string | null>(null)
    const [availabilityFilter, setAvailabilityFilter] = useState<string | null>(null)

    useEffect(()=>{
        async function fetchData() {

            try {
                const responseDepartment = await axios.get('http://localhost:1000/departments')
                console.log('DEPARTMENT DATA:', responseDepartment.data)
                setDepartmentData(responseDepartment.data?.department)


                const responseRoom = await axios.get('http://localhost:1000/rooms', {
                    params: {search, departmentFilter, availabilityFilter}
                })
                console.log('ROOM DATA:', responseRoom.data)
                setRoomData(responseRoom.data?.rooms)
                
            }
            catch(err: any) {
                console.log('Error Occurred:', err)
                console.log('Response:', err.response?.data?.message);
                console.log('Status:', err.response?.status);
                toast.error(err.response?.data?.message || 'Error Occurred')
            }
        }
        fetchData()
    },[search, departmentFilter, availabilityFilter])


    function clearFilter() {
        setDepartmentFilter('')
        setAvailabilityFilter('')
    }

    async function deleteRoomData(roomId: string){
        const permission = confirm('Do You Really Want To Delete Room?')

        if(permission) { 
            try {
                const response = await axios.delete(`http://localhost:1000/rooms/delete/${roomId}`)
                
                if(response) {
                    toast.success('Room Deleted Successfully')

                    setTimeout(()=>{
                        window.location.reload()
                    },3000)
                }
            }
            catch(err: any) {
                console.log('Error Occurred:', err)
                console.log('Response:', err.response?.data?.message);
                console.log('Status:', err.response?.status);
                toast.error(err.response?.data?.message || 'Room Not Deleted Successfully')
            }
        }
    }

    return(
        <>
            <div className="flex h-screen w-screen bg-gray-50 overflow-hidden">
                <div className="h-full shrink-0"> 
                    <Sidebar isOpen={isSideBarOpen} onClose={()=>setIsSideBarOpen(false)} />
                </div>

                <div className="flex flex-1 flex-col h-full overflow-y-auto">
                    <div className="border-b border-gray-200 bg-white">
                        <ProfileNavbar content="Rooms List Page" />
                        <ToastContainer position="top-right" autoClose={2000} />
                    </div>

                    <div className="p-4 space-y-6 max-w-400 w-full mx-auto">
                        {/* HEADER BANNER */}
                        <div className="bg-linear-to-r from-blue-500 via-purple-500 to-pink-500 min-h-24 rounded-2xl p-6 flex items-center shadow-sm">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full gap-4">
                                <div className="flex items-center">
                                    <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-white/20 backdrop-blur-md shadow-lg shrink-0">
                                        <Users stroke="white" strokeWidth={2} size={28} />
                                    </div>
                                    <div className="ml-4">
                                        <h1 className="text-white text-xl sm:text-2xl font-bold tracking-tight">Rooms Management</h1>
                                        <p className="text-white/80 text-xs sm:text-sm">Manage Rooms In Your Institute</p>
                                    </div>
                                </div>
                                <button 
                                    className="bg-white px-5 py-2.5 rounded-xl font-bold text-gray-900 text-sm w-full sm:w-auto shadow-md hover:bg-gray-50 transition active:scale-95 cursor-pointer shrink-0" 
                                    onClick={() => navigate('/rooms/add')}>
                                    + Add Room
                                </button>  
                            </div>
                        </div>


                        {/* Rooms Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {
                                roomsCard.map((room, index)=>{
                                    const Icon = room.icon

                                    return(
                                        <div key={index} className="bg-white border border-gray-200 p-5 rounded-2xl flex items-center justify-between gap-4 shadow-xs">
                                            <div className={`flex items-center justify-center size-14 rounded-xl bg-linear-to-br ${room.color} shrink-0`}>
                                                <Icon size={30} stroke="white" strokeWidth={2}/>
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <h1 className="text-gray-500 text-xs font-medium uppercase tracking-wider">{room.label}</h1>
                                                <div className="text-gray-700 text-xl font-bold my-0.5">{room.count}</div>
                                                <div className="text-gray-400 text-xs">{room.title}</div>
                                            </div>
                                        </div>
                                    )
                                })
                            }
                        </div>



                        {/* Search Filter Section */}
                    <main>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
                            <div className="flex items-center gap-2 border border-gray-300 rounded-xl px-3 py-2 focus-within:border-blue-500 bg-white">
                                <Search size={18} className="text-gray-400 shrink-0" />
                                <input type="text" className="w-full outline-none text-sm bg-transparent" onChange={(e)=>setSearch(e.target.value)} placeholder="Search Name or ID..." />
                            </div>

                            <div className="flex items-center gap-2 border border-gray-300 rounded-xl px-3 py-2 focus-within:border-blue-500 bg-white">
                                <Building2 size={18} className="text-gray-400 shrink-0" />
                                <select className="w-full outline-none text-sm bg-transparent cursor-pointer" onChange={(e)=>setDepartmentFilter(e.target.value)}>
                                    <option value="">All Departments</option>
                                    {
                                        departmentData != null &&
                                        departmentData.map((dept)=>(
                                            <>
                                                <option value={dept.departmentName}>{dept.departmentName}</option>
                                            </>
                                        ))
                                    }
                                </select>
                            </div>

                            <div className="flex items-center gap-2 border border-gray-300 rounded-xl px-3 py-2 focus-within:border-blue-500 bg-white">
                                <UserRound size={18} className="text-gray-400 shrink-0"/>
                                <select className="w-full outline-none text-sm bg-transparent cursor-pointer" onChange={(e)=>setAvailabilityFilter(e.target.value)}>
                                    <option value="">Select Availability</option>
                                    <option value="Available">Available</option>
                                    <option value="Occupied">Occupied</option>
                                    <option value="Under Maintenance">Under Maintenance</option>
                                </select>
                            </div>

                            <button className="flex items-center justify-center gap-2 border border-dashed border-gray-300 hover:border-gray-400 rounded-xl px-3 py-2 text-gray-600 bg-gray-50/50 hover:bg-gray-50 text-sm transition font-medium cursor-pointer" onClick={clearFilter}>
                                <RefreshCcw size={16} className="text-gray-500" />
                                <span>Clear Filters</span>
                            </button>
                        </div>
                    </main>


                    {/* Rooms List Table */}
                    <div className="bg-white border border-gray-200 rounded-2xl shadow-xs overflow-hidden">
                        <div className="w-full overflow-x-auto scrollbar-thin">
                            <table className="w-full text-left border-collapse min-w-175">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-200 text-gray-700 text-xs uppercase font-semibold tracking-wider">
                                        <th className="p-4">Room Name</th>
                                        <th className="p-4">Room ID</th>
                                        <th className="p-4">Room Type</th>
                                        <th className="p-4">Room Status</th>
                                        <th className="p-4">Department</th>
                                        <th className="p-4">Actions</th>
                                    </tr>
                                </thead>

                                <tbody className="text-sm text-gray-600">
                                    {roomData != null && roomData.map((room, index) => (
                                        <tr key={index} className="hover:bg-gray-50/70 transition-colors">
                                            <td className="p-4 font-medium text-gray-900">{room.roomName}</td>
                                            <td className="p-4 font-mono text-xs text-gray-500">{room.roomId}</td>
                                            <td className="p-4 max-w-45">{room.roomType}</td>
                                            <td className="p-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                                                    room.roomStatus === 'Available' ? 'bg-green-50 text-green-700 border-green-100' :
                                                    room.roomStatus === 'Occupied' ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-red-50 text-red-700 border-red-100'
                                                }`}>
                                                    {room.roomStatus}
                                                </span>
                                            </td>
                                            <td className="p-4">{room.departmentName}</td>
                                            <td className="p-4 text-right whitespace-nowrap">
                                                <div className="inline-flex items-center gap-2">
                                                    <button className="text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer" onClick={() => navigate(`/rooms/edit/${room.roomId}`)}>Edit</button>
                                                    <button className="text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer" onClick={()=>deleteRoomData(`${room.roomId}`)}>Delete</button>
                                                </div>
                                            </td>
                                        </tr>   
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    </div>
                </div>    
            </div>
        </>
    )
}

export default Rooms