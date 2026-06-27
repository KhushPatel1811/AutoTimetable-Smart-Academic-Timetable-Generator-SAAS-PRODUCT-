import { useForm } from "react-hook-form";
import axios from "axios";
import { useState, useEffect } from "react";
import BackGround from "../../../Utilities/Background";
import ProfileNavbar from "../Profile/ProfileNavbar";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate, useParams } from "react-router";

interface Subject {
    subjectName: string;
    subjectCode: string;
    semester: number;
    departmentName: string;
    subjectType: string;
    weekly_Lecture_Hour: number;
    weekly_Lab_Hour: number;
    preferred_Room_Type: string;
    teachers: string[]; // Holds array of teacher IDs
}

type FormData = Subject;

interface Teacher {
    teachers: string;
    _id: string;
}

interface Department {
    departmentName: string;
}

function EditSubject() {
    const { register, reset, watch, handleSubmit, setValue, formState: { errors, isSubmitting, isValid } } = useForm<FormData>({
        defaultValues: {
            subjectName: "",
            subjectCode: "",
            semester: 1,
            departmentName: "",
            subjectType: "Lecture",
            weekly_Lecture_Hour: 1,
            weekly_Lab_Hour: 1,
            preferred_Room_Type: "Lecture",
            teachers: []
        },
        mode: "onChange",
        reValidateMode: "onChange"
    });

    const [teacherData, setTeacherData] = useState<Teacher[]>([]);
    const [allTeacherData, setAllTeacherData] = useState<Teacher[]>([]);
    const [departmentData, setDepartmentData] = useState<Department[]>([]);
    const { subjectId } = useParams();
    const navigate = useNavigate();

    // Watch values to dynamically update teachers list and multi-select states
    const watchedSubjectName = watch("subjectName");
    const watchedDepartmentName = watch("departmentName");
    const selectedTeacherIds = watch("teachers") || [];

    // 1. Fetch Subject and Department Base Data
    useEffect(() => {
        const controller = new AbortController();
        async function fetchData() {
            try {
                const config = {
                    signal: controller.signal,
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                }
                const [responseSubject, responseDepartment] = await Promise.all([
                    axios.get(`https://autotimetable-smart-academic-timetable.onrender.com/subjects/edit/${subjectId}`, config),
                    axios.get('https://autotimetable-smart-academic-timetable.onrender.com/departments', config)
                ]);
                
                setDepartmentData(responseDepartment.data?.department || []);
                setAllTeacherData(responseSubject.data?.teacher); 

                const subject = responseSubject.data.subject;
                const formattedSubject = {
                    ...subject,
                    teachers: subject.teachers.map(
                        (teacher: Teacher) => teacher._id
                    )
                };
            console.log("Formatted Subjects",formattedSubject)
            reset(formattedSubject);  

            setValue("teachers",
                formattedSubject.teachers,
                { shouldValidate: true }
            );

            } catch (err: unknown) {
                if (axios.isCancel(err)) return;
                console.error('Initialization Error:', err);
            }
        }
        fetchData();

        return () => controller.abort();
    }, [subjectId, reset]);

    // 2. Dynamic Teacher Data Fetching on Subject/Department adjustments
    useEffect(() => {
        const controller = new AbortController();
        async function fetchTeachersData() {
            if (!watchedSubjectName || !watchedDepartmentName) {
                setTeacherData([]);
                return;
            }

            try {
                const response = await axios.get("https://autotimetable-smart-academic-timetable.onrender.com/teachers/fetchDetails", {
                    params: { 
                        department: watchedDepartmentName, 
                        subject: watchedSubjectName 
                    },
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                    signal: controller.signal
                });
                const teachers = response.data?.teachers || [];
                setTeacherData(teachers);
            } catch (err: unknown) {
                if (axios.isCancel(err)) return;
                console.error("Error fetching teachers data:", err);
                setTeacherData([]);
            }
        }
        fetchTeachersData();

        return () => controller.abort();
    }, [watchedSubjectName, watchedDepartmentName]);

    // Teacher selection toggle handler for custom checkbox UI
    const handleTeacherToggle = (id: string) => {
        if (selectedTeacherIds.includes(id)) {
            setValue('teachers', selectedTeacherIds.filter(tId => tId !== id), { shouldValidate: true, shouldDirty: true });
        } else {
            setValue('teachers', [...selectedTeacherIds, id], { shouldValidate: true, shouldDirty: true });
        }
    };

    // 4. PUT Request Form Submission handler
    async function updateData(data: FormData) {
        try {
            const response = await axios.put(`https://autotimetable-smart-academic-timetable.onrender.com/subjects/edit/${subjectId}`, data, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.data) {
                toast.success('Subject Data Updated Successfully');
                setTimeout(() => {
                    navigate('/subjects');
                }, 3000);
            }
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            toast.error(error.response?.data?.message || 'Subject Update Request Failed');
        }
    }

    return (
        <>
            <div className="flex min-h-screen w-screen overflow-x-hidden text-gray-800 antialiased">
                <div className="h-full -z-10 fixed">
                    <BackGround />
                </div>

                <div className="flex-1 flex flex-col min-w-0">
                    <div className="bg-white/80 px-5 backdrop-blur-md border-b border-gray-200 sticky top-0 z-40">
                        <ProfileNavbar content="Edit Subject Page" />
                    </div>
                    <ToastContainer position="top-right" autoClose={2000} />

                    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl w-full mx-auto space-y-6">
                        <div className="flex flex-col gap-1 text-center sm:text-left">
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                                Edit Subject Details
                            </h1>
                            <p className="text-sm text-gray-500">
                                Modify academic constraints, hours, and instructor assignments for this module.
                            </p>
                        </div>

                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-7">
                            <form onSubmit={handleSubmit(updateData)} className="space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">

                                    {/* SUBJECT NAME */}
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-bold uppercase tracking-wider text-gray-500">
                                            Subject Name
                                        </label>
                                        <input 
                                            type="text" 
                                            placeholder="e.g. Database Management Systems" 
                                            className={`w-full px-3.5 py-2 border rounded-xl text-sm transition-all focus:outline-none focus:ring-2 ${errors.subjectName ? "border-red-300 focus:ring-red-500/20 focus:border-red-500" : "border-gray-300 focus:ring-blue-500/20 focus:border-blue-500"}`} 
                                            {...register("subjectName", {
                                                required: "Subject name is required",
                                                minLength: { value: 3, message: "Minimum 3 characters required" },
                                                maxLength: { value: 50, message: "Maximum 50 characters required" },
                                                pattern: {
                                                    value: /^[A-Za-z0-9 ]+$/,
                                                    message: "Special Characters Not Allowed"
                                                }
                                            })}
                                        />
                                        {errors.subjectName && (
                                            <p className="text-red-500 text-xs mt-0.5 font-medium">{errors.subjectName.message}</p>
                                        )}
                                    </div>

                                    {/* SUBJECT CODE */}
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-bold uppercase tracking-wider text-gray-500">
                                            Subject Code
                                        </label>
                                        <input 
                                            type="text" 
                                            placeholder="e.g. CS101" 
                                            className={`w-full px-3.5 py-2 border rounded-xl text-sm transition-all focus:outline-none focus:ring-2 ${errors.subjectCode ? "border-red-300 focus:ring-red-500/20 focus:border-red-500" : "border-gray-300 focus:ring-blue-500/20 focus:border-blue-500"}`} 
                                            {...register("subjectCode", {
                                                required: "Subject code is required",
                                                pattern: {
                                                    value: /^[A-Za-z0-9-]+$/,
                                                    message: "Invalid Subject Code"
                                                }
                                            })}
                                        />
                                        {errors.subjectCode && (
                                            <p className="text-red-500 text-xs mt-0.5 font-medium">{errors.subjectCode.message}</p>
                                        )}
                                    </div>

                                    {/* SEMESTER */}
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-bold uppercase tracking-wider text-gray-500">
                                            Semester
                                        </label>
                                        <input 
                                            type="number" 
                                            placeholder="Enter semester" 
                                            className={`w-full px-3.5 py-2 border rounded-xl text-sm transition-all focus:outline-none focus:ring-2 ${errors.semester ? "border-red-300 focus:ring-red-500/20 focus:border-red-500" : "border-gray-300 focus:ring-blue-500/20 focus:border-blue-500"}`} 
                                            {...register("semester", {
                                                required: "Semester is required",
                                                valueAsNumber: true,
                                                min: { value: 1, message: "Minimum semester is 1" },
                                                max: { value: 8, message: "Maximum semester is 8" }
                                            })}
                                        />
                                        {errors.semester && (
                                            <p className="text-red-500 text-xs mt-0.5 font-medium">{errors.semester.message}</p>
                                        )}
                                    </div>

                                    {/* DEPARTMENT */}
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-bold uppercase tracking-wider text-gray-500">
                                            Department
                                        </label>
                                        <select 
                                            className={`w-full px-3.5 py-2 border rounded-xl bg-white text-sm transition-all focus:outline-none focus:ring-2 ${errors.departmentName ? "border-red-300 focus:ring-red-500/20 focus:border-red-500" : "border-gray-300 focus:ring-blue-500/20 focus:border-blue-500"}`} 
                                            {...register("departmentName", { required: "Department is required" })}
                                        >
                                            <option value="">Select Department</option>
                                            {departmentData?.map((dept, i) => (
                                                <option key={i} value={dept.departmentName}>
                                                    {dept.departmentName}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.departmentName && (
                                            <p className="text-red-500 text-xs mt-0.5 font-medium">{errors.departmentName.message}</p>
                                        )}
                                    </div>

                                    {/* SUBJECT TYPE */}
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-bold uppercase tracking-wider text-gray-500">
                                            Subject Type
                                        </label>
                                        <select 
                                            className="w-full px-3.5 py-2 border border-gray-300 rounded-xl bg-white text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" 
                                            {...register("subjectType", { required: "Subject type is required" })}
                                        >
                                            <option value="">Select type</option>
                                            <option value="Lecture">Lecture</option>
                                            <option value="Lab">Lab</option>
                                            <option value="Lecture + Lab">Lecture + Lab</option>
                                        </select>
                                        {errors.subjectType && (
                                            <p className="text-red-500 text-xs mt-0.5 font-medium">{errors.subjectType.message}</p>
                                        )}
                                    </div>

                                    {/* ROOM TYPE */}
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-bold uppercase tracking-wider text-gray-500">
                                            Preferred Room
                                        </label>
                                        <select 
                                            className="w-full px-3.5 py-2 border border-gray-300 rounded-xl bg-white text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" 
                                            {...register("preferred_Room_Type", { required: "Room type is required" })}
                                        >
                                            <option value="">Select Room</option>
                                            <option value="Lecture">Lecture Room</option>
                                            <option value="Lab">Lab Room</option>
                                            <option value="Seminar">Seminar Hall</option>
                                            <option value="Auditorium">Auditorium</option>
                                        </select>
                                        {errors.preferred_Room_Type && (
                                            <p className="text-red-500 text-xs mt-0.5 font-medium">{errors.preferred_Room_Type.message}</p>
                                        )}
                                    </div>

                                    {/* LECTURE HOURS */}
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-bold uppercase tracking-wider text-gray-500">
                                            Lecture Hours <span className="normal-case text-gray-400 font-normal">(Weekly)</span>
                                        </label>
                                        <input 
                                            type="number" 
                                            className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" 
                                            {...register("weekly_Lecture_Hour", {
                                                valueAsNumber: true,
                                                min: { value: 0, message: "Cannot be negative" }
                                            })}
                                        />
                                        {errors.weekly_Lecture_Hour && (
                                            <p className="text-red-500 text-xs mt-0.5 font-medium">{errors.weekly_Lecture_Hour.message}</p>
                                        )}
                                    </div>

                                    {/* LAB HOURS */}
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-bold uppercase tracking-wider text-gray-500">
                                            Lab Hours <span className="normal-case text-gray-400 font-normal">(Weekly)</span>
                                        </label>
                                        <input 
                                            type="number" 
                                            className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" 
                                            {...register("weekly_Lab_Hour", {
                                                valueAsNumber: true,
                                                min: { value: 0, message: "Cannot be negative" }
                                            })}
                                        />
                                        {errors.weekly_Lab_Hour && (
                                            <p className="text-red-500 text-xs mt-0.5 font-medium">{errors.weekly_Lab_Hour.message}</p>
                                        )}
                                    </div>
                                </div>

                                {/* TEACHERS MULTI-SELECT - COMPACT CARD UI INTERFACE */}
                                <div className="flex flex-col gap-2 pt-2">
                                    <div className="flex flex-col gap-0.5">
                                        <label className="text-xs font-bold uppercase tracking-wider text-gray-500">
                                            Assign Teachers
                                        </label>
                                        <p className="text-xs text-gray-400">
                                            Select all matching faculty members eligible to conduct classes for this configuration.
                                        </p>
                                    </div>

                                    {teacherData.length === 0 ? (
                                        <div className="text-center py-6 border border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                                            <p className="text-xs text-gray-400 font-medium">
                                                {!watchedSubjectName || !watchedDepartmentName 
                                                    ? "Specify both Subject Name and Department to see eligible teachers." 
                                                    : "No matching faculty found for the current query filters."}
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 p-4 border border-gray-200 rounded-xl max-h-56 overflow-y-auto bg-gray-50/30">
                                            {allTeacherData.map((teacher) => {
                                                  console.log("teacher._id:", teacher._id);
                                                    console.log("comparison:",selectedTeacherIds.includes(String(teacher._id)));
                                                const isChecked = selectedTeacherIds.includes(teacher._id);
                                                return (
                                                    <div 
                                                        key={teacher._id}
                                                        onClick={() => handleTeacherToggle(teacher._id)}
                                                        className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl border text-sm font-medium cursor-pointer select-none transition-all ${isChecked ? "bg-blue-50/70 border-blue-200 text-blue-700 shadow-xs" : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300"}`}
                                                    >
                                                        <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${isChecked ? "bg-blue-600 border-blue-600 text-white" : "border-gray-300 bg-white"}`}>
                                                            {isChecked && (
                                                                <svg className="w-2.5 h-2.5 stroke-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                                </svg>
                                                            )}
                                                        </div>
                                                        <span className="truncate">{teacher.teachers}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-end items-center gap-3 border-t border-gray-100 pt-5">
                                    <button
                                        type="button"
                                        onClick={() => navigate('/subjects')}
                                        className="px-5 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 active:scale-98 transition-all cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit" 
                                        className={`px-6 py-2.5 rounded-xl font-bold text-sm text-white shadow-sm transition-all active:scale-98 cursor-pointer ${isSubmitting || !isValid ? "bg-gray-300 opacity-60 cursor-not-allowed shadow-none" : "bg-blue-600 hover:bg-blue-700 hover:shadow"}`} 
                                        disabled={isSubmitting || !isValid}
                                    >
                                        {isSubmitting ? "Updating..." : "Update Subject"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default EditSubject;