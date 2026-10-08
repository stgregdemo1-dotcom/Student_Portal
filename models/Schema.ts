// models/Audit.ts
import mongoose from "mongoose";

const AuditSchema = new mongoose.Schema(
  {
    username:   { type: String, required: true },
    user_type:  { type: String, required: true },
    activity:   { type: String, required: true },
    createdAt:  { type: Date, default: Date.now }
  },
  { collection: "audit_log_activity" }
);
export const Audit = mongoose.models.Audit || mongoose.model("Audit", AuditSchema);

const TeacherSchema = new mongoose.Schema(
  {
    id:             { type: String },
    teacher_id:     { type: String },
    prefix:         { type: String },
    first_name:     { type: String },
    middle_name:    { type: String },
    last_name:      { type: String },
    email_address:  { type: String },
    contact_number: { type: String },
    department_id:  { type: String },
    status:         { type: String },
    role_id:        { type: String },
  },
  { collection: "teachers" }
);
export const Teacher = mongoose.models.Teacher || mongoose.model("Teacher", TeacherSchema);

const SubjectSchema = new mongoose.Schema(
  {
    subject_id:             { type: String, required: true, unique: true },
    sched_code:             { type: String, required: true },
    semester:               { type: String, required: true },
    subject_specification:  { type: String, required: true },
    subject_name:           { type: String, required: true },
    subject_year_section:   { type: String, required: true },
    teacher_id:             { type: String, required: true },
    class_time: {
      start: { type: String, required: true },
      end:   { type: String, required: true }
    },
    subject_day:            { type: String, required: true },
    room:                   { type: String, required: true },
    status:                 { type: String, required: true },
  },
  { collection: "subjects" }
);
export const Subject = mongoose.models.Subject || mongoose.model("Subject", SubjectSchema);

const StudentSchema = new mongoose.Schema(
  {
    student_id:               { type: String, required: true },
    first_name:               { type: String, required: true },
    middle_name:              { type: String, required: true },
    last_name:                { type: String, required: true },
    status:                   { type: String, required: true },
    email_address:            { type: String, required: true },
    contact_number:           { type: String, required: true },
    date_of_birth:            { type: String, required: true },
    gender:                   { type: String, required: true },
    nationality:              { type: String, required: true },
    secondary_school:         { type: String, required: true },
    graduation_year:          { type: String, required: true },
    gpa:                      { type: String, required: true },
    track:                    { type: String, required: true },
    residential_address:      { type: String, required: true },
    emergency_contact_person: { type: String, required: true },
    emergency_contact_relationship: { type: String, required: true },
    emergency_contact_number: { type: String, required: true },
  },
  { collection: "students" }
);
export const Student = mongoose.models.Student || mongoose.model("Student", StudentSchema);

const AttachmentSchema = new mongoose.Schema({
  filename: String,
  contentType: String,
  data: Buffer, // 🚀 This handles your binary Base64 subType data maps automatically
});

const AdmissionSchema = new mongoose.Schema({
  applicant_id: { type: String, unique: true },
  status: String,
  firstName: String,
  middleName: String,
  lastName: String,
  email: String,
  phone: String,
  dob: String,
  gender: String,
  nationality: String,
  track: String,
  enrollmentType: String,
  gradeLevel: String,
  lrn: String,
  lastSchool: String,
  street: String,
  city: String,
  province: String,
  zip: String,
  country: String,
  personalStatement: String,
  attachments: [AttachmentSchema],
  submittedAt: { type: Date, default: Date.now },
  },
  { collection: "admissions_applications" }
);
export const Admission = mongoose.models.Admission || mongoose.model("Admission", AdmissionSchema, "admissions_applications");

const CredentialSchema = new mongoose.Schema(
  {
    username:   { type: String },
    password:   { type: String },
    user_type:  { type: String }
  },
  { collection: "credentials" }
);
export const Credentials = mongoose.models.Credentials || mongoose.model("Credentials", CredentialSchema);

const ConfigSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true }, // e.g., "dropdown_options"
    section:          [{ type: String }],
    room:             [{ type: String }],
    employee_status:  [{ type: String }],
    employee_role:    [{ type: String }],
    prefix:           [{ type: String }],
    specification:    [{ type: String }],
    admission_button:   { type: Boolean },
    submit_final_grade: { type: Boolean },
  },
  { collection: "configuration" }
);
export const Config = mongoose.models.Config || mongoose.model("Config", ConfigSchema);

const StudentSectionSchema = new mongoose.Schema(
  {
    student_id: { type: String },
    class: [
      {
        year:       { type: String },
        semester:   { type: String },
        section:    { type: String },
        evaluation: { type: String },
        subjects: [
          {
            subject_id: { type: String },
            teacher_id: { type: String },
            grade_1:    { type: String },
            grade_2:    { type: String },
            grade_3:    { type: String },
            grade_4:    { type: String },
            remarks:    { type: String },
            status:     { type: String },
          }
        ]
      }
    ]
  },
  { collection: "student_section",
    versionKey: false
  }
);
export const StudentSection = mongoose.models.StudentSection || mongoose.model("StudentSection", StudentSectionSchema);

const EventSchema = new mongoose.Schema(
  {
    event_date: { type: String },
    title:      { type: String },
    color:      { type: String },
    start_time: { type: String },
    end_time  : { type: String },
  },
  { collection: "events"
  }
);
export const Events = mongoose.models.Events || mongoose.model("Events", EventSchema);
