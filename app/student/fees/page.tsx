"use client";

import React, { useEffect, useState } from "react";
import { PortalLayout } from "@/components/layout/PortalLayout";
import { Card } from "@/components/shared/Card";
import { StatCard } from "@/components/shared/StatCard";
import { Badge } from "@/components/shared/Badge";
import { Button } from "@/components/shared/Button";
import { Table } from "@/components/shared/Table";
import { FeePaymentModal } from "@/components/shared/FeePaymentModal";
import { Modal } from "@/components/shared/Modal";
import {
  CreditCard,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  Download,
  ShieldCheck,
  Building,
} from "lucide-react";

export default function StudentFeesPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [activeReceipt, setActiveReceipt] = useState<any>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const fetchFees = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/student/fees");
      const json = await res.json();
      if (json.success) setData(json.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFees();
  }, []);

  const handlePayClick = (invoice: any) => {
    setSelectedInvoice(invoice);
    setIsPayModalOpen(true);
  };

  const handlePaymentSuccess = (receipt: any) => {
    setSuccessToast(
      `Payment successfully verified by backend! Receipt ${receipt.receiptNumber} generated.`
    );
    fetchFees();
  };

  if (loading) {
    return (
      <PortalLayout portalType="STUDENT" pageTitle="Fee Accounts & Receipts">
        <div className="py-20 text-center text-sm text-[#64748B]">Loading fee ledger...</div>
      </PortalLayout>
    );
  }

  const { summary, invoices, payments } = data || {};

  return (
    <PortalLayout portalType="STUDENT" pageTitle="Tuition & Institutional Fee Management">
      {successToast && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-[#16A34A] shrink-0" />
            <span className="font-medium">{successToast}</span>
          </div>
          <button
            onClick={() => setSuccessToast(null)}
            className="text-emerald-700 hover:text-emerald-900 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Rule 5 Notice */}
      <div className="mb-6 p-4 rounded-xl border border-blue-200 bg-blue-50 text-blue-900 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-[#2563EB] shrink-0 mt-0.5" />
        <div className="text-xs">
          <p className="font-bold uppercase tracking-wider">Backend Payment Verification Enforced (Rule 5)</p>
          <p className="mt-0.5 leading-relaxed">
            Transactions are verified directly by institutional backend endpoints before updating balances or emitting tamper-proof receipts.
          </p>
        </div>
      </div>

      {/* 3 Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard
          title="Total Institutional Fee"
          value={`₹${summary?.totalFees?.toLocaleString() ?? 0}`}
          subtitle="Annual academic charges"
          icon={<Building className="w-5 h-5 text-[#153B66]" />}
        />
        <StatCard
          title="Total Settled"
          value={`₹${summary?.totalPaid?.toLocaleString() ?? 0}`}
          subtitle="Verified payments"
          badgeText="Verified"
          badgeVariant="success"
          icon={<CheckCircle2 className="w-5 h-5 text-[#16A34A]" />}
        />
        <StatCard
          title="Outstanding Balance"
          value={`₹${summary?.totalOutstanding?.toLocaleString() ?? 0}`}
          subtitle={summary?.totalOutstanding > 0 ? "Due on Dec 15, 2025" : "No dues remaining"}
          badgeText={summary?.totalOutstanding > 0 ? "Action Required" : "Cleared"}
          badgeVariant={summary?.totalOutstanding > 0 ? "warning" : "success"}
          icon={<AlertTriangle className="w-5 h-5 text-[#F59E0B]" />}
        />
      </div>

      <div className="space-y-6">
        {/* Invoices List with Itemized Breakdown */}
        <Card title="Institutional Invoices & Fee Structure">
          <div className="space-y-4">
            {invoices?.map((inv: any) => (
              <div
                key={inv.id}
                className="p-5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2E8F0] pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#153B66]">{inv.invoiceNumber}</span>
                      <Badge
                        variant={
                          inv.status === "PAID"
                            ? "success"
                            : inv.status === "PARTIAL"
                            ? "warning"
                            : "error"
                        }
                      >
                        {inv.status}
                      </Badge>
                    </div>
                    <h3 className="text-base font-bold text-[#1E293B] mt-1">{inv.title}</h3>
                    <p className="text-xs text-[#64748B]">
                      Due Date: {new Date(inv.dueDate).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-xs text-[#64748B] block">Outstanding Balance</span>
                      <span className="text-lg font-bold text-[#DC2626]">
                        ₹{inv.outstandingAmount.toLocaleString()}
                      </span>
                    </div>

                    {inv.outstandingAmount > 0 && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handlePayClick(inv)}
                        icon={<CreditCard className="w-4 h-4" />}
                      >
                        Pay Online
                      </Button>
                    )}
                  </div>
                </div>

                {/* Itemized Line Items */}
                <div>
                  <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-2">
                    Fee Item Breakdown
                  </p>
                  <div className="space-y-1.5 text-xs bg-white p-3 rounded-lg border border-[#E2E8F0]">
                    {inv.items?.map((item: any) => (
                      <div key={item.id} className="flex justify-between items-center py-1">
                        <span className="text-[#1E293B]">{item.description}</span>
                        <span className="font-semibold text-[#153B66]">
                          ₹{item.amount.toLocaleString()}
                        </span>
                      </div>
                    ))}
                    <div className="border-t border-[#E2E8F0] pt-2 flex justify-between font-bold text-sm text-[#1E293B]">
                      <span>Total Invoice Amount</span>
                      <span>₹{inv.totalAmount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Payment History & Receipts */}
        <Card title="Payment History & Official Receipts">
          <Table
            columns={[
              {
                header: "Transaction Date",
                cell: (p: any) => new Date(p.paidAt).toLocaleDateString(),
              },
              {
                header: "Invoice Reference",
                accessorKey: "invoiceNumber",
              },
              {
                header: "Gateway Transaction ID",
                cell: (p: any) => (
                  <span className="font-mono text-xs text-[#64748B]">{p.transactionRef}</span>
                ),
              },
              {
                header: "Payment Method",
                accessorKey: "paymentMethod",
              },
              {
                header: "Amount Paid",
                cell: (p: any) => (
                  <span className="font-bold text-[#1E293B]">₹{p.amount.toLocaleString()}</span>
                ),
              },
              {
                header: "Backend Verification",
                cell: (p: any) => (
                  <Badge variant={p.backendVerified ? "success" : "warning"} size="sm">
                    {p.backendVerified ? "Verified (Rule 5)" : "Pending"}
                  </Badge>
                ),
              },
              {
                header: "Receipt Action",
                cell: (p: any) =>
                  p.receiptNumber ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setActiveReceipt({
                          receiptNumber: p.receiptNumber,
                          date: p.paidAt,
                          amount: p.amount,
                          method: p.paymentMethod,
                          transactionRef: p.transactionRef,
                          invoiceTitle: p.invoiceTitle,
                        })
                      }
                      icon={<Receipt className="w-3.5 h-3.5 text-[#2563EB]" />}
                    >
                      {p.receiptNumber}
                    </Button>
                  ) : (
                    <span className="text-xs text-[#64748B]">Processing</span>
                  ),
              },
            ]}
            data={payments || []}
            emptyMessage="No payments recorded."
          />
        </Card>
      </div>

      {/* Payment Processing Modal */}
      <FeePaymentModal
        isOpen={isPayModalOpen}
        onClose={() => setIsPayModalOpen(false)}
        invoice={selectedInvoice}
        onPaymentSuccess={handlePaymentSuccess}
      />

      {/* Official Receipt Viewer Modal */}
      {activeReceipt && (
        <Modal
          isOpen={!!activeReceipt}
          onClose={() => setActiveReceipt(null)}
          title="Official Fee Payment Receipt"
          subtitle="Finance & Accounts Division • Apex Institute of Technology"
          maxWidth="md"
          footer={
            <Button
              variant="primary"
              size="sm"
              onClick={() => window.print()}
              icon={<Download className="w-4 h-4" />}
            >
              Print Receipt
            </Button>
          }
        >
          <div className="border border-[#153B66] rounded-xl p-5 bg-white space-y-4 text-xs">
            <div className="text-center border-b border-[#E2E8F0] pb-3">
              <h3 className="text-base font-bold text-[#153B66]">APEX INSTITUTE OF TECHNOLOGY</h3>
              <p className="text-[11px] text-[#64748B]">Finance Office • Tax Invoice & Fee Acknowledgment</p>
              <Badge variant="success" size="sm" className="mt-1">
                Receipt Number: {activeReceipt.receiptNumber}
              </Badge>
            </div>

            <div className="space-y-2 py-2">
              <div className="flex justify-between">
                <span className="text-[#64748B]">Payment Date:</span>
                <span className="font-semibold">{new Date(activeReceipt.date).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Description:</span>
                <span className="font-semibold">{activeReceipt.invoiceTitle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Payment Mode:</span>
                <span className="font-semibold">{activeReceipt.method}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Gateway Reference:</span>
                <span className="font-mono text-[11px]">{activeReceipt.transactionRef}</span>
              </div>
              <div className="flex justify-between border-t border-[#E2E8F0] pt-2 text-sm font-bold text-[#153B66]">
                <span>Total Amount Paid:</span>
                <span>₹{activeReceipt.amount.toLocaleString()}</span>
              </div>
            </div>

            <div className="p-2.5 bg-slate-50 border border-[#E2E8F0] rounded text-[10px] text-[#64748B] text-center">
              This is a computer-generated institutional fee receipt verified by the backend finance ledger. No signature required.
            </div>
          </div>
        </Modal>
      )}
    </PortalLayout>
  );
}

