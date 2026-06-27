import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import { UserCircle2, Building2, Mail, ShieldCheck } from "lucide-react";
import Sidebar from "../../../Components/Dashboard/Sidebar";
import ProfileNavbar from "./ProfileNavbar";
import ProfileCard from "./ProfileCard";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router";
import API from '../../../config/api'


function ProfileEdit() {
    const navigate = useNavigate()
    interface UserProfileData {
        _id: string;
        userName: string;
        instituteName: string;
        email: string;
        phoneNumber: string,
        createdAt: string;
        updatedAt: string;
    }

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<UserProfileData>({
        defaultValues: {
            _id: '',
            userName: '',
            instituteName: '',
            email: '',
            phoneNumber:'',
            createdAt: '',
            updatedAt: ''
        }
    });

    useEffect(() => {
        const storedUser = localStorage.getItem('user') || null;
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            reset(parsedUser);
        }
    }, [reset]);

    async function updateData(formData: UserProfileData) {
        try {
            const response = await axios.post(`${API}/profile/edit`, formData, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            if (response.data.updatedUser) {
                localStorage.setItem('user', JSON.stringify(response.data.updatedUser));
                reset(response.data?.updatedUser);
                toast.success('Your profile has been updated successfully.');

                setTimeout(()=>{
                    navigate('/profile')
                },3000)
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Could not save your updates. Please try again.');
        }
    }

    return (
        <div className="flex h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
            <ToastContainer theme="dark" position="top-right" autoClose={2500} />

            <div className="flex-1 flex flex-col h-full overflow-y-auto custom-scrollbar">
                <ProfileNavbar onMenuToggle={() => setIsSidebarOpen(true)} content="Edit Profile Settings" />

                <div className="p-6 md:p-10 max-w-400 w-full mx-auto space-y-10">
                    
                    {/* Header Block */}
                    <div className="text-left space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-600/10">
                                <ShieldCheck className="w-5 h-5 text-white" />
                            </div>
                            <h1 className="text-3xl font-black text-white tracking-tight">
                                Edit <span className="text-indigo-400">Account Details</span>
                            </h1>
                        </div>
                        <p className="text-slate-400 text-sm font-medium max-w-xl">
                            Update your personal information, school or college name, and contact details below.
                        </p>
                    </div>

                    {/* Operational Workspace Grid */}
                    <div className="flex flex-col lg:flex-row gap-8 items-start">
                        
                        {/* Profile Sticky Card Card */}
                        <div className="w-full lg:w-95 shrink-0 lg:sticky lg:top-6">
                            <ProfileCard />
                        </div>

                        {/* Form Card */}
                        <div className="flex-1 w-full bg-white/2 border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
                            
                            <div className="p-6 border-b border-white/5 bg-white/2">
                                <h3 className="text-sm font-black text-slate-200 uppercase tracking-widest">Personal Information</h3>
                            </div>

                            <form onSubmit={handleSubmit(updateData)} className="p-6 md:p-8 space-y-6">
                                
                                {/* Full Name Field */}
                                <div className="space-y-2">
                                    <label htmlFor="userName" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                        <UserCircle2 className="w-3 h-3 text-indigo-400" /> Your Full Name
                                    </label>
                                    <input type="text" id="userName" className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-slate-200 font-medium text-sm focus:outline-none focus:border-indigo-500 transition-colors"placeholder="Enter your full name"{...register('userName', {
                                            required: 'Please enter your name.',
                                            minLength: { value: 3, message: 'Name must be at least 3 characters long.' },
                                            maxLength: { value: 50, message: 'Name cannot be longer than 50 characters.' },
                                            pattern: { value: /^[A-Za-z ]+$/, message: 'Please use only letters and spaces.' }
                                        })}/>
                                    {errors.userName && (
                                        <p className="text-xs text-red-400 font-semibold mt-1 ml-1">{errors.userName.message}</p>
                                    )}
                                </div>

                                {/* Institution Name Field */}
                                <div className="space-y-2">
                                    <label htmlFor="instituteName" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                        <Building2 className="w-3 h-3 text-indigo-400" /> Institution Name (School / College)
                                    </label>
                                    <input type="text" id="instituteName" className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-slate-200 font-medium text-sm focus:outline-none focus:border-indigo-500 transition-colors"placeholder="Enter your school or college name"{...register('instituteName', {
                                            required: 'Please enter your institution name.',
                                            minLength: { value: 3, message: 'Institution name must be at least 3 characters long.' },
                                            maxLength: { value: 50, message: 'Institution name cannot be longer than 50 characters.' }
                                        })}/>
                                    {errors.instituteName && (
                                        <p className="text-xs text-red-400 font-semibold mt-1 ml-1">{errors.instituteName.message}</p>
                                    )}
                                </div>

                                {/* Email Address Field */}
                                <div className="space-y-2">
                                    <label htmlFor="email" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                        <Mail className="w-3 h-3 text-indigo-400" /> Email Address
                                    </label>
                                    <input type="text" id="email" className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-slate-200 font-medium text-sm focus:outline-none focus:border-indigo-500 transition-colors"placeholder="Enter your email address"{...register('email', {
                                            required: 'Please enter your email address.',
                                            pattern: { value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, message: 'Please enter a valid email address.' }
                                        })}/>
                                    {errors.email && (
                                        <p className="text-xs text-red-400 font-semibold mt-1 ml-1">{errors.email.message}</p>
                                    )}
                                </div>

                                {/* Phone Number */}
                                <div className="space-y-2">
                                    <label htmlFor="phoneNumber" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                        <Mail className="w-3 h-3 text-indigo-400" /> Phone Number
                                    </label>
                                    <input type="text" id="phoneNumber" className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-slate-200 font-medium text-sm focus:outline-none focus:border-indigo-500 transition-colors"placeholder="Enter your email address"{...register('phoneNumber', {
                                            required: 'Please enter your mobile number.',
                                            pattern: { value: /^[0-9]{10}$/, message: 'Please enter a valid phoneNumber number.' }
                                        })}/>
                                    {errors.phoneNumber && (
                                        <p className="text-xs text-red-400 font-semibold mt-1 ml-1">{errors.phoneNumber.message}</p>
                                    )}
                                </div>

                                {/* Submit Trigger */}
                                <div className="pt-4 border-t border-white/5 flex justify-end">
                                    <button type="submit" disabled={isSubmitting}className="w-full sm:w-auto px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black uppercase tracking-wider transition-colors shadow-lg shadow-indigo-600/10 disabled:opacity-50 cursor-pointer">
                                        {isSubmitting ? 'Saving changes...' : 'Save Changes'}
                                    </button>
                                </div>
                                
                            </form>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProfileEdit;