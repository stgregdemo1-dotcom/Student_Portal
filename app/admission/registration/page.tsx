"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import React from "react";
import Link from "next/link";

interface InputFieldProps {
  label: string;
  name: string;
  type?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  maxLength?: number;
  pattern?: string;
  placeholder?: string;
  max?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onInvalid?: (e: React.InvalidEvent<HTMLInputElement>) => void;
}

interface SelectFieldProps {
  label: string;
  name: string;
  options: string[];
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

type DocumentSlot = "profile" | "reportCard" | "birthCertificate";

interface DocumentUpload {
  id: DocumentSlot;
  formFieldName: "profilePic" | "reportCard" | "birthCert";
  title: string;
  description: string;
  accept: string;
  formats: string;
  maxFiles: number;
  icon: "image" | "report" | "certificate";
}

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const fieldClassName =
  "h-12 w-full rounded-lg border border-[#DCE4ED] bg-white px-3.5 text-sm text-[#183B56] outline-none transition focus:border-[#183B56] focus:ring-2 focus:ring-[#183B56]/15 placeholder:text-slate-400";
const labelClassName = "ml-0.5 text-xs font-semibold text-[#334155]";

const documentUploads: DocumentUpload[] = [
  {
    id: "profile",
    formFieldName: "profilePic",
    title: "Profile Picture",
    description: "A recent photo of the applicant",
    accept: "image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp",
    formats: "JPG, PNG, WEBP",
    maxFiles: 1,
    icon: "image",
  },
  {
    id: "reportCard",
    formFieldName: "reportCard",
    title: "Report Card",
    description: "Most recent school report card",
    accept: "application/pdf,image/jpeg,image/png,image/webp,.pdf,.jpg,.jpeg,.png,.webp",
    formats: "PDF, JPG, PNG, WEBP",
    maxFiles: 2,
    icon: "report",
  },
  {
    id: "birthCertificate",
    formFieldName: "birthCert",
    title: "Birth Certificate",
    description: "Applicant's birth certificate",
    accept: "application/pdf,image/jpeg,image/png,image/webp,.pdf,.jpg,.jpeg,.png,.webp",
    formats: "PDF, JPG, PNG, WEBP",
    maxFiles: 1,
    icon: "certificate",
  },
];

const acceptedExtensions: Record<DocumentSlot, string[]> = {
  profile: [".jpg", ".jpeg", ".png", ".webp"],
  reportCard: [".pdf", ".jpg", ".jpeg", ".png", ".webp"],
  birthCertificate: [".pdf", ".jpg", ".jpeg", ".png", ".webp"],
};

const getFileIdentifier = (file: File) =>
  `${file.name.toLowerCase()}-${file.size}-${file.lastModified}`;

const InputField: React.FC<InputFieldProps> = ({
  label,
  name,
  type = "text",
  inputMode,
  maxLength,
  pattern,
  placeholder,
  max,
  onChange,
  onInvalid,
}) => (
  <div className="flex min-w-0 flex-col gap-2">
    <label htmlFor={name} className={labelClassName}>
      {label}
    </label>
    <input
      id={name}
      type={type}
      inputMode={inputMode}
      maxLength={maxLength}
      pattern={pattern}
      name={name}
      placeholder={placeholder}
      max={max}
      onChange={onChange}
      onInvalid={onInvalid}
      className={fieldClassName}
      required={label.includes("*")}
    />
  </div>
);

const SelectField: React.FC<SelectFieldProps> = ({
  label,
  name,
  options,
  value,
  onChange,
}) => (
  <div className="flex min-w-0 flex-col gap-2">
    <label htmlFor={name} className={labelClassName}>
      {label}
    </label>
    <select
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      className={fieldClassName}
    >
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  </div>
);

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
        <h2
          id={`admission-section-${number}`}
          className="text-lg font-bold text-[#0D2B45] sm:text-xl"
        >
          {title}
        </h2>
      </div>
      <p className="mt-2 text-sm text-slate-500">{subtitle}</p>
    </div>
  );
}

function DocumentIcon({ type }: { type: DocumentUpload["icon"] }) {
  const paths = {
    image: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="3" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="m21 15-5-5L5 21" />
      </>
    ),
    report: (
      <>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path d="M14 2v6h6M8 13h8M8 17h8" />
      </>
    ),
    certificate: (
      <>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path d="M14 2v6h6M8 13h8M8 17h4" />
        <path d="m15 17 1.5 1.5L19 16" />
      </>
    ),
  };

  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[type]}
    </svg>
  );
}

function ImagePreview({ file }: { file: File }) {
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    const url = URL.createObjectURL(file);
    const frameId = window.requestAnimationFrame(() => setPreviewUrl(url));
    return () => {
      window.cancelAnimationFrame(frameId);
      URL.revokeObjectURL(url);
    };
  }, [file]);

  if (!previewUrl) return null;

  return (
    <img
      src={previewUrl}
      alt={`Preview of ${file.name}`}
      className="h-12 w-12 rounded-md border border-[#DCE4ED] object-cover"
    />
  );
}

function AdmissionFormContent() {
  const [status, setStatus] = React.useState<{
    type: "success" | "error" | "";
    message: string;
  }>({ type: "", message: "" });
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [enrollmentType, setEnrollmentType] = useState<string>("New Student");
  const [gradeLevel, setGradeLevel] = useState<string>("Grade 11");
  const [personalStatement, setPersonalStatement] = useState("");
  const [personalStatementCountMode, setPersonalStatementCountMode] =
    useState<"characters" | "words">("characters");
  const [maxDobDate, setMaxDobDate] = useState<string | undefined>(undefined);
  const [selectedFiles, setSelectedFiles] = useState<
    Record<DocumentSlot, File[]>
  >({
    profile: [],
    reportCard: [],
    birthCertificate: [],
  });
  const [fileErrors, setFileErrors] = useState<
    Record<DocumentSlot, string>
  >({
    profile: "",
    reportCard: "",
    birthCertificate: "",
  });
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const personalStatementCharacterCount = personalStatement.length;
  const personalStatementWordCount = personalStatement
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  const personalStatementCount =
    personalStatementCountMode === "characters"
      ? personalStatementCharacterCount
      : personalStatementWordCount;

  useEffect(() => {
    const today = new Date();
    const cutoffDate = new Date(
      today.getFullYear() - 13,
      today.getMonth(),
      today.getDate()
    );
    setMaxDobDate(cutoffDate.toISOString().split("T")[0]);
  }, []);

  const gradeLevelOptions =
    enrollmentType === "New Student" ? ["Grade 11"] : ["Grade 11", "Grade 12"];

  const handleEnrollmentTypeChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const selectedType = e.target.value;
    setEnrollmentType(selectedType);

    if (selectedType === "New Student") {
      setGradeLevel("Grade 11");
    }
  };

  const handleDobValidation = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    if (!input.value) {
      input.setCustomValidity("");
      return;
    }

    const today = new Date();
    const dob = new Date(input.value);
    const ageCutoff = new Date(
      today.getFullYear() - 15,
      today.getMonth(),
      today.getDate()
    );

    if (dob > ageCutoff) {
      input.setCustomValidity("You must be at least 15 years old to apply.");
    } else {
      input.setCustomValidity("");
    }
  };

  const handleFileSelection = (slot: DocumentSlot, fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    const upload = documentUploads.find((document) => document.id === slot);
    if (!upload) return;

    const addToExisting = slot === "reportCard";
    const currentFiles = addToExisting ? selectedFiles[slot] : [];
    const filesInOtherSlots = Object.entries(selectedFiles)
      .filter(([selectedSlot]) => addToExisting || selectedSlot !== slot)
      .flatMap(([, files]) => files);
    const seenFileIdentifiers = new Set(
      [...filesInOtherSlots, ...currentFiles].map(getFileIdentifier),
    );
    const validFiles: File[] = [];
    const errors: string[] = [];

    for (const file of Array.from(fileList)) {
      const fileIdentifier = getFileIdentifier(file);
      if (seenFileIdentifiers.has(fileIdentifier)) {
        errors.push(
          `${file.name} is already selected. Choose a different file for each document.`,
        );
        continue;
      }

      if (file.size > MAX_FILE_SIZE) {
        errors.push(`${file.name} exceeds the 5 MB limit.`);
        continue;
      }

      const extension = `.${file.name.split(".").pop()?.toLowerCase() ?? ""}`;
      if (!acceptedExtensions[slot].includes(extension)) {
        errors.push(`${file.name} has an unsupported file format.`);
        continue;
      }

      if (currentFiles.length + validFiles.length >= upload.maxFiles) {
        errors.push(
          `${upload.title} accepts up to ${upload.maxFiles} file${upload.maxFiles === 1 ? "" : "s"}.`
        );
        continue;
      }

      validFiles.push(file);
      seenFileIdentifiers.add(fileIdentifier);
    }

    setSelectedFiles((current) => ({
      ...current,
      [slot]: addToExisting
        ? [...current[slot], ...validFiles]
        : validFiles.length > 0
        ? validFiles
        : current[slot],
    }));
    setFileErrors((current) => ({ ...current, [slot]: errors.join(" ") }));
    const slotIndex = documentUploads.findIndex((upload) => upload.id === slot);
    if (fileInputRefs.current[slotIndex]) {
      fileInputRefs.current[slotIndex]!.value = "";
    }
  };

  const removeFile = (slot: DocumentSlot, index: number) => {
    setSelectedFiles((current) => ({
      ...current,
      [slot]: current[slot].filter((_, fileIndex) => fileIndex !== index),
    }));
    setFileErrors((current) => ({ ...current, [slot]: "" }));
  };

  const selectedFileCount = Object.values(selectedFiles).reduce(
    (count, files) => count + files.length,
    0
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus({ type: "", message: "" });

    if (selectedFileCount === 0) {
      setStatus({
        type: "error",
        message: "Please upload at least one required document.",
      });
      return;
    }

    if (Object.values(fileErrors).some(Boolean)) {
      setStatus({
        type: "error",
        message: "Please resolve the document upload errors before submitting.",
      });
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const dobValue = formData.get("dob") as string;

    if (dobValue) {
      const today = new Date();
      const dob = new Date(dobValue);
      const ageCutoff = new Date(
        today.getFullYear() - 15,
        today.getMonth(),
        today.getDate()
      );
      if (dob > ageCutoff) {
        setStatus({
          type: "error",
          message: "Applicants must be at least 15 years old.",
        });
        setIsSubmitting(false);
        return;
      }
    }

    documentUploads.forEach(({ id, formFieldName }) => {
      selectedFiles[id].forEach((file) => formData.append(formFieldName, file));
    });

    try {
      const res = await fetch("/api/admission", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setStatus({
          type: "success",
          message: "Application submitted successfully!",
        });
        (e.target as HTMLFormElement).reset();
        fileInputRefs.current.forEach((input) => {
          if (input) input.value = "";
        });
        setSelectedFiles({
          profile: [],
          reportCard: [],
          birthCertificate: [],
        });
        setFileErrors({
          profile: "",
          reportCard: "",
          birthCertificate: "",
        });
        setPersonalStatement("");
        setEnrollmentType("New Student");
        setGradeLevel("Grade 11");
      } else {
        setStatus({
          type: "error",
          message: data.message || "Failed to submit application.",
        });
      }
    } catch {
      setStatus({
        type: "error",
        message: "Network connection error. Try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-84px)] w-full bg-[radial-gradient(ellipse_at_8%_46%,rgba(255,193,7,0.22),transparent_30%),radial-gradient(ellipse_at_92%_64%,rgba(71,153,220,0.20),transparent_32%),linear-gradient(135deg,#EEF5FF_0%,#FFF8E8_48%,#EAF3FF_100%)] px-4 pb-20 pt-8 font-sans text-[#1E293B] sm:px-6 sm:pb-24 sm:pt-10 md:min-h-[calc(100vh-96px)] lg:pb-28 lg:pt-12">
      <div className="mx-auto max-w-[1000px]">
        <form
          onSubmit={handleSubmit}
          className="space-y-9 rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_12px_40px_rgba(13,43,69,0.08)] sm:p-8 lg:p-10"
        >
          <div className="relative flex flex-col gap-6 border-b border-[#DCE4ED] pb-7 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 pr-12 sm:pr-0">
              <h1 className="text-2xl font-extrabold leading-tight sm:text-3xl">
                <span className="text-[#0D2B45]">SGCST</span>{" "}
                <span className="text-[#D89B00]">Admission Application</span>
              </h1>
              <p className="mt-2 text-sm font-semibold text-[#183B56] sm:text-base">
                Saint Gregory College of Science and Technology
              </p>
              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                Complete the form below to begin your admission application.
              </p>
              <p className="mt-3 text-xs text-slate-500">
                <span className="font-bold text-[#D89B00]">*</span> Required
                field
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row lg:shrink-0">
              <Link
                href="/admission/verification"
                prefetch
                className="inline-flex min-h-11 items-center justify-center rounded-lg border border-[#0D2B45] bg-white px-4 py-2 text-center text-sm font-semibold italic text-[#0D2B45] no-underline transition-colors hover:text-[#D89B00] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFC107] focus-visible:ring-offset-2 sm:rounded-none sm:border-0 sm:bg-transparent sm:px-2 sm:underline sm:underline-offset-4"
              >
                Already Applied? Check Status
              </Link>
              <Link
                href="/Home"
                prefetch
                aria-label="Home"
                title="Home"
                className="absolute right-0 top-0 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#0D2B45] bg-white text-[#0D2B45] transition-[background-color,color,transform] duration-300 ease-in-out hover:scale-105 hover:bg-[#0D2B45] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFC107] focus-visible:ring-offset-2 motion-reduce:transition-none sm:static"
              >
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m3 10 9-7 9 7" />
                  <path d="M5 9v11h14V9M9 20v-6h6v6" />
                </svg>
              </Link>
            </div>
          </div>

          <section aria-labelledby="admission-section-1">
            <SectionHeading
              number={1}
              title="Personal Information"
              subtitle="Provide your basic personal details."
            />
            <div className="grid grid-cols-1 gap-x-5 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
              <InputField label="First Name *" name="firstName" placeholder="Juan" />
              <InputField
                label="Middle Name"
                name="middleName"
                placeholder="Protacio"
              />
              <InputField
                label="Last Name *"
                name="lastName"
                placeholder="Dela Cruz"
              />
              <InputField
                label="Email Address *"
                name="email"
                type="email"
                placeholder="juan@example.com"
              />
              <InputField
                label="Phone Number *"
                name="phone"
                type="text"
                inputMode="numeric"
                maxLength={11}
                pattern="[0-9]{11}"
                placeholder="09XXXXXXXXX"
                onChange={(e) => {
                  e.currentTarget.value = e.currentTarget.value
                    .replace(/\D/g, "")
                    .slice(0, 11);
                }}
              />
              <InputField
                label="Date of Birth *"
                name="dob"
                type="date"
                max={maxDobDate}
                onChange={handleDobValidation}
                onInvalid={(e) =>
                  e.currentTarget.setCustomValidity(
                    "You must be at least 15 years old to apply."
                  )
                }
              />
              <SelectField
                label="Gender *"
                name="gender"
                options={["Male", "Female", "Other"]}
              />
              <InputField
                label="Nationality *"
                name="nationality"
                placeholder="Filipino"
              />
            </div>
          </section>

          <section aria-labelledby="admission-section-2">
            <SectionHeading
              number={2}
              title="Academic Information"
              subtitle="Provide your academic background and preferred program."
            />
            <div className="grid grid-cols-1 gap-x-5 gap-y-5 sm:grid-cols-2">
              <SelectField
                label="Desired Track/Strand *"
                name="track"
                options={[
                  "Information and Communication Technology",
                  "Hotel and Restaurant Management",
                ]}
              />
              <SelectField
                label="Enrollment Type *"
                name="enrollmentType"
                options={["New Student", "Transferee"]}
                value={enrollmentType}
                onChange={handleEnrollmentTypeChange}
              />
              <SelectField
                label="Grade Level *"
                name="gradeLevel"
                options={gradeLevelOptions}
                value={gradeLevel}
                onChange={(e) => setGradeLevel(e.target.value)}
              />
              <InputField
                label="LRN"
                name="lrn"
                placeholder="12-digit LRN"
                inputMode="numeric"
                onChange={(e) => {
                  e.currentTarget.value = e.currentTarget.value.replace(
                    /\D/g,
                    ""
                  );
                }}
              />
              <InputField
                label="Last School Attended *"
                name="lastSchool"
                placeholder="School Name"
              />
            </div>
          </section>

          <section aria-labelledby="admission-section-3">
            <SectionHeading
              number={3}
              title="Address Information"
              subtitle="Provide your complete residential address."
            />
            <div className="grid grid-cols-1 gap-x-5 gap-y-5 sm:grid-cols-2">
              <InputField
                label="Street Address *"
                name="street"
                placeholder="Unit/House No, Street"
              />
              <InputField
                label="City / Municipality *"
                name="city"
                placeholder="Manila"
              />
              <InputField
                label="State / Province *"
                name="province"
                placeholder="Metro Manila"
              />
              <InputField
                label="Zip / Postal Code *"
                name="zip"
                placeholder="1000"
              />
              <InputField
                label="Country *"
                name="country"
                placeholder="Philippines"
              />
            </div>
          </section>

          <section aria-labelledby="admission-section-4">
            <SectionHeading
              number={4}
              title="Personal Statement"
              subtitle="Share what interests you about SGCST or your future goals. A short answer is perfectly okay."
            />
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap items-center justify-between gap-1">
                <label htmlFor="personalStatement" className={labelClassName}>
                  Personal Statement *
                </label>
                <p className="text-xs text-slate-500">
                  Maximum 255 characters, including spaces.
                </p>
              </div>
              <textarea
                id="personalStatement"
                name="personalStatement"
                rows={5}
                maxLength={255}
                className="w-full resize-y rounded-lg border border-[#DCE4ED] bg-white p-3.5 text-sm leading-6 text-[#183B56] outline-none transition placeholder:text-slate-400 focus:border-[#183B56] focus:ring-2 focus:ring-[#183B56]/15"
                placeholder="Why do you want to join SGCST?"
                value={personalStatement}
                onChange={(event) => setPersonalStatement(event.target.value)}
                required
              />
              <button
                type="button"
                onClick={() =>
                  setPersonalStatementCountMode((mode) =>
                    mode === "characters" ? "words" : "characters"
                  )
                }
                aria-live="polite"
                aria-atomic="true"
                aria-label={`Showing ${personalStatementCountMode}. Click to show ${
                  personalStatementCountMode === "characters"
                    ? "word count"
                    : "character count"
                }.`}
                title="Click to switch between character and word count"
                className="inline-flex self-end cursor-pointer items-center gap-1.5 rounded-sm text-right text-xs font-medium text-slate-600 underline decoration-dotted underline-offset-2 transition-colors hover:text-[#0D2B45] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFC107]"
              >
                {personalStatementCount}{" "}
                {personalStatementCountMode === "characters"
                  ? personalStatementCount === 1
                    ? "character"
                    : "characters"
                  : personalStatementCount === 1
                    ? "word"
                    : "words"}
                <svg
                  aria-hidden="true"
                  viewBox="0 0 16 16"
                  fill="none"
                  className="h-3.5 w-3.5"
                >
                  <path
                    d="M3 5h9l-2-2m3 8H4l2 2"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </section>

          <section aria-labelledby="admission-section-5">
            <SectionHeading
              number={5}
              title="Required Documents"
              subtitle="Upload the required documents. Use a different file for each document; report cards and birth certificates may be PDF, JPG, PNG, or WEBP. At least one document is required."
            />
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              {documentUploads.map((upload, index) => (
                <div
                  key={upload.id}
                  className="flex h-full min-w-0 flex-col rounded-xl border border-[#DCE4ED] bg-white p-4"
                >
                  <div className="flex min-h-[60px] items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-[#D89B00]">
                      <DocumentIcon type={upload.icon} />
                    </span>
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-[#0D2B45]">
                        {upload.title}
                      </h3>
                      <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
                        {upload.description}
                      </p>
                    </div>
                  </div>
                  <p className="mt-4 flex min-h-10 flex-wrap content-start gap-x-1.5 text-xs leading-5 text-slate-500">
                    <span className="whitespace-nowrap">{upload.formats}</span>
                    <span className="whitespace-nowrap">
                      · Up to {upload.maxFiles} file{upload.maxFiles === 1 ? "" : "s"}
                    </span>
                    <span className="whitespace-nowrap">· Max 5 MB each</span>
                  </p>
                  <input
                    ref={(element) => {
                      fileInputRefs.current[index] = element;
                    }}
                    type="file"
                    name={upload.formFieldName}
                    accept={upload.accept}
                    multiple={upload.maxFiles > 1}
                    disabled={
                      isSubmitting ||
                      (upload.id === "reportCard" &&
                        selectedFiles[upload.id].length >= upload.maxFiles)
                    }
                    onChange={(e) =>
                      handleFileSelection(upload.id, e.currentTarget.files)
                    }
                    className="sr-only"
                    id={`upload-${upload.id}`}
                    aria-label={`Choose ${upload.title} files`}
                  />
                  <label
                    htmlFor={`upload-${upload.id}`}
                    className={`mt-auto inline-flex min-h-10 w-full items-center justify-center rounded-lg border border-[#DCE4ED] bg-slate-50 px-3 py-2 text-xs font-semibold text-[#183B56] transition-[transform,background-color,border-color,box-shadow] duration-300 ease-in-out hover:-translate-y-0.5 hover:border-[#D89B00] hover:bg-[#FFF8E1] hover:shadow-sm focus-within:ring-2 focus-within:ring-[#FFC107] motion-reduce:transition-none ${
                      isSubmitting ||
                      (upload.id === "reportCard" &&
                        selectedFiles[upload.id].length >= upload.maxFiles)
                        ? "cursor-not-allowed opacity-50"
                        : "cursor-pointer"
                    }`}
                  >
                    {selectedFiles[upload.id].length >= upload.maxFiles
                      ? upload.id === "reportCard"
                        ? `${upload.maxFiles} files selected`
                        : "Replace file"
                      : selectedFiles[upload.id].length > 0
                      ? "Add another file"
                      : "Choose file"}
                  </label>
                  {fileErrors[upload.id] && (
                    <p className="mt-2 text-xs font-medium text-red-600" role="alert">
                      {fileErrors[upload.id]}
                    </p>
                  )}
                  {selectedFiles[upload.id].length > 0 && (
                    <ul className="mt-3 space-y-2">
                      {selectedFiles[upload.id].map((file, fileIndex) => (
                        <li
                          key={`${file.name}-${file.lastModified}-${fileIndex}`}
                          className="flex min-w-0 items-center gap-2 rounded-lg bg-slate-50 p-2"
                        >
                          {file.type === "application/pdf" ||
                          file.name.toLowerCase().endsWith(".pdf") ? (
                            <span
                              aria-hidden="true"
                              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md border border-red-100 bg-red-50 text-[10px] font-bold text-red-600"
                            >
                              PDF
                            </span>
                          ) : (
                            <ImagePreview file={file} />
                          )}
                          <span
                            className="min-w-0 flex-1 truncate text-xs text-slate-600"
                            title={file.name}
                          >
                            {file.name}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeFile(upload.id, fileIndex)}
                            disabled={isSubmitting}
                            className="shrink-0 rounded px-1.5 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                            aria-label={`Remove ${file.name}`}
                          >
                            Remove
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>

          <div className="space-y-5 border-t border-[#DCE4ED] pt-6">
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4 shrink-0 accent-[#0D2B45]"
                required
              />
              <span className="text-sm leading-5 text-slate-600">
                I certify that all information provided is true and correct.
              </span>
            </label>

            <button
              type="submit"
              disabled={isSubmitting}
              className="group flex h-[56px] w-full cursor-pointer items-center justify-center rounded-[10px] border-2 border-[#E5A900] bg-[#FFC107] px-5 text-sm font-bold tracking-wide text-[#082B49] shadow-[0_5px_16px_rgba(13,43,69,0.18)] transition-[background-color,color,border-color,box-shadow] duration-300 ease-in-out hover:border-[#082B49] hover:bg-[#082B49] hover:text-white hover:shadow-[0_8px_20px_rgba(8,43,73,0.26)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#FFC107]/60 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:border-slate-300 disabled:bg-slate-300 disabled:text-slate-500 disabled:opacity-70 motion-reduce:transition-none"
            >
              {isSubmitting
                ? "SUBMITTING APPLICATION..."
                : "SUBMIT APPLICATION"}
            </button>
          </div>
        </form>
      </div>
      {status.message && (
        <div
          role={status.type === "error" ? "alert" : "status"}
          aria-live={status.type === "error" ? "assertive" : "polite"}
          aria-atomic="true"
          className={`fixed inset-x-4 bottom-4 z-50 mx-auto flex max-w-lg items-start justify-between gap-4 rounded-lg border p-4 text-sm font-medium shadow-lg sm:inset-x-auto sm:right-6 sm:bottom-6 ${
            status.type === "success"
              ? "border-green-200 bg-green-50 text-green-800"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          <span>{status.message}</span>
          <button
            type="button"
            onClick={() => setStatus({ type: "", message: "" })}
            className="shrink-0 rounded px-2 py-1 text-xs font-semibold hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current"
            aria-label="Dismiss notification"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
}

export default function AdmissionForm() {
  return (
    <Suspense fallback={<div className="text-center p-20 font-bold text-[#856404]">Loading Admission Portal...</div>}>
      <AdmissionFormContent />
    </Suspense>
  );
}
