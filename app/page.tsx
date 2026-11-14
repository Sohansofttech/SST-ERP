"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  School,
  GraduationCap,
  Users,
  BookOpen,
  Building2,
  ShieldCheck,
  ArrowRight,
  LogOut,
  Sparkles,
  Lock,
  Clock,
} from "lucide-react";
import { Button } from "@/components/shared/Button";

export default function HomePage() {
  const [session, setSession] = useState<{
    fullName: string;
    role: string;
    institutionName: string;
  } | null>(null);

  // Check if user already has an active session
  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data?.session) {
          setSession({
            fullName: json.data.session.fullName,
            role: json.data.session.role,
            institutionName: json.data.session.institutionName,
          });
        }
      })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/me", { method: "POST" });
      setSession(null);
      window.location.reload();
    } catch {
      window.location.reload();
    }
  };

  const getDashboardHref = () => {
    if (!session) return "/login";
    if (session.role === "PARENT") return "/parent/dashboard";
    return "/student/dashboard";
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1E293B] flex flex-col justify-between font-sans selection:bg-[#2563EB] selection:text-white">
      {/* 1. Header Navigation */}
      <header className="bg-white border-b border-[#E2E8F0] shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-18">
            {/* Logo and Platform Name */}
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#153B66] to-[#1E293B] text-white flex items-center justify-center shadow-md">
                <School className="w-6 h-6 text-[#14B8A6]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-xl tracking-tight text-[#153B66]">
                    Sohan Soft Tech
                  </span>
                  <span className="bg-[#153B66] text-white text-[10px] font-bold px-1.5 py-0.5 rounded tracking-wider uppercase">
                    ERP
                  </span>
                </div>
                <p className="text-[11px] font-medium text-[#64748B]">
                  Smart Campus Management System
                </p>
              </div>
            </div>

            {/* Active Session Indicator */}
            {session && (
              <div className="flex items-center gap-3 bg-[#F1F5F9] pl-3 pr-1.5 py-1.5 rounded-xl border border-[#E2E8F0]">
                <div className="text-left text-xs">
                  <p className="font-bold text-[#1E293B] line-clamp-1">{session.fullName}</p>
                  <p className="text-[10px] text-[#64748B] font-medium uppercase tracking-wider">
                    {session.role}
                  </p>
                </div>
                <Link href={getDashboardHref()}>
                  <Button variant="primary" size="sm">
                    Go to Dashboard
                  </Button>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-1.5 text-[#64748B] hover:text-red-600 rounded-lg transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 2. Main Hero & 5 Portal Options */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 w-full flex flex-col justify-center">
        {/* Welcome Heading & Instruction */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#153B66]/5 border border-[#153B66]/15 text-[#153B66] text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5 text-[#14B8A6]" />
            <span>Institutional Access Gateway</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0F172A] tracking-tight leading-tight">
            Welcome to{" "}
            <span className="bg-gradient-to-r from-[#153B66] via-[#2563EB] to-[#14B8A6] bg-clip-text text-transparent">
              Sohan Soft Tech ERP
            </span>
          </h1>

          <p className="mt-4 text-base sm:text-lg text-[#64748B] font-medium">
            Select your portal to continue.
          </p>
        </div>

        {/* Five Login Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {/* Card 1: Student Login (Active) */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm hover:shadow-lg hover:border-[#2563EB] transition-all flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center group-hover:scale-105 transition-transform">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  Active
                </span>
              </div>
              <h2 className="text-lg font-bold text-[#153B66] group-hover:text-[#2563EB] transition-colors">
                Student Login
              </h2>
              <p className="text-xs text-[#64748B] mt-2 leading-relaxed">
                Access lecture timetables, attendance tracking, LMS coursework, examination grades, and fee payments.
              </p>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-100">
              <Link href="/login?role=student" className="block">
                <Button
                  variant="primary"
                  className="w-full justify-center bg-[#2563EB] hover:bg-[#1D4ED8] shadow-sm text-xs font-semibold py-2.5"
                  icon={<ArrowRight className="w-3.5 h-3.5" />}
                >
                  Student Login
                </Button>
              </Link>
            </div>
          </div>

          {/* Card 2: Parent Login (Active) */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm hover:shadow-lg hover:border-[#0D9488] transition-all flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-teal-50 text-[#0D9488] flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Users className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                  Active
                </span>
              </div>
              <h2 className="text-lg font-bold text-[#153B66] group-hover:text-[#0D9488] transition-colors">
                Parent Login
              </h2>
              <p className="text-xs text-[#64748B] mt-2 leading-relaxed">
                Monitor your linked children&apos;s daily presence, academic progress, fee balances, and campus announcements.
              </p>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-100">
              <Link href="/login?role=parent" className="block">
                <Button
                  variant="primary"
                  className="w-full justify-center bg-[#0D9488] hover:bg-[#0F766E] shadow-sm text-xs font-semibold py-2.5"
                  icon={<ArrowRight className="w-3.5 h-3.5" />}
                >
                  Parent Login
                </Button>
              </Link>
            </div>
          </div>

          {/* Card 3: Teacher Login (Placeholder - In Development) */}
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-6 shadow-xs flex flex-col justify-between relative">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center">
                  <BookOpen className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                  Coming Soon
                </span>
              </div>
              <h2 className="text-lg font-bold text-slate-700">
                Teacher Login
              </h2>
              <p className="text-xs text-[#64748B] mt-2 leading-relaxed">
                Faculty portal for lecture attendance recording, class schedule management, assignments, and exam grading.
              </p>
              <div className="mt-4 pt-3 border-t border-slate-100">
                <span className="inline-flex items-center gap-1.5 text-[11px] text-amber-600 font-medium">
                  <Clock className="w-3 h-3" />
                  In Development
                </span>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-100">
              <button
                type="button"
                disabled
                aria-disabled="true"
                className="w-full py-2.5 px-4 text-xs font-semibold rounded-xl bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed flex items-center justify-center gap-1.5"
              >
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>In Development</span>
              </button>
            </div>
          </div>

          {/* Card 4: Admin Login (Placeholder - In Development) */}
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-6 shadow-xs flex flex-col justify-between relative">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center">
                  <Building2 className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                  Coming Soon
                </span>
              </div>
              <h2 className="text-lg font-bold text-slate-700">
                Admin Login
              </h2>
              <p className="text-xs text-[#64748B] mt-2 leading-relaxed">
                Campus administration console for admissions, student records, fee approvals, and department management.
              </p>
              <div className="mt-4 pt-3 border-t border-slate-100">
                <span className="inline-flex items-center gap-1.5 text-[11px] text-amber-600 font-medium">
                  <Clock className="w-3 h-3" />
                  In Development
                </span>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-100">
              <button
                type="button"
                disabled
                aria-disabled="true"
                className="w-full py-2.5 px-4 text-xs font-semibold rounded-xl bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed flex items-center justify-center gap-1.5"
              >
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>In Development</span>
              </button>
            </div>
          </div>

          {/* Card 5: Super Admin Login (Placeholder - In Development) */}
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-6 shadow-xs flex flex-col justify-between relative">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                  Coming Soon
                </span>
              </div>
              <h2 className="text-lg font-bold text-slate-700">
                Super Admin Login
              </h2>
              <p className="text-xs text-[#64748B] mt-2 leading-relaxed">
                Platform-wide governance console for multi-tenant institution onboarding, system telemetry, and security.
              </p>
              <div className="mt-4 pt-3 border-t border-slate-100">
                <span className="inline-flex items-center gap-1.5 text-[11px] text-amber-600 font-medium">
                  <Clock className="w-3 h-3" />
                  In Development
                </span>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-100">
              <button
                type="button"
                disabled
                aria-disabled="true"
                className="w-full py-2.5 px-4 text-xs font-semibold rounded-xl bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed flex items-center justify-center gap-1.5"
              >
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>In Development</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* 3. Clean Footer */}
      <footer className="bg-white border-t border-[#E2E8F0] py-6 text-center text-xs text-[#64748B]">
        <div className="max-w-7xl mx-auto px-4">
          <p>© 2026 Sohan Soft Tech ERP. All rights reserved.</p>
          <p className="text-[11px] text-[#94A3B8] mt-1">
            Secure Student & Parent Campus Management System
          </p>
        </div>
      </footer>
    </div>
  );
}
