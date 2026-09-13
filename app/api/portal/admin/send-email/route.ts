import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

// Initialize Resend with your API key from environment variables
//const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    // 1. Guard check and delayed instantiation of Resend inside the handler
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error("Resend API key missing from process.env.RESEND_API_KEY");
      return NextResponse.json(
        { message: "Server configuration error: Missing Resend API key." },
        { status: 500 }
      );
    }

    const resend = new Resend(apiKey);

    const { teacher_id, email_address, faculty_name, id } = await request.json();

    // Basic payload validation
    if (!email_address || !teacher_id) {
      return NextResponse.json(
        { message: "Missing required teacher dispatch fields." },
        { status: 400 }
      );
    }

    // Determine the host origin dynamically (works on localhost or production)
    const origin = request.nextUrl.origin;
    const passwordSetupUrl = `${origin}/portal/setup-password?id=${teacher_id}`;

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

    // Send the email using Resend
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM_ADDRESS || "Portal Admin <onboarding@resend.dev>",
      to: [email_address],
      subject: "Action Required: Set Your Portal Password",
      text: `Hello ${faculty_name}, please use the following link to configure your portal account password: ${passwordSetupUrl}`,
      html: emailHtml,
    });

    if (error) {
      console.error("Resend delivery error:", error);
      return NextResponse.json({ message: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { message: "The password creation pipeline completed successfully." },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Mail dispatch exception routing error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to route system outbound mail." },
      { status: 500 }
    );
  }
}