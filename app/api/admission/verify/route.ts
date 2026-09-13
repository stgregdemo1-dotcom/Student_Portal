import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { Admission } from "@/models/Schema";

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(process.env.MONGODB_URI!);
};

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { controlNumber, dateOfBirth } = body;

    if (
      typeof controlNumber !== "string" ||
      typeof dateOfBirth !== "string" ||
      !controlNumber.trim() ||
      !dateOfBirth.trim()
    ) {
      return NextResponse.json(
        { message: "Missing required fields: controlNumber and dateOfBirth must be provided." },
        { status: 400 }
      );
    }

    const applicant = await Admission.findOne(
      {
        applicant_id: controlNumber.trim(),
        dob: dateOfBirth.trim(),
      },
      { applicant_id: 1, status: 1 } // only pull the fields we actually need
    )
      .collation({ locale: "en", strength: 2 }) // strength 2 = case-insensitive comparison
      .lean();

    if (!applicant) {
      return NextResponse.json(
        { success: false, message: "Invalid control number or date of birth. Access denied." },
        { status: 401 }
      );
    }

    if (applicant.status !== "Approved") {
      return NextResponse.json(
        {
          success: false,
          message: "This application is not currently eligible for enrolment.",
        },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Access granted!",
        applicantId: applicant.applicant_id,
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