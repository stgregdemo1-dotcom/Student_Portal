"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface ConfigData {
  admission_button?: boolean | string[] | string;
}

export default function Home() {
  const [isAdmissionEnabled, setIsAdmissionEnabled] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch("/api/portal/admin?table=configuration");
        if (!res.ok) return;

        const data = await res.json();

        // Safely extract admission_button from object or array response
        const configObj: ConfigData = Array.isArray(data) ? data[0] : data;
        const val = configObj?.admission_button;

        // Handle raw boolean, legacy string, or array formats safely
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

  return (
    <>
      <section
        id="Home"
        className="h-[70vh] flex items-center justify-center text-white text-center bg-cover bg-center"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,0,0,0.514), rgba(0,0,0,0.5)), url('https://placehold.co/1200x600')",
        }}
      >
        <div className="max-w-[700px] mx-auto px-5">
          <h2 className="text-[3rem] font-bold mb-4 drop-shadow-lg leading-tight">
            Excellence in Science and Technology Education
          </h2>

          <p className="text-[1.1rem] mb-8 drop-shadow-md opacity-90">
            Saint Gregory College of Science and Technology is dedicated to
            providing world-class education that prepares students for
            successful careers in science, technology, engineering, and
            mathematics.
          </p>

          {/* Render "Apply Now!" only when explicitly enabled */}
          {!loading && isAdmissionEnabled && (
            <Link
              href="/admission/registration"
              className="mt-8 inline-flex items-center justify-center bg-yellow-400 text-[#2c3e50] h-[45px] min-w-[150px] px-8 rounded-full font-bold text-[1rem] leading-none transition-all duration-300 hover:bg-yellow-500 hover:-translate-y-0.5 hover:shadow-lg shadow-sm"
            >
              Apply Now!
            </Link>
          )}
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section id="News" className="py-16 bg-[rgb(250,250,250)] px-6 flex flex-col items-center">
        {/* Title Container */}
        <div className="text-center mb-10">
          <h2 className="text-[2.2rem] font-bold text-[#2c3e50] mb-3">
            Mission & Vision
          </h2>
        </div>

        <div className="w-full max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-16">
          {[
            {
              title: "Mission",
              desc: "Starting on June 23, 2026, The Admission is officially open.",
            },
            {
              title: "Vision",
              desc: "Explore the wonders of life through hands-on laboratory experiences.",
            },
          ].map((item, index) => (
            <div
              key={index}
              className="bg-[rgb(231,231,231)] rounded-[10px] overflow-hidden shadow-sm transition transform hover:-translate-y-1 hover:shadow-lg flex flex-col"
            >
              <div className="h-[140px] bg-green-500 flex items-center justify-center text-white text-4xl">
                <i className={`fas ${index === 0 ? "fa-bullseye" : "fa-eye"}`}></i>
              </div>

              <div className="p-6 text-center flex flex-col items-center justify-center">
                <h3 className="text-[1.3rem] font-bold mb-2 text-black">
                  {item.title}
                </h3>
                <p className="text-gray-800 text-sm leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}