"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

const navItems = [
  { name: 'Dashboard', href: '/portal/teachers/dashboard', icon: 'fas fa-tachometer-alt' },
  { name: 'Grades', href: '/portal/teachers/grades', icon: 'fas fa-graduation-cap' },
  { name: 'Schedule', href: '/portal/teachers/schedule', icon: 'fas fa-calendar-alt' },
  { name: 'Master List', href: '/portal/teachers/masterlist', icon: 'fas fa-users' },
  { name: 'Settings', href: '/portal/teachers/settings', icon: 'fas fa-cog' },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  
  const [teacherName, setTeacherName] = useState<string>("Loading profile...");

  const getCookie = (name: string) => {
    if (typeof document === "undefined") return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift();
    return null;
  };

  useEffect(() => {
    const fetchTeacherProfile = async () => {
      try {
        const cachedId = getCookie("audit_user") || localStorage.getItem("teacher_id");

        if (!cachedId) {
          setTeacherName("Guest Instructor");
          return;
        }

        const res = await fetch(`/api/portal/teacher?table=teachers&id=${cachedId}&action=profile`);
        if (res.ok) {
          const jsonResponse = await res.json();
          const teacherData = jsonResponse.data || jsonResponse;

          if (teacherData) {
            const prefix = teacherData.prefix;
            const nameString = `${prefix} ${teacherData.first_name} ${teacherData.last_name}`;
            setTeacherName(nameString);
          } else {
            setTeacherName(cachedId);
          }
        } else {
          setTeacherName(cachedId);
        }
      } catch (err) {
        console.error("Failed loading teacher profile context inside sidebar component:", err);
        setTeacherName("Teacher Account");
      }
    };

    fetchTeacherProfile();
  }, []);

  return (
    <aside 
      className={`
        fixed left-0 top-0 h-screen w-64 bg-yellow-400 text-yellow-950 flex flex-col z-50 shadow-lg border-r border-yellow-500 font-sans
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0 md:static md:h-full md:shrink-0
      `}
    >
      <div className="p-6 border-b border-yellow-600/30 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold uppercase tracking-tight">Teacher Portal</h1>
          <p className="text-sm font-bold opacity-60 truncate max-w-[160px]" title={teacherName}>
            {teacherName}
          </p>
        </div>

        {/* Mobile Close Button */}
        {onClose && (
          <button 
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-yellow-500/40 text-yellow-950 md:hidden transition-colors"
            aria-label="Close sidebar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto p-3">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  onClick={() => onClose && onClose()}
                  className={`flex items-center gap-3 px-4 py-3 transition-all duration-200 rounded-lg group ${
                    isActive ? 'bg-yellow-500/60 text-yellow-950 font-bold shadow-sm' : 'text-yellow-900/80 hover:bg-yellow-500/40 hover:text-yellow-950 font-bold'
                  }`}
                >
                  <i className={`${item.icon} w-5 h-5 flex items-center justify-center opacity-70 group-hover:opacity-100`}></i>
                  <span className="text-sm font-bold">{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-yellow-600/30">
        <Link 
          href="/portal/log-in" 
          onClick={() => onClose && onClose()}
          className="flex items-center gap-3 w-full px-4 py-3 text-red-700 hover:bg-red-600 hover:text-white transition-all rounded-lg font-bold text-sm"
        >
          <i className="fas fa-sign-out-alt w-5 text-center"></i> 
          <span className="font-bold">Logout</span>
        </Link>
      </div>
    </aside>
  );
}