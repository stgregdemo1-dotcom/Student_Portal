"use client";

import { useState, useEffect, useRef } from "react";
import React from "react";

interface InputFieldProps {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
}

interface SelectFieldProps {
  label: string;
  name: string;
  options: string[];
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  name,
  type = "text",
  placeholder,
}) => (
  <div className="flex flex-col gap-2">
    <label className="text-[10px] font-black uppercase text-slate-400 ml-1">{label}</label>
    <input
      type={type}
      name={name}
      placeholder={placeholder}
      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-yellow-400 text-sm"
      required={label.includes("*")}
    />
  </div>
);

const SelectField: React.FC<SelectFieldProps> = ({ label, name, options }) => (
  <div className="flex flex-col gap-2">
    <label className="text-[10px] font-black uppercase text-slate-400 ml-1">{label}</label>
    <select 
      name={name}
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
  const [selectedFileCount, setSelectedFileCount] = useState(0); // Track files visually

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: "", message: "" });

    // 1. Instantly maps all name attributes, including the file inputs
    const formData = new FormData(e.currentTarget);

    try {
      // 2. UPDATED FETCH: Sending raw formData directly, omitting 'Content-Type' header
      const res = await fetch("/api/admission", {
        method: "POST",
        body: formData, 
      });

      const data = await res.json();

      if (res.ok) {
        setStatus({ type: "success", message: "Application submitted successfully!" });
        (e.target as HTMLFormElement).reset(); 
        setSelectedFileCount(0);
      } else {
        setStatus({ type: "error", message: data.message || "Failed to submit application." });
      }
    } catch (err) {
      setStatus({ type: "error", message: "Network connection error. Try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12 font-sans text-[#1E293B]">
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-8 md:p-12 shadow-xl space-y-10">
          
          {status.message && (
            <div className={`p-4 rounded-xl text-sm font-bold ${status.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
              {status.message}
            </div>
          )}

          {/* Grid 1: Personal Data */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <InputField label="First Name *" name="firstName" placeholder="Juan" />
            <InputField label="Middle Name" name="middleName" placeholder="Protacio" />
            <InputField label="Last Name *" name="lastName" placeholder="Dela Cruz" />
            <InputField label="Email Address *" name="email" type="email" placeholder="juan@example.com" />
            <InputField label="Phone Number *" name="phone" placeholder="+63 9xx xxx xxxx" />
            <InputField label="Date of Birth *" name="dob" type="date" />
            <SelectField label="Gender *" name="gender" options={["Male", "Female", "Other"]} />
            <InputField label="Nationality *" name="nationality" placeholder="Filipino" />
          </div>

          {/* Grid 2: Academic Profile */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SelectField label="Desired Track/Strand *" name="track" options={["Information and Communication Technology", "Hotel and Restaurant Management"]} />
            <SelectField label="Enrollment Type *" name="enrollmentType" options={["New Student", "Transferee"]} />
            <SelectField label="Grade Level *" name="gradeLevel" options={["Grade 11", "Grade 12"]} />
            <InputField label="LRN" name="lrn" placeholder="12-digit LRN" />
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

          {/* Text Area & Confirm Button */}
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
            
            <div className="p-8 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 text-center">
              <p className="text-sm font-bold text-slate-600">
                Upload Required Documents *
              </p>
              <p className="text-xs text-slate-400 mb-4">
                Report Card & Birth Certificate
              </p>
              
              {/* UPDATED: Added name="files", multiple upload support, and a counter change log */}
              <input 
                type="file" 
                name="files"
                ref={fileInputRef} 
                className="hidden" 
                multiple
                required
                onChange={(e) => setSelectedFileCount(e.target.files?.length || 0)} 
              />
              <button 
                type="button" 
                onClick={() => fileInputRef.current?.click()} 
                className="px-6 py-2 bg-white border border-slate-300 rounded-lg text-xs font-black uppercase shadow-sm hover:bg-slate-100"
              >
                Browse Files
              </button>

              {selectedFileCount > 0 && (
                <p className="mt-2 text-xs font-bold text-green-600 animate-pulse">
                  Selected {selectedFileCount} file(s) for upload
                </p>
              )}
            </div>            

            <label className="flex items-center gap-3">
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