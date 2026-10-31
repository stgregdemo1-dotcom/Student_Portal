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
          backgroundImage: "url('/images/sgcst-hero-background.png')",
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
              <Link
                href="/admission/registration"
                className="inline-flex min-h-14 min-w-[190px] cursor-pointer items-center justify-center rounded-full border-2 border-white/80 bg-[#FFC107] px-9 py-4 text-base font-extrabold text-[#082B49] shadow-[0_8px_24px_rgba(0,0,0,0.35)] transition-[transform,background-color,color,box-shadow] duration-300 ease-in-out hover:-translate-y-0.5 hover:bg-[#008A3D] hover:text-white hover:shadow-[0_6px_14px_rgba(0,138,61,0.32)] focus:outline-none focus-visible:ring-4 focus-visible:ring-white/70 motion-reduce:transition-none sm:text-lg"
              >
                Apply Now!
              </Link>
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
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-0 top-12 h-24 w-24 opacity-40 sm:left-4 sm:top-16 sm:h-32 sm:w-32"
          style={{
            backgroundImage: "radial-gradient(#E9A300 1.5px, transparent 1.5px)",
            backgroundSize: "13px 13px",
            maskImage: "linear-gradient(135deg, black, transparent 78%)",
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-0 top-12 h-24 w-24 opacity-35 sm:right-4 sm:top-16 sm:h-32 sm:w-32"
          style={{
            backgroundImage: "radial-gradient(#E9A300 1.5px, transparent 1.5px)",
            backgroundSize: "13px 13px",
            maskImage: "linear-gradient(225deg, black, transparent 78%)",
          }}
        />
        <div aria-hidden="true" className="pointer-events-none absolute -left-20 -top-24 h-52 w-52 rounded-full bg-[#FFC107]/[0.07]" />
        <div className="relative z-10 mx-auto max-w-[1145px] text-center">
          <Reveal direction="left">
            <div className="mb-5 text-center sm:mb-6">
              <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.2em] text-[#c88900]">Our Foundation</p>
              <h2 className="text-3xl font-extrabold tracking-tight text-[#0D2B45] sm:text-4xl">Mission &amp; Vision</h2>
              <div className="mx-auto mt-4 h-1 w-14 rounded-full bg-[#FFC107]" />
              <p className="mt-4 text-sm font-medium text-[#526174]">
                Tap or click either card to read the full statement.
              </p>
            </div>
          </Reveal>

          <div className="mx-auto grid grid-cols-1 items-stretch gap-3 md:grid-cols-2 md:gap-4">
            <Reveal direction="left">
            <article
              role="button"
              tabIndex={0}
              aria-haspopup="dialog"
              onClick={() => setSelectedStatement("Mission")}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  setSelectedStatement("Mission");
                }
              }}
              className="group relative flex min-h-[170px] h-full w-full cursor-pointer items-start gap-3 overflow-hidden rounded-xl border border-[#F0E6CC] bg-white p-4 text-left text-[#0D2B45] shadow-[0_8px_24px_rgba(13,43,69,0.09)] transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_14px_30px_rgba(13,43,69,0.14)] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#FFC107] motion-reduce:transition-none sm:min-h-[185px] sm:gap-4 sm:p-5"
            >
              <div aria-hidden="true" className="pointer-events-none absolute -left-1 -top-1 h-16 w-20 rounded-br-[2rem] rounded-tl-xl bg-[#FF7900] [clip-path:polygon(0_0,100%_0,35%_18%,0_72%)]" />
              <div aria-hidden="true" className="pointer-events-none absolute bottom-0 right-0 h-20 w-24 text-[#FFC107]/20 [&>svg]:h-full [&>svg]:w-full">
                <MissionIcon />
              </div>
              <div className="relative z-10 mt-1 flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#FFF0B8] text-[#0D2B45] sm:h-[68px] sm:w-[68px] [&>svg]:h-8 [&>svg]:w-8">
                <MissionIcon />
              </div>
              <div className="relative z-10 min-w-0 flex-1 py-1">
                <h3 className="text-xl font-extrabold text-[#0D2B45] sm:text-2xl">Our Mission</h3>
                <p className="mt-2 line-clamp-3 max-w-xl text-sm leading-5 text-[#526174] sm:text-[0.95rem] sm:leading-6">{mission}</p>
                <span className="mt-3 inline-flex min-h-9 items-center gap-2 rounded-full bg-[#FFC107] px-4 text-xs font-bold text-[#082B49] shadow-sm transition-[transform,background-color,color,box-shadow] duration-300 ease-in-out group-hover:-translate-y-0.5 group-hover:bg-[#008A3D] group-hover:text-white group-hover:shadow-[0_5px_12px_rgba(0,138,61,0.28)] group-focus-visible:bg-[#008A3D] group-focus-visible:text-white motion-reduce:transition-none">
                  Read Full Mission <span aria-hidden="true" className="inline-block transition-transform duration-300 ease-in-out group-hover:translate-x-1 motion-reduce:transition-none">→</span>
                </span>
              </div>
            </article>
            </Reveal>
            <Reveal direction="right">
            <article
              role="button"
              tabIndex={0}
              aria-haspopup="dialog"
              onClick={() => setSelectedStatement("Vision")}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  setSelectedStatement("Vision");
                }
              }}
              className="group relative flex min-h-[190px] h-full w-full cursor-pointer items-start gap-4 overflow-hidden rounded-2xl border border-[#DCE7F2] bg-[linear-gradient(120deg,#F0F6FC_0%,#FFFFFF_72%)] p-5 text-left text-[#0D2B45] shadow-[0_10px_28px_rgba(13,43,69,0.08)] transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_16px_34px_rgba(13,43,69,0.13)] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#183B56]/25 motion-reduce:transition-none sm:min-h-[205px] sm:gap-5 sm:p-6"
            >
              <div aria-hidden="true" className="pointer-events-none absolute -left-1 -top-1 h-16 w-20 rounded-br-[2rem] rounded-tl-xl bg-[#0D2B45] [clip-path:polygon(0_0,100%_0,35%_18%,0_72%)]" />
              <div aria-hidden="true" className="pointer-events-none absolute bottom-0 right-0 h-20 w-24 text-[#0D2B45]/10 [&>svg]:h-full [&>svg]:w-full">
                <VisionIcon />
              </div>
              <div className="relative z-10 mt-1 flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#DCEAF7] text-[#0D2B45] sm:h-[68px] sm:w-[68px] [&>svg]:h-8 [&>svg]:w-8">
                <VisionIcon />
              </div>
              <div className="relative z-10 min-w-0 flex-1 py-1">
                <h3 className="text-xl font-extrabold text-[#0D2B45] sm:text-2xl">Our Vision</h3>
                <p className="mt-2 line-clamp-3 max-w-xl text-sm leading-5 text-[#526174] sm:text-[0.95rem] sm:leading-6">{vision}</p>
                <span className="mt-3 inline-flex min-h-9 items-center gap-2 rounded-full bg-[#082B49] px-4 text-xs font-bold text-white shadow-sm transition-[transform,background-color,color,box-shadow] duration-300 ease-in-out group-hover:-translate-y-0.5 group-hover:bg-[#008A3D] group-hover:text-white group-hover:shadow-[0_5px_12px_rgba(0,138,61,0.28)] group-focus-visible:bg-[#008A3D] group-focus-visible:text-white motion-reduce:transition-none">
                  Read Full Vision <span aria-hidden="true" className="inline-block transition-transform duration-300 ease-in-out group-hover:translate-x-1 motion-reduce:transition-none">→</span>
                </span>
              </div>
            </article>
          </Reveal>
          </div>
        </div>
      </section>

      {selectedStatement && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4"
          onClick={() => setSelectedStatement(null)}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="statement-dialog-title"
            className="relative max-h-[calc(100dvh-1.5rem)] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-5 text-center shadow-2xl sm:max-h-[85vh] sm:p-10"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedStatement(null)}
              aria-label="Close popup"
              className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full text-2xl text-[#34495e] transition-[transform,background-color,color,box-shadow] duration-300 ease-in-out hover:-translate-y-0.5 hover:bg-[#082B49] hover:text-white hover:shadow-[0_5px_12px_rgba(8,43,73,0.28)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7900] motion-reduce:transition-none"
            >
              &times;
            </button>
            <div className="mx-auto mb-4 h-[5px] w-14 rounded-full bg-[#e9a300]" />
            <h2 id="statement-dialog-title" className="mb-5 px-8 text-2xl font-extrabold text-[#173954] sm:px-0 sm:text-3xl">
              {selectedStatement}
            </h2>
            {selectedStatement === "Information and Communication Technology" ? (
              <div className="text-left text-[#243d55]">
                <p className="mb-5 text-base leading-7 sm:text-lg sm:leading-8">
                  The ICT program builds students&apos; knowledge and hands-on skills in digital technology, preparing them to solve problems and pursue technology-related careers.
                </p>
                <ul className="list-disc space-y-2 pl-6 text-base leading-7 sm:text-lg sm:leading-8">
                  <li>Computer Programming</li>
                  <li>Computer Hardware Servicing</li>
                </ul>
              </div>
            ) : selectedStatement === "Home Economics" ? (
              <div className="text-left text-[#243d55]">
                <p className="mb-5 text-base leading-7 sm:text-lg sm:leading-8">
                  The Home Economics program develops practical skills for careers in hospitality, tourism, food service, and related fields.
                </p>
                <ul className="list-disc space-y-2 pl-6 text-base leading-7 sm:text-lg sm:leading-8">
                  <li>Food and Beverages</li>
                  <li>Travel Services</li>
                  <li>Front Office Services</li>
                  <li>House Keeping</li>
                  <li>Bread and Pastry Production</li>
                  <li>Tour Guiding Servicing</li>
                  <li>Bartending</li>
                  <li>Cookery</li>
                </ul>
              </div>
            ) : (
              <p className="text-justify text-base leading-7 text-[#243d55] sm:text-lg sm:leading-8">{selectedText}</p>
            )}
          </section>
        </div>
      )}

      <section
        id="Programs"
        className="relative isolate scroll-mt-24 overflow-hidden bg-[radial-gradient(ellipse_at_8%_46%,rgba(255,193,7,0.08),transparent_28%),radial-gradient(ellipse_at_92%_64%,rgba(71,153,220,0.08),transparent_30%),linear-gradient(180deg,#F7FAFF_0%,#FFFCF5_52%,#FFFCF5_100%)] px-0 pt-8 sm:pt-10"
      >
        <div aria-hidden="true" className="pointer-events-none absolute -left-20 top-24 h-52 w-52 rounded-full bg-[#FFC107]/[0.08] sm:h-64 sm:w-64" />
        <div aria-hidden="true" className="pointer-events-none absolute -right-20 top-44 h-52 w-52 rounded-full bg-[#B9D9FF]/[0.18] sm:h-64 sm:w-64" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-24 left-[38%] hidden h-56 w-56 rotate-45 bg-[#E4F0FF]/60 lg:block" />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-5 top-10 h-16 w-16 opacity-50 sm:left-10 sm:top-12 sm:h-20 sm:w-20"
          style={{ backgroundImage: "radial-gradient(#E9A300 1.5px, transparent 1.5px)", backgroundSize: "14px 14px" }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-5 top-10 h-16 w-16 opacity-50 sm:right-10 sm:top-12 sm:h-20 sm:w-20"
          style={{ backgroundImage: "radial-gradient(#E9A300 1.5px, transparent 1.5px)", backgroundSize: "14px 14px" }}
        />
        <div className="relative z-10 mx-auto max-w-[1145px] px-4 text-center sm:px-8">
          <Reveal direction="left">
            <div className="mb-6 text-center sm:mb-7">
              <p className="mb-2 text-sm font-extrabold uppercase tracking-[0.2em] text-[#c88900]">Our Programs</p>
              <h2 className="text-3xl font-extrabold tracking-tight text-[#0D2B45] sm:text-4xl lg:text-[2.5rem]">Explore Our Academic Programs</h2>
              <div className="mx-auto mt-4 h-1 w-14 rounded-full bg-[#FFC107]" />
              <p className="mx-auto mt-4 max-w-2xl leading-7 text-[#526174]">Discover programs designed to build practical skills and prepare you for future opportunities.</p>
            </div>
          </Reveal>
        </div>
        <div className="relative z-10 mx-auto grid max-w-[1200px] gap-4 px-4 pb-10 sm:px-6 lg:px-8">
          <Reveal direction="left">
            <article
              role="button"
              tabIndex={0}
              aria-haspopup="dialog"
              onClick={() => setSelectedStatement("Information and Communication Technology")}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  setSelectedStatement("Information and Communication Technology");
                }
              }}
              className="group relative grid min-h-[390px] w-full cursor-pointer grid-cols-1 overflow-hidden rounded-2xl bg-[#FFC107] text-left shadow-[0_12px_30px_rgba(16,38,56,0.12)] transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[0_18px_38px_rgba(16,38,56,0.18)] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#FFC107] motion-reduce:transition-none md:min-h-[250px] md:grid-cols-2 lg:min-h-[270px]"
            >
              <div className="relative min-h-[190px] overflow-hidden md:min-h-full md:[clip-path:polygon(0_0,100%_0,96%_100%,0_100%)]">
                <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-in-out group-hover:scale-[1.03] motion-reduce:transition-none" style={{ backgroundImage: "url('/comlab.png')" }} aria-hidden="true" />
              </div>
              <div className="relative flex flex-col justify-center overflow-hidden bg-[linear-gradient(135deg,#EEF6FF_0%,#F7FBFF_100%)] p-5 sm:p-7 md:-ml-2 md:pl-8 lg:p-8 lg:pl-10">
                <div aria-hidden="true" className="pointer-events-none absolute -right-6 top-1/2 hidden -translate-y-1/2 text-[#B9D9FF]/60 md:block">
                  <svg viewBox="0 0 100 80" className="h-28 w-36" fill="none" stroke="currentColor" strokeWidth="4">
                    <rect x="10" y="8" width="80" height="52" rx="5" /><path d="M37 73h26M50 60v13M22 22h45" />
                  </svg>
                </div>
                <div aria-hidden="true" className="relative mb-3 h-1 w-9 rounded-full bg-[#FFC107]" />
                <h3 className="relative max-w-[34rem] text-2xl font-extrabold leading-tight text-[#0D2B45] sm:text-3xl">Information and Communication Technology</h3>
                <p className="relative mt-3 max-w-xl text-sm leading-6 text-[#344B63] sm:text-base">Develop practical skills in computer programming and computer hardware servicing.</p>
                <span className="relative mt-4 inline-flex min-h-10 w-fit items-center gap-3 rounded-full bg-[#FFC107] px-6 text-sm font-extrabold text-[#082B49] shadow-sm transition-[transform,background-color,color,box-shadow] duration-300 ease-in-out group-hover:-translate-y-0.5 group-hover:bg-[#082B49] group-hover:text-white group-hover:shadow-[0_5px_12px_rgba(8,43,73,0.28)] motion-reduce:transition-none">
                  Learn More <span aria-hidden="true" className="inline-block transition-transform duration-300 ease-in-out group-hover:translate-x-1 motion-reduce:transition-none">→</span>
                </span>
              </div>
            </article>
          </Reveal>

          <Reveal direction="right">
            <article
              role="button"
              tabIndex={0}
              aria-haspopup="dialog"
              onClick={() => setSelectedStatement("Home Economics")}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  setSelectedStatement("Home Economics");
                }
              }}
              className="group relative grid min-h-[390px] w-full cursor-pointer grid-cols-1 overflow-hidden rounded-2xl bg-[#FFC107] text-left shadow-[0_12px_30px_rgba(16,38,56,0.12)] transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[0_18px_38px_rgba(16,38,56,0.18)] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#FFC107] motion-reduce:transition-none md:min-h-[250px] md:grid-cols-2 lg:min-h-[270px]"
            >
              <div className="relative order-1 min-h-[190px] overflow-hidden md:order-2 md:min-h-full md:[clip-path:polygon(4%_0,100%_0,100%_100%,0_100%)]">
                <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-in-out group-hover:scale-[1.03] motion-reduce:transition-none" style={{ backgroundImage: "url('/hm.jpg')" }} aria-hidden="true" />
              </div>
              <div className="relative order-2 flex flex-col justify-center overflow-hidden bg-[linear-gradient(135deg,#FFFCF5_0%,#FFF5E3_100%)] p-5 sm:p-7 md:order-1 md:pr-8 lg:p-8 lg:pr-10">
                <div aria-hidden="true" className="pointer-events-none absolute -left-5 top-1/2 hidden -translate-y-1/2 text-[#FFE0A6]/70 md:block">
                  <svg viewBox="0 0 100 100" className="h-28 w-28" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M50 10c-17 0-27 12-27 27v25h54V37c0-15-10-27-27-27Zm-27 42H13c-8 0-10 11-2 15l18 8m48-23h10c8 0 10 11 2 15l-18 8M35 86h30" />
                  </svg>
                </div>
                <div aria-hidden="true" className="relative mb-3 h-1 w-9 rounded-full bg-[#FFC107]" />
                <h3 className="relative max-w-[34rem] text-2xl font-extrabold leading-tight text-[#0D2B45] sm:text-3xl">Home Economics</h3>
                <p className="relative mt-3 max-w-xl text-sm leading-6 text-[#344B63] sm:text-base">Build practical skills in food preparation, home management, hospitality, and related services.</p>
                <span className="relative mt-4 inline-flex min-h-10 w-fit items-center gap-3 rounded-full bg-[#FFC107] px-6 text-sm font-extrabold text-[#082B49] shadow-sm transition-[transform,background-color,color,box-shadow] duration-300 ease-in-out group-hover:-translate-y-0.5 group-hover:bg-[#082B49] group-hover:text-white group-hover:shadow-[0_5px_12px_rgba(8,43,73,0.28)] motion-reduce:transition-none">
                  Learn More <span aria-hidden="true" className="inline-block transition-transform duration-300 ease-in-out group-hover:translate-x-1 motion-reduce:transition-none">→</span>
                </span>
              </div>
            </article>
          </Reveal>
        </div>
      </section>

      <AboutSection />

      <section
        className="relative scroll-mt-24 overflow-hidden bg-[radial-gradient(ellipse_at_50%_0%,rgba(255,193,7,0.18),transparent_62%),radial-gradient(ellipse_at_0%_100%,rgba(255,193,7,0.10),transparent_30%),linear-gradient(180deg,#FFF9E8_0%,#FFFCF5_58%,#FFFCF5_100%)] px-4 py-10 sm:px-8 sm:py-12 lg:py-14"
        id="Why-Choose"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "linear-gradient(135deg, transparent 0 48%, rgba(235,174,30,.08) 48% 52%, transparent 52%), linear-gradient(45deg, transparent 0 48%, rgba(235,174,30,.06) 48% 52%, transparent 52%)",
            backgroundSize: "220px 220px",
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 w-28 opacity-55 sm:w-48"
          style={{
            backgroundImage: "radial-gradient(#E9A300 1.4px, transparent 1.4px)",
            backgroundSize: "13px 13px",
            maskImage: "linear-gradient(90deg, black, transparent)",
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 w-28 opacity-55 sm:w-48"
          style={{
            backgroundImage: "radial-gradient(#E9A300 1.4px, transparent 1.4px)",
            backgroundSize: "13px 13px",
            maskImage: "linear-gradient(270deg, black, transparent)",
          }}
        />
        <div className="relative mx-auto max-w-[1200px]">
          <Reveal>
          <div className="mx-auto mb-6 max-w-2xl text-center sm:mb-7">
            <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.2em] text-[#D89B00]">
              Why Choose SGCST?
            </p>
            <h2 className="text-3xl font-extrabold tracking-tight text-[#0D2B45] sm:text-4xl">
              A Better Future Starts Here
            </h2>
            <div className="mx-auto mt-4 h-1 w-14 rounded-full bg-[#FFC107]" />
          </div>
          </Reveal>
          <div className="grid auto-rows-fr gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
            {[
              { title: "Quality Education", description: "Build a strong foundation through dedicated teaching and academic support.", icon: "book" },
              { title: "Practical Learning", description: "Develop hands-on skills through ICT and hospitality learning opportunities.", icon: "computer" },
              { title: "Student Development", description: "Grow your knowledge, confidence, and readiness for future challenges.", icon: "people" },
              { title: "Career Opportunities", description: "Prepare for meaningful careers with practical and relevant skills.", icon: "career" },
            ].map((feature) => (
              <Reveal key={feature.title}>
              <article
                className="group flex h-full min-h-[190px] flex-col items-center rounded-xl border-b-4 border-[#FF7900] bg-white px-4 py-4 text-center shadow-[0_8px_24px_rgba(13,43,69,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_14px_30px_rgba(13,43,69,0.14)] motion-reduce:transition-none"
              >
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#FFF1C2] text-[#0D2B45] transition-colors duration-300 group-hover:bg-[#FFE69A]">
                  {feature.icon === "book" ? (
                    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5v-16Z" /><path d="M4 17.5A2.5 2.5 0 0 1 6.5 15H20M8 7h8m-8 4h8" /></svg>
                  ) : feature.icon === "computer" ? (
                    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="13" rx="2" /><path d="M8 21h8m-4-4v4M7 8h10m-10 4h6" /></svg>
                  ) : feature.icon === "people" ? (
                    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="8" r="3" /><path d="M3.5 20v-1.5A5.5 5.5 0 0 1 9 13h0a5.5 5.5 0 0 1 5.5 5.5V20M16 5.3a3 3 0 0 1 0 5.8M17 13.2a5 5 0 0 1 3.5 4.8v1" /></svg>
                  ) : (
                    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20h16M6 17V9m4 8V5m4 12v-6m4 6V3" /><path d="m4 7 6-4 5 3 5-4" /></svg>
                  )}
                </div>
                <h3 className="flex min-h-11 items-center justify-center text-base font-extrabold text-[#0D2B45] sm:text-lg">
                  {feature.title}
                </h3>
                <p className="mt-2 max-w-[280px] flex-1 text-sm leading-6 text-[#526174]">
                  {feature.description}
                </p>
              </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
