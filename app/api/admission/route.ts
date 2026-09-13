import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { Admission } from "@/models/Schema";

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(process.env.MONGODB_URI!);
};

// 🚀 UPDATED: Handles both fetching all records AND fetching a single applicant by applicant_id
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = request.nextUrl;
    
    // Accept BOTH standard casings to ensure the frontend never drops parameters
    const applicantId = searchParams.get("applicantId") || searchParams.get("id");
    const fileId = searchParams.get("fileId");
    const tableName = searchParams.get("table");

    // ---------------------------------------------------------
    // 🚀 SCENARIO 1: File Download Pipeline
    // Triggered when BOTH an applicant context AND a specific fileId are passed
    // ---------------------------------------------------------
    if (applicantId && fileId) {
      const applicant = await Admission.findOne(
        { applicant_id: applicantId, "attachments._id": fileId },
        { "attachments.$": 1 }
      );

      if (!applicant || !applicant.attachments || applicant.attachments.length === 0) {
        return NextResponse.json({ message: "Requested attachment file not found." }, { status: 404 });
      }

      const file = applicant.attachments[0];
      
      // 🚨 CRITICAL FIX: Explicitly convert MongoDB BSON Binary back to a raw Node Buffer
      let rawBuffer: Buffer;
      if (file.data && file.data.buffer) {
        rawBuffer = Buffer.from(file.data.buffer);
      } else if (Buffer.isBuffer(file.data)) {
        rawBuffer = file.data;
      } else {
        rawBuffer = Buffer.from(file.data as any);
      }

      // Safe fallback filename mapping
      const safeFilename = file.filename || "downloaded-file";

       
     }

    // ---------------------------------------------------------
    // 🚀 SCENARIO 2: Single Applicant Info Lookup
    // Triggered when viewing the details of one student (?id=ID-2026-XXXXX)
    // ---------------------------------------------------------
    if (applicantId && !fileId && !tableName) {
      const record = await Admission.findOne({ applicant_id: applicantId });
      if (!record) {
        return NextResponse.json({ message: "Applicant profile not found." }, { status: 404 });
      }
      return NextResponse.json({ success: true, data: record }, { status: 200 });
    }

    // ---------------------------------------------------------
    // 🚀 SCENARIO 3: Summary Table View (List All)
    // ---------------------------------------------------------
    if (tableName === "admissions_applications" || tableName === "admissions") {
      const records = await Admission.find({}).sort({ submittedAt: -1 });
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
      if (key !== "files") {
        fields[key] = value;
      }
    });

    const rawFiles = formData.getAll("files") as File[];
    const processedAttachments = [];

    for (const file of rawFiles) {
      if (file.size > 0 && file.name !== "undefined") {
        if (file.size > 5 * 1024 * 1024) {
          return NextResponse.json(
            { message: `File ${file.name} exceeds the max allowed limit of 5MB.` }, 
            { status: 400 }
          );
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        processedAttachments.push({
          filename: file.name,
          contentType: file.type,
          data: buffer,
        });
      }
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
      applicant_id:      fields.applicant_id,
      status:            fields.status || "Pending",
      firstName:         fields.firstName,
      middleName:        fields.middleName,
      lastName:          fields.lastName,
      email:             fields.email,
      phone:             fields.phone,
      dob:               fields.dob,
      gender:            fields.gender,
      nationality:       fields.nationality,
      track:             fields.track,
      enrollmentType:    fields.enrollmentType,
      gradeLevel:        fields.gradeLevel,
      lrn:               fields.lrn,
      lastSchool:        fields.lastSchool,
      street:            fields.street,
      city:              fields.city,
      province:          fields.province,
      zip:               fields.zip,
      country:           fields.country,
      personalStatement: fields.personalStatement,
      attachments:       processedAttachments,
      submittedAt:       new Date()
    };

    const application = new Admission(applicationData);
    await application.save();

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

// 🚀 ADDED: Handles updating the review status (Approved / Rejected) via applicant_id
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
      { new: true } // Returns the modified document instead of the original
    );

    if (!updatedApplication) {
      return NextResponse.json({ message: "Applicant records not found matching that ID." }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updatedApplication }, { status: 200 });
  } catch (error: any) {
    console.error("Admission endpoint status update error:", error);
    return NextResponse.json({ message: error.message || "Internal server error." }, { status: 500 });
  }
}