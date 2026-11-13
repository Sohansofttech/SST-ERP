import db from "../db";
import { recordAudit } from "./audit.service";
import { sendNotification } from "./notification.service";

export interface CreateApprovalRequestParams {
  institutionId: string;
  userId: string;
  requestType: "PROFILE_CORRECTION" | "ELECTIVE_SELECTION" | "RESOURCE_BOOKING" | "LEAVE_APPLICATION" | "GENERAL_REQUEST";
  title: string;
  data: Record<string, any>;
}

export interface ReviewApprovalRequestParams {
  requestId: string;
  institutionId: string;
  adminUserId: string;
  status: "APPROVED" | "REJECTED";
  adminRemarks?: string;
}

/**
 * Reusable Approval/Request Engine
 */
export async function submitRequest(params: CreateApprovalRequestParams) {
  const request = await db.approvalRequest.create({
    data: {
      institutionId: params.institutionId,
      userId: params.userId,
      requestType: params.requestType,
      title: params.title,
      requestedDataJson: JSON.stringify(params.data),
      status: "PENDING",
    },
  });

  await recordAudit({
    institutionId: params.institutionId,
    actorUserId: params.userId,
    action: "CREATE",
    entityType: "APPROVAL_REQUEST",
    entityId: request.id,
    newValues: { requestType: params.requestType, title: params.title },
  });

  return request;
}

export async function reviewRequest(params: ReviewApprovalRequestParams) {
  const existing = await db.approvalRequest.findUnique({
    where: { id: params.requestId },
    include: { user: true },
  });

  if (!existing || existing.institutionId !== params.institutionId) {
    throw new Error("Request not found or cross-tenant access prevented.");
  }

  const updated = await db.approvalRequest.update({
    where: { id: params.requestId },
    data: {
      status: params.status,
      adminRemarks: params.adminRemarks,
      reviewedByUserId: params.adminUserId,
      reviewedAt: new Date(),
    },
  });

  // If approved and it's a PROFILE_CORRECTION, apply the requested changes safely
  if (params.status === "APPROVED" && existing.requestType === "PROFILE_CORRECTION") {
    try {
      const payload = JSON.parse(existing.requestedDataJson);
      const student = await db.student.findUnique({ where: { userId: existing.userId } });
      if (student) {
        const updateData: any = {};
        if (payload.proposedEmergencyContact) updateData.emergencyContact = payload.proposedEmergencyContact;
        if (payload.proposedAddressLine) updateData.addressLine = payload.proposedAddressLine;
        if (payload.proposedCity) updateData.city = payload.proposedCity;
        if (payload.proposedState) updateData.state = payload.proposedState;
        if (payload.proposedPincode) updateData.pincode = payload.proposedPincode;
        if (payload.proposedBloodGroup) updateData.bloodGroup = payload.proposedBloodGroup;

        if (Object.keys(updateData).length > 0) {
          await db.student.update({
            where: { id: student.id },
            data: updateData,
          });

          await recordAudit({
            institutionId: params.institutionId,
            actorUserId: params.adminUserId,
            action: "UPDATE",
            entityType: "STUDENT_PROFILE",
            entityId: student.id,
            oldValues: student,
            newValues: updateData,
          });
        }
      }
    } catch (e) {
      console.error("Failed to apply profile correction upon approval:", e);
    }
  }

  // Notify student of decision
  await sendNotification({
    institutionId: params.institutionId,
    title: `Request ${params.status}: ${existing.title}`,
    message: `Your request (${existing.title}) has been ${params.status.toLowerCase()} by administration. Remarks: ${
      params.adminRemarks || "None"
    }`,
    category: "SYSTEM",
    audienceRole: "STUDENT",
    recipientUserIds: [existing.userId],
  });

  await recordAudit({
    institutionId: params.institutionId,
    actorUserId: params.adminUserId,
    action: "APPROVAL_ACTION",
    entityType: "APPROVAL_REQUEST",
    entityId: params.requestId,
    newValues: { status: params.status, adminRemarks: params.adminRemarks },
  });

  return updated;
}
