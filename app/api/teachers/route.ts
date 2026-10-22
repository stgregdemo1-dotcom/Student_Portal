import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

const StudentSchema = new mongoose.Schema(
  { 
    status: { type: String, required: true },
    student_id: { type: String },
    last_name: { type: String },
    first_name: { type: String }
  },
  { collection: "students" }
);

const SubjectSchema = new mongoose.Schema(
  { 
    teacher_id: { type: String, required: true },
    subject_id: { type: String },
    sched_code: { type: String },
    subject_name: { type: String },
    semester: { type: String },
    subject_year_section: { type: String },
    archived: { type: Boolean, default: false } 
  },
  { collection: "subjects" }
);

const EventSchema = new mongoose.Schema(
  { event_date: { type: Date, required: true } },
  { collection: "events" }
);

const StudentSectionSchema = new mongoose.Schema(
  {
    student_id: { type: String },
    class: [
      {
        year: { type: String },
        semester: { type: String },
        section: { type: String },
        subjects: [
          {
            subject_id: { type: String },
            teacher_id: { type: String },
            grade_1: { type: String },
            grade_2: { type: String },
            grade_3: { type: String },
            grade_4: { type: String },
            remarks: { type: String },
            status: { type: String },
          }
        ]
      }
    ]
  },
  { collection: "student_section" }
);

const Student = mongoose.models.Student || mongoose.model("Student", StudentSchema);
const Subject = mongoose.models.Subject || mongoose.model("Subject", SubjectSchema);
const Event = mongoose.models.Event || mongoose.model("Event", EventSchema);
const StudentSection = mongoose.models.StudentSection || mongoose.model("StudentSection", StudentSectionSchema);

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
    let assignedSubjectsWithAnalytics: Record<string, any>[] = [];

    if (teacherId) {
      const query = { 
        teacher_id: teacherId, 
        archived: { $ne: true } 
      };

      classCount = await Subject.countDocuments(query);
      const assignedSubjects = await Subject.find(query).lean();

      const allStudentSections = await StudentSection.find({}).lean();

      for (const sub of assignedSubjects) {
        const targetSubjectId = sub.subject_id || (sub._id as mongoose.Types.ObjectId).toString();
        let studentGrades: { student_id: string; grade: number }[] = [];
        let totalStudents = 0;
        let passedCount = 0;
        let failedCount = 0;

        for (const secDoc of allStudentSections) {
          if (!secDoc.class) continue;

          for (const cls of secDoc.class) {
            if (!cls.subjects) continue;

            for (const sSub of cls.subjects) {
              if (sSub.subject_id === targetSubjectId) {
                totalStudents++;

                // Check remarks field for passed/failed status
                const remark = (sSub.remarks || "").trim().toLowerCase();
                if (remark === "passed") {
                  passedCount++;
                } else if (remark === "failed") {
                  failedCount++;
                }

                // Calculate average grade for top student evaluation
                const grades = [sSub.grade_1, sSub.grade_2, sSub.grade_3, sSub.grade_4]
                  .map(g => parseFloat(g || ""))
                  .filter(g => !isNaN(g));

                if (grades.length > 0) {
                  const avgGrade = grades.reduce((a, b) => a + b, 0) / grades.length;
                  studentGrades.push({
                    student_id: secDoc.student_id,
                    grade: avgGrade
                  });
                }
              }
            }
          }
        }

        let topStudents: Record<string, any>[] = [];
        if (studentGrades.length > 0) {
          const highestGrade = Math.max(...studentGrades.map(s => s.grade));
          const topMatches = studentGrades.filter(s => s.grade === highestGrade);

          for (const match of topMatches) {
            const studentInfo = await Student.findOne({
              student_id: match.student_id
            }).lean();

            topStudents.push({
              student_id: match.student_id,
              last_name: studentInfo?.last_name || "N/A",
              first_name: studentInfo?.first_name || "N/A",
              grade: match.grade.toFixed(2)
            });
          }
        }

        assignedSubjectsWithAnalytics.push({
          ...sub,
          subject_id: targetSubjectId,
          topStudents,
          totalStudents,
          passedCount,
          failedCount
        });
      }
    }

    const upcomingEventsCount = await Event.countDocuments({
      event_date: { $gte: new Date() }
    });

    return NextResponse.json(
      {
        totalEnrolledStudents: enrolledCount,
        totalClasses: classCount,
        upcomingEvents: upcomingEventsCount,
        subjects: assignedSubjectsWithAnalytics
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