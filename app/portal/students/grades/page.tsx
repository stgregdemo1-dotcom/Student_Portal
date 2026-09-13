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

      // Pass the selected parameters directly to the endpoint
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
                className="border border-gray-300 rounded-lg px-4 h-12 focus:outline-none focus:ring-2 focus:ring-indigo-400 w-full bg-white text-sm font-medium text-gray-800"
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
                className="border border-gray-300 rounded-lg px-4 h-12 focus:outline-none focus:ring-2 focus:ring-indigo-400 w-full bg-white text-sm font-medium text-gray-800"
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
            className="w-full md:w-auto px-8 h-12 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold rounded-lg transition-colors shadow-sm whitespace-nowrap"
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
        <table className="min-w-full divide-y divide-gray-200 text-left border border-gray-100 rounded-lg overflow-hidden">
          <thead className="bg-gray-50 text-gray-500 text-xs font-semibold uppercase tracking-wider">
            <tr>
              <th className="px-6 py-3">Subjects</th>
              <th className="px-6 py-3">Teacher</th>
              <th className="px-4 py-3 text-center">Prelim</th>
              <th className="px-4 py-3 text-center">Midterm</th>
              <th className="px-4 py-3 text-center">Pre-Final</th>
              <th className="px-4 py-3 text-center">Final</th>
              <th className="px-4 py-3 text-center text-indigo-700 bg-indigo-50/50">Average</th>
              <th className="px-6 py-3 text-center">Remarks</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-sm">
            {grades.length > 0 ? (
              grades.map((g, idx) => (
                <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{g.course}</td>
                  <td className="px-6 py-4 text-gray-600">{g.Teacher}</td>
                  <td className="px-4 py-4 text-center font-mono font-medium text-gray-700">{g.prelim}</td>
                  <td className="px-4 py-4 text-center font-mono font-medium text-gray-700">{g.midterm}</td>
                  <td className="px-4 py-4 text-center font-mono font-medium text-gray-700">{g.prefinal}</td>
                  <td className="px-4 py-4 text-center font-mono font-medium text-gray-700">{g.finals}</td>
                  <td className="px-4 py-4 text-center bg-indigo-50/20 font-black text-indigo-600">
                    <span className={`px-2 py-0.5 rounded ${g.grade === "—" ? "text-gray-400" : ""}`}>
                      {g.grade}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${
                      g.status === "Passed" ? "bg-green-100 text-green-800" :
                      g.status === "Failed" ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"
                    }`}>
                      {g.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="px-6 py-8 text-center text-sm text-gray-400 italic">
                  No registered subjects found for the selected matrix criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
        <h4 className="font-semibold text-blue-900">General Average: {generalAvg}</h4>
      </div>
    </div>
  );
}