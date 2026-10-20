"use client";

import { useEffect, useState, useCallback } from "react";

interface SubjectReference {
  subject_id: string;
  sched_code?: string;
  status?: string;
}

interface StudentSectionRecord {
  _id: string;
  student_id: string;
  first_name: string;
  last_name: string;
  year: string;
  semester: string;
  section: string;
  evaluation: string;
  subjects: SubjectReference[];
}

export default function EnrollmentPage() {
  const [requests, setRequests] = useState<StudentSectionRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter States
  const [selectedYear, setSelectedYear] = useState<string>("All");
  const [selectedSemester, setSelectedSemester] = useState<string>("All");
  const [selectedSection, setSelectedSection] = useState<string>("All");

  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 20;

  const fetchEvaluationRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/portal/registrar?table=student_section");

      if (!response.ok) {
        throw new Error("Failed to load evaluation requests.");
      }

      const data = await response.json();
      const records = Array.isArray(data) ? data : data.data || [];

      const sortedRecords = records.sort((a: StudentSectionRecord, b: StudentSectionRecord) =>
        (a.student_id || "").localeCompare(b.student_id || "")
      );

      setRequests(sortedRecords);
      setCurrentPage(1);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvaluationRequests();
  }, [fetchEvaluationRequests]);

  // Extract unique options for filter dropdowns from data
  const uniqueYears = Array.from(new Set(requests.map((r) => r.year))).filter(Boolean).sort();
  const uniqueSemesters = Array.from(new Set(requests.map((r) => r.semester))).filter(Boolean).sort();
  const uniqueSections = Array.from(new Set(requests.map((r) => r.section))).filter(Boolean).sort();

  // Filter logic based on selected dropdowns
  const filteredRequests = requests.filter((record) => {
    const matchesYear = selectedYear === "All" || record.year === selectedYear;
    const matchesSemester = selectedSemester === "All" || record.semester === selectedSemester;
    const matchesSection = selectedSection === "All" || record.section === selectedSection;
    return matchesYear && matchesSemester && matchesSection;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedYear, selectedSemester, selectedSection]);

  const totalItems = filteredRequests.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedRequests = filteredRequests.slice(startIndex, endIndex);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="p-6">
      <div className="bg-white rounded-xl shadow overflow-hidden">
        
        {/* Top Header & Filter Controls Bar */}
        <div className="p-4 border-b border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h3 className="text-lg font-semibold text-gray-800">Students Evaluation Requests</h3>
          
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
            
            {/* Year Filter Dropdown */}
            <div className="flex items-center gap-1.5">
              <label htmlFor="year-filter" className="text-xs font-medium text-gray-500">Year:</label>
              <select
                id="year-filter"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs font-medium bg-white outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
              >
                <option value="All">All Years</option>
                {uniqueYears.map((yr) => (
                  <option key={yr} value={yr}>{yr}</option>
                ))}
              </select>
            </div>

            {/* Semester Filter Dropdown */}
            <div className="flex items-center gap-1.5">
              <label htmlFor="semester-filter" className="text-xs font-medium text-gray-500">Semester:</label>
              <select
                id="semester-filter"
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                className="border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs font-medium bg-white outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
              >
                <option value="All">All Semesters</option>
                {uniqueSemesters.map((sem) => (
                  <option key={sem} value={sem}>{sem}</option>
                ))}
              </select>
            </div>

            {/* Section Filter Dropdown */}
            <div className="flex items-center gap-1.5">
              <label htmlFor="section-filter" className="text-xs font-medium text-gray-500">Section:</label>
              <select
                id="section-filter"
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                className="border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs font-medium bg-white outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
              >
                <option value="All">All Sections</option>
                {uniqueSections.map((sec) => (
                  <option key={sec} value={sec}>{sec}</option>
                ))}
              </select>
            </div>

            {/* Refresh Button */}
            <button
              onClick={fetchEvaluationRequests}
              disabled={loading}
              className="px-4 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-opacity"
            >
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-600 border-b border-red-100 text-sm">
            {error}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Semester</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Section</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-gray-400">
                    Loading pending evaluation requests...
                  </td>
                </tr>
              ) : paginatedRequests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-gray-400">
                    No pending evaluations found matching the selected criteria.
                  </td>
                </tr>
              ) : (
                paginatedRequests.map((record) => {
                  const hasFullName = record.first_name || record.last_name;
                  const fullName = hasFullName
                    ? `${record.first_name} ${record.last_name}`
                    : "Unknown Name";

                  return (
                    <tr key={record._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{record.student_id}</td>
                      <td className="px-6 py-4 text-sm text-gray-700 capitalize">{fullName}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{record.year}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{record.semester}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{record.section}</td>
                      <td className="px-6 py-4 text-sm">
                        <a
                          href={`/portal/registrar/students-evaluation/information?id=${record.student_id}`}
                          className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                        >
                          View
                        </a>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION CONTROLLER FOOTER */}
        {!loading && totalItems > 0 && (
          <div className="p-4 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
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
                    className={`w-8 h-8 text-xs font-semibold rounded-lg transition-colors ${currentPage === pageNum
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