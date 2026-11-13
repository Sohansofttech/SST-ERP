export const superAdminNavigation = [
  { label: "Dashboard", href: "/admin", section: null, description: "Your platform at a glance, including key operational metrics and recent activity." },
  { label: "Institution Management", href: "/admin/institutions", section: "institutions", description: "Review and manage institutions registered on the SST-ERP platform." },
  { label: "Institution Onboarding", href: "/admin/onboarding", section: "onboarding", description: "Track institution registration steps and onboarding readiness." },
  { label: "Subscription Plans", href: "/admin/subscription-plans", section: "subscription-plans", description: "Create and manage the subscription plans available to institutions." },
  { label: "Subscriptions & Billing", href: "/admin/billing", section: "billing", description: "Review institution subscriptions, invoices, and platform billing." },
  { label: "Branding & Domains", href: "/admin/branding", section: "branding", description: "Configure institution branding and custom domain settings." },
  { label: "Domain Management", href: "/admin/domains", section: "domains", description: "Track institution domains and their verification status." },
  { label: "Module & Feature Management", href: "/admin/modules", section: "modules", description: "Control which platform modules and features are available to institutions." },
  { label: "Usage Monitoring", href: "/admin/usage", section: "usage", description: "Monitor platform usage and resource consumption across institutions." },
  { label: "Platform User Management", href: "/admin/users", section: "users", description: "Review and manage user accounts across the platform." },
  { label: "Support Management", href: "/admin/support", section: "support", description: "Coordinate support requests and service issues from institutions." },
  { label: "Support Access", href: "/admin/support-access", section: "support-access", description: "Review time-limited, ticket-linked support access requests." },
  { label: "Global Notifications", href: "/admin/notifications", section: "notifications", description: "Manage platform announcements and institution targeting." },
  { label: "Platform Audit Logs", href: "/admin/audit-logs", section: "audit-logs", description: "Review a traceable record of important platform events and actions." },
  { label: "Safe Deletion", href: "/admin/deletion", section: "deletion", description: "Review institution archive and deletion requests safely." },
  { label: "Global Settings", href: "/admin/settings", section: "settings", description: "Configure platform-wide settings and operational preferences." },
] as const;

export type SuperAdminSection = Exclude<(typeof superAdminNavigation)[number]["section"], null>;
