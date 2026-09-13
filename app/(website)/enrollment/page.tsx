"use client";

import React, { useState } from "react";

interface InputFieldProps {
  label: string;
  type?: string;
  placeholder?: string;
  readOnly?: boolean;
  value?: string;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  type = "text",
  placeholder,
  readOnly,
  value,
}) => (
  <div className="flex flex-col gap-2">
    <label className="text-[10px] font-black uppercase text-slate-400 ml-1">
      {label}
    </label>

    <input
      type={type}
      placeholder={placeholder}
      readOnly={readOnly}
      value={value}
      className={`w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm ${
        readOnly
          ? "bg-slate-100 cursor-not-allowed text-slate-500 font-bold"
          : ""
      }`}
    />
  </div>
);

export default function EnrollmentForm() {
  const [isApproved] = useState(true);

  if (!isApproved) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <h1 className="text-2xl font-bold text-slate-400">
          Enrollment Locked
        </h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-[#1E293B] p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        <div className="mb-10 flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-black text-[#166534]">
              SGCST Enrollment
            </h1>

            <p className="text-slate-500 font-medium italic">
              Student Enrollment Portal
            </p>
          </div>

          <a
            href="/Home"
            className="text-sm font-bold text-slate-400 hover:text-red-600 transition-colors"
          >
            Back
          </a>
        </div>

        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl">
          <div className="mb-10 pb-4 border-b border-slate-100">
            <h3 className="text-2xl font-black text-[#166534]">
              Account Setup
            </h3>

            <p className="text-slate-400 text-sm">
              Create your student portal account.
            </p>
          </div>

          <form className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                label="Student ID"
                readOnly
                value="2026-0001"
              />

              <div className="hidden md:block"></div>

              <InputField
                label="Password *"
                type="password"
                placeholder="••••••••"
              />

              <InputField
                label="Confirm Password *"
                type="password"
                placeholder="••••••••"
              />
            </div>

            <h4 className="text-sm font-black text-amber-600 uppercase tracking-widest mb-6 pt-4">
              Emergency Contact
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <InputField
                label="Contact Person *"
                placeholder="Full Name"
              />

              <InputField
                label="Relationship *"
                placeholder="Guardian"
              />

              <InputField
                label="Contact Number *"
                placeholder="+63 9xx xxx xxxx"
              />
            </div>

            <button
              type="submit"
              className="w-full py-5 bg-[#166534] text-white rounded-2xl font-black hover:bg-[#14532d] transition-all shadow-xl uppercase tracking-widest"
            >
              Submit Enrollment Form
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}