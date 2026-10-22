import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import mongoose from "mongoose";
import { Audit, Student, Admission, StudentSection, Subject } from "@/models/Schema";

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(process.env.MONGODB_URI!);
};

const ALLOWED_TABLES: Record<string, { model: mongoose.Model<any>; idKey: string }> = {
  students: { model: Student, idKey: "student_id" },
  admissions_applications: { model: Admission, idKey: "applicant_id" },
  student_section: { model: StudentSection, idKey: "student_id" },
  subjects: { model: Subject, idKey: "subject_code" },
};

const EXCLUDED_FIELDS: Record<string, string> = {
  admissions_applications: "-attachments.data",
};

/**
 * Calculates the UTC date string/object representing 24 hours ago
 * relative to Asia/Manila (UTC+8) time context.
 */
const getManilaLast24HoursThreshold = () => {
  // Current UTC timestamp
  const nowUtcMs = Date.now();
  // Subtract 24 hours (24 * 60 * 60 * 1000 ms)
  const twentyFourHoursAgoMs = nowUtcMs - 24 * 60 * 60 * 1000;

  // MongoDB stores dates in UTC BSON format, so passing `new Date(twentyFourHoursAgoMs)`
  // accurately filters records created/submitted within the last 24 real-time hours
  // regardless of Manila (UTC+8) vs UTC storage differences.
  return new Date(twentyFourHoursAgoMs);
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

  const last24HoursFilter = searchParams.get("last24hours");
  if (last24HoursFilter === "true") {
    const twentyFourHoursAgo = getManilaLast24HoursThreshold();
    const tableName = searchParams.get("table");

    const dateField = tableName === "admissions_applications" ? "submittedAt" : "createdAt";
    conditions[dateField] = { $gte: twentyFourHoursAgo };
  }

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
        // Derive current year using Manila timezone context
        const currentYear = new Intl.DateTimeFormat("en-US", {
          timeZone: "Asia/Manila",
          year: "numeric",
        }).format(new Date());

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

      if (tableName === "student_section" && record.class && Array.isArray(record.class)) {
        for (const cls of record.class) {
          if (Array.isArray(cls.subjects) && cls.subjects.length > 0) {
            for (let i = 0; i < cls.subjects.length; i++) {
              const sub = cls.subjects[i];
              if (!sub.status) {
                const subId = sub.subject_id || sub.subject_code;
                if (subId) {
                  const liveSubject = await Subject.findOne({
                    $or: [{ subject_id: subId }, { subject_code: subId }]
                  }).select("status").lean();

                  if (liveSubject?.status) {
                    cls.subjects[i].status = liveSubject.status;
                  }
                }
              }
            }

            cls.allSubjectsCompleted = cls.subjects.every(
              (s: any) => String(s.status || "").trim().toLowerCase() === "completed"
            );
          } else {
            cls.allSubjectsCompleted = false;
          }
        }
      }

      return NextResponse.json({ success: true, data: record }, { status: 200 });
    }

    if (tableName === "subjects") {
      const currentYearManila = new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Manila",
        year: "numeric",
      }).format(new Date());

      const targetYear = searchParams.get("year") || currentYearManila;
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
      const currentYearManila = new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Manila",
        year: "numeric",
      }).format(new Date());

      const targetYear = searchParams.get("year") || currentYearManila;

      const sectionFilter = searchParams.get("section");
      const semesterFilter = searchParams.get("semester");

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
        { $unwind: { path: "$studentDetails", preserveNullAndEmptyArrays: false } },
        {
          $match: {
            "studentDetails.status": "Enrolled"
          }
        },
        {
          $lookup: {
            from: "subjects",
            localField: "class.subjects.subject_id",
            foreignField: "subject_id",
            as: "liveSubjects"
          }
        },
        {
          $project: {
            _id: "$_id",
            student_id: "$student_id",
            first_name: { $ifNull: ["$studentDetails.first_name", ""] },
            last_name: { $ifNull: ["$studentDetails.last_name", ""] },
            status: { $ifNull: ["$studentDetails.status", "Enrolled"] },
            year: "$class.year",
            semester: "$class.semester",
            section: "$class.section",
            subjects: {
              $map: {
                input: "$class.subjects",
                as: "sub",
                in: {
                  $mergeObjects: ["$$sub",
                    {
                      status: {
                        $ifNull: [ "$$sub.status",
                          {
                            $arrayElemAt: [
                              "$liveSubjects.status",
                              { $indexOfArray: ["$liveSubjects.subject_id", "$$sub.subject_id"] }]
                          }
                        ]
                      }
                    }
                  ]
                }
              }
            }
          }
        },
        { $sort: { _id: -1 } }
      ], { allowDiskUse: true });

      const processedRecords = matchingRecords.map((record: any) => {
        const subjects = record.subjects || [];
        const allSubjectsCompleted = subjects.length > 0 && subjects.every(
          (s: any) => String(s.status || "").trim().toLowerCase() === "completed"
        );
        return {
          ...record,
          allSubjectsCompleted
        };
      });

      return NextResponse.json({ success: true, data: processedRecords }, { status: 200 });
    }

    const genericRecords = await TargetModel.find(queryConditions)
      .select(EXCLUDED_FIELDS[tableName] || "")
      .sort({ _id: -1 })
      .allowDiskUse(true)
      .lean();

    return NextResponse.json({ success: true, data: genericRecords }, { status: 200 });

  } catch (err: any) {
    console.error("Unified dynamic GET data route processing crash:", err);
    return NextResponse.json({ message: "Failed to fulfill incoming data action request pipeline." }, { status: 500 });
  }
}

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

    const { student_id, year, section, semester, subjects } = body;

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
      subjects: Array.isArray(subjects) ? subjects : []
    };

    const existingDoc = await TargetModel.findOne({ student_id });

    let savedDocument;
    if (!existingDoc) {
      savedDocument = await TargetModel.create({
        student_id,
        class: [newClassEntry]
      });
    } else {
      savedDocument = await TargetModel.findOneAndUpdate(
        { student_id },
        { $push: { class: newClassEntry } },
        { new: true }
      );
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

export async function PUT(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = request.nextUrl;
    const body = await request.json();

    const tableName =
      searchParams.get("table") ||
      body.table ||
      (body.action === "updateStudentStatus" ? "students" : "admissions_applications");

    if (!ALLOWED_TABLES[tableName]) {
      return NextResponse.json(
        { message: `Access denied or invalid table choice: '${tableName}'` },
        { status: 400 }
      );
    }

    const { model: TargetModel } = ALLOWED_TABLES[tableName];

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

    if (tableName === "students") {
      const { id, student_id, status } = body;
      const targetStudentId = student_id || id;

      if (!targetStudentId || !status) {
        return NextResponse.json(
          { message: "Missing required parameters: student_id (or id) and status must be specified." },
          { status: 400 }
        );
      }

      const query = id ? { _id: id } : { student_id: targetStudentId };

      const updatedDocument = await TargetModel.findOneAndUpdate(
        query,
        { $set: { status } },
        { new: true, runValidators: true }
      ).lean();

      if (!updatedDocument) {
        return NextResponse.json(
          { message: `No student record found for query: ${JSON.stringify(query)}` },
          { status: 404 }
        );
      }

      try {
        const cookieStore = await cookies();
        const auditUser = cookieStore.get("audit_user")?.value || "Unknown System Staff";
        await createAuditLog(
          auditUser,
          `Updated status for student ID: ${targetStudentId} to '${status}'.`
        );
      } catch (auditErr) {
        console.error("Audit log creation error:", auditErr);
      }

      return NextResponse.json({ success: true, message: `Student status updated to ${status}`, data: updatedDocument }, { status: 200 });
    }

    return NextResponse.json({ message: `No update logic defined for table: ${tableName}` }, { status: 400 });

  } catch (error: any) {
    console.error("Database update processing error:", error);
    return NextResponse.json({ message: error.message || "Failed to update record" }, { status: 500 });
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