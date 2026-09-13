"use client";

import { useState, useEffect } from "react";

type SubjectRecord = {
  subject_id: string;
  subject_name: string;
  subject_specification: string;
  subject_day?: string;
  semester?: string; // 🚀 Kept tracking schema data definition
  class_time?: {
    start: string;    
    end: string;       
  };
  teacher_id?: string;    
  room?: string;       
};

const HOURS = [
  "06:00 AM", "07:00 AM", "08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
  "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM", "06:00 PM", "07:00 PM"
];

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function ClassSchedule() {
  const [sections, setSections] = useState<string[]>([]);
  const [selectedSection, setSelectedSection] = useState<string>("");
  // 🚀 NEW STATE: Store the selected semester filter choice
  const [selectedSemester, setSelectedSemester] = useState<string>("1"); 
  const [loading, setLoading] = useState<boolean>(true);
  
  const [subjects, setSubjects] = useState<SubjectRecord[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState<boolean>(false);
  const [activeModalSubject, setActiveModalSubject] = useState<SubjectRecord | null>(null);

  useEffect(() => {
    const fetchSections = async () => {
      try {
        const res = await fetch("/api/portal/admin?table=configuration");
        if (res.ok) {
          const configData = await res.json();
          if (configData && configData.section) {
            setSections(configData.section);
            if (configData.section.length > 0) {
              setSelectedSection(configData.section[0]);
            }
          }
        }
      } catch (err) {
        console.error("Network error fetching configuration sections:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSections();
  }, []);

  // 🚀 UPDATED EFFECT: Runs whenever selectedSection OR selectedSemester changes
  useEffect(() => {
    if (!selectedSection) return;

    const fetchFilteredSubjects = async () => {
      try {
        setLoadingSubjects(true);
        // 🚀 APPENDED SEMESTER FILTER PARAMETER TO THE DATABASE QUERY PIPELINE
        const res = await fetch(
          `/api/portal/admin?table=subjects&subject_year_section=${encodeURIComponent(selectedSection)}&semester=${encodeURIComponent(selectedSemester)}`
        );
        if (res.ok) {
          const data = await res.json();
          setSubjects(Array.isArray(data) ? data : data.data || []);
        }
      } catch (err) {
        console.error("Network error pulling filtered subjects:", err);
      } finally {
        setLoadingSubjects(false);
      }
    };
    fetchFilteredSubjects();
  }, [selectedSection, selectedSemester]); // Added selectedSemester as trigger dependency

  const normalizeTime = (timeStr: string | undefined): string => {
    if (!timeStr) return "";
    let clean = timeStr.trim().toUpperCase();
    if (clean.length === 7) { 
      clean = "0" + clean; 
    }
    return clean;
  };

  const getColumnIndex = (day: string | undefined): number => {
    if (!day) return 2;
    const cleanDay = day.trim().toLowerCase().substring(0, 3);
    const index = DAYS.findIndex((d) => d.toLowerCase().startsWith(cleanDay));
    return index !== -1 ? index + 2 : 2; 
  };

  const getTimeRowIndex = (timeStr: string | undefined): number => {
    const target = normalizeTime(timeStr);
    if (!target) return 1;

    const match = target.match(/^(\d{2}):(\d{2})\s(AM|PM)$/);
    if (!match) return 1;

    let [_, hourStr, minStr, period] = match;
    let hours = parseInt(hourStr, 10);
    let minutes = parseInt(minStr, 10);

    if (period === "PM" && hours !== 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;

    const baseTimelineMinutes = 6 * 60; 
    const targetMinutes = (hours * 60) + minutes;
    
    const relativeRow = ((targetMinutes - baseTimelineMinutes) / 60) + 1;
    return Math.max(1, relativeRow);
  };

  return (
    <div className="p-6 relative">
      <div className="bg-white p-6 rounded-lg shadow">
        
        {/* Top Header Controls Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <h2 className="text-xl font-bold italic text-gray-800">Academic Timetable</h2>

          {/* Wrapper flex layout row for both input items */}
          <div className="flex flex-wrap items-center gap-4">
            
            {/* Section Filter Dropdown */}
            <div className="flex items-center gap-2">
              <label htmlFor="section-select" className="text-sm font-medium text-gray-600">
                Select Section:
              </label>
              {loading ? (
                <span className="text-xs text-gray-400 animate-pulse">Loading setup...</span>
              ) : (
                <select
                  id="section-select"
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition bg-white"
                >
                  {sections.map((section) => (
                    <option key={section} value={section}>{section}</option>
                  ))}
                </select>
              )}
            </div>

            {/* 🚀 NEW: Semester Filter Dropdown beside Section Filter */}
            <div className="flex items-center gap-2">
              <label htmlFor="semester-select" className="text-sm font-medium text-gray-600">
                Semester:
              </label>
              <select
                id="semester-select"
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition bg-white font-medium text-gray-700"
              >
                <option value="1">1st Semester</option>
                <option value="2">2nd Semester</option>
              </select>
            </div>

          </div>
        </div>

        <p className="text-gray-500 text-sm mb-4">
          Displaying classes for <span className="font-bold text-blue-600">{selectedSection || "None"}</span> — <span className="text-gray-700 font-semibold">{selectedSemester === "1" ? "1st Semester" : "2nd Semester"}</span>
        </p>

        {/* Timetable Workspace Container */}
        <div className="border border-gray-200 rounded-xl overflow-x-auto bg-gray-50 relative">
          <div className="min-w-[800px]">
            
            {/* Header: Days column labels */}
            <div className="grid grid-cols-8 bg-gray-100 border-b border-gray-200 text-center font-bold uppercase text-[10px] tracking-widest text-gray-700 select-none">
              <div className="p-3 border-r border-gray-200 bg-gray-100 sticky left-0 z-20">Time</div>
              {DAYS.map((day) => (
                <div key={day} className="p-3 flex items-center justify-center">{day}</div>
              ))}
            </div>

            {/* Matrix Body Content Flow Layout Container */}
            <div className="relative bg-white">
              {loadingSubjects && (
                <div className="absolute inset-0 min-h-[30rem] flex items-center justify-center bg-white/80 z-20 text-sm text-gray-400 font-medium animate-pulse">
                  Filtering subjects data grid...
                </div>
              )}

              {/* 1. Underlying Layout Grid Lines */}
              <div className="absolute inset-0 grid grid-cols-8 divide-x divide-gray-100 pointer-events-none z-0">
                <div className="bg-gray-50/50 sticky left-0 border-r border-gray-200 z-10" />
                {DAYS.map((day) => <div key={day} />)}
              </div>

              {/* 2. Background Time Grid Slots (Rows) */}
              <div className="relative flex flex-col divide-y divide-gray-100 z-10">
                {HOURS.map((timeSlot) => (
                  <div key={timeSlot} className="grid grid-cols-8 h-[5rem] hover:bg-gray-50/10 transition-colors">
                    <div className="p-3 text-right pr-4 text-[11px] font-semibold font-mono text-gray-400 bg-gray-50/70 border-r border-gray-200 flex items-center justify-end sticky left-0 z-10 select-none">
                      {timeSlot}
                    </div>
                    {DAYS.map((day) => (
                      <div key={day} className="border-r border-gray-100/50" />
                    ))}
                  </div>
                ))}
              </div>

              {/* 3. Subject Placement Grid Matrix Layer */}
              <div 
                className="absolute inset-0 grid grid-cols-8 pointer-events-none p-1 gap-x-1.5 z-15"
                style={{ gridTemplateRows: `repeat(${HOURS.length}, 5rem)` }}
              >
                {!loadingSubjects && subjects.map((subj) => {
                  const colStart = getColumnIndex(subj.subject_day);
                  const rowStart = getTimeRowIndex(subj.class_time?.start);
                  const rowEnd = getTimeRowIndex(subj.class_time?.end);

                  return (
                    <div
                      key={subj.subject_id}
                      className="pointer-events-auto p-0.5 h-full w-full"
                      style={{
                        gridColumnStart: colStart,
                        gridRow: `${rowStart} / ${rowEnd}` 
                      }}
                      onClick={() => setActiveModalSubject(subj)}
                    >
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-2.5 text-left shadow-sm hover:border-blue-400 hover:bg-blue-100/50 cursor-pointer transition-all h-full flex flex-col justify-between overflow-hidden">
                        <div>
                          <div className="font-bold text-blue-900 text-[11px] leading-tight break-words">
                            {subj.subject_name}
                          </div>
                          <div className="text-[10px] text-gray-400 font-mono mt-0.5">
                            ID: {subj.subject_id}
                          </div>
                        </div>
                        <div className="text-[9px] text-blue-600 font-semibold font-mono mt-1 opacity-90 border-t border-blue-100 pt-1">
                          {subj.class_time?.start} - {subj.class_time?.end}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* SUBJECT INFORMATION POPUP MODAL COMPONENT LAYER */}
      {activeModalSubject && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all">
          <div className="bg-white rounded-xl shadow-xl border border-gray-100 max-w-sm w-full overflow-hidden transform scale-100 transition-all animate-in fade-in zoom-in-95 duration-200">
            
            <div className="bg-blue-600 px-6 py-4 flex items-center justify-between">
              <h3 className="text-white font-bold text-base tracking-wide">Subject Details</h3>
              <button 
                onClick={() => setActiveModalSubject(null)}
                className="text-white/80 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition text-sm font-bold font-mono outline-none"
                aria-label="Close details popup"
              >
                ✕
              </button>
            </div>

            <div className="p-6 flex flex-col gap-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-0.5">Subject Title</label>
                <p className="text-gray-900 font-bold text-lg leading-snug">{activeModalSubject.subject_name}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-0.5">Subject ID</label>
                  <p className="text-gray-700 font-mono text-sm font-medium bg-gray-50 px-2 py-1 rounded border inline-block">
                    {activeModalSubject.subject_id}
                  </p>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-0.5">Specification</label>
                  <p className="text-blue-600 font-bold text-sm">{activeModalSubject.subject_specification}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-0.5">Teacher</label>
                  <p className="text-gray-800 text-sm font-medium truncate">
                    {activeModalSubject.teacher_id || "Not Assigned"}
                  </p>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-0.5">Room</label>
                  <p className="text-gray-800 text-sm font-mono font-medium">
                    {activeModalSubject.room || "N/A"}
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-3">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">Schedule Window</label>
                <div className="flex items-center gap-2 text-xs font-semibold text-gray-600 bg-gray-50 border p-2.5 rounded-lg">
                  <span className="bg-blue-100 text-blue-800 text-[10px] uppercase font-bold px-2 py-0.5 rounded tracking-wide">
                    {activeModalSubject.subject_day}
                  </span>
                  <span className="font-mono text-gray-700">
                    {activeModalSubject.class_time?.start} - {activeModalSubject.class_time?.end}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 px-6 py-3 border-t flex justify-end">
              <button
                onClick={() => setActiveModalSubject(null)}
                className="bg-white border border-gray-300 hover:border-gray-400 text-gray-700 text-xs font-bold px-4 py-2 rounded-lg shadow-sm transition outline-none"
              >
                Close Window
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}