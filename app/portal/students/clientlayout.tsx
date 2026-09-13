"use client";

import { useState } from "react";
import Sidebar from "../../-components/Sidebar";
import Header from "../../-components/sheader";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <html lang="en">
      <body className="flex h-screen overflow-hidden bg-gray-50">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="fixed top-4 left-4 z-50 w-10 h-10 bg-gray-800 text-white rounded-md flex items-center justify-center hover:bg-gray-700"
        >
          {sidebarOpen ? "✕" : "☰"}
        </button>

        <aside
          className={`fixed top-0 left-0 h-full w-64 z-40 bg-white border-r transition-transform duration-300 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <Sidebar />
        </aside>

        <div
          className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${
            sidebarOpen ? "ml-64" : "ml-0"
          }`}
        >
          <Header />

          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}