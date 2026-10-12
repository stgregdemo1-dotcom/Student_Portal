"use client";

import { useEffect, useState } from "react";

interface HeaderProps {
  onToggleSidebar?: () => void;
}

export default function Header({ onToggleSidebar }: HeaderProps) {
  const [welcomeText, setWelcomeText] = useState<string>("Welcome, Guest");
  const [userInitial, setUserInitial] = useState<string>("U");

  useEffect(() => {
    // Helper function to get cookie value by name
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(";").shift();
    };

    const username = getCookie("username");

    if (username) {
      const upperUsername = username.toUpperCase();
      setUserInitial(username.charAt(0).toUpperCase());

      if (upperUsername.startsWith("ST")) {
        // Fetch the student's first and last name from your API route
        fetch("/api/portal/student?getStudentName=true") // Update path if your route is nested differently (e.g., /api/student)
          .then((res) => res.json())
          .then((data) => {
            if (data && data.success && data.firstName && data.lastName) {
              setWelcomeText(`Welcome, ${data.firstName} ${data.lastName}`);
            } else {
              setWelcomeText("Welcome, Student");
            }
          })
          .catch(() => {
            setWelcomeText("Welcome, Student");
          });
      } else {
        let role = "User";

        if (upperUsername.startsWith("ADM")) {
          role = "Admin";
        } else if (upperUsername.startsWith("REG")) {
          role = "Registrar";
        } else if (upperUsername.startsWith("TCH")) {
          role = "Teacher";
        }

        setWelcomeText(`Welcome, ${role}`);
      }
    }
  }, []);

  return (
    <header className="h-16 bg-white border-b flex items-center justify-between px-4 md:px-6 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger Toggle Button */}
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 md:hidden focus:outline-none transition-colors"
          aria-label="Toggle navigation drawer"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
            />
          </svg>
        </button>

        <h2 className="text-lg md:text-xl font-semibold text-gray-800">
          Overview
        </h2>
      </div>

      <div className="flex items-center gap-3 md:gap-4">
        <span className="text-xs md:text-sm text-gray-600 font-medium">
          {welcomeText}
        </span>
        <div className="w-8 h-8 bg-amber-500 text-yellow-950 font-bold rounded-full flex items-center justify-center text-xs shadow-sm">
          {userInitial}
        </div>
      </div>
    </header>
  );
}