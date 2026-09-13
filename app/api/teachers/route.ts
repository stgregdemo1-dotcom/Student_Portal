import { NextResponse } from "next/server";
import mongoose from "mongoose";

// 1. Define the minimal Student Schema needed for counting
const StudentSchema = new mongoose.Schema(
  {
    status: { type: String, required: true }
  },
  { collection: "students" } // Enforces reading from your specific collection
);

// Prevent Next.js hot-reloading compilation errors
const Student = mongoose.models.Student || mongoose.model("Student", StudentSchema);

// Database connection helper
const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(process.env.MONGODB_URI!);
};

export async function GET() {
  try {
    await connectDB();

    // 2. Efficiently count documents where status matches "Active"
    // Using countDocuments is much faster than loading all records into memory (.find)
    const activeCount = await Student.countDocuments({ status: "Active" });

    // 3. Return the payload response
    return NextResponse.json({ totalActiveStudents: activeCount }, { status: 200 });
  } catch (error) {
    console.error("Failed to retrieve active student count:", error);
    return NextResponse.json(
      { message: "Internal Server Error while aggregating counts." },
      { status: 500 }
    );
  }
}