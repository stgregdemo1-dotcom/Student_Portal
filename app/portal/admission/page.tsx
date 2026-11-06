"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";

interface AdmissionApplication {
  applicant_id: string;
  status: string;
  firstName: string;
  middleName: string;
  lastName: string;
  suffix: string;
  email: string;
  phone: string;
  dob: string;
  gender: string;
  nationality: string;
  track: string;
  enrollmentType: string;
  gradeLevel: string;
  lrn: string;
  lastSchool: string;
  street: string;
  city: string;
  province: string;
  zip: string;
  country: string;
  personalStatement: string;
  submittedAt: string;
  attachments: string[];
}

function isAdmissionApplication(value: unknown): value is AdmissionApplication {
  if (!value || typeof value !== "object") return false;

  const record = value as Record<string, unknown>;
  const stringFields = [
    "applicant_id",
    "status",
    "firstName",
    "middleName",
    "lastName",
    "suffix",
    "email",
    "phone",
    "dob",
    "gender",
    "nationality",
    "track",
    "enrollmentType",
    "gradeLevel",
    "lrn",
    "lastSchool",
    "street",
    "city",
    "province",
    "zip",
    "country",
    "personalStatement",
    "submittedAt",
  ];

  return (
    stringFields.every((field) => typeof record[field] === "string") &&
    Array.isArray(record.attachments) &&
    record.attachments.every((filename) => typeof filename === "string")
  );
}

let cachedApplicationJson: string | null | undefined;
let cachedApplication: AdmissionApplication | null = null;

function getSavedApplication(): AdmissionApplication | null {
  const savedApplication = sessionStorage.getItem(
    "admission_portal_application",
  );
  if (savedApplication === cachedApplicationJson) return cachedApplication;

  cachedApplicationJson = savedApplication;
  cachedApplication = null;
  if (!savedApplication) return null;

  try {
    const parsedApplication: unknown = JSON.parse(savedApplication);
    if (isAdmissionApplication(parsedApplication)) {
      cachedApplication = parsedApplication;
    } else {
      console.error("Saved admission application has an invalid format.");
    }
  } catch (error) {
    console.error("Unable to load the saved admission application:", error);
  }

  return cachedApplication;
}

function subscribeToApplication() {
  return () => {};
}

const fieldClassName =
  "min-h-12 w-full rounded-lg border border-[#DCE4ED] bg-[#F8FAFC] px-3.5 py-3 text-sm text-[#183B56]";
const labelClassName = "ml-0.5 text-xs font-semibold text-[#334155]";

function ApplicationField({
  label,
  value,
}: {
  label: string;
  value?: string;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <span className={labelClassName}>{label}</span>
      <div className={fieldClassName}>{value || "Not provided"}</div>
    </div>
  );
}

function SectionHeading({
  number,
  title,
  subtitle,
}: {
  number: number;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="mb-6 border-b border-[#FFC107]/70 pb-4">
      <div className="flex items-center gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#FFC107] text-sm font-bold text-[#0D2B45]">
          {number}
        </span>
        <h2 className="text-lg font-bold text-[#0D2B45] sm:text-xl">{title}</h2>
      </div>
      <p className="mt-2 text-sm text-slate-500">{subtitle}</p>
    </div>
  );
}

export default function AdmissionDashboard() {
  const application = useSyncExternalStore(
    subscribeToApplication,
    getSavedApplication,
    () => null,
  );

  const handleLogout = () => {
    sessionStorage.removeItem("admission_portal_application");
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_8%_46%,rgba(255,193,7,0.22),transparent_30%),radial-gradient(ellipse_at_92%_64%,rgba(71,153,220,0.20),transparent_32%),linear-gradient(135deg,#EEF5FF_0%,#FFF8E8_48%,#EAF3FF_100%)] px-4 py-8 font-sans text-[#1E293B] sm:px-6 sm:py-10 lg:px-8">
      <div className="mx-auto max-w-[1000px]">
        <header className="mb-8 flex items-end justify-between gap-4 sm:mb-10">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-[#0D2B45] sm:text-3xl">
              SGCST <span className="text-[#D89B00]">Admission Portal</span>
            </h1>
            <p className="mt-1 text-sm font-medium text-[#183B56] sm:text-base">
              Saint Gregory College of Science and Technology
            </p>
          </div>
          <Link
            href="/admission/verification"
            onClick={handleLogout}
            className="inline-flex min-h-10 items-center rounded-lg border border-[#c2410c] bg-[#e64b1b] px-4 text-sm font-bold text-white shadow-md transition-colors hover:border-[#ff9100] hover:bg-[#ff9100] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFB900] focus-visible:ring-offset-2"
          >
            Logout
          </Link>
        </header>

        {application ? (
          <div className="space-y-9 rounded-2xl border-2 border-slate-100 bg-white p-5 shadow-[0_12px_40px_rgba(13,43,69,0.08)] sm:p-8 lg:p-10">
            <div className="flex flex-col gap-4 border-b border-[#DCE4ED] pb-7 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-2xl font-extrabold leading-tight text-[#0D2B45] sm:text-3xl">
                  Admission Application
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  This is the information submitted with your admission form.
                </p>
              </div>
              <div className="rounded-lg bg-[#FFF8E1] px-4 py-3 text-sm text-[#183B56]">
                <p>
                  Control Number:{" "}
                  <span className="font-bold">{application.applicant_id}</span>
                </p>
                <p className="mt-1">
                  Status:{" "}
                  <span className="font-bold">{application.status}</span>
                </p>
              </div>
            </div>

            <section aria-labelledby="application-section-1">
              <SectionHeading
                number={1}
                title="Personal Information"
                subtitle="Your basic personal details."
              />
              <div className="grid grid-cols-1 gap-x-5 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
                <ApplicationField label="First Name" value={application.firstName} />
                <ApplicationField label="Middle Name" value={application.middleName} />
                <ApplicationField label="Last Name" value={application.lastName} />
                <ApplicationField label="Suffix" value={application.suffix} />
                <ApplicationField label="Email Address" value={application.email} />
                <ApplicationField label="Phone Number" value={application.phone} />
                <ApplicationField label="Date of Birth" value={application.dob} />
                <ApplicationField label="Gender" value={application.gender} />
                <ApplicationField label="Nationality" value={application.nationality} />
              </div>
            </section>

            <section aria-labelledby="application-section-2">
              <SectionHeading
                number={2}
                title="Academic Information"
                subtitle="Your academic background and preferred program."
              />
              <div className="grid grid-cols-1 gap-x-5 gap-y-5 sm:grid-cols-2">
                <ApplicationField label="Desired Track/Strand" value={application.track} />
                <ApplicationField label="Enrollment Type" value={application.enrollmentType} />
                <ApplicationField label="Grade Level" value={application.gradeLevel} />
                <ApplicationField label="LRN" value={application.lrn} />
                <ApplicationField label="Last School Attended" value={application.lastSchool} />
              </div>
            </section>

            <section aria-labelledby="application-section-3">
              <SectionHeading
                number={3}
                title="Address Information"
                subtitle="Your complete residential address."
              />
              <div className="grid grid-cols-1 gap-x-5 gap-y-5 sm:grid-cols-2">
                <ApplicationField label="Street Address" value={application.street} />
                <ApplicationField label="City / Municipality" value={application.city} />
                <ApplicationField label="State / Province" value={application.province} />
                <ApplicationField label="Zip / Postal Code" value={application.zip} />
                <ApplicationField label="Country" value={application.country} />
              </div>
            </section>

            <section aria-labelledby="application-section-4">
              <SectionHeading
                number={4}
                title="Personal Statement"
                subtitle="Your response from the admission application."
              />
              <div className="whitespace-pre-wrap rounded-lg border border-[#DCE4ED] bg-[#F8FAFC] p-3.5 text-sm leading-6 text-[#183B56]">
                {application.personalStatement || "Not provided"}
              </div>
            </section>

            <section aria-labelledby="application-section-5">
              <SectionHeading
                number={5}
                title="Required Documents"
                subtitle="The files submitted with your application."
              />
              {application.attachments?.length ? (
                <ul className="space-y-2">
                  {application.attachments.map((filename, index) => (
                    <li
                      key={`${filename}-${index}`}
                      className="rounded-lg border border-[#DCE4ED] bg-[#F8FAFC] px-3.5 py-3 text-sm text-[#183B56]"
                    >
                      {filename}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-500">No document names available.</p>
              )}
            </section>

            <p className="border-t border-[#DCE4ED] pt-5 text-xs text-slate-500">
              Submitted{" "}
              {application.submittedAt
                ? new Date(application.submittedAt).toLocaleString()
                : "recently"}
            </p>
          </div>
        ) : (
          <section className="rounded-2xl border-2 border-slate-100 bg-white p-8 text-center shadow-[0_12px_40px_rgba(13,43,69,0.08)] sm:p-12">
            <h2 className="text-xl font-bold text-[#0D2B45]">
              No application is available in this session
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-500">
              Submit the admission form in this browser session to see your
              submitted information here.
            </p>
            <Link
              href="/admission/registration"
              className="mt-6 inline-flex min-h-11 items-center justify-center rounded-lg bg-[#FFC107] px-5 text-sm font-bold text-[#082B49] transition-colors hover:bg-[#E5A900] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFC107] focus-visible:ring-offset-2"
            >
              Open Admission Form
            </Link>
          </section>
        )}
      </div>
    </main>
  );
}
