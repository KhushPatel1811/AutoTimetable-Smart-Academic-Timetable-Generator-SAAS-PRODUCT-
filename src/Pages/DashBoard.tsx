import Sidebar from "../Components/Dashboard/Sidebar";
import Navbar from "../Components/Dashboard/Navbar";
import QuickActions from "../Components/Dashboard/QuickActions";
import StatisticCards from "../Components/Dashboard/StatisticCards";

function DashBoard() {
    return(
        <div className="flex min-h-screen stocky">
            <Sidebar />
            <div className="flex-1">
                <Navbar />
                <StatisticCards />
                <QuickActions />
            </div>
        </div>
    )
}

export default DashBoard;