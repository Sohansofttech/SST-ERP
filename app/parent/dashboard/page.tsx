"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { PortalLayout } from "@/components/layout/PortalLayout";
import { Card } from "@/components/shared/Card";
import { StatCard } from "@/components/shared/StatCard";
import { Badge } from "@/components/shared/Badge";
import { Button } from "@/components/shared/Button";
import { Table } from "@/components/shared/Table";
import {
  CheckCircle2,
  Calendar,
  CreditCard,
  Award,
  Users,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

export default function ParentDashboardPage() {
  const [selectedChildId, setSelectedChildId] = useState<string>("");
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchChildDashboard = async (childId: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/student/dashboard?studentId=${childId}`);
      const json = await res.json();
      if (json.success) {
        setDashboardData(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedChildId) {
      fetchChildDashboard(selectedChildId);
    }
  }, [selectedChildId]);

  const { student, attendanceSummary, todaySchedule, feeSummary, upcomingExams } = dashboardData || {};

  return (
    <PortalLayout
      portalType="PARENT"
      pageTitle="Guardian Overview & Child Monitoring"
      selectedChildId={selectedChildId}
      onSelectChild={(id) => {
        setSelectedChildId(id);
      }}
    >
      {/* Security & Access Guard Notice */}
      <div className="mb-6 p-4 rounded-xl border border-blue-200 bg-blue-50 text-blue-900 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-[#2563EB] shrink-0 mt-0.5" />
        <div className="text-xs">
          <p className="font-bold uppercase tracking-wider">Parent Access Isolation Active (Rule 2 & Section 27)</p>
          <p className="mt-0.5 leading-relaxed">
            Parent views are strictly locked to verified linked children only. Cross-child data leakage is blocked at the backend API layer. Private counseling/mentoring notes are suppressed.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-sm text-[#64748B]">Loading student records...</div>
      ) : (
        <>
          {/* Active Child Highlight Banner */}
          <div className="mb-6 bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#DBEAFE] text-[#2563EB] flex items-center justify-center font-bold text-xl">
                {student?.firstName?.[0]}
                {student?.lastName?.[0]}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-[#1E293B]">
                    {student?.firstName} {student?.lastName}
                  </h2>
                  <Badge variant="brand" size="sm">
                    Sem {student?.currentSemester} • Sec {student?.currentSection}
                  </Badge>
                </div>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Roll No: <span className="font-semibold text-[#1E293B]">{student?.rollNumber}</span> • Course:{" "}
                  <span className="font-semibold text-[#1E293B]">{student?.course}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link href={`/parent/requests?studentId=${student?.id}`}>
                <Button variant="outline" size="sm">
                  Submit Leave Request
                </Button>
              </Link>
            </div>
          </div>

          {/* 4 Child Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard
              title="Child Attendance"
              value={`${attendanceSummary?.attendancePercentage ?? 0}%`}
              subtitle={`${attendanceSummary?.attendedClasses ?? 0} of ${attendanceSummary?.totalClasses ?? 0} classes`}
              badgeText={attendanceSummary?.attendancePercentage >= 75 ? "Satisfactory" : "Low"}
              badgeVariant={attendanceSummary?.attendancePercentage >= 75 ? "success" : "error"}
              icon={<CheckCircle2 className="w-5 h-5 text-[#16A34A]" />}
            />
            <StatCard
              title="Today's Classes"
              value={`${todaySchedule?.length ?? 0} Lectures`}
              subtitle="Scheduled today"
              icon={<Calendar className="w-5 h-5 text-[#2563EB]" />}
            />
            <StatCard
              title="Fee Balance Due"
              value={feeSummary?.totalOutstanding > 0 ? `₹${feeSummary.totalOutstanding.toLocaleString()}` : "Zero Balance"}
              subtitle={feeSummary?.totalOutstanding > 0 ? "Semester 5 installment" : "All cleared"}
              badgeText={feeSummary?.totalOutstanding > 0 ? "Due Dec 15" : "Cleared"}
              badgeVariant={feeSummary?.totalOutstanding > 0 ? "warning" : "success"}
              icon={<CreditCard className="w-5 h-5 text-[#F59E0B]" />}
            />
            <StatCard
              title="Upcoming Exams"
              value={`${upcomingExams?.length ?? 0} Exams`}
              subtitle="Nov/Dec Finals"
              icon={<Award className="w-5 h-5 text-[#14B8A6]" />}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Child Schedule */}
            <div className="lg:col-span-2 space-y-6">
              <Card
                title={`${student?.firstName}'s Class Timetable for Today`}
                action={
                  <Link href={`/parent/timetable?studentId=${student?.id}`}>
                    <Button variant="ghost" size="sm" icon={<ArrowRight className="w-4 h-4" />}>
                      Full Timetable
                    </Button>
                  </Link>
                }
              >
                {todaySchedule?.length === 0 ? (
                  <p className="text-xs text-[#64748B]">No classes scheduled for today.</p>
                ) : (
                  <div className="space-y-3">
                    {todaySchedule?.map((slot: any) => (
                      <div
                        key={slot.id}
                        className="p-3.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] flex justify-between items-center text-xs"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[#2563EB]">{slot.subjectCode}</span>
                            <span className="font-semibold text-[#1E293B]">{slot.subjectName}</span>
                          </div>
                          <span className="text-[#64748B] text-[11px] block mt-0.5">
                            Teacher: {slot.teacherName} • Room {slot.roomNumber}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-[#153B66]">
                            {slot.startTime} - {slot.endTime}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              {/* Upcoming Examination Schedule */}
              <Card
                title="Upcoming Examinations"
                subtitle="Official exam timetable and hall ticket confirmation"
                action={
                  <Link href={`/parent/results?studentId=${student?.id}`}>
                    <Button variant="ghost" size="sm" icon={<ArrowRight className="w-4 h-4" />}>
                      View Results
                    </Button>
                  </Link>
                }
              >
                <div className="space-y-3">
                  {upcomingExams?.map((ex: any) => (
                    <div
                      key={ex.id}
                      className="p-3.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] flex justify-between items-center text-xs"
                    >
                      <div>
                        <h4 className="font-bold text-[#1E293B]">{ex.title}</h4>
                        <p className="text-[#64748B] text-[11px] mt-0.5">
                          Begins: {new Date(ex.startDate).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant="brand" size="sm">
                        Hall Ticket Issued
                      </Badge>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Quick Actions & Parent Fee Portal */}
            <div className="space-y-6">
              {feeSummary?.totalOutstanding > 0 && (
                <div className="p-5 rounded-2xl border border-amber-200 bg-amber-50 text-amber-900 space-y-3">
                  <div className="flex items-start gap-2.5">
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider">Fee Payment Due</h4>
                      <p className="text-xs mt-1">
                        Outstanding tuition fee balance for {student?.firstName}:
                      </p>
                      <p className="text-2xl font-black text-amber-950 mt-1">
                        ₹{feeSummary.totalOutstanding.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <Link href={`/parent/fees?studentId=${student?.id}`}>
                    <Button variant="primary" size="sm" className="w-full text-xs">
                      Settle Fees for {student?.firstName}
                    </Button>
                  </Link>
                </div>
              )}

              <Card title="Parent Quick Links">
                <div className="space-y-2">
                  <Link
                    href={`/parent/attendance?studentId=${student?.id}`}
                    className="p-3 rounded-lg border border-[#E2E8F0] hover:bg-[#F8FAFC] flex justify-between items-center text-xs block"
                  >
                    <span className="font-semibold text-[#1E293B]">Detailed Attendance Log</span>
                    <ArrowRight className="w-4 h-4 text-[#64748B]" />
                  </Link>
                  <Link
                    href={`/parent/results?studentId=${student?.id}`}
                    className="p-3 rounded-lg border border-[#E2E8F0] hover:bg-[#F8FAFC] flex justify-between items-center text-xs block"
                  >
                    <span className="font-semibold text-[#1E293B]">Examination Grades & CGPA</span>
                    <ArrowRight className="w-4 h-4 text-[#64748B]" />
                  </Link>
                  <Link
                    href={`/parent/mentoring?studentId=${student?.id}`}
                    className="p-3 rounded-lg border border-[#E2E8F0] hover:bg-[#F8FAFC] flex justify-between items-center text-xs block"
                  >
                    <span className="font-semibold text-[#1E293B]">Faculty Mentoring Progress</span>
                    <ArrowRight className="w-4 h-4 text-[#64748B]" />
                  </Link>
                  <Link
                    href={`/parent/requests?studentId=${student?.id}`}
                    className="p-3 rounded-lg border border-[#E2E8F0] hover:bg-[#F8FAFC] flex justify-between items-center text-xs block"
                  >
                    <span className="font-semibold text-[#1E293B]">Submit Leave / Inquiries</span>
                    <ArrowRight className="w-4 h-4 text-[#64748B]" />
                  </Link>
                </div>
              </Card>
            </div>
          </div>
        </>
      )}
    </PortalLayout>
  );
}
