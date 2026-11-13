import { SessionUser } from "@/types";
import { ForbiddenError } from "../auth/session";
import db from "../db";
import { assertTenant } from "./tenant";

/**
 * Validates whether the authenticated user is authorized to view or mutate a specific student's record.
 * - If STUDENT: targetStudentId MUST match session.studentId
 * - If PARENT: targetStudentId MUST be linked via an active, verified GuardianLink for this parent within the same institution
 * - If ADMIN / TEACHER: Allowed within the same institution
 */
export async function authorizeStudentOrParentAccess(
  session: SessionUser,
  targetStudentId: string
): Promise<{ studentId: string; isParent: boolean }> {
  if (!targetStudentId) {
    throw new ForbiddenError("Target student ID is required.");
  }

  // Verify student exists and belongs to the same institution
  const student = await db.student.findUnique({
    where: { id: targetStudentId },
    select: { id: true, institutionId: true },
  });

  if (!student) {
    throw new ForbiddenError("Student record not found or inaccessible.");
  }

  assertTenant(session, student.institutionId);

  // Student role check
  if (session.role === "STUDENT") {
    if (session.studentId !== targetStudentId) {
      throw new ForbiddenError("IDOR protection: Students are not permitted to access another student's data.");
    }
    return { studentId: targetStudentId, isParent: false };
  }

  // Parent role check
  if (session.role === "PARENT") {
    if (!session.guardianId) {
      throw new ForbiddenError("Parent session has no associated guardian account.");
    }

    const link = await db.guardianLink.findFirst({
      where: {
        guardianAccountId: session.guardianId,
        studentId: targetStudentId,
        institutionId: session.institutionId,
        isVerified: true,
        canAccessPortal: true,
      },
    });

    if (!link) {
      throw new ForbiddenError("Security violation: You are not authorized to monitor this student.");
    }

    return { studentId: targetStudentId, isParent: true };
  }

  // Admin / Teacher within same institution
  if (["ADMIN", "SUPER_ADMIN", "TEACHER"].includes(session.role)) {
    return { studentId: targetStudentId, isParent: false };
  }

  throw new ForbiddenError("Unauthorized role for student data access.");
}
