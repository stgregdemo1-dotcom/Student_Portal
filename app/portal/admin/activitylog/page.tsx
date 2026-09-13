"use client";

import React, { useState, useEffect } from "react";

interface AuditLog {
  _id: string;
  username: string;
  user_type: string;
  activity: string;
  createdAt: string;
}

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Pagination State Configurations
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Fetch log activity entries from the backend API pipeline
  const fetchAuditLogs = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/portal/admin?table=audit_logs");
      if (res.ok) {
        const data = await res.json();
        // Fallback checks to prevent parsing structural map errors
        setLogs(Array.isArray(data) ? data : data.data || []);
      } else {
        console.error("Failed to recover log activity records from database storage.");
      }
    } catch (err) {
      console.error("Network problem blocking audit trail reads:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  // Filter conditions targeting tracking descriptors or operator identities
  const filteredLogs = logs.filter((log) => {
    const searchString = searchQuery.toLowerCase();
    return (
      log.username?.toLowerCase().includes(searchString) ||
      log.user_type?.toLowerCase().includes(searchString) ||
      log.activity?.toLowerCase().includes(searchString)
    );
  });

  // Calculate parameters for structural pagination steps
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentLogsLayout = filteredLogs.slice(indexOfFirstItem, indexOfLastItem);

  // Auto-reset down to first screen page during keyword structural shifts
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto space-y-4">
        
        {/* Banner Section Contextual Header */}
        <div className="p-4 bg-white flex flex-col md:flex-row justify-between items-start md:items-center shadow-sm rounded-xl border border-gray-100 gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-800">System Audit Logs</h2>
            <p className="text-xs text-gray-500 mt-0.5">
            </p>
          </div>
          
          <div className="relative w-full md:w-80">
            <input
              type="text"
              placeholder="Filter by account identifier, type, or activity..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-3 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>
        </div>

        {/* Data Presentation Table Wrapper */}
        <div className="bg-white shadow-sm rounded-xl border border-gray-100 overflow-x-auto">
          {isLoading ? (
            <div className="text-center py-20 font-medium text-gray-400 animate-pulse">
              Retrieving historical system operations trail log registries...
            </div>
          ) : (
            <>
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="text-gray-400 uppercase text-[10px] font-bold tracking-wider bg-gray-50/70 border-b select-none">
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">User Type</th>
                    <th className="py-3 px-4">Activity Description</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                  {currentLogsLayout.map((log) => (
                    <tr key={log._id || Math.random()} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-xs text-gray-400 whitespace-nowrap">
                        {log.createdAt ? new Date(log.createdAt).toLocaleString() : "—"}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-gray-800 whitespace-nowrap">
                        {log.username}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wide ${
                            log.user_type === "admin"
                              ? "bg-purple-50 text-purple-700 border border-purple-200"
                              : log.user_type === "registrar"
                              ? "bg-blue-50 text-blue-700 border border-blue-200"
                              : log.user_type === "teacher"
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : "bg-gray-50 text-gray-600 border border-gray-200"
                          }`}
                        >
                          {log.user_type}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-gray-600 max-w-md break-words">
                        {log.activity}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Layout Display Boundaries Empty Fallbacks */}
              {filteredLogs.length === 0 && (
                <div className="text-center py-16 text-gray-400 italic">
                  No execution logging indicators match your active context parameters.
                </div>
              )}

              {/* Simple Clean Operational Pagination Toolbar */}
              {filteredLogs.length > itemsPerPage && (
                <div className="p-4 border-t flex justify-between items-center bg-gray-50/40 rounded-b-xl select-none">
                  <span className="text-xs font-medium text-gray-500">
                    Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredLogs.length)} of {filteredLogs.length} activity actions
                  </span>
                  
                  <div className="flex gap-2">
                    <button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((prev) => prev - 1)}
                      className="px-3 py-1 text-xs border rounded bg-white text-gray-600 hover:bg-gray-50 transition disabled:opacity-40 disabled:cursor-not-allowed font-medium"
                    >
                      Previous
                    </button>
                    <button
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage((prev) => prev + 1)}
                      className="px-3 py-1 text-xs border rounded bg-white text-gray-600 hover:bg-gray-50 transition disabled:opacity-40 disabled:cursor-not-allowed font-medium"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

      </div>
    </div>
  );
}