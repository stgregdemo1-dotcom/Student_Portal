import { NextRequest, NextResponse } from "next/server"; 
import mongoose from "mongoose";
import { Teacher, Subject, StudentSection, Config, Audit, Events } from "@/models/Schema";

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(process.env.MONGODB_URI!);
};

function getAuditUser(request: NextRequest): string {
  const auditUserCookie = request.cookies.get("audit_user");
  if (auditUserCookie?.value) return decodeURIComponent(auditUserCookie.value);

  const usernameCookie = request.cookies.get("username");
  return usernameCookie?.value ? decodeURIComponent(usernameCookie.value) : "SYSTEM";
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

export async function GET(request: NextRequest) { 
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");
    const teacherId = searchParams.get("id") || searchParams.get("teacher_id") || getAuditUser(request);

    if (action === "events") {
      const events = await Events.find({}).sort({ event_date: 1 }).lean();
      return NextResponse.json({
        success: true,
        events: events.map((event: any) => ({
          _id: event._id?.toString(),
          event_date: event.event_date || "",
          title: event.title || "Untitled Event",
          color: event.color || "bg-blue-500",
          start_time: event.start_time || "",
          end_time: event.end_time || "",
        })),
      }, { status: 200 });
    }

    if (!action) {
      if (!teacherId || teacherId === "SYSTEM") {
        return NextResponse.json(
          { success: false, message: "Missing teacher identifier." },
          { status: 400 }
        );
      }

      const teacherSubjects = await Subject.find({ teacher_id: teacherId }).lean();
      const subjectIds = teacherSubjects.map((s: any) => s.subject_id);

      const now = new Date();
      const upcomingEventsCount = await Events.countDocuments({
        event_date: { $gte: now }
      }).catch(() => 0);

      const enrolledStudentDocs = await StudentSection.find({
        "class.subjects.subject_id": { $in: subjectIds }
      }).lean();

      const uniqueStudentIds = new Set();
      let totalClassesCount = teacherSubjects.length;

      const subjectsWithAnalytics = teacherSubjects.map((subj: any) => {
        const subId = subj.subject_id;
        let subjTotalStudents = 0;
        let passedCount = 0;
        let failedCount = 0;
        const studentGradesList: any[] = [];

        enrolledStudentDocs.forEach((doc: any) => {
          if (Array.isArray(doc.class)) {
            doc.class.forEach((cls: any) => {
              if (Array.isArray(cls.subjects)) {
                const matchedSub = cls.subjects.find((s: any) => s.subject_id === subId);
                if (matchedSub) {
                  subjTotalStudents++;
                  uniqueStudentIds.add(doc.student_id || doc._id.toString());

                  const remarks = (matchedSub.remarks || "").toLowerCase();
                  if (remarks.includes("pass") || remarks.includes("passed")) {
                    passedCount++;
                  } else if (remarks.includes("fail") || remarks.includes("failed")) {
                    failedCount++;
                  }

                  const g1 = parseFloat(matchedSub.grade_1) || 0;
                  const g2 = parseFloat(matchedSub.grade_2) || 0;
                  
                  const validGradesCount = [matchedSub.grade_1, matchedSub.grade_2].filter(
                    g => g != null && g !== ""
                  ).length;
                  
                  const avgGrade = validGradesCount > 0 ? (g1 + g2) / validGradesCount : 0;

                  studentGradesList.push({
                    student_id: doc.student_id || "N/A",
                    first_name: doc.first_name || "Student",
                    last_name: doc.last_name || "",
                    grade: avgGrade.toFixed(2)
                  });
                }
              }
            });
          }
        });

        studentGradesList.sort((a, b) => parseFloat(b.grade) - parseFloat(a.grade));
        const topStudents = studentGradesList.slice(0, 3); 

        return {
          subject_id: subj.subject_id,
          subject_name: subj.subject_name || subj.name || "Unnamed Subject",
          sched_code: subj.sched_code || subj.schedule_code || "N/A",
          semester: subj.semester || "N/A",
          subject_year_section: subj.subject_year_section || subj.section || "N/A",
          totalStudents: subjTotalStudents,
          passedCount,
          failedCount,
          topStudents
        };
      });

      return NextResponse.json({
        totalEnrolledStudents: uniqueStudentIds.size,
        totalClasses: totalClassesCount,
        upcomingEvents: upcomingEventsCount,
        subjects: subjectsWithAnalytics
      }, { status: 200 });
    }

    if (!teacherId) {
      return NextResponse.json(
        { success: false, message: "Missing required query parameter: 'id' or 'teacher_id'." },
        { status: 400 }
      );
    }

    switch (action) {       
      case "profile": {
        const teacherProfile = await Teacher.findOne({ teacher_id: teacherId }).lean();
        if (!teacherProfile) {
          return NextResponse.json(
            { message: `Teacher profile with ID '${teacherId}' not found.` },
            { status: 404 }
          );
        }
        return NextResponse.json({ success: true, data: teacherProfile }, { status: 200 });
      }

      case "subjects": {
        const subjects = await Subject.find({ teacher_id: teacherId });
        return NextResponse.json({ subjects }, { status: 200 });
      }

      case "students": {
        const subjectId = teacherId; 

        const enrolledStudents = await StudentSection.find({
          "class.subjects.subject_id": subjectId
        }).lean();

        const roster = enrolledStudents.map((doc: any) => {
          let foundSubject: any = null;

          if (Array.isArray(doc.class)) {
            for (const cls of doc.class) {
              if (Array.isArray(cls.subjects)) {
                const sub = cls.subjects.find((s: any) => s.subject_id === subjectId);
                if (sub) {
                  foundSubject = sub;
                  break;
                }
              }
            }
          }

          return {
            student_id: doc.student_id,
            grades: [
              parseInt(foundSubject?.grade_1, 10) || 0, // 1st Grading
              parseInt(foundSubject?.grade_2, 10) || 0, // 2nd Grading
            ],
            remarks: foundSubject?.remarks || ""
          };
        });

        return NextResponse.json({ students: roster }, { status: 200 });
      }

      case "config": {
        const config = await Config.findOne({}).lean();
        return NextResponse.json({
          success: true,
          submit_final_grade: config?.submit_final_grade ?? false
        }, { status: 200 });
      }

      default:
        return NextResponse.json(
          { success: false, message: "Invalid action parameter." },
          { status: 400 }
        );
    }

  } catch (err: any) {
    console.error("Teachers portal pipeline error:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Failed to resolve pipeline request data." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();

    const currentOperator = getAuditUser(request);
    await createAuditLog(currentOperator, `Created record entry inside teacher portal routing tier.`);

    return NextResponse.json({ success: true, message: "Record created successfully." }, { status: 201 });
  } catch (err: any) {
    console.error("POST Handler Error:", err);
    return NextResponse.json({ message: err.message || "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const { action } = body;
    const currentOperator = getAuditUser(request);

    if (action === "updateProfile") {
      const { teacherId, name, email } = body;
      if (!teacherId) return NextResponse.json({ success: false, message: "Missing teacher ID." }, { status: 400 });

      const nameParts = String(name).trim().split(" ");
      await Teacher.updateOne(
        { teacher_id: String(teacherId).trim() },
        { 
          $set: { 
            first_name: nameParts[0] || "", 
            last_name: nameParts.slice(1).join(" ") || "", 
            email: String(email).trim() 
          } 
        }
      );

      await createAuditLog(currentOperator, `Updated profile details for teacher ID: ${teacherId}`);

      return NextResponse.json({ success: true, message: "Profile saved successfully!" }, { status: 200 });
    }

    const { scheduleCode, grades, isDraft } = body;

    if (!scheduleCode || !grades) {
      return NextResponse.json({ message: "Missing payload data parameters." }, { status: 400 });
    }

    const updatePromises = Object.entries(grades).map(async ([studentId, gradeArray]) => {
      // Expecting array format: [1st Grading, 2nd Grading, Remarks]
      if (!Array.isArray(gradeArray) || gradeArray.length < 3) {
        throw new Error(`Invalid grade structure for student ${studentId}`);
      }

      const [firstGrading, secondGrading, remarks] = gradeArray;

      const updateFields: Record<string, any> = {
        "class.$[cElem].subjects.$[sElem].grade_1": firstGrading != null ? String(firstGrading) : "",
        "class.$[cElem].subjects.$[sElem].grade_2": secondGrading != null ? String(secondGrading) : "",
        "class.$[cElem].subjects.$[sElem].remarks": remarks != null ? String(remarks) : "",
      };

      if (!isDraft) {
        updateFields["class.$[cElem].subjects.$[sElem].status"] = "Evaluating";
      }

      return StudentSection.updateOne(
        { 
          student_id: String(studentId).trim(), 
          "class.subjects.subject_id": String(scheduleCode).trim() 
        }, 
        { 
          $set: updateFields 
        },
        {
          arrayFilters: [
            { "cElem.subjects.subject_id": String(scheduleCode).trim() },
            { "sElem.subject_id": String(scheduleCode).trim() }
          ]
        }
      );
    });

    await Promise.all(updatePromises);

    if (!isDraft) {
      await Subject.updateOne(
        { subject_id: String(scheduleCode).trim() },
        { $set: { status: "Evaluating" } }
      );
    }

    const actionLabel = isDraft ? "saved grade draft" : "submitted final grades (status: Evaluating)";
    await createAuditLog(currentOperator, `Teacher successfully ${actionLabel} for schedule code: ${scheduleCode}`);

    return NextResponse.json(
      { 
        success: true, 
        message: isDraft 
          ? "Draft saved successfully!" 
          : "Final grades submitted and subject status updated to Evaluating!" 
      }, 
      { status: 200 }
    );
    
  } catch (err: any) {
    console.error("Database Update Error:", err);
    return NextResponse.json(
      { message: err.message || "Failed to update grades data." }, 
      { status: 500 }
    );
  }
}
