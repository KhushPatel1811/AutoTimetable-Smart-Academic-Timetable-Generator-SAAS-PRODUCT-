import { useNavigate } from "react-router"

function PageNotFound() {
    const navigate = useNavigate()
    return(
        <div className="flex flex-col justify-center h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden">
            <div className="text-center">
                <div className="text-[200px] font-bold">
                    404
                </div> 

                <div className="text-2xl -mt-4">
                    Oops! Page Not Found    
                </div>           

                <div className="text-xl mt-4">
                    Sorry, but the page you are looking for is not found.Please make sure you have typed correct url
                </div>

                <button className="mt-7 bg-slate-400 opacity-50 p-5 rounded-2xl px-7 hover:cursor-pointer" onClick={()=>navigate('/dashboard')}>
                    Back To Home
                </button>
            </div>
        </div>
    )
}

export default PageNotFound