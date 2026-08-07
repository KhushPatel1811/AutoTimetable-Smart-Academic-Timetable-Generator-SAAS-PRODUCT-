import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { ChevronLeft, Printer, BookMarked } from "lucide-react";
import Sidebar from "../../../Components/Dashboard/Sidebar";
import ProfileNavbar from "../Profile/ProfileNavbar";
import API from "../../../config/api";

interface ScheduleSlot {
    subjectName: string;
    subjectCode: string;
    subjectType: string;
    teacherName: string;
    roomNumber: string;
    free: boolean;
}

interface DaySchedule {
    day: string;
    slots: ScheduleSlot[];
}

interface SavedTimetable {
    _id: string;
    divisionName: string;
    departmentName: string;
    semester?: number;
    instituteName?: string;
    timeSlots: string[];
    schedule: DaySchedule[];
    updatedAt: string;
}

function TimetablePreview() {
    const { id } = useParams();
    const navigate = useNavigate();
    const printRef = useRef<HTMLDivElement>(null);
    const [timetable, setTimetable] = useState<SavedTimetable | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const handleMenuToggle = () => setIsSidebarOpen(prev => !prev);
    const handleSidebarClose = () => setIsSidebarOpen(false);

    useEffect(() => {
        async function fetchTimetable() {
            setLoading(true);
            try {
                const response = await axios.get(`${API}/saved-timetables/${id}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                });
                setTimetable(response.data.timetable);
            } catch (err: unknown) {
                const error = err as { response?: { data?: { message?: string } } };
                toast.error(error.response?.data?.message || "Failed to load timetable");
            } finally {
                setLoading(false);
            }
        }
        if (id) fetchTimetable();
    }, [id]);

    /* ─────────────────────────────────────────────────────────────────────────
       BUILD STANDALONE PRINT HTML
       Mirrors the on-screen card/table exactly using inline styles — no Tailwind
    ───────────────────────────────────────────────────────────────────────── */
    const handlePrint = () => {
        if (!timetable) return;

        const user       = JSON.parse(localStorage.getItem("user") || "{}");
        const institute  = timetable.instituteName || user.instituteName || "Institute";
        const maxSlots   = Math.max(0, ...timetable.schedule.map(d => d.slots.length));
        const days       = timetable.schedule;

        const totalSlots = maxSlots;

const rowHeight =
    totalSlots <= 6 ? 64 :
    totalSlots === 7 ? 56 :
    totalSlots === 8 ? 50 :
    totalSlots === 9 ? 44 :
    38;

const cellPadding =
    totalSlots <= 6 ? 8 :
    totalSlots === 7 ? 7 :
    totalSlots === 8 ? 6 :
    totalSlots === 9 ? 5 :
    4;

const titleFont =
    totalSlots <= 6 ? 10 :
    totalSlots === 7 ? 9 :
    totalSlots === 8 ? 8.5 :
    8;

const textFont =
    totalSlots <= 6 ? 9 :
    totalSlots === 7 ? 8 :
    totalSlots === 8 ? 7.5 :
    7;

const badgeFont =
    totalSlots <= 6 ? 8 :
    totalSlots === 7 ? 7 :
    6;

    const scale =
    totalSlots <= 6 ? 1 :
    totalSlots === 7 ? 0.96 :
    totalSlots === 8 ? 0.92 :
    totalSlots === 9 ? 0.88 :
    0.84;


        /* build <thead> day columns */
        const headCols = days
            .map(d => `<th style="padding:10px 8px;text-align:center;font-size:${titleFont}px;font-weight:900;text-transform:uppercase;letter-spacing:0.12em;color:#475569;border:1px solid #e2e8f0;background:#f8fafc;min-width:120px;">${d.day.slice(0,3)}</th>`)
            .join("");

        /* build table rows */
        let bodyRows = "";
        for (let si = 0; si < maxSlots; si++) {
            const timeLabel = timetable.timeSlots?.[si] || `Slot ${si + 1}`;
            const rowBg     = si % 2 === 0 ? "#ffffff" : "#f8fafc";

            const timeTd = `
                <td style="padding:10px 8px;background:#f8fafc;border:1px solid #e2e8f0;white-space:nowrap;vertical-align:middle;">
                    <div style="font-size:${textFont}px;font-weight:900;text-transform:uppercase;letter-spacing:0.12em;color:#94a3b8;">Slot ${si + 1}</div>
                    <div style="font-size:${titleFont}px;font-weight:700;color:#475569;margin-top:2px;">${timeLabel}</div>
                </td>`;

            const dayCells = days.map(day => {
                const cell = day.slots?.[si];

                if (!cell || cell.free || !cell.subjectName || cell.subjectName === "Free") {
                    return `<td style="padding:6px;border:1px solid #e2e8f0;background:${rowBg};">
                        <div style="min-height:${rowHeight}px;display:flex;align-items:center;justify-content:center;border:1.5px dashed #e2e8f0;border-radius:8px;">
                            <span style="font-size:${titleFont}px;color:#cbd5e1;font-weight:600;">Free</span>
                        </div></td>`;
                }

                if (cell.subjectType === "Break") {
                    return `<td style="padding:6px;border:1px solid #e2e8f0;background:${rowBg};">
                        <div style="min-height:${rowHeight}px;display:flex;align-items:center;justify-content:center;gap:6px;background:#fffbeb;border:1px solid #fcd34d;border-radius:8px;padding:${cellPadding}px;">
                            <span style="font-size:16px;">☕</span>
                            <div>
                                <div style="font-size:${titleFont}px;font-weight:900;color:#92400e;">Break</div>
                            </div>
                        </div></td>`;
                }

                const isLab       = cell.subjectType === "Lab";
                const cellBg      = isLab ? "#ecfdf5"  : "#eef2ff";
                const cellBorder  = isLab ? "#6ee7b7"  : "#a5b4fc";
                const badgeBg     = isLab ? "#059669"  : "#4f46e5";
                const badgeText   = isLab ? "LAB"      : "LEC";

                return `<td style="padding:6px;border:1px solid #e2e8f0;background:${rowBg};vertical-align:top;">
                    <div style="background:${cellBg};border:1px solid ${cellBorder};border-radius:8px;padding:${cellPadding}px;min-height:${rowHeight}px;display:flex;flex-direction:column;gap:3px;">
                        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:4px;">
                            <span style="font-weight:900;font-size:${titleFont}px;color:#1e293b;line-height:1.3;">${cell.subjectName}</span>
                            <span style="background:${badgeBg};color:white;font-size:${badgeFont}px;font-weight:900;padding:2px 5px;border-radius:4px;white-space:nowrap;">${badgeText}</span>
                        </div>
                        <span style="font-size:${textFont}px;color:#64748b;font-weight:700;">${cell.subjectCode || ""}</span>
                        <span style="font-size:${textFont}px;color:#64748b;margin-top:auto;">👤 ${cell.teacherName || "—"}</span>
                        <span style="font-size:${textFont}px;color:#64748b;">🚪 ${cell.roomNumber || "—"}</span>
                    </div></td>`;
            }).join("");

            bodyRows += `<tr style="background:${rowBg};">${timeTd}${dayCells}</tr>`;
        }

        const html = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8" />
    <title>Timetable – ${timetable.divisionName}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, Helvetica, sans-serif; font-size: 11px; color: #1e293b; background: #fff; }
        .page { padding: 16px 20px; }
        /* ── institute header ── */
        .inst-header { text-align: center; margin-bottom: 8px; padding-bottom: 6px; border-bottom: 2px solid #4f46e5; }
        .inst-header h1 { font-size: 15px; font-weight: 900; color: #1e293b; }
        .inst-header p  { font-size: 9px; color: #6366f1; font-weight: 700; margin-top: 3px; }
        /* ── division banner ── */
        .div-banner { display: flex; align-items: center; justify-content: space-between; padding: 7px 12px;
                      background: linear-gradient(90deg, #4f46e5, #7c3aed); border-radius: 10px 10px 0 0; margin-bottom: 0; }
        .div-banner .name { font-weight: 900; font-size: 12px; color: white; display: flex; align-items: center; gap: 8px; }
        .div-badge { background: rgba(255,255,255,0.25); color: white; font-size: 9px; font-weight: 900;
                     padding: 3px 10px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.1em; }
        .div-circle { width: 22px; height: 22px; background: rgba(255,255,255,0.25); border-radius: 6px;
                      display:flex; align-items:center; justify-content:center; font-weight: 900; font-size: 10px; color: white; }
        tr { page-break-inside: avoid;   break-inside: avoid;}
        table { page-break-inside: auto;  }
        thead {  display:table-header-group;  }
        tfoot { display:table-footer-group;  }
        /* ── table wrapper ── */
        .tbl-wrap { border: 1px solid #e2e8f0; border-radius: 0 0 10px 10px; overflow: hidden; }
        table { width: 100%; border-collapse: collapse; }
        /* ── footer ── */
        .footer { margin-top: 8px; text-align: center; font-size: 8px; color: #94a3b8; }
        @page  { size:A4 landscape; margin:6mm; }
        @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
    </style>
</head>
<body>
<div class="page" style="transform:scale(${scale});transform-origin:top left;width:${100 / scale}%;">
    <div class="inst-header">
        <h1>${institute}</h1>
        <p>${timetable.divisionName} &nbsp;•&nbsp; ${timetable.departmentName}${timetable.semester ? ` &nbsp;•&nbsp; Semester ${timetable.semester}` : ""}</p>
    </div>

    <div class="div-banner">
        <div class="name">
            <div class="div-circle">${(timetable.divisionName.replace(/\D/g, '') || "D").slice(0,2)}</div>
            ${timetable.divisionName}
        </div>
        <span class="div-badge">${timetable.schedule.length} Days</span>
    </div>

    <div class="tbl-wrap">
        <table>
            <thead>
                <tr>
                    <th style="padding:10px 8px;text-align:left;font-size:${titleFont}px;font-weight:900;text-transform:uppercase;letter-spacing:0.12em;color:#475569;border:1px solid #e2e8f0;background:#f8fafc;width:110px;">Time</th>
                    ${headCols}
                </tr>
            </thead>
            <tbody>${bodyRows}</tbody>
        </table>
    </div>

    <div class="footer">
        Printed on ${new Date().toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })} &nbsp;•&nbsp; ${institute}
    </div>
</div>
</body>
</html>`;

        const win = window.open("", "_blank");
        if (!win) {
            toast.error("Popup blocked. Please allow popups to print.");
            return;
        }
        win.document.write(html);
        win.document.close();
        win.focus();
        setTimeout(() => win.print(), 600);
    };

    /* ─── Computed ─── */
    const maxSlots = timetable ? Math.max(0, ...timetable.schedule.map(d => d.slots.length)) : 0;

    if (loading) {
        return (
            <div className="flex h-screen w-screen overflow-hidden bg-slate-50">
                <Sidebar isOpen={isSidebarOpen} onClose={handleSidebarClose} />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center space-y-4 opacity-40">
                        <BookMarked className="w-12 h-12 text-slate-200 mx-auto animate-pulse" />
                        <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Loading timetable...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!timetable) {
        return (
            <div className="flex h-screen w-screen overflow-hidden bg-slate-50">
                <Sidebar isOpen={isSidebarOpen} onClose={handleSidebarClose} />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center space-y-4 opacity-40">
                        <BookMarked className="w-12 h-12 text-slate-200 mx-auto" />
                        <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Timetable not found</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen w-screen overflow-hidden bg-slate-50">
            <Sidebar isOpen={isSidebarOpen} onClose={handleSidebarClose} />
            <ToastContainer position="top-right" autoClose={2000} />

            <div className="flex-1 h-full overflow-y-auto animate-page">
                {/* STICKY HEADER */}
                <div className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
                    <div className="flex items-center px-4 sm:px-6 py-4 gap-4">
                        <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400 hover:text-slate-900 cursor-pointer">
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <ProfileNavbar content="Timetable Preview" onMenuToggle={handleMenuToggle} />
                    </div>
                </div>

                <div className="pt-6 px-4 sm:px-6 lg:px-8 pb-8 max-w-7xl mx-auto space-y-6">

                    {/* PAGE HEADER */}
                    <div className="bg-linear-to-r from-indigo-600 to-indigo-500 rounded-3xl p-6 lg:p-10 shadow-2xl shadow-indigo-100 border border-indigo-400/20 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 group-hover:scale-110 transition-transform duration-700" />
                        <div className="relative z-10 flex flex-col lg:flex-row gap-6 lg:items-center lg:justify-between">
                            <div className="flex items-center gap-4 lg:gap-6">
                                <div className="p-4 lg:p-5 bg-white/20 backdrop-blur-xl rounded-3xl shadow-inner border border-white/30">
                                    <BookMarked className="w-7 h-7 lg:w-8 lg:h-8 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight">{timetable.divisionName}</h1>
                                    <p className="text-indigo-100 font-bold text-xs lg:text-sm tracking-wide uppercase">
                                        {timetable.departmentName}{timetable.semester ? ` • Semester ${timetable.semester}` : ""}
                                    </p>
                                    <p className="text-indigo-200 text-[10px] font-bold mt-1">
                                        Last updated: {new Date(timetable.updatedAt).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={handlePrint}
                                className="bg-white px-6 py-3 lg:px-8 lg:py-4 rounded-2xl font-black text-indigo-600 text-sm shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer uppercase tracking-wider flex items-center gap-2 w-full lg:w-auto justify-center"
                            >
                                <Printer className="w-4 h-4" /> Print Timetable
                            </button>
                        </div>
                    </div>

                    {/* ── ON-SCREEN TIMETABLE GRID (unchanged from before) ── */}
                    <div ref={printRef}>
                        <div className="rounded-3xl overflow-hidden shadow-lg border border-slate-100">
                            {/* Division Header */}
                            <div className="px-6 py-4 flex items-center justify-between bg-gradient-to-r from-indigo-600 to-violet-600">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-white font-black text-sm">
                                        {timetable.divisionName?.replace(/\D/g, '') || "D"}
                                    </div>
                                    <span className="font-black text-white text-lg tracking-tight">{timetable.divisionName}</span>
                                </div>
                                <span className="text-white/70 text-xs font-semibold uppercase tracking-widest">{timetable.schedule.length} Days</span>
                            </div>

                            <div className="overflow-x-auto bg-white">
                                <table className="w-full text-sm border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50">
                                            <th className="p-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest w-32 border-b border-slate-100">Time</th>
                                            {timetable.schedule.map(d => (
                                                <th key={d.day} className="p-4 text-center text-xs font-black text-slate-600 uppercase tracking-widest border-b border-slate-100">
                                                    {d.day.slice(0, 3)}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Array.from({ length: maxSlots }).map((_, slotIdx) => (
                                            <tr key={slotIdx} className={`${slotIdx % 2 === 0 ? "bg-white" : "bg-slate-50/40"} hover:bg-indigo-50/30 transition-colors`}>
                                                <td className="px-4 py-3 border-b border-slate-100 border-r border-r-slate-100">
                                                    <div className="flex flex-col gap-0.5">
                                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Slot {slotIdx + 1}</span>
                                                        <span className="text-xs font-bold text-slate-600 whitespace-nowrap">{timetable.timeSlots?.[slotIdx] || "—"}</span>
                                                    </div>
                                                </td>

                                                {timetable.schedule.map(day => {
                                                    const cell = day.slots?.[slotIdx];

                                                    if (!cell || cell.free || cell.subjectName === "Free" || !cell.subjectName) {
                                                        return (
                                                            <td key={day.day} className="px-2 py-2 border-b border-slate-100">
                                                                <div className="flex items-center justify-center h-full min-h-[72px] rounded-2xl border border-dashed border-slate-200">
                                                                    <span className="text-xs text-slate-300 font-semibold">Free</span>
                                                                </div>
                                                            </td>
                                                        );
                                                    }

                                                    if (cell.subjectType === "Break") {
                                                        return (
                                                            <td key={day.day} className="px-2 py-2 border-b border-slate-100">
                                                                <div className="flex items-center justify-center gap-2 py-3 px-3 rounded-2xl bg-amber-50 border border-amber-200">
                                                                    <span className="text-lg">☕</span>
                                                                    <div className="text-xs font-black text-amber-700">Break</div>
                                                                </div>
                                                            </td>
                                                        );
                                                    }

                                                    const isLab = cell.subjectType === "Lab";
                                                    return (
                                                        <td key={day.day} className="px-2 py-2 border-b border-slate-100">
                                                            <div className={`p-3 rounded-2xl border min-h-[72px] flex flex-col gap-1 transition-colors ${isLab ? "bg-emerald-50 border-emerald-200" : "bg-indigo-50 border-indigo-200"}`}>
                                                                <div className="flex items-start justify-between gap-1">
                                                                    <span className="font-black text-xs text-slate-800 leading-tight">{cell.subjectName}</span>
                                                                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-lg shrink-0 ${isLab ? "bg-emerald-500 text-white" : "bg-indigo-500 text-white"}`}>
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
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TimetablePreview;
