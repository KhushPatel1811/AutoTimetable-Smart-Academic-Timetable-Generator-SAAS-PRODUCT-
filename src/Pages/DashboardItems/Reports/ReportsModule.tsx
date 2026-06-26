import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { BarChart3, Building2, DoorOpen, FileText, GraduationCap, PieChart, Users } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";

const API = "http://localhost:1000/reports-module";

const getInstituteId = () => {
  const userItem = localStorage.getItem("user");
  const user = userItem ? JSON.parse(userItem) : null;
  return user ? (user.instituteId || user.instituteID) : "";
};

const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`
});

const StatCard = ({ icon: Icon, title, value, tone }: any) => (
  <div className="bg-white border border-slate-200 rounded-2xl p-5">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs font-black uppercase tracking-widest text-slate-400">{title}</p>
        <h3 className="text-3xl font-black text-slate-900 mt-2">{value}</h3>
      </div>
      <div className={`p-4 rounded-2xl ${tone}`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  </div>
);

const BarList = ({ title, data, valueKey = "total", labelKey = "_id" }: any) => {
  const max = Math.max(1, ...data.map((item: any) => item[valueKey] || 0));

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5">
      <h3 className="font-black text-slate-900 mb-4">{title}</h3>
      <div className="space-y-3">
        {data.length === 0 && <p className="text-sm text-slate-400">No data available</p>}
        {data.map((item: any) => (
          <div key={item[labelKey] || "Unknown"}>
            <div className="flex justify-between text-xs font-bold text-slate-600 mb-1">
              <span>{item[labelKey] || "Unknown"}</span>
              <span>{item[valueKey] || 0}</span>
            </div>
            <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${((item[valueKey] || 0) / max) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

function ReportsModule() {
  const [departmentName, setDepartmentName] = useState("");
  const [semester, setSemester] = useState("");
  const [dashboard, setDashboard] = useState<any>({});
  const [teacherWorkload, setTeacherWorkload] = useState<any[]>([]);
  const [roomUtilization, setRoomUtilization] = useState<any[]>([]);
  const [subjectAllocation, setSubjectAllocation] = useState<any[]>([]);
  const [generation, setGeneration] = useState<any[]>([]);
  const [departmentStats, setDepartmentStats] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const params = useMemo(() => ({
    instituteId: getInstituteId(),
    departmentName: departmentName || undefined,
    semester: semester || undefined
  }), [departmentName, semester]);

  const loadReports = useCallback(async () => {
    setLoading(true);
    try {
      const [dash, teachers, rooms, subjects, gen, dept] = await Promise.all([
        axios.get(`${API}/dashboard`, { params, headers: authHeaders() }),
        axios.get(`${API}/teacher-workload`, { params, headers: authHeaders() }),
        axios.get(`${API}/room-utilization`, { params, headers: authHeaders() }),
        axios.get(`${API}/subject-allocation`, { params, headers: authHeaders() }),
        axios.get(`${API}/generation`, { params, headers: authHeaders() }),
        axios.get(`${API}/department-statistics`, { params, headers: authHeaders() })
      ]);

      setDashboard(dash.data);
      setTeacherWorkload(teachers.data.data || []);
      setRoomUtilization(rooms.data.data || []);
      setSubjectAllocation(subjects.data.data || []);
      setGeneration(gen.data.data || []);
      setDepartmentStats(dept.data || {});
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Unable to load reports");
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  return (
    <div className="p-6 min-h-screen bg-slate-50 text-slate-800 font-sans">
      <ToastContainer position="top-right" autoClose={2000} />
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="bg-linear-to-r from-indigo-600 to-indigo-500 rounded-[2rem] p-7 shadow-2xl shadow-indigo-100">
          <div className="flex flex-col lg:flex-row justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-white/20 rounded-2xl border border-white/30">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-white">Reports</h1>
                <p className="text-indigo-100 text-xs font-bold uppercase tracking-[0.22em]">Analytics, workload, utilization and allocation</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input value={departmentName} onChange={(e) => setDepartmentName(e.target.value)} placeholder="Department" className="bg-white/15 border border-white/25 text-white placeholder:text-indigo-100 rounded-xl p-3 text-sm outline-none" />
              <input value={semester} onChange={(e) => setSemester(e.target.value)} placeholder="Semester" type="number" className="bg-white/15 border border-white/25 text-white placeholder:text-indigo-100 rounded-xl p-3 text-sm outline-none" />
              <button onClick={loadReports} className="bg-white text-indigo-600 rounded-xl px-5 py-3 text-xs font-black uppercase">{loading ? "Loading..." : "Apply"}</button>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
          <StatCard icon={FileText} title="Timetables" value={dashboard.timetables || 0} tone="bg-indigo-50 text-indigo-600" />
          <StatCard icon={Users} title="Teachers" value={dashboard.teachers || 0} tone="bg-emerald-50 text-emerald-600" />
          <StatCard icon={DoorOpen} title="Rooms" value={dashboard.rooms || 0} tone="bg-amber-50 text-amber-600" />
          <StatCard icon={GraduationCap} title="Subjects" value={dashboard.subjects || 0} tone="bg-rose-50 text-rose-600" />
          <StatCard icon={Building2} title="Departments" value={dashboard.departments || 0} tone="bg-slate-100 text-slate-600" />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <BarList title="Teacher Workload Report" data={teacherWorkload} valueKey="total" />
          <BarList title="Room Utilization Report" data={roomUtilization} valueKey="usedSlots" />
          <BarList title="Subject Allocation Report" data={subjectAllocation} valueKey="total" />
          <BarList title="Timetable Generation Report" data={generation.map((item) => ({ _id: `${item._id.departmentName} S${item._id.semester}`, total: item.versions }))} valueKey="total" />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <BarList title="Department Teachers" data={departmentStats.teachers || []} valueKey="total" />
          <BarList title="Department Rooms" data={departmentStats.rooms || []} valueKey="total" />
          <BarList title="Department Subjects" data={departmentStats.subjects || []} valueKey="total" />
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <div className="flex items-center gap-2 font-black text-slate-900 mb-4">
            <PieChart className="w-5 h-5 text-indigo-600" />
            Analytics Dashboard
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">Average teacher slots: <b>{teacherWorkload.length ? Math.round(teacherWorkload.reduce((s, i) => s + i.total, 0) / teacherWorkload.length) : 0}</b></div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">Total room usage: <b>{roomUtilization.reduce((s, i) => s + i.usedSlots, 0)}</b></div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">Allocated subject slots: <b>{subjectAllocation.reduce((s, i) => s + i.total, 0)}</b></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReportsModule;
