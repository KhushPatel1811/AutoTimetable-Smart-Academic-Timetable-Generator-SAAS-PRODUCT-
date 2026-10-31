import {
    Calendar,
    Printer,
    ArrowLeft,
    User,
    Building2,
    Mail,
} from "lucide-react";

import Sidebar from "../../../Components/Dashboard/Sidebar";
import ProfileNavbar from "../../DashboardItems/Profile/ProfileNavbar";

import {
    useEffect,
    useState,
    useCallback,
    useRef,
} from "react";

import { useNavigate, useParams, useSearchParams } from "react-router";

import axios from "axios";

import {
    toast,
    ToastContainer,
} from "react-toastify";

import API from "../../../config/api";

// ============================================================
// TYPES
// ============================================================

interface TeacherData {
    teacherId: string;
    teacherName: string;
    teacherEmail: string;

    teacherDepartments?: string[];
    teacherDepartment?: string;
}

interface TeacherAssignment {
    subject: string;
    subjectCode: string;
    subjectType: string;

    division: string;
    department: string;
    room: string;

    teacherName: string;
    teacherId: string;
}

interface TeacherTimetableSlot {
    slotIndex: number;

    timeSlot: string;

    isBreak: boolean;

    breakLabel?: string;

    assignments: TeacherAssignment[];
}

interface TeacherDay {
    day: string;
    slots: TeacherTimetableSlot[];
}

// ============================================================
// COMPONENT
// ============================================================

function TeacherTimetablePreview() {
    const { teacherId } =
        useParams<{ teacherId: string }>();

    const navigate = useNavigate();

    const [searchParams] = useSearchParams();

    const printRef =
        useRef<HTMLDivElement>(null);

    const [teacher, setTeacher] =
        useState<TeacherData | null>(null);

    const [days, setDays] =
        useState<TeacherDay[]>([]);

    const [loading, setLoading] =
        useState(true);

    const [isSidebarOpen, setIsSidebarOpen] =
        useState(false);

    // ============================================================
    // DAYS
    //
    // Derived from the API response so only the days that were
    // actually scheduled are shown (e.g. 5-day week won't show
    // Saturday).
    // ============================================================

    const DAY_ORDER: Record<string, number> = {
        Monday: 1,
        Tuesday: 2,
        Wednesday: 3,
        Thursday: 4,
        Friday: 5,
        Saturday: 6,
        Sunday: 7,
    };

    const DAYS = days
        .map((d) => d.day)
        .sort((a, b) => (DAY_ORDER[a] ?? 99) - (DAY_ORDER[b] ?? 99));

    // ============================================================
    // SIDEBAR
    // ============================================================

    const handleMenuToggle = () => {
        setIsSidebarOpen(
            (prev) => !prev
        );
    };

    const handleSidebarClose = () => {
        setIsSidebarOpen(false);
    };

    // ============================================================
    // FETCH
    // ============================================================

    const fetchTeacherTimetable =
        useCallback(async () => {
            if (!teacherId) {
                toast.error(
                    "Teacher ID is missing"
                );
                return;
            }

            setLoading(true);

            try {
                const response =
                    await axios.get(
                        `${API}/saved-timetables/teacher/${teacherId}`,
                        {
                            headers: {
                                Authorization:
                                    `Bearer ${localStorage.getItem(
                                        "token"
                                    )}`,
                            },
                        }
                    );

                console.log(
                    "Teacher timetable response:",
                    response.data
                );

                const teacherData =
                    response.data?.teacher;

                const timetableDays =
                    response.data?.days || [];

                if (!teacherData) {
                    toast.error(
                        "Teacher not found"
                    );
                    return;
                }

                setTeacher({
                    teacherId:
                        teacherData.teacherId,

                    teacherName:
                        teacherData.teacherName,

                    teacherEmail:
                        teacherData.teacherEmail,

                    teacherDepartments:
                        teacherData.teacherDepartments ||
                        [],

                    teacherDepartment:
                        teacherData.teacherDepartment,
                });

                setDays(timetableDays);
            } catch (err: unknown) {
                console.error(
                    "Teacher timetable error:",
                    err
                );

                const error =
                    err as {
                        response?: {
                            data?: {
                                message?: string;
                            };
                        };
                    };

                toast.error(
                    error.response?.data
                        ?.message ||
                        "Failed to load teacher timetable"
                );
            } finally {
                setLoading(false);
            }
        }, [teacherId]);

    // ============================================================
    // LOAD
    // ============================================================

    useEffect(() => {
        fetchTeacherTimetable();
    }, [fetchTeacherTimetable]);

    // ============================================================
    // AUTO-PRINT
    //
    // When opened with ?print=1 (from the PDF button on the list
    // page), automatically trigger the browser print dialog once
    // data has finished loading.
    // ============================================================

    useEffect(() => {
        if (searchParams.get("print") === "1" && !loading && days.length > 0) {
            // Small delay so the DOM finishes rendering
            const timer = setTimeout(() => {
                window.print();
            }, 800);
            return () => clearTimeout(timer);
        }
    }, [searchParams, loading, days]);

    // ============================================================
    // DEPARTMENTS
    // ============================================================

    const departments =
        teacher?.teacherDepartments
            ?.length
            ? teacher.teacherDepartments.join(
                  ", "
              )
            : teacher?.teacherDepartment ||
              "—";

    // ============================================================
    // CREATE COMPLETE ROWS
    //
    // We take the slot structure from the returned days.
    //
    // This means breaks remain rows.
    // ============================================================

    const timetableRows =
        days.length > 0
            ? days[0].slots
            : [];

    // ============================================================
    // TOTAL CLASSES
    // ============================================================

    const totalClasses =
        days.reduce(
            (total, day) =>
                total +
                day.slots.reduce(
                    (count, slot) =>
                        count +
                        slot.assignments.length,
                    0
                ),
            0
        );

    // ============================================================
    // GET DAY DATA
    // ============================================================

    const getDayData = (
        dayName: string
    ) => {
        return (
            days.find(
                (day) =>
                    day.day === dayName
            ) || null
        );
    };

    // ============================================================
    // PRINT
    // ============================================================

    const handlePrint = () => {
        window.print();
    };

    // ============================================================
    // LOADING
    // ============================================================

    if (loading) {
        return (
            <div className="flex h-screen w-screen overflow-hidden bg-slate-50">

                <Sidebar
                    isOpen={
                        isSidebarOpen
                    }
                    onClose={
                        handleSidebarClose
                    }
                />

                <div className="flex-1 overflow-y-auto">

                    <ProfileNavbar
                        content="Teacher Timetable"
                        onMenuToggle={
                            handleMenuToggle
                        }
                    />

                    <div className="flex items-center justify-center h-[70vh]">

                        <div className="text-center">

                            <Calendar className="w-14 h-14 mx-auto text-indigo-300 animate-pulse" />

                            <p className="mt-4 text-sm font-black text-slate-500 uppercase tracking-widest">
                                Loading timetable...
                            </p>

                        </div>

                    </div>

                </div>

                <ToastContainer />
            </div>
        );
    }

    // ============================================================
    // PAGE
    // ============================================================

    return (
        <>
            {/* ========================================================
                PRINT CSS
            ======================================================== */}

            <style>
                {`
                    @media print {

                        @page {
                            size: landscape;
                            margin: 8mm;
                        }

                        body * {
                            visibility: hidden !important;
                        }

                        .teacher-timetable-print-area,
                        .teacher-timetable-print-area * {
                            visibility: visible !important;
                        }

                        .teacher-timetable-print-area {
                            position: absolute !important;
                            left: 0 !important;
                            top: 0 !important;
                            width: 100% !important;
                            max-width: none !important;
                            margin: 0 !important;
                            padding: 0 !important;
                            background: white !important;
                        }

                        .teacher-timetable-print-area .overflow-x-auto {
                            overflow: visible !important;
                        }

                        .teacher-timetable-print-area table {
                            width: 100% !important;
                            min-width: 0 !important;
                            table-layout: fixed !important;
                        }

                        .teacher-timetable-print-area tr {
                            break-inside: avoid !important;
                            page-break-inside: avoid !important;
                        }

                        .teacher-timetable-print-area .timetable-card {
                            width: 100% !important;
                            box-shadow: none !important;
                            border: 1px solid #e2e8f0 !important;
                        }

                        .teacher-timetable-print-area,
                        .teacher-timetable-print-area * {
                            -webkit-print-color-adjust: exact !important;
                            print-color-adjust: exact !important;
                        }

                        .teacher-timetable-print-area th {
                            padding: 10px !important;
                        }

                        .teacher-timetable-print-area td {
                            padding: 6px !important;
                        }

                        a[href]::after {
                            content: none !important;
                        }
                    }
                `}
            </style>

            <div className="flex h-screen w-screen overflow-hidden bg-slate-50">

                {/* ====================================================
                    SIDEBAR
                ==================================================== */}

                <Sidebar
                    isOpen={
                        isSidebarOpen
                    }
                    onClose={
                        handleSidebarClose
                    }
                />

                <div className="flex-1 h-full overflow-y-auto">

                    {/* ====================================================
                        NAVBAR
                    ==================================================== */}

                    <div className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">

                        <ProfileNavbar
                            content="Teacher Timetable"
                            onMenuToggle={
                                handleMenuToggle
                            }
                        />

                        <ToastContainer
                            position="top-right"
                            autoClose={2000}
                        />

                    </div>

                    {/* ====================================================
                        PAGE CONTENT
                    ==================================================== */}

                    <div className="pt-6 px-4 sm:px-6 lg:px-8 pb-10 max-w-[1600px] mx-auto space-y-8">

                        {/* =================================================
                            HEADER
                        ================================================= */}

                        <div className="bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 rounded-3xl p-6 lg:p-8 shadow-xl shadow-indigo-100">

                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

                                <div className="flex items-center gap-5">

                                    <button
                                        onClick={() =>
                                            navigate(
                                                -1
                                            )
                                        }
                                        className="w-11 h-11 rounded-2xl bg-white/15 hover:bg-white/25 hover:cursor-pointer border border-white/20 flex items-center justify-center text-white transition"
                                    >
                                        <ArrowLeft className="w-5 h-5" />
                                    </button>

                                    <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center border border-white/20">
                                        <Calendar className="w-7 h-7 text-white" />
                                    </div>

                                    <div>

                                        <h1 className="text-2xl lg:text-3xl font-black text-white">
                                            Teacher Timetable
                                        </h1>

                                        <p className="text-indigo-100 text-sm font-semibold mt-1">
                                            {
                                                teacher?.teacherName
                                            }{" "}
                                            •{" "}
                                            {
                                                teacher?.teacherId
                                            }
                                        </p>

                                    </div>

                                </div>

                                <button
                                    onClick={
                                        handlePrint
                                    }
                                    disabled={
                                        days.length ===
                                        0
                                    }
                                    className="bg-white px-6 py-3 rounded-2xl font-black text-indigo-600 shadow-lg hover:scale-105 hover:cursor-pointer transition flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    <Printer className="w-4 h-4" />

                                    Print / Save PDF
                                </button>

                            </div>

                        </div>

                        {/* =================================================
                            TEACHER INFORMATION
                        ================================================= */}

                        {teacher && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                                {/* TEACHER */}

                                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">

                                    <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">

                                        <User className="w-5 h-5" />

                                    </div>

                                    <div>

                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                            Teacher
                                        </p>

                                        <p className="font-black text-slate-800">
                                            {
                                                teacher.teacherName
                                            }
                                        </p>

                                    </div>

                                </div>

                                {/* EMAIL */}

                                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">

                                    <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">

                                        <Mail className="w-5 h-5" />

                                    </div>

                                    <div className="min-w-0">

                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                            Email
                                        </p>

                                        <p className="font-bold text-slate-700 truncate">
                                            {
                                                teacher.teacherEmail
                                            }
                                        </p>

                                    </div>

                                </div>

                                {/* DEPARTMENT */}

                                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">

                                    <div className="w-11 h-11 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">

                                        <Building2 className="w-5 h-5" />

                                    </div>

                                    <div>

                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                            Department
                                        </p>

                                        <p className="font-black text-slate-700">
                                            {
                                                departments
                                            }
                                        </p>

                                    </div>

                                </div>

                            </div>
                        )}

                        {/* =================================================
                            TIMETABLE
                        ================================================= */}

                        <div
                            ref={
                                printRef
                            }
                            className="teacher-timetable-print-area"
                        >

                            {days.length ===
                            0 ? (

                                <div className="bg-white rounded-3xl p-20 text-center border border-slate-100 shadow-sm">

                                    <div className="text-5xl mb-4">
                                        📅
                                    </div>

                                    <p className="text-slate-500 font-bold">
                                        No timetable available for this teacher.
                                    </p>

                                </div>

                            ) : (

                                <div className="timetable-card bg-white rounded-3xl overflow-hidden shadow-xl border border-slate-100">

                                    {/* =================================================
                                        TIMETABLE HEADER
                                    ================================================= */}

                                    <div className="px-6 py-5 bg-gradient-to-r from-slate-900 to-slate-800">

                                        <div className="flex items-center justify-between">

                                            <div>

                                                <h2 className="text-lg font-black text-white">
                                                    Weekly Schedule
                                                </h2>

                                                <p className="text-slate-400 text-xs font-semibold mt-1">
                                                    {DAYS.length > 0
                                                        ? `${DAYS[0]} – ${DAYS[DAYS.length - 1]}`
                                                        : "Weekly Schedule"}
                                                </p>

                                            </div>

                                            <span className="bg-white/10 border border-white/10 text-white px-4 py-2 rounded-xl text-xs font-black">
                                                {
                                                    totalClasses
                                                }{" "}
                                                Classes
                                            </span>

                                        </div>

                                    </div>

                                    {/* =================================================
                                        TABLE
                                    ================================================= */}

                                    <div className="overflow-x-auto">

                                        <table className="w-full min-w-[1200px] text-sm border-collapse">

                                            <thead>

                                                <tr className="bg-slate-50">

                                                    <th className="p-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest w-36 border-b border-r border-slate-100">
                                                        Time
                                                    </th>

                                                    {DAYS.map(
                                                        (
                                                            day
                                                        ) => (
                                                            <th
                                                                key={
                                                                    day
                                                                }
                                                                className="p-4 text-center text-xs font-black text-slate-600 uppercase tracking-widest border-b border-slate-100"
                                                            >
                                                                {day.slice(
                                                                    0,
                                                                    3
                                                                )}
                                                            </th>
                                                        )
                                                    )}

                                                </tr>

                                            </thead>

                                            <tbody>

                                                {timetableRows.map(
                                                    (
                                                        row,
                                                        rowIndex
                                                    ) => (

                                                        <tr
                                                            key={
                                                                row.slotIndex
                                                            }
                                                            className={
                                                                rowIndex %
                                                                    2 ===
                                                                0
                                                                    ? "bg-white"
                                                                    : "bg-slate-50/30"
                                                            }
                                                        >

                                                            {/* =================================================
                                                                TIME
                                                            ================================================= */}

                                                            <td className="p-3 border-b border-r border-slate-100 align-middle">

                                                                <div className="flex flex-col gap-1 text-center">

                                                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                                                        {row.isBreak
                                                                            ? "Break"
                                                                            : `Slot ${
                                                                                  row.slotIndex +
                                                                                  1
                                                                              }`}
                                                                    </span>

                                                                    <span className="text-xs font-bold text-slate-600 whitespace-nowrap">
                                                                        {
                                                                            row.timeSlot
                                                                        }
                                                                    </span>

                                                                </div>

                                                            </td>

                                                            {/* =================================================
                                                                EACH DAY
                                                            ================================================= */}

                                                            {DAYS.map(
                                                                (
                                                                    day
                                                                ) => {

                                                                    const dayData =
                                                                        getDayData(
                                                                            day
                                                                        );

                                                                    const cell =
                                                                        dayData?.slots.find(
                                                                            (
                                                                                slot
                                                                            ) =>
                                                                                slot.slotIndex ===
                                                                                row.slotIndex
                                                                        );

                                                                    // ------------------------------------------
                                                                    // NO DATA
                                                                    // ------------------------------------------

                                                                    if (
                                                                        !cell
                                                                    ) {
                                                                        return (
                                                                            <td
                                                                                key={
                                                                                    day
                                                                                }
                                                                                className="p-2 border-b border-slate-100"
                                                                            >

                                                                                <div className="timetable-cell flex items-center justify-center min-h-[100px] rounded-2xl border border-dashed border-slate-200">

                                                                                    <span className="text-xs text-slate-300 font-semibold">
                                                                                        Free
                                                                                    </span>

                                                                                </div>

                                                                            </td>
                                                                        );
                                                                    }

                                                                    // ------------------------------------------
                                                                    // BREAK
                                                                    //
                                                                    // Only show Break when the actual saved
                                                                    // timetable says this row is a break.
                                                                    // ------------------------------------------

                                                                    if (
                                                                        cell.isBreak
                                                                    ) {
                                                                        return (
                                                                            <td
                                                                                key={
                                                                                    day
                                                                                }
                                                                                className="p-2 border-b border-slate-100"
                                                                            >

                                                                                <div className="timetable-cell flex items-center justify-center gap-2 py-4 px-3 rounded-2xl bg-amber-50 border border-amber-200">

                                                                                    <span className="text-xl">
                                                                                        ☕
                                                                                    </span>

                                                                                    <div>

                                                                                        <div className="text-xs font-black text-amber-700">
                                                                                            Break
                                                                                        </div>

                                                                                        <div className="text-[10px] text-amber-500 font-semibold">
                                                                                            {
                                                                                                cell.breakLabel
                                                                                            }
                                                                                        </div>

                                                                                    </div>

                                                                                </div>

                                                                            </td>
                                                                        );
                                                                    }

                                                                    // ------------------------------------------
                                                                    // TEACHER HAS NO CLASS
                                                                    // ------------------------------------------

                                                                    if (
                                                                        cell.assignments.length ===
                                                                        0
                                                                    ) {
                                                                        return (
                                                                            <td
                                                                                key={
                                                                                    day
                                                                                }
                                                                                className="p-2 border-b border-slate-100"
                                                                            >

                                                                                <div className="timetable-cell flex items-center justify-center min-h-[100px] rounded-2xl border border-dashed border-slate-200">

                                                                                    <span className="text-xs text-slate-300 font-semibold">
                                                                                        Free
                                                                                    </span>

                                                                                </div>

                                                                            </td>
                                                                        );
                                                                    }

                                                                    // ------------------------------------------
                                                                    // TEACHER CLASS / MULTIPLE DIVISIONS
                                                                    // ------------------------------------------

                                                                    return (
                                                                        <td
                                                                            key={
                                                                                day
                                                                            }
                                                                            className="p-2 border-b border-slate-100 align-top"
                                                                        >

                                                                            <div className="space-y-2">

                                                                                {cell.assignments.map(
                                                                                    (
                                                                                        assignment,
                                                                                        assignmentIndex
                                                                                    ) => {

                                                                                        const isLab =
                                                                                            assignment.subjectType?.toLowerCase() ===
                                                                                            "lab";

                                                                                        return (
                                                                                            <div
                                                                                                key={`${assignment.division}-${assignment.subjectCode}-${assignmentIndex}`}
                                                                                                className={`
                                                                                                    timetable-cell
                                                                                                    p-3
                                                                                                    rounded-2xl
                                                                                                    border
                                                                                                    min-h-[100px]
                                                                                                    flex
                                                                                                    flex-col
                                                                                                    gap-1.5
                                                                                                    ${
                                                                                                        isLab
                                                                                                            ? "bg-emerald-50 border-emerald-200"
                                                                                                            : "bg-indigo-50 border-indigo-200"
                                                                                                    }
                                                                                                `}
                                                                                            >

                                                                                                {/* SUBJECT */}

                                                                                                <div className="flex items-start justify-between gap-2">

                                                                                                    <span className="font-black text-xs text-slate-800 leading-tight">

                                                                                                        {
                                                                                                            assignment.subject
                                                                                                        }

                                                                                                    </span>

                                                                                                    <span
                                                                                                        className={`
                                                                                                            text-[9px]
                                                                                                            font-black
                                                                                                            px-1.5
                                                                                                            py-0.5
                                                                                                            rounded-lg
                                                                                                            shrink-0
                                                                                                            ${
                                                                                                                isLab
                                                                                                                    ? "bg-emerald-500 text-white"
                                                                                                                    : "bg-indigo-500 text-white"
                                                                                                            }
                                                                                                        `}
                                                                                                    >
                                                                                                        {isLab
                                                                                                            ? "LAB"
                                                                                                            : "LEC"}
                                                                                                    </span>

                                                                                                </div>

                                                                                                {/* SUBJECT CODE */}

                                                                                                <span className="text-[10px] font-bold text-slate-400">

                                                                                                    {
                                                                                                        assignment.subjectCode ||
                                                                                                        "—"
                                                                                                    }

                                                                                                </span>

                                                                                                {/* DIVISION */}

                                                                                                <div className="mt-auto space-y-1">

                                                                                                    <div className="text-[10px] text-slate-500 font-semibold truncate">

                                                                                                        👥{" "}

                                                                                                        {
                                                                                                            assignment.division ||
                                                                                                            "—"
                                                                                                        }

                                                                                                    </div>

                                                                                                    {/* DEPARTMENT */}

                                                                                                    <div className="text-[10px] text-slate-500 font-semibold truncate">

                                                                                                        🏢{" "}

                                                                                                        {
                                                                                                            assignment.department ||
                                                                                                            "—"
                                                                                                        }

                                                                                                    </div>

                                                                                                    {/* ROOM */}

                                                                                                    <div className="text-[10px] text-slate-500 font-semibold truncate">

                                                                                                        🚪{" "}

                                                                                                        {
                                                                                                            assignment.room ||
                                                                                                            "—"
                                                                                                        }

                                                                                                    </div>

                                                                                                </div>

                                                                                            </div>
                                                                                        );
                                                                                    }
                                                                                )}

                                                                            </div>

                                                                        </td>
                                                                    );
                                                                }
                                                            )}

                                                        </tr>
                                                    )
                                                )}

                                            </tbody>

                                        </table>

                                    </div>

                                </div>
                            )}

                        </div>

                    </div>

                </div>

            </div>
        </>
    );
}

export default TeacherTimetablePreview;