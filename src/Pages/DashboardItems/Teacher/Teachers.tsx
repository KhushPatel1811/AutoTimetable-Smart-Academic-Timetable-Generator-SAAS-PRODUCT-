import { Users, CircleCheck, Clock4, Send, Search, Building2, UserRound, RefreshCcw } from "lucide-react";
import Sidebar from "../../../Components/Dashboard/Sidebar";
import { useEffect, useState } from "react";
import ProfileNavbar from "../Profile/ProfileNavbar";
import { useNavigate } from "react-router";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";

function Teachers() {
    interface User {
        adminName: string
    }
    
    interface Teacher {
        teacherId: string,
        teacherName: string,
        teacherEmail: string,
        teacherPhoneNumber: string,
        teacherDepartment: string,
        teacherAvailability: string,
        instituteName: string,
        instituteId: string,
        Subjects: {subjects: ''}[]
    }

    interface Department {
        departmentName: string   
    }

    const [user, setUser] = useState<User | null>(null)
    const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false)
    const [teacherData, setTeacherData] = useState<Teacher[] | null>(null)
    const [department, setDepartment] = useState<Department[] | null>(null)
    const navigate = useNavigate()



    //! Search Filters
    const [search, setSearch] = useState<string | null>(null)
    const [departmentFilter, setDepartmentFilter] = useState<string | null>()
    const [availabilityFilter, setAvailabilityFilter] = useState<string | null>()

    useEffect(() =>{
        const storedUser = localStorage.getItem('user')
        if(storedUser) {
            setUser(JSON.parse(storedUser))
        }

        async function fetchData() {

            try {

                //! FETCHING TEACHER DATA
                const responseTeacher = await axios.get('http://localhost:1000/teachers', {
                    params: {
                        search, departmentFilter, availabilityFilter
                    },
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                })
                
                console.log("TEACHERS DATA", responseTeacher.data)
                setTeacherData(responseTeacher?.data?.teachers)


                //! FETCHING DEPARTMENT DATA
                const responseDepartment = await axios.get('http://localhost:1000/departments')
                console.log('DEPARTMENT DATA:', responseDepartment.data)
                setDepartment(responseDepartment.data.department)

            }
            catch(err: any) {
                console.log('Error Occurred:', err);
                console.log('Response:', err.response?.data?.message);
                console.log('Status:', err.response?.status);            
            }
        }
        fetchData()
    },[search, departmentFilter, availabilityFilter])

    useEffect(() => {
    console.log('SEARCH:', search)
    console.log('DEPARTMENT:', departmentFilter)
    console.log('AVAILABILITY:', availabilityFilter)
}, [search, departmentFilter, availabilityFilter])

    const teacherCard = [
        {icon: Users, title: 'Total Teachers', count: teacherData?.length || 0, label: 'All registered teachers', color: 'from-purple-500 to-indigo-500'},
        {icon: CircleCheck, title: 'Available Teachers', count: teacherData?.filter(t => t.teacherAvailability === 'Available').length || 0, label: 'Currently Available', color: 'from-green-500 to-emerald-500'},
        {icon: Clock4, title: 'Busy Teachers', count: teacherData?.filter(t => t.teacherAvailability === 'Busy').length || 0, label: 'Currently Busy', color: 'from-orange-500 to-amber-500'},
        {icon: Send, title: 'Teachers On Leave', count: teacherData?.filter(t=> t.teacherAvailability === 'On Leave').length || 0, label: 'Currently On Leave', color: 'from-pink-500 to-rose-500'} 
    ]   

    async function deleteTeacherData(teacherId: string) {
        const permission = confirm('Do You Really Want To Delete Teacher Data??')

        if(permission) {
            try {
                const response = await axios.delete(`http://localhost:1000/teachers/delete/${teacherId}`)
                
                if(response) {
                toast.success('Teacher Deleted Successfully')

                setTimeout(()=>{
                    window.location.reload()
                },2500)
            }
        }
        catch(err: any) {
            console.log('Error Occurred:', err)
            console.log('Response:', err.response?.data?.message)
            console.log('Status:', err.response?.status)
            toast.error(err.response?.data?.message || 'Teacher Delete Request Failed')
        }
        }
    }

    function clearFilter() {
        setSearch('')
        setDepartmentFilter('')
        setAvailabilityFilter('')
    }

    return(
        <>
        <div className="flex h-screen w-screen bg-gray-50 overflow-hidden">
            {/* SIDEBAR: Locked to the side, handles its own height */}
            <div className="h-full z-50 shrink-0">
                <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
            </div>

            {/* MAIN CONTENT AREA: Scrolls independently */}
            <div className="flex-1 flex flex-col h-full overflow-y-auto">
                
                {/* NAVBAR */}
                <div className="border-b border-gray-300 bg-white sticky top-0 z-40">
                    <ProfileNavbar content="Teacher List Page"/>
                    <ToastContainer position="top-right" autoClose={2000} />
                </div>

                {/* INNER SCROLL CONTAINER: Safely holds all cards and panels */}
                <div className="p-4 space-y-6 max-w-400 w-full mx-auto">

                    {/* HEADER BANNER */}
                    <div className="bg-linear-to-r from-blue-500 via-purple-500 to-pink-500 min-h-24 rounded-2xl p-6 flex items-center shadow-sm">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full gap-4">
                            <div className="flex items-center">
                                <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-white/20 backdrop-blur-md shadow-lg shrink-0">
                                    <Users stroke="white" strokeWidth={2} size={28} />
                                </div>
                                <div className="ml-4">
                                    <h1 className="text-white text-xl sm:text-2xl font-bold tracking-tight">Teachers Management</h1>
                                    <p className="text-white/80 text-xs sm:text-sm">Manage Faculty Members and their information</p>
                                </div>
                            </div>
                            <button 
                                className="bg-white px-5 py-2.5 rounded-xl font-bold text-gray-900 text-sm w-full sm:w-auto shadow-md hover:bg-gray-50 transition active:scale-95 cursor-pointer shrink-0" 
                                onClick={() => navigate('/teachers/add')}>
                                + Add Teacher
                            </button>  
                        </div>
                    </div>

                    {/* STATS CARDS PANELS */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {teacherCard.map((item, index) => {
                            const Icon = item.icon;
                            return (
                                <div key={index} className="bg-white border border-gray-200 p-5 rounded-2xl flex items-center justify-between gap-4 shadow-xs">
                                    <div className={`flex items-center justify-center w-14 h-14 rounded-xl bg-linear-to-br ${item.color} shrink-0`}>
                                        <Icon size={28} stroke="white" strokeWidth={2} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h1 className="text-gray-500 text-xs font-medium uppercase tracking-wider truncate">{item.title}</h1>
                                        <p className="text-gray-900 text-2xl font-bold my-0.5">{item.count}</p>
                                        <p className="text-gray-400 text-xs truncate">{item.label}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* SEARCH FILTERS SECTION */}
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
                                        department != null &&
                                        department.map((dept)=>(
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
                                    <option value="Busy">Busy</option>
                                    <option value="On Leave">On Leave</option>
                                </select>
                            </div>

                            <button className="flex items-center justify-center gap-2 border border-dashed border-gray-300 hover:border-gray-400 rounded-xl px-3 py-2 text-gray-600 bg-gray-50/50 hover:bg-gray-50 text-sm transition font-medium cursor-pointer" onClick={clearFilter}>
                                <RefreshCcw size={16} className="text-gray-500" />
                                <span>Clear Filters</span>
                            </button>
                        </div>
                    </main>

                    {/* RESPONSIVE DATA TABLE CONTAINER */}
                    <div className="bg-white border border-gray-200 rounded-2xl shadow-xs overflow-hidden">
                        <div className="w-full overflow-x-auto scrollbar-thin">
                            <table className="w-full text-left border-collapse min-w-225">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-200 text-gray-700 text-xs uppercase font-semibold tracking-wider">
                                        <th className="p-4">Teacher Name</th>
                                        <th className="p-4">Teacher ID</th>
                                        <th className="p-4">Email</th>
                                        <th className="p-4">Phone Number</th>
                                        <th className="p-4">Department</th>
                                        <th className="p-4">Subjects</th>
                                        <th className="p-4">Status</th>
                                        <th className="p-4 text-right">Actions</th>
                                    </tr>
                                </thead>

                                <tbody className="text-sm text-gray-600">
                                    {teacherData != null && teacherData.map((teacher, index) => (
                                        <tr key={index} className="hover:bg-gray-50/70 transition-colors">
                                            <td className="p-4 font-medium text-gray-900">{teacher.teacherName}</td>
                                            <td className="p-4 font-mono text-xs text-gray-500">{teacher.teacherId}</td>
                                            <td className="p-4 max-w-45">{teacher.teacherEmail}</td>
                                            <td className="p-4">{teacher.teacherPhoneNumber}</td>
                                            <td className="p-4">{teacher.teacherDepartment}</td>
                                            <td className="p-4">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                                                    {teacher.Subjects.length} Subjects
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                                                    teacher.teacherAvailability === 'Available' ? 'bg-green-50 text-green-700 border-green-100' :
                                                    teacher.teacherAvailability === 'Busy' ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-red-50 text-red-700 border-red-100'
                                                }`}>
                                                    {teacher.teacherAvailability}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right whitespace-nowrap">
                                                <div className="inline-flex items-center gap-2">
                                                    <button className="text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer" onClick={() => navigate(`/teachers/edit/${teacher.teacherId}`)}>Edit</button>
                                                    <button className="text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer" onClick={()=>deleteTeacherData(`${teacher.teacherId}`)}>Delete</button>
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

export default Teachers;