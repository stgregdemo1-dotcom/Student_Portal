"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Header from "../../-components/aheader";
import Footer from "../../-components/afooter";
import Sidebar from "../../-components/Sidebar";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();
  const isFixedPage = pathname === "/portal/students/dashboard" || pathname === "/portal/students/schedule";

  useEffect(() => {
    if (!isSidebarOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isSidebarOpen]);

  return (
    <div className={`student-portal relative flex overflow-x-hidden ${isFixedPage ? "h-dvh overflow-hidden" : "min-h-screen"}`}>
      {/* Dark Mobile Backdrop Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Slide-out Mobile / Fixed Desktop Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content Body */}
      <div className="ml-0 flex min-h-0 w-full max-w-full flex-1 flex-col md:ml-64">
        <Header onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

        <main className={isFixedPage ? "min-h-0 flex-1 overflow-hidden p-1 sm:p-2" : "flex-1 p-4 md:p-6"}>
          {children}
        </main>

        <div className="shrink-0">
          <Footer />
        </div>
      </div>
    </div>
  );
}
