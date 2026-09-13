// app/api/login/route.ts
import { NextResponse } from "next/server";
import mongoose         from "mongoose";
import { Audit }        from "@/models/Schema"; 

// 1. Define a schema that references your existing "credentials" collection
const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    password: { type: String, required: true },
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
    
    // UPDATED: Destructure user_type (which is 'student' or 'staff') passed from the frontend form
    const { username, password, user_type } = await request.json();

    // Query MongoDB for a document matching BOTH credentials fields
    const user = await User.findOne({ username, password });

    if (!user) {
      return NextResponse.json(
        { message: "Invalid username or password." },
        { status: 401 }
      );
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

    // --- NEW VALIDATION CRITERIA CRITICAL CHECK ---
    // If frontend says 'student', but the ID prefix translates to 'admin' or 'teacher'
    // OR if frontend says 'staff', but the ID translates to a 'student'
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
    // ----------------------------------------------

    // --- AUDIT LOGGING LOGIC ---
    // Create the audit log document instance
    const logEntry = new Audit({
      username: username,
      user_type: detectedUserType,
      activity: "log-in"
      // createdAt auto-populates with Date.now based on your schema rule
    });

    // Save the log entry into the 'audit_log_activity' collection
    await logEntry.save();
    // ----------------------------

    // Match found and verified! Return success response status
    return NextResponse.json({ message: "Authenticated successfully." }, { status: 200 });

  } catch (error) {
    console.error("Database connection error:", error);
    return NextResponse.json(
      { message: "Unable to connect to the database server." },
      { status: 500 }
    );
  }
}