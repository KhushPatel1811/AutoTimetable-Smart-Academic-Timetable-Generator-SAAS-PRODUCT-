import { useEffect, useState } from "react";
import axios from "axios";
import { BookOpen, GraduationCap, FlaskConical, Layers3, Search, RefreshCcw, Users, Building2, UserRound} from "lucide-react";
import Sidebar from "../../../Components/Dashboard/Sidebar";
import ProfileNavbar from "../Profile/ProfileNavbar";
import { useNavigate } from "react-router";
import { toast, ToastContainer } from "react-toastify";

function Subjects() {

    //! STATES USED FOR STORING DATA
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [subjects, setSubjects] = useState([]);
    const [departments, setDepartments] = useState([]);


    //! STATES USED FOR FILTERING DATA
    const [search, setSearch] = useState("");
    const [departmentFilter, setDepartmentFilter] = useState("");
    const [semesterFilter, setSemesterFilter] = useState("");
    const [type, setType] = useState("");


    // FETCH DATA
    useEffect(() => {
        async function fetchData() {
            try {
                const res = await axios.get("http://localhost:1000/subjects", {
                    params: { search, departmentFilter, semesterFilter, type }
                });

                setSubjects(res.data.subjects);

                const dept = await axios.get("http://localhost:1000/departments");
                console.log("DEPARTMENT DATA:", dept.data)
                setDepartments(dept.data.department);
            } 
            catch (err: any) {
                toast.error(err.response?.data?.message);
            }
        }
        fetchData();
    }, [search, departmentFilter, semesterFilter, type]);

    useEffect(()=>{
        console.log("subjects: ",subjects)
        console.log("departments: ",departments)
    },[subjects, departments])



    //! CLEAR FILTER FUNCTION
    function clearFilter() {
        setSearch('')
        setDepartmentFilter('')
        setSemesterFilter('')
        setType('')
        // window.location.reload()
    }


    // DELETE
    const deleteSubject = async (id: string) => {

        if (!confirm("Do You Really Want To Delete Subject?")) return;

        try {
            const response = await axios.delete(`http://localhost:1000/subjects/delete/${id}`);

            if(response) {
                toast.success("Subject Deleted Successfully");

                setTimeout(()=>{
                    window.location.reload();
                },3000)
            }
        } catch (err: any) {
            console.log('Error Occurred:', err)
            console.log('Response:', err.response?.data?.message)
            console.log('Status:', err.response?.status)
            toast.error(err.response?.data?.message || 'Subject Deletion Request Failed');
        }
    };


    // CARDS
    const cards = [
        {
            icon: BookOpen,
            title: "Total Subjects",
            count: subjects.length,
            color: "from-purple-500 to-indigo-500"
        },
        {
            icon: GraduationCap,
            title: "Lecture",
            count: subjects.filter((s: any) => s.subjectType === "LECTURE").length,
            color: "from-blue-500 to-cyan-500"
        },
        {
            icon: FlaskConical,
            title: "Lab",
            count: subjects.filter((s: any) => s.subjectType === "LAB").length,
            color: "from-orange-500 to-amber-500"
        },
        {
            icon: Layers3,
            title: "Lecture+Lab",
            count: subjects.filter((s: any) => s.subjectType === "LECTURE + LAB").length,
            color: "from-pink-500 to-rose-500"
        }
    ];


    return (
        <div className="flex h-screen">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />


            <div className=" bg-gray-50 flex-1 flex flex-col overflow-auto">
                <div className="bg-white z-10 border-b border-gray-200 pb-5">
                    <ProfileNavbar content="Subjects" />
                    <ToastContainer />
                </div>

                {/* HEADER */}
                <div className="p-6">

                    <div className="bg-linear-to-r from-purple-500 via-indigo-500 to-pink-500 p-6 rounded-2xl text-white flex justify-between">

                        <div className="flex items-center gap-3">
                            <Users size={30} />
                            <div>
                                <h1 className="text-xl font-bold">Subjects Management</h1>
                                <p className="text-sm opacity-80">Manage academic subjects</p>
                            </div>
                        </div>

                        <button
                            onClick={() => navigate("/subjects/add")}
                            className="bg-white text-black px-4 py-2 rounded-xl font-semibold hover:cursor-pointer">
                            + Add Subject
                        </button>

                    </div>


                    {/* CARDS */}
                    <div className="grid grid-cols-4 gap-4 mt-6">

                        {cards.map((c, i) => {
                            const Icon = c.icon;
                            return (
                                <div key={i} className="bg-white p-4 rounded-xl shadow">

                                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center bg-linear-to-r ${c.color}`}>
                                        <Icon color="white" />
                                    </div>

                                    <p className="text-gray-500 text-sm mt-2">{c.title}</p>
                                    <h2 className="text-xl font-bold">{c.count}</h2>

                                </div>
                            );
                        })}

                    </div>


                    {/* FILTERS */}
                    <div className="grid grid-cols-4 gap-3 mt-6 bg-white p-4 rounded-xl">

                        <div className="flex items-center gap-2 border border-gray-300 rounded-xl px-3 py-2 focus-within:border-blue-500 bg-white shadow-xs">
                            <Search size={18} className="text-gray-400 shrink-0" />

                            <input type="text" className="w-full outline-none text-sm bg-transparent" placeholder="Search by Name, ID, Room, Department..." onChange={(e) => setSearch(e.target.value)}/>
                        </div>

                            <div className="flex items-center gap-2 border border-gray-300 rounded-xl px-3 py-2 focus-within:border-blue-500 bg-white">
                                <Building2 size={18} className="text-gray-400 shrink-0" />
                                <select className="w-full outline-none text-sm bg-transparent cursor-pointer" onChange={(e)=>setDepartmentFilter(e.target.value)}>
                                <option value="">All Departments</option>
                                {departments.map((d: any) => (
                                    <option key={d.departmentName} value={d.departmentName}>{d.departmentName}</option>
                                ))}
                            </select>
                        </div>

                            <div className="flex items-center gap-2 border border-gray-300 rounded-xl px-3 py-2 focus-within:border-blue-500 bg-white">
                                <UserRound size={18} className="text-gray-400 shrink-0"/>
                                <select className="w-full outline-none text-sm bg-transparent cursor-pointer" onChange={(e)=>setSemesterFilter(e.target.value)}>
                                <option value="">Select Semester / Class</option>
                                {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                                    <option key={s} value={s}>Semester {s}</option>
                                ))}
                                {
                                    [1,2,3,4,5,6,7,8,9,10,11,12].map(s =>(
                                        <option key={s} value={s}>Class {s}</option>
                                    ))
                                }
                            </select>
                        </div>


                        <div className="flex items-center gap-2 border border-gray-300 rounded-xl px-3 py-2 focus-within:border-blue-500 bg-white">
                            <BookOpen size={18} className="text-gray-400 shrink-0"/>
                                <select className="w-full outline-none text-sm bg-transparent cursor-pointer" onChange={(e)=>setType(e.target.value)}>
                                <option value="">Type</option>
                                <option value="Lecture">Lecture</option>
                                <option value="Lab">Lab</option>
                                <option value="Lecture + Lab">Lecture + Lab</option>
                            </select>
                        </div>

                        <button className="flex items-center justify-center gap-2 border border-dashed border-gray-300 hover:border-gray-400 rounded-xl px-3 py-2 text-gray-600 bg-gray-50/50 hover:bg-gray-50 text-sm transition font-medium cursor-pointer" onClick={clearFilter}>
                            <RefreshCcw size={16} className="text-gray-500" />
                            <span>Clear Filters</span>
                        </button>
                    </div>


                    {/* TABLE */}
                    <div className="bg-white border border-gray-200 rounded-2xl shadow-xs overflow-hidden">
                        <div className="w-full overflow-x-auto scrollbar-thin">
                            <table className="w-full text-left border-collapse min-w-225">

                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-200 text-gray-700 text-xs uppercase font-semibold tracking-wider">
                                        <th className="p-4">Subject Name</th>
                                        <th className="p-4">Code</th>
                                        <th className="p-4">Type</th>
                                        <th className="p-4">Semester</th>
                                        <th className="p-4">Department</th>
                                        <th className="p-4">Teachers</th>
                                        <th className="p-4 text-right">Actions</th>
                                    </tr>
                                </thead>

                                <tbody className="text-sm text-gray-600">
                                    {subjects.map((s: any) => (
                                        <tr key={s.subjectId} className="hover:bg-gray-50/70 transition-colors">
                                            <td className="p-4 font-medium text-gray-900">
                                                {s.subjectName}
                                            </td>

                                            <td className="p-4 font-mono text-xs text-gray-500">
                                                {s.subjectCode}
                                            </td>

                                            <td className="p-4">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                                                    {s.subjectType}
                                                </span>
                                            </td>

                                            <td className="p-4">
                                                {s.semester}
                                            </td>

                                            <td className="p-4">
                                                {s.departmentName}
                                            </td>

                                            <td className="p-4">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                                                    {s.teacherName?.length || 0} Teacher{s.teacherName?.length !== 1 ? "s" : ""}
                                                </span>
                                            </td>

                                            <td className="p-4 text-right whitespace-nowrap">
                                                <div className="inline-flex items-center gap-2">
                                                    <button onClick={() => navigate(`/subjects/edit/${s.subjectId}`)} className="text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer">
                                                        Edit
                                                    </button>

                                                    <button onClick={() => deleteSubject(s.subjectId)} className="text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer">
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>                    
                </div>
            </div>
        </div>
    );
}

export default Subjects;