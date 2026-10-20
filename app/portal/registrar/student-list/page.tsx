"use client";

import React, { useState, useEffect } from "react";

interface StudentRecord {
  _id: string;
  student_id?: string;
  first_name?: string;
  last_name?: string;
  track?: string;
  status?: string;
  [key: string]: any; // Allows displaying all other dynamic student details upon expansion
}

type SortableKeys = "student_id" | "studentName" | "track" | "status";

export default function StudentListPage() {
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [sortKey, setSortKey] = useState<SortableKeys>("student_id");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [expandedStudentId, setExpandedStudentId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const itemsPerPage = 20;

  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      // Fetch all students from the student collection regardless of status
      const res = await fetch("/api/portal/registrar?table=students");
      if (res.ok) {
        const jsonResponse = await res.json();
        const rawData = Array.isArray(jsonResponse) ? jsonResponse : jsonResponse.data || [];
        setStudents(rawData);
        setCurrentPage(1);
      }
    } catch (err) {
      console.error("Error loading student records:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleSort = (key: SortableKeys) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
    setCurrentPage(1);
  };

  const handleStatusUpdate = async (studentId: string, newStatus: "Graduated" | "Archived") => {
    try {
      setActionLoading(studentId);
      const res = await fetch("/api/portal/registrar", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "updateStudentStatus", student_id: studentId, status: newStatus }),
      });

      const result = await res.json();
      if (res.ok && result.success) {
        // Update local state smoothly without re-fetching
        setStudents((prev) =>
          prev.map((s) => (s.student_id === studentId ? { ...s, status: newStatus } : s))
        );
      } else {
        alert(result.message || "Failed to update student status.");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert("An error occurred while updating status.");
    } finally {
      setActionLoading(null);
    }
  };

  const sortedStudents = [...students].sort((a, b) => {
    let valueA = "";
    let valueB = "";

    if (sortKey === "studentName") {
      valueA = `${a.last_name || ""} ${a.first_name || ""}`.trim().toLowerCase();
      valueB = `${b.last_name || ""} ${b.first_name || ""}`.trim().toLowerCase();
    } else {
      valueA = (a[sortKey] || "").toString().toLowerCase();
      valueB = (b[sortKey] || "").toString().toLowerCase();
    }

    if (valueA < valueB) return sortDirection === "asc" ? -1 : 1;
    if (valueA > valueB) return sortDirection === "asc" ? 1 : -1;
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

  const renderSortIcon = (key: SortableKeys) => {
    if (sortKey !== key) return <span className="text-gray-300 ml-1 text-[10px]">↕</span>;
    return sortDirection === "asc" ? <span className="text-blue-600 ml-1 text-[10px]">▲</span> : <span className="text-blue-600 ml-1 text-[10px]">▼</span>;
  };

  const getStatusStyle = (status = "Pending") => {
    const lowerStatus = status.toLowerCase();
    if (lowerStatus.includes("approved") || lowerStatus.includes("enrolled")) {
      return "bg-green-100 text-green-800";
    } else if (lowerStatus.includes("graduated")) {
      return "bg-blue-100 text-blue-800";
    } else if (lowerStatus.includes("archive") || lowerStatus.includes("rejected")) {
      return "bg-gray-100 text-gray-800";
    } else {
      return "bg-yellow-100 text-yellow-800";
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="bg-white rounded-xl shadow overflow-hidden border border-gray-100 flex flex-col justify-between min-h-[500px]">
        <div>
          {/* Table Header Section */}
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Student List</h3>
              <p className="text-xs text-gray-500">Comprehensive registry of all students across all statuses.</p>
            </div>
            <button
              onClick={fetchStudents}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
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
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none hover:bg-gray-100/70"
                  >
                    Student ID {renderSortIcon("student_id")}
                  </th>
                  <th
                    onClick={() => handleSort("studentName")}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none hover:bg-gray-100/70"
                  >
                    Student Name (Last, First) {renderSortIcon("studentName")}
                  </th>
                  <th
                    onClick={() => handleSort("track")}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none hover:bg-gray-100/70"
                  >
                    Strand / Track {renderSortIcon("track")}
                  </th>
                  <th
                    onClick={() => handleSort("status")}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none hover:bg-gray-100/70"
                  >
                    Status {renderSortIcon("status")}
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 text-sm text-gray-700">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400 animate-pulse">
                      Loading student records...
                    </td>
                  </tr>
                ) : paginatedStudents.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400 italic">
                      No student records found in the database.
                    </td>
                  </tr>
                ) : (
                  paginatedStudents.map((record) => {
                    const studentId = record.student_id || record._id;
                    const isExpanded = expandedStudentId === studentId;
                    const formattedName = `${record.last_name || ""}, ${record.first_name || ""}`.trim();

                    return (
                      <React.Fragment key={record._id}>
                        {/* Main Row */}
                        <tr
                          onClick={() => setExpandedStudentId(isExpanded ? null : studentId)}
                          className={`cursor-pointer transition-colors ${
                            isExpanded ? "bg-blue-50/60" : "hover:bg-slate-50/70"
                          }`}
                        >
                          <td className="px-6 py-4 font-mono text-xs font-bold text-slate-600 flex items-center gap-2">
                            <span className="text-gray-400 text-xs">{isExpanded ? "▼" : "▶"}</span>
                            {record.student_id || `ID-${record._id.slice(-6).toUpperCase()}`}
                          </td>
                          <td className="px-6 py-4 font-medium text-gray-900">
                            {formattedName !== "," ? formattedName : "Unnamed Student"}
                          </td>
                          <td className="px-6 py-4 text-gray-500 font-medium">
                            {record.track || "Unassigned"}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide ${getStatusStyle(record.status)}`}>
                              {record.status || "Pending"}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center text-xs text-blue-600 font-medium">
                            {isExpanded ? "Hide Details" : "Expand Details"}
                          </td>
                        </tr>

                        {/* Expanded Full Details Sub-Row */}
                        {isExpanded && (
                          <tr>
                            <td colSpan={5} className="p-6 bg-slate-50 border-b border-gray-200">
                              <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-inner space-y-4">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 border-b pb-2">
                                  Full Student Profile Details: <span className="font-mono text-blue-600">{record.student_id}</span>
                                </h4>

                                {/* Grid displaying all available fields from the student record */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                                  {Object.entries(record).map(([key, val]) => {
                                    if (key === "__v" || key === "_id") return null;
                                    return (
                                      <div key={key} className="bg-gray-50 p-2.5 rounded border border-gray-100">
                                        <span className="block font-semibold text-gray-400 uppercase text-[10px]">
                                          {key.replace(/_/g, " ")}
                                        </span>
                                        <span className="text-gray-800 font-medium break-all">
                                          {typeof val === "object" && val !== null
                                            ? JSON.stringify(val)
                                            : String(val ?? "N/A")}
                                        </span>
                                      </div>
                                    );
                                  })}
                                </div>

                                {/* Action Buttons for Status Update */}
                                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                                  <span className="text-xs text-gray-500 mr-auto">
                                    Change Status Actions:
                                  </span>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleStatusUpdate(record.student_id, "Graduated");
                                    }}
                                    disabled={actionLoading === record.student_id}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors disabled:opacity-50"
                                  >
                                    {actionLoading === record.student_id ? "Updating..." : "Graduated"}
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleStatusUpdate(record.student_id, "Archived");
                                    }}
                                    disabled={actionLoading === record.student_id}
                                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors disabled:opacity-50"
                                  >
                                    {actionLoading === record.student_id ? "Updating..." : "Archive"}
                                  </button>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination Footer */}
        {!isLoading && totalItems > 0 && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
            <span className="text-xs text-gray-500">
              Showing <span className="font-semibold text-gray-700">{startIndex + 1}</span> to{" "}
              <span className="font-semibold text-gray-700">{Math.min(endIndex, totalItems)}</span> of{" "}
              <span className="font-semibold text-gray-700">{totalItems}</span> entries
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1.5 text-xs font-semibold bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 transition-colors disabled:opacity-50"
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
                className="px-3 py-1.5 text-xs font-semibold bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 transition-colors disabled:opacity-50"
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