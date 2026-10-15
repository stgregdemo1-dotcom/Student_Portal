import { NextRequest, NextResponse } from "next/server"; 
import FormData from "form-data";
import Mailgun from "mailgun.js";
import mongoose from "mongoose";
import { Audit } from "@/models/Schema";

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(process.env.MONGODB_URI!);
};

function getAuditUser(request: NextRequest): string {
  const auditUserCookie = request.cookies.get("audit_user");
  return auditUserCookie ? decodeURIComponent(auditUserCookie.value) : "SYSTEM";
}

export async function POST(request: NextRequest) {
  try {
    // 1. Connect to Database and Validate environment variables
    await connectDB();

    const apiKey = process.env.MAILGUN_API_KEY;
    const domain = process.env.MAILGUN_DOMAIN;

    if (!apiKey || !domain) {
      console.error("Missing Mailgun configuration (MAILGUN_API_KEY or MAILGUN_DOMAIN)");
      return NextResponse.json(
        { message: "Server configuration error: Missing Mailgun credentials." },
        { status: 500 }
      );
    }

    // 2. Initialize Mailgun client
    const mailgun = new Mailgun(FormData);
    const mg = mailgun.client({
      username: "api",
      key: apiKey,
      // url: "https://api.eu.mailgun.net" // Uncomment if your Mailgun domain is hosted in Europe (EU region)
    });

    const { teacher_id, email_address, faculty_name, id } = await request.json();

    // Basic payload validation
    if (!email_address || !teacher_id) {
      return NextResponse.json(
        { message: "Missing required teacher dispatch fields." },
        { status: 400 }
      );
    }

    // Determine the host origin dynamically
    const passwordSetupUrl = `https://stgregory-college.online/set-password/verify`;

    // Clean, minimalist HTML email layout matching Tailwind designs
    const emailHtml = `
      <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 550px; margin: 0 auto; padding: 32px 24px; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #ffffff;">
        <h2 style="color: #1e3a8a; font-size: 20px; font-weight: 600; margin-top: 0; margin-bottom: 16px;">Account Initialization</h2>
        <p style="color: #374151; font-size: 15px; line-height: 24px; margin-bottom: 24px;">
          Hello <strong>${faculty_name}</strong>,<br><br>
          An administrator has created your portal profile (ID: <code>${teacher_id}</code>). Please use the link below to initialize your account and choose your password:
        </p>
        <div style="margin-bottom: 24px;">
          <a href="${passwordSetupUrl}" 
             style="background-color: #2563eb; color: #ffffff; padding: 12px 20px; text-decoration: none; font-weight: 500; font-size: 14px; border-radius: 8px; display: inline-block;">
            Set Account Password
          </a>
        </div>
        <p style="color: #6b7280; font-size: 13px; margin-bottom: 4px;">Your security code: <code>${id}</code></p>
        <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 32px 0 24px 0;" />
        <p style="color: #9ca3af; font-size: 12px; margin: 0;">This is an automated administrative notification. Please do not reply directly to this email.</p>
      </div>
    `;

    // 3. Dispatch email via Mailgun API
    const response = await mg.messages.create(domain, {
      from: process.env.EMAIL_FROM_ADDRESS || `Portal Admin <postmaster@${domain}>`,
      to: [email_address],
      subject: "Action Required: Set Your Portal Password",
      text: `Hello ${faculty_name}, please use the following link to configure your portal account password: ${passwordSetupUrl}`,
      html: emailHtml,
    });

    // 🚀 4. Audit Logging for Email Dispatch
    const currentOperator = getAuditUser(request);
    const activityDescription = `Dispatched account setup email to faculty member: (${faculty_name || "Unknown"} - ID: ${teacher_id})`;
    await createAuditLog(currentOperator, activityDescription);

    return NextResponse.json(
      { message: "The password creation pipeline completed successfully.", id: response.id },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Mailgun delivery error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to route system outbound mail." },
      { status: error.status || 500 }
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