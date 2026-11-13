import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import db from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth(req);

    if (session.role !== "PARENT") {
      return NextResponse.json(
        { success: false, error: "Only parent/guardian accounts may access this endpoint." },
        { status: 403 }
      );
    }

    if (!session.guardianId) {
      return NextResponse.json(
        { success: false, error: "No guardian account linked to session." },
        { status: 403 }
      );
    }

    // Retrieve only children actively linked and verified to this parent in this institution
    const links = await db.guardianLink.findMany({
      where: {
        guardianAccountId: session.guardianId,
        institutionId: session.institutionId,
        isVerified: true,
        canAccessPortal: true,
      },
      include: {
        student: {
          include: {
            enrollments: {
              include: { course: true, academicYear: true },
              orderBy: { enrolledDate: "desc" },
            },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: links.map((link) => {
        const activeEnrollment =
          link.student.enrollments.find((e) => e.status === "ACTIVE") || link.student.enrollments[0];

        return {
          linkId: link.id,
          relationship: link.relationship,
          isPrimary: link.isPrimary,
          student: {
            id: link.student.id,
            firstName: link.student.firstName,
            lastName: link.student.lastName,
            rollNumber: link.student.rollNumber,
            admissionNumber: link.student.admissionNumber,
            currentSemester: link.student.currentSemester,
            currentSection: link.student.currentSection,
            courseName: activeEnrollment?.course?.name || "",
            academicYear: activeEnrollment?.academicYear?.name || "",
            status: link.student.status,
          },
        };
      }),
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
