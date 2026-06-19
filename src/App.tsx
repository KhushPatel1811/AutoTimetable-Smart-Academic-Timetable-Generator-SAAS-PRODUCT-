import HomePage from "./Pages/HomePage"
import { Routes, Route } from "react-router-dom"
import Login from "./Pages/Login"
import Register from "./Pages/Register"
import DashBoard from "./Pages/DashBoard"
import ProtectedRoute from "./Components/ProtectedRoute"
import Profile from "./Pages/DashboardItems/Profile/Profile"
import ProfileEdit from "./Pages/DashboardItems/Profile/ProfileEdit"
import ChangePassword from "./Components/ChangePassword"
import Teachers from "./Pages/DashboardItems/Teacher/Teachers"
import AddTeacher from "./Pages/DashboardItems/Teacher/AddTeacher"
import EditTeacher from "./Pages/DashboardItems/Teacher/EditTeacher"
import Department from "./Pages/DashboardItems/Department/Department"
import AddDepartment from "./Pages/DashboardItems/Department/AddDepartment"
import EditDepartment from "./Pages/DashboardItems/Department/EditDepartment"
import Rooms from "./Pages/DashboardItems/Rooms/Rooms"
import AddRooms from "./Pages/DashboardItems/Rooms/AddRoom"
import EditRoom from "./Pages/DashboardItems/Rooms/EditRoom"
import Subjects from "./Pages/DashboardItems/Subjects/Subjects"
import AddSubject from "./Pages/DashboardItems/Subjects/AddSubjects"
import EditSubject from "./Pages/DashboardItems/Subjects/EditSubjects"
import TimetableDashboard from "./Pages/DashboardItems/TimeTable/TimeTableDashboard"
import ReportsModule from "./Pages/DashboardItems/Reports/ReportsModule"
import SettingsModule from "./Pages/DashboardItems/Settings/SettingsModule"
import TimetablesModule from "./Pages/DashboardItems/Timetables/TimetablesModule"
import PageNotFound from "./Components/PageNotFound"
import ColleagueTeacher from "./Pages/DashboardItems/Teacher/ColleagueTeacher"

function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/register" element={<Register />} />
        <Route path="/auth/changePassword" element={<ChangePassword />}/>
        <Route path="/dashboard" element={<ProtectedRoute><DashBoard /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>}/>
        <Route path="/profile/edit" element={<ProtectedRoute><ProfileEdit /></ProtectedRoute>}/>
        <Route path="/teachers" element={<ProtectedRoute><Teachers /></ProtectedRoute>}/>
        <Route path="/teachers/add" element={<ProtectedRoute><AddTeacher /></ProtectedRoute>}/>
        <Route path="/teachers/edit/:teacherId" element={<ProtectedRoute><EditTeacher /></ProtectedRoute>}/>
        <Route path="/departments" element={<ProtectedRoute> <Department /> </ProtectedRoute>} />
        <Route path="/departments/edit/:departmentId" element={<ProtectedRoute> <EditDepartment /> </ProtectedRoute>} />
        <Route path="/departments/add" element={<ProtectedRoute> <AddDepartment /> </ProtectedRoute>} />
        <Route path="/rooms" element={<ProtectedRoute> <Rooms /> </ProtectedRoute>} />
        <Route path="/rooms/add" element={<ProtectedRoute> <AddRooms /> </ProtectedRoute>} />
        <Route path="/rooms/edit/:roomId" element={<ProtectedRoute> <EditRoom /> </ProtectedRoute>} />
        <Route path="/subjects" element={<ProtectedRoute> <Subjects /> </ProtectedRoute>} />
        <Route path="/subjects/add" element={<ProtectedRoute> <AddSubject /> </ProtectedRoute>} />
        <Route path="/subjects/edit/:subjectId" element={<ProtectedRoute> <EditSubject /> </ProtectedRoute>} />
        <Route path="/generate" element={<ProtectedRoute> <TimetableDashboard /> </ProtectedRoute>} />
        <Route path="/timetables" element={<ProtectedRoute> <TimetablesModule /> </ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute> <ReportsModule /> </ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute> <SettingsModule /> </ProtectedRoute>} />
        <Route path="/*" element={<PageNotFound />} />
        
        
        
        <Route path="/colleague/teachers" element={<ProtectedRoute> <ColleagueTeacher /> </ProtectedRoute>} />


        <Route path="/teacher/availability" element={<ProtectedRoute> <ColleagueTeacher /> </ProtectedRoute>} />
      </Routes>
    </div>
  )
}

export default App