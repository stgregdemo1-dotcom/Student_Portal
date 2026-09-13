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

export default function Sidebar() {
  const pathname = usePathname();
  
  // 🚀 NEW: Manage states for the authenticated teacher profile info
  const [teacherName, setTeacherName] = useState<string>("Loading profile...");

  // Helper to extract cookie values on the client side
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
        // 🚀 Extract logged-in teacher identity (checks cookie string or fallback storage token)
        const cachedId = getCookie("audit_user") || localStorage.getItem("teacher_id");

        if (!cachedId) {
          setTeacherName("Guest Instructor");
          return;
        }

        // Hit your dynamic registrar/portal route for the 'teachers' collection
        const res = await fetch(`/api/portal/teacher?table=teachers&id=${cachedId}&action=profile`);
        if (res.ok) {
          const jsonResponse = await res.json();
          const teacherData = jsonResponse.data || jsonResponse;

          if (teacherData) {
            const prefix = teacherData.prefix;
            const nameString = `${prefix} ${teacherData.first_name} ${teacherData.last_name}`;
            setTeacherName(nameString);
          } else {
            setTeacherName(cachedId); // Fallback to raw ID string if record doesn't exist
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
    <aside className="w-64 bg-yellow-400 text-yellow-950 flex flex-col h-full shrink-0 shadow-lg border-r border-yellow-500 font-sans">
      <div className="p-6 border-b border-yellow-600/30">
        <h1 className="text-xl font-bold uppercase tracking-tight">Teacher Portal</h1>
        {/* 🚀 UPDATED: Outputs your active dynamically loaded state string */}
        <p className="text-sm font-bold opacity-60 truncate" title={teacherName}>
          {teacherName}
        </p>
      </div>
      <nav className="flex-1 overflow-y-auto p-3">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
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
        <Link href="/portal/log-in" className="flex items-center gap-3 w-full px-4 py-3 text-red-700 hover:bg-red-600 hover:text-white transition-all rounded-lg font-bold text-sm">
          <i className="fas fa-sign-out-alt w-5 text-center"></i> 
          <span className="font-bold">Logout</span>
        </Link>
      </div>
    </aside>
  );
}