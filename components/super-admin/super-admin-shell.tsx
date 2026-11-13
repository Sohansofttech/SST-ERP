"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity, Bell, Building2, ChevronDown, CircleHelp, CreditCard, LayoutDashboard,
  Menu, Palette, Puzzle, Settings2, ShieldCheck, Users, X, ClipboardList, Globe2, KeyRound, Megaphone, Archive,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { superAdminNavigation } from "@/components/super-admin/navigation-items";
import { LogoutButton } from "@/components/super-admin/logout-button";

const navigationIcons: Record<string, LucideIcon> = {
  "/admin": LayoutDashboard, "/admin/institutions": Building2, "/admin/onboarding": ClipboardList,
  "/admin/subscription-plans": CreditCard, "/admin/billing": CreditCard, "/admin/branding": Palette,
  "/admin/domains": Globe2, "/admin/modules": Puzzle, "/admin/usage": Activity,
  "/admin/users": Users, "/admin/support": CircleHelp, "/admin/support-access": KeyRound,
  "/admin/notifications": Megaphone, "/admin/audit-logs": ShieldCheck,
  "/admin/deletion": Archive, "/admin/settings": Settings2,
};

export function SuperAdminShell({ children, userEmail, developmentMode = false }: { children: React.ReactNode; userEmail: string; developmentMode?: boolean }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const activeItem = superAdminNavigation.find((item) => item.href === pathname || (item.href !== "/admin" && pathname.startsWith(`${item.href}/`))) ?? superAdminNavigation[0];

  return (
    <div className="super-admin">
      {menuOpen && <button aria-label="Close navigation" className="sa-backdrop" onClick={() => setMenuOpen(false)} />}
      <aside className={`sa-sidebar ${menuOpen ? "sa-sidebar-open" : ""}`} aria-label="Super Admin navigation">
        <div className="sa-brand">
          <div className="sa-brand-mark"><LayoutDashboard size={21} /></div>
          <div><div className="sa-brand-title">SST-ERP</div><div className="sa-brand-caption">Platform Console</div></div>
        </div>
        <nav className="sa-nav">
          <div className="sa-nav-label">Platform</div>
          {superAdminNavigation.map(({ label, href }) => {
            const Icon = navigationIcons[href] ?? LayoutDashboard;
            const isActive = activeItem.href === href;
            return (
              <Link key={href} href={href} aria-current={isActive ? "page" : undefined} className={`sa-nav-item ${isActive ? "sa-nav-item-active" : ""}`} onClick={() => setMenuOpen(false)}>
                <Icon size={17} strokeWidth={1.8} /><span>{label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="sa-sidebar-footer">SST-ERP Platform · Development</div>
      </aside>
      <div className="sa-main">
        <header className="sa-header">
          <div className="sa-header-left">
            <button className="sa-mobile-menu" aria-label={menuOpen ? "Close menu" : "Open menu"} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X size={19} /> : <Menu size={19} />}
            </button>
            <div><h1>{activeItem.label}</h1><div className="sa-breadcrumb">Platform <span aria-hidden="true">/</span> {activeItem.label}</div></div>
          </div>
          <div className="sa-header-actions">
            {developmentMode && <span className="sa-dev-mode-indicator" role="status">Development Mode</span>}
            <button type="button" className="sa-icon-button" aria-label="Notifications (development placeholder)" title="Notifications are not connected yet">
              <Bell size={18} /><span className="sa-notification-dot" />
            </button>
            <div className="sa-profile" aria-label="Signed-in Super Admin profile">
              <div className="sa-avatar">SA</div>
              <div className="sa-profile-copy"><div className="sa-profile-name">Super Admin</div><div className="sa-profile-role">{userEmail}</div></div>
              <ChevronDown size={15} className="sa-profile-copy" color="#64748b" />
              {!developmentMode && <LogoutButton className="sa-logout-button" />}
            </div>
          </div>
        </header>
        <main className="sa-content">{children}</main>
      </div>
    </div>
  );
}
