"use client";

import React, { useState, useEffect } from "react";

interface AdmissionRequest {
  _id: string;
  applicant_id?: string;
  firstName?: string;
  lastName?: string;
  track?: string;
  enrollmentType?: string;
  status?: string;
}

type SortableKeys = "applicant_id" | "studentName" | "track" | "status";

export default function EnrollmentPage() {
  const [admissions, setAdmissions] = useState<AdmissionRequest[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [sortKey, setSortKey] = useState<SortableKeys>("applicant_id");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(20);

  const fetchAdmissions = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admission?table=admissions_applications");
      if (res.ok) {
        const jsonResponse = await res.json();
        setAdmissions(jsonResponse.data || []);
        setCurrentPage(1);
      }
    } catch (err) {
      console.error("Error loading admission requests:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmissions();
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleSort = (key: SortableKeys) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
    setCurrentPage(1);
  };

  const filteredAdmissions = admissions.filter((record) => {
    if (statusFilter !== "All") {
      const currentStatus = (record.status || "Pending").toLowerCase();
      if (currentStatus !== statusFilter.toLowerCase()) return false;
    }

    if (searchTerm.trim() !== "") {
      const fullName = `${record.firstName || ""} ${record.lastName || ""}`.toLowerCase();
      if (!fullName.includes(searchTerm.toLowerCase().trim())) {
        return false;
      }
    }

    return true;
  });

  const sortedAdmissions = [...filteredAdmissions].sort((a, b) => {
    let valueA = "";
    let valueB = "";

    if (sortKey === "studentName") {
      valueA = `${a.firstName || ""} ${a.lastName || ""}`.trim().toLowerCase();
      valueB = `${b.firstName || ""} ${b.lastName || ""}`.trim().toLowerCase();
    } else {
      valueA = (a[sortKey] || "").toString().toLowerCase();
      valueB = (b[sortKey] || "").toString().toLowerCase();
    }

    if (valueA < valueB) return sortDirection === "asc" ? -1 : 1;
    if (valueA > valueB) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  const totalItems = sortedAdmissions.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedAdmissions = sortedAdmissions.slice(startIndex, endIndex);

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
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="bg-white rounded-xl shadow overflow-hidden border border-gray-100 flex flex-col justify-between">

        <div>
          {/* Table Header Section */}
          <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">

            {/* Title & Search Bar Beside It */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1">
              <h3 className="text-lg font-semibold text-gray-800 whitespace-nowrap">
                Admission Requests
              </h3>

              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  placeholder="Search student name..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="w-full pl-9 pr-3 py-1.5 bg-gray-50 border border-gray-300 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
                  🔍
                </span>
                {searchTerm && (
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setCurrentPage(1);
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs font-bold"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Filter and Refresh Action Controls */}
            <div className="flex items-center gap-2">
              <select
                value={statusFilter}
                onChange={handleStatusFilterChange}
                className="px-3 py-2 bg-gray-50 border border-gray-300 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              >
                <option value="All">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>

              <button
                onClick={fetchAdmissions}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Refresh
              </button>
            </div>
          </div>

          {/* Records Table View */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    onClick={() => handleSort("applicant_id")}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none hover:bg-gray-100/70 transition-colors"
                  >
                    Applicant ID {renderSortIcon("applicant_id")}
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
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-400 animate-pulse">
                      Loading registration requests...
                    </td>
                  </tr>
                ) : paginatedAdmissions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-400 italic">
                      No admission records found matching your selection.
                    </td>
                  </tr>
                ) : (
                  paginatedAdmissions.map((record) => (
                    <tr key={record._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs font-bold text-slate-600">
                        {record.applicant_id || `ID-${record._id.slice(-6).toUpperCase()}`}
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {record.firstName || record.lastName
                          ? `${record.firstName || ""} ${record.lastName || ""}`.trim()
                          : "Unnamed Applicant"}
                      </td>
                      <td className="px-6 py-4 text-gray-500 font-medium">
                        {record.track || "Unassigned"}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide ${getStatusStyle(record.status)}`}>
                          {record.status || "Pending"}
                        </span>
                      </td>
                      <td className="px-6 py-4 flex items-center gap-3">
                        <a
                          href={`/portal/registrar/admission/information?id=${record.applicant_id}`}
                          className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                        >
                          View Profile
                        </a>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* PAGINATION CONTAINER FOOTER */}
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
                className="px-3 py-1.5 text-xs font-semibold bg-white border border-gray-300 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors disabled:opacity-50 disabled:hover:bg-white"
              >
                Previous
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`w-8 h-8 text-xs font-semibold rounded-lg transition-colors ${currentPage === pageNum
                      ? "bg-blue-600 text-white"
                      : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-100"
                      }`}
                  >
                    {pageNum}
                  </button>
                ))}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 text-xs font-semibold bg-white border border-gray-300 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors disabled:opacity-50 disabled:hover:bg-white"
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