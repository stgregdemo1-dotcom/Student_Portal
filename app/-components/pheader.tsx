"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Header: React.FC = () => {
  const pathname = usePathname();
  const isHomePage = pathname === "/Home";
  const [isCompact, setIsCompact] = useState(false);

  useEffect(() => {
    if (!isHomePage) return;

    const updateHeaderSize = () => {
      const scrollY = window.scrollY;
      setIsCompact((currentlyCompact) =>
        currentlyCompact ? scrollY > 24 : scrollY > 64,
      );
    };
    updateHeaderSize();
    window.addEventListener("scroll", updateHeaderSize, { passive: true });

    return () => window.removeEventListener("scroll", updateHeaderSize);
  }, [isHomePage]);

  return (
    <header className={`${isHomePage ? "sticky top-0" : "relative"} z-20 w-full bg-[#e69e03] shadow-[0_4px_12px_rgba(0,0,0,0.1)] transition-shadow duration-300`}>
      <div className="container mx-auto px-4">
        <nav className={`flex items-center justify-between transition-[min-height,padding] duration-300 ease-in-out ${isCompact ? "min-h-[68px] py-2" : "min-h-[96px] py-3"}`}>


<div className="flex items-center gap-3">

  <div className={`relative flex-shrink-0 overflow-hidden rounded-full border-4 border-white/50 transition-[height,width,transform] duration-300 hover:scale-110 hover:rotate-3 ${isCompact ? "h-12 w-12 sm:h-14 sm:w-14" : "h-16 w-16 sm:h-[4.5rem] sm:w-[4.5rem]"}`}>
    <img 
      src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQRN3gQ0ep9JbWVXYw4ipX_NzoD8esE7ytbEA&s" 
      alt="Saint Gregory College Logo"
      className="w-full h-full object-contain rounded-full"
    />
  </div>


  <div className="flex flex-col justify-center">
    <h1 className="font-sans antialiased text-[#1a252f] leading-none">
      <span className={`block font-black uppercase tracking-tighter transition-[font-size] duration-300 ${isCompact ? "text-xl sm:text-2xl" : "text-[1.65rem] sm:text-[1.9rem]"}`}>
        Saint Gregory
      </span>
      <span className={`font-bold uppercase tracking-[0.05em] text-[#3d648b] transition-[font-size] duration-300 ${isCompact ? "text-[0.65rem] sm:text-xs" : "text-[0.75rem] sm:text-[0.9rem]"}`}>
        College of Science and Technology
      </span>
    </h1>
  </div>
</div>


          <div className="hidden items-center gap-6 md:flex">
            <Link
              href="/Home"
              onClick={(event) => {
                if (!isHomePage) return;

                event.preventDefault();
                window.scrollTo({
                  top: 0,
                  left: 0,
                  behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
                });
              }}
              className="text-base font-semibold text-[#fafafa] transition-colors duration-300 hover:text-[#e74c3c]"
            >
              Home
            </Link>
            <Link
              href="/Home#Programs"
              onClick={(event) => {
                const programsSection = document.getElementById("Programs");
                if (!programsSection) return;

                event.preventDefault();
                programsSection.scrollIntoView({
                  behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
                });
              }}
              className="text-base font-semibold text-[#fafafa] transition-colors duration-300 hover:text-[#e74c3c]"
            >
              Programs
            </Link>
            <Link
              href="/About-us"
              onClick={() => window.scrollTo({ top: 0, left: 0, behavior: "instant" })}
              className="text-base font-semibold text-[#fafafa] transition-colors duration-300 hover:text-[#e74c3c]"
            >
              About Us
            </Link>
          </div>


          <div className="flex items-center">
            <Link 
              href="/portal/log-in" 
              className="inline-flex h-10 min-w-[80px] items-center justify-center rounded-full bg-[#3d648b] px-6 text-base font-bold leading-none text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#1a252f] hover:shadow-lg"
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
