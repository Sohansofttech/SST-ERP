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

    // Retrieve attendance records scoped by student and institution
    const records = await db.attendanceRecord.findMany({
      where: {
        studentId,
        institutionId: session.institutionId,
      },
      include: {
        subject: true,
      },
      orderBy: { date: "desc" },
    });

    const totalClasses = records.length;
    const attendedClasses = records.filter(
      (r) => r.status === "PRESENT" || r.status === "EXCUSED"
    ).length;
    const absentClasses = records.filter((r) => r.status === "ABSENT").length;
    const lateClasses = records.filter((r) => r.status === "LATE").length;
    const overallPercentage = totalClasses > 0 ? Math.round((attendedClasses / totalClasses) * 100) : 100;

    // Group by subject
    const subjectMap = new Map<string, { code: string; name: string; total: number; attended: number }>();

    records.forEach((r) => {
      const existing = subjectMap.get(r.subjectId) || {
        code: r.subject.code || "",
        name: r.subject.name,
        total: 0,
        attended: 0,
      };
      existing.total += 1;
      if (r.status === "PRESENT" || r.status === "EXCUSED") {
        existing.attended += 1;
      }
      subjectMap.set(r.subjectId, existing);
    });

    const subjectWise = Array.from(subjectMap.entries()).map(([subId, stats]) => ({
      subjectId: subId,
      subjectCode: stats.code,
      subjectName: stats.name,
      totalClasses: stats.total,
      attendedClasses: stats.attended,
      percentage: stats.total > 0 ? Math.round((stats.attended / stats.total) * 100) : 100,
    }));

    // Group by Month (STU-FE-06)
    const monthMap = new Map<string, { month: string; year: number; total: number; attended: number }>();
    records.forEach((r) => {
      const d = new Date(r.date);
      const monthYear = d.toLocaleString("default", { month: "long", year: "numeric" });
      const existing = monthMap.get(monthYear) || {
        month: d.toLocaleString("default", { month: "long" }),
        year: d.getFullYear(),
        total: 0,
        attended: 0,
      };
      existing.total += 1;
      if (r.status === "PRESENT" || r.status === "EXCUSED") {
        existing.attended += 1;
      }
      monthMap.set(monthYear, existing);
    });

    const monthlyAttendance = Array.from(monthMap.entries()).map(([monthYear, stats]) => ({
      monthYear,
      month: stats.month,
      year: stats.year,
      totalClasses: stats.total,
      attendedClasses: stats.attended,
      absentClasses: stats.total - stats.attended,
      percentage: stats.total > 0 ? Math.round((stats.attended / stats.total) * 100) : 100,
    }));

    const absenceHistory = records
      .filter((r) => r.status === "ABSENT" || r.status === "LATE")
      .map((r) => ({
        id: r.id,
        date: r.date,
        subjectCode: r.subject.code,
        subjectName: r.subject.name,
        status: r.status,
        remarks: r.remarks || "No remarks logged",
      }));

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalClasses,
          attendedClasses,
          absentClasses,
          lateClasses,
          overallPercentage,
        },
        subjectWise,
        monthlyAttendance,
        dailyHistory: records.map((r) => ({
          id: r.id,
          date: r.date,
          subjectCode: r.subject.code,
          subjectName: r.subject.name,
          status: r.status,
          remarks: r.remarks,
        })),
        absenceHistory,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to fetch attendance" },
      { status: err.name === "ForbiddenError" ? 403 : 500 }
    );
  }
}
