"use client";

import { useState, useEffect } from "react";

interface MappedSubject {
  subject_id: string;
  sched_code: string; // From backend aggregation join pipeline
  teacher_id: string;
  grade_1: string; 
  grade_2: string; 
  grade_3: string; 
  grade_4: string; 
  remarks: string;
  status: string;
}

interface MappedStudentRow {
  id: string;              
  student_id: string;      
  year: string;            
  semester: string;        
  section: string;         
  subjects: MappedSubject[];
}

export default function GradesManagementPage() {
  const [records, setRecords] = useState<MappedStudentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSemester, setActiveSemester] = useState<string>("1"); 
  const [activeSectionFilter, setActiveSectionFilter] = useState<string>("All Sections");

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<MappedStudentRow | null>(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
  const [expandedStudents, setExpandedStudents] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function fetchStudentSections() {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch("/api/portal/registrar?table=student_section");
        if (!response.ok) {
          throw new Error("Failed to fetch records from student_section collection");
        }
        
        const data = await response.json();
        const rawRows = Array.isArray(data) ? data : data.data || [];
        setRecords(rawRows);
      } catch (err: any) {
        setError(err.message || "An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    }

    fetchStudentSections();
  }, []);

  const computeFinalGradeAndRemarks = (g1: string, g2: string, g3: string, g4: string) => {
    const p = g1 ? Number(g1) : NaN;
    const m = g2 ? Number(g2) : NaN;
    const pf = g3 ? Number(g3) : NaN;
    const f = g4 ? Number(g4) : NaN;

    if (isNaN(p) || isNaN(m) || isNaN(pf) || isNaN(f)) {
      return { finalAvg: "—" };
    }

    const avg = Math.round((p + m + pf + f) / 4);
    return { finalAvg: String(avg) };
  };

  const handleOpenGradeModal = (record: MappedStudentRow, subId: string) => {
    setSelectedRecord(JSON.parse(JSON.stringify(record)));
    setSelectedSubjectId(subId);
    setIsEditModalOpen(true);
  };

  const handleGradeInputChange = (termField: "grade_1" | "grade_2" | "grade_3" | "grade_4", value: string) => {
    if (!selectedRecord) return;

    const updatedSubjects = selectedRecord.subjects.map((sub) => {
      if (sub.subject_id !== selectedSubjectId) return sub;
      return { ...sub, [termField]: value };
    });

    setSelectedRecord({ ...selectedRecord, subjects: updatedSubjects });
  };

  // 🚀 NEW: Dedicated method to manage changes to the drop-down remarks separately
  const handleRemarksInputChange = (value: string) => {
    if (!selectedRecord) return;

    const updatedSubjects = selectedRecord.subjects.map((sub) => {
      if (sub.subject_id !== selectedSubjectId) return sub;
      return { ...sub, remarks: value };
    });

    setSelectedRecord({ ...selectedRecord, subjects: updatedSubjects });
  };

  const handleSaveGrades = async () => {
    if (!selectedRecord) return;

    try {
      const response = await fetch(`/api/portal/registrar?table=student_section&id=${selectedRecord.student_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(selectedRecord),
      });

      if (!response.ok) throw new Error("Failed to save changes to student_section.");

      setRecords((prevRecords) =>
        prevRecords.map((item) => 
          item.student_id === selectedRecord.student_id && 
          item.year === selectedRecord.year && 
          item.semester === selectedRecord.semester 
            ? selectedRecord 
            : item
        )
      );
      
      setIsEditModalOpen(false);
    } catch (err) {
      alert("Error saving your grade matrices modifications back to DB.");
    }
  };

  const getUniqueKey = (row: MappedStudentRow) => `${row.student_id}-${row.year}-${row.semester}`;
  const toggleExpandStudent = (uniqueKey: string) => {
    setExpandedStudents((prev) => ({ ...prev, [uniqueKey]: !prev[uniqueKey] }));
  };

  const filteredRecords = records.filter((row) => {
    const matchesSearch = row.student_id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSemester = row.semester === activeSemester;
    const matchesSection = activeSectionFilter === "All Sections" || row.section === activeSectionFilter;
    return matchesSearch && matchesSemester && matchesSection;
  });

  const uniqueSections = Array.from(new Set(records.map((r) => r.section))).filter(Boolean);
  const getEditingSubject = () => {
    if (!selectedRecord) return null;
    return selectedRecord.subjects.find((s) => s.subject_id === selectedSubjectId);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-sm font-semibold text-gray-500">Syncing Student Sections Ledger Matrix...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-sm font-semibold text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Grades Management Module</h1>
            <p className="text-xs text-gray-500">Cross-referencing schedule codes seamlessly via system database joins.</p>
          </div>
        </div>

        {/* Global Toolbar Filter Control Block */}
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-3 w-full md:max-w-xl">
            <input
              type="text"
              placeholder="Search by Student ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-lg px-4 py-2 bg-gray-50/50 outline-none focus:border-indigo-400 font-medium text-gray-800"
            />
            <select
              value={activeSectionFilter}
              onChange={(e) => setActiveSectionFilter(e.target.value)}
              className="w-full sm:w-48 text-xs font-semibold border border-gray-200 rounded-lg px-3 py-2 bg-gray-50/50 outline-none focus:border-indigo-400 text-gray-700 h-[38px]"
            >
              <option value="All Sections">All Sections</option>
              {uniqueSections.map((sec) => (
                <option key={sec} value={sec}>{sec}</option>
              ))}
            </select>
          </div>

          <div className="flex border-b border-gray-100 w-full md:w-auto justify-start md:justify-end gap-4">
            <button
              onClick={() => setActiveSemester("1")}
              className={`text-xs pb-2 font-bold tracking-wide transition-all border-b-2 ${activeSemester === "1" ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-400"}`}
            >
              1st Semester
            </button>
            <button
              onClick={() => setActiveSemester("2")}
              className={`text-xs pb-2 font-bold tracking-wide transition-all border-b-2 ${activeSemester === "2" ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-400"}`}
            >
              2nd Semester
            </button>
          </div>
        </div>

        {/* Core Records Data Rendering Grid Table Element */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/70 border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  <th className="p-4">Student ID</th>
                  <th className="p-4">Section / School Year</th>
                  <th className="p-4">Schedule Code</th>
                  <th className="p-4 text-center">Prelim (G1)</th>
                  <th className="p-4 text-center">Midterm (G2)</th>
                  <th className="p-4 text-center">Pre-Finals (G3)</th>
                  <th className="p-4 text-center">Finals (G4)</th>
                  <th className="p-4 text-center text-indigo-600 font-extrabold bg-indigo-50/30">Average</th>
                  <th className="p-4 text-center">Remarks</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filteredRecords.length > 0 ? (
                  filteredRecords.map((row) => {
                    const uniqueRowKey = getUniqueKey(row);
                    const hasSubjects = row.subjects && row.subjects.length > 0;
                    const isExpanded = !!expandedStudents[uniqueRowKey];
                    
                    const displayedSubjects = !hasSubjects 
                      ? [] 
                      : isExpanded 
                        ? row.subjects 
                        : [row.subjects[0]];

                    return displayedSubjects.map((subject, sIdx) => {
                      const calculations = computeFinalGradeAndRemarks(
                        subject.grade_1, subject.grade_2, subject.grade_3, subject.grade_4
                      );

                      return (
                        <tr key={`${uniqueRowKey}-${subject.subject_id}`} className="hover:bg-gray-50/40 transition-colors group">
                          {sIdx === 0 && (
                            <td className="p-4 align-top border-r border-gray-100/70" rowSpan={displayedSubjects.length}>
                              <p className="font-bold text-gray-800">{row.student_id}</p>
                              {hasSubjects && row.subjects.length > 1 && (
                                <button
                                  onClick={() => toggleExpandStudent(uniqueRowKey)}
                                  className="text-[10px] mt-2 block font-bold text-slate-500 hover:text-indigo-600 bg-slate-100 px-2 py-1 rounded"
                                >
                                  {isExpanded ? "▲ Hide Contexts" : `▼ View All (${row.subjects.length})`}
                                </button>
                              )}
                            </td>
                          )}
                          {sIdx === 0 && (
                            <td className="p-4 align-top border-r border-gray-100/70 font-semibold text-gray-600" rowSpan={displayedSubjects.length}>
                              <p className="text-xs font-bold text-indigo-950 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded w-max">{row.section}</p>
                              <p className="text-[10px] mt-1 text-gray-400 font-mono">SY: {row.year}</p>
                            </td>
                          )}
                          <td className="p-4 font-mono text-xs font-bold text-indigo-600 bg-indigo-50/10 uppercase">
                            {subject.sched_code || "N/A"}
                          </td>
                          <td className="p-4 text-center font-medium text-gray-800">
                            {subject.grade_1 || "—"}
                          </td>
                          <td className="p-4 text-center font-medium text-gray-800">
                            {subject.grade_2 || "—"}
                          </td>
                          <td className="p-4 text-center font-medium text-gray-800">
                            {subject.grade_3 || "—"}
                          </td>
                          <td className="p-4 text-center font-medium text-gray-800">
                            {subject.grade_4 || "—"}
                          </td>
                          <td className="p-4 text-center font-black text-indigo-700 bg-indigo-50/20">
                            {calculations.finalAvg}
                          </td>
                          {/* Main Row Display for Remarks */}
                          <td className="p-4 text-center">
                            <span className={`text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded-md ${
                              subject.remarks === "Passed" ? "bg-green-100 text-green-700" :
                              subject.remarks === "Failed" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-400"
                            }`}>
                              {subject.remarks || "—"}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => handleOpenGradeModal(row, subject.subject_id)}
                              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50/0 group-hover:bg-indigo-50 px-2.5 py-1 rounded transition-colors"
                            >
                              Edit Term Grades
                            </button>
                          </td>
                        </tr>
                      );
                    });
                  })
                ) : (
                  <tr>
                    <td colSpan={10} className="text-center p-8 text-gray-400 text-xs italic">
                      No matching historical section records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Dynamic Overlay Modal Dialog */}
      {isEditModalOpen && selectedRecord && getEditingSubject() && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-gray-100 max-w-md w-full overflow-hidden space-y-4">
            
            <div className="bg-gradient-to-r from-purple-600 to-indigo-700 p-4 text-white">
              <h2 className="text-md font-bold">Update Academic Performance Metrics</h2>
              <p className="text-xs opacity-90">Student Reference ID: <span className="font-mono font-bold text-yellow-200">{selectedRecord.student_id}</span></p>
              <p className="text-[11px] opacity-80 mt-0.5">Sched Code: <span className="font-mono font-bold text-yellow-300">{getEditingSubject()?.sched_code}</span> | Section: {selectedRecord.section}</p>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Prelim (G1)</label>
                  <input
                    type="text"
                    value={getEditingSubject()?.grade_1 ?? ""}
                    onChange={(e) => handleGradeInputChange("grade_1", e.target.value)}
                    className="w-full font-semibold text-gray-800 text-sm border border-gray-200 rounded px-2 py-1.5 bg-gray-50/50 outline-none focus:border-indigo-400"
                    placeholder="0-100"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Midterm (G2)</label>
                  <input
                    type="text"
                    value={getEditingSubject()?.grade_2 ?? ""}
                    onChange={(e) => handleGradeInputChange("grade_2", e.target.value)}
                    className="w-full font-semibold text-gray-800 text-sm border border-gray-200 rounded px-2 py-1.5 bg-gray-50/50 outline-none focus:border-indigo-400"
                    placeholder="0-100"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Pre-Finals (G3)</label>
                  <input
                    type="text"
                    value={getEditingSubject()?.grade_3 ?? ""}
                    onChange={(e) => handleGradeInputChange("grade_3", e.target.value)}
                    className="w-full font-semibold text-gray-800 text-sm border border-gray-200 rounded px-2 py-1.5 bg-gray-50/50 outline-none focus:border-indigo-400"
                    placeholder="0-100"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Finals (G4)</label>
                  <input
                    type="text"
                    value={getEditingSubject()?.grade_4 ?? ""}
                    onChange={(e) => handleGradeInputChange("grade_4", e.target.value)}
                    className="w-full font-semibold text-gray-800 text-sm border border-gray-200 rounded px-2 py-1.5 bg-gray-50/50 outline-none focus:border-indigo-400"
                    placeholder="0-100"
                  />
                </div>
              </div>

              {(() => {
                const sub = getEditingSubject();
                const calc = sub ? computeFinalGradeAndRemarks(sub.grade_1, sub.grade_2, sub.grade_3, sub.grade_4) : { finalAvg: "—" };
                return (
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 grid grid-cols-2 gap-4 items-center">
                    <div className="text-center">
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Computed Gen Average</p>
                      <p className="text-lg font-black text-indigo-700">{calc.finalAvg}</p>
                    </div>
                    {/* 🚀 MODIFIED: The Evaluation field is now an interactive input drop-down selector */}
                    <div className="flex flex-col text-left">
                      <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">Evaluation Result</label>
                      <select
                        value={sub?.remarks || ""}
                        onChange={(e) => handleRemarksInputChange(e.target.value)}
                        className="w-full font-bold text-xs border border-gray-200 rounded-lg p-2 bg-white outline-none focus:border-indigo-400 text-gray-700 h-[34px] cursor-pointer"
                      >
                        <option value="">Select Options</option>
                        <option value="Passed">Passed</option>
                        <option value="Failed">Failed</option>
                      </select>
                    </div>
                  </div>
                );
              })()}
            </div>

            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-2 border-t border-gray-100">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="bg-gray-200 text-gray-700 py-1.5 px-4 rounded-lg hover:bg-gray-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveGrades}
                className="bg-indigo-600 text-white py-1.5 px-4 rounded-lg hover:bg-indigo-700 text-xs font-semibold shadow-sm"
              >
                Save Performance Summary
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}