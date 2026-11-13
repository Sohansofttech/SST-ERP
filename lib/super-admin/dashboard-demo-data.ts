import "server-only";

export type DashboardDemoData = {
  statistics: {
    totalInstitutions: number;
    activeInstitutions: number;
    suspendedInstitutions: number;
    pendingOnboarding: number;
    totalStudents: number;
    totalTeachers: number;
    activeSubscriptions: number;
    monthlyRevenue: number;
    pendingPayments: number;
    storageBytes: number;
  };
  institutionGrowth: { month: string; institutions: number }[];
  monthlyRevenue: { month: string; amount: number }[];
  planDistribution: { plan: string; subscriptions: number }[];
  institutionStatus: { status: string; institutions: number; color: string }[];
  institutions: { name: string; type: string; location: string; plan: string; status: string; registeredAt: Date }[];
  activities: { id: string; action: string; actor: string; institution: string; occurredAt: Date }[];
  supportTickets: { id: string; subject: string; institution: string; priority: string; status: string; createdAt: Date }[];
  notifications: { id: string; title: string; audience: string; sentAt: Date; status: string }[];
};

export function isDashboardDemoEnabled() {
  return process.env.NODE_ENV === "development" && process.env.SUPER_ADMIN_DASHBOARD_DEMO === "true";
}

function daysAgo(days: number) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

export function getDashboardDemoData(): DashboardDemoData {
  return {
    statistics: {
      totalInstitutions: 128,
      activeInstitutions: 112,
      suspendedInstitutions: 5,
      pendingOnboarding: 11,
      totalStudents: 48620,
      totalTeachers: 3240,
      activeSubscriptions: 96,
      monthlyRevenue: 1875000,
      pendingPayments: 7,
      storageBytes: 1_932_735_283_200,
    },
    institutionGrowth: [
      { month: "Jun", institutions: 68 }, { month: "Jul", institutions: 77 },
      { month: "Aug", institutions: 89 }, { month: "Sep", institutions: 101 },
      { month: "Oct", institutions: 116 }, { month: "Nov", institutions: 128 },
    ],
    monthlyRevenue: [
      { month: "Dec", amount: 1120000 }, { month: "Jan", amount: 1240000 },
      { month: "Feb", amount: 1310000 }, { month: "Mar", amount: 1450000 },
      { month: "Apr", amount: 1530000 }, { month: "May", amount: 1620000 },
      { month: "Jun", amount: 1580000 }, { month: "Jul", amount: 1690000 },
      { month: "Aug", amount: 1740000 }, { month: "Sep", amount: 1810000 },
      { month: "Oct", amount: 1790000 }, { month: "Nov", amount: 1875000 },
    ],
    planDistribution: [
      { plan: "Starter", subscriptions: 38 },
      { plan: "Growth", subscriptions: 42 },
      { plan: "Enterprise", subscriptions: 16 },
    ],
    institutionStatus: [
      { status: "Active", institutions: 112, color: "#16a34a" },
      { status: "Pending", institutions: 11, color: "#f59e0b" },
      { status: "Suspended", institutions: 5, color: "#dc2626" },
    ],
    institutions: [
      { name: "Chennai Public School", type: "School", location: "Chennai, Tamil Nadu", plan: "Enterprise", status: "ACTIVE", registeredAt: daysAgo(1) },
      { name: "Greenfield Academy", type: "School", location: "Coimbatore, Tamil Nadu", plan: "Growth", status: "ACTIVE", registeredAt: daysAgo(3) },
      { name: "Sri Venkateswara College", type: "College", location: "Tirupati, Andhra Pradesh", plan: "Enterprise", status: "PENDING", registeredAt: daysAgo(5) },
      { name: "Bright Future Matriculation", type: "School", location: "Madurai, Tamil Nadu", plan: "Starter", status: "ACTIVE", registeredAt: daysAgo(8) },
      { name: "Riverdale Institute of Technology", type: "College", location: "Bengaluru, Karnataka", plan: "Growth", status: "SUSPENDED", registeredAt: daysAgo(12) },
    ],
    activities: [
      { id: "act-1", action: "Institution onboarding completed", actor: "Platform Operations", institution: "Greenfield Academy", occurredAt: daysAgo(0) },
      { id: "act-2", action: "Subscription plan upgraded", actor: "Billing Administrator", institution: "Chennai Public School", occurredAt: daysAgo(1) },
      { id: "act-3", action: "New institution application received", actor: "System", institution: "Sri Venkateswara College", occurredAt: daysAgo(2) },
      { id: "act-4", action: "Platform settings updated", actor: "Platform Super Admin", institution: "Platform-wide", occurredAt: daysAgo(3) },
    ],
    supportTickets: [
      { id: "SUP-2841", subject: "Unable to import student records", institution: "Greenfield Academy", priority: "High", status: "Open", createdAt: daysAgo(0) },
      { id: "SUP-2837", subject: "Request to update billing contact", institution: "Bright Future Matriculation", priority: "Normal", status: "In progress", createdAt: daysAgo(1) },
      { id: "SUP-2829", subject: "Custom domain verification assistance", institution: "Sri Venkateswara College", priority: "Normal", status: "Waiting", createdAt: daysAgo(2) },
    ],
    notifications: [
      { id: "notice-1", title: "Scheduled platform maintenance", audience: "All institutions", sentAt: daysAgo(1), status: "Published" },
      { id: "notice-2", title: "New term onboarding checklist", audience: "School administrators", sentAt: daysAgo(3), status: "Published" },
      { id: "notice-3", title: "Billing cycle reminder", audience: "Account owners", sentAt: daysAgo(5), status: "Scheduled" },
    ],
  };
}
