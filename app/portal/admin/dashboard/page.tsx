"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

interface TeacherRecord {
  status?: string;
}

interface SubjectRecord {
  status?: string;
  subject_day?: string;
}

interface CalendarEvent {
  _id?: string;
  title?: string;
  event_date?: string;
  start_time?: string;
  end_time?: string;
}

interface AuditRecord {
  _id?: string;
  username?: string;
  user_type?: string;
  activity?: string;
  createdAt?: string;
}

interface DashboardData {
  activeTeachers: number;
  activeSubjects: number;
  classesToday: number;
  upcomingEventCount: number;
  upcomingEvents: CalendarEvent[];
  recentActivity: AuditRecord[];
}

const EMPTY_DASHBOARD: DashboardData = {
  activeTeachers: 0,
  activeSubjects: 0,
  classesToday: 0,
  upcomingEventCount: 0,
  upcomingEvents: [],
  recentActivity: [],
};

function getRecords<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[];
  if (payload && typeof payload === "object" && "data" in payload && Array.isArray(payload.data)) {
    return payload.data as T[];
  }
  return [];
}

function formatEventDate(value?: string): string {
  if (!value) return "Date not set";
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return value;
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatActivityDate(value?: string): string {
  if (!value) return "Date unavailable";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Date unavailable" : date.toLocaleString();
}

export default function DashboardPage() {
  const [dashboard, setDashboard] = useState(EMPTY_DASHBOARD);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const endpoints = [
        "/api/portal/admin?table=teachers",
        "/api/portal/admin?table=subjects",
        "/api/portal/admin?table=events",
        "/api/portal/admin?table=audit_logs",
      ];
      const responses = await Promise.all(endpoints.map((endpoint) => fetch(endpoint, { cache: "no-store" })));
      const failedResponse = responses.find((response) => !response.ok);
      if (failedResponse) {
        throw new Error(`Dashboard data request failed (${failedResponse.status}).`);
      }

      const [teachersPayload, subjectsPayload, eventsPayload, activityPayload] = await Promise.all(
        responses.map((response) => response.json() as Promise<unknown>),
      );
      const teachers = getRecords<TeacherRecord>(teachersPayload);
      const subjects = getRecords<SubjectRecord>(subjectsPayload);
      const events = getRecords<CalendarEvent>(eventsPayload);
      const activity = getRecords<AuditRecord>(activityPayload);

      const now = new Date();
      const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
      const todayName = now.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
      const allUpcomingEvents = events
        .filter((event) => typeof event.event_date === "string" && event.event_date >= todayKey)
        .sort((a, b) =>
          `${a.event_date} ${a.start_time || ""}`.localeCompare(`${b.event_date} ${b.start_time || ""}`)
        );
      const recentActivity = activity
        .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
        .slice(0, 5);

      setDashboard({
        activeTeachers: teachers.filter((teacher) => teacher.status?.toLowerCase() === "active").length,
        activeSubjects: subjects.filter((subject) => subject.status?.toLowerCase() === "active").length,
        classesToday: subjects.filter((subject) => subject.subject_day?.toLowerCase() === todayName).length,
        upcomingEventCount: allUpcomingEvents.length,
        upcomingEvents: allUpcomingEvents.slice(0, 5),
        recentActivity,
      });
    } catch (error) {
      console.error("Failed to load Admin Dashboard:", error);
      setLoadError(error instanceof Error ? error.message : "Unable to load dashboard data.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchDashboard();
  }, [fetchDashboard]);

  const stats = [
    {
      label: "Active Teachers",
      value: dashboard.activeTeachers,
      href: "/portal/admin/manage-teachers",
      detail: "Currently active faculty",
      icon: "M8 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm8-1a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM2 21v-1a6 6 0 0 1 6-6h1a6 6 0 0 1 6 6v1m1-7h1a5 5 0 0 1 5 5v2h-5",
    },
    {
      label: "Active Subjects",
      value: dashboard.activeSubjects,
      href: "/portal/admin/manage-subjects",
      detail: "Available in the system",
      icon: "M4 19.5A2.5 2.5 0 0 1 6.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z",
    },
    {
      label: "Classes Today",
      value: dashboard.classesToday,
      href: "/portal/admin/manage-schedule",
      detail: "Scheduled for today",
      icon: "M8 2v4m8-4v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14H3V6a2 2 0 0 1 2-2Z",
    },
  ];

  return (
    <div className="flex min-h-0 w-full flex-1 flex-col gap-3 overflow-visible md:h-full md:overflow-hidden md:gap-4">
      <header className="flex shrink-0 flex-row items-start justify-between gap-2 px-1 py-1">
        <div className="portal-dashboard-heading min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-700">Administration</p>
          <h1 className="mt-0.5 text-xl font-bold tracking-tight text-[#06264A] md:text-2xl">Dashboard</h1>
          <p className="mt-1 hidden text-xs text-slate-500 sm:block">A clear overview of school operations.</p>
        </div>
        <button
          type="button"
          onClick={() => void fetchDashboard()}
          disabled={isLoading}
          className="shrink-0 cursor-pointer rounded-lg border border-amber-300 bg-amber-300 px-4 py-2 text-sm font-bold text-[#06264A] shadow-sm transition-colors hover:border-amber-200 hover:bg-amber-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#06264A] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? "Refreshing…" : "Refresh"}
        </button>
      </header>

      {loadError && (
        <div role="alert" className="flex shrink-0 flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800 sm:flex-row sm:items-center sm:justify-between">
          <span>{loadError}</span>
          <button
            type="button"
            onClick={() => void fetchDashboard()}
            className="admin-dashboard-retry-button self-start sm:self-auto"
          >
            Try again
          </button>
        </div>
      )}

      <section aria-label="School statistics" className="grid shrink-0 grid-cols-2 gap-2 sm:gap-3 xl:grid-cols-3">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="group cursor-pointer rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:border-amber-400 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B3763] focus-visible:ring-offset-2 sm:rounded-2xl sm:p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                <p className="mt-1 text-2xl font-bold text-slate-900 sm:mt-2 sm:text-3xl">
                  {isLoading ? <span className="inline-block h-9 w-12 animate-pulse rounded bg-slate-100" /> : stat.value}
                </p>
              </div>
              <span className="rounded-lg bg-blue-50 p-2 text-[#0B3763] transition-colors group-hover:bg-blue-100 sm:rounded-xl sm:p-3">
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="size-5 sm:size-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d={stat.icon} />
                </svg>
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between gap-2 sm:mt-3">
              <p className="truncate text-[11px] font-medium text-slate-500 sm:text-xs">{stat.detail}</p>
              <span className="shrink-0 text-[11px] font-bold text-[#0B3763] transition group-hover:text-amber-700 sm:text-xs">
                View
              </span>
            </div>
          </Link>
        ))}
      </section>

      <div className="grid grid-cols-1 gap-3 overflow-visible md:min-h-0 md:flex-1 md:grid-cols-2 md:overflow-hidden md:gap-3">
        <section aria-label="Upcoming events" className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:rounded-2xl sm:p-4 md:min-h-0 md:overflow-hidden">
          <div className="mb-2 flex items-center justify-between gap-3 sm:mb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 sm:text-lg">Upcoming Events</h2>
              <p className="mt-1 hidden text-sm text-slate-500 sm:block">The next scheduled school events.</p>
            </div>
            <Link href="/portal/admin/events" className="shrink-0 rounded-md px-2 py-1 text-xs font-bold text-blue-800 underline-offset-4 transition hover:bg-blue-50 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 sm:text-sm">
              View calendar
            </Link>
          </div>
          {isLoading ? (
            <p className="py-8 text-center text-sm text-slate-400">Loading upcoming events…</p>
          ) : dashboard.upcomingEvents.length === 0 ? (
            <p className="rounded-xl bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">No upcoming events scheduled.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {dashboard.upcomingEvents.map((event, index) => (
                <li key={event._id || `${event.event_date}-${event.title}-${index}`} className="flex items-center gap-3 py-2 first:pt-1 last:pb-1">
                  <div className="min-w-[4.5rem] rounded-lg bg-blue-50 px-2 py-2 text-center">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-blue-800">
                      {event.event_date ? new Date(`${event.event_date}T12:00:00`).toLocaleDateString(undefined, { month: "short" }) : ""}
                    </p>
                    <p className="text-lg font-bold leading-tight text-[#0B3763]">
                      {event.event_date ? Number(event.event_date.slice(-2)) : "—"}
                    </p>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900">{event.title || "Untitled event"}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {formatEventDate(event.event_date)}
                      {event.start_time ? ` · ${event.start_time}${event.end_time ? ` – ${event.end_time}` : ""}` : ""}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-label="Recent activity" className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:rounded-2xl sm:p-4 md:min-h-0 md:overflow-hidden">
          <div className="mb-2 flex items-center justify-between gap-3 sm:mb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 sm:text-lg">Recent Activity</h2>
              <p className="mt-1 hidden text-sm text-slate-500 sm:block">Latest actions recorded in the system.</p>
            </div>
            <Link href="/portal/admin/activitylog" className="shrink-0 rounded-md px-2 py-1 text-xs font-bold text-blue-800 underline-offset-4 transition hover:bg-blue-50 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 sm:text-sm">
              View all
            </Link>
          </div>
          {isLoading ? (
            <p className="py-8 text-center text-sm text-slate-400">Loading recent activity…</p>
          ) : dashboard.recentActivity.length === 0 ? (
            <p className="rounded-xl bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">No activity has been recorded yet.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {dashboard.recentActivity.map((item, index) => (
                <li key={item._id || `${item.createdAt}-${index}`} className="flex gap-3 py-2 first:pt-1 last:pb-1">
                  <span className="mt-1.5 size-2 shrink-0 rounded-full bg-[#FFB900]" aria-hidden="true" />
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-1 text-sm text-slate-800">{item.activity || "System activity"}</p>
                    <p className="mt-1 truncate text-xs text-slate-500">
                      {item.username || "System"}{item.user_type ? ` · ${item.user_type}` : ""} · {formatActivityDate(item.createdAt)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
