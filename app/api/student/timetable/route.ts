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
      select: { currentSemester: true, currentSection: true },
    });

    if (!student) {
      return NextResponse.json({ success: false, error: "Student not found" }, { status: 404 });
    }

    const slots = await db.timetableSlot.findMany({
      where: {
        institutionId: session.institutionId,
        semester: student.currentSemester,
        section: student.currentSection,
      },
      include: {
        subject: true,
        teacher: { include: { user: { select: { fullName: true } } } },
      },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    });

    const days = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
    const weeklySchedule: Record<string, any[]> = {};
    days.forEach((d) => (weeklySchedule[d] = []));

    slots.forEach((slot) => {
      if (weeklySchedule[slot.dayOfWeek]) {
        weeklySchedule[slot.dayOfWeek].push({
          id: slot.id,
          startTime: slot.startTime,
          endTime: slot.endTime,
          roomNumber: slot.roomNumber,
          subjectCode: slot.subject.code,
          subjectName: slot.subject.name,
          isElective: slot.subject.isElective,
          teacherName: slot.teacher?.user.fullName || "Faculty",
        });
      }
    });

    const todayDayName = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"][new Date().getDay()];
    const dailySchedule = weeklySchedule[todayDayName === "SUNDAY" ? "MONDAY" : todayDayName] || [];

    return NextResponse.json({
      success: true,
      data: {
        semester: student.currentSemester,
        section: student.currentSection,
        dailySchedule,
        weeklySchedule,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to fetch timetable" },
      { status: err.name === "ForbiddenError" ? 403 : 500 }
    );
  }
}

