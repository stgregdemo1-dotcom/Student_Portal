"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import THeader from "../../-components/THeader";
import TSidebar from "../../-components/TSidebar";
import Footer from "../../-components/afooter";

export default function TeacherClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();
  const isSchedulePage = pathname === "/portal/teachers/schedule";
  const isDashboardPage = pathname === "/portal/teachers/dashboard";
  useEffect(() => {
    if (!isSidebarOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isSidebarOpen]);

  return (
    <div className={`teacher-portal relative flex overflow-x-clip ${isDashboardPage ? "min-h-dvh" : "h-dvh overflow-hidden"}`}>
      {isSidebarOpen && (
        <button
          type="button"
          aria-label="Close navigation menu"
          className="fixed inset-0 z-40 bg-slate-900/50 transition-opacity md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <TSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        isDashboardPage={isDashboardPage}
      />

      <div className={`flex min-w-0 flex-1 flex-col ${isDashboardPage ? "overflow-visible" : isSchedulePage ? "overflow-hidden" : "overflow-y-auto"}`}>
        <THeader onToggleSidebar={() => setIsSidebarOpen((open) => !open)} />
        <main className={`min-w-0 ${isSchedulePage ? "min-h-0 flex-1 overflow-hidden p-2" : isDashboardPage ? "flex-none overflow-visible p-2 md:p-4" : "flex-1 p-6"}`}>
          {children}
        </main>
        <div className="shrink-0">
          <Footer />
        </div>
      </div>
    </div>
  );
}
