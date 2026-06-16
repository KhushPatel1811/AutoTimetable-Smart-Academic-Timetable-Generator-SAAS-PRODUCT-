import React from "react";
import BackGround from "../Utilities/Background";
import { useForm } from "react-hook-form";
import axios from 'axios';
import { useNavigate } from "react-router";
import { toast, ToastContainer } from "react-toastify";
import { ShieldCheck, Mail, LockKeyhole, ArrowRight, Sparkles } from "lucide-react";

function Login() {
    interface LoginFormData {
        email: string;
        password: string;
    }
    const navigate = useNavigate();

    const { register, handleSubmit, formState: { errors, isValid, isSubmitting } } = useForm<LoginFormData>({
        defaultValues: { email: "", password: "" },
        mode: 'onChange'
    });

    const isButtonDisabled = !isValid || isSubmitting;

    async function handleData(data: LoginFormData): Promise<void> {
        try {
            const response = await axios.post('http://localhost:1000/auth/login', data);
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            toast.success('Login successful');
            setTimeout(() => navigate(`/dashboard`), 1000);
        }
        catch(err: any) {
            toast.error(err.response?.data?.message || 'Invalid email or password');
        }
    }

    return (
        <div className="min-h-screen relative overflow-hidden bg-slate-950 flex items-center justify-center p-4 sm:p-6">
            <div className="absolute inset-0 z-0">
                <BackGround />
            </div>
            
            <ToastContainer position="top-right" autoClose={2000} />

            <div className="relative z-10 w-full max-w-[480px] animate-page">
                {/* Logo Branding */}
                <div className="flex flex-col items-center mb-8 space-y-4">
                    <div className="p-4 bg-indigo-600 rounded-3xl shadow-2xl shadow-indigo-500/20 rotate-3 hover:rotate-0 transition-transform duration-500">
                        <ShieldCheck className="w-10 h-10 text-white" />
                    </div>
                    <div className="text-center">
                        <h1 className="text-4xl font-black text-white tracking-tight">Infinite <span className="text-indigo-500">Scheduler</span></h1>
                        <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.4em] mt-2">Academic Logistics Platform</p>
                    </div>
                </div>

                {/* Login Container */}
                <div className="bg-white/10 backdrop-blur-3xl border border-white/20 rounded-[2.5rem] p-8 sm:p-12 shadow-2xl overflow-hidden relative group">
                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
                    
                    <div className="relative z-10 space-y-8">
                        <div className="text-center md:text-left">
                            <h2 className="text-2xl font-black text-white">Welcome Back</h2>
                            <p className="text-slate-400 text-sm font-medium mt-1">Sign in to manage your campus schedule</p>
                        </div>

                        <form onSubmit={handleSubmit(handleData)} className="space-y-6">
                            {/* Email Input Field */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                    <Mail className="w-3 h-3 text-indigo-400" /> Email Address
                                </label>
                                <input 
                                    type="email" 
                                    placeholder="admin@institution.edu" 
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-medium text-sm"
                                    {...register('email', { required: "Email is required" })}
                                />
                                {errors.email && <p className="text-xs text-rose-400 font-bold pl-1">{errors.email.message}</p>}
                            </div>

                            {/* Password Input Field */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between ml-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <LockKeyhole className="w-3 h-3 text-indigo-400" /> Password
                                    </label>
                                    <button type="button" className="text-[10px] font-black text-indigo-400 hover:text-indigo-300 uppercase tracking-widest transition-colors">
                                        Forgot Password?
                                    </button>
                                </div>
                                <input 
                                    type="password" 
                                    placeholder="••••••••" 
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-medium text-sm"
                                    {...register('password', { required: "Password is required" })}
                                />
                                {errors.password && <p className="text-xs text-rose-400 font-bold pl-1">{errors.password.message}</p>}
                            </div>

                            {/* Action Submit Button */}
                            <button 
                                type="submit" 
                                disabled={isButtonDisabled} 
                                className={`w-full group py-4 sm:py-5 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-widest transition-all duration-500 flex items-center justify-center gap-3
                                ${isButtonDisabled ? 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-50' : 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/20 hover:bg-indigo-500 hover:scale-[1.02] active:scale-[0.98]'}`}
                            >
                                {isSubmitting ? <Sparkles className="w-5 h-5 animate-spin" /> : (
                                    <>
                                        Sign In <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Navigation Footer */}
                        <div className="pt-6 text-center border-t border-white/5">
                            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">
                                New Institution?{" "}
                                <button type="button" onClick={() => navigate('/auth/register')} className="text-indigo-400 hover:text-indigo-300 hover:cursor-pointer transition-colors ml-1">
                                    Register here
                                </button>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;