"use client";

import React, { useEffect, useState } from "react";
import { PortalLayout } from "@/components/layout/PortalLayout";
import { Card } from "@/components/shared/Card";
import { Badge } from "@/components/shared/Badge";
import { Button } from "@/components/shared/Button";
import { FormInput } from "@/components/shared/FormInput";
import { Table } from "@/components/shared/Table";
import { MessageSquare, Send, CheckCircle2, Clock } from "lucide-react";

export default function StudentFeedbackPage() {
  const [feedbackList, setFeedbackList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [category, setCategory] = useState("ACADEMIC");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/student/feedback");
      const json = await res.json();
      if (json.success) setFeedbackList(json.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMsg(null);
    try {
      const res = await fetch("/api/student/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, subject, message }),
      });
      const json = await res.json();
      if (json.success) {
        setSuccessMsg("Feedback submitted successfully to institution administration.");
        setSubject("");
        setMessage("");
        fetchFeedback();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PortalLayout portalType="STUDENT" pageTitle="Student Grievances & Feedback">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Column */}
        <div>
          <Card
            title="Submit Institutional Feedback"
            subtitle="Academics, infrastructure, hostel, or general inquiries"
          >
            {successMsg && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[13px] font-medium text-[#1E293B] mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs border border-[#E2E8F0] rounded-lg bg-white"
                >
                  <option value="ACADEMIC">Academic / Curriculum</option>
                  <option value="INFRASTRUCTURE">Campus Infrastructure & Wi-Fi</option>
                  <option value="HOSTEL">Hostel & Dining Facility</option>
                  <option value="GENERAL">General Suggestion</option>
                </select>
              </div>

              <FormInput
                label="Subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Brief summary of feedback..."
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
                  placeholder="Provide detailed feedback or grievance for administrative review..."
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
                Submit Feedback
              </Button>
            </form>
          </Card>
        </div>

        {/* Responses Column */}
        <div className="lg:col-span-2">
          <Card
            title="Feedback & Official Responses"
            subtitle="Track resolution and department responses"
          >
            {loading ? (
              <p className="text-xs text-[#64748B]">Loading feedback history...</p>
            ) : (
              <Table
                columns={[
                  {
                    header: "Date",
                    cell: (item: any) => new Date(item.submittedAt).toLocaleDateString(),
                  },
                  {
                    header: "Category",
                    cell: (item: any) => <Badge variant="brand" size="sm">{item.category}</Badge>,
                  },
                  {
                    header: "Subject & Message",
                    cell: (item: any) => (
                      <div>
                        <span className="font-bold text-[#1E293B] block">{item.subject}</span>
                        <span className="text-xs text-[#64748B] line-clamp-1">{item.message}</span>
                      </div>
                    ),
                  },
                  {
                    header: "Status",
                    cell: (item: any) => (
                      <Badge
                        variant={item.status === "RESOLVED" ? "success" : "warning"}
                        size="sm"
                      >
                        {item.status}
                      </Badge>
                    ),
                  },
                  {
                    header: "Department Response",
                    cell: (item: any) =>
                      item.response ? (
                        <div className="p-2 bg-emerald-50 rounded border border-emerald-200 text-xs text-emerald-900">
                          {item.response}
                        </div>
                      ) : (
                        <span className="text-xs text-[#64748B] italic">Awaiting review</span>
                      ),
                  },
                ]}
                data={feedbackList}
                emptyMessage="No feedback submitted."
              />
            )}
          </Card>
        </div>
      </div>
    </PortalLayout>
  );
}

