import { Fragment } from "react";
import MainNavBar from "../Components/MainNavBar";
import BackGround from "../Utilities/Background";

function HomePage() {
  const features = [
    "Optimized, conflict-free timetable generation.",
    "Flexible inputs for faculties, rooms & departments.",
    "Interactive visual preview and quick edits.",
    "Smart conflict resolution and balanced load.",
  ];

  return (
    <Fragment>
      <MainNavBar />

      <div className="relative overflow-hidden min-h-screen bg-linear-to-b from-white via-slate-50 to-indigo-50 text-slate-900 scroll-smooth">
        
        <BackGround />


        {/* Title */}
        <div className="relative z-10 max-w-6xl mx-auto px-6 py-10">
          <h1 className="text-center text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 hover:text-indigo-600 transition duration-300">
            Institute Time Table Generator
          </h1>

          
          
          
          {/* Hero Section */}
          <section id="home" className="mt-16 grid lg:grid-cols-2 gap-12 items-center">

            {/* Left Content */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1 text-sm font-semibold text-indigo-700 shadow-sm"> ✨ Smart Scheduling Platform </div>

              <h2 className="text-4xl sm:text-5xl font-black leading-tight"> Revolutionize scheduling with intelligent automation </h2>

              <p className="text-lg leading-relaxed text-slate-600 max-w-2xl"> Generate optimized and conflict-free academic timetables with modern UI, smart workflows, and reliable scheduling algorithms. </p>
            </div>

        {/* Right Card */}
        <div className="flex justify-center">

        <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/60 bg-gradient-to-br from-indigo-50/80 to-cyan-50/80 p-6 shadow-2xl backdrop-blur-xl transition duration-500 hover:scale-[1.02]">

            {/* Soft Glow Behind Image */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-200/20 via-transparent to-cyan-200/20" />
ī
            {/* Image */}
            <img src="https://cdn.pixabay.com/photo/2014/04/03/10/30/calendar-310690_1280.png" alt="Timetable Preview" className="relative z-10 w-full object-contain drop-shadow-2xl mix-blend-multiply opacity-95" />

        </div>
        </div>
          </section>


          
          
          
          
          {/* Features */}
          <section className="mt-28">
            <h2 className="text-center text-4xl font-bold text-slate-900"> Key Features </h2>
            <p className="mx-auto mt-4 max-w-2xl text-center text-slate-600"> Everything required to create smart and efficient
              institutional timetables. </p>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">

              {features.map((feature, index) => (

                <div key={index} className="group rounded-3xl border border-white bg-white/70 p-6 shadow-lg backdrop-blur-xl transition duration-500 hover:-translate-y-3 hover:shadow-2xl">

                  <div className="flex flex-col gap-4">

                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100 text-2xl text-indigo-600 transition duration-300 group-hover:scale-110"> ✦</div>

                    <p className="font-medium leading-relaxed text-slate-700"> {feature} </p>
                  </div>
                </div>
              ))}
            </div>
          </section>



          {/* About */}
          <section id="about-us" className="mt-28 rounded-3xl border border-white bg-white/70 p-8 shadow-2xl backdrop-blur-xl sm:p-10">

            <h2 className="text-center text-4xl font-bold text-slate-900"> About Us </h2>

            <p className="mx-auto mt-6 max-w-3xl text-center text-lg leading-relaxed text-slate-600"> Institute Time Table Generator simplifies complex scheduling workflows using intelligent algorithms and modern web technologies. It helps institutions save time, reduce conflicts, and manage schedules efficiently. </p>
          </section>




          {/* Contact */}
          <section id="contact" className="mt-28 mb-10 rounded-3xl border border-white bg-white/70 p-8 shadow-2xl backdrop-blur-xl sm:p-10">

            <div className="space-y-5 text-center">

              <div className="inline-flex items-center gap-2 rounded-full bg-indigo-100 px-4 py-1 text-sm font-semibold text-indigo-700"> 📬 Get In Touch </div>

              <h2 className="text-4xl font-bold text-slate-900"> Contact </h2>

              <p className="mx-auto max-w-xl text-lg text-slate-600"> Interested in demos, collaboration, or custom solutions? Feel free to connect anytime. </p>

              <div className="mt-6 flex flex-col justify-center gap-4 sm:flex-row">

                <a href="mailto:khush5237@gmail.com" className="rounded-full bg-indigo-600 px-6 py-3 text-center font-semibold text-white shadow-lg transition duration-300 hover:scale-105 hover:bg-indigo-700"> Email Me </a>

                <a href="https://www.linkedin.com/in/khush-patel-173774364/" target="_blank" rel="noreferrer" className="rounded-full border border-slate-200 bg-white px-6 py-3 text-center font-medium text-slate-700 shadow transition duration-300 hover:scale-105 hover:shadow-lg" > LinkedIn </a>
              </div>
            </div>
          </section>
        </div>
      </div>
    </Fragment>
  );
}

export default HomePage;