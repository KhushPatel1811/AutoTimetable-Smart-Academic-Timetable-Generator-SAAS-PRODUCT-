import { useEffect, useState } from "react"
import ProfileNavbar from "./ProfileNavbar"
import ProfileCard from "./ProfileCard"
import { useForm } from "react-hook-form"
import axios from "axios"
import Sidebar from "../../../Components/Dashboard/Sidebar"
import { ToastContainer, toast } from "react-toastify"

function ProfileEdit() {
    interface User {
        _id:string,
        adminName: string,
        instituteName: string,
        email: string,
        createdAt: Date,
        updatedAt: Date
    }

    const {register, handleSubmit,  reset, formState: {errors}} = useForm<User>({
        defaultValues: {
            _id: '',
            adminName: '',
            instituteName: '',
            email: '',
            createdAt: new Date(),
            updatedAt: new Date()
        }
    })

    const [user, setUser] = useState<User | null>(null)

    useEffect(()=>{
        const storedUser = localStorage.getItem('user') || null
        if(storedUser) {
            const parsedUser = JSON.parse(storedUser)
            reset(parsedUser)
            setUser(parsedUser)
        }
    },[reset])

    async function updateData(formData : User) {
        console.log('CLIENT: Submitting form data:', formData)
        try {
            const response = await axios.post('http://localhost:1000/profile/edit',formData, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            })
            console.log('SERVER RESPONSE:', response.data)
            
            if (response.data.updatedUser) {
                localStorage.setItem('user', JSON.stringify(response.data.updatedUser))
                reset(response.data.updatedUser)
                setUser(response.data.updatedUser)
                toast.success('Profile Updated Successfully')
            }
        } 
        catch(err: any) {
            console.log('Error Occurred: ', err)
            console.log('Response: ',err.response?.data.message)
            console.log('Status: ', err.response?.status)
            toast.error(err.response?.data?.message || 'Profile Update Failed')
        }
    }

    return(
        <>
        <div className="flex min-h-screen overflow-x-hidden fixed inset-0">
            <Sidebar />
            <ToastContainer position="top-right" autoClose={2000} />

            <div className="w-full flex-1 transition-all duration-300">
                <ProfileNavbar content="Edit Profile Page" />

                <div className="bg-linear-to-br from-purple-100/60 to-pink-100/60 transition-all duration-300">
                    <div className="bg-linear-to-bl from-blue-100/60 to-green-100/60 pb-8 px-4 md:px-6 lg:px-10">

                        <div className="pt-10 text-center md:text-left">

                            <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-4">

                                <div>
                                    <div className="text-2xl md:text-3xl font-bold">
                                        AutoTimeTable
                                    </div>

                                    <div className="text-gray-500 text-sm md:text-base">
                                        Manage administrative credentials and institution preferences
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col xl:flex-row mt-10 gap-8 xl:gap-12 justify-center xl:justify-start items-center xl:items-start">

                                {/* Profile Card */}
                                <div className="w-full max-w-sm">
                                    <ProfileCard />
                                </div>

                                {/* Profile Details */}
                                <div className="bg-gray-50 w-full max-w-2xl rounded-2xl shadow-sm">

                                    <div className="flex flex-col sm:flex-row sm:justify-between gap-3 p-5">
                                        <div className="text-lg font-bold">
                                            Update Profile Details
                                        </div>
                                    </div>

                                    <hr className="border-gray-300 mx-5" />

                                    <form
                                        method="POST"
                                        onSubmit={handleSubmit(updateData)}
                                    >
                                        <div className="m-5">

                                            <div>
                                                <label htmlFor="adminName"> Admin Account Holder Name </label>
                                                <input type="text" className="input-box" id="adminName" {...register('adminName', {
                                                        required: 'Admin Name is required',
                                                        minLength: {
                                                            value: 3,
                                                            message: 'Admin Name must be at least 3 characters long'
                                                        },
                                                        maxLength: {
                                                            value: 50,
                                                            message: 'Admin Name must be at most 50 characters long'
                                                        },
                                                        pattern: {
                                                            value: /^[A-Za-z ]+$/,
                                                            message: 'Admin Name must contain only alphabets and spaces'
                                                        }
                                                    })}/>

                                                <div className="text-red-500">
                                                    {errors?.adminName && <p>{errors.adminName.message}</p>}
                                                </div>
                                            </div>

                                            <div>
                                                <label htmlFor="instituteName"> School / College Name </label>

                                                <input type="text" className="input-box" id="instituteName" {...register('instituteName', {
                                                        required: 'Institute Name Is Required',
                                                        minLength: {
                                                            value: 3,
                                                            message: 'Institute Name Must Be At Least 3 Characters Long'
                                                        },
                                                        maxLength: {
                                                            value: 50,
                                                            message: 'Institute Name Must Be At Most 50 Characters Long'
                                                        }
                                                    })} />

                                                <div className="text-red-500">
                                                    {errors?.instituteName && <p>{errors.instituteName.message}</p>}
                                                </div>
                                            </div>

                                            <div>
                                                <label htmlFor="email"> Email Address </label>

                                                <input type="text" className="input-box" id="email" {...register('email', {
                                                        required: 'Email Is Required',
                                                        pattern: {
                                                            value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                                                            message: 'Email Is Invalid'
                                                        }
                                                    })}/>

                                                <div className="text-red-500">
                                                    {errors?.email && <p>{errors.email.message}</p>}
                                                </div>
                                            </div>

                                            <div className="flex justify-center mt-6">
                                                <button type="submit" className="w-full sm:w-auto px-8 py-3 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 transition cursor-pointer" >
                                                    Update Data
                                                </button>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </>
    )
}

export default ProfileEdit