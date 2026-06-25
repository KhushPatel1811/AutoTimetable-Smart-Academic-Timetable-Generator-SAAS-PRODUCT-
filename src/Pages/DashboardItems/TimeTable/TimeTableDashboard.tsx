import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { useReactToPrint } from 'react-to-print';
import { Calendar, Printer, Sparkles, GraduationCap, Grid3X3 } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';

function TimetableDashboard() {
  // ---------------- STATES ----------------
  const [departmentName, setDepartmentName] = useState('');
  const [semester, setSemester] = useState('');
  const [targetMode, setTargetMode] = useState('School');
  const [generatedBreaks, setGeneratedBreaks] = useState([]);

  const [totalDivisions, setTotalDivisions] = useState('2');
  const [totalDays, setTotalDays] = useState('5');

  const [dayStartTime, setDayStartTime] = useState('09:00');
  const [dayEndTime, setDayEndTime] = useState('16:00');

  const [lectureDuration, setLectureDuration] = useState('60');
  const [labDuration, setLabDuration] = useState('120');

  const [breakCount, setBreakCount] = useState('0');
  const [breakDurations, setBreakDurations] = useState([]);

  const [departments, setDepartments] = useState([]);
  const [activeSemesters, setActiveSemesters] = useState([]);
  const [timetable, setTimetable] = useState(null);
  const [dynamicSlots, setDynamicSlots] = useState([]);
  const [historyList, setHistoryList] = useState([]);
  const [loading, setLoading] = useState(false);

  const printRef = useRef(null);

  // ---------------- TIME HELPERS ----------------
  const minutesToTime = (minutes) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  };

  const buildTimetableSlots = (startTime, endTime, lectureMinutes, breaks) => {
    const [sh, sm] = startTime.split(":").map(Number);
    const [eh, em] = endTime.split(":").map(Number);

    let current = sh * 60 + sm;
    const end = eh * 60 + em;

    const safeLecture = Math.max(1, Number(lectureMinutes) || 60);
    const safeBreaks = breaks.map(b => Math.max(0, Number(b) || 0)).filter(b => b > 0);

    // Simulate the timeline to compute exact break-after-slot positions
    // by evenly distributing breaks across the available lecture slots
    const totalBreakTime = safeBreaks.reduce((a, b) => a + b, 0);
    const availableTime = (end - current) - totalBreakTime;
    const totalLectureSlots = Math.floor(availableTime / safeLecture);

    const breakAfterSlot: number[] = safeBreaks.map((_, i) =>
      Math.floor((i + 1) * totalLectureSlots / (safeBreaks.length + 1))
    );

    const slotLabels: string[] = [];
    const breakSlots: { slotIndex: number; duration: number; label: string }[] = [];
    let breakIndex = 0;

    // Simulate actual clock to generate time-accurate labels
    let clock = sh * 60 + sm;

    for (let n = 0; n < totalLectureSlots; n++) {
      slotLabels.push(`${minutesToTime(clock)} - ${minutesToTime(clock + safeLecture)}`);
      clock += safeLecture;

      if (breakIndex < safeBreaks.length && slotLabels.length === breakAfterSlot[breakIndex]) {
        breakSlots.push({
          slotIndex: slotLabels.length,
          duration: safeBreaks[breakIndex],
          label: `${minutesToTime(clock)} - ${minutesToTime(clock + safeBreaks[breakIndex])}`
        });
        clock += safeBreaks[breakIndex];
        breakIndex++;
      }
    }

    return { slotLabels, breakSlots };
  };

  const parsedBreakDurations = () =>
    breakDurations.map(Number).filter(n => Number.isFinite(n) && n > 0);

  // ---------------- INSTITUTE ----------------
  const getInstituteId = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user?.instituteId || user?.instituteID || '';
  };

  // ---------------- HISTORY ----------------
  const fetchHistoryLedger = useCallback(async () => {
    try {
      const res = await axios.get('http://localhost:1000/timetable/history', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setHistoryList(res.data || []);
    } catch (err) {
      toast.error(err?.response?.data?.message || "History fetch failed");
    }
  }, []);

  // ---------------- SYNC ----------------
  const syncLatestTimetable = useCallback(async () => {
    if (!departmentName || !semester) return;

    setLoading(true);
    try {
      const res = await axios.get('http://localhost:1000/timetable/latest', {
        params: {
          department: departmentName,
          semester: Number(semester),
          instituteId: getInstituteId()
        },
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      const data = res.data?.timetable;

      if (data) {
        setTimetable(data);
        setDynamicSlots(data.timeSlots || []);
      } else {
        setTimetable(null);
        setDynamicSlots([]);
      }
    } catch {
      setTimetable(null);
      setDynamicSlots([]);
    } finally {
      setLoading(false);
    }
  }, [departmentName, semester]);

  // ---------------- EFFECTS ----------------
  useEffect(() => {
    const fetchDepts = async () => {
      try {
        const res = await axios.get('http://localhost:1000/departments', {
          params: { instituteId: getInstituteId() },
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });

        const depts = res.data?.department || [];
        setDepartments(depts);
        if (depts.length) setDepartmentName(depts[0].departmentName);
      } catch (e) {
        console.error(e);
      }
    };

  fetchDepts();
    fetchHistoryLedger();
  }, [fetchHistoryLedger]);

  useEffect(() => {
    const count = Number(breakCount) || 0;
    setBreakDurations(prev => {
      const arr = [...prev].slice(0, count);
      while (arr.length < count) arr.push("15");
      return arr;
    });
  }, [breakCount]);

  useEffect(() => {
    if (!departmentName) return;

    (async () => {
      try {
        const res = await axios.get('http://localhost:1000/subjects', {
          params: {
            departmentFilter: departmentName,
            instituteId: getInstituteId()
          },
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });

        const subs = res.data?.subjects || [];
        const sems = [...new Set(subs.map(s => s.semester))];
        setActiveSemesters(sems);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [departmentName]);

  useEffect(() => {
  syncLatestTimetable();
}, [departmentName, semester]);

  // ---------------- GENERATE ----------------
  const triggerGenerationPipeline = async () => {
    setLoading(true);

    try {
      const breaks = parsedBreakDurations();
      const slots = buildTimetableSlots(
        dayStartTime,
        dayEndTime,
        lectureDuration,
        breaks
      );
      const breaksData = slots.breakSlots;

      const payload = {
        instituteId: getInstituteId(),
        departmentName,
        semester: semester ? Number(semester) : null,
        totalDivisions: Number(totalDivisions),
        totalDays: Number(totalDays),
        totalSlotsPerDay: slots.slotLabels.length,
        dayStartTime,
        dayEndTime,
        lectureDuration: Number(lectureDuration),
        labDuration: Number(labDuration),
        breakDurations: breaks,
        breakSlots: slots.breakSlots,
        slotLabels: slots.slotLabels
      };

      const res = await axios.post('http://localhost:1000/timetable/generate',payload,{
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );

      setTimetable(res.data?.timetable || null);
      setDynamicSlots(slots.slotLabels);
      setGeneratedBreaks(slots.breakSlots);
      fetchHistoryLedger();
      toast.success("Timetable generated!");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Generation failed");
    } finally {
      setLoading(false);
    }
  };

  // ---------------- PRINT ----------------
  const handlePrint = useReactToPrint({
  contentRef: printRef,
  documentTitle: `Timetable_${departmentName}_${semester}`,
});

const schoolClasses = Array.from({ length: 12 }, (_, i) => i + 1);
const collegeSemesters = Array.from({ length: 8 }, (_, i) => i + 1);

// displaySlots: tagged array so the table render can distinguish break rows reliably
// lectureIndex = actual index into day.slots (which has breaks embedded by solver)
const displaySlots = React.useMemo(() => {
  const sorted = [...generatedBreaks].sort((a, b) => a.slotIndex - b.slotIndex);
  const result: { label: string; isBreak: boolean; lectureIndex: number }[] = [];
  let combinedIdx = 0;

  for (let i = 0; i < dynamicSlots.length; i++) {
    // Insert any breaks whose slotIndex == i (i.e. after i lecture slots)
    sorted.forEach(b => {
      if (b.slotIndex === i) {
        result.push({ label: b.label, isBreak: true, lectureIndex: combinedIdx });
        combinedIdx++;
      }
    });
    result.push({ label: dynamicSlots[i], isBreak: false, lectureIndex: combinedIdx });
    combinedIdx++;
  }
  // trailing breaks (slotIndex == dynamicSlots.length)
  sorted.forEach(b => {
    if (b.slotIndex === dynamicSlots.length) {
      result.push({ label: b.label, isBreak: true, lectureIndex: combinedIdx });
      combinedIdx++;
    }
  });
  return result;
}, [dynamicSlots, generatedBreaks]);
  return (
  <div className="p-6 min-h-screen bg-slate-50 text-slate-800 font-sans">
    <ToastContainer position="top-right" autoClose={2000} />

    <div className="max-w-7xl mx-auto space-y-6">

      {/* Top Header Row */}
      <header className="bg-gradient-to-r from-indigo-600 to-indigo-500 rounded-[2.5rem] p-8 shadow-2xl shadow-indigo-100 border border-white/10 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -mr-24 -mt-24 group-hover:scale-110 transition-transform duration-700" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">

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

          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            <button onClick={handlePrint} disabled={!timetable} className={`bg-white/15 backdrop-blur-xl border border-white/25 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-white/25 transition-all disabled:opacity-40 flex items-center justify-center gap-3 ${!timetable ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
              <Printer className="w-5 h-5" />
              Print
            </button>

            <button onClick={triggerGenerationPipeline} disabled={loading} className="bg-white text-indigo-600 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl hover:scale-105 hover:cursor-pointer transition-all disabled:opacity-50 flex items-center justify-center gap-3">
              <Sparkles className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
              {loading ? "Generating..." : "Generate Timetable"}
            </button>
          </div>
        </div>
      </header>

      {/* Configuration */}
      <div className="flex flex-col md:flex-row gap-6 items-stretch">

        {/* Step 1 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4 flex-1">
          <div className="flex items-center gap-2 font-bold text-slate-900 border-b pb-2">
            <GraduationCap className="w-4 h-4 text-indigo-600" />
            <h2>1. Select School or College</h2>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-500">Department / Wing</label>
              <select value={departmentName} onChange={(e) => setDepartmentName(e.target.value)} className="w-full bg-slate-50 border rounded-xl p-2.5 text-sm">
                {departments.map((d) => (
                  <option key={d._id} value={d.departmentName}>
                    {d.departmentName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500">Target Mode</label>
              <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl">
                <button onClick={() => { setTargetMode("School"); setSemester(""); }} className={`py-1.5 text-xs font-bold rounded-lg ${targetMode === "School" ? "bg-white text-indigo-600" : "text-slate-500"}`}>
                  School
                </button>

                <button onClick={() => { setTargetMode("College"); setSemester(""); }} className={`py-1.5 text-xs font-bold rounded-lg ${targetMode === "College" ? "bg-white text-indigo-600" : "text-slate-500"}`}>
                  College
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500">
                {targetMode === "School" ? "Class / Grade" : "Semester"}
              </label>

              <select value={semester} onChange={(e) => setSemester(e.target.value)} className="w-full bg-slate-50 border rounded-xl p-2.5 text-sm">
                <option value="">Choose...</option>

                {(targetMode === "School" ? schoolClasses : collegeSemesters).map((num) => (
                  <option key={num} value={num}>
                    {targetMode === "School" ? `Class ${num}` : `Semester ${num}`}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Step 2 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4 flex-[2]">
          <div className="flex items-center gap-2 font-bold text-slate-900 border-b pb-2">
            <Grid3X3 className="w-4 h-4 text-indigo-600" />
            <h2>2. Operational Settings</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              Total Divisions
            </label>
            <input
              type="number"
              value={totalDivisions}
              onChange={(e) => setTotalDivisions(e.target.value)}
              className="p-2.5 bg-slate-50 border rounded-xl text-sm w-full"
              placeholder="e.g. 2"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              Working Days per Week
            </label>
            <select
              value={totalDays}
              onChange={(e) => setTotalDays(e.target.value)}
              className="p-2.5 bg-slate-50 border rounded-xl text-sm w-full"
            >
              {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                <option key={d} value={d}>
                  {d} Days
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              Day Start Time
            </label>
            <input
              type="time"
              value={dayStartTime}
              onChange={(e) => setDayStartTime(e.target.value)}
              className="p-2.5 bg-slate-50 border rounded-xl text-sm w-full"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              Day End Time
            </label>
            <input
              type="time"
              value={dayEndTime}
              onChange={(e) => setDayEndTime(e.target.value)}
              className="p-2.5 bg-slate-50 border rounded-xl text-sm w-full"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              Lecture Duration (minutes)
            </label>
            <input
              type="number"
              value={lectureDuration}
              onChange={(e) => setLectureDuration(e.target.value)}
              className="p-2.5 bg-slate-50 border rounded-xl text-sm w-full"
              placeholder="e.g. 60"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              Lab Duration (minutes)
            </label>
            <input
              type="number"
              value={labDuration}
              onChange={(e) => setLabDuration(e.target.value)}
              className="p-2.5 bg-slate-50 border rounded-xl text-sm w-full"
              placeholder="e.g. 120"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              Number of Breaks
            </label>
            <input
              type="number"
              value={breakCount}
              onChange={(e) => setBreakCount(e.target.value)}
              className="p-2.5 bg-slate-50 border rounded-xl text-sm w-full"
              placeholder="e.g. 1"
              min="0"
              max="3"
            />
          </div>

          {breakDurations.map((d, i) => (
            <div key={i}>
              <label className="block text-xs font-semibold text-slate-500 mb-1">
                Break {i + 1} Duration (minutes)
              </label>
              <input
                type="number"
                value={d}
                onChange={(e) => {
                  const next = [...breakDurations];
                  next[i] = e.target.value;
                  setBreakDurations(next);
                }}
                className="p-2.5 bg-slate-50 border rounded-xl text-sm w-full"
                placeholder="e.g. 15"
              />
            </div>
          ))}
        </div>
        </div>
      </div>

      {/* TIMETABLE */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <div ref={printRef} className="xl:col-span-4 w-full min-w-0 space-y-8">

          {loading ? (
            <div className="bg-white rounded-3xl p-20 text-center text-slate-400 font-semibold border border-slate-100 shadow-sm animate-pulse">
              Generating timetable...
            </div>
          ) : timetable?.divisions ? (
            timetable.divisions.map((divData, divIdx) => (
              <div key={divData.divisionName} className="rounded-3xl overflow-hidden shadow-lg border border-slate-100">

                {/* Division Header */}
                <div className={`px-6 py-4 flex items-center justify-between bg-gradient-to-r ${
                  divIdx % 3 === 0 ? "from-indigo-600 to-violet-600" :
                  divIdx % 3 === 1 ? "from-emerald-500 to-teal-600" :
                  "from-orange-500 to-pink-500"
                }`}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-white font-black text-sm">
                      {divData.divisionName?.replace(/\D/g, '') || divIdx + 1}
                    </div>
                    <span className="font-black text-white text-lg tracking-tight">{divData.divisionName}</span>
                  </div>
                  <span className="text-white/70 text-xs font-semibold uppercase tracking-widest">{divData.schedule?.length} Days</span>
                </div>

                <div className="overflow-x-auto bg-white">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-slate-50">
                        <th className="p-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest w-32 border-b border-slate-100">
                          Time
                        </th>
                        {divData.schedule.map((d) => (
                          <th key={d.day} className="p-4 text-center text-xs font-black text-slate-600 uppercase tracking-widest border-b border-slate-100">
                            {d.day.slice(0, 3)}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody>
                      {displaySlots.map((slot, slotIdx) => (
                        <tr key={slotIdx} className={`${slotIdx % 2 === 0 ? "bg-white" : "bg-slate-50/40"} hover:bg-indigo-50/30 transition-colors`}>

                          {/* Time column */}
                          <td className="px-4 py-3 border-b border-slate-100 border-r border-r-slate-100">
                            <div className="flex flex-col gap-0.5">
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                {slot.isBreak ? "Break" : `Slot ${slot.lectureIndex + 1}`}
                              </span>
                              <span className="text-xs font-bold text-slate-600 whitespace-nowrap">{slot.label}</span>
                            </div>
                          </td>

                          {divData.schedule.map((day, dayIdx) => {
                            if (slot.isBreak) {
                              return (
                                <td key={dayIdx} className="px-2 py-2 border-b border-slate-100">
                                  <div className="flex items-center justify-center gap-2 py-3 px-3 rounded-2xl bg-amber-50 border border-amber-200">
                                    <span className="text-lg">☕</span>
                                    <div>
                                      <div className="text-xs font-black text-amber-700">Break</div>
                                      <div className="text-[10px] text-amber-500">{slot.label}</div>
                                    </div>
                                  </div>
                                </td>
                              );
                            }

                            const cell = day.slots?.[slot.lectureIndex];

                            if (!cell || cell.free || cell.subjectName === "Free") {
                              return (
                                <td key={dayIdx} className="px-2 py-2 border-b border-slate-100">
                                  <div className="flex items-center justify-center h-full min-h-[72px] rounded-2xl border border-dashed border-slate-200">
                                    <span className="text-xs text-slate-300 font-semibold">Free</span>
                                  </div>
                                </td>
                              );
                            }

                            const isLab = cell.subjectType === "Lab";
                            const colorClass = isLab
                              ? "bg-emerald-50 border-emerald-200 hover:bg-emerald-100"
                              : "bg-indigo-50 border-indigo-200 hover:bg-indigo-100";
                            const badgeClass = isLab
                              ? "bg-emerald-500 text-white"
                              : "bg-indigo-500 text-white";

                            return (
                              <td key={dayIdx} className="px-2 py-2 border-b border-slate-100">
                                <div className={`p-3 rounded-2xl border min-h-[72px] flex flex-col gap-1 transition-colors ${colorClass}`}>
                                  <div className="flex items-start justify-between gap-1">
                                    <span className="font-black text-xs text-slate-800 leading-tight">{cell.subjectName}</span>
                                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-lg shrink-0 ${badgeClass}`}>
                                      {isLab ? "LAB" : "LEC"}
                                    </span>
                                  </div>
                                  <span className="text-[10px] font-bold text-slate-400">{cell.subjectCode}</span>
                                  <div className="flex items-center gap-1 mt-auto">
                                    <span className="text-[10px] text-slate-500 truncate">👤 {cell.teacherName}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <span className="text-[10px] text-slate-500 truncate">🚪 {cell.roomNumber}</span>
                                  </div>
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-3xl p-16 text-center border border-slate-100 shadow-sm">
              <div className="text-5xl mb-4">📅</div>
              <div className="text-slate-500 font-semibold">No timetable generated yet</div>
              <div className="text-slate-400 text-sm mt-1">Configure settings and click Generate</div>
            </div>
          )}

        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `.custom-scrollbar::-webkit-scrollbar{width:4px}.custom-scrollbar::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:4px}`
      }} />
    </div>
  </div>
);
}

export default TimetableDashboard;
