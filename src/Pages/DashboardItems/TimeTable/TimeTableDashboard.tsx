import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { useReactToPrint } from 'react-to-print';
import { Calendar, Printer, History, Sparkles, Clock, AlertCircle, CheckCircle2, GraduationCap, Grid3X3} from 'lucide-react';
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



  const generateTimeSlots = (startTime: string,endTime: string,duration: number) => {
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
    }    }
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

        setDynamicSlots(generateTimeSlots(timetable.dayStartTime,timetable.dayEndTime,timetable.lectureDuration));
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
        console.log("Institute ID:",getInstituteId())
        const res = await axios.get(`http://localhost:1000/subjects`, {
          params: { departmentFilter: departmentName, instituteId: getInstituteId() },
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const subs = res.data.subjects || [];
        console.log(res.data)
        const uniqueSems = [...new Set(subs.map(s => s.semester))];
        setActiveSemesters(uniqueSems);
        console.log('SEMESTER: ',activeSemesters)
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
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-indigo-600 rounded-xl text-white">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Infinite Scheduler</h1>
              <p className="text-xs text-slate-500">Create and manage your institutional timetables</p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button 
              onClick={handlePrint} 
              disabled={!timetable} 
              className="flex-1 sm:flex-initial bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium text-sm px-4 py-2.5 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Printer className="w-4 h-4" /> Print
            </button>
            <button 
              onClick={triggerGenerationPipeline} 
              disabled={loading} 
              className="flex-1 sm:flex-initial bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm px-5 py-2.5 rounded-xl shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Sparkles className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Generating...' : 'Generate'}
            </button>
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
                <select 
                  value={departmentName} 
                  onChange={(e) => setDepartmentName(e.target.value)} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {departments.map(d => <option key={d._id} value={d.departmentName}>{d.departmentName}</option>)}
                  {departments.length === 0 && <option value="">No wings found</option>}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Target Mode</label>
                <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl">
                  <button 
                    onClick={() => { setTargetMode('School'); setSemester(''); }}
                    className={`py-1.5 text-xs font-bold rounded-lg transition-colors ${targetMode === 'School' ? "bg-white text-indigo-600 shadow-xs" : "text-slate-500 hover:text-slate-800"}`}
                  >
                    School
                  </button>
                  <button 
                    onClick={() => { setTargetMode('College'); setSemester(''); }}
                    className={`py-1.5 text-xs font-bold rounded-lg transition-colors ${targetMode === 'College' ? "bg-white text-indigo-600 shadow-xs" : "text-slate-500 hover:text-slate-800"}`}
                  >
                    College
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">
                  {targetMode === 'School' ? 'Class / Grade' : 'Semester'}
                </label>
                <select 
                  value={semester} 
                  onChange={(e) => setSemester(e.target.value)} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
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

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Academic Year</label>
                <select 
                  value={academicYear} 
                  onChange={(e) => setAcademicYear(e.target.value)} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="2023-24">2023-24</option>
                  <option value="2024-25">2024-25</option>
                  <option value="2025-26">2025-26</option>
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
                <input 
                  type="number" 
                  value={totalDivisions} 
                  onChange={(e) => setTotalDivisions(e.target.value)} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Working Days / Week</label>
                <select 
                  value={totalDays} 
                  onChange={(e) => setTotalDays(e.target.value)} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {[1,2,3,4,5,6,7].map(d => <option key={d} value={d}>{d} Days</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Day Starts At</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="time" 
                    value={dayStartTime} 
                    onChange={(e) => setDayStartTime(e.target.value)} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 pl-9 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Day Ends At</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="time" 
                    value={dayEndTime} 
                    onChange={(e) => setDayEndTime(e.target.value)} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 pl-9 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Lecture Duration (Mins)</label>
                <input 
                  type="number" 
                  value={lectureDuration} 
                  onChange={(e) => setLectureDuration(e.target.value)} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Lab Duration (Mins)</label>
                <input 
                  type="number" 
                  value={labDuration} 
                  onChange={(e) => setLabDuration(e.target.value)} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" 
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
                    <table className="w-full border-collapse text-left text-sm">
                      <thead>
                        <tr className="bg-slate-100/70 border-b border-slate-200">
                          <th className="p-4 font-semibold text-slate-600 w-24 border-r border-slate-200">Day</th>
                          {dynamicSlots.map((slot) => {
                            console.log(dynamicSlots)
                          return(
                            <th key={slot} className="p-4 font-semibold text-slate-600 text-center min-w-[150px]">
                              {slot}
                            </th>
                          )
                          })}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {divData.schedule.map((daySlots, dayIdx) => {
                          const slotArray = Array.isArray(daySlots.slots)
                            ? daySlots.slots
                            : Object.values(daySlots.slots || {});

                          return (
                            <tr key={dayIdx}>
                              {/* Day */}
                              <td className="border p-4 font-bold bg-slate-50 w-32">
                                {daySlots.day}
                              </td>

                              {/* Render EVERY time slot */}
                              {dynamicSlots.map((_, slotIdx) => {
                                const cell = slotArray[slotIdx];

                                return (
                                  <td key={slotIdx} className="border w-40 h-24 align-top p-2">
                                    {cell && !cell.free ? (
                                      <div className={`rounded p-2 h-full ${cell.subjectType === 'Lab' ? 'bg-amber-100' : 'bg-indigo-100'}`}>
                                        <div className="font-semibold text-xs">
                                          {cell.subjectName}
                                        </div>

                                        <div className="text-[10px] text-slate-600">
                                          {cell.teacherName}
                                        </div>

                                        <div className="text-[10px] text-slate-500">
                                          {cell.roomNumber}
                                        </div>

                                        {cell.subjectType === 'Lab' && (
                                          <div className="text-[9px] text-amber-700 font-bold mt-0.5">LAB</div>
                                        )}
                                      </div>
                                    ) : (
                                      <div className="h-full flex items-center justify-center text-slate-300 text-xs bg-slate-50/50 rounded">
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
      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
      `}} />
    </div>
  );
}

export default TimetableDashboard;