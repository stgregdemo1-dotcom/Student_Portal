"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function EnrolleeDetailsPage() {
  const router = useRouter();
  const [enrollee, setEnrollee] = useState<any>(null); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const res = await fetch("/api/portal/student");
        const jsonResponse = await res.json();

        if (res.ok && jsonResponse.success) {
          setEnrollee(jsonResponse.data);
        } else {
          setError(jsonResponse.message || "Failed to load profile details.");
        }
      } catch (err) {
        console.error("Pipeline layout connection failure:", err);
        setError("A network fault occurred while reading configuration profiles.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-gray-400 font-medium animate-pulse">Loading secure profile state...</p>
      </div>
    );
  }

  if (error || !enrollee) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-4">
        <div className="text-center space-y-4">
          <p className="text-red-500 font-semibold">{error || "Access Denied"}</p>
          <button onClick={() => router.push("/login")} className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold">
            Go to Login Portal
          </button>
        </div>
      </div>
    );
  }

  const initialLetters = `${enrollee.first_name?.[0] || ""}${enrollee.last_name?.[0] || ""}`;

  return (
    <div className="min-h-screen bg-gray-50/50 px-4 py-12 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-center gap-6">
          <div className="w-24 h-24 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-3xl font-black shadow-lg shadow-indigo-100 uppercase">
            {initialLetters}
          </div>
          <div className="text-center md:text-left flex-1">
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">
              {enrollee.first_name} {enrollee.middle_name ? `${enrollee.middle_name} ` : ""}{enrollee.last_name}
            </h1>
            <p className="text-indigo-600 font-bold text-sm uppercase tracking-wide">{enrollee.track || "N/A"}</p>
            <p className="text-gray-400 text-xs mt-1 font-mono uppercase">Student ID: {enrollee.student_id}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          
          <Card title="Personal Details">
            <Grid>
              <Field label="Email Address" value={enrollee.email_address} />
              <Field label="Contact Number" value={enrollee.contact_number} />
              <Field label="Birth Date" value={enrollee.date_of_birth} />
              <Field label="Gender" value={enrollee.gender} />
              <Field label="Nationality" value={enrollee.nationality} />
            </Grid>
          </Card>

          <Card title="Academic History">
            <Grid>
              <Field label="Secondary School" value={enrollee.secondary_school} />
              <Field label="Graduation Year" value={enrollee.graduation_year} />
              <Field label="Grade Level" value={enrollee.gradeLevel} />
              <Field label="Course / Program Track" value={enrollee.track} />
            </Grid>
          </Card>

          <Card title="Contact & Emergency">
            <Grid>
              <div className="md:col-span-2">
                <Field label="Residential Address" value={enrollee.residential_address} />
              </div>
              <div className="md:col-span-2 mt-4 p-5 bg-gray-50 rounded-2xl border border-gray-100">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 text-center md:text-left">
                  In Case of Emergency
                </label>
                <div className="flex flex-col md:flex-row justify-between items-center gap-2">
                  <span className="text-sm font-bold text-gray-800">
                    {enrollee.emergency_contact_person || "Not Provided"}
                  </span>
                  <span className="text-sm font-bold text-gray-800">
                    {enrollee.emergency_contact_relationship || "Not Provided"}
                  </span>
                  {enrollee.emergency_contact_number && (
                    <span className="text-sm font-mono font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg">
                      {enrollee.emergency_contact_number}
                    </span>
                  )}
                </div>
              </div>
            </Grid>
          </Card>

          <Card title="Others">
            <div>
              <Grid>            
                <Field label="Enrollment Status" value={enrollee.status} />
                <Field label="Assigned Section" value={enrollee.assigned_section} />
                <Field label="Academic Year" value={enrollee.academic_year} />
                <Field label="Semester" value={enrollee.semester ? `${enrollee.semester}${enrollee.semester === "1" ? "st" : "nd"} Semester` : "—"} />
              </Grid>
            </div>
          </Card>

        </div>
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
      <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-6 border-b border-gray-50 pb-4">
        {title}
      </h2>
      {children}
    </div>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid md:grid-cols-2 gap-x-12 gap-y-6">{children}</div>;
}

function Field({ label, value }: { label: string; value: any }) {
  return (
    <div>
      <label className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block mb-1">
        {label}
      </label>
      <p className="text-sm font-semibold text-gray-800">
        {value || "Not provided"}
      </p>
    </div>
  );
}