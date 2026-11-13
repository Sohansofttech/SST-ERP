"use client";

import React, { useEffect, useState } from "react";
import { PortalLayout } from "@/components/layout/PortalLayout";
import { Card } from "@/components/shared/Card";
import { Badge } from "@/components/shared/Badge";
import { Users2, ShieldCheck, CheckCircle2 } from "lucide-react";

export default function ParentMentoringPage() {
  const [selectedChildId, setSelectedChildId] = useState("");
  const [mentoring, setMentoring] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMentoring = async (childId: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/student/mentoring?studentId=${childId}`);
      const json = await res.json();
      if (json.success) setMentoring(json.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedChildId) fetchMentoring(selectedChildId);
  }, [selectedChildId]);

  return (
    <PortalLayout
      portalType="PARENT"
      pageTitle="Child Faculty Mentoring Progress"
      selectedChildId={selectedChildId}
      onSelectChild={(id) => setSelectedChildId(id)}
    >
      <div className="mb-6 p-4 rounded-xl border border-blue-200 bg-blue-50 text-blue-900 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-[#2563EB] shrink-0 mt-0.5" />
        <div className="text-xs">
          <p className="font-bold uppercase tracking-wider">Parent Privacy Boundary Enforced (Section 22 & 27)</p>
          <p className="mt-0.5 leading-relaxed">
            Parents may view general academic mentoring progress and agreed action items. In accordance with Section 22, private counseling notes between student and faculty mentor are strictly hidden from guardian views.
          </p>
        </div>
      </div>

      <Card
        title="Faculty Mentoring Records & Meeting Schedules"
        subtitle="Permitted academic reviews and guidance sessions"
      >
        {loading ? (
          <p className="text-xs text-[#64748B]">Loading mentoring sessions...</p>
        ) : mentoring.length === 0 ? (
          <p className="text-xs text-[#64748B]">No permitted mentoring records available.</p>
        ) : (
          <div className="space-y-4">
            {mentoring.map((m) => (
              <div
                key={m.id}
                className="p-5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] space-y-3 text-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E2E8F0] pb-2">
                  <div>
                    <h4 className="font-bold text-[#1E293B]">
                      Mentor: {m.mentorName} ({m.mentorDesignation})
                    </h4>
                    <p className="text-[11px] text-[#64748B]">{m.mentorDepartment}</p>
                  </div>
                  <Badge variant="brand" size="sm">
                    Date: {new Date(m.sessionDate).toLocaleDateString()}
                  </Badge>
                </div>

                <div>
                  <span className="font-bold text-[#153B66]">Academic Review & Discussion:</span>
                  <p className="text-[#1E293B] mt-0.5 leading-relaxed">{m.topicsDiscussed}</p>
                </div>

                {m.studentActionItems && (
                  <div className="p-3 bg-white rounded-lg border border-[#E2E8F0]">
                    <span className="font-bold text-emerald-800">Child's Action Plan:</span>
                    <p className="text-[#1E293B] mt-0.5">{m.studentActionItems}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </PortalLayout>
  );
}
