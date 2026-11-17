"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthGuard } from "@/app/hooks/useAuthGuard";

interface Attachment {
  _id: string;
  filename: string;
  contentType: string;
  documentType?: "profile" | "reportCard" | "birthCertificate";
}

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

interface PreviewFile {
  name: string;
  url: string;
  contentType: string;
}

function StudentDetailsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const studentId = searchParams.get("id");

  const [student, setStudent] = useState<StudentData | null>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [applicantId, setApplicantId] = useState<string>("");
  const [dataLoading, setDataLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  // State for document preview modal
  const [previewFile, setPreviewFile] = useState<PreviewFile | null>(null);

  const fetchStudentDetails = useCallback(async () => {
    if (!studentId) return;
    setDataLoading(true);
    try {
      const res = await fetch(`/api/portal/registrar?table=students&id=${studentId}`);
      if (res.ok) {
        const jsonResponse = await res.json();
        const studentRecord = jsonResponse.data || jsonResponse || null;
        setStudent(studentRecord);

        // Transform student_id: ST- becomes ID- to query admissions_applications for attachments
        if (studentRecord && studentRecord.student_id) {
          const transformedApplicantId = studentRecord.student_id.startsWith("ST-")
            ? studentRecord.student_id.replace(/^ST-/, "ID-")
            : studentRecord.student_id;

          setApplicantId(transformedApplicantId);

          try {
            const appRes = await fetch(`/api/portal/registrar?table=admissions_applications&id=${transformedApplicantId}`);
            if (appRes.ok) {
              const appJsonResponse = await appRes.json();
              const appRecord = appJsonResponse.data || appJsonResponse;
              if (appRecord && Array.isArray(appRecord.attachments)) {
                setAttachments(appRecord.attachments);
              }
            }
          } catch (attErr) {
            console.error("Failed to fetch admission attachments:", attErr);
          }
        }
      } else {
        console.error("Failed to load document profile.");
      }
    } catch (err) {
      console.error("Error loading student record details:", err);
    } finally {
      setDataLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    fetchStudentDetails();
  }, [fetchStudentDetails]);

  const updateStatus = async (newStatus: "Enrolled" | "Rejected") => {
    if (!student) return;
    if (newStatus === "Rejected" && !rejectionReason.trim()) {
      alert("Please provide a reason for rejection.");
      return;
    }

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
              <p><strong>Reason for Rejection:</strong></p>
              <p style="background-color: #f9fafb; padding: 12px; border-left: 4px solid #dc2626; margin: 15px 0; font-style: italic;">${rejectionReason}</p>
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

  if (dataLoading) {
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
      <div className="w-full space-y-6">

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

            <Card title="Uploaded Admission Documents">
              <div className="space-y-2">
                {attachments && attachments.length > 0 ? (
                  attachments.map((file) => (
                    <FileItem 
                      key={file._id} 
                      name={file.filename} 
                      contentType={file.contentType}
                      documentType={file.documentType}
                      status="Available" 
                      applicantId={applicantId} 
                      fileId={file._id} 
                      onPreview={(fileData) => setPreviewFile(fileData)}
                    />
                  ))
                ) : (
                  <p className="text-xs text-gray-400 italic">No associated document attachments found.</p>
                )}
              </div>
            </Card>

            <Card title="Application Assessment Review">
              <div className="space-y-3">
                {student.status === "Pending" && (
                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-1">
                      Reason for Rejection <span className="text-red-500">*</span>
                    </label>
                    <textarea 
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Specify the reason why this enrollment is rejected..."
                      className="w-full text-xs p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 min-h-[80px]"
                    />
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    disabled={actionLoading || !student.status?.startsWith("Pending")}
                    onClick={() => updateStatus("Enrolled")}
                    className="bg-green-100 text-green-700 py-2.5 px-4 rounded-lg hover:bg-green-200 text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Approve Enrollment
                  </button>
                  <button
                    disabled={actionLoading || !student.status?.startsWith("Pending") || !rejectionReason.trim()}
                    onClick={() => updateStatus("Rejected")}
                    className="bg-red-100 text-red-700 py-2.5 px-4 rounded-lg hover:bg-red-200 text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Reject Enrollment
                  </button>
                </div>
              </div>
            </Card>
          </div>

        </div>
      </div>

      {/* Document Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-800 text-sm truncate max-w-xl">{previewFile.name}</h3>
              <div className="flex items-center gap-3">
                <a 
                  href={previewFile.url} 
                  download={previewFile.name}
                  className="text-xs bg-indigo-50 text-indigo-600 hover:bg-indigo-100 font-semibold px-3 py-1.5 rounded-lg transition-colors"
                >
                  Download
                </a>
                <button 
                  onClick={() => setPreviewFile(null)}
                  className="text-gray-400 hover:text-gray-700 font-bold text-lg p-1"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6 bg-gray-50 flex-1 overflow-auto flex items-center justify-center min-h-[450px]">
              {previewFile.contentType?.includes("image") ? (
                <img 
                  src={previewFile.url} 
                  alt={previewFile.name} 
                  className="max-h-[65vh] object-contain rounded-lg shadow-sm"
                />
              ) : previewFile.contentType?.includes("pdf") || previewFile.name.toLowerCase().endsWith(".pdf") ? (
                <iframe 
                  src={previewFile.url} 
                  title={previewFile.name}
                  className="w-full h-[65vh] rounded-lg border border-gray-200 bg-white"
                />
              ) : (
                <div className="text-center space-y-3 py-12">
                  <p className="text-gray-600 text-sm">Inline preview is not available for this file type.</p>
                  <a 
                    href={previewFile.url} 
                    download={previewFile.name}
                    className="inline-block bg-indigo-600 text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Download File to View
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminStudentDetailsPage() {
  const { isAuthenticated, loading: authLoading } = useAuthGuard({
    requiredPrefix: "REG",
    redirectTo: "/portal/log-in",
  });

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 font-sans">
        <div className="text-center space-y-3">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
          <p className="text-sm font-bold text-gray-600">Verifying Registrar Security Credentials...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

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

function FileItem({ 
  name, 
  contentType, 
  documentType, 
  status, 
  applicantId, 
  fileId, 
  onPreview 
}: { 
  name: string; 
  contentType: string;
  documentType?: "profile" | "reportCard" | "birthCertificate"; 
  status: string; 
  applicantId: string; 
  fileId: string; 
  onPreview: (file: PreviewFile) => void;
}) {
  const fileUrl = `/api/portal/registrar?applicantId=${applicantId}&fileId=${fileId}`;
  const documentLabel =
    documentType === "profile"
      ? "Profile Picture"
      : documentType === "reportCard"
        ? "Report Card"
        : documentType === "birthCertificate"
          ? "Birth Certificate"
          : undefined;

  return (
    <div className="flex justify-between items-center border border-gray-100 p-3 rounded-lg bg-gray-50/40">
      <div className="flex flex-col min-w-0 max-w-[180px]">
        {documentLabel && (
          <span className="text-[10px] font-bold uppercase tracking-wide text-[#0D2B45]">
            {documentLabel}
          </span>
        )}
        <span className="text-xs font-medium text-gray-700 truncate">{name}</span>
        <div className="flex items-center gap-2 mt-1">
          <button 
            onClick={() => onPreview({ name, url: fileUrl, contentType })}
            className="text-[10px] text-indigo-600 hover:text-indigo-800 hover:underline font-semibold"
          >
            Preview
          </button>
          <span className="text-gray-300">•</span>
          <a href={fileUrl} download={name} className="text-[10px] text-blue-600 hover:text-blue-800 hover:underline font-semibold">
            Download
          </a>
        </div>
      </div>
      <span className="text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded-md bg-green-100 text-green-700">
        {status}
      </span>
    </div>
  );
}