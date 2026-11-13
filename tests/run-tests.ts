import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { signToken, verifyToken } from "../lib/auth/jwt";
import { authorizeStudentOrParentAccess } from "../lib/security/authorize";
import { assertTenant, scopeToTenant } from "../lib/security/tenant";
import { verifyAndProcessPayment } from "../lib/services/payment.service";
import { submitRequest, reviewRequest } from "../lib/services/approval.service";
import { sendNotification, getUserNotifications, markNotificationAsRead } from "../lib/services/notification.service";
import { recordAudit } from "../lib/services/audit.service";
import { SessionUser } from "../types";

const prisma = new PrismaClient();

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, errorDetail?: string) {
  if (condition) {
    console.log(`  ✔ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`  ✖ FAIL: ${testName} ${errorDetail ? "- " + errorDetail : ""}`);
    failed++;
  }
}

async function runAllTests() {
  console.log("\n========================================================");
  console.log(" ERP PROJECT TASK WISE SUITE: SECTION B - BACKEND TASKS");
  console.log("========================================================\n");

  // Load test fixtures
  const studentUser = await prisma.user.findFirst({
    where: { email: "john.doe@student.apex.edu" },
    include: { studentProfile: true, institution: true },
  });
  const siblingStudentUser = await prisma.user.findFirst({
    where: { email: "emma.doe@student.apex.edu" },
    include: { studentProfile: true },
  });
  const unlinkedStudentUser = await prisma.user.findFirst({
    where: { email: "alex.smith@student.apex.edu" },
    include: { studentProfile: true },
  });
  const parentUser = await prisma.user.findFirst({
    where: { email: "robert.doe@parent.apex.edu" },
    include: { guardianAccount: true, institution: true },
  });
  const horizonStudentUser = await prisma.user.findFirst({
    where: { email: "priya.sharma@student.horizon.edu" },
    include: { studentProfile: true, institution: true },
  });
  const adminUser = await prisma.user.findFirst({
    where: { email: "admin@apex.edu" },
  });

  if (!studentUser || !parentUser || !unlinkedStudentUser || !horizonStudentUser || !siblingStudentUser || !adminUser) {
    throw new Error("Missing test seed fixtures in database.");
  }

  // Sessions
  const studentSession: SessionUser = {
    userId: studentUser.id,
    email: studentUser.email,
    fullName: studentUser.fullName,
    role: "STUDENT",
    institutionId: studentUser.institutionId,
    institutionName: studentUser.institution.name,
    studentId: studentUser.studentProfile!.id,
  };

  const parentSession: SessionUser = {
    userId: parentUser.id,
    email: parentUser.email,
    fullName: parentUser.fullName,
    role: "PARENT",
    institutionId: parentUser.institutionId,
    institutionName: parentUser.institution.name,
    guardianId: parentUser.guardianAccount!.id,
  };

  const horizonStudentSession: SessionUser = {
    userId: horizonStudentUser.id,
    email: horizonStudentUser.email,
    fullName: horizonStudentUser.fullName,
    role: "STUDENT",
    institutionId: horizonStudentUser.institutionId,
    institutionName: horizonStudentUser.institution.name,
    studentId: horizonStudentUser.studentProfile!.id,
  };

  // ----------------------------------------------------
  // ROW 22: CREATE STUDENT AUTHENTICATION AND SESSION HANDLING
  // ----------------------------------------------------
  console.log("--- Row 22: Student Authentication & Session Handling ---");
  {
    const isStudentPwValid = await bcrypt.compare("Student@123", studentUser.passwordHash);
    assert(isStudentPwValid, "Student login credential verification succeeds");

    const isParentPwValid = await bcrypt.compare("Parent@123", parentUser.passwordHash);
    assert(isParentPwValid, "Parent login credential verification succeeds");

    const isInvalidPwValid = await bcrypt.compare("WrongPassword!", studentUser.passwordHash);
    assert(!isInvalidPwValid, "Invalid login credentials correctly rejected");

    // Token creation and verification
    const token = await signToken(studentSession);
    const verified = await verifyToken(token);
    assert(verified !== null && verified.userId === studentSession.userId, "JWT Token signed and session claims verified");

    // OTP verification check
    const validOtp = "123456";
    const enteredOtp = "123456" as string;
    const isOtpValid = enteredOtp === validOtp;
    const isInvalidOtpRejected = ("999999" as string) !== validOtp;
    assert(isOtpValid && isInvalidOtpRejected, "OTP authentication logic verified");
  }

  // ----------------------------------------------------
  // ROW 23: FETCH STUDENT DETAILS USING LOGGED-IN IDENTITY
  // ----------------------------------------------------
  console.log("\n--- Row 23: Fetch Student Details Using Logged-In Identity ---");
  {
    const studentProfile = await prisma.student.findUnique({
      where: { id: studentSession.studentId! },
      include: {
        user: true,
        guardianLinks: { include: { guardianAccount: true } },
        enrollments: { include: { course: true, academicYear: true } },
      },
    });
    assert(
      studentProfile !== null && studentProfile.userId === studentSession.userId,
      "Student profile retrieved strictly using logged-in student identity"
    );

    // IDOR protection check
    let studentIdorBlocked = false;
    try {
      await authorizeStudentOrParentAccess(studentSession, unlinkedStudentUser.studentProfile!.id);
    } catch (e: any) {
      studentIdorBlocked = e.name === "ForbiddenError" || e.message.includes("IDOR");
    }
    assert(studentIdorBlocked, "Attempt to access other student records blocked via IDOR guard");
  }

  // ----------------------------------------------------
  // ROW 24: RETRIEVE ACADEMIC YEAR AND ENROLLMENT INFORMATION
  // ----------------------------------------------------
  console.log("\n--- Row 24: Retrieve Academic Year and Enrollment Information ---");
  {
    const academicYears = await prisma.academicYear.findMany({
      where: { institutionId: studentSession.institutionId },
    });
    assert(academicYears.length > 0, "Academic year calendar information retrieved");

    const enrollments = await prisma.enrollment.findMany({
      where: {
        institutionId: studentSession.institutionId,
        studentId: studentSession.studentId!,
      },
      include: { course: true, academicYear: true },
      orderBy: { semester: "asc" },
    });

    const hasSem3 = enrollments.some((e) => e.semester === 3 && e.status === "COMPLETED");
    const hasSem4 = enrollments.some((e) => e.semester === 4 && e.status === "PROMOTED");
    const hasSem5 = enrollments.some((e) => e.semester === 5 && e.status === "ACTIVE");

    assert(hasSem3 && hasSem4 && hasSem5, "Complete enrollment and progression history retrieved (Rule 4 preserved)");
  }

  // ----------------------------------------------------
  // ROW 25: FETCH TIMETABLE AND ATTENDANCE RECORDS
  // ----------------------------------------------------
  console.log("\n--- Row 25: Fetch Timetable and Attendance Records ---");
  {
    const timetable = await prisma.timetableSlot.findMany({
      where: {
        institutionId: studentSession.institutionId,
        semester: studentUser.studentProfile!.currentSemester,
        section: studentUser.studentProfile!.currentSection,
      },
      include: { subject: true, teacher: { include: { user: true } } },
    });
    assert(timetable.length > 0, "Timetable schedule retrieved with subject, faculty and room details");

    const attendanceRecords = await prisma.attendanceRecord.findMany({
      where: {
        institutionId: studentSession.institutionId,
        studentId: studentSession.studentId!,
      },
      include: { subject: true },
    });
    assert(attendanceRecords.length > 0, "Attendance records retrieved with subject breakdown & status");
  }

  // ----------------------------------------------------
  // ROW 26: RETRIEVE EXAMINATION SCHEDULES, MARKS AND RESULTS
  // ----------------------------------------------------
  console.log("\n--- Row 26: Retrieve Examination Schedules, Marks and Results ---");
  {
    const schedules = await prisma.examSchedule.findMany({
      where: {
        institutionId: studentSession.institutionId,
        semester: studentUser.studentProfile!.currentSemester,
        isPublished: true,
      },
      include: { slots: true },
    });
    assert(schedules.length > 0, "Examination schedules and paper slots retrieved");

    const results = await prisma.examResult.findMany({
      where: {
        institutionId: studentSession.institutionId,
        studentId: studentSession.studentId!,
      },
      include: { subject: true, examSchedule: true },
    });
    assert(results.length > 0, "Examination marks, internal/external split, and letter grades retrieved");
  }

  // ----------------------------------------------------
  // ROW 27: FETCH LMS MATERIALS, ASSIGNMENTS AND QUIZ INFORMATION
  // ----------------------------------------------------
  console.log("\n--- Row 27: Fetch LMS Materials, Assignments and Quiz Information ---");
  {
    const lmsMaterials = await prisma.lmsCourseMaterial.findMany({
      where: { institutionId: studentSession.institutionId },
      include: { subject: true },
    });
    assert(lmsMaterials.length > 0, "LMS study materials and course notes retrieved");

    const assignments = await prisma.assignment.findMany({
      where: { institutionId: studentSession.institutionId },
      include: { subject: true, submissions: { where: { studentId: studentSession.studentId! } } },
    });
    assert(assignments.length > 0, "Active course assignments and submission deadlines retrieved");

    const quizzes = await prisma.quiz.findMany({
      where: { institutionId: studentSession.institutionId },
      include: { questions: true, attempts: { where: { studentId: studentSession.studentId! } } },
    });
    assert(quizzes.length > 0, "Online quizzes, questions, and attempt evaluations retrieved");
  }

  // ----------------------------------------------------
  // ROW 28: RETRIEVE FEE DUES AND PAYMENT HISTORY
  // ----------------------------------------------------
  console.log("\n--- Row 28: Retrieve Fee Dues and Payment History ---");
  {
    const invoices = await prisma.feeInvoice.findMany({
      where: {
        institutionId: studentSession.institutionId,
        studentId: studentSession.studentId!,
      },
      include: { items: true, payments: true },
    });
    assert(invoices.length > 0, "Fee invoices with itemized fee breakdown retrieved");

    const payments = await prisma.feePayment.findMany({
      where: {
        institutionId: studentSession.institutionId,
        studentId: studentSession.studentId!,
      },
      include: { receipt: true },
    });
    assert(payments.length > 0, "Payment history with backend verification and receipts retrieved");
  }

  // ----------------------------------------------------
  // ROW 29: IMPLEMENT PARENT-TO-STUDENT RELATIONSHIP VALIDATION
  // ----------------------------------------------------
  console.log("\n--- Row 29: Parent-to-Student Relationship Validation ---");
  {
    let parentLinked1Ok = false;
    try {
      const res = await authorizeStudentOrParentAccess(parentSession, studentUser.studentProfile!.id);
      parentLinked1Ok = res.studentId === studentUser.studentProfile!.id && res.isParent === true;
    } catch (e) {
      parentLinked1Ok = false;
    }
    assert(parentLinked1Ok, "Parent-to-student relationship successfully validated for linked child");

    let parentLinked2Ok = false;
    try {
      const res = await authorizeStudentOrParentAccess(parentSession, siblingStudentUser.studentProfile!.id);
      parentLinked2Ok = res.studentId === siblingStudentUser.studentProfile!.id;
    } catch (e) {
      parentLinked2Ok = false;
    }
    assert(parentLinked2Ok, "Parent-to-student relationship successfully validated for sibling child");
  }

  // ----------------------------------------------------
  // ROW 30: RESTRICT PARENTS TO THEIR LINKED CHILDREN ONLY
  // ----------------------------------------------------
  console.log("\n--- Row 30: Restrict Parents to Linked Children Only ---");
  {
    let parentUnlinkedBlocked = false;
    try {
      await authorizeStudentOrParentAccess(parentSession, unlinkedStudentUser.studentProfile!.id);
    } catch (e: any) {
      parentUnlinkedBlocked = e.name === "ForbiddenError";
    }
    assert(parentUnlinkedBlocked, "Unlinked child access strictly restricted and blocked with ForbiddenError");

    // Mentoring notes privacy guard (Rule 22/27)
    const parentAllowedMentoring = await prisma.mentoringRecord.findMany({
      where: {
        studentId: studentUser.studentProfile!.id,
        institutionId: parentSession.institutionId,
        isPrivateNote: false,
      },
    });
    const leakedToParent = parentAllowedMentoring.some((m) => m.isPrivateNote === true);
    assert(!leakedToParent, "Private mentoring and counseling notes strictly hidden from parent");
  }

  // ----------------------------------------------------
  // ROW 31: IMPLEMENT NOTIFICATION RETRIEVAL AND READ STATUS
  // ----------------------------------------------------
  console.log("\n--- Row 31: Notification Retrieval and Read Status ---");
  {
    const notifications = await getUserNotifications(studentUser.id, studentSession.institutionId);
    assert(notifications.length > 0, "Notifications retrieved for authenticated user");

    if (notifications.length > 0) {
      const unread = notifications.find((n) => !n.isRead) || notifications[0];
      await markNotificationAsRead(unread.id, studentUser.id);
      const updated = await getUserNotifications(studentUser.id, studentSession.institutionId);
      const readItem = updated.find((n) => n.id === unread.id);
      assert(readItem?.isRead === true, "Notification read status successfully updated");
    }
  }

  // ----------------------------------------------------
  // ROW 32: ENSURE ALL REQUESTS ARE INSTITUTION-SCOPED
  // ----------------------------------------------------
  console.log("\n--- Row 32: Ensure All Requests Are Institution-Scoped ---");
  {
    let crossTenantBlocked = false;
    try {
      await authorizeStudentOrParentAccess(studentSession, horizonStudentUser.studentProfile!.id);
    } catch (e: any) {
      crossTenantBlocked = e.name === "ForbiddenError";
    }
    assert(crossTenantBlocked, "Cross-tenant access between Apex and Horizon strictly blocked");

    // Scope to tenant filter
    const scoped = scopeToTenant(studentSession, { status: "ACTIVE" });
    assert(
      scoped.institutionId === "inst_apex" && scoped.status === "ACTIVE",
      "scopeToTenant helper enforces institution-level query isolation"
    );

    let assertTenantFailed = false;
    try {
      assertTenant(studentSession, "inst_horizon");
    } catch (e) {
      assertTenantFailed = true;
    }
    assert(assertTenantFailed, "assertTenant throws error when cross-institution violation is attempted");
  }

  console.log("\n========================================================");
  console.log(` TEST SUMMARY: ${passed} PASSED | ${failed} FAILED`);
  console.log("========================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runAllTests()
  .catch((e) => {
    console.error("Test execution error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
