"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const Sidebar = ({ isOpen = false, onClose }: SidebarProps) => {
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', href: '/portal/admin/dashboard', icon: <path d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /> },
    { name: 'Manage Teachers', href: '/portal/admin/manage-teachers', icon: <path d="M4.26 10.174L10.74 12c.38.1.74-.14.74-.53V3.84c0-.38-.34-.65-.7-.57L4.3 4.44a.6.6 0 00-.46.58v4.57c0 .28.2.53.42.58zM19.74 10.174L13.26 12c-.38.1-.74-.14-.74-.53V3.84c0-.38.34-.65.7-.57l6.44 1.17c.28.05.46.3.46.58v4.57c0 .28-.2.53-.42.58z" /> },
    { name: 'Manage Subjects', href: '/portal/admin/manage-subjects', icon: <path d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15" /> },
    { name: 'View Schedule', href: '/portal/admin/manage-schedule', icon: <path d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75" /> },
    { name: 'Events', href: '/portal/admin/events', icon: <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-12-11.25h.008v.008H9V7.5zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0zM12 7.5h.008v.008H12V7.5zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0zm1.125 4.5h.008v.008H13.5V12zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0zm1.5 0h.008v.008H15V12zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0zm-3.75 3h.008v.008H11.25v-.008zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0zm1.5 0h.008v.008H12.75v-.008zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0zm1.5 0h.008v.008H14.25v-.008zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0z" />},
    { name: 'Settings', href: '/portal/admin/settings', icon: <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />},
    { name: 'Activity Log', href: '/portal/admin/activitylog', icon: <path strokeLinecap="round" strokeLinejoin="round" d="M6.429 9.75 2.25 12l4.179 2.25m0-4.5 5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0 4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0-5.571 3-5.571-3" />},
  ];

  const handleLogout = () => {
    // Clear username cache/session data from client storage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('username');
      sessionStorage.removeItem('username');
      // If your useAuthGuard uses custom keys, clear them here as well:
      localStorage.clear();
      sessionStorage.clear();
    }
    
    console.log("User logged out and cache cleared");
    window.location.href = '/portal/log-in'; 
  };

  return (
    <aside 
      className={`
        fixed left-0 top-0 isolate h-dvh w-64 overflow-hidden border-r border-white/10 bg-[#06264A] text-white flex flex-col z-50 shadow-[3px_0_10px_rgba(2,12,27,0.12)]
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0
      `}
      style={{
        fontFamily: 'Arial, sans-serif',
        backgroundImage: 'linear-gradient(180deg, #06264A 0%, #0B3763 50%, #06264A 100%)',
      }}
    >
      <div className="relative flex h-full min-h-0 flex-col">
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-[420px] overflow-hidden">
          <Image
            src="/sgcst-seal-watermark.png"
            alt=""
            width={480}
            height={480}
            className="absolute -bottom-44 -right-60 h-[480px] w-[480px] max-w-none object-contain opacity-[0.22]"
            style={{ filter: 'grayscale(1) sepia(1) hue-rotate(165deg) saturate(1.7) brightness(1.1)' }}
          />
          <span className="absolute bottom-10 -right-20 h-3 w-56 rotate-[-35deg] bg-[#FFB900]" />
          <span className="absolute bottom-8 -right-20 h-3 w-56 rotate-[-35deg] bg-[#F47721]" />
        </div>

        <div className="relative z-10 shrink-0 px-4 pb-3 pt-5 text-center">
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
          <h2 className="text-base font-extrabold leading-tight tracking-wide">SAINT GREGORY</h2>
          <p className="mt-0.5 text-[11px] font-bold uppercase leading-tight tracking-wide">
            College of Science and Technology
          </p>
          <div className="mx-1 mt-3 h-px bg-[#FFB900]/70" />

          {onClose && (
            <button
              onClick={onClose}
              className="absolute right-3 top-3 rounded-lg border border-transparent p-2 text-white transition-all hover:border-[#FFB900] hover:bg-[#FFB900]/20 focus-visible:outline-none md:hidden"
              aria-label="Close sidebar"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <nav className="relative z-10 min-h-0 flex-1 overflow-y-auto px-3 py-2">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    onClick={() => onClose && onClose()}
                    aria-current={isActive ? 'page' : undefined}
                    className={`group flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm font-bold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFB900] focus-visible:ring-offset-2 focus-visible:ring-offset-[#06264A] ${
                      isActive
                        ? 'border-[#FFB900] bg-[#FFB900] text-[#06264A] shadow-[0_2px_6px_rgba(0,0,0,0.18)]'
                        : 'border-transparent bg-transparent text-white hover:translate-x-0.5 hover:border-[#FFB900]/70 hover:bg-white/10 hover:shadow-sm'
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
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="h-5 w-5 shrink-0"
                      >
                        {item.icon}
                      </svg>
                    )}
                    <span className="truncate">{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="relative z-10 shrink-0 border-t border-white/20 p-3">
          <button
            onClick={handleLogout}
            className="group flex w-full cursor-pointer items-center gap-3 rounded-lg border border-[#c2410c] bg-[#e64b1b] px-4 py-2.5 text-left text-sm font-bold text-white shadow-md transition-colors duration-200 ease-in-out hover:border-[#ff9100] hover:bg-[#ff9100] hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFB900] active:scale-[0.98] motion-reduce:transition-none"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="h-5 w-5 shrink-0"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
            </svg>
            Exit
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;