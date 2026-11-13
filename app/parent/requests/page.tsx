"use client";

import React, { useEffect, useState } from "react";
import { PortalLayout } from "@/components/layout/PortalLayout";
import { Card } from "@/components/shared/Card";
import { Badge } from "@/components/shared/Badge";
import { Button } from "@/components/shared/Button";
import { FormInput } from "@/components/shared/FormInput";
import { Table } from "@/components/shared/Table";
import { MessageSquare, Send, CheckCircle2 } from "lucide-react";

export default function ParentRequestsPage() {
  const [selectedChildId, setSelectedChildId] = useState("");
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [requestType, setRequestType] = useState("LEAVE_APPLICATION");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/parent/requests");
      const json = await res.json();
      if (json.success) setRequests(json.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessToast(null);

    try {
      const res = await fetch("/api/parent/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: selectedChildId,
          requestType,
          title,
          message,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setSuccessToast("Parent request submitted to institution admin workflow.");
        setTitle("");
        setMessage("");
        fetchRequests();
      } else {
        alert(json.error || "Failed to submit request.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PortalLayout
      portalType="PARENT"
      pageTitle="Permitted Institutional Requests & Inquiries"
      selectedChildId={selectedChildId}
      onSelectChild={(id) => setSelectedChildId(id)}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div>
          <Card
            title="Submit Parent Request"
            subtitle="Leave applications, warden inquiries, or administrative assistance"
          >
            {successToast && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" />
                <span>{successToast}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[13px] font-medium text-[#1E293B] mb-1">
                  Request Category
                </label>
                <select
                  value={requestType}
                  onChange={(e) => setRequestType(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs border border-[#E2E8F0] rounded-lg bg-white"
                >
                  <option value="LEAVE_APPLICATION">Leave Application / Absence Notice</option>
                  <option value="HOSTEL_INQUIRY">Hostel / Residential Inquiry</option>
                  <option value="FEE_QUERY">Fee Ledger Clarification</option>
                  <option value="GENERAL_REQUEST">General Communication with Dean</option>
                </select>
              </div>

              <FormInput
                label="Request Subject"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Leave of absence for family wedding"
                required
              />

              <div>
                <label className="block text-[13px] font-medium text-[#1E293B] mb-1">
                  Message / Details
                </label>
                <textarea
                  className="w-full px-3.5 py-2 text-xs border border-[#E2E8F0] rounded-lg"
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Detail the dates, reasons, and contact info..."
                  required
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full"
                isLoading={submitting}
                icon={<Send className="w-4 h-4" />}
              >
                Submit Request
              </Button>
            </form>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card
            title="My Submitted Requests & Approval Status"
            subtitle="Shared request engine records"
          >
            <Table
              columns={[
                {
                  header: "Submitted Date",
                  cell: (item: any) => new Date(item.createdAt).toLocaleDateString(),
                },
                {
                  header: "Request Title",
                  accessorKey: "title",
                },
                {
                  header: "Status",
                  cell: (item: any) => (
                    <Badge
                      variant={
                        item.status === "APPROVED"
                          ? "success"
                          : item.status === "REJECTED"
                          ? "error"
                          : "warning"
                      }
                      size="sm"
                    >
                      {item.status}
                    </Badge>
                  ),
                },
                {
                  header: "Admin Response",
                  cell: (item: any) => item.adminRemarks || "Pending institution review",
                },
              ]}
              data={requests}
              emptyMessage="No requests submitted."
            />
          </Card>
        </div>
      </div>
    </PortalLayout>
  );
}

