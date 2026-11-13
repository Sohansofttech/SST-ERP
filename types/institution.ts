export type InstitutionType =
  | "Engineering & Technology"
  | "Arts & Science"
  | "University"
  | "Polytechnic / Diploma"
  | "Medical & Health Sciences"
  | "K-12 School";

export interface InstitutionProfile {
  id: string;
  name: string;
  code: string;
  type: InstitutionType;
  affiliation: string;
  accreditation: string;
  establishedYear: number;
  email: string;
  phone: string;
  alternatePhone?: string;
  website: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  logoUrl?: string;
  primaryColor: string;
  accentColor: string;
  academicCalendarType: "Semester" | "Annual" | "Trimester";
  currencySymbol: string;
}

export interface Term {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
}

export interface AcademicYear {
  id: string;
  name: string; // e.g. "2026-2027"
  startDate: string;
  endDate: string;
  isActive: boolean;
  terms: Term[];
  createdAt: string;
}

export interface Department {
  id: string;
  code: string; // e.g. "CSE"
  name: string; // e.g. "Computer Science & Engineering"
  headOfDepartment: string;
  email: string;
  phone: string;
  facultyCount: number;
  studentCapacity: number;
  description?: string;
}

export type DegreeType = "Undergraduate" | "Postgraduate" | "Diploma" | "Doctoral" | "Certificate";

export interface Course {
  id: string;
  code: string; // e.g. "BTECH-CSE"
  name: string; // e.g. "B.Tech in Computer Science and Engineering"
  degreeType: DegreeType;
  departmentId: string;
  departmentName?: string;
  durationYears: number;
  totalSemesters: number;
  totalCredits: number;
  status: "Active" | "Inactive";
  description?: string;
}

export interface ClassItem {
  id: string;
  name: string; // e.g. "CSE 3rd Year"
  code: string; // e.g. "CSE-Y3"
  courseId: string;
  courseName?: string;
  academicYearId: string;
  academicYearName?: string;
  stream: string; // e.g. "Core", "Artificial Intelligence", "Data Science"
  semester: number;
  sectionsCount: number;
  totalStudents: number;
}

export interface SectionItem {
  id: string;
  classId: string;
  name: string; // e.g. "Section A"
  batchName: string; // e.g. "Batch 2024-2028"
  maxCapacity: number;
  currentEnrollment: number;
  roomNumber: string;
  classTeacherName: string;
}

export type SubjectType = "Core Theory" | "Practical / Lab" | "Department Elective" | "Open Elective" | "Project / Seminar";

export interface SubjectItem {
  id: string;
  code: string; // e.g. "CS501"
  name: string; // e.g. "Database Management Systems"
  credits: number;
  hoursPerWeek: number;
  type: SubjectType;
  courseId: string;
  courseName?: string;
  classId?: string;
  className?: string;
  departmentId: string;
  departmentName?: string;
  semester: number;
  allocatedTeacherName?: string;
  status: "Active" | "Inactive";
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

export interface RoleItem {
  id: string;
  name: string;
  code: string;
  description: string;
  isSystemRole: boolean;
  userCount: number;
  permissions: string[]; // List of permission IDs
}

export interface PermissionCategory {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
}

export interface DashboardStats {
  totalStudents: number;
  totalStaff: number;
  activeAcademicYear: string;
  totalCourses: number;
  totalDepartments: number;
  pendingApprovals: number;
  activeSections: number;
  attendanceRateToday: number;
  totalAdmissions?: number;
  totalGuardians?: number;
}

// -------------------------------------------------------------
// Admission Management Types
// -------------------------------------------------------------
export type AdmissionStatus =
  | "Submitted"
  | "Under Review"
  | "Approved"
  | "Rejected"
  | "Waitlisted";

export interface StatusHistoryEntry {
  status: AdmissionStatus;
  changedAt: string;
  changedBy: string;
  remarks?: string;
}

export interface DocumentSubmissionStatus {
  documentName: string;
  isSubmitted: boolean;
  verifiedAt?: string;
}

export interface AdmissionApplication {
  id: string; // e.g. "APP-2026-001"
  applicationNumber: string; // e.g. "SST-2026-APP-001"
  applicantFirstName: string;
  applicantLastName: string;
  applicantFullName: string;
  dob: string;
  gender: "Male" | "Female" | "Other";
  email: string;
  phone: string;
  addressLine: string;
  city: string;
  state: string;
  postalCode: string;

  // Guardian Information
  guardianName: string;
  guardianRelation: "Father" | "Mother" | "Local Guardian" | "Legal Guardian";
  guardianPhone: string;
  guardianEmail: string;
  guardianOccupation: string;

  // Academic Program Choice
  academicYearId: string;
  academicYearName: string;
  departmentId: string;
  departmentName: string;
  courseId: string;
  courseName: string;

  // Previous Academics
  previousSchoolOrCollege: string;
  previousBoardOrUniversity: string;
  previousScorePercentage: number;
  passingYear: number;

  // Documents Checklist
  documents: DocumentSubmissionStatus[];

  // Status & Tracking
  status: AdmissionStatus;
  statusHistory: StatusHistoryEntry[];
  appliedDate: string;
  reviewRemarks?: string;

  // Student Conversion State
  isConvertedToStudent: boolean;
  convertedStudentId?: string;
}

// -------------------------------------------------------------
// Student Management Types
// -------------------------------------------------------------
export type StudentStatus = "Active" | "Inactive" | "Suspended" | "Alumni" | "Archived";

export interface EnrollmentHistoryEntry {
  id: string;
  academicYearId: string;
  academicYearName: string;
  classId: string;
  className: string;
  sectionId?: string;
  sectionName?: string;
  enrolledAt: string;
  status: StudentStatus;
  remarks?: string;
}

export interface StudentItem {
  id: string; // e.g. "STU-2026-001"
  studentId: string; // e.g. "STU-2026-001"
  admissionNumber: string; // e.g. "ADM-2026-0101"
  rollNumber: string; // e.g. "26CSE001"

  firstName: string;
  lastName: string;
  fullName: string;
  dob: string;
  gender: "Male" | "Female" | "Other";
  bloodGroup?: string;
  category?: string; // General, OBC, SC, ST, Management, etc.

  email: string;
  institutionalEmail: string;
  phone: string;
  emergencyPhone?: string;
  addressLine: string;
  city: string;
  state: string;
  postalCode: string;

  // Academic Placement
  academicYearId: string;
  academicYearName: string;
  departmentId: string;
  departmentName: string;
  courseId: string;
  courseName: string;
  classId: string;
  className: string;
  sectionId?: string;
  sectionName?: string;
  batch: string; // e.g. "2024-2028"

  admissionDate: string;
  status: StudentStatus;

  // Guardian Linking (Many-to-Many IDs)
  guardianIds: string[];

  // Academic Enrollment History
  enrollmentHistory: EnrollmentHistoryEntry[];

  // Source Admission Application Link (if converted)
  sourceApplicationId?: string;
}

// -------------------------------------------------------------
// Guardian Management Types
// -------------------------------------------------------------
export type GuardianRelationship = "Father" | "Mother" | "Local Guardian" | "Legal Guardian";

export interface GuardianItem {
  id: string; // e.g. "GRD-001"
  guardianId: string; // e.g. "GRD-001"
  fullName: string;
  relationship: GuardianRelationship;
  phone: string;
  alternatePhone?: string;
  email: string;
  addressLine: string;
  city: string;
  state: string;
  postalCode: string;
  occupation: string;
  company?: string;
  isEmergencyContact: boolean;
  status: "Active" | "Inactive";

  // Linked Students (Many-to-Many IDs)
  studentIds: string[];
  createdAt: string;
}

// -------------------------------------------------------------
// Staff Management Types
// -------------------------------------------------------------
export type StaffEmploymentType = "Full-Time" | "Part-Time" | "Contract" | "Visiting";
export type StaffStatus = "Active" | "On Leave" | "Inactive";

export interface StaffItem {
  id: string; // e.g. "STAFF-001"
  employeeId: string; // e.g. "EMP-CSE-001"
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  designation: string; // e.g. "Professor & HOD", "Assistant Professor"
  departmentId: string;
  departmentName: string;
  employmentType: StaffEmploymentType;
  joiningDate: string;
  qualification: string;
  assignedRoleId: string;
  assignedRoleName: string;
  status: StaffStatus;
  gender: "Male" | "Female" | "Other";
  dob?: string;
  addressLine?: string;
  specialization?: string;
}

// -------------------------------------------------------------
// Timetable Management Types (Phase 3)
// -------------------------------------------------------------
export type TimetableDayOfWeek =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday";

export type PeriodType = "Teaching" | "Break" | "Assembly" | "Lab";

export interface PeriodConfig {
  id: string; // e.g. "p-1", "p-break-1"
  periodNumber: number; // 1, 2, 3, etc. (0 for assembly/breaks)
  label: string; // "Period 1", "Morning Tea Break", "Period 3", "Lunch Break"
  startTime: string; // "09:00" in 24-hr format
  endTime: string; // "09:50" in 24-hr format
  type: PeriodType;
  durationMinutes: number; // 50
  isBreak: boolean;
}

export interface TimetableSlot {
  id: string; // e.g. "tt-slot-001"
  academicYearId: string; // References AcademicYear.id (e.g. "ay-2026-27")
  academicYearName?: string;
  termId: string; // References Term.id (e.g. "term-odd-2026")
  termName?: string;

  courseId: string; // References Course.id
  courseName?: string;
  classId: string; // References ClassItem.id
  className?: string;
  sectionId: string; // References SectionItem.id
  sectionName?: string;

  dayOfWeek: TimetableDayOfWeek;
  periodNumber: number;
  periodConfigId: string; // References PeriodConfig.id
  startTime: string; // "09:00"
  endTime: string; // "09:50"

  // Subject Allocation
  subjectId: string; // References SubjectItem.id
  subjectCode: string; // e.g. "CS501"
  subjectName: string; // e.g. "Database Management Systems"
  subjectType: SubjectType;

  // Faculty Allocation
  teacherId: string; // References StaffItem.id
  teacherName: string; // e.g. "Dr. Rameshwar Sharma"
  teacherEmployeeId?: string; // e.g. "EMP-CSE-001"

  // Venue / Room Allocation
  roomNumber: string; // Reuses SectionItem.roomNumber or campus rooms

  remarks?: string;
  createdAt: string;
}

export interface TimetableConflict {
  type: "TEACHER_CLASH" | "ROOM_CLASH" | "CLASS_PERIOD_CLASH" | "TEACHER_ON_LEAVE";
  severity: "error" | "warning";
  message: string;
  conflictingSlot?: TimetableSlot;
}

export interface TimetableConflictCheckResult {
  hasConflicts: boolean;
  canProceed: boolean; // false if hard error (clash), true if soft warning
  conflicts: TimetableConflict[];
}

// -------------------------------------------------------------
// Attendance Management Types (Phase 3)
// -------------------------------------------------------------
export type AttendanceStatus = "Present" | "Absent" | "Late" | "On Leave";

export interface AttendanceRecord {
  id: string; // e.g. "att-rec-001"
  institutionId: string;
  academicYearId: string;
  academicYearName?: string;
  courseId: string;
  courseName?: string;
  classId: string;
  className?: string;
  sectionId: string;
  sectionName?: string;
  date: string; // YYYY-MM-DD e.g. "2026-11-13"
  session: string; // e.g. "Full Day", "Morning Session", "Period 1", etc.
  studentId: string; // References StudentItem.id (e.g. "stu-01")
  studentUniqueId?: string; // e.g. "STU-2026-001"
  rollNumber: string; // e.g. "24CSE001"
  studentName: string; // e.g. "Aarav Sharma"
  status: AttendanceStatus;
  remarks?: string;
  markedBy: string; // e.g. "Prof. Rajesh Verma" or "Institution Admin"
  markedAt: string; // ISO string
  isCorrected?: boolean;
  lastCorrectedAt?: string;
}

export interface AttendanceCorrectionAudit {
  id: string; // e.g. "att-corr-001"
  attendanceRecordId: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  className?: string;
  sectionName?: string;
  date: string;
  session: string;
  previousStatus: AttendanceStatus;
  updatedStatus: AttendanceStatus;
  reason: string;
  correctedBy: string;
  correctedAt: string;
}

export interface AttendanceThresholdConfig {
  minimumPercentage: number; // e.g. 75
  warningPercentage: number; // e.g. 80
}

export interface StudentAttendanceSummary {
  studentId: string;
  studentUniqueId?: string;
  studentName: string;
  rollNumber: string;
  classId: string;
  className: string;
  sectionId?: string;
  sectionName?: string;
  totalSessions: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  leaveCount: number;
  percentage: number;
  isBelowThreshold: boolean;
  isWarning: boolean;
  guardianName?: string;
  guardianPhone?: string;
  guardianEmail?: string;
}

export interface ClassAttendanceSummary {
  classId: string;
  className: string;
  sectionId?: string;
  sectionName?: string;
  totalEnrolled: number;
  totalSessions: number;
  averagePercentage: number;
  lowAttendanceCount: number;
}

// -------------------------------------------------------------
// Examination Management Types (Phase 3)
// -------------------------------------------------------------
export type ExamType =
  | "Internal Assessment"
  | "Mid-Term"
  | "End-Term"
  | "Semester Examination"
  | "Practical Examination";

export type ExamStatus =
  | "Draft"
  | "Scheduled"
  | "Ongoing"
  | "Completed"
  | "Cancelled";

export type ExamMode = "Theory" | "Practical" | "Both";

export interface ExamHall {
  id: string; // e.g. "hall-01"
  name: string; // e.g. "Exam Hall A - Ramanujan Block"
  code: string; // e.g. "EH-A"
  capacity: number; // e.g. 60
  building: string; // e.g. "Ramanujan Academic Block"
  floor: string; // e.g. "3rd Floor"
  status: "Available" | "Occupied" | "Maintenance";
}

export interface ExamSubjectSlot {
  id: string; // e.g. "slot-exam-001"
  examinationId: string;
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  examDate: string; // YYYY-MM-DD
  startTime: string; // "10:00"
  endTime: string; // "13:00"
  durationMinutes: number; // 180
  maxMarks: number; // 100
  passingMarks: number; // 40
  mode: ExamMode;
  hallId?: string;
  hallName?: string;
  hallCapacity?: number;
  allocatedStudentCount?: number;
  invigilatorId?: string;
  invigilatorName?: string;
  invigilatorEmployeeId?: string;
  invigilatorDepartment?: string;
  instructions?: string;
  status: "Scheduled" | "Completed" | "Cancelled";
}

export interface ExaminationItem {
  id: string; // e.g. "exam-2026-sem5"
  institutionId: string;
  name: string;
  code: string;
  type: ExamType;
  academicYearId: string;
  academicYearName?: string;
  termId?: string;
  termName?: string;
  courseId: string;
  courseName?: string;
  classId: string;
  className?: string;
  sectionId?: string;
  sectionName?: string;
  startDate: string;
  endDate: string;
  description?: string;
  status: ExamStatus;
  slots: ExamSubjectSlot[];
  createdAt: string;
  updatedAt: string;
}

export interface ExamEligibilityOverride {
  id: string;
  examinationId: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  attendancePercentage: number;
  status: "Approved" | "Rejected";
  reason: string;
  authorizedBy: string;
  authorizedAt: string;
}

export interface ExamAuditLog {
  id: string;
  examinationId: string;
  examinationName?: string;
  action: string;
  details: string;
  previousValue?: string;
  newValue?: string;
  reason?: string;
  performedBy: string;
  timestamp: string;
}

export interface ExamConflict {
  type:
    | "CLASS_SCHEDULE_CLASH"
    | "HALL_DOUBLE_BOOKING"
    | "INVIGILATOR_DOUBLE_BOOKING"
    | "HALL_CAPACITY_EXCEEDED"
    | "INVALID_TIME"
    | "DUPLICATE_SUBJECT";
  severity: "error" | "warning";
  message: string;
  conflictingSlotId?: string;
}

// -------------------------------------------------------------
// Phase 4A: Internal Assessment (IA) Management Types
// -------------------------------------------------------------
export type IAAssessmentType =
  | "Continuous Internal Assessment (CIA)"
  | "Unit Test"
  | "Mid-Term Assessment"
  | "Practical Assessment"
  | "Assignment / Project Evaluation"
  | "Quiz / Class Test";

export type IAAssessmentStatus =
  | "Draft"
  | "Scheduled"
  | "Ongoing"
  | "Completed"
  | "Published"
  | "Cancelled";

export type IAComponentType =
  | "Theory / Written Test"
  | "Assignment"
  | "Practical / Lab"
  | "Seminar / Presentation"
  | "Viva Voce"
  | "Class Attendance & Participation"
  | "Project Work";

export interface IAComponent {
  id: string; // e.g. "iac-001"
  name: string; // e.g. "Written Test (Theory)"
  type: IAComponentType;
  maxMarks: number; // e.g. 50
  weightagePercentage: number; // e.g. 50 (%)
  passingMarks: number; // e.g. 20
  dueDate?: string; // YYYY-MM-DD
  instructions?: string;
}

export interface IAStatusHistoryEntry {
  status: IAAssessmentStatus;
  changedAt: string;
  changedBy: string;
  remarks?: string;
}

export interface IAAssessment {
  id: string; // e.g. "ia-2026-001"
  assessmentCode: string; // e.g. "CIA-1-CS501"
  name: string; // e.g. "Continuous Internal Assessment 1"
  description?: string;
  academicYearId: string;
  academicYearName?: string;
  courseId: string;
  courseName?: string;
  classId: string;
  className?: string;
  sectionId?: string; // optional or "ALL"
  sectionName?: string;
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  subjectType?: string;
  teacherId?: string;
  teacherName?: string;
  type: IAAssessmentType;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  totalMaxMarks: number; // e.g. 100
  totalPassingMarks: number; // e.g. 40
  status: IAAssessmentStatus;
  hasMultipleComponents: boolean;
  components: IAComponent[];
  statusHistory: IAStatusHistoryEntry[];
  totalEnrolledStudents?: number;
  marksEnteredCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface IAMetrics {
  totalAssessments: number;
  draftAssessments: number;
  scheduledAssessments: number;
  ongoingAssessments: number;
  completedAssessments: number;
  publishedAssessments: number;
  pendingMarksEntry: number;
}

// -------------------------------------------------------------
// Phase 4B: Student Marks Entry & Assessment Processing Types
// -------------------------------------------------------------
export type StudentMarksStatus = "Present" | "Absent" | "Exempt";

export interface StudentComponentMark {
  componentId: string;
  componentName: string;
  maxMarks: number;
  weightagePercentage: number;
  marksObtained: number | null; // null if Absent or Exempt
  status: StudentMarksStatus;
  remarks?: string;
}

export interface StudentAssessmentRecord {
  id: string; // e.g. "mrk-ia01-stu01"
  assessmentId: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  classId: string;
  className?: string;
  sectionId?: string;
  sectionName?: string;
  componentMarks: StudentComponentMark[];
  totalMarksObtained: number;
  totalMaxMarks: number;
  isPassed: boolean;
  attendanceStatus: StudentMarksStatus;

  // Moderation and Grace Marks
  originalMarks?: number;
  graceMarks?: number;
  moderationReason?: string;
  moderatedBy?: string;
  moderatedAt?: string;
  isModerated?: boolean;

  remarks?: string;
  createdAt: string;
  updatedAt: string;
}

export type MarksSubmissionStatus = "Draft" | "Submitted" | "Locked";

export interface AssessmentMarksSheet {
  id: string; // e.g. "sheet-ia01-secA"
  assessmentId: string;
  assessmentCode: string;
  assessmentName: string;
  academicYearId: string;
  courseId: string;
  classId: string;
  className: string;
  sectionId: string; // "ALL" or specific section ID
  sectionName: string;
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  status: MarksSubmissionStatus;
  submittedBy?: string;
  submittedAt?: string;
  lockedBy?: string;
  lockedAt?: string;
  unlockedBy?: string;
  unlockedAt?: string;
  unlockReason?: string;
  records: StudentAssessmentRecord[];
  createdAt: string;
  updatedAt: string;
}

export interface MarksAuditLog {
  id: string; // e.g. "audit-mrk-001"
  assessmentId: string;
  assessmentName: string;
  sheetId?: string;
  studentId?: string;
  studentName?: string;
  action:
    | "MARKS_SAVED"
    | "MARKS_SUBMITTED"
    | "MARKS_LOCKED"
    | "MARKS_UNLOCKED"
    | "GRACE_MARKS_AWARDED"
    | "MARKS_MODERATED";
  previousMarks?: number;
  updatedMarks?: number;
  reason?: string;
  performedBy: string;
  timestamp: string;
}

export interface MarksEntryMetrics {
  totalStudentsEnrolled: number;
  marksEnteredCount: number;
  pendingMarksCount: number;
  absentStudentsCount: number;
  exemptStudentsCount: number;
  submittedSheetsCount: number;
  lockedSheetsCount: number;
  averageScorePercentage: number;
}

// -------------------------------------------------------------
// Phase 4C: Result Processing, Grade Calculation & Grade Cards
// -------------------------------------------------------------

export interface GradeScaleItem {
  grade: string; // e.g. "O", "A+", "A", "B+", "B", "C", "P", "F", "Ab"
  gradePoint: number; // e.g. 10, 9, 8, 7, 6, 5, 4, 0, 0
  minPercentage: number; // e.g. 90
  maxPercentage: number; // e.g. 100
  description: string; // e.g. "Outstanding", "Excellent", "Fail / Backlog"
  isPassing: boolean; // true for O to P, false for F and Ab
}

export interface GradingScaleConfig {
  id: string; // e.g. "grading-scale-cbcs-10"
  institutionId: string;
  name: string; // e.g. "UGC / AICTE 10-Point CBCS Grading Scale"
  academicYearId?: string;
  gradingType: "10-Point Scale" | "4-Point Scale" | "Percentage Scale" | "Custom";
  grades: GradeScaleItem[];
  iaWeightage: number; // e.g. 40 (%)
  semesterExamWeightage: number; // e.g. 60 (%)
  minIAPassingPercentage: number; // e.g. 40 (%)
  minSemesterExamPassingPercentage: number; // e.g. 40 (%)
  minAggregatePassingPercentage: number; // e.g. 40 (%)
  sgpaScale: number; // e.g. 10.0
  cgpaFormulaDescription: string;
  isActive: boolean;
  updatedAt: string;
}

export type SubjectResultStatus = "Pass" | "Fail" | "Absent" | "Exempt";

export interface StudentSubjectResult {
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  credits: number;

  // Continuous Internal Assessment (IA)
  iaMaxMarks: number;
  iaMarksObtained: number;
  iaPercentage: number;
  iaStatus: "Pass" | "Fail" | "Absent" | "Exempt";
  iaWeightageScore: number; // (iaPercentage * iaWeightage / 100)

  // Semester Examination (End-Term)
  semesterExamMaxMarks: number;
  semesterExamMarksObtained: number;
  semesterExamPercentage: number;
  semesterExamStatus: "Pass" | "Fail" | "Absent" | "Exempt";
  semesterExamWeightageScore: number; // (semesterExamPercentage * semesterExamWeightage / 100)

  // Combined Total
  totalWeightedScore: number; // out of 100
  letterGrade: string; // e.g. "A+"
  gradePoint: number; // e.g. 9
  creditPoints: number; // credits * gradePoint
  finalStatus: SubjectResultStatus; // "Pass", "Fail", "Absent"

  // Moderation / Audit flag
  isModerated?: boolean;
  moderationReason?: string;
}

export type StudentResultClassification =
  | "First Class with Distinction"
  | "First Class"
  | "Second Class"
  | "Pass Class"
  | "Backlog / Needs Re-evaluation"
  | "Failed";

export interface StudentSemesterResult {
  studentId: string;
  studentUniqueId?: string;
  rollNumber: string;
  studentName: string;
  classId: string;
  className?: string;
  sectionId?: string;
  sectionName?: string;

  subjectResults: StudentSubjectResult[];

  // Credits & GPA
  totalCreditsRegistered: number;
  totalCreditsEarned: number;
  totalCreditPoints: number;
  sgpa: number; // semester grade point average
  cgpa: number; // cumulative grade point average
  priorCumulativeCredits?: number;
  priorCumulativePoints?: number;

  // Result Status
  totalSubjects: number;
  passedSubjectsCount: number;
  backlogSubjectsCount: number;
  backlogSubjectCodes: string[];
  classification: StudentResultClassification;
  isAllPassed: boolean;
  hasBacklogs: boolean;

  // Post-publication adjustment flag
  isModifiedPostPublication?: boolean;
  remarks?: string;
}

export type ResultBatchStatus = "Draft" | "Under Review" | "Approved" | "Published";

export interface ResultBatchItem {
  id: string; // e.g. "batch-res-2026-sem5-cse"
  institutionId: string;
  batchName: string; // e.g. "B.Tech CSE - 5th Semester End-Term Results"
  academicYearId: string;
  academicYearName: string;
  courseId: string;
  courseName: string;
  classId: string;
  className: string;
  sectionId: string; // "ALL" or specific section
  sectionName: string;
  semester: number;
  examinationId?: string; // Phase 3 Examination reference
  examinationName?: string;
  gradingScaleId: string;

  // Weightage Snapshot
  iaWeightage: number; // e.g. 40
  semesterExamWeightage: number; // e.g. 60
  minPassingPercentage: number; // e.g. 40

  status: ResultBatchStatus;

  // Review & Publication metadata
  totalStudents: number;
  passedStudents: number;
  backlogStudents: number;
  passPercentage: number;
  batchAverageSgpa: number;

  // Audit & Workflow
  preparedBy: string;
  preparedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  approvedBy?: string;
  approvedAt?: string;
  publishedBy?: string;
  publishedAt?: string;

  // Detailed student results
  studentResults: StudentSemesterResult[];

  createdAt: string;
  updatedAt: string;
}

export interface ResultAuditLog {
  id: string; // e.g. "res-audit-001"
  batchId: string;
  batchName: string;
  studentId?: string;
  studentName?: string;
  rollNumber?: string;
  subjectCode?: string;
  action:
    | "BATCH_PROCESSED"
    | "STATUS_CHANGED"
    | "BATCH_APPROVED"
    | "BATCH_PUBLISHED"
    | "POST_PUBLICATION_CORRECTION"
    | "GRADING_CONFIG_UPDATED";
  previousStatus?: string;
  newStatus?: string;
  previousValue?: string;
  newValue?: string;
  reason: string;
  performedBy: string;
  timestamp: string;
}

export interface ResultMetrics {
  totalBatches: number;
  draftBatches: number;
  underReviewBatches: number;
  approvedBatches: number;
  publishedBatches: number;
  totalStudentsProcessed: number;
  overallPassPercentage: number;
  totalBacklogsActive: number;
}

// -------------------------------------------------------------
// Phase 4D: Promotions & Academic Standing Types
// -------------------------------------------------------------

export type PromotionEligibilityStatus =
  | "Eligible"
  | "Eligible with Backlogs"
  | "Pending Review"
  | "Detained"
  | "Already Promoted";

export interface PromotionPolicy {
  id: string; // e.g. "policy-btech-2026"
  institutionId: string;
  name: string; // e.g. "B.Tech Choice-Based Credit Promotion Policy"
  courseId: string; // "ALL" or specific courseId
  courseName: string;
  minCgpa: number; // e.g. 5.0
  minSgpa: number; // e.g. 4.0
  minEarnedCredits: number; // e.g. 18
  minCreditsPercentage: number; // e.g. 60 (%)
  maxAllowedBacklogs: number; // e.g. 2
  allowBacklogPromotion: boolean; // true
  detentionConditions: {
    maxBacklogsExceeded: boolean;
    belowMinCgpa: boolean;
    belowMinCredits: boolean;
  };
  allowAdministrativeOverride: boolean;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StudentPromotionEvaluation {
  studentId: string;
  studentUniqueId: string;
  rollNumber: string;
  studentName: string;
  academicYearId: string;
  academicYearName: string;
  courseId: string;
  courseName: string;
  classId: string;
  className: string;
  sectionId?: string;
  sectionName?: string;
  currentSemester: number;

  // Academic Result Metrics (from Phase 4C)
  resultBatchId?: string;
  resultStatus?: string; // "Published", "Under Review", "Draft", or "Missing"
  sgpa: number;
  cgpa: number;
  totalCreditsRegistered: number;
  totalCreditsEarned: number;
  activeBacklogsCount: number;
  failedSubjectCodes: string[];

  // Evaluation Outcome
  status: PromotionEligibilityStatus;
  reason: string;
  applicablePolicyId: string;
  applicablePolicyName: string;

  // Administrative Override
  isOverrideAuthorized?: boolean;
  overrideReason?: string;
  overrideAuthorizedBy?: string;
  overrideAuthorizedAt?: string;

  // Proposed Destination Placement
  proposedClassId?: string;
  proposedClassName?: string;
  proposedSectionId?: string;
  proposedSectionName?: string;
  proposedSemester?: number;
}

export type PromotionBatchStatus = "Draft" | "Under Review" | "Approved" | "Executed";

export interface PromotionStudentRecord {
  studentId: string;
  rollNumber: string;
  studentName: string;
  eligibilityStatus: PromotionEligibilityStatus;
  destinationClassId: string;
  destinationClassName: string;
  destinationSectionId: string;
  destinationSectionName: string;
  destinationSemester: number;
  isOverride: boolean;
  overrideReason?: string;
  sgpaAtPromotion: number;
  cgpaAtPromotion: number;
  carriedBacklogCodes: string[];
}

export interface PromotionBatchItem {
  id: string; // e.g. "prom-batch-2026-cse3"
  institutionId: string;
  batchName: string; // e.g. "B.Tech CSE - Year 3 to Year 4 Promotion Cohort"

  sourceAcademicYearId: string;
  sourceAcademicYearName: string;
  destinationAcademicYearId: string;
  destinationAcademicYearName: string;

  courseId: string;
  courseName: string;
  sourceClassId: string;
  sourceClassName: string;
  sourceSectionId: string; // "ALL" or specific
  sourceSectionName: string;

  destinationClassId: string;
  destinationClassName: string;
  destinationSectionId: string;
  destinationSectionName: string;
  destinationSemester: number;

  policyId: string;
  policyName: string;

  status: PromotionBatchStatus;

  // Statistics
  totalStudentsEvaluated: number;
  promotedCount: number;
  promotedWithBacklogsCount: number;
  detainedCount: number;
  overrideCount: number;

  studentRecords: PromotionStudentRecord[];

  // Workflow Metadata
  createdBy: string;
  createdAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  approvedBy?: string;
  approvedAt?: string;
  executedBy?: string;
  executedAt?: string;
  rejectionReason?: string;
  remarks?: string;

  updatedAt: string;
}

export interface PromotionHistoryRecord {
  id: string; // e.g. "prom-hist-001"
  batchId?: string;
  batchName?: string;
  studentId: string;
  studentUniqueId?: string;
  rollNumber: string;
  studentName: string;

  // Previous Placement
  previousAcademicYearId: string;
  previousAcademicYearName: string;
  previousClassId: string;
  previousClassName: string;
  previousSectionId?: string;
  previousSectionName?: string;
  previousSemester: number;

  // New Placement
  newAcademicYearId: string;
  newAcademicYearName: string;
  newClassId: string;
  newClassName: string;
  newSectionId?: string;
  newSectionName?: string;
  newSemester: number;

  promotionDate: string;
  decision: "PROMOTED_REGULAR" | "PROMOTED_WITH_BACKLOGS" | "PROMOTED_BY_OVERRIDE" | "DETAINED";
  sgpaAtPromotion: number;
  cgpaAtPromotion: number;
  carriedBacklogCodes: string[];
  authorizedBy: string;
  remarks?: string;
}

export interface PromotionAuditLog {
  id: string; // e.g. "prom-audit-001"
  batchId?: string;
  batchName?: string;
  studentId?: string;
  studentName?: string;
  action:
    | "BATCH_CREATED"
    | "STATUS_CHANGED"
    | "BATCH_APPROVED"
    | "BATCH_REJECTED"
    | "PROMOTION_EXECUTED"
    | "ADMIN_OVERRIDE_GRANTED"
    | "POLICY_CONFIG_UPDATED"
    | "SECTION_REALLOCATED";
  previousStatus?: string;
  newStatus?: string;
  details: string;
  reason?: string;
  performedBy: string;
  timestamp: string;
}

export interface PromotionMetrics {
  totalEligibleStudents: number;
  studentsEligibleForPromotion: number;
  studentsWithBacklogs: number;
  studentsDetained: number;
  studentsPendingReview: number;
  studentsAlreadyPromoted: number;
  totalPromotionBatches: number;
  executedBatches: number;
}

// =========================================================================
// PHASE 4E: CERTIFICATE & DEGREE MANAGEMENT TYPES
// =========================================================================

export type CertificateCategory = "Academic" | "Administrative";

export type CertificateType =
  | "Bonafide Certificate"
  | "Study Certificate"
  | "Transfer Certificate (TC)"
  | "Character Certificate"
  | "Course Completion Certificate"
  | "Provisional Degree Certificate"
  | "Migration Certificate"
  | "Medium of Instruction Certificate"
  | "Transcript / Academic Record"
  | "Semester Grade Card"
  | "Student Conduct Certificate"
  | "Fee Clearance Certificate"
  | "Hostel Clearance Certificate"
  | "Custom Certificate";

export type CertificatePriority = "Normal" | "Urgent" | "Immediate";

export type CertificateApplicationStatus =
  | "Draft"
  | "Submitted"
  | "Under Review"
  | "Additional Info Required"
  | "Approved"
  | "Rejected"
  | "Generated"
  | "Issued"
  | "Cancelled";

export type CertificateStatus =
  | "Active"
  | "Issued"
  | "Reissued / Superseded"
  | "Revoked / Cancelled";

export interface EligibilityCheckItem {
  checkId: string;
  name: string;
  status: "PASSED" | "FAILED" | "PENDING_VERIFICATION" | "NOT_INTEGRATED";
  details: string;
  isMandatory: boolean;
  canOverride: boolean;
  overridden?: boolean;
  overrideReason?: string;
  overriddenBy?: string;
  overriddenAt?: string;
}

export interface EligibilityEvaluationResult {
  isEligible: boolean;
  canIssue: boolean;
  checks: EligibilityCheckItem[];
  summary: string;
  hasMissingIntegration: boolean;
}

export interface CertificateTemplate {
  id: string; // e.g. "tpl-bc"
  type: CertificateType;
  title: string;
  category: CertificateCategory;
  prefix: string; // e.g. "BC"
  isEnabled: boolean;
  requiresFeeClearance: boolean;
  requiresHostelClearance: boolean;
  requiresAcademicPass: boolean;
  requiresFinalSemester: boolean;
  requiresZeroBacklogs: boolean;
  customBodyTemplate?: string;
  authorizedSignatoryTitle: string; // e.g. "Principal & Head of Institution"
  validityPeriodMonths?: number; // e.g. 12 (months) or undefined for permanent
}

export interface CertificateNumberConfig {
  prefix: string; // e.g. "SST"
  useAcademicYear: boolean;
  separator: string; // "/"
  sequencePadding: number; // 4 -> 0001
  typeSequences: Record<string, number>; // { BC: 5, TC: 2, ... }
}

export interface CertificateApplicationItem {
  id: string; // e.g. "cert-app-001"
  applicationNumber: string; // e.g. "APP-2026-0001"
  studentId: string;
  studentUniqueId: string;
  rollNumber: string;
  studentName: string;
  gender: "Male" | "Female" | "Other";
  fatherOrGuardianName: string;
  dob: string;
  courseId: string;
  courseName: string;
  departmentId: string;
  departmentName: string;
  academicYearId: string;
  academicYearName: string;
  classId: string;
  className: string;
  sectionName?: string;
  batch: string; // e.g. "2024-2028"
  studentStatus: StudentStatus;

  certificateType: CertificateType;
  purpose: string;
  supportingDocuments: string[];
  remarks?: string;
  priority: CertificatePriority;
  status: CertificateApplicationStatus;

  requestDate: string; // "YYYY-MM-DD"
  requestedBy: string; // "Student" | "Institution Admin" | "Staff"

  // Eligibility Checks
  eligibilityResult: EligibilityEvaluationResult;

  // Review & Approval details
  reviewerId?: string;
  reviewerName?: string;
  reviewedAt?: string;
  reviewNotes?: string;

  approverId?: string;
  approverName?: string;
  approvedAt?: string;

  rejectionReason?: string;
  additionalInfoNotes?: string;
  cancellationReason?: string;

  // Generated certificate link
  generatedCertificateId?: string;
  generatedCertificateNumber?: string;
  issuedAt?: string;
}

export interface IssuedCertificateItem {
  id: string; // e.g. "cert-iss-001"
  certificateNumber: string; // e.g. "SST/BC/2026/0001"
  applicationId: string;
  applicationNumber: string;
  verificationCode: string; // unique alphanumeric hash e.g. "SST-VER-89E41B"

  certificateType: CertificateType;
  title: string;
  category: CertificateCategory;

  // Student details snapshot at issuance
  studentId: string;
  studentUniqueId: string;
  rollNumber: string;
  studentName: string;
  fatherOrGuardianName: string;
  gender: "Male" | "Female" | "Other";
  dob: string;
  courseName: string;
  departmentName: string;
  academicYearName: string;
  className: string;
  sectionName?: string;
  batch: string;

  // Academic standings snapshot
  cgpa?: number;
  sgpa?: number;
  totalCreditsEarned?: number;
  conductStanding?: string; // "Good Conduct" | "Exemplary"

  // Institutional details snapshot
  institutionName: string;
  institutionCode: string;
  affiliation: string;
  accreditation: string;
  institutionAddress: string;
  institutionEmail: string;
  institutionPhone: string;
  institutionWebsite: string;

  // Certificate text body & metadata
  bodyText: string;
  purpose: string;
  issueDate: string;
  validUntil?: string;
  signatoryName: string;
  signatoryTitle: string;

  status: CertificateStatus; // "Active" | "Issued" | "Reissued / Superseded" | "Revoked / Cancelled"

  // Reissue / Correction tracking
  isReissue: boolean;
  previousCertificateId?: string;
  previousCertificateNumber?: string;
  reissueReason?: string;
  replacementCertificateId?: string;

  // Revocation details
  revokedAt?: string;
  revokedBy?: string;
  revocationReason?: string;

  issuedBy: string;
  createdAt: string;
}

export interface CertificateAuditLog {
  id: string; // e.g. "cert-audit-001"
  applicationId?: string;
  certificateNumber?: string;
  studentId?: string;
  studentName?: string;
  action:
    | "APPLICATION_CREATED"
    | "STATUS_TRANSITIONED"
    | "APPLICATION_APPROVED"
    | "APPLICATION_REJECTED"
    | "ADDITIONAL_INFO_REQUESTED"
    | "ELIGIBILITY_OVERRIDDEN"
    | "CERTIFICATE_GENERATED"
    | "CERTIFICATE_ISSUED"
    | "CERTIFICATE_REISSUED"
    | "CERTIFICATE_REVOKED"
    | "TEMPLATE_UPDATED"
    | "NUMBERING_UPDATED";
  details: string;
  reason?: string;
  performedBy: string;
  timestamp: string;
}

export interface CertificateMetrics {
  totalApplications: number;
  pendingApplications: number;
  underReviewApplications: number;
  approvedApplications: number;
  rejectedApplications: number;
  certificatesGenerated: number;
  certificatesIssued: number;
  certificatesRevoked: number;
}
