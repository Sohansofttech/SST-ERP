"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useInstitution } from "@/lib/store";
import {
  Menu,
  Bell,
  Calendar,
  Building2,
  ChevronDown,
  User,
  ShieldCheck,
  LogOut,
  Sparkles,
  ExternalLink,
} from "lucide-react";

interface AdminHeaderProps {
  onToggleSidebar: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ onToggleSidebar }) => {
  const router = useRouter();
  const { profile, activeAcademicYear, academicYears, setActiveAcademicYear } = useInstitution();
  const [showYearMenu, setShowYearMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-6 bg-white border-b border-[#E2E8F0] shadow-xs">
      {/* Left: Mobile Toggle & Institution Name */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg text-[#64748B] hover:text-[#1E293B] hover:bg-[#F1F5F9] transition-colors cursor-pointer"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-[#153B66] text-white font-bold shadow-xs">
            {profile.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.logoUrl} alt="Logo" className="w-9 h-9 rounded-lg object-cover" />
            ) : (
              <Building2 className="w-5 h-5 text-white" />
            )}
          </div>
          <div>
            <h1 className="text-sm md:text-base font-bold text-[#1E293B] leading-tight truncate max-w-[200px] sm:max-w-xs md:max-w-md">
              {profile.name}
            </h1>
            <p className="text-[11px] text-[#64748B] font-medium hidden sm:block">
              {profile.code} • {profile.type}
            </p>
          </div>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Portal Portal Home Switcher Link */}
        <Link
          href="/"
          className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#E2E8F0] text-xs font-medium text-[#64748B] hover:text-[#1E293B] hover:bg-[#F8FAFC] transition-colors"
          title="Return to Shared ERP Portal Selector"
        >
          <span>Main Portal</span>
          <ExternalLink className="w-3 h-3 text-[#64748B]" />
        </Link>

        {/* Active Academic Year Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowYearMenu(!showYearMenu)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] hover:bg-[#F1F5F9] text-[#1E293B] transition-colors cursor-pointer"
            title="Switch Active Academic Year"
          >
            <Calendar className="w-4 h-4 text-[#2563EB]" />
            <div className="text-left hidden md:block">
              <span className="text-[10px] uppercase font-semibold text-[#64748B] block leading-none">
                Academic Year
              </span>
              <span className="text-xs font-bold text-[#153B66] leading-none">
                {activeAcademicYear?.name || "Not Set"}
              </span>
            </div>
            <span className="text-xs font-bold text-[#153B66] md:hidden">
              {activeAcademicYear?.name}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-[#64748B]" />
          </button>

          {showYearMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-[#E2E8F0] p-1.5 z-40 animate-in fade-in zoom-in-95">
              <div className="px-3 py-2 text-[11px] font-bold text-[#64748B] uppercase tracking-wider border-b border-[#F1F5F9]">
                Select Active Year
              </div>
              <div className="py-1">
                {academicYears.map((ay) => (
                  <button
                    key={ay.id}
                    onClick={() => {
                      setActiveAcademicYear(ay.id);
                      setShowYearMenu(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg text-left transition-colors cursor-pointer ${
                      ay.isActive
                        ? "bg-[#EFF6FF] text-[#2563EB] font-bold"
                        : "text-[#1E293B] hover:bg-[#F8FAFC]"
                    }`}
                  >
                    <span>{ay.name}</span>
                    {ay.isActive && (
                      <span className="text-[10px] font-semibold bg-[#2563EB] text-white px-1.5 py-0.5 rounded">
                        Active
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg text-[#64748B] hover:text-[#1E293B] hover:bg-[#F1F5F9] transition-colors cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#2563EB] ring-2 ring-white" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-[#E2E8F0] p-3 z-40 animate-in fade-in">
              <div className="flex items-center justify-between pb-2 border-b border-[#F1F5F9]">
                <h4 className="text-xs font-bold text-[#1E293B]">Notifications</h4>
                <span className="text-[10px] text-[#2563EB] font-medium">3 unread</span>
              </div>
              <div className="py-2 space-y-2 text-xs">
                <div className="p-2 rounded-lg bg-[#EFF6FF] text-[#1E293B]">
                  <p className="font-semibold text-[#153B66]">Academic Year Activated</p>
                  <p className="text-[11px] text-[#64748B]">AY 2026-2027 is now the system active calendar.</p>
                </div>
                <div className="p-2 rounded-lg bg-[#F8FAFC] text-[#1E293B]">
                  <p className="font-semibold text-[#153B66]">Staff Registration</p>
                  <p className="text-[11px] text-[#64748B]">New faculty added in CSE department.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-[#F1F5F9] transition-colors cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-[#153B66] text-white flex items-center justify-center font-bold text-xs ring-2 ring-[#2563EB]/20">
              AD
            </div>
            <div className="hidden lg:block text-left leading-none">
              <span className="text-xs font-bold text-[#1E293B] block">Administrator</span>
              <span className="text-[11px] text-[#14B8A6] font-semibold">Institution Admin</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[#64748B] hidden lg:block" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-[#E2E8F0] p-1.5 z-40 animate-in fade-in">
              <div className="px-3 py-2 border-b border-[#F1F5F9]">
                <p className="text-xs font-bold text-[#1E293B]">Admin User</p>
                <p className="text-[11px] text-[#64748B]">admin@sohansoft.in</p>
                <div className="mt-1 flex items-center gap-1 text-[10px] text-[#14B8A6] font-bold">
                  <ShieldCheck className="w-3 h-3" /> System Administrator
                </div>
              </div>
              <div className="py-1">
                <Link
                  href="/admin/settings"
                  onClick={() => setShowProfileMenu(false)}
                  className="flex items-center gap-2 px-3 py-2 text-xs rounded-lg text-[#1E293B] hover:bg-[#F8FAFC]"
                >
                  <User className="w-3.5 h-3.5 text-[#64748B]" /> Institution Profile
                </Link>
                <Link
                  href="/admin/roles-permissions"
                  onClick={() => setShowProfileMenu(false)}
                  className="flex items-center gap-2 px-3 py-2 text-xs rounded-lg text-[#1E293B] hover:bg-[#F8FAFC]"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#2563EB]" /> Roles & Access
                </Link>
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    router.push("/admin/login");
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs rounded-lg text-[#DC2626] hover:bg-[#FEE2E2] text-left cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" /> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
