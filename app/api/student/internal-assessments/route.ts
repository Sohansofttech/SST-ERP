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

    const assessments = await db.assessmentRecord.findMany({
      where: {
        studentId,
        institutionId: session.institutionId,
      },
      include: {
        subject: true,
      },
      orderBy: { conductedDate: "desc" },
    });

    // Group by subject
    const subjectWiseMap = new Map<string, any>();
    assessments.forEach((item) => {
      const existing = subjectWiseMap.get(item.subjectId) || {
        subjectCode: item.subject.code,
        subjectName: item.subject.name,
        assessments: [],
        totalMarksScored: 0,
        totalMaxMarks: 0,
      };
      existing.assessments.push({
        id: item.id,
        assessmentName: item.assessmentName,
        marksObtained: item.marksObtained,
        maxMarks: item.maxMarks,
        weightage: item.weightage,
        remarks: item.remarks,
        conductedDate: item.conductedDate,
      });
      existing.totalMarksScored += item.marksObtained;
      existing.totalMaxMarks += item.maxMarks;
      subjectWiseMap.set(item.subjectId, existing);
    });

    const subjectWiseAssessments = Array.from(subjectWiseMap.values()).map((s) => ({
      ...s,
      percentage: s.totalMaxMarks > 0 ? Math.round((s.totalMarksScored / s.totalMaxMarks) * 100) : 0,
    }));

    return NextResponse.json({
      success: true,
      data: {
        assessments,
        subjectWise: subjectWiseAssessments,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to fetch internal assessments" },
      { status: err.name === "ForbiddenError" ? 403 : 500 }
    );
  }
}

