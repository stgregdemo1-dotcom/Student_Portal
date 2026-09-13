"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { name: 'Dashboard', href: '/portal/students/dashboard', icon: 'fa-home' },
  { name: 'Student Info', href: '/portal/students/profile', icon: 'fa-user' },
  { name: 'Student Grades', href: '/portal/students/grades', icon: 'fa-chart-bar' },
  { name: 'Student Schedule', href: '/portal/students/schedule', icon: 'fa-calendar-alt' },
  { name: 'Students Evaluation', href: '/portal/students/students-evaluation', icon: 'fa-user'},
];

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-64 bg-yellow-400 text-yellow-950 flex flex-col h-full shrink-0 shadow-lg border-r border-yellow-500 font-sans">
      <div className="p-6 border-b border-yellow-600/30 flex items-center gap-3">
        <i className="fas fa-graduation-cap text-2xl text-yellow-900"></i>
        <span className="text-xl font-bold uppercase tracking-tight">SGCST Portal</span>
      </div>
      <nav className="flex-1 overflow-y-auto p-3">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                    isActive ? 'bg-yellow-500/60 text-yellow-950 font-bold shadow-sm' : 'text-yellow-900/80 hover:bg-yellow-500/40 hover:text-yellow-950 font-bold'
                  }`}
                >
                  <i className={`fas ${item.icon} w-5 h-5 flex items-center justify-center opacity-70 group-hover:opacity-100`}></i>
                  <span className="text-sm font-bold">{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="p-4 border-t border-yellow-600/30">
        <button onClick={() => window.location.href = "/portal/log-in"} className="flex items-center gap-3 w-full px-4 py-3 text-red-700 rounded-lg hover:bg-red-600 hover:text-white transition-all font-bold text-sm">
          <i className="fas fa-sign-out-alt w-5 text-center"></i>
          <span className="font-bold">Logout</span>
        </button>
      </div>
    </aside>
  );
}