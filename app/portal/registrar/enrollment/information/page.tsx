"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface StudentData {
  _id: string; 
  student_id: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  status: string;
  email_address: string;
  contact_number: string;
  date_of_birth: string;
  gender: string;
  nationality: string;
  secondary_school: string;
  graduation_year: string;
  gpa: string;
  track: string;
  residential_address: string;
  emergency_contact_person: string;
  emergency_contact_relationship: string;
  emergency_contact_number: string;
}

function StudentDetailsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const studentId = searchParams.get("id"); 

  const [student, setStudent] = useState<StudentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchStudentDetails = useCallback(async () => {
    if (!studentId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/portal/registrar?table=students&id=${studentId}`);
      if (res.ok) {
        const jsonResponse = await res.json();
        setStudent(jsonResponse.data || jsonResponse || null);
      } else {
        console.error("Failed to load document profile.");
      }
    } catch (err) {
      console.error("Error loading student record details:", err);
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    fetchStudentDetails();
  }, [fetchStudentDetails]);

  const updateStatus = async (newStatus: "Enrolled" | "Rejected") => {
    if (!student) return;
    setActionLoading(true);
    try {
      const res = await fetch("/api/portal/registrar?table=students", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ student_id: student.student_id, status: newStatus }),
      });

      if (res.ok) {
        setStudent((prev) => prev ? { ...prev, status: newStatus } : null);
        
        const emailSubject = newStatus === "Enrolled" 
          ? "Enrollment Update: Application Approved! 🎉" 
          : "Enrollment Update: Application Status Profile";

        const emailHtmlContent = newStatus === "Enrolled" 
          ? `
            <div style="font-family: sans-serif; max-width: 600px; color: #333; line-height: 1.6;">
              <h2 style="color: #2575fc;">Congratulations, ${student.first_name}!</h2>
              <p>We are pleased to inform you that your enrollment request for the <strong>${student.track}</strong> track has been <strong>Approved</strong>.</p>
              <p><strong>Student Tracking ID:</strong> ${student.student_id}</p>
              <p>Please follow the link below to complete your verification setup:</p>
              <p><a href="https://solid-umbrella-gxj599j9jpp3vx9-3000.app.github.dev/admission/verification">Enrollment Verification link</a></p>
              <p>Our registrar office will reach out to you shortly regarding section schedules and orientation details.</p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
              <p style="font-size: 12px; color: #666;">Saint Gregory College of Science and Technology</p>
            </div>
          `
          : `
            <div style="font-family: sans-serif; max-width: 600px; color: #333; line-height: 1.6;">
              <h2 style="color: #dc2626;">Enrollment Status Update</h2>
              <p>Hello ${student.first_name},</p>
              <p>Thank you for your enrollment request to Saint Gregory College of Science and Technology.</p>
              <p>After a thorough review of your details for the <strong>${student.track}</strong> track (ID: ${student.student_id}), we regret to inform you that we are unable to accept your enrollment request at this time.</p>
              <p>We wish you the absolute best in your future academic pursuits.</p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
              <p style="font-size: 12px; color: #666;">Saint Gregory College of Science and Technology</p>
            </div>
          `;

        try {
          const emailRes = await fetch("/api/send-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              to: student.email_address, 
              subject: emailSubject,
              htmlContent: emailHtmlContent,
            }),
          });

          if (emailRes.ok) {
            alert(`Request marked as ${newStatus} and notification email sent to ${student.email_address}.`);
          } else {
            alert(`Request marked as ${newStatus}, but notification email delivery failed.`);
          }
        } catch (emailErr) {
          console.error("Email API network route error:", emailErr);
          alert(`Status updated to ${newStatus}, but a network problem blocked email sending.`);
        }

      } else {
        alert("Could not update state configuration.");
      }
    } catch (err) {
      console.error("Status update execution error:", err);
    } finally {
      setActionLoading(false);
    }
  };

  if (!studentId) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500 italic">
        Error: Missing valid student identity parameter context inside page address.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400 font-medium animate-pulse">
        Retrieving Enrollment Profile from Database...
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500 italic">
        Student registration record could not be found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Back and Status Row */}
        <div className="flex justify-between items-center">
          <button onClick={() => router.back()} className="text-gray-600 transition-colors hover:text-gray-900 font-medium">
            ← Back to Enrollment Requests
          </button>

          <div className="flex gap-3">
            <span className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center ${
              student.status === "Approved" || student.status === "Enrolled" ? "bg-green-100 text-green-800" :
              student.status === "Rejected" ? "bg-red-100 text-red-800" :
              "bg-yellow-100 text-yellow-800"
            }`}>
              {student.status || "Pending"}
            </span>
          </div>
        </div>

        {/* Banner Display Header Block */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white p-6 rounded-xl shadow-sm">
          <h1 className="text-3xl font-bold">
            {student.first_name} {student.middle_name ? `${student.middle_name} ` : ""}{student.last_name}
          </h1>
          <p className="mt-1 font-light">{student.track || "No Track Selected"}</p>
          <p className="text-xs mt-2 opacity-80">System Student ID: {student.student_id}</p>
        </div>

        {/* Main Content Layout Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          
          <div className="lg:col-span-2 space-y-6">
            <Card title="Personal Information">
              <Grid>
                <Field label="First Name" value={student.first_name} />
                <Field label="Middle Name" value={student.middle_name || ""} />
                <Field label="Last Name" value={student.last_name} />
                <Field label="Email Address" value={student.email_address} />
                <Field label="Contact Number" value={student.contact_number} />
                <Field label="Date of Birth" value={student.date_of_birth} />
                <Field label="Gender" value={student.gender} />
                <Field label="Nationality" value={student.nationality} />
              </Grid>
            </Card>

            <Card title="Academic History & Intake Goals">
              <Grid>
                <Field label="Desired Program/Track" value={student.track} />
                <Field label="Secondary School Attended" value={student.secondary_school} />
                <Field label="Graduation Year" value={student.graduation_year} />
                <Field label="Grade Point Average (GPA)" value={student.gpa} />
              </Grid>
            </Card>

            <Card title="Address Details">
              <div className="space-y-2">
                <Field label="Residential Address" value={student.residential_address} />
              </div>
            </Card>

            <Card title="Emergency Contact Matrix">
              <Grid>
                <Field label="Contact Person" value={student.emergency_contact_person} />
                <Field label="Relationship" value={student.emergency_contact_relationship} />
                <div className="md:col-span-2">
                  <Field label="Emergency Contact Number" value={student.emergency_contact_number} />
                </div>
              </Grid>
            </Card>
          </div>

          <div className="space-y-6">
            <Card title="Enrollment Tracking Context">
              <div className="space-y-3">
                <Field label="Submission Review State" value={student.status || "Pending"} />
              </div>
            </Card>

            <Card title="Application Assessment Review">
              <div className="grid grid-cols-2 gap-3">
                <button 
                  disabled={actionLoading || student.status !== "Pending"}
                  onClick={() => updateStatus("Enrolled")}
                  className="bg-green-100 text-green-700 py-2.5 px-4 rounded-lg hover:bg-green-200 text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Approve Enrollment
                </button>
                <button 
                  disabled={actionLoading || student.status !== "Pending"}
                  onClick={() => updateStatus("Rejected")}
                  className="bg-red-100 text-red-700 py-2.5 px-4 rounded-lg hover:bg-red-200 text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Reject Enrollment
                </button>
              </div>
            </Card>
          </div>

        </div>
      </div>
    </div>
  );
}

// Wrapper export with Suspense boundary to prevent Next.js useSearchParams client bailouts
export default function AdminStudentDetailsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-gray-400 font-medium animate-pulse">
          Loading page parameters...
        </div>
      }
    >
      <StudentDetailsContent />
    </Suspense>
  );
}

// Layout helper subcomponents
function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
      <h2 className="font-bold text-gray-400 uppercase tracking-wider text-xs border-b pb-2">{title}</h2>
      {children}
    </div>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid md:grid-cols-2 gap-4">{children}</div>;
}

function Field({ label, value }: { label?: string; value: string }) {
  return (
    <div>
      {label && <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">{label}</label>}
      <p className="font-semibold text-gray-800 text-sm min-h-[20px]">{value || "—"}</p>
    </div>
  );
}