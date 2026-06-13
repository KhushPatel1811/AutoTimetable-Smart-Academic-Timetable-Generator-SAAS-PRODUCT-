import { useForm } from "react-hook-form"
import axios from "axios"
import { useState, useEffect } from "react"
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
    teacherName: string[]; // This holds array of teacher IDs selected
}

type FormData = Subject;

interface Teacher {
    teacherName: string;
    teacherId: string;
}

interface Department {
    departmentName: string;
}

function EditSubject() {
    // 1. Hooks safely initialized inside the component function block
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
            teacherName: []
        },
        mode: "onChange",
        reValidateMode: "onChange"
    });

    const [teacherData, setTeacherData] = useState<Teacher[]>([]);
    const [departmentData, setDepartmentData] = useState<Department[]>([]);
    const [subjectData, setSubjectData] = useState<Subject | null>(null)
    const {subjectId} = useParams()
    const navigate = useNavigate()



    // Watch values closely to drive automated teacher lookups safely
    const watchedSubjectName = watch("subjectName");
    const watchedDepartmentName = watch("departmentName");



    


        useEffect(()=>{
        async function fetchData() {
            try {
                const responseSubject = await axios.get(`http://localhost:1000/subjects/edit/${subjectId}`)
                console.log('SUBJECT DATA:', responseSubject.data)
                
                const responseDepartment = await axios.get('http://localhost:1000/departments')
                console.log('DEPARTMENT DATA:', responseDepartment.data)
                setDepartmentData(responseDepartment.data?.department   )

                const subject = responseSubject.data?.subject
                setSubjectData(subject)
                reset(subject)
            }
            catch(err: any) {
                console.log('Error Occurred:', err)
                console.log('Response:', err.respones?.data?.message)
                console.log('Status:', err.response?.status)
            }
        }
        fetchData()
    },[])


    // 2. Fetch logic extracted into a resilient, lifecycle-safe effect loop
    useEffect(()=>{
        async function fetchTeachersData() {
            if (!watchedSubjectName || !watchedDepartmentName) {
            setTeacherData([]);
            return;
        }

        try {
            const response = await axios.get("http://localhost:1000/teachers/fetchDetails",{
                    params: { 
                        department: watchedDepartmentName, 
                        subject: watchedSubjectName 
                    }
                });
                const teachers = response.data?.teachers || [];

                setTeacherData(teachers);
            } catch (err) {
                console.error("Error fetching teachers data:", err);
                setTeacherData([]);
            }
        }
        fetchTeachersData()
    },[watchedSubjectName, watchedDepartmentName])


    useEffect(()=>{
        if(teacherData.length > 0 && subjectData) {
            setValue('teacherName',subjectData.teacherName)
        }
    },[teacherData, subjectData, setValue])




    async function updateData(data: FormData) {
        console.log("Submitting Sanitized Form Data Structure:", data);
        // Execute your axios.put / axios.post patch update here

        try {
            const response = await axios.put('http://localhost:1000/subjects/edit' ,{...data, subjectId},{
                headers:{
                    'Content-Type' : 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            })

            if(response.data) {
                toast.success('Subject Data Updated Successfully')

                setTimeout(()=>{
                    navigate('/subjects')
                },3000)
            }
        }
        catch(err: any) {
            console.log('Error Occurred:', err)
            console.log('Response:', err.response?.data?.message)
            console.log('Status:', err.response?.status)
            toast.error(err.response?.data?.message || 'Subject Updated Request Failed')
        }
    }

    return (
        <>
            <div className="flex min-h-screen w-screen overflow-x-hidden">
                <div className="h-full -z-10 fixed">
                    <BackGround />
                </div>

                <div className="flex-1 flex-col min-w-0">
                    <div className="bg-white border-b border-gray-200">
                        <ProfileNavbar content="Edit Subject Page" />
                    </div>
                    <ToastContainer position="top-right" autoClose={2000} />

                    <div className="p-6 max-w-7xl w-full bg-gray-50 mx-auto space-y-6">
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight text-center">
                            Edit Subject Details
                        </h1>

                        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-6">
                            <form onSubmit={handleSubmit(updateData)} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">

                                    {/* SUBJECT NAME */}
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                                            Subject Name
                                        </label>
                                        <input type="text" placeholder="Enter subject name" className="w-full px-3.5 py-2 border rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" {...register("subjectName", {
                                                required: "Subject name is required",
                                                minLength: { value: 3, message: "Minimum 3 characters required" },
                                                maxLength: { value: 50, message: "Maximum 50 characters required" },
                                                pattern: {
                                                    value: /^[A-Za-z0-9 ]+$/,
                                                    message: "Special Characters Not Allowed"
                                                }
                                            })}/>
                                        {errors.subjectName && (
                                            <p className="text-red-500 text-xs">{errors.subjectName.message}</p>
                                        )}
                                    </div>

                                    {/* SUBJECT CODE */}
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                                            Subject Code
                                        </label>
                                        <input type="text" placeholder="e.g. CS101" className="w-full px-3.5 py-2 border rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" {...register("subjectCode", {
                                                required: "Subject code is required",
                                                pattern: {
                                                    value: /^[A-Za-z0-9-]+$/, // Added dash helper to support codes like CS-101
                                                    message: "Invalid Subject Code"
                                                }
                                            })}/>
                                        {errors.subjectCode && (
                                            <p className="text-red-500 text-xs">{errors.subjectCode.message}</p>
                                        )}
                                    </div>

                                    {/* SEMESTER */}
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                                            Semester
                                        </label>
                                        <input type="number" placeholder="Enter semester" className="w-full px-3.5 py-2 border rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" {...register("semester", {
                                                required: "Semester is required",
                                                valueAsNumber: true,
                                                min: { value: 1, message: "Minimum semester is 1" },
                                                max: { value: 8, message: "Maximum semester is 8" }
                                            })}/>
                                        {errors.semester && (
                                            <p className="text-red-500 text-xs">{errors.semester.message}</p>
                                        )}
                                    </div>

                                    {/* DEPARTMENT */}
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                                            Department
                                        </label>
                                        <select className="w-full px-3.5 py-2 border rounded-xl bg-white text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" {...register("departmentName", { required: "Department is required" })}>
                                            <option value="">Select Department</option>
                                            {departmentData?.map((dept, i) => (
                                                <option key={i} value={dept.departmentName}>
                                                    {dept.departmentName}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.departmentName && (
                                            <p className="text-red-500 text-xs">{errors.departmentName.message}</p>
                                        )}
                                    </div>

                                    {/* SUBJECT TYPE */}
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                                            Subject Type
                                        </label>
                                        <select className="w-full px-3.5 py-2 border rounded-xl bg-white text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" {...register("subjectType", { required: "Subject type is required" })}>
                                            <option value="">Select type</option>
                                            <option value="Lecture">Lecture</option>
                                            <option value="Lab">Lab</option>
                                            <option value="Lecture + Lab">Lecture + Lab</option>
                                        </select>
                                        {errors.subjectType && (
                                            <p className="text-red-500 text-xs">{errors.subjectType.message}</p>
                                        )}
                                    </div>

                                    {/* LECTURE HOURS */}
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                                            Lecture Hours
                                        </label>
                                        <input type="number" className="w-full px-3.5 py-2 border rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" {...register("weekly_Lecture_Hour", {
                                                valueAsNumber: true,
                                                min: { value: 0, message: "Cannot be negative" }
                                            })}/>
                                        {errors.weekly_Lecture_Hour && (
                                            <p className="text-red-500 text-xs">{errors.weekly_Lecture_Hour.message}</p>
                                        )}
                                    </div>

                                    {/* LAB HOURS */}
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                                            Lab Hours
                                        </label>
                                        <input type="number" className="w-full px-3.5 py-2 border rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" {...register("weekly_Lab_Hour", {
                                                valueAsNumber: true,
                                                min: { value: 0, message: "Cannot be negative" }
                                            })}/>
                                        {errors.weekly_Lab_Hour && (
                                            <p className="text-red-500 text-xs">{errors.weekly_Lab_Hour.message}</p>
                                        )}
                                    </div>

                                    {/* ROOM TYPE */}
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                                            Preferred Room
                                        </label>
                                        <select className="w-full px-3.5 py-2 border rounded-xl bg-white text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" {...register("preferred_Room_Type", { required: "Room type is required" })}>
                                            <option value="">Select Room</option>
                                            <option value="Lecture">Lecture Room</option>
                                            <option value="Lab">Lab Room</option>
                                            <option value="Seminar">Seminar Hall</option>
                                            <option value="Auditorium">Auditorium</option>
                                        </select>
                                        {errors.preferred_Room_Type && (
                                            <p className="text-red-500 text-xs">{errors.preferred_Room_Type.message}</p>
                                        )}
                                    </div>

                                    {/* TEACHERS (MULTIPLE SELECT FIXED) */}
                                    <div className="flex flex-col gap-1.5 md:col-span-2 lg:col-span-4">
                                        <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                                            Assign Teachers <span className="text-gray-400 normal-case">(Hold Ctrl / Cmd to select multiple)</span>
                                        </label>
                                        <select multiple className="w-full h-32 px-3.5 py-2 border rounded-xl bg-white text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" {...register("teacherName")}>
                                            {teacherData.map((teacher) => (
                                                <option key={teacher.teacherId} value={teacher.teacherId}>
                                                    {teacher.teacherName}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="flex justify-end border-t border-gray-100 pt-5">
                                    <button type="submit" className={`px-6 py-2.5 rounded-xl font-bold text-sm text-white shadow-md transition-all active:scale-98 cursor-pointer ${isSubmitting || !isValid ? "bg-gray-300 opacity-60 cursor-not-allowed shadow-none" : "bg-blue-600 hover:bg-blue-700"}`} disabled={isSubmitting || !isValid}>
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