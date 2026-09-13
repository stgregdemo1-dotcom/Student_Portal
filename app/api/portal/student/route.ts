import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { Student, StudentSection, Subject, Events } from "@/models/Schema"; 
import { cookies } from "next/headers";

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(process.env.MONGODB_URI!);
};

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const cookieStore = await cookies(); 
    const usernameCookie = cookieStore.get("username");

    if (!usernameCookie || !usernameCookie.value) {
      return NextResponse.json({ success: false, message: "Unauthorized. Session cookie missing." }, { status: 401 });
    }

    const studentId = usernameCookie.value;
    const { searchParams } = request.nextUrl;

    // ==========================================================
    // CALENDAR EVENTS LOOKUP
    // ==========================================================
    if (searchParams.get("getCalendarEvents") === "true") {
      const EventModel = mongoose.models.Events || Events;
      const calendarEvents = await EventModel.find({}).lean();

      const formattedEvents = calendarEvents.map((event: any) => ({
        _id: event._id?.toString(),
        date: event.event_date || "", 
        title: event.title || "Untitled Event",
        color: event.color || "bg-blue-500",
        startTime: event.start_time || "—",
        endTime: event.end_time || "—",
      }));

      return NextResponse.json({ success: true, events: formattedEvents }, { status: 200 });
    }

    // ==========================================================
    // MASTER SCHEDULE LOOKUP
    // ==========================================================
    if (searchParams.get("getSchedule") === "true") {
      const studentRecord = await StudentSection.findOne({ student_id: studentId }).lean();

      if (!studentRecord || !studentRecord.class || studentRecord.class.length === 0) {
        return NextResponse.json({ success: true, subjects: [] }, { status: 200 });
      }

      const enrolledSubjectIds: string[] = [];
      studentRecord.class.forEach((cls: any) => {
        if (cls.subjects && Array.isArray(cls.subjects)) {
          cls.subjects.forEach((sub: any) => {
            if (sub.subject_id) enrolledSubjectIds.push(sub.subject_id);
          });
        }
      });

      const masterSubjectsList = await Subject.find({ subject_id: { $in: enrolledSubjectIds } }).lean();
      const subjectMap = new Map();
      masterSubjectsList.forEach((sub: any) => {
        subjectMap.set(sub.subject_id, sub);
      });

      const formattedGridSubjects: any[] = [];

      studentRecord.class.forEach((cls: any) => {
        if (cls.subjects && Array.isArray(cls.subjects)) {
          cls.subjects.forEach((sub: any) => {
            const masterDetails = subjectMap.get(sub.subject_id);

            if (masterDetails) {
              formattedGridSubjects.push({
                sched_code: masterDetails.sched_code || "—",
                subject_id: masterDetails.subject_id,
                subject_name: masterDetails.subject_name || "—",
                room: masterDetails.room || "—",
                semester: cls.semester || masterDetails.semester || "1", 
                "subject-day": masterDetails.subject_day || "Monday", 
                subject_specification: masterDetails.subject_specification || "core",
                class_time: {
                  start: masterDetails.class_time?.start || "7:00 AM",
                  end: masterDetails.class_time?.end || "8:00 AM"
                }
              });
            }
          });
        }
      });

      return NextResponse.json({ success: true, subjects: formattedGridSubjects }, { status: 200 });
    }

    // ==========================================================
    // EVALUATION STATUS LOOKUP
    // ==========================================================
    if (searchParams.get("getEvaluationStatus") === "true") {
      const studentRecord = await StudentSection.findOne({ student_id: studentId }).lean();

      if (!studentRecord || !studentRecord.class || studentRecord.class.length === 0) {
        return NextResponse.json({ 
          success: true, 
          evaluation: { status: "Pending", year: "—", semester: "—", remarks: "No record found" } 
        }, { status: 200 });
      }

      const unapprovedClass = studentRecord.class.slice().reverse().find(
        (cls: any) => cls.evaluation && cls.evaluation.toLowerCase() !== "approved"
      ) || studentRecord.class[studentRecord.class.length - 1];

      return NextResponse.json({
        success: true,
        evaluation: {
          status: unapprovedClass?.evaluation || "Pending", 
          year: unapprovedClass?.year || "—",
          semester: unapprovedClass?.semester || "—",
          remarks: unapprovedClass?.evaluation_remarks || "Awaiting final review."
        }
      }, { status: 200 });
    }

    // ==========================================================
    // PROFILE LOOKUP
    // ==========================================================
    if (!searchParams.get("getYearsOnly") && !searchParams.get("year") && !searchParams.get("semester")) {
      const studentProfile = await Student.findOne({ student_id: studentId }).lean();

      if (!studentProfile) {
        return NextResponse.json({ success: false, message: "Student profile not found." }, { status: 404 });
      }

      const studentSectionRecord = await StudentSection.findOne({ student_id: studentId }).lean();
      let targetClass: any = null;

      if (studentSectionRecord && Array.isArray(studentSectionRecord.class) && studentSectionRecord.class.length > 0) {
        const unapprovedClasses = studentSectionRecord.class.filter(
          (cls: any) => !cls.evaluation || cls.evaluation.trim().toLowerCase() !== "approved"
        );

        if (unapprovedClasses.length > 0) {
          targetClass = unapprovedClasses[unapprovedClasses.length - 1];
        } else {
          targetClass = studentSectionRecord.class[studentSectionRecord.class.length - 1];
        }
      }

      const completeProfileData = {
        ...studentProfile,
        assigned_section: targetClass?.section || "—",
        academic_year: targetClass?.year || "—",
        semester: targetClass?.semester || "—",
        status: studentProfile.status || "Enrolled" 
      };

      return NextResponse.json({ success: true, data: completeProfileData }, { status: 200 });
    }

    // ==========================================================
    // ACADEMIC / GRADES LOOKUP (UPDATED & MATCHED FOR EMBEDDED ARRAY)
    // ==========================================================
    if (searchParams.get("getYearsOnly") === "true") {
      const studentRecord = await StudentSection.findOne({ student_id: studentId }).lean();
      
      let uniqueYears: string[] = [];
      if (studentRecord && Array.isArray(studentRecord.class)) {
        uniqueYears = Array.from(new Set(studentRecord.class.map((cls: any) => cls.year).filter(Boolean)));
        uniqueYears.sort();
      }

      return NextResponse.json({ success: true, data: uniqueYears }, { status: 200 });
    }

    const yearFilter = searchParams.get("year");
    const semesterFilter = searchParams.get("semester");

    if (!yearFilter || !semesterFilter) {
      return NextResponse.json({ success: true, data: { subjects: [], average: "—" } }, { status: 200 });
    }

    const studentRecord = await StudentSection.findOne({ student_id: studentId }).lean();

    if (!studentRecord || !Array.isArray(studentRecord.class)) {
      return NextResponse.json({ success: true, data: { subjects: [], average: "—" } }, { status: 200 });
    }

    // Helper to normalize semester strings for comparison ("1", "1st", "1st Semester" -> "1")
    const normalizeSem = (sem: string) => String(sem || "").trim().charAt(0);

    // Find the matching class entry by year and normalized semester
    const targetClass = studentRecord.class.find((cls: any) => {
      const sameYear = String(cls.year).trim() === String(yearFilter).trim();
      const sameSem = normalizeSem(cls.semester) === normalizeSem(semesterFilter);
      return sameYear && sameSem;
    });

    if (!targetClass || !targetClass.subjects || targetClass.subjects.length === 0) {
      return NextResponse.json({ success: true, data: { subjects: [], average: "—" } }, { status: 200 });
    }

    // Map through master subjects for subject name lookup if available
    const subjectIds = targetClass.subjects.map((s: any) => s.subject_id).filter(Boolean);
    const masterSubjects = await Subject.find({ subject_id: { $in: subjectIds } }).lean();
    const masterSubjectMap = new Map();
    masterSubjects.forEach((sub: any) => masterSubjectMap.set(sub.subject_id, sub));

    let totalScore = 0;
    let gradedSubjectsCount = 0;

    const formattedSubjects = targetClass.subjects.map((sub: any) => {
      const p = sub.grade_1 !== undefined && sub.grade_1 !== "" ? Number(sub.grade_1) : NaN;
      const m = sub.grade_2 !== undefined && sub.grade_2 !== "" ? Number(sub.grade_2) : NaN;
      const pf = sub.grade_3 !== undefined && sub.grade_3 !== "" ? Number(sub.grade_3) : NaN;
      const f = sub.grade_4 !== undefined && sub.grade_4 !== "" ? Number(sub.grade_4) : NaN;

      let calculatedFinal = "—";
      let calculatedStatus = sub.status || "Pending";

      if (!isNaN(p) && !isNaN(m) && !isNaN(pf) && !isNaN(f)) {
        const avg = Math.round((p + m + pf + f) / 4);
        calculatedFinal = String(avg);
        calculatedStatus = avg >= 75 ? "Passed" : "Failed";
        totalScore += avg;
        gradedSubjectsCount++;
      }

      const masterDetails = masterSubjectMap.get(sub.subject_id);

      return {
        course: masterDetails?.subject_name || sub.subject_id || "Unknown Subject",
        Teacher: sub.teacher_id || "Not Assigned",
        prelim: sub.grade_1 || "—",
        midterm: sub.grade_2 || "—",
        prefinal: sub.grade_3 || "—",
        finals: sub.grade_4 || "—",
        grade: calculatedFinal,
        status: calculatedStatus
      };
    });

    const generalAverage = gradedSubjectsCount > 0 ? Math.round(totalScore / gradedSubjectsCount) : "—";

    return NextResponse.json({
      success: true,
      data: { subjects: formattedSubjects, average: generalAverage }
    }, { status: 200 });

  } catch (error: any) {
    console.error("Grades Aggregation Route Error:", error);
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}