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
import PageNotFound from "./Components/PageNotFound"
import Timetables from "./Pages/DashboardItems/Timetables/Timetables"
import TimetablePreview from "./Pages/DashboardItems/Timetables/TimetablePreview"
import TeacherTimetables from "./Pages/DashboardItems/TeacherTimetables/TeacherTimetables"
import TeacherDashboard from "./Pages/Teacher/TeacherDashboard"
import TeacherMyTimetable from "./Pages/Teacher/TeacherMyTimetable"
import TeacherProfile from "./Pages/Teacher/TeacherProfile"
import Notifications from "./Pages/Notifications/Notifications"
import ActivityLogs from "./Pages/ActivityLogs/ActivityLogs"

function App() {
  return (
    <div>
      <Routes>
        {/* ── PUBLIC ── */}
        <Route path="/"                    element={<HomePage />} />
        <Route path="/auth/login"          element={<Login />} />
        <Route path="/auth/register"       element={<Register />} />
        <Route path="/auth/changePassword" element={<ChangePassword />} />

        {/* ── ADMIN ── */}
        <Route path="/dashboard" element={
          <ProtectedRoute allowedRoles={["Admin"]}><DashBoard /></ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute allowedRoles={["Admin"]}><Profile /></ProtectedRoute>
        } />
        <Route path="/profile/edit" element={
          <ProtectedRoute allowedRoles={["Admin"]}><ProfileEdit /></ProtectedRoute>
        } />
        <Route path="/teachers" element={
          <ProtectedRoute allowedRoles={["Admin"]}><Teachers /></ProtectedRoute>
        } />
        <Route path="/teachers/add" element={
          <ProtectedRoute allowedRoles={["Admin"]}><AddTeacher /></ProtectedRoute>
        } />
        <Route path="/teachers/edit/:teacherId" element={
          <ProtectedRoute allowedRoles={["Admin"]}><EditTeacher /></ProtectedRoute>
        } />
        <Route path="/departments" element={
          <ProtectedRoute allowedRoles={["Admin"]}><Department /></ProtectedRoute>
        } />
        <Route path="/departments/edit/:departmentId" element={
          <ProtectedRoute allowedRoles={["Admin"]}><EditDepartment /></ProtectedRoute>
        } />
        <Route path="/departments/add" element={
          <ProtectedRoute allowedRoles={["Admin"]}><AddDepartment /></ProtectedRoute>
        } />
        <Route path="/rooms" element={
          <ProtectedRoute allowedRoles={["Admin"]}><Rooms /></ProtectedRoute>
        } />
        <Route path="/rooms/add" element={
          <ProtectedRoute allowedRoles={["Admin"]}><AddRooms /></ProtectedRoute>
        } />
        <Route path="/rooms/edit/:roomId" element={
          <ProtectedRoute allowedRoles={["Admin"]}><EditRoom /></ProtectedRoute>
        } />
        <Route path="/subjects" element={
          <ProtectedRoute allowedRoles={["Admin"]}><Subjects /></ProtectedRoute>
        } />
        <Route path="/subjects/add" element={
          <ProtectedRoute allowedRoles={["Admin"]}><AddSubject /></ProtectedRoute>
        } />
        <Route path="/subjects/edit/:subjectId" element={
          <ProtectedRoute allowedRoles={["Admin"]}><EditSubject /></ProtectedRoute>
        } />
        <Route path="/generate" element={
          <ProtectedRoute allowedRoles={["Admin"]}><TimetableDashboard /></ProtectedRoute>
        } />
        <Route path="/timetables" element={
          <ProtectedRoute allowedRoles={["Admin"]}><Timetables /></ProtectedRoute>
        } />
        <Route path="/timetables/preview/:id" element={
          <ProtectedRoute allowedRoles={["Admin"]}><TimetablePreview /></ProtectedRoute>
        } />
        <Route path="/teacher-timetables" element={
          <ProtectedRoute allowedRoles={["Admin"]}><TeacherTimetables /></ProtectedRoute>
        } />
        <Route path="/teacher-timetables/preview/:teacherId" element={
          <ProtectedRoute allowedRoles={["Admin"]}><TeacherMyTimetable /></ProtectedRoute>
        } />

        {/* ── NOTIFICATIONS (Admin + Teacher) ── */}
        <Route path="/notifications" element={
          <ProtectedRoute allowedRoles={["Admin", "Teacher"]}><Notifications /></ProtectedRoute>
        } />

        {/* ── ACTIVITY LOGS (Founder only — double guard: role + isFounder) ── */}
        <Route path="/activity-logs" element={
          <ProtectedRoute allowedRoles={["Admin"]} requireFounder={true}>
            <ActivityLogs />
          </ProtectedRoute>
        } />

        {/* ── TEACHER PORTAL ── */}
        <Route path="/teacher/dashboard" element={
          <ProtectedRoute allowedRoles={["Teacher"]}><TeacherDashboard /></ProtectedRoute>
        } />
        <Route path="/teacher/my-timetable" element={
          <ProtectedRoute allowedRoles={["Teacher"]}><TeacherMyTimetable /></ProtectedRoute>
        } />
        <Route path="/teacher/profile" element={
          <ProtectedRoute allowedRoles={["Teacher"]}><TeacherProfile /></ProtectedRoute>
        } />

        {/* ── 404 ── */}
        <Route path="/*" element={<PageNotFound />} />
      </Routes>
    </div>
  )
}

export default App
