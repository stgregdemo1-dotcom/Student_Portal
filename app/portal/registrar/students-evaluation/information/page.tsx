"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface SubjectRecord {
  subject_id: string;
  teacher_id?: string;
  grade_1?: string;
  grade_2?: string;
  grade_3?: string;
  grade_4?: string;
  remarks?: string;
  status?: string;
  sched_code?: string;
}

interface ClassRecord {
  year: string;
  semester: string;
  section: string;
  subjects: SubjectRecord[];
}

interface StudentSectionRawData {
  _id: string;
  student_id: string;
  first_name?: string;
  last_name?: string;
  class: ClassRecord[];
}

function AdminStudentDetailsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const studentId = searchParams.get("id");

  const [record, setRecord] = useState<StudentSectionRawData | null>(null);
  const [activeClassIndex, setActiveClassIndex] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchSectionDetails = async () => {
    if (!studentId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/portal/registrar?table=student_section&id=${studentId}`);
      if (res.ok) {
        const json = await res.json();
        const rawData = json.data || json;
        setRecord(rawData);
      } else {
        console.error("Failed to load section document map.");
      }
    } catch (err) {
      console.error("Error loading query pipeline details:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSectionDetails();
  }, [studentId]);

  const currentClass = record?.class?.[activeClassIndex];

  const areAllSubjectsEvaluating = currentClass?.subjects && currentClass.subjects.length > 0
    ? currentClass.subjects.every((sub) => sub.status === "Evaluating")
    : false;

  const handleActionClick = async (actionType: "Approved" | "Rejected") => {
    if (!record || !currentClass) return;
    setActionLoading(true);

    try {
      const newStatus = actionType === "Approved" ? "Completed" : "Rejected";

      const res = await fetch(`/api/portal/registrar?table=student_section`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_id: record.student_id,
          year: currentClass.year,
          semester: currentClass.semester,
          subject_status: newStatus,
        }),
      });

      if (res.ok) {
        setRecord((prev) => {
          if (!prev) return null;
          const updatedClasses = [...prev.class];
          updatedClasses[activeClassIndex] = {
            ...updatedClasses[activeClassIndex],
            subjects: updatedClasses[activeClassIndex].subjects.map((sub) => ({
              ...sub,
              status: newStatus,
            })),
          };
          return { ...prev, class: updatedClasses };
        });

        alert(`All subject statuses updated successfully to "${newStatus}".`);
      } else {
        const errData = await res.json();
        alert(`Failed to update subject statuses: ${errData.message || "Server error"}`);
      }
    } catch (err) {
      console.error("Failed to execute status update:", err);
      alert("A network error occurred while updating subject statuses.");
    } finally {
      setActionLoading(false);
    }
  };

  if (!studentId) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500 italic">
        Error: Missing valid student identity parameter context inside page address.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400 font-medium animate-pulse">
        Retrieving Section Data Matrix...
      </div>
    );
  }

  if (!record || !currentClass) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500 italic">
        Academic track record could not be found for Student ID: {studentId}.
      </div>
    );
  }

  const fullName = record.first_name || record.last_name
    ? `${record.first_name || ""} ${record.last_name || ""}`.trim()
    : "Student Details";

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header Action Control Row */}
        <div className="flex justify-between items-center">
          <button onClick={() => router.back()} className="text-gray-600 transition-colors hover:text-gray-900 font-medium">
            ← Back to Evaluation Requests
          </button>
        </div>

        {/* Dynamic Context Identity Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 rounded-xl shadow-sm">
          <h1 className="text-3xl font-bold capitalize">{fullName}</h1>
          <p className="mt-1 font-light">Academic Evaluation Dashboard</p>
          <p className="text-xs mt-2 opacity-80">System Student ID: {record.student_id}</p>
        </div>

        {/* Split UI Layout Frame */}
        <div className="grid lg:grid-cols-3 gap-6">

          {/* Main Academic Metadata Section */}
          <div className="lg:col-span-2 space-y-6">
            <Card title="Current Enrollment">
              <Grid>
                <Field label="Academic Year" value={currentClass.year} />
                <Field label="Active Semester" value={`${currentClass.semester}${currentClass.semester === "1" ? "st" : "nd"} Semester`} />
                <Field label="Assigned Section" value={currentClass.section} />
              </Grid>
            </Card>

            {/* Live Subjects Grid */}
            <Card title="Student Subject Grades">
              <div className="overflow-x-auto -mx-6">
                <table className="min-w-full divide-y divide-gray-100 text-sm">
                  <thead className="bg-gray-50 text-gray-500 text-left text-xs uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-2.5">Subject ID</th>
                      <th className="px-6 py-2.5 text-center">Prelim</th>
                      <th className="px-6 py-2.5 text-center">Midterm</th>
                      <th className="px-6 py-2.5 text-center">Pre-Final</th>
                      <th className="px-6 py-2.5 text-center">Finals</th>
                      <th className="px-6 py-2.5">Remarks</th>
                      <th className="px-6 py-2.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-700 bg-white">
                    {!currentClass.subjects || currentClass.subjects.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-4 text-center text-gray-400 italic">
                          No subjects assigned within this dynamic structural section document framework.
                        </td>
                      </tr>
                    ) : (
                      currentClass.subjects.map((sub, idx) => (
                        <tr key={sub.subject_id || idx} className="hover:bg-gray-50/40">
                          <td className="px-6 py-3 font-medium text-gray-900">{sub.subject_id}</td>
                          <td className="px-6 py-3 text-center text-gray-600">{sub.grade_1 || "—"}</td>
                          <td className="px-6 py-3 text-center text-gray-600">{sub.grade_2 || "—"}</td>
                          <td className="px-6 py-3 text-center text-gray-600">{sub.grade_3 || "—"}</td>
                          <td className="px-6 py-3 text-center text-gray-600">{sub.grade_4 || "—"}</td>
                          <td className="px-6 py-3">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${sub.remarks === "Passed" ? "bg-green-50 text-green-700" :
                              sub.remarks === "Failed" ? "bg-red-50 text-red-700" : "bg-gray-100 text-gray-600"
                              }`}>
                              {sub.remarks || "Pending"}
                            </span>
                          </td>
                          <td className="px-6 py-3">
                            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${sub.status === "Completed" ? "bg-green-100 text-green-800" :
                                sub.status === "Active" ? "bg-blue-100 text-blue-800" :
                                  sub.status === "Evaluating" ? "bg-amber-100 text-amber-800" :
                                    sub.status === "Rejected" ? "bg-red-100 text-red-800" :
                                      "bg-gray-100 text-gray-600"
                              }`}>
                              {sub.status || "—"}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          {/* Action Management Sidebar Panel */}
          <div className="space-y-6">
            <Card title="Action">
              <div className="space-y-3">
                <button
                  disabled={actionLoading || !areAllSubjectsEvaluating}
                  onClick={() => handleActionClick("Approved")}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-2.5 px-4 rounded-lg text-sm font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                >
                  Approve Evaluation Request
                </button>
                <button
                  disabled={actionLoading || !areAllSubjectsEvaluating}
                  onClick={() => handleActionClick("Rejected")}
                  className="w-full bg-red-100 hover:bg-red-200 text-red-700 py-2.5 px-4 rounded-lg text-sm font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Reject Evaluation Request
                </button>
                {!areAllSubjectsEvaluating && (
                  <p className="text-[11px] text-amber-600 text-center font-medium mt-1">
                    * All subjects must have a status of "Evaluating" before approval/rejection.
                  </p>
                )}
              </div>
            </Card>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function AdminStudentDetailsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-gray-400 font-medium animate-pulse">
          Loading Page Parameters...
        </div>
      }
    >
      <AdminStudentDetailsContent />
    </Suspense>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
      <h2 className="font-bold text-gray-400 uppercase tracking-wider text-xs border-b pb-2">{title}</h2>
      {children}
    </div>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid md:grid-cols-2 gap-4">{children}</div>;
}

function Field({ label, value }: { label?: string; value: string }) {
  return (
    <div>
      {label && <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">{label}</label>}
      <p className="font-semibold text-gray-800 text-sm min-h-[20px]">{value || "—"}</p>
    </div>
  );
}