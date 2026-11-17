import { NextRequest, NextResponse } from "next/server"; 
import mongoose from "mongoose";
import { Student, Credentials, Audit } from "@/models/Schema";

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(process.env.MONGODB_URI!);
};

const REQUIRED_PROFILE_FIELDS = [
  "student_id",
  "first_name",
  "last_name",
  "email_address",
] as const;

function getAuditUser(request: NextRequest): string {
  const auditUserCookie = request.cookies.get("audit_user");
  return auditUserCookie ? decodeURIComponent(auditUserCookie.value) : "SYSTEM";
}

export async function POST(request: NextRequest) {
  const session = await mongoose.startSession();

  try {
    await connectDB();
    const body = await request.json();

    const { studentProfile, accountSetup } = body;

    if (!studentProfile || !accountSetup?.username || !accountSetup?.password) {
      return NextResponse.json({ success: false, message: "Missing required fields." }, { status: 400 });
    }

    if (
      typeof studentProfile.emergency_contact_number !== "string" ||
      !/^\d{11}$/.test(studentProfile.emergency_contact_number)
    ) {
      return NextResponse.json(
        { success: false, message: "Emergency contact number must contain exactly 11 digits." },
        { status: 400 }
      );
    }

    const missingField = REQUIRED_PROFILE_FIELDS.find((field) => !studentProfile[field]);
    if (missingField) {
      return NextResponse.json(
        { success: false, message: `Missing required student profile field: ${missingField}` },
        { status: 400 }
      );
    }

    // Backend password validation matching frontend complexity rules
    const pwd = accountSetup.password;
    const hasMinLength = pwd.length >= 8;
    const hasLowerAndUpper = /(?=.*[a-z])(?=.*[A-Z])/.test(pwd);
    const hasAlphanumeric = /(?=.*[a-zA-Z])(?=.*\d)/.test(pwd);
    const hasSpecialChar = /(?=.*[^A-Za-z0-9])/.test(pwd);

    if (!hasMinLength || !hasLowerAndUpper || !hasAlphanumeric || !hasSpecialChar) {
      return NextResponse.json(
        { success: false, message: "Password does not meet security requirements." },
        { status: 400 }
      );
    }

    const [existingStudent, existingCredential] = await Promise.all([
      Student.findOne({ student_id: studentProfile.student_id }).select("_id").lean(),
      Credentials.findOne({ username: accountSetup.username }).select("_id").lean(),
    ]);

    if (existingStudent) {
      return NextResponse.json(
        { success: false, message: `A student with ID ${studentProfile.student_id} already exists.` },
        { status: 409 }
      );
    }
    if (existingCredential) {
      return NextResponse.json(
        { success: false, message: `Username ${accountSetup.username} is already taken.` },
        { status: 409 }
      );
    }

    // Properly cast incoming JSON attachment buffers so Mongoose successfully saves them into the collection
    const processedAttachments = Array.isArray(studentProfile.attachments)
      ? studentProfile.attachments.map((att: any) => ({
          filename: att.filename,
          contentType: att.contentType,
          documentType: att.documentType,
          data: att.data?.data 
            ? Buffer.from(att.data.data) 
            : Buffer.isBuffer(att.data) 
            ? att.data 
            : att.data ? Buffer.from(att.data) : undefined,
        }))
      : [];

    const studentRecordPayload = {
      status: studentProfile.status,
      student_id: studentProfile.student_id,
      first_name: studentProfile.first_name,
      middle_name: studentProfile.middle_name,
      last_name: studentProfile.last_name,
      suffix: studentProfile.suffix,
      email_address: studentProfile.email_address,
      contact_number: studentProfile.contact_number,
      date_of_birth: studentProfile.date_of_birth,
      gender: studentProfile.gender,
      nationality: studentProfile.nationality,
      secondary_school: studentProfile.secondary_school,
      graduation_year: studentProfile.graduation_year || "N/A",
      track: studentProfile.track,
      gradeLevel: studentProfile.gradeLevel || "Grade 11",
      gpa: studentProfile.gpa || "N/A",
      enrollmentStatus: studentProfile.status || "Enrolled",
      residential_address: studentProfile.residential_address,
      emergency_contact_person: studentProfile.emergency_contact_person,
      emergency_contact_relationship: studentProfile.emergency_contact_relationship,
      emergency_contact_number: studentProfile.emergency_contact_number,
      attachments: processedAttachments, // Successfully includes admission attachments with buffers
    };

    const credentialRecordPayload = {
      username: accountSetup.username,
      password: accountSetup.password, // Stored as plain text per original setup
      user_type: accountSetup.user_type || "student",
      privacyNoticeAcknowledged: false,
    };

    let createdStudent: any;

    try {
      session.startTransaction();

      const [studentDoc] = await Student.create([studentRecordPayload], { session });
      createdStudent = studentDoc;
      await Credentials.create([credentialRecordPayload], { session });

      await session.commitTransaction();
    } catch (txError) {
      await session.abortTransaction();
      throw txError;
    } finally {
      session.endSession();
    }

    try {
      const currentOperator = getAuditUser(request);
      const studentFullName = `${studentProfile.first_name} ${studentProfile.last_name}`.trim();
      const activityDescription = `Enrolled new student: (${studentFullName} ID: ${studentProfile.student_id})`;
      await createAuditLog(currentOperator, activityDescription);
    } catch (auditError) {
      console.error("Failed to write audit log:", auditError);
    }

    return NextResponse.json(
      {
        success: true,
        message: "Enrollment complete. Security records and attachments saved successfully.",
        data: { student_id: createdStudent.student_id },
      },
      { status: 201 }
    );

  } catch (error: any) {
    console.error("Database Save Error:", error);

    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, message: "Duplicate student ID or username." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, message: error.message || "Internal server data processing error." },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json({ success: false, message: "Missing username or password." }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ success: false, message: "Password must be at least 8 characters." }, { status: 400 });
    }

    const updatedCredential = await Credentials.findOneAndUpdate(
      { username: String(username).trim() },
      { $set: { password: String(password) } }, // Updated as plain text
      { new: true }
    );

    if (!updatedCredential) {
      return NextResponse.json({ success: false, message: "Credential record not found for this username." }, { status: 404 });
    }

    try {
      const currentOperator = getAuditUser(request);
      await createAuditLog(currentOperator, `Reset/Updated password for student username: ${username}`);
    } catch (auditError) {
      console.error("Failed to write audit log:", auditError);
    }

    return NextResponse.json(
      { success: true, message: "Password updated successfully." },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Password Update Error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error." },
      { status: 500 }
    );
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