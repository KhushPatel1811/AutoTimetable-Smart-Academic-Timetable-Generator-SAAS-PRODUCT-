import { Users, CircleCheck, Clock4, Send, Search, Building2, UserRound, RefreshCcw, Filter } from "lucide-react";
import Sidebar from "../../../Components/Dashboard/Sidebar";
import { useEffect, useState } from "react";
import ProfileNavbar from "../Profile/ProfileNavbar";
import { useNavigate } from "react-router";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";

function ColleagueTeacher() {
    interface Teacher {
        teacherId: string,
        teacherName: string,
        teacherEmail: string,
        teacherPhoneNumber: string,
        teacherDepartment: string,
        teacherAvailability: string,
        Subjects: {subjects: ''}[]
    }

    interface Department {
        departmentName: string   
    }

    const [teacherData, setTeacherData] = useState<Teacher[] | null>(null)
    const [department, setDepartment] = useState<Department[] | null>(null)
    const navigate = useNavigate()

    const [search, setSearch] = useState('')
    const [departmentFilter, setDepartmentFilter] = useState('')
    const [availabilityFilter, setAvailabilityFilter] = useState('')

    const storedUser = localStorage.getItem('user')
    let email = ''
    if(storedUser) {
        const parsedUser = JSON.parse(storedUser)
        email = parsedUser?.email
    }

    useEffect(() => {
        async function fetchData() {
            try {
                const responseTeacher = await axios.get('http://localhost:1000/teachers', {
                    params: { search, departmentFilter, availabilityFilter },
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                })
                setTeacherData(responseTeacher?.data?.teachers)

                const responseDepartment = await axios.get('http://localhost:1000/departments')
                setDepartment(responseDepartment.data.department)
            }
            catch(err: any) {
                console.log('Error Occurred:', err);
            }
        }
        fetchData()
    }, [search, departmentFilter, availabilityFilter])

    const stats = [
        { icon: Users, title: 'Total Teacher Count', count: teacherData?.length || 0, color: 'from-indigo-600 to-indigo-500', shadow: 'shadow-indigo-100' },
        { icon: CircleCheck, title: 'Available', count: teacherData?.filter(t => t.teacherAvailability === 'Available').length || 0, color: 'from-emerald-600 to-emerald-500', shadow: 'shadow-emerald-100' },
        { icon: Clock4, title: 'In a Class', count: teacherData?.filter(t => t.teacherAvailability === 'Busy').length || 0, color: 'from-amber-600 to-amber-500', shadow: 'shadow-amber-100' },
        { icon: Send, title: 'On Leave', count: teacherData?.filter(t=> t.teacherAvailability === 'On Leave').length || 0, color: 'from-rose-600 to-rose-500', shadow: 'shadow-rose-100' } 
    ]   

    async function deleteTeacher(id: string) {
        if(confirm('Are you sure you want to permanently delete this teacher from the records?')) {
            try {
                await axios.delete(`http://localhost:1000/teachers/delete/${id}`)
                toast.success('Teacher removed successfully')
                setTimeout(() => window.location.reload(), 2000)
            } catch(err: any) {
                toast.error('Could not remove teacher. Please try again.')
            }
        }
    }

    return (
        <div className="flex h-screen w-screen bg-slate-50 overflow-hidden">
            <Sidebar />

            <div className="flex-1 flex flex-col h-full overflow-y-auto animate-page">
                <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                    <ProfileNavbar content="Manage Teacher Directory"/>
                    <ToastContainer position="top-right" autoClose={2000} />
                </div>

                <div className="p-8 max-w-[1600px] w-full mx-auto space-y-10">
                    {/* Hero Section */}
                    <div className="bg-linear-to-r from-indigo-600 to-indigo-500 rounded-[2.5rem] p-10 shadow-2xl shadow-indigo-100 flex flex-col md:flex-row items-center justify-between gap-8 border border-white/10 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -mr-32 -mt-32 group-hover:scale-110 transition-transform duration-700" />
                        
                        <div className="flex items-center space-x-8 relative z-10">
                            <div className="p-6 bg-white/20 backdrop-blur-2xl rounded-[2rem] shadow-inner border border-white/30">
                                <Users className="w-10 h-10 text-white" />
                            </div>
                            <div>
                                <h1 className="text-4xl font-black text-white tracking-tight">Teacher Directory</h1>
                                <p className="text-indigo-100 font-bold text-sm tracking-widest opacity-80 uppercase mt-1">View and manage your school staff</p>
                            </div>
                        </div>

                        {/* <button 
                            className="bg-white px-10 py-5 rounded-2xl font-black text-indigo-600 text-sm shadow-2xl hover:shadow-indigo-200 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer relative z-10 uppercase tracking-[0.2em]" 
                            onClick={() => navigate('/teachers/add')}>
                            + Add New Teacher
                        </button>   */}
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
                            <input type="text" className="input-box !py-3 !pl-11 !bg-white" value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Search by name..." />
                        </div>

                        <div className="relative group">
                            <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors pointer-events-none" />
                            <select className="input-box !py-3 !pl-11 !bg-white cursor-pointer appearance-none" value={departmentFilter} onChange={(e)=>setDepartmentFilter(e.target.value)}>
                                <option value="">All Departments</option>
                                {department?.map(dept => <option key={dept.departmentName} value={dept.departmentName}>{dept.departmentName}</option>)}
                            </select>
                        </div>

                        <div className="relative group">
                            <UserRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors pointer-events-none" />
                            <select className="input-box !py-3 !pl-11 !bg-white cursor-pointer appearance-none" value={availabilityFilter} onChange={(e)=>setAvailabilityFilter(e.target.value)}>
                                <option value="">Any Status</option>
                                <option value="Available">Available</option>
                                <option value="Busy">In a Class</option>
                                <option value="On Leave">On Leave</option>
                            </select>
                        </div>

                        <button className="secondary-btn w-full !py-3 flex items-center justify-center gap-2 group" onClick={() => { setSearch(''); setDepartmentFilter(''); setAvailabilityFilter(''); }}>
                            <RefreshCcw size={16} className="group-hover:rotate-180 transition-transform duration-500" />
                            Reset Filters
                        </button>
                    </div>

                    {/* Faculty Table */}
                    <div className="premium-card !p-0 overflow-hidden">
                        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                                    <Filter className="w-4 h-4" />
                                </div>
                                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Registered ColleagueTeacher</h3>
                            </div>
                            <div className="badge-indigo">Active Records</div>
                        </div>

                        <div className="overflow-x-auto custom-scrollbar">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                        <th className="p-8">Teacher Details</th>
                                        <th className="p-8">Contact Info</th>
                                        <th className="p-8">Department</th>
                                        <th className="p-8">Current Status</th>
                                        <th className="p-8 text-right">Actions</th>
                                    </tr>
                                </thead>

                                <tbody className="text-sm">
                                    {teacherData?.map((teacher, index) => (
                                        <tr key={index} className="border-b border-slate-50 last:border-none bg-white">
                                            <td className="p-8">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center font-black text-slate-500 bg-indigo-50 text-indigo-600">
                                                        {teacher.teacherName.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="font-black text-slate-800 text-base">{teacher.teacherName}</div>
                                                        <div className="text-[10px] font-mono text-indigo-500 uppercase font-black">ID: {teacher.teacherId}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-8">
                                                <div className="text-slate-600 font-bold">{teacher.teacherEmail}</div>
                                                <div className="text-[10px] text-slate-400 font-black">{teacher.teacherPhoneNumber}</div>
                                            </td>
                                            <td className="p-8">
                                                <span className="px-3 py-1.5 bg-slate-100 text-slate-600 font-black text-[10px] rounded-lg tracking-widest uppercase">
                                                    {teacher.teacherDepartment}
                                                </span>
                                            </td>
                                            <td className="p-8">
                                                <div className={`badge-${teacher.teacherAvailability === 'Available' ? 'emerald' : teacher.teacherAvailability === 'Busy' ? 'indigo' : 'rose'} !px-4 !py-2 inline-flex items-center gap-2`}>
                                                    <div className={`w-1.5 h-1.5 rounded-full ${teacher.teacherAvailability === 'Available' ? 'bg-emerald-500' : 'bg-rose-500 shadow-rose-200'} animate-pulse`} />
                                                    {teacher.teacherAvailability === 'Busy' ? 'In a Class' : teacher.teacherAvailability}
                                                </div>
                                            </td>
                                            <td className="p-8 text-right">
                                                <div className="flex items-center justify-end gap-3">
                                                    {
                                                        email == teacher.teacherEmail && 
                                                        <button className="secondary-btn !p-3" onClick={() => navigate(`/teachers/edit/${teacher.teacherId}`)}>
                                                            Edit
                                                        </button>
                                                    }
                                                </div>
                                            </td>
                                        </tr>   
                                    ))}
                                </tbody>
                            </table>
                            {(!teacherData || teacherData.length === 0) && (
                                <div className="p-32 text-center space-y-4 opacity-30 grayscale">
                                    <Users className="w-16 h-16 mx-auto text-slate-200" />
                                    <p className="font-black uppercase tracking-[0.4em] text-xs">No ColleagueTeacher Found</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ColleagueTeacher;