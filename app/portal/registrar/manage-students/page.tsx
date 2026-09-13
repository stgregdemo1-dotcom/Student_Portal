"use client";

import React, { useState, useEffect } from 'react';

type SortableKeys = 'studentId' | 'firstName' | 'program' | 'status' | 'section' | 'semester';

export default function ManageStudents() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [selectedSemesterFilter, setSelectedSemesterFilter] = useState<string>("All");

  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 20; 

  const [sortConfig, setSortConfig] = useState<{ key: SortableKeys; direction: 'asc' | 'desc' } | null>({
    key: 'studentId',
    direction: 'asc'
  });

  const currentYear = new Date().getFullYear().toString();

  useEffect(() => {
    const fetchEnrolledStudents = async () => {
      try {
        setLoading(true);

        const [studentsRes, sectionsRes] = await Promise.all([
          fetch("/api/portal/registrar?table=students&status=Enrolled"),
          fetch(`/api/portal/registrar?table=student_section&year=${currentYear}`),
        ]);

        const studentsJson = await studentsRes.json();

        if (!studentsRes.ok || !studentsJson.success) {
          setError(studentsJson.message || "Failed to parse dynamic collection profile arrays.");
          return;
        }

        let studentSectionMap = new Map<string, { section: string; semester: string }>();
        if (sectionsRes.ok) {
          const sectionsJson = await sectionsRes.json();
          if (sectionsJson.success && Array.isArray(sectionsJson.data)) {
            // Check if backend returned aggregated flattened records or raw array
            sectionsJson.data.forEach((rec: any) => {
              if (rec.section && rec.semester) {
                studentSectionMap.set(rec.student_id, {
                  section: rec.section,
                  semester: rec.semester
                });
              } else if (rec.class && Array.isArray(rec.class)) {
                const activeClass = rec.class.find((c: any) => c.year === currentYear) || rec.class[0];
                if (activeClass) {
                  studentSectionMap.set(rec.student_id, {
                    section: activeClass.section,
                    semester: activeClass.semester
                  });
                }
              }
            });
          }
        } else {
          console.error("Failed to load current-year section assignments.");
        }

        const merged = studentsJson.data.map((student: any) => {
          const assignment = studentSectionMap.get(student.student_id);
          return {
            ...student,
            section: assignment ? assignment.section : null,
            semester: assignment ? assignment.semester : null,
          };
        });

        setStudents(merged);
        setCurrentPage(1); 
      } catch (err) {
        console.error("Database connecting query error:", err);
        setError("Network error connecting to student collections pipeline.");
      } finally {
        setLoading(false);
      }
    };

    fetchEnrolledStudents();
  }, [currentYear]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedSemesterFilter]);

  const handleSort = (key: SortableKeys) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
    setCurrentPage(1); 
  };

  const getSortIndicator = (key: SortableKeys) => {
    if (!sortConfig || sortConfig.key !== key) return " ↕";
    return sortConfig.direction === 'asc' ? " ↑" : " ↓";
  };

  const filteredStudents = students.filter((student) => {
    const first = student.first_name || "";
    const last = student.last_name || "";
    const sId = student.student_id || "";
    const fullName = `${first} ${last}`.toLowerCase();

    const matchesSearch = 
      fullName.includes(searchQuery.toLowerCase()) ||
      sId.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSemester = 
      selectedSemesterFilter === "All" || 
      String(student.semester) === selectedSemesterFilter;

    return matchesSearch && matchesSemester;
  });

  const sortedStudents = [...filteredStudents].sort((a, b) => {
    if (!sortConfig) return 0;

    const key = sortConfig.key;

    let valA = "";
    let valB = "";

    if (key === 'studentId') { valA = a.student_id; valB = b.student_id; }
    else if (key === 'firstName') { valA = a.first_name; valB = b.first_name; }
    else if (key === 'program') { valA = a.track || a.program; valB = b.track || b.program; }
    else if (key === 'status') { valA = a.status; valB = b.status; }
    else if (key === 'section') { valA = a.section; valB = b.section; }
    else if (key === 'semester') { valA = a.semester; valB = b.semester; }

    valA = (valA || "").toLowerCase();
    valB = (valB || "").toLowerCase();

    if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
    if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const totalItems = sortedStudents.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedStudents = sortedStudents.slice(startIndex, endIndex);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-sm font-medium text-gray-400 animate-pulse">
        Retrieving active registry accounts from database...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-500 font-semibold text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="p-4 bg-white flex flex-col md:flex-row justify-between items-center shadow rounded-t-xl border-b border-gray-100 gap-4">
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <h2 className="text-xl font-bold text-gray-800 whitespace-nowrap">Manage Students</h2>

          {/* Search Bar */}
          <div className="relative w-full md:w-64">
            <input
              type="text"
              placeholder="Search students..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-3 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
        </div>

        {/* ACTION CONTAINER */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            id="semester-filter-dropdown"
            value={selectedSemesterFilter}
            onChange={(e) => setSelectedSemesterFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-blue-500 bg-white outline-none text-gray-700 transition"
          >
            <option value="All">All Semesters</option>
            <option value="1">1st Semester</option>
            <option value="2">2nd Semester</option>
          </select>

          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors font-medium shadow-sm whitespace-nowrap">
            Add Student
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white p-6 shadow rounded-b-xl overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="text-gray-500 uppercase text-xs tracking-wider border-b select-none">
              <th onClick={() => handleSort('studentId')} className="pb-4 font-semibold cursor-pointer hover:text-gray-800 transition-colors">
                Student ID{getSortIndicator('studentId')}
              </th>
              <th onClick={() => handleSort('firstName')} className="pb-4 font-semibold cursor-pointer hover:text-gray-800 transition-colors">
                Student Name{getSortIndicator('firstName')}
              </th>
              <th onClick={() => handleSort('program')} className="pb-4 font-semibold cursor-pointer hover:text-gray-800 transition-colors">
                Strand{getSortIndicator('program')}
              </th>
              <th onClick={() => handleSort('status')} className="pb-4 font-semibold cursor-pointer hover:text-gray-800 transition-colors">
                Status{getSortIndicator('status')}
              </th>
              <th onClick={() => handleSort('section')} className="pb-4 font-semibold cursor-pointer hover:text-gray-800 transition-colors">
                Year & Section{getSortIndicator('section')}
              </th>
              <th onClick={() => handleSort('semester')} className="pb-4 font-semibold cursor-pointer hover:text-gray-800 transition-colors">
                Semester{getSortIndicator('semester')}
              </th>
              <th className="pb-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginatedStudents.map((student) => (
              <tr key={student._id || student.student_id} className="hover:bg-gray-50 transition-colors group">
                <td className="py-4 text-sm font-mono text-gray-600">
                  {student.student_id}
                </td>
                <td className="py-4">
                  <div className="font-semibold text-gray-900">
                    {student.first_name} {student.last_name}
                  </div>
                  <div className="text-xs text-gray-500">{student.email_address || student.email}</div>
                </td>
                <td className="py-4 text-sm text-gray-700">
                  {student.track || student.program || "N/A"}
                </td>
                <td className="py-4">
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                    {student.status}
                  </span>
                </td>
                <td className="py-4 text-sm font-semibold text-gray-800">
                  {student.section ? `${currentYear} - ${student.section}` : "Unassigned"}
                </td>
                <td className="py-4 text-sm text-gray-600">
                  {student.semester ? `Semester ${student.semester}` : "—"}
                </td>
                <td className="py-4 text-right">
                  <a
                    href={`/portal/registrar/manage-students/information?id=${student.student_id}`}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    View Details
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* No Results Empty State */}
        {totalItems === 0 && (
          <div className="text-center py-10">
            <p className="text-gray-500 italic">No enrolled students found matching the filter criteria.</p>
          </div>
        )}

        {/* DYNAMIC PAGINATION CONTROL FOOTER */}
        {!loading && totalItems > 0 && (
          <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 mt-4">
            <span className="text-xs text-gray-500">
              Showing{" "}
              <span className="font-semibold text-gray-700">
                {startIndex + 1}
              </span>{" "}
              to{" "}
              <span className="font-semibold text-gray-700">
                {Math.min(endIndex, totalItems)}
              </span>{" "}
              of <span className="font-semibold text-gray-700">{totalItems}</span> entries
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1.5 text-xs font-semibold bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 transition-colors disabled:opacity-50 disabled:hover:bg-white"
              >
                Previous
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`w-8 h-8 text-xs font-semibold rounded-lg transition-colors ${
                      currentPage === pageNum
                        ? "bg-blue-600 text-white border border-transparent"
                        : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 text-xs font-semibold bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 transition-colors disabled:opacity-50 disabled:hover:bg-white"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}