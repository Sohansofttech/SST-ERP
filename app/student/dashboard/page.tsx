"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { PortalLayout } from "@/components/layout/PortalLayout";
import { Card } from "@/components/shared/Card";
import { StatCard } from "@/components/shared/StatCard";
import { Badge } from "@/components/shared/Badge";
import { Button } from "@/components/shared/Button";
import {
  CheckCircle2,
  Calendar,
  CreditCard,
  Award,
  BookOpen,
  ArrowRight,
  Clock,
  MapPin,
  AlertTriangle,
  Building2,
  MessageSquare,
  Bell,
  FileText,
} from "lucide-react";

export default function StudentDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await fetch("/api/student/dashboard");
        const json = await res.json();
        if (json.success) {
          setData(json.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <PortalLayout portalType="STUDENT" pageTitle="Student Dashboard">
        <div className="py-20 text-center text-sm text-[#64748B]">
          Loading dashboard summary...
        </div>
      </PortalLayout>
    );
  }

  const {
    student,
    attendanceSummary,
    todaySchedule,
    feeSummary,
    upcomingExams,
    assignments,
    notifications,
    recentResults,
    cgpa,
  } = data || {};

  return (
    <PortalLayout portalType="STUDENT">
      {/* Student Profile Welcome Banner */}
      <div className="mb-6 bg-gradient-to-r from-[#153B66] to-[#1E4F8A] rounded-2xl p-6 text-white shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="brand" className="bg-white/20 text-white border-white/30 text-xs">
                {student?.academicYear}
              </Badge>
              <span className="text-xs text-white/80">Semester {student?.currentSemester} • Section {student?.currentSection}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold mt-2 text-white">
              Welcome back, {student?.firstName} {student?.lastName}!
            </h1>
            <p className="text-sm text-white/80 mt-1">
              Roll No: <span className="font-semibold text-white">{student?.rollNumber}</span> | Admission ID: <span className="font-semibold text-white">{student?.admissionNumber}</span> | {student?.course}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/student/profile">
              <Button variant="outline" size="sm" className="bg-white/10 hover:bg-white/20 text-white border-white/30">
                View Profile
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 4 Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Attendance"
          value={`${attendanceSummary?.attendancePercentage ?? 0}%`}
          subtitle={`${attendanceSummary?.attendedClasses ?? 0} of ${attendanceSummary?.totalClasses ?? 0} classes`}
          badgeText={attendanceSummary?.attendancePercentage >= 75 ? "Good Standing" : "Low Attendance"}
          badgeVariant={attendanceSummary?.attendancePercentage >= 75 ? "success" : "error"}
          icon={<CheckCircle2 className="w-5 h-5 text-[#16A34A]" />}
        />
        <StatCard
          title="Today's Schedule"
          value={`${todaySchedule?.length ?? 0} Classes`}
          subtitle="Timetable for today"
          icon={<Calendar className="w-5 h-5 text-[#2563EB]" />}
        />
        <StatCard
          title="Fee Status"
          value={feeSummary?.totalOutstanding > 0 ? `₹${feeSummary.totalOutstanding.toLocaleString()}` : "Fully Settled"}
          subtitle={feeSummary?.totalOutstanding > 0 ? "Pending Balance Due" : "No Pending Dues"}
          badgeText={feeSummary?.totalOutstanding > 0 ? "Due Dec 15" : "Paid"}
          badgeVariant={feeSummary?.totalOutstanding > 0 ? "warning" : "success"}
          icon={<CreditCard className="w-5 h-5 text-[#F59E0B]" />}
        />
        <StatCard
          title="Upcoming Exams"
          value={`${upcomingExams?.length ?? 0} Exams`}
          subtitle="Semester 5 Finals"
          badgeText={upcomingExams?.[0]?.hasHallTicket ? "Hall Ticket Ready" : "Schedule Released"}
          badgeVariant="info"
          icon={<Award className="w-5 h-5 text-[#14B8A6]" />}
        />
      </div>

      {/* Main Grid: Today's Schedule & Assignments / Exams */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Schedule */}
        <div className="lg:col-span-2 space-y-6">
          <Card
            title="Today's Classes & Lectures"
            subtitle="Follow your daily class schedule"
            action={
              <Link href="/student/timetable">
                <Button variant="ghost" size="sm" icon={<ArrowRight className="w-4 h-4" />}>
                  Weekly View
                </Button>
              </Link>
            }
          >
            {todaySchedule?.length === 0 ? (
              <p className="text-sm text-[#64748B]">No classes scheduled for today.</p>
            ) : (
              <div className="space-y-3">
                {todaySchedule?.map((slot: any) => (
                  <div
                    key={slot.id}
                    className="p-3.5 rounded-xl border border-[#E2E8F0] hover:border-[#2563EB] bg-[#F8FAFC] flex items-center justify-between transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="px-2.5 py-1.5 rounded-lg bg-white border border-[#E2E8F0] text-center min-w-[75px]">
                        <span className="text-xs font-bold text-[#153B66] block">
                          {slot.startTime}
                        </span>
                        <span className="text-[10px] text-[#64748B] block">
                          {slot.endTime}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#DBEAFE] text-[#2563EB]">
                            {slot.subjectCode}
                          </span>
                          <h3 className="text-sm font-semibold text-[#1E293B]">
                            {slot.subjectName}
                          </h3>
                        </div>
                        <p className="text-xs text-[#64748B] mt-0.5">
                          Faculty: {slot.teacherName}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-medium text-[#64748B] bg-white px-2.5 py-1 rounded-md border border-[#E2E8F0]">
                      <MapPin className="w-3.5 h-3.5 text-[#2563EB]" />
                      <span>{slot.roomNumber}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Pending Coursework & Assignments */}
          <Card
            title="Active Assignments & LMS Tasks"
            subtitle="Upcoming submission deadlines"
            action={
              <Link href="/student/lms">
                <Button variant="ghost" size="sm" icon={<ArrowRight className="w-4 h-4" />}>
                  LMS Portal
                </Button>
              </Link>
            }
          >
            <div className="space-y-3">
              {assignments?.map((item: any) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl border border-[#E2E8F0] flex items-center justify-between bg-white"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[#DBEAFE] text-[#2563EB] flex items-center justify-center shrink-0">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-[#1E293B]">{item.title}</h4>
                      <p className="text-xs text-[#64748B]">{item.subjectName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={item.isSubmitted ? "success" : "warning"} size="sm">
                      {item.isSubmitted ? "Submitted" : "Pending"}
                    </Badge>
                    <div className="flex items-center gap-1 text-[11px] text-[#64748B] mt-1">
                      <Clock className="w-3 h-3" />
                      <span>Due {new Date(item.dueDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Recent Examination Results & Academic Performance (STU-FE-02) */}
          <Card
            title="Recent Academic Results & Grades"
            subtitle={`Semester cumulative average • CGPA: ${cgpa !== undefined ? cgpa : "N/A"}`}
            action={
              <Link href="/student/examinations">
                <Button variant="ghost" size="sm" icon={<ArrowRight className="w-4 h-4" />}>
                  Full Transcript
                </Button>
              </Link>
            }
          >
            {recentResults?.length === 0 ? (
              <p className="text-xs text-[#64748B]">No recent published exam results.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {recentResults?.map((res: any) => (
                  <div
                    key={res.id}
                    className="p-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-between"
                  >
                    <div>
                      <span className="text-[11px] font-bold text-[#2563EB] bg-[#DBEAFE] px-2 py-0.5 rounded">
                        {res.subjectCode}
                      </span>
                      <h5 className="text-xs font-semibold text-[#1E293B] mt-1 line-clamp-1">
                        {res.subjectName}
                      </h5>
                      <span className="text-[11px] text-[#64748B]">Score: {res.totalMarks}/100</span>
                    </div>
                    <div className="text-right">
                      <span className="text-base font-extrabold text-[#153B66] block">
                        {res.grade}
                      </span>
                      <Badge variant={res.isPassed ? "success" : "error"} size="sm">
                        {res.isPassed ? "Passed" : "Arrear"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right Column: Upcoming Exams & Quick Links */}
        <div className="space-y-6">
          {/* Upcoming Examinations Card */}
          <Card
            title="Upcoming Examinations"
            subtitle="Official exam schedules & admit cards"
            action={
              <Link href="/student/examinations">
                <Button variant="ghost" size="sm" icon={<ArrowRight className="w-4 h-4" />}>
                  View All
                </Button>
              </Link>
            }
          >
            {upcomingExams?.length === 0 ? (
              <p className="text-xs text-[#64748B]">No upcoming exams scheduled.</p>
            ) : (
              <div className="space-y-3">
                {upcomingExams?.map((exam: any) => (
                  <div key={exam.id} className="p-3 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]">
                    <div className="flex items-center justify-between mb-1">
                      <Badge variant="error" size="sm">{exam.examType}</Badge>
                      <span className="text-xs text-[#64748B]">{exam.slotsCount} papers</span>
                    </div>
                    <h4 className="text-xs font-semibold text-[#1E293B] mt-1">{exam.title}</h4>
                    <p className="text-[11px] text-[#64748B] mt-0.5">
                      Starts: {new Date(exam.startDate).toLocaleDateString()}
                    </p>
                    {exam.hasHallTicket && (
                      <Link href="/student/examinations">
                        <Button variant="secondary" size="sm" className="w-full mt-2 text-xs py-1">
                          Download Admit Card
                        </Button>
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Quick Institutional Fee Alert */}
          {feeSummary?.totalOutstanding > 0 && (
            <div className="p-4 rounded-xl border border-amber-200 bg-amber-50 text-amber-900">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider">Fee Reminder</h4>
                  <p className="text-xs mt-1 leading-relaxed">
                    You have an outstanding balance of <span className="font-bold">₹{feeSummary.totalOutstanding.toLocaleString()}</span> for Semester 5.
                  </p>
                  <Link href="/student/fees">
                    <Button variant="primary" size="sm" className="mt-3 text-xs">
                      Pay Online Now
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Announcements & Institutional Circulars (STU-FE-02 & STU-FE-10) */}
          <Card
            title={
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-[#2563EB]" />
                <span>Announcements & Circulars</span>
              </div>
            }
            subtitle="Campus notices & academic updates"
          >
            {notifications?.length === 0 ? (
              <p className="text-xs text-[#64748B]">No recent announcements.</p>
            ) : (
              <div className="space-y-2.5">
                {notifications?.slice(0, 3).map((item: any) => (
                  <div
                    key={item.id}
                    className="p-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] hover:border-[#2563EB] transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-[#2563EB] uppercase">
                        {item.category}
                      </span>
                      <span className="text-[10px] text-[#64748B]">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h5 className="text-xs font-semibold text-[#1E293B] line-clamp-1">
                      {item.title}
                    </h5>
                    <p className="text-[11px] text-[#64748B] mt-0.5 line-clamp-2">
                      {item.message}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Quick Nav Links */}
          <Card title="Quick Services">
            <div className="grid grid-cols-2 gap-2">
              <Link href="/student/attendance" className="p-2.5 rounded-lg border border-[#E2E8F0] hover:bg-[#F8FAFC] text-center block">
                <CheckCircle2 className="w-5 h-5 text-[#16A34A] mx-auto mb-1" />
                <span className="text-xs font-medium text-[#1E293B]">Attendance</span>
              </Link>
              <Link href="/student/fees" className="p-2.5 rounded-lg border border-[#E2E8F0] hover:bg-[#F8FAFC] text-center block">
                <CreditCard className="w-5 h-5 text-[#2563EB] mx-auto mb-1" />
                <span className="text-xs font-medium text-[#1E293B]">Pay Fees</span>
              </Link>
              <Link href="/student/campus-services" className="p-2.5 rounded-lg border border-[#E2E8F0] hover:bg-[#F8FAFC] text-center block">
                <Building2 className="w-5 h-5 text-[#14B8A6] mx-auto mb-1" />
                <span className="text-xs font-medium text-[#1E293B]">Hostel & Bus</span>
              </Link>
              <Link href="/student/feedback" className="p-2.5 rounded-lg border border-[#E2E8F0] hover:bg-[#F8FAFC] text-center block">
                <MessageSquare className="w-5 h-5 text-[#F59E0B] mx-auto mb-1" />
                <span className="text-xs font-medium text-[#1E293B]">Feedback</span>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </PortalLayout>
  );
}
