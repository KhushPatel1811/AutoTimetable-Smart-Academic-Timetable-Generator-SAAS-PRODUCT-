import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useReactToPrint } from 'react-to-print';
import { 
  Calendar, Download, Printer, Share2, History, Settings, Sparkles, Clock, Layers
} from 'lucide-react';

function TimetableDashboard() {
  // Input tracking states matching your custom backend parameters
  const [departmentName, setDepartmentName] = useState('Computer Engineering');
  const [semester, setSemester] = useState('4');
  const [totalDivisions, setTotalDivisions] = useState('3');
  const [totalDays, setTotalDays] = useState('5');
  const [dayStartTime, setDayStartTime] = useState('09:00');
  const [dayEndTime, setDayEndTime] = useState('16:00');
  const [lectureDuration, setLectureDuration] = useState('60');
  const [labDuration, setLabDuration] = useState('120'); // Explicit Lab Duration field
  
  // Storage and View States
  const [timetable, setTimetable] = useState(null);
  const [dynamicSlots, setDynamicSlots] = useState([]);
  const [historyList, setHistoryList] = useState([]);
  const [selectedDivision, setSelectedDivision] = useState('');
  const [loading, setLoading] = useState(false);
  
  const printRef = useRef(null);

  // Sync current selection from server storage
  const syncLatestTimetable = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:1000/api/timetables/latest`, {
        params: { department: departmentName, semester: Number(semester) }
      });
      if (res.data) {
        setTimetable(res.data.timetable);
        setDynamicSlots(res.data.generatedSlots);
        if (res.data.timetable?.divisions?.length > 0) {
          setSelectedDivision(res.data.timetable.divisions[0].divisionName);
        }
      } else {
        setTimetable(null);
        setDynamicSlots([]);
      }
    } catch (err) {
      console.error("Synchronization loop validation failure:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistoryLedger = async () => {
    try {
      const res = await axios.get('http://localhost:1000/api/timetables/history');
      setHistoryList(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    syncLatestTimetable();
    fetchHistoryLedger();
  }, [departmentName, semester]);

  // Handle compilation request targeting your dynamic refactored backend
  const triggerGenerationPipeline = async () => {
    setLoading(true);
    try {
      const payload = {
        departmentName,
        semester: Number(semester),
        totalDivisions: Number(totalDivisions),
        totalDays: Number(totalDays),
        dayStartTime,
        dayEndTime,
        lectureDuration: Number(lectureDuration),
        labDuration: Number(labDuration),
        subjects: [
          { subjectName: "Design & Analysis of Algorithms", subjectCode: "CE401", subjectType: "Lecture", teacherName: "Dr. K. Patel" },
          { subjectName: "Database Management Systems", subjectCode: "CE402", subjectType: "Lecture", teacherName: "Prof. R. Shah" },
          { subjectName: "Operating Systems Configuration", subjectCode: "CE403", subjectType: "Lecture", teacherName: "Prof. A. Mehta" },
          { subjectName: "Full-Stack System Engineering Lab", subjectCode: "CE404", subjectType: "Lab", teacherName: "Dr. K. Patel" }
        ]
      };
      
      const res = await axios.post('http://localhost:1000/api/timetables/generate', payload);
      setTimetable(res.data.timetable);
      setDynamicSlots(res.data.generatedSlots);
      setSelectedDivision(res.data.timetable.divisions[0].divisionName);
      fetchHistoryLedger();
    } catch (err) {
      alert("Matrix compilation failed. Confirm your system params values match constraint scales.");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Timetable_${departmentName}_Sem_${semester}`,
  });

  const activeDivisionData = timetable?.divisions?.find(
    (d) => d.divisionName === selectedDivision
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 antialiased font-sans">
      {/* Upper Navigation Control Layer Bar */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-indigo-600 text-white p-2 rounded-xl shadow-md shadow-indigo-100">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">Institute Timetable Space</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Dynamic Matrix Control System</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button onClick={() => window.open(`http://localhost:1000/api/timetables/pdf/${timetable?._id}`, '_blank')} disabled={!timetable} className="flex items-center px-3 py-1.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-40 cursor-pointer">
              <Download className="w-3.5 h-3.5 mr-1.5" /> Export PDF
            </button>
            <button onClick={() => handlePrint()} disabled={!timetable} className="flex items-center px-3 py-1.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-40 cursor-pointer">
              <Printer className="w-3.5 h-3.5 mr-1.5" /> Print
            </button>
            <button onClick={() => { navigator.clipboard.writeText(window.location.href); alert('Copied shared workspace link to clipboard!'); }} disabled={!timetable} className="flex items-center px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-md shadow-indigo-100 disabled:opacity-40 cursor-pointer">
              <Share2 className="w-3.5 h-3.5 mr-1.5" /> Share Matrix
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Dynamic Parameter Settings Dashboard Form Grid */}
        <section className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center space-x-2 text-slate-400 border-b border-slate-100 pb-3">
            <Settings className="w-4 h-4 text-indigo-500" />
            <h2 className="text-xs font-extrabold uppercase tracking-wider">Operational Parameters & Duration Constraints</h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-9 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-bold text-slate-400 uppercase">Department</label>
              <select value={departmentName} onChange={(e) => setDepartmentName(e.target.value)} className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-medium bg-slate-50/50">
                <option value="Computer Engineering">Computer Eng</option>
                <option value="Information Technology">Info Tech</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-bold text-slate-400 uppercase">Semester</label>
              <select value={semester} onChange={(e) => setSemester(e.target.value)} className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-medium bg-slate-50/50">
                {[1,2,3,4,5,6,7,8].map(n => <option key={n} value={n}>Sem {n}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-bold text-slate-400 uppercase">Divisions</label>
              <input type="number" min="1" max="6" value={totalDivisions} onChange={(e) => setTotalDivisions(e.target.value)} className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-medium bg-slate-50/50" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-bold text-slate-400 uppercase">Days/Week</label>
              <select value={totalDays} onChange={(e) => setTotalDays(e.target.value)} className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-medium bg-slate-50/50">
                <option value="5">5 Days</option>
                <option value="6">6 Days</option>
                <option value="7">7 Days</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-bold text-slate-400 uppercase">Day Start</label>
              <input type="time" value={dayStartTime} onChange={(e) => setDayStartTime(e.target.value)} className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-medium bg-slate-50/50" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-bold text-slate-400 uppercase">Day End</label>
              <input type="time" value={dayEndTime} onChange={(e) => setDayEndTime(e.target.value)} className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-medium bg-slate-50/50" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-bold text-slate-400 uppercase">Lecture (Min)</label>
              <input type="number" value={lectureDuration} onChange={(e) => setLectureDuration(e.target.value)} className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-medium bg-slate-50/50" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-bold text-slate-400 uppercase">Lab (Min)</label>
              <input type="number" value={labDuration} onChange={(e) => setLabDuration(e.target.value)} className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-medium bg-slate-50/50" />
            </div>
            <button onClick={triggerGenerationPipeline} disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-indigo-100 h-[32px] mt-auto flex items-center justify-center cursor-pointer disabled:opacity-50">
              <Sparkles className="w-3.5 h-3.5 mr-1" /> Compile
            </button>
          </div>
        </section>

        {/* Division Selection Row */}
        {timetable?.divisions && (
          <div className="flex items-center space-x-2 bg-white p-3 border border-slate-200/80 rounded-2xl shadow-2xs">
            <Layers className="w-4 h-4 text-emerald-500 ml-2" />
            <span className="text-xs font-extrabold text-slate-400 uppercase px-1">Active Targets:</span>
            <div className="flex gap-1.5">
              {timetable.divisions.map((div) => (
                <button key={div.divisionName} onClick={() => setSelectedDivision(div.divisionName)} className={`px-4 py-1.5 text-xs font-bold rounded-xl transition-all border cursor-pointer ${selectedDivision === div.divisionName ? "bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-100" : "bg-slate-50 border-slate-200/70 hover:bg-slate-100 text-slate-600"}`}>
                  {div.divisionName}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Dynamic Multi-span Generation Matrix Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          <div ref={printRef} className="lg:col-span-3 bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
            {loading ? (
              <div className="p-20 text-center text-sm font-semibold text-slate-400 animate-pulse">Running resource constraint allocation matrices...</div>
            ) : activeDivisionData ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[950px] border-collapse text-left">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-400 w-28 border-r border-slate-200/60">Day</th>
                      {dynamicSlots.map((slot) => (
                        <th key={slot} className="p-4 text-xs font-mono font-bold uppercase tracking-wider text-slate-500 text-center whitespace-nowrap">
                          {slot}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {activeDivisionData.schedule.map((dayData) => (
                      <tr key={dayData.day} className="hover:bg-slate-50/30 transition-colors">
                        <td className="p-4 font-bold text-slate-700 bg-slate-50/20 border-r border-slate-200/60 text-xs">
                          {dayData.day}
                        </td>
                        {dynamicSlots.map((slot) => {
                          const cell = dayData.slots[slot];
                          
                          // 1. If this block is skipped over because of an ongoing lab block, do not render an overlay td element
                          if (cell?.isContinuation) return null;

                          // 2. Programmatically compute horizontal span dimensions based on duration ratios
                          const slotsSpanCount = Math.ceil(Number(labDuration) / Number(lectureDuration));
                          const currentCellSpan = cell?.type === 'Lab' ? slotsSpanCount : 1;

                          return (
                            <td key={slot} colSpan={currentCellSpan} className="p-2">
                              {cell ? (
                                <div className={`p-3 rounded-xl border text-center transition-all shadow-2xs ${cell.type === 'Lab' ? 'bg-emerald-50/70 border-emerald-200/60 text-emerald-900' : 'bg-indigo-50/70 border-indigo-200/60 text-indigo-900'}`}>
                                  <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md uppercase tracking-wide inline-block mb-1.5 ${cell.type === 'Lab' ? 'bg-emerald-100 text-emerald-800' : 'bg-indigo-100 text-indigo-800'}`}>
                                    {cell.subjectCode}
                                  </span>
                                  <h4 className="font-bold text-xs leading-tight line-clamp-1">{cell.subjectName}</h4>
                                  <p className="text-[10px] text-slate-400 font-semibold mt-1.5">
                                    {cell.teacherName} &bull; <span className="font-bold text-slate-500">Room: {cell.roomNumber}</span>
                                  </p>
                                </div>
                              ) : (
                                <div className="text-center text-xs text-slate-300 font-mono py-4">-</div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-20 text-center text-sm font-bold text-slate-400">No active matrix timetable loaded. Configure parameter rules above and click Compile.</div>
            )}
          </div>

          {/* Activity Ledger Sidebar */}
          <aside className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
            <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-400 flex items-center">
              <History className="w-3.5 h-3.5 mr-1.5 text-indigo-500" /> Version History
            </h3>
            <div className="divide-y divide-slate-100 max-h-[380px] overflow-y-auto space-y-2">
              {historyList.length > 0 ? historyList.map((h) => (
                <div key={h._id} className="pt-2.5 first:pt-0 flex items-center justify-between text-xs">
                  <div className="truncate pr-2">
                    <h4 className="font-bold text-slate-700 truncate">{h.departmentName}</h4>
                    <p className="text-[10px] text-slate-400 font-medium">Sem {h.semester} &bull; {h.totalDivisions} Divisions</p>
                  </div>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded-md whitespace-nowrap">V {h.version}.0</span>
                </div>
              )) : (
                <p className="text-xs text-slate-400 italic text-center py-4">No historical records saved.</p>
              )}
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

export default TimetableDashboard;