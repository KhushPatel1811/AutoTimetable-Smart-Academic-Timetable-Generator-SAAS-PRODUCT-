import axios from "axios";
import Sidebar from "../../../Components/Dashboard/Sidebar";
import ProfileNavbar from "../Profile/ProfileNavbar";
import { useFieldArray, useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { ToastContainer, toast } from "react-toastify";
import { useEffect, useState } from "react";
import { UserPlus, BookCopy, Sparkles, ChevronLeft, Save } from "lucide-react";

function AddTeacher() {
    interface Teacher {
        teacherName: string,
        instituteName: string,
        teacherEmail: string,
        teacherPhoneNumber: string,
        teacherDepartment: string,
        teacherAvailability: string,
        Subjects: { subjects: string }[]
    }

    interface Department {
        departmentName: string
    }

    const { register, handleSubmit, control, formState: { errors, isValid, isSubmitting } } = useForm<Teacher>({
        defaultValues: {
            teacherName: '',
            instituteName: '',
            teacherEmail: '',
            teacherPhoneNumber: '',
            teacherDepartment: '',
            teacherAvailability: '',
            Subjects: [{ subjects: '' }]
        },
        mode: 'onChange'
    })

    const { fields, append, remove } = useFieldArray({ control, name: 'Subjects' })
    const navigate = useNavigate()
    const [department, setDepartment] = useState<Department[] | null>([])

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await axios.get('http://localhost:1000/departments')
                setDepartment(response.data.department)
            } catch (err: any) {
                console.log('Error Occurred:', err)
            }
        }
        fetchData()
    }, [])

    async function submitData(data: Teacher) {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const userId = user._id || user.id;
        const instituteId = user.instituteId || user.instituteID;

        try {
            const payload = { ...data, userId, instituteId };
            await axios.post('http://localhost:1000/teachers/add', payload, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            })
            toast.success('Teacher added successfully')
            setTimeout(() => navigate('/teachers'), 2000)
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to add teacher')
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
                        <ProfileNavbar content="Modify Teacher Profile" />
                    </div>
                    <ToastContainer position="top-right" autoClose={2000} />
                </div>

                <div className="p-8 max-w-4xl mx-auto w-full space-y-10">
                    {/* Header Branding */}
                    <div className="flex items-center gap-6">
                        <div className="p-4 bg-indigo-600 rounded-[1.5rem] shadow-xl shadow-indigo-100">
                            <UserPlus className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Add New Teacher</h1>
                            <p className="text-slate-500 font-bold text-sm uppercase tracking-widest mt-1">Fill out the form below to add a new faculty member</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit(submitData)} className="space-y-8">
                        <div className="premium-card space-y-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                                {/* Basic Info Group */}
                                <div className="space-y-6">
                                    <h3 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em] pb-2 border-b border-indigo-50">Personal Details</h3>
                                    
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                                        <input type="text" className="input-box" placeholder="e.g. Dr. Julian Casablancas" {...register("teacherName", { required: "Name is required" })} />
                                        {errors.teacherName && <p className="text-rose-500 text-[10px] font-black uppercase mt-1 ml-1">{errors.teacherName.message}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">School / College Name</label>
                                        <input type="text" className="input-box" placeholder="e.g. Stanford University" {...register("instituteName", { required: "School or college name is required" })} />
                                        {errors.instituteName && <p className="text-rose-500 text-[10px] font-black uppercase mt-1 ml-1">{errors.instituteName.message}</p>}
                                    </div>
                                </div>

                                {/* Contact Group */}
                                <div className="space-y-6">
                                    <h3 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em] pb-2 border-b border-indigo-50">Contact Information</h3>
                                    
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                                        <input type="email" className="input-box" placeholder="teacher@school.com" {...register("teacherEmail", { required: "Email is required" })} />
                                        {errors.teacherEmail && <p className="text-rose-500 text-[10px] font-black uppercase mt-1 ml-1">{errors.teacherEmail.message}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                                        <input type="text" className="input-box" placeholder="10-digit number" {...register("teacherPhoneNumber", { required: "Phone number is required" })} />
                                        {errors.teacherPhoneNumber && <p className="text-rose-500 text-[10px] font-black uppercase mt-1 ml-1">{errors.teacherPhoneNumber.message}</p>}
                                    </div>
                                </div>
                            </div>

                            <hr className="border-slate-50" />

                            {/* Placement Group */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Assigned Department</label>
                                    <select className="input-box cursor-pointer" {...register("teacherDepartment", { required: true })}>
                                        <option value="">Select Department</option>
                                        {department?.map((dept, i) => <option key={i} value={dept.departmentName}>{dept.departmentName}</option>)}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Current Availability Status</label>
                                    <select className="input-box cursor-pointer" {...register("teacherAvailability", { required: true })}>
                                        <option value="">Select Status</option>
                                        <option value="Available">Available</option>
                                        <option value="Busy">In a Class</option>
                                        <option value="On Leave">On Leave</option>
                                    </select>
                                </div>
                            </div>

                            <hr className="border-slate-50" />

                            {/* Subjects Dynamic Array */}
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-[11px] font-black text-indigo-500 uppercase tracking-[0.3em]">Teaching Subjects</h3>
                                    <button type="button" className="add-btn !py-2 !px-4 text-[10px] gap-2" onClick={() => append({ subjects: "" })}>
                                        <Sparkles className="w-3 h-3" /> + Add Subject
                                    </button>
                                </div>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {fields.map((field, index) => (
                                        <div key={field.id} className="p-6 bg-slate-50/50 rounded-2xl border border-slate-100 flex items-center gap-4 group">
                                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center font-black text-slate-300 text-sm group-hover:text-indigo-400 transition-colors">
                                                {index + 1}
                                            </div>
                                            <div className="flex-1">
                                                <input type="text" className="input-box !bg-white !py-2.5 !text-xs" placeholder="e.g. Mathematics" {...register(`Subjects.${index}.subjects`, { required: true })}/>
                                            </div>
                                            {fields.length > 1 && (
                                                <button type="button" className="p-2 text-slate-300 hover:text-rose-500 transition-colors" onClick={() => remove(index)}>
                                                    <BookCopy className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-4">
                            <button type="button" onClick={() => navigate('/teachers')} className="secondary-btn !py-4 !px-10">
                                Cancel
                            </button>
                            <button type="submit" disabled={isSubmitting || !isValid} className={`add-btn !py-4 !px-12 gap-3 shadow-xl shadow-indigo-100 hover:scale-105 ${isSubmitting || !isValid ? "opacity-50 grayscale" : ""}`}>
                                {isSubmitting ? <Sparkles className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                Add Teacher
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default AddTeacher;