import "server-only";
import { prisma } from "@/lib/super-admin/prisma";

export async function getDashboardSummary(filter?: { from?: Date; until?: Date }) {
  const now = new Date();
  const nextThirtyDays = new Date(now);
  nextThirtyDays.setDate(nextThirtyDays.getDate() + 30);
  const activityPeriod = filter?.from || filter?.until ? { createdAt: { ...(filter.from ? { gte: filter.from } : {}), ...(filter.until ? { lt: filter.until } : {}) } } : {};

  const [
    totalInstitutions,
    activeInstitutions,
    suspendedInstitutions,
    pendingInstitutions,
    totalUsers,
    activeSubscriptions,
    expiredSubscriptions,
    activePlanPrices,
    recentInstitutions,
    recentAuditLogs,
    recentNotifications,
    expiringSubscriptions,
    failedPayments,
    openSupportTickets,
    storageMetric,
  ] = await Promise.all([
    prisma.platformInstitution.count(),
    prisma.platformInstitution.count({ where: { status: "ACTIVE" } }),
    prisma.platformInstitution.count({ where: { status: "SUSPENDED" } }),
    prisma.platformInstitution.count({ where: { status: "PENDING" } }),
    prisma.platformUser.count(),
    prisma.institutionSubscription.count({ where: { status: "ACTIVE", startsAt: { lte: now }, OR: [{ endsAt: null }, { endsAt: { gt: now } }] } }),
    prisma.institutionSubscription.count({ where: { OR: [{ status: "EXPIRED" }, { status: "ACTIVE", endsAt: { lte: now } }] } }),
    prisma.institutionSubscription.findMany({
      where: { status: "ACTIVE", startsAt: { lte: now }, OR: [{ endsAt: null }, { endsAt: { gt: now } }] },
      select: { plan: { select: { price: true, currency: true, billingCycle: true, customCycleDays: true } } },
    }),
    prisma.platformInstitution.findMany({
      where: activityPeriod,
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, name: true, type: true, status: true, createdAt: true },
    }),
    prisma.platformAuditLog.findMany({
      where: activityPeriod,
      orderBy: { createdAt: "desc" },
      take: 6,
      include: { user: { select: { name: true, email: true } }, institution: { select: { name: true } } },
    }),
    prisma.platformNotification.findMany({ where: { status: { in: ["PUBLISHED", "SCHEDULED"] } }, orderBy: { createdAt: "desc" }, take: 4, select: { id: true, title: true, status: true, createdAt: true } }),
    prisma.institutionSubscription.findMany({
      where: { status: "ACTIVE", startsAt: { lte: now }, endsAt: { gte: now, lte: nextThirtyDays } },
      orderBy: { endsAt: "asc" },
      take: 5,
      select: { id: true, endsAt: true, institution: { select: { name: true } } },
    }),
    prisma.payment.count({ where: { status: "FAILED" } }),
    prisma.supportTicket.count({ where: { status: { in: ["OPEN", "IN_PROGRESS", "WAITING_FOR_RESPONSE"] } } }),
    prisma.institutionUsageMetric.findMany({
      where: { metric: "storage_bytes" },
      distinct: ["institutionId"],
      orderBy: { measuredAt: "desc" },
      select: { value: true },
    }),
  ]);

  const totalsByCurrency = new Map<string, number>();
  for (const { plan } of activePlanPrices) {
    const price = Number(plan.price);
    const monthly = plan.billingCycle === "MONTHLY"
      ? price
      : plan.billingCycle === "QUARTERLY"
        ? price / 3
        : plan.billingCycle === "YEARLY"
          ? price / 12
          : plan.customCycleDays
            ? price * 30 / plan.customCycleDays
            : null;
    if (monthly !== null) totalsByCurrency.set(plan.currency, (totalsByCurrency.get(plan.currency) ?? 0) + monthly);
  }

  const monthlyRecurringRevenue = totalsByCurrency.size === 1
    ? { currency: [...totalsByCurrency.keys()][0], amount: [...totalsByCurrency.values()][0] }
    : totalsByCurrency.size === 0
      ? { currency: "INR", amount: 0 }
      : null;

  return {
    totalInstitutions,
    activeInstitutions,
    suspendedInstitutions,
    pendingInstitutions,
    totalUsers,
    activeSubscriptions,
    expiredSubscriptions,
    monthlyRecurringRevenue,
    recentInstitutions,
    recentAuditLogs,
    recentNotifications,
    expiringSubscriptions,
    failedPayments,
    openSupportTickets,
    storageBytes: storageMetric.length === 0 ? null : storageMetric.reduce((total, metric) => total + Number(metric.value), 0),
  };
}

export type DashboardSummary = Awaited<ReturnType<typeof getDashboardSummary>>;
