import { Fragment } from "react";
import MainNavBar from "../Components/MainNavBar";
import BackGround from "../Utilities/Background";
import { Sparkles, Calendar, Zap, ShieldCheck, Layers, ArrowRight, GitBranch, Globe, Mail } from "lucide-react";

function HomePage() {
  const features = [
    { title: "Conflict-Free Scheduling", desc: "Our smart algorithm ensures zero overlapping slots between teachers and classrooms.", icon: Zap },
    { title: "Flexible Setup", desc: "Easily customize your data inputs for different departments, semesters, and course modules.", icon: Layers },
    { title: "Real-Time Previews", desc: "Instantly visualize your generated timetable drafts and manage previous versions.", icon: Calendar },
    { title: "Balanced Workloads", desc: "Smart distribution prevents teacher fatigue and optimizes classroom space.", icon: ShieldCheck },
  ];

  return (
    <Fragment>
      <MainNavBar />

      <div className="relative overflow-hidden min-h-screen bg-slate-950 text-white selection:bg-indigo-500/30 selection:text-indigo-200">
        <div className="absolute inset-0 z-0 opacity-40">
          <BackGround />
        </div>

        {/* Responsive main wrapper: adjusted padding on mobile vs desktop */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 md:pt-20 pb-20 md:pb-32 space-y-20 md:space-y-32">
          
          {/* Hero Section: Shifts cleanly from 1 column on mobile to 2 columns on desktop */}
          <section id="home" className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center animate-page">
            <div className="space-y-6 md:space-y-10 text-center lg:text-left">
              <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 md:px-5 md:py-2 text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-indigo-400 shadow-2xl backdrop-blur-3xl mx-auto lg:mx-0">
                <Sparkles className="w-3.5 h-3.5 md:w-4 md:h-4" /> Timetable Generator v1.0
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-[1.15] lg:leading-[1.1] tracking-tight">
                Create <br className="hidden sm:block" />
                <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-400 via-violet-400 to-indigo-600">Perfect Timetables</span>
              </h1>

              <p className="text-base sm:text-lg md:text-xl leading-relaxed text-slate-400 max-w-xl font-medium mx-auto lg:mx-0">
                Eliminate scheduling conflicts entirely with an automated generation tool built for busy university environments.
              </p>

              <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4 pt-2">
                <a href="/auth/register" className="add-btn w-full sm:w-auto !py-4 md:!py-5 !px-8 md:!px-10 text-xs md:text-sm gap-3 justify-center shadow-2xl shadow-indigo-500/20 hover:scale-105 active:scale-95">
                  Get Started <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
                </a>
                <a href="#features" className="secondary-btn w-full sm:w-auto !py-4 md:!py-5 !px-8 md:!px-10 !bg-white/5 !border-white/10 !text-white text-xs md:text-sm justify-center hover:!bg-white/10 transition-all">
                  View Features
                </a>
              </div>
            </div>

            {/* Hero Interactive Mockup Graphic */}
            <div className="relative group max-w-md mx-auto lg:max-w-none w-full px-4 sm:px-0">
              <div className="absolute -inset-1 rounded-[2rem] md:rounded-[3rem] bg-linear-to-r from-indigo-500 to-violet-600 opacity-20 blur-2xl group-hover:opacity-40 transition-opacity duration-1000" />
              <div className="relative bg-white/5 border border-white/20 rounded-[2rem] md:rounded-[3rem] p-4 backdrop-blur-3xl shadow-2xl overflow-hidden aspect-square flex items-center justify-center">
                 <div className="absolute inset-0 bg-linear-to-br from-indigo-500/10 via-transparent to-violet-500/10" />
                 <Calendar className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 text-indigo-500/40 drop-shadow-[0_0_50px_rgba(99,102,241,0.3)] animate-float" />
                 <div className="absolute bottom-6 left-6 right-6 md:bottom-10 md:left-10 md:right-10 p-4 md:p-6 bg-white/10 backdrop-blur-2xl rounded-2xl md:rounded-3xl border border-white/10 space-y-2">
                    <div className="flex justify-between items-center">
                        <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-indigo-400">Generation Status</span>
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    </div>
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full w-3/3 bg-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.5)]" />
                    </div>
                    <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Timetable Generation: 100% Complete</p>
                 </div>
              </div>
            </div>
          </section>

          {/* Features Section: Responsive grid changes from 1 to 2 to 4 columns based on device screen sizes */}
          <section id="features" className="space-y-12 md:space-y-20">
            <div className="text-center space-y-3 md:space-y-4">
                <h2 className="text-3xl md:text-4xl font-black tracking-tight">Key System Features</h2>
                <div className="h-1 w-20 md:h-1.5 md:w-24 bg-indigo-600 mx-auto rounded-full shadow-[0_0_15px_rgba(79,70,229,0.5)]" />
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {features.map((f, i) => (
                <div key={i} className="premium-card !bg-white/5 !border-white/10 group hover:!bg-white/10 hover:-translate-y-1.5 transition-all duration-500">
                  <div className="space-y-4 md:space-y-6">
                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-indigo-600 flex items-center justify-center shadow-2xl shadow-indigo-500/20 group-hover:rotate-6 transition-transform">
                      <f.icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
                    </div>
                    <h3 className="text-lg md:text-xl font-black tracking-tight">{f.title}</h3>
                    <p className="text-xs md:text-sm text-slate-400 font-medium leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* About Console: Custom padding metrics adjusted to match smaller devices */}
          <section id="about-us" className="relative group">
             <div className="absolute -inset-1 rounded-[2rem] md:rounded-[3rem] bg-indigo-500 opacity-10 blur-xl transition-opacity group-hover:opacity-20" />
             <div className="relative bg-white/5 border border-white/20 rounded-[2rem] md:rounded-[3rem] p-6 sm:p-12 md:p-20 backdrop-blur-3xl space-y-6 md:space-y-10 text-center">
                <h2 className="text-3xl md:text-4xl font-black tracking-tight">Our Goal</h2>
                <p className="text-base sm:text-lg md:text-xl text-slate-400 font-medium max-w-4xl mx-auto leading-relaxed">
                  Managing institutional timetables shouldn't be a puzzle. We have simplified complex scheduling requirements into a straightforward system, allowing college administrators to generate smooth, error-free operational calendars without manual work or scheduling clashes.
                </p>
             </div>
          </section>

          {/* Contact Node: Clean 1 column on mobile to 2 columns layout logic flow */}
          <section id="contact" className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
             <div className="space-y-4 md:space-y-6 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 rounded-full bg-slate-900 border border-slate-800 px-4 py-1 text-xs font-black text-indigo-400 uppercase tracking-widest">
                    Get in Touch
                </div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight">Connect with <br className="hidden sm:block" />Our Team</h2>
                <p className="text-base md:text-lg text-slate-400 font-medium leading-relaxed max-w-xl mx-auto lg:mx-0">
                  Need custom features for your college department, setup assistance, or want to give feedback? Reach out directly using our support links.
                </p>
             </div>

             <div className="premium-card !bg-white/5 !border-white/10 p-6 sm:p-8 max-w-md mx-auto lg:max-w-none w-full">
                <div className="grid gap-4 md:gap-6">
                    <a href="mailto:khush5237@gmail.com" className="flex items-center gap-4 md:gap-6 p-4 md:p-6 rounded-2xl md:rounded-3xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all group">
                        <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-rose-600/20 text-rose-500 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
                            <Mail className="w-5 h-5 md:w-6 md:h-6" />
                        </div>
                        <div className="truncate">
                            <p className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest">Email Address</p>
                            <p className="text-base md:text-lg font-black tracking-tight truncate">khush5237@gmail.com</p>
                        </div>
                    </a>
                    
                    <a href="https://www.linkedin.com/in/khush-patel-173774364/" target="_blank" rel="noreferrer" className="flex items-center gap-4 md:gap-6 p-4 md:p-6 rounded-2xl md:rounded-3xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all group">
                        <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-indigo-600/20 text-indigo-500 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
                            <Globe className="w-5 h-5 md:w-6 md:h-6" />
                        </div>
                        <div className="truncate">
                            <p className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest">LinkedIn Profile</p>
                            <p className="text-base md:text-lg font-black tracking-tight truncate">Khush Patel</p>
                        </div>
                    </a>
                </div>
             </div>
          </section>

          {/* Footer */}
          <footer className="pt-10 md:pt-20 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-6 opacity-40 text-center sm:text-left">
             <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em]">© 2026 Timetable Generator Engine</p>
             <div className="flex gap-6 md:gap-8">
                <GitBranch className="w-4 h-4 md:w-5 md:h-5 cursor-pointer hover:text-indigo-400 transition-colors" />
                <Globe className="w-4 h-4 md:w-5 md:h-5 cursor-pointer hover:text-indigo-400 transition-colors" />
             </div>
          </footer>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
      `}} />
    </Fragment>
  );
}

export default HomePage;