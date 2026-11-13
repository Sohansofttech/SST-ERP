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

    const feedbackList = await db.feedback.findMany({
      where: {
        studentId,
        institutionId: session.institutionId,
      },
      orderBy: { submittedAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: feedbackList,
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
      return NextResponse.json({ success: false, error: "Only students may submit feedback" }, { status: 403 });
    }

    const { category, subject, message } = await req.json();

    if (!category || !subject || !message) {
      return NextResponse.json({ success: false, error: "Missing feedback fields" }, { status: 400 });
    }

    const feedback = await db.feedback.create({
      data: {
        institutionId: session.institutionId,
        studentId: session.studentId,
        category,
        subject,
        message,
        status: "PENDING",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Feedback submitted successfully.",
      data: feedback,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

