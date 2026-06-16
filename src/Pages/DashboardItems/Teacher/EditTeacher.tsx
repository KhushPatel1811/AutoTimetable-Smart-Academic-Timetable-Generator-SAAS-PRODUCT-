import axios from "axios";
import BackGround from "../../../Utilities/Background";
import ProfileNavbar from "../Profile/ProfileNavbar";
import { useFieldArray, useForm } from "react-hook-form";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { ToastContainer, toast } from 'react-toastify';
import { UserPlus, BookCopy, Sparkles, ChevronLeft, Save } from "lucide-react";

function EditTeacher() {
    interface Teacher {
        teacherName: string,
        teacherId: string,
        instituteName: string,
        instituteId: string,
        teacherEmail: string,
        teacherPhoneNumber: string,
        teacherDepartment: string,
        teacherAvailability: string,
        Subjects: {
            subjects: string 
        }[]
    }

    const { register, handleSubmit, control, reset, formState: { errors, isValid, isSubmitting } } = useForm<Teacher>({
        defaultValues: {
            teacherName: '',
            teacherId: '',
            instituteName: '',
            instituteId: '',
            teacherEmail: '',
            teacherPhoneNumber: '',
            teacherDepartment: '',
            teacherAvailability: '',
            Subjects: [{ subjects: '' }]
        },
        mode: 'onChange',
        reValidateMode: 'onChange'
    })

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'Subjects'
    })

    const navigate = useNavigate()
    const { teacherId } = useParams()

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await axios.get(`http://localhost:1000/teachers/edit/${teacherId}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                })
                reset(response?.data?.teacher)
            } catch (err: any) {
                console.log('Error Occurred', err)
            }
        }
        fetchData()
    }, [reset, teacherId])

    async function submitData(data: Teacher) {
        try {
            const response = await axios.post('http://localhost:1000/teachers/edit', { ...data, teacherId }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            })

            if (response.data) {
                toast.success('Teacher details updated successfully')
                setTimeout(() => {
                    navigate("/teachers")
                }, 2000)
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Update failed')
        }
    }

    return (
        <div className="flex h-screen w-screen bg-slate-50 overflow-hidden relative">
            {/* Structural Background Layout component */}
            <div className="absolute inset-0 pointer-events-none z-0">
                <BackGround />
            </div>

            <div className="flex-1 flex flex-col h-full overflow-y-auto animate-page relative z-10">
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

                {/* Form Main Container */}
                <div className="p-8 max-w-4xl mx-auto w-full space-y-10">
                    
                    {/* Page Head Title Branding */}
                    <div className="flex items-center gap-6">
                        <div className="p-4 bg-indigo-600 rounded-[1.5rem] shadow-xl shadow-indigo-100">
                            <UserPlus className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Edit Teacher Details</h1>
                            <p className="text-slate-500 font-bold text-sm uppercase tracking-widest mt-1">Update and save changes for this faculty profile</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit(submitData)} className="space-y-8">
                        <div className="premium-card space-y-10 bg-white border rounded-2xl shadow-lg p-4 sm:p-6 md:p-8">
                            
                            {/* Personal & Contact Grid section */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                                
                                {/* Personal Information Section */}
                                <div className="space-y-6">
                                    <h3 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em] pb-2 border-b border-indigo-50">Personal Details</h3>
                                    
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                                        <input type="text" className="input-box w-full" placeholder="Enter Teacher Name" {...register("teacherName", {
                                            required: "Teacher Name Is Required",
                                            minLength: { value: 3, message: "Teacher Name Must Be At Least 3 Characters" },
                                            maxLength: { value: 50, message: "Teacher Name Cannot Exceed 50 Characters" },
                                            pattern: { value: /^[A-Za-z ]+$/, message: "Teacher Name Should Contain Only Letters" }
                                        })} />
                                        {errors.teacherName && <p className="text-rose-500 text-[10px] font-black uppercase mt-1 ml-1">{errors.teacherName.message}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">School / College Name</label>
                                        <input type="text" className="input-box w-full" placeholder="Enter Institute Name" {...register("instituteName", {
                                            required: "Institute Name Is Required",
                                            minLength: { value: 3, message: "Institute Name Must Be At Least 3 Characters" },
                                            maxLength: { value: 100, message: "Institute Name Cannot Exceed 100 Characters" },
                                            pattern: { value: /^[A-Za-z ]+$/, message: "Institute Name Should Contain Only Letters" }
                                        })} />
                                        {errors.instituteName && <p className="text-rose-500 text-[10px] font-black uppercase mt-1 ml-1">{errors.instituteName.message}</p>}
                                    </div>
                                </div>

                                {/* Contact Information Section */}
                                <div className="space-y-6">
                                    <h3 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em] pb-2 border-b border-indigo-50">Contact Information</h3>
                                    
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                                        <input type="email" className="input-box w-full" placeholder="Enter Teacher Email" {...register("teacherEmail", {
                                            required: "Teacher Email Is Required",
                                            pattern: { value: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, message: "Invalid Email Format" }
                                        })} />
                                        {errors.teacherEmail && <p className="text-rose-500 text-[10px] font-black uppercase mt-1 ml-1">{errors.teacherEmail.message}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                                        <input type="text" className="input-box w-full" placeholder="Enter Phone Number" {...register("teacherPhoneNumber", {
                                            required: "Phone Number Is Required",
                                            pattern: { value: /^[0-9]{10}$/, message: "Phone Number Must Contain 10 Digits" }
                                        })} />
                                        {errors.teacherPhoneNumber && <p className="text-rose-500 text-[10px] font-black uppercase mt-1 ml-1">{errors.teacherPhoneNumber.message}</p>}
                                    </div>
                                </div>
                            </div>

                            <hr className="border-slate-100" />

                            {/* Core Parameters Selection Grid layout */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Assigned Department</label>
                                    <select className="input-box w-full cursor-pointer" {...register("teacherDepartment", { required: "Department Is Required" })}>
                                        <option value="">Select Department</option>
                                        <option value="Computer">Computer</option>
                                    </select>
                                    {errors.teacherDepartment && <p className="text-rose-500 text-[10px] font-black uppercase mt-1 ml-1">{errors.teacherDepartment.message}</p>}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Current Availability Status</label>
                                    <select className="input-box w-full cursor-pointer" {...register("teacherAvailability", { required: "Availability Is Required" })}>
                                        <option value="">Select Availability</option>
                                        <option value="Available">Available</option>
                                        <option value="Busy">Busy</option>
                                        <option value="On Leave">On Leave</option>
                                    </select>
                                    {errors.teacherAvailability && <p className="text-rose-500 text-[10px] font-black uppercase mt-1 ml-1">{errors.teacherAvailability.message}</p>}
                                </div>
                            </div>

                            <hr className="border-slate-100" />

                            {/* Subjects Reactive Dynamic Structure Array fields */}
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-[11px] font-black text-indigo-500 uppercase tracking-[0.3em]">Teaching Subjects</h3>
                                    <button type="button" className="add-btn !py-2 !px-4 text-[10px] gap-2 flex items-center bg-indigo-50 text-indigo-700 rounded-xl hover:bg-indigo-100 transition-colors" onClick={() => append({ subjects: "" })}>
                                        <Sparkles className="w-3 h-3" /> + Add Subject
                                    </button>
                                </div>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {fields.map((field, index) => (
                                        <div key={field.id} className="p-6 bg-slate-50/50 rounded-2xl border border-slate-100 flex items-center gap-4 group">
                                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center font-black text-slate-300 text-sm group-hover:text-indigo-400 transition-colors shadow-sm">
                                                {index + 1}
                                            </div>
                                            <div className="flex-1">
                                                <input type="text" className="input-box w-full !bg-white !py-2.5 !text-xs" placeholder="Subject Name" {...register(`Subjects.${index}.subjects`, {
                                                    required: "Subject Name Is Required",
                                                    minLength: { value: 3, message: "Must be 3+ characters" },
                                                    maxLength: { value: 50, message: "Max 50 characters" },
                                                    pattern: { value: /^[A-Za-z ]+$/, message: "Letters only" }
                                                })} />
                                                {errors.Subjects?.[index]?.subjects && <p className="text-rose-500 text-[10px] font-bold mt-1 ml-1">{errors.Subjects[index]?.subjects?.message}</p>}
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

                        {/* Submission Action Operations buttons */}
                        <div className="flex items-center justify-end gap-4">
                            <button type="button" onClick={() => navigate('/teachers')} className="secondary-btn !py-4 !px-10 border rounded-xl hover:bg-slate-100 transition">
                                Cancel
                            </button>
                            <button type="submit" disabled={isSubmitting || !isValid} className={`add-btn !py-4 !px-12 gap-3 shadow-xl shadow-indigo-100 flex items-center bg-indigo-600 text-white rounded-xl font-semibold transition hover:scale-105 ${isSubmitting || !isValid ? "opacity-50 grayscale cursor-not-allowed" : ""}`}>
                                {isSubmitting ? <Sparkles className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                Save Changes
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default EditTeacher;