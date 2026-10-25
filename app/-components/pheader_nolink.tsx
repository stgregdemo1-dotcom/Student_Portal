import React from "react";

const Header: React.FC = () => {
  return (
    <header
      className="admission-header sticky top-0 z-20 w-full overflow-hidden"
      style={{
        backgroundImage:
          "linear-gradient(105deg, #FF6500 0%, #FF9100 22%, #FFD000 46%, #FFF078 68%, #FFF9E9 100%)",
      }}
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
          <linearGradient id="admission-header-pattern-fade" x1="0" x2="1" y1="0" y2="0">
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
        <g stroke="url(#admission-header-pattern-fade)" strokeLinecap="round" strokeLinejoin="round">
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
        <nav
          className="admission-header-nav flex h-full items-center justify-between md:flex-nowrap"
        >
          <div className="relative isolate flex min-w-0 items-center gap-3 drop-shadow-[0_1px_2px_rgba(0,0,0,0.25)] lg:ml-6">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -inset-x-2 -inset-y-1 z-0 rounded-lg backdrop-blur-[6px]"
            />
            <div
              className="relative z-10 h-10 w-10 flex-shrink-0 overflow-hidden rounded-full border-4 border-white/50 sm:h-14 sm:w-14 lg:h-[4.5rem] lg:w-[4.5rem]"
            >
              <img
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQRN3gQ0ep9JbWVXYw4ipX_NzoD8esE7ytbEA&s"
                alt="Saint Gregory College Logo"
                className="h-full w-full rounded-full object-contain"
              />
            </div>
            <div className="relative z-10 flex min-w-0 flex-col justify-center">
              <h1 className="font-sans leading-none text-[#1a252f] antialiased">
                <span
                  className="block whitespace-nowrap text-base font-black uppercase tracking-tighter sm:text-2xl lg:text-[1.9rem]"
                >
                  Saint Gregory
                </span>
                <span
                  className="block max-w-[130px] text-[0.45rem] font-bold uppercase tracking-[0.05em] text-[#245A81] sm:max-w-none sm:text-[0.68rem] lg:text-[0.9rem]"
                >
                  College of Science and Technology
                </span>
              </h1>
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
