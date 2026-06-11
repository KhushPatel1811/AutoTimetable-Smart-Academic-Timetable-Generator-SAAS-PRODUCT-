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

    useEffect(()=>{
        async function fetchData() {

            try {
                const response = await axios.get('http://localhost:1000/departments')
                
                console.log("Department Data: ", response.data)
                console.log('SET DEPARTMENT', response.data?.department)

                const department = response.data?.department

                if(department) {
                    setDepartmentData(department)
                }
            }
            catch(err:any) {
                console.log('Error Occurred: ',err)
                console.log('Response:', err.response?.data?.message)
                console.log('Status:', err.response?.status)
            }
        }
        fetchData()
    },[])


    async function deleteData(departmentId: string) {
        const permission = confirm('Do You Really Want To Delete Department Data??')

        if(permission) {
            try {
                const response = await axios.delete(`http://localhost:1000/departments/delete/${departmentId}`, {
                    headers: {
                        'Authorization' : `Bearer ${localStorage.getItem('token')}`
                    }
                })
                console.log(response.data)
    
                if(response) {
                    toast.success('Department Deleted Successfully')
    
                    setTimeout(()=>{
                        window.location.reload()
                    },2500)
                }
            }
            catch(err: any) {
                console.log('Error Occurred:', err)
                console.log('Response:',  err.response?.data?.message)
                console.log('Status:', err.response?.status)
                toast.error(err.response?.data?.message || 'Delete Request Failed')
            }
        }
    }

    return(
        <>
            <div className="flex h-screen w-screen overflow-hidden bg-gray-50">
                <div className="h-full z-50">
                    <Sidebar />
                </div>

                <div className="flex-1">
                    <div className="border-b border-gray-300 z-1 bg-white">
                        <ProfileNavbar content="Department List Page" />
                        <ToastContainer position="top-right"  autoClose={2000}/>
                    </div>

                    {/* Department Management Card */}
                    <div className="bg-linear-to-r from-blue-500 via-purple-500 to-pink-500 min-h-24 rounded-2xl p-6 flex items-center shadow-sm m-3">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full gap-4">
                            <div className="flex items-center">
                                <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-white/20 backdrop-blur-md shadow-lg shrink-0">
                                    <Users stroke="white" strokeWidth={2} size={28} />
                                </div>
                                <div className="ml-4">
                                    <h1 className="text-white text-xl sm:text-2xl font-bold tracking-tight">Manage Departments / Classes</h1>
                                    <p className="text-white/80 text-xs sm:text-sm">Manage Departments / Classes In Your Institute</p>
                                </div>
                            </div>
                            <button 
                                className="bg-white px-5 py-2.5 rounded-xl font-bold text-gray-900 text-sm w-full sm:w-auto shadow-md hover:bg-gray-50 transition active:scale-95 cursor-pointer shrink-0" 
                                onClick={() => navigate('/departments/add')}>
                                + Add Department
                            </button>  
                        </div>
                    </div>


                    {/* Department List Table */}
                    <div className="bg-white border border-gray-200 rounded-2xl shadow-xs overflow-hidden mx-3">
                        <div className="w-full overflow-x-auto scrollbar-thin">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-200 text-gray-700 text-xs uppercase font-semibold tracking-wider">
                                        <th className="p-4">Sr. No</th>
                                        <th className="p-4">Department Name</th>
                                        <th className="p-4">Department Code</th>
                                        <th className="p-4">Created At</th>
                                        <th className="p-4 text-right">Actions</th>
                                    </tr>
                                </thead>

                                <tbody className="text-sm text-gray-600">
                                    {
                                        departmentData != null && departmentData.map((department, index)=>(
                                            <tr key={index} className="transition-colors">
                                                <td className="p-4">{index+1}</td>
                                                <td className="p-4">{department.departmentName}</td>
                                                <td className="p-4">{department.departmentId}</td>
                                                <td className="p-4">{new Date(department.createdAt).toLocaleTimeString()}</td>
                                                <td className="p-4">
                                                    <button className="text-blue-700 bg-blue-50 hover:bg-blue-100 hover:cursor-pointer mx-5 px-2 py-1 rounded text-xs font-semibold" onClick={()=>navigate(`/departments/edit/${department.departmentId}`)}>Edit</button>
                                                    <button className="text-red-700 bg-red-50 hover:bg-red-100 hover:cursor-pointer px-2 py-1 rounded text-xs font-semibold" onClick={()=>deleteData(`${department.departmentId}`)}>Delete</button>
                                                </td>
                                            </tr>
                                        ))
                                    }
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Department;