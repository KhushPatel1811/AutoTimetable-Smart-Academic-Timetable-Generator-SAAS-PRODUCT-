import { Users } from "lucide-react";
import Sidebar from "../../../Components/Dashboard/Sidebar";
import ProfileNavbar from "../Profile/ProfileNavbar";
import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import API from "../../../config/api";

function Department() {
    interface Department {
        departmentName: string;
        departmentId: string;
        createdAt: Date;
    }

    const navigate = useNavigate();

    const [departmentData, setDepartmentData] = useState<Department[] | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const handleMenuToggle = () => {
        setIsSidebarOpen((prev) => !prev);
    };

    const handleSidebarClose = () => {
        setIsSidebarOpen(false);
    };

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await axios.get(`${API}/departments`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem(
                            "token"
                        )}`,
                    },
                });

                const department = response.data?.department;

                if (department) {
                    setDepartmentData(department);
                }
            } catch (err: any) {
                console.error("Error fetching departments:", err);
                toast.error("Failed to load departments");
            }
        }

        fetchData();
    }, []);

    async function deleteData(departmentId: string): Promise<void> {
        const permission = confirm(
            "Do You Really Want To Delete Department Data??"
        );

        if (permission) {
            try {
                const response = await axios.delete(
                    `${API}/departments/delete/${departmentId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem(
                                "token"
                            )}`,
                        },
                    }
                );

                if (response) {
                    toast.success("Department Deleted Successfully");

                    setTimeout(() => {
                        window.location.reload();
                    }, 2500);
                }
            } catch (err: any) {
                toast.error(
                    err.response?.data?.message || "Delete Request Failed"
                );
            }
        }
    }

    return (
        <div className="flex h-screen w-screen overflow-hidden bg-slate-50">
            <Sidebar isOpen={isSidebarOpen} onClose={handleSidebarClose} />

            <div className="flex-1 h-full overflow-y-auto animate-page">
                <div className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
                    <ProfileNavbar content="Department Management System" onMenuToggle={handleMenuToggle} />
                    <ToastContainer
                        position="top-right"
                        autoClose={2000}
                    />
                </div>

                <div className="pt-6 px-4 sm:px-6 lg:px-8 pb-8 max-w-7xl mx-auto space-y-8">
                    {/* HEADER CARD */}

                    <div className="bg-linear-to-r from-indigo-600 to-indigo-500 rounded-3xl p-6 lg:p-10 shadow-2xl shadow-indigo-100 border border-indigo-400/20 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 group-hover:scale-110 transition-transform duration-700" />

                        <div className="relative z-10 flex flex-col lg:flex-row gap-6 lg:items-center lg:justify-between">
                            <div className="flex items-center gap-4 lg:gap-6">
                                <div className="p-4 lg:p-5 bg-white/20 backdrop-blur-xl rounded-3xl shadow-inner border border-white/30">
                                    <Users className="w-7 h-7 lg:w-8 lg:h-8 text-white" />
                                </div>

                                <div>
                                    <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight">
                                        Department Registry
                                    </h1>

                                    <p className="text-indigo-100 font-bold text-xs lg:text-sm tracking-wide uppercase">
                                        Manage your departments and classrooms
                                    </p>
                                </div>
                            </div>

                            <button
                                className="bg-white px-6 py-3 lg:px-8 lg:py-4 rounded-2xl font-black text-indigo-600 text-sm shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer uppercase tracking-wider w-full lg:w-auto"
                                onClick={() =>
                                    navigate("/departments/add")
                                }
                            >
                                + New Department
                            </button>
                        </div>
                    </div>

                    {/* DEPARTMENT LIST */}

                    <div className="premium-card p-0! overflow-hidden">
                        <div className="p-5 lg:p-8 border-b border-slate-100 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between bg-slate-50/50">
                            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">
                                Active Departments
                            </h3>

                            <div className="badge-indigo">
                                Live Count: {departmentData?.length || 0}
                            </div>
                        </div>

                        {/* DESKTOP TABLE */}

                        <div className="hidden lg:block overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-slate-100 text-[11px] font-black text-slate-400 uppercase tracking-widest">
                                        <th className="p-6">Index</th>
                                        <th className="p-6">
                                            Department Identity
                                        </th>
                                        <th className="p-6">System ID</th>
                                        <th className="p-6">
                                            Registration Date
                                        </th>
                                        <th className="p-6 text-right">
                                            Operations
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="text-sm">
                                    {departmentData?.map(
                                        (department, index) => (
                                            <tr
                                                key={index}
                                                className="group hover:bg-slate-50/80 transition-colors border-b border-slate-50 last:border-none"
                                            >
                                                <td className="p-6 font-black text-slate-300 text-lg">
                                                    {(index + 1)
                                                        .toString()
                                                        .padStart(2, "0")}
                                                </td>

                                                <td className="p-6">
                                                    <div className="font-black text-slate-800">
                                                        {
                                                            department.departmentName
                                                        }
                                                    </div>

                                                    <div className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">
                                                        Academic Wing
                                                    </div>
                                                </td>

                                                <td className="p-6">
                                                    <span className="font-mono text-xs text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-100">
                                                        {
                                                            department.departmentId
                                                        }
                                                    </span>
                                                </td>

                                                <td className="p-6 text-slate-500 font-bold text-xs italic">
                                                    {new Date(
                                                        department.createdAt
                                                    ).toLocaleDateString(
                                                        undefined,
                                                        {
                                                            year: "numeric",
                                                            month: "long",
                                                            day: "numeric",
                                                        }
                                                    )}
                                                </td>

                                                <td className="p-6 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            className="secondary-btn py-2! px-4!"
                                                            onClick={() =>
                                                                navigate(
                                                                    `/departments/edit/${department.departmentId}`
                                                                )
                                                            }
                                                        >
                                                            Edit
                                                        </button>

                                                        <button
                                                            className="delete-btn"
                                                            onClick={() =>
                                                                deleteData(
                                                                    department.departmentId
                                                                )
                                                            }
                                                        >
                                                            Remove
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* MOBILE CARDS */}

                        <div className="lg:hidden p-4 space-y-4">
                            {departmentData?.map((department, index) => (
                                <div
                                    key={index}
                                    className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4"
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h2 className="font-black text-slate-800 text-lg">
                                                {department.departmentName}
                                            </h2>

                                            <p className="text-xs text-slate-400 uppercase font-bold">
                                                Academic Wing
                                            </p>
                                        </div>

                                        <span className="font-bold text-slate-400">
                                            #{index + 1}
                                        </span>
                                    </div>

                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase mb-1">
                                            Department ID
                                        </p>

                                        <span className="font-mono text-xs text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-100">
                                            {department.departmentId}
                                        </span>
                                    </div>

                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase mb-1">
                                            Registration Date
                                        </p>

                                        <p className="text-sm text-slate-600">
                                            {new Date(
                                                department.createdAt
                                            ).toLocaleDateString(undefined, {
                                                year: "numeric",
                                                month: "long",
                                                day: "numeric",
                                            })}
                                        </p>
                                    </div>

                                    <div className="flex gap-3">
                                        <button
                                            className="secondary-btn flex-1 py-2!"
                                            onClick={() =>
                                                navigate(
                                                    `/departments/edit/${department.departmentId}`
                                                )
                                            }
                                        >
                                            Edit
                                        </button>

                                        <button
                                            className="delete-btn flex-1"
                                            onClick={() =>
                                                deleteData(
                                                    department.departmentId
                                                )
                                            }
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* EMPTY STATE */}
                        {(!departmentData || departmentData.length === 0) && (
                            <div className="p-20 text-center space-y-4 opacity-40">
                                <Users className="w-12 h-12 text-slate-200 mx-auto" />
                                <p className="text-xs font-black text-slate-500 uppercase tracking-widest">
                                    No departments found in registry
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Department;