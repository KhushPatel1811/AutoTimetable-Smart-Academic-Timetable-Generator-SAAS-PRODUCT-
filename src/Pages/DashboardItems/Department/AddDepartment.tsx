import { useFieldArray, useForm } from "react-hook-form"
import ProfileNavbar from "../Profile/ProfileNavbar"
import BackGround from "../../../Utilities/Background"
import axios from "axios"
import { toast, ToastContainer } from "react-toastify"
import { useNavigate } from "react-router"

function AddDepartment() {
    const navigate = useNavigate()
    
    interface Department {
        DepartmentName: {
            departmentName: string
        }[]
    }


    const {register, handleSubmit, control, formState: {errors, isSubmitting, isValid}} = useForm({
        defaultValues: {
            DepartmentName: [{departmentName: ''}]
        },
        mode: 'onChange',
        reValidateMode: 'onChange'
    })

    const {fields, append, remove} = useFieldArray({
        control,
        name: 'DepartmentName'
    })


    
    async function submitData(data: Department):Promise<void> {
        console.log(data)

        const user  = localStorage.getItem('user')
        const instituteId: string = user ? JSON.parse(user).instituteId : null
        const userId: string = user ? JSON.parse(user)._id : null

        console.log('Institute Id', instituteId)
        console.log('User Id', userId)

        try {
            const response = await axios.post('http://localhost:1000/departments/add',{...data, instituteId, userId}, {
                headers:{
                    'Content-Type' : 'application/json',
                    'Authorization':  `Bearer ${localStorage.getItem('token')}`
                }
            })

            
            console.log(response.data)

            if(response) {
                toast.success('Department Added Successfully')
                setTimeout(()=>{
                    navigate('/departments')
                }, 3000)
            }
        }
        catch(err: any) {
            console.log('Error Occurred: ',err)
            console.log('Response: ',err.response?.data?.message)
            console.log('Status: ', err.response?.status)
            toast.error(err.response?.data?.message || 'Department Registration Failed')
        }
    }

    return(
        <>
            <div className="flex h-screen w-screen overflow-hidden">
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
                                        <div className="flex items-start">
                                            <label htmlFor={`departmentName_${index}`}className="mt-5 ml-2 text-xl font-bold">
                                                Department Name
                                            </label>

                                            <div className="ml-5">
                                                <input type="text" id={`departmentName_${index}`} className="input-box w-80" placeholder="Enter Department Name" {...register(`DepartmentName.${index}.departmentName`, {
                                                        required: 'Department Name Is Required',
                                                        minLength: {
                                                            value: 3,
                                                            message: 'At Least 3 characters required'
                                                        },
                                                        maxLength: {
                                                            value: 50,
                                                            message: 'At Most 50 characters required'
                                                        },
                                                        pattern: {
                                                            value: /^[A-Za-z ]+$/,
                                                            message: 'Department Name Should Contain Only Characters'
                                                        }
                                                    })}/>

                                                {errors.DepartmentName?.[index]?.departmentName && <p className="text-red-500">{errors.DepartmentName[index]?.departmentName?.message}</p>}
                                            </div>

                                            <div className="ml-5 flex gap-2">
                                                <button type="button" className="add-btn hover:cursor-pointer" onClick={() => append({ departmentName: '' })}>
                                                    Add Row
                                                </button>

                                                <button type="button" disabled={fields.length === 1} className={`delete-btn ${fields.length === 1 ? 'cursor-not-allowed opacity-50' : 'hover:cursor-pointer'}`} onClick={() => remove(index)}>
                                                    Delete Row
                                                </button>
                                            </div>
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

export default AddDepartment