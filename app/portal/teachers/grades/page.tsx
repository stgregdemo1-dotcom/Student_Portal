"use client"; 
import React, { useState, useEffect } from 'react';

interface Schedule {
  sched_code: string;
  subject_id: string;
}

interface RosterStudent {
  student_id: string;
  grades: number[];
  remarks: string; 
  evaluation?: string; 
}

const GradingSheet = () => {
  const [teacherId, setTeacherId] = useState<string>("");
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [selectedCode, setSelectedCode] = useState<string>("");
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [grades, setGrades] = useState<{ [key: string]: (number | string)[] }>({});
  const [rosterList, setRosterList] = useState<RosterStudent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Configuration Toggle State
  const [canSubmitFinal, setCanSubmitFinal] = useState<boolean>(false);

  // Confirmation Modal State
  const [isConfirmOpen, setIsConfirmOpen] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const getCookie = (name: string): string => {
    if (typeof document === "undefined") return "";
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || "";
    return "";
  };

  useEffect(() => {
    const cachedUsername = getCookie("username");
    if (cachedUsername) {
      setTeacherId(cachedUsername);
    } else {
      console.warn("No authentication cookie found.");
      setLoading(false);
    }
  }, []);

  // Fetch system submission flag
  useEffect(() => {
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
  }, []);

  useEffect(() => {
    if (!teacherId) return;

    const fetchSchedules = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/portal/teacher?table=subjects&id=${teacherId}&action=subjects`); 
        const result = await response.json();
        if (result && result.subjects) {
          setSchedules(result.subjects);
        }
      } catch (error) {
        console.error("Error grabbing active rosters:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSchedules();
  }, [teacherId]);

  const activeClass = schedules.find(s => s.sched_code === selectedCode);

  useEffect(() => {
    if (!selectedCode || !activeClass) {
      setRosterList([]);
      return;
    }

    const fetchRosterData = async () => {
      try {
        const response = await fetch(`/api/portal/teacher?table=student_section&id=${activeClass.subject_id}&action=students`);
        const data = await response.json();
        if (data && data.students) {
          setRosterList(data.students);

          const initialGradesMap: { [key: string]: (number | string)[] } = {};
          data.students.forEach((std: any) => {
            initialGradesMap[std.student_id] = [
              std.grades[0] || 0,
              std.grades[1] || 0,
              std.grades[2] || 0,
              std.grades[3] || 0,
              std.remarks || "" 
            ];
          });
          setGrades(initialGradesMap);
        }
      } catch (err) {
        console.error("Error loading student rows:", err);
      }
    };
    fetchRosterData();
  }, [selectedCode, activeClass]);

  const hasLockedEvaluation = rosterList.some(
    (student) => student.evaluation && student.evaluation.trim() !== "" 
  );

  const updateGradeState = (studentId: string, colIndex: number, val: number | string) => {
    if (hasLockedEvaluation) return;  
    setGrades(prev => {
      const studentGrades = prev[studentId] || [0, 0, 0, 0, ""];
      const newGrades = [...studentGrades];
      newGrades[colIndex] = val;
      return { ...prev, [studentId]: newGrades };
    });
  };

  const handleGradeChange = (studentId: string, colIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (hasLockedEvaluation) return;
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
    if (hasLockedEvaluation) return;
    const value = parseInt(e.target.value, 10);
    if (value < 60 || isNaN(value)) {
      updateGradeState(studentId, colIndex, 60);
    }
  };

  const handleDraftSave = async () => {
    await executeFinalSubmission(false);
  };

  const executeFinalSubmission = async (isFinal: boolean = true) => {
    if (!selectedCode || !activeClass || hasLockedEvaluation) return;
    
    try {
      setSubmitting(true);
      const formattedGrades = Object.keys(grades).reduce((acc, studentId) => {
        const studentGrades = grades[studentId]; 

        acc[studentId] = [
          studentGrades[0] || 0,
          studentGrades[1] || 0,
          studentGrades[2] || 0,
          studentGrades[3] || 0,
          (studentGrades[4] as string) || ""
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
        } else {
          const refreshResponse = await fetch(`/api/portal/teacher?table=student_section&id=${activeClass.subject_id}&action=students`);
          const refreshData = await refreshResponse.json();
          if (refreshData && refreshData.students) {
            setRosterList(refreshData.students);
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

  if (loading) {
    return <div className="text-center p-20 font-bold text-[#856404]">Syncing with Portal Records...</div>;
  }

  if (!teacherId && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFFDF0]">
        <div className="bg-white p-8 rounded-xl border border-red-200 text-center shadow-md">
          <p className="text-red-600 font-bold mb-2">Access Denied</p>
          <p className="text-gray-600 text-sm">Please log in to load your grading dashboard schedules.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFDF0] py-10 px-4 font-sans relative">
      <div className="max-w-5xl mx-auto">
        
        {/* Header Section */}
        <div className="bg-white border-t-4 border-[#FFD700] p-6 rounded-xl shadow-md mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-[#856404] tracking-tight">Grading Management</h1>
            <p className="text-gray-500 font-medium italic">School Year 2026-2027</p>
            <p className="text-xs text-[#28a745] font-bold mt-1">Logged in as: {teacherId}</p>
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
              <button 
                disabled={hasLockedEvaluation} 
                onClick={async () => {
                  if (isEditing) {
                    await handleDraftSave();
                  } else {
                    setIsEditing(true);
                  }
                }}
                className={`px-6 py-2.5 rounded-lg font-bold text-white transition-all shadow-md transform active:scale-95 ${
                  hasLockedEvaluation
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed shadow-none"
                    : isEditing 
                      ? "bg-[#28a745] hover:bg-[#218838]" 
                      : "bg-[#FFD700] hover:bg-[#e6c200] text-[#856404]"
                }`}
              >
                {hasLockedEvaluation ? "🔒 Evaluation Completed" : isEditing ? "✓ Save Draft" : "✎ Edit Grades"}
              </button>
            )}
          </div>
        </div>

        {activeClass ? (
          <div className="space-y-6">
            
            {hasLockedEvaluation && (
              <div className="bg-red-50 p-4 rounded-xl border border-red-200 text-red-800 text-sm font-semibold flex items-center gap-3 shadow-sm">
                <span>⚠️</span>
                <span>Grading updates are locked because one or more students have already been evaluated.</span>
              </div>
            )}

            <div className="bg-[#FFF9C4] p-5 rounded-xl border border-[#FBC02D] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📄</span>
                <div>
                  <h3 className="font-bold text-[#856404]">Grading Sheet Record</h3>
                </div>
              </div>
              <input 
                type="file" 
                disabled={hasLockedEvaluation} 
                className="text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-[#28a745] file:text-white hover:file:bg-[#218838] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
              <div className="bg-[#28a745] p-4 flex justify-between items-center">
                <h2 className="text-white font-bold text-lg">
                  {activeClass.subject_id} — {activeClass.sched_code}
                </h2>
                <span className="bg-white text-[#28a745] text-xs font-black px-3 py-1 rounded-full uppercase">
                  {rosterList.length} Enrolled
                </span>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="bg-[#FFFDE7] text-[#856404] uppercase text-xs font-black border-b border-[#FFD700]">
                      <th className="px-6 py-5">Student ID</th>
                      <th className="px-6 py-5 text-center">Prelim</th>
                      <th className="px-6 py-5 text-center">Midterm</th>
                      <th className="px-6 py-5 text-center">Pre-Final</th>
                      <th className="px-6 py-5 text-center">Final</th>
                      <th className="px-6 py-5 text-center">Remarks</th>
                      <th className="px-6 py-5 text-center">Evaluation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {rosterList.map((student, sIndex) => {
                      const currentStudentId = student.student_id;
                      const currentGradesMap = grades[currentStudentId] || [0, 0, 0, 0, ""];
                      
                      const numericGrades = currentGradesMap.slice(0, 4) as number[];
                      const currentRemarks = (currentGradesMap[4] as string) || "";

                      return (
                        <tr key={sIndex} className="hover:bg-[#FFFDE7]/50 transition-colors">
                          <td className="px-6 py-4 font-bold text-gray-700">{currentStudentId}</td>
                          
                          {numericGrades.map((gradeValue, colIndex) => (
                            <td key={colIndex} className="px-6 py-4 text-center">
                              {isEditing && !hasLockedEvaluation ? (
                                <input 
                                  type="number" 
                                  value={gradeValue === 0 ? "" : gradeValue}
                                  onChange={(e) => handleGradeChange(currentStudentId, colIndex, e)}
                                  onBlur={(e) => validateMin(currentStudentId, colIndex, e)}
                                  min="60"
                                  max="100"
                                  className="w-20 bg-white border-2 border-[#FFD700] text-gray-900 text-center text-sm rounded-lg focus:ring-2 focus:ring-[#28a745] p-2 outline-none font-bold" 
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

                          <td className="px-6 py-4 text-center">
                            {isEditing && !hasLockedEvaluation ? (
                              <select
                                value={currentRemarks}
                                onChange={(e) => updateGradeState(currentStudentId, 4, e.target.value)}
                                className="w-32 bg-white border-2 border-[#FFD700] text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-[#28a745] p-2 outline-none font-bold cursor-pointer"
                              >
                                <option value="">Select Option</option>
                                <option value="Passed">Passed</option>
                                <option value="Failed">Failed</option>
                              </select>
                            ) : (
                              <span className={`inline-block min-w-[70px] py-1 px-2.5 rounded-md text-xs font-black uppercase tracking-wider ${
                                currentRemarks === "Passed" ? "text-emerald-700 bg-emerald-100" :
                                currentRemarks === "Failed" ? "text-red-700 bg-red-100" : "text-gray-400 bg-gray-100 font-normal normal-case"
                              }`}>
                                {currentRemarks || "-"}
                              </span>
                            )}
                          </td>

                          <td className="px-6 py-4 text-center font-bold text-xs uppercase">
                            <span className={`px-2.5 py-1 rounded-full ${
                              student.evaluation === "Failed" ? "bg-red-100 text-red-700" :
                              student.evaluation === "Incomplete" ? "bg-amber-100 text-amber-700" :
                              student.evaluation === "Pending" ? "bg-blue-100 text-blue-700" :
                              "text-gray-400"
                            }`}>
                              {student.evaluation || "Pending"}
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
                  disabled={isEditing || !selectedCode || hasLockedEvaluation} 
                  className={`w-full md:w-auto px-10 py-3.5 rounded-xl font-black text-white tracking-wide shadow-lg transition-all transform active:scale-95 ${
                    isEditing || !selectedCode || hasLockedEvaluation
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed shadow-none"
                      : "bg-[#856404] hover:bg-[#6c5103]"
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
                Once submitted, evaluations will be processed and grades may be locked against future edits.
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
                className="flex-1 px-4 py-2.5 rounded-xl bg-[#28a745] hover:bg-[#218838] font-bold text-white transition-colors shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
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