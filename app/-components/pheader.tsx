"use client";

import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Header: React.FC = () => {
  const pathname = usePathname();
  const isHomePage = pathname === "/Home";
  const isAdmissionPage = pathname.startsWith("/admission/");
  const usesCompactHeader = isHomePage || isAdmissionPage;
  const [compactState, setCompactState] = useState({ pathname, isCompact: false });
  const [activeSection, setActiveSection] = useState("Home");
  const shouldAnimateCompact = compactState.pathname === pathname;
  const isCompact = usesCompactHeader && shouldAnimateCompact && compactState.isCompact;
  const compactRef = useRef(false);

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);

  useEffect(() => {
    if (!usesCompactHeader) return;

    const body = document.body;
    const previousOverflowAnchor = body.style.overflowAnchor;
    let animationFrameId = 0;
    compactRef.current = window.scrollY > 64;
    setCompactState({ pathname, isCompact: compactRef.current });

    const updateHeaderSize = () => {
      if (animationFrameId) return;

      animationFrameId = window.requestAnimationFrame(() => {
        animationFrameId = 0;
        const nextIsCompact = window.scrollY > (compactRef.current ? 24 : 64);
        if (nextIsCompact === compactRef.current) return;

        compactRef.current = nextIsCompact;
        setCompactState({ pathname, isCompact: nextIsCompact });
      });
    };

    body.style.overflowAnchor = "none";
    updateHeaderSize();
    window.addEventListener("scroll", updateHeaderSize, { passive: true });

    return () => {
      if (animationFrameId) window.cancelAnimationFrame(animationFrameId);
      window.removeEventListener("scroll", updateHeaderSize);
      body.style.overflowAnchor = previousOverflowAnchor;
    };
  }, [pathname, usesCompactHeader]);

  useEffect(() => {
    if (pathname !== "/Home") return;

    const sectionIds = ["Home", "Programs", "About-us"];
    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter((section): section is HTMLElement => section !== null);
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleSections = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        const sectionId = visibleSections[0]?.target.id;
        if (sectionId) {
          setActiveSection(
            sectionId === "About-us" ? "About Us" : sectionId,
          );
        }
      },
      { rootMargin: "-88px 0px -65% 0px", threshold: [0, 0.1, 0.3] },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [pathname]);

  const displayedActiveSection =
    pathname === "/About-us" ? "About Us" : pathname === "/Home" ? activeSection : "";

  const navLinkClass =
    "relative py-2 text-lg font-semibold text-[#183B56] transition-colors duration-200 hover:text-[#FF7900] after:absolute after:bottom-0 after:left-0 after:h-[3px] after:w-full after:origin-left after:scale-x-0 after:bg-[#FF7900] after:transition-transform after:duration-200 hover:after:scale-x-100";

  const mobileNavLinkClass =
    "relative z-10 py-1 text-base font-semibold text-[#183B56] transition-colors duration-200 hover:text-[#FF7900] after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:origin-left after:scale-x-0 after:bg-[#FF7900] after:transition-transform after:duration-200 hover:after:scale-x-100";

  const brandContent = (
    <>
      <span aria-hidden="true" className="pointer-events-none absolute -inset-x-2 -inset-y-1 z-0 rounded-lg backdrop-blur-[6px]" />

      <div className={`site-header-logo relative z-10 flex-shrink-0 overflow-hidden rounded-full border-4 border-white/50 md:transition-[height,width,transform] md:duration-300 ${isAdmissionPage ? "" : "hover:scale-110 hover:rotate-3"} ${isCompact ? "h-8 w-8 sm:h-14 sm:w-14 md:h-12 md:w-12 lg:h-14 lg:w-14" : "h-10 w-10 sm:h-14 sm:w-14 lg:h-[4.5rem] lg:w-[4.5rem]"}`}>
        <img
          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQRN3gQ0ep9JbWVXYw4ipX_NzoD8esE7ytbEA&s"
          alt="Saint Gregory College Logo"
          className="w-full h-full rounded-full object-contain"
        />
      </div>

      <div className="relative z-10 flex min-w-0 flex-col justify-center">
        <h1 className="font-sans leading-none text-[#1a252f] antialiased">
          <span className={`site-header-title block whitespace-nowrap font-black uppercase tracking-tighter md:transition-[font-size] md:duration-300 ${isCompact ? "text-sm sm:text-2xl md:text-xl lg:text-2xl" : "text-base sm:text-2xl lg:text-[1.9rem]"}`}>
            Saint Gregory
          </span>
          <span className={`site-header-subtitle block max-w-[130px] font-bold uppercase tracking-[0.05em] text-[#245A81] md:transition-[font-size] md:duration-300 sm:max-w-none ${isCompact ? "text-[0.4rem] sm:text-[0.68rem] md:text-[0.6rem] lg:text-xs" : "text-[0.45rem] sm:text-[0.68rem] lg:text-[0.9rem]"}`}>
            College of Science and Technology
          </span>
        </h1>
      </div>
    </>
  );
  const brandClassName =
    "relative isolate flex min-w-0 items-center gap-3 lg:ml-6";

  return (
    <header
      className={`${usesCompactHeader ? "sticky top-0" : "relative"} z-20 w-full overflow-hidden`}
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
        <nav className={`site-header-nav relative flex flex-wrap items-center justify-between ${shouldAnimateCompact ? "transition-[min-height,padding] duration-300 ease-in-out" : "transition-none"} md:flex-nowrap ${isCompact ? "min-h-[72px] py-1 md:min-h-[68px] md:py-2" : "min-h-[96px] py-3"}`}>
{isAdmissionPage ? (
  <div className={brandClassName}>{brandContent}</div>
) : (
  <Link
    href="/Home"
    aria-label="Saint Gregory College home"
    onClick={(event) => {
      if (!isHomePage) return;
      event.preventDefault();
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
      });
    }}
    className={`${brandClassName} rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0D2B45] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FFD000]`}
  >
    {brandContent}
  </Link>
)}


          {!isAdmissionPage && <div className="order-2 hidden items-center gap-5 md:absolute md:left-[calc(50%+16px)] md:flex md:-translate-x-1/2 lg:gap-8">
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
              aria-current={displayedActiveSection === "Home" ? "page" : undefined}
              className={navLinkClass}
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
              aria-current={displayedActiveSection === "Programs" ? "location" : undefined}
              className={navLinkClass}
            >
              Programs
            </Link>
            <Link
              href="/Home#About-us"
              onClick={(event) => {
                const aboutSection = document.getElementById("About-us");
                if (!isHomePage || !aboutSection) return;

                event.preventDefault();
                aboutSection.scrollIntoView({
                  behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
                });
              }}
              aria-current={displayedActiveSection === "About Us" ? "location" : undefined}
              className={navLinkClass}
            >
              About Us
            </Link>
          </div>}

          {!isAdmissionPage && <div className={`relative isolate order-3 flex w-full items-center justify-center gap-8 border-t border-white/40 md:hidden ${isCompact ? "mt-1 pt-1" : "mt-3 pt-3"}`}>
            <span aria-hidden="true" className="pointer-events-none absolute -inset-x-3 bottom-0 top-0 z-0 md:backdrop-blur-[4px]" />
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
              aria-current={displayedActiveSection === "Home" ? "page" : undefined}
              className={mobileNavLinkClass}
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
              aria-current={displayedActiveSection === "Programs" ? "location" : undefined}
              className={mobileNavLinkClass}
            >
              Programs
            </Link>
            <Link
              href="/Home#About-us"
              onClick={(event) => {
                const aboutSection = document.getElementById("About-us");
                if (!isHomePage || !aboutSection) return;

                event.preventDefault();
                aboutSection.scrollIntoView({
                  behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
                });
              }}
              aria-current={displayedActiveSection === "About Us" ? "location" : undefined}
              className={mobileNavLinkClass}
            >
              About Us
            </Link>
          </div>}


          {!isAdmissionPage && <div className="order-2 ml-2 flex flex-shrink-0 items-center md:order-3 md:ml-auto">
            <Link 
              href="/portal/log-in" 
              className="inline-flex h-9 min-w-[64px] items-center justify-center gap-1.5 rounded-lg bg-[#082B49] px-3 text-sm font-bold leading-none text-white shadow-sm transition-[transform,background-color,box-shadow,color] duration-300 ease-in-out hover:-translate-y-0.5 hover:bg-white hover:text-[#082B49] hover:shadow-[0_5px_12px_rgba(8,43,73,0.2)] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#082B49]/25 motion-reduce:transition-none sm:h-10 sm:min-w-[96px] sm:px-5 sm:text-base"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 17l5-5-5-5M15 12H3M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6" />
              </svg>
              Login
            </Link>
          </div>}
        </nav>
      </div>
    </header>
  );
};

export default Header;
