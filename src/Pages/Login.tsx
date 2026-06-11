import BackGround from "../Utilities/Background";
import { useForm } from "react-hook-form";
import axios from 'axios'
import { useNavigate } from "react-router";
import { toast, ToastContainer } from "react-toastify";

function Login() {
    interface LoginFormData {
        email:string,
        password:string 
    }
    const navigate = useNavigate()


    const {register, handleSubmit, formState: {errors, isValid, isSubmitting}} = useForm<LoginFormData>({
        defaultValues: {
            email: "",
            password: ""
        },
        mode: 'onChange',
        reValidateMode: 'onChange'
    })

    const isButtonDisabled = !isValid || isSubmitting;

    async function handleData(data: LoginFormData): Promise<void> {
        const {email, password} = data

        if(!email || !password) {
            return;
        }

        try {
            const response = await axios.post('http://localhost:1000/auth/login', {email, password})
            console.log(response.data)


            //! Store JWT Token
            localStorage.setItem('token', response.data.token)

            //! Store User Information
            localStorage.setItem('user', JSON.stringify(response.data.user))

            toast.success('User Login Successful')
            navigate(`/dashboard`)
        }
        catch(err: any) {
            console.log('Error Occurred', err)
            console.log('Response: ',err.response?.data.errors)
            console.log('Status: ', err.response?.status)
            toast.error(err.response?.data?.message || 'User Login Failed')
        }
    }


    return (
        <>
            <BackGround />
            <ToastContainer position="top-right" autoClose={2000} />

            <div className="flex min-h-screen items-center justify-center px-4">

                <div className="w-full max-w-md rounded-3xl border border-white/50 bg-white/70 p-10 shadow-2xl backdrop-blur-xl">

                    <div className="text-center">
                        <h1 className="text-4xl font-extrabold text-slate-900">
                            Welcome Back
                        </h1>

                        <p className="mt-3 text-slate-600">
                            Login to continue managing timetables
                        </p>
                    </div>

                    <form method="post" onSubmit={handleSubmit(handleData)}>
                        <div className="mt-10 flex flex-col gap-6">
                            <div className="flex flex-col gap-2">

                                <label htmlFor="email" className="text-sm font-semibold text-slate-700">
                                    Email 
                                </label>

                                <input type="text" id="email" placeholder="Enter Email" {...register('email', {
                                    required: 'Email isRequired',
                                    pattern: {
                                        value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-z]{2,}$/,
                                        message: 'Invalid email format'
                                    }
                                })} className="input-box -ml-2"/>

                                <div>
                                    {errors.email && <p className="text-red-500">{errors.email.message}</p> }
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">

                                <label htmlFor="password" className="text-sm font-semibold text-slate-700">
                                    Password
                                </label>

                                <input type="password" id="password" placeholder="Enter Password" {...register('password', {
                                    required:'Password Is Required',
                                    minLength: {
                                        value: 6,
                                        message: 'Password must be at least 6 characters'
                                    },
                                    pattern: {
                                        value: /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+]).{6,}$/,
                                        message: 'Password must contain at least 6 characters, including uppercase, lowercase, number, and special character'
                                    }
                                })} className="input-box -ml-2"/>

                                <div>
                                    {errors.password && <p className="text-red-500">{errors.password.message}</p>}
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <button type="button" className="text-sm font-medium text-indigo-600 transition hover:text-indigo-800">
                                    Forgot Password?
                                </button>
                            </div>

                            <button type="submit" disabled={isButtonDisabled} className={`mt-2 rounded-2xl  px-6 py-3 text-lg font-semibold text-white shadow-lg transition-all duration-300
                            ${isButtonDisabled ? 'cursor-not-allowed bg-gray-700' : 'bg-indigo-600 hover:scale-[1.02] hover:bg-indigo-700 hover:shadow-2xl cursor-pointer'}`}>
                                Login   
                            </button>

                            <p className="text-center text-sm text-slate-600">
                                Don’t have an account?{" "}
                                <span className="cursor-pointer font-semibold text-indigo-600 hover:text-indigo-800"><a href="/auth/register">
                                    Register
                                </a>
                                </span>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}

export default Login;