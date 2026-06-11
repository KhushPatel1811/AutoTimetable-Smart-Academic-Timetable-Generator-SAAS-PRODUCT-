import axios from "axios";
import BackGround from "../../../Utilities/Background";
import ProfileNavbar from "../Profile/ProfileNavbar";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ToastContainer, toast } from 'react-toastify'

function EditRoom() {

    interface Department {
        departmentName: ''
    }

    interface Rooms {
        roomName: string,
        roomId: string,
        roomType: string,
        roomStatus: string,
        departmentName: string
    }


    const { register, handleSubmit, reset, formState: { errors, isValid, isSubmitting } } = useForm<Rooms>({
        defaultValues: {
            roomName: '',
            roomId: '',
            roomType: '',
            roomStatus: '',
            departmentName: ''
        },
        mode: 'onChange',
        reValidateMode: 'onChange'
    })

    const navigate = useNavigate()
    const { roomId } = useParams()
    const [departmentData, setDepartmentData] = useState<Department[]>([])


    //! FETCHING ROOM AND DEPARTMENT DETAILS
    useEffect(() => {
        async function fetchData() {
            try {
                const responseRoom = await axios.get(`http://localhost:1000/rooms/edit/${roomId}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                })
                console.log("RESPONSE ROOM DATA:", responseRoom?.data)
                console.log("ROOM DATA: ", responseRoom?.data)
                
                
                const responseDepartment = await axios.get('http://localhost:1000/departments')
                
                console.log('RESPONSE DEPARTMENT DATA:', responseDepartment.data)
                setDepartmentData(responseDepartment.data?.department)

                
                reset(responseRoom?.data?.room)
            }
            catch (err: any) {
                console.log('Error Occurred', err)
                console.log('Response: ', err.response?.data?.message)
                console.log('Status: ', err.response?.status);
            }
        }
        fetchData()
    }, [reset, roomId])



    async function submitData(data: Rooms) {
        console.log(data)

        try {
            const response = await axios.put(`http://localhost:1000/rooms/edit/${roomId}`, { ...data, roomId }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            })

            console.log("RESPONSE DATA: ", response.data)


            if (response.data) {
                toast.success('Room Updated Successfully')

                setTimeout(() => {
                    navigate("/rooms")
                }, 3000)
            }
        }
        catch (err: any) {
            console.log('Error Occurred', err)
            console.log('Response: ', err.response?.data?.message)
            console.log('Status: ', err.response?.status);
            toast.error(err.response?.data?.message || 'Room Update Failed')
        }
    }

    return (
        <div>
            <ToastContainer position="top-right" autoClose={2000} />
            <ProfileNavbar content="Edit Room Details Page" />

            <div className="relative min-h-screen px-4 py-6 sm:px-6 lg:px-8">
                <div className="pointer-events-none">
                    <BackGround />
                </div>

                <form onSubmit={handleSubmit(submitData)}>
                    <div className="relative z-10 bg-white border rounded-2xl shadow-lg w-full max-w-4xl mx-auto p-4 sm:p-6 md:p-8">

                        <div className="mb-8">
                            <h1 className="text-2xl md:text-3xl font-bold text-center">
                                Edit Room Details
                            </h1>
                        </div>

                        <div className="space-y-6">

                            {/* Room Name */}
                            <div className="addTeacher-div">
                                <label htmlFor="roomName" className="label-style sm:w-1/3">
                                    Room Name
                                </label>

                                <div className="sm:w-2/3 w-full">
                                    <input type="text" id="roomName" placeholder="Enter Room Name" className="input-box w-full max-w-none" {...register(`roomName`, {
                                        required: "Teacher Name Is Required",
                                        minLength: {
                                            value: 3,
                                            message: "Room Name Must Be At Least 3 Characters"
                                        },
                                        maxLength: {
                                            value: 50,
                                            message: "Room Name Cannot Exceed 50 Characters"
                                        },
                                        pattern: {
                                            value: /^[A-Za-z0-9- ]+$/,
                                            message: "Room Name Should Contain Only Letters"
                                        }
                                    })} />
                                    {errors.roomName && <p className="text-red-500 text-sm">{errors.roomName.message}</p>}
                                </div>
                            </div>


                            {/* Room Type */}
                            <div className="addTeacher-div">
                                <label htmlFor="roomType" className="label-style sm:w-1/3">
                                    Room Type
                                </label>

                                <div className="sm:w-2/3 w-full">
                                    <select id="roomType" className="input-box w-full max-w-none"
                                        {...register("roomType", {
                                            required: "Room Type Is Required",
                                        })}>
                                        <option value="">Select Room Type</option>
                                        <option value="Lecture">Lecture</option>
                                        <option value="Lab">Lab</option>
                                        <option value="Seminar">Seminar</option>
                                        <option value="Auditorium">Auditorium</option>
                                    </select>

                                    {errors.roomType && (
                                        <p className="text-red-500 text-sm">
                                            {errors.roomType.message}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Room Status */}
                            <div className="addTeacher-div">
                                <label htmlFor="roomStatus" className="label-style sm:w-1/3">
                                    Room Status
                                </label>

                                <div className="sm:w-2/3 w-full">
                                    <select id="roomStatus" className="input-box w-full max-w-none" {...register("roomStatus", {
                                        required: "Room Status Is Required",
                                    })}>
                                        <option value="">Select Room Status</option>
                                        <option value="Available">Available</option>
                                        <option value="Occupied">Occupied</option>
                                        <option value="Under Maintenance">Under Maintenance</option>
                                    </select>

                                    {errors.roomStatus && <p className="text-red-500 text-sm">{errors.roomStatus.message}</p>}
                                </div>
                            </div>



                            {/* Department Name */}
                            <div className="addTeacher-div">
                                <label htmlFor="departmentName" className="label-style sm:w-1/3">
                                    Department Name
                                </label>

                                <div className="sm:w-2/3 w-full">
                                    <select id="departmentName" className="input-box w-full max-w-none" {...register("departmentName", {
                                        required: "Phone Number Is Required",
                                    })}>
                                        <option value="">Select Department</option>
                                        {
                                            departmentData != null &&
                                            departmentData.map((dept, index) => (
                                                <option key={index} value={dept.departmentName}>{dept.departmentName}</option>
                                            ))
                                        }
                                    </select>
                                    {errors.departmentName && <p className="text-red-500 text-sm"> {errors.departmentName.message} </p>}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="flex justify-center mt-8">
                        <button type="submit" disabled={isSubmitting || !isValid} className={`w-full sm:w-auto px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 hover:cursor-pointer transition ${isSubmitting || !isValid ? "opacity-50 cursor-not-allowed" : ""}`}>
                            {isSubmitting ? "Updating Room Data..." : "Update Room Data"}
                        </button>
                    </div>
                </form >
            </div>
        </div>
    )
}

export default EditRoom;