import { Pencil, KeyRound } from "lucide-react"
import { useEffect, useState } from "react"
import ProfileNavbar from "./ProfileNavbar"
import ProfileCard from "./ProfileCard"
import { useNavigate } from "react-router"
import Sidebar from "../../../Components/Dashboard/Sidebar"

function Profile() {
    interface User {
        _id:string,
        instituteId: string,
        adminName: string,
        instituteName: string,
        email: string,
        createdAt: Date,
        updatedAt: Date,
    }

    const navigate = useNavigate()

    const [user, setUser] = useState<User | null>(null)
    useEffect(()=>{
        const storedUser = localStorage.getItem('user') || null
        if(storedUser) {
            setUser(JSON.parse(storedUser))
        }
    },[])

    const [isSidebarOpen, setIsSidebarOpen] = useState(false)

    return(
        <>
        <div className="flex fixed inset-0 min-h-screen overflow-x-hidden">
            <Sidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />

            <div className="w-full flex-1 transition-all duration-300">
                <ProfileNavbar onMenuToggle={() => setIsSidebarOpen(true)} content="Profile Page" />

                <div className="bg-linear-to-br from-purple-100/60 to-pink-100/60 transition-all duration-300 min-h-screen">
                    <div className="bg-linear-to-bl from-blue-100/60 to-green-100/60 pb-8 px-4 md:px-6 lg:px-10 min-h-screen">

                        <div className="pt-10 text-center md:text-left">
                            <div className="text-2xl md:text-3xl font-bold">
                                AutoTimeTable
                            </div>

                            <div className="text-gray-500 text-sm md:text-base">
                                Manage administrative credentials and institution preferences
                            </div>

                            <div className="flex flex-col xl:flex-row mt-10 gap-8 xl:gap-12 justify-center xl:justify-start items-center xl:items-start">

                                {/* Profile Card */}
                                <div className="w-full max-w-sm">
                                    <ProfileCard />
                                </div>

                                {/* Profile Details */}
                                <div className="bg-gray-50 w-full max-w-2xl rounded-2xl shadow-sm">

                                    <div className="flex flex-col sm:flex-row sm:justify-between gap-3 p-5">

                                        <div className="text-lg font-bold">
                                            Profile Details
                                        </div>

                                        <div
                                            className="flex items-center justify-center sm:justify-start gap-x-2 cursor-pointer"
                                            onClick={() => navigate('/profile/edit')}
                                        >
                                            <Pencil size={20} stroke="blue" />
                                            <span className="text-sm text-blue-600">
                                                Edit Details
                                            </span>
                                        </div>

                                    </div>

                                    <hr className="border-gray-300 mx-5" />

                                    <div className="m-5">
                                        <div>
                                            <label htmlFor="adminName" className="mr-3"> Admin Account Holder Name </label>
                                            <input type="text" className="input-box -ml-1" id="adminName" value={user?.adminName} readOnly/>
                                        </div>

                                        <div>
                                            <label htmlFor="instituteName" className="mr-3"> School / College Name </label>
                                            <input type="text" className="input-box -ml-1" id="instituteName" value={user?.instituteName} readOnly/>
                                        </div>

                                        <div>
                                            <label htmlFor="email" className="m-3"> Email Address </label>
                                            <input type="text" className="input-box -ml-1" id="email" value={user?.email} readOnly />
                                        </div>

                                        <div>
                                            <label htmlFor="instituteId" className="mr-3">Institute ID</label>
                                            <input type="text" className="input-box -ml-1" id="instituteId" value={user?.instituteId} readOnly />
                                        </div>

                                        <div className="mt-6">
                                            <button className="flex items-center gap-x-2 cursor-pointer w-full sm:w-auto px-4 py-3 rounded-lg border justify-center sm:justify-start bg-white hover:bg-gray-100 transition-colors">
                                                <KeyRound size={20} />
                                                <span className="text-sm font-bold"> Change Password </span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </>
    )
}

export default Profile