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
      return NextResponse.json({ success: false, error: "Missing student ID" }, { status: 400 });
    }

    const { studentId } = await authorizeStudentOrParentAccess(session, requestedStudentId);

    const student = await db.student.findUnique({
      where: { id: studentId },
      include: {
        enrollments: {
          include: { course: true },
          orderBy: { enrolledDate: "desc" },
        },
      },
    });

    if (!student) {
      return NextResponse.json({ success: false, error: "Student not found" }, { status: 404 });
    }

    const activeEnrollment =
      student.enrollments.find((e) => e.status === "ACTIVE") || student.enrollments[0];

    // 1. Upcoming exam schedules and timetables
    const examSchedules = await db.examSchedule.findMany({
      where: {
        institutionId: session.institutionId,
        semester: student.currentSemester,
        isPublished: true,
      },
      include: {
        slots: { orderBy: { examDate: "asc" } },
        admitCards: { where: { studentId } },
      },
    });

    // 2. Hall Ticket (Admit card) details
    const admitCard = await db.examAdmitCard.findFirst({
      where: {
        studentId,
        institutionId: session.institutionId,
      },
      include: {
        examSchedule: {
          include: { slots: { orderBy: { examDate: "asc" } } },
        },
      },
      orderBy: { generatedAt: "desc" },
    });

    // 3. Past examination results
    const results = await db.examResult.findMany({
      where: {
        studentId,
        institutionId: session.institutionId,
      },
      include: {
        subject: true,
        examSchedule: true,
      },
      orderBy: { publishedAt: "desc" },
    });

    const totalCredits = results.reduce((sum, r) => sum + r.credits, 0);
    const totalWeightedPoints = results.reduce((sum, r) => sum + r.gradePoint * r.credits, 0);
    const cgpa = totalCredits > 0 ? (totalWeightedPoints / totalCredits).toFixed(2) : "0.00";

    const supplementaryResults = results.filter((r) => r.isSupplementary || !r.isPassed);

    return NextResponse.json({
      success: true,
      data: {
        schedules: examSchedules,
        admitCard: admitCard
          ? {
              id: admitCard.id,
              hallTicketNo: admitCard.hallTicketNo,
              isEligible: admitCard.isEligible,
              qrCodeData: admitCard.qrCodeData,
              examTitle: admitCard.examSchedule.title,
              startDate: admitCard.examSchedule.startDate,
              endDate: admitCard.examSchedule.endDate,
              slots: admitCard.examSchedule.slots,
              student: {
                name: `${student.firstName} ${student.lastName}`,
                rollNumber: student.rollNumber,
                admissionNumber: student.admissionNumber,
                course: activeEnrollment?.course?.name || "",
                semester: student.currentSemester,
              },
            }
          : null,
        results: results.map((r) => ({
          id: r.id,
          examName: r.examSchedule.title,
          subjectCode: r.subject.code,
          subjectName: r.subject.name,
          internalMarks: r.internalMarks,
          externalMarks: r.externalMarks,
          totalMarks: r.totalMarks,
          grade: r.grade,
          gradePoint: r.gradePoint,
          credits: r.credits,
          isPassed: r.isPassed,
          isSupplementary: r.isSupplementary,
          publishedAt: r.publishedAt,
        })),
        cgpa,
        supplementaryExams: supplementaryResults,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to fetch examinations" },
      { status: err.name === "ForbiddenError" ? 403 : 500 }
    );
  }
}

