"use client";

import { useState, useEffect, useRef } from "react";
import React from "react";

interface InputFieldProps {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  max?: string;
  value?: string;
  maxLength?: number;
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
  pattern?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onInvalid?: (e: React.InvalidEvent<HTMLInputElement>) => void;
}

interface SelectFieldProps {
  label: string;
  name: string;
  options: string[];
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  name,
  type = "text",
  placeholder,
  max,
  value,
  maxLength,
  inputMode,
  pattern,
  onChange,
  onKeyDown,
  onInvalid,
}) => (
  <div className="flex flex-col gap-2">
    <label className="text-[10px] font-black uppercase text-slate-400 ml-1">{label}</label>
    <input
      type={type}
      name={name}
      placeholder={placeholder}
      max={max}
      value={value}
      maxLength={maxLength}
      inputMode={inputMode}
      pattern={pattern}
      onChange={onChange}
      onKeyDown={onKeyDown}
      onInvalid={onInvalid}
      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-yellow-400 text-sm"
      required={label.includes("*")}
    />
  </div>
);

const SelectField: React.FC<SelectFieldProps> = ({ label, name, options, value, onChange }) => (
  <div className="flex flex-col gap-2">
    <label className="text-[10px] font-black uppercase text-slate-400 ml-1">{label}</label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-yellow-400 text-sm"
    >
      {options.map((opt) => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  </div>
);

export default function AdmissionForm() {
  const [status, setStatus] = React.useState<{ type: "success" | "error" | ""; message: string }>({ type: "", message: "" });
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // States for individual files and error messaging
  const [profilePic, setProfilePic] = useState<File | null>(null);
  const [reportCard, setReportCard] = useState<File | null>(null);
  const [birthCert, setBirthCert] = useState<File | null>(null);

  const [enrollmentType, setEnrollmentType] = useState<string>("New Student");
  const [gradeLevel, setGradeLevel] = useState<string>("Grade 11");

  // State for LRN to ensure only digits are entered
  const [lrn, setLrn] = useState<string>("");

  const [maxDobDate, setMaxDobDate] = useState<string | undefined>(undefined);

  // Refs for hidden file inputs
  const profileInputRef = useRef<HTMLInputElement>(null);
  const reportCardInputRef = useRef<HTMLInputElement>(null);
  const birthCertInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const today = new Date();
    const cutoffDate = new Date(today.getFullYear() - 13, today.getMonth(), today.getDate());
    setMaxDobDate(cutoffDate.toISOString().split("T")[0]);
  }, []);

  const gradeLevelOptions = enrollmentType === "New Student" ? ["Grade 11"] : ["Grade 11", "Grade 12"];

  const handleEnrollmentTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedType = e.target.value;
    setEnrollmentType(selectedType);

    if (selectedType === "New Student") {
      setGradeLevel("Grade 11");
    }
  };

  const handleLrnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numericValue = e.target.value.replace(/\D/g, ''); // Removes alphabets, spaces, and symbols
    setLrn(numericValue);
  };

  const handleDobValidation = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    if (!input.value) {
      input.setCustomValidity("");
      return;
    }

    const today = new Date();
    const dob = new Date(input.value);
    const ageCutoff = new Date(today.getFullYear() - 15, today.getMonth(), today.getDate());

    if (dob > ageCutoff) {
      input.setCustomValidity("You must be at least 15 years old to apply.");
    } else {
      input.setCustomValidity("");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setFile: (file: File | null) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const maxSize = 2 * 1024 * 1024; // 2MB in bytes
      if (file.size > maxSize) {
        setStatus({ type: "error", message: `File "${file.name}" exceeds the 2MB size limit.` });
        e.target.value = ""; // Reset input
        setFile(null);
        return;
      }
      setStatus({ type: "", message: "" });
      setFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: "", message: "" });

    const formElement = e.currentTarget;
    const formData = new FormData(formElement);
    const dobValue = formData.get("dob") as string;

    if (dobValue) {
      const today = new Date();
      const dob = new Date(dobValue);
      const ageCutoff = new Date(today.getFullYear() - 15, today.getMonth(), today.getDate());
      if (dob > ageCutoff) {
        setStatus({ type: "error", message: "Applicants must be at least 15 years old." });
        setIsSubmitting(false);
        return;
      }
    }

    // Append individual files explicitly to FormData
    if (profilePic) formData.set("profilePic", profilePic);
    if (reportCard) formData.set("reportCard", reportCard);
    if (birthCert) formData.set("birthCert", birthCert);

    try {
      const res = await fetch("/api/admission", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setStatus({ type: "success", message: "Application submitted successfully!" });
        formElement.reset();
        setProfilePic(null);
        setReportCard(null);
        setBirthCert(null);
        setEnrollmentType("New Student");
        setGradeLevel("Grade 11");
        setLrn("");
      } else {
        setStatus({ type: "error", message: data.message || "Failed to submit application." });
      }
    } catch (err) {
      setStatus({ type: "error", message: "Network connection error. Try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12 font-sans text-[#1E293B]">
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-8 md:p-12 shadow-xl space-y-10">

          {status.message && (
            <div className={`p-4 rounded-xl text-sm font-bold ${status.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
              {status.message}
            </div>
          )}

          <div className="mb-10 flex justify-between items-end">
            <div>
              <h1 className="text-4xl font-black text-[#451a03]">
                SGCST Admission
              </h1>

              <p className="text-slate-500 font-medium italic">
                Saint Gregory College of Science and Technology
              </p>
            </div>

            <a
              href="/Home"
              className="text-sm font-bold text-slate-400 hover:text-red-600 transition-colors"
            >
              Back
            </a>
          </div>

          {/* Grid 1: Personal Data */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <InputField label="First Name *" name="firstName" placeholder="Juan" />
            <InputField label="Middle Name" name="middleName" placeholder="Protacio" />
            <InputField label="Last Name *" name="lastName" placeholder="Dela Cruz" />
            <InputField label="Email Address *" name="email" type="email" placeholder="juan@example.com" />
            <InputField label="Phone Number *" name="phone" placeholder="+63 9xx xxx xxxx" />
            <InputField
              label="Date of Birth *"
              name="dob"
              type="date"
              max={maxDobDate}
              onChange={handleDobValidation}
              onInvalid={(e) => e.currentTarget.setCustomValidity("You must be at least 15 years old to apply.")}
            />
            <SelectField label="Gender *" name="gender" options={["Male", "Female", "Other"]} />
            <InputField label="Nationality *" name="nationality" placeholder="Filipino" />
          </div>

          {/* Grid 2: Academic Profile */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SelectField label="Desired Track/Strand *" name="track" options={["Information and Communication Technology", "Hotel and Restaurant Management"]} />
            <SelectField
              label="Enrollment Type *"
              name="enrollmentType"
              options={["New Student", "Transferee"]}
              value={enrollmentType}
              onChange={handleEnrollmentTypeChange}
            />
            <SelectField
              label="Grade Level *"
              name="gradeLevel"
              options={gradeLevelOptions}
              value={gradeLevel}
              onChange={(e) => setGradeLevel(e.target.value)}
            />
            <InputField
              label="LRN"
              name="lrn"
              placeholder="12-digit LRN"
              value={lrn}
              onChange={handleLrnChange}
              maxLength={12}
              inputMode="numeric"
              pattern="[0-9]*"
              onKeyDown={(e) => {
                if (['e', 'E', '+', '-', '.'].includes(e.key)) {
                  e.preventDefault();
                }
              }}
            />
            <InputField label="Last School Attended *" name="lastSchool" placeholder="School Name" />
          </div>

          {/* Grid 3: Address Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField label="Street Address *" name="street" placeholder="Unit/House No, Street" />
            <InputField label="City / Municipality *" name="city" placeholder="Manila" />
            <InputField label="State / Province *" name="province" placeholder="Metro Manila" />
            <InputField label="Zip / Postal Code *" name="zip" placeholder="1000" />
            <InputField label="Country *" name="country" placeholder="Philippines" />
          </div>

          {/* Text Area & 3 Upload Buttons */}
          <div className="space-y-6">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Personal Statement *</label>
              <textarea
                name="personalStatement"
                rows={4}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-yellow-400 text-sm"
                placeholder="Why do you want to join SGCST?"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* 1. Profile Picture Upload */}
              <div className="p-6 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 text-center flex flex-col justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-600 mb-1">Profile Picture *</p>
                  <p className="text-[10px] text-slate-400 mb-4">Max size: 2MB (JPG, PNG)</p>
                </div>
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    ref={profileInputRef}
                    className="hidden"
                    required
                    onChange={(e) => handleFileChange(e, setProfilePic)}
                  />
                  <button
                    type="button"
                    onClick={() => profileInputRef.current?.click()}
                    className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-xs font-black uppercase shadow-sm hover:bg-slate-100 mb-2"
                  >
                    Browse Photo
                  </button>
                  {profilePic && (
                    <p className="text-[11px] font-bold text-green-600 truncate">
                      {profilePic.name}
                    </p>
                  )}
                </div>
              </div>

              {/* 2. Report Card Upload */}
              <div className="p-6 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 text-center flex flex-col justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-600 mb-1">Report Card *</p>
                  <p className="text-[10px] text-slate-400 mb-4">Max size: 2MB (PDF, Image)</p>
                </div>
                <div>
                  <input
                    type="file"
                    accept=".pdf,image/*"
                    ref={reportCardInputRef}
                    className="hidden"
                    required
                    onChange={(e) => handleFileChange(e, setReportCard)}
                  />
                  <button
                    type="button"
                    onClick={() => reportCardInputRef.current?.click()}
                    className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-xs font-black uppercase shadow-sm hover:bg-slate-100 mb-2"
                  >
                    Browse Card
                  </button>
                  {reportCard && (
                    <p className="text-[11px] font-bold text-green-600 truncate">
                      {reportCard.name}
                    </p>
                  )}
                </div>
              </div>

              {/* 3. Birth Certificate Upload */}
              <div className="p-6 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 text-center flex flex-col justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-600 mb-1">Birth Certificate *</p>
                  <p className="text-[10px] text-slate-400 mb-4">Max size: 2MB (PDF, Image)</p>
                </div>
                <div>
                  <input
                    type="file"
                    accept=".pdf,image/*"
                    ref={birthCertInputRef}
                    className="hidden"
                    required
                    onChange={(e) => handleFileChange(e, setBirthCert)}
                  />
                  <button
                    type="button"
                    onClick={() => birthCertInputRef.current?.click()}
                    className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-xs font-black uppercase shadow-sm hover:bg-slate-100 mb-2"
                  >
                    Browse Cert
                  </button>
                  {birthCert && (
                    <p className="text-[11px] font-bold text-green-600 truncate">
                      {birthCert.name}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <label className="flex items-center gap-3 pt-4">
              <input type="checkbox" className="w-5 h-5 accent-yellow-500" required />
              <span className="text-xs text-slate-500">
                I certify that all information provided is true and correct.
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-5 bg-[#451a03] text-white rounded-2xl font-black uppercase tracking-widest disabled:opacity-50"
          >
            {isSubmitting ? "Submitting Application..." : "Submit Application"}
          </button>
        </form>
      </div>
    </div>
  );
}