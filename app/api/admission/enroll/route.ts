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
  try {
    await connectDB();
    const body = await request.json();

    const { studentProfile, accountSetup } = body;

    if (!studentProfile || !accountSetup?.username || !accountSetup?.password) {
      return NextResponse.json({ success: false, message: "Missing required fields." }, { status: 400 });
    }

    const missingField = REQUIRED_PROFILE_FIELDS.find((field) => !studentProfile[field]);
    if (missingField) {
      return NextResponse.json(
        { success: false, message: `Missing required student profile field: ${missingField}` },
        { status: 400 }
      );
    }

    if (accountSetup.password.length < 8) {
      return NextResponse.json(
        { success: false, message: "Password must be at least 8 characters." },
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

    const studentRecordPayload = {
      status: studentProfile.status,
      student_id: studentProfile.student_id,
      first_name: studentProfile.first_name,
      middle_name: studentProfile.middle_name,
      last_name: studentProfile.last_name,
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
    };

    const credentialRecordPayload = {
      username: accountSetup.username,
      password: accountSetup.password,
      user_type: accountSetup.user_type || "student",
    };

    const session = await mongoose.startSession();
    try {
      session.startTransaction();

      const [createdStudent] = await Student.create([studentRecordPayload], { session });
      await Credentials.create([credentialRecordPayload], { session });

      await session.commitTransaction();

      const currentOperator = getAuditUser(request);
      const studentFullName = `${studentProfile.first_name} ${studentProfile.last_name}`.trim();
      const activityDescription = `Enrolled new student: (${studentFullName} ID: ${studentProfile.student_id})`;

      await createAuditLog(currentOperator, activityDescription);

      return NextResponse.json(
        {
          success: true,
          message: "Enrollment complete. Security records saved successfully.",
          data: { student_id: createdStudent.student_id },
        },
        { status: 201 }
      );
    } catch (txError) {
      await session.abortTransaction();
      throw txError;
    } finally {
      session.endSession();
    }

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

// 🚀 NEW: Added PUT handler to update password in credentials collection without modifying existing POST code
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
      { $set: { password: String(password) } },
      { new: true }
    );

    if (!updatedCredential) {
      return NextResponse.json({ success: false, message: "Credential record not found for this username." }, { status: 404 });
    }

    const currentOperator = getAuditUser(request);
    await createAuditLog(currentOperator, `Reset/Updated password for student username: ${username}`);

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