import db from "../db";

export interface CreateAuditLogParams {
  institutionId: string;
  actorUserId?: string | null;
  action: "CREATE" | "UPDATE" | "DELETE" | "PAYMENT_VERIFIED" | "PROFILE_CORRECTION_REQUESTED" | "APPROVAL_ACTION";
  entityType: "ATTENDANCE" | "MARKS" | "FEE_PAYMENT" | "STUDENT_PROFILE" | "APPROVAL_REQUEST" | "RESOURCE_BOOKING";
  entityId: string;
  oldValues?: any;
  newValues?: any;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Reusable Audit Service
 * Rule 6: Important changes to attendance, marks, fees and student records must be auditable.
 */
export async function recordAudit(params: CreateAuditLogParams) {
  try {
    return await db.auditLog.create({
      data: {
        institutionId: params.institutionId,
        actorUserId: params.actorUserId || null,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        oldValuesJson: params.oldValues ? JSON.stringify(params.oldValues) : null,
        newValuesJson: params.newValues ? JSON.stringify(params.newValues) : null,
        ipAddress: params.ipAddress || null,
        userAgent: params.userAgent || null,
      },
    });
  } catch (err) {
    console.error("Failed to record audit log:", err);
    // Don't crash main operation if audit insert fails, but log error
  }
}

