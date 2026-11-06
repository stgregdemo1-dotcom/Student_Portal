import { NextRequest, NextResponse } from "next/server"; 
import FormData from "form-data";
import Mailgun from "mailgun.js";
import mongoose from "mongoose";
import { Audit, Credentials, Teacher } from "@/models/Schema";

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(process.env.MONGODB_URI!);
};

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const teacherId = typeof body.teacher_id === "string" ? body.teacher_id.trim() : "";
    const username = typeof body.username === "string" ? body.username.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!teacherId || !username || !password) {
      return NextResponse.json({ message: "Teacher ID and admin credentials are required." }, { status: 400 });
    }

    if (!username.toUpperCase().startsWith("ADM")) {
      return NextResponse.json({ message: "Admin authentication is required to send a password setup link." }, { status: 403 });
    }

    const credential = await Credentials.findOne({ username }).select("username password user_type").lean();
    if (!credential || credential.password !== password || credential.user_type === "archive") {
      return NextResponse.json({ message: "Invalid admin username or password." }, { status: 401 });
    }

    const teacher = await Teacher.findOne({ teacher_id: teacherId }).lean();
    if (!teacher) {
      return NextResponse.json({ message: "Teacher record was not found." }, { status: 404 });
    }
    if (!teacher.email_address) {
      return NextResponse.json({ message: "This teacher does not have an email address on record." }, { status: 400 });
    }

    const apiKey = process.env.MAILGUN_API_KEY;
    const domain = process.env.MAILGUN_DOMAIN;

    if (!apiKey || !domain) {
      console.error("Missing Mailgun configuration (MAILGUN_API_KEY or MAILGUN_DOMAIN)");
      return NextResponse.json(
        { message: "Server configuration error: Missing Mailgun credentials." },
        { status: 500 }
      );
    }

    const mailgun = new Mailgun(FormData);
    const mg = mailgun.client({
      username: "api",
      key: apiKey,
      // url: "https://api.eu.mailgun.net" // Uncomment if your Mailgun domain is hosted in Europe (EU region)
    });

    const facultyName = `${teacher.prefix || ""} ${teacher.first_name || ""} ${teacher.last_name || ""}`.trim();

    const passwordSetupUrl = `https://stgregory-college.online/set-password/verify`;

    const emailHtml = `
      <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 550px; margin: 0 auto; padding: 32px 24px; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #ffffff;">
        <h2 style="color: #1e3a8a; font-size: 20px; font-weight: 600; margin-top: 0; margin-bottom: 16px;">Account Initialization</h2>
        <p style="color: #374151; font-size: 15px; line-height: 24px; margin-bottom: 24px;">
          Hello <strong>${facultyName}</strong>,<br><br>
          An administrator has created your portal profile (ID: <code>${teacherId}</code>). Please use the link below to initialize your account and choose your password:
        </p>
        <div style="margin-bottom: 24px;">
          <a href="${passwordSetupUrl}" 
             style="background-color: #2563eb; color: #ffffff; padding: 12px 20px; text-decoration: none; font-weight: 500; font-size: 14px; border-radius: 8px; display: inline-block;">
            Set Account Password
          </a>
        </div>
        <p style="color: #6b7280; font-size: 13px; margin-bottom: 4px;">Your security code: <code>${teacher.id || ""}</code></p>
        <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 32px 0 24px 0;" />
        <p style="color: #9ca3af; font-size: 12px; margin: 0;">This is an automated administrative notification. Please do not reply directly to this email.</p>
      </div>
    `;

    const response = await mg.messages.create(domain, {
      from: process.env.EMAIL_FROM_ADDRESS || `Portal Admin <postmaster@${domain}>`,
      to: [teacher.email_address],
      subject: "Action Required: Set Your Portal Password",
      text: `Hello ${facultyName}, please use the following link to configure your portal account password: ${passwordSetupUrl}`,
      html: emailHtml,
    });

    const activityDescription = `Dispatched account setup email to faculty member: (${facultyName || "Unknown"} - ID: ${teacherId})`;
    await createAuditLog(username, activityDescription);

    return NextResponse.json(
      { message: "The password creation pipeline completed successfully.", id: response.id },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Mailgun delivery error:", error);
    const errorDetails = typeof error === "object" && error !== null ? error : {};
    const message = "message" in errorDetails && typeof errorDetails.message === "string"
      ? errorDetails.message
      : "Failed to route system outbound mail.";
    const status = "status" in errorDetails && typeof errorDetails.status === "number"
      ? errorDetails.status
      : 500;
    return NextResponse.json(
      { message },
      { status }
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
