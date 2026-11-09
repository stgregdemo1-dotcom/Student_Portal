"use client";

import React, { useState, useEffect } from 'react';
// ==========================================
// HOW TO APPLY TO OTHER PAGES (Step 1):
// Import your custom useAuthGuard hook at the top.
// Ensure the import path matches your project structure (e.g. "@/hooks/useAuthGuard").
// ==========================================
import { useAuthGuard } from "@/hooks/useAuthGuard";

type SubjectRecord = {
  subject_id: string;
  subject_name: string;
  subject_code?: string;
};

export default function ClassSchedule() {
  // ==========================================
  // HOW TO APPLY TO OTHER PAGES (Step 2):
  // Call useAuthGuard at the top of your component body.
  // - requiredPrefix: "ADM" ensures only valid administrator accounts can access this page.
  // - redirectTo: Sends unauthorized users to the login screen.
  // ==========================================
  const { isAuthenticated, loading: authLoading } = useAuthGuard({
    requiredPrefix: "ADM",
    redirectTo: "/portal/log-in",
  });

  const [subjects, setSubjects] = useState<SubjectRecord[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [dataLoading, setDataLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchDropdownSubjects = async () => {
      try {
        setDataLoading(true);
        const res = await fetch("/api/portal/admin?table=subjects");

        if (res.ok) {
          const data = await res.json();
          const records: SubjectRecord[] = Array.isArray(data) ? data : data.data || [];
          records.sort((a, b) =>
            (a.subject_name || "").localeCompare(b.subject_name || "", undefined, { numeric: true })
          );

          setSubjects(records);
          if (records.length > 0) {
            setSelectedSubject(records[0].subject_name);
          }
        } else {
          console.error("Failed to load backend subject collection documentation arrays.");
        }
      } catch (err) {
        console.error("Network connection issue loading dropdown items:", err);
      } finally {
        setDataLoading(false);
      }
    };

    fetchDropdownSubjects();
  }, [isAuthenticated]);

  // ==========================================
  // HOW TO APPLY TO OTHER PAGES (Step 3):
  // Render a clean loading screen while verifying credentials.
  // ==========================================
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 font-sans">
        <div className="text-center space-y-3">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
          <p className="text-sm font-bold text-gray-600">Verifying Administrator Security Credentials...</p>
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
    <div className="p-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <h2 className="text-xl font-bold italic text-gray-800">Academic Timetable</h2>

          {/* Subject Selection Dropdown */}
          <div className="flex items-center gap-2">
            <label htmlFor="subject-select" className="text-sm font-medium text-gray-600">
              Select Subject:
            </label>
            {dataLoading ? (
              <span className="text-xs text-gray-400 animate-pulse">Loading subjects...</span>
            ) : (
              <select
                id="subject-select"
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition bg-white max-w-xs"
              >
                {subjects.length === 0 && (
                  <option value="">-- No Subjects Registered --</option>
                )}
                {subjects.map((subj) => (
                  <option key={subj.subject_id} value={subj.subject_name}>
                    {subj.subject_name}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Days Header */}
        <div className="grid grid-cols-7 gap-2">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
            <div key={day} className="text-center font-bold bg-gray-100 p-2 uppercase text-[10px] tracking-widest text-gray-700 rounded">
              {day}
            </div>
          ))}
        </div>

        {/* Schedule Content Area */}
        <div className="mt-4 border-2 border-dashed border-gray-100 rounded-lg h-64 flex flex-col items-center justify-center bg-gray-50">
          <p className="text-gray-500 text-sm">
            Displaying classes for <span className="font-bold text-blue-600">{selectedSubject || "None Selected"}</span>
          </p>
          <p className="text-xs text-gray-400 mt-2">No classes scheduled yet for this subject.</p>
        </div>
      </div>
    </div>
  );
}