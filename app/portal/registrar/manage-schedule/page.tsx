"use client"; // This must be the very first line

import React, { useState, useEffect } from 'react';

type SubjectRecord = {
  subject_id: string;
  subject_name: string;
  subject_code?: string; // Standard matching field format variants
};

export default function ClassSchedule() {
  // 🚀 Track loaded subjects database records dynamically
  const [subjects, setSubjects] = useState<SubjectRecord[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // 🚀 Pull dynamic data array streams directly matching your subjects collection layout
  useEffect(() => {
    const fetchDropdownSubjects = async () => {
      try {
        setIsLoading(true);
        const res = await fetch("/api/portal/admin?table=subjects");
        
        if (res.ok) {
          const data = await res.json();
          const records: SubjectRecord[] = Array.isArray(data) ? data : data.data || [];
          
          // Alphanumerically sort options naturally by subject name
          records.sort((a, b) => 
            (a.subject_name || "").localeCompare(b.subject_name || "", undefined, { numeric: true })
          );

          setSubjects(records);

          // Auto-select the first subject found if available
          if (records.length > 0) {
            setSelectedSubject(records[0].subject_name);
          }
        } else {
          console.error("Failed to load backend subject collection documentation arrays.");
        }
      } catch (err) {
        console.error("Network connection issue loading dropdown items:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDropdownSubjects();
  }, []);

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
            {isLoading ? (
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