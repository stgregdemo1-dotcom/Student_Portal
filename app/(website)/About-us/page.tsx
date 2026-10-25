export default function About() {
  return (
    <>
      {/* About Section - .about */}
      <section className="bg-[#f9f9f9] py-12 sm:py-20" id="About-us">
        <div className="container mx-auto px-4 sm:px-6">

          {/* .about-content */}
          <div className="flex flex-col items-center gap-8 lg:flex-row lg:gap-[50px]">

            {/* .about-text */}
            <div className="min-w-0 w-full flex-1">
              {/* .about-text h2 */}
              <h2 className="mb-5 text-3xl font-bold leading-tight text-[#2c3e50] sm:text-[2.5rem]">
                About Saint Gregory College
              </h2>

              {/* .about-text p */}
              <div className="space-y-[15px]">
                <p className="leading-[1.8] text-[#34495e]">
                  Saint Gregory College of Science and Technology began as a
                  college and expanded its offerings as the Philippine K-12
                  education system was implemented. In 2012, the institution
                  transitioned to offering senior high school education.
                </p>
                <p className="leading-[1.8] text-[#34495e]">
                  The institution provides learning opportunities in Information
                  and Communication Technology and hospitality programs, helping
                  students develop practical skills, knowledge, and confidence
                  for their future careers.
                </p>
                <p className="leading-[1.8] text-[#34495e]">
                  Through its commitment to quality education, Saint Gregory
                  College of Science and Technology aims to prepare learners to
                  adapt to modern technology, meet industry needs, and contribute
                  positively to their communities.
                </p>
              </div>

            </div>

            <div className="min-w-0 w-full flex-1">
              <div className="group overflow-hidden rounded-[10px] shadow-[0_10px_30px_rgba(0,0,0,0.1)]">
                <img
                  src="/aboutUs.png"
                  alt="Saint Gregory College students gathered together"
                  className="block h-auto w-full transition-transform duration-500 ease-out group-hover:scale-105"
                />
              </div>
              <div className="mt-4 grid grid-cols-1 gap-3 sm:mt-6 sm:grid-cols-3">
                <div className="rounded-lg border border-[#14853b]/15 border-t-4 border-t-[#14853b] bg-white px-3 py-4 text-center shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md sm:py-5">
                  <div className="text-2xl font-extrabold tracking-tight text-[#14853b] sm:text-3xl">5,000+</div>
                  <div className="mt-1 text-xs font-bold uppercase tracking-wider text-[#526477]">Students Graduated</div>
                </div>
                <div className="rounded-lg border border-[#e9a300]/25 border-t-4 border-t-[#e9a300] bg-white px-3 py-4 text-center shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md sm:py-5">
                  <div className="text-2xl font-extrabold tracking-tight text-[#b87900] sm:text-3xl">20+</div>
                  <div className="mt-1 text-xs font-bold uppercase tracking-wider text-[#526477]">Faculty Members</div>
                </div>
                <div className="rounded-lg border border-[#173954]/15 border-t-4 border-t-[#173954] bg-white px-3 py-4 text-center shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md sm:py-5">
                  <div className="text-2xl font-extrabold tracking-tight text-[#173954] sm:text-3xl">17</div>
                  <div className="mt-1 text-xs font-bold uppercase tracking-wider text-[#526477]">Years of Excellence</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>
    </>
  );
}
