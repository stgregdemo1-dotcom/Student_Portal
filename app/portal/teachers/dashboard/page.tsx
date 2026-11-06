"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface TeacherEvent {
  _id?: string;
  event_date: string;
  title: string;
  color: string;
  start_time: string;
  end_time: string;
}

const EVENT_COLORS: Record<string, string> = {
  "bg-blue-500": "bg-blue-500",
  "bg-green-500": "bg-green-500",
  "bg-red-500": "bg-red-500",
  "bg-purple-500": "bg-purple-500",
  "bg-yellow-500": "bg-yellow-500",
  "bg-pink-500": "bg-pink-500",
};

function getLocalDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function formatTeacherEventDate(dateKey: string): string {
  const [year, month, day] = dateKey.split("-").map(Number);
  if (!year || !month || !day) return dateKey;
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

export default function Dashboard() {
  const [enrolledStudents, setEnrolledStudents] = useState<number>(0);
  const [classCount, setClassCount] = useState<number>(0);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [subjectFilter, setSubjectFilter] = useState("");
  const [events, setEvents] = useState<TeacherEvent[]>([]);
  const [isEventsLoading, setIsEventsLoading] = useState(true);
  const [eventsError, setEventsError] = useState<string | null>(null);
  const [calendarMonth, setCalendarMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [selectedCalendarDate, setSelectedCalendarDate] = useState("");

  useEffect(() => {
    const getAnalytics = async () => {
      const getSchoolEvents = async () => {
        try {
          const response = await fetch("/api/portal/teacher?action=events");
          if (!response.ok) {
            throw new Error(`Could not load school events (${response.status}).`);
          }
          const data = await response.json();
          setEvents(Array.isArray(data.events) ? data.events : []);
        } catch (err) {
          console.error("Could not fetch teacher events:", err);
          setEventsError(err instanceof Error ? err.message : "Could not load school events.");
        } finally {
          setIsEventsLoading(false);
        }
      };

      void getSchoolEvents();
      try {
        const loggedInTeacherId = getCookie("username");
        const res = await fetch(
          loggedInTeacherId
            ? `/api/teachers?teacher_id=${loggedInTeacherId}`
            : `/api/teachers`
        );

        if (res.ok) {
          const data = await res.json();
          setEnrolledStudents(data.totalEnrolledStudents || 0);
          setClassCount(data.totalClasses || 0);
          setSubjects(data.subjects || []);
        }
      } catch (err) {
        console.error("Could not fetch dashboard metrics:", err);
      }
    };
    getAnalytics();
  }, []);

  const todayKey = getLocalDateKey(new Date());
  const monthYear = calendarMonth.getFullYear();
  const monthIndex = calendarMonth.getMonth();
  const currentMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const minimumCalendarMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 3, 1);
  const maximumCalendarMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 2, 1);
  const canGoToPreviousMonth = calendarMonth > minimumCalendarMonth;
  const canGoToNextMonth = calendarMonth < maximumCalendarMonth;
  const firstDayOffset = new Date(monthYear, monthIndex, 1).getDay();
  const daysInMonth = new Date(monthYear, monthIndex + 1, 0).getDate();
  const calendarDays: Array<number | null> = [
    ...Array.from({ length: firstDayOffset }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
    ...Array.from({ length: 42 - firstDayOffset - daysInMonth }, () => null),
  ];
  const normalizedEvents = events
    .map((event) => ({ ...event, event_date: event.event_date.slice(0, 10) }))
    .filter((event) => /^\d{4}-\d{2}-\d{2}$/.test(event.event_date));
  const eventDates = new Set(normalizedEvents.map((event) => event.event_date));
  const nextEvents = normalizedEvents
    .filter((event) => event.event_date >= todayKey)
    .sort((a, b) => `${a.event_date} ${a.start_time}`.localeCompare(`${b.event_date} ${b.start_time}`))
    .slice(0, 5);
  const filteredSubjects = subjects.filter((subject) =>
    [
      subject.subject_name,
      subject.subject_id,
      subject.sched_code,
      subject.semester,
      subject.subject_year_section,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(subjectFilter.trim().toLowerCase())
  );
  const activeDateKey = selectedCalendarDate || todayKey;
  const moveCalendarMonth = (amount: number) => {
    const nextMonth = new Date(monthYear, monthIndex + amount, 1);
    if (nextMonth < minimumCalendarMonth || nextMonth > maximumCalendarMonth) return;
    setCalendarMonth(nextMonth);
    setSelectedCalendarDate(getLocalDateKey(nextMonth));
  };

  return (
    <div className="flex min-h-0 w-full flex-1 flex-col gap-3 overflow-visible md:h-full md:overflow-hidden">
      <div className="portal-dashboard-heading shrink-0 px-1 py-1">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-700">Teacher Portal</p>
        <h2 className="mt-0.5 text-xl font-bold tracking-tight text-[#06264A] md:text-2xl">Dashboard</h2>
        <p className="mt-0.5 hidden text-xs text-slate-500 sm:block">Welcome back! Here is what is happening today.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid shrink-0 grid-cols-2 gap-2 sm:gap-3">
        <StatCard title="Enrolled Students" value={enrolledStudents} icon="fa-users" color="blue" href="/portal/teachers/masterlist" />
        <StatCard title="Classes" value={classCount} icon="fa-chalkboard-teacher" color="green" href="/portal/teachers/schedule" />
      </div>

      <div className="grid grid-cols-1 gap-3 overflow-visible md:min-h-0 md:flex-1 md:grid-cols-2 md:grid-rows-1 md:overflow-hidden">
      <section aria-label="School events calendar" className="flex min-h-[560px] flex-col overflow-visible rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4 md:min-h-0 md:overflow-hidden">
        <div className="mb-2 flex shrink-0 items-center justify-between gap-2">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-700">School Calendar</p>
            <h3 className="text-base font-bold text-slate-900 sm:text-lg">Events</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                const today = new Date();
                setCalendarMonth(new Date(today.getFullYear(), today.getMonth(), 1));
                setSelectedCalendarDate(getLocalDateKey(today));
              }}
              className="rounded-md border border-emerald-200 px-2 py-1 text-xs font-semibold text-emerald-800 transition-colors hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
            >
              Today
            </button>
            <button type="button" aria-label="Previous month" onClick={() => moveCalendarMonth(-1)} disabled={!canGoToPreviousMonth} className="rounded-md border border-slate-200 px-2 py-1 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 disabled:cursor-not-allowed disabled:opacity-40">‹</button>
            <span className="min-w-[7rem] text-center text-xs font-semibold text-slate-700 sm:text-sm">
              {calendarMonth.toLocaleDateString(undefined, { month: "long", year: "numeric" })}
            </span>
            <button type="button" aria-label="Next month" onClick={() => moveCalendarMonth(1)} disabled={!canGoToNextMonth} className="rounded-md border border-slate-200 px-2 py-1 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 disabled:cursor-not-allowed disabled:opacity-40">›</button>
          </div>
        </div>

        <div className="grid shrink-0 grid-cols-7 border-b border-slate-100 pb-1 text-center text-[9px] font-bold uppercase text-slate-400 sm:text-[10px]">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => <span key={day}>{day}</span>)}
        </div>
        <div className="grid min-h-0 flex-1 grid-cols-7 grid-rows-6 gap-1 py-2">
          {calendarDays.map((day, index) => {
            if (!day) return <span key={`empty-${index}`} />;
            const dateKey = getLocalDateKey(new Date(monthYear, monthIndex, day));
            const isSelected = dateKey === activeDateKey;
            const hasEvent = eventDates.has(dateKey);
            return (
              <button
                type="button"
                key={dateKey}
                aria-label={`${dateKey}${hasEvent ? ", has events" : ""}`}
                aria-pressed={isSelected}
                onClick={() => setSelectedCalendarDate(dateKey)}
                className={`relative flex h-full items-center justify-center rounded-md text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 sm:text-sm ${
                  isSelected ? "bg-[#0B3763] font-bold text-white" : dateKey === todayKey ? "bg-emerald-50 font-bold text-emerald-800" : "text-slate-700 hover:bg-emerald-50"
                }`}
              >
                {day}
                {hasEvent && <span className={`absolute bottom-0.5 size-1 rounded-full ${isSelected ? "bg-amber-300" : "bg-amber-500"}`} />}
              </button>
            );
          })}
        </div>

        <div className="mt-1 min-h-0 flex-1 overflow-visible border-t border-slate-100 pt-2 md:overflow-hidden">
          <div className="mb-1 flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-800">Upcoming Events</h4>
            <span className="text-[10px] text-slate-400">{nextEvents.length} shown</span>
          </div>
          {eventsError ? (
            <p role="alert" className="py-2 text-xs text-red-700">{eventsError}</p>
          ) : isEventsLoading ? (
            <p className="py-2 text-xs text-slate-500">Loading events…</p>
          ) : nextEvents.length === 0 ? (
            <p className="py-2 text-xs text-slate-500">No upcoming events scheduled.</p>
          ) : (
            <ul className="grid grid-cols-1 gap-1 overflow-visible sm:grid-cols-2 md:max-h-full md:grid-cols-1 md:overflow-y-auto">
              {nextEvents.map((event, index) => (
                <li key={event._id || `${event.event_date}-${event.title}-${index}`}>
                  <button
                    type="button"
                    onClick={() => {
                      const [year, month] = event.event_date.split("-").map(Number);
                      setCalendarMonth(new Date(year, month - 1, 1));
                      setSelectedCalendarDate(event.event_date);
                    }}
                    className="flex w-full min-w-0 items-center gap-2 rounded-md px-1.5 py-1 text-left transition-colors hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
                  >
                    <span className={`size-2 shrink-0 rounded-full ${EVENT_COLORS[event.color] || EVENT_COLORS["bg-blue-500"]}`} />
                    <span className="min-w-0 flex-1 truncate text-[10px] font-semibold text-slate-800 sm:text-xs">{event.title}</span>
                    <span className="shrink-0 text-[9px] text-slate-500 sm:text-[10px]">{formatTeacherEventDate(event.event_date)}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Assigned Subjects Section */}
      <section aria-label="Assigned classes and analytics" className="flex min-h-[420px] flex-col overflow-visible rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4 md:min-h-0 md:overflow-hidden">
        <div className="mb-3 flex shrink-0 flex-col gap-1 border-b border-slate-100 pb-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-700">Teaching Overview</p>
            <h3 className="mt-1 text-lg font-bold text-gray-800">Your Assigned Classes & Analytics</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500">{filteredSubjects.length} of {subjects.length} classes</span>
            <div className="relative w-36 sm:w-48">
              <label className="sr-only" htmlFor="assigned-subject-search">Search assigned classes</label>
              <input
                id="assigned-subject-search"
                type="search"
                value={subjectFilter}
                onChange={(event) => setSubjectFilter(event.target.value)}
                placeholder="Search classes..."
                className="w-full rounded-lg border border-slate-300 bg-slate-50 py-1.5 pl-8 pr-2 text-xs text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-600/15"
              />
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-slate-400"
              >
                <circle cx="10.8" cy="10.8" r="6.8" />
                <path strokeLinecap="round" d="m16 16 4 4" />
              </svg>
            </div>
          </div>
        </div>
        {subjects.length === 0 ? (
          <p className="py-4 text-sm text-gray-500">No active classes found.</p>
        ) : filteredSubjects.length === 0 ? (
          <p className="py-4 text-sm text-gray-500">No classes match “{subjectFilter}”.</p>
        ) : (
          <div className="min-h-0 flex-1 overflow-visible pr-2 md:overflow-y-auto md:overscroll-contain md:[scrollbar-color:#94a3b8_transparent] md:[scrollbar-width:thin]">
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 lg:gap-4">
            {filteredSubjects.map((subject: any, index: number) => {
              const total = subject.totalStudents || 0;
              const passed = subject.passedCount || 0;
              const failed = subject.failedCount || 0;
              const ungraded = Math.max(0, total - (passed + failed));

              const passedPct = total > 0 ? (passed / total) * 100 : 0;
              const failedPct = total > 0 ? (failed / total) * 100 : 0;

              return (
                <div key={subject.subject_id || index} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-emerald-300 hover:shadow-md sm:p-5">
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div>
                      <h4 className="font-semibold text-gray-800 text-lg">
                        {subject.subject_name || "Unnamed Subject"}
                      </h4>
                      <p className="text-xs text-gray-400 font-mono mt-0.5">
                        {subject.subject_id}
                      </p>
                    </div>
                    <span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800">
                      {subject.sched_code || "N/A"}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1 mb-4">
                    <p><span className="font-medium text-gray-500">Semester:</span> {subject.semester || "N/A"}</p>
                    <p><span className="font-medium text-gray-500">Section:</span> {subject.subject_year_section || "N/A"}</p>
                  </div>

                  {/* Pie / Donut Graph Section */}
                  <div className="mb-4 pt-3 border-t border-gray-100">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Class Performance Breakdown</p>
                    
                    {total === 0 ? (
                      <p className="text-xs text-gray-400 italic">No students enrolled in this subject yet.</p>
                    ) : (
                      <div className="flex items-center justify-around bg-gray-50 p-3 rounded-lg">
                        {/* Donut Chart Visual */}
                        <div className="relative w-24 h-24 flex items-center justify-center">
                          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                            <path
                              className="text-gray-200"
                              strokeWidth="4"
                              stroke="currentColor"
                              fill="none"
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                            {passed > 0 && (
                              <path
                                className="text-green-500"
                                strokeDasharray={`${passedPct}, 100`}
                                strokeWidth="4"
                                stroke="currentColor"
                                fill="none"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              />
                            )}
                            {failed > 0 && (
                              <path
                                className="text-red-500"
                                strokeDasharray={`${failedPct}, 100`}
                                strokeDashoffset={`-${passedPct}`}
                                strokeWidth="4"
                                stroke="currentColor"
                                fill="none"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              />
                            )}
                          </svg>
                          <div className="absolute text-center">
                            <span className="text-xs text-gray-400 block font-medium">Total</span>
                            <span className="text-lg font-bold text-gray-800">{total}</span>
                          </div>
                        </div>

                        {/* Legend */}
                        <div className="text-xs space-y-1.5">
                          <div className="flex items-center space-x-2">
                            <span className="w-3 h-3 bg-gray-200 rounded-full inline-block"></span>
                            <span className="text-gray-600 font-medium">Total Students:</span>
                            <span className="font-bold text-gray-800">{total}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="w-3 h-3 bg-green-500 rounded-full inline-block"></span>
                            <span className="text-gray-600 font-medium">Passed:</span>
                            <span className="font-bold text-green-600">{passed}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="w-3 h-3 bg-red-500 rounded-full inline-block"></span>
                            <span className="text-gray-600 font-medium">Failed:</span>
                            <span className="font-bold text-red-500">{failed}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Top Student Section */}
                  <div className="mt-2 pt-3 border-t border-gray-100">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Top Student(s)</p>
                    {(!subject.topStudents || subject.topStudents.length === 0) ? (
                      <p className="text-xs text-gray-400 italic">No grades recorded yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {subject.topStudents.map((student: any, sIdx: number) => (
                          <div key={sIdx} className="flex justify-between items-center bg-gray-50 p-2.5 rounded text-sm">
                            <div>
                              <p className="font-medium text-gray-800">{student.last_name}, {student.first_name}</p>
                              <p className="text-xs text-gray-500">ID: {student.student_id}</p>
                            </div>
                            <div className="text-right">
                              <span className="text-xs bg-green-100 text-green-700 font-bold px-2 py-1 rounded">
                                Average Grade: {student.grade}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          </div>
        )}
      </section>
    </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  color: 'blue' | 'green' | 'yellow' | 'purple';
  href: string;
}

function StatCard({ title, value, icon, color, href }: StatCardProps) {
  const colorMapping = {
    blue: { border: "border-blue-500", bg: "bg-blue-100", text: "text-blue-500" },
    green: { border: "border-green-500", bg: "bg-green-100", text: "text-green-500" },
    yellow: { border: "border-yellow-500", bg: "bg-yellow-100", text: "text-yellow-500" },
    purple: { border: "border-purple-500", bg: "bg-purple-100", text: "text-purple-500" }
  };

  const selectedColor = colorMapping[color];

  return (
    <Link
      href={href}
      aria-label={`View ${title}`}
      className="group block cursor-pointer rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
    >
      <div className={`h-full rounded-2xl border border-slate-200 border-l-4 bg-white p-5 shadow-sm transition-all duration-200 group-hover:-translate-y-0.5 group-hover:border-amber-400 group-hover:shadow-md sm:p-6 ${selectedColor.border}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-500">{title}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{value}</p>
        </div>
        <div className={`rounded-xl p-3 transition-transform group-hover:scale-105 ${selectedColor.bg} ${selectedColor.text}`}>
          <i className={`fas ${icon} text-2xl`}></i>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
        <span className="font-medium text-slate-500">Open {title.toLowerCase()}</span>
        <span className="font-bold text-[#0B3763] transition group-hover:text-amber-700">View</span>
      </div>
      </div>
    </Link>
  );
}
