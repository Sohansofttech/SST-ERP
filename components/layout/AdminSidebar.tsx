"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Settings,
  GraduationCap,
  Calendar,
  BookOpen,
  Building,
  Layers,
  BookMarked,
  UserPlus,
  Users,
  HeartHandshake,
  Briefcase,
  ShieldAlert,
  Clock,
  CalendarCheck,
  FileSpreadsheet,
  Award,
  TrendingUp,
  FileText,
  CreditCard,
  Home,
  Bus,
  CalendarDays,
  Shield,
  MessageSquare,
  CheckSquare,
  History,
  ChevronDown,
  Sparkles,
} from "lucide-react";

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname();
  const [academicsOpen, setAcademicsOpen] = useState(
    pathname.startsWith("/admin/academics") || pathname === "/admin"
  );

  const isAcademicsActive = pathname.startsWith("/admin/academics");

  const placeholderLinks = [
    { section: "Campus Services & Finance", href: "/admin/placeholder/fees-finance", label: "Fees & Finance", icon: CreditCard },
    { section: "Campus Services & Finance", href: "/admin/placeholder/hostel", label: "Hostel", icon: Home },
    { section: "Campus Services & Finance", href: "/admin/placeholder/transport", label: "Transport", icon: Bus },
    { section: "Campus Services & Finance", href: "/admin/placeholder/events-resources", label: "Events & Resources", icon: CalendarDays },
    { section: "Campus Services & Finance", href: "/admin/placeholder/gate-management", label: "Gate Management", icon: Shield },
    { section: "Campus Services & Finance", href: "/admin/placeholder/communication", label: "Communication", icon: MessageSquare },
    { section: "Campus Services & Finance", href: "/admin/placeholder/approvals", label: "Approvals", icon: CheckSquare },
    { section: "Campus Services & Finance", href: "/admin/placeholder/audit-logs", label: "Audit Logs", icon: History },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-[#0F172A]/50 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Panel - Fixed/Sticky on Desktop, Scrollable Independently */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#153B66] text-white flex flex-col transition-transform duration-300 ease-in-out shadow-xl",
          "lg:static lg:h-full lg:shrink-0 lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand / Logo Area (Fixed Top) */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-[#1E4D82] bg-[#0E2847] shrink-0">
          <Link href="/admin" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#2563EB] flex items-center justify-center font-black text-white text-base shadow-xs">
              SST
            </div>
            <div>
              <span className="text-sm font-extrabold tracking-wide text-white block leading-tight">
                SST ERP
              </span>
              <span className="text-[10px] uppercase font-bold text-[#14B8A6] tracking-wider block">
                Institution Admin
              </span>
            </div>
          </Link>
          <span className="text-[10px] font-semibold bg-[#14B8A6]/20 text-[#14B8A6] border border-[#14B8A6]/40 px-1.5 py-0.5 rounded">
            Admin
          </span>
        </div>

        {/* Navigation Items (Scrollable independently from main content) */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {/* Section: Main Administration */}
          <div className="px-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-[#93C5FD]/60">
            Main Administration
          </div>

          {/* 1. Dashboard */}
          <Link
            href="/admin"
            onClick={onClose}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-colors",
              pathname === "/admin"
                ? "bg-[#2563EB] text-white shadow-xs"
                : "text-[#E2E8F0] hover:bg-[#1E4D82] hover:text-white"
            )}
          >
            <LayoutDashboard className="w-4 h-4 shrink-0 text-[#93C5FD]" />
            <span>Dashboard</span>
            <span className="ml-auto text-[10px] bg-[#14B8A6] text-white px-1.5 py-0.2 rounded font-bold">
              Active
            </span>
          </Link>

          {/* 2. Institution Settings */}
          <Link
            href="/admin/settings"
            onClick={onClose}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-colors",
              pathname === "/admin/settings"
                ? "bg-[#2563EB] text-white shadow-xs"
                : "text-[#E2E8F0] hover:bg-[#1E4D82] hover:text-white"
            )}
          >
            <Settings className="w-4 h-4 shrink-0 text-[#93C5FD]" />
            <span>Institution Settings</span>
            <span className="ml-auto text-[10px] bg-[#14B8A6] text-white px-1.5 py-0.2 rounded font-bold">
              Active
            </span>
          </Link>

          {/* 3. Academics Collapsible Group */}
          <div>
            <button
              onClick={() => setAcademicsOpen(!academicsOpen)}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer",
                isAcademicsActive
                  ? "bg-[#1E4D82] text-white"
                  : "text-[#E2E8F0] hover:bg-[#1E4D82] hover:text-white"
              )}
            >
              <div className="flex items-center gap-3">
                <GraduationCap className="w-4 h-4 shrink-0 text-[#93C5FD]" />
                <span>Academics</span>
              </div>
              <ChevronDown
                className={cn(
                  "w-3.5 h-3.5 text-[#93C5FD] transition-transform duration-200",
                  academicsOpen && "rotate-180"
                )}
              />
            </button>

            {academicsOpen && (
              <div className="mt-1 ml-4 pl-3 border-l border-[#1E4D82] space-y-1">
                <Link
                  href="/admin/academics/academic-years"
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors",
                    pathname === "/admin/academics/academic-years"
                      ? "bg-[#2563EB] text-white font-semibold"
                      : "text-[#CBD5E1] hover:bg-[#1E4D82] hover:text-white"
                  )}
                >
                  <Calendar className="w-3.5 h-3.5 text-[#93C5FD]" />
                  <span>Academic Years</span>
                </Link>

                <Link
                  href="/admin/academics/courses"
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors",
                    pathname === "/admin/academics/courses"
                      ? "bg-[#2563EB] text-white font-semibold"
                      : "text-[#CBD5E1] hover:bg-[#1E4D82] hover:text-white"
                  )}
                >
                  <BookOpen className="w-3.5 h-3.5 text-[#93C5FD]" />
                  <span>Courses & Programs</span>
                </Link>

                <Link
                  href="/admin/academics/departments"
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors",
                    pathname === "/admin/academics/departments"
                      ? "bg-[#2563EB] text-white font-semibold"
                      : "text-[#CBD5E1] hover:bg-[#1E4D82] hover:text-white"
                  )}
                >
                  <Building className="w-3.5 h-3.5 text-[#93C5FD]" />
                  <span>Departments</span>
                </Link>

                <Link
                  href="/admin/academics/classes"
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors",
                    pathname === "/admin/academics/classes"
                      ? "bg-[#2563EB] text-white font-semibold"
                      : "text-[#CBD5E1] hover:bg-[#1E4D82] hover:text-white"
                  )}
                >
                  <Layers className="w-3.5 h-3.5 text-[#93C5FD]" />
                  <span>Classes & Sections</span>
                </Link>

                <Link
                  href="/admin/academics/subjects"
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors",
                    pathname === "/admin/academics/subjects"
                      ? "bg-[#2563EB] text-white font-semibold"
                      : "text-[#CBD5E1] hover:bg-[#1E4D82] hover:text-white"
                  )}
                >
                  <BookMarked className="w-3.5 h-3.5 text-[#93C5FD]" />
                  <span>Subjects</span>
                </Link>
              </div>
            )}
          </div>

          {/* 4. Roles & Permissions */}
          <Link
            href="/admin/roles-permissions"
            onClick={onClose}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-colors",
              pathname === "/admin/roles-permissions"
                ? "bg-[#2563EB] text-white shadow-xs"
                : "text-[#E2E8F0] hover:bg-[#1E4D82] hover:text-white"
            )}
          >
            <ShieldAlert className="w-4 h-4 shrink-0 text-[#93C5FD]" />
            <span>Roles & Permissions</span>
            <span className="ml-auto text-[10px] bg-[#14B8A6] text-white px-1.5 py-0.2 rounded font-bold">
              Active
            </span>
          </Link>

          {/* Section: People & Governance */}
          <div className="pt-3 px-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-[#93C5FD]/60">
            People & Governance
          </div>

          {/* 5. Admissions */}
          <Link
            href="/admin/admissions"
            onClick={onClose}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-colors",
              pathname.startsWith("/admin/admissions")
                ? "bg-[#2563EB] text-white shadow-xs"
                : "text-[#E2E8F0] hover:bg-[#1E4D82] hover:text-white"
            )}
          >
            <UserPlus className="w-4 h-4 shrink-0 text-[#93C5FD]" />
            <span>Admissions</span>
            <span className="ml-auto text-[10px] bg-[#14B8A6] text-white px-1.5 py-0.2 rounded font-bold">
              Active
            </span>
          </Link>

          {/* 6. Students */}
          <Link
            href="/admin/students"
            onClick={onClose}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-colors",
              pathname.startsWith("/admin/students")
                ? "bg-[#2563EB] text-white shadow-xs"
                : "text-[#E2E8F0] hover:bg-[#1E4D82] hover:text-white"
            )}
          >
            <Users className="w-4 h-4 shrink-0 text-[#93C5FD]" />
            <span>Students</span>
            <span className="ml-auto text-[10px] bg-[#14B8A6] text-white px-1.5 py-0.2 rounded font-bold">
              Active
            </span>
          </Link>

          {/* 7. Guardians */}
          <Link
            href="/admin/guardians"
            onClick={onClose}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-colors",
              pathname.startsWith("/admin/guardians")
                ? "bg-[#2563EB] text-white shadow-xs"
                : "text-[#E2E8F0] hover:bg-[#1E4D82] hover:text-white"
            )}
          >
            <HeartHandshake className="w-4 h-4 shrink-0 text-[#93C5FD]" />
            <span>Guardians</span>
            <span className="ml-auto text-[10px] bg-[#14B8A6] text-white px-1.5 py-0.2 rounded font-bold">
              Active
            </span>
          </Link>

          {/* 8. Staff Management */}
          <Link
            href="/admin/staff"
            onClick={onClose}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-colors",
              pathname.startsWith("/admin/staff")
                ? "bg-[#2563EB] text-white shadow-xs"
                : "text-[#E2E8F0] hover:bg-[#1E4D82] hover:text-white"
            )}
          >
            <Briefcase className="w-4 h-4 shrink-0 text-[#93C5FD]" />
            <span>Staff Management</span>
            <span className="ml-auto text-[10px] bg-[#14B8A6] text-white px-1.5 py-0.2 rounded font-bold">
              Active
            </span>
          </Link>

          {/* Section: Operations & Assessments */}
          <div className="pt-3 px-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-[#93C5FD]/60">
            Operations & Assessments
          </div>

          {/* Timetable Management */}
          <Link
            href="/admin/timetable"
            onClick={onClose}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-colors",
              pathname.startsWith("/admin/timetable")
                ? "bg-[#2563EB] text-white shadow-xs"
                : "text-[#E2E8F0] hover:bg-[#1E4D82] hover:text-white"
            )}
          >
            <Clock className="w-4 h-4 shrink-0 text-[#93C5FD]" />
            <span>Timetable</span>
            <span className="ml-auto text-[10px] bg-[#14B8A6] text-white px-1.5 py-0.2 rounded font-bold">
              Active
            </span>
          </Link>

          {/* Attendance Management */}
          <Link
            href="/admin/attendance"
            onClick={onClose}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-colors",
              pathname.startsWith("/admin/attendance")
                ? "bg-[#2563EB] text-white shadow-xs"
                : "text-[#E2E8F0] hover:bg-[#1E4D82] hover:text-white"
            )}
          >
            <CalendarCheck className="w-4 h-4 shrink-0 text-[#93C5FD]" />
            <span>Attendance</span>
            <span className="ml-auto text-[10px] bg-[#14B8A6] text-white px-1.5 py-0.2 rounded font-bold">
              Active
            </span>
          </Link>

          {/* Examinations Management */}
          <Link
            href="/admin/examinations"
            onClick={onClose}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-colors",
              pathname.startsWith("/admin/examinations")
                ? "bg-[#2563EB] text-white shadow-xs"
                : "text-[#E2E8F0] hover:bg-[#1E4D82] hover:text-white"
            )}
          >
            <FileSpreadsheet className="w-4 h-4 shrink-0 text-[#93C5FD]" />
            <span>Examinations</span>
            <span className="ml-auto text-[10px] bg-[#14B8A6] text-white px-1.5 py-0.2 rounded font-bold">
              Active
            </span>
          </Link>

          {/* Internal Assessments (Phase 4A) */}
          <Link
            href="/admin/ia"
            onClick={onClose}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-colors",
              pathname.startsWith("/admin/ia")
                ? "bg-[#2563EB] text-white shadow-xs"
                : "text-[#E2E8F0] hover:bg-[#1E4D82] hover:text-white"
            )}
          >
            <Award className="w-4 h-4 shrink-0 text-[#93C5FD]" />
            <span>Internal Assessments</span>
            <span className="ml-auto text-[10px] bg-[#14B8A6] text-white px-1.5 py-0.2 rounded font-bold">
              Active
            </span>
          </Link>

          {/* Results & Grade Cards (Phase 4C) */}
          <Link
            href="/admin/results"
            onClick={onClose}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-colors",
              pathname.startsWith("/admin/results")
                ? "bg-[#2563EB] text-white shadow-xs"
                : "text-[#E2E8F0] hover:bg-[#1E4D82] hover:text-white"
            )}
          >
            <GraduationCap className="w-4 h-4 shrink-0 text-[#93C5FD]" />
            <span>Results & Grade Cards</span>
            <span className="ml-auto text-[10px] bg-[#14B8A6] text-white px-1.5 py-0.2 rounded font-bold">
              Active
            </span>
          </Link>

          {/* Promotions & Academic Standing (Phase 4D) */}
          <Link
            href="/admin/promotions"
            onClick={onClose}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-colors",
              pathname.startsWith("/admin/promotions")
                ? "bg-[#2563EB] text-white shadow-xs"
                : "text-[#E2E8F0] hover:bg-[#1E4D82] hover:text-white"
            )}
          >
            <TrendingUp className="w-4 h-4 shrink-0 text-[#93C5FD]" />
            <span>Promotions & Standing</span>
            <span className="ml-auto text-[10px] bg-[#14B8A6] text-white px-1.5 py-0.2 rounded font-bold">
              Active
            </span>
          </Link>

          {/* Certificates & Degrees (Phase 4E) */}
          <Link
            href="/admin/certificates"
            onClick={onClose}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-colors",
              pathname.startsWith("/admin/certificates")
                ? "bg-[#2563EB] text-white shadow-xs"
                : "text-[#E2E8F0] hover:bg-[#1E4D82] hover:text-white"
            )}
          >
            <FileText className="w-4 h-4 shrink-0 text-[#93C5FD]" />
            <span>Certificates & Degrees</span>
            <span className="ml-auto text-[10px] bg-[#14B8A6] text-white px-1.5 py-0.2 rounded font-bold">
              Active
            </span>
          </Link>

          {placeholderLinks
            .filter((item) => item.section === "Operations & Assessments")
            .map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition-colors",
                    isActive
                      ? "bg-[#2563EB] text-white font-semibold shadow-xs"
                      : "text-[#CBD5E1] hover:bg-[#1E4D82] hover:text-white"
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-3.5 h-3.5 text-[#93C5FD]" />
                    <span>{item.label}</span>
                  </div>
                  <span
                    className={cn(
                      "text-[10px] px-1.5 py-0.5 rounded font-medium",
                      isActive
                        ? "bg-white/20 text-white font-bold"
                        : "text-[#93C5FD]/60 bg-white/5"
                    )}
                  >
                    Soon
                  </span>
                </Link>
              );
            })}

          {/* Section: Campus Services & Finance */}
          <div className="pt-3 px-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-[#93C5FD]/60">
            Campus Services & Finance
          </div>

          {placeholderLinks
            .filter((item) => item.section === "Campus Services & Finance")
            .map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition-colors",
                    isActive
                      ? "bg-[#2563EB] text-white font-semibold shadow-xs"
                      : "text-[#CBD5E1] hover:bg-[#1E4D82] hover:text-white"
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-3.5 h-3.5 text-[#93C5FD]" />
                    <span>{item.label}</span>
                  </div>
                  <span
                    className={cn(
                      "text-[10px] px-1.5 py-0.5 rounded font-medium",
                      isActive
                        ? "bg-white/20 text-white font-bold"
                        : "text-[#93C5FD]/60 bg-white/5"
                    )}
                  >
                    Soon
                  </span>
                </Link>
              );
            })}
        </div>

        {/* Footer info (Fixed Bottom) */}
        <div className="p-3 border-t border-[#1E4D82] bg-[#0E2847]/80 text-[11px] text-[#93C5FD] shrink-0">
          <div className="flex items-center gap-1.5 font-semibold text-white">
            <Sparkles className="w-3.5 h-3.5 text-[#14B8A6]" />
            <span>Institution Portal</span>
          </div>
          <p className="text-[10px] text-[#94A3B8] mt-0.5">
            SST ERP • Administration Suite
          </p>
        </div>
      </aside>
    </>
  );
};
