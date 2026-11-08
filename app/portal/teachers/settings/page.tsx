"use client";

import React, { useState, useEffect } from 'react';
// ==========================================
// HOW TO APPLY TO OTHER PAGES (Step 1):
// Import your custom useAuthGuard hook at the top.
// Ensure the import path matches your project structure (e.g. "@/hooks/useAuthGuard").
// ==========================================
import { useAuthGuard } from "@/app/hooks/useAuthGuard";

const SettingsPage = () => {
  // ==========================================
  // HOW TO APPLY TO OTHER PAGES (Step 2):
  // Call useAuthGuard at the top of your component body.
  // - requiredPrefix: "TCH" ensures only valid teacher IDs can access account settings.
  // - redirectTo: Sends unauthorized users to the login screen.
  // - Aliased username as teacherId to preserve your existing code logic.
  // ==========================================
  const { username: teacherId, isAuthenticated, loading: authLoading } = useAuthGuard({
    requiredPrefix: "TCH",
    redirectTo: "/portal/log-in",
  });

  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  useEffect(() => {
    if (!isAuthenticated || !teacherId) return;

    const fetchTeacherProfile = async () => {
      try {
        const response = await fetch(`/api/portal/teacher?action=profile&id=${teacherId}`);
        const result = await response.json();

        if (result && result.success && result.data) {
          const firstName = result.data.first_name || "";
          const lastName = result.data.last_name || "";
          const combinedName = `${firstName} ${lastName}`.trim();
          const profileEmail = result.data.email || result.data.teacher_email || result.data.email_address || "";

          setName(combinedName);
          setEmail(profileEmail);
        }
      } catch (error) {
        console.error("Error loading profile configuration parameters:", error);
      }
    };

    fetchTeacherProfile();
  }, [isAuthenticated, teacherId]);

  const handleUpdateProfile = async () => {
    if (!teacherId) return alert("Error: Missing teacher identity session.");

    setIsUpdating(true);
    try {
      const response = await fetch(`/api/portal/teacher`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "updateProfile",
          teacherId: teacherId,
          name: name,
          email: email
        })
      });

      const result = await response.json();
      if (response.ok && result.success) {
        alert("Profile synchronized successfully!");
      } else {
        alert(result.message || "Failed to commit profile updates.");
      }
    } catch (error) {
      console.error("Mutation submission error:", error);
      alert("An error occurred while communicating with the data server.");
    } finally {
      setIsUpdating(false);
    }
  };

  // ==========================================
  // HOW TO APPLY TO OTHER PAGES (Step 3):
  // Render a clean loading screen while verifying credentials.
  // ==========================================
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 font-sans">
        <div className="text-center space-y-3">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-[#0B3763] border-t-transparent"></div>
          <p className="text-sm font-bold text-[#856404]">Verifying Security Credentials...</p>
        </div>
      </div>
    );
  }

  // ==========================================
  // HOW TO APPLY TO OTHER PAGES (Step 4):
  // Halt execution if unauthenticated to prevent content flashing.
  // ==========================================
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Account Settings</h2>

      <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-md sm:p-7">
        <div className="flex items-center gap-3 border-b border-[#FFB900] pb-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#0B3763] text-white">
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
              <path d="M12 12a4.25 4.25 0 1 0 0-8.5 4.25 4.25 0 0 0 0 8.5Zm0 2c-4.05 0-7.25 2.08-7.25 4.75v1.5h14.5v-1.5C19.25 16.08 16.05 14 12 14Z" />
            </svg>
          </span>
          <h3 className="text-xl font-extrabold tracking-tight text-[#06264A]">Profile Information</h3>
        </div>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-[#06264A]">
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                <path d="M12 12a4.25 4.25 0 1 0 0-8.5 4.25 4.25 0 0 0 0 8.5Zm0 2c-4.05 0-7.25 2.08-7.25 4.75v1.5h14.5v-1.5C19.25 16.08 16.05 14 12 14Z" />
              </svg>
              Display Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1.5 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 shadow-sm outline-none transition focus:border-[#0B3763] focus:ring-2 focus:ring-[#0B3763]/15"
            />
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-[#06264A]">
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                <path d="M3.5 6.75A2.25 2.25 0 0 1 5.75 4.5h12.5a2.25 2.25 0 0 1 2.25 2.25v.43l-8.5 5.1-8.5-5.1v-.43Zm0 2.18 8.11 4.87a.75.75 0 0 0 .78 0l8.11-4.87v8.32a2.25 2.25 0 0 1-2.25 2.25H5.75A2.25 2.25 0 0 1 3.5 17.25V8.93Z" />
              </svg>
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1.5 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 shadow-sm outline-none transition focus:border-[#0B3763] focus:ring-2 focus:ring-[#0B3763]/15"
            />
          </div>
        </div>
        <button
          onClick={handleUpdateProfile}
          disabled={isUpdating}
          className="inline-flex items-center gap-2 rounded-lg border-b-[3px] border-[#FFB900] bg-[#0B3763] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#06264A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B3763] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
            <path d="M20 7v5h-5M4 17v-5h5" />
            <path d="M5.64 9a7 7 0 0 1 11.6-2L20 12M4 12l2.76 5a7 7 0 0 0 11.6-2" />
          </svg>
          {isUpdating ? "Updating..." : "Update Profile"}
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;