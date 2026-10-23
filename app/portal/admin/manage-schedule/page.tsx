"use client";

import { useState, useEffect } from "react";

type SubjectRecord = {
  subject_id: string;
  subject_name: string;
  subject_specification: string;
  subject_day?: string;
  semester?: string;
  sched_code?: string;
  class_time?: {
    start: string;
    end: string;
  };
  teacher_id?: string;
  room?: string;
};

const HOURS = [
  "07:00 AM", "08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM",
  "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM"
];

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];

export default function ClassSchedule() {
  // --- Configuration State ---
  const [currentYear, setCurrentYear] = useState<string>("");
  const [sections, setSections] = useState<string[]>([]);
  const [teachers, setTeachers] = useState<string[]>([]);
  const [rooms, setRooms] = useState<string[]>([]);
  const [loadingConfig, setLoadingConfig] = useState<boolean>(true);

  // --- Section Schedule State ---
  const [selectedSection, setSelectedSection] = useState<string>("");
  const [selectedSemester, setSelectedSemester] = useState<string>("1");
  const [subjects, setSubjects] = useState<SubjectRecord[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState<boolean>(false);

  // --- Teacher Schedule State ---
  const [selectedTeacher, setSelectedTeacher] = useState<string>("");
  const [selectedTeacherSemester, setSelectedTeacherSemester] = useState<string>("1");
  const [teacherSubjects, setTeacherSubjects] = useState<SubjectRecord[]>([]);
  const [loadingTeacherSubjects, setLoadingTeacherSubjects] = useState<boolean>(false);

  // --- Room Schedule State ---
  const [selectedRoom, setSelectedRoom] = useState<string>("");
  const [selectedRoomSemester, setSelectedRoomSemester] = useState<string>("1");
  const [roomSubjects, setRoomSubjects] = useState<SubjectRecord[]>([]);
  const [loadingRoomSubjects, setLoadingRoomSubjects] = useState<boolean>(false);

  // --- Shared Modal State ---
  const [activeModalSubject, setActiveModalSubject] = useState<SubjectRecord | null>(null);

  // 1. Fetch Configuration (current_year, sections) and All Subjects (to extract teachers and rooms)
  useEffect(() => {
    const fetchData = async () => {
      try {
        let fetchedYear = "";
        // Fetch configuration table
        const configRes = await fetch("/api/portal/admin?table=configuration");
        if (configRes.ok) {
          const configData = await configRes.json();
          if (configData) {
            if (configData.current_year) {
              fetchedYear = String(configData.current_year).trim();
              setCurrentYear(fetchedYear);
            }
            if (configData.section) {
              setSections(configData.section);
              if (configData.section.length > 0) {
                setSelectedSection(configData.section[0]);
              }
            }
          }
        }

        // Fetch all subjects to extract unique teacher IDs, rooms, and match current_year via sched_code
        const subjectsRes = await fetch("/api/portal/admin?table=subjects");
        if (subjectsRes.ok) {
          const subjectsData = await subjectsRes.json();
          const allSubjects: SubjectRecord[] = Array.isArray(subjectsData) ? subjectsData : subjectsData.data || [];
          
          // Filter subjects by fetched current_year matching first 4 digits of sched_code
          const validSubjects = fetchedYear
            ? allSubjects.filter((s) => s.sched_code && String(s.sched_code).trim().startsWith(fetchedYear))
            : allSubjects;

          // Extract unique, non-empty teacher_ids
          const uniqueTeachers = Array.from(
            new Set(validSubjects.map((s) => s.teacher_id).filter((id): id is string => Boolean(id && id.trim() !== "")))
          ).sort();

          setTeachers(uniqueTeachers);
          if (uniqueTeachers.length > 0) {
            setSelectedTeacher(uniqueTeachers[0]);
          }

          // Extract unique, non-empty rooms
          const uniqueRooms = Array.from(
            new Set(validSubjects.map((s) => s.room).filter((r): r is string => Boolean(r && r.trim() !== "")))
          ).sort();

          setRooms(uniqueRooms);
          if (uniqueRooms.length > 0) {
            setSelectedRoom(uniqueRooms[0]);
          }
        }
      } catch (err) {
        console.error("Network error fetching configuration or subjects:", err);
      } finally {
        setLoadingConfig(false);
      }
    };
    fetchData();
  }, []);

  // Helper filter function for sched_code year match based on currentYear
  const filterBySchedCodeYear = (list: SubjectRecord[]) => {
    if (!currentYear) return list;
    return list.filter(
      (s) => s.sched_code && String(s.sched_code).trim().startsWith(currentYear)
    );
  };

  // 2. Fetch Filtered Subjects for Section Schedule
  useEffect(() => {
    if (!selectedSection) return;

    const fetchFilteredSubjects = async () => {
      try {
        setLoadingSubjects(true);
        const res = await fetch(
          `/api/portal/admin?table=subjects&subject_year_section=${encodeURIComponent(selectedSection)}&semester=${encodeURIComponent(selectedSemester)}`
        );
        if (res.ok) {
          const data = await res.json();
          const list = Array.isArray(data) ? data : data.data || [];
          setSubjects(filterBySchedCodeYear(list));
        }
      } catch (err) {
        console.error("Network error pulling filtered subjects:", err);
      } finally {
        setLoadingSubjects(false);
      }
    };
    fetchFilteredSubjects();
  }, [selectedSection, selectedSemester, currentYear]);

  // 3. Fetch Filtered Subjects for Teacher Schedule
  useEffect(() => {
    if (!selectedTeacher) return;

    const fetchTeacherSubjects = async () => {
      try {
        setLoadingTeacherSubjects(true);
        const res = await fetch(
          `/api/portal/admin?table=subjects&teacher_id=${encodeURIComponent(selectedTeacher)}&semester=${encodeURIComponent(selectedTeacherSemester)}`
        );
        if (res.ok) {
          const data = await res.json();
          const list = Array.isArray(data) ? data : data.data || [];
          setTeacherSubjects(filterBySchedCodeYear(list));
        }
      } catch (err) {
        console.error("Network error pulling teacher subjects:", err);
      } finally {
        setLoadingTeacherSubjects(false);
      }
    };
    fetchTeacherSubjects();
  }, [selectedTeacher, selectedTeacherSemester, currentYear]);

  // 4. Fetch Filtered Subjects for Room Schedule
  useEffect(() => {
    if (!selectedRoom) return;

    const fetchRoomSubjects = async () => {
      try {
        setLoadingRoomSubjects(true);
        const res = await fetch(
          `/api/portal/admin?table=subjects&room=${encodeURIComponent(selectedRoom)}&semester=${encodeURIComponent(selectedRoomSemester)}`
        );
        if (res.ok) {
          const data = await res.json();
          const list = Array.isArray(data) ? data : data.data || [];
          setRoomSubjects(filterBySchedCodeYear(list));
        }
      } catch (err) {
        console.error("Network error pulling room subjects:", err);
      } finally {
        setLoadingRoomSubjects(false);
      }
    };
    fetchRoomSubjects();
  }, [selectedRoom, selectedRoomSemester, currentYear]);

  const normalizeTime = (timeStr: string | undefined): string => {
    if (!timeStr) return "";
    let clean = timeStr.trim().toUpperCase();
    if (clean.length === 7) {
      clean = "0" + clean;
    }
    return clean;
  };

  const getColumnIndex = (day: string | undefined): number => {
    if (!day) return 2;
    const cleanDay = day.trim().toLowerCase().substring(0, 3);
    const index = DAYS.findIndex((d) => d.toLowerCase().startsWith(cleanDay));
    return index !== -1 ? index + 2 : 2;
  };

  const getTimeRowIndex = (timeStr: string | undefined): number => {
    const target = normalizeTime(timeStr);
    if (!target) return 1;

    const match = target.match(/^(\d{2}):(\d{2})\s(AM|PM)$/);
    if (!match) return 1;

    let [_, hourStr, minStr, period] = match;
    let hours = parseInt(hourStr, 10);
    let minutes = parseInt(minStr, 10);

    if (period === "PM" && hours !== 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;

    const baseTimelineMinutes = 7 * 60; 
    const targetMinutes = (hours * 60) + minutes;
    const relativeRow = ((targetMinutes - baseTimelineMinutes) / 60) + 1;
    return Math.max(1, relativeRow);
  };

  const gridTemplateStyle = {
    gridTemplateColumns: `75px repeat(${DAYS.length}, minmax(0, 1fr))`
  };

  return (
    <div className="p-3 relative flex flex-col gap-6">

      {/* ==================== 1. ACADEMIC TIMETABLE (SECTION) ==================== */}
      <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
        <div className="flex flex-wrap items-center justify-between mb-2 gap-2">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold italic text-gray-800">Academic Schedule</h2>
            <span className="text-[10px] bg-blue-50 text-blue-700 font-mono font-semibold px-2 py-0.5 rounded border border-blue-200">
              Year: {currentYear || "Loading..."}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <label className="text-xs font-medium text-gray-600">Section:</label>
              {loadingConfig ? (
                <span className="text-[10px] text-gray-400 animate-pulse">Loading...</span>
              ) : (
                <select
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value)}
                  className="border border-gray-300 rounded px-1.5 py-0.5 text-xs focus:ring-1 focus:ring-blue-500 outline-none bg-white font-medium"
                >
                  {sections.map((section) => (
                    <option key={section} value={section}>{section}</option>
                  ))}
                </select>
              )}
            </div>

            <div className="flex items-center gap-1">
              <label className="text-xs font-medium text-gray-600">Sem:</label>
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                className="border border-gray-300 rounded px-1.5 py-0.5 text-xs focus:ring-1 focus:ring-blue-500 outline-none bg-white font-medium text-gray-700"
              >
                <option value="1">1st Sem</option>
                <option value="2">2nd Sem</option>
              </select>
            </div>
          </div>
        </div>

        <div className="border border-gray-200 rounded-lg overflow-x-auto bg-gray-50 relative">
          <div className="min-w-[450px]">
            <div className="grid bg-gray-100 border-b border-gray-200 text-center font-bold uppercase text-[11px] tracking-wider text-gray-700 select-none" style={gridTemplateStyle}>
              <div className="p-1.5 border-r border-gray-200 bg-gray-100 sticky left-0 z-20">Time</div>
              {DAYS.map((day) => (
                <div key={day} className="p-1.5 flex items-center justify-center">{day}</div>
              ))}
            </div>

            <div className="relative bg-white">
              {loadingSubjects && (
                <div className="absolute inset-0 min-h-[12rem] flex items-center justify-center bg-white/80 z-20 text-xs text-gray-400 font-medium animate-pulse">
                  Loading schedule...
                </div>
              )}

              <div className="absolute inset-0 grid divide-x divide-gray-100 pointer-events-none z-0" style={gridTemplateStyle}>
                <div className="bg-gray-50/50 sticky left-0 border-r border-gray-200 z-10" />
                {DAYS.map((day) => <div key={day} />)}
              </div>

              <div className="relative flex flex-col divide-y divide-gray-100 z-10">
                {HOURS.map((timeSlot) => (
                  <div key={timeSlot} className="grid h-[2.75rem] hover:bg-gray-50/10 transition-colors" style={gridTemplateStyle}>
                    <div className="p-1 pr-2 text-right text-[10px] font-semibold font-mono text-gray-500 bg-gray-50/80 border-r border-gray-200 flex items-center justify-end sticky left-0 z-10 select-none">
                      {timeSlot}
                    </div>
                    {DAYS.map((day) => (
                      <div key={day} className="border-r border-gray-100/50" />
                    ))}
                  </div>
                ))}
              </div>

              <div className="absolute inset-0 grid pointer-events-none p-0.5 gap-x-1 z-15" style={{ ...gridTemplateStyle, gridTemplateRows: `repeat(${HOURS.length}, 2.75rem)` }}>
                {!loadingSubjects && subjects.map((subj) => {
                  const colStart = getColumnIndex(subj.subject_day);
                  const rowStart = getTimeRowIndex(subj.class_time?.start);
                  const rowEnd = getTimeRowIndex(subj.class_time?.end);

                  return (
                    <div
                      key={subj.subject_id}
                      className="pointer-events-auto p-0.5 h-full w-full"
                      style={{ gridColumnStart: colStart, gridRow: `${rowStart} / ${rowEnd}` }}
                      onClick={() => setActiveModalSubject(subj)}
                    >
                      <div className="bg-blue-50 border border-blue-200 rounded p-1 text-left shadow-sm hover:border-blue-400 hover:bg-blue-100/50 cursor-pointer transition-all h-full flex flex-col justify-between overflow-hidden">
                        <div>
                          <div className="font-bold text-blue-900 text-[11px] leading-tight truncate">{subj.subject_name}</div>
                          <div className="text-[10px] text-gray-500 font-mono truncate">{subj.room || subj.subject_id}</div>
                        </div>
                        <div className="text-[10px] text-blue-700 font-bold font-mono truncate opacity-90">
                          {subj.class_time?.start} - {subj.class_time?.end}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ==================== 2. TEACHER'S SCHEDULE ==================== */}
      <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
        <div className="flex flex-wrap items-center justify-between mb-2 gap-2">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold italic text-gray-800">Teacher's Schedule</h2>
            <span className="text-[10px] bg-emerald-50 text-emerald-700 font-mono font-semibold px-2 py-0.5 rounded border border-emerald-200">
              Year: {currentYear || "Loading..."}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <label className="text-xs font-medium text-gray-600">Teacher ID:</label>
              {loadingConfig ? (
                <span className="text-[10px] text-gray-400 animate-pulse">Loading...</span>
              ) : (
                <select
                  value={selectedTeacher}
                  onChange={(e) => setSelectedTeacher(e.target.value)}
                  className="border border-gray-300 rounded px-1.5 py-0.5 text-xs focus:ring-1 focus:ring-blue-500 outline-none bg-white font-medium"
                >
                  {teachers.map((teacherId) => (
                    <option key={teacherId} value={teacherId}>{teacherId}</option>
                  ))}
                </select>
              )}
            </div>

            <div className="flex items-center gap-1">
              <label className="text-xs font-medium text-gray-600">Sem:</label>
              <select
                value={selectedTeacherSemester}
                onChange={(e) => setSelectedTeacherSemester(e.target.value)}
                className="border border-gray-300 rounded px-1.5 py-0.5 text-xs focus:ring-1 focus:ring-blue-500 outline-none bg-white font-medium text-gray-700"
              >
                <option value="1">1st Sem</option>
                <option value="2">2nd Sem</option>
              </select>
            </div>
          </div>
        </div>

        <div className="border border-gray-200 rounded-lg overflow-x-auto bg-gray-50 relative">
          <div className="min-w-[450px]">
            <div className="grid bg-gray-100 border-b border-gray-200 text-center font-bold uppercase text-[11px] tracking-wider text-gray-700 select-none" style={gridTemplateStyle}>
              <div className="p-1.5 border-r border-gray-200 bg-gray-100 sticky left-0 z-20">Time</div>
              {DAYS.map((day) => (
                <div key={day} className="p-1.5 flex items-center justify-center">{day}</div>
              ))}
            </div>

            <div className="relative bg-white">
              {loadingTeacherSubjects && (
                <div className="absolute inset-0 min-h-[12rem] flex items-center justify-center bg-white/80 z-20 text-xs text-gray-400 font-medium animate-pulse">
                  Loading schedule...
                </div>
              )}

              <div className="absolute inset-0 grid divide-x divide-gray-100 pointer-events-none z-0" style={gridTemplateStyle}>
                <div className="bg-gray-50/50 sticky left-0 border-r border-gray-200 z-10" />
                {DAYS.map((day) => <div key={day} />)}
              </div>

              <div className="relative flex flex-col divide-y divide-gray-100 z-10">
                {HOURS.map((timeSlot) => (
                  <div key={timeSlot} className="grid h-[2.75rem] hover:bg-gray-50/10 transition-colors" style={gridTemplateStyle}>
                    <div className="p-1 pr-2 text-right text-[10px] font-semibold font-mono text-gray-500 bg-gray-50/80 border-r border-gray-200 flex items-center justify-end sticky left-0 z-10 select-none">
                      {timeSlot}
                    </div>
                    {DAYS.map((day) => (
                      <div key={day} className="border-r border-gray-100/50" />
                    ))}
                  </div>
                ))}
              </div>

              <div className="absolute inset-0 grid pointer-events-none p-0.5 gap-x-1 z-15" style={{ ...gridTemplateStyle, gridTemplateRows: `repeat(${HOURS.length}, 2.75rem)` }}>
                {!loadingTeacherSubjects && teacherSubjects.map((subj) => {
                  const colStart = getColumnIndex(subj.subject_day);
                  const rowStart = getTimeRowIndex(subj.class_time?.start);
                  const rowEnd = getTimeRowIndex(subj.class_time?.end);

                  return (
                    <div
                      key={subj.subject_id}
                      className="pointer-events-auto p-0.5 h-full w-full"
                      style={{ gridColumnStart: colStart, gridRow: `${rowStart} / ${rowEnd}` }}
                      onClick={() => setActiveModalSubject(subj)}
                    >
                      <div className="bg-emerald-50 border border-emerald-200 rounded p-1 text-left shadow-sm hover:border-emerald-400 hover:bg-emerald-100/50 cursor-pointer transition-all h-full flex flex-col justify-between overflow-hidden">
                        <div>
                          <div className="font-bold text-emerald-900 text-[11px] leading-tight truncate">{subj.subject_name}</div>
                          <div className="text-[10px] text-gray-500 font-mono truncate">{subj.room || subj.subject_id}</div>
                        </div>
                        <div className="text-[10px] text-emerald-700 font-bold font-mono truncate opacity-90">
                          {subj.class_time?.start} - {subj.class_time?.end}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ==================== 3. ROOM SCHEDULE ==================== */}
      <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
        <div className="flex flex-wrap items-center justify-between mb-2 gap-2">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold italic text-gray-800">Room Schedule</h2>
            <span className="text-[10px] bg-amber-50 text-amber-700 font-mono font-semibold px-2 py-0.5 rounded border border-amber-200">
              Year: {currentYear || "Loading..."}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <label className="text-xs font-medium text-gray-600">Room:</label>
              {loadingConfig ? (
                <span className="text-[10px] text-gray-400 animate-pulse">Loading...</span>
              ) : (
                <select
                  value={selectedRoom}
                  onChange={(e) => setSelectedRoom(e.target.value)}
                  className="border border-gray-300 rounded px-1.5 py-0.5 text-xs focus:ring-1 focus:ring-blue-500 outline-none bg-white font-medium"
                >
                  {rooms.map((roomName) => (
                    <option key={roomName} value={roomName}>{roomName}</option>
                  ))}
                </select>
              )}
            </div>

            <div className="flex items-center gap-1">
              <label className="text-xs font-medium text-gray-600">Sem:</label>
              <select
                value={selectedRoomSemester}
                onChange={(e) => setSelectedRoomSemester(e.target.value)}
                className="border border-gray-300 rounded px-1.5 py-0.5 text-xs focus:ring-1 focus:ring-blue-500 outline-none bg-white font-medium text-gray-700"
              >
                <option value="1">1st Sem</option>
                <option value="2">2nd Sem</option>
              </select>
            </div>
          </div>
        </div>

        <div className="border border-gray-200 rounded-lg overflow-x-auto bg-gray-50 relative">
          <div className="min-w-[450px]">
            <div className="grid bg-gray-100 border-b border-gray-200 text-center font-bold uppercase text-[11px] tracking-wider text-gray-700 select-none" style={gridTemplateStyle}>
              <div className="p-1.5 border-r border-gray-200 bg-gray-100 sticky left-0 z-20">Time</div>
              {DAYS.map((day) => (
                <div key={day} className="p-1.5 flex items-center justify-center">{day}</div>
              ))}
            </div>

            <div className="relative bg-white">
              {loadingRoomSubjects && (
                <div className="absolute inset-0 min-h-[12rem] flex items-center justify-center bg-white/80 z-20 text-xs text-gray-400 font-medium animate-pulse">
                  Loading schedule...
                </div>
              )}

              <div className="absolute inset-0 grid divide-x divide-gray-100 pointer-events-none z-0" style={gridTemplateStyle}>
                <div className="bg-gray-50/50 sticky left-0 border-r border-gray-200 z-10" />
                {DAYS.map((day) => <div key={day} />)}
              </div>

              <div className="relative flex flex-col divide-y divide-gray-100 z-10">
                {HOURS.map((timeSlot) => (
                  <div key={timeSlot} className="grid h-[2.75rem] hover:bg-gray-50/10 transition-colors" style={gridTemplateStyle}>
                    <div className="p-1 pr-2 text-right text-[10px] font-semibold font-mono text-gray-500 bg-gray-50/80 border-r border-gray-200 flex items-center justify-end sticky left-0 z-10 select-none">
                      {timeSlot}
                    </div>
                    {DAYS.map((day) => (
                      <div key={day} className="border-r border-gray-100/50" />
                    ))}
                  </div>
                ))}
              </div>

              <div className="absolute inset-0 grid pointer-events-none p-0.5 gap-x-1 z-15" style={{ ...gridTemplateStyle, gridTemplateRows: `repeat(${HOURS.length}, 2.75rem)` }}>
                {!loadingRoomSubjects && roomSubjects.map((subj) => {
                  const colStart = getColumnIndex(subj.subject_day);
                  const rowStart = getTimeRowIndex(subj.class_time?.start);
                  const rowEnd = getTimeRowIndex(subj.class_time?.end);

                  return (
                    <div
                      key={subj.subject_id}
                      className="pointer-events-auto p-0.5 h-full w-full"
                      style={{ gridColumnStart: colStart, gridRow: `${rowStart} / ${rowEnd}` }}
                      onClick={() => setActiveModalSubject(subj)}
                    >
                      <div className="bg-amber-50 border border-amber-200 rounded p-1 text-left shadow-sm hover:border-amber-400 hover:bg-amber-100/50 cursor-pointer transition-all h-full flex flex-col justify-between overflow-hidden">
                        <div>
                          <div className="font-bold text-amber-900 text-[11px] leading-tight truncate">{subj.subject_name}</div>
                          <div className="text-[10px] text-gray-500 font-mono truncate">{subj.teacher_id || subj.subject_id}</div>
                        </div>
                        <div className="text-[10px] text-amber-700 font-bold font-mono truncate opacity-90">
                          {subj.class_time?.start} - {subj.class_time?.end}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Shared Subject Information Modal */}
      {activeModalSubject && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl border border-gray-100 max-w-sm w-full overflow-hidden">
            <div className="bg-blue-600 px-4 py-3 flex items-center justify-between">
              <h3 className="text-white font-bold text-sm">Subject Details</h3>
              <button
                onClick={() => setActiveModalSubject(null)}
                className="text-white/80 hover:text-white p-1 text-xs font-bold font-mono outline-none"
              >
                ✕
              </button>
            </div>

            <div className="p-4 flex flex-col gap-3 text-xs">
              <div>
                <label className="text-[10px] font-bold uppercase text-gray-400 block">Subject Title</label>
                <p className="text-gray-900 font-bold text-base leading-snug">{activeModalSubject.subject_name}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 border-t border-gray-100 pt-2">
                <div>
                  <label className="text-[10px] font-bold uppercase text-gray-400 block">Subject ID</label>
                  <p className="text-gray-700 font-mono font-medium bg-gray-50 px-1.5 py-0.5 rounded border inline-block text-xs">
                    {activeModalSubject.subject_id}
                  </p>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-gray-400 block">Sched Code</label>
                  <p className="text-indigo-600 font-mono font-bold text-xs">
                    {activeModalSubject.sched_code || "N/A"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 border-t border-gray-100 pt-2">
                <div>
                  <label className="text-[10px] font-bold uppercase text-gray-400 block">Teacher ID</label>
                  <p className="text-gray-800 font-medium text-xs truncate">
                    {activeModalSubject.teacher_id || "Not Assigned"}
                  </p>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-gray-400 block">Room</label>
                  <p className="text-gray-800 font-mono font-medium text-xs">
                    {activeModalSubject.room || "N/A"}
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-2">
                <label className="text-[10px] font-bold uppercase text-gray-400 block mb-1">Schedule Window</label>
                <div className="flex items-center gap-2 text-xs font-semibold text-gray-600 bg-gray-50 border p-2 rounded">
                  <span className="bg-blue-100 text-blue-800 text-[10px] uppercase font-bold px-1.5 py-0.5 rounded">
                    {activeModalSubject.subject_day}
                  </span>
                  <span className="font-mono text-gray-700 text-xs">
                    {activeModalSubject.class_time?.start} - {activeModalSubject.class_time?.end}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 px-4 py-2 border-t flex justify-end">
              <button
                onClick={() => setActiveModalSubject(null)}
                className="bg-white border border-gray-300 hover:border-gray-400 text-gray-700 text-xs font-bold px-3 py-1.5 rounded shadow-sm transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}