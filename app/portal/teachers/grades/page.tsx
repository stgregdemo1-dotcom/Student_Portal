"use client";
import React, { useState, useEffect } from 'react';
// ==========================================
// HOW TO APPLY TO OTHER PAGES (Step 1):
// Import your custom useAuthGuard hook at the top.
// Ensure the import path matches your project structure (e.g. "@/hooks/useAuthGuard").
// ==========================================
import { useAuthGuard } from '@/app/hooks/useAuthGuard';

interface Schedule {
  sched_code: string;
  subject_id: string;
  status?: string;
}

interface RosterStudent {
  student_id: string;
  grades: number[];
  remarks: string;
}

function getAutomaticRemark(grades: Array<number | string>): string {
  const numericGrades = grades
    .slice(0, 2)
    .map(Number)
    .filter((grade) => Number.isFinite(grade) && grade > 0);

  if (numericGrades.length === 0) return "";

  const average = numericGrades.reduce((sum, grade) => sum + grade, 0) / numericGrades.length;
  return average >= 75 ? "Passed" : "Failed";
}

const GradingSheet = () => {
  // ==========================================
  // HOW TO APPLY TO OTHER PAGES (Step 2):
  // Call useAuthGuard at the top of your component body.
  // - requiredPrefix: "TCH" restricts access strictly to teacher accounts. 
  //   (Change to "ST" for student pages, "ADM" for admin, etc.)
  // - redirectTo: Specifies where unauthorized users get sent automatically.
  // - We alias username as teacherId to preserve your existing code variable names.
  // ==========================================
  const { username: teacherId, isAuthenticated, loading: authLoading } = useAuthGuard({
    requiredPrefix: "TCH",
    redirectTo: "/portal/log-in",
  });

  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [selectedCode, setSelectedCode] = useState<string>("");
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [grades, setGrades] = useState<{ [key: string]: (number | string)[] }>({});
  const [initialGradesBackup, setInitialGradesBackup] = useState<{ [key: string]: (number | string)[] }>({});
  const [rosterList, setRosterList] = useState<RosterStudent[]>([]);
  const [dataLoading, setDataLoading] = useState<boolean>(true);
  const [canSubmitFinal, setCanSubmitFinal] = useState<boolean>(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Fetch configuration settings (Only runs after authentication verification succeeds)
  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchConfig = async () => {
      try {
        const res = await fetch('/api/portal/teacher?action=config&id=system');
        const data = await res.json();
        if (data && typeof data.submit_final_grade === 'boolean') {
          setCanSubmitFinal(data.submit_final_grade);
        }
      } catch (err) {
        console.error("Failed to fetch grading system configuration:", err);
      }
    };
    fetchConfig();
  }, [isAuthenticated]);

  const fetchSchedules = async () => {
    if (!teacherId || !isAuthenticated) return;
    try {
      setDataLoading(true);
      const response = await fetch(`/api/portal/teacher?table=subjects&id=${teacherId}&action=subjects`);
      const result = await response.json();
      if (result && result.subjects) {
        setSchedules(result.subjects);
      }
    } catch (error) {
      console.error("Error grabbing active rosters:", error);
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && teacherId) {
      fetchSchedules();
    }
  }, [teacherId, isAuthenticated]);

  useEffect(() => {
    if (selectedCode || typeof window === "undefined") return;
    const requestedScheduleCode = new URLSearchParams(window.location.search).get("sched_code");
    if (requestedScheduleCode && schedules.some((schedule) => schedule.sched_code === requestedScheduleCode)) {
      setSelectedCode(requestedScheduleCode);
    }
  }, [schedules, selectedCode]);

  const activeClass = schedules.find(s => s.sched_code === selectedCode);

  const loadRosterData = async () => {
    if (!selectedCode || !activeClass) {
      setRosterList([]);
      return;
    }

    try {
      const response = await fetch(`/api/portal/teacher?table=student_section&id=${activeClass.subject_id}&action=students`);
      const data = await response.json();
      if (data && data.students) {
        const sortedStudents = [...data.students].sort((a, b) =>
          (a.student_id || "").localeCompare(b.student_id || "")
        );

        setRosterList(sortedStudents);

        const initialGradesMap: { [key: string]: (number | string)[] } = {};
        sortedStudents.forEach((std: any) => {
          const studentGrades = [std.grades[0] || 0, std.grades[1] || 0];
          initialGradesMap[std.student_id] = [
            ...studentGrades,
            getAutomaticRemark(studentGrades),
          ];
        });
        setGrades(initialGradesMap);
        setInitialGradesBackup(initialGradesMap);
      }
    } catch (err) {
      console.error("Error loading student rows:", err);
    }
  };

  useEffect(() => {
    loadRosterData();
  }, [selectedCode, activeClass]);

  const updateGradeState = (studentId: string, colIndex: number, val: number | string) => {
    if (activeClass?.status === "Evaluating") return;
    setGrades(prev => {
      const studentGrades = prev[studentId] || [0, 0, ""];
      const newGrades = [...studentGrades];
      newGrades[colIndex] = val;
      if (colIndex < 2) {
        newGrades[2] = getAutomaticRemark(newGrades.slice(0, 2));
      }
      return { ...prev, [studentId]: newGrades };
    });
  };

  const handleGradeChange = (studentId: string, colIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (activeClass?.status === "Evaluating") return;
    const rawValue = e.target.value;
    if (rawValue === "") {
      updateGradeState(studentId, colIndex, 0);
      return;
    }
    const value = parseInt(rawValue, 10);
    const finalValue = value > 100 ? 100 : isNaN(value) ? 0 : value;
    updateGradeState(studentId, colIndex, finalValue);
  };

  const validateMin = (studentId: string, colIndex: number, e: React.FocusEvent<HTMLInputElement>) => {
    if (activeClass?.status === "Evaluating") return;
    const value = parseInt(e.target.value, 10);
    if (value < 60 || isNaN(value)) {
      updateGradeState(studentId, colIndex, 60);
    }
  };

  const handleDraftSave = async () => {
    await executeFinalSubmission(false);
  };

  const handleCancelEdit = () => {
    setGrades(initialGradesBackup);
    setIsEditing(false);
  };

  const executeFinalSubmission = async (isFinal: boolean = true) => {
    if (!selectedCode || !activeClass || activeClass.status === "Evaluating") return;

    try {
      setSubmitting(true);
      const formattedGrades = Object.keys(grades).reduce((acc, studentId) => {
        const studentGrades = grades[studentId];

        acc[studentId] = [
          studentGrades[0] || 0,
          studentGrades[1] || 0,
          getAutomaticRemark(studentGrades.slice(0, 2))
        ];
        return acc;
      }, {} as { [key: string]: (number | string)[] });

      const payload = {
        scheduleCode: activeClass.subject_id,
        grades: formattedGrades,
        isDraft: !isFinal
      };

      const response = await fetch('/api/portal/teacher?table=student_section', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (!response.ok) {
        console.error("Failed to update grades:", data.message);
        alert(`Error: ${data.message}`);
      } else {
        setIsEditing(false);
        setIsConfirmOpen(false);

        if (isFinal) {
          setSelectedCode("");
          setRosterList([]);
          setGrades({});
          setInitialGradesBackup({});
          await fetchSchedules();
        } else {
          const refreshResponse = await fetch(`/api/portal/teacher?table=student_section&id=${activeClass.subject_id}&action=students`);
          const refreshData = await refreshResponse.json();
          if (refreshData && refreshData.students) {
            const sortedRefreshed = [...refreshData.students].sort((a, b) =>
              (a.student_id || "").localeCompare(b.student_id || "")
            );
            setRosterList(sortedRefreshed);

            const updatedGradesMap: { [key: string]: (number | string)[] } = {};
            sortedRefreshed.forEach((std: any) => {
              const studentGrades = [std.grades[0] || 0, std.grades[1] || 0];
              updatedGradesMap[std.student_id] = [
                ...studentGrades,
                getAutomaticRemark(studentGrades),
              ];
            });
            setGrades(updatedGradesMap);
            setInitialGradesBackup(updatedGradesMap);
          }
        }
      }
    } catch (err: any) {
      console.error("Critical submission payload error:", err);
      alert("Network Error: Could not connect to the grading gateway pipeline.");
    } finally {
      setSubmitting(false);
    }
  };

  const allStudentsHaveRemarks = rosterList.length > 0 && rosterList.every(student => {
    const studentGradesMap = grades[student.student_id];
    return studentGradesMap ? getAutomaticRemark(studentGradesMap.slice(0, 2)) !== "" : false;
  });

  const isSubjectActive = activeClass?.status === "Active";
  const isEvaluating = activeClass?.status === "Evaluating";

  // ==========================================
  // HOW TO APPLY TO OTHER PAGES (Step 3):
  // Render a clean loading screen while verifying credentials.
  // ==========================================
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 font-sans">
        <div className="text-center space-y-3">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-[#0B3763] border-t-transparent"></div>
          <p className="text-sm font-bold text-[#856404]">Verifying Security Credentials...</p>
        </div>
      </div>
    );
  }

  // ==========================================
  // HOW TO APPLY TO OTHER PAGES (Step 4):
  // Prevent flashing or unauthorized rendering if validation fails.
  // ==========================================
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4 font-sans relative">
      <div className="mx-auto w-full max-w-none">

        {/* Header Section */}
        <div className="bg-white border-t-4 border-[#FFD700] p-6 rounded-xl shadow-md mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-[#856404] tracking-tight">Grading Management</h1>
            <p className="text-gray-500 font-medium italic">School Year 2026-2027</p>
            <p className="text-xs text-[#0B3763] font-bold mt-1">Logged in as: {teacherId}</p>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={selectedCode}
              onChange={(e) => {
                setSelectedCode(e.target.value);
                setIsEditing(false);
              }}
              className="bg-gray-50 border-2 border-[#FFD700] text-gray-700 text-sm rounded-lg focus:ring-[#FFD700] block p-2.5 outline-none font-bold cursor-pointer"
            >
              <option value="">Choose Schedule Code</option>
              {schedules.map(s => <option key={s.sched_code} value={s.sched_code}>{s.sched_code}</option>)}
            </select>

            {activeClass && (
              <div className="flex items-center gap-2">
                {isEditing && (
                  <button
                    disabled={isEvaluating}
                    onClick={handleCancelEdit}
                    className="px-5 py-2.5 rounded-lg font-bold bg-gray-200 text-gray-700 hover:bg-gray-300 transition-all shadow-sm transform active:scale-95"
                  >
                    Cancel
                  </button>
                )}
                <button
                  disabled={isEvaluating}
                  onClick={async () => {
                    if (isEvaluating) return;
                    if (isEditing) {
                      await handleDraftSave();
                    } else {
                      setIsEditing(true);
                    }
                  }}
                  className={`px-6 py-2.5 rounded-lg font-bold text-white transition-all shadow-md transform active:scale-95 ${
                    isEvaluating
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed shadow-none"
                      : isEditing
                        ? "bg-[#0B3763] hover:bg-[#06264A]"
                        : "bg-[#FFD700] hover:bg-[#e6c200] text-[#856404]"
                  }`}
                >
                  {isEvaluating ? "🔒 Under Evaluation" : isEditing ? "✓ Save Draft" : "✎ Edit Grades"}
                </button>
              </div>
            )}
          </div>
        </div>

        {dataLoading ? (
          <div className="text-center p-20 font-bold text-[#856404]">Syncing Schedule Records...</div>
        ) : activeClass ? (
          <div className="space-y-6">

            {isEvaluating && (
              <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 text-amber-800 text-sm font-semibold flex items-center gap-3 shadow-sm">
                <span>⚠️</span>
                <span>This subject is currently under evaluation. Grade updates are locked.</span>
              </div>
            )}

            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
              <div className="bg-[#0B3763] p-4 flex justify-between items-center">
                <h2 className="text-white font-bold text-lg">
                  {activeClass.subject_id} — {activeClass.sched_code}
                </h2>
                <span className="bg-white text-[#0B3763] text-xs font-black px-3 py-1 rounded-full uppercase">
                  {rosterList.length} Enrolled
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="bg-[#FFFDE7] text-[#856404] uppercase text-xs font-black border-b border-[#FFD700]">
                      <th className="px-6 py-5">Student ID</th>
                      <th className="px-6 py-5 text-center">1st</th>
                      <th className="px-6 py-5 text-center">2nd</th>
                      <th className="px-6 py-5 text-center">Average</th>
                      <th className="px-6 py-5 text-center">Remarks (Auto)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {rosterList.map((student, sIndex) => {
                      const currentStudentId = student.student_id;
                      const currentGradesMap = grades[currentStudentId] || [0, 0, ""];

                      const numericGrades = currentGradesMap.slice(0, 2) as number[];
                      const currentRemarks = getAutomaticRemark(numericGrades);

                      const g1 = Number(numericGrades[0]) || 0;
                      const g2 = Number(numericGrades[1]) || 0;
                      const validCount = numericGrades.filter(g => typeof g === 'number' && g > 0).length;
                      const averageVal = validCount > 0 ? ((g1 + g2) / validCount).toFixed(2) : "-";

                      return (
                        <tr key={sIndex} className="hover:bg-[#FFFDE7]/50 transition-colors">
                          <td className="px-6 py-4 font-bold text-gray-700">{currentStudentId}</td>

                          {numericGrades.map((gradeValue, colIndex) => (
                            <td key={colIndex} className="px-6 py-4 text-center">
                              {isEditing && !isEvaluating ? (
                                <input
                                  type="number"
                                  value={gradeValue === 0 ? "" : gradeValue}
                                  onChange={(e) => handleGradeChange(currentStudentId, colIndex, e)}
                                  onBlur={(e) => validateMin(currentStudentId, colIndex, e)}
                                  min="60"
                                  max="100"
                                  className="w-20 bg-white border-2 border-[#FFD700] text-gray-900 text-center text-sm rounded-lg focus:ring-2 focus:ring-[#0B3763] p-2 outline-none font-bold"
                                />
                              ) : (
                                <span className={`inline-block min-w-[40px] py-1 px-2 rounded-md font-black ${
                                  gradeValue >= 85 ? "text-[#155724] bg-[#d4edda]" :
                                  gradeValue >= 75 ? "text-[#856404] bg-[#fff3cd]" :
                                  gradeValue > 0 ? "text-[#721c24] bg-[#f8d7da]" : "text-gray-400 bg-gray-100"
                                }`}>
                                  {gradeValue === 0 ? "-" : gradeValue}
                                </span>
                              )}
                            </td>
                          ))}

                          {/* Average Column */}
                          <td className="px-6 py-4 text-center">
                            <span className={`inline-block min-w-[50px] py-1 px-2 rounded-md font-black ${
                              Number(averageVal) >= 85 ? "text-[#155724] bg-[#d4edda]" :
                              Number(averageVal) >= 75 ? "text-[#856404] bg-[#fff3cd]" :
                              averageVal !== "-" ? "text-[#721c24] bg-[#f8d7da]" : "text-gray-400 bg-gray-100"
                            }`}>
                              {averageVal}
                            </span>
                          </td>

                          {/* Remarks Column */}
                          <td className="px-6 py-4 text-center">
                            <span className={`inline-block min-w-[70px] py-1 px-2.5 rounded-md text-xs font-black uppercase tracking-wider ${
                              currentRemarks === "Passed" ? "text-emerald-700 bg-emerald-100" :
                              currentRemarks === "Failed" ? "text-red-700 bg-red-100" : "text-gray-400 bg-gray-100 font-normal normal-case"
                            }`}>
                              {currentRemarks || "-"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-[#e9ecef] p-3 rounded-lg text-center">
              <p className="text-[#6c757d] text-[11px] font-bold uppercase tracking-widest">
                Automatic Constraint: Min 60 | Max 100
              </p>
            </div>

            {/* Conditionally render Submit Final Grade button */}
            {canSubmitFinal && (
              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setIsConfirmOpen(true)}
                  disabled={isEditing || !selectedCode || !allStudentsHaveRemarks || !isSubjectActive || isEvaluating}
                  className={`w-full md:w-auto px-10 py-3.5 rounded-xl font-black text-white tracking-wide shadow-lg transition-all transform active:scale-95 ${
                    isEditing || !selectedCode || !allStudentsHaveRemarks || !isSubjectActive || isEvaluating
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed shadow-none"
                      : "bg-[#0B3763] hover:bg-[#06264A]"
                  }`}
                >
                  Submit Final Grades
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white border-4 border-double border-[#FFD700] rounded-2xl py-32 text-center shadow-inner">
            <div className="text-[#FFD700] text-7xl mb-4 opacity-50">🎓</div>
            <p className="text-[#856404] font-black text-xl">Please select a schedule code to display the roster.</p>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {isConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border-2 border-[#FFD700]">
            <div className="text-center">
              <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                ⚠️
              </div>
              <h3 className="text-xl font-black text-[#856404] mb-2">
                Confirm Final Submission
              </h3>
              <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                Are you sure you want to finalize grades for <span className="font-bold text-gray-800">{activeClass?.subject_id}</span>?
              </p>
            </div>

            <div className="flex gap-3">
              <button
                disabled={submitting}
                onClick={() => setIsConfirmOpen(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 font-bold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                disabled={submitting}
                onClick={() => executeFinalSubmission(true)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-[#0B3763] hover:bg-[#06264A] font-bold text-white transition-colors shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? "Submitting..." : "Confirm & Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GradingSheet;