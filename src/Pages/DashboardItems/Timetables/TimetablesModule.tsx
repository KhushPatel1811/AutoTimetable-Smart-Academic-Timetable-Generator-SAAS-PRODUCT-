import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { Calendar, Download, Filter, History, Printer, Search, Share2, Sparkles } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";

const API = "https://autotimetable-smart-academic-timetable.onrender.com/timetables-module";

const getInstituteId = () => {
  const userItem = localStorage.getItem("user");
  const user = userItem ? JSON.parse(userItem) : null;
  return user ? (user.instituteId || user.instituteID) : "";
};

const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`
});

function TimetablesModule() {
  const printRef = useRef<HTMLDivElement | null>(null);
  const [latest, setLatest] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [departmentName, setDepartmentName] = useState("");
  const [semester, setSemester] = useState("");
  const [selectedDivision, setSelectedDivision] = useState("");
  const [loading, setLoading] = useState(false);

  const filters = useMemo(() => ({
    instituteId: getInstituteId(),
    departmentName: departmentName || undefined,
    semester: semester || undefined
  }), [departmentName, semester]);

  const loadTimetables = useCallback(async () => {
    setLoading(true);
    try {
      const [latestRes, historyRes] = await Promise.all([
        axios.get(`${API}/latest`, { params: filters, headers: authHeaders() }).catch(() => ({ data: { timetable: null } })),
        axios.get(`${API}/history`, { params: { ...filters, search }, headers: authHeaders() })
      ]);

      setLatest(latestRes.data.timetable);
      setHistory(historyRes.data.items || []);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Unable to load timetables");
    } finally {
      setLoading(false);
    }
  }, [filters, search]);

  useEffect(() => {
    loadTimetables();
  }, [loadTimetables]);

  const activeDivision = useMemo(() => {
    if (!latest?.divisions?.length) return null;
    return latest.divisions.find((division: any) => division.divisionName === selectedDivision) || latest.divisions[0];
  }, [latest, selectedDivision]);

  const maxSlots = useMemo(() => {
    if (!activeDivision?.schedule?.length) return 0;
    return Math.max(...activeDivision.schedule.map((day: any) => day.slots?.length || 0));
  }, [activeDivision]);

  const handleDownloadPdf = async () => {
    if (!latest?._id) return;

    const res = await axios.get(`${API}/${latest._id}/pdf`, {
      headers: authHeaders(),
      responseType: "blob"
    });
    const url = URL.createObjectURL(res.data);
    const a = document.createElement("a");
    a.href = url;
    a.download = `timetable-${latest.departmentName}-${latest.semester}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    const contents = printRef.current?.innerHTML || "";
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`<html><head><title>Timetable</title></head><body>${contents}</body></html>`);
    win.document.close();
    win.print();
  };

  const handleShare = async () => {
    if (!latest?._id) return;
    const res = await axios.get(`${API}/${latest._id}/share`, { headers: authHeaders() });
    await navigator.clipboard.writeText(res.data.shareUrl);
    toast.success("Share link copied");
  };

  return (
    <div className="p-6 min-h-screen bg-slate-50 text-slate-800 font-sans">
      <ToastContainer position="top-right" autoClose={2000} />
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="bg-linear-to-r from-indigo-600 to-indigo-500 rounded-[2rem] p-7 shadow-2xl shadow-indigo-100 border border-white/10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-white/20 rounded-2xl border border-white/30">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-white">Timetables</h1>
                <p className="text-indigo-100 text-xs font-bold uppercase tracking-[0.22em]">Latest schedules, history, print and share</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <button onClick={handleDownloadPdf} disabled={!latest} className="bg-white/15 border border-white/25 text-white px-5 py-3 rounded-xl text-xs font-black uppercase flex items-center gap-2 disabled:opacity-40">
                <Download className="w-4 h-4" /> PDF
              </button>
              <button onClick={handlePrint} disabled={!latest} className="bg-white/15 border border-white/25 text-white px-5 py-3 rounded-xl text-xs font-black uppercase flex items-center gap-2 disabled:opacity-40">
                <Printer className="w-4 h-4" /> Print
              </button>
              <button onClick={handleShare} disabled={!latest} className="bg-white text-indigo-600 px-5 py-3 rounded-xl text-xs font-black uppercase flex items-center gap-2 disabled:opacity-40">
                <Share2 className="w-4 h-4" /> Share
              </button>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <section className="lg:col-span-3 space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="relative md:col-span-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search timetable history..." className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 pl-9 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <input value={departmentName} onChange={(e) => setDepartmentName(e.target.value)} placeholder="Department" className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                <input value={semester} onChange={(e) => setSemester(e.target.value)} placeholder="Semester" type="number" className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
            </div>

            <div ref={printRef} className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="font-black text-slate-900">Latest Generated Timetable</h2>
                  <p className="text-xs text-slate-500">{latest ? `${latest.departmentName} • Semester ${latest.semester}` : "No timetable available"}</p>
                </div>
                {latest?.divisions?.length > 0 && (
                  <select value={selectedDivision || latest.divisions[0].divisionName} onChange={(e) => setSelectedDivision(e.target.value)} className="bg-white border border-slate-200 rounded-xl p-2 text-sm">
                    {latest.divisions.map((division: any) => (
                      <option key={division.divisionName}>{division.divisionName}</option>
                    ))}
                  </select>
                )}
              </div>

              {loading ? (
                <div className="p-16 flex justify-center"><Sparkles className="animate-spin text-indigo-500" /></div>
              ) : activeDivision ? (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-slate-50/70">
                        <th className="p-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-400 border-r border-slate-100">Slot</th>
                        {activeDivision.schedule.map((day: any) => (
                          <th key={day.day} className="p-4 text-center text-[10px] font-black uppercase tracking-widest text-slate-400 min-w-[180px]">{day.day}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {Array.from({ length: maxSlots }).map((_, slotIndex) => (
                        <tr key={slotIndex} className="border-t border-slate-100">
                          <td className="p-4 bg-slate-50 border-r border-slate-100 text-xs font-black text-slate-600">Slot {slotIndex + 1}</td>
                          {activeDivision.schedule.map((day: any) => {
                            const slot = day.slots?.[slotIndex];
                            const isLab = slot?.subjectType === "Lab";
                            const isBreak = slot?.subjectType === "Break";
                            return (
                              <td key={`${day.day}-${slotIndex}`} className="p-3 align-top">
                                <div className={`min-h-24 rounded-xl border p-3 ${isBreak ? "bg-slate-100 border-slate-300" : isLab ? "bg-amber-50 border-amber-200" : slot?.free ? "bg-slate-50 border-dashed border-slate-200" : "bg-indigo-50 border-indigo-200"}`}>
                                  <div className="font-black text-sm text-slate-900">{slot?.subjectName || "Free"}</div>
                                  {!slot?.free && !isBreak && <div className="mt-2 text-xs text-slate-500">{slot?.teacherName} • {slot?.roomNumber}</div>}
                                  <span className="inline-block mt-3 text-[10px] font-black uppercase tracking-widest text-slate-500">{slot?.subjectType || "Free"}</span>
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-16 text-center text-slate-400 text-sm">Generate a timetable to view the weekly grid.</div>
              )}
            </div>
          </section>

          <aside className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-4">
              <div className="flex items-center gap-2 font-bold text-slate-700 border-b border-slate-100 pb-3">
                <Filter className="w-4 h-4 text-indigo-600" />
                Filters
              </div>
              <button onClick={loadTimetables} className="mt-4 w-full bg-indigo-600 text-white rounded-xl p-3 text-xs font-black uppercase">Apply Filters</button>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4">
              <div className="flex items-center gap-2 font-bold text-slate-700 border-b border-slate-100 pb-3">
                <History className="w-4 h-4 text-indigo-600" />
                Timetable History
              </div>
              <div className="mt-4 space-y-2 max-h-[520px] overflow-y-auto custom-scrollbar">
                {history.map((item) => (
                  <button key={item._id} onClick={() => setLatest(item)} className="w-full text-left p-3 bg-slate-50 border border-slate-100 hover:border-indigo-200 rounded-xl">
                    <div className="font-black text-sm text-slate-800">{item.departmentName}</div>
                    <div className="text-xs text-slate-400">Semester {item.semester} • V{item.version || 1}</div>
                  </button>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default TimetablesModule;
