import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { cookies } from "next/headers";
import mongoose from "mongoose";
import { Audit }        from "@/models/Schema";
import { Teacher }      from "@/models/Schema";
import { Subject }      from "@/models/Schema";
import { Student }      from "@/models/Schema";
import { Config }       from "@/models/Schema";
import { Events }       from "@/models/Schema";
import { Credentials }  from "@/models/Schema";

declare global {
  var _mongooseConnPromise: Promise<typeof mongoose> | undefined;
}

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  if (!global._mongooseConnPromise) {
    global._mongooseConnPromise = mongoose.connect(process.env.MONGODB_URI!);
  }
  await global._mongooseConnPromise;
};

const ALLOWED_TABLES: Record<string, { model: mongoose.Model<any>; idKey: string }> = {
  teachers:         { model: mongoose.models.Teacher || Teacher, idKey: "teacher_id" },
  students:         { model: mongoose.models.Student || Student, idKey: "student_id" },
  subjects:         { model: mongoose.models.Subject || Subject, idKey: "subject_id" },
  configuration:    { model: mongoose.models.Config || Config,   idKey: "_id" },
  audit_logs:       { model: Audit,   idKey: "_id" },
  events:           { model: Events,  idKey: "_id" },
};

const CONFIG_DOC_ID = "6a3805c56bb871d76758fe12";

type ScheduleData = {
  subject_id?: unknown;
  sched_code?: unknown;
  semester?: unknown;
  subject_day?: unknown;
  subject_year_section?: unknown;
  teacher_id?: unknown;
  room?: unknown;
  class_time?: {
    start?: unknown;
    end?: unknown;
  };
};

function normalizeScheduleValue(value: unknown): string {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function scheduleTimeInMinutes(value: unknown): number | null {
  if (typeof value !== "string") return null;
  const match = value.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return null;

  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (hour < 1 || hour > 12 || minute > 59) return null;

  const hour24 = (hour % 12) + (match[3].toUpperCase() === "PM" ? 12 : 0);
  return hour24 * 60 + minute;
}

async function findScheduleConflict(
  candidate: ScheduleData,
  excludeSubjectId?: string
): Promise<{ message: string; status: 400 | 409 } | null> {
  const start = scheduleTimeInMinutes(candidate.class_time?.start);
  const end = scheduleTimeInMinutes(candidate.class_time?.end);
  const day = normalizeScheduleValue(candidate.subject_day);
  const semester = normalizeScheduleValue(candidate.semester);

  if (start === null || end === null || start >= end || !day || !semester) {
    return { message: "A valid day, semester, and start/end time are required.", status: 400 };
  }

  const existingSchedules = await Subject.find({ semester: candidate.semester, archived: { $ne: true } })
    .select("subject_id sched_code subject_day class_time teacher_id room subject_year_section")
    .lean();

  const candidateYear = String(candidate.sched_code || "").match(/^\d{4}/)?.[0];
  const candidateRoom = normalizeScheduleValue(candidate.room);
  const candidateTeacher = normalizeScheduleValue(candidate.teacher_id);
  const candidateSection = normalizeScheduleValue(candidate.subject_year_section);

  for (const existing of existingSchedules) {
    if (excludeSubjectId && existing.subject_id === excludeSubjectId) continue;
    if (normalizeScheduleValue(existing.subject_day) !== day) continue;

    const existingYear = String(existing.sched_code || "").match(/^\d{4}/)?.[0];
    if (candidateYear && existingYear && candidateYear !== existingYear) continue;

    const existingStart = scheduleTimeInMinutes(existing.class_time?.start);
    const existingEnd = scheduleTimeInMinutes(existing.class_time?.end);
    if (existingStart === null || existingEnd === null || start >= existingEnd || end <= existingStart) continue;

    const sameRoom = candidateRoom && candidateRoom === normalizeScheduleValue(existing.room);
    const sameTeacher = candidateTeacher && candidateTeacher === normalizeScheduleValue(existing.teacher_id);
    const sameSection = candidateSection && candidateSection === normalizeScheduleValue(existing.subject_year_section);
    if (!sameRoom && !sameTeacher && !sameSection) continue;

    const resource = sameRoom ? "room" : sameTeacher ? "teacher" : "section";
    return {
      message: `Schedule overlaps with ${existing.sched_code || existing.subject_id} on the same ${resource} and day.`,
      status: 409,
    };
  }

  return null;
}

function getAuditUser(request: NextRequest): string {
  const auditUserCookie = request.cookies.get("audit_user");
  return auditUserCookie ? decodeURIComponent(auditUserCookie.value) : "SYSTEM";
}

async function generateSequentialId(
  model: mongoose.Model<any>,
  field: string,
  prefix: string
): Promise<string> {
  const totalCount = await model.countDocuments({
    [field]: new RegExp(`^${prefix}`),
  });
  const paddedIndex = (totalCount + 1).toString().padStart(4, "0");
  return `${prefix}${paddedIndex}`;
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();        
    const { searchParams } = request.nextUrl;

    const tableName = searchParams.get("table"); 
    const targetId = searchParams.get("id");
    const shouldCount = searchParams.get("count") === "true";

    if (!tableName || !ALLOWED_TABLES[tableName]) {
      return NextResponse.json(
        { message: `Access denied or invalid table choice: '${tableName}'` },
        { status: 400 }
      );
    }

    const { model: TargetModel, idKey } = ALLOWED_TABLES[tableName];

    if (shouldCount) {
      const totalCount = await TargetModel.countDocuments({}); 
      return NextResponse.json({ count: totalCount }, { status: 200 });
    }

    if (tableName === "configuration") {
      let config = await Config.findById(CONFIG_DOC_ID).lean();
      
      if (!config) {
        config = await Config.create({
          _id: new mongoose.Types.ObjectId(CONFIG_DOC_ID),
          section: ["ICT-1A", "ICT-1B", "ICT-2A", "ICT-2B", "HRM-1A", "HRM-2A"],
          room: ["Computer Lab 1", "Computer Lab 2", "Room 101", "Room 102"],
          employee_status: ["Active", "Inactive", "Leave"],
          employee_role: ["Teacher", "Department Head", "Coordinator", "Network Instructor"],
          prefix: ["Mr."],
          specification: ["Core"],
          current_year: ["2025-2026"],
          current_semester: "1",
          admission_button: false,
          submit_final_grade: false,
        });
      } else {
        // Ensure strictly boolean outputs for toggle fields
        config = {
          ...config,
          admission_button: Boolean(config.admission_button),
          submit_final_grade: Boolean(config.submit_final_grade),
        };
      }

      return NextResponse.json(config, { status: 200 });
    }

    if (targetId) {
      const record = await TargetModel.findOne({ [idKey]: targetId });
      if (!record) {
        return NextResponse.json({ message: "Document not found." }, { status: 404 });
      }
      return NextResponse.json(record, { status: 200 });
    } else {
      const queryFilters: Record<string, any> = {};
      
      searchParams.forEach((value, key) => {
        if (key !== "table" && key !== "id" && key !== "count") {
          queryFilters[key] = value; 
        }
      });

      const records = await TargetModel.find(queryFilters).sort({ [idKey]: -1 });
      return NextResponse.json(records, { status: 200 });
    }

  } catch (err) {
    console.error("Dynamic collection fetch error:", err);
    return NextResponse.json({ message: "Failed to pull collection data." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = request.nextUrl;
    const tableName = searchParams.get("table");

    if (!tableName || !ALLOWED_TABLES[tableName]) {
      return NextResponse.json({ message: "Invalid or missing table parameter." }, { status: 400 });
    }

    const { model: TargetModel } = ALLOWED_TABLES[tableName];
    let bodyData = await request.json();

    if (tableName === "configuration") {
      const { action, field, value } = bodyData; 

      const validFields = [
        "section", 
        "room", 
        "employee_status", 
        "employee_role", 
        "prefix", 
        "specification",
        "current_year",
        "current_semester",
        "admission_button",
        "submit_final_grade",
        "current_year",
        "current_semester"
      ];

      if (!validFields.includes(field)) {
        return NextResponse.json({ message: "Invalid target configuration field." }, { status: 400 });
      }

      let updateQuery = {};
      
      if (action === "set") {
        const isBooleanField = field === "admission_button" || field === "submit_final_grade";
        
        // Coerce strictly to boolean for toggle fields, assign scalar string values ("1" or "2") otherwise
        const targetValue = isBooleanField ? Boolean(value) : String(value);
        
        updateQuery = { $set: { [field]: targetValue } };
      } else if (action === "add" || action === "push") {
        updateQuery = { $addToSet: { [field]: value } }; 
      } else if (action === "remove" || action === "pull") {
        updateQuery = { $pull: { [field]: value } }; 
      } else {
        return NextResponse.json({ message: "Invalid action type specified." }, { status: 400 });
      }

      const updatedConfig = await TargetModel.findByIdAndUpdate(
        CONFIG_DOC_ID, 
        updateQuery,
        { new: true, upsert: true }
      );

      // Audit logging
      const currentOperator = getAuditUser(request);
      const activityDescription = action === "set"
        ? `Set configuration field [${field}] to '${value}'`
        : `Updated configuration array [${field}] with action '${action}' and value '${value}'`;
      
      await createAuditLog(currentOperator, activityDescription);

      return NextResponse.json({ message: "Configuration updated successfully.", data: updatedConfig }, { status: 200 });
    }

    if (tableName === "teachers") {
      const currentYear = new Date().getFullYear();
      const idPrefix = `TCH-${currentYear}-`;
      const structuralId = await generateSequentialId(TargetModel, "teacher_id", idPrefix);

      let securityCode = "";
      let isUnique = false;
      let attempts = 0;

      while (!isUnique && attempts < 10) {
        attempts++;
        const candidateCode = crypto.randomBytes(12).toString("hex");
        
        const existingDoc = await TargetModel.findOne({ id: candidateCode }).lean();
        if (!existingDoc) {
          securityCode = candidateCode;
          isUnique = true;
        }
      }

      if (!isUnique) {
        throw new Error("Failed to generate a unique teacher security ID. Please try again.");
      }

      bodyData = {
        ...bodyData,
        teacher_id: structuralId,
        id: securityCode, 
      };
    }

    if (tableName === "subjects") {
      const idPrefix = `SUBJ-`;
      const structuralId = await generateSequentialId(TargetModel, "subject_id", idPrefix);

      bodyData = {
        ...bodyData,
        subject_id: structuralId
      };

      const conflict = await findScheduleConflict(bodyData);
      if (conflict) {
        return NextResponse.json({ message: conflict.message }, { status: conflict.status });
      }
    }

    const newRecord = new TargetModel(bodyData);
    await newRecord.save();

    const currentOperator = getAuditUser(request);

    let recordLabel = tableName === "subjects" 
      ? bodyData.subject_name 
      : `${bodyData.first_name || ""} ${bodyData.last_name || ""}`.trim();

    const singularType = tableName.endsWith("s") ? tableName.slice(0, -1) : tableName;
    const activityDescription = `Created new ${singularType}: (${recordLabel || "Unknown"})`;

    await createAuditLog(currentOperator, activityDescription);

    return NextResponse.json({ message: "Record created successfully.", data: newRecord }, { status: 201 });

  } catch (err: any) {
    console.error("Dynamic POST execution error:", err);
    return NextResponse.json({ message: err.message || "Failed to create record." }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = request.nextUrl;
    const tableName = searchParams.get("table");

    if (!tableName || !ALLOWED_TABLES[tableName]) {
      return NextResponse.json({ message: "Invalid or missing table parameter." }, { status: 400 });
    }

    const { model: TargetModel, idKey } = ALLOWED_TABLES[tableName];
    
    const bodyData = await request.json();
    const recordIdentifier = bodyData[idKey];

    if (!recordIdentifier) {
      return NextResponse.json(
        { message: `Missing record custom identifier field: ${idKey}` }, 
        { status: 400 }
      );
    }

    const filter = { [idKey]: recordIdentifier };
    const updatePayload = { ...bodyData };
    
    delete updatePayload._id; 
    delete updatePayload.id;
    delete updatePayload.__v; 

    const cleanUpdatePayload = Object.fromEntries(
      Object.entries(updatePayload).filter(([_, value]) => value !== undefined && value !== null)
    );

    if (tableName === "subjects") {
      const currentRecord = await TargetModel.findOne(filter).lean();
      if (!currentRecord) {
        return NextResponse.json({ message: "Record not found to update." }, { status: 404 });
      }

      const conflict = await findScheduleConflict(
        { ...currentRecord, ...cleanUpdatePayload } as ScheduleData,
        String(recordIdentifier)
      );
      if (conflict) {
        return NextResponse.json({ message: conflict.message }, { status: conflict.status });
      }
    }

    const updatedRecord = await TargetModel.findOneAndUpdate(
      filter,
      { $set: cleanUpdatePayload }, 
      { new: true, runValidators: true }
    );

    if (!updatedRecord) {
      return NextResponse.json({ message: "Record not found to update." }, { status: 404 });
    }

    const activeUser = getAuditUser(request);
    await createAuditLog(activeUser, `Updated details for ${tableName} matching ID ${recordIdentifier}.`);

    return NextResponse.json({ message: "Record updated successfully.", data: updatedRecord }, { status: 200 });

  } catch (err: any) {
    console.error("Dynamic PUT execution error:", err);
    return NextResponse.json({ message: err.message || "Failed to update record." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await connectDB();

    const tableName = request.nextUrl.searchParams.get("table");
    if (tableName !== "subjects" && tableName !== "teachers" && tableName !== "events") {
      return NextResponse.json({ message: "Only subject schedules, teachers, and events can be changed here." }, { status: 400 });
    }

    const body = await request.json();
    const subjectId = typeof body.subject_id === "string" ? body.subject_id.trim() : "";
    const teacherId = typeof body.teacher_id === "string" ? body.teacher_id.trim() : "";
    const eventId = typeof body.event_id === "string" ? body.event_id.trim() : "";
    const username = typeof body.username === "string" ? body.username.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!username || !password ||
      (tableName === "subjects" && !subjectId) ||
      (tableName === "teachers" && !teacherId) ||
      (tableName === "events" && !eventId)) {
      return NextResponse.json({ message: "Record ID, admin username, and password are required." }, { status: 400 });
    }

    if (!username.toUpperCase().startsWith("ADM")) {
      return NextResponse.json({ message: "Admin authentication is required for this action." }, { status: 403 });
    }

    const credential = await Credentials.findOne({ username }).select("username password user_type").lean();
    if (!credential || credential.password !== password || credential.user_type === "archive") {
      return NextResponse.json({ message: "Invalid admin username or password." }, { status: 401 });
    }

    if (tableName === "subjects") {
      const archivedSubject = await Subject.findOneAndUpdate(
        { subject_id: subjectId, archived: { $ne: true } },
        { $set: { archived: true } },
        { new: true }
      ).lean();
      if (!archivedSubject) {
        return NextResponse.json({ message: "Subject schedule was not found." }, { status: 404 });
      }

      await createAuditLog(username, `Archived subject schedule ${archivedSubject.sched_code || subjectId} (${archivedSubject.subject_name || "Unknown subject"}).`);
      return NextResponse.json({ message: "Subject schedule archived successfully.", data: archivedSubject }, { status: 200 });
    }

    if (tableName === "teachers") {
      const archivedTeacher = await Teacher.findOneAndUpdate(
        { teacher_id: teacherId, archived: { $ne: true } },
        { $set: { archived: true } },
        { new: true }
      ).lean();
      if (!archivedTeacher) {
        return NextResponse.json({ message: "Teacher was not found." }, { status: 404 });
      }

      const teacherName = `${archivedTeacher.first_name || ""} ${archivedTeacher.last_name || ""}`.trim();
      await createAuditLog(username, `Archived teacher ${teacherId}${teacherName ? ` (${teacherName})` : ""}.`);
      return NextResponse.json({ message: "Teacher archived successfully.", data: archivedTeacher }, { status: 200 });
    }

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return NextResponse.json({ message: "Invalid event ID." }, { status: 400 });
    }

    const deletedEvent = await Events.findByIdAndDelete(eventId).lean();
    if (!deletedEvent) {
      return NextResponse.json({ message: "Event was not found." }, { status: 404 });
    }

    await createAuditLog(username, `Deleted event "${deletedEvent.title || "Untitled event"}" scheduled for ${deletedEvent.event_date || "unknown date"}.`);
    return NextResponse.json({ message: "Event deleted successfully." }, { status: 200 });
  } catch (err) {
    console.error("Admin record deletion error:", err);
    return NextResponse.json({ message: "Failed to delete record." }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await connectDB();
    const tableName = request.nextUrl.searchParams.get("table");
    if (tableName !== "subjects" && tableName !== "teachers") {
      return NextResponse.json({ message: "Only subject schedules and teachers can be restored here." }, { status: 400 });
    }

    const body = await request.json();
    const subjectId = typeof body.subject_id === "string" ? body.subject_id.trim() : "";
    const teacherId = typeof body.teacher_id === "string" ? body.teacher_id.trim() : "";
    const username = typeof body.username === "string" ? body.username.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";
    if (!(tableName === "subjects" ? subjectId : teacherId) || !username || !password) {
      return NextResponse.json({ message: "Record ID and admin credentials are required." }, { status: 400 });
    }
    if (!username.toUpperCase().startsWith("ADM")) {
      return NextResponse.json({ message: "Admin authentication is required to restore this record." }, { status: 403 });
    }

    const credential = await Credentials.findOne({ username }).select("username password user_type").lean();
    if (!credential || credential.password !== password || credential.user_type === "archive") {
      return NextResponse.json({ message: "Invalid admin username or password." }, { status: 401 });
    }

    if (tableName === "teachers") {
      const restoredTeacher = await Teacher.findOneAndUpdate(
        { teacher_id: teacherId, archived: true },
        { $set: { archived: false } },
        { new: true }
      ).lean();
      if (!restoredTeacher) {
        return NextResponse.json({ message: "Archived teacher was not found." }, { status: 404 });
      }

      const teacherName = `${restoredTeacher.first_name || ""} ${restoredTeacher.last_name || ""}`.trim();
      await createAuditLog(username, `Restored teacher ${teacherId}${teacherName ? ` (${teacherName})` : ""}.`);
      return NextResponse.json({ message: "Teacher restored successfully.", data: restoredTeacher }, { status: 200 });
    }

    const restoredSubject = await Subject.findOneAndUpdate(
      { subject_id: subjectId, archived: true },
      { $set: { archived: false } },
      { new: false }
    ).lean();
    if (!restoredSubject) {
      return NextResponse.json({ message: "Archived subject schedule was not found." }, { status: 404 });
    }

    const conflict = await findScheduleConflict(restoredSubject as ScheduleData, subjectId);
    if (conflict) {
      return NextResponse.json({ message: `Cannot restore this schedule: ${conflict.message}` }, { status: conflict.status });
    }

    const activeSubject = await Subject.findOneAndUpdate(
      { subject_id: subjectId, archived: true },
      { $set: { archived: false } },
      { new: true }
    ).lean();
    if (!activeSubject) {
      return NextResponse.json({ message: "Archived subject schedule was not found." }, { status: 404 });
    }

    await createAuditLog(username, `Restored subject schedule ${activeSubject.sched_code || subjectId} (${activeSubject.subject_name || "Unknown subject"}).`);
    return NextResponse.json({ message: "Subject schedule restored successfully.", data: activeSubject }, { status: 200 });
  } catch (err) {
    console.error("Subject schedule restoration error:", err);
    return NextResponse.json({ message: "Failed to restore subject schedule." }, { status: 500 });
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
