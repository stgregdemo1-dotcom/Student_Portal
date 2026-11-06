"use client";

import { useEffect, useMemo, useState } from "react";

type CalendarEvent = {
  _id?: string;
  date: string;
  title: string;
  color: string;
  startTime: string;
  endTime: string;
};

type EventsResponse = {
  success: boolean;
  message?: string;
  events: CalendarEvent[];
};

type DashboardView = "calendar" | "events";
type EventListView = "upcoming" | "past";
type EventNotificationSnapshot = {
  initialized: boolean;
  known: string[];
  unread: string[];
};

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function toLocalDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function toEventDate(date: string) {
  return new Date(`${date}T00:00:00`);
}

function formatEventDate(date: string) {
  const parsedDate = toEventDate(date);
  return Number.isNaN(parsedDate.getTime())
    ? date
    : parsedDate.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
}

function getEventKey(event: CalendarEvent) {
  return event._id || `${event.date}|${event.title}|${event.startTime}|${event.endTime}`;
}

function readNotificationSnapshot(storageKey: string): EventNotificationSnapshot | null {
  try {
    const stored = localStorage.getItem(storageKey);
    if (!stored) return null;
    const parsed: unknown = JSON.parse(stored);
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      !("known" in parsed) ||
      !("unread" in parsed) ||
      !Array.isArray(parsed.known) ||
      !Array.isArray(parsed.unread)
    ) {
      console.error("Stored calendar notification data is invalid.");
      return null;
    }

    return {
      initialized: true,
      known: parsed.known.filter((key): key is string => typeof key === "string"),
      unread: parsed.unread.filter((key): key is string => typeof key === "string"),
    };
  } catch (storageError) {
    console.error("Failed to read calendar notification data:", storageError);
    return null;
  }
}

function saveNotificationSnapshot(storageKey: string, snapshot: EventNotificationSnapshot) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(snapshot));
  } catch (storageError) {
    console.error("Failed to save calendar notification data:", storageError);
  }
}

function PastEventsPanel({
  events,
  loading,
  error,
  activeList,
  onChangeList,
  unreadCount,
  unreadEventKeys,
  onSelectEvent,
  className = "",
}: {
  events: CalendarEvent[];
  loading: boolean;
  error: string;
  activeList: EventListView;
  onChangeList: (view: EventListView) => void;
  unreadCount: number;
  unreadEventKeys: string[];
  onSelectEvent: (event: CalendarEvent) => void;
  className?: string;
}) {
  const [isListMenuOpen, setIsListMenuOpen] = useState(false);
  const [selectedPastYear, setSelectedPastYear] = useState("all");
  const availableYears = [...new Set(events
    .map((event) => event.date.slice(0, 4))
    .filter((eventYear) => /^\d{4}$/.test(eventYear)))].sort((a, b) => b.localeCompare(a));
  const filteredEvents = activeList === "past" && selectedPastYear !== "all"
    ? events.filter((event) => event.date.startsWith(`${selectedPastYear}-`))
    : events;

  return (
    <section
      aria-labelledby="past-events-title"
      className={`flex min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm ${className}`}
    >
      <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-slate-100 px-4">
        <div className="relative min-w-0">
          <h2 id="past-events-title" className="text-sm font-extrabold text-[#082b49]">
            <button
              type="button"
              aria-haspopup="menu"
              aria-expanded={isListMenuOpen}
              onClick={() => setIsListMenuOpen((isOpen) => !isOpen)}
              className="flex max-w-full cursor-pointer items-center gap-2 rounded-lg border border-transparent px-2 py-1.5 text-left outline-none transition-all hover:border-amber-300 hover:bg-amber-50 hover:shadow-sm focus-visible:ring-2 focus-visible:ring-[#d99a00]/40"
            >
              <i className={`fa-solid ${activeList === "upcoming" ? "fa-calendar-check" : "fa-clock-rotate-left"} shrink-0 text-[#d99a00]`} aria-hidden="true" />
              <span className="truncate">{activeList === "upcoming" ? "Upcoming events" : "Past events"}</span>
              <i className={`fa-solid fa-chevron-down shrink-0 text-[10px] text-slate-500 transition-transform ${isListMenuOpen ? "rotate-180" : ""}`} aria-hidden="true" />
            </button>
          </h2>
          {isListMenuOpen && (
            <div role="menu" aria-labelledby="past-events-title" className="absolute left-0 top-full z-20 mt-2 min-w-36 overflow-hidden rounded-lg border border-amber-200 bg-white p-1 shadow-lg">
              {(["upcoming", "past"] as const).map((view) => (
                <button
                  key={view}
                  type="button"
                  role="menuitem"
                  aria-current={activeList === view ? "true" : undefined}
                  onClick={() => {
                    onChangeList(view);
                    setIsListMenuOpen(false);
                  }}
                  className={`block w-full cursor-pointer rounded-md px-3 py-2 text-left text-xs font-bold transition-all hover:bg-[#fff4cb] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#d99a00] ${activeList === view ? "bg-[#fff8e4] text-[#805600]" : "text-[#082b49]"}`}
                >
                  {view === "upcoming" ? "Upcoming events" : "Past events"}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {activeList === "past" && (
            <label className="relative">
              <span className="sr-only">Filter past events by year</span>
              <select
                value={selectedPastYear}
                onChange={(event) => setSelectedPastYear(event.target.value)}
                disabled={availableYears.length === 0}
                className="min-h-8 max-w-32 cursor-pointer appearance-none rounded-lg border border-amber-300 bg-white py-1 pl-2.5 pr-7 text-xs font-bold text-[#082b49] shadow-sm outline-none transition hover:border-[#d99a00] hover:shadow-md focus:border-[#d99a00] focus:ring-2 focus:ring-[#d99a00]/30 disabled:cursor-not-allowed disabled:text-slate-400"
              >
                <option value="all">All years</option>
                {availableYears.map((eventYear) => (
                  <option key={eventYear} value={eventYear}>{eventYear}</option>
                ))}
              </select>
              <i className="fa-solid fa-chevron-down pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] text-slate-500" aria-hidden="true" />
            </label>
          )}
          {unreadCount > 0 && (
            <span
              aria-label={`${unreadCount} unread event${unreadCount === 1 ? "" : "s"}`}
              className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1.5 text-[11px] font-extrabold text-white"
            >
              {unreadCount}
            </span>
          )}
        </div>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        {error ? (
          <p role="alert" className="p-3 text-sm text-red-700">{error}</p>
        ) : loading ? (
          <p className="p-3 text-sm text-slate-500">Loading event history…</p>
        ) : filteredEvents.length ? (
          <ul className="space-y-2">
            {filteredEvents.map((event, index) => (
              <li
                key={event._id || `${event.date}-${event.title}-${index}`}
                className="rounded-xl border border-slate-100"
              >
                <button
                  type="button"
                  onClick={() => onSelectEvent(event)}
                  className="flex w-full cursor-pointer items-start gap-3 rounded-xl p-3 text-left transition-all hover:bg-[#fffaf0] hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#d99a00]"
                  aria-label={`View details for ${event.title}`}
                >
                  <span
                    className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${
                      unreadEventKeys.includes(getEventKey(event)) ? "bg-red-600" : "bg-[#e6a900]"
                    }`}
                    aria-hidden="true"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-bold text-[#082b49]" title={event.title}>
                      {event.title}
                    </span>
                    <span className="mt-1 block text-xs text-slate-500">
                      {formatEventDate(event.date)}
                      {event.startTime && event.startTime !== "—" ? ` · ${event.startTime}` : ""}
                      {event.endTime && event.endTime !== "—" ? `–${event.endTime}` : ""}
                    </span>
                  </span>
                  <i className="fa-solid fa-chevron-right mt-1 text-xs text-slate-400" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="p-3 text-sm text-slate-500">
            {activeList === "upcoming"
              ? "No upcoming events."
              : selectedPastYear === "all"
                ? "No past events have been recorded."
                : `No past events recorded for ${selectedPastYear}.`}
          </p>
        )}
      </div>
    </section>
  );
}

export default function DashboardPage() {
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeView, setActiveView] = useState<DashboardView>("calendar");
  const [activeEventList, setActiveEventList] = useState<EventListView>("upcoming");
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [unreadEventKeys, setUnreadEventKeys] = useState<string[]>([]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const today = new Date();
  const todayKey = toLocalDateKey(today);
  const monthStart = new Date(year, month, 1);
  const earliestMonth = new Date(today.getFullYear(), today.getMonth() - 3, 1);
  const latestMonth = new Date(today.getFullYear(), today.getMonth() + 2, 1);
  const canGoPrevious = monthStart > earliestMonth;
  const canGoNext = monthStart < latestMonth;

  useEffect(() => {
    const controller = new AbortController();
    let requestInProgress = false;

    const usernameCookie = document.cookie
      .split("; ")
      .find((cookie) => cookie.startsWith("username="))
      ?.slice("username=".length);
    const storageKey = `sgcst-calendar-notifications-v1:${usernameCookie || "guest"}`;

    const loadEvents = async () => {
      if (requestInProgress) return;
      requestInProgress = true;
      try {
        const response = await fetch("/api/portal/student?getCalendarEvents=true", {
          signal: controller.signal,
        });
        const result = await response.json() as EventsResponse;
        if (!response.ok || !result.success || !Array.isArray(result.events)) {
          throw new Error(result.message || "Unable to load calendar events.");
        }
        const validEvents = result.events.filter((event) => event.date);
        const currentKeys = validEvents.map(getEventKey);
        const stored = readNotificationSnapshot(storageKey);
        const snapshot: EventNotificationSnapshot = stored
          ? {
              initialized: true,
              known: [...new Set([...stored.known, ...currentKeys])],
              unread: [...new Set([
                ...stored.unread,
                ...currentKeys.filter((key) => !stored.known.includes(key)),
              ])],
            }
          : {
              initialized: true,
              known: currentKeys,
              unread: [],
            };

        saveNotificationSnapshot(storageKey, snapshot);
        setUnreadEventKeys(snapshot.unread);
        setEvents(validEvents);
        setError("");
      } catch (loadError) {
        if (controller.signal.aborted) return;
        console.error("Error loading student calendar events:", loadError);
        setError("Calendar events could not be loaded.");
      } finally {
        requestInProgress = false;
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    void loadEvents();
    const intervalId = window.setInterval(() => void loadEvents(), 30_000);
    return () => {
      window.clearInterval(intervalId);
      controller.abort();
    };
  }, []);

  useEffect(() => {
    if (!selectedEvent) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedEvent(null);
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [selectedEvent]);

  const eventsByDate = useMemo(() => {
    const mapped: Record<string, CalendarEvent[]> = {};
    for (const event of events) {
      (mapped[event.date] ||= []).push(event);
    }
    return mapped;
  }, [events]);

  const pastEvents = useMemo(
    () => events
      .filter((event) => event.date < todayKey)
      .sort((a, b) => b.date.localeCompare(a.date)),
    [events, todayKey],
  );
  const upcomingEvents = useMemo(
    () => events
      .filter((event) => event.date >= todayKey)
      .sort((a, b) => a.date.localeCompare(b.date)),
    [events, todayKey],
  );
  const visibleEvents = activeEventList === "upcoming" ? upcomingEvents : pastEvents;

  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const visibleDayCount = Math.ceil((firstDay + daysInMonth) / 7) * 7;
    const firstVisibleDate = new Date(year, month, 1 - firstDay);
    return Array.from({ length: visibleDayCount }, (_, index) => {
      const date = new Date(firstVisibleDate);
      date.setDate(firstVisibleDate.getDate() + index);
      return date;
    });
  }, [month, year]);
  const calendarRows = calendarDays.length / 7;

  const changeMonth = (amount: number) => {
    const targetMonth = new Date(year, month + amount, 1);
    if (targetMonth < earliestMonth || targetMonth > latestMonth) return;
    setCurrentDate(targetMonth);
  };

  const goToday = () => setCurrentDate(new Date());

  const openEvent = (event: CalendarEvent) => {
    const eventKey = getEventKey(event);
    const nextUnreadKeys = unreadEventKeys.filter((key) => key !== eventKey);
    if (nextUnreadKeys.length !== unreadEventKeys.length) {
      setUnreadEventKeys(nextUnreadKeys);
      const usernameCookie = document.cookie
        .split("; ")
        .find((cookie) => cookie.startsWith("username="))
        ?.slice("username=".length);
      const storageKey = `sgcst-calendar-notifications-v1:${usernameCookie || "guest"}`;
      const snapshot = readNotificationSnapshot(storageKey);
      saveNotificationSnapshot(storageKey, {
        initialized: true,
        known: [...new Set([...(snapshot?.known || []), eventKey])],
        unread: nextUnreadKeys,
      });
    }
    setSelectedEvent(event);
  };

  return (
    <div className="flex h-full min-h-0 flex-col gap-2 overflow-hidden text-slate-700 sm:gap-3">
      <div className="flex shrink-0 gap-1 rounded-xl border border-[#e6a900]/50 bg-[#fff9e9] p-1 shadow-sm">
        {(["calendar", "events"] as const).map((view) => (
          <button
            key={view}
            type="button"
            onClick={() => setActiveView(view)}
            aria-pressed={activeView === view}
            className={`flex min-h-11 flex-1 cursor-pointer items-center justify-center rounded-lg border px-4 py-2.5 text-sm font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#d99a00] active:scale-[0.99] ${
              activeView === view
                ? "border-[#e6a900] bg-[#ffdf43] text-[#082b49] shadow-[0_2px_6px_rgba(114,65,0,0.18)]"
                : "border-transparent bg-transparent text-[#082b49] hover:bg-[#ffe868]/70"
            }`}
          >
            {view === "events" ? (
              <span className="flex items-center justify-center gap-2">
                <i className="fa-solid fa-calendar-days" aria-hidden="true" />
                Events
                {unreadEventKeys.length > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1.5 text-[10px] font-extrabold text-white">
                    {unreadEventKeys.length}
                  </span>
                )}
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <i className="fa-solid fa-calendar" aria-hidden="true" />
                Calendar
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="flex min-h-0 flex-1 gap-3">
        <section
          aria-label={`${MONTHS[month]} ${year} calendar`}
          className={`${activeView === "calendar" ? "flex" : "hidden"} min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm`}
        >
          <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-[#f8fafd] px-3 py-2.5 sm:px-5">
            <div className="flex items-center gap-2 sm:gap-4">
              <button
                type="button"
                onClick={goToday}
                className="cursor-pointer rounded-full border border-amber-300 bg-white px-4 py-1.5 text-sm font-bold text-[#082b49] shadow-sm transition-all hover:border-[#d99a00] hover:bg-[#fff4cb] hover:shadow-md active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d99a00] focus-visible:ring-offset-2"
              >
                Today
              </button>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => changeMonth(-1)}
                  disabled={!canGoPrevious}
                  aria-label="Previous month"
                  title="View up to three months ago"
                  className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-amber-300 bg-white text-[#082b49] shadow-sm transition-all hover:border-[#d99a00] hover:bg-[#fff4cb] hover:shadow-md active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d99a00] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-50 disabled:text-slate-300 disabled:shadow-none disabled:hover:bg-slate-50"
                >
                  <i className="fa-solid fa-chevron-left text-xs" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => changeMonth(1)}
                  disabled={!canGoNext}
                  aria-label="Next month"
                  className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-amber-300 bg-white text-[#082b49] shadow-sm transition-all hover:border-[#d99a00] hover:bg-[#fff4cb] hover:shadow-md active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d99a00] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-50 disabled:text-slate-300 disabled:shadow-none disabled:hover:bg-slate-50"
                >
                  <i className="fa-solid fa-chevron-right text-xs" aria-hidden="true" />
                </button>
              </div>
              <h2 className="whitespace-nowrap text-lg font-medium tracking-tight text-slate-800 sm:text-xl">
                {MONTHS[month]} {year}
              </h2>
            </div>
            <span className="text-[11px] font-medium text-slate-500" aria-live="polite">
              {loading ? "Loading events…" : error ? "Events unavailable" : `${Object.keys(eventsByDate).length} event days`}
            </span>
          </header>

          <div
            className="grid shrink-0 border-b border-slate-300 bg-slate-50"
            style={{ gridTemplateColumns: "repeat(7, minmax(0, 1fr))" }}
          >
            {WEEKDAYS.map((weekday) => (
              <div key={weekday} className="border-r border-slate-300 py-2 text-center text-[10px] font-bold uppercase tracking-wide text-slate-700 last:border-r-0 sm:py-2.5 sm:text-[11px]">
                {weekday}
              </div>
            ))}
          </div>

          <div
            className="grid min-h-0 flex-1 grid-cols-7"
            style={{
              gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
              gridTemplateRows: `repeat(${calendarRows}, minmax(0, 1fr))`,
            }}
          >
            {calendarDays.map((date, index) => {
              const dateKey = toLocalDateKey(date);
              const dayEvents = dateKey ? eventsByDate[dateKey] || [] : [];
              const isToday = dateKey === todayKey;
              const isCurrentMonth = date.getMonth() === month;
              const showMonthLabel = date.getDate() === 1;

              return (
                <div
                  key={dateKey || `date-${index}`}
                  className={`flex min-h-0 flex-col overflow-hidden border-b border-r border-slate-300 p-1 sm:p-1.5 ${
                    isToday ? "bg-[#eaf2ff] shadow-[inset_0_0_0_1px_#1967d2]" : "bg-white"
                  }`}
                >
                  <span className={`inline-flex min-h-6 items-center gap-1 rounded-full px-1.5 text-[11px] font-bold sm:text-xs ${
                    isToday
                      ? "bg-[#1967d2] text-white"
                      : isCurrentMonth
                        ? "text-slate-800"
                        : "text-slate-500"
                  }`}>
                    <span>{date.getDate()}</span>
                    {showMonthLabel && <span>{MONTHS[date.getMonth()].slice(0, 3)}</span>}
                  </span>
                  <div
                    aria-label={`Events on ${dateKey}`}
                    className="mt-1 min-h-0 flex-1 space-y-0.5 overflow-y-auto overscroll-contain pr-0.5"
                  >
                    {dayEvents.map((event, eventIndex) => (
                      <button
                        type="button"
                        key={event._id || `${dateKey}-${eventIndex}`}
                        onClick={() => openEvent(event)}
                        title={`View details: ${event.title}`}
                        aria-label={`View details for ${event.title}`}
                        className={`${event.color || "bg-[#0b8043]"} flex w-full cursor-pointer items-center gap-1.5 truncate rounded-full px-1.5 py-0.5 text-left text-[9px] font-medium leading-tight text-white transition-[filter,box-shadow] hover:brightness-90 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1967d2] focus-visible:ring-offset-1 sm:px-2 sm:text-[10px]`}
                      >
                        {unreadEventKeys.includes(getEventKey(event)) && (
                          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#ffdf43]" aria-hidden="true" />
                        )}
                        <span className="truncate">{event.title}</span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <PastEventsPanel
          events={visibleEvents}
          loading={loading}
          error={error}
          activeList={activeEventList}
          onChangeList={setActiveEventList}
          unreadCount={unreadEventKeys.length}
          unreadEventKeys={unreadEventKeys}
          onSelectEvent={openEvent}
          className={`${activeView === "events" ? "flex" : "hidden"} min-w-0 flex-1`}
        />
      </div>

      {selectedEvent && (
        <div
          className="portal-modal-backdrop fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-[2px]"
          onMouseDown={(mouseEvent) => {
            if (mouseEvent.target === mouseEvent.currentTarget) setSelectedEvent(null);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="event-details-title"
            className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
          >
            <header className="flex items-start justify-between gap-4 border-b border-slate-100 bg-[#f8fafd] px-5 py-4 sm:px-6">
              <div className="flex min-w-0 items-start gap-3">
                <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#fff4cb] text-[#8b6200]">
                  <i className="fa-solid fa-calendar-day" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#9a6b00]">Event details</p>
                  <h2 id="event-details-title" className="mt-1 break-words text-lg font-extrabold text-[#082b49]">
                    {selectedEvent.title}
                  </h2>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedEvent(null)}
                aria-label="Close event details"
                className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-transparent text-slate-600 transition-all hover:border-amber-300 hover:bg-amber-50 hover:text-[#082b49] hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d99a00]"
              >
                <i className="fa-solid fa-xmark" aria-hidden="true" />
              </button>
            </header>

            <dl className="grid gap-3 p-5 sm:grid-cols-2 sm:p-6">
              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
                <dt className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                  <i className="fa-solid fa-calendar text-[#bd8200]" aria-hidden="true" />
                  Date
                </dt>
                <dd className="mt-2 text-sm font-semibold text-[#082b49]">
                  {formatEventDate(selectedEvent.date)}
                </dd>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
                <dt className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                  <i className="fa-solid fa-clock text-[#bd8200]" aria-hidden="true" />
                  Time
                </dt>
                <dd className="mt-2 text-sm font-semibold text-[#082b49]">
                  {selectedEvent.startTime && selectedEvent.startTime !== "—" ? selectedEvent.startTime : "Not specified"}
                  {selectedEvent.endTime && selectedEvent.endTime !== "—" ? ` – ${selectedEvent.endTime}` : ""}
                </dd>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4 sm:col-span-2">
                <dt className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                  <i className="fa-solid fa-circle-info text-[#bd8200]" aria-hidden="true" />
                  Event
                </dt>
                <dd className="mt-2 break-words text-sm leading-6 text-slate-700">
                  {selectedEvent.title}
                </dd>
              </div>
            </dl>
          </section>
        </div>
      )}
    </div>
  );
}
