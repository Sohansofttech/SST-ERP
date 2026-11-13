import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { authorizeStudentOrParentAccess } from "@/lib/security/authorize";
import db from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    const url = new URL(req.url);
    const requestedStudentId = url.searchParams.get("studentId") || session.studentId;

    if (!requestedStudentId) {
      return NextResponse.json(
        { success: false, error: "No student ID provided or associated." },
        { status: 400 }
      );
    }

    const { studentId } = await authorizeStudentOrParentAccess(session, requestedStudentId);

    // 1. Student details and active enrollment
    const student = await db.student.findUnique({
      where: { id: studentId },
      include: {
        enrollments: {
          where: { status: "ACTIVE" },
          include: { course: true, academicYear: true },
        },
      },
    });

    if (!student) {
      return NextResponse.json({ success: false, error: "Student not found" }, { status: 404 });
    }

    // 2. Attendance summary
    const allAttendance = await db.attendanceRecord.findMany({
      where: { studentId, institutionId: session.institutionId },
      include: { subject: true },
    });

    const totalClasses = allAttendance.length;
    const attendedClasses = allAttendance.filter((a) => a.status === "PRESENT" || a.status === "EXCUSED").length;
    const attendancePercentage = totalClasses > 0 ? Math.round((attendedClasses / totalClasses) * 100) : 100;

    // 3. Timetable for current day
    const currentDay = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"][new Date().getDay()];
    const todaySlots = await db.timetableSlot.findMany({
      where: {
        institutionId: session.institutionId,
        semester: student.currentSemester,
        section: student.currentSection,
        dayOfWeek: currentDay === "SUNDAY" ? "MONDAY" : currentDay,
      },
      include: {
        subject: true,
        teacher: { include: { user: true } },
      },
      orderBy: { startTime: "asc" },
    });

    // 4. Fees summary
    const invoices = await db.feeInvoice.findMany({
      where: { studentId, institutionId: session.institutionId },
    });
    const totalOutstanding = invoices.reduce((acc, inv) => acc + inv.outstandingAmount, 0);
    const totalPaid = invoices.reduce((acc, inv) => acc + inv.paidAmount, 0);

    // 5. Upcoming Examinations
    const upcomingExams = await db.examSchedule.findMany({
      where: {
        institutionId: session.institutionId,
        semester: student.currentSemester,
        isPublished: true,
      },
      include: {
        slots: { orderBy: { examDate: "asc" } },
        admitCards: { where: { studentId } },
      },
      take: 2,
    });

    // 6. Active assignments
    const activeAssignments = await db.assignment.findMany({
      where: {
        institutionId: session.institutionId,
        subject: { semester: student.currentSemester },
      },
      include: {
        subject: true,
        submissions: { where: { studentId } },
      },
      orderBy: { dueDate: "asc" },
      take: 5,
    });

    // 7. Recent notifications
    const notifications = await db.notificationRecipient.findMany({
      where: {
        userId: session.userId,
        isRead: false,
      },
      include: { notification: true },
      orderBy: { notification: { createdAt: "desc" } },
      take: 5,
    });

    // 8. Recent Exam Results (STU-FE-02)
    const recentResults = await db.examResult.findMany({
      where: { studentId, institutionId: session.institutionId },
      include: { subject: true },
      orderBy: { publishedAt: "desc" },
      take: 4,
    });

    return NextResponse.json({
      success: true,
      data: {
        student: {
          id: student.id,
          firstName: student.firstName,
          lastName: student.lastName,
          rollNumber: student.rollNumber,
          admissionNumber: student.admissionNumber,
          currentSemester: student.currentSemester,
          currentSection: student.currentSection,
          course: student.enrollments[0]?.course?.name || "B.Tech CSE",
          academicYear: student.enrollments[0]?.academicYear?.name || "2025-2026",
        },
        attendanceSummary: {
          totalClasses,
          attendedClasses,
          attendancePercentage,
        },
        todaySchedule: todaySlots.map((s) => ({
          id: s.id,
          startTime: s.startTime,
          endTime: s.endTime,
          roomNumber: s.roomNumber,
          subjectCode: s.subject.code,
          subjectName: s.subject.name,
          teacherName: s.teacher?.user.fullName || "Faculty",
        })),
        feeSummary: {
          totalOutstanding,
          totalPaid,
          hasDue: totalOutstanding > 0,
        },
        upcomingExams: upcomingExams.map((e) => ({
          id: e.id,
          title: e.title,
          examType: e.examType,
          startDate: e.startDate,
          endDate: e.endDate,
          slotsCount: e.slots.length,
          hasHallTicket: e.admitCards.length > 0,
        })),
        assignments: activeAssignments.map((a) => ({
          id: a.id,
          title: a.title,
          subjectName: a.subject.name,
          dueDate: a.dueDate,
          isSubmitted: a.submissions.length > 0,
          status: a.submissions[0]?.status || "PENDING",
        })),
        notifications: notifications.map((n) => ({
          id: n.id,
          title: n.notification.title,
          message: n.notification.message,
          category: n.notification.category,
          createdAt: n.notification.createdAt,
        })),
        recentResults: recentResults.map((r) => ({
          id: r.id,
          subjectCode: r.subject.code,
          subjectName: r.subject.name,
          grade: r.grade,
          totalMarks: r.totalMarks,
          isPassed: r.isPassed,
        })),
        cgpa: 8.85,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to load dashboard" },
      { status: err.name === "ForbiddenError" ? 403 : 500 }
    );
  }
}

