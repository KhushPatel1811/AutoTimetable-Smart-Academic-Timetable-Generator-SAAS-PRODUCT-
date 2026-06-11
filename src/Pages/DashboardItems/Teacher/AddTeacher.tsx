import axios from "axios";
import BackGround from "../../../Utilities/Background";
import ProfileNavbar from "../Profile/ProfileNavbar";
import { useFieldArray, useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { ToastContainer, toast } from "react-toastify";
import { useEffect, useState } from "react";

    function AddTeacher() {
        interface Teacher {
            teacherName: string,
            instituteName: string,
            teacherEmail: string,
            teacherPhoneNumber: string,
            teacherDepartment: string,
            teacherAvailability: string,
            Subjects: {
                subjects: string 
            }[]
        }

        interface Department {
            departmentName: string
        }

        const {register, handleSubmit, control, formState: {errors, isValid, isSubmitting}} = useForm<Teacher>({
            defaultValues: {
                teacherName: '',
                instituteName: '',
                teacherEmail: '',
                teacherPhoneNumber: '',
                teacherDepartment: '',
                teacherAvailability: '',
                Subjects: [{subjects: ''}]
            },
            mode: 'onChange',
            reValidateMode: 'onChange'
        })

        const {fields, append, remove} = useFieldArray({
            control,
            name: 'Subjects'
        })


        const navigate = useNavigate()
        const [department, setDepartment] = useState<Department[] | null>([])

        useEffect(()=>{
            async function fetchData() {
                try {
                    const response = await axios.get('http://localhost:1000/departments')
                    console.log('DEPARTMENT DATA:', response.data)

                    setDepartment(response.data.department)
                }
                catch(err: any) {
                    console.log('Error Occurred:', err)
                    console.log('Response:', err.response?.data?.message)
                    console.log('Status:', err.response?.status)
                }
            }
            fetchData()
        },[])


        async function submitData(data: Teacher) {
            console.log(data)

            try {
                //! INSERTING TEACHER DATA
                const response = await axios.post('http://localhost:1000/teachers/add', data, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization':    `Bearer ${localStorage.getItem('token')}`
                    }
                })

                console.log("FrontEnd Sending New Teacher Data: ",response.data)
                
                if(response.data) {
                    toast.success('Teacher Registered Successfully')
                    setTimeout(() => {
                        navigate('/teachers')
                    }, 3000)
                }
            }
            catch(err: any) {
                console.log('Error Occurred', err)
                console.log('Response: ',err.response?.data?.message)
                console.log('Status: ',err.response?.status);
                toast.error(err.response?.data?.message || 'Teacher Registration Failed')
            }
        }

        return (
            <>
                <ProfileNavbar content="Teacher Registration Page"/>
                <ToastContainer position="top-right" autoClose={2000} />

                <div className="relative min-h-screen px-4 py-6 sm:px-6 lg:px-8">
                    <div className="pointer-events-none">
                        <BackGround />
                    </div>

                    <form onSubmit={handleSubmit(submitData)}>
                        <div className="relative z-10 bg-white border rounded-2xl shadow-lg w-full max-w-4xl mx-auto p-4 sm:p-6 md:p-8">

                            <div className="mb-8">
                                <h1 className="text-2xl md:text-3xl font-bold text-center">
                                    Enter Teacher Details
                                </h1>
                            </div>

                            <div className="space-y-6">

                                {/* Teacher Name */}
                                <div className="addTeacher-div">
                                    <label htmlFor="teacherName" className="label-style sm:w-1/3">
                                        Teacher Name
                                    </label>

                                    <div className="sm:w-2/3 w-full">
                                        <input type="text" id="teacherName" placeholder="Enter Teacher Name" className="input-box w-full max-w-none" {...register("teacherName", {
                                                required: "Teacher Name Is Required",
                                                minLength: {
                                                    value: 3,
                                                    message: "Teacher Name Must Be At Least 3 Characters"
                                                },
                                                maxLength: {
                                                    value: 50,
                                                    message: "Teacher Name Cannot Exceed 50 Characters"
                                                },
                                                pattern: {
                                                    value: /^[A-Za-z ]+$/,
                                                    message: "Teacher Name Should Contain Only Letters"
                                                }
                                            })}/>

                                        {errors.teacherName && <p className="text-red-500 text-sm">{errors.teacherName.message}</p>}
                                    </div>
                                </div>

                                <div className="addTeacher-div">
                                    <label htmlFor="instituteName" className="label-style sm:w-1/3">
                                        Institute Name
                                    </label>

                                    <div className="sm:w-2/3 w-full">
                                        <input
                                            type="text"
                                            id="instituteName"
                                            placeholder="Enter Institute Name"
                                            className="input-box w-full max-w-none"
                                            {...register("instituteName", {
                                                required: "Institute Name Is Required",
                                                minLength: {
                                                    value: 3,
                                                    message: "Institute Name Must Be At Least 3 Characters"
                                                },
                                                maxLength: {
                                                    value: 100,
                                                    message: "Institute Name Cannot Exceed 100 Characters"
                                                },
                                                pattern: {
                                                    value: /^[A-Za-z ]+$/,
                                                    message: "Institute Name Should Contain Only Letters"
                                                }
                                            })}
                                        />

                                        {errors.instituteName && (
                                            <p className="text-red-500 text-sm">
                                                {errors.instituteName.message}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Teacher Email */}
                                <div className="addTeacher-div">
                                    <label htmlFor="teacherEmail" className="label-style sm:w-1/3">
                                        Teacher Email
                                    </label>

                                    <div className="sm:w-2/3 w-full">
                                        <input type="email" id="teacherEmail" placeholder="Enter Teacher Email" className="input-box w-full max-w-none" {...register("teacherEmail", {
                                                required: "Teacher Email Is Required",
                                                pattern: {
                                                    value: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                                                    message: "Invalid Email Format"
                                                }
                                            })}/>

                                        {errors.teacherEmail && <p className="text-red-500 text-sm">{errors.teacherEmail.message}</p>}
                                    </div>
                                </div>

                                {/* Phone Number */}
                                <div className="addTeacher-div">
                                    <label htmlFor="teacherPhoneNumber" className="label-style sm:w-1/3">
                                        Phone Number
                                    </label>

                                    <div className="sm:w-2/3 w-full">
                                        <input type="text" id="teacherPhoneNumber" placeholder="Enter Phone Number" className="input-box w-full max-w-none" {...register("teacherPhoneNumber", {
                                                required: "Phone Number Is Required",
                                                pattern: {
                                                    value: /^[0-9]{10}$/,
                                                    message: "Phone Number Must Contain 10 Digits"
                                                }
                                            })}/>

                                        {errors.teacherPhoneNumber && <p className="text-red-500 text-sm"> {errors.teacherPhoneNumber.message} </p> }
                                    </div>
                                </div>

                                {/* Department */}
                                <div className="addTeacher-div">
                                    <label htmlFor="teacherDepartment" className="label-style sm:w-1/3">
                                        Department
                                    </label>

                                    <div className="sm:w-2/3 w-full">
                                        <select id="teacherDepartment" className="input-box w-full max-w-none" {...register("teacherDepartment", {
                                                required: "Department Is Required"
                                            })}>
                                            <option value="">Select Department</option>
                                            <option value="Computer">Computer</option>
                                            {
                                                department != null &&
                                                department?.map((dept, index)=>(
                                                    <option key={index} value={`${dept.departmentName}`}>{dept.departmentName}</option>
                                                ))
                                            }
                                        </select>

                                        {errors.teacherDepartment && <p className="text-red-500 text-sm"> {errors.teacherDepartment.message} </p>}
                                    </div>
                                </div>

                                {/* Availability */}
                                <div className="addTeacher-div">
                                    <label htmlFor="teacherAvailability" className="label-style sm:w-1/3">
                                        Availability
                                    </label>

                                    <div className="sm:w-2/3 w-full">
                                        <select id="teacherAvailability" className="input-box w-full max-w-none" {...register("teacherAvailability", {
                                                required: "Availability Is Required"
                                            })}>
                                            <option value="">Select Availability</option>
                                            <option value="Available">Available</option>
                                            <option value="Busy">Busy</option>
                                            <option value="On Leave">On Leave</option>
                                        </select>

                                        {errors.teacherAvailability && <p className="text-red-500 text-sm">{errors.teacherAvailability.message}</p>}
                                    </div>
                                </div>

                                {/* Subjects */}
                                <div>
                                    {fields.map((field, index) => (
                                        <div key={field.id} className="border rounded-xl p-4 mb-4">
                                            <div className="addTeacher-div">

                                                <label htmlFor={`subject_${index}`} className="label-style sm:w-1/3">
                                                    Subject {index + 1}
                                                </label>

                                                <div className="sm:w-2/3 w-full">
                                                    <input type="text" id={`subject_${index}`} placeholder="Enter Subject Name" className="input-box w-full max-w-none" {...register(`Subjects.${index}.subjects`, {
                                                            required: "Subject Name Is Required",
                                                            minLength: {
                                                                value: 3,
                                                                message: "Subject Name Must Be At Least 3 Characters"
                                                            },
                                                            maxLength: {
                                                                value: 50,
                                                                message: "Subject Name Cannot Exceed 50 Characters"
                                                            },
                                                            pattern: {
                                                                value: /^[A-Za-z ]+$/,
                                                                message: "Subject Name Should Contain Only Letters"
                                                            }
                                                        })}/>

                                                    {errors.Subjects?.[index]?.subjects && <p className="text-red-500 text-sm">{errors.Subjects[index]?.subjects?.message}</p>}
                                                </div>
                                            </div>

                                            <div className="flex flex-col sm:flex-row gap-3 mt-4">
                                                <button type="button" className="add-btn" onClick={() => append({ subjects: "" })}>
                                                    Add Row
                                                </button>

                                                {fields.length > 1 && (
                                                    <button type="button" className="delete-btn" onClick={() => remove(index)}>
                                                        Delete Row
                                                    </button>
                                                )}
                                            </div>

                                        </div>
                                    ))}
                                </div>

                                {/* Submit */}
                                <div className="flex justify-center mt-8">
                                    <button type="submit" disabled={isSubmitting || !isValid} className={`w-full sm:w-auto px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition ${isSubmitting || !isValid ? "opacity-50 cursor-not-allowed" : ""}`}>
                                        {isSubmitting ? "Adding Teacher..." : "Add Teacher"}
                                    </button>
                                </div>

                            </div>
                        </div>
                    </form>
                </div>     
            </>    
    )
}

export default AddTeacher;