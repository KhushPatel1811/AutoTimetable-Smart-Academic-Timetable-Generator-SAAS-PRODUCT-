import React from "react";
import BackGround from "../Utilities/Background";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { ShieldCheck, User, Building2, Mail, Phone, LockKeyhole, Sparkles, ArrowRight } from "lucide-react";

function Register() {
    interface RegistrationFormData {
        adminName: string;
        instituteName: string;
        email: string;
        phoneNumber: string;
        role: string;
        password: string;
        confirmPassword: string;
    }

    const navigate = useNavigate();

    const { register, handleSubmit, watch, formState: { errors, isValid, isSubmitting } } = useForm<RegistrationFormData>({
        defaultValues: {
            adminName: "",
            instituteName: "",
            email: "",
            phoneNumber: "",
            role: "Admin",
            password: "",
            confirmPassword: "",
        },
        mode: "onChange",
    });

    const isButtonDisabled = !isValid || isSubmitting;

    async function submitData(data: RegistrationFormData) {
        try {
            const response = await axios.post("http://localhost:1000/auth/register", data);
            if (response.data) {
                toast.success('Account created successfully!');
                setTimeout(() => navigate("/auth/login"), 2000);
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Registration failed. Please try again.');
        }
    }

    return (
        <div className="min-h-screen relative overflow-hidden bg-slate-950 flex items-center justify-center p-4 sm:p-6 lg:p-12">
            <div className="absolute inset-0 z-0">
                <BackGround />
            </div>
            
            <ToastContainer position="top-right" autoClose={2000} />

            {/* Form Container Wrapper - Full structural shifts on smaller screen sizes */}
            <div className="relative z-10 w-full max-w-5xl animate-page grid grid-cols-1 lg:grid-cols-2 bg-white/10 backdrop-blur-3xl border border-white/20 rounded-[2rem] md:rounded-[3rem] shadow-2xl overflow-hidden">
                
                {/* Left Side Banner: Automatically hidden on mobile devices, beautiful on desktop */}
                <div className="hidden lg:flex flex-col justify-between p-16 bg-linear-to-br from-indigo-600 to-indigo-900 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl" />
                    
                    <div className="relative z-10 space-y-6">
                        <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl w-fit border border-white/20">
                            <ShieldCheck className="w-10 h-10 text-white" />
                        </div>
                        <h1 className="text-5xl font-black text-white leading-tight">Empower Your <br /><span className="text-indigo-300">College Campus</span></h1>
                        <p className="text-indigo-100/70 font-medium text-lg max-w-sm">Setup your official digital dashboard for smart room allocation and automated timetables.</p>
                    </div>

                    <div className="relative z-10 flex items-center gap-6">
                        <div className="flex -space-x-3">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="w-10 h-10 rounded-full border-2 border-indigo-600 bg-slate-400" />
                            ))}
                        </div>
                        <p className="text-white/60 text-xs font-black uppercase tracking-widest">Trusted by 500+ Institutes</p>
                    </div>
                </div>

                {/* Right Side: Simple & Direct Input Panel */}
                <div className="p-6 sm:p-10 md:p-16 space-y-8 md:space-y-10 bg-white/5 overflow-y-auto max-h-[90vh] lg:max-h-[85vh] custom-scrollbar">
                    <div className="space-y-2 text-center lg:text-left">
                        <h2 className="text-2xl sm:text-3xl font-black text-white">Create Account</h2>
                        <p className="text-slate-400 font-bold text-[10px] sm:text-xs uppercase tracking-widest">Register your department on our system</p>
                    </div>

                    <form onSubmit={handleSubmit(submitData)} className="space-y-5 md:space-y-6">
                        {/* Name and University inputs */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                    <User className="w-3 h-3 text-indigo-400" /> Full Name
                                </label>
                                <input type="text" placeholder="John Doe" className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm font-bold" {...register("adminName", { required: "Name is required" })} />
                                {errors.adminName && <p className="text-xs text-rose-400 font-bold pl-1">{errors.adminName.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                    <Building2 className="w-3 h-3 text-indigo-400" /> Institute Name
                                </label>
                                <input type="text" placeholder="University Name" className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm font-bold" {...register("instituteName", { required: "Institute name is required" })} />
                                {errors.instituteName && <p className="text-xs text-rose-400 font-bold pl-1">{errors.instituteName.message}</p>}
                            </div>
                        </div>

                        {/* Email and Phone number inputs */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                    <Mail className="w-3 h-3 text-indigo-400" /> Email Address
                                </label>
                                <input type="email" placeholder="name@college.edu" className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm font-bold" {...register("email", { required: "Email is required" })} />
                                {errors.email && <p className="text-xs text-rose-400 font-bold pl-1">{errors.email.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                    <Phone className="w-3 h-3 text-indigo-400" /> Phone Number
                                </label>
                                <input type="tel" placeholder="+1 (000) 000-0000" className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm font-bold" {...register("phoneNumber", { required: "Phone number is required" })} />
                                {errors.phoneNumber && <p className="text-xs text-rose-400 font-bold pl-1">{errors.phoneNumber.message}</p>}
                            </div>
                        </div>

                        {/* Dropdown System Roles selection */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                <ShieldCheck className="w-3 h-3 text-indigo-400" /> Select Your Role
                            </label>
                            <div className="relative">
                                <select className="w-full bg-slate-900 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm font-bold appearance-none cursor-pointer" {...register("role", { required: true })}>
                                    <option value="Admin" className="bg-slate-950 text-white">Administrator (Admin)</option>
                                    <option value="Teacher" className="bg-slate-950 text-white">Faculty Member (Teacher)</option>
                                    <option value="Student" className="bg-slate-950 text-white">Enrolled Student (Student)</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-5 text-slate-400">
                                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                                </div>
                            </div>
                        </div>

                        {/* Password security structures */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                    <LockKeyhole className="w-3 h-3 text-indigo-400" /> Password
                                </label>
                                <input type="password" placeholder="••••••••" className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm font-bold" {...register("password", { required: "Password is required" })} />
                                {errors.password && <p className="text-xs text-rose-400 font-bold pl-1">{errors.password.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                    <LockKeyhole className="w-3 h-3 text-indigo-400" /> Confirm Password
                                </label>
                                <input type="password" placeholder="••••••••" className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm font-bold" {...register("confirmPassword", { required: "Please confirm your password", validate: (value) => value === watch('password') || "Passwords do not match" })} />
                                {errors.confirmPassword && <p className="text-xs text-rose-400 font-bold pl-1">{errors.confirmPassword.message}</p>}
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button 
                            type="submit" 
                            disabled={isButtonDisabled} 
                            className={`w-full group py-4 md:py-5 mt-2 rounded-2xl font-black text-xs md:text-sm uppercase tracking-[0.2em] transition-all duration-500 flex items-center justify-center gap-3
                            ${isButtonDisabled ? 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-50' : 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/20 hover:bg-indigo-500 hover:scale-[1.01]'}`}
                        >
                            {isSubmitting ? <Sparkles className="w-5 h-5 animate-spin" /> : (
                                <>
                                    Complete Registration <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>

                        <p className="text-center text-[10px] font-black text-slate-500 uppercase tracking-widest pt-2">
                            Already have an account?{" "}
                            <button type="button" onClick={() => navigate('/auth/login')} className="text-indigo-400 hover:cursor-pointer hover:text-indigo-300 transition-colors ml-1">
                                Login here
                            </button>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Register;