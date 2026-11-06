"use client";

import React, { useState } from 'react';


interface InputFieldProps {
  label: string;
  type?: string;
  placeholder?: string;
  defaultValue?: string;
  readOnly?: boolean;
  value?: string;
  disabled?: boolean;
  required?: boolean;
}

interface SelectFieldProps {
  label: string;
  options: string[];
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  disabled?: boolean;
}

const InputField: React.FC<InputFieldProps> = ({ label, type = "text", placeholder, defaultValue, readOnly, value, disabled, required = label.includes("*") }) => (
  <div className="flex flex-col gap-2">
    <label className="ml-0.5 text-xs font-semibold text-[#334155]">{label}</label>
    <input 
      type={type} 
      placeholder={placeholder} 
      defaultValue={defaultValue}
      readOnly={readOnly}
      value={value}
      disabled={disabled}
      required={required}
      className={`h-12 w-full rounded-lg border border-[#DCE4ED] bg-[#F8FAFC] px-3.5 text-sm text-[#183B56] outline-none transition placeholder:text-slate-400 focus:border-[#D89B00] focus:ring-2 focus:ring-[#FFC107]/25 ${readOnly || disabled ? 'cursor-not-allowed bg-[#F1F6FC] text-slate-500' : ''}`} 
    />
  </div>
);

const SelectField: React.FC<SelectFieldProps> = ({ label, options, onChange, disabled }) => (
  <div className="flex flex-col gap-2">
    <label className="ml-0.5 text-xs font-semibold text-[#334155]">{label}</label>
    <div className="relative">
      <select 
        onChange={onChange}
        disabled={disabled}
        required={label.includes("*")}
        className={`h-12 w-full appearance-none rounded-lg border border-[#DCE4ED] px-3.5 pr-10 text-sm text-[#183B56] outline-none transition focus:border-[#D89B00] focus:ring-2 focus:ring-[#FFC107]/25 ${disabled ? 'cursor-not-allowed bg-[#F1F6FC] text-slate-400' : 'bg-[#F8FAFC]'}`}
      >
        {options.map((opt, index) => <option key={opt} value={index === 0 && opt.startsWith("Select") ? "" : opt}>{opt}</option>)}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-slate-400">
        <i className="fas fa-chevron-down text-xs"></i>
      </div>
    </div>
  </div>
);


export default function AdmissionDashboard() {
  const [activeTab, setActiveTab] = useState<'admission' | 'enrollment'>('admission');
  const [isApproved, setIsApproved] = useState<boolean>(false); 
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [enrollmentType, setEnrollmentType] = useState<string>("");
  const [submissionNotice, setSubmissionNotice] = useState("");
  const [formValidation, setFormValidation] = useState<"idle" | "success" | "error">("idle");

  const handleAdmissionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    setFormValidation("success");
    setSubmissionNotice("Application submitted successfully! You can still make changes until enrollment is officially opened.");
  };

  const handleEnrollmentToggle = () => {
    const nextIsApproved = !isApproved;
    setIsApproved(nextIsApproved);
    if (!nextIsApproved) setActiveTab("admission");
  };

  return (
    <div className="min-h-screen bg-[#F4F7FB] px-4 py-8 font-sans text-[#1E293B] sm:px-6 sm:py-10 lg:px-8">
      <div className="mx-auto max-w-[1000px]">
        

        <div className="mb-8 flex items-end justify-between gap-4 sm:mb-10">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-[#0D2B45] sm:text-3xl">SGCST <span className="text-[#D89B00]">Admission</span></h1>
            <p className="mt-1 text-sm font-medium text-[#183B56] sm:text-base">Saint Gregory College of Science and Technology</p>
          </div>
          <a 
            href="/Home" 
            className="inline-flex min-h-10 items-center rounded-lg border border-[#c2410c] bg-[#e64b1b] px-4 text-sm font-bold text-white shadow-md transition-colors hover:border-[#ff9100] hover:bg-[#ff9100] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFB900] focus-visible:ring-offset-2 sm:px-3"
          >
            Logout
          </a>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-4 sm:mb-10 md:grid-cols-2 md:gap-6">
          
   
          <button 
            onClick={() => setActiveTab('admission')}
            className={`relative flex h-36 flex-col justify-between rounded-2xl border-2 p-6 text-left shadow-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#FFC107]/40 focus-visible:ring-offset-2 sm:h-40 sm:p-7 ${
              activeTab === 'admission' 
              ? 'border-[#E5A900] bg-[#FFC107] text-[#082B49] shadow-[0_8px_24px_rgba(13,43,69,0.12)]' 
              : 'border-[#DCE4ED] bg-white text-[#0D2B45] hover:border-[#E5A900] hover:shadow-md'
            }`}
          >
            <div className="flex justify-between items-start w-full">
              <i className="fas fa-file-signature text-2xl text-[#0D2B45] sm:text-3xl"></i>
              <span className={`text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-tighter ${
                isApproved ? 'bg-green-600 text-white' : (isSubmitted ? 'bg-amber-600 text-white' : 'bg-blue-600 text-white')
              }`}>
                {isApproved ? 'Locked' : (isSubmitted ? 'Submitted' : 'Open')}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-extrabold sm:text-2xl">Admission Form</h2>
              <p className="text-xs font-bold opacity-70 mt-1">
                Status: {isApproved ? 'Locked (Enrollment Phase Open)' : (isSubmitted ? 'Awaiting Review (Editable)' : 'Awaiting Submission')}
              </p>
            </div>
          </button>

          <button 
            onClick={() => setActiveTab('enrollment')}
            disabled={!isApproved}
            aria-disabled={!isApproved}
            className={`relative flex h-36 flex-col justify-between rounded-2xl border-2 p-6 text-left shadow-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#FFC107]/40 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-75 sm:h-40 sm:p-7 ${
              activeTab === 'enrollment' 
              ? 'border-[#E5A900] bg-[#FFC107] text-[#082B49] shadow-[0_8px_24px_rgba(13,43,69,0.12)]' 
              : 'border-[#DCE4ED] bg-white text-[#0D2B45]'
            }`}
          >
            <div className="flex justify-between items-start w-full">
              <i className="fas fa-university text-2xl text-[#0D2B45] sm:text-3xl"></i>
              <span className={`text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-tighter ${
                isApproved ? 'bg-green-600 text-white' : 'bg-slate-100 text-slate-400'
              }`}>
                {isApproved ? 'Unlocked' : 'Locked'}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-extrabold sm:text-2xl">Enrollment Form</h2>
              <p className="text-xs font-bold opacity-70 mt-1">Status: {isApproved ? 'Ready for Enlistment' : 'Unlock requires Registrar Approval'}</p>
            </div>
          </button>
        </div>

        <div className={`min-h-[600px] rounded-2xl border-2 bg-white p-5 shadow-[0_12px_40px_rgba(13,43,69,0.08)] transition-[border-color,box-shadow] duration-300 sm:p-8 lg:p-10 ${
          formValidation === "error"
            ? "border-red-500 shadow-[0_0_0_3px_rgba(239,68,68,0.18),0_0_28px_rgba(239,68,68,0.3)]"
            : formValidation === "success"
              ? "border-green-500 shadow-[0_0_0_3px_rgba(34,197,94,0.16),0_0_28px_rgba(34,197,94,0.3)]"
              : "border-[#E5ECF3]"
        }`}>
          
          {activeTab === 'admission' ? (
            <div className="animate-in fade-in duration-500">
              <div className="mb-8 border-b border-[#FFC107]/70 pb-5 sm:mb-10">
                <h3 className="text-xl font-bold text-[#0D2B45] sm:text-2xl">Personal Information</h3>
                <p className="mt-1 text-sm text-slate-500">
                  {isApproved ? "Enrollment is now active. Your admission profile has been archived and locked." : "Please provide accurate details for your application."}
                </p>
              </div>

              <form
                className="space-y-9"
                onSubmit={handleAdmissionSubmit}
                onInvalidCapture={() => setFormValidation("error")}
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <InputField label="First Name *" placeholder="Juan" disabled={isApproved} />
                  <InputField label="Middle Name" placeholder="Protacio" disabled={isApproved} />
                  <InputField label="Last Name *" placeholder="Dela Cruz" disabled={isApproved} />
                  <InputField label="Email Address *" type="email" placeholder="juan@example.com" disabled={isApproved} />
                  <InputField label="Phone Number *" placeholder="+63 9xx xxx xxxx" disabled={isApproved} />
                  <InputField label="Date of Birth *" type="date" disabled={isApproved} />
                  <SelectField label="Gender *" options={["Select Gender", "Male", "Female", "Other"]} disabled={isApproved} />
                  <InputField label="Nationality *" placeholder="Filipino" disabled={isApproved} />
                </div>

                <div>
                  <h4 className="mb-5 border-b border-[#FFC107]/70 pb-3 pt-2 text-sm font-extrabold uppercase tracking-wider text-[#B26C00]">Academic Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <SelectField label="Desired Track/Strand *" options={["Select a Track", "Information and Communication Technology", "Hotel and Restaurant Management"]} disabled={isApproved} />
                    <SelectField 
                      label="Enrollment Type *" 
                      options={["Select", "New Student", "Transferee"]} 
                      onChange={(e) => setEnrollmentType(e.target.value)}
                      disabled={isApproved}
                    />
                    
                    {enrollmentType === "Transferee" && (
                      <SelectField 
                        label="Grade Level *" 
                        options={["Select", "Grade 11", "Grade 12"]} 
                        disabled={isApproved}
                      />
                    )}
                    
                    <InputField label="LRN *" placeholder="12-digit LRN" disabled={isApproved} />
                    <InputField label="Last School Attended Name *" placeholder="School Name" disabled={isApproved} />
                    
                    {enrollmentType === "Transferee" && (
                      <SelectField label="Last School Attended Type *" options={["Select Type", "High School", "Junior High School", "Senior High School", "ALS"]} disabled={isApproved} />
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="mb-5 border-b border-[#FFC107]/70 pb-3 pt-2 text-sm font-extrabold uppercase tracking-wider text-[#B26C00]">Address Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2"><InputField label="Street Address *" placeholder="Unit/House No, Building, Street" disabled={isApproved} /></div>
                    <InputField label="City / Municipality *" placeholder="Manila" disabled={isApproved} />
                    <InputField label="State / Province *" placeholder="Metro Manila" disabled={isApproved} />
                    <InputField label="Zip / Postal Code *" placeholder="1000" disabled={isApproved} />
                    <InputField label="Country *" placeholder="Philippines" defaultValue="Philippines" disabled={isApproved} />
                  </div>
                </div>

                <div>
                  <h4 className="mb-5 border-b border-[#FFC107]/70 pb-3 pt-2 text-sm font-extrabold uppercase tracking-wider text-[#B26C00]">Requirements & Additional Info</h4>
                  <div className="space-y-6">
                    <div className="flex flex-col gap-2">
                      <label className="ml-0.5 text-xs font-semibold text-[#334155]">Personal Statement *</label>
                      <textarea rows={4} required disabled={isApproved} className={`w-full rounded-lg border border-[#DCE4ED] px-3.5 py-3 text-sm text-[#183B56] outline-none transition placeholder:text-slate-400 focus:border-[#D89B00] focus:ring-2 focus:ring-[#FFC107]/25 ${isApproved ? 'cursor-not-allowed bg-[#F1F6FC] text-slate-500' : 'bg-[#F8FAFC]'}`} placeholder="Why do you want to join SGCST?"></textarea>
                    </div>
                    <div className="rounded-xl border-2 border-dashed border-[#DCE4ED] bg-[#F8FAFC] p-6 text-center sm:p-8">
                      <i className="fas fa-upload mb-2 text-2xl text-[#D89B00]"></i>
                      <p className="text-sm font-bold text-[#183B56]">Required Documents *</p>
                      <p className="mb-4 text-xs text-slate-500">Upload Report Card and Birth Certificate (PDF, JPG, PNG)</p>
                      <button type="button" disabled={isApproved} className={`rounded-lg border border-[#DCE4ED] bg-white px-5 py-2.5 text-xs font-bold uppercase text-[#0D2B45] transition-colors ${isApproved ? 'cursor-not-allowed opacity-50' : 'hover:border-[#D89B00] hover:bg-[#FFF9E8]'}`}>Browse Files</button>
                    </div>
                    <label className={`flex items-center gap-3 group ${isApproved ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}>
                      <input type="checkbox" disabled={isApproved} checked={isApproved ? true : undefined} className="h-4 w-4 accent-[#0D2B45]" />
                      <span className="text-sm text-slate-600">I certify that all information provided is true and correct.</span>
                    </label>
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={isApproved}
                  className={`w-full rounded-lg py-4 font-extrabold uppercase tracking-widest transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#FFC107]/40 focus-visible:ring-offset-2 ${
                    isApproved 
                    ? 'cursor-not-allowed bg-slate-200 text-slate-500' 
                    : 'bg-[#FFC107] text-[#082B49] shadow-md hover:bg-[#E5A900]'
                  }`}
                >
                  {isApproved ? 'Admission Locked' : (isSubmitted ? 'Update Application Details' : 'Submit Application')}
                </button>
              </form>
            </div>
          ) : (

            <div className="animate-in fade-in duration-500">
              {isApproved ? (
                <div>
                  <div className="mb-8 border-b border-[#FFC107]/70 pb-5 sm:mb-10">
                    <h3 className="text-xl font-bold text-[#0D2B45] sm:text-2xl">Account Setup</h3>
                    <p className="mt-1 text-sm text-slate-500">Create your student portal access.</p>
                  </div>

                  <form className="space-y-10" onSubmit={(e) => e.preventDefault()}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <InputField label="Student ID" readOnly value="2026-0001" />
                      <div className="hidden md:block"></div>
                      <InputField label="Password *" type="password" placeholder="••••••••" />
                      <InputField label="Confirm Password *" type="password" placeholder="••••••••" />
                    </div>

                    <h4 className="mb-5 border-b border-[#FFC107]/70 pb-3 pt-2 text-sm font-extrabold uppercase tracking-wider text-[#B26C00]">Emergency Contact</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <InputField label="Contact Person *" placeholder="Full Name" />
                      <InputField label="Relationship *" placeholder="e.g. Guardian" />
                      <InputField label="Contact Number *" placeholder="+63 9xx xxx xxxx" />
                    </div>

                    <div className="pt-6">
                      <label className="flex items-center gap-3 cursor-pointer group mb-10">
                        <input type="checkbox" className="h-4 w-4 accent-[#0D2B45]" />
                        <span className="text-sm text-slate-600">I agree to the Data Privacy Policy and Enrollment Terms.</span>
                      </label>
                      <button type="submit" className="w-full rounded-lg bg-[#FFC107] py-4 font-extrabold uppercase tracking-widest text-[#082B49] shadow-md transition-all hover:bg-[#E5A900] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#FFC107]/40 focus-visible:ring-offset-2">
                        Submit Enrollment Form
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full border-2 border-dashed border-[#DCE4ED] bg-[#F8FAFC] text-[#D89B00]">
                    <i className="fas fa-lock text-3xl"></i>
                  </div>
                  <h3 className="mb-2 text-xl font-bold uppercase text-[#0D2B45]">Enrollment Locked</h3>
                  <p className="max-w-sm text-sm text-slate-500">Access is granted once the registrar approves your profile and <span className="font-bold text-[#0D2B45] underline decoration-[#FFC107]">Opens Enrollment</span>.</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mt-8 flex flex-col justify-center gap-3 border-t border-[#DCE4ED] pt-5 text-center sm:mt-10 sm:flex-row sm:gap-4">
           <p className="mb-2 block w-full text-xs font-bold text-slate-400 sm:mb-0">Testing Switches:</p>
           <button 
             onClick={handleEnrollmentToggle}
             className="text-[9px] font-bold uppercase tracking-[0.2em] text-green-600 transition-all hover:text-green-800"
           >
             {isApproved ? '🔒 Close Enrollment (Re-open Admission)' : '✅ Open Enrollment (Lock Admission Form)'}
           </button>
        </div>
      </div>
      {submissionNotice && (
        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="fixed inset-x-4 bottom-4 z-50 mx-auto flex max-w-lg items-start justify-between gap-4 rounded-lg border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-800 shadow-lg sm:inset-x-auto sm:right-6 sm:bottom-6"
        >
          <span>{submissionNotice}</span>
          <button
            type="button"
            onClick={() => setSubmissionNotice("")}
            className="shrink-0 rounded px-2 py-1 text-xs font-semibold hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current"
            aria-label="Dismiss notification"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
}
