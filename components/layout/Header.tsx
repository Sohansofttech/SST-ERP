"use client";

import React from "react";
import { Menu, School, User as UserIcon, LogOut } from "lucide-react";
import { NotificationDropdown } from "../shared/NotificationDropdown";
import { ChildSelector } from "../shared/ChildSelector";
import { Badge } from "../shared/Badge";

interface HeaderProps {
  portalType: "STUDENT" | "PARENT";
  userFullName?: string;
  userRole?: string;
  institutionName?: string;
  selectedChildId?: string;
  onSelectChild?: (childId: string) => void;
  onMenuToggle: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  portalType,
  userFullName = "User",
  userRole = "STUDENT",
  institutionName = "Apex Institute of Technology",
  selectedChildId,
  onSelectChild,
  onMenuToggle,
}) => {
  const handleLogout = async () => {
    try {
      await fetch("/api/auth/me", { method: "POST" });
      window.location.href = "/login";
    } catch {
      window.location.href = "/login";
    }
  };
  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-[#E2E8F0] shadow-sm flex items-center justify-between px-4 sm:px-6">
      {/* Left side: Mobile Toggle & Institution Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="p-2 -ml-2 text-[#64748B] hover:text-[#1E293B] hover:bg-[#F8FAFC] rounded-lg lg:hidden"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-[#64748B] font-medium">
            <School className="w-4 h-4 text-[#153B66]" />
            <span className="font-semibold text-[#1E293B]">{institutionName}</span>
          </div>
          <Badge variant="brand" size="sm" className="hidden md:inline-flex">
            {portalType === "PARENT" ? "Verified Guardian" : "Active Student"}
          </Badge>
        </div>
      </div>

      {/* Right side: Child Selector (for Parent), Notifications, User Profile */}
      <div className="flex items-center gap-3 sm:gap-4">
        {portalType === "PARENT" && onSelectChild && (
          <ChildSelector
            selectedChildId={selectedChildId}
            onSelectChild={onSelectChild}
          />
        )}

        <NotificationDropdown />

        <div className="h-6 w-px bg-[#E2E8F0]" />

        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#153B66] text-white flex items-center justify-center font-bold text-xs shadow-sm">
            {userFullName
              .split(" ")
              .map((n) => n[0])
              .join("")
              .substring(0, 2)
              .toUpperCase()}
          </div>
          <div className="hidden md:block text-left">
            <p className="text-xs font-semibold text-[#1E293B] leading-tight">
              {userFullName}
            </p>
            <p className="text-[11px] text-[#64748B] capitalize">{userRole.toLowerCase()}</p>
          </div>

          <button
            onClick={handleLogout}
            title="Log Out"
            className="p-1.5 text-[#64748B] hover:text-[#DC2626] hover:bg-[#FEE2E2]/60 rounded-lg transition-colors ml-1"
            aria-label="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
