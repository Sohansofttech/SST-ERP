import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import db from "@/lib/db";
import { AUTH_COOKIE_NAME } from "@/lib/auth/jwt";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Retrieve fresh details
    let additionalInfo: any = {};
    if (session.role === "STUDENT" && session.studentId) {
      additionalInfo.student = await db.student.findUnique({
        where: { id: session.studentId },
        include: {
          enrollments: {
            where: { status: "ACTIVE" },
            include: { course: true, academicYear: true },
          },
        },
      });
    } else if (session.role === "PARENT" && session.guardianId) {
      additionalInfo.guardian = await db.guardianAccount.findUnique({
        where: { id: session.guardianId },
        include: {
          guardianLinks: {
            where: { isVerified: true, canAccessPortal: true },
            include: {
              student: {
                include: {
                  enrollments: {
                    where: { status: "ACTIVE" },
                    include: { course: true },
                  },
                },
              },
            },
          },
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        session,
        ...additionalInfo,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to get session" },
      { status: 500 }
    );
  }
}

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: "Logged out successfully",
  });

  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: "",
    path: "/",
    expires: new Date(0),
  });

  return response;
}
