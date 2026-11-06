"use client";

import { useState, useEffect } from "react";

type CalendarEvent = {
  _id?: string;
  eventDate: string;
  title: string;
  color: string;
  startTime: string;
  endTime: string;
};

type EventMap = Record<string, CalendarEvent[]>;
type CalendarView = "calendar" | "history";

export default function CalendarModule() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<EventMap>({});
  const [allEvents, setAllEvents] = useState<CalendarEvent[]>([]);
  const [activeView, setActiveView] = useState<CalendarView>("calendar");
  const [historySearch, setHistorySearch] = useState("");
  const [historyYear, setHistoryYear] = useState("all");
  const [loading, setLoading] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [startTime, setStartTime] = useState("07:00 AM");
  const [endTime, setEndTime] = useState("08:00 AM");
  const [color, setColor] = useState("bg-blue-500");
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editEventId, setEditEventId] = useState<string | null>(null);
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const today = new Date();
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const minCalendarDate = new Date(today.getFullYear() - 1, today.getMonth(), 1);
  const maxCalendarDate = new Date(today.getFullYear() + 1, today.getMonth(), 1);
  const displayedMonth = new Date(year, month, 1);
  const canGoPrevious = displayedMonth > minCalendarDate;
  const canGoNext = displayedMonth < maxCalendarDate;
  const pastEvents = allEvents
    .filter((event) => event.eventDate < todayKey)
    .sort((a, b) => b.eventDate.localeCompare(a.eventDate));
  const historyYears = [...new Set(pastEvents.map((event) => event.eventDate.slice(0, 4)))].sort(
    (a, b) => b.localeCompare(a)
  );
  const filteredPastEvents = pastEvents.filter((event) => {
    const matchesYear = historyYear === "all" || event.eventDate.startsWith(`${historyYear}-`);
    const matchesSearch = `${event.title} ${event.eventDate} ${event.startTime} ${event.endTime}`
      .toLowerCase()
      .includes(historySearch.trim().toLowerCase());
    return matchesYear && matchesSearch;
  });

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const timeOptions = [
    "07:00 AM", "08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
    "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM", "06:00 PM", "07:00 PM"
  ];

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/portal/admin?table=events");
      if (!response.ok) throw new Error("Failed to fetch events");

      const rawData = await response.json();

      const mappedEvents: EventMap = {};
      const eventRecords: CalendarEvent[] = [];
      rawData.forEach((item: any) => {
        const dateKey = item.event_date;
        const eventRecord = {
          _id: item._id,
          eventDate: dateKey,
          title: item.title,
          color: item.color,
          startTime: item.start_time,
          endTime: item.end_time,
        };
        eventRecords.push(eventRecord);
        if (!mappedEvents[dateKey]) {
          mappedEvents[dateKey] = [];
        }
        mappedEvents[dateKey].push(eventRecord);
      });

      setEvents(mappedEvents);
      setAllEvents(eventRecords);
    } catch (err) {
      console.error("Error loading events:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [currentDate]);

  const saveEvent = async () => {
    if (!selectedDay || !title) return;

    const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(selectedDay).padStart(2, "0")}`;

    const payload = {
      event_date: dateKey,
      title,
      color,
      start_time: startTime,
      end_time: endTime,
    };

    try {
      if (editEventId) {
        const response = await fetch("/api/portal/admin?table=events", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            _id: editEventId,
            ...payload
          }),
        });

        if (!response.ok) throw new Error("Failed to update event");
      } else {
        const response = await fetch("/api/portal/admin?table=events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!response.ok) throw new Error("Failed to save event");
      }

      await fetchEvents();
      closeModal();
    } catch (err) {
      console.error("Error saving event:", err);
    }
  };

  const closeModal = () => {
    setSelectedDay(null);
    setTitle("");
    setStartTime("07:00 AM");
    setEndTime("08:00 AM");
    setColor("bg-blue-500");
    setEditIndex(null);
    setEditEventId(null);
  };

  const changeMonth = (dir: -1 | 1) => {
    const nextMonth = new Date(year, month + dir, 1);
    if (nextMonth < minCalendarDate || nextMonth > maxCalendarDate) return;
    setCurrentDate(nextMonth);
  };

  const goToday = () => {
    setCurrentDate(new Date());
  };

  const colors = [
    "bg-blue-500",
    "bg-green-500",
    "bg-red-500",
    "bg-purple-500",
    "bg-yellow-500",
    "bg-pink-500",
  ];

  const cells = [];
  let day = 1;

  for (let row = 0; row < 6; row++) {
    const cols = [];

    for (let col = 0; col < 7; col++) {
      if ((row === 0 && col < firstDay) || day > daysInMonth) {
        cols.push(
          <td
            key={`${row}-${col}`}
            className="border border-blue-100 bg-blue-50/60 w-[14.28%] min-w-0"
          />
        );
      } else {
        const currentDay = day;
        const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        const isToday = dateKey === todayKey;

        cols.push(
          <td
            key={day}
            onClick={() => {
              setSelectedDay(currentDay);
              setEditIndex(null);
              setEditEventId(null);
              setTitle("");
              setStartTime("07:00 AM");
              setEndTime("08:00 AM");
              setColor("bg-blue-500");
            }}
            aria-current={isToday ? "date" : undefined}
            className={`relative w-[14.28%] min-w-0 cursor-pointer overflow-hidden border border-blue-100 p-1 align-top transition sm:p-2 ${
              isToday
                ? "bg-blue-100/70 shadow-[inset_0_0_0_2px_#2563eb] hover:bg-blue-100"
                : "hover:bg-blue-50"
            }`}
          >
            <div className={`mb-1 inline-flex min-h-6 items-center rounded-full px-1.5 text-xs font-bold sm:mb-2 sm:text-sm ${
              isToday ? "bg-blue-700 text-white" : "text-blue-950"
            }`}>
              {day}
            </div>

            <div className="space-y-1 max-h-[calc(100%-1.5rem)] overflow-y-auto animate-fade-in">
              {events[dateKey]?.map((event, index) => (
                <div
                  key={event._id || index}
                  className={`${event.color} text-white text-[10px] px-2 py-1 rounded-lg shadow-sm w-full`}
                >
                  <div className="font-semibold truncate">
                    {event.title}
                  </div>

                  <div className="text-[9px] opacity-90 truncate">
                    {event.startTime} - {event.endTime}
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();

                      setSelectedDay(currentDay);
                      setTitle(event.title);
                      setStartTime(event.startTime);
                      setEndTime(event.endTime);
                      setColor(event.color);

                      setEditIndex(index);
                      setEditEventId(event._id || null);
                    }}
                    className="mt-1 text-[9px] opacity-80 hover:opacity-100 block underline"
                  >
                    ✏️ Edit
                  </button>
                </div>
              ))}
            </div>
          </td>
        );

        day++;
      }
    }

    cells.push(<tr key={row} className="h-[16.666%]">{cols}</tr>);
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-sm">
      <div className="admin-calendar-toolbar flex shrink-0 items-center justify-between gap-3 border-b border-blue-100 bg-[#F7FAFF] px-3 py-2 sm:px-5 sm:py-3">
        <div className="flex min-w-0 items-center gap-3 sm:gap-5">
        {activeView === "calendar" && (
        <button
          onClick={goToday}
          className="calendar-today-button rounded-full border border-slate-400 bg-white px-5 py-2 text-sm font-medium text-slate-900 transition-colors hover:bg-blue-50"
        >
          Today
        </button>
        )}

        {activeView === "calendar" && (
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="flex items-center gap-1">
            <button
              onClick={() => changeMonth(-1)}
              disabled={!canGoPrevious}
              aria-label="Previous month"
              className="calendar-month-button rounded-full p-1 text-slate-700 transition-colors hover:bg-blue-100 disabled:opacity-40"
            >
              <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.5" className="size-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="m12 4-6 6 6 6" />
              </svg>
            </button>
            <button
              onClick={() => changeMonth(1)}
              disabled={!canGoNext}
              aria-label="Next month"
              className="calendar-month-button rounded-full p-1 text-slate-700 transition-colors hover:bg-blue-100 disabled:opacity-40"
            >
              <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.5" className="size-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="m8 4 6 6-6 6" />
              </svg>
            </button>
          </div>

          <h3 className="whitespace-nowrap text-xl font-normal tracking-tight text-blue-950 sm:text-2xl">
            {monthNames[month]} {year}
          </h3>
        </div>
        )}

        {loading && (
          <span className="text-xs text-blue-600 animate-pulse">
            Loading...
          </span>
        )}
        </div>

        <button
          onClick={() => setActiveView((view) => view === "calendar" ? "history" : "calendar")}
          className="admin-calendar-toolbar-action shrink-0 rounded-lg border border-blue-200 bg-white px-3 py-2 text-xs font-semibold text-blue-900 transition-colors hover:bg-blue-50 sm:text-sm"
        >
          {activeView === "calendar" ? "Event History" : "Calendar"}
        </button>
      </div>

      {activeView === "calendar" ? (
      <div className="min-h-0 flex-1 overflow-hidden p-2 sm:p-3">
        <table className="h-full w-full table-fixed border-collapse overflow-hidden rounded-lg shadow-[0_0_0_1px_rgba(219,234,254,1)]">
          <thead>
            <tr className="h-8 bg-[#0B3763]">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                <th
                  key={d}
                  className="p-2 md:p-3 text-[9px] font-black text-white uppercase tracking-widest border border-blue-800 w-[14.28%] min-w-0"
                >
                  {d}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="h-full">{cells}</tbody>
        </table>
      </div>
      ) : (
        <section aria-label="Past event history" className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="w-full">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
              <h3 className="text-lg font-bold text-blue-950">Past Event History</h3>
              <p className="mt-1 text-sm text-slate-500">Previously scheduled events, with the most recent dates first.</p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <label className="sr-only" htmlFor="event-history-search">Search past events</label>
                <input
                  id="event-history-search"
                  type="search"
                  value={historySearch}
                  onChange={(event) => setHistorySearch(event.target.value)}
                  placeholder="Search events..."
                  className="w-full rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 sm:w-56"
                />
                <label className="sr-only" htmlFor="event-history-year">Filter past events by year</label>
                <select
                  id="event-history-year"
                  value={historyYear}
                  onChange={(event) => setHistoryYear(event.target.value)}
                  className="rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="all">All years</option>
                  {historyYears.map((eventYear) => (
                    <option key={eventYear} value={eventYear}>{eventYear}</option>
                  ))}
                </select>
              </div>
            </div>
            {pastEvents.length === 0 ? (
              <div className="rounded-xl border border-dashed border-blue-200 bg-blue-50/50 px-5 py-10 text-center">
                <p className="font-semibold text-blue-950">No past events yet</p>
                <p className="mt-1 text-sm text-slate-500">Events will appear here after their scheduled date has passed.</p>
              </div>
            ) : filteredPastEvents.length === 0 ? (
              <div className="rounded-xl border border-dashed border-blue-200 bg-blue-50/50 px-5 py-10 text-center">
                <p className="font-semibold text-blue-950">No matching events</p>
                <p className="mt-1 text-sm text-slate-500">Try another search term or year.</p>
              </div>
            ) : (
              <ol className="space-y-3">
                {filteredPastEvents.map((event, index) => {
                  const [eventYear, eventMonth, eventDay] = event.eventDate.split("-").map(Number);
                  const formattedDate = new Date(eventYear, eventMonth - 1, eventDay).toLocaleDateString(
                    undefined,
                    { year: "numeric", month: "long", day: "numeric" }
                  );
                  return (
                    <li
                      key={event._id || `${event.eventDate}-${event.title}-${index}`}
                      className="flex items-start gap-3 rounded-xl border border-blue-100 bg-white p-4 shadow-sm"
                    >
                      <span className={`mt-1.5 size-3 shrink-0 rounded-full ${event.color || "bg-blue-500"}`} aria-hidden="true" />
                      <div className="min-w-0 flex-1">
                        <h4 className="truncate font-semibold text-slate-900">{event.title}</h4>
                        <p className="mt-1 text-sm text-slate-600">{formattedDate}</p>
                        <p className="mt-0.5 text-xs text-slate-500">{event.startTime} – {event.endTime}</p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}
          </div>
        </section>
      )}

      {selectedDay && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-5 rounded-2xl w-80 shadow-xl border border-blue-100">
            <h2 className="font-bold mb-3 text-blue-950">
              {editEventId !== null ? "Edit Event" : "Add Event"}{" "}
              — {monthNames[month]} {selectedDay}, {year}
            </h2>

            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Title</label>
                <input
                  className="border border-slate-200 p-2 w-full rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Event title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Start Time</label>
                <select
                  className="border border-slate-200 p-2 w-full rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                >
                  {timeOptions.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">End Time</label>
                <select
                  className="border border-slate-200 p-2 w-full rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                >
                  {timeOptions.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-2 flex-wrap mb-4">
              {colors.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`admin-color-swatch w-7 h-7 rounded-full ${c} ${color === c ? "ring-2 ring-blue-950 ring-offset-2" : ""
                    }`}
                />
              ))}
            </div>

            <button
              onClick={saveEvent}
              className="admin-save-event-button w-full rounded-xl border border-[#0B3763] bg-[#0B3763] py-2 font-semibold text-white transition-colors hover:bg-[#06264A]"
            >
              {editEventId !== null ? "Update Event" : "Add Event"}
            </button>

            <button
              onClick={closeModal}
              className="admin-cancel-event-button mt-2 w-full rounded-lg border border-transparent bg-transparent py-2 text-center text-sm text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
