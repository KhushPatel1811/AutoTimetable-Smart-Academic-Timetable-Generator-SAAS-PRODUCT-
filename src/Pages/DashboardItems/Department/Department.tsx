import { Users } from "lucide-react";
import Sidebar from "../../../Components/Dashboard/Sidebar";
import ProfileNavbar from "../Profile/ProfileNavbar";
import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";

function Department() {
    interface Department {
        departmentName: string,
        departmentId: string,
        createdAt: Date
    }

    const navigate = useNavigate()
    const [departmentData, setDepartmentData] = useState<Department[] | null>(null)

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await axios.get('https://autotimetable-smart-academic-timetable.onrender.com/departments', {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                const department = response.data?.department;
                if (department) {
                    setDepartmentData(department);
                }
            }
            catch (err: any) {
                console.error('Error fetching departments:', err);
                toast.error('Failed to load departments');
            }
        }
        fetchData();
    }, []);


    async function deleteData(departmentId: string): Promise<void> {
        const permission = confirm('Do You Really Want To Delete Department Data??')

        if(permission) {
            try {
                const response = await axios.delete(`https://autotimetable-smart-academic-timetable.onrender.com/departments/delete/${departmentId}`, {
                    headers: {
                        'Authorization' : `Bearer ${localStorage.getItem('token')}`
                    }
                })
    
                if(response) {
                    toast.success('Department Deleted Successfully')
                    setTimeout(()=>{
                        window.location.reload()
                    },2500)
                }
            }
            catch(err: any) {
                toast.error(err.response?.data?.message || 'Delete Request Failed')
            }
        }
    }

    return (
        <div className="flex h-screen w-screen overflow-hidden bg-slate-50">
            <Sidebar />

            <div className="flex-1 h-full overflow-y-auto animate-page">
                <div className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
                    <ProfileNavbar content="Department Management System" />
                    <ToastContainer position="top-right" autoClose={2000} />
                </div>

                <div className="pt-6 px-8 pb-8 max-w-7xl mx-auto space-y-8">
                    {/* Page Header Card */}
                    <div className="bg-linear-to-r from-indigo-600 to-indigo-500 rounded-[2.5rem] p-10 shadow-2xl shadow-indigo-100 flex items-center justify-between border border-indigo-400/20 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 group-hover:scale-110 transition-transform duration-700" />
                        
                        <div className="flex items-center space-x-6 relative z-10">
                            <div className="p-5 bg-white/20 backdrop-blur-xl rounded-3xl shadow-inner border border-white/30">
                                <Users className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-black text-white tracking-tight">Department Registery</h1>
                                <p className="text-indigo-100 font-bold text-sm tracking-wide opacity-80 uppercase">Manage your departments and classrooms</p>
                            </div>
                        </div>

                        <button 
                            className="bg-white px-8 py-4 rounded-2xl font-black text-indigo-600 text-sm shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer relative z-10 uppercase tracking-widest"
                            onClick={() => navigate('/departments/add')}>
                            + New Department
                        </button>
                    </div>

                    {/* Department List Table */}
                    <div className="premium-card p-0! overflow-hidden">
                        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Active Departments</h3>
                            <div className="badge-indigo">Live Count: {departmentData?.length || 0}</div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-slate-100 text-[11px] font-black text-slate-400 uppercase tracking-widest">
                                        <th className="p-6">Index</th>
                                        <th className="p-6">Department Identity</th>
                                        <th className="p-6">System ID</th>
                                        <th className="p-6">Registration Date</th>
                                        <th className="p-6 text-right">Operations</th>
                                    </tr>
                                </thead>

                                <tbody className="text-sm">
                                    {departmentData != null && departmentData.map((department, index) => (
                                        <tr key={index} className="group hover:bg-slate-50/80 transition-colors border-b border-slate-50 last:border-none">
                                            <td className="p-6 font-black text-slate-300 text-lg">{(index + 1).toString().padStart(2, '0')}</td>
                                            <td className="p-6">
                                                <div className="font-black text-slate-800">{department.departmentName}</div>
                                                <div className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">Academic Wing</div>
                                            </td>
                                            <td className="p-6">
                                                <span className="font-mono text-xs text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-100">
                                                    {department.departmentId}
                                                </span>
                                            </td>
                                            <td className="p-6 text-slate-500 font-bold text-xs italic">
                                                {new Date(department.createdAt).toLocaleDateString(undefined, {
                                                  year: 'numeric', month: 'long', day: 'numeric'
                                                })}
                                            </td>
                                            <td className="p-6 text-right">
                                                <div className="flex items-center justify-end space-x-2">
                                                    <button 
                                                        className="secondary-btn py-2! px-4!" 
                                                        onClick={() => navigate(`/departments/edit/${department.departmentId}`)}
                                                    >
                                                        Edit
                                                    </button>
                                                    <button 
                                                        className="delete-btn" 
                                                        onClick={() => deleteData(department.departmentId)}
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            
                            {(!departmentData || departmentData.length === 0) && (
                                <div className="p-20 text-center space-y-4 opacity-40">
                                    <Users className="w-12 h-12 text-slate-200 mx-auto" />
                                    <p className="text-xs font-black text-slate-500 uppercase tracking-widest">No departments found in registry</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Department;