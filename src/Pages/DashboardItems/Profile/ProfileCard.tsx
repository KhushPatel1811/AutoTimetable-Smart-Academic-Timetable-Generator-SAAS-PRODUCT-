import { ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
const months: string[] = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

function ProfileCard() {
    interface User {
        _id: string,
        adminName: string,
        instituteName: string,
        email: string,
        createdAt: Date
    }

    const [user, setUser] = useState<User | null>(null)
    const [date, setDate] = useState<string>('')

    useEffect(()=>{
        const storedUser = localStorage.getItem('user') || null

        if(storedUser) {
            setUser(JSON.parse(storedUser))
        }
    },[])

    useEffect(()=>{
        if(!user?.createdAt) {
            return
        }
        const createdAt = new Date(user.createdAt)
        const today = createdAt.getDate()
        const month = months[createdAt.getMonth()]
        const year = createdAt.getFullYear()
        setDate(`${today} ${month}, ${year}`)
    },[user])

    return(
        <>
            <div className=" flex flex-col border-white lg:w-80 md:w-60 sm:w-40 max-w-sm mx-auto lg:mx-0 rounded-2xl shadow-md">
                <div className="bg-linear-to-br from-blue-500 via-cyan-500 to-green-500 h-24 rounded-t-2xl"></div>
                <div className="flex justify-center z-1">
                    <div className="border border-white bg-white rounded-full w-fit p-4 text-4xl text-blue-600 -mt-10"><span>{user?.adminName?.charAt(0)?.toUpperCase()}</span><span>{user?.adminName?.charAt(1)?.toUpperCase()}</span></div>
                </div>

                <div className="bg-gray-50 -mt-8 rounded-b-2xl">
                    <div className="flex justify-center mt-8">
                        <div className="text-2xl font-bold">{user?.adminName?.toUpperCase()}</div>
                    </div>

                    <div className="flex justify-center">
                        <div className="flex mt-5 bg-blue-100 w-fit pt-1 pb-1 pl-2 pr-2 rounded-2xl text-sm">
                            <ShieldCheck stroke="blue" size={20}/>
                            <span className="ml-2 text-blue-600">System User</span>
                        </div>
                    </div>

                    <div className="flex flex-col items-center mt-5 mb-5">
                        <div className="text-gray-500">{user?.instituteName?.toUpperCase()}</div>
                        <div className="text-gray-500">Registered: {date}</div>
                    </div>
                </div>
            </div>
        </>

    )
}

export default ProfileCard;