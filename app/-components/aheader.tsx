"use client";

interface HeaderProps {
  onToggleSidebar?: () => void;
}

export default function Header({ onToggleSidebar }: HeaderProps) {
  return (
    <header className="h-16 bg-white border-b flex items-center justify-between px-4 md:px-6 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger Toggle Button */}
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 md:hidden focus:outline-none transition-colors"
          aria-label="Toggle navigation drawer"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
            />
          </svg>
        </button>

        <h2 className="text-lg md:text-xl font-semibold text-gray-800">
          Overview
        </h2>
      </div>

      <div className="flex items-center gap-3 md:gap-4">
        <span className="text-xs md:text-sm text-gray-600 font-medium">
          Welcome, Admin!
        </span>
        <div className="w-8 h-8 bg-amber-500 text-yellow-950 font-bold rounded-full flex items-center justify-center text-xs shadow-sm">
          A
        </div>
      </div>
    </header>
  );
}