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
        user: { select: { email: true, phone: true, avatarUrl: true, fullName: true } },
        documents: true,
        guardianLinks: {
          include: {
            guardianAccount: {
              include: { user: { select: { email: true, phone: true } } },
            },
          },
        },
        enrollments: {
          include: { course: true, academicYear: true },
          orderBy: { semester: "desc" },
        },
      },
    });

    if (!student) {
      return NextResponse.json({ success: false, error: "Student not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: student,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to fetch profile" },
      { status: err.name === "ForbiddenError" ? 403 : 500 }
    );
  }
}
