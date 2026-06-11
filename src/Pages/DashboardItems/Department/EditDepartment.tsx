import { useNavigate, useParams } from "react-router"
import ProfileNavbar from "../Profile/ProfileNavbar"
import BackGround from "../../../Utilities/Background"
import { useForm } from "react-hook-form"
import { useEffect } from "react"
import axios from "axios"
import { toast, ToastContainer } from "react-toastify"

function EditDepartment() {
    const {departmentId} = useParams()
    const navigate = useNavigate()

    interface Department {
        departmentName: string
    }

    const {register, handleSubmit, reset, formState:{errors, isValid, isSubmitting}} = useForm<Department>({
        defaultValues: {
            departmentName: ''
        },
        mode: 'onChange'
    })


    useEffect(()=>{
        async function fetchData() {
            try {
                const response = await axios.get(`http://localhost:1000/departments/edit/${departmentId}`)
                console.log('RESPONSE DATA: ',response.data)
                reset({departmentName: response.data?.department?.departmentName})
                
            } 
            catch(err: any) {
                console.log('Error Occurred: ',err)
                console.log('Response: ',err.response?.data?.message)
                console.log('Status: ', err.response?.status)
            }
        }
        fetchData()
    }, [reset, departmentId])



    async function updateData(data: Department) {
        console.log(data)

        try{
            const response = await axios.put('http://localhost:1000/departments/edit', {...data, departmentId}, {
                headers:{
                    "Content-Type": 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            })

            console.log('RESPONSE DATA', response.data)

            if(response) {
                toast.success('Department Updated Successfully')

                setTimeout(()=>{
                    navigate('/departments')
                },3000)
            }
        }
        catch(err:any) {
            console.log('Error Occurred:', err)
            console.log('Response: ',err.response?.data?.message)
            console.log('Status:', err.response?.status)
            toast.error(err.response?.data?.message || 'Department Updation Failed')
        }
    }


    return(
        <>
            <div>
                <div className="fixed inset-0 -z-10 pointer-events-none">
                    <BackGround />
                </div>
                
                <div>
                    <ProfileNavbar content="Edit Department Page" />
                    <ToastContainer position="top-right" autoClose={2000}/>

                    <form onSubmit={handleSubmit(updateData)}>
                        <div className="border rounded-xl mx-15 mt-10 bg-white z-10">
                            <h1 className="text-center text-2xl font-bold mt-4 mb-4">Edit Department Details</h1>
                            <div>
                                <div className="flex justify-center">
                                    <label className="text-lg mt-4 ml-4 font-semibold" htmlFor={`departmentNam`}>Department Name</label>
                                    <div>
                                        <input type="text" className="input-box ml-4" id={`departmentNam`} placeholder="Enter Department Name" {...register(`departmentName`, {
                                            required: 'Department Name Is Required',
                                            minLength: {
                                                value:3,
                                                message: 'At Least 3 characters are required'
                                            },
                                            maxLength: {
                                                value:50,
                                                message: 'At Least 50 characters are required'
                                            },
                                            pattern: {
                                                value: /^[A-Za-z0-9 ]+$/,
                                                message: 'Department Name Should Not Contain Special Characters'
                                            }
                                        })}/>

                                        <div>
                                            {errors.departmentName && <p className="text-red-500">{errors.  departmentName.message}</p> }
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-center">
                                <button disabled={isSubmitting || !isValid} className={`add-btn ${(isSubmitting || !isValid) ? 'opacity-50 cursor-not-allowed' : 'add-btn'}`}>{(isSubmitting || !isValid) ? 'Updating Department Data' : 'Update Department Detail'}</button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </>
    )
}

export default EditDepartment