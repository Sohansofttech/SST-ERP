import "server-only";
import { prisma } from "@/lib/super-admin/prisma";

/** Resolve plan entitlement and a temporary institution override on the server. */
export async function getInstitutionFeatureAccess(institutionId: string, featureCode: string) {
  const now = new Date();
  const [feature, subscription] = await Promise.all([
    prisma.platformFeature.findUnique({ where: { code: featureCode }, select: { id: true, isAvailable: true } }),
    prisma.institutionSubscription.findFirst({
      where: { institutionId, status: { in: ["ACTIVE", "TRIALING"] }, startsAt: { lte: now }, OR: [{ endsAt: null }, { endsAt: { gt: now } }] },
      orderBy: { startsAt: "desc" },
      select: { plan: { select: { isActive: true, features: { where: { feature: { code: featureCode } }, select: { enabled: true, limitValue: true } } } } },
    }),
  ]);

  if (!feature || !feature.isAvailable) return { allowed: false, limit: null, reason: "FEATURE_UNAVAILABLE" as const };
  if (!subscription?.plan.isActive) return { allowed: false, limit: null, reason: "NO_ACTIVE_SUBSCRIPTION" as const };

  const [planFeature] = subscription.plan.features;
  const override = await prisma.institutionFeatureOverride.findUnique({ where: { institutionId_featureId: { institutionId, featureId: feature.id } }, select: { enabled: true, expiresAt: true } });

  if (override && (!override.expiresAt || override.expiresAt > now)) {
    return { allowed: override.enabled, limit: planFeature?.limitValue ?? null, reason: override.enabled ? "INSTITUTION_OVERRIDE" as const : "INSTITUTION_DISABLED" as const };
  }
  if (!planFeature?.enabled) return { allowed: false, limit: null, reason: "NOT_INCLUDED_IN_PLAN" as const };
  return { allowed: true, limit: planFeature.limitValue, reason: "PLAN_ENTITLEMENT" as const };
}
