import { ShieldCheck, KeyRound } from "lucide-react";
import ProfileNavbar from "../Pages/DashboardItems/Profile/ProfileNavbar";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import API from '../config/api'

function ChangePassword() {
    const navigate = useNavigate()

    interface Password {
        email:string,
        currentPassword: string,
        newPassword: string,
        confirmNewPassword:string,
    }
    
    const {register, handleSubmit, watch, formState:{errors, isSubmitting, isValid}} = useForm<Password>({
        defaultValues: {
            email: '',
            currentPassword: '',
            newPassword: '',
            confirmNewPassword: ''
        },
        mode: 'onChange',
        reValidateMode: 'onChange'
    })

    async function updatePassword(data: Password) {
        console.log(data)
        try {
            const response = await axios.put(`${API}/auth/changePassword`, data, {
                headers:{
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            })
            console.log(response.data)
            toast.success('Password Changed Successfully')

            setTimeout(()=>{
                navigate('/profile')
            },3000)
        }
        catch(err: any) {
            console.log('Error Occurred:', err)
            console.log('Response:', err.response?.data)
            console.log('Status:', err.response?.status)
        }
    }

    return (
        <div className="flex h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden">
            <ToastContainer position="top-right" autoClose={2000} />

            {/* Dashboard Workspace Main Frame */}
            <div className="flex-1 flex flex-col h-full overflow-y-auto custom-scrollbar">
                <ProfileNavbar content="Profile Change Password Panel" />

                <div className="p-6 md:p-10 max-w-[1600px] w-full mx-auto space-y-10">
                    
                    {/* Header Heading Text Section */}
                    <div className="text-left space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-600/10">
                                <ShieldCheck className="w-5 h-5 text-white" />
                            </div>
                            <h1 className="text-3xl font-black text-white tracking-tight">
                                User <span className="text-indigo-400">Password Change</span>
                            </h1>
                        </div>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-8 items-start">
                        
                        {/* Detailed Registration Configuration Data Area */}
                        <div className="flex-1 w-full space-y-6">
                            <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden shadow-xl">
                                
                                {/* Info Panel Sub-Header */}
                                <div className="p-6 border-b border-white/5 bg-white/[0.02] flex items-center justify-between flex-wrap gap-4">
                                    <div className="flex items-center gap-2.5">
                                        <div className="p-2 bg-white/5 border border-white/10 rounded-lg text-indigo-400">
                                        </div>
                                        <h3 className="text-xs font-black text-slate-200 uppercase tracking-widest">Profile Details</h3>
                                    </div>                                    
                                </div>

                                <form action="" onSubmit={handleSubmit(updatePassword)} >
                                    {/* Password Change Fields Grid */}
                                    <div className="p-6 md:p-8 flex flex-col gap-6">
                                        <div className="space-y-2">
                                            <label htmlFor="email" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                                <KeyRound className="w-3 h-3 text-indigo-400" /> Email
                                            </label>
                                            <input type="email" id="email" className="w-full px-4 py-3 bg-white/[0.02] border border-white/5 rounded-xl font-mono text-xs text-slate-400" placeholder="Enter Email Address" {...register('email', {
                                                required: 'Email Is Required'
                                            })} />  

                                            {errors.email && <p className="text-xs text-rose-400 font-bold pl-1">{errors.email.message}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <label htmlFor="currentPassword" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                                <KeyRound className="w-3 h-3 text-indigo-400" /> Current Password
                                            </label>
                                            <input type="password" id="currentPassword" className="w-full px-4 py-3 bg-white/[0.02] border border-white/5 rounded-xl font-mono text-xs text-slate-400" placeholder="Enter Current Password" {...register('currentPassword', {
                                                required: 'Current Password Is Required'
                                            })} />  

                                            {errors.currentPassword && <p className="text-xs text-rose-400 font-bold pl-1">{errors.currentPassword.message}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <label htmlFor="newPassword" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                                <KeyRound className="w-3 h-3 text-indigo-400" /> New Password
                                            </label>
                                            <input type="password" id="newPassword" className="w-full px-4 py-3 bg-white/[0.02] border border-white/5 rounded-xl font-mono text-xs text-slate-400" placeholder="Enter New Password" {...register('newPassword', {
                                                required: 'New Password Is Required',
                                                minLength: {
                                                    value: 6,
                                                    message: 'Password should contain at least 6 letters'
                                                }
                                            })}/>

                                            {errors.newPassword && <p className="text-xs text-rose-400 font-bold pl-1">{errors.newPassword.message}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <label htmlFor="confirmNewPassword" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                                <KeyRound className="w-3 h-3 text-indigo-400" /> Confirm Password
                                            </label>
                                            <input type="password" id="confirmNewPassword" className="w-full px-4 py-3 bg-white/[0.02] border border-white/5 rounded-xl font-mono text-xs text-slate-400" placeholder="Enter New Password Again" {...register('confirmNewPassword', {
                                                required: 'confirm New Password Is Required',
                                                validate: (value) =>
                                                    value === watch('newPassword') || 'Password Do Not Match'
                                            })} />
                                        </div>

                                        <div className="p-6 flex justify-center border-t border-white/5">
                                        <button disabled={isSubmitting || !isValid} className={`flex items-center gap-2 px-5 py-3 text-xs font-black text-white rounded-xl shadow-lg shadow-indigo-600/10 transition-colors ${isSubmitting || !isValid ? "opacity-50 cursor-not-allowed bg-indigo-600": "bg-indigo-600 hover:bg-indigo-500 cursor-pointer" }`}> 
                                                <KeyRound size={14} />
                                                Update Password
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
    )
}

export default ChangePassword;