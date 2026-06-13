import { useFieldArray, useForm } from "react-hook-form";
import BackGround from "../../../Utilities/Background";
import ProfileNavbar from "../Profile/ProfileNavbar";
import axios from "axios";
import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router";

function AddSubject() {
    interface Department {
        departmentName:string
    }


    interface Subject {
        subjectName: string,
        subjectCode: string,
        semester: number,
        departmentName: string,
        subjectType: string,
        weekly_Lecture_Hour: number,
        weekly_Lab_Hour: number,
        preferred_Room_Type: string,
        teacherName: string[]
    }

    interface FormData {
        Subjects: Subject[]
    }

    interface Teacher {
        teacherId: string,
        teacherName: string
    }

    const {register, control, watch, handleSubmit, formState:{errors, isSubmitting, isValid}} = useForm<FormData>({
        defaultValues:{
            Subjects: [{
                subjectName: '',
                subjectCode: '',
                semester: 1,
                departmentName: '',
                subjectType: 'Lecture',
                weekly_Lecture_Hour: 1,
                weekly_Lab_Hour: 1,
                preferred_Room_Type: 'Lecture',
                teacherName: []
            }]
        },
        mode: 'onChange',
        reValidateMode: 'onChange'
    })

    const {fields, append, remove} = useFieldArray({
        control,
        name: 'Subjects'
    })


    const [departmentData, setDepartmentData] = useState<Department[]>([])
    const navigate = useNavigate()
    const [teacherData, setTeacherData] = useState<Record<number, Teacher[]>>({});

    useEffect(()=>{
        async function fetchData() {
            try {
                const response = await axios.get('http://localhost:1000/departments')
                console.log('FETCHED DEPARTMENT DATA:', response.data)
                setDepartmentData(response.data?.department)
            }
            catch(err: any) {
                console.log('Error Occurred:', err)
                console.log('Response:', err.response?.data?.message);
                console.log('Status:', err.response?.status);
                toast.error(err.response?.data?.message || 'Error Occurred Fetching Department Details')
            }
        }
        fetchData()
    },[])


async function fetchTeachersData(index: number, department: string) {
    const subject = watch(`Subjects.${index}.subjectName`);
    department = watch(`Subjects.${index}.departmentName`);
    // ✅ FIX: prevent bad API call
    if (!department || !subject) return;

    try {
        const response = await axios.get(
            "http://localhost:1000/teachers/fetchDetails",
            {
                params: { department, subject }
            }
        );

        setTeacherData((prev) => ({
            ...prev,
            [index]: response.data?.teachers || []
        }));    
    } 
    catch (err) {
        console.error(err);

        setTeacherData((prev) => ({
            ...prev,
            [index]: []
        }));
    } 
}

    async function submitData(data: FormData) {
        console.log(data)
        const userItem = localStorage.getItem('user')
        const userId = userItem ? JSON.parse(userItem)._id : ''
        const instituteId = userItem ? JSON.parse(userItem).instituteId : ''

        console.log('USER ID IN FRONTEND:', userId)
        console.log('INSTITUTE ID IN FRONTEND:', instituteId)
        try {
            const response = await axios.post('http://localhost:1000/subjects/add', {...data, userId, instituteId}, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            })
            console.log('DATA SUBMITTED:', response.data)

            if(response.data) {
                toast.success('Subject Data Added Successfully')

                setTimeout(()=>{
                    navigate('/subjects')
                },3000)
            }
        }
        catch(err: any) {
            console.log('Error Occurred:', err)
            console.log('Response:', err.response?.data?.message);
            console.log('Status:', err.response?.status);
            toast.error(err.response?.data?.message || 'Error Occurred While Submitting Subject Data')
        }
    }

    return(
        <>
            <div className="flex">
                <div className="h-full -z-10">
                    <BackGround />
                </div>

                <div className="flex-1">
                    <ProfileNavbar content="Add Subject Page" />
                    <ToastContainer position="top-right" autoClose={2000} />
                    <h1 className="text-4xl text-center font-bold mb-5">Subject Details</h1>

                    <div className="bg-white z-10 mx-5">
                        <form action="" onSubmit={handleSubmit(submitData)}>
                            <div className="border rounded-xl">
                                {
                                fields.map((field, index) => (
                                    <div key={field.id} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 mb-4">

                                        {/* SUBJECT NAME */}
                                        <div>
                                            <label className="text-sm font-medium">Subject Name</label>
                                            <input type="text" placeholder="Enter subject name" className="input-box" {...register(`Subjects.${index}.subjectName`, {
                                                    required: "Subject name is required",
                                                    minLength: {
                                                        value: 3,
                                                        message: "Minimum 3 characters required"
                                                    },
                                                    maxLength: {
                                                        value: 50,
                                                        message: "Maximum 50 characters required"
                                                    },
                                                    pattern: {
                                                        value: /^[A-Za-z0-9 ]+$/,
                                                        message: "Special Characters Not Allowed"
                                                    }
                                                })}/>
                                            <p className="text-red-500 text-xs mt-1">
                                                {errors?.Subjects?.[index]?.subjectName?.message}
                                            </p>
                                        </div>


                                        {/* SUBJECT CODE */}
                                        <div>
                                            <label className="text-sm font-medium">Subject Code</label>
                                            <input type="text" placeholder="e.g. CS101" className="input-box" {...register(`Subjects.${index}.subjectCode`, {
                                                    required: "Subject code is required",
                                                    pattern:{
                                                        value: /^[A-Za-z0-9]+$/,
                                                        message: ''
                                                    }
                                                })}/>
                                            <p className="text-red-500 text-xs mt-1">
                                                {errors?.Subjects?.[index]?.subjectCode?.message}
                                            </p>
                                        </div>



                                        {/* SEMESTER */}
                                        <div>
                                            <label className="text-sm font-medium">Semester</label>
                                            <input type="number" placeholder="Enter semester (1-8)" className="input-box" {...register(`Subjects.${index}.semester`, {
                                                    required: "Semester is required",
                                                    valueAsNumber: true,
                                                    min: {
                                                        value: 1,
                                                        message: "Minimum semester is 1"
                                                    },
                                                    max: {
                                                        value: 8,
                                                        message: "Maximum semester is 8"
                                                    }
                                                })}/>
                                            <p className="text-red-500 text-xs mt-1">
                                                {errors?.Subjects?.[index]?.semester?.message}
                                            </p>
                                        </div>



                                        {/* DEPARTMENT */}
                                        <div>
                                            <label className="text-sm font-medium">Department</label>
                                            <select className="input-box" {...register(`Subjects.${index}.departmentName`, {
                                                    required: "Department is required",
                                                    onChange: (e)=>fetchTeachersData(index, e.target.value)
                                                })}>
                                                    <option value="">Select Department</option>
                                                    {
                                                        departmentData != null && 
                                                        departmentData.map((dept, index)=>(
                                                            <option key={index} value={dept.departmentName}>{dept.departmentName}</option>
                                                        ))
                                                    }
                                                </select>
                                            <p className="text-red-500 text-xs mt-1">
                                                {errors?.Subjects?.[index]?.departmentName?.message}
                                            </p>
                                        </div>



                                        {/* SUBJECT TYPE */}
                                        <div>
                                            <label className="text-sm font-medium">Subject Type</label>
                                            <select className="input-box" {...register(`Subjects.${index}.subjectType`, {
                                                    required: "Subject type is required"
                                                })}>
                                                <option value="">Select type</option>
                                                <option value="Lecture">Lecture</option>
                                                <option value="Lab">Lab</option>
                                                <option value="Lecture + Lab">Lecture + Lab</option>
                                            </select>
                                            <p className="text-red-500 text-xs mt-1">
                                                {errors?.Subjects?.[index]?.subjectType?.message}
                                            </p>
                                        </div>



                                        {/* LECTURE HOURS */}
                                        <div>
                                            <label className="text-sm font-medium">Lecture Hours</label>
                                            <input type="number" placeholder="e.g. 3" className="input-box" {...register(`Subjects.${index}.weekly_Lecture_Hour`, {
                                                valueAsNumber: true,
                                                min: {
                                                    value: 0,
                                                    message: "Cannot be negative"
                                                }
                                            })}/>
                                            <p className="text-red-500 text-xs mt-1">
                                                {errors?.Subjects?.[index]?.weekly_Lecture_Hour?.message}
                                            </p>
                                        </div>



                                        {/* LAB HOURS */}
                                        <div>
                                            <label className="text-sm font-medium">Lab Hours</label>
                                            <input type="number" placeholder="e.g. 2" className="input-box" {...register(`Subjects.${index}.weekly_Lab_Hour`, {
                                                valueAsNumber: true,
                                                min: {
                                                    value: 0,
                                                    message: "Cannot be negative"
                                                }
                                            })}/>
                                            <p className="text-red-500 text-xs mt-1">
                                                {errors?.Subjects?.[index]?.weekly_Lab_Hour?.message}
                                            </p>
                                        </div>



                                        {/* ROOM TYPE */}
                                        <div>
                                            <label className="text-sm font-medium">Preferred Room</label>
                                            <select className="input-box" {...register(`Subjects.${index}.preferred_Room_Type`, {
                                                required: "Room type is required"
                                            })}>
                                                <option value="">Select room</option>
                                                <option value="Lecture">Lecture Room</option>
                                                <option value="Lab">Lab Room</option>
                                                <option value="Seminar">Seminar Hall</option>
                                                <option value="Auditorium">Auditorium</option>
                                            </select>
                                            <p className="text-red-500 text-xs mt-1">
                                                {errors?.Subjects?.[index]?.preferred_Room_Type?.message}
                                            </p>
                                        </div>

                                        <div>
                                            <label htmlFor={`teacherName_${index}`}>Teacher Name</label>
                                            <select multiple className="input-box h-32" {...register(`Subjects.${index}.teacherName`)}>
                                                {(teacherData[index] ?? []).map((teacher) => (
                                                    <option key={teacher.teacherId} value={teacher.teacherId}>
                                                        {teacher.teacherName}
                                                    </option>
                                                ))}
                                            </select>                                        
                                        </div>


                                        {/* DELETE BUTTON */}
                                        <div className="flex items-end">
                                            <button type="button" onClick={() => append({subjectName: "",subjectCode: "",semester: 1,departmentName: "",subjectType: "Lecture",weekly_Lecture_Hour: 1,weekly_Lab_Hour: 1,preferred_Room_Type: "Lecture", teacherName:[]})} className="bg-blue-600 text-white px-4 py-2 rounded mt-4 mx-4 font-bold hover:cursor-pointer hover:bg-blue-700">
                                                Add Row
                                            </button>

                                            <button type="button" onClick={() => remove(index)} className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded font-bold hover:cursor-pointer">
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                <div className="flex justify-center my-5">
                                    <button className={`add-btn ${isSubmitting || !isValid ? 'opacity-50 cursor-not-allowed' : ""} `} disabled={isSubmitting || !isValid}>{isSubmitting ? 'Registering...': 'Register Subject'}</button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    )
}

export default AddSubject;