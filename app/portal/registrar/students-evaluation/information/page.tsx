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

interface StudentSectionData {
  _id: string;
  student_id: string;
  first_name: string;
  last_name: string;
  year: string;
  semester: string;
  section: string;
  evaluation: string;
  subjects: SubjectRecord[];
}

function AdminStudentDetailsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const studentId = searchParams.get("id");

  const [record, setRecord] = useState<StudentSectionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchSectionDetails = async () => {
    if (!studentId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/portal/registrar?table=student_section&id=${studentId}`);
      if (res.ok) {
        const data = await res.json();
        
        if (Array.isArray(data)) {
          setRecord(data[0] || null);
        } else if (data.success && Array.isArray(data.data)) {
          setRecord(data.data[0] || null);
        } else {
          setRecord(data.data || data || null);
        }
      } else {
        console.error("Failed to load section document map.");
      }
    } catch (err) {
      console.error("Error loading evaluation query pipeline details:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSectionDetails();
  }, [studentId]);

  const updateEvaluationStatus = async (newStatus: "Approved" | "Rejected") => {
    if (!record) return;
    setActionLoading(true);

    try {
      // Send student_id in the API query string.
      // The backend will catch this, match student_id + evaluation: "Pending", and update it.
      const res = await fetch(`/api/portal/registrar?table=student_section&id=${record.student_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ evaluation: newStatus }),
      });

      if (res.ok) {
        setRecord((prev) => (prev ? { ...prev, evaluation: newStatus } : null));
        alert(`Evaluation registry marked successfully as ${newStatus}.`);
      } else {
        alert("Failed to update execution context changes inside student_section data array.");
      }
    } catch (err) {
      console.error("Status modification pipeline crash:", err);
      alert("A server problem blocked state synchronization.");
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
        Retrieving Section Evaluation Data Matrix...
      </div>
    );
  }

  if (!record) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500 italic">
        Academic track assessment record could not be found for Student ID: {studentId}.
      </div>
    );
  }

  const fullName = record.first_name || record.last_name 
    ? `${record.first_name} ${record.last_name}` 
    : "Student Details";

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header Action Control Row */}
        <div className="flex justify-between items-center">
          <button onClick={() => router.back()} className="text-gray-600 transition-colors hover:text-gray-900 font-medium">
            ← Back to Evaluation Requests
          </button>

          <div className="flex gap-3">
            <span className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center ${
              record.evaluation === "Approved" ? "bg-green-100 text-green-800" :
              record.evaluation === "Rejected" ? "bg-red-100 text-red-800" :
              "bg-yellow-100 text-yellow-800"
            }`}>
              {record.evaluation || "Pending"}
            </span>
          </div>
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
                <Field label="Academic Year" value={record.year} />
                <Field label="Active Semester" value={`${record.semester}${record.semester === "1" ? "st" : "nd"} Semester`} />
                <Field label="Assigned Section" value={record.section} />
                <Field label="Evaluation Status" value={record.evaluation || "Pending"} />
              </Grid>
            </Card>

            {/* Live Subjects Grid with Sched Codes from joined DB collection */}
            <Card title="Student Subject Grades">
              <div className="overflow-x-auto -mx-6">
                <table className="min-w-full divide-y divide-gray-100 text-sm">
                  <thead className="bg-gray-50 text-gray-500 text-left text-xs uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-2.5">Sched Code</th>
                      <th className="px-6 py-2.5">Subject ID</th>
                      <th className="px-6 py-2.5 text-center">Prelim</th>
                      <th className="px-6 py-2.5 text-center">Midterm</th>
                      <th className="px-6 py-2.5 text-center">Pre-Final</th>
                      <th className="px-6 py-2.5 text-center">Finals</th>
                      <th className="px-6 py-2.5">Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-700 bg-white">
                    {!record.subjects || record.subjects.length === 0 || (record.subjects.length === 1 && !record.subjects[0].subject_id) ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-4 text-center text-gray-400 italic">
                          No subjects assigned within this dynamic structural section document framework.
                        </td>
                      </tr>
                    ) : (
                      record.subjects.map((sub, idx) => (
                        <tr key={sub.subject_id || idx} className="hover:bg-gray-50/40">
                          <td className="px-6 py-3 font-semibold text-indigo-600">{sub.sched_code || "N/A"}</td>
                          <td className="px-6 py-3 font-medium text-gray-900">{sub.subject_id}</td>
                          <td className="px-6 py-3 text-center text-gray-600">{sub.grade_1 || "—"}</td>
                          <td className="px-6 py-3 text-center text-gray-600">{sub.grade_2 || "—"}</td>
                          <td className="px-6 py-3 text-center text-gray-600">{sub.grade_3 || "—"}</td>
                          <td className="px-6 py-3 text-center text-gray-600">{sub.grade_4 || "—"}</td>
                          <td className="px-6 py-3">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              sub.remarks === "Passed" ? "bg-green-50 text-green-700" :
                              sub.remarks === "Failed" ? "bg-red-50 text-red-700" : "bg-gray-100 text-gray-600"
                            }`}>
                              {sub.remarks || "Pending"}
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
                  disabled={actionLoading || record.evaluation === "Approved" || record.evaluation === "Rejected"}
                  onClick={() => updateEvaluationStatus("Approved")}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-2.5 px-4 rounded-lg text-sm font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                >
                  Approve Evaluation Request
                </button>
                <button 
                  disabled={actionLoading || record.evaluation === "Approved" || record.evaluation === "Rejected"}
                  onClick={() => updateEvaluationStatus("Rejected")}
                  className="w-full bg-red-100 hover:bg-red-200 text-red-700 py-2.5 px-4 rounded-lg text-sm font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Reject Evaluation Request
                </button>
              </div>
            </Card>
          </div>

        </div>
      </div>
    </div>
  );
}

// Export default component wrapped inside Suspense
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

// Atomic helper design subcomponents
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