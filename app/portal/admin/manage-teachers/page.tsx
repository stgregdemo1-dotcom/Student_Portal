"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";

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
  archived?: boolean;
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
    <div className="portal-modal-backdrop fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="mb-4 flex items-center justify-between border-b pb-3">
          <h3 className="text-xl font-semibold text-gray-800">
            {isEditMode ? "Edit Faculty Details" : "Add New Faculty"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="admin-modal-close text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
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
              className="admin-cancel-button rounded-lg border border-gray-200 bg-transparent px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
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
  const [statusFilter, setStatusFilter] = useState("");
  const [archiveFilter, setArchiveFilter] = useState<"current" | "archived" | "all">("current");
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [teacherArchiveAction, setTeacherArchiveAction] = useState<{ teacher: Teacher; archive: boolean } | null>(null);
  const [archiveUsername, setArchiveUsername] = useState("");
  const [archivePassword, setArchivePassword] = useState("");
  const [archiveError, setArchiveError] = useState("");
  const [isArchiving, setIsArchiving] = useState(false);
  const [passwordRequestingId, setPasswordRequestingId] = useState<string | null>(null);
  const [teacherToSendPassword, setTeacherToSendPassword] = useState<Teacher | null>(null);
  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [passwordRequestError, setPasswordRequestError] = useState("");
  const [sortField, setSortField] = useState<keyof Teacher | "faculty_name">("teacher_id");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

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

  const departmentOptions = useMemo(() => {
    const deps = teachers
      .map((t) => t.department_id)
      .filter((dept): dept is string => Boolean(dept));
    return Array.from(new Set(deps)).sort();
  }, [teachers]);

  const statusOptions = useMemo(() => {
    const statuses = teachers
      .map((teacher) => teacher.status?.trim())
      .filter((status): status is string => Boolean(status));
    return Array.from(new Map(statuses.map((status) => [status.toLowerCase(), status])).values())
      .sort((a, b) => a.localeCompare(b));
  }, [teachers]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, departmentFilter, statusFilter, archiveFilter]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleDepartmentFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDepartmentFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  const openTeacherArchiveDialog = (teacher: Teacher, archive: boolean) => {
    setTeacherArchiveAction({ teacher, archive });
    setArchiveError("");
    setArchiveUsername("");
    setArchivePassword("");
  };

  const closeTeacherArchiveDialog = () => {
    if (isArchiving) return;
    setTeacherArchiveAction(null);
    setArchiveUsername("");
    setArchivePassword("");
    setArchiveError("");
  };

  const handleTeacherArchiveAction = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!teacherArchiveAction) return;

    setIsArchiving(true);
    setArchiveError("");
    try {
      const response = await fetch("/api/portal/admin?table=teachers", {
        method: teacherArchiveAction.archive ? "DELETE" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teacher_id: teacherArchiveAction.teacher.teacher_id,
          username: archiveUsername.trim(),
          password: archivePassword,
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        setArchiveError(result.message || `Could not ${teacherArchiveAction.archive ? "archive" : "restore"} the teacher.`);
        return;
      }

      setTeachers((current) => current.map((teacher) =>
        teacher.teacher_id === teacherArchiveAction.teacher.teacher_id
          ? { ...teacher, archived: teacherArchiveAction.archive }
          : teacher
      ));
      setTeacherArchiveAction(null);
      setArchiveUsername("");
      setArchivePassword("");
    } catch (error) {
      console.error("Teacher archive request failed:", error);
      setArchiveError(`Could not ${teacherArchiveAction.archive ? "archive" : "restore"} the teacher because of a network or server error.`);
    } finally {
      setIsArchiving(false);
    }
  };

  const handleSetPasswordClick = useCallback((teacher: Teacher) => {
    setTeacherToSendPassword(teacher);
    setAdminUsername("");
    setAdminPassword("");
    setPasswordRequestError("");
  }, []);

  const closePasswordConfirmation = useCallback(() => {
    if (passwordRequestingId) return;
    setTeacherToSendPassword(null);
    setAdminUsername("");
    setAdminPassword("");
    setPasswordRequestError("");
  }, [passwordRequestingId]);

  const handlePasswordConfirmation = useCallback(async (event: React.FormEvent) => {
    event.preventDefault();
    if (!teacherToSendPassword) return;
    setPasswordRequestingId(teacherToSendPassword.teacher_id);
    try {
      const res = await fetch("/api/portal/admin/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teacher_id: teacherToSendPassword.teacher_id,
          username: adminUsername.trim(),
          password: adminPassword,
        }),
      });

      if (res.ok) {
        alert("The secure initialization setup password email has been sent successfully!");
        setTeacherToSendPassword(null);
        setAdminUsername("");
        setAdminPassword("");
      } else {
        const errData = await res.json();
        setPasswordRequestError(errData.message || "Failed to send the password setup email.");
      }
    } catch (error) {
      console.error("Password link dispatch error:", error);
      setPasswordRequestError("Could not send the setup email because of a network or server error.");
    } finally {
      setPasswordRequestingId(null);
    }
  }, [teacherToSendPassword, adminUsername, adminPassword]);

  const handleSort = useCallback((field: keyof Teacher | "faculty_name") => {
    setCurrentPage(1); 
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
      const matchesStatus = statusFilter
        ? t.status?.trim().toLowerCase() === statusFilter.toLowerCase()
        : true;
      const matchesArchive = archiveFilter === "all"
        || (archiveFilter === "archived" ? Boolean(t.archived) : !t.archived);

      return matchesSearch && matchesDepartment && matchesStatus && matchesArchive;
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
  }, [teachers, searchQuery, departmentFilter, statusFilter, archiveFilter, sortField, sortDirection]);

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

          <select
            value={statusFilter}
            onChange={handleStatusFilterChange}
            className="w-full sm:w-40 py-2 px-3 text-sm border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Filter by employment status"
          >
            <option value="">All Statuses</option>
            {statusOptions.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>

          <select
            value={archiveFilter}
            onChange={(event) => {
              setArchiveFilter(event.target.value as "current" | "archived" | "all");
              setCurrentPage(1);
            }}
            className="w-full sm:w-40 py-2 px-3 text-sm border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Filter archived teachers"
          >
            <option value="current">Current Teachers</option>
            <option value="archived">Archived</option>
            <option value="all">All Teachers</option>
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
            <table className="w-full min-w-[1100px] table-fixed border-separate border-spacing-0 text-left">
              <colgroup>
                <col className="w-[10%]" />
                <col className="w-[17%]" />
                <col className="w-[18%]" />
                <col className="w-[12%]" />
                <col className="w-[8%]" />
                <col className="w-[10%]" />
                <col className="w-[25%]" />
              </colgroup>
              <thead>
                <tr className="select-none bg-slate-50 text-xs uppercase text-gray-500">
                  <th className="border-b border-r border-slate-200 px-3 py-3 cursor-pointer hover:text-blue-600 transition" onClick={() => handleSort("teacher_id")}>
                    Teacher ID {renderSortArrow("teacher_id")}
                  </th>
                  <th className="border-b border-r border-slate-200 px-3 py-3 cursor-pointer hover:text-blue-600 transition" onClick={() => handleSort("faculty_name")}>
                    Faculty Name {renderSortArrow("faculty_name")}
                  </th>
                  <th className="border-b border-r border-slate-200 px-3 py-3 cursor-pointer hover:text-blue-600 transition" onClick={() => handleSort("department_id")}>
                    Department {renderSortArrow("department_id")}
                  </th>
                  <th className="border-b border-r border-slate-200 px-3 py-3 cursor-pointer hover:text-blue-600 transition" onClick={() => handleSort("contact_number")}>
                    Contact {renderSortArrow("contact_number")}
                  </th>
                  <th className="border-b border-r border-slate-200 px-3 py-3 cursor-pointer hover:text-blue-600 transition" onClick={() => handleSort("status")}>
                    Status {renderSortArrow("status")}
                  </th>
                  <th className="border-b border-r border-slate-200 px-3 py-3 cursor-pointer hover:text-blue-600 transition" onClick={() => handleSort("role_id")}>
                    Role {renderSortArrow("role_id")}
                  </th>
                  <th className="border-b border-slate-200 px-3 py-3 text-right">Actions</th>
                </tr>
              </thead>

              <tbody>
                {paginatedTeachers.map((teacher) => (
                  <tr key={teacher.teacher_id} className="transition-colors hover:bg-blue-50/50">
                    <td className="border-b border-r border-slate-200 px-3 py-4 font-mono text-gray-600">{teacher.teacher_id}</td>
                    <td className="border-b border-r border-slate-200 px-3 py-4">
                      <div className="font-semibold">
                        {teacher.prefix} {teacher.first_name} {teacher.last_name}
                      </div>
                      <div className="text-xs text-gray-500">{teacher.email_address}</div>
                    </td>
                    <td className="border-b border-r border-slate-200 px-3 py-4 break-words">{teacher.department_id}</td>
                    <td className="border-b border-r border-slate-200 px-3 py-4">{teacher.contact_number}</td>
                    <td className="border-b border-r border-slate-200 px-3 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          teacher.archived
                            ? "bg-slate-100 text-slate-700"
                            : teacher.status?.toLowerCase() === "active"
                            ? "bg-green-100 text-green-700"
                            : teacher.status?.toLowerCase() === "inactive"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {teacher.archived ? "Archived" : teacher.status}
                      </span>
                    </td>
                    <td className="border-b border-r border-slate-200 px-3 py-4 font-semibold break-words">{teacher.role_id}</td>
                    <td className="border-b border-slate-200 px-3 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 whitespace-nowrap">
                        {teacher.archived ? (
                          <button
                            type="button"
                            onClick={() => openTeacherArchiveDialog(teacher, false)}
                            className="teacher-edit-button"
                          >
                            Restore
                          </button>
                        ) : (
                          <>
                            <button
                              disabled={passwordRequestingId !== null}
                              onClick={() => handleSetPasswordClick(teacher)}
                              className="teacher-action-button"
                            >
                              {passwordRequestingId === teacher.teacher_id ? "Sending..." : "Set Password"}
                            </button>
                            <span className="text-gray-200">|</span>
                            <button
                              disabled={passwordRequestingId !== null}
                              onClick={() => handleEditClick(teacher)}
                              className="teacher-edit-button"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              disabled={passwordRequestingId !== null}
                              onClick={() => openTeacherArchiveDialog(teacher, true)}
                              className="admin-subject-delete-button"
                            >
                              Archive
                            </button>
                          </>
                        )}
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
      {teacherArchiveAction && (
        <div
          className="portal-modal-backdrop fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeTeacherArchiveDialog();
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="archive-teacher-title"
            className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
          >
            <h2 id="archive-teacher-title" className="text-xl font-semibold text-gray-800">
              {teacherArchiveAction.archive ? "Archive teacher?" : "Restore teacher?"}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {teacherArchiveAction.archive
                ? "This hides the teacher from the current list but keeps the record so it can be restored later: "
                : "This makes the teacher visible in the current list again: "}
              <span className="font-semibold text-gray-800">
                {teacherArchiveAction.teacher.prefix} {teacherArchiveAction.teacher.first_name} {teacherArchiveAction.teacher.last_name}
              </span>
            </p>
            <form onSubmit={handleTeacherArchiveAction} className="mt-5 space-y-4">
              <div>
                <label htmlFor="archive-teacher-admin-username" className="mb-1 block text-sm font-medium text-gray-700">
                  Admin username
                </label>
                <input
                  id="archive-teacher-admin-username"
                  type="text"
                  autoComplete="username"
                  required
                  value={archiveUsername}
                  onChange={(event) => setArchiveUsername(event.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-800 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="archive-teacher-admin-password" className="mb-1 block text-sm font-medium text-gray-700">
                  Admin password
                </label>
                <input
                  id="archive-teacher-admin-password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={archivePassword}
                  onChange={(event) => setArchivePassword(event.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-800 focus:border-blue-500 focus:outline-none"
                />
              </div>
              {archiveError && <p role="alert" className="text-sm font-medium text-red-700">{archiveError}</p>}
              <div className="flex justify-end gap-3 border-t pt-4">
                <button
                  type="button"
                  disabled={isArchiving}
                  onClick={closeTeacherArchiveDialog}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isArchiving}
                  className="rounded-lg bg-[#0B3763] px-4 py-2 text-sm font-medium text-white hover:bg-[#06264A] disabled:opacity-50"
                >
                  {isArchiving
                    ? (teacherArchiveAction.archive ? "Archiving…" : "Restoring…")
                    : (teacherArchiveAction.archive ? "Confirm archive" : "Confirm restore")}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
      {teacherToSendPassword && (
        <div
          className="portal-modal-backdrop fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closePasswordConfirmation();
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-teacher-password-title"
            className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
          >
            <h2 id="confirm-teacher-password-title" className="text-lg font-bold text-slate-900">
              Confirm it’s you
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Verify your admin account to send a password setup link to{" "}
              <span className="font-semibold text-slate-900">
                {teacherToSendPassword.prefix} {teacherToSendPassword.first_name} {teacherToSendPassword.last_name}
              </span>.
            </p>
            <form onSubmit={handlePasswordConfirmation} className="mt-5 space-y-4">
              <div>
                <label htmlFor="teacher-action-admin-username" className="mb-1 block text-sm font-medium text-slate-700">
                  Admin username
                </label>
                <input
                  id="teacher-action-admin-username"
                  type="text"
                  autoComplete="username"
                  required
                  value={adminUsername}
                  onChange={(event) => setAdminUsername(event.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="teacher-action-admin-password" className="mb-1 block text-sm font-medium text-slate-700">
                  Admin password
                </label>
                <input
                  id="teacher-action-admin-password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={adminPassword}
                  onChange={(event) => setAdminPassword(event.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-blue-500 focus:outline-none"
                />
              </div>
              {passwordRequestError && (
                <p role="alert" className="text-sm font-medium text-red-700">{passwordRequestError}</p>
              )}
              <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
                <button
                  type="button"
                  disabled={passwordRequestingId !== null}
                  onClick={closePasswordConfirmation}
                  className="admin-cancel-button rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={passwordRequestingId !== null}
                  className="rounded-lg bg-[#0B3763] px-4 py-2 text-sm font-semibold text-white hover:bg-[#06264A] disabled:opacity-50"
                >
                  {passwordRequestingId ? "Sending…" : "Verify & send link"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
