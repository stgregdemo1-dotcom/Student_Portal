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
    { name: 'Dashboard', href: '/portal/registrar/dashboard', icon: <path d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /> },
    { name: 'Admission Requests', href: '/portal/registrar/admission', icon: <path d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z" /> },
    { name: 'Enrollment Requests', href: '/portal/registrar/enrollment', icon: <path d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" /> },
    { name: 'Manage Students', href: '/portal/registrar/manage-students', icon: <path d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" /> },
    { name: 'Grades Management', href: '/portal/registrar/manage-grades', icon: <path d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" /> },
    { name: 'Evaluation Requests', href: '/portal/registrar/students-evaluation', icon: <path d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" /> },
    { name: 'Student List', href: '/portal/registrar/student-list', icon: <path d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /> },
  ];

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      // Clear client storage caches and username records
      localStorage.clear();
      sessionStorage.clear();

      // Clear all active browser cookies by expiring them
      const cookies = document.cookie.split(";");
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i];
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim();
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
      }
    }

    console.log("User logged out, cookies and cache cleared");
    window.location.href = '/portal/log-in'; 
  };

  return (
    <aside 
      className={`
        fixed left-0 top-0 isolate h-dvh w-64 overflow-hidden bg-[#06264A] text-white flex flex-col z-50 shadow-[3px_0_10px_rgba(2,12,27,0.12)]
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

        <nav className="relative z-10 flex-1 overflow-y-auto px-3 py-2">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.name}>
              <Link 
                href={item.href}
                onClick={() => onClose && onClose()}
                aria-current={pathname === item.href ? 'page' : undefined}
                className={`group flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm font-bold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFB900] focus-visible:ring-offset-2 focus-visible:ring-offset-[#06264A] ${
                  pathname === item.href
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
          ))}
        </ul>
        </nav>

        <div className="relative z-10 border-t border-white/20 p-3">
        <button
          onClick={handleLogout}
          className="registrar-exit-button group flex w-full cursor-pointer items-center gap-3 rounded-lg border border-[#c2410c] bg-[#e64b1b] px-4 py-2.5 text-left text-sm font-bold text-white shadow-md transition-colors duration-200 ease-in-out hover:border-[#ff9100] hover:bg-[#ff9100] hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFB900] active:scale-[0.98] motion-reduce:transition-none"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            strokeWidth={2} 
            stroke="currentColor" 
            className="w-5 h-5 shrink-0"
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