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

    const { studentId, isParent } = await authorizeStudentOrParentAccess(session, requestedStudentId);

    // CRITICAL SECURITY RULE:
    // "Private mentoring notes must NOT be visible to parents."
    // If the requester is a parent, strictly exclude records with isPrivateNote = true!
    const records = await db.mentoringRecord.findMany({
      where: {
        studentId,
        institutionId: session.institutionId,
        ...(isParent ? { isPrivateNote: false } : {}),
      },
      include: {
        mentorTeacher: {
          include: {
            user: { select: { fullName: true, email: true, phone: true } },
          },
        },
      },
      orderBy: { sessionDate: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: records.map((r) => ({
        id: r.id,
        sessionDate: r.sessionDate,
        mentorName: r.mentorTeacher.user.fullName,
        mentorDesignation: r.mentorTeacher.designation,
        mentorDepartment: r.mentorTeacher.department,
        mentorEmail: r.mentorTeacher.user.email,
        topicsDiscussed: r.topicsDiscussed,
        studentActionItems: r.studentActionItems,
        followUpDate: r.followUpDate,
        isPrivateNote: r.isPrivateNote,
        // Double security guard: If isParent is true, mentorNotes must never leak
        mentorNotes: isParent && r.isPrivateNote ? null : r.mentorNotes,
      })),
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: err.name === "ForbiddenError" ? 403 : 500 }
    );
  }
}

