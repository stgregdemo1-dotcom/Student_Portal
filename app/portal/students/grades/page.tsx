"use client";

import { useState, useEffect } from "react";

export default function GradesPage() {
  const [grades, setGrades] = useState<any[]>([]);
  const [generalAvg, setGeneralAvg] = useState<string>("—");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");
  const [availableYears, setAvailableYears] = useState<string[]>([]);

  useEffect(() => {
    async function loadDropdownYears() {
      try {
        const res = await fetch("/api/portal/student?getYearsOnly=true");
        const json = await res.json();
        if (res.ok && json.success) {
          setAvailableYears(json.data || []);
        }
      } catch (err) {
        console.error("Failed to load setup parameters from database:", err);
      }
    }
    loadDropdownYears();
  }, []);

  const handleFetchGrades = async () => {
    if (!selectedYear || !selectedSemester) {
      setError("Please select both a School Year and Semester to filter grades.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await fetch(
        `/api/portal/student?year=${encodeURIComponent(selectedYear)}&semester=${encodeURIComponent(selectedSemester)}`
      );
      const jsonResponse = await res.json();

      if (res.ok && jsonResponse.success) {
        setGrades(jsonResponse.data.subjects || []);
        setGeneralAvg(String(jsonResponse.data.average));
      } else {
        setError(jsonResponse.message || "Failed to load grade profiles.");
      }
    } catch (err) {
      setError("A connection error occurred while querying the server database ledger.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Grades Management</h3>

        <div className="flex flex-col md:flex-row items-end gap-4">
          <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">School Year</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="h-12 w-full cursor-pointer rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-gray-800 transition-all hover:border-[#d99a00] hover:shadow-sm focus:outline-none focus:border-[#d99a00] focus:ring-2 focus:ring-[#d99a00]/40"
                required
              >
                <option value="">Select School Year</option>
                {availableYears.map((yr) => (
                  <option key={yr} value={yr}>{yr}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Semester</label>
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                className="h-12 w-full cursor-pointer rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-gray-800 transition-all hover:border-[#d99a00] hover:shadow-sm focus:outline-none focus:border-[#d99a00] focus:ring-2 focus:ring-[#d99a00]/40"
                required
              >
                <option value="">Select Semester</option>
                <option value="1st Semester">1st Semester</option>
                <option value="2nd Semester">2nd Semester</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleFetchGrades}
            disabled={loading}
            className="flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#082b49] px-8 font-bold text-white shadow-md transition-all hover:bg-[#0b3b62] hover:shadow-lg active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#082b49] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-400 disabled:shadow-sm md:w-auto whitespace-nowrap"
          >
            {loading ? "Loading..." : "Show Grades"}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-xs font-semibold border border-red-100">
          {error}
        </div>
      )}

      <h3 className="text-lg font-semibold text-gray-800 mb-4">Student Grades</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 overflow-hidden rounded-lg border border-slate-200 text-left">
          <thead className="bg-[#fff8e4] text-xs font-semibold uppercase tracking-wider text-[#425466]">
            <tr>
              <th className="px-6 py-3">Subjects</th>
              <th className="px-6 py-3">Teacher</th>
              <th className="px-4 py-3 text-center">1st</th>
              <th className="px-4 py-3 text-center">2nd</th>
              <th className="bg-[#fff0c2] px-4 py-3 text-center text-[#805600]">Average</th>
              <th className="px-6 py-3 text-center">Remarks</th>
              <th className="px-6 py-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-sm">
            {grades.length > 0 ? (
              grades.map((g, idx) => (
                <tr key={idx} className="transition-colors hover:bg-[#fffaf0]">
                  <td className="px-6 py-4 font-medium text-gray-900">{g.course}</td>
                  <td className="px-6 py-4 text-gray-600">{g.Teacher}</td>
                  <td className="px-4 py-4 text-center font-mono font-medium text-gray-700">{g.grade_1}</td>
                  <td className="px-4 py-4 text-center font-mono font-medium text-gray-700">{g.grade_2}</td>
                  <td className="bg-amber-50/50 px-4 py-4 text-center font-black text-[#805600]">
                    <span className={`px-2 py-0.5 rounded ${g.grade === "—" ? "text-gray-400" : ""}`}>
                      {g.grade}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${
                      g.remarks === "Passed" ? "bg-green-100 text-green-800" :
                      g.remarks === "Failed" ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"
                    }`}>
                      {g.remarks}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${
                      g.status === "Active" ? "bg-green-100 text-green-800" :
                      g.status === "Evaluating" ? "bg-amber-100 text-amber-800" : "bg-gray-100 text-gray-800"
                    }`}>
                      {g.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-sm text-gray-400 italic">
                  No registered subjects found for the selected matrix criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6 rounded-lg border border-amber-200 bg-[#fff8e4] p-4">
        <h4 className="font-semibold text-[#082b49]">General Average: {generalAvg}</h4>
      </div>
    </div>
  );
}
