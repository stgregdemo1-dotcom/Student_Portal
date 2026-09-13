"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";

interface Teacher {
  id: string;
  teacher_id: string;
  prefix: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  email_address: string;
  contact_number: string;
  department_id: string;
  status: string;
  role_id: string;
}

interface FacultyModalProps {
  isOpen: boolean;
  teacher: Teacher | null;
  onClose: () => void;
  onSave: (teacher: Teacher) => void;
}

const FacultyModal = React.memo(function FacultyModal({
  isOpen,
  teacher,
  onClose,
  onSave,
}: FacultyModalProps) {
  if (!isOpen) return null;
  const modalKey = teacher ? `edit-${teacher.id}` : "add-new";
  return (
    <FacultyModalContent
      key={modalKey}
      teacher={teacher}
      onClose={onClose}
      onSave={onSave}
    />
  );
});

function FacultyModalContent({
  teacher,
  onClose,
  onSave,
}: {
  teacher: Teacher | null;
  onClose: () => void;
  onSave: (teacher: Teacher) => void;
}) {
  const isEditMode = !!teacher;

  const [dbPrefixes, setDbPrefixes]     = useState<string[]>([]);
  const [dbRoles, setDbRoles]           = useState<string[]>([]);
  const [dbStatus, setDbStatus]         = useState<string[]>([]);
  const [dbDepartment, setDbDepartment] = useState<string[]>([]);

  const [formData, setFormData] = useState<Teacher>(() => {
    if (teacher) {
      return { ...teacher };
    }
    return {
      id: "",
      teacher_id: "",
      prefix: "",
      first_name: "",
      middle_name: "",
      last_name: "",
      email_address: "",
      contact_number: "",
      department_id: "",
      status: "",
      role_id: "",
    };
  });

  useEffect(() => {
    let cancelled = false;

    const loadDropdownConfigs = async () => {
      try {
        const res = await fetch("/api/portal/admin?table=configuration");
        if (res.ok) {
          const configDoc = await res.json();
          if (cancelled) return;
          if (configDoc && Array.isArray(configDoc.prefix)) {
            setDbPrefixes(configDoc.prefix);
          }
          if (configDoc && Array.isArray(configDoc.employee_role)) {
            setDbRoles(configDoc.employee_role);
          }
          if (configDoc && Array.isArray(configDoc.employee_status)) {
            setDbStatus(configDoc.employee_status);
          }
          if (configDoc && Array.isArray(configDoc.department)) {
            setDbDepartment(configDoc.department);
          }
        }
      } catch (err) {
        console.error("Failed loading dynamic layout selectors:", err);
      }
    };

    loadDropdownConfigs();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      onSave(formData);
      onClose();
    },
    [formData, onSave, onClose]
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="mb-4 flex items-center justify-between border-b pb-3">
          <h3 className="text-xl font-semibold text-gray-800">
            {isEditMode ? "Edit Faculty Details" : "Add New Faculty"}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isEditMode && (
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Teacher ID</label>
              <input
                type="text"
                value={formData.teacher_id}
                disabled
                className="w-full rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 text-gray-500 cursor-not-allowed"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Prefix</label>
            <select
              required
              value={formData.prefix}
              onChange={(e) => setFormData({ ...formData, prefix: e.target.value })}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-800 focus:border-blue-500 focus:outline-none"
            >
              <option value="">-- Select Prefix --</option>
              {dbPrefixes.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">First Name</label>
            <input
              type="text"
              required
              value={formData.first_name}
              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-800 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Middle Name</label>
            <input
              type="text"
              required
              value={formData.middle_name}
              onChange={(e) => setFormData({ ...formData, middle_name: e.target.value })}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-800 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Last Name</label>
            <input
              type="text"
              required
              value={formData.last_name}
              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-800 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Email Address</label>
            <input
              type="email"
              required
              value={formData.email_address}
              onChange={(e) => setFormData({ ...formData, email_address: e.target.value })}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-800 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Department</label>
            <select
              value={formData.department_id}
              onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-800 focus:border-blue-500 focus:outline-none"
            >
              <option value="">-- Select Department --</option>
              {dbDepartment.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Contact Number</label>
            <input
              type="text"
              required
              value={formData.contact_number}
              onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-800 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Role</label>
              <select
                required
                value={formData.role_id}
                onChange={(e) => setFormData({ ...formData, role_id: e.target.value })}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-800 focus:border-blue-500 focus:outline-none"
              >
                <option value="">-- Select Role --</option>
                {dbRoles.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Status</label>
              <select
                required
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-800 focus:border-blue-500 focus:outline-none"
              >
                <option value="">-- Select Status --</option>
                {dbStatus.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
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
              {isEditMode ? "Save Changes" : "Add Member"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ManageTeachers() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [passwordRequestingId, setPasswordRequestingId] = useState<string | null>(null);
  const [sortField, setSortField] = useState<keyof Teacher | "faculty_name">("teacher_id");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 15;

  const fetchTeachers = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/portal/admin?table=teachers");
      if (res.ok) {
        const data = await res.json();
        setTeachers(data);
      }
    } catch (err) {
      console.error("Network connectivity issue:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTeachers();
  }, [fetchTeachers]);

  // Extract unique departments dynamically from teachers list
  const departmentOptions = useMemo(() => {
    const deps = teachers
      .map((t) => t.department_id)
      .filter((dept): dept is string => Boolean(dept));
    return Array.from(new Set(deps)).sort();
  }, [teachers]);

  // Reset to page 1 whenever searching or filtering
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleDepartmentFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDepartmentFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleSetPasswordClick = useCallback(async (teacher: Teacher) => {
    if (!confirm(`Send a secure password setup link to ${teacher.prefix} ${teacher.last_name}?`)) {
      return;
    }

    setPasswordRequestingId(teacher.teacher_id);
    try {
      const res = await fetch("/api/portal/admin/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teacher_id: teacher.teacher_id,
          email_address: teacher.email_address,
          faculty_name: `${teacher.prefix} ${teacher.first_name} ${teacher.last_name}`,
          id: teacher.id
        }),
      });

      if (res.ok) {
        alert("The secure initialization setup password email has been sent successfully!");
      } else {
        const errData = await res.json();
        alert(errData.message || "Failed to trigger email system dispatch protocols.");
      }
    } catch (error) {
      console.error("Password link dispatch error:", error);
      alert("A system error isolated network pipeline routines.");
    } finally {
      setPasswordRequestingId(null);
    }
  }, []);

  const handleSort = useCallback((field: keyof Teacher | "faculty_name") => {
    setCurrentPage(1); // Reset page on sort
    setSortField((prevField) => {
      if (prevField === field) {
        setSortDirection((prevDir) => (prevDir === "asc" ? "desc" : "asc"));
        return prevField;
      }
      setSortDirection("asc");
      return field;
    });
  }, []);

  const renderSortArrow = useCallback(
    (field: keyof Teacher | "faculty_name") => {
      if (sortField !== field) return <span className="text-gray-300 ml-1">↕</span>;
      return sortDirection === "asc" ? <span className="text-blue-600 ml-1">▲</span> : <span className="text-blue-600 ml-1">▼</span>;
    },
    [sortField, sortDirection]
  );

  const sortedTeachers = useMemo(() => {
    const q = searchQuery.toLowerCase();

    const filtered = teachers.filter((t) => {
      const matchesSearch =
        t.prefix?.toLowerCase().includes(q) ||
        t.first_name?.toLowerCase().includes(q) ||
        t.last_name?.toLowerCase().includes(q) ||
        t.teacher_id?.toLowerCase().includes(q);

      const matchesDepartment = departmentFilter ? t.department_id === departmentFilter : true;

      return matchesSearch && matchesDepartment;
    });

    return filtered.sort((a, b) => {
      let aValue = "";
      let bValue = "";

      if (sortField === "faculty_name") {
        aValue = `${a.last_name} ${a.first_name}`.toLowerCase();
        bValue = `${b.last_name} ${b.first_name}`.toLowerCase();
      } else {
        aValue = String(a[sortField] || "").toLowerCase();
        bValue = String(b[sortField] || "").toLowerCase();
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [teachers, searchQuery, departmentFilter, sortField, sortDirection]);

  // Pagination math calculations
  const totalPages = Math.ceil(sortedTeachers.length / ITEMS_PER_PAGE) || 1;
  const paginatedTeachers = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedTeachers.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [sortedTeachers, currentPage]);

  const handleAddClick = useCallback(() => {
    setSelectedTeacher(null);
    setIsModalOpen(true);
  }, []);

  const handleEditClick = useCallback((teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedTeacher(null);
  }, []);

  const handleSaveTeacher = useCallback(
    async (savedTeacher: Teacher) => {
      const isEditMode = savedTeacher.id ? teachers.some((t) => t.id === savedTeacher.id) : false;
      const url = "/api/portal/admin?table=teachers";
      const method = isEditMode ? "PUT" : "POST";

      const payload = { ...savedTeacher };
      if (!isEditMode) delete (payload as any).id;

      try {
        const res = await fetch(url, {
          method: method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          await fetchTeachers();
          setIsModalOpen(false);
          setSelectedTeacher(null);
        } else {
          const errData = await res.json();
          alert(errData.message || "Could not commit teacher record changes.");
        }
      } catch (error) {
        console.error("Transaction save error:", error);
      }
    },
    [teachers, fetchTeachers]
  );

  return (
    <div className="p-6">
      <div className="p-4 bg-white flex flex-col md:flex-row justify-between items-center shadow rounded-t-xl border-b border-gray-100 gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <h2 className="text-xl font-bold text-gray-800 whitespace-nowrap">Faculty Management</h2>
          
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search by name or ID..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full pl-3 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={departmentFilter}
            onChange={handleDepartmentFilterChange}
            className="w-full sm:w-48 py-2 px-3 text-sm border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Departments</option>
            {departmentOptions.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleAddClick}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium w-full md:w-auto whitespace-nowrap"
        >
          Add Faculty
        </button>
      </div>

      <div className="bg-white p-6 shadow rounded-b-xl overflow-x-auto">
        {isLoading ? (
          <div className="text-center py-10 font-medium text-gray-500 animate-pulse">
            Loading Faculty Directory records...
          </div>
        ) : (
          <>
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="text-gray-500 uppercase text-xs border-b select-none">
                  <th className="pb-4 cursor-pointer hover:text-blue-600 transition" onClick={() => handleSort("teacher_id")}>
                    Teacher ID {renderSortArrow("teacher_id")}
                  </th>
                  <th className="pb-4 cursor-pointer hover:text-blue-600 transition" onClick={() => handleSort("faculty_name")}>
                    Faculty Name {renderSortArrow("faculty_name")}
                  </th>
                  <th className="pb-4 cursor-pointer hover:text-blue-600 transition" onClick={() => handleSort("department_id")}>
                    Dept. {renderSortArrow("department_id")}
                  </th>
                  <th className="pb-4 cursor-pointer hover:text-blue-600 transition" onClick={() => handleSort("contact_number")}>
                    Contact {renderSortArrow("contact_number")}
                  </th>
                  <th className="pb-4 cursor-pointer hover:text-blue-600 transition" onClick={() => handleSort("status")}>
                    Status {renderSortArrow("status")}
                  </th>
                  <th className="pb-4 cursor-pointer hover:text-blue-600 transition" onClick={() => handleSort("role_id")}>
                    Role {renderSortArrow("role_id")}
                  </th>
                  <th className="pb-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {paginatedTeachers.map((teacher) => (
                  <tr key={teacher.teacher_id} className="hover:bg-gray-50">
                    <td className="py-4 font-mono text-gray-600">{teacher.teacher_id}</td>
                    <td className="py-4">
                      <div className="font-semibold">
                        {teacher.prefix} {teacher.first_name} {teacher.last_name}
                      </div>
                      <div className="text-xs text-gray-500">{teacher.email_address}</div>
                    </td>
                    <td className="py-4">{teacher.department_id}</td>
                    <td className="py-4">{teacher.contact_number}</td>
                    <td className="py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          teacher.status === "Active"
                            ? "bg-green-100 text-green-700"
                            : teacher.status === "Inactive"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {teacher.status}
                      </span>
                    </td>
                    <td className="py-4 font-semibold">{teacher.role_id}</td>
                    <td className="py-4 text-right">
                      <div className="flex justify-end gap-3 items-center">
                        <button
                          disabled={passwordRequestingId !== null}
                          onClick={() => handleSetPasswordClick(teacher)}
                          className="text-indigo-600 hover:text-indigo-900 text-sm font-medium disabled:opacity-40 transition-colors"
                        >
                          {passwordRequestingId === teacher.teacher_id ? "Sending..." : "Set Password"}
                        </button>
                        <span className="text-gray-200">|</span>
                        <button
                          disabled={passwordRequestingId !== null}
                          onClick={() => handleEditClick(teacher)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium disabled:opacity-40 transition-colors"
                        >
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {sortedTeachers.length === 0 && (
              <div className="text-center py-10 text-gray-500 italic">
                No faculty members match your search or filter.
              </div>
            )}

            {/* Pagination Controls */}
            {sortedTeachers.length > 0 && (
              <div className="mt-6 flex flex-col sm:flex-row items-center justify-between border-t border-gray-200 pt-4 gap-4 text-sm text-gray-600">
                <div>
                  Showing{" "}
                  <span className="font-medium text-gray-800">
                    {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, sortedTeachers.length)}
                  </span>{" "}
                  to{" "}
                  <span className="font-medium text-gray-800">
                    {Math.min(currentPage * ITEMS_PER_PAGE, sortedTeachers.length)}
                  </span>{" "}
                  of <span className="font-medium text-gray-800">{sortedTeachers.length}</span> results
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 rounded-md border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    Previous
                  </button>

                  {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
                        currentPage === page
                          ? "bg-blue-600 text-white"
                          : "text-gray-700 border border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 rounded-md border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <FacultyModal
        isOpen={isModalOpen}
        teacher={selectedTeacher}
        onClose={handleCloseModal}
        onSave={handleSaveTeacher}
      />
    </div>
  );
}