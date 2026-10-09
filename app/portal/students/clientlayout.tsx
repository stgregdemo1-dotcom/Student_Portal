"use client";

import { useState } from "react";
import Header from "../../-components/aheader";
import Footer from "../../-components/afooter";
import Sidebar from "../../-components/Sidebar"; // or asidebar depending on portal

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen relative overflow-x-hidden">
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
      <div className="flex-1 ml-0 md:ml-64 flex flex-col min-h-screen w-full max-w-full">
        <Header onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

        <main className="flex-1 p-4 md:p-6">{children}</main>

        <Footer />
      </div>
    </div>
  );
}