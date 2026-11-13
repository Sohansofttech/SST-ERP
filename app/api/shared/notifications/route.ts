import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { getUserNotifications, markNotificationAsRead } from "@/lib/services/notification.service";

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    const notifications = await getUserNotifications(session.userId, session.institutionId);

    return NextResponse.json({
      success: true,
      data: notifications.map((n) => ({
        id: n.id,
        title: n.notification.title,
        message: n.notification.message,
        category: n.notification.category,
        isRead: n.isRead,
        createdAt: n.notification.createdAt,
      })),
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    const { notificationRecipientId } = await req.json();

    if (!notificationRecipientId) {
      return NextResponse.json({ success: false, error: "Recipient ID required" }, { status: 400 });
    }

    await markNotificationAsRead(notificationRecipientId, session.userId);

    return NextResponse.json({
      success: true,
      message: "Notification marked as read.",
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
