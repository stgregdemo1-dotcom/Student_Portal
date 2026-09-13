"use client";  

import React, { useState, useEffect } from "react"; 
import Link from "next/link";

const TIME_SLOTS = [
  "7:00 AM", "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
  "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM", "6:00 PM", "7:00 PM"
];

const ITEMS_PER_PAGE = 15;

type Subject = {
  subject_id: string; 
  sched_code: string;
  semester: string; 
  subject_specification: string;
  subject_name: string;
  subject_year_section: string;
  teacher_id: string; 
  class_time: {
    start: string;
    end: string;
  };
  subject_day: string;
  room: string;
  status: string;
};

type TeacherOption = {
  teacher_id: string;
  full_name: string;
};

interface SubjectModalProps {
  isOpen: boolean;
  subject: Subject | null;
  onClose: () => void;
  onSave: (subject: Subject) => void;
  dbTeachers: TeacherOption[]; 
}

function SubjectModal({ isOpen, subject, onClose, onSave, dbTeachers }: SubjectModalProps) {
  if (!isOpen) return null;
  const modalKey = subject ? `edit-${subject.subject_id}` : "add-new";
  return (
    <SubjectModalContent
      key={modalKey}
      subject={subject}
      onClose={onClose}
      onSave={onSave}
      dbTeachers={dbTeachers}
    />
  );
}

function SubjectModalContent({
  subject,
  onClose,
  onSave,
  dbTeachers,
}: {
  subject: Subject | null;
  onClose: () => void;
  onSave: (subject: Subject) => void;
  dbTeachers: TeacherOption[];
}) {
  const isEditMode = !!subject;

  const [dbSpecification, setDbSpecification] = useState<string[]>([]);
  const [dbSection, setDbSection] = useState<string[]>([]); 
  const [dbSubjectday, setDbSubjectDay] = useState<string[]>([]);
  const [dbSubjectstatus, setDbSubjectstatus] = useState<string[]>([]);
  const [dbRoom, setDbRoom] = useState<string[]>([]);
  
  const [timeError, setTimeError] = useState<string | null>(null);

  const [formData, setFormData] = useState<Subject>(() => {
    if (subject) {
      return { ...subject };
    }
    return {
      subject_id: "",
      sched_code: "",      
      semester: "", 
      subject_specification: "",
      subject_name: "",
      subject_year_section: "",
      teacher_id: "",
      class_time: { start: "", end: "" },
      subject_day: "",
      room: "", 
      status: "Active",
    };
  });

  useEffect(() => {
    const loadDropdownConfigs = async () => {
      try {
        const res = await fetch("/api/portal/admin?table=configuration");
        if (res.ok) {
          const configDoc = await res.json();
          
          if (configDoc && Array.isArray(configDoc.specification)) {
            setDbSpecification(configDoc.specification);
          }
          if (configDoc && Array.isArray(configDoc.section)) {
            const sortedSections = [...configDoc.section].sort((a, b) => 
              a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
            );
            setDbSection(sortedSections);
          }
          if (configDoc && Array.isArray(configDoc.subject_day)) {
            setDbSubjectDay(configDoc.subject_day);
          }
          if (configDoc && Array.isArray(configDoc.subject_status)) {
            setDbSubjectstatus(configDoc.subject_status);
          }
          if (configDoc && Array.isArray(configDoc.room)) {
            const sortedRooms = [...configDoc.room].sort((a, b) =>
              a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
            );
            setDbRoom(sortedRooms);
          }
        }
      } catch (err) {
        console.error("Failed loading dynamic layout selectors:", err);
      }
    };

    loadDropdownConfigs();
  }, [isEditMode]);

  const convertTimeToMinutes = (timeString: string): number => {
    if (!timeString) return 0;
    const [time, modifier] = timeString.split(" ");
    let [hours, minutes] = time.split(":").map(Number);
    
    if (hours === 12) {
      hours = modifier === "AM" ? 0 : 12;
    } else if (modifier === "PM") {
      hours += 12;
    }
    return hours * 60 + minutes;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTimeError(null);

    const startMinutes = convertTimeToMinutes(formData.class_time.start);
    const endMinutes = convertTimeToMinutes(formData.class_time.end);

    if (startMinutes >= endMinutes) {
      setTimeError("Start time must be earlier than the end time.");
      return;
    }

    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="mb-4 flex items-center justify-between border-b pb-3">
          <h3 className="text-xl font-semibold text-gray-800">
            {isEditMode ? "Edit Subject Details" : "Add New Subject"}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isEditMode && (
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Subject ID</label>
              <input
                type="text"
                value={formData.subject_id}
                disabled
                className="w-full rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 text-gray-500 cursor-not-allowed"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Sched Code</label>
            <input
              type="text"
              required
              value={formData.sched_code}
              onChange={(e) => setFormData({ ...formData, sched_code: e.target.value })}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-800 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Semester</label>
            <select
              required
              value={formData.semester}
              onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-800 focus:border-blue-500 focus:outline-none"
            >
              <option value="">-- Select Semester --</option>
              <option value="1">1</option>
              <option value="2">2</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Specification</label>
            <select
              value={formData.subject_specification}
              onChange={(e) => setFormData({ ...formData, subject_specification: e.target.value })}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-800 focus:border-blue-500 focus:outline-none"
            >
              <option value="">-- Select Specification --</option>
              {dbSpecification.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Subject Name</label>
            <input
              type="text"
              required
              value={formData.subject_name}
              onChange={(e) => setFormData({ ...formData, subject_name: e.target.value })}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-800 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Year & Section</label>
            <select
              required
              value={formData.subject_year_section}
              onChange={(e) => setFormData({ ...formData, subject_year_section: e.target.value })}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-800 focus:border-blue-500 focus:outline-none"
            >
              <option value="">-- Select Year & Section --</option>
              {dbSection.map((sec) => (
                <option key={sec} value={sec}>{sec}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Teacher</label>
            <select
              required
              value={formData.teacher_id}
              onChange={(e) => setFormData({ ...formData, teacher_id: e.target.value })}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-800 focus:border-blue-500 focus:outline-none"
            >
              <option value="">-- Select Teacher --</option>
              {dbTeachers.map((tch) => (
                <option key={tch.teacher_id} value={tch.teacher_id}>
                  {tch.full_name} ({tch.teacher_id})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Start Time</label>
              <select
                required
                value={formData.class_time.start}
                onChange={(e) => setFormData({
                  ...formData,
                  class_time: { ...formData.class_time, start: e.target.value }
                })}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-800 focus:border-blue-500 focus:outline-none"
              >
                <option value="">-- Start --</option>
                {TIME_SLOTS.map((slot) => (
                  <option key={`start-${slot}`} value={slot}>{slot}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">End Time</label>
              <select
                required
                value={formData.class_time.end}
                onChange={(e) => setFormData({
                  ...formData,
                  class_time: { ...formData.class_time, end: e.target.value }
                })}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-800 focus:border-blue-500 focus:outline-none"
              >
                <option value="">-- End --</option>
                {TIME_SLOTS.map((slot) => (
                  <option key={`end-${slot}`} value={slot}>{slot}</option>
                ))}
              </select>
            </div>
          </div>

          {timeError && (
            <div className="text-xs text-red-600 font-semibold bg-red-50 p-2 rounded-lg border border-red-100 animate-shake">
              ⚠️ {timeError}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Subject Day</label>
            <select
              value={formData.subject_day}
              onChange={(e) => setFormData({ ...formData, subject_day: e.target.value })}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-800 focus:border-blue-500 focus:outline-none"
            >
              <option value="">-- Select Subject Day --</option>
              {dbSubjectday.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Room</label>
            <select
              required
              value={formData.room}
              onChange={(e) => setFormData({ ...formData, room: e.target.value })}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-800 focus:border-blue-500 focus:outline-none"
            >
              <option value="">-- Select Room --</option>
              {dbRoom.map((rm) => (
                <option key={rm} value={rm}>{rm}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-800 focus:border-blue-500 focus:outline-none"
            >
              <option value="">-- Select Status --</option>
              {dbSubjectstatus.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div className="mt-6 flex justify-end space-x-3 border-t pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              {isEditMode ? "Save Changes" : "Add Subject"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ManageSubjects() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teachers, setTeachers] = useState<TeacherOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [sortField, setSortField] = useState<keyof Subject | "composite_subject">("subject_id");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);

  const fetchSubjects = async () => {
    try {
      const res = await fetch("/api/portal/admin?table=subjects");
      if (res.ok) {
        const data = await res.json();
        setSubjects(data);
      } else {
        console.error("Failed to load subjects from backend database.");
      }
    } catch (err) {
      console.error("Network connectivity issue:", err);
    }
  };

  const fetchTeachers = async () => {
    try {
      const res = await fetch("/api/portal/admin?table=teachers");
      if (res.ok) {
        const rawTeachers = await res.json();
        if (Array.isArray(rawTeachers)) {
          const mappedTeachers: TeacherOption[] = rawTeachers.map((tch: any) => ({
            teacher_id: tch.teacher_id,
            full_name: `${tch.first_name || ""} ${tch.last_name || ""}`.trim() || tch.teacher_id
          })).sort((a, b) => a.full_name.localeCompare(b.full_name));
          
          setTeachers(mappedTeachers);
        }
      }
    } catch (err) {
      console.error("Failed loading dynamic teachers lists:", err);
    }
  };

  useEffect(() => {
    const initDataFetch = async () => {
      setIsLoading(true);
      await Promise.all([fetchSubjects(), fetchTeachers()]);
      setIsLoading(false);
    };
    initDataFetch();
  }, []);

  // Reset pagination to page 1 whenever searching turns up new results
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const getTeacherFullName = (teacherId: string) => {
    const match = teachers.find((t) => t.teacher_id === teacherId);
    return match ? match.full_name : teacherId || "Unassigned";
  };

  const handleSort = (field: keyof Subject | "composite_subject") => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const renderSortArrow = (field: keyof Subject | "composite_subject") => {
    if (sortField !== field) return <span className="text-gray-300 ml-1">↕</span>;
    return sortDirection === "asc" ? <span className="text-blue-600 ml-1">▲</span> : <span className="text-blue-600 ml-1">▼</span>;
  };

  const filteredSubjects = subjects.filter(
    (s) =>
      s.sched_code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.subject_name?.toLowerCase().includes(searchQuery.toLowerCase()) 
  );

  const sortedSubjects = [...filteredSubjects].sort((a, b) => {
    let aValue = "";
    let bValue = "";

    if (sortField === "composite_subject") {
      aValue = `${a.sched_code} ${a.subject_name}`.toLowerCase();
      bValue = `${b.sched_code} ${b.subject_name}`.toLowerCase();
    } else if (sortField === "teacher_id") {
      aValue = getTeacherFullName(a.teacher_id).toLowerCase();
      bValue = getTeacherFullName(b.teacher_id).toLowerCase();
    } else {
      aValue = String(a[sortField as keyof Subject] || "").toLowerCase();
      bValue = String(b[sortField as keyof Subject] || "").toLowerCase();
    }

    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  // Pagination Math calculations
  const totalItems = sortedSubjects.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, totalItems);
  const paginatedSubjects = sortedSubjects.slice(startIndex, endIndex);

  const handleAddClick = () => {
    setSelectedSubject(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (subject: Subject) => {
    setSelectedSubject(subject);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedSubject(null);
  };

  const handleSaveSubject = async (savedSubject: Subject) => {
    const isEditMode = subjects.some((t) => t.subject_id === savedSubject.subject_id);
    const url = "/api/portal/admin?table=subjects";
    const method = isEditMode ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(savedSubject),
      });

      if (res.ok) {
        await fetchSubjects();
        setIsModalOpen(false);
        setSelectedSubject(null);
      } else {
        const errData = await res.json();
        alert(errData.message || "Could not commit subject record changes.");
      }
    } catch (error) {
      console.error("Transaction save error:", error);
    }
  };

  return (
    <div className="p-6">
      <div className="p-4 bg-white flex flex-col md:flex-row justify-between items-center shadow rounded-t-xl border-b border-gray-100 gap-4">
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <h2 className="text-xl font-bold text-gray-800">Subject Management</h2>
          <div className="relative w-full md:w-64">
            <input
              type="text"
              placeholder="Search by name or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-3 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <button
          onClick={handleAddClick}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium w-full md:w-auto"
        >
          Add Subject
        </button>
      </div>

      <div className="bg-white p-6 shadow rounded-b-xl overflow-x-auto">
        {isLoading ? (
          <div className="text-center py-10 font-medium text-gray-500 animate-pulse">
            Loading Subject records...
          </div>
        ) : (
          <>
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="text-gray-500 uppercase text-xs border-b select-none">
                  <th className="pb-4 cursor-pointer hover:text-blue-600 transition" onClick={() => handleSort("subject_id")}>
                    Subject ID {renderSortArrow("subject_id")}
                  </th>
                  <th className="pb-4 cursor-pointer hover:text-blue-600 transition" onClick={() => handleSort("composite_subject")}>
                    Subject {renderSortArrow("composite_subject")}
                  </th>
                  <th className="pb-4 cursor-pointer hover:text-blue-600 transition" onClick={() => handleSort("subject_year_section")}>
                    Year & Section {renderSortArrow("subject_year_section")}
                  </th>
                  <th className="pb-4 cursor-pointer hover:text-blue-600 transition" onClick={() => handleSort("semester")}>
                    Semester {renderSortArrow("semester")}
                  </th>
                  <th className="pb-4 cursor-pointer hover:text-blue-600 transition" onClick={() => handleSort("teacher_id")}>
                    Teacher {renderSortArrow("teacher_id")}
                  </th>
                  <th className="pb-4 cursor-pointer hover:text-blue-600 transition" onClick={() => handleSort("status")}>
                    Status {renderSortArrow("status")}
                  </th>
                  <th className="pb-4">
                    Class Time
                  </th>
                  <th className="pb-4 cursor-pointer hover:text-blue-600 transition" onClick={() => handleSort("subject_day")}>
                    Day {renderSortArrow("subject_day")}
                  </th>
                  <th className="pb-4 cursor-pointer hover:text-blue-600 transition" onClick={() => handleSort("room")}>
                    Room {renderSortArrow("room")}
                  </th>
                  <th className="pb-4 text-right">Actions</th>
                </tr>
              </thead> 

              <tbody className="divide-y">
                {paginatedSubjects.map((subject) => (
                  <tr key={subject.subject_id} className="hover:bg-gray-50">
                    <td className="py-4 font-mono text-gray-600">{subject.subject_id}</td>
                    <td className="py-4">
                      <div className="font-semibold">
                        {subject.sched_code} {subject.subject_name} 
                      </div>
                      <div className="text-xs text-gray-500">{subject.subject_specification}</div>
                    </td>
                    <td className="py-4">{subject.subject_year_section}</td>
                    <td className="py-4 font-medium text-gray-700">{subject.semester || "N/A"}</td>
                    <td className="py-4 font-medium text-gray-700">
                      {getTeacherFullName(subject.teacher_id)}
                    </td>
                    <td className="py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          subject.status === "Active"
                            ? "bg-green-100 text-green-700"
                            : subject.status === "Inactive"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {subject.status}
                      </span>
                    </td>
                    <td className="py-4 font-semibold">
                      {subject.class_time?.start && subject.class_time?.end 
                        ? `${subject.class_time.start} - ${subject.class_time.end}`
                        : "No Time Set"}
                    </td>
                    <td className="py-4 font-semibold">{subject.subject_day}</td>
                    <td className="py-4 font-semibold">{subject.room}</td>
                    <td className="py-4 text-right">
                      <button
                        onClick={() => handleEditClick(subject)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {totalItems === 0 && (
              <div className="text-center py-10 text-gray-500 italic">
                No subjects match your search.
              </div>
            )}

            {/* Pagination UI Controls */}
            {totalItems > 0 && (
              <div className="mt-4 flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-gray-100 text-sm text-gray-600">
                <div>
                  Showing <span className="font-semibold text-gray-800">{totalItems === 0 ? 0 : startIndex + 1}</span> to{" "}
                  <span className="font-semibold text-gray-800">{endIndex}</span> of{" "}
                  <span className="font-semibold text-gray-800">{totalItems}</span> entries
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className={`px-3 py-1.5 border rounded-lg font-medium transition ${
                      currentPage === 1
                        ? "bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    Previous
                  </button>
                  <div className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 font-medium">
                    Page {currentPage} of {totalPages}
                  </div>
                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1.5 border rounded-lg font-medium transition ${
                      currentPage === totalPages
                        ? "bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <SubjectModal
        isOpen={isModalOpen}
        subject={selectedSubject}
        onClose={handleCloseModal}
        onSave={handleSaveSubject}
        dbTeachers={teachers} 
      />
    </div>
  );
}