"use client";

import React, { useEffect, useState } from "react";
import { PortalLayout } from "@/components/layout/PortalLayout";
import { Card } from "@/components/shared/Card";
import { StatCard } from "@/components/shared/StatCard";
import { Badge } from "@/components/shared/Badge";
import { Button } from "@/components/shared/Button";
import { Table } from "@/components/shared/Table";
import { FeePaymentModal } from "@/components/shared/FeePaymentModal";
import { CreditCard, CheckCircle2, AlertTriangle, Receipt, ShieldCheck } from "lucide-react";

export default function ParentFeesPage() {
  const [selectedChildId, setSelectedChildId] = useState("");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const fetchFees = async (childId: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/student/fees?studentId=${childId}`);
      const json = await res.json();
      if (json.success) setData(json.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedChildId) fetchFees(selectedChildId);
  }, [selectedChildId]);

  const handlePaymentSuccess = (receipt: any) => {
    setToast(`Payment verified by backend! Receipt ${receipt.receiptNumber} issued.`);
    if (selectedChildId) fetchFees(selectedChildId);
  };

  const { summary, invoices, payments } = data || {};

  return (
    <PortalLayout
      portalType="PARENT"
      pageTitle="Child Institutional Fee Accounts & Payments"
      selectedChildId={selectedChildId}
      onSelectChild={(id) => setSelectedChildId(id)}
    >
      {toast && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-[#16A34A] shrink-0" />
            <span className="font-medium">{toast}</span>
          </div>
          <button onClick={() => setToast(null)} className="text-emerald-700 font-bold">✕</button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard
          title="Total Fee"
          value={`₹${summary?.totalFees?.toLocaleString() ?? 0}`}
          subtitle="Semester 5 total"
          icon={<CreditCard className="w-5 h-5 text-[#153B66]" />}
        />
        <StatCard
          title="Total Settled"
          value={`₹${summary?.totalPaid?.toLocaleString() ?? 0}`}
          subtitle="Cleared installments"
          badgeText="Verified"
          badgeVariant="success"
          icon={<CheckCircle2 className="w-5 h-5 text-[#16A34A]" />}
        />
        <StatCard
          title="Outstanding Balance"
          value={`₹${summary?.totalOutstanding?.toLocaleString() ?? 0}`}
          subtitle={summary?.totalOutstanding > 0 ? "Due Dec 15, 2025" : "Fully paid"}
          badgeText={summary?.totalOutstanding > 0 ? "Due" : "Cleared"}
          badgeVariant={summary?.totalOutstanding > 0 ? "warning" : "success"}
          icon={<AlertTriangle className="w-5 h-5 text-[#F59E0B]" />}
        />
      </div>

      <div className="space-y-6">
        {/* Invoices */}
        <Card title="Fee Invoices">
          <div className="space-y-4">
            {invoices?.map((inv: any) => (
              <div
                key={inv.id}
                className="p-5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] space-y-3 text-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2E8F0] pb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#153B66]">{inv.invoiceNumber}</span>
                      <Badge variant={inv.status === "PAID" ? "success" : "warning"} size="sm">
                        {inv.status}
                      </Badge>
                    </div>
                    <h3 className="font-bold text-sm text-[#1E293B] mt-1">{inv.title}</h3>
                    <p className="text-[#64748B]">Due: {new Date(inv.dueDate).toLocaleDateString()}</p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-[#64748B] block">Balance</span>
                      <span className="text-base font-bold text-[#DC2626]">
                        ₹{inv.outstandingAmount.toLocaleString()}
                      </span>
                    </div>

                    {inv.outstandingAmount > 0 && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => {
                          setSelectedInvoice(inv);
                          setIsPayModalOpen(true);
                        }}
                      >
                        Pay Online
                      </Button>
                    )}
                  </div>
                </div>

                {/* Line items */}
                <div className="space-y-1 bg-white p-3 rounded-lg border border-[#E2E8F0]">
                  {inv.items?.map((item: any) => (
                    <div key={item.id} className="flex justify-between">
                      <span className="text-[#1E293B]">{item.description}</span>
                      <span className="font-semibold">₹{item.amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Payments Table */}
        <Card title="Fee Payment History & Verified Receipts">
          <Table
            columns={[
              {
                header: "Date",
                cell: (p: any) => new Date(p.paidAt).toLocaleDateString(),
              },
              { header: "Invoice Number", accessorKey: "invoiceNumber" },
              { header: "Gateway Ref", accessorKey: "transactionRef" },
              { header: "Mode", accessorKey: "paymentMethod" },
              {
                header: "Amount Paid",
                cell: (p: any) => <span className="font-bold">₹{p.amount.toLocaleString()}</span>,
              },
              {
                header: "Official Receipt",
                cell: (p: any) => (
                  <Badge variant="brand" size="sm">
                    {p.receiptNumber}
                  </Badge>
                ),
              },
            ]}
            data={payments || []}
            emptyMessage="No payments recorded."
          />
        </Card>
      </div>

      <FeePaymentModal
        isOpen={isPayModalOpen}
        onClose={() => setIsPayModalOpen(false)}
        invoice={selectedInvoice}
        studentId={selectedChildId}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </PortalLayout>
  );
}

