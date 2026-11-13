import { SessionUser } from "@/types";
import { ForbiddenError } from "../auth/session";

/**
 * Enforces that a record being accessed belongs strictly to the authenticated user's institution.
 * Rule 1: Every institution must have isolated data.
 * Rule 2: A user must not access records belonging to another institution.
 */
export function assertTenant(session: SessionUser, targetInstitutionId: string): void {
  if (session.role === "SUPER_ADMIN") return; // Super admin cross-tenant bypass permitted only for system audits

  if (session.institutionId !== targetInstitutionId) {
    throw new ForbiddenError("Tenant violation: cross-institution access is strictly forbidden.");
  }
}

/**
 * Attaches institutional scope to Prisma where filters.
 */
export function scopeToTenant<T extends Record<string, any>>(
  session: SessionUser,
  whereClause: T = {} as T
): T & { institutionId: string } {
  return {
    ...whereClause,
    institutionId: session.institutionId,
  };
}
