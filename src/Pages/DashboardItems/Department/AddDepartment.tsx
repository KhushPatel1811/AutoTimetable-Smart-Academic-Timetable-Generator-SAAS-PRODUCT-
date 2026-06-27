import { useFieldArray, useForm } from "react-hook-form"
import ProfileNavbar from "../Profile/ProfileNavbar"
import Sidebar from "../../../Components/Dashboard/Sidebar"
import axios from "axios"
import { toast, ToastContainer } from "react-toastify"
import { useNavigate } from "react-router"
import { Building2, Sparkles, ChevronLeft, Save, Plus, Trash2 } from "lucide-react"

function AddDepartment() {
    const navigate = useNavigate()
    
    interface Department {
        DepartmentName: {
            departmentName: string
        }[]
    }

    const { register, handleSubmit, control, formState: {errors, isSubmitting, isValid } } = useForm<Department>({
        defaultValues: {
            DepartmentName: [{ departmentName: '' }]
        },
        mode: 'onChange'
    })

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'DepartmentName'
    })

    async function submitData(data: Department): Promise<void> {
        try {
            await axios.post('https://autotimetable-smart-academic-timetable.onrender.com/departments/add', data, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            })
            toast.success('Department Registered Successfully')
            setTimeout(() => navigate('/departments'), 2000)
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            toast.error(error.response?.data?.message || 'Department Registration Failed')
        }
    }

    return (
        <div className="flex h-screen w-screen bg-slate-50 overflow-hidden">
            <Sidebar />

            <div className="flex-1 flex flex-col h-full overflow-y-auto animate-page">
                {/* Header Sticky Bar Container */}
                <div className="sticky top-0 left-0 w-full z-50 bg-white border-b border-slate-200 px-4 sm:px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4 w-full">
                        {/* Optional back button if used inside EditTeacher */}
                        <button type="button" onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400 hover:text-slate-900">
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        
                        {/* The Navbar component now safely gets full structural space */}
                        <ProfileNavbar content="Add New Department" />
                    </div>
                    <ToastContainer position="top-right" autoClose={2000} />
                </div>

                <div className="p-8 max-w-4xl mx-auto w-full space-y-10 -z-10">
                    {/* Header Branding */}
                    <div className="flex items-center gap-6">
                        <div className="p-4 bg-indigo-600 rounded-3xl shadow-xl shadow-indigo-100">
                            <Building2 className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Manage Department Registery</h1>
                            <p className="text-slate-500 font-bold text-sm uppercase tracking-widest mt-1">Institutional Department Registry</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit(submitData)} className="space-y-8">
                        <div className="premium-card space-y-8">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em]">Department</h3>
                                <button type="button" className="secondary-btn py-2! px-4! text-[10px] flex items-center gap-2 group" onClick={() => append({ departmentName: '' })}>
                                    <Plus className="w-3 h-3 group-hover:rotate-90 transition-transform" /> Add Unit
                                </button>
                            </div>

                            <div className="space-y-4">
                                {fields.map((field, index) => (
                                    <div key={field.id} className="group relative animate-slide-up" style={{ animationDelay: `${index * 50}ms` }}>
                                        <div className="flex items-center gap-6 p-6 rounded-4xl bg-slate-50/50 border border-slate-100 group-hover:border-indigo-100 group-hover:bg-indigo-50/30 transition-all">
                                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center font-black text-slate-300 text-sm shadow-sm group-hover:text-indigo-600 transition-colors shrink-0">
                                                {index + 1}
                                            </div>
                                            
                                            <div className="flex-1 space-y-1">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Department Identity</label>
                                                <input 
                                                    type="text" 
                                                    placeholder="e.g. Computer Science" 
                                                    className="input-box py-3! bg-white! border-none group-hover:ring-1 group-hover:ring-indigo-200"
                                                    {...register(`DepartmentName.${index}.departmentName`, { required: true })}
                                                />
                                            {errors.DepartmentName && <p className="text-rose-500 text-[10px] font-black uppercase mt-1 ml-1">Department Name Required</p>}
                                            </div>

                                            {fields.length > 1 && (
                                                <button 
                                                    type="button" 
                                                    className="p-3 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                                                    onClick={() => remove(index)}
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-4 pt-4">
                            <button type="button" onClick={() => navigate('/departments')} className="secondary-btn py-4! px-10!">
                                Discard
                            </button>
                            <button 
                                type="submit" 
                                disabled={isSubmitting || !isValid} 
                                className={`add-btn py-4! px-12! gap-3 shadow-xl shadow-indigo-100 hover:scale-105 active:scale-95 ${isSubmitting || !isValid ? "opacity-50 grayscale" : ""}`}
                            >
                                {isSubmitting ? <Sparkles className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                Register
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default AddDepartment