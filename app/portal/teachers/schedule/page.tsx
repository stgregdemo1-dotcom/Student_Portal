"use client";

import { useState, useEffect } from "react";

interface SubjectSchedule {
  sched_code: string;
  subject_id: string;
  subject_name: string;
  room: string;
  semester: string;
  subject_day: string;
  subject_specification?: string;
  class_time: {
    start: string;
    end: string;
  } | string;
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
        card: "bg-slate-100/95 border-slate-200 hover:bg-blue-100/70",
        border: "border-l-4 border-l-[#FFB900]",
        text: "text-[#06264A]",
        tag: "bg-[#0B3763] text-white"
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
    if (!timeString) return 2;
    const cleanTime = timeString.trim().toUpperCase();

    const match = cleanTime.match(/^(\d+):/);
    if (!match) return 2;

    const hour = parseInt(match[1]);
    const isPM = cleanTime.includes("PM");

    let militaryHour = hour;
    if (isPM && hour !== 12) militaryHour += 12;
    if (!isPM && hour === 12) militaryHour = 0;

    const baseHour = 7;
    return Math.max(2, Math.min((militaryHour - baseHour) + 2, HOURS.length + 1));
  };

  const filteredSchedules = schedules.filter((subject) => {
    const dbTargetCode = selectedSemester === "1st Semester" ? "1" : "2";
    return String(subject.semester).trim() === dbTargetCode;
  });

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center p-6">
        <div role="status" className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-5 py-4 text-sm font-semibold text-slate-600 shadow-sm">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-[#FFB900]" aria-hidden="true" />
          Loading your class schedule…
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 w-full flex-col items-center justify-start font-sans">
      <div className="flex h-full min-h-0 w-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
        <div className="flex shrink-0 flex-col justify-between gap-2 border-b-4 border-[#FFB900] bg-[linear-gradient(100deg,#DCEAF5_0%,#F2F7FB_58%,#FFFFFF_100%)] px-4 py-2 text-[#06264A] sm:flex-row sm:items-center sm:px-5 sm:py-2.5">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#0B3763] sm:text-[11px]">Schedule</p>
            <h1 className="mt-0.5 text-lg font-extrabold tracking-tight sm:text-xl">Weekly Class Timetable</h1>
            <p className="mt-0.5 text-[11px] font-semibold text-slate-700 sm:text-xs">
              {teacherId ? `Teacher ID: ${teacherId}` : "Guest mode"}
            </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <label htmlFor="teacher-semester-select" className="text-xs font-extrabold uppercase tracking-wider text-[#06264A]">Semester</label>
            <select
              id="teacher-semester-select"
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="min-h-10 min-w-[150px] cursor-pointer rounded-lg border border-[#FFB900] bg-white px-3 text-sm font-bold text-[#06264A] shadow-sm outline-none transition hover:border-[#0B3763] hover:shadow-md focus-visible:ring-2 focus-visible:ring-[#FFB900] focus-visible:ring-offset-2 sm:min-h-11 sm:min-w-[170px]"
            >
              <option value="1st Semester">1st Semester</option>
              <option value="2nd Semester">2nd Semester</option>
            </select>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden p-1 sm:p-1.5">
          <div
            className="grid min-h-0 min-w-0 flex-1 overflow-hidden rounded-xl border border-slate-300 bg-white shadow-sm"
            style={{
              height: "100%",
              gap: 0,
              gridTemplateColumns: "clamp(72px, 10vw, 128px) repeat(5, minmax(0, 1fr))",
              gridTemplateRows: "36px repeat(12, minmax(clamp(24px, calc((100dvh - 360px) / 12), 52px), 1fr))"
            }}
          >
            <div className="flex min-w-0 items-center justify-center border-b border-r border-[#D1A000] bg-[#0B3763] p-1 text-center text-xs font-extrabold uppercase tracking-wide text-white sm:p-2">Time</div>
            {DAYS.map((day) => (
              <div key={day} className="flex min-w-0 items-center justify-center border-b border-r border-[#D1A000] bg-[#0B3763] p-1 text-center text-xs font-extrabold uppercase tracking-wide text-white last:border-r-0 sm:p-2">
                <span className="sm:hidden">{day.slice(0, 3)}</span>
                <span className="hidden sm:inline">{day}</span>
              </div>
            ))}

            {DAYS.flatMap((day, dayIndex) =>
              HOURS.slice(0, -1).map((hour, timeIndex) => (
                <div
                  key={`${day}-${hour}`}
                  aria-hidden="true"
                  style={{
                    gridColumnStart: dayIndex + 2,
                    gridRowStart: timeIndex + 2,
                  }}
                  className={`border-b border-r border-slate-300 last:border-r-0 ${timeIndex % 2 === 0 ? "bg-white" : "bg-slate-50/70"}`}
                />
              )),
            )}

            {HOURS.slice(0, -1).map((hour, index) => (
              <div
                key={hour}
                style={{
                  gridColumnStart: 1,
                  gridRowStart: index + 2,
                }}
                className="flex min-w-0 flex-col items-center justify-center border-b border-r border-slate-300 bg-slate-50 p-0.5 text-center font-mono text-[10px] font-extrabold leading-tight text-[#06264A] sm:p-1 sm:text-xs"
              >
                <span>{hour}</span>
              </div>
            ))}

            {filteredSchedules.map((subject, index) => {
              const startTime = typeof subject.class_time === "string"
                ? subject.class_time.split("-")[0]?.trim() || ""
                : subject.class_time?.start || "";
              const endTime = typeof subject.class_time === "string"
                ? subject.class_time.split("-")[1]?.trim() || ""
                : subject.class_time?.end || "";
              const rowStart = getTimeRowIndex(startTime);
              const rowEnd = Math.max(rowStart + 1, getTimeRowIndex(endTime));
              const styles = getSpecificationStyle(subject.subject_specification);
              const singleHour = rowEnd - rowStart === 1;

              return (
                <div
                  key={`${subject.sched_code}-${index}`}
                  className={`m-0.5 flex min-w-0 flex-col justify-center gap-0.5 overflow-hidden rounded-md border border-slate-300 p-1 shadow-sm transition-colors sm:m-1 sm:gap-1 sm:rounded-lg sm:p-1.5 ${styles.card} ${styles.border}`}
                  style={{
                    gridColumnStart: getColumnIndex(subject.subject_day),
                    gridRowStart: rowStart,
                    gridRowEnd: rowEnd,
                  }}
                >
                  <div className={`line-clamp-2 text-center text-[10px] font-extrabold uppercase leading-tight tracking-tight sm:text-xs ${styles.text}`}>
                    {subject.subject_name || subject.subject_id}
                  </div>
                  {singleHour ? (
                    <div className="truncate border-t border-slate-300/70 pt-0.5 text-center text-[9px] font-bold text-slate-800 sm:text-[11px]">
                      {subject.room || "Room TBA"} · {startTime}–{endTime}
                    </div>
                  ) : (
                    <div className="flex flex-col gap-px border-t border-slate-300/70 pt-0.5 text-left sm:gap-0.5 sm:pt-1">
                      <div className="truncate text-[8px] font-bold text-slate-700 sm:text-[10px]">Room: {subject.room || "—"}</div>
                      <div className="truncate font-mono text-[8px] font-bold text-[#0B3763] sm:text-[10px]">Code: {subject.sched_code || "—"}</div>
                      <div className="truncate font-mono text-[8px] font-bold text-emerald-800 sm:text-[10px]">{startTime} - {endTime}</div>
                    </div>
                  )}
                  {subject.subject_specification && (
                    <span className={`self-center rounded-md px-1.5 py-0.5 text-[7px] font-black uppercase tracking-wider ${styles.tag}`}>
                      {subject.subject_specification.replace("_", " ")}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap justify-center gap-x-4 gap-y-1 border-t border-slate-200 bg-slate-50 px-3 py-1.5 text-[9px] font-extrabold uppercase tracking-wide sm:gap-x-6 sm:gap-y-1 sm:px-5 sm:py-2 sm:text-[10px]">
          {['Core Tracks', 'Applied Modules', 'Specialized Paths', 'Other Subjects'].map((name, idx) => {
            const colors = ['bg-blue-500', 'bg-teal-500', 'bg-purple-500', 'bg-orange-500'];
            return (
              <div key={name} className="flex items-center gap-2">
                <div className={`h-2.5 w-2.5 rounded-full ${colors[idx]} ring-2 ring-white`} />
                <span className="text-slate-600">{name}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
