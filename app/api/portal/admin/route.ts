import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { cookies } from "next/headers";
import mongoose from "mongoose";
import { Audit }        from "@/models/Schema";
import { Teacher }      from "@/models/Schema";
import { Subject }      from "@/models/Schema";
import { Student }      from "@/models/Schema";
import { Config }       from "@/models/Schema";
import { Events }        from "@/models/Schema";

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
        "admission_button",
        "submit_final_grade"
      ];

      if (!validFields.includes(field)) {
        return NextResponse.json({ message: "Invalid target configuration field." }, { status: 400 });
      }

      let updateQuery = {};
      
      if (action === "set") {
        const isBooleanField = field === "admission_button" || field === "submit_final_grade";
        
        // Coerce strictly to boolean
        const targetValue = isBooleanField ? Boolean(value) : value;
        
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

      // 🚀 Auto-generate a unique 'id' string (security code) that does not exist in the database
      let securityCode = "";
      let isUnique = false;
      let attempts = 0;

      while (!isUnique && attempts < 10) {
        attempts++;
        const candidateCode = crypto.randomBytes(12).toString("hex");
        
        // Check if candidateCode already exists in 'id' field
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
        id: securityCode, // Attach unique security code to 'id'
      };
    }

    if (tableName === "subjects") {
      const idPrefix = `SUBJ-`;
      const structuralId = await generateSequentialId(TargetModel, "subject_id", idPrefix);

      bodyData = {
        ...bodyData,
        subject_id: structuralId
      };
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

async function createAuditLog(username: string, activityDescription: string) {
  let detectedUserType = "student";
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