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
        institution: { select: { name: true, code: true } },
        enrollments: {
          include: {
            academicYear: true,
            course: true,
          },
          orderBy: { semester: "desc" },
        },
      },
    });

    if (!student) {
      return NextResponse.json({ success: false, error: "Student not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        institution: student.institution,
        studentId: student.id,
        rollNumber: student.rollNumber,
        admissionNumber: student.admissionNumber,
        currentSemester: student.currentSemester,
        currentSection: student.currentSection,
        status: student.status,
        enrollmentsHistory: student.enrollments.map((en) => ({
          id: en.id,
          academicYear: en.academicYear.name,
          courseCode: en.course.code,
          courseName: en.course.name,
          semester: en.semester,
          section: en.section,
          status: en.status,
          gradePointAverage: en.gradePointAverage,
          promotionRemarks: en.promotionRemarks,
          enrolledDate: en.enrolledDate,
          completedDate: en.completedDate,
        })),
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to fetch academic history" },
      { status: err.name === "ForbiddenError" ? 403 : 500 }
    );
  }
}
