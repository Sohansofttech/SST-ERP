"use client";

import React, { useEffect, useState } from "react";
import { PortalLayout } from "@/components/layout/PortalLayout";
import { Card } from "@/components/shared/Card";
import { Badge } from "@/components/shared/Badge";
import { Button } from "@/components/shared/Button";
import { Modal } from "@/components/shared/Modal";
import { FormInput } from "@/components/shared/FormInput";
import { Table } from "@/components/shared/Table";
import { Users2, BookOpen, Calendar, Clock, Plus, ShieldCheck, CheckCircle2 } from "lucide-react";

export default function StudentMentoringPage() {
  const [mentoring, setMentoring] = useState<any[]>([]);
  const [logBook, setLogBook] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New log entry modal
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [activityType, setActivityType] = useState("PRACTICAL");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [entryDate, setEntryDate] = useState("");
  const [hoursSpent, setHoursSpent] = useState("2.5");
  const [submittingLog, setSubmittingLog] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [mRes, lRes] = await Promise.all([
        fetch("/api/student/mentoring").then((r) => r.json()),
        fetch("/api/student/logbook").then((r) => r.json()),
      ]);

      if (mRes.success) setMentoring(mRes.data);
      if (lRes.success) setLogBook(lRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingLog(true);
    try {
      const res = await fetch("/api/student/logbook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          activityType,
          title,
          description,
          entryDate,
          hoursSpent,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setIsLogModalOpen(false);
        setTitle("");
        setDescription("");
        fetchData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingLog(false);
    }
  };

  if (loading) {
    return (
      <PortalLayout portalType="STUDENT" pageTitle="Mentoring & Academic Log Book">
        <div className="py-20 text-center text-sm text-[#64748B]">Loading mentoring sessions...</div>
      </PortalLayout>
    );
  }

  return (
    <PortalLayout portalType="STUDENT" pageTitle="Faculty Mentoring & Academic Log Book">
      <div className="space-y-6">
        {/* Mentoring Sessions (Section 22) */}
        <Card
          title={
            <div className="flex items-center gap-2">
              <Users2 className="w-5 h-5 text-[#2563EB]" />
              <span>Faculty Mentoring Sessions & Guidance</span>
            </div>
          }
          subtitle="One-on-one academic, career, and research mentoring records"
        >
          <div className="space-y-4">
            {mentoring.map((m) => (
              <div
                key={m.id}
                className="p-5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E2E8F0] pb-2">
                  <div>
                    <h3 className="text-sm font-bold text-[#1E293B]">
                      Mentor: {m.mentorName} ({m.mentorDesignation})
                    </h3>
                    <p className="text-xs text-[#64748B]">
                      {m.mentorDepartment} • {m.mentorEmail}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#64748B]">
                      Session Date: {new Date(m.sessionDate).toLocaleDateString()}
                    </span>
                    {m.isPrivateNote && (
                      <Badge variant="warning" size="sm">Private Note</Badge>
                    )}
                  </div>
                </div>

                <div className="text-xs space-y-2">
                  <div>
                    <span className="font-semibold text-[#153B66]">Topics Discussed:</span>
                    <p className="text-[#1E293B] mt-0.5 leading-relaxed">{m.topicsDiscussed}</p>
                  </div>

                  {m.studentActionItems && (
                    <div className="p-3 bg-white rounded-lg border border-[#E2E8F0]">
                      <span className="font-semibold text-emerald-800">Student Action Items:</span>
                      <p className="text-[#1E293B] mt-0.5">{m.studentActionItems}</p>
                    </div>
                  )}

                  {m.mentorNotes && (
                    <div className="p-3 bg-blue-50/60 rounded-lg border border-blue-200">
                      <span className="font-semibold text-blue-900">Mentor Remarks:</span>
                      <p className="text-blue-950 mt-0.5">{m.mentorNotes}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Academic Log Book (Section 23) */}
        <Card
          title={
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#14B8A6]" />
              <span>Student Activity Log Book</span>
            </div>
          }
          subtitle="Practical laboratory hours, research projects, and supervisor endorsements"
          action={
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsLogModalOpen(true)}
              icon={<Plus className="w-4 h-4" />}
            >
              Add Log Entry
            </Button>
          }
        >
          <Table
            columns={[
              {
                header: "Date",
                cell: (item: any) => new Date(item.entryDate).toLocaleDateString(),
              },
              {
                header: "Category",
                cell: (item: any) => (
                  <Badge variant="brand" size="sm">{item.activityType}</Badge>
                ),
              },
              {
                header: "Activity Title",
                accessorKey: "title",
              },
              {
                header: "Hours Spent",
                cell: (item: any) => `${item.hoursSpent} hrs`,
              },
              {
                header: "Supervisor Sign Status",
                cell: (item: any) => (
                  <Badge
                    variant={item.status === "APPROVED" ? "success" : "warning"}
                    size="sm"
                  >
                    {item.status}
                  </Badge>
                ),
              },
              {
                header: "Supervisor Feedback",
                cell: (item: any) => item.supervisorFeedback || "Pending sign-off",
              },
            ]}
            data={logBook}
            emptyMessage="No log book entries recorded."
          />
        </Card>
      </div>

      {/* Log Book Entry Modal */}
      <Modal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        title="Record Academic Log Entry"
        subtitle="Lab practical or project verification"
      >
        <form onSubmit={handleLogSubmit} className="space-y-4">
          <div>
            <label className="block text-[13px] font-medium text-[#1E293B] mb-1">
              Activity Category
            </label>
            <select
              value={activityType}
              onChange={(e) => setActivityType(e.target.value)}
              className="w-full px-3.5 py-2 text-xs border border-[#E2E8F0] rounded-lg bg-white"
            >
              <option value="PRACTICAL">Lab Practical Experiment</option>
              <option value="PROJECT">Capstone / Course Project</option>
              <option value="RESEARCH">Research Paper / Survey</option>
              <option value="SEMINAR">Technical Seminar / Workshop</option>
            </select>
          </div>

          <FormInput
            label="Activity / Experiment Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Experiment 5: B-Tree Index Implementation"
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <FormInput
              label="Date of Activity"
              type="date"
              value={entryDate}
              onChange={(e) => setEntryDate(e.target.value)}
              required
            />
            <FormInput
              label="Hours Spent"
              type="number"
              step="0.5"
              value={hoursSpent}
              onChange={(e) => setHoursSpent(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-[13px] font-medium text-[#1E293B] mb-1">
              Description of Work Performed
            </label>
            <textarea
              className="w-full px-3.5 py-2 text-xs border border-[#E2E8F0] rounded-lg"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Outline steps, algorithms, code tests, and outcomes..."
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsLogModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={submittingLog}>
              Submit to Supervisor
            </Button>
          </div>
        </form>
      </Modal>
    </PortalLayout>
  );
}

