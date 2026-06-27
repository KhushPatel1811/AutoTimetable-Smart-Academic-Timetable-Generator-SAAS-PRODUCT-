import { useNavigate, useParams } from "react-router"
import ProfileNavbar from "../Profile/ProfileNavbar"
import Sidebar from "../../../Components/Dashboard/Sidebar"
import { useForm } from "react-hook-form"
import { useEffect } from "react"
import axios from "axios"
import { toast, ToastContainer } from "react-toastify"
import { Building2, Sparkles, ChevronLeft, Save } from "lucide-react"

function EditDepartment() {
    const { departmentId } = useParams<{departmentId: string}>()
    const navigate = useNavigate()

    interface Department {
        departmentName: string
    }

    const { register, handleSubmit, reset, formState: { errors, isValid, isSubmitting } } = useForm<Department>({
        defaultValues: { departmentName: '' },
        mode: 'onChange'
    })

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await axios.get(`https://autotimetable-smart-academic-timetable.onrender.com/departments/edit/${departmentId}`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                })
                reset({ departmentName: response.data?.department?.departmentName })
            } catch (err: unknown) {
                console.error('Error fetching department details:', err)
            }
        }
        fetchData()
    }, [reset, departmentId])

    async function updateData(data: Department): Promise<void> {
        try {
            await axios.put('https://autotimetable-smart-academic-timetable.onrender.com/departments/edit', { ...data, departmentId }, {
                headers: {
                    "Content-Type": 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            })
            toast.success('Department cluster redefined')
            setTimeout(() => navigate('/departments'), 2000)
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            toast.error(error.response?.data?.message || 'Updation failed')
        }
    }

    return (
        <div className="flex h-screen w-screen bg-slate-50 overflow-hidden">
            <Sidebar />

            <div className="flex-1 flex flex-col h-full overflow-y-auto animate-page">
                {/* Header Sticky Bar Container */}
                <div className="sticky top-0 left-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4 w-full">
                        {/* Optional back button if used inside EditTeacher */}
                        <button type="button" onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400 hover:text-slate-900">
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        
                        {/* The Navbar component now safely gets full structural space */}
                        <ProfileNavbar content="Edit Department Profile" />
                    </div>
                    <ToastContainer position="top-right" autoClose={2000} />
                </div>

                <div className="p-8 max-w-2xl mx-auto w-full space-y-10">
                    <div className="flex items-center gap-6">
                        <div className="p-4 bg-indigo-600 rounded-3xl shadow-xl shadow-indigo-100">
                            <Building2 className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Modify Department</h1>
                            <p className="text-slate-500 font-bold text-sm uppercase tracking-widest mt-1">Institutional Department Profile Modification</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit(updateData)} className="space-y-8">
                        <div className="premium-card space-y-6">
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Department</label>
                                <input 
                                    type="text" 
                                    className="input-box py-4! scale-105 origin-left transition-all" 
                                    placeholder="Enter Department Name" 
                                    {...register(`departmentName`, { required: true })} 
                                />
                                {errors.departmentName && <p className="text-rose-500 text-[10px] font-black uppercase mt-1 ml-1">Department Name Required</p>}
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-4">
                            <button type="button" onClick={() => navigate('/departments')} className="secondary-btn py-4! px-10!">
                                Discard
                            </button>
                            <button 
                                type="submit" 
                                disabled={isSubmitting || !isValid} 
                                className={`add-btn py-4! px-12! gap-3 shadow-xl shadow-indigo-100 hover:scale-105 ${isSubmitting || !isValid ? "opacity-50 grayscale" : ""}`}
                            >
                                {isSubmitting ? <Sparkles className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                Update
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default EditDepartment