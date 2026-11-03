"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { startNavigationLoading } from "../../-components/startNavigationLoading";

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

        localStorage.setItem("enrollment_control_number", confirmedId);
        sessionStorage.setItem(
          "enrollment_application",
          JSON.stringify(data.application),
        );

        document.cookie = `enrollment_control_number=${confirmedId}; path=/; max-age=3600; SameSite=Strict`;

        startNavigationLoading("/admission/enrollment");
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
    <form onSubmit={checkAccess} className="relative w-full max-w-sm rounded-2xl border border-slate-100 bg-white p-8 pt-16 text-center shadow-[0_12px_40px_rgba(13,43,69,0.12)]">
      <Link
        href="/Home"
        prefetch
        className="absolute left-5 top-5 inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#082B49]/20 bg-white text-[#082B49] shadow-sm transition-[transform,background-color,color,box-shadow] duration-200 hover:-translate-y-0.5 hover:bg-[#FFC107] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#082B49] focus-visible:ring-offset-2"
        aria-label="Home"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m3 10 9-7 9 7" />
          <path d="M5 9v11h14V9M9 20v-6h6v6" />
        </svg>
      </Link>
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
        className="w-full cursor-pointer rounded-lg border border-[#0D2B45] bg-[#0D2B45] py-3 font-bold text-white shadow-md transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:border-[#D89B00] hover:bg-[#FFC107] hover:text-[#0D2B45] hover:shadow-lg active:translate-y-0 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFC107] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:border-[#0D2B45] disabled:hover:bg-[#0D2B45] disabled:hover:text-white disabled:hover:shadow-md disabled:active:scale-100 motion-reduce:transition-none"
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

export default function Page() {
  return (
    <div className="flex min-h-[calc(100svh-96px)] items-center justify-center bg-[radial-gradient(ellipse_at_8%_46%,rgba(255,193,7,0.22),transparent_30%),radial-gradient(ellipse_at_92%_64%,rgba(71,153,220,0.20),transparent_32%),linear-gradient(135deg,#EEF5FF_0%,#FFF8E8_48%,#EAF3FF_100%)] px-4 py-6 max-md:min-h-[calc(100svh-84px)]">
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
