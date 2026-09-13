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
      className={`w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm ${
        readOnly ? "bg-slate-100 cursor-not-allowed text-slate-500 font-bold" : ""
      }`}
    />
  </div>
);

export default function EnrollmentForm() {
  const router = useRouter();
  
  const [controlNumber, setControlNumber] = useState<string | null>(null);
  const [studentData, setStudentData] = useState<any>(null); // This stores all data from admission_application
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [agree, setAgree] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // New Mutable Form States
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [relationship, setRelationship] = useState("");
  const [contactNumber, setContactNumber] = useState("");

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
        
        // 🚀 Extract and save the raw admission details object directly
        const applicationDetails = jsonResponse.data; 
        setStudentData(applicationDetails);

        // Optional: If you want to log or work with all entries as an array of key-value pairs:
        const detailsArray = Object.entries(applicationDetails);
        console.log("Application Data Array Structure:", detailsArray);
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

    const formattedStudentId = studentData.applicant_id && typeof studentData.applicant_id === "string"
    ? studentData.applicant_id.replace(/^ID-/, "ST-")
    : "ST-XXXX-XXXXX";

    const completeAddress = `${studentData.street || ""}, ${studentData.city || ""}, ${studentData.province || ""}, ${studentData.zip || ""}`
          .replace(/^,\s*/, "") 
          .replace(/,\s*$/, "");

    const payloadDetails = {
      status: "Pending",
      student_id: formattedStudentId,
      first_name: studentData.firstName,
      middle_name: studentData.middleName,
      last_name: studentData.lastName,
      email_address: studentData.email,
      contact_number: studentData.phone,
      date_of_birth: studentData.dob,
      gender: studentData.gender,
      nationality: studentData.nationality,
      secondary_school: studentData.lastSchool,
      residential_address: completeAddress,
      emergency_contact_person: contactPerson,
      emergency_contact_relationship: relationship,
      emergency_contact_number: contactNumber,
      gpa: "",
      graduation_year: "",
      track: studentData.track,
    };

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    if (!contactPerson || !relationship || !contactNumber) {
      setErrorMsg("Please fill in all mandatory emergency contact fields.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/admission/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // 🚀 UPDATE THIS: Send your payloadDetails and your accountSetup properties together
          studentProfile: payloadDetails, 
          accountSetup: { 
            username: formattedStudentId,
            password: password,
            user_type: "student"
          }
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        localStorage.removeItem("enrollment_control_number"); // Clear cache session upon success
        router.push("/portal/log-in");
      } else {
        setErrorMsg(result.message || "Enrollment processing failed.");
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
          <h1 className="text-2xl font-black text-red-600">Enrollment Locked</h1>
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
            <h1 className="text-4xl font-black text-[#166534]">SGCST Enrollment</h1>
            <p className="text-slate-500 font-medium italic">Final Enrollment Confirmation</p>
          </div>
          <button onClick={() => router.back()} disabled={submitting} className="text-sm font-bold text-slate-400 hover:text-red-600 transition-colors">
            Back
          </button>
        </div>

        {/* 🚀 FIXED: Changed container layout shell from a div to a form handler */}
        <form onSubmit={handleEnrollmentSubmit} className="bg-white rounded-3xl p-8 md:p-12 shadow-xl space-y-10">
          <div className="pb-6 border-b border-slate-100">
            <h3 className="text-2xl font-black text-[#166534]">Student Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <InputField label="Control ID" value={studentData.applicant_id} readOnly />
              <InputField label="Full Name" value={studentFullName} readOnly />
              <InputField label="Track / Program" value={studentData.track} readOnly />
              <InputField label="Year/Grade Level" value={studentData.gradeLevel || "N/A"} readOnly />
              <InputField label="Admission Status" value={studentData.status} readOnly />
            </div>
          </div>

          <div className="pb-6 border-b border-slate-100">
            <h3 className="text-2xl font-black text-[#166534]">Account Setup</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <InputField label="Student ID" value={formattedStudentId} readOnly />
              <br/>
              <InputField 
                label="Password *" 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                disabled={submitting}
              />
              <InputField 
                label="Confirm Password *" 
                type="password" 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                disabled={submitting}
              />
            </div>
          </div>

          <div>
            <h4 className="text-sm font-black text-amber-600 uppercase tracking-widest mb-6">Emergency Contact</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <InputField 
                label="Contact Person *" 
                placeholder="Full Name" 
                value={contactPerson} 
                onChange={(e) => setContactPerson(e.target.value)} 
                disabled={submitting}
              />
              <InputField 
                label="Relationship *" 
                placeholder="Guardian" 
                value={relationship} 
                onChange={(e) => setRelationship(e.target.value)} 
                disabled={submitting}
              />
              <InputField 
                label="Contact Number *" 
                placeholder="+63 9xx xxx xxxx" 
                value={contactNumber} 
                onChange={(e) => setContactNumber(e.target.value)} 
                disabled={submitting}
              />
            </div>
          </div>

          <div className="flex items-start gap-3 pt-4">
            <input
              type="checkbox"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
              required
              disabled={submitting}
              className="mt-1"
            />
            <label className="text-sm leading-snug text-slate-600 select-none">
              I hereby confirm my enrollment for the upcoming academic term and agree to comply with all university policies, fees, and requirements.
            </label>
          </div>

          {errorMsg && (
            <div className="text-red-500 text-xs font-semibold bg-red-50 p-4 rounded-xl border border-red-100">
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={!agree || submitting}
            className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl transition-all ${
              agree && !submitting ? "bg-[#166534] hover:bg-[#14532d] text-white" : "bg-slate-300 text-slate-500 cursor-not-allowed"
            }`}
          >
            {submitting ? "Processing Enrollment..." : "Confirm Enrollment"}
          </button>
        </form>
      </div>
    </div>
  );
}