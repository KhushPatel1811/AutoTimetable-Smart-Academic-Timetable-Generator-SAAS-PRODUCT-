import { useFieldArray, useForm } from "react-hook-form"
import ProfileNavbar from "../Profile/ProfileNavbar"
import { useNavigate } from "react-router"
import { useEffect, useState } from "react"
import axios from "axios"
import { toast, ToastContainer } from "react-toastify"
import { Building2, LayoutGrid, CheckCircle, Plus, Trash2, ArrowLeft } from 'lucide-react'
import API from '../../../config/api'

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

    const { register, handleSubmit, control, formState: { errors, isSubmitting, isValid } } = useForm<Rooms>({
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

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'Rooms'
    })

    const [departmentData, setDepartmentData] = useState<Department[]>([])

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await axios.get(`{API}/departments`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                setDepartmentData(response.data?.department || []);
            }
            catch (err: unknown) {
                console.error('Error fetching departments:', err);
            }
        }
        fetchData();
    }, []);

    async function submitData(data: Rooms): Promise<void> {
        try {
            const response = await axios.post(`${API}/rooms/add`, data, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            })

            if (response) {
                toast.success('Rooms added successfully')
                setTimeout(() => {
                    navigate('/rooms')
                }, 2000)
            }
        }
        catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            toast.error(error.response?.data?.message || 'Failed to add rooms')
        }
    }

    return (
        <div className="flex h-screen w-screen bg-slate-50 overflow-hidden">
            <div className="flex-1 flex flex-col h-full overflow-y-auto animate-page">
                {/* Header Navbar */}
                <div className="sticky top-0 z-50 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                    <ProfileNavbar content="Add New Rooms" />
                    <ToastContainer position="top-right" autoClose={2000} />
                </div>

                <div className="p-8 max-w-350 w-full mx-auto space-y-8">
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
                        {fields.map((field, index) => (
                            <div key={field.id} className="premium-card p-8! relative group border border-slate-100 hover:border-indigo-100 transition-all">
                                
                                {/* Row Header Badge */}
                                <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-xs">
                                            {index + 1}
                                        </div>
                                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Room Settings</h3>
                                    </div>
                                    
                                    {fields.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => remove(index)}
                                            className="text-slate-400 hover:text-rose-500 p-2 rounded-xl hover:bg-rose-50 transition-all cursor-pointer flex items-center gap-1 text-xs font-bold uppercase tracking-wider"
                                        >
                                            <Trash2 size={14} />
                                            Remove
                                        </button>
                                    )}
                                </div>

                                {/* Form Fields Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {/* Room Name Input */}
                                    <div className="space-y-2">
                                        <label htmlFor={`roomName_${index}`} className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                            Room Name / ID
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                id={`roomName_${index}`}
                                                className={`input-box py-3! bg-white! ${errors.Rooms?.[index]?.roomName ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200' : ''}`}
                                                placeholder="e.g. B-102, Lab-3"
                                                {...register(`Rooms.${index}.roomName`, {
                                                    required: 'Room name is required',
                                                    minLength: { value: 3, message: 'Minimum 3 characters' },
                                                    maxLength: { value: 50, message: 'Maximum 50 characters' },
                                                    pattern: { value: /^[A-Za-z0-9- ]+$/, message: 'No special characters allowed' }
                                                })}
                                            />
                                        </div>
                                        {errors.Rooms?.[index]?.roomName && (
                                            <p className="text-xs font-bold text-rose-500 mt-1">{errors.Rooms?.[index]?.roomName?.message}</p>
                                        )}
                                    </div>

                                    {/* Room Type Dropdown */}
                                    <div className="space-y-2">
                                        <label htmlFor={`roomType_${index}`} className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                            Room Type
                                        </label>
                                        <div className="relative">
                                            <LayoutGrid className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                            <select
                                                id={`roomType_${index}`}
                                                className={`input-box py-3! pl-11! bg-white! cursor-pointer appearance-none ${errors.Rooms?.[index]?.roomType ? 'border-rose-300' : ''}`}
                                                {...register(`Rooms.${index}.roomType`, { required: 'Room type is required' })}
                                            >
                                                <option value="">Select Type</option>
                                                <option value="Lecture">Lecture Hall</option>
                                                <option value="Lab">Laboratory</option>
                                                <option value="Seminar">Seminar Room</option>
                                                <option value="Auditorium">Auditorium</option>
                                            </select>
                                        </div>
                                        {errors.Rooms?.[index]?.roomType && (
                                            <p className="text-xs font-bold text-rose-500 mt-1">{errors.Rooms?.[index]?.roomType?.message}</p>
                                        )}
                                    </div>

                                    {/* Room Status Dropdown */}
                                    <div className="space-y-2">
                                        <label htmlFor={`roomStatus_${index}`} className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                            Status
                                        </label>
                                        <div className="relative">
                                            <CheckCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                            <select
                                                id={`roomStatus_${index}`}
                                                className={`input-box py-3! pl-11! bg-white! cursor-pointer appearance-none ${errors.Rooms?.[index]?.roomStatus ? 'border-rose-300' : ''}`}
                                                {...register(`Rooms.${index}.roomStatus`, { required: 'Status is required' })}
                                            >
                                                <option value="">Select Status</option>
                                                <option value="Available">Available</option>
                                                <option value="Occupied">Occupied</option>
                                                <option value="Under Maintenance">Maintenance</option>
                                            </select>
                                        </div>
                                        {errors.Rooms?.[index]?.roomStatus && (
                                            <p className="text-xs font-bold text-rose-500 mt-1">{errors.Rooms?.[index]?.roomStatus?.message}</p>
                                        )}
                                    </div>

                                    {/* Belonging Department Dropdown */}
                                    <div className="space-y-2">
                                        <label htmlFor={`departmentName_${index}`} className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                            Department
                                        </label>
                                        <div className="relative">
                                            <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                            <select
                                                id={`departmentName_${index}`}
                                                className={`input-box py-3! pl-11! bg-white! cursor-pointer appearance-none ${errors.Rooms?.[index]?.departmentName ? 'border-rose-300' : ''}`}
                                                {...register(`Rooms.${index}.departmentName`, { required: 'Department is required' })}
                                            >
                                                <option value="">Select Department</option>
                                                {departmentData?.map((dept, idx) => (
                                                    <option key={idx} value={dept?.departmentName}>{dept.departmentName}</option>
                                                ))}
                                            </select>
                                        </div>
                                        {errors.Rooms?.[index]?.departmentName && (
                                            <p className="text-xs font-bold text-rose-500 mt-1">{errors.Rooms?.[index]?.departmentName?.message}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Actions Row */}
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
                            <button
                                type="button"
                                onClick={() => append({ roomName: '', roomType: '', roomStatus: '', departmentName: '' })}
                                className="w-full sm:w-auto secondary-btn py-4.5! px-8! flex items-center justify-center gap-2 group text-xs font-black uppercase tracking-widest cursor-pointer"
                            >
                                <Plus size={16} className="group-hover:rotate-90 transition-transform" />
                                Add Another Room
                            </button>

                            <button
                                type="submit"
                                disabled={isSubmitting || !isValid}
                                className={`w-full sm:w-auto bg-linear-to-r from-indigo-600 to-indigo-500 text-white font-black text-xs uppercase tracking-[0.2em] px-12 py-4.5 rounded-2xl shadow-xl shadow-indigo-100 transition-all duration-300 
                                    ${isSubmitting || !isValid 
                                        ? 'opacity-50 cursor-not-allowed shadow-none' 
                                        : 'hover:shadow-indigo-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer'
                                    }`}
                            >
                                {isSubmitting ? 'Saving...' : 'Save Rooms'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default AddRooms;