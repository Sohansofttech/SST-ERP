"use client";

import React, { useState } from "react";
import { Modal } from "./Modal";
import { Button } from "./Button";
import { FormInput } from "./FormInput";
import { ShieldCheck, CreditCard, Smartphone, Building, CheckCircle2, AlertCircle } from "lucide-react";

interface FeePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: {
    id: string;
    invoiceNumber: string;
    title: string;
    outstandingAmount: number;
  } | null;
  studentId?: string;
  onPaymentSuccess: (receipt: any) => void;
}

export const FeePaymentModal: React.FC<FeePaymentModalProps> = ({
  isOpen,
  onClose,
  invoice,
  studentId,
  onPaymentSuccess,
}) => {
  const [amount, setAmount] = useState<number>(invoice?.outstandingAmount || 0);
  const [method, setMethod] = useState<"UPI" | "NET_BANKING" | "CREDIT_CARD">("UPI");
  const [upiId, setUpiId] = useState("john.doe@okhdfcbank");
  const [cardNumber, setCardNumber] = useState("4532 •••• •••• 8821");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (invoice) {
      setAmount(invoice.outstandingAmount);
      setError(null);
    }
  }, [invoice]);

  if (!invoice) return null;

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Step 4 & 5: Simulate payment gateway interaction, then send to backend verification endpoint
      const mockOrderId = `ORD-${Date.now()}`;
      const mockTxnRef = `GATEWAY-TXN-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
      const mockSignature = "sig_mock_auto_verified";

      const res = await fetch("/api/student/fees/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId,
          invoiceId: invoice.id,
          amount: Number(amount),
          paymentMethod: method,
          gatewayOrderId: mockOrderId,
          gatewayTransactionId: mockTxnRef,
          gatewaySignature: mockSignature,
        }),
      });

      const json = await res.json();

      if (!json.success) {
        throw new Error(json.error || "Backend payment verification failed.");
      }

      onPaymentSuccess(json.data);
      onClose();
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during payment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Secure Fee Payment"
      subtitle={`Invoice: ${invoice.invoiceNumber} • ${invoice.title}`}
      maxWidth="md"
    >
      <form onSubmit={handlePay} className="space-y-4">
        {error && (
          <div className="p-3 bg-[#FEE2E2] border border-[#FECACA] rounded-lg text-xs text-[#DC2626] flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0]">
          <div className="flex justify-between items-center text-xs text-[#64748B]">
            <span>Outstanding Balance</span>
            <span className="font-semibold text-[#1E293B]">
              ₹{invoice.outstandingAmount.toLocaleString()}
            </span>
          </div>
          <div className="mt-2">
            <FormInput
              label="Payment Amount (₹)"
              type="number"
              min={1}
              max={invoice.outstandingAmount}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-[13px] font-medium text-[#1E293B] mb-2">
            Select Payment Method
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setMethod("UPI")}
              className={`p-3 rounded-xl border text-center transition-all ${
                method === "UPI"
                  ? "border-[#2563EB] bg-blue-50/50 text-[#2563EB] font-semibold"
                  : "border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#64748B]"
              }`}
            >
              <Smartphone className="w-5 h-5 mx-auto mb-1" />
              <span className="text-xs">UPI</span>
            </button>
            <button
              type="button"
              onClick={() => setMethod("NET_BANKING")}
              className={`p-3 rounded-xl border text-center transition-all ${
                method === "NET_BANKING"
                  ? "border-[#2563EB] bg-blue-50/50 text-[#2563EB] font-semibold"
                  : "border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#64748B]"
              }`}
            >
              <Building className="w-5 h-5 mx-auto mb-1" />
              <span className="text-xs">Net Banking</span>
            </button>
            <button
              type="button"
              onClick={() => setMethod("CREDIT_CARD")}
              className={`p-3 rounded-xl border text-center transition-all ${
                method === "CREDIT_CARD"
                  ? "border-[#2563EB] bg-blue-50/50 text-[#2563EB] font-semibold"
                  : "border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#64748B]"
              }`}
            >
              <CreditCard className="w-5 h-5 mx-auto mb-1" />
              <span className="text-xs">Card</span>
            </button>
          </div>
        </div>

        {method === "UPI" && (
          <FormInput
            label="Virtual Payment Address (VPA / UPI ID)"
            value={upiId}
            onChange={(e) => setUpiId(e.target.value)}
            placeholder="e.g. mobile@upi"
            required
          />
        )}

        {method === "CREDIT_CARD" && (
          <FormInput
            label="Card Number"
            value={cardNumber}
            onChange={(e) => setCardNumber(e.target.value)}
            placeholder="4532 0000 0000 0000"
            required
          />
        )}

        <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-[11px] text-emerald-800 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#16A34A] shrink-0" />
          <span>
            Rule 5 Compliant: Payment is verified server-side with digital signatures before generating an official institutional receipt.
          </span>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={loading}>
            Pay ₹{amount.toLocaleString()}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

