"use client";

import { useState, useEffect } from "react";

export default function Header() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHeaderProfile = async () => {
      try {
        const res = await fetch("/api/portal/student");
        const jsonResponse = await res.json();

        if (res.ok && jsonResponse.success) {
          setProfile(jsonResponse.data);
        }
      } catch (err) {
        console.error("Failed to load header profile states:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHeaderProfile();
  }, []);

  // 🚀 Fallback variables while loading or if data fetch fails
  const fullName = profile 
    ? `${profile.first_name} ${profile.last_name}` 
    : "Loading...";
  
  const displayId = profile 
    ? `ID: ${profile.student_id}` 
    : "ST-XXXX-XXXXX";

  const initials = profile 
    ? `${profile.first_name?.[0] || ""}${profile.last_name?.[0] || ""}`.toUpperCase() 
    : "--";

  return (
    <header className="bg-white border-b px-6 py-4 flex justify-between items-center shadow-sm z-10">
      <h1 className="text-xl font-bold text-gray-800">Portal</h1>
      <div className="flex items-center gap-3">
        
        {/* Dynamic Name and ID Display container */}
        <div className="hidden sm:block text-right">
          <p className="text-sm font-semibold text-gray-700 leading-none">
            {fullName}
          </p>
          <p className="text-xs text-gray-500 mt-1 font-mono">
            {displayId}
          </p>
        </div>
        
        {/* Dynamic Circular Avatar Avatar Badge */}
        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs uppercase animate-fade-in">
          {initials}
        </div>

      </div>
    </header>
  );
}