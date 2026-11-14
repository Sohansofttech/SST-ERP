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
      select: { currentSemester: true },
    });

    if (!student) {
      return NextResponse.json({ success: false, error: "Student not found" }, { status: 404 });
    }

    // 1. Study Materials for student's subjects
    const materials = await db.lmsCourseMaterial.findMany({
      where: {
        institutionId: session.institutionId,
        subject: { semester: student.currentSemester },
      },
      include: { subject: true },
      orderBy: [{ subject: { code: "asc" } }, { uploadedAt: "desc" }],
    });

    // 2. Assignments
    const assignments = await db.assignment.findMany({
      where: {
        institutionId: session.institutionId,
        subject: { semester: student.currentSemester },
      },
      include: {
        subject: true,
        submissions: { where: { studentId } },
      },
      orderBy: { dueDate: "asc" },
    });

    // 3. Quizzes
    const quizzes = await db.quiz.findMany({
      where: {
        institutionId: session.institutionId,
        subject: { semester: student.currentSemester },
      },
      include: {
        subject: true,
        questions: true,
        attempts: { where: { studentId } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: {
        materials: materials.map((m) => ({
          id: m.id,
          title: m.title,
          description: m.description,
          fileUrl: m.fileUrl,
          fileType: m.fileType,
          unitNumber: m.unitNumber,
          subjectCode: m.subject.code,
          subjectName: m.subject.name,
          uploadedAt: m.uploadedAt,
        })),
        assignments: assignments.map((a) => ({
          id: a.id,
          title: a.title,
          description: a.description,
          dueDate: a.dueDate,
          totalPoints: a.totalPoints,
          subjectCode: a.subject.code,
          subjectName: a.subject.name,
          submission: a.submissions[0] || null,
        })),
        quizzes: quizzes.map((q) => ({
          id: q.id,
          title: q.title,
          durationMinutes: q.durationMinutes,
          totalPoints: q.totalPoints,
          subjectCode: q.subject.code,
          subjectName: q.subject.name,
          questionCount: q.questions.length,
          questions: q.questions.map((qn) => ({
            id: qn.id,
            questionText: qn.questionText,
            optionA: qn.optionA,
            optionB: qn.optionB,
            optionC: qn.optionC,
            optionD: qn.optionD,
            points: qn.points,
          })),
          attempt: q.attempts[0] || null,
        })),
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to fetch LMS data" },
      { status: err.name === "ForbiddenError" ? 403 : 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    if (session.role !== "STUDENT" || !session.studentId) {
      return NextResponse.json(
        { success: false, error: "Only students may submit assignments or quizzes." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { type, assignmentId, textContent, fileUrl, quizId, answers } = body;

    if (type === "ASSIGNMENT_SUBMISSION") {
      if (!assignmentId) {
        return NextResponse.json({ success: false, error: "Assignment ID required" }, { status: 400 });
      }

      const submission = await db.assignmentSubmission.upsert({
        where: {
          assignmentId_studentId: {
            assignmentId,
            studentId: session.studentId,
          },
        },
        update: {
          textContent,
          fileUrl,
          submittedAt: new Date(),
          status: "SUBMITTED",
        },
        create: {
          institutionId: session.institutionId,
          assignmentId,
          studentId: session.studentId,
          textContent,
          fileUrl,
          status: "SUBMITTED",
        },
      });

      return NextResponse.json({
        success: true,
        message: "Assignment submitted successfully.",
        data: submission,
      });
    }

    if (type === "QUIZ_SUBMIT") {
      if (!quizId || !answers) {
        return NextResponse.json({ success: false, error: "Quiz ID and answers required" }, { status: 400 });
      }

      // Grade the quiz
      const quiz = await db.quiz.findUnique({
        where: { id: quizId },
        include: { questions: true },
      });

      if (!quiz) {
        return NextResponse.json({ success: false, error: "Quiz not found" }, { status: 404 });
      }

      let score = 0;
      quiz.questions.forEach((q) => {
        if (answers[q.id] === q.correctOption) {
          score += q.points;
        }
      });

      const attempt = await db.quizAttempt.create({
        data: {
          institutionId: session.institutionId,
          quizId,
          studentId: session.studentId,
          score,
          answersJson: JSON.stringify(answers),
        },
      });

      return NextResponse.json({
        success: true,
        message: `Quiz completed. Your score: ${score} / ${quiz.totalPoints}`,
        data: attempt,
      });
    }

    return NextResponse.json({ success: false, error: "Invalid submission type" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

