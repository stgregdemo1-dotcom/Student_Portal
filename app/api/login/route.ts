// app/api/login/route.ts
import { NextResponse } from "next/server";
import mongoose         from "mongoose";
import { Audit }        from "@/models/Schema"; 

// 1. Define a schema that references your existing "credentials" collection
const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    password: { type: String, required: true },
    user_type: { type: String }, // Included to check archival/locking status
    privacyNoticeAcknowledged: { type: Boolean },
    try: { type: Number, default: 0 },          // Track failed login attempts
    locked: { type: Boolean, default: false },   // Account lock flag
    lockeduntil: { type: Date },                 // Lock expiration timestamp
  },
  { collection: "credentials" } // Hard-binds to your collection name
);

// Prevent Next.js from redefining the model during hot-reloads
const User = mongoose.models.User || mongoose.model("User", UserSchema);


// 2. Establish your Database Connection
const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;  
  const MONGODB_URI = process.env.MONGODB_URI;  
  if (!MONGODB_URI) {
    throw new Error("Please define the MONGODB_URI environment variable inside .env.local");
  }
  await mongoose.connect(MONGODB_URI);
};

// 3. Handle the incoming POST Request
export async function POST(request: Request) {
  try {
    await connectDB();
    
    const { username, password, user_type, privacyAcknowledged } = await request.json();

    // Query MongoDB by username first
    const user = await User.findOne({ username });

    if (!user) {
      return NextResponse.json(
        { message: "Invalid username or password." },
        { status: 401 }
      );
    }

    // --- CHECK USER_TYPE FIRST BEFORE ANYTHING ELSE ---
    if (user.user_type === "archive") {
      return NextResponse.json(
        { message: "Access denied. This account has been archived and is currently locked." },
        { status: 403 }
      );
    }

    // --- CHECK IF ACCOUNT IS CURRENTLY LOCKED OUT ---
    const now = new Date();
    if (user.locked && user.lockeduntil && now < new Date(user.lockeduntil)) {
      const minutesLeft = Math.ceil((new Date(user.lockeduntil).getTime() - now.getTime()) / (60 * 1000));
      return NextResponse.json(
        { message: `Account is temporarily locked due to too many failed login attempts. Try again in ${minutesLeft} minute(s).` },
        { status: 403 }
      );
    } else if (user.locked && user.lockeduntil && now >= new Date(user.lockeduntil)) {
      // Lockout period has expired; reset lock and attempts
      user.locked = false;
      user.try = 0;
      user.lockeduntil = undefined;
      await user.save();
    }

    // Verify password next
    if (user.password !== password) {
      // Increment failed attempts
      user.try = (user.try || 0) + 1;

      // Check if attempts reach or exceed 5
      if (user.try >= 5) {
        user.locked = true;
        user.lockeduntil = new Date(Date.now() + 15 * 60 * 1000); // Current time + 15 minutes
      }

      await user.save();

      return NextResponse.json(
        { message: "Invalid username or password." },
        { status: 401 }
      );
    }

    // --- SUCCESSFUL PASSWORD: RESET FAILED ATTEMPTS ---
    if (user.try > 0 || user.locked) {
      user.try = 0;
      user.locked = false;
      user.lockeduntil = undefined;
      await user.save();
    }

    // Determine user classification based on your ID naming conventions
    let detectedUserType = "student"; 
    const upperUsername = username.toUpperCase();

    if (upperUsername.startsWith("ADM")) {
      detectedUserType = "admin";
    } else if (upperUsername.startsWith("TCH")) {
      detectedUserType = "teacher";
    } else if (upperUsername.startsWith("REG")) {
      detectedUserType = "registrar";
    }

    // --- ROLE VALIDATION CRITERIA CHECK ---
    const isStaffRole = 
      detectedUserType === "admin" || 
      detectedUserType === "teacher" || 
      detectedUserType === "registrar";
    
    if (user_type === "student" && isStaffRole) {
      return NextResponse.json(
        { message: `Access denied. This ID belongs to an administrator/faculty account.` },
        { status: 403 }
      );
    }

    if (user_type === "staff" && detectedUserType === "student") {
      return NextResponse.json(
        { message: `Access denied. Student accounts cannot log in through the Faculty portal.` },
        { status: 403 }
      );
    }

    if (
      detectedUserType === "student" &&
      user.privacyNoticeAcknowledged === false &&
      privacyAcknowledged !== true
    ) {
      return NextResponse.json(
        {
          message: "Please review and acknowledge the Data Privacy Policy to continue.",
          requiresPrivacyAcknowledgment: true,
        },
        { status: 428 }
      );
    }

    if (
      detectedUserType === "student" &&
      privacyAcknowledged === true &&
      user.privacyNoticeAcknowledged !== true
    ) {
      user.privacyNoticeAcknowledged = true;
      await user.save();
    }
 
    const logEntry = new Audit({
      username: username,
      user_type: detectedUserType,
      activity: "log-in"
    });

    await logEntry.save();
    return NextResponse.json({ message: "Authenticated successfully." }, { status: 200 });

  } catch (error) {
    console.error("Database connection error:", error);
    return NextResponse.json(
      { message: "Unable to connect to the database server." },
      { status: 500 }
    );
  }
}