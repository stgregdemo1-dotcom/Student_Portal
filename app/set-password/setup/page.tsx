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

export default function TeacherRegistrationForm() {
  const router = useRouter();
  
  const [teacherControlId, setTeacherControlId] = useState<string | null>(null);
  const [teacherData, setTeacherData] = useState<any>(null); // Stores data from the teachers collection
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [agree, setAgree] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Mutable Form States
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [relationship, setRelationship] = useState("");
  const [contactNumber, setContactNumber] = useState("");

  useEffect(() => {
  // 1. Retrieve the exact keys you set on the previous page
  const cachedTeacherId = localStorage.getItem("cached_teacher_id");
  const cachedSecurityCode = localStorage.getItem("cached_security_code");

  // If either key is missing, lock the page layout
  if (!cachedTeacherId || !cachedSecurityCode) {
    setLoading(false);
    return;
  }
  
  // Set the controller ID string state
  setTeacherControlId(cachedTeacherId);

  const fetchTeacherProfile = async () => {
    try {
      // 2. Pass the correct cached properties to your backend data router API.
      // If your API expects the security code (id) to find the profile, use cachedSecurityCode here instead.
      const res = await fetch(`/api/set-password/verify?table=teachers&teacher_id=${cachedTeacherId}`);
      
      if (res.ok) {
        const jsonResponse = await res.json();
        
        // 3. Save the payload directly to state variable references
        const applicationDetails = jsonResponse.data; 
        setTeacherData(applicationDetails);
      } else {
        console.error("API error: Server returned status code", res.status);
      }
    } catch (err) {
      console.error("Failed to recover teacher account session:", err);
    } finally {
      setLoading(false);
    }
  };

  fetchTeacherProfile();
}, []);

  const handleTeacherSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const completeAddress = `${teacherData.street || ""}, ${teacherData.city || ""}, ${teacherData.province || ""}, ${teacherData.zip || ""}`
          .replace(/^,\s*/, "") 
          .replace(/,\s*$/, "");

    const payloadDetails = {
      status: "Active",
      teacher_id: teacherData.teacher_id,
      prefix: teacherData.prefix,
      first_name: teacherData.first_name,
      middle_name: teacherData.middle_name,
      last_name: teacherData.last_name,
      email_address: teacherData.email_address,
      contact_number: teacherData.contact_number,
      residential_address: completeAddress,
      department_id: teacherData.department_id,
      role_id: teacherData.role_id,
    };

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/set-password/setup", { // <-- Update path if necessary
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teacherProfile: payloadDetails, 
          accountSetup: { 
            username: teacherData.teacher_id,
            password: password,
            user_type: "teacher"
          }
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // ✅ Clear your exact active session cache string keys here
        localStorage.removeItem("cached_teacher_id"); 
        localStorage.removeItem("cached_security_code");
        
        router.push("/portal/log-in");
      } else {
        setErrorMsg(result.message || "Teacher registry account configuration processing failed.");
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
          <p className="text-sm font-semibold text-slate-500">Retrieving Teacher Account State...</p>
        </div>
      </div>
    );
  }

  if (!teacherControlId || !teacherData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
        <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl text-center space-y-6">
          <h1 className="text-2xl font-black text-red-600">Account Setup Locked</h1>
          <p className="text-sm text-slate-500 leading-relaxed">
            No valid or authorized teacher session profile credentials were found in your browser cache.
          </p>
          <button
            onClick={() => router.push("/set-password/verify")}
            className="w-full py-3 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-sm font-bold tracking-wider transition-colors"
          >
            Go to Verification Page
          </button>
        </div>
      </div>
    );     
  }

  const teacherFullName = `${teacherData.prefix ? `${teacherData.prefix} ` : ""}${teacherData.first_name} ${teacherData.middle_name ? `${teacherData.middle_name} ` : ""}${teacherData.last_name}`;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-[#1E293B] p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        <div className="mb-10 flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-black text-[#166534]">Teacher Portal Setup</h1>
            <p className="text-slate-500 font-medium italic">Account Registration Confirmation</p>
          </div>
          <button onClick={() => router.back()} disabled={submitting} className="text-sm font-bold text-slate-400 hover:text-red-600 transition-colors">
            Back
          </button>
        </div>

        <form onSubmit={handleTeacherSubmit} className="bg-white rounded-3xl p-8 md:p-12 shadow-xl space-y-10">
          <div className="pb-6 border-b border-slate-100">
            <h3 className="text-2xl font-black text-[#166534]">Teacher Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <InputField label="Database ID Reference" value={teacherData.id} readOnly />
              <InputField label="Full Name" value={teacherFullName} readOnly />
              <InputField label="Department Code" value={teacherData.department_id || "N/A"} readOnly />
              <InputField label="Assigned Role ID" value={teacherData.role_id || "N/A"} readOnly />
              <InputField label="Current Employment Status" value={teacherData.status} readOnly />
            </div>
          </div>

          <div className="pb-6 border-b border-slate-100">
            <h3 className="text-2xl font-black text-[#166534]">Account Setup</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <InputField label="Teacher ID" value={teacherData.teacher_id} readOnly />
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
              I hereby confirm my access activation for the portal system and agree to comply with all institution administrative policies and security terms.
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
            {submitting ? "Processing Profile Setup..." : "Confirm Account Setup"}
          </button>
        </form>
      </div>
    </div>
  );
}