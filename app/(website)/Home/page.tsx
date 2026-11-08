"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AboutSection from "../../-components/AboutSection";
import Reveal from "../../-components/Reveal";

const mission =
  "Saint Gregory College of Science and Technology - Cavite academe envisions itself as the center of academic excellence in Hospitality & Tourism Management which is established to the purpose of molding the mind of the Filipino youth dedicated to the service of country, humanity and God. An academe committed to give high quality standard of HRM/Tourism/ICT education with highly competitive skills and knowledge with this commitment. Saint Gregory College of Science and Technology - Cavite aims to develop and produce graduates with timely and best teaching methods that answer the needs of our modern learners. In accordance with this mission, SGCST-Cavite binds itself to the highest standard of dedication, integrity and competency.";

const vision =
  "In solidarity with our people, Saint Gregory College of Science and Technology-Cavite scatto the constitutional mandate of educating the youth by providing knowledge about competitive skills and modern technology that may effect personal and social changes and will achieve success for the future.";

const programs = {
  "Information and Communication Technology":
    "Objectives: Develop practical skills in computer programming and computer hardware servicing.",
  "Home Economics":
    "Develop practical skills in food preparation, home management, nutrition, and related livelihood opportunities.",
};

function MissionIcon() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" className="h-36 w-36 sm:h-44 sm:w-44" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="21" cy="27" r="16" /><circle cx="21" cy="27" r="10" /><circle cx="21" cy="27" r="4" />
      <path d="M21 27 38 10m-8 0h8v8M31 17l5 5" />
    </svg>
  );
}

function VisionIcon() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" className="h-36 w-36 sm:h-44 sm:w-44" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 24s7-12 21-12 21 12 21 12-7 12-21 12S3 24 3 24Z" />
      <circle cx="24" cy="24" r="7" /><path d="M24 2v5M24 41v5M7 7l4 4M37 37l4 4M41 7l-4 4M11 37l-4 4" />
    </svg>
  );
}

export default function Home() {
  const [selectedStatement, setSelectedStatement] = useState<"Mission" | "Vision" | keyof typeof programs | null>(null);
  const [admissionButtonEnabled, setAdmissionButtonEnabled] = useState<boolean>(false);

  // Fetch configuration on mount to determine if admission button should display
  useEffect(() => {
    async function fetchConfig() {
      try {
        const response = await fetch("/api/portal/admin?table=configuration"); // Replace with your actual route path (e.g., /api/settings)
        if (response.ok) {
          const configData = await response.json();
          setAdmissionButtonEnabled(Boolean(configData.admission_button));
        }
      } catch (error) {
        console.error("Failed to fetch site configuration:", error);
      }
    }

    fetchConfig();
  }, []);

  useEffect(() => {
    if (!selectedStatement) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedStatement(null);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedStatement]);

  const selectedText = selectedStatement
    ? selectedStatement === "Mission"
      ? mission
      : selectedStatement === "Vision"
        ? vision
        : programs[selectedStatement]
    : "";

  return (
    <div className="overflow-hidden bg-[#F8F9FA] text-center text-[#0D2B45]">
      {/* Hero banner: the site's existing global navigation stays in its layout. */}
      <section
        id="Home"
        className="scroll-mt-24 relative flex min-h-[470px] items-center justify-start overflow-hidden bg-cover bg-[center_38%] px-5 py-10 text-left text-white sm:min-h-[540px] sm:px-10 lg:min-h-[600px] lg:px-[7%]"
        style={{
          backgroundImage: "url('/sgcst-hero-background.png')",
          backgroundSize: "cover",
          backgroundPosition: "center center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <Reveal direction="left">
          <div className="relative z-10 mx-auto flex w-full max-w-[1280px] justify-start">
            <div className="w-full max-w-[610px] text-left">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.12em] text-[#ffc629] sm:text-sm sm:tracking-[0.22em]">
                Saint Gregory College of Science and Technology
              </p>
              <h1 className="mb-4 text-3xl font-extrabold leading-[1.08] tracking-tight drop-shadow-md sm:text-4xl lg:text-[2.75rem]">
                Excellence in Science and Technology Education
              </h1>
              <p className="mb-5 max-w-[560px] text-sm leading-6 text-white/95 sm:text-base sm:leading-7">
                Saint Gregory College of Science and Technology is dedicated to
                providing world-class education that prepares students for
                successful careers in science, technology, engineering, and
                mathematics.
              </p>

              {/* Conditionally render Apply Now button based on admission_button state */}
              {admissionButtonEnabled && (
                <Link
                  href="/admission/registration"
                  className="inline-flex min-h-14 min-w-[190px] cursor-pointer items-center justify-center rounded-full border-2 border-white/80 bg-[#FFC107] px-9 py-4 text-base font-extrabold text-[#082B49] shadow-[0_8px_24px_rgba(0,0,0,0.35)] transition-[transform,background-color,color,box-shadow] duration-300 ease-in-out hover:-translate-y-0.5 hover:bg-[#008A3D] hover:text-white hover:shadow-[0_6px_14px_rgba(0,138,61,0.32)] focus:outline-none focus-visible:ring-4 focus-visible:ring-white/70 motion-reduce:transition-none sm:text-lg"
                >
                  Apply Now!
                </Link>
              )}
            </div>
          </div>
        </Reveal>
        <a
          href="#News"
          aria-label="Scroll to Mission and Vision"
          onClick={(event) => {
            event.preventDefault();
            document.getElementById("News")?.scrollIntoView({
              behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
            });
          }}
          className="group absolute bottom-0 left-1/2 z-10 hidden -translate-x-1/2 rounded-full px-3 py-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ffc629] focus-visible:ring-offset-2 focus-visible:ring-offset-[#173954] md:block"
        >
          <span className="relative block h-12 w-px overflow-hidden bg-white/15">
            <span className="absolute left-0 top-0 block h-4 w-full animate-[scroll-down_1.3s_ease-in-out_infinite] bg-white/45 transition-colors duration-300 group-hover:bg-[#ffc629]/60 motion-reduce:animate-none" />
          </span>
        </a>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-5 bg-[#FF7900] sm:h-6 [clip-path:polygon(0_0,18%_100%,42%_90%,66%_65%,82%_70%,100%_0,100%_100%,0_100%)]" />
      </section>

      {/* Mission & Vision */}
      <section
        id="News"
        className="scroll-mt-24 relative isolate overflow-hidden bg-[radial-gradient(ellipse_at_15%_0%,rgba(255,193,7,0.10),transparent_34%),linear-gradient(180deg,#FFFCF5_0%,#FAFBFD_55%,#F7FAFF_100%)] px-4 pb-10 pt-8 sm:px-8 sm:pb-12 sm:pt-10"
      >
        {/* Rest of your existing components remain unchanged */}
      </section>
    </div>
  );
}