import { useFieldArray, useForm } from "react-hook-form";
import BackGround from "../../../Utilities/Background";
import ProfileNavbar from "../Profile/ProfileNavbar";
import axios from "axios";
import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router";
import { BookOpen, Plus, Trash2, GraduationCap, Layers3, Hash, CalendarDays, Building2, Sliders, ShieldAlert } from "lucide-react";

function AddSubject() {
    interface Department {
        departmentName: string;
    }

    interface Subject {
        subjectName: string;
        subjectCode: string;
        semester: number;
        departmentName: string;
        subjectType: string;
        weekly_Lecture_Hour: number;
        weekly_Lab_Hour: number;
        preferred_Room_Type: string;
        teachers: string[];
    }

    interface FormData {
        Subjects: Subject[];
    }

    interface Teacher {
        _id: string;
        teacherId: string,
        teacherName: string;
    }

    const { register, control, watch, handleSubmit, formState: { errors, isSubmitting, isValid } } = useForm<FormData>({
        defaultValues: {
            Subjects: [{
                subjectName: '',
                subjectCode: '',
                semester: 1,
                departmentName: '',
                subjectType: 'Lecture',
                weekly_Lecture_Hour: 1,
                weekly_Lab_Hour: 1,
                preferred_Room_Type: 'Lecture',
                teachers: []
            }]
        },
        mode: 'onChange',
        reValidateMode: 'onChange'
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'Subjects'
    });

    const [departmentData, setDepartmentData] = useState<Department[]>([]);
    const navigate = useNavigate();
    const [teacherData, setTeacherData] = useState<Record<number, Teacher[]>>({});

    // Fetch departments on page load
    useEffect(() => {
        async function fetchData() {
            try {
                const response = await axios.get('http://localhost:1000/departments', {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                setDepartmentData(response.data?.department || []);
            } catch (err: unknown) {
                console.error('Error fetching departments:', err);
            }
        }
        fetchData();
    }, []);

    // Fetch teachers when department or subject changes
    async function fetchTeachersData(index: number, department: string) {
        const subject = watch(`Subjects.${index}.subjectName`);
        department = watch(`Subjects.${index}.departmentName`);
        if (!department || !subject) return;

        try {
            const response = await axios.get("http://localhost:1000/teachers/fetchDetails",{ 
                    params: { department, subject },
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                }
            );

            setTeacherData((prev) => ({
                ...prev,
                [index]: response.data?.teachers || []
            }));
        } catch {
            setTeacherData((prev) => ({
                ...prev,
                [index]: []
            }));
        }
    }

    // Submit form data
    async function submitData(data: FormData) {
        console.log(data)
        try {
            const response = await axios.post('http://localhost:1000/subjects/add', data, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.data) {
                toast.success('Subject added successfully');
                setTimeout(() => {
                    navigate('/subjects');
                }, 2000);
            }
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            toast.error(error.response?.data?.message || 'Error occurred while saving data');
        }
    }

    return (
        <div className="flex min-h-screen w-screen bg-slate-100 relative">
            <div className="fixed inset-0 -z-10">
                <BackGround />
            </div>

            <div className="flex-1 flex flex-col pb-12">
                {/* Navbar Header */}
                <div className="sticky top-0 z-50 bg-white border-b border-slate-200 px-6 py-4 shadow-xs">
                    <ProfileNavbar content="Add New Subject" />
                    <ToastContainer position="top-right" autoClose={2000} />
                </div>

                <div className="p-6 max-w-7xl w-full mx-auto space-y-6">
                    {/* Page Description Banner */}
                    <div className="bg-indigo-600 rounded-2xl p-6 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-indigo-500 rounded-xl">
                                <BookOpen className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold">Add New Subjects</h1>
                                <p className="text-indigo-100 text-sm mt-0.5">Fill out the fields below to add new courses to your institute</p>
                            </div>
                        </div>

                        <button 
                            type="button"
                            className="bg-white text-indigo-600 px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-indigo-50 transition-colors shadow-xs"
                            onClick={() => navigate("/subjects")}>
                            Back to List
                        </button>
                    </div>

                    {/* Main Form */}
                    <form onSubmit={handleSubmit(submitData)} className="space-y-6">
                        <div className="space-y-6">
                            {fields.map((field, index) => (
                                <div key={field.id} className="relative bg-white border border-slate-200 p-6 rounded-2xl shadow-sm hover:border-indigo-300 transition-colors">
                                    
                                    {/* Counter Badge */}
                                    <div className="absolute top-0 left-6 -translate-y-1/2 bg-slate-800 text-white font-bold text-xs px-3 py-1 rounded-full shadow-xs">
                                        Subject #{index + 1}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                                        
                                        {/* SUBJECT NAME */}
                                        <div className="space-y-1">
                                            <label className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                                                <GraduationCap size={14} className="text-indigo-500" /> Subject Name
                                            </label>
                                            <input type="text" placeholder="e.g. Computer Networks" className="input-box border border-slate-300 rounded-lg p-2.5 w-full text-sm" {...register(`Subjects.${index}.subjectName`, {
                                                required: "Subject name is required",
                                                minLength: { value: 3, message: "Minimum 3 characters" },
                                                maxLength: { value: 50, message: "Maximum 50 characters" },
                                                pattern: { value: /^[A-Za-z0-9\s.,&()-]+$/, message: "Contains invalid characters" }
                                            })}/>
                                            {errors?.Subjects?.[index]?.subjectName?.message && (
                                                <p className="text-red-500 text-xs flex items-center gap-1 mt-1">
                                                    <ShieldAlert size={12} /> {errors.Subjects[index].subjectName.message}
                                                </p>
                                            )}
                                        </div>

                                        {/* SUBJECT CODE */}
                                        <div className="space-y-1">
                                            <label className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                                                <Hash size={14} className="text-indigo-500" /> Subject Code
                                            </label>
                                            <input type="text" placeholder="e.g. CS101" className="input-box border border-slate-300 rounded-lg p-2.5 w-full text-sm" {...register(`Subjects.${index}.subjectCode`, {
                                                required: "Subject code is required",
                                                pattern: { value: /^[A-Za-z0-9]+$/, message: "Alphanumeric characters only" }
                                            })}/>
                                            {errors?.Subjects?.[index]?.subjectCode?.message && (
                                                <p className="text-red-500 text-xs flex items-center gap-1 mt-1">
                                                    <ShieldAlert size={12} /> {errors.Subjects[index].subjectCode.message}
                                                </p>
                                            )}
                                        </div>

                                        {/* SEMESTER */}
                                        <div className="space-y-1">
                                            <label className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                                                <CalendarDays size={14} className="text-indigo-500" /> Semester
                                            </label>
                                            <input type="number" placeholder="1-12" className="input-box border border-slate-300 rounded-lg p-2.5 w-full text-sm" {...register(`Subjects.${index}.semester`, {
                                                required: "Semester is required",
                                                valueAsNumber: true,
                                                min: { value: 1, message: "Minimum is 1" },
                                                max: { value: 12, message: "Maximum is 12" }
                                            })}/>
                                            {errors?.Subjects?.[index]?.semester?.message && (
                                                <p className="text-red-500 text-xs flex items-center gap-1 mt-1">
                                                    <ShieldAlert size={12} /> {errors.Subjects[index].semester.message}
                                                </p>
                                            )}
                                        </div>

                                        {/* DEPARTMENT */}
                                        <div className="space-y-1">
                                            <label className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                                                <Building2 size={14} className="text-indigo-500" /> Department
                                            </label>
                                            <select className="input-box border border-slate-300 rounded-lg p-2.5 w-full bg-white text-sm cursor-pointer" {...register(`Subjects.${index}.departmentName`, {
                                                required: "Department is required",
                                                onChange: (e) => fetchTeachersData(index, e.target.value)
                                            })}>
                                                <option value="">Select Department</option>
                                                {departmentData.map((dept, dIdx) => (
                                                    <option key={dIdx} value={dept.departmentName}>{dept.departmentName}</option>
                                                ))}
                                            </select>
                                            {errors?.Subjects?.[index]?.departmentName?.message && (
                                                <p className="text-red-500 text-xs flex items-center gap-1 mt-1">
                                                    <ShieldAlert size={12} /> {errors.Subjects[index].departmentName.message}
                                                </p>
                                            )}
                                        </div>

                                        {/* SUBJECT TYPE */}
                                        <div className="space-y-1">
                                            <label className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                                                <Layers3 size={14} className="text-indigo-500" /> Subject Type
                                            </label>
                                            <select className="input-box border border-slate-300 rounded-lg p-2.5 w-full bg-white text-sm cursor-pointer" {...register(`Subjects.${index}.subjectType`, {
                                                required: "Subject type is required"
                                            })}>
                                                <option value="Lecture">Lecture Only</option>
                                                <option value="Lab">Lab Only</option>
                                                <option value="Lecture + Lab">Lecture + Lab</option>
                                            </select>
                                        </div>

                                        {/* LECTURE HOURS */}
                                        <div className="space-y-1">
                                            <label className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                                                <Sliders size={14} className="text-indigo-500" /> Lecture Hours / Week
                                            </label>
                                            <input type="number" className="input-box border border-slate-300 rounded-lg p-2.5 w-full text-sm" {...register(`Subjects.${index}.weekly_Lecture_Hour`, {
                                                valueAsNumber: true,
                                                min: { value: 0, message: "Cannot be negative" }
                                            })}/>
                                        </div>

                                        {/* LAB HOURS */}
                                        <div className="space-y-1">
                                            <label className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                                                <Sliders size={14} className="text-indigo-500" /> Lab Hours / Week
                                            </label>
                                            <input type="number" className="input-box border border-slate-300 rounded-lg p-2.5 w-full text-sm" {...register(`Subjects.${index}.weekly_Lab_Hour`, {
                                                valueAsNumber: true,
                                                min: { value: 0, message: "Cannot be negative" }
                                            })}/>
                                        </div>

                                        {/* ROOM TYPE */}
                                        <div className="space-y-1">
                                            <label className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                                                <Building2 size={14} className="text-indigo-500" /> Preferred Room Type
                                            </label>
                                            <select className="input-box border border-slate-300 rounded-lg p-2.5 w-full bg-white text-sm cursor-pointer" {...register(`Subjects.${index}.preferred_Room_Type`, {
                                                required: "Room type is required"
                                            })}>
                                                <option value="Lecture">Classroom</option>
                                                <option value="Lab">Laboratory</option>
                                                <option value="Seminar">Seminar Hall</option>
                                                <option value="Auditorium">Auditorium</option>
                                            </select>
                                        </div>

                                        {/* TEACHER SELECTION */}
                                        <div className="md:col-span-2 lg:col-span-3 space-y-1">
                                            <label className="text-xs font-semibold text-slate-500">
                                                Assign Faculty <span className="text-xs text-slate-400 font-normal">(Hold Ctrl/Cmd to select multiple)</span>
                                            </label>
                                            <select multiple className="border border-slate-300 rounded-lg p-2 w-full bg-white h-24 text-sm cursor-pointer" {...register(`Subjects.${index}.teachers`)}>
                                                {(teacherData[index] ?? []).map((teacher) => (
                                                    <option key={teacher.teacherId} value={teacher._id} className="p-1 rounded-md text-sm">
                                                        {teacher.teacherName}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* REMOVE BUTTON */}
                                        <div className="flex items-end justify-end">
                                            <button 
                                                type="button" 
                                                onClick={() => remove(index)} 
                                                className="w-full text-center px-4 py-2.5 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-600 hover:text-white transition-colors flex items-center justify-center gap-2 text-sm font-semibold cursor-pointer">
                                                <Trash2 size={14} /> Remove Form
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* Empty Form State */}
                            {fields.length === 0 && (
                                <div className="p-12 text-center border-2 border-dashed border-slate-300 rounded-2xl bg-white/50 space-y-2">
                                    <BookOpen className="w-10 h-10 mx-auto text-slate-300" />
                                    <p className="text-slate-500 font-medium text-sm">No subject fields active. Add a row below to begin.</p>
                                </div>
                            )}
                        </div>

                        {/* Bottom Actions */}
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200">
                            <button 
                                type="button" 
                                onClick={() => append({ subjectName: "", subjectCode: "", semester: 1, departmentName: "", subjectType: "Lecture", weekly_Lecture_Hour: 1, weekly_Lab_Hour: 1, preferred_Room_Type: "Lecture", teachers: [] })} 
                                className="w-full sm:w-auto px-5 py-3 bg-white border border-slate-300 text-slate-700 font-semibold text-sm rounded-xl hover:border-indigo-500 hover:text-indigo-600 transition-all flex items-center justify-center gap-2 cursor-pointer">
                                <Plus size={16} /> Add More Subjects
                            </button>

                            <button 
                                type="submit"
                                className={`w-full sm:w-auto px-8 py-3 bg-indigo-600 text-white font-semibold text-sm rounded-xl flex items-center justify-center gap-2 transition-all ${isSubmitting || !isValid ? 'opacity-50 cursor-not-allowed' : "hover:bg-indigo-700 cursor-pointer"}`} 
                                disabled={isSubmitting || !isValid}>
                                {isSubmitting ? 'Saving...' : 'Save All Subjects'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default AddSubject;