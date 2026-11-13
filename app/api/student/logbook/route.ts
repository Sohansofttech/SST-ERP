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

    const entries = await db.logBookEntry.findMany({
      where: {
        studentId,
        institutionId: session.institutionId,
      },
      orderBy: { entryDate: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: entries,
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
      return NextResponse.json({ success: false, error: "Only students may record log book entries" }, { status: 403 });
    }

    const { activityType, title, description, entryDate, hoursSpent } = await req.json();

    if (!activityType || !title || !description || !entryDate) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const entry = await db.logBookEntry.create({
      data: {
        institutionId: session.institutionId,
        studentId: session.studentId,
        activityType,
        title,
        description,
        entryDate: new Date(entryDate),
        hoursSpent: Number(hoursSpent) || 2.0,
        status: "SUBMITTED",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Log book entry submitted for supervisor evaluation.",
      data: entry,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
