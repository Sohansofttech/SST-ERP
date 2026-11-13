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

    // Invoices with line items
    const invoices = await db.feeInvoice.findMany({
      where: {
        studentId,
        institutionId: session.institutionId,
      },
      include: {
        items: true,
      },
      orderBy: { dueDate: "asc" },
    });

    // Payment history with receipts
    const payments = await db.feePayment.findMany({
      where: {
        studentId,
        institutionId: session.institutionId,
      },
      include: {
        receipt: true,
        invoice: { select: { invoiceNumber: true, title: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const totalFees = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
    const totalPaid = invoices.reduce((sum, inv) => sum + inv.paidAmount, 0);
    const totalOutstanding = invoices.reduce((sum, inv) => sum + inv.outstandingAmount, 0);

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalFees,
          totalPaid,
          totalOutstanding,
        },
        invoices: invoices.map((inv) => ({
          id: inv.id,
          invoiceNumber: inv.invoiceNumber,
          title: inv.title,
          totalAmount: inv.totalAmount,
          paidAmount: inv.paidAmount,
          outstandingAmount: inv.outstandingAmount,
          dueDate: inv.dueDate,
          status: inv.status,
          items: inv.items,
        })),
        payments: payments.map((p) => ({
          id: p.id,
          invoiceNumber: p.invoice.invoiceNumber,
          invoiceTitle: p.invoice.title,
          amount: p.amount,
          paymentMethod: p.paymentMethod,
          transactionRef: p.transactionRef,
          status: p.status,
          backendVerified: p.backendVerified,
          paidAt: p.verifiedAt || p.createdAt,
          receiptNumber: p.receipt?.receiptNumber,
          receiptPdfUrl: p.receipt?.pdfUrl,
        })),
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to fetch fee details" },
      { status: err.name === "ForbiddenError" ? 403 : 500 }
    );
  }
}
