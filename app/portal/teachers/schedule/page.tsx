"use client";

import { useState, useEffect } from "react";

interface SubjectSchedule {
  sched_code: string;
  subject_id: string;
  subject_name: string;
  room: string;
  semester: string; 
  subject_day: string; // 🚀 FIXED: Changed from "subject-day" to match MongoDB's subject_day
  subject_specification?: string; 
  class_time: {
    start: string; 
    end: string;   
  };
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"] as const;

const HOURS = [
  "7:00 AM", "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
  "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM", "6:00 PM", "7:00 PM"
];

function getSpecificationStyle(subject_specification?: string) {
  const spec = subject_specification?.toLowerCase().trim() || "";
  switch (spec) {
    case "core":
      return {
        card: "bg-blue-50/95 border-blue-200 hover:bg-blue-100/60",
        border: "border-l-4 border-l-blue-500",
        text: "text-blue-900",
        tag: "bg-blue-500 text-white"
      };
    case "applied":
      return {
        card: "bg-teal-50/95 border-teal-200 hover:bg-teal-100/60",
        border: "border-l-4 border-l-teal-500",
        text: "text-teal-900",
        tag: "bg-teal-500 text-white"
      };
    case "specialized":
      return {
        card: "bg-purple-50/95 border-purple-200 hover:bg-purple-100/60",
        border: "border-l-4 border-l-purple-500",
        text: "text-purple-900",
        tag: "bg-purple-500 text-white"
      };
    case "other_subjects":
    case "other":
      return {
        card: "bg-orange-50/95 border-orange-200 hover:bg-orange-100/60",
        border: "border-l-4 border-l-orange-500",
        text: "text-orange-900",
        tag: "bg-orange-500 text-white"
      };
    default:
      return {
        card: "bg-yellow-50/95 border-gray-200 hover:bg-gray-100/60",
        border: "border-l-4 border-l-gray-400",
        text: "text-gray-900",
        tag: "bg-gray-500 text-white"
      };
  }
}

export default function TeacherSchedulePage() {
  const [teacherId, setTeacherId] = useState<string>("");
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
      setTeacherId(cachedUsername);
    } else {
      console.warn("No authentication username cookie found.");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!teacherId) return;

    const fetchTeacherSubjects = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/portal/teacher?table=subjects&id=${teacherId}&action=subjects`); 
        const result = await response.json();
        
        if (result && result.subjects) {
          setSchedules(result.subjects);
        }
      } catch (error) {
        console.error("Error pulling active subject matrix records:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherSubjects();
  }, [teacherId]);

  const getColumnIndex = (dayString: string): number => {
    const idx = DAYS.findIndex(d => d.toLowerCase() === dayString?.toLowerCase().trim());
    return idx !== -1 ? idx + 2 : 2; 
  };

  const getTimeRowIndex = (timeString: string): number => {
    if (!timeString) return 1;
    const cleanTime = timeString.trim().toUpperCase();
    
    const match = cleanTime.match(/^(\d+):/);
    if (!match) return 1;
    
    const hour = parseInt(match[1]);
    const isPM = cleanTime.includes("PM");

    let militaryHour = hour;
    if (isPM && hour !== 12) militaryHour += 12;
    if (!isPM && hour === 12) militaryHour = 0;

    const baseHour = 7;
    return (militaryHour - baseHour) + 1;
  };

  const filteredSchedules = schedules.filter((subject) => {
    const dbTargetCode = selectedSemester === "1st Semester" ? "1" : "2";
    return String(subject.semester).trim() === dbTargetCode;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 font-bold text-gray-500">
        Syncing schedule matrices with backend data portal...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-300 p-4 font-sans">
      <div className="w-full max-w-7xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
        
        {/* Banner Controls */}
        <div className="bg-black text-white p-5 border-b border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <h1 className="text-xl md:text-2xl font-black uppercase tracking-[0.2em]">Academic Matrix</h1>
            <p className="text-[9px] font-bold opacity-50 mt-1 uppercase tracking-[0.4em]">
              Teacher Schedule: {teacherId || "Guest Mode"}
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

        {/* Grid View */}
        <div className="p-4 md:p-6 overflow-x-auto">
          <div className="relative min-w-[900px]">
            
            {/* BACKGROUND TABLE LAYOUT */}
            <table className="w-full border-collapse text-sm table-fixed">
              <thead>
                <tr>
                  <th className="bg-black text-white p-3 text-center font-black border border-gray-800 uppercase text-[9px] w-[140px]">
                    Time
                  </th>
                  {DAYS.map((day) => (
                    <th key={day} className="bg-black text-white p-3 text-center font-black border border-gray-800 uppercase text-[9px] tracking-widest">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {HOURS.slice(0, -1).map((hourLabel, index) => (
                  <tr key={hourLabel} style={{ height: "5rem" }} className="even:bg-gray-50/40">
                    <td className="bg-gray-50 font-black text-gray-500 p-2 text-center border border-gray-100 text-[10px] font-mono whitespace-nowrap align-top pt-2">
                      {hourLabel} - {HOURS[index + 1]}
                    </td>
                    {DAYS.map((day) => (
                      <td key={day} className="border border-gray-100/70 p-0 bg-transparent" />
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>

            {/* DYNAMIC ABSOLUTE GRID OVERLAY */}
            <div 
              className="absolute inset-0 pointer-events-none p-0 z-10"
              style={{ 
                display: "grid",
                gridTemplateColumns: "140px repeat(5, 1fr)",
                paddingTop: "2.75rem",
                gridTemplateRows: `repeat(${HOURS.length - 1}, 5rem)` 
              }}
            >
              {filteredSchedules.map((subj) => {
                let startTimeStr = "";
                let endTimeStr = "";

                if (subj.class_time && typeof subj.class_time === "object") {
                  startTimeStr = subj.class_time.start || "";
                  endTimeStr = subj.class_time.end || "";
                } else if (typeof subj.class_time === "string") {
                  const timeParts = (subj.class_time as string).split("-");
                  startTimeStr = timeParts[0]?.trim() || "";
                  endTimeStr = timeParts[1]?.trim() || "";
                }

                // 🚀 FIXED: Passed subj.subject_day instead of subj["subject-day"]
                const colStart = getColumnIndex(subj.subject_day);
                const rowStart = getTimeRowIndex(startTimeStr);
                const rowEnd = getTimeRowIndex(endTimeStr);
                const styles = getSpecificationStyle(subj.subject_specification);

                return (
                  <div
                    key={subj.sched_code}
                    className="pointer-events-auto p-1 h-full w-full"
                    style={{
                      gridColumnStart: colStart,
                      gridRow: `${rowStart} / ${rowEnd}` 
                    }}
                  >
                    <div className={`border rounded-xl p-2.5 text-left shadow-sm hover:shadow-md cursor-pointer transition-all h-full flex flex-col justify-between overflow-hidden ${styles.card} ${styles.border}`}>
                      <div>
                        <div className="flex justify-between items-start gap-1">
                          <div className={`font-black text-[11px] leading-tight uppercase tracking-tight break-words ${styles.text}`}>
                            {subj.subject_name || subj.subject_id}
                          </div>
                          
                          {subj.subject_specification && (
                            <span className={`text-[7px] font-black uppercase px-1.5 py-0.5 rounded-md tracking-wider shrink-0 ${styles.tag}`}>
                              {subj.subject_specification.replace('_', ' ')}
                            </span>
                          )}
                        </div>
                        
                        <div className="text-[8px] text-gray-400 font-bold mt-1 tracking-wider uppercase">
                          Code: {subj.sched_code}
                        </div>
                      </div>
                      
                      <div className="text-[8px] text-indigo-500 font-mono font-black mt-1 pt-1 border-t border-gray-100/50 flex justify-between items-center uppercase">
                        <span>📍 {subj.room || "TBA"}</span>
                        <span>⏱️ {startTimeStr} - {endTimeStr}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap justify-center gap-6 p-4 text-[8px] font-black uppercase tracking-[0.2em] border-t bg-gray-50/50">
          {['Core', 'Applied', 'Specialized', 'Other Subjects'].map((name, idx) => {
            const bgClasses = ['bg-blue-500', 'bg-teal-500', 'bg-purple-500', 'bg-orange-500'];
            return (
              <div key={name} className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${bgClasses[idx]} border border-gray-200`}></div>
                <span className="text-gray-400">{name}</span>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}