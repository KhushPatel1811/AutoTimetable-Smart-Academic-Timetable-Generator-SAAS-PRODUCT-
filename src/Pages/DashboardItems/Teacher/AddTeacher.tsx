import axios from "axios";
import Sidebar from "../../../Components/Dashboard/Sidebar";
import ProfileNavbar from "../Profile/ProfileNavbar";
import { useForm, Controller } from "react-hook-form";
import { useNavigate } from "react-router";
import { ToastContainer, toast } from "react-toastify";
import { useEffect, useState } from "react";
import { UserPlus, Sparkles, ChevronLeft, Save, X, BookOpen } from "lucide-react";
import API from '../../../config/api';
import Select from 'react-select'

interface Teacher {
    teacherName: string;
    teacherEmail: string;
    teacherPhoneNumber: string;
    teacherDepartments: string[];
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

function AddTeacher() {
    const { register, handleSubmit, control, watch, setValue, formState: { errors, isValid, isSubmitting } } = useForm<Teacher>({
        defaultValues: {
            teacherName: '',
            teacherEmail: '',
            teacherPhoneNumber: '',
            teacherDepartments: [],
            teacherAvailability: '',
            Subjects: [],
        },
        mode: 'onChange',
    });

    const navigate = useNavigate();
    const [departments, setDepartments] = useState<Department[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const handleMenuToggle = () => setIsSidebarOpen(prev => !prev);
    const handleSidebarClose = () => setIsSidebarOpen(false);

    const selectStyles = {
    control: (base: any) => ({
        ...base,
        minHeight: 50,
        borderRadius: 12,
        borderColor: "#e2e8f0",
        boxShadow: "none",
        "&:hover": {
            borderColor: "#6366f1",
        },
    }),

    multiValue: (base: any) => ({
        ...base,
        background: "#eef2ff",
    }),

    multiValueLabel: (base: any) => ({
        ...base,
        color: "#4338ca",
        fontWeight: 700,
    }),

    multiValueRemove: (base: any) => ({
        ...base,
        ":hover": {
            background: "#4338ca",
            color: "white",
        },
    }),

    menu: (base: any) => ({
        ...base,
        zIndex: 9999,
    }),
};

    useEffect(() => {
        async function fetchData() {
            try {
                const config = { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } };
                const [deptRes, subjectRes] = await Promise.all([
                    axios.get(`${API}/departments`, config),
                    axios.get(`${API}/subjects`, config),
                ]);
                setDepartments(deptRes.data.department || []);
                setSubjects(subjectRes.data.subjects || []);
            } catch (err) {
                console.error('Error fetching data:', err);
            }
        }
        fetchData();
    }, []);


    async function submitData(data: Teacher) {
        try {
            await axios.post(`${API}/teachers/add`, data, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });
            toast.success('Teacher added successfully');
            setTimeout(() => navigate('/teachers'), 2000);
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            toast.error(error.response?.data?.message || 'Failed to add teacher');
        }
    }

    return (
        <div className="flex h-screen w-screen bg-slate-50 overflow-hidden">
            <Sidebar isOpen={isSidebarOpen} onClose={handleSidebarClose} />

            <div className="flex-1 flex flex-col h-full overflow-y-auto animate-page">
                <div className="sticky top-0 left-0 w-full z-50 bg-white border-b border-slate-200 px-4 sm:px-6 py-4 flex items-center gap-4">
                    <button type="button" onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400 hover:text-slate-900 cursor-pointer">
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <ProfileNavbar content="Add New Teacher" onMenuToggle={handleMenuToggle} />
                    <ToastContainer position="top-right" autoClose={2000} />
                </div>

                <div className="p-8 max-w-4xl mx-auto w-full space-y-10">
                    <div className="flex items-center gap-6">
                        <div className="p-4 bg-indigo-600 rounded-3xl shadow-xl shadow-indigo-100">
                            <UserPlus className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Add New Teacher</h1>
                            <p className="text-slate-500 font-bold text-sm uppercase tracking-widest mt-1">Fill in the details to register a new teacher</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit(submitData)} className="space-y-8">
                        <div className="premium-card space-y-10">

                            {/* ── Personal + Contact ── */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                                <div className="space-y-6">
                                    <h3 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em] pb-2 border-b border-indigo-50">Personal Details</h3>
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Teacher Name</label>
                                        <input type="text" className="input-box" placeholder="e.g. Dr. Rajesh Kumar"
                                            {...register("teacherName", { required: "Teacher name is required" })} />
                                        {errors.teacherName && <p className="text-rose-500 text-[10px] font-black uppercase mt-1 ml-1">{errors.teacherName.message}</p>}
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <h3 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em] pb-2 border-b border-indigo-50">Contact Details</h3>
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                                        <input type="email" className="input-box" placeholder="teacher@school.com"
                                            {...register("teacherEmail", { required: "Email is required" })} />
                                        {errors.teacherEmail && <p className="text-rose-500 text-[10px] font-black uppercase mt-1 ml-1">{errors.teacherEmail.message}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                                        <input type="text" className="input-box" placeholder="10-digit mobile number"
                                            {...register("teacherPhoneNumber", { required: "Phone number is required" })} />
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

                                <Controller
                                    name="teacherDepartments"
                                    control={control}
                                    rules={{
                                        validate: (value) =>
                                            value.length > 0 || "Select at least one department",
                                    }}
                                    render={({ field }) => (
                                        <Select
                                            isMulti
                                            styles={selectStyles}
                                            placeholder="Select Departments"
                                            options={departments.map((dept) => ({
                                                value: dept.departmentName,
                                                label: dept.departmentName,
                                            }))}
                                            value={field.value.map((dept) => ({
                                                value: dept,
                                                label: dept,
                                            }))}
                                            onChange={(selected) =>
                                                field.onChange(selected.map((item) => item.value))
                                            }
                                        />
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
                                    <select className="input-box cursor-pointer" {...register("teacherAvailability", { required: "Please select availability" })}>
                                        <option value="">Select Status</option>
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
                                <p className="text-[10px] text-slate-400 ml-1">Select all subjects this teacher will teach</p>

                                {/* Selected subject tags */}
                               

                                <Controller
                                    name="Subjects"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            isMulti
                                            styles={selectStyles}
                                            placeholder="Select Subjects"
                                            options={subjects.map((subject) => ({
                                                value: subject.subjectName,
                                                label: `${subject.subjectName} (${subject.subjectCode})`,
                                            }))}
                                            value={field.value.map((subject) => ({
                                                value: subject.subjects,
                                                label: subject.subjects,
                                            }))}
                                            onChange={(selected) =>
                                                field.onChange(
                                                    selected.map((item) => ({
                                                        subjects: item.value,
                                                    }))
                                                )
                                            }
                                        />
                                    )}
/>
                            </div>
                        </div>

                        {/* ── Submit ── */}
                        <div className="flex items-center justify-end gap-4">
                            <button type="button" onClick={() => navigate('/teachers')} className="secondary-btn py-4! px-10! cursor-pointer">
                                Cancel
                            </button>
                            <button type="submit" disabled={isSubmitting || !isValid}
                                className={`add-btn py-4! px-12! gap-3 shadow-xl shadow-indigo-100 hover:scale-105 ${isSubmitting || !isValid ? "opacity-50 grayscale cursor-not-allowed" : "cursor-pointer"}`}>
                                {isSubmitting ? <Sparkles className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                Add Teacher
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default AddTeacher;
