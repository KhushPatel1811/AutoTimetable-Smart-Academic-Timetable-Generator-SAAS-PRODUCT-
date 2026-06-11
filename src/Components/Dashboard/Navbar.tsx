import axios from 'axios';
import {Astroid, Circle} from 'lucide-react'
import { useEffect, useState } from 'react';
import { useParams } from 'react-router';


function Navbar() {
    interface Data {
        user: [
            name:'',
            college_name: '',
            email: ''
        ]
    }
    const {id} = useParams()
    const [data, setData] = useState<Data[]>([])
    const [time, setTime] = useState('')

    const days:string[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

    const months: string[] = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

    useEffect(()=>{
        
        setTime(new Date().toLocaleTimeString('en-US', {hour:'2-digit',minute: '2-digit', hour12:true}))
        
        async function fetchData() {
            try {
                const token = localStorage.getItem('token')
                const response = await axios.get(`http://localhost:1000/dashboard`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                })
                console.log(response.data)
                setData(response.data)
            }
            catch(err) {
                console.log('Error Occurred', err)
                console.log('Response:', err.response?.data)
                console.log('Status:', err.response?.status)
            }
        }

        fetchData()

        const timer = setInterval(()=>{
            setTime(new Date().toLocaleTimeString('en-US', {hour:'2-digit', minute:'2-digit', hour12:true}))
        },1000)

        return ()=> clearInterval(timer)
    },[])



    return(
        <nav>
        <div className='linear bg-linear-to-br from-blue-500 via-purple-500 to-blue-500 m-3 rounded-xl p-5'>
            <div className='flex flex-row items-center'>
                <div className='mr-2'> <Astroid stroke='yellow' size={20} />  </div>
                <div className='text-gray-200 text-sm md:text-base'>Welcome Back!</div>
            </div>

            <div className='mt-5'>
                <div>
                    <span className='text-xl md:text-2xl text-white'>Hello {data?.user?.adminName} !</span>
                    <span className='text-2xl md:text-3xl ml-2 md:ml-3'>👋</span>
                </div>
            </div>

            <div className='text-gray-200 mt-3 text-sm md:text-base'>
                Ready to Optimize your institute's schedule today?
            </div>

            <div className='text-gray-200 flex flex-wrap items-center gap-2 mt-3 text-sm md:text-base'>
                <div className='flex items-center'>
                    <Circle fill='lightgreen' stroke='lightgreen' size={10} className='animate-pulse mr-2'/>
                    <span>{days[new Date().getDay()]}, </span>
                    <span>{months[new Date().getMonth()]} </span>
                    <span>{new Date().getDate()}, </span>
                    <span>{new Date().getFullYear()}</span>
                </div>

                <div className='md:ml-auto font-mono'>
                    <span>{time}</span>
                </div>
            </div>
        </div>
        </nav>
    )
}

export default Navbar;