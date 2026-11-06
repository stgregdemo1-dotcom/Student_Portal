import { NextRequest, NextResponse } from "next/server";
import { createHash } from "node:crypto";
import mongoose from "mongoose";
import { Admission, Audit } from "@/models/Schema";

export const dynamic = "force-dynamic";

const admissionDocumentUploads = [
  {
    fieldName: "profilePic",
    documentType: "profile",
    title: "Profile Picture",
    maxFiles: 1,
    extensions: [".jpg", ".jpeg", ".png", ".webp"],
  },
  {
    fieldName: "reportCard",
    documentType: "reportCard",
    title: "Report Card",
    maxFiles: 2,
    extensions: [".pdf", ".jpg", ".jpeg", ".png", ".webp"],
  },
  {
    fieldName: "birthCert",
    documentType: "birthCertificate",
    title: "Birth Certificate",
    maxFiles: 1,
    extensions: [".pdf", ".jpg", ".jpeg", ".png", ".webp"],
  },
] as const;

const contentTypeByExtension: Record<string, string> = {
  ".pdf": "application/pdf",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(process.env.MONGODB_URI!);
};

function getAuditUser(request: NextRequest): string {
  const auditUserCookie = request.cookies.get("audit_user");
  return auditUserCookie ? decodeURIComponent(auditUserCookie.value) : "SYSTEM";
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = request.nextUrl;

    const applicantId = searchParams.get("applicantId") || searchParams.get("id");
    const fileId = searchParams.get("fileId");
    const tableName = searchParams.get("table");

    if (applicantId && fileId) {
      const applicant = await Admission.findOne(
        { applicant_id: applicantId, "attachments._id": fileId },
        { "attachments.$": 1 }
      );

      if (!applicant || !applicant.attachments || applicant.attachments.length === 0) {
        return NextResponse.json({ message: "Requested attachment file not found." }, { status: 404 });
      }

      const file = applicant.attachments[0];

      let rawBuffer: Buffer;
      if (file.data && file.data.buffer) {
        rawBuffer = Buffer.from(file.data.buffer);
      } else if (Buffer.isBuffer(file.data)) {
        rawBuffer = file.data;
      } else {
        rawBuffer = Buffer.from(file.data as any);
      }

      const safeFilename = file.filename || "downloaded-file";
      
      return new NextResponse(new Uint8Array(rawBuffer), {
        headers: {
          "Content-Type": file.contentType || "application/octet-stream",
          "Content-Disposition": `attachment; filename="${safeFilename}"`,
        },
      });
    }

    if (applicantId && !fileId && !tableName) {
      const record = await Admission.findOne({ applicant_id: applicantId });
      if (!record) {
        return NextResponse.json({ message: "Applicant profile not found." }, { status: 404 });
      }
      return NextResponse.json({ success: true, data: record }, { status: 200 });
    }

    if (tableName === "admissions_applications" || tableName === "admissions") {
      const records = await Admission.find({})
        .select("-attachments.data")
        .sort({ submittedAt: -1 })
        .allowDiskUse(true);

      return NextResponse.json({ success: true, data: records }, { status: 200 });
    }

    return NextResponse.json(
      { message: "Bad Request: Missing or invalid query parameter combinations." },
      { status: 400 }
    );

  } catch (error: any) {
    console.error("Unified Admissions GET handler error:", error);
    return NextResponse.json({ message: "Internal server error processing asset stream." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const formData = await request.formData();
    const fields: Record<string, any> = {};

    formData.forEach((value, key) => {
      if (!admissionDocumentUploads.some((upload) => upload.fieldName === key)) {
        fields[key] = value;
      }
    });

    if (typeof fields.phone !== "string" || !/^\d{11}$/.test(fields.phone)) {
      return NextResponse.json(
        { message: "Phone number must contain exactly 11 digits." },
        { status: 400 }
      );
    }

    const textFields = [
      { key: "firstName", label: "First name", required: true },
      { key: "middleName", label: "Middle name", required: false },
      { key: "lastName", label: "Last name", required: true },
      { key: "nationality", label: "Nationality", required: true },
    ];
    for (const { key, label, required } of textFields) {
      const value = typeof fields[key] === "string" ? fields[key].trim() : "";
      if ((!value && required) || (value && !/^[\p{L}\p{M}][\p{L}\p{M} '\u2019-]*$/u.test(value))) {
        return NextResponse.json(
          { message: `${label} can contain letters, spaces, apostrophes, or hyphens only.` },
          { status: 400 }
        );
      }
      if (value) fields[key] = value;
    }

    // ==========================================
    // Duplicate Application Check
    // ==========================================
    const firstNameVal = fields.firstName?.trim();
    const middleNameVal = fields.middleName?.trim();
    const lastNameVal = fields.lastName?.trim();
    const suffixVal = fields.suffix?.trim();
    const dobVal = fields.dob;

    if (firstNameVal && lastNameVal && dobVal) {
      const query: any = {
        firstName: new RegExp(`^${firstNameVal}$`, "i"),
        lastName: new RegExp(`^${lastNameVal}$`, "i"),
        dob: dobVal,
        status: { $ne: "Rejected" },
      };

      if (middleNameVal) {
        query.middleName = new RegExp(`^${middleNameVal}$`, "i");
      } else {
        query.middleName = { $in: [null, "", undefined] };
      }

      if (suffixVal) {
        query.suffix = new RegExp(`^${suffixVal}$`, "i");
      } else {
        query.suffix = { $in: [null, "", undefined] };
      }

      const existingApplication = await Admission.findOne(query);

      if (existingApplication) {
        return NextResponse.json(
          { 
            message: `An existing application for ${firstNameVal} ${lastNameVal} with this date of birth already exists (Status: ${existingApplication.status}).` 
          },
          { status: 400 }
        );
      }
    }
    // ==========================================

    const processedAttachments: {
      filename: string;
      contentType: string;
      documentType: string;
      data: Buffer;
    }[] = [];
    const maxFileSize = 5 * 1024 * 1024;
    const fileIdentifiers = new Map<string, string>();

    for (const upload of admissionDocumentUploads) {
      const files = formData
        .getAll(upload.fieldName)
        .filter((entry): entry is File => entry instanceof File && entry.size > 0);

      if (files.length > upload.maxFiles) {
        return NextResponse.json(
          {
            message: `${upload.title} accepts up to ${upload.maxFiles} file${upload.maxFiles === 1 ? "" : "s"}.`,
          },
          { status: 400 },
        );
      }

      for (const file of files) {
        if (file.size > maxFileSize) {
          return NextResponse.json(
            { message: `File "${file.name}" exceeds the max allowed limit of 5MB.` },
            { status: 400 }
          );
        }

        const extension = `.${file.name.split(".").pop()?.toLowerCase() ?? ""}`;
        if (!upload.extensions.some((allowedExtension) => allowedExtension === extension)) {
          return NextResponse.json(
            { message: `File "${file.name}" is not supported for ${upload.title}.` },
            { status: 400 },
          );
        }

        const expectedContentType = contentTypeByExtension[extension];
        if (
          file.type &&
          file.type !== "application/octet-stream" &&
          file.type !== expectedContentType
        ) {
          return NextResponse.json(
            { message: `File "${file.name}" has an unsupported file type.` },
            { status: 400 },
          );
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const fileIdentifier = createHash("sha256").update(buffer).digest("hex");
        const existingDocumentType = fileIdentifiers.get(fileIdentifier);
        if (existingDocumentType) {
          const previousUpload = admissionDocumentUploads.find(
            (document) => document.documentType === existingDocumentType,
          );
          return NextResponse.json(
            {
              message: `File "${file.name}" is already assigned to ${previousUpload?.title || "another document"}. Upload a different file for each document.`,
            },
            { status: 400 },
          );
        }

        fileIdentifiers.set(fileIdentifier, upload.documentType);

        processedAttachments.push({
          filename: file.name,
          contentType:
            file.type && file.type !== "application/octet-stream"
              ? file.type
              : expectedContentType,
          documentType: upload.documentType,
          data: buffer,
        });
      }
    }

    const hasProfilePicture = processedAttachments.some(
      (attachment) => attachment.documentType === "profile",
    );
    if (!hasProfilePicture) {
      return NextResponse.json(
        { message: "Please upload a profile picture with a white background." },
        { status: 400 },
      );
    }

    const hasSupportingDocument = processedAttachments.some(
      (attachment) =>
        attachment.documentType === "reportCard" ||
        attachment.documentType === "birthCertificate",
    );
    if (!hasSupportingDocument) {
      return NextResponse.json(
        { message: "Please upload either a report card or a birth certificate." },
        { status: 400 },
      );
    }

    if (!fields.applicant_id) {
      const currentYear = new Date().getFullYear();
      const idPrefix = `ID-${currentYear}-`;

      const totalYearCount = await Admission.countDocuments({
        applicant_id: new RegExp(`^${idPrefix}`)
      });

      const paddedIndex = (totalYearCount + 1).toString().padStart(5, "0");
      fields.applicant_id = `${idPrefix}${paddedIndex}`;
    }

    const applicationData = {
      applicant_id: fields.applicant_id,
      status: fields.status || "Pending",
      firstName: fields.firstName,
      middleName: fields.middleName,
      lastName: fields.lastName,
      suffix: suffixVal || undefined,
      email: fields.email,
      phone: fields.phone,
      dob: fields.dob,
      gender: fields.gender,
      nationality: fields.nationality,
      track: fields.track,
      enrollmentType: fields.enrollmentType,
      gradeLevel: fields.gradeLevel,
      lrn: fields.lrn,
      lastSchool: fields.lastSchool,
      street: fields.street,
      city: fields.city,
      province: fields.province,
      zip: fields.zip,
      country: fields.country,
      personalStatement: fields.personalStatement,
      attachments: processedAttachments,
      submittedAt: new Date()
    };

    const application = new Admission(applicationData);
    await application.save();

    const currentOperator = getAuditUser(request);
    const applicantFullName = `${fields.firstName || ""} ${fields.lastName || ""}${suffixVal ? `, ${suffixVal}` : ""}`.trim();
    const activityDescription = `Submitted new admission application for applicant: ${applicantFullName} (ID: ${fields.applicant_id})`;

    await createAuditLog(currentOperator, activityDescription);

    return NextResponse.json(
      { message: "Application archived successfully.", data: application },
      { status: 201 }
    );

  } catch (error: any) {
    console.error("Admission endpoint save layout crash:", error);
    return NextResponse.json(
      { message: error.message || "Internal server error." },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const { applicant_id, status } = body;

    if (!applicant_id || !status) {
      return NextResponse.json({ message: "Missing required properties: applicant_id or status." }, { status: 400 });
    }

    const updatedApplication = await Admission.findOneAndUpdate(
      { applicant_id: applicant_id },
      { status: status },
      { new: true }
    );

    if (!updatedApplication) {
      return NextResponse.json({ message: "Applicant records not found matching that ID." }, { status: 404 });
    }

    const currentOperator = getAuditUser(request);
    const activityDescription = `Updated admission application status for ID ${applicant_id} to '${status}'`;

    await createAuditLog(currentOperator, activityDescription);

    return NextResponse.json({ success: true, data: updatedApplication }, { status: 200 });
  } catch (error: any) {
    console.error("Admission endpoint status update error:", error);
    return NextResponse.json({ message: error.message || "Internal server error." }, { status: 500 });
  }
}

async function createAuditLog(username: string, activityDescription: string) {
  let detectedUserType = "SYSTEM";
  const upperUsername = username.toUpperCase();

  if (upperUsername.startsWith("ADM")) {
    detectedUserType = "admin";
  } else if (upperUsername.startsWith("TCH")) {
    detectedUserType = "teacher";
  } else if (upperUsername.startsWith("REG")) {
    detectedUserType = "registrar";
  } else if (upperUsername.startsWith("ST")) {
    detectedUserType = "student";
  }

  const logEntry = new Audit({
    username: username,
    user_type: detectedUserType,
    activity: activityDescription,
  });

  await logEntry.save();
}
