import BackGround from "../Utilities/Background";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import axios from "axios";
import { useState } from "react";
import { toast, ToastContainer } from "react-toastify";

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

    const { register, handleSubmit, watch, formState: { errors, isValid, isSubmitting },} = useForm<RegistrationFormData>({
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
        reValidateMode: "onChange",
    });

    const isButtonDisabled = !isValid || isSubmitting;

    async function submitData(data: RegistrationFormData) {
        console.log(data);

        try {
            const { adminName, instituteName, email, phoneNumber, role, password,} = data;

            const response = await axios.post( "http://localhost:1000/auth/register", data);

            console.log(response.data);

            if(response.data) {
                toast.success('User Registered Successfully')
                setTimeout(()=>{
                    navigate("/auth/login");
                }, 3000)
            }
        } catch (err: any) {
            console.log("Error Occurred:", err);
            console.log("Response:", err.response?.data.errors);
            console.log("Status:", err.response?.status);
            toast.error(err.response?.data?.message || 'User Registration Field')
        }
    }

    return (
        <>
            <BackGround />
            <ToastContainer position="top-right" autoClose={2000} />

            <div className="flex min-h-screen items-center justify-center px-4">
                <div className="w-full max-w-max rounded-3xl border border-white/50 bg-white/70 p-10 shadow-2xl backdrop-blur-xl">
                    <div className="font-bold text-4xl text-center">
                        Welcome
                    </div>

                    <div className="text-center mb-5">
                        Register yourself to generate timetables
                    </div>
                    
                    <div className="fixed top-20 -right-120">
                        {showSuccessMessage && <SuccessMessage content="User Registered Successfully"/>}
                    </div>

                    <form method="Post" onSubmit={handleSubmit(submitData)}>
                        <div>
                            <label htmlFor="adminName" className="m-10"> Admin Name </label>
                            <br />

                            <input type="text" id="adminName" placeholder="Enter Admin Name" className="input-box ml-10 " {...register("adminName", {
                                    required: "Admin Name Is Required",
                                    minLength: {
                                        value: 3,
                                        message:"Admin Name Should Contain At least 3 characters",
                                    },
                                    maxLength: {
                                        value: 30,
                                        message:"Admin Name Should Contain At Most 30 Characters",
                                    },
                                    pattern: {
                                        value: /^[A-Za-z ]+$/,
                                        message:"Admin Name Should Contain Only Characters",
                                    },
                                })}/>

                            <div>
                                {errors.adminName && <p className="text-red-500">{errors.adminName?.message}</p>}
                            </div>
                        </div>

                        <div>
                            <label htmlFor="instituteName" className="m-10"> Institute Name </label>
                            <br />

                            <input type="text" id="instituteName" placeholder="Enter Institute Name" className="input-box ml-10" {...register("instituteName", {
                                    required: "Institute Name Is Required",
                                    minLength: {
                                        value: 3,
                                        message:"Institute Name Should Contain At least 3 characters",
                                    },
                                    maxLength: {
                                        value: 100,
                                        message: "Institute Name Should Contain At Most 100 Characters",
                                    },
                                    pattern: {
                                        value: /^[A-Za-z0-9\s.,&()-]+$/,
                                        message: "Invalid Institute Name",
                                    },
                                })}/>

                            <div>
                                {errors.instituteName && <p className="text-red-500">{errors.instituteName?.message}</p>}
                            </div>
                        </div>

                        <div>
                            <label htmlFor="email" className="m-10"> Email </label>
                            <br />

                            <input type="email" id="email" placeholder="Enter Email" className="input-box ml-10" {...register("email", {
                                    required: "Email is required",
                                    pattern: {
                                        value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-z]{2,}$/,
                                        message: "Invalid email format",
                                    },
                                })}/>

                            <div>
                                {errors.email && <p className="text-red-500 ml-7 mb-3">{errors.email.message}</p>}
                            </div>
                        </div>

                        <div>
                            <label htmlFor="phoneNumber" className="m-10"> Phone Number </label>
                            <br />

                            <input type="tel" id="phoneNumber" placeholder="Enter Phone Number" className="input-box ml-10" {...register("phoneNumber", {
                                    required: "Phone Number is required",
                                    pattern: {
                                        value: /^[0-9]{10}$/,
                                        message: "Phone Number must contain exactly 10 digits",
                                    },
                                })}/>

                            <div>
                                {errors.phoneNumber && <p className="text-red-500 mb-3">{errors.phoneNumber.message}</p> }
                            </div>
                        </div>

                        <div>
                            <label htmlFor="role" className="m-10"> Role </label>
                            <br />

                            <select id="role" className="input-box ml-10" {...register("role", {
                                    required: "Role is required",
                                })}>
                                <option value="Admin">Admin</option>
                                <option value="Teacher">Teacher</option>
                                <option value="Student">Student</option>
                            </select>

                            <div>
                                {errors.role && <p className="text-red-500 mb-3"> {errors.role.message} </p>}
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="m-10"> Password </label>
                            <br />

                            <input type="password" id="password" placeholder="Enter Password" className="input-box ml-10" {...register("password", {
                                    required: "Password is required",
                                    minLength: {
                                        value: 6,
                                        message:"Password must be at least 6 characters long",
                                    },
                                    pattern: {
                                        value: /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+]).{6,}$/,
                                        message: "Password must contain at least 6 characters, including uppercase, lowercase, number, and special character",
                                    },
                                })}/>

                            <div>
                                {errors.password && <p className="text-red-500 mb-3">{errors.password.message}</p>}
                            </div>
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="m-10"> Confirm Password </label>
                            <br />

                            <input type="password" id="confirmPassword" placeholder="Confirm Password" className="input-box ml-10" {...register("confirmPassword", {
                                    required:
                                        "Confirm Password is required",
                                    validate: (value) => value === watch("password") || "Passwords do not match",
                                })}/>

                            <div>
                                {errors.confirmPassword && <p className="text-red-500 mb-3">{errors.confirmPassword.message} </p> }
                            </div>
                        </div>

                        <div>
                            <button type="submit" disabled={isButtonDisabled} className={`mt-2 rounded-2xl w-100 ml-5 px-6 py-3 text-lg font-semibold text-white shadow-lg transition-all duration-300
                                ${isButtonDisabled ? "cursor-not-allowed bg-gray-700" : "bg-indigo-600 hover:scale-[1.02] hover:bg-indigo-700 hover:shadow-2xl cursor-pointer"}`}>
                                Register
                            </button>
                        </div>

                        <div className="text-center mt-7">
                            Already have an account?{" "}
                            <span className="cursor-pointer font-semibold text-indigo-600 hover:text-indigo-800">
                                <a href="/auth/login">
                                    Login
                                </a>
                            </span>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}

export default Register;