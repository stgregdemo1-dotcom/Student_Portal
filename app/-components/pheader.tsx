"use client";

import React, { useEffect, useLayoutEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Header: React.FC = () => {
  const pathname = usePathname();
  const isHomePage = pathname === "/Home";
  const [compactState, setCompactState] = useState({ pathname, isCompact: false });
  const shouldAnimateCompact = compactState.pathname === pathname;
  const isCompact = isHomePage && shouldAnimateCompact && compactState.isCompact;

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);

  useEffect(() => {
    if (pathname !== "/Home") return;

    const body = document.body;
    const mobileViewport = window.matchMedia("(max-width: 767px)");
    const previousOverflowAnchor = body.style.overflowAnchor;
    const updateOverflowAnchor = () => {
      body.style.overflowAnchor = mobileViewport.matches
        ? "none"
        : previousOverflowAnchor;
    };

    const updateHeaderSize = () => {
      const scrollY = window.scrollY;
      setCompactState((current) => {
        const isCompact =
          current.pathname === pathname
            ? current.isCompact
              ? scrollY > 24
              : scrollY > 64
            : scrollY > 64;

        if (current.pathname === pathname && current.isCompact === isCompact) {
          return current;
        }

        return { pathname, isCompact };
      });
    };

    updateOverflowAnchor();
    updateHeaderSize();
    window.addEventListener("scroll", updateHeaderSize, { passive: true });
    mobileViewport.addEventListener("change", updateOverflowAnchor);

    return () => {
      window.removeEventListener("scroll", updateHeaderSize);
      mobileViewport.removeEventListener("change", updateOverflowAnchor);
      body.style.overflowAnchor = previousOverflowAnchor;
    };
  }, [pathname]);

  return (
    <header
      className={`${isHomePage ? "sticky top-0" : "relative"} z-20 w-full overflow-hidden`}
      style={{ backgroundImage: "linear-gradient(105deg, #FF6500 0%, #FF9100 22%, #FFD000 46%, #FFF078 68%, #FFF9E9 100%)" }}
    >
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 hidden h-full w-full sm:block"
        viewBox="0 0 2000 110"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
        style={{ width: "100%", height: "96px" }}
      >
        <defs>
          <linearGradient id="header-pattern-fade" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="white" stopOpacity=".65" />
            <stop offset=".42" stopColor="white" stopOpacity=".5" />
            <stop offset=".72" stopColor="white" stopOpacity=".2" />
            <stop offset="1" stopColor="white" stopOpacity="0" />
          </linearGradient>
        </defs>
        <g>
          <path fill="#C94300" fillOpacity=".14" d="M0 0h210L130 55 0 92z" />
          <path fill="#FF9D00" fillOpacity=".14" d="m0 0 210 0 178 22-212 40L0 92z" />
          <path fill="#FFB21B" fillOpacity=".15" d="m130 55 46 7L388 22 312 110H62z" />
          <path fill="#FFD02C" fillOpacity=".14" d="m388 22 156-22 220 36-188 74H312z" />
          <path fill="#FFE95B" fillOpacity=".13" d="m544 0 306 0-86 36-188 74-74-74z" />
          <path fill="#FFF6C2" fillOpacity=".11" d="m850 0 230 0-126 56 170 54H662l188-74z" />
          <path fill="#FFFDF5" fillOpacity=".07" d="m1080 0 250 0 180 110h-286l-170-54z" />
        </g>
        <g stroke="url(#header-pattern-fade)" strokeLinecap="round" strokeLinejoin="round">
          <path strokeWidth="1.7" d="M0 8 130 55M0 92 130 55M130 55 210 0M130 55 176 62M176 62 388 22M176 62 62 110M176 62 312 110M210 0 388 22M388 22 312 110M388 22 544 0M388 22 574 36M312 110 574 36M544 0 850 0M574 36 850 0M574 36 662 110M574 36 786 110M850 0 954 56M786 110 954 56M954 56 1080 0M954 56 1130 110" />
          <path strokeWidth="1.35" d="M1080 0 1330 0M1130 110 1330 0M1330 0 1510 110M1510 110 1680 28M1680 28 1830 110M1830 110 2000 40" />
        </g>
      </svg>
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full sm:hidden"
        viewBox="780 0 440 110"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
        style={{ width: "100%", height: "100%" }}
      >
        <g>
          <path fill="#FFE95B" fillOpacity=".1" d="m544 0 306 0-86 36-188 74-74-74z" />
          <path fill="#FFF6C2" fillOpacity=".09" d="m850 0 230 0-126 56 170 54H662l188-74z" />
          <path fill="#FFFDF5" fillOpacity=".06" d="m1080 0 250 0 180 110h-286l-170-54z" />
        </g>
        <g stroke="white" strokeOpacity=".34" strokeLinecap="round" strokeLinejoin="round">
          <path strokeWidth="1.7" d="m544 0 306 0M574 36 850 0M574 36 662 110M574 36 786 110M850 0 954 56M786 110 954 56M954 56 1080 0M954 56 1130 110M1080 0 1330 0M1130 110 1330 0" />
        </g>
      </svg>
      <div className="relative z-10 mx-auto w-full max-w-[1460px] px-3 sm:px-6">
        <nav className={`flex flex-wrap items-center justify-between ${shouldAnimateCompact ? "transition-[min-height,padding] duration-300 ease-in-out" : "transition-none"} md:flex-nowrap ${isCompact ? "min-h-[72px] py-1 md:min-h-[68px] md:py-2" : "min-h-[96px] py-3"}`}>


<div className="relative isolate flex min-w-0 items-center gap-3 drop-shadow-[0_1px_2px_rgba(0,0,0,0.25)] lg:ml-6">
  <span aria-hidden="true" className="pointer-events-none absolute -inset-x-2 -inset-y-1 z-0 rounded-lg backdrop-blur-[6px]" />

  <div className={`relative z-10 flex-shrink-0 overflow-hidden rounded-full border-4 border-white/50 transition-[height,width,transform] duration-300 hover:scale-110 hover:rotate-3 ${isCompact ? "h-8 w-8 sm:h-14 sm:w-14 md:h-12 md:w-12 lg:h-14 lg:w-14" : "h-10 w-10 sm:h-14 sm:w-14 lg:h-[4.5rem] lg:w-[4.5rem]"}`}>
    <img 
      src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQRN3gQ0ep9JbWVXYw4ipX_NzoD8esE7ytbEA&s" 
      alt="Saint Gregory College Logo"
      className="w-full h-full object-contain rounded-full"
    />
  </div>


  <div className="relative z-10 min-w-0 flex flex-col justify-center">
    <h1 className="font-sans antialiased text-[#1a252f] leading-none">
      <span className={`block whitespace-nowrap font-black uppercase tracking-tighter transition-[font-size] duration-300 ${isCompact ? "text-sm sm:text-2xl md:text-xl lg:text-2xl" : "text-base sm:text-2xl lg:text-[1.9rem]"}`}>
        Saint Gregory
      </span>
      <span className={`block max-w-[130px] font-bold uppercase tracking-[0.05em] text-[#245A81] transition-[font-size] duration-300 sm:max-w-none ${isCompact ? "text-[0.4rem] sm:text-[0.68rem] md:text-[0.6rem] lg:text-xs" : "text-[0.45rem] sm:text-[0.68rem] lg:text-[0.9rem]"}`}>
        College of Science and Technology
      </span>
    </h1>
  </div>
</div>


          <div className="order-2 hidden items-center gap-8 md:flex">
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
              className="relative py-2 text-lg font-semibold text-[#183B56] transition-colors duration-300 hover:text-[#b94d00] after:absolute after:bottom-0 after:left-0 after:h-[3px] after:w-full after:origin-left after:scale-x-0 after:bg-[#ff9c00] after:transition-transform after:duration-300 hover:after:scale-x-100"
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
              className="relative py-2 text-lg font-semibold text-[#183B56] transition-colors duration-300 hover:text-[#b94d00] after:absolute after:bottom-0 after:left-0 after:h-[3px] after:w-full after:origin-left after:scale-x-0 after:bg-[#ff9c00] after:transition-transform after:duration-300 hover:after:scale-x-100"
            >
              Programs
            </Link>
            <Link
              href="/About-us"
              className="relative py-2 text-lg font-semibold text-[#183B56] transition-colors duration-300 hover:text-[#b94d00] after:absolute after:bottom-0 after:left-0 after:h-[3px] after:w-full after:origin-left after:scale-x-0 after:bg-[#ff9c00] after:transition-transform after:duration-300 hover:after:scale-x-100"
            >
              About Us
            </Link>
          </div>

          <div className={`relative isolate order-3 flex w-full items-center justify-center gap-8 border-t border-white/40 md:hidden ${isCompact ? "mt-1 pt-1" : "mt-3 pt-3"}`}>
            <span aria-hidden="true" className="pointer-events-none absolute -inset-x-3 bottom-0 top-0 z-0 backdrop-blur-[4px]" />
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
              className={`relative z-10 py-1 font-semibold text-[#183B56] after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:origin-left after:scale-x-0 after:bg-[#ff9c00] after:transition-transform after:duration-300 hover:after:scale-x-100 ${isCompact ? "text-sm" : "text-base"}`}
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
              className={`relative z-10 py-1 font-semibold text-[#183B56] after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:origin-left after:scale-x-0 after:bg-[#ff9c00] after:transition-transform after:duration-300 hover:after:scale-x-100 ${isCompact ? "text-sm" : "text-base"}`}
            >
              Programs
            </Link>
            <Link
              href="/About-us"
              className={`relative z-10 py-1 font-semibold text-[#183B56] after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:origin-left after:scale-x-0 after:bg-[#ff9c00] after:transition-transform after:duration-300 hover:after:scale-x-100 ${isCompact ? "text-sm" : "text-base"}`}
            >
              About Us
            </Link>
          </div>


          <div className={`order-2 ml-2 flex flex-shrink-0 items-center md:order-3 md:ml-0 ${isCompact ? "hidden md:flex" : ""}`}>
            <Link 
              href="/portal/log-in" 
              className="inline-flex h-9 min-w-[64px] items-center justify-center rounded-xl border-[2.5px] border-[#183B56] bg-white px-2 text-sm font-bold leading-none text-[#183B56] shadow-none transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#183B56] hover:text-white sm:h-10 sm:min-w-[80px] sm:px-6 sm:text-base"
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
