"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface InputFieldProps {
  label: string;
  type?: string;
  placeholder?: string;
  readOnly?: boolean;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  type = "text",
  placeholder,
  readOnly,
  value,
  onChange,
}) => (
  <div className="flex flex-col gap-2">
    <label className="text-[10px] font-black uppercase text-slate-400 ml-1">
      {label}
    </label>
    <input
      type={type}
      placeholder={placeholder}
      readOnly={readOnly}
      value={value || ""}
      onChange={onChange}
      className={`w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm ${readOnly ? "bg-slate-100 cursor-not-allowed text-slate-500 font-bold" : ""
        }`}
    />
  </div>
);

export default function EnrollmentForm() {
  const router = useRouter();

  const [controlNumber, setControlNumber] = useState<string | null>(null);
  const [studentData, setStudentData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    const cachedNumber = localStorage.getItem("enrollment_control_number");
    if (!cachedNumber) {
      setLoading(false);
      return;
    }
    setControlNumber(cachedNumber);

    const fetchStudentProfile = async () => {
      try {
        const res = await fetch(`/api/portal/registrar?table=admissions_applications&id=${cachedNumber}`);
        if (res.ok) {
          const jsonResponse = await res.json();
          const applicationDetails = jsonResponse.data;
          setStudentData(applicationDetails);
        }
      } catch (err) {
        console.error("Failed to recover enrollment session:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentProfile();
  }, []);

  const handleEnrollmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setErrorMsg("Password must be at least 8 characters.");
      return;
    }

    const formattedStudentId = studentData.applicant_id && typeof studentData.applicant_id === "string"
      ? studentData.applicant_id.replace(/^ID-/, "ST-")
      : "ST-XXXX-XXXXX";

    setSubmitting(true);

    try {
      const response = await fetch("/api/admission/enroll", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formattedStudentId,
          password: password,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        localStorage.removeItem("enrollment_control_number");
        router.push("/portal/log-in");
      } else {
        setErrorMsg(result.message || "Password update failed.");
      }
    } catch (err) {
      console.error("Submission pipeline error:", err);
      setErrorMsg("A network fault occurred. Please check your connection.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-4 border-[#166534] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-semibold text-slate-500">Retrieving Enrollment Access State...</p>
        </div>
      </div>
    );
  }

  if (!controlNumber || !studentData || studentData.status !== "Approved") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
        <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl text-center space-y-6">
          <h1 className="text-2xl font-black text-red-600">Access Locked</h1>
          <p className="text-sm text-slate-500 leading-relaxed">
            No valid or approved application access authorization was found in your browser session.
          </p>
          <button
            onClick={() => router.push("/admission/verify")}
            className="w-full py-3 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-sm font-bold tracking-wider transition-colors"
          >
            Go to Verification Page
          </button>
        </div>
      </div>
    );
  }

  const studentFullName = `${studentData.firstName} ${studentData.middleName ? `${studentData.middleName} ` : ""}${studentData.lastName}`;

  const formattedStudentId = studentData.applicant_id && typeof studentData.applicant_id === "string"
    ? studentData.applicant_id.replace(/^ID-/, "ST-")
    : "ST-XXXX-XXXXX";

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-[#1E293B] p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        <div className="mb-10 flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-black text-[#166534]">SGCST Password Reset</h1>
            <p className="text-slate-500 font-medium italic">Set Your New Password</p>
          </div>
          <button onClick={() => router.back()} disabled={submitting} className="text-sm font-bold text-slate-400 hover:text-red-600 transition-colors">
            Back
          </button>
        </div>

        <form onSubmit={handleEnrollmentSubmit} className="bg-white rounded-3xl p-8 md:p-12 shadow-xl space-y-10">
          <div className="pb-6 border-b border-slate-100">
            <h3 className="text-2xl font-black text-[#166534]">Student Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <InputField label="Control ID" value={studentData.applicant_id} readOnly />
              <InputField label="Full Name" value={studentFullName} readOnly />
            </div>
          </div>

          <div className="pb-6 border-b border-slate-100">
            <h3 className="text-2xl font-black text-[#166534]">Account Setup</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <InputField label="Student ID / Username" value={formattedStudentId} readOnly />
              <br />
              <InputField
                label="New Password *"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={submitting}
              />
              <InputField
                label="Confirm New Password *"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={submitting}
              />
            </div>
          </div>

          {errorMsg && (
            <div className="text-red-500 text-xs font-semibold bg-red-50 p-4 rounded-xl border border-red-100">
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl transition-all ${!submitting ? "bg-[#166534] hover:bg-[#14532d] text-white" : "bg-slate-300 text-slate-500 cursor-not-allowed"
              }`}
          >
            {submitting ? "Updating Password..." : "Confirm Reset"}
          </button>
        </form>
      </div>
    </div>
  );
}