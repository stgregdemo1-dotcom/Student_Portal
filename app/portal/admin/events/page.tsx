"use client";

import { useState, useEffect } from "react";

// Update types to include the Mongo identifier _id
type CalendarEvent = {
  _id?: string;
  title: string;
  color: string;
  startTime: string;
  endTime: string;
};

// Represents the mapped object state
type EventMap = Record<string, CalendarEvent[]>;

export default function CalendarModule() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<EventMap>({});
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

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Generate 1-hour intervals from 07:00 AM to 07:00 PM
  const timeOptions = [
    "07:00 AM", "08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
    "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM", "06:00 PM", "07:00 PM"
  ];

  // --- API Integrations ---

  // 1. Fetch Events from MongoDB
  const fetchEvents = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/portal/admin?table=events");
      if (!response.ok) throw new Error("Failed to fetch events");
      
      const rawData = await response.json();
      
      // Transform flat DB array to localized nested key format: { "YYYY-MM-DD": [ ...events ] }
      const mappedEvents: EventMap = {};
      rawData.forEach((item: any) => {
        const dateKey = item.event_date;
        if (!mappedEvents[dateKey]) {
          mappedEvents[dateKey] = [];
        }
        mappedEvents[dateKey].push({
          _id: item._id,
          title: item.title,
          color: item.color,
          startTime: item.start_time,
          endTime: item.end_time,
        });
      });

      setEvents(mappedEvents);
    } catch (err) {
      console.error("Error loading events:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [currentDate]);

  // 2. Save (Add or Update) Event via POST or PUT
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
        // UPDATE Existing Event (PUT)
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
        // CREATE New Event (POST)
        const response = await fetch("/api/portal/admin?table=events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!response.ok) throw new Error("Failed to save event");
      }

      // Refresh state directly from MongoDB & reset form
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

  const changeMonth = (dir: number) => {
    setCurrentDate(new Date(year, month + dir, 1));
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
            className="border border-slate-100 h-32 bg-slate-50 w-[14.28%] min-w-0"
          />
        );
      } else {
        const currentDay = day;
        const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

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
            className="border border-slate-100 h-32 align-top p-2 cursor-pointer hover:bg-slate-50 transition relative w-[14.28%] min-w-0 overflow-hidden"
          >
            <div className="text-sm font-bold text-slate-700 mb-2">
              {day}
            </div>

            <div className="space-y-1 max-h-[80px] overflow-y-auto animate-fade-in">
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

    cells.push(<tr key={row}>{cols}</tr>);
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
        <h3 className="text-sm md:text-lg font-black text-slate-800 tracking-tight">
          {monthNames[month]}{" "}
          <span className="text-slate-300 font-light">
            {year}
          </span>
          {loading && <span className="ml-2 text-xs text-blue-500 animate-pulse">Loading...</span>}
        </h3>

        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => changeMonth(-1)}
            className="px-3 py-1 text-[10px] font-bold text-slate-500 hover:text-black"
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
            className="px-3 py-1 text-[10px] font-bold text-slate-500 hover:text-black"
          >
            Next
          </button>
        </div>
      </div>

      <div className="p-4 md:p-6 overflow-x-auto">
        {/* 🚀 FIXED: Added table-fixed & w-full layout */}
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

      {selectedDay && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-5 rounded-2xl w-80 shadow-xl border border-slate-100">
            <h2 className="font-bold mb-3 text-slate-800">
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
                  className={`w-7 h-7 rounded-full ${c} ${
                    color === c ? "ring-2 ring-black" : ""
                  }`}
                />
              ))}
            </div>

            <button
              onClick={saveEvent}
              className="bg-blue-500 hover:bg-blue-600 transition text-white w-full py-2 rounded-xl font-semibold"
            >
              {editEventId !== null ? "Update Event" : "Add Event"}
            </button>

            <button
              onClick={closeModal}
              className="mt-2 text-sm text-slate-500 w-full hover:text-slate-800 transition text-center"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}