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
      select: { currentSemester: true },
    });

    if (!student) {
      return NextResponse.json({ success: false, error: "Student not found" }, { status: 404 });
    }

    const electives = await db.electiveCourse.findMany({
      where: {
        institutionId: session.institutionId,
        semester: student.currentSemester,
      },
      include: {
        subject: true,
        selections: { where: { studentId } },
      },
    });

    return NextResponse.json({
      success: true,
      data: electives.map((e) => ({
        id: e.id,
        subjectCode: e.subject.code,
        subjectName: e.subject.name,
        credits: e.subject.credits,
        capacity: e.capacity,
        enrolledCount: e.enrolledCount,
        description: e.description,
        selectionStatus: e.selections[0]?.status || "AVAILABLE",
      })),
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: err.name === "ForbiddenError" ? 403 : 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    if (session.role !== "STUDENT" || !session.studentId) {
      return NextResponse.json({ success: false, error: "Only students may choose electives" }, { status: 403 });
    }

    const { electiveCourseId } = await req.json();
    if (!electiveCourseId) {
      return NextResponse.json({ success: false, error: "Elective course ID required" }, { status: 400 });
    }

    const selection = await db.electiveSelection.upsert({
      where: {
        studentId_electiveCourseId: {
          studentId: session.studentId,
          electiveCourseId,
        },
      },
      update: {
        status: "PENDING",
        requestedAt: new Date(),
      },
      create: {
        institutionId: session.institutionId,
        studentId: session.studentId,
        electiveCourseId,
        status: "PENDING",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Elective course selection request submitted for academic approval.",
      data: selection,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

