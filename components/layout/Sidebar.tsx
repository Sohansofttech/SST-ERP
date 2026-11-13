"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  User,
  GraduationCap,
  Calendar,
  CheckCircle2,
  FileSpreadsheet,
  Award,
  CreditCard,
  BookOpen,
  Building2,
  Users2,
  MessageSquare,
  X,
  ShieldCheck,
  ChevronRight,
  LogOut,
} from "lucide-react";

interface SidebarProps {
  portalType: "STUDENT" | "PARENT";
  isOpen: boolean;
  onClose: () => void;
  selectedChildId?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  portalType,
  isOpen,
  onClose,
  selectedChildId,
}) => {
  const pathname = usePathname();

  const studentNavItems = [
    { label: "Dashboard", href: "/student/dashboard", icon: LayoutDashboard },
    { label: "Student Profile", href: "/student/profile", icon: User },
    { label: "Academic History", href: "/student/academic-history", icon: GraduationCap },
    { label: "Timetable", href: "/student/timetable", icon: Calendar },
    { label: "Attendance & In/Out", href: "/student/attendance", icon: CheckCircle2 },
    { label: "Internal Assessment", href: "/student/assessments", icon: FileSpreadsheet },
    { label: "Examinations & Results", href: "/student/examinations", icon: Award },
    { label: "Fees & Receipts", href: "/student/fees", icon: CreditCard },
    { label: "LMS & Assignments", href: "/student/lms", icon: BookOpen },
    { label: "Campus Services", href: "/student/campus-services", icon: Building2 },
    { label: "Mentoring & Log Book", href: "/student/mentoring", icon: Users2 },
    { label: "Feedback & Inquiries", href: "/student/feedback", icon: MessageSquare },
  ];

  const parentNavItems = [
    { label: "Child Dashboard", href: `/parent/dashboard`, icon: LayoutDashboard },
    { label: "Child Attendance", href: `/parent/attendance`, icon: CheckCircle2 },
    { label: "Class Timetable", href: `/parent/timetable`, icon: Calendar },
    { label: "Exam Results & Schedule", href: `/parent/results`, icon: Award },
    { label: "Fee Dues & Payments", href: `/parent/fees`, icon: CreditCard },
    { label: "Mentoring & Progress", href: `/parent/mentoring`, icon: Users2 },
    { label: "Institutional Requests", href: `/parent/requests`, icon: MessageSquare },
  ];

  const navItems = portalType === "PARENT" ? parentNavItems : studentNavItems;

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/me", { method: "POST" });
      window.location.href = "/login";
    } catch (e) {
      window.location.href = "/login";
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-[#153B66]/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 bottom-0 w-64 bg-[#153B66] text-white flex flex-col z-50 transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Institutional Brand Header */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-[#1E4F8A]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#2563EB] flex items-center justify-center font-bold text-white shadow-md">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-[15px] tracking-tight text-white block leading-tight">
                APEX ERP
              </span>
              <span className="text-[11px] text-[#14B8A6] font-medium tracking-wide uppercase">
                {portalType === "PARENT" ? "Guardian Portal" : "Student Portal"}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-300 hover:text-white lg:hidden rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => {
                  if (window.innerWidth < 1024) onClose();
                }}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-[14px] font-medium transition-all group ${
                  isActive
                    ? "bg-[#2563EB] text-white shadow-sm font-semibold"
                    : "text-slate-300 hover:text-white hover:bg-[#1E4F8A]/60"
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive ? "text-white" : "text-slate-300 group-hover:text-white"
                  }`}
                />
                <span className="flex-1 truncate">{item.label}</span>
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-white/70" />}
              </Link>
            );
          })}
        </div>

        {/* Footer Info & Sign out */}
        <div className="p-4 border-t border-[#1E4F8A] bg-[#0F2A4A]/50 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-300">
            <span>Apex Tech v1.0</span>
            <span className="text-[#14B8A6] font-semibold">Ay 2025-26</span>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-900/30 hover:bg-red-800/50 text-red-200 border border-red-700/40 rounded-lg text-xs font-semibold transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};
