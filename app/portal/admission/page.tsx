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
}

interface SelectFieldProps {
  label: string;
  options: string[];
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  disabled?: boolean;
}

// --- Helper Components ---
const InputField: React.FC<InputFieldProps> = ({ label, type = "text", placeholder, defaultValue, readOnly, value, disabled }) => (
  <div className="flex flex-col gap-2">
    <label className="text-[10px] font-black uppercase text-slate-400 ml-1">{label}</label>
    <input 
      type={type} 
      placeholder={placeholder} 
      defaultValue={defaultValue}
      readOnly={readOnly}
      value={value}
      disabled={disabled}
      className={`w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-yellow-400 transition-all text-sm placeholder:text-slate-300 ${readOnly || disabled ? 'bg-slate-100 cursor-not-allowed text-slate-500 font-bold' : ''}`} 
    />
  </div>
);

const SelectField: React.FC<SelectFieldProps> = ({ label, options, onChange, disabled }) => (
  <div className="flex flex-col gap-2">
    <label className="text-[10px] font-black uppercase text-slate-400 ml-1">{label}</label>
    <div className="relative">
      <select 
        onChange={onChange}
        disabled={disabled}
        className={`w-full p-4 border border-slate-200 rounded-xl outline-none transition-all appearance-none text-sm text-slate-700 ${disabled ? 'bg-slate-100 cursor-not-allowed text-slate-400' : 'bg-slate-50 focus:border-yellow-400'}`}
      >
        {options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
      </select>
      <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">
        <i className="fas fa-chevron-down text-xs"></i>
      </div>
    </div>
  </div>
);


export default function AdmissionDashboard() {
  const [activeTab, setActiveTab] = useState<'admission' | 'enrollment'>('admission');
  const [isApproved, setIsApproved] = useState<boolean>(false); // This controls when Enrollment opens AND when Admission locks
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [enrollmentType, setEnrollmentType] = useState<string>("");

  const handleAdmissionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    alert("Application submitted successfully! You can still make changes until enrollment is officially opened.");
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-[#1E293B] p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        

        <div className="mb-10 flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-black text-[#451a03] tracking-tight text-uppercase">SGCST Admission</h1>
            <p className="text-slate-500 font-medium italic">Saint Gregory College of Science and Technology</p>
          </div>
          <a 
            href="/Home" 
            className="text-sm font-bold text-slate-400 hover:text-red-600 transition-colors flex items-center"
          >
            Back
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          
   
          <button 
            onClick={() => setActiveTab('admission')}
            className={`relative p-8 rounded-2xl border-2 transition-all text-left flex flex-col justify-between h-48 shadow-sm ${
              activeTab === 'admission' 
              ? 'bg-yellow-400 border-yellow-500 text-yellow-950 ring-4 ring-yellow-100' 
              : 'bg-white border-slate-200 text-slate-400'
            }`}
          >
            <div className="flex justify-between items-start w-full">
              <i className="fas fa-file-signature text-3xl"></i>
              <span className={`text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-tighter ${
                isApproved ? 'bg-green-600 text-white' : (isSubmitted ? 'bg-amber-600 text-white' : 'bg-blue-600 text-white')
              }`}>
                {isApproved ? 'Locked' : (isSubmitted ? 'Submitted' : 'Open')}
              </span>
            </div>
            <div>
              <h2 className="text-2xl font-black">Admission Form</h2>
              <p className="text-xs font-bold opacity-70 mt-1">
                Status: {isApproved ? 'Locked (Enrollment Phase Open)' : (isSubmitted ? 'Awaiting Review (Editable)' : 'Awaiting Submission')}
              </p>
            </div>
          </button>

          <button 
            onClick={() => setActiveTab('enrollment')}
            className={`relative p-8 rounded-2xl border-2 transition-all text-left flex flex-col justify-between h-48 shadow-sm ${
              activeTab === 'enrollment' 
              ? 'bg-yellow-400 border-yellow-500 text-yellow-950 ring-4 ring-yellow-100' 
              : 'bg-white border-slate-200 text-slate-400'
            }`}
          >
            <div className="flex justify-between items-start w-full">
              <i className="fas fa-university text-3xl"></i>
              <span className={`text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-tighter ${
                isApproved ? 'bg-green-600 text-white' : 'bg-slate-100 text-slate-400'
              }`}>
                {isApproved ? 'Unlocked' : 'Locked'}
              </span>
            </div>
            <div>
              <h2 className="text-2xl font-black">Enrollment Form</h2>
              <p className="text-xs font-bold opacity-70 mt-1">Status: {isApproved ? 'Ready for Enlistment' : 'Unlock requires Registrar Approval'}</p>
            </div>
          </button>
        </div>

        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl shadow-slate-200/50 min-h-[600px]">
          
          {activeTab === 'admission' ? (
            <div className="animate-in fade-in duration-500">
              <div className="mb-10 pb-4 border-b border-slate-100">
                <h3 className="text-2xl font-black text-[#451a03]">Personal Information</h3>
                <p className="text-slate-400 text-sm">
                  {isApproved ? "Enrollment is now active. Your admission profile has been archived and locked." : "Please provide accurate details for your application."}
                </p>
              </div>

              <form className="space-y-10" onSubmit={handleAdmissionSubmit}>
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
                  <h4 className="text-sm font-black text-amber-600 uppercase tracking-widest mb-6 pt-4">Academic Information</h4>
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
                    
                    <InputField label="LRN" placeholder="12-digit LRN" disabled={isApproved} />
                    <InputField label="Last School Attended Name *" placeholder="School Name" disabled={isApproved} />
                    
                    {enrollmentType === "Transferee" && (
                      <SelectField label="Last School Attended Type *" options={["Select Type", "High School", "Junior High School", "Senior High School", "ALS"]} disabled={isApproved} />
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-black text-amber-600 uppercase tracking-widest mb-6 pt-4">Address Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2"><InputField label="Street Address *" placeholder="Unit/House No, Building, Street" disabled={isApproved} /></div>
                    <InputField label="City / Municipality *" placeholder="Manila" disabled={isApproved} />
                    <InputField label="State / Province *" placeholder="Metro Manila" disabled={isApproved} />
                    <InputField label="Zip / Postal Code *" placeholder="1000" disabled={isApproved} />
                    <InputField label="Country *" placeholder="Philippines" defaultValue="Philippines" disabled={isApproved} />
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-black text-amber-600 uppercase tracking-widest mb-6 pt-4">Requirements & Additional Info</h4>
                  <div className="space-y-6">
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Personal Statement *</label>
                      <textarea rows={4} disabled={isApproved} className={`w-full p-4 border border-slate-200 rounded-xl outline-none transition-all text-sm ${isApproved ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : 'bg-slate-50 focus:border-yellow-400'}`} placeholder="Why do you want to join SGCST?"></textarea>
                    </div>
                    <div className="p-8 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 text-center">
                      <i className="fas fa-upload text-2xl text-slate-300 mb-2"></i>
                      <p className="text-sm font-bold text-slate-600">Required Documents *</p>
                      <p className="text-xs text-slate-400 mb-4">Upload Report Card and Birth Certificate (PDF, JPG, PNG)</p>
                      <button type="button" disabled={isApproved} className={`px-6 py-2 bg-white border border-slate-300 rounded-lg text-[10px] font-black uppercase ${isApproved ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-50'}`}>Browse Files</button>
                    </div>
                    <label className={`flex items-center gap-3 group ${isApproved ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}>
                      <input type="checkbox" disabled={isApproved} checked={isApproved ? true : undefined} className="w-5 h-5 accent-yellow-500 rounded" />
                      <span className="text-xs font-medium text-slate-500">I certify that all information provided is true and correct.</span>
                    </label>
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={isApproved}
                  className={`w-full py-5 rounded-2xl font-black transition-all shadow-xl uppercase tracking-widest ${
                    isApproved 
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none' 
                    : 'bg-[#451a03] text-white hover:bg-[#2d1102]'
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
                  <div className="mb-10 pb-4 border-b border-slate-100">
                    <h3 className="text-2xl font-black text-[#451a03]">Account Setup</h3>
                    <p className="text-slate-400 text-sm">Create your student portal access.</p>
                  </div>

                  <form className="space-y-10" onSubmit={(e) => e.preventDefault()}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <InputField label="Student ID" readOnly value="2026-0001" />
                      <div className="hidden md:block"></div>
                      <InputField label="Password *" type="password" placeholder="••••••••" />
                      <InputField label="Confirm Password *" type="password" placeholder="••••••••" />
                    </div>

                    <h4 className="text-sm font-black text-amber-600 uppercase tracking-widest mb-6 pt-4">Emergency Contact</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <InputField label="Contact Person *" placeholder="Full Name" />
                      <InputField label="Relationship *" placeholder="e.g. Guardian" />
                      <InputField label="Contact Number *" placeholder="+63 9xx xxx xxxx" />
                    </div>

                    <div className="pt-6">
                      <label className="flex items-center gap-3 cursor-pointer group mb-10">
                        <input type="checkbox" className="w-5 h-5 accent-green-600 rounded" />
                        <span className="text-xs font-medium text-slate-500">I agree to the Data Privacy Policy and Enrollment Terms.</span>
                      </label>
                      <button type="submit" className="w-full py-5 bg-[#166534] text-white rounded-2xl font-black hover:bg-[#14532d] transition-all shadow-xl uppercase tracking-widest">
                        Submit Enrollment Form
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6 text-slate-300 border-2 border-dashed border-slate-200">
                    <i className="fas fa-lock text-3xl"></i>
                  </div>
                  <h3 className="text-xl font-bold text-slate-400 mb-2 uppercase">Enrollment Locked</h3>
                  <p className="text-slate-400 max-w-sm text-sm">Access is granted once the registrar approves your profile and <span className="text-[#451a03] font-black underline decoration-yellow-400">Opens Enrollment</span>.</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mt-12 text-center flex flex-col sm:flex-row justify-center gap-4 border-t border-slate-200 pt-6">
           <p className="w-full text-xs font-bold text-slate-400 block mb-2 sm:mb-0">Testing Switches:</p>
           <button 
             onClick={() => setIsApproved(!isApproved)}
             className="text-[9px] font-bold text-green-600 hover:text-green-800 uppercase tracking-[0.2em] transition-all"
           >
             {isApproved ? '🔒 Close Enrollment (Re-open Admission)' : '✅ Open Enrollment (Lock Admission Form)'}
           </button>
        </div>
      </div>
    </div>
  );
}