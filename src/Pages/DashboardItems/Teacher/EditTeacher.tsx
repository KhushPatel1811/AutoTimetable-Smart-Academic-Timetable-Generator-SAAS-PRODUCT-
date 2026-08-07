import axios from "axios";
import BackGround from "../../../Utilities/Background";
import ProfileNavbar from "../Profile/ProfileNavbar";
import { useForm, Controller } from "react-hook-form";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ToastContainer, toast } from 'react-toastify';
import { UserPlus, Sparkles, ChevronLeft, Save, X, BookOpen } from "lucide-react";
import API from '../../../config/api';
import Sidebar from "../../../Components/Dashboard/Sidebar";

interface Teacher {
    teacherName: string;
    teacherId: string;
    instituteId: string;
    teacherEmail: string;
    teacherPhoneNumber: string;
    teacherDepartments: string[];
    teacherDepartment: string;
    teacherAvailability: string;
    Subjects: { subjects: string }[];
}

interface Department {
    departmentName: string;
}

interface Subject {
    subjectId: string;
    subjectName: string;
    subjectCode: string;
    departmentName: string;
}

function EditTeacher() {
    const { register, handleSubmit, control, reset, watch, setValue, formState: { errors, isValid, isSubmitting } } = useForm<Teacher>({
        defaultValues: {
            teacherName: '',
            teacherId: '',
            instituteId: '',
            teacherEmail: '',
            teacherPhoneNumber: '',
            teacherDepartments: [],
            teacherDepartment: '',
            teacherAvailability: '',
            Subjects: [],
        },
        mode: 'onChange',
        reValidateMode: 'onChange',
    });

    const [departments, setDepartments] = useState<Department[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const selectedDepts = watch('teacherDepartments') || [];
    const selectedSubjects = watch('Subjects') || [];

    const handleMenuToggle = () => setIsSidebarOpen(prev => !prev);
    const handleSidebarClose = () => setIsSidebarOpen(false);

    const navigate = useNavigate();
    const { teacherId } = useParams();

    useEffect(() => {
        async function fetchData() {
            try {
                const config = { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } };
                const [responseTeacher, responseDept, responseSubjects] = await Promise.all([
                    axios.get(`${API}/teachers/edit/${teacherId}`, config),
                    axios.get(`${API}/departments`, config),
                    axios.get(`${API}/subjects`, config),
                ]);

                const teacher = responseTeacher.data.teacher;
                // Migrate legacy single-dept to array
                if (!teacher.teacherDepartments || teacher.teacherDepartments.length === 0) {
                    teacher.teacherDepartments = teacher.teacherDepartment ? [teacher.teacherDepartment] : [];
                }
                // Ensure Subjects is always an array
                if (!teacher.Subjects) teacher.Subjects = [];

                reset(teacher);
                setDepartments(responseDept.data.department || []);
                setSubjects(responseSubjects.data.subjects || []);
            } catch (err) {
                console.error('Initialization Error:', err);
            }
        }
        fetchData();
    }, [reset, teacherId]);

    function toggleDepartment(deptName: string) {
        const current = watch('teacherDepartments') || [];
        if (current.includes(deptName)) {
            setValue('teacherDepartments', current.filter(d => d !== deptName), { shouldValidate: true });
        } else {
            setValue('teacherDepartments', [...current, deptName], { shouldValidate: true });
        }
    }

    function toggleSubject(subjectName: string) {
        const current: { subjects: string }[] = watch('Subjects') || [];
        const exists = current.some(s => s.subjects === subjectName);
        if (exists) {
            setValue('Subjects', current.filter(s => s.subjects !== subjectName), { shouldValidate: true });
        } else {
            setValue('Subjects', [...current, { subjects: subjectName }], { shouldValidate: true });
        }
    }

    function isSubjectSelected(subjectName: string) {
        return (watch('Subjects') || []).some((s: { subjects: string }) => s.subjects === subjectName);
    }

    async function submitData(data: Teacher) {
        try {
            await axios.put(`${API}/teachers/edit/${teacherId}`, data, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });
            toast.success('Teacher details updated successfully');
            setTimeout(() => navigate("/teachers"), 2000);
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            toast.error(error.response?.data?.message || 'Update failed');
        }
    }

    return (
        <div className="flex h-screen w-screen bg-slate-50 overflow-hidden relative">
            <Sidebar isOpen={isSidebarOpen} onClose={handleSidebarClose} />
            <div className="absolute inset-0 pointer-events-none z-0">
                <BackGround />
            </div>

            <div className="flex-1 flex flex-col h-full overflow-y-auto animate-page relative z-10">
                <div className="sticky top-0 left-0 w-full z-50 bg-white border-b border-slate-200 px-4 sm:px-6 py-4 flex items-center gap-4">
                    <button type="button" onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400 hover:text-slate-900 cursor-pointer">
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <ProfileNavbar content="Edit Teacher" onMenuToggle={handleMenuToggle} />
                    <ToastContainer position="top-right" autoClose={2000} />
                </div>

                <div className="p-8 max-w-4xl mx-auto w-full space-y-10">
                    <div className="flex items-center gap-6">
                        <div className="p-4 bg-indigo-600 rounded-3xl shadow-xl shadow-indigo-100">
                            <UserPlus className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Edit Teacher</h1>
                            <p className="text-slate-500 font-bold text-sm uppercase tracking-widest mt-1">Update the teacher's information below</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit(submitData)} className="space-y-8">
                        <div className="premium-card space-y-10 bg-white border rounded-2xl shadow-lg p-4 sm:p-6 md:p-8">

                            {/* ── Personal + Contact ── */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                                <div className="space-y-6">
                                    <h3 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em] pb-2 border-b border-indigo-50">Personal Details</h3>
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Teacher Name</label>
                                        <input type="text" className="input-box w-full" placeholder="Enter teacher name"
                                            {...register("teacherName", {
                                                required: "Teacher name is required",
                                                minLength: { value: 3, message: "At least 3 characters" },
                                                maxLength: { value: 50, message: "Max 50 characters" },
                                                pattern: { value: /^[A-Za-z ]+$/, message: "Letters only" },
                                            })} />
                                        {errors.teacherName && <p className="text-rose-500 text-[10px] font-black uppercase mt-1 ml-1">{errors.teacherName.message}</p>}
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <h3 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em] pb-2 border-b border-indigo-50">Contact Details</h3>
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                                        <input type="email" className="input-box w-full" placeholder="teacher@school.com"
                                            {...register("teacherEmail", {
                                                required: "Email is required",
                                                pattern: { value: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, message: "Invalid email format" },
                                            })} />
                                        {errors.teacherEmail && <p className="text-rose-500 text-[10px] font-black uppercase mt-1 ml-1">{errors.teacherEmail.message}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                                        <input type="text" className="input-box w-full" placeholder="10-digit number"
                                            {...register("teacherPhoneNumber", {
                                                required: "Phone number is required",
                                                pattern: { value: /^[0-9]{10}$/, message: "Must be 10 digits" },
                                            })} />
                                        {errors.teacherPhoneNumber && <p className="text-rose-500 text-[10px] font-black uppercase mt-1 ml-1">{errors.teacherPhoneNumber.message}</p>}
                                    </div>
                                </div>
                            </div>

                            <hr className="border-slate-100" />

                            {/* ── Department multi-select ── */}
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                        Department <span className="text-rose-400">*</span>
                                    </label>
                                    <p className="text-[10px] text-slate-400 ml-1 mt-1">Select one or more departments</p>
                                </div>

                                {selectedDepts.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {selectedDepts.map(dept => (
                                            <span key={dept} className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-black border border-indigo-100">
                                                {dept}
                                                <button type="button" onClick={() => toggleDepartment(dept)} className="hover:text-rose-500 transition-colors cursor-pointer">
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}

                                <Controller
                                    name="teacherDepartments"
                                    control={control}
                                    rules={{ validate: val => (val && val.length > 0) || 'Select at least one department' }}
                                    render={() => (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                            {departments.map((dept, i) => {
                                                const isSelected = selectedDepts.includes(dept.departmentName);
                                                return (
                                                    <button key={i} type="button" onClick={() => toggleDepartment(dept.departmentName)}
                                                        className={`px-4 py-3 rounded-xl text-xs font-black border transition-all duration-200 text-left cursor-pointer
                                                            ${isSelected
                                                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100'
                                                                : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50'
                                                            }`}>
                                                        {dept.departmentName}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                />
                                {errors.teacherDepartments && (
                                    <p className="text-rose-500 text-[10px] font-black uppercase mt-1 ml-1">
                                        {errors.teacherDepartments.message as string}
                                    </p>
                                )}
                            </div>

                            <hr className="border-slate-100" />

                            {/* ── Availability ── */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Availability Status</label>
                                    <select className="input-box w-full cursor-pointer" {...register("teacherAvailability", { required: "Please select availability" })}>
                                        <option value="">Select Availability</option>
                                        <option value="Available">Available</option>
                                        <option value="Busy">In a Class</option>
                                        <option value="On Leave">On Leave</option>
                                    </select>
                                    {errors.teacherAvailability && <p className="text-rose-500 text-[10px] font-black uppercase mt-1 ml-1">{errors.teacherAvailability.message}</p>}
                                </div>
                            </div>

                            <hr className="border-slate-100" />

                            {/* ── Subject multi-select dropdown ── */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <BookOpen className="w-4 h-4 text-indigo-500" />
                                    <h3 className="text-[11px] font-black text-indigo-500 uppercase tracking-[0.3em]">Subjects</h3>
                                </div>
                                <p className="text-[10px] text-slate-400 ml-1">Select all subjects this teacher teaches</p>

                                {selectedSubjects.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {selectedSubjects.map((s: { subjects: string }) => (
                                            <span key={s.subjects} className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-black border border-emerald-100">
                                                {s.subjects}
                                                <button type="button" onClick={() => toggleSubject(s.subjects)} className="hover:text-rose-500 transition-colors cursor-pointer">
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {subjects.length > 0 ? (
                                    <Controller
                                        name="Subjects"
                                        control={control}
                                        render={() => (
                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-64 overflow-y-auto custom-scrollbar pr-1">
                                                {subjects.map((subject) => {
                                                    const isSel = isSubjectSelected(subject.subjectName);
                                                    return (
                                                        <button key={subject.subjectId} type="button" onClick={() => toggleSubject(subject.subjectName)}
                                                            className={`px-4 py-3 rounded-xl text-xs border transition-all duration-200 text-left cursor-pointer
                                                                ${isSel
                                                                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-100 font-black'
                                                                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 font-bold'
                                                                }`}>
                                                            <div className="font-black truncate">{subject.subjectName}</div>
                                                            <div className={`text-[9px] font-mono mt-0.5 ${isSel ? 'text-emerald-100' : 'text-slate-400'}`}>{subject.subjectCode}</div>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    />
                                ) : (
                                    <div className="p-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center">
                                        <p className="text-xs text-slate-400 font-bold">No subjects found. Add subjects first from the Subjects page.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ── Submit ── */}
                        <div className="flex items-center justify-end gap-4">
                            <button type="button" onClick={() => navigate('/teachers')} className="secondary-btn py-4! px-10! border rounded-xl hover:bg-slate-100 transition cursor-pointer">
                                Cancel
                            </button>
                            <button type="submit" disabled={isSubmitting || !isValid}
                                className={`add-btn py-4! px-12! gap-3 shadow-xl shadow-indigo-100 flex items-center bg-indigo-600 text-white rounded-xl font-semibold transition hover:scale-105 ${isSubmitting || !isValid ? "opacity-50 grayscale cursor-not-allowed" : "cursor-pointer"}`}>
                                {isSubmitting ? <Sparkles className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                Save Changes
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default EditTeacher;
