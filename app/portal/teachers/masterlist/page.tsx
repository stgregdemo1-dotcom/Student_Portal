"use client";

import React, { useState, useEffect } from "react";

interface Subject {
  _id: string; 
  sched_code: string;
  subject_id: string;
  subject_name: string;
  subject_year_section: string;
  room: string; // Used for display directly in the table row matrix
  subject_specification?: string;
  semester: string;
}

export default function MasterListPage() {
  const [teacherId, setTeacherId] = useState<string>("");
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState<boolean>(true);

  // 1. Safe cookie reader helper
  const getCookie = (name: string): string => {
    if (typeof document === "undefined") return "";
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || "";
    return "";
  };

  // 2. Load teacher account context on mount
  useEffect(() => {
    const cachedUsername = getCookie("username");
    if (cachedUsername) {
      setTeacherId(cachedUsername);
    } else {
      console.warn("No authentication username cookie detected.");
      setLoading(false);
    }
  }, []);

  // 3. Dynamic database pipeline lookup matching your GET handler
  useEffect(() => {
    if (!teacherId) return;

    const fetchTeacherSubjects = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/portal/teacher?id=${teacherId}&action=subjects`);
        const result = await response.json();
        
        if (result && result.subjects) {
          setSubjects(result.subjects);
        }
      } catch (error) {
        console.error("Failed to parse assigned database master lists:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherSubjects();
  }, [teacherId]);

  // 4. Live keyword query filtering
  const filteredSubjects = subjects.filter(
    (s) =>
      s.subject_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.sched_code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.subject_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.subject_year_section?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.room?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-10 text-center font-bold text-gray-500 animate-pulse">
        Retrieving your assigned subjects master lists...
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header Container */}
      <div className="p-4 bg-white flex flex-col md:flex-row justify-between items-center shadow-sm rounded-t-xl border border-gray-200 border-b-gray-100 gap-4">
        <div className="flex flex-col md:flex-row items-center gap-4 w-full">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Master List</h2>
            <p className="text-xs text-gray-500 hidden md:block">
              Overview of all active subjects assigned to Teacher: <span className="font-mono font-bold text-blue-600">{teacherId || "N/A"}</span>
            </p>
          </div>

          <div className="relative w-full md:w-64 md:ml-auto">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, code, section, or room..."
              className="w-full pl-3 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Main Table Matrix */}
      <div className="bg-white p-6 shadow-sm rounded-b-xl border border-t-0 border-gray-200 overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="text-gray-500 uppercase text-xs border-b border-gray-200 bg-gray-50/50">
              <th className="p-4 font-semibold text-gray-700">Schedule Code</th>
              <th className="p-4 font-semibold text-gray-700">Subject Details</th>
              <th className="p-4 font-semibold text-gray-700">Year & Section</th>
              {/* REPLACED: Changed from Actions to Room header column */}
              <th className="p-4 font-semibold text-gray-700 text-center">Room</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {filteredSubjects.map((item) => (
              <tr key={item.sched_code} className="hover:bg-gray-50/80 transition">
                {/* Schedule Code */}
                <td className="p-4 text-gray-500 font-mono text-sm font-bold">
                  {item.sched_code}
                </td>

                {/* Subject Name Details */}
                <td className="p-4">
                  <div className="font-bold text-gray-800 leading-tight">
                    {item.subject_name}
                  </div>
                  <div className="text-[10px] text-gray-400 font-mono mt-0.5 uppercase tracking-wider">
                    ID: {item.subject_id} | {item.subject_specification || "General"}
                  </div>
                </td>

                {/* Year and Section Badge Display */}
                <td className="p-4 text-gray-600">
                  <span className="px-2.5 py-1 bg-slate-100 rounded-md text-xs font-bold text-slate-600 border border-slate-200 uppercase">
                    {item.subject_year_section || "TBA"}
                  </span>
                </td>

                {/* REPLACED: Injected dynamic room identifier string instead of action buttons */}
                <td className="p-4 text-center">
                  <span className="text-sm font-mono font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-100 uppercase tracking-wide">
                    {item.room || "TBA"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredSubjects.length === 0 && (
          <div className="text-center py-14 text-gray-400 italic text-sm">
            No subjects currently matching database query records.
          </div>
        )}
      </div>
    </div>
  );
}