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
  const [selectedSubject, setSelectedSubject] = useState<SubjectSchedule | null>(null);
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
      <div className="flex min-h-[50vh] items-center justify-center p-6">
        <div role="status" className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-5 py-4 text-sm font-semibold text-slate-600 shadow-sm">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-[#d99a00]" aria-hidden="true" />
          Loading your class schedule…
        </div>
      </div>
    );
  }

  return (
    <>
    <div className="flex h-full min-h-0 w-full flex-col items-center justify-start font-sans">
    <div className="flex h-full min-h-0 w-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
      <div className="flex shrink-0 flex-col justify-between gap-2 border-b-4 border-[#f2b600] bg-[linear-gradient(100deg,#fff1bd_0%,#fff8dc_58%,#ffffff_100%)] px-4 py-2 text-[#082b49] sm:flex-row sm:items-center sm:px-5 sm:py-2.5">
          <div>
          <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#b77700] sm:text-[11px]">Schedule</p>
          <h1 className="mt-0.5 text-lg font-extrabold tracking-tight sm:text-xl">Weekly Class Timetable</h1>
          <p className="mt-0.5 text-[11px] font-semibold text-slate-700 sm:text-xs">
              {studentId ? `Student ID: ${studentId}` : "Guest mode"}
            </p>
          </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <label htmlFor="semester-select" className="text-xs font-extrabold uppercase tracking-wider text-[#082b49]">Semester</label>
            <select
              id="semester-select"
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
            className="min-h-10 min-w-[150px] cursor-pointer rounded-lg border border-amber-400 bg-white px-3 text-sm font-bold text-[#082b49] shadow-sm outline-none transition hover:border-[#d99a00] hover:shadow-md focus-visible:ring-2 focus-visible:ring-[#d99a00] focus-visible:ring-offset-2 sm:min-h-11 sm:min-w-[170px]"
            >
              <option value="1st Semester">1st Semester</option>
              <option value="2nd Semester">2nd Semester</option>
            </select>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-visible p-1 sm:p-1.5 lg:overflow-hidden">
          <p className="mb-1 px-1 text-[11px] font-semibold text-slate-500 md:hidden">
            Swipe sideways to view the week. Tap a class for details.
          </p>
          <div
            className="min-h-0 min-w-0 flex-1 overflow-auto overscroll-contain rounded-xl border border-slate-300 bg-white shadow-sm lg:overflow-hidden"
          >
            <div
            className="grid h-full min-h-[1404px] min-w-[1004px] overflow-visible bg-white [--schedule-day-min:184px] [--schedule-row-min:120px] [--schedule-lunch-row:48px] lg:min-h-0 lg:min-w-0 lg:overflow-hidden lg:[--schedule-day-min:120px] lg:[--schedule-row-min:0px] lg:[--schedule-lunch-row:48px]"
            style={{
              gap: 0,
              gridTemplateColumns: "84px repeat(5, minmax(var(--schedule-day-min), 1fr))",
              gridTemplateRows: `36px repeat(5, minmax(var(--schedule-row-min), 1fr)) var(--schedule-lunch-row) repeat(6, minmax(var(--schedule-row-min), 1fr))`
            }}
          >

            <div className="sticky left-0 top-0 z-40 flex min-w-0 items-center justify-center border-b border-r border-amber-400 bg-[#ffe8a3] p-1 text-center text-xs font-extrabold uppercase tracking-wide text-[#082b49] sm:p-2 lg:static">Time</div>
            {DAYS.map((day) => (
              <div key={day} className="sticky top-0 z-30 flex min-w-0 items-center justify-center border-b border-r border-amber-400 bg-[#ffe8a3] p-1 text-center text-xs font-extrabold uppercase tracking-wide text-[#082b49] last:border-r-0 sm:p-2 lg:static">
                <span className="sm:hidden">{day.slice(0, 3)}</span>
                <span className="hidden sm:inline">{day}</span>
              </div>
            ))}

            {DAYS.flatMap((day, dayIndex) =>
              TIME_BLOCKS.map((block, timeIndex) => (
                <div
                  key={`${day}-${block.start}`}
                  aria-hidden="true"
                  style={{
                    gridColumnStart: dayIndex + 2,
                    gridRowStart: timeIndex + 2,
                  }}
                  className={`border-b border-r border-slate-300 last:border-r-0 ${
                    block.isLunch ? "bg-amber-50/40" : timeIndex % 2 === 0 ? "bg-white" : "bg-slate-50/50"
                  }`}
                />
              )),
            )}

            {TIME_BLOCKS.map((block, index) => {
              const rowStart = index + 2;
              return (
                <div
                  key={index}
                  style={{
                    gridColumnStart: 1,
                    gridRowStart: rowStart,
                  }}
                  className={`sticky left-0 z-20 flex min-w-0 flex-col items-center justify-center border-b border-r border-slate-300 p-0.5 text-center font-mono text-[11px] font-extrabold leading-tight text-slate-900 sm:p-1 sm:text-[13px] ${block.isLunch ? "bg-amber-50 text-amber-900" : "bg-slate-50"
                    }`}
                >
                  <span>{block.start}</span>
                </div>
              );
            })}

            <div className="col-start-2 col-span-5 row-start-7 flex min-w-0 items-center justify-center border-y border-amber-300 bg-amber-50/90 p-1 text-center">
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-amber-900 sm:text-xs sm:tracking-[0.25em]">Lunch Break</div>
            </div>

            {filteredSchedules.map((sub, index) => {
              const dayIndex = DAYS.findIndex((day) => day === sub["subject-day"]);
              if (dayIndex === -1) return null;

              const colStart = dayIndex + 2;
              const startTrack = getTimeGridLine(sub.class_time?.start);
              const endTrack = getTimeGridLine(sub.class_time?.end);
              const isSingleHour = endTrack - startTrack === 1;

              const spec = sub.subject_specification?.toLowerCase().trim() || "";
              let colorStyle = "border-l-4 border-l-slate-400 bg-slate-100 text-slate-900 hover:bg-slate-200";

              switch (spec) {
                case "core":
                  colorStyle = "border-l-4 border-l-blue-600 bg-blue-50 text-slate-900 hover:bg-blue-100";
                  break;
                case "applied":
                  colorStyle = "border-l-4 border-l-teal-600 bg-teal-50 text-slate-900 hover:bg-teal-100";
                  break;
                case "specialized":
                  colorStyle = "border-l-4 border-l-purple-600 bg-purple-50 text-slate-900 hover:bg-purple-100";
                  break;
                case "other_subjects":
                case "other":
                  colorStyle = "border-l-4 border-l-orange-600 bg-orange-50 text-slate-900 hover:bg-orange-100";
                  break;
              }

              return (
                <button
                  key={index}
                  type="button"
                  aria-label={`${sub.subject_name || sub.subject_id}, ${sub["subject-day"]}, ${sub.class_time?.start} to ${sub.class_time?.end}. Tap for details.`}
                  onClick={() => setSelectedSubject(sub)}
                  className={`m-0.5 flex min-h-0 min-w-0 cursor-pointer flex-col overflow-hidden rounded-md border border-slate-300 text-left shadow-sm transition-colors hover:brightness-95 focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#d99a00] sm:m-1 sm:rounded-lg ${isSingleHour ? "items-center justify-center gap-1 p-1 sm:p-2" : "items-stretch justify-start gap-1 p-1 sm:gap-2 sm:p-2.5"} ${colorStyle}`}
                  style={{
                    gridColumnStart: colStart,
                    gridRowStart: startTrack,
                    gridRowEnd: endTrack,
                  }}
                >
                  <div className="w-full shrink-0 whitespace-normal break-words text-center text-xs font-extrabold uppercase leading-tight tracking-tight sm:text-base">
                    {sub.subject_name || sub.subject_id}
                  </div>

                  {isSingleHour ? (
                    <div className="hidden w-full shrink-0 flex-col gap-0.5 border-t border-slate-300/70 pt-1 text-center text-[9px] font-semibold leading-tight text-slate-700 sm:flex sm:text-xs">
                      <span className="whitespace-normal break-words">Room: {sub.room || "Room TBA"}</span>
                      <span className="whitespace-normal break-words font-mono text-emerald-800">
                        {sub.class_time?.start}–{sub.class_time?.end}
                      </span>
                    </div>
                  ) : (
                    <div className="hidden min-w-0 shrink-0 flex-col gap-1 border-t border-slate-300/70 pt-1.5 text-left text-[10px] sm:flex sm:gap-1.5 sm:text-xs">
                      <div className="whitespace-normal break-words font-bold text-slate-700 sm:text-[13px]">
                        Room: {sub.room || "Room TBA"}
                      </div>
                      <div className="whitespace-normal break-words font-mono font-bold text-emerald-800 sm:text-[13px]">
                        Time: {sub.class_time?.start}–{sub.class_time?.end}
                      </div>
                    </div>
                  )}
                </button>
              );
            })}

          </div>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap justify-center gap-x-4 gap-y-1 border-t border-slate-200 bg-slate-50 px-3 py-1.5 text-[9px] font-extrabold uppercase tracking-wide sm:gap-x-6 sm:gap-y-1 sm:px-5 sm:py-2 sm:text-[10px]">
          {['Core Tracks', 'Applied Modules', 'Specialized Paths', 'Other Subjects'].map((name, idx) => {
            const colors = ['bg-blue-500', 'bg-teal-500', 'bg-purple-500', 'bg-orange-500'];
            return (
              <div key={name} className="flex items-center gap-2">
                <div className={`h-2.5 w-2.5 rounded-full ${colors[idx]} ring-2 ring-white`}></div>
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
          aria-labelledby="schedule-subject-title"
          className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-amber-700">Class details</p>
              <h2 id="schedule-subject-title" className="mt-1 text-lg font-extrabold text-[#082b49]">
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
              <dt className="font-semibold text-slate-500">Day and time</dt>
              <dd className="font-bold text-slate-800">
                {selectedSubject["subject-day"]}, {selectedSubject.class_time.start}–{selectedSubject.class_time.end}
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
          </dl>
        </section>
      </div>
    )}
    </>
  );
}
