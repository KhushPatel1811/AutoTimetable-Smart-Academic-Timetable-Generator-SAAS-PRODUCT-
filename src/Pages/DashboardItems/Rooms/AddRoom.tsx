import { useFieldArray, useForm } from "react-hook-form"
import ProfileNavbar from "../Profile/ProfileNavbar"
import BackGround from "../../../Utilities/Background"
import axios from "axios"
import { toast, ToastContainer } from "react-toastify"
import { useNavigate } from "react-router"
import { useEffect, useState } from "react"

function AddRooms() {
    const navigate = useNavigate()

    interface Department {
        departmentName: string
    }

    interface Rooms {
        Rooms: {
            roomName: string,
            roomType: string,
            roomStatus: string,
            departmentName: string
        }[]
    }


    const {register, handleSubmit, control, formState: {errors, isSubmitting, isValid}} = useForm<Rooms>({
        defaultValues: {
            Rooms: [{
                roomName: '',
                roomType: '',
                roomStatus: '',
                departmentName: '',
            }]
        },
        mode: 'onChange',
        reValidateMode: 'onChange'
    })

    const {fields, append, remove} = useFieldArray({
        control,
        name: 'Rooms'   
    })



    const [departmentData, setDepartmentData] = useState<Department[]>([])


    useEffect(()=>{
        async function fetchData() {
            try {
                const response = await axios.get('http://localhost:1000/departments')

                console.log('DEPARTMENT DATA:', response.data)
                setDepartmentData(response.data?.department || [])
            }
            catch(err: any) {
                console.log('Error Occurred: ',err.response?.data)
                console.log('Response: ',err.response?.data?.message)
                console.log('Status: ', err.response?.status)
            }
        }
        fetchData()
    }, [])


    
    async function submitData(data: Rooms):Promise<void> {
        console.log(data)

        const user  = localStorage.getItem('user')
        const instituteId: string = user ? JSON.parse(user).instituteId : null
        const userId: string = user ? JSON.parse(user)._id : null

        console.log('Institute Id', instituteId)
        console.log('User Id', userId)

        try {
            const response = await axios.post('http://localhost:1000/rooms/add',{...data, instituteId, userId}, {
                headers:{
                    'Content-Type' : 'application/json',
                    'Authorization':  `Bearer ${localStorage.getItem('token')}`
                }
            })

            
            console.log(response.data)

            if(response) {
                toast.success('Room Added Successfully')
                setTimeout(()=>{
                    navigate('/rooms')
                }, 3000)
            }
        }
        catch(err: any) {
            console.log('Error Occurred: ',err)
            console.log('Response: ',err.response?.data?.message)
            console.log('Status: ', err.response?.status)
            toast.error(err.response?.data?.message || 'Room Registration Failed')
        }
    }

    return(
        <>
            <div className="flex h-full w-screen overflow-hidden">
                <div className="pointer-events-none -z-10">
                    <BackGround />               
                </div>
                <div className="flex-1">
                    <ProfileNavbar content="Department Registration Page" />
                    <ToastContainer position="top-right" autoClose={2000} />

                    <form onSubmit={handleSubmit(submitData)}>
                        <div className="border w-auto m-3 bg-white rounded-2xl mx-20">
                            <div className="text-2xl md:text-xl font-bold text-center m-8">
                                <h1>Enter Department Details</h1>
                            </div>
                            {
                                fields.map((field, index) => (
                                    <div key={field.id} className="ml-11 mb-6">
                                        <div className="flex flex-row items-start">
                                            <div>
                                                <label htmlFor={`roomName_${index}`}className="mt-5 ml-2 text-xl font-bold">
                                                    Room Name
                                                </label>

                                                <input type="text" id={`roomName_${index}`} className="input-box w-80 ml-5" placeholder="Enter Room Name Ex:- B-102" {...register(`Rooms.${index}.roomName`, {
                                                        required: 'Room Name Is Required',
                                                        minLength: {
                                                            value: 3,
                                                            message: 'At Least 3 characters required'
                                                        },
                                                        maxLength: {
                                                            value: 50,
                                                            message: 'At Most 50 characters required'
                                                        },
                                                        pattern: {
                                                            value: /^[A-Za-z0-9- ]+$/,
                                                            message: 'Room Name Should Not Contain Special Characters'
                                                        }
                                                    })}/>
                                                    {errors.Rooms?.[index]?.roomName && <p className="text-red-500">{errors.Rooms?.[index]?.roomName?.message}</p>}
                                                </div>
                                            </div>

                                            <div>
                                                <label htmlFor={`roomType_${index}`}className="mt-5 ml-2 text-xl font-bold">
                                                    Room Type
                                                </label>

                                                <select id={`roomType_${index}`} className="input-box w-80 ml-5" {...register(`Rooms.${index}.roomType`, {
                                                        required: 'Room Type Is Required',
                                                    })}> 
                                                        <option value="">Select Room Type</option>
                                                        <option value="Lecture">Lecture</option>
                                                        <option value="Lab">Lab</option>
                                                        <option value="Seminar">Seminar</option>
                                                        <option value="Auditorium">Auditorium</option>
                                                </select>
                                                {errors.Rooms?.[index]?.roomType && <p className="text-red-500">{errors.Rooms?.[index]?.roomType?.message}</p> }
                                            </div>

                                            <div>
                                                <label htmlFor={`roomType_${index}`}className="mt-5 ml-2 text-xl font-bold">
                                                    Room Status
                                                </label>

                                                <select id={`roomStatus_${index}`} className="input-box w-80 ml-5" {...register(`Rooms.${index}.roomStatus`, {
                                                        required: 'Room Status Is Required',
                                                    })}> 
                                                        <option value="">Select Room Status</option>
                                                        <option value="Available">Available</option>
                                                        <option value="Occupied">Occupied</option>
                                                        <option value="Under Maintenance">Under Maintenance</option>
                                                </select>
                                                {errors.Rooms?.[index]?.roomStatus && <p className="text-red-500">{errors.Rooms?.[index]?.roomStatus?.message}</p> }
                                            </div>


                                            <div>
                                                <label htmlFor={`departmentName_${index}`}className="mt-5 ml-2 text-xl font-bold">
                                                    Room Belonging Department
                                                </label>

                                                <select id={`departmentName_${index}`} className="input-box w-80 ml-5" {...register(`Rooms.${index}.departmentName`, {
                                                        required: 'Department Name Is Required',
                                                    })}> 
                                                        <option value="">Select Department Name</option>
                                                        {
                                                            departmentData != null &&
                                                            departmentData?.map((dept, index)=>(
                                                                <option key={index} value={dept?.departmentName}>{dept.departmentName}</option>
                                                            ))
                                                        }
                                                </select>
                                                {errors.Rooms?.[index]?.departmentName && <p className="text-red-500">{errors.Rooms?.[index]?.departmentName?.message}</p> }
                                            </div>

                                            
                                            <div className="ml-5 flex gap-2 border-b mr-10">
                                                <button type="button" className="add-btn hover:cursor-pointer" onClick={() => append({roomName: '', roomType:'', roomStatus:'', departmentName:''})}>
                                                    Add Row
                                                </button>

                                                <button type="button" disabled={fields.length === 1} className={`delete-btn ${fields.length === 1 ? 'cursor-not-allowed opacity-50' : 'hover:cursor-pointer'}`} onClick={() => remove(index)}>
                                                    Delete Row
                                                </button>
                                            </div>
                                    </div>
                                ))
                            }           
                            <div className="flex justify-center my-5">
                                <button className={`add-btn ${isSubmitting || !isValid ? 'opacity-50 cursor-not-allowed' : ""} `} disabled={isSubmitting || !isValid}>{isSubmitting ? 'Registering...': 'Register Department'}</button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </>
    )
}

export default AddRooms