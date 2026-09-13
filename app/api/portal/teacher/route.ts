import { NextRequest, NextResponse } from "next/server"; 
import mongoose from "mongoose";
import { Teacher, Subject, StudentSection, Config } from "@/models/Schema";

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(process.env.MONGODB_URI!);
};

const calculateEvaluationStatus = (gradeArray: any[]): string => {
  const [prelim, midterm, preFinal, final, remarks] = gradeArray;
  const numericGrades = [Number(prelim), Number(midterm), Number(preFinal), Number(final)];

  if (remarks === "Passed") return "Pending"; 
  if (remarks === "Failed") return "Failed";

  const hasIncompleteGrades = numericGrades.some(grade => grade === 0 || isNaN(grade));
  if (hasIncompleteGrades) return "Incomplete";

  const hasFailedGrade = numericGrades.some(grade => grade < 75);
  return hasFailedGrade ? "Failed" : "Pending"; 
};

// GET: Retrieve Profile, Subjects, or Student Rosters
export async function GET(request: NextRequest) { 
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");
    const teacherId = searchParams.get("id"); 

    if (!teacherId) {
      return NextResponse.json(
        { success: false, message: "Missing required query parameter: 'id' (teacher_id or subject_id)." },
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

        // Query students where any class item contains the target subject_id
        const enrolledStudents = await StudentSection.find({
          "class.subjects.subject_id": subjectId
        }).lean();

        const roster = enrolledStudents.map((doc: any) => {
          let foundSubject: any = null;
          let currentEvaluation = "";

          // Navigate nested structure: student -> class[] -> subjects[]
          if (Array.isArray(doc.class)) {
            for (const cls of doc.class) {
              if (Array.isArray(cls.subjects)) {
                const sub = cls.subjects.find((s: any) => s.subject_id === subjectId);
                if (sub) {
                  foundSubject = sub;
                  currentEvaluation = cls.evaluation || "";
                  break;
                }
              }
            }
          }

          return {
            student_id: doc.student_id,
            grades: [
              parseInt(foundSubject?.grade_1, 10) || 0, // Prelim
              parseInt(foundSubject?.grade_2, 10) || 0, // Midterm
              parseInt(foundSubject?.grade_3, 10) || 0, // Pre-Final
              parseInt(foundSubject?.grade_4, 10) || 0, // Final
            ],
            remarks: foundSubject?.remarks || "",
            evaluation: currentEvaluation
          };
        });

        return NextResponse.json({ students: roster }, { status: 200 });
      }

      case "config": {
        // Fetches the active system configuration settings
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

// PUT: Add or Update Student Grades & Evaluation
export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const { action } = body;

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
      return NextResponse.json({ success: true, message: "Profile saved successfully!" }, { status: 200 });
    }

    const { scheduleCode, grades, isDraft } = body;

    if (!scheduleCode || !grades) {
      return NextResponse.json({ message: "Missing payload data parameters." }, { status: 400 });
    }

    // Process grade updates for each student
    const updatePromises = Object.entries(grades).map(async ([studentId, gradeArray]) => {
      if (!Array.isArray(gradeArray) || gradeArray.length < 5) {
        throw new Error(`Invalid grade structure for student ${studentId}`);
      }

      const [prelim, midterm, preFinal, final, remarks] = gradeArray;

      // Base fields to set (grades & remarks)
      const updateFields: Record<string, any> = {
        "class.$[cElem].subjects.$[sElem].grade_1": prelim != null ? String(prelim) : "",
        "class.$[cElem].subjects.$[sElem].grade_2": midterm != null ? String(midterm) : "",
        "class.$[cElem].subjects.$[sElem].grade_3": preFinal != null ? String(preFinal) : "",
        "class.$[cElem].subjects.$[sElem].grade_4": final != null ? String(final) : "",
        "class.$[cElem].subjects.$[sElem].remarks": remarks != null ? String(remarks) : "",
      };

      // Only evaluate status if it's NOT a draft submission
      if (!isDraft) {
        const computedEvaluation = calculateEvaluationStatus(gradeArray);
        updateFields["class.$[cElem].evaluation"] = computedEvaluation;
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

    return NextResponse.json(
      { 
        success: true, 
        message: isDraft 
          ? "Draft saved successfully!" 
          : "Grades, Remarks, and Student Evaluation updated successfully!" 
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