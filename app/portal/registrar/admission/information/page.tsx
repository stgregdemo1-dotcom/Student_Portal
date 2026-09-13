"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const enrollmentURL = "https://solid-umbrella-gxj599j9jpp3vx9-3000.app.github.dev/admission/enrollment";

interface ApplicantData {
  _id: string; 
  applicant_id: string; 
  status: string;
  submittedAt: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  phone: string;
  dob: string;
  gender: string;
  nationality: string;
  track: string;
  enrollmentType: string;
  gradeLevel?: string;
  lrn: string;
  lastSchool: string;
  street: string;
  city: string;
  province: string;
  zip: string;
  country: string;
  personalStatement: string;
  attachments?: Array<{
    _id: string;
    filename: string;
    contentType: string;
  }>;
}

// 1. Inner component where useSearchParams is executed
function ApplicantDetailsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const applicantId = searchParams.get("id"); 

  const [applicant, setApplicant] = useState<ApplicantData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchApplicantDetails = async () => {
    if (!applicantId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/portal/registrar?table=admissions_applications&id=${applicantId}`);
      if (res.ok) {
        const jsonResponse = await res.json();
        setApplicant(jsonResponse.data || null);
      } else {
        console.error("Failed to load document profile.");
      }
    } catch (err) {
      console.error("Error loading application record details:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicantDetails();
  }, [applicantId]);

  const updateStatus = async (newStatus: "Approved" | "Rejected") => {
    if (!applicant) return;
    setActionLoading(true);
    try {
      const res = await fetch("/api/portal/registrar", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicant_id: applicant.applicant_id, status: newStatus }),
      });

      if (res.ok) {
        setApplicant((prev) => prev ? { ...prev, status: newStatus } : null);
        
        const emailSubject = newStatus === "Approved" 
          ? "Admission Update: Application Approved! 🎉" 
          : "Admission Update: Application Status Profile";

        const emailHtmlContent = newStatus === "Approved" 
          ? `
            <div style="font-family: sans-serif; max-width: 600px; color: #333; line-height: 1.6;">
              <h2 style="color: #2575fc;">Congratulations, ${applicant.firstName}!</h2>
              <p>We are pleased to inform you that your admission application for the <strong>${applicant.track}</strong> track has been <strong>Approved</strong>.</p>
              <p><strong>Admission Tracking ID:</strong> ${applicant.applicant_id}</p>
              <p>Please follow the link below to completed your enrollment process</p>
              <p><a href="https://solid-umbrella-gxj599j9jpp3vx9-3000.app.github.dev/admission/verification">Enrollment link</a></p>
              <p>Our registrar office will reach out to you shortly regarding the next enrolment steps, document verification, and schedules.</p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
              <p style="font-size: 12px; color: #666;">Saint Gregory College of Science and Technology</p>
            </div>
          `
          : `
            <div style="font-family: sans-serif; max-width: 600px; color: #333; line-height: 1.6;">
              <h2 style="color: #dc2626;">Application Status Update</h2>
              <p>Hello ${applicant.firstName},</p>
              <p>Thank you for your application to Saint Gregory College of Science and Technology.</p>
              <p>After a thorough review of your application details for the <strong>${applicant.track}</strong> track (ID: ${applicant.applicant_id}), we regret to inform you that we are unable to accept your admission application at this time.</p>
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
              to: applicant.email, 
              subject: emailSubject,
              htmlContent: emailHtmlContent,
            }),
          });

          if (emailRes.ok) {
            alert(`Application marked as ${newStatus} and notification email sent to ${applicant.email}.`);
          } else {
            alert(`Application marked as ${newStatus}, but notification email delivery failed.`);
          }
        } catch (emailErr) {
          console.error("Email API network route error:", emailErr);
          alert(`Application status updated to ${newStatus}, but a network problem blocked email sending.`);
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

  if (!applicantId) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500 italic">
        Error: Missing valid tracking ID parameter context inside page address.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400 font-medium animate-pulse">
        Retrieving Application Profile from Database...
      </div>
    );
  }

  if (!applicant) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500 italic">
        Admission application record could not be found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Back and Status Row */}
        <div className="flex justify-between items-center">
          <button onClick={() => router.back()} className="text-gray-600 transition-colors hover:text-gray-900 font-medium">
            ← Back to Applicants
          </button>

          <div className="flex gap-3">
            <span className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center ${
              applicant.status === "Approved" ? "bg-green-100 text-green-800" :
              applicant.status === "Rejected" ? "bg-red-100 text-red-800" :
              "bg-yellow-100 text-yellow-800"
            }`}>
              {applicant.status || "Pending"}
            </span>
          </div>
        </div>

        {/* Banner Display Header Block */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white p-6 rounded-xl shadow-sm">
          <h1 className="text-3xl font-bold">
            {applicant.firstName} {applicant.middleName ? `${applicant.middleName} ` : ""}{applicant.lastName}
          </h1>
          <p className="mt-1 font-light">{applicant.track || "No Track Selected"}</p>
          <p className="text-xs mt-2 opacity-80">System Admission ID: {applicant.applicant_id}</p>
        </div>

        {/* Main Content Layout Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          
          <div className="lg:col-span-2 space-y-6">
            <Card title="Personal Information">
              <Grid>
                <Field label="First Name" value={applicant.firstName} />
                <Field label="Middle Name" value={applicant.middleName || ""} />
                <Field label="Last Name" value={applicant.lastName} />
                <Field label="Email Address" value={applicant.email} />
                <Field label="Phone Number" value={applicant.phone} />
                <Field label="Date of Birth" value={applicant.dob} />
                <Field label="Gender" value={applicant.gender} />
                <Field label="Nationality" value={applicant.nationality} />
              </Grid>
            </Card>

            <Card title="Academic History & Intake Goals">
              <Grid>
                <Field label="Desired Program/Track" value={applicant.track} />
                <Field label="Enrollment Type" value={applicant.enrollmentType} />
                <Field label="Grade Level" value={applicant.gradeLevel || "N/A"} />
                <Field label="Learner Reference Number (LRN)" value={applicant.lrn} />
                <Field label="Last School Attended" value={applicant.lastSchool} />
              </Grid>
            </Card>

            <Card title="Address Details">
              <Grid>
                <div className="md:col-span-2">
                  <Field label="Street Address" value={applicant.street} />
                </div>
                <Field label="City / Municipality" value={applicant.city} />
                <Field label="State / Province" value={applicant.province} />
                <Field label="Zip / Postal Code" value={applicant.zip} />
                <Field label="Country" value={applicant.country} />
              </Grid>
            </Card>
          </div>

          <div className="space-y-6">
            <Card title="Admission Tracking Context">
              <div className="space-y-3">
                <Field label="Submission Review State" value={applicant.status || "Pending"} />
                <Field label="Form Submission Date" value={applicant.submittedAt ? new Date(applicant.submittedAt).toLocaleDateString() : "—"} />
              </div>
            </Card>

            <Card title="Personal Statement Insights">
              <div className="text-xs text-gray-600 bg-gray-50 p-4 rounded-lg border border-gray-100 italic leading-relaxed whitespace-pre-line">
                {applicant.personalStatement || "No statement compiled."}
              </div>
            </Card>

            <Card title="Admission Files Verification">
              <div className="space-y-2">
                {applicant.attachments && applicant.attachments.length > 0 ? (
                  applicant.attachments.map((file) => (
                    <FileItem 
                      key={file._id} 
                      name={file.filename} 
                      status="Uploaded" 
                      applicantId={applicant.applicant_id} 
                      fileId={file._id} 
                    />
                  ))
                ) : (
                  <p className="text-xs text-gray-400 italic">No associated document attachments uploaded.</p>
                )}
              </div>
            </Card>

            <Card title="Application Assessment Review">
              <div className="grid grid-cols-2 gap-3">
                <button 
                  disabled={actionLoading || applicant.status !== "Pending"}
                  onClick={() => updateStatus("Approved")}
                  className="bg-green-100 text-green-700 py-2.5 px-4 rounded-lg hover:bg-green-200 text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Approve Application
                </button>
                <button 
                  disabled={actionLoading || applicant.status !== "Pending"}
                  onClick={() => updateStatus("Rejected")}
                  className="bg-red-100 text-red-700 py-2.5 px-4 rounded-lg hover:bg-red-200 text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Reject Application
                </button>
              </div>
            </Card>
          </div>

        </div>
      </div>
    </div>
  );
}

// 2. Export default wrapped inside a Suspense boundary
export default function AdminApplicantDetailsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-gray-400 font-medium animate-pulse">
          Retrieving Application Profile...
        </div>
      }
    >
      <ApplicantDetailsContent />
    </Suspense>
  );
}

// Helper components remain unchanged
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

function FileItem({ name, status, applicantId, fileId }: { name: string; status: string; applicantId: string; fileId: string; }) {
  const downloadUrl = `/api/portal/registrar?applicantId=${applicantId}&fileId=${fileId}`;
  return (
    <div className="flex justify-between items-center border border-gray-100 p-3 rounded-lg bg-gray-50/40">
      <div className="flex flex-col min-w-0 max-w-[180px]">
        <span className="text-xs font-medium text-gray-700 truncate">{name}</span>
        <a href={downloadUrl} download={name} className="text-[10px] text-blue-600 hover:text-blue-800 hover:underline font-semibold mt-0.5">
          Public Download Document
        </a>
      </div>
      <span className="text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded-md bg-green-100 text-green-700">
        {status}
      </span>
    </div>
  );
}