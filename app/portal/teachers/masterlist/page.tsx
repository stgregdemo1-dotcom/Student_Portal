"use client";

import React, { useState, useEffect } from "react";

interface Subject {
  _id: string;
  sched_code: string;
  subject_id: string;
  subject_name: string;
  subject_year_section: string;
  room: string;
  subject_specification?: string;
  semester: string;
}

interface StudentRecord {
  student_id: string;
  grades: number[];
  remarks: string;
}

export default function MasterListPage() {
  const [teacherId, setTeacherId] = useState<string>("");
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState<boolean>(true);

  // Expandable row state & student cache
  const [expandedSubjectId, setExpandedSubjectId] = useState<string | null>(null);
  const [studentsCache, setStudentsCache] = useState<Record<string, StudentRecord[]>>({});
  const [loadingStudents, setLoadingStudents] = useState<Record<string, boolean>>({});

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
      console.warn("No authentication username cookie detected.");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!teacherId) return;

    const fetchTeacherSubjects = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/portal/teacher?id=${teacherId}&action=subjects`);
        const result = await response.json();

        if (result && result.subjects) {
          setSubjects(result.subjects);
        }
      } catch (error) {
        console.error("Failed to parse assigned database master lists:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherSubjects();
  }, [teacherId]);

  // Toggle row expansion and fetch students on demand if not already cached
  const toggleRowExpansion = async (subject: Subject) => {
    const targetId = subject.subject_id;

    if (expandedSubjectId === targetId) {
      setExpandedSubjectId(null); // Collapse if already open
      return;
    }

    setExpandedSubjectId(targetId);

    // If students are already fetched for this subject, skip re-fetching
    if (studentsCache[targetId]) return;

    try {
      setLoadingStudents((prev) => ({ ...prev, [targetId]: true }));
      const response = await fetch(`/api/portal/teacher?id=${targetId}&action=students`);
      const result = await response.json();

      if (result && result.students) {
        setStudentsCache((prev) => ({ ...prev, [targetId]: result.students }));
      }
    } catch (error) {
      console.error("Failed to fetch enrolled students:", error);
    } finally {
      setLoadingStudents((prev) => ({ ...prev, [targetId]: false }));
    }
  };

  const filteredSubjects = subjects.filter(
    (s) =>
      s.subject_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.sched_code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.subject_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.subject_year_section?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.room?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-10 text-center font-bold text-gray-500 animate-pulse">
        Retrieving your assigned subjects master lists...
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header Container */}
      <div className="p-4 bg-white flex flex-col md:flex-row justify-between items-center shadow-sm rounded-t-xl border border-gray-200 border-b-gray-100 gap-4">
        <div className="flex flex-col md:flex-row items-center gap-4 w-full">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Master List</h2>
            <p className="text-xs text-gray-500 hidden md:block">
              Overview of all active subjects assigned to Teacher: <span className="font-mono font-bold text-blue-600">{teacherId || "N/A"}</span>. Click a row to view enrolled students.
            </p>
          </div>

          <div className="relative w-full md:w-64 md:ml-auto">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, code, section, or room..."
              className="w-full pl-3 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Main Table Matrix */}
      <div className="bg-white p-6 shadow-sm rounded-b-xl border border-t-0 border-gray-200 overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="text-gray-500 uppercase text-xs border-b border-gray-200 bg-gray-50/50">
              <th className="p-4 font-semibold text-gray-700">Schedule Code</th>
              <th className="p-4 font-semibold text-gray-700">Subject Details</th>
              <th className="p-4 font-semibold text-gray-700">Year & Section</th>
              <th className="p-4 font-semibold text-gray-700 text-center">Room</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {filteredSubjects.map((item) => {
              const isExpanded = expandedSubjectId === item.subject_id;
              const students = studentsCache[item.subject_id] || [];
              const isLoadingList = loadingStudents[item.subject_id];

              return (
                <React.Fragment key={item.sched_code}>
                  {/* Main Subject Row */}
                  <tr
                    onClick={() => toggleRowExpansion(item)}
                    className={`cursor-pointer transition ${
                      isExpanded ? "bg-blue-50/60" : "hover:bg-gray-50/80"
                    }`}
                  >
                    {/* Schedule Code with Expand Icon */}
                    <td className="p-4 text-gray-700 font-mono text-sm font-bold flex items-center gap-2">
                      <span className="text-gray-400 text-xs">
                        {isExpanded ? "▼" : "▶"}
                      </span>
                      {item.sched_code}
                    </td>

                    {/* Subject Name Details */}
                    <td className="p-4">
                      <div className="font-bold text-gray-800 leading-tight">
                        {item.subject_name}
                      </div>
                      <div className="text-[10px] text-gray-400 font-mono mt-0.5 uppercase tracking-wider">
                        ID: {item.subject_id} | {item.subject_specification || "General"}
                      </div>
                    </td>

                    {/* Year and Section Badge Display */}
                    <td className="p-4 text-gray-600">
                      <span className="px-2.5 py-1 bg-slate-100 rounded-md text-xs font-bold text-slate-600 border border-slate-200 uppercase">
                        {item.subject_year_section || "TBA"}
                      </span>
                    </td>

                    {/* Room Identifier */}
                    <td className="p-4 text-center">
                      <span className="text-sm font-mono font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-100 uppercase tracking-wide">
                        {item.room || "TBA"}
                      </span>
                    </td>
                  </tr>

                  {/* Expanded Enrolled Students Sub-Row */}
                  {isExpanded && (
                    <tr>
                      <td colSpan={4} className="p-4 bg-slate-50/80 border-b border-gray-200">
                        <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-inner space-y-3">
                          <div className="flex justify-between items-center border-b pb-2">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-600">
                              Enrolled Students Roster for <span className="text-blue-600 font-mono">{item.subject_name}</span>
                            </h4>
                            <span className="text-xs font-mono text-gray-500">
                              Total Enrolled: {isLoadingList ? "Loading..." : students.length}
                            </span>
                          </div>

                          {isLoadingList ? (
                            <div className="py-6 text-center text-xs text-gray-400 animate-pulse">
                              Fetching enrolled student records...
                            </div>
                          ) : students.length > 0 ? (
                            <div className="overflow-x-auto">
                              <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                  <tr className="bg-gray-100 text-gray-600 uppercase">
                                    <th className="p-2.5 font-semibold">Student ID</th>
                                    <th className="p-2.5 font-semibold text-center">Prelim</th>
                                    <th className="p-2.5 font-semibold text-center">Midterm</th>
                                    <th className="p-2.5 font-semibold text-center">Pre-Final</th>
                                    <th className="p-2.5 font-semibold text-center">Final</th>
                                    <th className="p-2.5 font-semibold">Remarks</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                  {students.map((student, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50">
                                      <td className="p-2.5 font-mono font-bold text-gray-700">
                                        {student.student_id}
                                      </td>
                                      <td className="p-2.5 text-center font-mono">{student.grades[0] ?? 0}</td>
                                      <td className="p-2.5 text-center font-mono">{student.grades[1] ?? 0}</td>
                                      <td className="p-2.5 text-center font-mono">{student.grades[2] ?? 0}</td>
                                      <td className="p-2.5 text-center font-mono">{student.grades[3] ?? 0}</td>
                                      <td className="p-2.5 text-gray-600 italic">
                                        {student.remarks || "No remarks"}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <div className="py-6 text-center text-xs text-gray-400 italic">
                              No students are currently enrolled in this subject.
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>

        {filteredSubjects.length === 0 && (
          <div className="text-center py-14 text-gray-400 italic text-sm">
            No subjects currently matching database query records.
          </div>
        )}
      </div>
    </div>
  );
}