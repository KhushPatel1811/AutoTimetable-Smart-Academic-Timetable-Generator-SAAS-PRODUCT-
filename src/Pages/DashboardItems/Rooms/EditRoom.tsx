import axios from "axios"
import ProfileNavbar from "../Profile/ProfileNavbar"
import { useForm } from "react-hook-form"
import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router"
import { ToastContainer, toast } from 'react-toastify'
import { Building2, LayoutGrid, CheckCircle, ArrowLeft } from 'lucide-react'

function EditRoom() {
    interface Department {
        departmentName: string
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

    // Fetch room and department details
    useEffect(() => {
        async function fetchData() {
            try {
                const responseRoom = await axios.get(`http://localhost:1000/rooms/edit/${roomId}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                })
                
                const responseDepartment = await axios.get('http://localhost:1000/departments')
                setDepartmentData(responseDepartment.data?.department || [])
                reset(responseRoom?.data?.room)
            }
            catch (err: any) {
                console.log('Error Occurred', err)
            }
        }
        fetchData()
    }, [reset, roomId])

    async function submitData(data: Rooms) {
        try {
            const response = await axios.put(`http://localhost:1000/rooms/edit/${roomId}`, { ...data, roomId }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            })

            if (response.data) {
                toast.success('Room updated successfully')
                setTimeout(() => {
                    navigate("/rooms")
                }, 2000)
            }
        }
        catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to update room')
        }
    }

    return (
        <div className="flex h-screen w-screen bg-slate-50 overflow-hidden">
            <div className="flex-1 flex flex-col h-full overflow-y-auto animate-page">
                {/* Header Navbar */}
                <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                    <ProfileNavbar content="Edit Room" />
                    <ToastContainer position="top-right" autoClose={2000} />
                </div>

                <div className="p-8 max-w-[1400px] w-full mx-auto space-y-8">
                    {/* Navigation Top Bar */}
                    <div className="flex items-center justify-between">
                        <button 
                            onClick={() => navigate('/rooms')} 
                            className="flex items-center gap-2 text-sm font-black text-slate-500 hover:text-indigo-600 transition-colors uppercase tracking-widest cursor-pointer group"
                        >
                            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                            Back to Rooms
                        </button>
                    </div>

                    <form onSubmit={handleSubmit(submitData)} className="space-y-6">
                        <div className="premium-card !p-8 border border-slate-100 hover:border-indigo-100 transition-all">
                            
                            {/* Card Header */}
                            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-xs">
                                    i
                                </div>
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Room Settings</h3>
                            </div>

                            {/* Horizontal Form Fields Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {/* Room Name Input */}
                                <div className="space-y-2">
                                    <label htmlFor="roomName" className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        Room Name / ID
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            id="roomName"
                                            className={`input-box !py-3 !bg-white ${errors.roomName ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200' : ''}`}
                                            placeholder="e.g. B-102, Lab-3"
                                            {...register(`roomName`, {
                                                required: "Room name is required",
                                                minLength: { value: 3, message: "Minimum 3 characters" },
                                                maxLength: { value: 50, message: "Maximum 50 characters" },
                                                pattern: { value: /^[A-Za-z0-9- ]+$/, message: "No special characters allowed" }
                                            })}
                                        />
                                    </div>
                                    {errors.roomName && (
                                        <p className="text-xs font-bold text-rose-500 mt-1">{errors.roomName.message}</p>
                                    )}
                                </div>

                                {/* Room Type Dropdown */}
                                <div className="space-y-2">
                                    <label htmlFor="roomType" className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        Room Type
                                    </label>
                                    <div className="relative">
                                        <LayoutGrid className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                        <select
                                            id="roomType"
                                            className={`input-box !py-3 !pl-11 !bg-white cursor-pointer appearance-none ${errors.roomType ? 'border-rose-300' : ''}`}
                                            {...register("roomType", { required: "Room type is required" })}
                                        >
                                            <option value="">Select Type</option>
                                            <option value="Lecture">Lecture Hall</option>
                                            <option value="Lab">Laboratory</option>
                                            <option value="Seminar">Seminar Room</option>
                                            <option value="Auditorium">Auditorium</option>
                                        </select>
                                    </div>
                                    {errors.roomType && (
                                        <p className="text-xs font-bold text-rose-500 mt-1">{errors.roomType.message}</p>
                                    )}
                                </div>

                                {/* Room Status Dropdown */}
                                <div className="space-y-2">
                                    <label htmlFor="roomStatus" className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        Status
                                    </label>
                                    <div className="relative">
                                        <CheckCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                        <select
                                            id="roomStatus"
                                            className={`input-box !py-3 !pl-11 !bg-white cursor-pointer appearance-none ${errors.roomStatus ? 'border-rose-300' : ''}`}
                                            {...register("roomStatus", { required: "Status is required" })}
                                        >
                                            <option value="">Select Status</option>
                                            <option value="Available">Available</option>
                                            <option value="Occupied">Occupied</option>
                                            <option value="Under Maintenance">Maintenance</option>
                                        </select>
                                    </div>
                                    {errors.roomStatus && (
                                        <p className="text-xs font-bold text-rose-500 mt-1">{errors.roomStatus.message}</p>
                                    )}
                                </div>

                                {/* Department Dropdown */}
                                <div className="space-y-2">
                                    <label htmlFor="departmentName" className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        Department
                                    </label>
                                    <div className="relative">
                                        <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                        <select
                                            id="departmentName"
                                            className={`input-box !py-3 !pl-11 !bg-white cursor-pointer appearance-none ${errors.departmentName ? 'border-rose-300' : ''}`}
                                            {...register("departmentName", { required: "Department is required" })}
                                        >
                                            <option value="">Select Department</option>
                                            {departmentData?.map((dept, idx) => (
                                                <option key={idx} value={dept.departmentName}>{dept.departmentName}</option>
                                            ))}
                                        </select>
                                    </div>
                                    {errors.departmentName && (
                                        <p className="text-xs font-bold text-rose-500 mt-1">{errors.departmentName.message}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Submit Button Action Container */}
                        <div className="flex justify-end pt-4">
                            <button
                                type="submit"
                                disabled={isSubmitting || !isValid}
                                className={`w-full sm:w-auto bg-linear-to-r from-indigo-600 to-indigo-500 text-white font-black text-xs uppercase tracking-[0.2em] px-12 py-4.5 rounded-2xl shadow-xl shadow-indigo-100 transition-all duration-300 
                                    ${isSubmitting || !isValid 
                                        ? 'opacity-50 cursor-not-allowed shadow-none' 
                                        : 'hover:shadow-indigo-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer'
                                    }`}
                            >
                                {isSubmitting ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default EditRoom;