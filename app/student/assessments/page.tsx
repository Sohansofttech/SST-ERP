"use client";

import React, { useEffect, useState } from "react";
import { PortalLayout } from "@/components/layout/PortalLayout";
import { Card } from "@/components/shared/Card";
import { Badge } from "@/components/shared/Badge";
import { Table } from "@/components/shared/Table";
import { Award, FileText, CheckCircle2, ShieldCheck } from "lucide-react";

export default function InternalAssessmentsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssessments = async () => {
      try {
        const res = await fetch("/api/student/internal-assessments");
        const json = await res.json();
        if (json.success) setData(json.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAssessments();
  }, []);

  if (loading) {
    return (
      <PortalLayout portalType="STUDENT" pageTitle="Internal Assessments">
        <div className="py-20 text-center text-sm text-[#64748B]">Loading assessment marks...</div>
      </PortalLayout>
    );
  }

  const { assessments, subjectWise } = data || {};

  return (
    <PortalLayout portalType="STUDENT" pageTitle="Internal Assessments & Marks">
      <div className="mb-6 p-4 rounded-xl border border-blue-200 bg-blue-50 text-blue-900 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-[#2563EB] shrink-0 mt-0.5" />
        <div className="text-xs">
          <p className="font-bold uppercase tracking-wider">Internal Marks Protection Verified</p>
          <p className="mt-0.5 leading-relaxed">
            All internal assessment scores are protected with backend authorization checks and audit logged under Section 13.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Subject-Wise Assessment Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {subjectWise?.map((sub: any, idx: number) => (
            <Card
              key={idx}
              title={
                <div className="flex items-center justify-between w-full">
                  <span className="text-sm font-bold text-[#1E293B]">{sub.subjectName}</span>
                  <Badge variant="brand" size="sm">{sub.subjectCode}</Badge>
                </div>
              }
            >
              <div className="space-y-3">
                {sub.assessments.map((a: any) => (
                  <div key={a.id} className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] flex justify-between items-center text-xs">
                    <div>
                      <p className="font-semibold text-[#1E293B]">{a.assessmentName}</p>
                      <p className="text-[11px] text-[#64748B] mt-0.5">
                        Conducted: {new Date(a.conductedDate).toLocaleDateString()}
                      </p>
                      {a.remarks && <p className="text-[11px] text-emerald-700 italic mt-0.5">"{a.remarks}"</p>}
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-[#153B66]">
                        {a.marksObtained} / {a.maxMarks}
                      </span>
                      <span className="text-[10px] text-[#64748B] block">
                        Weight: {a.weightage}%
                      </span>
                    </div>
                  </div>
                ))}

                <div className="pt-2 flex justify-between items-center border-t border-[#E2E8F0] text-xs">
                  <span className="font-semibold text-[#64748B]">Cumulative IA Score:</span>
                  <span className="font-bold text-sm text-[#2563EB]">{sub.percentage}%</span>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Detailed Assessment History Table */}
        <Card title="Assessment History Ledger">
          <Table
            columns={[
              {
                header: "Date",
                cell: (item: any) => new Date(item.conductedDate).toLocaleDateString(),
              },
              {
                header: "Subject",
                cell: (item: any) => `${item.subject.code} — ${item.subject.name}`,
              },
              {
                header: "Assessment Name",
                accessorKey: "assessmentName",
              },
              {
                header: "Score Obtained",
                cell: (item: any) => (
                  <span className="font-bold text-[#1E293B]">
                    {item.marksObtained} / {item.maxMarks}
                  </span>
                ),
              },
              {
                header: "Weightage",
                cell: (item: any) => `${item.weightage}%`,
              },
              {
                header: "Evaluator Remarks",
                accessorKey: "remarks",
              },
            ]}
            data={assessments || []}
          />
        </Card>
      </div>
    </PortalLayout>
  );
}

