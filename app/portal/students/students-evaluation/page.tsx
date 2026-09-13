"use client";

import { useEffect, useState } from "react";

interface EvaluationData {
  status: "Pending" | "Approved" | "Rejected" | string;
  year: string;
  semester: string;
  remarks: string;
}

export default function Page() {
  const [evaluation, setEvaluation] = useState<EvaluationData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [enrolling, setEnrolling] = useState<boolean>(false);

  useEffect(() => {
    async function fetchEvaluationStatus() {
      try {
        const res = await fetch("/api/portal/student?getEvaluationStatus=true");
        const result = await res.json();
        
        if (result.success) {
          setEvaluation(result.evaluation);
        } else {
          setError(result.message || "Failed to load evaluation status");
        }
      } catch (err) {
        setError("An error occurred while fetching your evaluation.");
      } finally {
        setLoading(false);
      }
    }

    fetchEvaluationStatus();
  }, []);

  const handleEnrollment = async () => {
    if (!evaluation) return;
    
    // Core Safety: Block function entirely if status is anything other than "Approved"
    if (evaluation.status !== "Approved") return;
    
    setEnrolling(true);
    try {
      // Fire PUT request directly to the student route to shift status to Pending
      const res = await fetch("/api/portal/student", {
        method: "PUT",
        headers: { "Content-Type": "application/json" }
      });
      
      const result = await res.json();
      if (result.success) {
        alert("Successfully submitted enrollment for 2nd Semester!");
        
        // Optimistically update the UI status so the button disables itself 
        setEvaluation(prev => prev ? { ...prev, status: "Pending" } : null);
      } else {
        alert(result.message || "Enrollment failed.");
      }
    } catch (err) {
      alert("An error occurred during enrollment processing.");
    } finally {
      setEnrolling(false);
    }
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case "Approved":
        return "bg-green-50 text-green-700 border-green-200";
      case "Rejected":
        return "bg-red-50 text-red-700 border-red-200";
      case "Pending":
      default:
        return "bg-amber-50 text-amber-700 border-amber-200";
    }
  };

  const isFirstSemester = evaluation?.semester === "1" || evaluation?.semester?.toLowerCase().includes("1st");

  return (
    <main className="min-h-screen flex items-center justify-center p-5 bg-gray-50">
      <div className="w-full max-w-3xl text-center">
        
        {/* Main Content Card */}
        <div className="bg-white rounded-2xl p-10 shadow-sm border border-gray-200 text-left">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Student Evaluation Status</h1>
            <p className="text-sm text-gray-500 mt-1">View your current academic evaluation summary.</p>
          </div>

          {loading && (
            <div className="py-10 text-center text-gray-500 animate-pulse">
              Loading evaluation info...
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
              {error}
            </div>
          )}

          {!loading && !error && evaluation && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-gray-50 rounded-xl border border-gray-100">
                <div>
                  <span className="text-xs font-semibold tracking-wider text-gray-400 uppercase">Current Term</span>
                  <p className="text-base font-medium text-gray-800 mt-0.5">
                    Academic Year {evaluation.year} — Semester {evaluation.semester}
                  </p>
                </div>
                <div>
                  <span className={`inline-flex items-center px-3.5 py-1.5 rounded-full text-sm font-medium border ${getStatusStyles(evaluation.status)}`}>
                    <span className="mr-1.5">●</span> {evaluation.status}
                  </span>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-5">
                <h3 className="text-sm font-semibold text-gray-900">Evaluation Remarks</h3>
                <p className="text-sm text-gray-600 mt-2 bg-gray-50/50 p-4 rounded-xl border border-dashed border-gray-200 italic">
                  "{evaluation.remarks}"
                </p>
              </div>

              {/* Dynamic Action Button Zone */}
              {isFirstSemester && (
                <div className="border-t border-gray-100 pt-5 flex flex-col items-end">
                  <button
                    onClick={handleEnrollment}
                    disabled={enrolling || evaluation.status !== "Approved"}
                    className={`w-full sm:w-auto px-6 py-2.5 rounded-xl font-medium text-sm transition shadow-sm border
                      ${evaluation.status === "Approved" 
                        ? "bg-indigo-600 hover:bg-indigo-700 text-white border-transparent cursor-pointer" 
                        : "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed pointer-events-none"}`}
                  >
                    {enrolling ? "Processing..." : `Enroll to 2nd Sem (A.Y. ${evaluation.year})`}
                  </button>
                  
                  {/* Warning message only shows if NOT approved */}
                  {evaluation.status !== "Approved" && (
                    <p className="text-xs text-amber-600 mt-2 italic">
                      * Next semester enrollment activates once your status changes from <strong>{evaluation.status}</strong> to <strong>Approved</strong>.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
          
        </div>

      </div>
    </main>
  );
}