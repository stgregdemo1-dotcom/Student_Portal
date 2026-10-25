import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[#2c3e50] py-4 text-white md:py-6">
      <div className="container mx-auto px-6">
        <div className="mx-auto flex max-w-5xl flex-col items-start justify-between gap-5 md:flex-row md:gap-8">
          {/* Column 1: About */}
          <div className="max-w-[320px]">
            <h3 className="relative mb-2 pb-1.5 text-lg font-bold">
              SGCST
              <span className="absolute bottom-0 left-0 h-[2px] w-12 bg-[#FFD700]"></span>
            </h3>
            <p className="text-sm leading-5 text-[#ecf0f1] opacity-80">
              Providing world-class education in science and technology since 2009.
              Dedicated to nurturing the next generation of innovators through
              academic excellence.
            </p>

            <div className="mt-3 flex gap-2.5">
              {['facebook-f', 'twitter', 'instagram', 'linkedin-in'].map((icon) => (
                <Link
                  key={icon}
                  href="#"
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-[#34495e] text-xs transition-all hover:bg-[#FFD700] hover:text-[#2c3e50]"
                >
                  <i className={`fab fa-${icon}`}></i>
                </Link>
              ))}
            </div>
          </div>

          {/* Column 2: Contact Info */}
          <div className="max-w-[400px]">
            <h3 className="relative mb-2 pb-1.5 text-lg font-bold">
              Contact Us
              <span className="absolute bottom-0 left-0 h-[2px] w-12 bg-[#FFD700]"></span>
            </h3>
            <ul className="space-y-1.5 text-sm">
              <li className="flex items-center gap-4">
                <i className="fas fa-phone text-[#FFD700]"></i>
                <span className="opacity-80">(046) 432-1680 / (046) 526-4628</span>
              </li>
              <li className="flex items-center gap-4">
                <i className="fas fa-envelope text-[#FFD700]"></i>
                <span className="opacity-80">SG2015gregorians@gmail.com</span>
              </li>
              <li className="flex items-start gap-4">
                <i className="fas fa-map-marker-alt mt-1 text-[#FFD700]"></i>
                <span className="leading-relaxed opacity-80">
                  2nd/3rd Floor Saint Michael Bldg., Alejandro st. Manila-Cavite Blvd.
                  Sta. Cruz, Cavite City
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
