"use client";

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

const navItems = [
  { name: 'Dashboard', href: '/portal/students/dashboard', icon: 'fa-house' },
  { name: 'Student Information', href: '/portal/students/profile', icon: 'fa-user' },
  { name: 'Student Grades', href: '/portal/students/grades', icon: 'fa-chart-column' },
  { name: 'Student Schedule', href: '/portal/students/schedule', icon: 'fa-calendar-days' },
  { name: 'Student Evaluation', href: '/portal/students/students-evaluation', icon: 'fa-clipboard-check' },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={`
        fixed left-0 top-0 z-50 isolate h-dvh w-64 overflow-hidden bg-[linear-gradient(180deg,#FF6500_0%,#FF9100_22%,#FFD000_46%,#FFF078_68%,#FFF9E9_100%)] font-sans text-[#082b49] shadow-[3px_0_10px_rgba(2,12,27,0.12)]
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0
      `}
      style={{ fontFamily: 'Arial, sans-serif' }}
    >
      <div className="relative flex h-full min-h-0 flex-col">
        <div className="relative z-10 px-4 pb-3 pt-5 text-center">
          <div className="mx-auto mb-2 h-[76px] w-[76px] overflow-hidden rounded-full border-2 border-white/80 bg-white shadow-sm">
            <Image
              src="/logo1.jpg"
              alt="Saint Gregory College of Science and Technology seal"
              width={76}
              height={76}
              className="h-full w-full object-cover"
              priority
            />
          </div>
          <h1 className="text-base font-extrabold leading-tight tracking-wide">SAINT GREGORY</h1>
          <p className="mt-0.5 text-[11px] font-bold uppercase leading-tight tracking-wide">
            College of Science and Technology
          </p>
          <div className="mx-1 mt-3 h-px bg-[#082b49]/55" />

          {onClose && (
            <button
              onClick={onClose}
              className="absolute right-3 top-3 cursor-pointer rounded-lg border border-transparent p-2 text-[#082b49] transition-all hover:border-[#e6a900] hover:bg-[#ffdf43] hover:shadow-sm focus-visible:outline-none md:hidden"
              aria-label="Close sidebar"
            >
              <i className="fa-solid fa-xmark text-lg"></i>
            </button>
          )}
        </div>

        <nav className="relative z-10 shrink-0 px-3 py-2">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => onClose && onClose()}
                    className={`group flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 text-sm font-bold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#082b49] focus-visible:ring-offset-2 ${
                      isActive
                        ? 'border-[#e6a900] bg-[#ffdf43] text-[#082b49] shadow-[0_2px_6px_rgba(114,65,0,0.18)]'
                        : 'border-transparent bg-transparent text-[#082b49] hover:translate-x-0.5 hover:border-[#e6a900]/70 hover:bg-[#ffe868]/80 hover:shadow-sm'
                    }`}
                  >
                    {item.name === 'Dashboard' ? (
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center">
                        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-[18px] w-[18px]">
                          <rect x="3" y="3" width="8" height="8" rx="1.5" />
                          <rect x="14" y="3" width="7" height="5" rx="1" />
                          <rect x="14" y="11" width="7" height="10" rx="1.5" />
                          <rect x="3" y="14" width="8" height="7" rx="1.5" />
                        </svg>
                      </span>
                    ) : (
                      <i className={`fa-solid ${item.icon} flex h-5 w-5 items-center justify-center text-sm`} aria-hidden="true"></i>
                    )}
                    <span className="truncate">{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div aria-hidden="true" className="student-sidebar-watermark-area relative z-0 min-h-0 flex-1" />

        <div className="relative z-10 border-t border-[#082b49]/20 p-3">
          <button
            onClick={() => window.location.href = "/portal/log-in"}
            className="flex w-full cursor-pointer items-center gap-3 rounded-lg border border-[#c2410c] bg-[#e64b1b] px-4 py-2.5 text-sm font-bold text-white shadow-md transition-colors duration-200 ease-in-out hover:border-[#ff9100] hover:bg-[#ff9100] hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#082b49] focus-visible:ring-offset-2 focus-visible:ring-offset-[#ff9800] active:scale-[0.98] motion-reduce:transition-none"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5 shrink-0"
            >
              <path d="M10 17l5-5-5-5" />
              <path d="M15 12H3" />
              <path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6" />
            </svg>
            <span>Exit</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
