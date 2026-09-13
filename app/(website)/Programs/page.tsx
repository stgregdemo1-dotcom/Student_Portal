import Link from "next/link";

export default function Program() {
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
    <section className="py-20 bg-[rgb(250,250,250)]" id="Programs">
      <div className="max-w-7xl mx-auto px-4 flex flex-col items-center">
        
        <div className="text-center mb-[50px]">
          <h2 className="text-[2.5rem] font-bold text-[#2c3e50] mb-[15px]">
            Our Tracks and Strands
          </h2>
          <p className="text-[#7f8c8d] max-w-[600px] mx-auto">
            Explore our innovative academic pathways designed to equip students for the challenges of tomorrow.
          </p>
        </div>

        <div className="w-full flex flex-col items-center gap-6">
          {programs.map((program, index) => (
            <div 
              key={index} 
              className="flex flex-col md:flex-row w-full max-w-5xl bg-[rgb(231,231,231)] rounded-[10px] overflow-hidden shadow-[0_5px_15px_rgba(0,0,0,0.1)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_15px_30px_rgba(0,0,0,0.15)]"
            >
              <div className="md:w-1/4 h-[140px] md:h-auto bg-[#00eb00] flex items-center justify-center text-white text-[3rem]">
              <i className="fas fa-graduation-cap"></i>
              </div>


              <div className="md:w-3/4 p-12 flex flex-col items-center justify-center text-center min-h-[150px]">
              <h3 className="text-xl font-bold text-black mb-2">
                {program.title}
              </h3>
              <p className="text-gray-700 mb-4 text-sm leading-relaxed max-w-md">
                {program.desc}
              </p>
              <Link 
                href="#" 
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
  );
}