"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

// 1. Form component that consumes useSearchParams()
function AccessControlForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const urlControlNumber = searchParams.get("controlNumber") || "";

  const [controlNumber, setControlNumber] = useState("");
  const [dateofbirth, setDateOfBirth] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (urlControlNumber) {
      setControlNumber(urlControlNumber);
    }
  }, [urlControlNumber]);

  const checkAccess = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!controlNumber || !dateofbirth) {
      setErrorMsg("Please fill in all requested fields.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/admission/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          controlNumber: controlNumber,
          dateOfBirth: dateofbirth,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        const confirmedId = data.applicantId;

        // Save to LocalStorage
        localStorage.setItem("enrollment_control_number", confirmedId);

        // Save to Session Cookie
        document.cookie = `enrollment_control_number=${confirmedId}; path=/; max-age=3600; SameSite=Strict`;

        // Redirect
        router.push("/admission/enrollment");
      } else {
        setErrorMsg(data.message || "Verification failed. Access denied.");
      }
    } catch (err) {
      console.error("Network verification roundtrip fault:", err);
      setErrorMsg("A network communication problem occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={checkAccess} className="w-full max-w-sm bg-white p-8 rounded-lg shadow-lg text-center">
      <h1 className="text-3xl font-bold text-gray-800 mb-5">
        Access Control
      </h1>

      <p className="text-gray-600 mb-4 text-sm">
        Please enter your control number:
      </p>

      <input
        type="text"
        placeholder="e.g., ID-2026-00001"
        disabled={loading}
        value={controlNumber}
        onChange={(e) => {
          setControlNumber(e.target.value);
          setErrorMsg(null);
        }}
        className="w-full px-4 py-2 border border-gray-300 rounded-md mb-4 outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-60 text-center"
      /> 

      <p className="text-gray-600 mb-4 text-sm">
        Please enter your date of birth:
      </p>

      <input
        type="date"
        disabled={loading}
        value={dateofbirth}
        onChange={(e) => {
          setDateOfBirth(e.target.value);
          setErrorMsg(null);
        }}
        className="w-full px-4 py-2 border border-gray-300 rounded-md mb-4 outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-60 text-center"
      /> 

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-md transition duration-200 font-semibold disabled:opacity-50"
      >
        {loading ? "Verifying Profile..." : "Submit"}
      </button>

      {errorMsg && (
        <div className="text-red-500 mt-4 text-xs bg-red-50 p-3 rounded-lg border border-red-100 font-medium">
          {errorMsg}
        </div>
      )}
    </form>
  );
}

// 2. Main export page wrapped in a Suspense boundary
export default function Page() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <Suspense
        fallback={
          <div className="w-full max-w-sm bg-white p-8 rounded-lg shadow-lg text-center animate-pulse text-gray-400">
            Loading verification controls...
          </div>
        }
      >
        <AccessControlForm />
      </Suspense>
    </div>
  );
}