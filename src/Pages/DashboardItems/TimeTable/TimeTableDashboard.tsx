import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { useReactToPrint } from 'react-to-print';
import { Calendar, Printer, History, Sparkles, Clock, AlertCircle, CheckCircle2, GraduationCap, Grid3X3 } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';

function TimetableDashboard() {
  // Form states
  const [departmentName, setDepartmentName] = useState('');
  const [semester, setSemester] = useState('');
  const [targetMode, setTargetMode] = useState('School'); // 'School' or 'College'
  const [academicYear, setAcademicYear] = useState('2024-25');
  const [totalDivisions, setTotalDivisions] = useState('2');
  const [totalDays, setTotalDays] = useState('5');
  const [dayStartTime, setDayStartTime] = useState('09:00');
  const [dayEndTime, setDayEndTime] = useState('16:00');
  const [lectureDuration, setLectureDuration] = useState('60');
  const [labDuration, setLabDuration] = useState('120');

  // Data from API
  const [departments, setDepartments] = useState([]);
  const [activeSemesters, setActiveSemesters] = useState([]);
  const [timetable, setTimetable] = useState(null);
  const [dynamicSlots, setDynamicSlots] = useState([]);
  const [historyList, setHistoryList] = useState([]);
  const [conflicts, setConflicts] = useState(null);
  const [loading, setLoading] = useState(false);

  const printRef = useRef(null);



  const generateTimeSlots = (startTime: string, endTime: string, duration: number) => {
    const slots: string[] = [];
    console.log(startTime)
    console.log(endTime)

    const [startHour, startMinute] = startTime.split(":").map(Number);
    const [endHour, endMinute] = endTime.split(":").map(Number);

    let current = startHour * 60 + startMinute;
    const end = endHour * 60 + endMinute;

    while (current + duration <= end) {
      const next = current + duration;

      const format = (minutes: number) => {
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;

        return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
      };

      slots.push(`${format(current)} - ${format(next)}`);

      current = next;
    }
    return slots;
  };




  // Get user details from localStorage safely
  const getInstituteId = () => {
    const userItem = localStorage.getItem('user');
    const user = userItem ? JSON.parse(userItem) : null;
    return user ? (user.instituteId || user.instituteID) : '';
  };

  // Fetch History
  const fetchHistoryLedger = useCallback(async () => {
    try {
      const res = await axios.get('http://localhost:1000/timetable/history', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      setHistoryList(res.data);
    } catch (err) {
      console.error("Full Error Object:", err); // Log the whole thing to see why it failed

      // Safely extract the message
      const errorMessage = err.response?.data?.message || err.message || "Unknown error occurred";

      toast.error(`Generation failed: ${errorMessage}`);

      // Log the "Required vs Available" details if they exist in the response
      if (err.response?.data?.details) {
        console.warn("Constraint Failure Details:", err.response.data.details);
      }
    }
  }, []);

  // Fetch Current Timetable
  const syncLatestTimetable = useCallback(async () => {
    if (!departmentName || !semester) return;

    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:1000/timetable/latest`, {
        params: { department: departmentName, semester: Number(semester), instituteId: getInstituteId() },
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.data) {
        console.log("Response", res.data)
        const timetable = res.data.timetable;
        setTimetable(timetable);

        setDynamicSlots(generateTimeSlots(timetable.dayStartTime, timetable.dayEndTime, timetable.lectureDuration));
      } else {
        setTimetable(null);
        setDynamicSlots([]);
      }
    } catch (err) {
      setTimetable(null);
      setDynamicSlots([]);
    } finally {
      setLoading(false);
    }
  }, [departmentName, semester]);

  // Initial Fetch: Departments & History
  useEffect(() => {
    const fetchDepts = async () => {
      try {
        const res = await axios.get('http://localhost:1000/departments', {
          params: { instituteId: getInstituteId() },
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const depts = res.data.department || [];
        setDepartments(depts);
        if (depts.length > 0) setDepartmentName(depts[0].departmentName);
      } catch (err) {
        console.error("Failed to fetch departments:", err);
      }
    };
    fetchDepts();
    fetchHistoryLedger();
  }, [fetchHistoryLedger]);

  // Fetch Active Semesters when Department changes
  useEffect(() => {
    if (!departmentName) return;
    const fetchActiveSems = async () => {
      try {
        console.log("Institute ID:", getInstituteId())
        const res = await axios.get(`http://localhost:1000/subjects`, {
          params: { departmentFilter: departmentName, instituteId: getInstituteId() },
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const subs = res.data.subjects || [];
        console.log(res.data)
        const uniqueSems = [...new Set(subs.map(s => s.semester))];
        setActiveSemesters(uniqueSems);
        console.log('SEMESTER: ', activeSemesters)
      } catch (err) {
        console.error("Failed to fetch active semesters:", err);
      }
    };
    fetchActiveSems();
  }, [departmentName]);

  // Sync timetable when selection changes
  useEffect(() => {
    syncLatestTimetable();
  }, [syncLatestTimetable]);




  // Generate Timetable Button Action
  const triggerGenerationPipeline = async () => {
    const generatedSlots = generateTimeSlots(dayStartTime, dayEndTime, Number(lectureDuration)); // Fix Bug 6: uncommented so it's defined
    setLoading(true);

    try {
      const payload = {
        instituteId: getInstituteId(),
        departmentName,
        semester: Number(semester),
        totalDivisions: Number(totalDivisions),
        totalDays: Number(totalDays),
        totalSlotsPerDay: generatedSlots.length,
        dayStartTime,
        dayEndTime,
        lectureDuration: Number(lectureDuration),
        labDuration: Number(labDuration)
      };

      const res = await axios.post('http://localhost:1000/timetable/generate', payload, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      setTimetable(res.data.timetable);
      setDynamicSlots(generatedSlots); // Use backend slots if available
      fetchHistoryLedger(); // Refresh history after successful generation
      toast.success('Timetable generated successfully!');
    } catch (err) {
      toast.error("Generation failed: " + (err.response?.data?.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };


  // Print Settings
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Timetable_${departmentName}_${targetMode}_${semester}`,
  });

  const schoolClasses = Array.from({ length: 12 }, (_, i) => i + 1);
  const collegeSemesters = Array.from({ length: 8 }, (_, i) => i + 1);

  return (
    <div className="p-6 min-h-screen bg-slate-50 text-slate-800 font-sans">
      <ToastContainer position="top-right" autoClose={2000} />

      <div className="max-w-7xl mx-auto space-y-6">

        {/* Top Header Row */}
        <header className="bg-linear-to-r from-indigo-600 to-indigo-500 rounded-[2.5rem] p-8 shadow-2xl shadow-indigo-100 border border-white/10 relative overflow-hidden group">
          {/* Background Decoration */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -mr-24 -mt-24 group-hover:scale-110 transition-transform duration-700" />

          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            {/* Left */}
            <div className="flex items-center gap-6">
              <div className="p-5 bg-white/20 backdrop-blur-2xl rounded-[1.8rem] border border-white/30 shadow-inner">
                <Calendar className="w-9 h-9 text-white" />
              </div>

              <div>
                <h1 className="text-4xl font-black text-white tracking-tight">
                  Infinite Scheduler
                </h1>

                <p className="text-indigo-100 font-bold text-sm uppercase tracking-[0.25em] mt-1 opacity-90">
                  Create and manage institutional timetables
                </p>
              </div>
            </div>

            {/* Right */}
            <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
              <button onClick={handlePrint} disabled={!timetable} className="bg-white/15 backdrop-blur-xl border border-white/25 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-white/25 hover:cursor-pointer hover:scale-105 active:scale-95 transition-all duration-300 disabled:opacity-40 disabled:hover:scale-100 flex items-center justify-center gap-3">
                <Printer className="w-5 h-5" />
                Print
              </button>

              <button onClick={triggerGenerationPipeline} disabled={loading} className="bg-white text-indigo-600 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl hover:shadow-indigo-300 hover:scale-105 hover:cursor-pointer active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-3">
                <Sparkles className={`w-5 h-5 ${loading ? "animate-spin" : ""
                  }`} />
                {loading ? "Generating..." : "Generate Timetable"}
              </button>
            </div>
          </div>
        </header>

        {/* Configuration Forms */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Step 1: Mode and Targets */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-2 font-bold text-slate-900 border-b border-slate-100 pb-2">
              <GraduationCap className="w-4 h-4 text-indigo-600" />
              <h2>1. Select School or College</h2>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Department / Wing</label>
                <select value={departmentName} onChange={(e) => setDepartmentName(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  {departments.map(d => <option key={d._id} value={d.departmentName}>{d.departmentName}</option>)}
                  {departments.length === 0 && <option value="">No wings found</option>}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Target Mode</label>
                <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl">
                  <button onClick={() => { setTargetMode('School'); setSemester(''); }} className={`py-1.5 text-xs font-bold rounded-lg transition-colors ${targetMode === 'School' ? "bg-white text-indigo-600 shadow-xs" : "text-slate-500 hover:text-slate-800"}`}>
                    School
                  </button>
                  <button onClick={() => { setTargetMode('College'); setSemester(''); }} className={`py-1.5 text-xs font-bold rounded-lg transition-colors ${targetMode === 'College' ? "bg-white text-indigo-600 shadow-xs" : "text-slate-500 hover:text-slate-800"}`}>
                    College
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">
                  {targetMode === 'School' ? 'Class / Grade' : 'Semester'}
                </label>
                <select value={semester} onChange={(e) => setSemester(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="">Choose options...</option>
                  {targetMode === 'School'
                    ? schoolClasses.map(num => (
                      <option key={num} value={num}>Class {num} {activeSemesters.includes(num) ? '✓' : ''}</option>
                    ))
                    : collegeSemesters.map(num => (
                      <option key={num} value={num}>Semester {num} {activeSemesters.includes(num) ? '✓' : ''}</option>
                    ))
                  }
                </select>
              </div>
            </div>
          </div>

          {/* Step 2: Operational Timing Parameters */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2 font-bold text-slate-900 border-b border-slate-100 pb-2">
              <Grid3X3 className="w-4 h-4 text-indigo-600" />
              <h2>2. Operational Settings</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Total Divisions</label>
                <input type="number" value={totalDivisions} onChange={(e) => setTotalDivisions(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Working Days / Week</label>
                <select value={totalDays} onChange={(e) => setTotalDays(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  {[1, 2, 3, 4, 5, 6, 7].map(d => <option key={d} value={d}>{d} Days</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Day Starts At</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="time" value={dayStartTime} onChange={(e) => setDayStartTime(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 pl-9 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Day Ends At</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="time" value={dayEndTime} onChange={(e) => setDayEndTime(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 pl-9 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Lecture Duration (Mins)</label>
                <input type="number" value={lectureDuration} onChange={(e) => setLectureDuration(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Lab Duration (Mins)</label>
                <input type="number" value={labDuration} onChange={(e) => setLabDuration(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Timetable Output Table Block */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">

          {/* Main Matrix Board */}
          <div ref={printRef} className="xl:col-span-3 space-y-6">
            {loading ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-20 flex flex-col items-center justify-center space-y-3">
                <Sparkles className="w-8 h-8 text-indigo-500 animate-spin" />
                <p className="text-sm text-slate-500 font-medium">Computing optimal combinations...</p>
              </div>
            ) : timetable?.divisions ? (
              timetable.divisions.map((divData) => (
                <div key={divData.divisionName} className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
                  <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                    <span className="bg-indigo-600 text-white px-3 py-1 rounded-lg text-xs font-bold">{divData.divisionName}</span>
                    <span className="text-xs text-slate-400 font-medium">Schedule Grid</span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/40">
                          <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-r border-slate-100 w-32">
                            Day
                          </th>

                          {dynamicSlots.map((slot) => (
                            <th key={slot} className="p-6 text-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 min-w-[170px]">
                              {slot}
                            </th>
                          ))}
                        </tr>
                      </thead>

                      <tbody>
                        {divData.schedule.map((daySlots, dayIdx) => {
                          const slotArray = Array.isArray(daySlots.slots)
                            ? daySlots.slots
                            : Object.values(daySlots.slots || {});

                          return (
                            <tr key={dayIdx} className="border-b border-slate-100 hover:bg-slate-50/40 transition-colors">
                              
                              {/* Day */}
                              <td className="p-6 bg-slate-50 border-r border-slate-100">
                                <div className="font-black text-slate-800 uppercase tracking-wide">
                                  {daySlots.day}
                                </div>

                              </td>
                              {dynamicSlots.map((_, slotIdx) => {
                                const cell = slotArray[slotIdx];
                                
                                return (
                                  <td key={slotIdx} className="p-3 border-r border-slate-100 align-top h-32">
                                    {cell && !cell.free ? (
                                      <div className={`h-full rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg p-4 flex flex-col justify-between
                                          ${cell.subjectType === "Lab"
                                            ? "bg-amber-50 border-amber-200"
                                            : "bg-indigo-50 border-indigo-200"
                                          }`}>
                                        <div>
                                          <div className="font-black text-slate-900 text-sm leading-tight">
                                            {cell.subjectName}
                                          </div>

                                          <div className="text-xs text-slate-500 mt-2">
                                            {cell.teacherName}
                                          </div>

                                          <div className="text-xs text-slate-400">
                                            {cell.roomNumber}
                                          </div>

                                        </div>
                                        <div className="flex items-center justify-between mt-4">
                                          <span
                                            className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg
                                              ${cell.subjectType === "Lab"
                                                ? "bg-amber-100 text-amber-700"
                                                : "bg-indigo-100 text-indigo-700"
                                              }`}>
                                            {cell.subjectType}
                                          </span>
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="h-full rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-300 font-black uppercase tracking-widest text-[10px] bg-slate-50 transition-colors hover:bg-slate-100">
                                        Free
                                      </div>
                                    )}
                                  </td>
                                );
                              })}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center space-y-3">
                <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
                <div>
                  <h3 className="font-bold text-slate-700">No Timetable Selected</h3>
                  <p className="text-xs text-slate-400 mt-1">Please configure configurations above to start generating dashboards.</p>
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar Logs info and conflicts list */}
          <div className="space-y-6">
            {/* Optimization Status Tracker */}
            {conflicts ? (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center space-x-2 text-red-700 font-bold text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <h3>Conflicts Detected</h3>
                </div>
                <div className="space-y-2 text-xs text-red-900/80">
                  {conflicts.map((c, i) => (
                    <div key={i} className="bg-white/60 p-2 rounded-lg border border-red-100">{c}</div>
                  ))}
                </div>
              </div>
            ) : timetable && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center space-y-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 mx-auto" />
                <h3 className="font-bold text-emerald-800 text-sm">No Conflicts</h3>
                <p className="text-xs text-emerald-600/80">All resource limits successfully verified.</p>
              </div>
            )}

            {/* Timetable Versions History Tracker */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-4">
              <div className="flex items-center gap-2 text-slate-700 font-bold text-sm border-b border-slate-100 pb-2">
                <History className="w-4 h-4 text-indigo-600" />
                <h3>Revision Ledger</h3>
              </div>
              <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                {historyList.length > 0 ? historyList.map((h) => (
                  <div key={h._id} className="p-3 bg-slate-50 border border-slate-100 hover:border-indigo-200 hover:bg-white rounded-xl transition-all cursor-pointer text-xs">
                    <div className="flex justify-between font-bold text-slate-800 mb-1">
                      <span className="truncate max-w-[120px]">{h.departmentName}</span>
                      <span className="bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded text-[10px]">V{h.version}.0</span>
                    </div>
                    <p className="text-slate-400">Class {h.semester} • {h.totalDivisions} Divisions</p>
                  </div>
                )) : (
                  <p className="text-xs text-slate-400 text-center py-6">No previous versions save data logs available.</p>
                )}
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* Basic Inline Minimal Styles for clean custom Scrollbars integration */}
      <style dangerouslySetInnerHTML={{
        __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
      `}} />
    </div>
  );
}

export default TimetableDashboard;