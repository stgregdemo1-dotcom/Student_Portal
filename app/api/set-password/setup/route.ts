import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { Teacher, Credentials } from "@/models/Schema";

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(process.env.MONGODB_URI!);
};

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { accountSetup } = body;

    if (!accountSetup) {
      return NextResponse.json(
        { success: false, message: "Missing required parameters: accountSetup must be provided." },
        { status: 400 }
      );
    }

    const targetTeacherId = accountSetup.username;
    const targetPassword = accountSetup.password;

    if (!targetTeacherId || !targetPassword) {
      return NextResponse.json(
        { success: false, message: "Missing required credential fields: username and password must be present." },
        { status: 400 }
      );
    }

    const newCredential = new Credentials({
      username: targetTeacherId,
      password: targetPassword,
      user_type: "teacher"
    });

    await newCredential.save();

    return NextResponse.json(
      {
        success: true,
        message: "Teacher profile activated and credentials recorded successfully.",
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error("Account creation process pipeline crash:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error occurred while finalizing account setup." },
      { status: 500 }
    );
  }
}