import { NextRequest, NextResponse } from "next/server"; 
import { cookies } from "next/headers";
import mongoose from "mongoose";
import { Audit, Student, Admission, StudentSection, Subject } from "@/models/Schema";

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(process.env.MONGODB_URI!);
};

const ALLOWED_TABLES: Record<string, { model: mongoose.Model<any>; idKey: string }> = {
  students:                 { model: Student, idKey: "student_id" },
  admissions_applications:  { model: Admission, idKey: "applicant_id" },
  student_section:          { model: StudentSection, idKey: "student_id" },
  subjects:                 { model: Subject, idKey: "subject_code" }, 
};

const EXCLUDED_FIELDS: Record<string, string> = {
  admissions_applications: "-attachments.data",
};

const buildQueryConditions = (searchParams: URLSearchParams) => {
  const conditions: Record<string, any> = {};

  const statusFilter = searchParams.get("status");
  if (statusFilter) conditions.status = statusFilter;

  const yearFilter = searchParams.get("year");
  if (yearFilter) conditions["class.year"] = yearFilter;

  const sectionFilter = searchParams.get("section");
  if (sectionFilter) conditions["class.section"] = sectionFilter;

  const semesterFilter = searchParams.get("semester");
  if (semesterFilter) conditions["class.semester"] = semesterFilter;

  const subjectYearSectionFilter = searchParams.get("subject_year_section");
  if (subjectYearSectionFilter) conditions.subject_year_section = subjectYearSectionFilter;

  return conditions;
};

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = request.nextUrl;

    const tableName = searchParams.get("table");
    const targetId = searchParams.get("id");
    const shouldCount = searchParams.get("count") === "true";

    const applicantId = searchParams.get("applicantId");
    const fileId = searchParams.get("fileId");

    if (applicantId && fileId) {
      const applicant = await Admission.findOne(
        { applicant_id: applicantId, "attachments._id": fileId },
        { "attachments.$": 1 }
      ).lean();

      if (!applicant || !(applicant as any).attachments?.length) {
        return NextResponse.json({ message: "Requested document profile attachment not found." }, { status: 404 });
      }

      const file = (applicant as any).attachments[0];

      let targetData = file.data;
      if (file.data && typeof file.data === "object") {
        targetData = file.data.buffer || file.data.data || file.data;
      }

      if (!targetData) {
        return NextResponse.json({ message: "The database file content is empty." }, { status: 422 });
      }

      const finalDownloadBuffer = Buffer.from(targetData);
      const safeFilename = file.filename || "downloaded-file";

      return new NextResponse(finalDownloadBuffer as any, {
        status: 200,
        headers: {
          "Content-Type": file.contentType || "application/octet-stream",
          "Content-Disposition": `attachment; filename="${encodeURIComponent(safeFilename)}"`,
          "Content-Length": finalDownloadBuffer.length.toString(),
        },
      });
    }

    if (!tableName || !ALLOWED_TABLES[tableName]) {
      return NextResponse.json(
        { message: `Access denied or invalid table choice: '${tableName}'` },
        { status: 400 }
      );
    }

    const { model: TargetModel, idKey } = ALLOWED_TABLES[tableName];
    const queryConditions = buildQueryConditions(searchParams);

    if (shouldCount) {
      const totalCount = await TargetModel.countDocuments(queryConditions);
      return NextResponse.json({ count: totalCount }, { status: 200 });
    }

    if (targetId) {
      const record = await TargetModel.findOne({ [idKey]: targetId })
        .select(EXCLUDED_FIELDS[tableName] || "")
        .lean();

      if (!record) {
        return NextResponse.json({ message: "Document profile not found." }, { status: 404 });
      }

      if (tableName === "students") {
        const currentYear = new Date().getFullYear().toString();
        const sectionDoc = await StudentSection.findOne(
          { student_id: targetId },
          { class: { $elemMatch: { year: currentYear } } }
        ).lean();

        if (sectionDoc && sectionDoc.class && sectionDoc.class.length > 0) {
          const activeClass = sectionDoc.class[0];
          record.assigned_section = activeClass.section;
          record.year = activeClass.year;
          record.semester = activeClass.semester; 
        }
      }

      return NextResponse.json({ success: true, data: record }, { status: 200 });
    }

    if (tableName === "subjects") {
      const targetYear = searchParams.get("year") || new Date().getFullYear().toString();
      const targetSemester = searchParams.get("semester") || "1";
      const targetSection = searchParams.get("subject_year_section") || "";

      const rawRecords = await TargetModel.find({
        semester: targetSemester,
        subject_year_section: { $regex: new RegExp(`^${targetSection}$`, "i") }
      }).lean();

      const records = rawRecords.filter((subj: any) => {
        const schedCodeStr = subj.sched_code ? String(subj.sched_code) : "";
        const extractedYear = schedCodeStr.substring(0, 4);
        return extractedYear === targetYear;
      });

      return NextResponse.json({ success: true, data: records }, { status: 200 });
    }

    if (tableName === "student_section") {
      const targetYear = searchParams.get("year") || new Date().getFullYear().toString();
      
      const matchStage: Record<string, any> = {
        "class.year": targetYear
      };

      const sectionFilter = searchParams.get("section");
      if (sectionFilter) matchStage["class.section"] = sectionFilter;

      const semesterFilter = searchParams.get("semester");
      if (semesterFilter) matchStage["class.semester"] = semesterFilter;

      const matchingRecords = await TargetModel.aggregate([
        { $unwind: "$class" },
        { 
          $match: {
            "class.year": targetYear,
            ...(sectionFilter ? { "class.section": sectionFilter } : {}),
            ...(semesterFilter ? { "class.semester": semesterFilter } : {})
          } 
        },
        {
          $lookup: {
            from: "students",         
            localField: "student_id",
            foreignField: "student_id",
            as: "studentDetails"
          }
        },
        { $unwind: { path: "$studentDetails", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            _id: "$_id",
            student_id: "$student_id",
            first_name: { $ifNull: ["$studentDetails.first_name", ""] },
            last_name: { $ifNull: ["$studentDetails.last_name", ""] },
            year: "$class.year",
            semester: "$class.semester",
            section: "$class.section",
            evaluation: "$class.evaluation",
            subjects: "$class.subjects"
          }
        },
        { $sort: { _id: -1 } }
      ]);

      return NextResponse.json({ success: true, data: matchingRecords }, { status: 200 });
    }   
    
    const genericRecords = await TargetModel.find(queryConditions)
      .select(EXCLUDED_FIELDS[tableName] || "")
      .sort({ _id: -1 })
      .lean();

    return NextResponse.json({ success: true, data: genericRecords }, { status: 200 });

  } catch (err: any) {
    console.error("Unified dynamic GET data route processing crash:", err);
    return NextResponse.json({ message: "Failed to fulfill incoming data action request pipeline." }, { status: 500 });
  }
}

// Update to POST handler in route.ts
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = request.nextUrl;
    const tableName = searchParams.get("table");

    if (!tableName || !ALLOWED_TABLES[tableName]) {
      return NextResponse.json(
        { message: `Access denied or invalid table choice: '${tableName}'` },
        { status: 400 }
      );
    }

    const { model: TargetModel } = ALLOWED_TABLES[tableName];
    const body = await request.json();

    const { student_id, year, section, semester, subjects, actionType } = body;

    if (!student_id || !year || !section || !semester) {
      return NextResponse.json(
        { message: "Missing required properties: student_id, year, section, and semester must be provided." },
        { status: 400 }
      );
    }

    const newClassEntry = {
      year,
      section,
      semester,
      evaluation: "", // Default empty evaluation
      subjects: Array.isArray(subjects) ? subjects : []
    };

    const existingDoc = await TargetModel.findOne({ student_id });

    let savedDocument;
    if (!existingDoc) {
      // Logic 1: Create a brand new record if non-existent
      savedDocument = await TargetModel.create({
        student_id,
        class: [newClassEntry]
      });
    } else if (actionType === "PUSH_NEW") {
      // Logic 5: Push a NEW class entry when latest evaluation was "Approved"
      savedDocument = await TargetModel.findOneAndUpdate(
        { student_id },
        { $push: { class: newClassEntry } },
        { new: true }
      );
    } else {
      // Fallback: Upsert based on year and semester matching
      const existingClassIndex = existingDoc.class?.findIndex(
        (c: any) => c.year === year && c.semester === semester
      );

      if (existingClassIndex !== undefined && existingClassIndex > -1) {
        savedDocument = await TargetModel.findOneAndUpdate(
          { student_id, "class.year": year, "class.semester": semester },
          { $set: { "class.$": newClassEntry } },
          { new: true }
        );
      } else {
        savedDocument = await TargetModel.findOneAndUpdate(
          { student_id },
          { $push: { class: newClassEntry } },
          { new: true }
        );
      }
    }

    const cookieStore = await cookies();
    const auditUser = cookieStore.get("audit_user")?.value || "Unknown System Staff";

    try {
      await createAuditLog(
        auditUser,
        `Assigned tracking ID: ${student_id} to section '${section}' with ${subjects?.length || 0} subjects for semester '${semester}', year ${year} inside ${tableName}.`
      );
    } catch (auditErr) {
      console.error("Audit log creation error:", auditErr);
    }

    return NextResponse.json(
      {
        success: true,
        message: "Assignment allocation recorded successfully",
        data: savedDocument
      },
      { status: 201 }
    );

  } catch (error: any) {
    console.error("Database process crash:", error);
    return NextResponse.json({ message: error.message || "Failed to process payload" }, { status: 500 });
  }
}

// Update to PUT handler in route.ts for updating existing latest class (Logic 3)
export async function PUT(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = request.nextUrl;
    const tableName = searchParams.get("table") || "admissions_applications";

    if (!ALLOWED_TABLES[tableName]) {
      return NextResponse.json(
        { message: `Access denied or invalid table choice: '${tableName}'` },
        { status: 400 }
      );
    }

    const { model: TargetModel } = ALLOWED_TABLES[tableName];
    const body = await request.json();

    // 1. Handle Admissions Applications (When approving/rejecting from page)
    if (tableName === "admissions_applications") {
      const { applicant_id, status } = body;

      const updatedDocument = await TargetModel.findOneAndUpdate(
        { applicant_id },
        { $set: { status } },
        { new: true, runValidators: true }
      ).lean();

      if (!updatedDocument) {
        return NextResponse.json(
          { message: `No application found for Applicant ID ${applicant_id}` },
          { status: 404 }
        );
      }

      return NextResponse.json({ success: true, data: updatedDocument }, { status: 200 });
    }

    // 2. Handle Student Section Allocation
    if (tableName === "student_section") {
      const { student_id, section, semester, year, subjects, targetYear, targetSemester } = body;
      
      const matchYear = targetYear || year || new Date().getFullYear().toString();
      const matchSemester = targetSemester || semester;

      const updatedDocument = await TargetModel.findOneAndUpdate(
        { 
          student_id, 
          "class.year": matchYear,
          "class.semester": matchSemester
        },
        { 
          $set: {
            "class.$.section": section,
            "class.$.semester": semester,
            "class.$.year": year,
            "class.$.subjects": subjects || []
          } 
        },
        { new: true, runValidators: true }
      ).lean();

      if (!updatedDocument) {
        return NextResponse.json(
          { message: `No class record found to update for Student ID ${student_id}.` },
          { status: 404 }
        );
      }

      return NextResponse.json({ success: true, data: updatedDocument }, { status: 200 });
    }

    // Fallback if an unhandled allowed table is requested
    return NextResponse.json({ message: `No update logic defined for table: ${tableName}` }, { status: 400 });

  } catch (error: any) {
    console.error("Database update processing error:", error);
    return NextResponse.json({ message: error.message || "Failed to update record" }, { status: 500 });
  }
}

async function createAuditLog(username: string, activityDescription: string) {
  let detectedUserType = "student";
  const upperUsername = username.toUpperCase();

  if (upperUsername.startsWith("ADM")) {
    detectedUserType = "admin";
  } else if (upperUsername.startsWith("TCH")) {
    detectedUserType = "teacher";
  } else if (upperUsername.startsWith("REG")) {
    detectedUserType = "registrar";
  }

  const logEntry = new Audit({
    username: username,
    user_type: detectedUserType,
    activity: activityDescription,
  });

  await logEntry.save();
}