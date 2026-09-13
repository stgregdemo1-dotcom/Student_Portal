import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { Teacher, Credentials } from "@/models/Schema"; // Ensure this matches your path containing both models

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(process.env.MONGODB_URI!);
};

// --- GET Handler: Retrieves teacher document ---
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const table = searchParams.get("table");
    const teacherId = searchParams.get("teacher_id");

    if (table !== "teachers") {
      return NextResponse.json(
        { success: false, message: "Invalid or unsupported collection table parameter resource." },
        { status: 400 }
      );
    }

    if (!teacherId) {
      return NextResponse.json(
        { success: false, message: "Missing target teacher_id parameter reference value." },
        { status: 400 }
      );
    }

    await connectDB();

    const teacherDoc = await Teacher.findOne(
      { teacher_id: teacherId },
      { _id: 0, __v: 0 }
    ).lean();

    if (!teacherDoc) {
      return NextResponse.json(
        { success: false, message: "Teacher account profile record not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: teacherDoc }, { status: 200 });
  } catch (error: any) {
    console.error("Registrar routing profile recovery engine exception:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error occurred while retrieving data resource profiles." },
      { status: 500 }
    );
  }
}

// --- POST Handler: Form verification gate ---
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { teacherId, securityCode } = body;

    if (
      typeof teacherId !== "string" ||
      typeof securityCode !== "string" ||
      !teacherId ||
      !securityCode
    ) {
      return NextResponse.json(
        { message: "Missing required fields: teacherId and securityCode must be provided." },
        { status: 400 }
      );
    }

    const teacherDoc = await Teacher.findOne(
      {
        id: securityCode,
        teacher_id: teacherId,
      },
      { id: 1 }
    ).lean();

    if (!teacherDoc) {
      return NextResponse.json(
        { success: false, message: "Verification failed. Access denied." },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Access granted!",
        applicantId: teacherDoc.id,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Verification endpoint pipeline crash:", error);
    return NextResponse.json(
      { message: "Internal server error during credential verification." },
      { status: 500 }
    );
  }
}

// --- PUT Handler: Processes profile activation and inserts new record into credentials model ---
export async function PUT(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { teacherProfile, accountSetup } = body;

    // 1. Structural payload validations
    if (!teacherProfile || !accountSetup) {
      return NextResponse.json(
        { success: false, message: "Missing teacherProfile or accountSetup body parameters." },
        { status: 400 }
      );
    }

    const targetTeacherId = accountSetup.username;
    const targetPassword = accountSetup.password;

    if (!targetTeacherId || !targetPassword) {
      return NextResponse.json(
        { success: false, message: "Username and password credentials must be complete." },
        { status: 400 }
      );
    }

    // 2. Update existing teacher document status and emergency info inside 'teachers'
    const updatedTeacher = await Teacher.findOneAndUpdate(
      { teacher_id: targetTeacherId },
      {
        $set: {
          status: "Active",
          emergency_contact_person: teacherProfile.emergency_contact_person,
          emergency_contact_relationship: teacherProfile.emergency_contact_relationship,
          emergency_contact_number: teacherProfile.emergency_contact_number,
          residential_address: teacherProfile.residential_address,
        }
      },
      { new: true }
    );

    if (!updatedTeacher) {
      return NextResponse.json(
        { success: false, message: "Teacher account profile record modification targeting failed." },
        { status: 404 }
      );
    }

    // 3. Create and save an explicitly brand-new document using your imported Credentials model
    const newCredential = new Credentials({
      username: targetTeacherId,
      password: targetPassword, // Raw, plain-text string formatting requirements
      user_type: "teacher"
    });

    await newCredential.save();

    return NextResponse.json(
      {
        success: true,
        message: "Account activated and brand-new model credential record inserted successfully.",
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error("Account registration submission pipeline error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error during registration update process." },
      { status: 500 }
    );
  }
}