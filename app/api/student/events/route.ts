import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import db from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth(req);

    const events = await db.event.findMany({
      where: {
        institutionId: session.institutionId,
      },
      orderBy: { eventDate: "asc" },
    });

    return NextResponse.json({
      success: true,
      data: events,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

