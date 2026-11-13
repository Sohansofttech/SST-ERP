"use client";

import React from "react";
import Link from "next/link";
import { useInstitution } from "@/lib/store";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Briefcase,
  Calendar,
  BookOpen,
  Building,
  Clock,
  ArrowRight,
  Sparkles,
  Layers,
  ShieldCheck,
  TrendingUp,
  FileText,
  AlertTriangle,
  CalendarCheck,
  FileSpreadsheet,
  Award,
  GraduationCap,
} from "lucide-react";

export default function DashboardPage() {
  const { stats, profile, activeAcademicYear, recentActivities, departments, courses } =
    useInstitution();

  return (
    <div className="space-y-6">
      {/* Top Header / Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[#E2E8F0]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-[#14B8A6] uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Institution Admin Portal
            </span>
            <span className="text-[#CBD5E1]">•</span>
            <span className="text-xs font-semibold text-[#64748B]">
              Administrative Console
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#1E293B] tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-sm text-[#64748B] mt-1">
            Live operational metrics and academic status for{" "}
            <strong className="text-[#153B66]">{profile.name}</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/admin/academics/academic-years">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Calendar className="w-4 h-4 text-[#2563EB]" />}
            >
              AY {activeAcademicYear?.name || "None"}
            </Button>
          </Link>
          <Link href="/admin/settings">
            <Button variant="primary" size="sm">
              Institution Settings
            </Button>
          </Link>
        </div>
      </div>

      {/* Institutional Overview Banner */}
      <div className="rounded-xl bg-gradient-to-r from-[#153B66] to-[#1E4D82] text-white p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#14B8A6] bg-[#14B8A6]/20 px-2.5 py-0.5 rounded border border-[#14B8A6]/30">
              Institutional Governance
            </span>
            <span className="text-xs text-[#93C5FD]">
              Academic Year {activeAcademicYear?.name || "2026-2027"} Active
            </span>
          </div>
          <h2 className="text-lg font-bold text-white">
            {profile.name} — Administrative Command Center
          </h2>
          <p className="text-xs text-[#CBD5E1] max-w-2xl">
            Configure institutional profile, academic cycles, degrees & programs, departments, student cohorts, curriculum subjects, and security roles.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Link href="/admin/settings">
            <Button variant="outline" size="sm" className="bg-white/10 hover:bg-white/20 text-white border-white/20">
              Institution Settings
            </Button>
          </Link>
        </div>
      </div>

      {/* Primary Metric KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        {/* Card 1: Total Students */}
        <Card className="border-l-4 border-l-[#2563EB]">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                  Total Enrolled Students
                </p>
                <h3 className="text-2xl font-bold text-[#1E293B] mt-1">
                  {stats.totalStudents.toLocaleString()}
                </h3>
                <div className="flex items-center gap-1 text-[11px] text-[#16A34A] font-semibold mt-1.5">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>+8.4% from prior term</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Total Staff */}
        <Card className="border-l-4 border-l-[#14B8A6]">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                  Faculty & Staff
                </p>
                <h3 className="text-2xl font-bold text-[#1E293B] mt-1">
                  {stats.totalStaff}
                </h3>
                <div className="flex items-center gap-1 text-[11px] text-[#64748B] font-medium mt-1.5">
                  <span>142 Teaching • 43 Admin</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-[#CCFBF1] text-[#0D9488] flex items-center justify-center">
                <Briefcase className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Active Academic Year */}
        <Card className="border-l-4 border-l-[#153B66]">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                  Active Academic Year
                </p>
                <h3 className="text-2xl font-bold text-[#153B66] mt-1">
                  {stats.activeAcademicYear}
                </h3>
                <div className="flex items-center gap-1.5 text-[11px] text-[#153B66] font-semibold mt-1.5">
                  <Badge variant="teal" size="sm">
                    Odd Semester Active
                  </Badge>
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-[#E0E7FF] text-[#153B66] flex items-center justify-center">
                <Calendar className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Pending Approvals */}
        <Card className="border-l-4 border-l-[#F59E0B]">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                  Pending Approvals
                </p>
                <h3 className="text-2xl font-bold text-[#D97706] mt-1">
                  {stats.pendingApprovals}
                </h3>
                <div className="flex items-center gap-1 text-[11px] text-[#D97706] font-semibold mt-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>5 Concessions • 3 Leaves</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-[#FEF3C7] text-[#D97706] flex items-center justify-center">
                <AlertTriangle className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Metric Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl bg-white border border-[#E2E8F0] shadow-xs">
        <Link href="/admin/admissions" className="text-center md:border-r border-[#F1F5F9] group">
          <span className="text-xs text-[#64748B] font-medium group-hover:text-[#2563EB]">New Admissions</span>
          <p className="text-xl font-bold text-[#1E293B] mt-0.5 group-hover:text-[#2563EB]">{stats.totalAdmissions ?? 6}</p>
        </Link>
        <Link href="/admin/students" className="text-center md:border-r border-[#F1F5F9] group">
          <span className="text-xs text-[#64748B] font-medium group-hover:text-[#2563EB]">Active Enrolled Students</span>
          <p className="text-xl font-bold text-[#1E293B] mt-0.5 group-hover:text-[#2563EB]">{stats.totalStudents}</p>
        </Link>
        <Link href="/admin/guardians" className="text-center md:border-r border-[#F1F5F9] group">
          <span className="text-xs text-[#64748B] font-medium group-hover:text-[#2563EB]">Registered Guardians</span>
          <p className="text-xl font-bold text-[#1E293B] mt-0.5 group-hover:text-[#2563EB]">{stats.totalGuardians ?? 7}</p>
        </Link>
        <Link href="/admin/staff" className="text-center group">
          <span className="text-xs text-[#64748B] font-medium group-hover:text-[#2563EB]">Institutional Staff</span>
          <p className="text-xl font-bold text-[#16A34A] mt-0.5 group-hover:text-[#2563EB]">
            {stats.totalStaff}
          </p>
        </Link>
      </div>

      {/* Quick Navigation Actions */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-[#1E293B]">Quick Administrative Actions</h3>
          <span className="text-xs text-[#64748B]">Frequently used administrative operations</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <Link href="/admin/admissions">
            <div className="p-3.5 rounded-xl bg-white border border-[#E2E8F0] hover:border-[#2563EB] hover:shadow-md transition-all text-center group cursor-pointer h-full flex flex-col items-center justify-center">
              <div className="w-9 h-9 rounded-lg bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
                <FileText className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-[#1E293B] group-hover:text-[#2563EB]">
                Admissions
              </span>
              <span className="text-[10px] text-[#64748B] mt-0.5">Intake & Enroll</span>
            </div>
          </Link>

          <Link href="/admin/students">
            <div className="p-3.5 rounded-xl bg-white border border-[#E2E8F0] hover:border-[#2563EB] hover:shadow-md transition-all text-center group cursor-pointer h-full flex flex-col items-center justify-center">
              <div className="w-9 h-9 rounded-lg bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
                <Users className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-[#1E293B] group-hover:text-[#2563EB]">
                Students
              </span>
              <span className="text-[10px] text-[#64748B] mt-0.5">Directory & Cohorts</span>
            </div>
          </Link>

          <Link href="/admin/guardians">
            <div className="p-3.5 rounded-xl bg-white border border-[#E2E8F0] hover:border-[#2563EB] hover:shadow-md transition-all text-center group cursor-pointer h-full flex flex-col items-center justify-center">
              <div className="w-9 h-9 rounded-lg bg-[#F0FDF4] text-[#16A34A] flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
                <Users className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-[#1E293B] group-hover:text-[#2563EB]">
                Guardians
              </span>
              <span className="text-[10px] text-[#64748B] mt-0.5">Parent Contacts</span>
            </div>
          </Link>

          <Link href="/admin/staff">
            <div className="p-3.5 rounded-xl bg-white border border-[#E2E8F0] hover:border-[#2563EB] hover:shadow-md transition-all text-center group cursor-pointer h-full flex flex-col items-center justify-center">
              <div className="w-9 h-9 rounded-lg bg-[#CCFBF1] text-[#0D9488] flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
                <Briefcase className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-[#1E293B] group-hover:text-[#2563EB]">
                Staff
              </span>
              <span className="text-[10px] text-[#64748B] mt-0.5">Faculty Directory</span>
            </div>
          </Link>

          <Link href="/admin/timetable">
            <div className="p-3.5 rounded-xl bg-white border border-[#E2E8F0] hover:border-[#2563EB] hover:shadow-md transition-all text-center group cursor-pointer h-full flex flex-col items-center justify-center">
              <div className="w-9 h-9 rounded-lg bg-[#FEF3C7] text-[#D97706] flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
                <Clock className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-[#1E293B] group-hover:text-[#2563EB]">
                Timetable
              </span>
              <span className="text-[10px] text-[#64748B] mt-0.5">Schedules & Venues</span>
            </div>
          </Link>

          <Link href="/admin/attendance">
            <div className="p-3.5 rounded-xl bg-white border border-[#E2E8F0] hover:border-[#2563EB] hover:shadow-md transition-all text-center group cursor-pointer h-full flex flex-col items-center justify-center">
              <div className="w-9 h-9 rounded-lg bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
                <CalendarCheck className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-[#1E293B] group-hover:text-[#2563EB]">
                Attendance
              </span>
              <span className="text-[10px] text-[#64748B] mt-0.5">Register & Alerts</span>
            </div>
          </Link>

          <Link href="/admin/examinations">
            <div className="p-3.5 rounded-xl bg-white border border-[#E2E8F0] hover:border-[#2563EB] hover:shadow-md transition-all text-center group cursor-pointer h-full flex flex-col items-center justify-center">
              <div className="w-9 h-9 rounded-lg bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-[#1E293B] group-hover:text-[#2563EB]">
                Examinations
              </span>
              <span className="text-[10px] text-[#64748B] mt-0.5">Cycles & Timetables</span>
            </div>
          </Link>

          <Link href="/admin/ia">
            <div className="p-3.5 rounded-xl bg-white border border-[#E2E8F0] hover:border-[#2563EB] hover:shadow-md transition-all text-center group cursor-pointer h-full flex flex-col items-center justify-center">
              <div className="w-9 h-9 rounded-lg bg-[#CCFBF1] text-[#0D9488] flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
                <Award className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-[#1E293B] group-hover:text-[#2563EB]">
                Internal Assessments
              </span>
              <span className="text-[10px] text-[#64748B] mt-0.5">CIA & Rubrics</span>
            </div>
          </Link>

          <Link href="/admin/results">
            <div className="p-3.5 rounded-xl bg-white border border-[#E2E8F0] hover:border-[#2563EB] hover:shadow-md transition-all text-center group cursor-pointer h-full flex flex-col items-center justify-center">
              <div className="w-9 h-9 rounded-lg bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
                <GraduationCap className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-[#1E293B] group-hover:text-[#2563EB]">
                Results & Transcripts
              </span>
              <span className="text-[10px] text-[#64748B] mt-0.5">Grades & SGPA</span>
            </div>
          </Link>

          <Link href="/admin/promotions">
            <div className="p-3.5 rounded-xl bg-white border border-[#E2E8F0] hover:border-[#2563EB] hover:shadow-md transition-all text-center group cursor-pointer h-full flex flex-col items-center justify-center">
              <div className="w-9 h-9 rounded-lg bg-[#FEF3C7] text-[#D97706] flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-[#1E293B] group-hover:text-[#2563EB]">
                Promotions & Standing
              </span>
              <span className="text-[10px] text-[#64748B] mt-0.5">Cohort Progression</span>
            </div>
          </Link>

          <Link href="/admin/certificates">
            <div className="p-3.5 rounded-xl bg-white border border-[#E2E8F0] hover:border-[#2563EB] hover:shadow-md transition-all text-center group cursor-pointer h-full flex flex-col items-center justify-center">
              <div className="w-9 h-9 rounded-lg bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
                <FileText className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-[#1E293B] group-hover:text-[#2563EB]">
                Certificates & Degrees
              </span>
              <span className="text-[10px] text-[#64748B] mt-0.5">Issuance & Registry</span>
            </div>
          </Link>

          <Link href="/admin/academics/departments">
            <div className="p-3.5 rounded-xl bg-white border border-[#E2E8F0] hover:border-[#2563EB] hover:shadow-md transition-all text-center group cursor-pointer h-full flex flex-col items-center justify-center">
              <div className="w-9 h-9 rounded-lg bg-[#CCFBF1] text-[#0D9488] flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
                <Building className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-[#1E293B] group-hover:text-[#2563EB]">
                Departments
              </span>
              <span className="text-[10px] text-[#64748B] mt-0.5">HOD & Faculty</span>
            </div>
          </Link>

          <Link href="/admin/academics/courses">
            <div className="p-3.5 rounded-xl bg-white border border-[#E2E8F0] hover:border-[#2563EB] hover:shadow-md transition-all text-center group cursor-pointer h-full flex flex-col items-center justify-center">
              <div className="w-9 h-9 rounded-lg bg-[#E0E7FF] text-[#153B66] flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
                <BookOpen className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-[#1E293B] group-hover:text-[#2563EB]">
                Courses
              </span>
              <span className="text-[10px] text-[#64748B] mt-0.5">Programs & Degrees</span>
            </div>
          </Link>

          <Link href="/admin/academics/classes">
            <div className="p-3.5 rounded-xl bg-white border border-[#E2E8F0] hover:border-[#2563EB] hover:shadow-md transition-all text-center group cursor-pointer h-full flex flex-col items-center justify-center">
              <div className="w-9 h-9 rounded-lg bg-[#FEF3C7] text-[#D97706] flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
                <Layers className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-[#1E293B] group-hover:text-[#2563EB]">
                Classes
              </span>
              <span className="text-[10px] text-[#64748B] mt-0.5">Batches & Rooms</span>
            </div>
          </Link>

          <Link href="/admin/roles-permissions">
            <div className="p-3.5 rounded-xl bg-white border border-[#E2E8F0] hover:border-[#2563EB] hover:shadow-md transition-all text-center group cursor-pointer h-full flex flex-col items-center justify-center">
              <div className="w-9 h-9 rounded-lg bg-[#FEE2E2] text-[#DC2626] flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-[#1E293B] group-hover:text-[#2563EB]">
                Roles & Access
              </span>
              <span className="text-[10px] text-[#64748B] mt-0.5">RBAC Matrix</span>
            </div>
          </Link>
        </div>
      </div>

      {/* Content Section: Departments Overview & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Departments Directory Summary (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="flex items-center justify-between">
              <div>
                <CardTitle>Departments & Program Capacity</CardTitle>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Core academic units managed within this institution
                </p>
              </div>
              <Link href="/admin/academics/departments">
                <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  View All
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-[#F1F5F9]">
                {departments.slice(0, 4).map((dept) => {
                  const deptCourses = courses.filter((c) => c.departmentId === dept.id);
                  return (
                    <div
                      key={dept.id}
                      className="p-4 hover:bg-[#F8FAFC] transition-colors flex items-center justify-between"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold bg-[#153B66] text-white px-2 py-0.5 rounded">
                            {dept.code}
                          </span>
                          <h4 className="text-sm font-semibold text-[#1E293B]">
                            {dept.name}
                          </h4>
                        </div>
                        <p className="text-xs text-[#64748B]">
                          HOD: <span className="font-medium text-[#1E293B]">{dept.headOfDepartment}</span> • {dept.facultyCount} Faculty
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-[#2563EB]">
                          {deptCourses.length} Programs
                        </span>
                        <p className="text-[11px] text-[#64748B]">
                          Cap: {dept.studentCapacity}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Administrative Activity Feed (1 Col) */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Recent Activity</CardTitle>
                <p className="text-xs text-[#64748B]">Audited operations in portal</p>
              </div>
              <Badge variant="teal" size="sm">
                Live Feed
              </Badge>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {recentActivities.map((act) => (
                <div key={act.id} className="flex items-start gap-3 text-xs">
                  <div className="w-2 h-2 rounded-full bg-[#2563EB] mt-1.5 shrink-0" />
                  <div className="space-y-0.5 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[#1E293B]">{act.action}</span>
                      <span className="text-[10px] text-[#94A3B8]">{act.timestamp}</span>
                    </div>
                    <p className="text-[#64748B] text-[11px]">{act.target}</p>
                    <p className="text-[10px] text-[#93C5FD] font-mono">{act.user}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
