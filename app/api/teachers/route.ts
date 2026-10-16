import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

const StudentSchema = new mongoose.Schema(
  { status: { type: String, required: true } },
  { collection: "students" }
);

const SubjectSchema = new mongoose.Schema(
  { teacher_id: { type: String, required: true } },
  { collection: "subjects" }
);

const EventSchema = new mongoose.Schema(
  { event_date: { type: Date, required: true } },
  { collection: "events" }
);

const Student = mongoose.models.Student || mongoose.model("Student", StudentSchema);
const Subject = mongoose.models.Subject || mongoose.model("Subject", SubjectSchema);
const Event = mongoose.models.Event || mongoose.model("Event", EventSchema);

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(process.env.MONGODB_URI!);
};

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const teacherIdCookie = request.cookies.get("username")?.value;
    const { searchParams } = request.nextUrl;
    const teacherId = teacherIdCookie || searchParams.get("teacher_id");
    const enrolledCount = await Student.countDocuments({
      status: { $regex: /^enrolled$/i }
    });

    let classCount = 0;
    if (teacherId) {
      classCount = await Subject.countDocuments({
        teacher_id: teacherId
      });
    }

    const upcomingEventsCount = await Event.countDocuments({
      event_date: { $gte: new Date() }
    });

    return NextResponse.json(
      {
        totalEnrolledStudents: enrolledCount,
        totalClasses: classCount,
        upcomingEvents: upcomingEventsCount
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to retrieve dashboard metrics:", error);
    return NextResponse.json(
      { message: "Internal Server Error while aggregating counts." },
      { status: 500 }
    );
  }
}