import Sidebar from "../Components/Dashboard/Sidebar";
import Navbar from "../Components/Dashboard/Navbar";
import QuickActions from "../Components/Dashboard/QuickActions";
import StatisticCards from "../Components/Dashboard/StatisticCards";
import { ToastContainer } from "react-toastify";
import { useEffect, useState } from "react";

function DashBoard() {
    const [userRole, setUserRole] = useState<string>('')

    useEffect(()=>{
        const user = localStorage.getItem('user')

        if(user) {
            const parsedUser = JSON.parse(user)
            setUserRole(user ? parsedUser?.role : '')
        }
    }, [])

    return (
        <>
        <div className="flex h-screen w-screen overflow-hidden bg-slate-50 selection:bg-indigo-500/30 selection:text-indigo-900">
            {/* Locked Sidebar */}
            <Sidebar />

            <div className="flex-1 flex flex-col h-full overflow-y-auto animate-page">
                {/* Global Toast Container */}
                <ToastContainer position="top-right" autoClose={2000} />

                {/* Main Header / Navigation */}
                <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 py-4">
                    <Navbar />
                </div>

                {/* Dashboard Intelligence Stream */}
                <main className="p-8 max-w-[1600px] w-full mx-auto space-y-12">
                    {/* Hero Welcome branding could go here if needed, but StatisticCards usually handle stats */}
                    
                    <section className="space-y-6">
                        <div className="flex items-center justify-between ml-1">
                            <div>
                                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Institutional <span className="text-indigo-600">Pulse</span></h2>
                                <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em] mt-1">Real-time resource synchronization</p>
                            </div>
                            <div className="badge-emerald px-4 py-2 flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                System Optimal
                            </div>
                        </div>
                        
                        <div className="animate-slide-up">
                            <StatisticCards />
                        </div>
                    </section>

                    {
                        userRole === 'Admin' &&
                        <section className="space-y-6">
                            <div className="flex items-center gap-3 ml-1">
                                <div className="h-6 w-1.5 bg-indigo-600 rounded-full shadow-[0_0_10px_rgba(79,70,229,0.3)]" />
                                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Rapid Deployment Nodes</h3>
                            </div>
                            
                            <div className="animate-slide-up" style={{ animationDelay: '100ms' }}>
                                <QuickActions />
                            </div>
                        </section>
                    }

                    {/* Additional Dashboard Insights could go here */}
                </main>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes slide-up {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-slide-up {
                    animation: slide-up 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
                }
            `}} />
        </div>
        </>
    )
}

export default DashBoard;