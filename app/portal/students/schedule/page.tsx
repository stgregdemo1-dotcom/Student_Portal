"use client";

import React, { useState, useEffect } from "react";

interface SubjectSchedule {
  sched_code: string;
  subject_id: string;
  subject_name: string;
  room: string;
  semester: string;
  "subject-day": string; 
  subject_specification?: string;
  class_time: {
    start: string; 
    end: string;   
  };
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"] as const;

// Explicitly define our 12 hourly intervals
const TIME_BLOCKS = [
  { start: "7:00 AM" },
  { start: "8:00 AM" },
  { start: "9:00 AM" },
  { start: "10:00 AM" },
  { start: "11:00 AM" },
  { start: "12:00 PM", isLunch: true },
  { start: "1:00 PM" },
  { start: "2:00 PM" },
  { start: "3:00 PM" },
  { start: "4:00 PM" },
  { start: "5:00 PM" },
  { start: "6:00 PM" },
];

const getTimeGridLine = (timeStr: string): number => {
  if (!timeStr) return 2;
  const cleanTime = timeStr.trim().toUpperCase();
  
  const match = cleanTime.match(/^(\d+):/);
  if (!match) return 2;
  const hour = parseInt(match[1]);
  const isPM = cleanTime.includes("PM");

  let militaryHour = hour;
  if (isPM && hour !== 12) militaryHour += 12;
  if (!isPM && hour === 12) militaryHour = 0;

  const baseHour = 7;
  const trackLine = (militaryHour - baseHour) + 2;
  
  return Math.max(2, Math.min(trackLine, 14)); 
};

export default function StudentSchedulePage() {
  const [studentId, setStudentId] = useState<string>("");
  const [schedules, setSchedules] = useState<SubjectSchedule[]>([]);
  const [selectedSemester, setSelectedSemester] = useState<string>("1st Semester");
  const [loading, setLoading] = useState<boolean>(true);

  const getCookie = (name: string): string => {
    if (typeof document === "undefined") return "";
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || "";
    return "";
  };

  useEffect(() => {
    const cachedUsername = getCookie("username");
    if (cachedUsername) {
      setStudentId(cachedUsername);
    } else {
      console.warn("No authentication student session found.");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!studentId) return;

    const fetchStudentSchedule = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/portal/student?getSchedule=true`);
        const result = await response.json();
        
        if (result && result.success && result.subjects) {
          setSchedules(result.subjects);
        } else {
          console.warn("No active schedules matched this profile query layout.");
        }
      } catch (error) {
        console.error("Error pulling active student schedule records:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStudentSchedule();
  }, [studentId]);

  const filteredSchedules = schedules.filter((subject) => {
    const dbTargetCode = selectedSemester === "1st Semester" ? "1" : "2";
    return String(subject.semester).trim() === dbTargetCode;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 font-bold text-gray-500">
        Syncing calendar schedule matrix with student record profile...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-gradient-to-br from-slate-100 to-slate-300 p-2 md:p-10 font-sans gap-8">
      <div className="w-full max-w-7xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
        
        {/* Header Banner */}
        <div className="bg-black text-white p-5 border-b border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-black uppercase tracking-[0.2em]">Weekly Time Grid</h1>
            <p className="text-[9px] font-bold opacity-50 mt-1 uppercase tracking-[0.4em]">
              Student ID Logged In: {studentId || "Guest Mode"}
            </p>
          </div>

          <div className="flex justify-center items-center gap-2">
            <label htmlFor="semester-select" className="text-xs font-black uppercase tracking-wider opacity-70 text-white">Semester:</label>
            <select
              id="semester-select"
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="bg-gray-900 border border-gray-700 text-white text-xs font-bold rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-gray-500 cursor-pointer min-w-[160px]"
            >
              <option value="1st Semester">1st Semester</option>
              <option value="2nd Semester">2nd Semester</option>
            </select>
          </div>
        </div>

        {/* Dynamic CSS Grid Wrapper */}
        <div className="p-4 md:p-6 overflow-x-auto">
          <div 
            className="min-w-[950px] grid border border-gray-200 rounded-xl overflow-hidden bg-gray-50/30" 
            style={{ 
              gridTemplateColumns: "100px repeat(5, minmax(0, 1fr))", 
              gridTemplateRows: "auto repeat(12, minmax(60px, auto))" 
            }}
          >
            
            {/* Row 1: Headers */}
            <div className="bg-black text-white p-3 px-4 text-center font-black border-b border-r border-gray-800 uppercase tracking-widest text-[9px] flex items-center justify-center min-w-0 w-[100px]">Time</div>
            {DAYS.map((day) => (
              <div key={day} className="bg-black text-white p-3 text-center font-black border-b border-r last:border-r-0 border-gray-800 uppercase tracking-widest text-[9px] flex items-center justify-center min-w-0">
                {day}
              </div>
            ))}

            {/* 🚀 FIXED: Map each interval directly to its corresponding row track */}
            {TIME_BLOCKS.map((block, index) => {
              const rowStart = index + 2; // Shift by 2 because row 1 is the header
              return (
                <div
                  key={index}
                  style={{
                    gridColumnStart: 1,
                    gridRowStart: rowStart,
                  }}
                  className={`border-r border-b border-gray-200 font-mono text-[8px] text-gray-500 font-bold text-center flex flex-col items-center justify-center leading-normal bg-gray-50 w-[100px] min-w-0 p-1 ${
                    block.isLunch ? "bg-yellow-50/40 text-yellow-700 font-black" : ""
                  }`}
                >
                  <span>{block.start}</span>
                </div>
              );
            })}

            {/* Continuous Lunch Break Spacer (Spans all columns on Row Track 7) */}
            <div className="col-start-2 col-span-5 row-start-7 bg-yellow-50/50 text-center p-3 border-y border-yellow-100 flex items-center justify-center min-w-0">
              <div className="text-yellow-700 font-black uppercase tracking-[0.4em] text-[10px] italic">Lunch Break</div>
            </div>

            {/* Render Spanning Subjects Directly into the Grid Layout Matrix */}
            {filteredSchedules.map((sub, index) => {
              const dayIndex = DAYS.indexOf(sub["subject-day"] as any);
              if (dayIndex === -1) return null;

              const colStart = dayIndex + 2; 
              const startTrack = getTimeGridLine(sub.class_time?.start);
              const endTrack = getTimeGridLine(sub.class_time?.end);

              const spec = sub.subject_specification?.toLowerCase().trim() || "";
              let colorStyle = "bg-gray-50 border-l-4 border-l-gray-400 text-gray-800";

              switch (spec) {
                case "core":
                  colorStyle = "bg-blue-50/80 hover:bg-blue-100 border-l-4 border-l-blue-500 text-gray-800 shadow-sm";
                  break;
                case "applied":
                  colorStyle = "bg-teal-50/80 hover:bg-teal-100 border-l-4 border-l-teal-500 text-gray-800 shadow-sm";
                  break;
                case "specialized":
                  colorStyle = "bg-purple-50/80 hover:bg-purple-100 border-l-4 border-l-purple-500 text-gray-800 shadow-sm";
                  break;
                case "other_subjects":
                case "other":
                  colorStyle = "bg-orange-50/80 hover:bg-orange-100 border-l-4 border-l-orange-500 text-gray-800 shadow-sm";
                  break;
              }

              return (
                <div
                  key={index}
                  className={`m-1 p-2.5 rounded-lg transition-all flex flex-col justify-between border border-gray-200/40 min-w-0 overflow-hidden ${colorStyle}`}
                  style={{
                    gridColumnStart: colStart,
                    gridRowStart: startTrack,
                    gridRowEnd: endTrack,
                  }}
                >
                  <div className="font-black leading-tight uppercase text-[10px] tracking-tight text-center line-clamp-2">
                    {sub.subject_name || sub.subject_id}
                  </div>
                  
                  <div className="mt-1 text-left flex flex-col gap-0.5 border-t border-gray-200/50 pt-1">
                    <div className="text-[8px] text-gray-400 font-bold italic uppercase opacity-80 truncate">
                      Room: {sub.room || "—"}
                    </div>
                    <div className="text-[8px] text-indigo-500 font-mono font-black uppercase truncate">
                      Code: {sub.sched_code || "—"}
                    </div>
                    <div className="text-[7.5px] text-emerald-600 font-mono font-bold tracking-tighter uppercase truncate">
                      ⏱️ {sub.class_time?.start} - {sub.class_time?.end}
                    </div>
                  </div>
                </div>
              );
            })}

          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap justify-center gap-6 p-6 text-[8px] font-black uppercase tracking-[0.2em] border-t bg-gray-50/50">
          {['Core Tracks', 'Applied Modules', 'Specialized Paths', 'Other Subjects'].map((name, idx) => {
            const colors = ['bg-blue-500', 'bg-teal-500', 'bg-purple-500', 'bg-orange-500'];
            return (
              <div key={name} className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${colors[idx]} border border-gray-200`}></div>
                <span className="text-gray-400">{name}</span>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}