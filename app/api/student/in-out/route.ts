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

    const logs = await db.campusInOutLog.findMany({
      where: {
        studentId,
        institutionId: session.institutionId,
      },
      orderBy: { timestamp: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: logs,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to fetch in-out logs" },
      { status: err.name === "ForbiddenError" ? 403 : 500 }
    );
  }
}
