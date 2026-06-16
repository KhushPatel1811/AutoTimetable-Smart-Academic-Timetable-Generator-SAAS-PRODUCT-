import React, { Fragment, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";

function MainNavBar() {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [activeSection, setActiveSection] = useState<string>("home");

    // Track scroll positioning to automatically highlight the current visible section
    useEffect(() => {
        const sections = ["home", "features", "about-us", "contact"];
        
        const observerOptions = {
            root: null,
            rootMargin: "-40% 0px -50% 0px", // Triggers color swap when a section occupies the viewport center
            threshold: 0
        };

        const observerCallback = (entries: IntersectionObserverEntry[]) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    setActiveSection(entry.target.id);
                }
            });
        };

        const observer = new IntersectionObserver(observerCallback, observerOptions);
        
        sections.forEach((id) => {
            const el = document.getElementById(id);
            if (el) observer.observe(el);
        });

        return () => observer.disconnect();
    }, []);

    function handleScroll(e: React.MouseEvent<HTMLAnchorElement>, section_id: string): void {
        e.preventDefault();
        setIsOpen(false); 
        document.getElementById(section_id)?.scrollIntoView({
            behavior: "smooth"
        });
    }

    // Helper to generate the text links cleanly with active/inactive Tailwind styles
    const renderNavLink = (id: string, label: string, mobile = false) => {
        const isActive = activeSection === id;
        
        if (mobile) {
            return (
                <a 
                    href={`#${id}`} 
                    onClick={(e) => handleScroll(e, id)} 
                    className={`block rounded-xl px-4 py-3 text-sm font-bold transition-all ${
                        isActive 
                            ? "bg-indigo-600/20 text-indigo-400 border-l-4 border-indigo-500 pl-3" 
                            : "text-slate-300 hover:bg-white/5 hover:text-white"
                    }`}
                >
                    {label}
                </a>
            );
        }

        return (
            <a 
                href={`#${id}`} 
                onClick={(e) => handleScroll(e, id)} 
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-all relative ${
                    isActive 
                        ? "text-indigo-400 bg-white/5 shadow-inner" 
                        : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                }`}
            >
                {label}
                {/* Active bottom underline indicator bar */}
                {isActive && (
                    <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.8)]" />
                )}
            </a>
        );
    };

    return (
        <Fragment>
            <nav className="bg-slate-950/80 border-b border-white/10 sticky top-0 z-50 backdrop-blur-md text-white">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
                    
                    {/* Brand / Logo */}
                    <a href="#home" onClick={(e) => handleScroll(e, "home")} className="flex items-center gap-3 transition-opacity hover:opacity-90">
                        <img 
                            className="h-10 w-10 md:h-11 md:w-11 rounded-full border border-white/20 bg-white/5 p-1 backdrop-blur-xl" 
                            src="https://cdn-icons-png.flaticon.com/512/1048/1048953.png" 
                            alt="Timetable Logo"
                        />
                        <span className="text-base md:text-lg font-black tracking-tight text-white">
                            Timetable <span className="text-indigo-400">Generator</span>
                        </span>
                    </a>

                    {/* Desktop Navigation Links */}
                    <div className="hidden items-center gap-2 md:flex">
                        {renderNavLink("home", "Home")}
                        {renderNavLink("features", "Features")}
                        {renderNavLink("about-us", "About")}
                        {renderNavLink("contact", "Contact")}
                        
                        <div className="h-4 w-px bg-white/10 mx-2" /> 

                        <Link to="/auth/login" className="rounded-full px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/5 hover:text-white">
                            Login
                        </Link>
                        <Link to="/auth/register" className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-500 hover:scale-105 active:scale-95">
                            Register
                        </Link>
                    </div>

                    {/* Mobile Menu Open Action Trigger Button */}
                    <div className="md:hidden">
                        <button 
                            onClick={() => setIsOpen(!isOpen)} 
                            className="p-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 focus:outline-none transition-colors"
                            aria-label="Toggle Navigation Menu"
                        >
                            {isOpen ? <X className="w-5 h-5 text-indigo-400" /> : <Menu className="w-5 h-5 text-slate-300" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation Dropdown Container */}
                {isOpen && (
                    <div className="border-t border-white/5 bg-slate-950 px-4 pb-6 md:hidden animate-page">
                        <ul className="space-y-2 pt-4">
                            <li>{renderNavLink("home", "Home", true)}</li>
                            <li>{renderNavLink("features", "Features", true)}</li>
                            <li>{renderNavLink("about-us", "About", true)}</li>
                            <li>{renderNavLink("contact", "Contact", true)}</li>
                            
                            <li className="pt-4 border-t border-white/5 grid grid-cols-2 gap-3">
                                <Link to="/auth/login" className="w-full text-center rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/10">
                                    Login
                                </Link>
                                <Link to="/auth/register" className="w-full text-center rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-500">
                                    Register
                                </Link>
                            </li>
                        </ul>
                    </div>
                )}
            </nav>
        </Fragment>
    );
}

export default MainNavBar;