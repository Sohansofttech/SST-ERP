"use client";

import React, { useEffect, useState } from "react";
import { PortalLayout } from "@/components/layout/PortalLayout";
import { Card } from "@/components/shared/Card";
import { StatCard } from "@/components/shared/StatCard";
import { Badge } from "@/components/shared/Badge";
import { Table } from "@/components/shared/Table";
import { CheckCircle2, Clock, XCircle, LogIn, LogOut } from "lucide-react";

export default function ParentAttendancePage() {
  const [selectedChildId, setSelectedChildId] = useState("");
  const [data, setData] = useState<any>(null);
  const [inOutLogs, setInOutLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAttendance = async (childId: string) => {
    try {
      setLoading(true);
      const [attRes, inOutRes] = await Promise.all([
        fetch(`/api/student/attendance?studentId=${childId}`).then((r) => r.json()),
        fetch(`/api/student/in-out?studentId=${childId}`).then((r) => r.json()),
      ]);

      if (attRes.success) setData(attRes.data);
      if (inOutRes.success) setInOutLogs(inOutRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedChildId) fetchAttendance(selectedChildId);
  }, [selectedChildId]);

  const { summary, subjectWise, monthlyAttendance, absenceHistory } = data || {};

  return (
    <PortalLayout
      portalType="PARENT"
      pageTitle="Child Attendance & Campus In/Out Tracking"
      selectedChildId={selectedChildId}
      onSelectChild={(id) => setSelectedChildId(id)}
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard
          title="Overall Attendance"
          value={`${summary?.overallPercentage ?? 0}%`}
          subtitle="Minimum 75% requirement"
          badgeText={summary?.overallPercentage >= 75 ? "Eligible" : "Attendance Shortage"}
          badgeVariant={summary?.overallPercentage >= 75 ? "success" : "error"}
          icon={<CheckCircle2 className="w-5 h-5 text-[#16A34A]" />}
        />
        <StatCard
          title="Classes Attended"
          value={`${summary?.attendedClasses ?? 0} / ${summary?.totalClasses ?? 0}`}
          subtitle="Total semester lectures"
          icon={<Clock className="w-5 h-5 text-[#2563EB]" />}
        />
        <StatCard
          title="Absences Logged"
          value={summary?.absentClasses ?? 0}
          subtitle={`${summary?.lateClasses ?? 0} late entries`}
          badgeText={summary?.absentClasses > 0 ? "Logged" : "Zero Absences"}
          badgeVariant={summary?.absentClasses > 0 ? "warning" : "success"}
          icon={<XCircle className="w-5 h-5 text-[#DC2626]" />}
        />
      </div>

      <div className="space-y-6">
        {/* Monthly Attendance Breakdown (STU-FE-06) */}
        <Card
          title="Monthly Attendance Summary"
          subtitle="Progressive monthly session tracking"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {monthlyAttendance?.map((m: any) => {
              const isGood = m.percentage >= 75;
              return (
                <div
                  key={m.monthYear}
                  className="p-3.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC]"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-[#153B66]">{m.monthYear}</span>
                    <Badge variant={isGood ? "success" : "error"} size="sm">
                      {isGood ? "Eligible" : "Shortage"}
                    </Badge>
                  </div>
                  <div className="text-xl font-extrabold text-[#1E293B]">
                    {m.percentage}%
                  </div>
                  <p className="text-[11px] text-[#64748B] mt-0.5">
                    {m.attendedClasses} of {m.totalClasses} classes
                  </p>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Subject wise breakdown */}
        <Card title="Subject-Wise Attendance Breakdown">
          <div className="space-y-3">
            {subjectWise?.map((sub: any) => (
              <div
                key={sub.subjectId}
                className="p-4 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#2563EB]">{sub.subjectCode}</span>
                    <h4 className="font-semibold text-[#1E293B]">{sub.subjectName}</h4>
                  </div>
                  <p className="text-[#64748B] text-[11px] mt-0.5">
                    Attended {sub.attendedClasses} out of {sub.totalClasses} classes
                  </p>
                </div>
                <div className="flex items-center gap-4 self-end sm:self-center">
                  <span className="text-base font-bold text-[#153B66]">{sub.percentage}%</span>
                  <Badge variant={sub.percentage >= 75 ? "success" : "error"} size="sm">
                    {sub.percentage >= 75 ? "Good" : "Low"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Absence history */}
        <Card title="Absence History & Faculty Remarks">
          <Table
            columns={[
              {
                header: "Date",
                cell: (item: any) => new Date(item.date).toLocaleDateString(),
              },
              { header: "Subject", accessorKey: "subjectCode" },
              { header: "Subject Name", accessorKey: "subjectName" },
              {
                header: "Status",
                cell: (item: any) => (
                  <Badge variant={item.status === "LATE" ? "warning" : "error"} size="sm">
                    {item.status}
                  </Badge>
                ),
              },
              { header: "Remarks", accessorKey: "remarks" },
            ]}
            data={absenceHistory || []}
            emptyMessage="No absences recorded."
          />
        </Card>

        {/* Campus In/Out Logs */}
        <Card title="Campus Gate In/Out Verification Logs">
          <Table
            columns={[
              {
                header: "Timestamp",
                cell: (item: any) => new Date(item.timestamp).toLocaleString(),
              },
              {
                header: "Gate Movement",
                cell: (item: any) => (
                  <Badge variant={item.logType === "ENTRY" ? "success" : "error"} size="sm">
                    {item.logType === "ENTRY" ? "CAMPUS ENTRY" : "CAMPUS EXIT"}
                  </Badge>
                ),
              },
              { header: "Gate Name", accessorKey: "gateName" },
              { header: "Checkpoint Device", accessorKey: "verifiedBy" },
            ]}
            data={inOutLogs}
            emptyMessage="No campus movements logged."
          />
        </Card>
      </div>
    </PortalLayout>
  );
}

