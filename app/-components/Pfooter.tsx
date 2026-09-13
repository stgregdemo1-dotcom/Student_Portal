import Link from 'next/link';

export default function Footer() {
  return (
    /* py-[200px] is the secret. It forces a huge height (400px of just empty space) 
       but because it's padding, the content stays perfectly centered and looks professional. */
    <footer className="bg-[#2c3e50] text-white py-[200px]">
      <div className="container mx-auto px-6">
        
        {/* Massive gap-[250px] for that wide separation you asked for */}
        <div className="flex flex-col md:flex-row justify-center items-start gap-16 md:gap-[150px] lg:gap-[250px]">
          
          {/* Column 1: About */}
          <div className="max-w-[320px]">
            <h3 className="text-xl font-bold mb-8 relative pb-4">
              SGCST
              <span className="absolute left-0 bottom-0 w-12 h-[2px] bg-[#FFD700]"></span>
            </h3>
            <p className="text-[#ecf0f1] text-sm leading-[2] opacity-80">
              Providing world-class education in science and technology since 2009. 
              Dedicated to nurturing the next generation of innovators through 
              academic excellence.
            </p>
            
            <div className="flex gap-4 mt-10">
              {['facebook-f', 'twitter', 'instagram', 'linkedin-in'].map((icon) => (
                <Link
                  key={icon}
                  href="#"
                  className="w-10 h-10 bg-[#34495e] rounded-full flex items-center justify-center transition-all hover:bg-[#FFD700] hover:text-[#2c3e50]"
                >
                  <i className={`fab fa-${icon} text-sm`}></i>
                </Link>
              ))}
            </div>
          </div>

          {/* Column 2: Contact Info */}
          <div className="max-w-[400px]">
            <h3 className="text-xl font-bold mb-8 relative pb-4">
              Contact Us
              <span className="absolute left-0 bottom-0 w-12 h-[2px] bg-[#FFD700]"></span>
            </h3>
            <ul className="space-y-8 text-sm">
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
                <span className="opacity-80 leading-relaxed">
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