'use client';

import { useState, useEffect } from "react";

type CalendarEvent = {
  _id?: string;
  title: string;
  color: string;
  startTime: string;
  endTime: string;
};

type EventMap = Record<string, CalendarEvent[]>;

export default function DashboardPage() {
  const [currentDate, setCurrentDate] = useState<Date | null>(null);
  const [events, setEvents] = useState<EventMap>({});
  const [loading, setLoading] = useState(true);

  const year = currentDate ? currentDate.getFullYear() : new Date().getFullYear();
  const month = currentDate ? currentDate.getMonth() : new Date().getMonth();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const currentYear = new Date().getFullYear();
  const isMinMonth = month === 0;   // January boundary
  const isMaxMonth = month === 11;  // December boundary

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/portal/student?getCalendarEvents=true");
      if (!response.ok) throw new Error("Failed to fetch calendar events");
      
      const result = await response.json();
      
      if (result.success && result.events) {
        const mappedEvents: EventMap = {};
        
        result.events.forEach((item: any) => {
          const dateKey = item.date; // Expects "YYYY-MM-DD"
          if (!dateKey) return;

          if (!mappedEvents[dateKey]) {
            mappedEvents[dateKey] = [];
          }

          mappedEvents[dateKey].push({
            _id: item._id,
            title: item.title,
            color: item.color || "bg-blue-500",
            startTime: item.startTime || "—",
            endTime: item.endTime || "—",
          });
        });

        setEvents(mappedEvents);
      }
    } catch (err) {
      console.error("Error loading events:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentDate(new Date());
    fetchEvents();
  }, []);

  useEffect(() => {
    if (currentDate) {
      fetchEvents();
    }
  }, [currentDate]);

  const changeMonth = (dir: number) => {
    const targetDate = new Date(year, month + dir, 1);

    if (targetDate.getFullYear() !== currentYear) {
      return;
    }

    setCurrentDate(targetDate);
  };

  const goToday = () => {
    setCurrentDate(new Date());
  };

  const cells = [];
  let day = 1;

  for (let row = 0; row < 6; row++) {
    const cols = [];

    for (let col = 0; col < 7; col++) {
      if ((row === 0 && col < firstDay) || day > daysInMonth) {
        cols.push(
          <td
            key={`empty-${row}-${col}`}
            className="border border-slate-100 h-24 bg-slate-50/50 w-[14.28%] min-w-0"
          />
        );
      } else {
        const currentDay = day;
        const currentMonthStr = String(month + 1).padStart(2, "0");
        const currentDayStr = String(currentDay).padStart(2, "0");
        const dateKey = `${year}-${currentMonthStr}-${currentDayStr}`;

        const isToday = currentDate &&
          new Date().getDate() === currentDay &&
          new Date().getMonth() === month &&
          new Date().getFullYear() === year;

        cols.push(
          <td
            key={`day-${currentDay}`}
            className={`border border-slate-100 h-24 align-top p-2 transition w-[14.28%] min-w-0 overflow-hidden ${
              isToday ? 'bg-blue-50/20 font-black' : 'bg-white'
            }`}
          >
            <div className="flex flex-col h-full justify-between">
              <div className={`text-xs font-bold ${isToday ? 'text-blue-600' : 'text-slate-500'}`}>
                {currentDay}
              </div>

              <div className="mt-1 space-y-1 overflow-y-auto max-h-[55px] custom-scrollbar">
                {events[dateKey]?.map((event, index) => (
                  <div
                    key={event._id || `evt-${dateKey}-${index}`}
                    className={`${event.color} text-white text-[9px] md:text-[10px] px-2 py-0.5 rounded-md shadow-sm w-full font-medium tracking-tight`}
                    title={`${event.title} (${event.startTime} - ${event.endTime})`}
                  >
                    <div className="font-semibold truncate capitalize">
                      {event.title}
                    </div>
                    <div className="text-[8px] md:text-[9px] opacity-90 truncate leading-none mt-0.5">
                      {event.startTime} - {event.endTime}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </td>
        );

        day++;
      }
    }

    cells.push(<tr key={`week-${row}`}>{cols}</tr>);
    if (day > daysInMonth) break;
  }

  return (
    <div className="space-y-6 p-4 bg-gray-50/50 min-h-screen">
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="text-sm md:text-lg font-black text-slate-800 tracking-tight">
            {monthNames[month]}{" "}
            <span className="text-slate-300 font-light">
              {year}
            </span>
            {loading && <span className="ml-2 text-xs text-blue-500 animate-pulse">Syncing...</span>}
          </h3>

          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => changeMonth(-1)}
              disabled={isMinMonth}
              className={`px-3 py-1 text-[10px] font-bold transition-colors ${
                isMinMonth
                  ? "text-slate-300 cursor-not-allowed"
                  : "text-slate-500 hover:text-black"
              }`}
            >
              Prev
            </button>

            <button
              onClick={goToday}
              className="px-3 py-1 text-[10px] font-black uppercase bg-white text-blue-600 shadow-sm rounded-lg mx-1"
            >
              Today
            </button>

            <button
              onClick={() => changeMonth(1)}
              disabled={isMaxMonth}
              className={`px-3 py-1 text-[10px] font-bold transition-colors ${
                isMaxMonth
                  ? "text-slate-300 cursor-not-allowed"
                  : "text-slate-500 hover:text-black"
              }`}
            >
              Next
            </button>
          </div>
        </div>

        <div className="p-4 md:p-6 overflow-x-auto">
          <table className="w-full table-fixed border-collapse rounded-xl overflow-hidden shadow-[0_0_0_1px_rgba(241,245,249,1)]">
            <thead>
              <tr className="bg-slate-50/50">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                  <th
                    key={d}
                    className="p-2 md:p-3 text-[9px] font-black text-slate-400 uppercase tracking-widest border border-slate-100 w-[14.28%] min-w-0"
                  >
                    {d}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>{cells}</tbody>
          </table>
        </div>
      </div>
    </div>
  );
}