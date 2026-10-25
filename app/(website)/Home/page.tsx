"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

function Reveal({
  children,
  direction = "left",
}: {
  children: React.ReactNode;
  direction?: "left" | "right";
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [element, setElement] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!element) return;

    if (typeof window.IntersectionObserver !== "function") {
      const frame = window.requestAnimationFrame(() => setIsVisible(true));
      return () => window.cancelAnimationFrame(frame);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.12 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [element]);

  return (
    <div
      ref={setElement}
      className={`transition-[opacity,translate] duration-700 ease-out motion-reduce:duration-300 ${
        isVisible
          ? "translate-x-0 opacity-100"
          : direction === "left"
            ? "-translate-x-16 opacity-0 motion-reduce:-translate-x-8"
            : "translate-x-16 opacity-0 motion-reduce:translate-x-8"
      }`}
    >
      {children}
    </div>
  );
}

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
    <div className="overflow-hidden bg-[#faf9f5] text-center">
      {/* Hero banner: the site's existing global navigation stays in its layout. */}
      <section
        id="Home"
        className="relative flex min-h-[460px] items-center justify-center bg-cover bg-center px-4 py-12 text-center text-white sm:min-h-[560px] sm:px-10 sm:py-14 lg:min-h-[600px] lg:px-[9%]"
        style={{
          backgroundImage:
            "linear-gradient(90deg, rgba(5,30,48,.88) 0%, rgba(5,30,48,.67) 48%, rgba(5,30,48,.38) 100%), url('https://scontent.fcrk3-3.fna.fbcdn.net/v/t1.15752-9/829406177_1938597277545802_2860480563625807303_n.jpg?_nc_cat=106&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=9f807c&_nc_ohc=nSa7oE_9IIkQ7kNvwEVNOeY&_nc_oc=AdplMu7yOzav7X0zsp3EcgIUHtBTSFiztGiHsRVqlBdjR2eaLTBBbK2q6dLGBjnIzME&_nc_zt=23&_nc_ht=scontent.fcrk3-3.fna&_nc_ss=7b2a8&oh=03_Q7cD6gH6HKuXVJE-NFdnmn-uN2wEaTrcaxkrc5ZFFqyABvawtg&oe=6AE87494')",
        }}
      >
        <Reveal direction="left">
          <div className="relative z-10 mx-auto flex w-full max-w-[1180px] justify-center">
            <div className="mx-auto w-full max-w-[650px] text-center">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.12em] text-[#ffc629] sm:text-sm sm:tracking-[0.22em]">Saint Gregory College of Science and Technology</p>
            <h1 className="mb-5 text-3xl font-extrabold leading-[1.08] tracking-tight drop-shadow-md sm:text-5xl lg:text-[3.25rem]">
              Excellence in Science and Technology Education
            </h1>
            <p className="mx-auto mb-7 max-w-[620px] text-base leading-7 text-white/95 sm:text-lg">
              Saint Gregory College of Science and Technology is dedicated to providing world-class education that prepares students for successful careers in science, technology, engineering, and mathematics.
            </p>
            <Link
              href="/admission/registration"
              className="inline-flex min-h-[56px] min-w-[190px] cursor-pointer items-center justify-center gap-3 rounded-full bg-[#ffc20e] px-9 py-4 text-lg font-extrabold text-[#172f45] shadow-lg transition duration-300 hover:-translate-y-1 hover:bg-[#14853b] hover:text-white hover:shadow-xl focus:outline-none focus-visible:ring-4 focus-visible:ring-[#14853b]/50"
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
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-5 bg-[#e9a300] [clip-path:polygon(0_0,18%_100%,42%_90%,66%_65%,82%_70%,100%_0,100%_100%,0_100%)]" />
      </section>

      {/* Mission & Vision */}
      <section id="News" className="relative px-4 pb-12 pt-8 sm:px-8 sm:pb-20 sm:pt-12">
        <div className="relative z-10 mx-auto max-w-[1145px] text-center">
          <Reveal direction="left">
            <div className="mb-8 text-center sm:mb-10">
              <div className="mx-auto mb-4 h-[5px] w-14 rounded-full bg-[#e9a300]" />
              <h2 className="text-3xl font-extrabold tracking-tight text-[#173954] sm:text-4xl">Mission &amp; Vision</h2>
              <div className="mx-auto mt-3 h-[3px] w-16 bg-[#e9a300]" />
            </div>
          </Reveal>

          <div className="mx-auto grid grid-cols-1 items-stretch gap-6 md:grid-cols-2 md:gap-8">
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
              className="group relative flex min-h-[280px] h-full w-full cursor-pointer flex-col items-center rounded-xl bg-white px-5 py-6 text-center text-[#173954] shadow-[0_12px_35px_rgba(30,40,30,0.10)] ring-1 ring-black/[0.04] transition-all duration-500 ease-out hover:scale-[1.02] hover:bg-[#e69e03] hover:ring-2 hover:ring-[#e69e03] hover:shadow-xl focus:outline-none focus-visible:ring-4 focus-visible:ring-[#e9a300] motion-reduce:transition-none sm:min-h-[340px] sm:px-6 sm:py-8"
            >
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-[#14853b]/10 transition-all duration-500 ease-out group-hover:scale-110 group-hover:text-white/20 [&>svg]:h-40 [&>svg]:w-40 sm:[&>svg]:h-48 sm:[&>svg]:w-48">
                <MissionIcon />
              </div>
              <h3 className="relative text-2xl font-extrabold text-[#173954] transition-colors duration-500 ease-out group-hover:text-white sm:text-4xl">Mission</h3>
              <p className="relative mt-4 min-h-[6rem] max-w-xl line-clamp-4 text-sm leading-6 text-[#243d55] transition-colors duration-500 ease-out group-hover:text-white sm:text-base sm:leading-6">{mission}</p>
              <span className="relative mt-auto pt-4 text-sm font-bold text-[#14853b] transition-colors duration-500 ease-out group-hover:text-white">Click to view full mission</span>
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
              className="group relative flex min-h-[280px] h-full w-full cursor-pointer flex-col items-center rounded-xl bg-white px-5 py-6 text-center text-[#173954] shadow-[0_12px_35px_rgba(30,40,30,0.10)] ring-1 ring-black/[0.04] transition-all duration-500 ease-out hover:scale-[1.02] hover:bg-[#14853b] hover:ring-2 hover:ring-[#14853b] hover:shadow-xl focus:outline-none focus-visible:ring-4 focus-visible:ring-[#e9a300] motion-reduce:transition-none sm:min-h-[340px] sm:px-6 sm:py-8"
            >
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-[#14853b]/10 transition-all duration-500 ease-out group-hover:scale-110 group-hover:text-white/20 [&>svg]:h-40 [&>svg]:w-40 sm:[&>svg]:h-48 sm:[&>svg]:w-48">
                <VisionIcon />
              </div>
              <h3 className="relative text-2xl font-extrabold text-[#173954] transition-colors duration-500 ease-out group-hover:text-white sm:text-4xl">Vision</h3>
              <p className="relative mt-4 min-h-[6rem] max-w-xl line-clamp-4 text-sm leading-6 text-[#243d55] transition-colors duration-500 ease-out group-hover:text-white sm:text-base sm:leading-6">{vision}</p>
              <span className="relative mt-auto pt-4 text-sm font-bold text-[#14853b] transition-colors duration-500 ease-out group-hover:text-white">Click to view full vision</span>
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
              className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full text-2xl text-[#34495e] transition hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#14853b]"
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

      {/* Programs section added to the homepage, using the existing green and gold theme. */}
      <section id="Programs" className="relative bg-[#faf9f5] px-4 py-12 sm:px-8 sm:py-20">
        <div className="pointer-events-none absolute inset-0 opacity-50" style={{ backgroundImage: "linear-gradient(135deg, transparent 0 48%, rgba(235,174,30,.08) 48% 52%, transparent 52%), linear-gradient(45deg, transparent 0 48%, rgba(235,174,30,.06) 48% 52%, transparent 52%)", backgroundSize: "220px 220px" }} />
        <div className="relative z-10 mx-auto max-w-[1145px] text-center">
          <Reveal direction="left">
            <div className="mb-8 text-center sm:mb-10">
              <p className="mb-2 text-sm font-bold uppercase tracking-[0.18em] text-[#14853b]">Find your path</p>
              <h2 className="text-3xl font-extrabold tracking-tight text-[#173954] sm:text-4xl">Our Programs</h2>
              <div className="mx-auto mt-4 h-[3px] w-16 rounded-full bg-[#e9a300]" />
              <p className="mx-auto mt-4 max-w-2xl leading-7 text-[#34495e]">Explore academic programs designed to build practical skills and prepare students for future careers.</p>
            </div>
          </Reveal>
          <div className="mx-auto grid items-stretch gap-6 md:grid-cols-2">
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
              className="group relative flex h-full min-h-[220px] w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl p-5 text-center text-white shadow-[0_14px_36px_rgba(16,38,56,0.22)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_48px_rgba(16,38,56,0.32)] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#e9a300] sm:min-h-[270px] sm:p-9"
            >
              <div className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105" style={{ backgroundImage: "url('/comlab.png')" }} aria-hidden="true" />
              <div className="absolute inset-0 bg-[#102638]/60 transition-colors duration-300 group-hover:bg-[#102638]/45" aria-hidden="true" />
              <h3 className="relative text-xl font-extrabold drop-shadow sm:text-3xl">Information and Communication Technology</h3>
              <span className="relative mt-4 inline-flex items-center gap-2 text-base font-bold text-white/95">
                Learn more <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">→</span>
              </span>
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
              className="group relative flex h-full min-h-[220px] w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl p-5 text-center text-white shadow-[0_14px_36px_rgba(16,38,56,0.22)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_48px_rgba(16,38,56,0.32)] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#e9a300] sm:min-h-[270px] sm:p-9"
            >
              <div className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105" style={{ backgroundImage: "url('/hm.jpg')" }} aria-hidden="true" />
              <div className="absolute inset-0 bg-[#102638]/60 transition-colors duration-300 group-hover:bg-[#102638]/45" aria-hidden="true" />
              <h3 className="relative text-xl font-extrabold drop-shadow sm:text-3xl">Home Economics</h3>
              <span className="relative mt-4 inline-flex items-center gap-2 text-base font-bold text-white/95">
                Learn more <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">→</span>
              </span>
            </article>
            </Reveal>
            </div>
        </div>
      </section>

    </div>
  );
}
