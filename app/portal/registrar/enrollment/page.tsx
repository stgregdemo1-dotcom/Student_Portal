"use client";

import React, { useState, useEffect } from "react";

interface EnrollmentRequest {
  _id: string;
  student_id?: string; 
  first_name?: string;
  last_name?: string;
  track?: string;
  enrollmentType?: string;
  status?: string;
}

type SortableKeys = "student_id" | "studentName" | "track" | "status";

export default function EnrollmentPage() {
  const [enrollments, setEnrollments] = useState<EnrollmentRequest[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Sorting states
  const [sortKey, setSortKey] = useState<SortableKeys>("student_id");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // 🚀 PAGINATION STATES
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 20; // Exactly 20 records per page

  const fetchEnrollments = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/portal/registrar?table=students&status=Pending");
      if (res.ok) {
        const jsonResponse = await res.json();
        setEnrollments(Array.isArray(jsonResponse) ? jsonResponse : jsonResponse.data || []);
        setCurrentPage(1); // Reset back to Page 1 when pulling fresh data
      }
    } catch (err) {
      console.error("Error loading enrollment requests:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const handleSort = (key: SortableKeys) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
    setCurrentPage(1); // Reset back to Page 1 on sort change
  };

  // Process inline client sorting
  const sortedEnrollments = [...enrollments].sort((a, b) => {
    let valueA = "";
    let valueB = "";

    if (sortKey === "studentName") {
      valueA = `${a.first_name || ""} ${a.last_name || ""}`.trim().toLowerCase();
      valueB = `${b.first_name || ""} ${b.last_name || ""}`.trim().toLowerCase();
    } else {
      valueA = (a[sortKey] || "").toString().toLowerCase();
      valueB = (b[sortKey] || "").toString().toLowerCase();
    }

    if (valueA < valueB) return sortDirection === "asc" ? -1 : 1;
    if (valueA > valueB) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  // 🚀 PAGINATION SLICING
  const totalItems = sortedEnrollments.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedEnrollments = sortedEnrollments.slice(startIndex, endIndex);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const renderSortIcon = (key: SortableKeys) => {
    if (sortKey !== key) return <span className="text-gray-300 ml-1 text-[10px]">↕</span>;
    return sortDirection === "asc" ? <span className="text-blue-600 ml-1 text-[10px]">▲</span> : <span className="text-blue-600 ml-1 text-[10px]">▼</span>;
  };

  const getStatusStyle = (status = "Pending") => {
    switch (status.toLowerCase()) {
      case "approved":
      case "enrolled":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="bg-white rounded-xl shadow overflow-hidden border border-gray-100 flex flex-col justify-between min-h-[500px]">
        
        <div>
          {/* Table Header Section */}
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-800">Enrollment Requests</h3>
            <button 
              onClick={fetchEnrollments}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium animate-none"
            >
              Refresh
            </button>
          </div>

          {/* Records Table View */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    onClick={() => handleSort("student_id")} 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none hover:bg-gray-100/70 transition-colors"
                  >
                    Student ID {renderSortIcon("student_id")}
                  </th>
                  <th 
                    onClick={() => handleSort("studentName")} 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none hover:bg-gray-100/70 transition-colors"
                  >
                    Student {renderSortIcon("studentName")}
                  </th>
                  <th 
                    onClick={() => handleSort("track")} 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none hover:bg-gray-100/70 transition-colors"
                  >
                    Strand / Track {renderSortIcon("track")}
                  </th>
                  <th 
                    onClick={() => handleSort("status")} 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none hover:bg-gray-100/70 transition-colors"
                  >
                    Status {renderSortIcon("status")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 text-sm text-gray-700">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400 animate-pulse">
                      Loading enrollment requests...
                    </td>
                  </tr>
                ) : paginatedEnrollments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400 italic">
                      No pending enrollment records found.
                    </td>
                  </tr>
                ) : (
                  // 🚀 Render mapped page items slice
                  paginatedEnrollments.map((record) => (
                    <tr key={record._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs font-bold text-slate-600">
                        {record.student_id || `ID-${record._id.slice(-6).toUpperCase()}`}
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {record.first_name || record.last_name 
                          ? `${record.first_name || ""} ${record.last_name || ""}`.trim() 
                          : "Unnamed Student"}
                      </td>
                      <td className="px-6 py-4 text-gray-500 font-medium">
                        {record.track || "Unassigned"}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide ${getStatusStyle(record.status)}`}>
                          {record.status || "Pending"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-blue-600 font-medium">
                        <a 
                          href={`/portal/registrar/enrollment/information?id=${record.student_id}`} 
                          className="text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          View
                        </a>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 🚀 PAGINATION FOOTER */}
        {!isLoading && totalItems > 0 && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
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