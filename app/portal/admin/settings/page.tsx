"use client";

import React, { useState, useEffect } from "react";

interface DropdownConfig {
  section: string[];
  room: string[];
  employee_status: string[];
  employee_role: string[];
  prefix: string[];
  specification: string[];
  admission_button: boolean | string[];
  submit_final_grade: boolean | string[];
}

type ToggleField = "admission_button" | "submit_final_grade";
type ListField =
  | "section"
  | "room"
  | "employee_status"
  | "employee_role"
  | "prefix"
  | "specification";

export default function SettingsConfigPage() {
  const [config, setConfig] = useState<DropdownConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [inputs, setInputs] = useState<Record<string, string>>({
    section: "",
    room: "",
    employee_status: "",
    employee_role: "",
    prefix: "",
    specification: "",
  });

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/portal/admin?table=configuration");
      if (res.ok) {
        const data = await res.json();
        setConfig(data);
      }
    } catch (err) {
      console.error("Error reading setup variables:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleAddOption = async (field: ListField) => {
    const valueToAdd = inputs[field]?.trim();
    if (!valueToAdd) return;

    try {
      const res = await fetch("/api/portal/admin?table=configuration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "add", field, value: valueToAdd }),
      });

      if (res.ok) {
        const jsonResponse = await res.json();
        setConfig(jsonResponse.data);
        setInputs({ ...inputs, [field]: "" });
      }
    } catch (err) {
      console.error("Failed to append configuration option:", err);
    }
  };

  const handleRemoveOption = async (
    field: ListField,
    valueToRemove: string
  ) => {
    try {
      const res = await fetch("/api/portal/admin?table=configuration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "remove",
          field,
          value: valueToRemove,
        }),
      });

      if (res.ok) {
        const jsonResponse = await res.json();
        setConfig(jsonResponse.data);
      }
    } catch (err) {
      console.error("Failed to eliminate variable tag:", err);
    }
  };

  // =========================================================================
  // UNIFIED TOGGLE LOGIC
  // =========================================================================

  const getToggleStatus = (field: ToggleField): boolean => {
    if (!config) return false;
    const val = config[field];

    if (typeof val === "boolean") return val;
    if (typeof val === "string") return val === "true";
    if (Array.isArray(val)) {
      if (val.length === 0) return false;
      return val.includes("true") || val.includes(true as any);
    }
    return false;
  };

  const handleToggleSetting = async (field: ToggleField) => {
    const currentStatus = getToggleStatus(field);
    const nextStatus = !currentStatus;

    // 1. Instant optimistic update
    setConfig((prev) => (prev ? { ...prev, [field]: nextStatus } : prev));

    try {
      const res = await fetch("/api/portal/admin?table=configuration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "set",
          field: field,
          value: nextStatus,
        }),
      });

      const result = await res.json();

      if (res.ok && result?.data) {
        // 2. Sync with verified server document
        setConfig(result.data);
      } else {
        console.error(`API error updating ${field}:`, result?.message);
        // Revert UI on failure
        setConfig((prev) => (prev ? { ...prev, [field]: currentStatus } : prev));
      }
    } catch (error) {
      console.error(`Network error updating ${field}:`, error);
      // Revert UI on failure
      setConfig((prev) => (prev ? { ...prev, [field]: currentStatus } : prev));
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center text-gray-500 animate-pulse">
        Loading System Configurations...
      </div>
    );
  }

  // Strictly typed list sections
  const listSections: Array<{
    id: ListField;
    title: string;
    placeholder: string;
  }> = [
    { id: "section", title: "Sections", placeholder: "e.g., ICT-1A" },
    { id: "room", title: "Rooms", placeholder: "e.g., Computer Lab 1" },
    {
      id: "employee_status",
      title: "Employee Status",
      placeholder: "e.g., Active, Inactive",
    },
    {
      id: "employee_role",
      title: "Employee Role",
      placeholder: "e.g., Teacher, Department Head",
    },
    { id: "prefix", title: "Prefix", placeholder: "e.g., Mr., Mrs." },
    {
      id: "specification",
      title: "Specification",
      placeholder: "e.g., Core, Applied",
    },
  ];

  // Strictly typed toggle sections
  const toggleSections: Array<{
    id: ToggleField;
    title: string;
    description: string;
  }> = [
    {
      id: "admission_button",
      title: "Admission Button",
      description:
        "Enable or disable the public admission button on registration portals.",
    },
    {
      id: "submit_final_grade",
      title: "Submit Final Grade Button",
      description:
        "Enable or disable faculty access to the final grade submission button.",
    },
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8 font-sans">
      <div>
        <h2 className="text-2xl font-black text-gray-800 tracking-tight">
          System Global Configurations
        </h2>
        <p className="text-sm text-gray-500">
          Append or delete options used across dynamic registration portals.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Render Toggle Controls */}
        {toggleSections.map((sec) => {
          const isEnabled = getToggleStatus(sec.id);

          return (
            <div
              key={sec.id}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between space-y-4"
            >
              <div>
                <h3 className="text-md font-bold text-gray-700 border-b pb-2 mb-3">
                  {sec.title}
                </h3>
                <p className="text-xs text-gray-500 mb-4">{sec.description}</p>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-sm font-semibold text-gray-700">
                  Status:{" "}
                  <span
                    className={
                      isEnabled
                        ? "text-emerald-600 font-bold"
                        : "text-gray-400"
                    }
                  >
                    {isEnabled ? "Enabled" : "Disabled"}
                  </span>
                </span>

                <button
                  type="button"
                  onClick={() => handleToggleSetting(sec.id)}
                  className={`relative inline-flex h-7 w-14 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    isEnabled ? "bg-emerald-500" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      isEnabled ? "translate-x-7" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>
          );
        })}

        {/* Render Array Options */}
        {listSections.map((sec) => (
          <div
            key={sec.id}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between space-y-4"
          >
            <div>
              <h3 className="text-md font-bold text-gray-700 border-b pb-2 mb-3">
                {sec.title}
              </h3>

              <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto p-1">
                {Array.isArray(config?.[sec.id]) &&
                  (config[sec.id] as string[]).map((item) => (
                    <span
                      key={item}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-700 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors group cursor-pointer"
                      onClick={() => handleRemoveOption(sec.id, item)}
                      title="Click to remove option"
                    >
                      {item}
                      <span className="text-slate-400 group-hover:text-red-500 font-bold">
                        ✕
                      </span>
                    </span>
                  ))}
                {Array.isArray(config?.[sec.id]) &&
                  (config[sec.id] as string[]).length === 0 && (
                    <span className="text-xs text-gray-400 italic">
                      No options defined.
                    </span>
                  )}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <input
                type="text"
                placeholder={sec.placeholder}
                value={inputs[sec.id] || ""}
                onChange={(e) =>
                  setInputs({ ...inputs, [sec.id]: e.target.value })
                }
                onKeyDown={(e) =>
                  e.key === "Enter" && handleAddOption(sec.id)
                }
                className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-xl outline-none focus:border-blue-500 bg-slate-50"
              />
              <button
                type="button"
                onClick={() => handleAddOption(sec.id)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold uppercase transition"
              >
                Add
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}