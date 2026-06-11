// ...existing code...
import React, { Fragment } from "react";
import { Link } from "react-router-dom";

function MainNavBar() {
    function handleScroll(e: React.MouseEvent<HTMLAnchorElement>, section_id:string): void {
        e.preventDefault();
        document.getElementById(section_id)?.scrollIntoView({
            behavior:"smooth"
        });
    }

    return (
        <Fragment>
            <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-6">
                    <a href="#home" onClick={(e) => handleScroll(e, "home")} className="flex items-center gap-3 text-slate-900" >
                        <img className="h-12 w-12 rounded-full border border-gray-200 bg-white p-1" src="https://cdn-icons-png.flaticon.com/512/1048/1048953.png" alt="Institute Time Table Logo"/>
                        <span className="text-lg font-bold text-slate-900">Institute Time Table</span>
                    </a>

                    <div className="hidden items-center gap-3 md:flex">
                        <a href="#home" onClick={(e) => handleScroll(e, "home")} className="rounded-full px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-200"> Home</a>
                        <a href="#about-us" onClick={(e) => handleScroll(e, "about-us")} className="rounded-full px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-200"> About</a>
                        <a href="#contact" onClick={(e) => handleScroll(e, "contact")} className="rounded-full px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-200" > Contact </a>
                        <button className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-300">
                            <Link to="/auth/login" className="inline-block"> Sign In </Link>
                        </button>
                        <button className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-300">
                            <Link to="/auth/register" className="inline-block"> Get Started </Link>
                        </button>
                    </div>
                </div>

                <div className="border-t border-gray-200 bg-white px-4 pb-4 md:hidden">
                    <ul className="space-y-3 pt-4">
                        <li>
                            <a href="#home" onClick={(e) => handleScroll(e, "home")} className="block rounded-2xl px-4 py-3 text-slate-700 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-200" > Home </a>
                        </li>
                        <li>
                            <a href="#about-us" onClick={(e) => handleScroll(e, "about-us")} className="block rounded-2xl px-4 py-3 text-slate-700 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-200"> About </a>
                        </li>
                        <li>
                            <a href="#contact" onClick={(e) => handleScroll(e, "contact")} className="block rounded-2xl px-4 py-3 text-slate-700 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-200"> Contact </a>
                        </li>
                        <li>
                            <button className="w-full rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-300">
                                Sign In
                            </button>
                        </li>
                        <li>
                            <button className="w-full rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-300">
                                Get Started
                            </button>
                        </li>
                    </ul>
                </div>
            </nav>
        </Fragment>
    );
}

export default MainNavBar;
// ...existing code...