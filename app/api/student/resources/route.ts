import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { authorizeStudentOrParentAccess } from "@/lib/security/authorize";
import { submitRequest } from "@/lib/services/approval.service";
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

    const bookings = await db.resourceBooking.findMany({
      where: {
        studentId,
        institutionId: session.institutionId,
      },
      orderBy: { bookingDate: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: bookings,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: err.name === "ForbiddenError" ? 403 : 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    if (session.role !== "STUDENT" || !session.studentId) {
      return NextResponse.json({ success: false, error: "Only students may book resources" }, { status: 403 });
    }

    const { resourceType, resourceName, bookingDate, timeSlot, purpose } = await req.json();

    if (!resourceType || !resourceName || !bookingDate || !timeSlot || !purpose) {
      return NextResponse.json({ success: false, error: "All fields are required" }, { status: 400 });
    }

    const booking = await db.resourceBooking.create({
      data: {
        institutionId: session.institutionId,
        studentId: session.studentId,
        resourceType,
        resourceName,
        bookingDate: new Date(bookingDate),
        timeSlot,
        purpose,
        status: "PENDING",
      },
    });

    // Also register in shared approval engine
    await submitRequest({
      institutionId: session.institutionId,
      userId: session.userId,
      requestType: "RESOURCE_BOOKING",
      title: `Resource Booking: ${resourceName} (${timeSlot})`,
      data: { bookingId: booking.id, resourceType, resourceName, bookingDate, timeSlot, purpose },
    });

    return NextResponse.json({
      success: true,
      message: "Resource reservation request submitted for lab/facility supervisor approval.",
      data: booking,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

