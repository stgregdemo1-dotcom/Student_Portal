import { NextRequest, NextResponse } from "next/server";
import FormData from "form-data";
import Mailgun from "mailgun.js";

// Initialize Mailgun client instance
const mailgun = new Mailgun(FormData);

export async function POST(request: NextRequest) {
  try {
    // 1. Guard check for Mailgun environment variables
    const apiKey = process.env.MAILGUN_API_KEY;
    const domain = process.env.MAILGUN_DOMAIN;

    if (!apiKey || !domain) {
      console.error("Mailgun environment variables missing.");
      return NextResponse.json(
        { message: "Server configuration error: Missing Mailgun credentials." },
        { status: 500 }
      );
    }

    // 2. Parse request body
    const { to, subject, htmlContent } = await request.json();

    if (!to || !subject || !htmlContent) {
      return NextResponse.json(
        { message: "Missing required fields: to, subject, or htmlContent" },
        { status: 400 }
      );
    }

    // 3. Configure client
    const mg = mailgun.client({
      username: "api",
      key: apiKey,
      // url: "https://api.eu.mailgun.net", // Uncomment if your Mailgun domain is hosted in the EU
    });

    // 4. Send the email via Mailgun API
    const response = await mg.messages.create(domain, {
      from: `Saint Gregory CST <mailgun@${domain}>`,
      to: Array.isArray(to) ? to : [to],
      subject: subject,
      html: htmlContent,
    });

    return NextResponse.json(
      { success: true, messageId: response.id },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Email sending error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to send email" },
      { status: 500 }
    );
  }
}