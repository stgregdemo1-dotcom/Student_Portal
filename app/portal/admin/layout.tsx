"use client";

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import './globals.css';
import Header from '../../-components/aheader';
import Footer from '../../-components/afooter';
import Sidebar from '../../-components/asidebar'; 

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();
  const isEventsPage = pathname === '/portal/admin/events';
  const isDashboardPage = pathname === '/portal/admin/dashboard';
  const isFixedHeightPage = isEventsPage || isDashboardPage;

  useEffect(() => {
    if (!isSidebarOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isSidebarOpen]);

  return (
    <html lang="en">
      <body className="admin-portal antialiased text-slate-900 bg-slate-50">
        <div className={`relative flex overflow-x-hidden ${isDashboardPage ? 'min-h-dvh overflow-y-auto md:h-dvh md:overflow-hidden' : isFixedHeightPage ? 'h-dvh overflow-hidden' : 'min-h-screen'}`}>
          {/* Mobile Overlay Backdrop */}
          {isSidebarOpen && (
            <div 
              className="fixed inset-0 bg-slate-900/50 z-40 md:hidden transition-opacity"
              onClick={() => setIsSidebarOpen(false)}
            />
          )}

          {/* Collapsible Sidebar */}
          <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

          {/* Main Content Area */}
          <div className={`ml-0 flex w-full max-w-full flex-1 flex-col md:ml-64 ${isDashboardPage ? 'min-h-dvh overflow-visible md:min-h-0 md:overflow-hidden' : isFixedHeightPage ? 'min-h-0 overflow-hidden' : 'min-h-screen'}`}>
            {/* Header receives toggle trigger */}
            <Header title="Admin Portal" onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
            
            <main className={`${isEventsPage ? "admin-events-page flex min-h-0 flex-1 flex-col overflow-hidden p-2 md:p-4" : isDashboardPage ? "admin-dashboard-page flex-none overflow-visible p-3 md:flex md:min-h-0 md:flex-1 md:flex-col md:overflow-hidden md:p-4" : "flex-1 p-4 md:p-6"}`}>
              {children}
            </main>

            <Footer />
          </div>
        </div>
      </body>
    </html>
  );
}
