"use client";

import React, { useEffect, useState } from "react";
import { PortalLayout } from "@/components/layout/PortalLayout";
import { Card } from "@/components/shared/Card";
import { StatCard } from "@/components/shared/StatCard";
import { Badge } from "@/components/shared/Badge";
import { Table } from "@/components/shared/Table";
import { Award, CheckCircle2, ShieldCheck } from "lucide-react";

export default function ParentResultsPage() {
  const [selectedChildId, setSelectedChildId] = useState("");
  const [examData, setExamData] = useState<any>(null);
  const [iaData, setIaData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchResults = async (childId: string) => {
    try {
      setLoading(true);
      const [exRes, iaRes] = await Promise.all([
        fetch(`/api/student/examinations?studentId=${childId}`).then((r) => r.json()),
        fetch(`/api/student/internal-assessments?studentId=${childId}`).then((r) => r.json()),
      ]);

      if (exRes.success) setExamData(exRes.data);
      if (iaRes.success) setIaData(iaRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedChildId) fetchResults(selectedChildId);
  }, [selectedChildId]);

  const { results, cgpa, schedules, supplementaryExams } = examData || {};
  const { subjectWise } = iaData || {};

  return (
    <PortalLayout
      portalType="PARENT"
      pageTitle="Academic Results & Examination Grades"
      selectedChildId={selectedChildId}
      onSelectChild={(id) => setSelectedChildId(id)}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white border border-[#E2E8F0] p-6 rounded-2xl shadow-sm flex flex-col justify-center">
          <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">
            Cumulative Grade Point (CGPA)
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#153B66]">{cgpa || "N/A"}</span>
            <span className="text-xs text-[#64748B]">/ 10.00</span>
          </div>
          <Badge variant="success" size="sm" className="mt-2 w-fit">
            First Class Distinction
          </Badge>
        </div>

        <div className="md:col-span-2 bg-[#F8FAFC] border border-[#E2E8F0] p-6 rounded-2xl flex flex-col justify-center text-xs">
          <h3 className="font-bold text-[#1E293B] text-sm">Protected Gradebook Ledger</h3>
          <p className="text-[#64748B] mt-1 leading-relaxed">
            Grades and internal assessment marks are certified by the institutional controller of examinations. Parents may view their linked child's performance records but cannot modify protected academic marks.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Exam results */}
        <Card title="Published Examination Grades & Performance">
          <Table
            columns={[
              { header: "Exam Session", accessorKey: "examName" },
              { header: "Subject Code", accessorKey: "subjectCode" },
              { header: "Subject Name", accessorKey: "subjectName" },
              { header: "Total Marks (100)", accessorKey: "totalMarks" },
              {
                header: "Grade",
                cell: (item: any) => (
                  <Badge variant={item.grade === "A+" || item.grade === "A" ? "success" : "brand"} size="sm">
                    {item.grade}
                  </Badge>
                ),
              },
              { header: "Credits", accessorKey: "credits" },
              {
                header: "Result",
                cell: (item: any) => (
                  <Badge variant={item.isPassed ? "success" : "error"} size="sm">
                    {item.isPassed ? "PASS" : "RA"}
                  </Badge>
                ),
              },
            ]}
            data={results || []}
            emptyMessage="No examination results published."
          />
        </Card>

        {/* Internal Assessment Summary */}
        <Card title="Internal Assessment (IA) Progress">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {subjectWise?.map((sub: any, idx: number) => (
              <div key={idx} className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-[#1E293B]">{sub.subjectName}</span>
                  <Badge variant="brand" size="sm">{sub.subjectCode}</Badge>
                </div>
                <div className="flex justify-between text-[#64748B]">
                  <span>Total IA Score:</span>
                  <span className="font-bold text-[#153B66]">
                    {sub.totalMarksScored} / {sub.totalMaxMarks} ({sub.percentage}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </PortalLayout>
  );
}
