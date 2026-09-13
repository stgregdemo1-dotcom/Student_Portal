import React from 'react';
import Link from 'next/link';

const Header: React.FC = () => {
  return (
    <header className="bg-[#e69e03] shadow-[0_4px_12px_rgba(0,0,0,0.1)] sticky top-0 z-[100] w-full">
      <div className="container mx-auto px-4">
        {/* Navbar height */}
        <nav className="flex justify-between items-center py-[20px] min-h-[100px]">


<div className="flex items-center gap-4">

  <div className="relative w-[70px] h-[70px] flex-shrink-0 border-2 border-white/50 rounded-full bg-white shadow-sm overflow-hidden p-1">
    <img 
      src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQRN3gQ0ep9JbWVXYw4ipX_NzoD8esE7ytbEA&s" 
      alt="Saint Gregory College Logo"
      className="w-full h-full object-contain rounded-full"
    />
  </div>


  <div className="flex flex-col justify-center">
    <h1 className="font-sans antialiased text-[#1a252f] leading-none">
      <span className="text-[2rem] font-black tracking-tighter uppercase block">
        Saint Gregory
      </span>
      <span className="text-[0.95rem] font-bold tracking-[0.05em] uppercase text-[#3d648b]">
        College of Science and Technology
      </span>
    </h1>
  </div>
</div>


          <div className="hidden md:flex items-center gap-[30px]">
            <Link href="/Home" className="text-[#fafafa] font-semibold text-[1.1rem] transition-colors duration-300 hover:text-[#e74c3c]">
              Home
            </Link>
            <Link href="/Programs" className="text-[#fafafa] font-semibold text-[1.1rem] transition-colors duration-300 hover:text-[#e74c3c]">
              Programs
            </Link>
            <Link href="/About-us" className="text-[#fafafa] font-semibold text-[1.1rem] transition-colors duration-300 hover:text-[#e74c3c]">
              About Us
            </Link>
          </div>


          <div className="flex items-center">
            <Link 
              href="/portal/log-in" 
              className="inline-flex items-center justify-center bg-[#3d648b] text-white h-[40px] min-w-[80px] px-8 rounded-full font-bold text-[1rem] leading-none transition-all duration-300 hover:bg-[#1a252f] hover:-translate-y-0.5 hover:shadow-lg shadow-sm"
            >
              Login
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;