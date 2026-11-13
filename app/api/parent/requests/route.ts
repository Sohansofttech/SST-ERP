import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { authorizeStudentOrParentAccess } from "@/lib/security/authorize";
import { submitRequest } from "@/lib/services/approval.service";
import db from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth(req);

    if (session.role !== "PARENT") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    const requests = await db.approvalRequest.findMany({
      where: {
        userId: session.userId,
        institutionId: session.institutionId,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: requests,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth(req);

    if (session.role !== "PARENT") {
      return NextResponse.json({ success: false, error: "Only parents can submit parent requests." }, { status: 403 });
    }

    const { studentId, requestType, title, message } = await req.json();

    if (!studentId || !title || !message) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    // Verify parent is authorized for this child
    await authorizeStudentOrParentAccess(session, studentId);

    const request = await submitRequest({
      institutionId: session.institutionId,
      userId: session.userId,
      requestType: requestType || "LEAVE_APPLICATION",
      title: `[Parent Request] ${title}`,
      data: {
        studentId,
        requestType,
        message,
        submittedByParent: session.fullName,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Parent request submitted to institution admin workflow.",
      data: request,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: err.name === "ForbiddenError" ? 403 : 500 }
    );
  }
}

