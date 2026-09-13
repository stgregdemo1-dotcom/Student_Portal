"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function SetPasswordVerificationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Captures "?id=XXXX" passing down from the setup email link payload
  const urlTeacherId = searchParams.get("id") || "";

  const [teacherId, setTeacherId] = useState("");
  const [securityCode, setSecurityCode] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (urlTeacherId) {
      setTeacherId(urlTeacherId);
    }
  }, [urlTeacherId]);

  const checkAccess = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!teacherId || !securityCode) {
      setErrorMsg("Please fill in all requested fields.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/set-password/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teacherId: teacherId.trim(),
          securityCode: securityCode.trim(),
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // ✅ CACHING VALUES HERE FOR LATER USE
        localStorage.setItem("cached_teacher_id", teacherId.trim());
        localStorage.setItem("cached_security_code", securityCode.trim());
        localStorage.setItem("cached_mongo_id", String(data.applicantId));

        // Forward user straight to creation interface view
        router.push(`/set-password/setup`);
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
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <form onSubmit={checkAccess} className="w-full max-w-sm bg-white p-8 rounded-lg shadow-lg text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-5">
          Verify Identity
        </h1>

        <p className="text-gray-600 mb-4 text-sm">
          Please enter your teacher id:
        </p>

        <input
          type="text"
          placeholder=""
          disabled={loading}
          value={teacherId}
          onChange={(e) => {
            setTeacherId(e.target.value);
            setErrorMsg(null);
          }}
          className="w-full px-4 py-2 border border-gray-300 rounded-md mb-4 outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-60 text-center text-gray-800"
        /> 

        <p className="text-gray-600 mb-4 text-sm">
          Please enter your security code:
        </p>

        <input
          type="text"
          placeholder=""
          disabled={loading}
          value={securityCode}
          onChange={(e) => {
            setSecurityCode(e.target.value);
            setErrorMsg(null);
          }}
          className="w-full px-4 py-2 border border-gray-300 rounded-md mb-4 outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-60 text-center text-gray-800"
        /> 

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-md transition duration-200 font-semibold disabled:opacity-50"
        >
          {loading ? "Verifying Profile..." : "Submit Verification"}
        </button>

        {errorMsg && (
          <div className="text-red-500 mt-4 text-xs bg-red-50 p-3 rounded-lg border border-red-100 font-medium">
            {errorMsg}
          </div>
        )}
      </form>
    </div>
  );
}

export default function SetPasswordVerificationPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4 text-gray-500">
          Loading verification page...
        </div>
      }
    >
      <SetPasswordVerificationContent />
    </Suspense>
  );
}