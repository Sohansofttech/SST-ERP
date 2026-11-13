import db from "../db";

export interface CreateNotificationParams {
  institutionId: string;
  title: string;
  message: string;
  category: "ACADEMIC" | "EXAMINATION" | "FEE" | "ANNOUNCEMENT" | "SYSTEM";
  audienceRole?: "ALL" | "STUDENT" | "PARENT" | "TEACHER";
  recipientUserIds?: string[];
}

/**
 * Reusable Notification Service
 * Section 25: Implement notifications for academic information, examinations, fees, and institution announcements.
 */
export async function sendNotification(params: CreateNotificationParams) {
  const notif = await db.notification.create({
    data: {
      institutionId: params.institutionId,
      title: params.title,
      message: params.message,
      category: params.category,
      audienceRole: params.audienceRole || "ALL",
    },
  });

  let userIds = params.recipientUserIds;
  if (!userIds || userIds.length === 0) {
    // If not specified, broadcast to relevant roles in this institution
    const users = await db.user.findMany({
      where: {
        institutionId: params.institutionId,
        ...(params.audienceRole && params.audienceRole !== "ALL"
          ? { role: params.audienceRole }
          : {}),
      },
      select: { id: true },
    });
    userIds = users.map((u) => u.id);
  }

  if (userIds.length > 0) {
    await db.notificationRecipient.createMany({
      data: userIds.map((uid) => ({
        notificationId: notif.id,
        userId: uid,
        isRead: false,
      })),
    });
  }

  return notif;
}

export async function getUserNotifications(userId: string, institutionId: string) {
  return await db.notificationRecipient.findMany({
    where: {
      userId,
      notification: {
        institutionId,
      },
    },
    include: {
      notification: true,
    },
    orderBy: {
      notification: {
        createdAt: "desc",
      },
    },
    take: 30,
  });
}

export async function markNotificationAsRead(recipientId: string, userId: string) {
  return await db.notificationRecipient.updateMany({
    where: {
      id: recipientId,
      userId,
    },
    data: {
      isRead: true,
      readAt: new Date(),
    },
  });
}

