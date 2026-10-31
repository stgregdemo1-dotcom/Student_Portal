import Image from "next/image";
import Reveal from "./Reveal";

const aboutStats = [
  { value: "5,000+", label: "Students Graduated", color: "#008A3D", icon: "cap" },
  { value: "20+", label: "Faculty Members", color: "#FF7900", icon: "faculty" },
  { value: "17", label: "Years of Excellence", color: "#0D2B45", icon: "trophy" },
] as const;

function StatisticIcon({ name }: { name: (typeof aboutStats)[number]["icon"] }) {
  const icon = {
    cap: (
      <>
        <path d="m2 10 10-5 10 5-10 5-10-5Z" />
        <path d="M6 12v5c3.5 2.5 8.5 2.5 12 0v-5M22 10v6" />
      </>
    ),
    faculty: (
      <>
        <circle cx="9" cy="8" r="3" />
        <path d="M3 20v-1a6 6 0 0 1 12 0v1M16 5.2a3 3 0 0 1 0 5.6M18 14a5 5 0 0 1 3 4.5V20" />
      </>
    ),
    trophy: (
      <>
        <path d="M8 21h8m-4-4v4M7 4h10v5a5 5 0 0 1-10 0V4ZM7 6H4v2a4 4 0 0 0 4 4m9-6h3v2a4 4 0 0 1-4 4" />
      </>
    ),
  }[name];

  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {icon}
    </svg>
  );
}

export default function AboutSection() {
  return (
    <section
      className="relative scroll-mt-24 overflow-hidden bg-[radial-gradient(ellipse_at_82%_44%,rgba(255,193,7,0.20),transparent_38%),radial-gradient(ellipse_at_4%_100%,rgba(255,193,7,0.12),transparent_38%),linear-gradient(180deg,#FFFCF5_0%,#FFFFFF_50%,#FFF9E8_100%)] px-4 py-10 sm:px-8 sm:py-12 lg:py-14"
      id="About-us"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-0 h-52 w-52 opacity-60 sm:h-60 sm:w-60"
        style={{
          backgroundImage: "radial-gradient(#FFC107 1.5px, transparent 1.5px)",
          backgroundSize: "12px 12px",
          maskImage: "linear-gradient(135deg, black, transparent 82%)",
        }}
      />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-[#FFC107]/10 sm:h-72 sm:w-72" />
      <div className="relative mx-auto grid max-w-[1200px] items-center gap-7 lg:grid-cols-[0.92fr_1.08fr] lg:gap-10">
        <Reveal>
        <div className="text-left">
          <p className="mb-3 text-sm font-extrabold uppercase tracking-[0.2em] text-[#D89B00] sm:text-base">
            About SGCST
          </p>
          <h2 className="max-w-xl text-3xl font-extrabold leading-tight tracking-tight text-[#0D2B45] sm:text-[2.25rem]">
            Saint Gregory College of Science and Technology
          </h2>
          <div className="mt-5 h-1 w-14 rounded-full bg-[#FFC107]" />
          <div className="mt-5 space-y-3 text-sm leading-6 text-[#526174] sm:text-base sm:leading-7">
            <p>
              Saint Gregory College of Science and Technology began as a college
              and expanded its offerings as the Philippine K–12 education system
              was implemented. In 2012, the institution transitioned to offering
              senior high school education.
            </p>
            <p>
              The institution provides learning opportunities in Information
              and Communication Technology and hospitality programs, helping
              students develop practical skills, knowledge, and confidence for
              their future careers.
            </p>
            <p>
              Through its commitment to quality education, Saint Gregory College
              of Science and Technology aims to prepare learners to adapt to
              modern technology, meet industry needs, and contribute positively
              to their communities.
            </p>
          </div>
        </div>
        </Reveal>

        <Reveal direction="right">
        <div className="relative min-w-0 pt-3 sm:pt-4">
          <div
            aria-hidden="true"
            className="absolute right-[-8px] top-0 h-28 w-2/3 rounded-2xl bg-[#FFC107]/55 sm:right-[-12px] sm:h-36"
          />
          <div className="group relative overflow-hidden rounded-2xl shadow-[0_16px_40px_rgba(13,43,69,0.16)]">
            <Image
              src="/aboutUs.png"
              alt="Saint Gregory College students gathered together"
              width={1200}
              height={900}
              sizes="(max-width: 1024px) 100vw, 55vw"
              className="block aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-[1.02] motion-reduce:transition-none"
            />
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 sm:mt-4 sm:gap-3">
            {aboutStats.map((stat) => (
              <article
                key={stat.label}
                className="min-w-0 rounded-xl border border-slate-100 border-t-[3px] bg-white px-1.5 py-3 text-center shadow-[0_5px_18px_rgba(13,43,69,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_10px_24px_rgba(13,43,69,0.12)] motion-reduce:transition-none sm:px-3 sm:py-4"
                style={{ borderTopColor: stat.color }}
              >
                <span className="mx-auto flex h-8 w-8 items-center justify-center rounded-full sm:h-9 sm:w-9" style={{ backgroundColor: `${stat.color}12`, color: stat.color }}>
                  <StatisticIcon name={stat.icon} />
                </span>
                <div className="mt-1.5 text-lg font-extrabold tracking-tight sm:mt-2 sm:text-2xl" style={{ color: stat.color }}>
                  {stat.value}
                </div>
                <div className="mt-1 text-[0.55rem] font-bold uppercase leading-tight tracking-wide text-[#526174] sm:text-[0.65rem] sm:tracking-wider">
                  {stat.label}
                </div>
              </article>
            ))}
          </div>
        </div>
        </Reveal>
      </div>
    </section>
  );
}
