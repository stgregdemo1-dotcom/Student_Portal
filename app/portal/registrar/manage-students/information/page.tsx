"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
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
  year?: string;
  assigned_section?: string;
  semester?: string;
}

interface SubjectData {
  _id: string;
  subject_id: string;
  subject_name: string;
  sched_code: string;
  semester: string;
  subject_year_section: string;
  teacher_id: string;
}

interface ClassEntry {
  _id?: string;
  year: string;
  semester: string;
  section: string;
  subjects: any[];
}

interface StudentSectionData {
  _id: string;
  student_id: string;
  class: ClassEntry[];
}

interface PreviewFile {
  name: string;
  url: string;
  contentType: string;
}

function AdminStudentDetailsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const studentId = searchParams.get("id");

  const [student, setStudent] = useState<StudentData | null>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [applicantId, setApplicantId] = useState<string>("");
  const [studentSectionDoc, setStudentSectionDoc] = useState<StudentSectionData | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [sectionsList, setSectionsList] = useState<string[]>([]);
  const [selectedSection, setSelectedSection] = useState<string>("");
  const [selectedSemester, setSelectedSemester] = useState<string>("1");
  const currentYear = new Date().getFullYear().toString();
  const [subjectsList, setSubjectsList] = useState<SubjectData[]>([]);
  const [subjectsLoading, setSubjectsLoading] = useState<boolean>(false);

  // State for document preview modal
  const [previewFile, setPreviewFile] = useState<PreviewFile | null>(null);

  const filteredSectionsList = useMemo(() => {
    if (!sectionsList || sectionsList.length === 0) return [];
    
    const track = student?.track ? student.track.trim().toLowerCase() : "";
    if (track.includes("information and communication technology")) {
      return sectionsList.filter((sec) => sec.trim().toUpperCase().startsWith("ICT"));
    }
    
    return sectionsList;
  }, [sectionsList, student?.track]);

  const exactClassMatch = useMemo(() => {
    if (!studentSectionDoc || !studentSectionDoc.class || studentSectionDoc.class.length === 0) {
      return false;
    }
    return studentSectionDoc.class.some(
      (c) => c.year === currentYear && c.semester === selectedSemester && c.section === selectedSection
    );
  }, [studentSectionDoc, currentYear, selectedSemester, selectedSection]);

  const latestClass = useMemo<ClassEntry | null>(() => {
    if (!studentSectionDoc || !studentSectionDoc.class || studentSectionDoc.class.length === 0) {
      return null;
    }
    const sorted = [...studentSectionDoc.class].sort((a, b) => {
      const yearDiff = Number(b.year) - Number(a.year);
      if (yearDiff !== 0) return yearDiff;
      return Number(b.semester) - Number(a.semester);
    });
    return sorted[0];
  }, [studentSectionDoc]);

  const fetchStudentDetails = async () => {
    if (!studentId) return;
    setDataLoading(true);
    try {
      const studentRes = await fetch(`/api/portal/registrar?table=students&id=${studentId}`);
      if (studentRes.ok) {
        const jsonResponse = await studentRes.json();
        const data: StudentData = jsonResponse.data || jsonResponse || null;
        setStudent(data);

        // Transform student_id: ST- becomes ID- to query admissions_applications for attachments
        if (data && data.student_id) {
          const transformedApplicantId = data.student_id.startsWith("ST-")
            ? data.student_id.replace(/^ST-/, "ID-")
            : data.student_id;

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
      }

      const sectionRes = await fetch(`/api/portal/registrar?table=student_section&id=${studentId}`);
      if (sectionRes.ok) {
        const sectionJson = await sectionRes.json();
        const sectionData: StudentSectionData = sectionJson.data || null;
        setStudentSectionDoc(sectionData);

        if (sectionData && sectionData.class && sectionData.class.length > 0) {
          const sorted = [...sectionData.class].sort((a, b) => {
            const yearDiff = Number(b.year) - Number(a.year);
            if (yearDiff !== 0) return yearDiff;
            return Number(b.semester) - Number(a.semester);
          });
          const latest = sorted[0];
          setSelectedSection(latest.section || "");
          setSelectedSemester(latest.semester || "1");
        }
      }
    } catch (err) {
      console.error("Error loading student record details:", err);
    } finally {
      setDataLoading(false);
    }
  };

  const fetchSectionsDropdown = async () => {
    try {
      const res = await fetch("/api/portal/admin?table=configuration");
      if (res.ok) {
        const configData = await res.json();
        if (configData && configData.section) {
          setSectionsList(configData.section);
        }
      }
    } catch (err) {
      console.error("Error pulling sections configuration:", err);
    }
  };

  const fetchFilteredSubjects = async () => {
    if (!selectedSection || selectedSection === "") {
      setSubjectsList([]);
      return;
    }

    setSubjectsLoading(true);
    try {
      const res = await fetch(
        `/api/portal/registrar?table=subjects&subject_year_section=${encodeURIComponent(selectedSection)}&semester=${selectedSemester}&year=${currentYear}`
      );

      if (res.ok) {
        const jsonResponse = await res.json();
        setSubjectsList(jsonResponse.data || []);
      }
    } catch (err) {
      console.error("Error processing subjects query:", err);
    } finally {
      setSubjectsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentDetails();
    fetchSectionsDropdown();
  }, [studentId]);

  useEffect(() => {
    fetchFilteredSubjects();
  }, [selectedSection, selectedSemester, currentYear]);

  const handleAssignSection = async () => {
    if (!student || !selectedSection || selectedSection === "" || !selectedSemester || subjectsLoading || subjectsList.length === 0 || exactClassMatch) return;
    setActionLoading(true);

    try {
      const formattedSubjects = subjectsList.map((subj) => ({
        subject_id: subj.subject_id,
        teacher_id: subj.teacher_id,
        grade_1: "",
        grade_2: "",
        grade_3: "",
        grade_4: "",
        remarks: "",
        status: "Enrolled",
      }));

      const payload = {
        student_id: student.student_id,
        year: currentYear,
        section: selectedSection,
        semester: selectedSemester,
        subjects: formattedSubjects,
      };

      const res = await fetch("/api/portal/registrar?table=student_section", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert(`Successfully assigned section "${selectedSection}" with ${formattedSubjects.length} subjects!`);
        await fetchStudentDetails();
      } else {
        const errorData = await res.json();
        alert(errorData.message || "Failed to process section allocation.");
      }
    } catch (err) {
      console.error("Section assignment execution error:", err);
      alert("A network problem blocked saving section details.");
    } finally {
      setActionLoading(false);
    }
  };

  const isButtonDisabled = actionLoading || !selectedSection || selectedSection === "" || subjectsLoading || subjectsList.length === 0 || exactClassMatch;

  if (!studentId) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500 italic">
        Error: Missing valid student ID parameter context in URL.
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
    <div className="min-h-screen bg-gray-50 py-4 sm:py-6 px-4">
      <div className="w-full space-y-6">

        {/* Header Navigation */}
        <div className="flex justify-between items-center">
          <button onClick={() => router.back()} className="text-gray-600 transition-colors hover:text-gray-900 font-medium">
            ← Back to Manage Students
          </button>

          <div className="flex gap-3">
            <span className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center ${student.status === "Approved" || student.status === "Enrolled" ? "bg-green-100 text-green-800" :
                student.status === "Rejected" ? "bg-red-100 text-red-800" :
                  "bg-yellow-100 text-yellow-800"
              }`}>
              {student.status || "Pending"}
            </span>
          </div>
        </div>

        {/* Student Banner */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white p-6 rounded-xl shadow-sm">
          <h1 className="text-3xl font-bold">
            {student.first_name} {student.middle_name ? `${student.middle_name} ` : ""}{student.last_name}
          </h1>
          <p className="mt-1 font-light">{student.track || "No Track Selected"}</p>
          <p className="text-xs mt-2 opacity-80">System Student ID: {student.student_id}</p>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">

          {/* Left Column: Personal Data */}
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

            {/* Uploaded Admission Documents Section */}
            <Card title="Uploaded Admission Documents">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {attachments && attachments.length > 0 ? (
                  attachments.map((file, index) => (
                    <FileItem 
                      key={file._id || index} 
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
                  <div className="col-span-full p-4 rounded-xl border border-dashed border-gray-200 text-center text-xs text-gray-500 italic">
                    No admission attachments found for this student.
                  </div>
                )}
              </div>
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

          {/* Right Column: Actions & Subjects */}
          <div className="space-y-6">

            {/* Section Assignment Block */}
            <Card title="Assign Section">
              <div className="space-y-4">

                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                    Year
                  </label>
                  <input
                    type="text"
                    value={currentYear}
                    readOnly
                    className="w-full bg-gray-100 border border-gray-200 text-gray-500 rounded-lg px-3 py-2 text-sm font-semibold select-none outline-none cursor-not-allowed"
                  />
                </div>

                <div>
                  <label htmlFor="semester-dropdown" className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                    Select Semester
                  </label>
                  <select
                    id="semester-dropdown"
                    value={selectedSemester}
                    onChange={(e) => setSelectedSemester(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-indigo-500 bg-white outline-none transition text-gray-700"
                  >
                    <option value="1">1st Semester</option>
                    <option value="2">2nd Semester</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="section-dropdown" className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                    Select Section
                  </label>
                  <select
                    id="section-dropdown"
                    value={selectedSection}
                    onChange={(e) => setSelectedSection(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-indigo-500 bg-white outline-none transition"
                  >
                    <option value="">--Select Section--</option>
                    {filteredSectionsList.map((sec) => (
                      <option key={sec} value={sec}>
                        {sec}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  disabled={isButtonDisabled}
                  onClick={handleAssignSection}
                  className={`w-full py-2.5 px-4 rounded-lg text-sm font-semibold transition-colors shadow-sm mt-2 ${
                    isButtonDisabled
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-indigo-600 hover:bg-indigo-700 text-white"
                  }`}
                >
                  {actionLoading ? "Processing..." : "Assign Section"}
                </button>

              </div>
            </Card>

            {/* Subject Matrix Card */}
            <Card title="Available Subjects">
              <div className="space-y-3">
                {!selectedSection ? (
                  <p className="text-xs italic text-gray-400 text-center py-2">
                    Please choose a section to list available subjects.
                  </p>
                ) : subjectsLoading ? (
                  <p className="text-xs text-gray-400 font-medium animate-pulse text-center py-2">
                    Querying matching subjects array...
                  </p>
                ) : subjectsList.length === 0 ? (
                  <p className="text-xs italic text-gray-400 text-center py-2">
                    No subjects found for Section &ldquo;{selectedSection}&rdquo; ({currentYear} Sem {selectedSemester}).
                  </p>
                ) : (
                  <div className="border border-gray-200 rounded-lg divide-y divide-gray-100 max-h-64 overflow-y-auto shadow-inner bg-gray-50">
                    {subjectsList.map((subj) => (
                      <div key={subj._id || subj.subject_id} className="p-3 bg-white flex justify-between items-start gap-2 hover:bg-indigo-50/40 transition-colors">
                        <div className="space-y-0.5">
                          <span className="text-[10px] font-bold text-indigo-600 tracking-wider uppercase bg-indigo-50 px-1.5 py-0.5 rounded">
                            {subj.subject_id}
                          </span>
                          <p className="text-xs font-semibold text-gray-800 pt-1">
                            {subj.subject_name}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-[10px] font-mono bg-gray-100 text-gray-600 px-2 py-0.5 rounded border border-gray-200">
                            {subj.sched_code}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>

            {/* Latest Enrollment Status Table */}
            <Card title="Enrollment Tracking Context">
              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-semibold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="px-3 py-2.5">Year</th>
                      <th className="px-3 py-2.5">Sem</th>
                      <th className="px-3 py-2.5">Section</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {latestClass ? (
                      <tr className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-3 py-2.5 font-medium text-gray-800">
                          {latestClass.year || "—"}
                        </td>
                        <td className="px-3 py-2.5 text-gray-600">
                          {latestClass.semester ? `Sem ${latestClass.semester}` : "—"}
                        </td>
                        <td className="px-3 py-2.5 font-semibold text-indigo-600">
                          {latestClass.section || "—"}
                        </td>
                      </tr>
                    ) : (
                      <tr>
                        <td colSpan={3} className="px-3 py-4 text-center text-gray-400 italic">
                          No active enrollment history found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
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
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-400">Loading student details...</div>}>
      <AdminStudentDetailsContent />
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