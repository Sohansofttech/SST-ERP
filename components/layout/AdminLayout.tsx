"use client";

import React, { useState, Suspense } from "react";
import { usePathname } from "next/navigation";
import { InstitutionProvider } from "@/lib/store";
import { AdminHeader } from "./AdminHeader";
import { AdminSidebar } from "./AdminSidebar";

export const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";

  if (isLoginPage) {
    return (
      <InstitutionProvider>
        <div className="min-h-screen bg-[#F8FAFC]">
          <Suspense fallback={<div className="p-6 text-sm text-[#64748B]">Loading...</div>}>
            {children}
          </Suspense>
        </div>
      </InstitutionProvider>
    );
  }

  return (
    <InstitutionProvider>
      <div className="flex h-screen overflow-hidden bg-[#F8FAFC]">
        {/* Responsive Fixed/Sticky Left Sidebar with Independent Scrolling */}
        <Suspense fallback={<aside className="w-64 bg-[#153B66] shrink-0 h-screen hidden lg:block" />}>
          <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        </Suspense>

        {/* Main Content Area with Fixed Header and Independent Main Scrolling */}
        <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
          <Suspense fallback={<header className="h-16 bg-white border-b border-[#E2E8F0] shrink-0" />}>
            <AdminHeader onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />
          </Suspense>
          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
            <div className="max-w-7xl w-full mx-auto">
              <Suspense fallback={<div className="p-6 text-sm text-[#64748B]">Loading...</div>}>
                {children}
              </Suspense>
            </div>
          </main>
        </div>
      </div>
    </InstitutionProvider>
  );
};
