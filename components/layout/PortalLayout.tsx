"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

interface PortalLayoutProps {
  children: React.ReactNode;
  portalType: "STUDENT" | "PARENT";
  pageTitle?: string;
  selectedChildId?: string;
  onSelectChild?: (childId: string) => void;
}

export const PortalLayout: React.FC<PortalLayoutProps> = ({
  children,
  portalType,
  pageTitle,
  selectedChildId,
  onSelectChild,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<{
    fullName: string;
    role: string;
    institutionName: string;
  } | null>(null);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await fetch("/api/auth/me");
        const json = await res.json();
        if (json.success && json.data?.session) {
          setUser({
            fullName: json.data.session.fullName,
            role: json.data.session.role,
            institutionName: json.data.session.institutionName,
          });
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchMe();
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Shared Responsive Sidebar */}
      <Sidebar
        portalType={portalType}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        selectedChildId={selectedChildId}
      />

      {/* Main Content Area */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        <Header
          portalType={portalType}
          userFullName={user?.fullName || (portalType === "PARENT" ? "Robert Doe" : "John Doe")}
          userRole={user?.role || portalType}
          institutionName={user?.institutionName || "Apex Institute of Technology"}
          selectedChildId={selectedChildId}
          onSelectChild={onSelectChild}
          onMenuToggle={() => setSidebarOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {pageTitle && (
            <div className="mb-6">
              <h1 className="text-2xl sm:text-[28px] font-bold text-[#1E293B]">
                {pageTitle}
              </h1>
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
};

