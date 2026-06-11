import { Menu } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

interface ProfileNavbarProps {
    onMenuToggle?: () => void;
    content: string
}


function ProfileNavbar({onMenuToggle, content} : ProfileNavbarProps) {
    interface User {
        adminName: string
    }

    const navigate = useNavigate()
    const [user, setUser] = useState<User | null>()

    useEffect(() => {
        const storedUser = localStorage.getItem('user')
        if(storedUser) {
            setUser(JSON.parse(storedUser))
        }
    },[])

    return(
        <>
            <div className="flex items-center px-4 md:px-0">
                {/* Mobile Menu Button */}
                <button 
                    onClick={onMenuToggle}
                    className="md:hidden mt-5 mr-3 p-2 bg-purple-600 text-white rounded-lg shadow-lg hover:bg-purple-700 transition-colors"
                >
                    <Menu size={24} />
                </button>

                <div className="flex justify-between w-full">
                    <div className="text-xl font-bold m-5 ml-20">{`${content}`}</div>
                    <div className="flex m-3 cursor-pointer mt-3" onClick={()=>navigate('/profile')}>
                        <div className="size-11 text-xl font-bold border rounded-full p-2 mr-3 bg-linear-to-br from-blue-500 via-cyan-500 to-green-500 text-white"><span>{user?.adminName?.charAt(0)?.toUpperCase()}</span><span>{user?.adminName?.charAt(1)?.toUpperCase()}</span></div>
                        <div className="mr-20 mt-1 text-xl font-bold">{user?.adminName}</div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default ProfileNavbar;