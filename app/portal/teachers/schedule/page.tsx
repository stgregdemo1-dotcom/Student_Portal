"use client";

import React, { useState, useEffect } from "react";
// ==========================================
// HOW TO APPLY TO OTHER PAGES (Step 1):
// Import your custom useAuthGuard hook at the top.
// Ensure the import path matches your project structure (e.g. "@/hooks/useAuthGuard").
// ==========================================
import { useAuthGuard } from "@/app/hooks/useAuthGuard";

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

interface SchedulePlacement {
  lane: number;
  laneCount: number;
  overlaps: boolean;
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

function getTimeInMinutes(value: string): number | null {
  const match = value.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return null;

  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (hour < 1 || hour > 12 || minute > 59) return null;
  return ((hour % 12) + (match[3].toUpperCase() === "PM" ? 12 : 0)) * 60 + minute;
}

export default function TeacherSchedulePage() {
  // ==========================================
  // HOW TO APPLY TO OTHER PAGES (Step 2):
  // Call useAuthGuard at the top of your component body.
  // - requiredPrefix: "TCH" ensures only valid teacher accounts can access this schedule.
  // - redirectTo: Sends unauthorized users to the login page.
  // - Aliased username as teacherId to preserve your existing code logic.
  // ==========================================
  const { username: teacherId, isAuthenticated, loading: authLoading } = useAuthGuard({
    requiredPrefix: "TCH",
    redirectTo: "/portal/log-in",
  });

  const [schedules, setSchedules] = useState<SubjectSchedule[]>([]);
  const [selectedSemester, setSelectedSemester] = useState<string>("1st Semester");
  const [selectedSubject, setSelectedSubject] = useState<SubjectSchedule | null>(null);
  const [dataLoading, setDataLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!isAuthenticated || !teacherId) return;

    const fetchTeacherSubjects = async () => {
      try {
        setDataLoading(true);
        const response = await fetch(`/api/portal/teacher?table=subjects&id=${teacherId}&action=subjects`);
        const result = await response.json();

        if (result && result.subjects) {
          setSchedules(result.subjects);
        }
      } catch (error) {
        console.error("Error pulling active subject matrix records:", error);
      } finally {
        setDataLoading(false);
      }
    };

    fetchTeacherSubjects();
  }, [isAuthenticated, teacherId]);

  useEffect(() => {
    if (!selectedSubject) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedSubject(null);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedSubject]);

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

  const schedulePlacements = new Map<number, SchedulePlacement>();
  const schedulesByDay = new Map<number, Array<{ index: number; start: number; end: number }>>();

  filteredSchedules.forEach((subject, index) => {
    const startTime = typeof subject.class_time === "string"
      ? subject.class_time.split("-")[0]?.trim() || ""
      : subject.class_time?.start || "";
    const endTime = typeof subject.class_time === "string"
      ? subject.class_time.split("-")[1]?.trim() || ""
      : subject.class_time?.end || "";
    const start = getTimeInMinutes(startTime);
    const end = getTimeInMinutes(endTime);
    if (start === null || end === null || start >= end) {
      schedulePlacements.set(index, { lane: 0, laneCount: 1, overlaps: false });
      return;
    }

    const dayIndex = getColumnIndex(subject.subject_day);
    const daySchedules = schedulesByDay.get(dayIndex) || [];
    daySchedules.push({ index, start, end });
    schedulesByDay.set(dayIndex, daySchedules);
  });

  schedulesByDay.forEach((daySchedules) => {
    const sortedSchedules = daySchedules.sort((a, b) => a.start - b.start || a.end - b.end);
    let conflictGroup: typeof sortedSchedules = [];
    let groupEnd = -1;

    const placeConflictGroup = () => {
      if (conflictGroup.length === 0) return;
      const laneEnds: number[] = [];
      const assigned = conflictGroup.map((schedule) => {
        let lane = laneEnds.findIndex((laneEnd) => laneEnd <= schedule.start);
        if (lane === -1) lane = laneEnds.length;
        laneEnds[lane] = schedule.end;
        return { index: schedule.index, lane };
      });
      const laneCount = laneEnds.length;
      assigned.forEach(({ index, lane }) => {
        schedulePlacements.set(index, {
          lane,
          laneCount,
          overlaps: conflictGroup.length > 1,
        });
      });
      conflictGroup = [];
      groupEnd = -1;
    };

    sortedSchedules.forEach((schedule) => {
      if (conflictGroup.length > 0 && schedule.start >= groupEnd) {
        placeConflictGroup();
      }
      conflictGroup.push(schedule);
      groupEnd = Math.max(groupEnd, schedule.end);
    });
    placeConflictGroup();
  });

  const overlappingScheduleCount = [...schedulePlacements.values()]
    .filter((placement) => placement.overlaps).length;

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

  if (dataLoading) {
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
    <>
    <div className="flex h-full min-h-0 w-full flex-col items-center justify-start font-sans">
      <div className="flex h-full min-h-0 w-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
        <div className="flex shrink-0 flex-col justify-between gap-2 border-b-4 border-[#FFB900] bg-[linear-gradient(100deg,#DCEAF5_0%,#F2F7FB_58%,#FFFFFF_100%)] px-4 py-2 text-[#06264A] sm:flex-row sm:items-center sm:px-5 sm:py-2.5">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#0B3763] sm:text-[11px]">Schedule</p>
            <h1 className="mt-0.5 text-lg font-extrabold tracking-tight sm:text-xl">Weekly Class Timetable</h1>
            <p className="mt-0.5 text-[11px] font-semibold text-slate-700 sm:text-xs">
              {teacherId ? `Teacher ID: ${teacherId}` : "Guest mode"}
            </p>
            {overlappingScheduleCount > 0 && (
              <p role="alert" className="mt-1 text-[10px] font-bold text-red-700 sm:text-xs">
                Schedule conflict: {overlappingScheduleCount} overlapping class blocks are shown side by side.
              </p>
            )}
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
              const placement = schedulePlacements.get(index) || { lane: 0, laneCount: 1, overlaps: false };

              return (
                <button
                  key={`${subject.sched_code}-${index}`}
                  type="button"
                  aria-label={`${subject.subject_name || subject.subject_id}, ${subject.subject_day}, ${startTime} to ${endTime}. Tap for details.`}
                  title={placement.overlaps ? "Schedule conflict. Select for class details." : undefined}
                  onClick={() => setSelectedSubject(subject)}
                  className={`relative z-10 m-0.5 flex min-w-0 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-md border border-slate-300 p-1 text-center shadow-sm transition-colors hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#d99a00] sm:m-1 sm:rounded-lg sm:p-1.5 ${styles.card} ${styles.border} ${placement.overlaps ? "ring-2 ring-inset ring-red-500" : ""}`}
                  style={{
                    gridColumnStart: getColumnIndex(subject.subject_day),
                    gridRowStart: rowStart,
                    gridRowEnd: rowEnd,
                    width: `calc(100% / ${placement.laneCount})`,
                    marginLeft: `calc(100% * ${placement.lane} / ${placement.laneCount})`,
                    justifySelf: "start",
                  }}
                >
                  <span className={`line-clamp-3 w-full break-words text-[10px] font-extrabold uppercase leading-tight tracking-tight sm:text-xs ${styles.text}`}>
                    {subject.subject_name || subject.subject_id}
                  </span>
                </button>
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
    {selectedSubject && (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
        onClick={() => setSelectedSubject(null)}
      >
        <section
          role="dialog"
          aria-modal="true"
          aria-labelledby="teacher-schedule-subject-title"
          className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-amber-700">Class details</p>
              <h2 id="teacher-schedule-subject-title" className="mt-1 text-lg font-extrabold text-[#06264A]">
                {selectedSubject.subject_name || selectedSubject.subject_id}
              </h2>
            </div>
            <button
              type="button"
              aria-label="Close class details"
              onClick={() => setSelectedSubject(null)}
              className="rounded-lg px-2 py-1 text-xl font-bold text-slate-500 hover:bg-slate-100 hover:text-slate-800"
            >
              ×
            </button>
          </div>
          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="font-semibold text-slate-500">Subject ID</dt>
              <dd className="font-bold text-slate-800">{selectedSubject.subject_id || "—"}</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-500">Day and time</dt>
              <dd className="font-bold text-slate-800">
                {selectedSubject.subject_day || "—"}, {typeof selectedSubject.class_time === "string"
                  ? selectedSubject.class_time
                  : `${selectedSubject.class_time?.start || "—"}–${selectedSubject.class_time?.end || "—"}`}
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-500">Room</dt>
              <dd className="font-bold text-slate-800">{selectedSubject.room || "Room TBA"}</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-500">Schedule code</dt>
              <dd className="font-mono font-bold text-slate-800">{selectedSubject.sched_code || "—"}</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-500">Semester</dt>
              <dd className="font-bold text-slate-800">
                {String(selectedSubject.semester).trim() === "1" ? "1st Semester" : "2nd Semester"}
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-500">Subject type</dt>
              <dd className="font-bold capitalize text-slate-800">
                {selectedSubject.subject_specification?.replaceAll("_", " ") || "—"}
              </dd>
            </div>
            {schedulePlacements.get(filteredSchedules.indexOf(selectedSubject))?.overlaps && (
              <div role="alert">
                <dt className="font-semibold text-red-700">Schedule conflict</dt>
                <dd className="font-bold text-red-700">This class overlaps another class on the timetable.</dd>
              </div>
            )}
          </dl>
        </section>
      </div>
    )}
    </>
  );
}