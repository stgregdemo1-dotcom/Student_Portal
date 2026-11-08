"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { startNavigationLoading } from "../../-components/startNavigationLoading";

interface AdmissionApplication {
  applicant_id: string;
  status: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  suffix?: string;
  email?: string;
  phone?: string;
  dob?: string;
  gender?: string;
  nationality?: string;
  track?: string;
  gradeLevel?: string;
  lastSchool?: string;
  street?: string;
  city?: string;
  province?: string;
  zip?: string;
}

const isAdmissionApplication = (value: unknown): value is AdmissionApplication =>
  typeof value === "object" &&
  value !== null &&
  "applicant_id" in value &&
  typeof value.applicant_id === "string" &&
  "status" in value &&
  typeof value.status === "string";

interface InputFieldProps {
  label: string;
  type?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  maxLength?: number;
  pattern?: string;
  placeholder?: string;
  readOnly?: boolean;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  type = "text",
  inputMode,
  maxLength,
  pattern,
  placeholder,
  readOnly,
  value,
  onChange,
  disabled,
}) => (
  <div className="flex flex-col gap-2">
    <label className="ml-0.5 text-xs font-semibold text-[#334155]">
      {label}
    </label>
    <input
      type={type}
      inputMode={inputMode}
      maxLength={maxLength}
      pattern={pattern}
      placeholder={placeholder}
      readOnly={readOnly}
      disabled={disabled}
      value={value || ""}
      onChange={onChange}
      className={`h-12 w-full rounded-lg border border-[#DCE4ED] bg-white px-3.5 text-sm text-[#183B56] outline-none transition placeholder:text-slate-400 focus:border-[#183B56] focus:ring-2 focus:ring-[#183B56]/15 ${
        readOnly ? "cursor-not-allowed bg-[#F1F6FC] font-semibold text-slate-500" : ""
      }`}
    />
  </div>
);

export default function EnrollmentForm() {
  const router = useRouter();

  const [controlNumber, setControlNumber] = useState<string | null>(null);
  const [studentData, setStudentData] = useState<AdmissionApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [agree, setAgree] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [relationship, setRelationship] = useState("");
  const [contactNumber, setContactNumber] = useState("");

  // Password validation checks
  const hasMinLength = password.length >= 8;
  const hasLowerAndUpper = /(?=.*[a-z])(?=.*[A-Z])/.test(password);
  const hasAlphanumeric = /(?=.*[a-zA-Z])(?=.*\d)/.test(password);
  const hasSpecialChar = /(?=.*[^A-Za-z0-9])/.test(password);
  const passwordsMatch = password.length > 0 && password === confirmPassword;

  useEffect(() => {
    const cachedNumber = localStorage.getItem("enrollment_control_number");
    const cachedApplication = sessionStorage.getItem("enrollment_application");

    if (cachedApplication) {
      try {
        const application: unknown = JSON.parse(cachedApplication);
        if (
          isAdmissionApplication(application) &&
          (!cachedNumber || application.applicant_id === cachedNumber)
        ) {
          setControlNumber(application.applicant_id);
          setStudentData(application);
          setLoading(false);
          return;
        }
      } catch (err) {
        console.error("Failed to restore verified enrollment details:", err);
      }
    }

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

          if (isAdmissionApplication(jsonResponse.data)) {
            setStudentData(jsonResponse.data);
          } else {
            setErrorMsg("Unable to load the approved application details.");
          }
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

    if (!studentData) {
      setErrorMsg("Unable to load the approved application details.");
      return;
    }

    if (!hasMinLength || !hasLowerAndUpper || !hasAlphanumeric || !hasSpecialChar) {
      setErrorMsg("Please ensure your password meets all security requirements.");
      return;
    }

    if (!passwordsMatch) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    if (!contactPerson || !relationship || !contactNumber) {
      setErrorMsg("Please fill in all mandatory emergency contact fields.");
      return;
    }

    if (!/^\d{11}$/.test(contactNumber)) {
      setErrorMsg("Emergency contact number must contain exactly 11 digits.");
      return;
    }

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
      suffix: studentData.suffix,
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

    setSubmitting(true);

    try {
      const response = await fetch("/api/admission/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
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
        localStorage.removeItem("enrollment_control_number");
        sessionStorage.removeItem("enrollment_application");
        startNavigationLoading("/portal/log-in");
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
      <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(ellipse_at_8%_46%,rgba(255,193,7,0.22),transparent_30%),radial-gradient(ellipse_at_92%_64%,rgba(71,153,220,0.20),transparent_32%),linear-gradient(135deg,#EEF5FF_0%,#FFF8E8_48%,#EAF3FF_100%)]">
        <div className="text-center space-y-3">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-[#FFC107] border-t-transparent"></div>
          <p className="text-sm font-semibold text-slate-500">Retrieving Enrollment Access State...</p>
        </div>
      </div>
    );
  }

  if (!controlNumber || !studentData || studentData.status !== "Approved") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[radial-gradient(ellipse_at_8%_46%,rgba(255,193,7,0.22),transparent_30%),radial-gradient(ellipse_at_92%_64%,rgba(71,153,220,0.20),transparent_32%),linear-gradient(135deg,#EEF5FF_0%,#FFF8E8_48%,#EAF3FF_100%)] p-4">
        <div className="w-full max-w-md space-y-6 rounded-2xl border border-slate-100 bg-white p-8 text-center shadow-[0_12px_40px_rgba(13,43,69,0.12)]">
          <h1 className="text-2xl font-black text-[#0D2B45]">Enrollment Locked</h1>
          <p className="text-sm text-slate-500 leading-relaxed">
            No valid or approved application access authorization was found in your browser session.
          </p>
          <button
            onClick={() => {
              startNavigationLoading("/admission/verification");
              router.push("/admission/verification");
            }}
            className="w-full rounded-lg border-2 border-[#E5A900] bg-[#FFC107] py-3 text-sm font-bold tracking-wide text-[#082B49] shadow-sm transition-colors hover:border-[#082B49] hover:bg-[#082B49] hover:text-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#FFC107]/60 focus-visible:ring-offset-2"
          >
            Go to Verification Page
          </button>
        </div>
      </div>
    );
  }

  const studentFullName = `${studentData.firstName} ${studentData.middleName ? `${studentData.middleName} ` : ""}${studentData.lastName}${studentData.suffix ? `, ${studentData.suffix}` : ""}`;

  const formattedStudentId = studentData.applicant_id && typeof studentData.applicant_id === "string"
    ? studentData.applicant_id.replace(/^ID-/, "ST-")
    : "ST-XXXX-XXXXX";

  return (
    <div className="min-h-[calc(100vh-84px)] w-full bg-[radial-gradient(ellipse_at_8%_46%,rgba(255,193,7,0.22),transparent_30%),radial-gradient(ellipse_at_92%_64%,rgba(71,153,220,0.20),transparent_32%),linear-gradient(135deg,#EEF5FF_0%,#FFF8E8_48%,#EAF3FF_100%)] px-4 pb-20 pt-8 font-sans text-[#1E293B] sm:px-6 sm:pb-24 sm:pt-10 md:min-h-[calc(100vh-96px)] lg:pb-28 lg:pt-12">
      <div className="mx-auto max-w-[1000px]">
        <div className="mb-8 flex flex-col gap-4 border-b border-[#DCE4ED] pb-6 sm:flex-row sm:items-start sm:justify-between sm:mb-10">
          <div>
            <h1 className="text-2xl font-extrabold leading-tight sm:text-3xl">
              <span className="text-[#0D2B45]">SGCST</span>{" "}
              <span className="text-[#D89B00]">Enrollment</span>
            </h1>
            <p className="mt-2 text-sm font-semibold text-[#183B56] sm:text-base">Final Enrollment Confirmation</p>
          </div>
          <button onClick={() => router.back()} disabled={submitting} className="inline-flex min-h-11 items-center justify-center rounded-lg border border-[#0D2B45] bg-white px-4 py-2 text-sm font-semibold text-[#0D2B45] transition-colors hover:border-[#D89B00] hover:text-[#A87400] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFC107] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:min-h-0 sm:border-0 sm:bg-transparent sm:px-2">
            Back
          </button>
        </div>

        <form onSubmit={handleEnrollmentSubmit} className="space-y-9 rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_12px_40px_rgba(13,43,69,0.08)] sm:p-8 lg:p-10">
          <div className="border-b border-[#FFC107]/70 pb-6">
            <h3 className="text-lg font-bold text-[#0D2B45] sm:text-xl">Student Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <InputField label="Control ID" value={studentData.applicant_id} readOnly />
              <InputField label="Full Name" value={studentFullName} readOnly />
              <InputField label="Track / Program" value={studentData.track} readOnly />
              <InputField label="Year/Grade Level" value={studentData.gradeLevel || "N/A"} readOnly />
              <InputField label="Admission Status" value={studentData.status} readOnly />
            </div>
          </div>

          <div className="border-b border-[#FFC107]/70 pb-6">
            <h3 className="text-lg font-bold text-[#0D2B45] sm:text-xl">Account Setup</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <InputField label="Student ID" value={formattedStudentId} readOnly />
              <br />
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

            {/* Password Validation Checklist */}
            <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">Password Security & Confirmation Requirements:</p>
              <ul className="text-xs space-y-1">
                <li className={hasMinLength ? "text-emerald-600 font-semibold" : "text-slate-400"}>
                  {hasMinLength ? "✓" : "○"} At least 8 characters long
                </li>
                <li className={hasLowerAndUpper ? "text-emerald-600 font-semibold" : "text-slate-400"}>
                  {hasLowerAndUpper ? "✓" : "○"} At least one uppercase and one lowercase letter
                </li>
                <li className={hasAlphanumeric ? "text-emerald-600 font-semibold" : "text-slate-400"}>
                  {hasAlphanumeric ? "✓" : "○"} Alphanumeric (contains letters and numbers)
                </li>
                <li className={hasSpecialChar ? "text-emerald-600 font-semibold" : "text-slate-400"}>
                  {hasSpecialChar ? "✓" : "○"} At least one special character (e.g. !@#$%^&*)
                </li>
                <li className={passwordsMatch ? "text-emerald-600 font-semibold" : "text-slate-400"}>
                  {passwordsMatch ? "✓" : "○"} Passwords match
                </li>
              </ul>
            </div>
          </div>

          <div>
            <h4 className="mb-6 text-sm font-black uppercase tracking-widest text-[#A87400]">Emergency Contact</h4>
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
                inputMode="numeric"
                maxLength={11}
                pattern="[0-9]{11}"
                placeholder="09XXXXXXXXX"
                value={contactNumber}
                onChange={(e) =>
                  setContactNumber(e.target.value.replace(/\D/g, "").slice(0, 11))
                }
                disabled={submitting}
              />
            </div>
          </div>

          <div className="flex items-start gap-3 border-t border-[#DCE4ED] pt-6">
            <input
              type="checkbox"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
              required
              disabled={submitting}
              className="mt-1 h-4 w-4 shrink-0 accent-[#0D2B45]"
            />
            <label className="text-sm leading-snug text-slate-600 select-none">
              I hereby confirm my enrollment for the upcoming academic term and agree to comply with all university policies, fees, and requirements.
            </label>
          </div>

          {errorMsg && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-700">
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={!agree || submitting || !hasMinLength || !hasLowerAndUpper || !hasAlphanumeric || !hasSpecialChar || !passwordsMatch}
            className={`group flex min-h-14 w-full items-center justify-center rounded-[10px] border-2 px-5 py-4 text-sm font-bold uppercase tracking-wide shadow-[0_5px_16px_rgba(13,43,69,0.18)] transition-[background-color,color,border-color,box-shadow] duration-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#FFC107]/60 focus-visible:ring-offset-2 ${
              agree && !submitting && hasMinLength && hasLowerAndUpper && hasAlphanumeric && hasSpecialChar && passwordsMatch
                ? "border-[#E5A900] bg-[#FFC107] text-[#082B49] hover:border-[#082B49] hover:bg-[#082B49] hover:text-white hover:shadow-[0_8px_20px_rgba(8,43,73,0.26)]"
                : "cursor-not-allowed border-slate-300 bg-slate-300 text-slate-500"
            }`}
          >
            {submitting ? "Processing Enrollment..." : "Confirm Enrollment"}
          </button>
        </form>
      </div>
    </div>
  );
}