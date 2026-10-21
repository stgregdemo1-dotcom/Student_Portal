"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface ConfigData {
  admission_button?: boolean | string[] | string;
}

export default function Home() {
  const [isAdmissionEnabled, setIsAdmissionEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch("/api/portal/admin?table=configuration");

        if (!res.ok) return;

        const data = await res.json();
        const configObj: ConfigData = Array.isArray(data) ? data[0] : data;
        const val = configObj?.admission_button;

        if (typeof val === "boolean") {
          setIsAdmissionEnabled(val);
        } else if (Array.isArray(val)) {
          setIsAdmissionEnabled(val[0] === "true");
        } else {
          setIsAdmissionEnabled(val === "true");
        }
      } catch (error) {
        console.error("Failed to load admission button status:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, []);

  const programs = [
    {
      title: "Information and Communication Technology",
      desc: "Learn programming, software development, and emerging technologies. Master the tools that power the modern digital world.",
    },
    {
      title: "Hotel and Restaurant Management",
      desc: "Explore the wonders of hospitality through hands-on experiences in culinary arts, front office, and tourism management.",
    },
  ];

  return (
    // FIX: Forced main to be a vertical flex column centered horizontally
    <main className="w-full min-h-screen flex flex-col items-center overflow-x-hidden">
      
      {/* HOME SECTION */}
      <section
        id="Home"
        className="w-full min-h-[70vh] flex items-center justify-center text-white text-center bg-cover bg-center py-16"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,0,0,0.514), rgba(0,0,0,0.5)), url('https://scontent.fcrk3-3.fna.fbcdn.net/v/t1.15752-9/829406177_1938597277545802_2860480563625807303_n.jpg?_nc_cat=106&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=9f807c&_nc_ohc=nSa7oE_9IIkQ7kNvwEVNOeY&_nc_oc=AdplMu7yOzav7X0zsp3EcgIUHtBTSFiztGiHsRVqlBdjR2eaLTBBbK2q6dLGBjnIzME&_nc_zt=23&_nc_ht=scontent.fcrk3-3.fna&_nc_ss=7b2a8&oh=03_Q7cD6gH6HKuXVJE-NFdnmn-uN2wEaTrcaxkrc5ZFFqyABvawtg&oe=6AE87494')",
        }}
      >
        <div className="max-w-[700px] mx-auto px-5">
          <h1 className="text-[2.2rem] sm:text-[3rem] font-bold mb-4 drop-shadow-lg leading-tight">
            Excellence in Science and Technology Education
          </h1>

          <p className="text-[1.1rem] mb-8 drop-shadow-md opacity-90">
            Saint Gregory College of Science and Technology is dedicated to
            providing world-class education that prepares students for
            successful careers in science, technology, engineering, and
            mathematics.
          </p>

          {!loading && isAdmissionEnabled && (
            <Link
              href="/admission/registration"
              className="inline-flex items-center justify-center bg-yellow-400 text-[#2c3e50] h-[45px] min-w-[150px] px-8 rounded-full font-bold text-base transition-all duration-300 hover:bg-yellow-500 hover:-translate-y-0.5 hover:shadow-lg shadow-sm"
            >
              Apply Now!
            </Link>
          )}
        </div>
      </section>

      {/* MISSION AND VISION SECTION */}
      <section
        id="News"
        className="w-full py-16 px-5 bg-[#fafafa] flex flex-col items-center"
      >
        <h2 className="text-center text-[2rem] sm:text-[2.2rem] font-bold text-[#2c3e50] mb-8">
          Mission &amp; Vision
        </h2>

        <div className="w-full max-w-[950px] grid grid-cols-1 md:grid-cols-2 gap-7">
          {/* MISSION CARD */}
          <div className="w-full min-w-0 bg-[#e7e7e7] rounded-[10px] overflow-hidden shadow-sm flex flex-col">
            <div className="h-[120px] w-full shrink-0 bg-green-500 flex items-center justify-center text-white text-4xl">
              <i className="fas fa-bullseye" aria-hidden="true"></i>
            </div>

            <div className="p-6 flex-1">
              <h3 className="text-xl font-bold text-black text-center mb-5">
                Mission
              </h3>

              <div className="space-y-4 text-sm leading-relaxed text-gray-800 text-justify break-words">
                <p>
                  SAINT GREGORY COLLEGE OF SCIENCE AND TECHNOLOGY - CAVITE
                  ACADEME ENVISIONS ITSELF AS THE CENTER OF ACADEMIC
                  EXCELLENCE IN HOSPITALITY &amp; TOURISM MANAGEMENT WHICH IS
                  ESTABLISHED TO THE PURPOSE OF MOLDING THE MIND OF THE
                  FILIPINO YOUTH DEDICATED TO THE SERVICE OF COUNTRY,
                  HUMANITY AND GOD.
                </p>

                <p>
                  AN ACADEME COMMITTED TO GIVE HIGH QUALITY STANDARD OF
                  HRM/TOURISM/ICT EDUCATION WITH HIGHLY COMPETITIVE SKILLS
                  AND KNOWLEDGE WITH THIS COMMITMENT. SAINT GREGORY COLLEGE
                  OF SCIENCE AND TECHNOLOGY - CAVITE AIMS TO DEVELOP AND
                  PRODUCE GRADUATES WITH TIMELY AND BEST TEACHING METHODS
                  THAT ANSWER THE NEEDS OF OUR MODERN LEARNERS.
                </p>

                <p>
                  IN ACCORDANCE WITH THIS MISSION, SGCST-CAVITE BINDS ITSELF
                  TO THE HIGHEST STANDARD OF DEDICATION, INTEGRITY AND
                  COMPETENCY.
                </p>
              </div>
            </div>
          </div>

          {/* VISION CARD */}
          <div className="w-full min-w-0 bg-[#e7e7e7] rounded-[10px] overflow-hidden shadow-sm flex flex-col">
            <div className="h-[120px] w-full shrink-0 bg-green-500 flex items-center justify-center text-white text-4xl">
              <i className="fas fa-eye" aria-hidden="true"></i>
            </div>

            <div className="p-6 flex-1">
              <h3 className="text-xl font-bold text-black text-center mb-5">
                Vision
              </h3>

              <p className="text-sm leading-relaxed text-gray-800 text-justify break-words">
                IN SOLIDARITY WITH OUR PEOPLE SAINT GREGORY COLLEGE OF SCIENCE
                AND TECHNOLOGY-CAVITE SCATTO THE CONSTITUTIONAL MANDATE OF
                EDUCATING THE YOUTH BY PROVIDING KNOWLEDGE ABOUT COMPETITIVE
                SKILLS AND MODERN TECHNOLOGY THAT MAY EFFECT PERSONAL AND
                SOCIAL CHANGES AND WILL ACHIEVE SUCCESS FOR THE FUTURE.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PROGRAMS SECTION */}
      <section
        id="Programs"
        className="w-full py-20 bg-[#fafafa] flex flex-col items-center"
      >
        <div className="w-full max-w-7xl mx-auto px-4 flex flex-col items-center">
          {/* CENTERED HEADING */}
          <div className="w-full max-w-[600px] text-center mb-[50px] mx-auto flex flex-col items-center">
            <h2 className="text-[2.2rem] sm:text-[2.5rem] font-bold text-[#2c3e50] mb-[15px] text-center">
              Our Tracks and Strands
            </h2>

            <p className="text-[#7f8c8d] text-center leading-relaxed">
              Explore our innovative academic pathways designed to equip
              students for the challenges of tomorrow.
            </p>
          </div>

          {/* PROGRAM CARDS */}
          <div className="w-full flex flex-col items-center gap-6">
            {programs.map((program, index) => (
              <div
                key={program.title}
                className="w-full max-w-5xl mx-auto flex flex-col md:flex-row bg-[#e7e7e7] rounded-[10px] overflow-hidden shadow-[0_5px_15px_rgba(0,0,0,0.1)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_15px_30px_rgba(0,0,0,0.15)]"
              >
                <div className="w-full md:w-1/4 min-h-[140px] shrink-0 bg-[#00b900] flex items-center justify-center text-white text-[3rem]">
                  <i
                    className={`fas ${
                      index === 0 ? "fa-laptop-code" : "fa-utensils"
                    }`}
                    aria-hidden="true"
                  ></i>
                </div>

                <div className="w-full md:w-3/4 p-8 md:p-12 flex flex-col items-center justify-center text-center">
                  <h3 className="text-xl font-bold text-black mb-2">
                    {program.title}
                  </h3>

                  <p className="w-full max-w-md mx-auto text-center text-gray-700 mb-4 text-sm leading-relaxed">
                    {program.desc}
                  </p>

                  <Link
                    href="#About-us"
                    className="text-[#d32a00] font-bold text-sm hover:underline"
                  >
                    Learn More →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT SECTION */}
      <section
        id="About-us"
        className="w-full py-20 bg-[#f9f9f9] flex flex-col items-center"
      >
        <div className="w-full max-w-7xl mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-[50px]">
            <div className="flex-1 min-w-0">
              <h2 className="text-[2.2rem] sm:text-[2.5rem] font-bold text-[#2c3e50] mb-5 leading-tight">
                About Saint Gregory College
              </h2>

              <div className="space-y-[15px]">
                <p className="leading-[1.8] text-[#34495e]">
                  Saint Gregory College of Science and Technology began as a
                  college and expanded its offerings as the Philippine K-12
                  education system was implemented. In 2012, the institution
                  transitioned to offering senior high school education.
                </p>

                <p className="leading-[1.8] text-[#34495e]">
                  The institution provides learning opportunities in
                  Information and Communication Technology and hospitality
                  programs, helping students develop practical skills,
                  knowledge, and confidence for their future careers.
                </p>

                <p className="leading-[1.8] text-[#34495e]">
                  Through its commitment to quality education, Saint Gregory
                  College of Science and Technology aims to prepare learners
                  to adapt to modern technology, meet industry needs, and
                  contribute positively to their communities.
                </p>
              </div>

              <div className="mt-[35px] flex flex-wrap justify-around">
                <div className="p-5 text-center">
                  <div className="text-[2.5rem] sm:text-[3rem] font-bold text-[#c5a000]">
                    5,000+
                  </div>
                  <div className="text-base sm:text-[1.1rem] text-[#2c3e50]">
                    Students Graduated
                  </div>
                </div>

                <div className="p-5 text-center">
                  <div className="text-[2.5rem] sm:text-[3rem] font-bold text-[#c5a000]">
                    20+
                  </div>
                  <div className="text-base sm:text-[1.1rem] text-[#2c3e50]">
                    Faculty Members
                  </div>
                </div>

                <div className="p-5 text-center">
                  <div className="text-[2.5rem] sm:text-[3rem] font-bold text-[#c5a000]">
                    17
                  </div>
                  <div className="text-base sm:text-[1.1rem] text-[#2c3e50]">
                    Years of Excellence
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 w-full min-w-0 rounded-[10px] overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.1)]">
              <img
                src="/api/placeholder/600/400"
                alt="Saint Gregory College campus"
                className="w-full h-auto min-h-[250px] object-cover block"
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
