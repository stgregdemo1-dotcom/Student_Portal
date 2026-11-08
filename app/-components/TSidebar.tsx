"use client";
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { name: 'Dashboard', href: '/portal/teachers/dashboard', icon: 'fa-gauge-high' },
  { name: 'Grades', href: '/portal/teachers/grades', icon: 'fa-graduation-cap' },
  { name: 'Schedule', href: '/portal/teachers/schedule', icon: 'fa-calendar-days' },
  { name: 'Master List', href: '/portal/teachers/masterlist', icon: 'fa-users' },
  { name: 'Settings', href: '/portal/teachers/settings', icon: 'fa-gear' },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  isDashboardPage?: boolean;
}

export default function Sidebar({ isOpen = false, onClose, isDashboardPage = false }: SidebarProps) {
  const pathname = usePathname();

  const handleLogout = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    
    // Clear the username cookie by setting its expiration date to the past
    if (typeof document !== "undefined") {
      document.cookie = "username=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    }

    // Also clear any custom local storage cache if applicable
    if (typeof window !== "undefined") {
      localStorage.removeItem("cached_teacher_id");
      localStorage.removeItem("cached_security_code");
    }

    // Close mobile sidebar if open
    if (onClose) onClose();

    // Navigate to the login page
    window.location.href = "/portal/log-in";
  };

  return (
    <aside 
      className={`fixed left-0 top-0 z-50 isolate h-dvh w-64 min-w-[16rem] shrink-0 overflow-hidden border-r border-white/10 bg-[#06264A] text-white shadow-[3px_0_10px_rgba(2,12,27,0.12)] transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 ${isDashboardPage ? 'md:sticky md:top-0 md:h-dvh' : 'md:static md:h-full'}`}
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
          <h1 className="text-base font-extrabold leading-tight tracking-wide">SAINT GREGORY</h1>
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
              <i className="fa-solid fa-xmark text-lg" aria-hidden="true"></i>
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
                      <i className={`fa-solid ${item.icon} flex h-5 w-5 items-center justify-center text-sm`} aria-hidden="true"></i>
                    )}
                    <span className="truncate">{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div aria-hidden="true" className="relative z-0 min-h-0 flex-1" />

        <div className="relative z-10 border-t border-white/20 p-3">
          <a
            href="/portal/log-in"
            onClick={handleLogout}
            className="flex w-full cursor-pointer items-center gap-3 rounded-lg border border-[#c2410c] bg-[#e64b1b] px-4 py-2.5 text-sm font-bold text-white shadow-md transition-colors duration-200 ease-in-out hover:border-[#ff9100] hover:bg-[#ff9100] hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFB900] active:scale-[0.98] motion-reduce:transition-none"
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
          </a>
        </div>
      </div>
    </aside>
  );
}