"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
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
  evaluation: string;
  subjects: any[];
}

interface StudentSectionData {
  _id: string;
  student_id: string;
  class: ClassEntry[];
}

function AdminStudentDetailsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const studentId = searchParams.get("id");

  const [student, setStudent] = useState<StudentData | null>(null);
  const [studentSectionDoc, setStudentSectionDoc] = useState<StudentSectionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [sectionsList, setSectionsList] = useState<string[]>([]);
  const [selectedSection, setSelectedSection] = useState<string>("");
  const [selectedSemester, setSelectedSemester] = useState<string>("1");
  const currentYear = new Date().getFullYear().toString();

  const [subjectsList, setSubjectsList] = useState<SubjectData[]>([]);
  const [subjectsLoading, setSubjectsLoading] = useState<boolean>(false);

  // -------------------------------------------------------------
  // LOGIC 2: Find the latest class record based on Year and Semester
  // -------------------------------------------------------------
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

  // -------------------------------------------------------------
  // Determine Button Text & Action Behavior
  // -------------------------------------------------------------
  const { buttonLabel, isButtonDisabled, actionType } = useMemo(() => {
    if (!studentSectionDoc || !latestClass) {
      return { buttonLabel: "Assign Section", isButtonDisabled: false, actionType: "CREATE" };
    }

    const evalStatus = latestClass.evaluation ? latestClass.evaluation.trim() : "";

    // Logic 3: evaluation = "" -> Display "Update Section"
    if (evalStatus === "") {
      return { buttonLabel: "Update Section", isButtonDisabled: false, actionType: "UPDATE" };
    }

    // Logic 5: evaluation = "Approved" -> Display "Assign Section" enabled
    if (evalStatus === "Approved") {
      return { buttonLabel: "Assign Section", isButtonDisabled: false, actionType: "PUSH_NEW" };
    }

    // Logic 4: evaluation is not empty and NOT "Approved" -> Disabled
    return { buttonLabel: "Assign Section", isButtonDisabled: true, actionType: "DISABLED" };
  }, [studentSectionDoc, latestClass]);

  // 1. Fetch Student Details and Student Section Collection Record
  const fetchStudentDetails = async () => {
    if (!studentId) return;
    setLoading(true);
    try {
      // Fetch core student record
      const studentRes = await fetch(`/api/portal/registrar?table=students&id=${studentId}`);
      if (studentRes.ok) {
        const jsonResponse = await studentRes.json();
        const data: StudentData = jsonResponse.data || jsonResponse || null;
        setStudent(data);
      }

      // Fetch student_section document
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
      setLoading(false);
    }
  };

  // 2. Fetch dropdown section entries
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

  // 3. Pull server-filtered subjects
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

  // -------------------------------------------------------------
  // Handles Assigning / Updating Section
  // -------------------------------------------------------------
  const handleAssignOrUpdateSection = async () => {
    if (!student || !selectedSection || selectedSection === "" || !selectedSemester || isButtonDisabled) return;
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
        actionType: actionType,
        targetYear: latestClass?.year,
        targetSemester: latestClass?.semester,
      };

      const res = await fetch("/api/portal/registrar?table=student_section", {
        method: actionType === "UPDATE" ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert(
          actionType === "UPDATE"
            ? `Successfully updated section to "${selectedSection}" for Semester ${selectedSemester}, Year ${currentYear}!`
            : `Successfully assigned section "${selectedSection}" with ${formattedSubjects.length} subjects!`
        );
        await fetchStudentDetails();
      } else {
        const errorData = await res.json();
        alert(errorData.message || "Failed to process section allocation.");
      }
    } catch (err) {
      console.error("Section update execution error:", err);
      alert("A network problem blocked saving section details.");
    } finally {
      setActionLoading(false);
    }
  };

  if (!studentId) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500 italic">
        Error: Missing valid student ID parameter context in URL.
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

        {/* Header Navigation */}
        <div className="flex justify-between items-center">
          <button onClick={() => router.back()} className="text-gray-600 transition-colors hover:text-gray-900 font-medium">
            ← Back to Manage Students
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
            <Card title={buttonLabel === "Update Section" ? "Update Section" : "Assign Section"}>
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
                    {sectionsList.map((sec) => (
                      <option key={sec} value={sec}>
                        {sec}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  disabled={actionLoading || isButtonDisabled || !selectedSection || selectedSection === ""}
                  onClick={handleAssignOrUpdateSection}
                  className={`w-full py-2.5 px-4 rounded-lg text-sm font-semibold transition-colors shadow-sm mt-2 ${
                    isButtonDisabled
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-indigo-600 hover:bg-indigo-700 text-white"
                  }`}
                >
                  {actionLoading ? "Processing..." : buttonLabel}
                </button>

                {isButtonDisabled && (
                  <p className="text-[11px] text-amber-600 bg-amber-50 p-2 rounded border border-amber-200">
                    Cannot assign a new section until the latest academic evaluation is set to &ldquo;Approved&rdquo;. Current evaluation: &ldquo;{latestClass?.evaluation || "Pending"}&rdquo;.
                  </p>
                )}

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
                    No subjects found for Section &ldquo;{selectedSection}&rdquo; ({currentYear} - Sem {selectedSemester}).
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
                      <th className="px-3 py-2.5">Evaluation</th>
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
                        <td className="px-3 py-2.5">
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${
                            latestClass.evaluation === "Approved"
                              ? "bg-green-50 text-green-700 border-green-200"
                              : latestClass.evaluation === ""
                              ? "bg-gray-100 text-gray-600 border-gray-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}>
                            {latestClass.evaluation === "" ? "Unassigned" : latestClass.evaluation}
                          </span>
                        </td>
                      </tr>
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-3 py-4 text-center text-gray-400 italic">
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
    </div>
  );
}

export default function AdminStudentDetailsPage() {
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