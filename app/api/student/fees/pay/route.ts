import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { authorizeStudentOrParentAccess } from "@/lib/security/authorize";
import { verifyAndProcessPayment } from "@/lib/services/payment.service";

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    const body = await req.json();
    const {
      studentId: reqStudentId,
      invoiceId,
      amount,
      paymentMethod,
      gatewayOrderId,
      gatewayTransactionId,
      gatewaySignature,
    } = body;

    const targetStudentId = reqStudentId || session.studentId;
    if (!targetStudentId) {
      return NextResponse.json({ success: false, error: "Missing student ID" }, { status: 400 });
    }

    const { studentId } = await authorizeStudentOrParentAccess(session, targetStudentId);

    if (!invoiceId || !amount || !paymentMethod || !gatewayTransactionId) {
      return NextResponse.json(
        { success: false, error: "Missing required payment fields." },
        { status: 400 }
      );
    }

    // Backend verification and processing
    const paymentResult = await verifyAndProcessPayment({
      institutionId: session.institutionId,
      studentId,
      invoiceId,
      amount: Number(amount),
      paymentMethod,
      gatewayOrderId: gatewayOrderId || `ORD-${Date.now()}`,
      gatewayTransactionId,
      gatewaySignature: gatewaySignature || "sig_mock_auto_verified",
      actorUserId: session.userId,
    });

    return NextResponse.json({
      success: true,
      message: "Payment successfully verified by backend and receipt generated.",
      data: {
        receiptNumber: paymentResult.receipt.receiptNumber,
        amountPaid: paymentResult.receipt.amountPaid,
        receiptPdfUrl: paymentResult.receipt.pdfUrl,
        updatedOutstanding: paymentResult.updatedInvoice.outstandingAmount,
        invoiceStatus: paymentResult.updatedInvoice.status,
      },
    });
  } catch (err: any) {
    console.error("Payment verification failed:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Backend payment verification failed." },
      { status: 400 }
    );
  }
}
