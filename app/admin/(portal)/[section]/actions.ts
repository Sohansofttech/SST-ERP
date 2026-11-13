"use server";

import { revalidatePath } from "next/cache";
import { resolveTxt } from "node:dns/promises";
import { z } from "zod";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/super-admin/prisma";
import { requireSuperAdmin } from "@/lib/super-admin/require-super-admin";

async function audited(actorId: string | null, action: string, entity: string, entityId: string | null, change: (tx: Prisma.TransactionClient) => Promise<unknown>) {
  await prisma.$transaction(async (tx) => {
    await change(tx);
    await tx.auditLog.create({ data: { userId: actorId, action, entity, entityId, result: "SUCCESS", requestId: crypto.randomUUID() } });
  });
  revalidatePath("/admin");
}

export async function createPlan(formData: FormData) {
  const actor = await requireSuperAdmin();
  const optionalInteger = z.preprocess((value) => value === "" || value === undefined ? undefined : value, z.coerce.number().int().min(1).max(100000000).optional());
  const input = z.object({ code: z.string().trim().toUpperCase().regex(/^[A-Z0-9_-]{2,40}$/), name: z.string().trim().min(2).max(120), description: z.string().trim().max(500).optional(), price: z.coerce.number().min(0).max(100000000), currency: z.string().trim().toUpperCase().regex(/^[A-Z]{3}$/), billingCycle: z.enum(["MONTHLY", "QUARTERLY", "YEARLY", "CUSTOM"]), customCycleDays: z.preprocess((value) => value === "" || value === undefined ? undefined : value, z.coerce.number().int().min(1).max(3650).optional()), maxUsers: optionalInteger, storageLimitMb: optionalInteger }).safeParse(Object.fromEntries(formData.entries()));
  if (!input.success) throw new Error(input.error.issues[0]?.message ?? "Invalid plan fields.");
  const data = input.data;
  if (data.billingCycle === "CUSTOM" && !data.customCycleDays) throw new Error("Custom billing cycles need a cycle length in days.");
  const plan = await prisma.$transaction(async (tx) => {
    const created = await tx.subscriptionPlan.create({ data: { ...data, description: data.description || null, customCycleDays: data.billingCycle === "CUSTOM" ? data.customCycleDays : null, maxUsers: data.maxUsers || null, storageLimitMb: data.storageLimitMb ? BigInt(data.storageLimitMb) : null, createdById: actor.id } });
    await tx.auditLog.create({ data: { userId: actor.id, action: "SUBSCRIPTION_PLAN_CREATED", entity: "SubscriptionPlan", entityId: created.id, result: "SUCCESS" } });
    return created;
  });
  void plan;
  revalidatePath("/admin/subscription-plans");
}

export async function updatePlan(formData: FormData) {
  const actor = await requireSuperAdmin();
  const optionalInteger = z.preprocess((value) => value === "" || value === undefined ? undefined : value, z.coerce.number().int().min(1).max(100000000).optional());
  const input = z.object({ id: z.uuid(), code: z.string().trim().toUpperCase().regex(/^[A-Z0-9_-]{2,40}$/), name: z.string().trim().min(2).max(120), description: z.string().trim().max(500).optional(), price: z.coerce.number().min(0).max(100000000), currency: z.string().trim().toUpperCase().regex(/^[A-Z]{3}$/), billingCycle: z.enum(["MONTHLY", "QUARTERLY", "YEARLY", "CUSTOM"]), customCycleDays: z.preprocess((value) => value === "" || value === undefined ? undefined : value, z.coerce.number().int().min(1).max(3650).optional()), maxUsers: optionalInteger, storageLimitMb: optionalInteger }).safeParse(Object.fromEntries(formData.entries()));
  if (!input.success) throw new Error(input.error.issues[0]?.message ?? "Invalid plan details.");
  const prior = await prisma.subscriptionPlan.findUnique({ where: { id: input.data.id }, include: { _count: { select: { subscriptions: true } } } });
  if (!prior || prior.archivedAt) throw new Error("Plan not found or archived.");
  if (input.data.billingCycle === "CUSTOM" && !input.data.customCycleDays) throw new Error("Custom plans need a cycle length in days.");
  const priorStorageLimit = prior.storageLimitMb === null ? null : Number(prior.storageLimitMb);
  const financialChanged = Number(prior.price) !== input.data.price || prior.currency !== input.data.currency || prior.billingCycle !== input.data.billingCycle || prior.customCycleDays !== (input.data.customCycleDays ?? null) || prior.maxUsers !== (input.data.maxUsers ?? null) || priorStorageLimit !== (input.data.storageLimitMb ?? null);
  if (prior._count.subscriptions > 0 && financialChanged) throw new Error("This plan already has subscriptions. To preserve existing subscription terms, create a new plan for future customers and update only its name or description.");
  await prisma.$transaction(async (tx) => {
    await tx.subscriptionPlan.update({ where: { id: prior.id }, data: { code: input.data.code, name: input.data.name, description: input.data.description || null, price: input.data.price, currency: input.data.currency, billingCycle: input.data.billingCycle, customCycleDays: input.data.billingCycle === "CUSTOM" ? input.data.customCycleDays : null, maxUsers: input.data.maxUsers ?? null, storageLimitMb: input.data.storageLimitMb ? BigInt(input.data.storageLimitMb) : null } });
    await tx.auditLog.create({ data: { userId: actor.id, action: "SUBSCRIPTION_PLAN_UPDATED", entity: "SubscriptionPlan", entityId: prior.id, result: "SUCCESS" } });
  });
  revalidatePath("/admin/subscription-plans");
}

export async function archivePlan(formData: FormData) {
  const actor = await requireSuperAdmin();
  const id = z.uuid().safeParse(formData.get("id"));
  if (!id.success) throw new Error("Invalid plan.");
  await prisma.$transaction(async (tx) => {
    const plan = await tx.subscriptionPlan.update({ where: { id: id.data, archivedAt: null }, data: { isActive: false, archivedAt: new Date() } });
    await tx.auditLog.create({ data: { userId: actor.id, action: "SUBSCRIPTION_PLAN_ARCHIVED", entity: "SubscriptionPlan", entityId: plan.id, result: "SUCCESS" } });
  });
  revalidatePath("/admin/subscription-plans");
}

export async function setPlanActive(formData: FormData) {
  const actor = await requireSuperAdmin();
  const input = z.object({ id: z.uuid(), active: z.enum(["true", "false"]) }).safeParse(Object.fromEntries(formData.entries()));
  if (!input.success) throw new Error("Invalid plan status change.");
  await prisma.$transaction(async (tx) => {
    await tx.subscriptionPlan.update({ where: { id: input.data.id, archivedAt: null }, data: { isActive: input.data.active === "true" } });
    await tx.auditLog.create({ data: { userId: actor.id, action: "SUBSCRIPTION_PLAN_STATUS_CHANGED", entity: "SubscriptionPlan", entityId: input.data.id, result: "SUCCESS", metadata: { active: input.data.active === "true" } } });
  });
  revalidatePath("/admin/subscription-plans");
}

export async function createInstitutionSubscription(formData: FormData) {
  const actor = await requireSuperAdmin();
  const input = z.object({ institutionId: z.uuid(), planId: z.uuid(), startsAt: z.string().optional(), endsAt: z.string().optional() }).safeParse(Object.fromEntries(formData.entries()));
  if (!input.success) throw new Error("Select an institution and an active plan.");
  const plan = await prisma.subscriptionPlan.findUnique({ where: { id: input.data.planId }, select: { isActive: true, archivedAt: true } });
  if (!plan?.isActive || plan.archivedAt) throw new Error("The selected plan is not active.");
  const startsAt = input.data.startsAt ? new Date(`${input.data.startsAt}T00:00:00.000Z`) : new Date();
  const endsAt = input.data.endsAt ? new Date(`${input.data.endsAt}T00:00:00.000Z`) : null;
  if (Number.isNaN(startsAt.getTime()) || (endsAt && Number.isNaN(endsAt.getTime()))) throw new Error("Enter valid subscription dates.");
  if (endsAt && endsAt <= startsAt) throw new Error("Subscription expiry must be after its start date.");
  await prisma.$transaction(async (tx) => {
    const subscription = await tx.institutionSubscription.create({ data: { institutionId: input.data.institutionId, planId: input.data.planId, createdById: actor.id, startsAt, endsAt, status: "ACTIVE" } });
    await tx.subscriptionEvent.create({ data: { subscriptionId: subscription.id, actorId: actor.id, action: "ASSIGNED", details: { planId: input.data.planId } } });
    await tx.auditLog.create({ data: { userId: actor.id, institutionId: input.data.institutionId, action: "SUBSCRIPTION_ASSIGNED", entity: "InstitutionSubscription", entityId: subscription.id, result: "SUCCESS" } });
  });
  revalidatePath("/admin/billing");
  revalidatePath("/admin");
}

export async function createDraftInvoice(formData: FormData) {
  const actor = await requireSuperAdmin();
  const input = z.object({ institutionId: z.uuid(), subscriptionId: z.union([z.uuid(), z.literal("")]).optional(), amount: z.coerce.number().min(0).max(100000000), currency: z.string().trim().toUpperCase().regex(/^[A-Z]{3}$/) }).safeParse(Object.fromEntries(formData.entries()));
  if (!input.success) throw new Error("Enter a valid amount, currency and institution.");
  if (input.data.subscriptionId) {
    const subscription = await prisma.institutionSubscription.findUnique({ where: { id: input.data.subscriptionId }, select: { institutionId: true } });
    if (!subscription || subscription.institutionId !== input.data.institutionId) throw new Error("The subscription must belong to the selected institution.");
  }
  const invoiceNumber = `DRAFT-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
  await prisma.$transaction(async (tx) => {
    const invoice = await tx.invoice.create({ data: { invoiceNumber, institutionId: input.data.institutionId, subscriptionId: input.data.subscriptionId || null, currency: input.data.currency, subtotal: input.data.amount, tax: 0, total: input.data.amount, status: "DRAFT" } });
    await tx.auditLog.create({ data: { userId: actor.id, institutionId: invoice.institutionId, action: "DRAFT_INVOICE_CREATED", entity: "Invoice", entityId: invoice.id, result: "SUCCESS" } });
  });
  revalidatePath("/admin/billing");
}

export async function saveInstitutionBranding(formData: FormData) {
  const actor = await requireSuperAdmin();
  const input = z.object({ institutionId: z.uuid(), displayName: z.string().trim().max(160).optional(), logoUrl: z.union([z.url().refine((v) => v.startsWith("https://") || v.startsWith("http://")), z.literal("")]).optional(), primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/), secondaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/) }).safeParse(Object.fromEntries(formData.entries()));
  if (!input.success) throw new Error("Provide valid branding values and six-digit hex colours.");
  await prisma.$transaction(async (tx) => {
    await tx.institutionBranding.upsert({ where: { institutionId: input.data.institutionId }, create: { institutionId: input.data.institutionId, displayName: input.data.displayName || null, logoUrl: input.data.logoUrl || null, primaryColor: input.data.primaryColor, secondaryColor: input.data.secondaryColor }, update: { displayName: input.data.displayName || null, logoUrl: input.data.logoUrl || null, primaryColor: input.data.primaryColor, secondaryColor: input.data.secondaryColor } });
    await tx.auditLog.create({ data: { userId: actor.id, institutionId: input.data.institutionId, action: "INSTITUTION_BRANDING_UPDATED", entity: "InstitutionBranding", entityId: input.data.institutionId, result: "SUCCESS" } });
  });
  revalidatePath("/admin/branding");
}

export async function registerDomain(formData: FormData) {
  const actor = await requireSuperAdmin();
  const input = z.object({ institutionId: z.uuid(), domain: z.string().trim().toLowerCase().min(4).max(253).regex(/^(?=.{4,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/) }).safeParse(Object.fromEntries(formData.entries()));
  if (!input.success) throw new Error("Enter a valid hostname and institution.");
  const token = crypto.randomUUID().replaceAll("-", "");
  await prisma.$transaction(async (tx) => {
    const domain = await tx.institutionDomain.create({ data: { institutionId: input.data.institutionId, domain: input.data.domain, verificationToken: token, status: "PENDING_VERIFICATION" } });
    await tx.auditLog.create({ data: { userId: actor.id, institutionId: input.data.institutionId, action: "INSTITUTION_DOMAIN_REGISTERED", entity: "InstitutionDomain", entityId: domain.id, result: "SUCCESS" } });
  });
  revalidatePath("/admin/domains");
}

export async function advanceOnboarding(formData: FormData) {
  const actor = await requireSuperAdmin();
  const input = z.object({ id: z.uuid(), stage: z.enum(["DETAILS", "PLAN", "DOMAIN", "ADMIN", "REVIEW", "COMPLETED"]) }).safeParse(Object.fromEntries(formData.entries()));
  if (!input.success) throw new Error("Invalid onboarding stage.");
  const order = ["DETAILS", "PLAN", "DOMAIN", "ADMIN", "REVIEW", "COMPLETED"] as const;
  await prisma.$transaction(async (tx) => {
    const institution = await tx.institution.findUnique({ where: { id: input.data.id }, select: { id: true, onboardingStage: true, archivedAt: true } });
    if (!institution || institution.archivedAt) throw new Error("Institution was not found or has been archived.");
    const currentIndex = order.indexOf(institution.onboardingStage);
    const nextIndex = order.indexOf(input.data.stage);
    if (Math.abs(nextIndex - currentIndex) !== 1) throw new Error("Onboarding can move only one step forward or backward at a time.");
    if (nextIndex > currentIndex) {
      if (input.data.stage === "DOMAIN" || input.data.stage === "ADMIN" || input.data.stage === "REVIEW" || input.data.stage === "COMPLETED") {
        const activeSubscription = await tx.institutionSubscription.findFirst({ where: { institutionId: institution.id, status: "ACTIVE" }, select: { id: true } });
        if (!activeSubscription) throw new Error("Assign an active subscription before moving past the plan step.");
      }
      if (input.data.stage === "REVIEW" || input.data.stage === "COMPLETED") {
        const verifiedDomainEntry = await tx.institutionDomain.findFirst({ where: { institutionId: institution.id, status: { in: ["VERIFIED", "ACTIVE"] } }, select: { id: true } });
        if (!verifiedDomainEntry) throw new Error("A domain must be verified before review. Pending DNS entries do not count as verified.");
      }
      if (input.data.stage === "COMPLETED") {
        const adminMembership = await tx.institutionMembership.findFirst({ where: { institutionId: institution.id, status: "ACTIVE", roles: { some: { role: { code: { in: ["INSTITUTION_ADMIN", "ADMIN"] } } } } }, select: { id: true } });
        if (!adminMembership) throw new Error("An active institution administrator membership is required to complete onboarding. Invitations are not configured in this environment.");
      }
    }
    await tx.institution.update({ where: { id: institution.id }, data: { onboardingStage: input.data.stage, ...(input.data.stage === "COMPLETED" ? { status: "ACTIVE" as const } : {}) } });
    await tx.auditLog.create({ data: { userId: actor.id, institutionId: institution.id, action: "INSTITUTION_ONBOARDING_STAGE_CHANGED", entity: "Institution", entityId: institution.id, result: "SUCCESS", metadata: { from: institution.onboardingStage, to: input.data.stage } } });
  });
  revalidatePath("/admin/onboarding");
  revalidatePath("/admin/institutions");
  revalidatePath("/admin");
}

export async function removeDomain(formData: FormData) {
  const actor = await requireSuperAdmin();
  const id = z.uuid().safeParse(formData.get("id"));
  if (!id.success) throw new Error("Invalid domain.");
  await prisma.$transaction(async (tx) => {
    const domain = await tx.institutionDomain.update({ where: { id: id.data }, data: { status: "REMOVED", removedAt: new Date(), activatedAt: null } });
    await tx.auditLog.create({ data: { userId: actor.id, institutionId: domain.institutionId, action: "INSTITUTION_DOMAIN_REMOVED", entity: "InstitutionDomain", entityId: domain.id, result: "SUCCESS" } });
  });
  revalidatePath("/admin/domains");
}

export async function verifyDomain(formData: FormData) {
  const actor = await requireSuperAdmin();
  const id = z.uuid().safeParse(formData.get("id"));
  if (!id.success) throw new Error("Invalid domain.");
  const domain = await prisma.institutionDomain.findUnique({ where: { id: id.data }, select: { id: true, domain: true, verificationToken: true, status: true, institutionId: true } });
  if (!domain || domain.status === "REMOVED") throw new Error("Domain not found or already removed.");
  let records: string[][];
  try { records = await resolveTxt(`_sst-erp-verification.${domain.domain}`); }
  catch { throw new Error("DNS TXT record was not found. Add the exact challenge shown and try again after DNS has propagated."); }
  if (!records.flat().includes(domain.verificationToken)) throw new Error("The DNS TXT record does not match this domain's verification token.");
  await prisma.$transaction(async (tx) => {
    await tx.institutionDomain.update({ where: { id: domain.id }, data: { status: "VERIFIED", verifiedAt: new Date() } });
    await tx.auditLog.create({ data: { userId: actor.id, institutionId: domain.institutionId, action: "INSTITUTION_DOMAIN_VERIFIED", entity: "InstitutionDomain", entityId: domain.id, result: "SUCCESS" } });
  });
  revalidatePath("/admin/domains");
}

export async function activateDomain(formData: FormData) {
  const actor = await requireSuperAdmin();
  const id = z.uuid().safeParse(formData.get("id"));
  if (!id.success) throw new Error("Invalid domain.");
  await prisma.$transaction(async (tx) => {
    const domain = await tx.institutionDomain.update({ where: { id: id.data, status: "VERIFIED" }, data: { status: "ACTIVE", activatedAt: new Date() } });
    await tx.auditLog.create({ data: { userId: actor.id, institutionId: domain.institutionId, action: "INSTITUTION_DOMAIN_ACTIVATED", entity: "InstitutionDomain", entityId: domain.id, result: "SUCCESS" } });
  });
  revalidatePath("/admin/domains");
}

export async function setFeatureAvailability(formData: FormData) {
  const actor = await requireSuperAdmin();
  const input = z.object({ id: z.uuid(), enabled: z.enum(["true", "false"]) }).safeParse(Object.fromEntries(formData.entries()));
  if (!input.success) throw new Error("Invalid feature change.");
  const enabled = input.data.enabled === "true";
  await audited(actor.id, "PLATFORM_FEATURE_AVAILABILITY_CHANGED", "PlatformFeature", input.data.id, async (tx) => { await tx.platformFeature.update({ where: { id: input.data.id }, data: { isAvailable: enabled } }); });
  revalidatePath("/admin/modules");
}

export async function setPlanFeature(formData: FormData) {
  const actor = await requireSuperAdmin();
  const input = z.object({ planId: z.uuid(), featureId: z.uuid(), enabled: z.enum(["true", "false"]), limitValue: z.union([z.coerce.number().int().min(0), z.literal("")]).optional() }).safeParse(Object.fromEntries(formData.entries()));
  if (!input.success) throw new Error("Select a plan and provide a valid feature quota.");
  await prisma.$transaction(async (tx) => {
    await tx.planFeature.upsert({ where: { planId_featureId: { planId: input.data.planId, featureId: input.data.featureId } }, create: { planId: input.data.planId, featureId: input.data.featureId, enabled: input.data.enabled === "true", limitValue: input.data.limitValue === "" ? null : input.data.limitValue ?? null }, update: { enabled: input.data.enabled === "true", limitValue: input.data.limitValue === "" ? null : input.data.limitValue ?? null } });
    await tx.auditLog.create({ data: { userId: actor.id, action: "PLAN_FEATURE_CHANGED", entity: "PlanFeature", entityId: `${input.data.planId}:${input.data.featureId}`, result: "SUCCESS", metadata: { enabled: input.data.enabled === "true", limit: input.data.limitValue ?? null } } });
  });
  revalidatePath("/admin/modules");
}

export async function setSubscriptionStatus(formData: FormData) {
  const actor = await requireSuperAdmin();
  const input = z.object({ id: z.uuid(), status: z.enum(["ACTIVE", "CANCELED", "SUSPENDED", "EXPIRED"]) }).safeParse(Object.fromEntries(formData.entries()));
  if (!input.success) throw new Error("Invalid subscription change.");
  await prisma.$transaction(async (tx) => {
    const existing = await tx.institutionSubscription.findUniqueOrThrow({ where: { id: input.data.id }, select: { institutionId: true, status: true } });
    await tx.institutionSubscription.update({ where: { id: input.data.id }, data: { status: input.data.status, cancelledAt: input.data.status === "CANCELED" ? new Date() : null } });
    await tx.subscriptionEvent.create({ data: { subscriptionId: input.data.id, actorId: actor.id, action: `STATUS_${input.data.status}`, details: { status: input.data.status } } });
    await tx.auditLog.create({ data: { userId: actor.id, institutionId: existing.institutionId, action: "SUBSCRIPTION_STATUS_CHANGED", entity: "InstitutionSubscription", entityId: input.data.id, result: "SUCCESS", metadata: { previousStatus: existing.status, status: input.data.status } } });
  });
  revalidatePath("/admin/billing");
  revalidatePath("/admin");
}

export async function renewSubscription(formData: FormData) {
  const actor = await requireSuperAdmin();
  const id = z.uuid().safeParse(formData.get("id"));
  if (!id.success) throw new Error("Invalid subscription.");
  await prisma.$transaction(async (tx) => {
    const current = await tx.institutionSubscription.findUnique({ where: { id: id.data }, include: { plan: { select: { billingCycle: true, customCycleDays: true } } } });
    if (!current || current.plan.billingCycle === "CUSTOM" && !current.plan.customCycleDays) throw new Error("This subscription cannot be renewed until its plan cycle is configured.");
    const now = new Date();
    const nextEnd = current.endsAt && current.endsAt > now ? new Date(current.endsAt) : new Date(now);
    if (current.plan.billingCycle === "MONTHLY") nextEnd.setUTCMonth(nextEnd.getUTCMonth() + 1);
    else if (current.plan.billingCycle === "QUARTERLY") nextEnd.setUTCMonth(nextEnd.getUTCMonth() + 3);
    else if (current.plan.billingCycle === "YEARLY") nextEnd.setUTCMonth(nextEnd.getUTCMonth() + 12);
    else nextEnd.setUTCDate(nextEnd.getUTCDate() + current.plan.customCycleDays!);
    await tx.institutionSubscription.update({ where: { id: current.id }, data: { status: "ACTIVE", startsAt: current.startsAt, endsAt: nextEnd, renewsAt: nextEnd, cancelledAt: null } });
    await tx.subscriptionEvent.create({ data: { subscriptionId: current.id, actorId: actor.id, action: "RENEWED", details: { previousEnd: current.endsAt?.toISOString() ?? null, nextEnd: nextEnd.toISOString() } } });
    await tx.auditLog.create({ data: { userId: actor.id, institutionId: current.institutionId, action: "SUBSCRIPTION_RENEWED", entity: "InstitutionSubscription", entityId: current.id, result: "SUCCESS", metadata: { endsAt: nextEnd.toISOString() } } });
  });
  revalidatePath("/admin/billing");
  revalidatePath("/admin");
}

export async function updateTicket(formData: FormData) {
  const actor = await requireSuperAdmin();
  const input = z.object({ id: z.uuid(), status: z.enum(["OPEN", "IN_PROGRESS", "WAITING_FOR_RESPONSE", "RESOLVED", "CLOSED"]), priority: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]), assignedToId: z.union([z.uuid(), z.literal("")]).optional(), note: z.string().trim().max(4000).optional() }).safeParse(Object.fromEntries(formData.entries()));
  if (!input.success) throw new Error("Invalid ticket update.");
  if (input.data.assignedToId) {
    const assignee = await prisma.user.findUnique({ where: { id: input.data.assignedToId }, select: { platformRole: true, status: true } });
    if (!assignee || assignee.platformRole !== "SUPER_ADMIN" || assignee.status !== "ACTIVE") throw new Error("Tickets can only be assigned to an active platform Super Admin account.");
  }
  await prisma.$transaction(async (tx) => {
    const ticket = await tx.supportTicket.update({ where: { id: input.data.id }, data: { status: input.data.status, priority: input.data.priority, assignedToId: input.data.assignedToId || null, resolvedAt: input.data.status === "RESOLVED" ? new Date() : null } });
    if (input.data.note) await tx.supportTicketNote.create({ data: { ticketId: ticket.id, authorId: actor.id, body: input.data.note, isInternal: true } });
    await tx.auditLog.create({ data: { userId: actor.id, institutionId: ticket.institutionId, action: "SUPPORT_TICKET_UPDATED", entity: "SupportTicket", entityId: ticket.id, result: "SUCCESS", metadata: { status: ticket.status, priority: ticket.priority } } });
  });
  revalidatePath("/admin/support");
}

export async function updatePlatformUser(formData: FormData) {
  const actor = await requireSuperAdmin();
  if (!actor.id) throw new Error("Platform user role changes require a real signed-in Super Admin identity, even in development mode.");
  const input = z.object({ id: z.uuid(), name: z.string().trim().min(2).max(160), platformRole: z.enum(["NONE", "SUPER_ADMIN"]), status: z.enum(["ACTIVE", "INACTIVE", "LOCKED"]) }).safeParse(Object.fromEntries(formData.entries()));
  if (!input.success) throw new Error("Check the account details and platform role.");
  if (input.data.id === actor.id && (input.data.platformRole !== "SUPER_ADMIN" || input.data.status !== "ACTIVE")) throw new Error("You cannot remove your own active Super Admin access.");
  await prisma.$transaction(async (tx) => {
    const current = await tx.user.findUniqueOrThrow({ where: { id: input.data.id }, select: { platformRole: true, status: true } });
    if (current.platformRole === "SUPER_ADMIN" && current.status === "ACTIVE" && (input.data.platformRole !== "SUPER_ADMIN" || input.data.status !== "ACTIVE")) {
      const otherAdmins = await tx.user.count({ where: { id: { not: input.data.id }, platformRole: "SUPER_ADMIN", status: "ACTIVE" } });
      if (otherAdmins === 0) throw new Error("At least one other active Super Admin must remain before this account can be changed.");
    }
    const user = await tx.user.update({ where: { id: input.data.id }, data: { name: input.data.name, platformRole: input.data.platformRole, status: input.data.status } });
    await tx.auditLog.create({ data: { userId: actor.id, action: "PLATFORM_USER_UPDATED", entity: "User", entityId: user.id, result: "SUCCESS", metadata: { previousRole: current.platformRole, platformRole: user.platformRole, previousStatus: current.status, status: user.status } } });
  }, { isolationLevel: "Serializable" });
  revalidatePath("/admin/users");
}

export async function savePlatformSetting(formData: FormData) {
  const actor = await requireSuperAdmin();
  const input = z.object({ key: z.string().trim().regex(/^[a-z][a-z0-9_.-]{1,79}$/), value: z.string().trim().min(1).max(500), description: z.string().trim().max(250).optional() }).safeParse(Object.fromEntries(formData.entries()));
  if (!input.success) throw new Error("Invalid setting. Use a lowercase key and a value of up to 500 characters.");
  let value: unknown;
  try { value = JSON.parse(input.data.value); } catch { value = input.data.value; }
  if (/secret|password|token|private.?key|credential/i.test(input.data.key)) throw new Error("Secret values cannot be stored as platform settings.");
  await prisma.$transaction(async (tx) => {
    await tx.platformSetting.upsert({ where: { key: input.data.key }, create: { key: input.data.key, value: value as never, description: input.data.description || null, updatedById: actor.id }, update: { value: value as never, description: input.data.description || null, updatedById: actor.id } });
    await tx.auditLog.create({ data: { userId: actor.id, action: "PLATFORM_SETTING_CHANGED", entity: "PlatformSetting", entityId: input.data.key, result: "SUCCESS" } });
  });
  revalidatePath("/admin/settings");
}

export async function createAnnouncement(formData: FormData) {
  const actor = await requireSuperAdmin();
  const input = z.object({ title: z.string().trim().min(3).max(160), body: z.string().trim().min(5).max(5000), publish: z.enum(["draft", "publish"]), targetMode: z.enum(["all", "selected"]) }).safeParse(Object.fromEntries(formData.entries()));
  if (!input.success) throw new Error("Check the announcement title and content.");
  const targetIds = z.array(z.uuid()).max(500).safeParse(formData.getAll("targetIds"));
  if (!targetIds.success || (input.data.targetMode === "selected" && targetIds.data.length === 0)) throw new Error("Select at least one target institution, or choose all institutions.");
  if (input.data.targetMode === "selected") {
    const count = await prisma.institution.count({ where: { id: { in: targetIds.data }, archivedAt: null } });
    if (count !== new Set(targetIds.data).size) throw new Error("One or more selected institutions are unavailable.");
  }
  const publish = input.data.publish === "publish";
  await prisma.$transaction(async (tx) => {
    const notice = await tx.platformNotification.create({ data: { title: input.data.title, body: input.data.body, status: publish ? "PUBLISHED" : "DRAFT", targetAll: input.data.targetMode === "all", publishedAt: publish ? new Date() : null, createdById: actor.id } });
    if (input.data.targetMode === "selected") await tx.platformNotificationTarget.createMany({ data: targetIds.data.map((institutionId) => ({ notificationId: notice.id, institutionId })) });
    await tx.auditLog.create({ data: { userId: actor.id, action: publish ? "ANNOUNCEMENT_PUBLISHED" : "ANNOUNCEMENT_DRAFTED", entity: "PlatformNotification", entityId: notice.id, result: "SUCCESS", metadata: { targetMode: input.data.targetMode, targetCount: targetIds.data.length } } });
  });
  revalidatePath("/admin/notifications");
}

export async function editAnnouncement(formData: FormData) {
  const actor = await requireSuperAdmin();
  const input = z.object({ id: z.uuid(), title: z.string().trim().min(3).max(160), body: z.string().trim().min(5).max(5000) }).safeParse(Object.fromEntries(formData.entries()));
  if (!input.success) throw new Error("Check the announcement title and content.");
  await prisma.$transaction(async (tx) => {
    await tx.platformNotification.update({ where: { id: input.data.id }, data: { title: input.data.title, body: input.data.body } });
    await tx.auditLog.create({ data: { userId: actor.id, action: "ANNOUNCEMENT_UPDATED", entity: "PlatformNotification", entityId: input.data.id, result: "SUCCESS" } });
  });
  revalidatePath("/admin/notifications");
}

export async function transitionAnnouncement(formData: FormData) {
  const actor = await requireSuperAdmin();
  const input = z.object({ id: z.uuid(), status: z.enum(["PUBLISHED", "DEACTIVATED"]) }).safeParse(Object.fromEntries(formData.entries()));
  if (!input.success) throw new Error("Invalid announcement status.");
  await prisma.$transaction(async (tx) => {
    const notice = await tx.platformNotification.update({ where: { id: input.data.id }, data: { status: input.data.status, publishedAt: input.data.status === "PUBLISHED" ? new Date() : undefined } });
    await tx.auditLog.create({ data: { userId: actor.id, action: input.data.status === "PUBLISHED" ? "ANNOUNCEMENT_PUBLISHED" : "ANNOUNCEMENT_DEACTIVATED", entity: "PlatformNotification", entityId: notice.id, result: "SUCCESS" } });
  });
  revalidatePath("/admin/notifications");
}

export async function issueInvoice(formData: FormData) {
  const actor = await requireSuperAdmin();
  const id = z.uuid().safeParse(formData.get("id"));
  if (!id.success) throw new Error("Invalid invoice.");
  await prisma.$transaction(async (tx) => {
    const invoice = await tx.invoice.update({ where: { id: id.data, status: "DRAFT" }, data: { status: "ISSUED", issuedAt: new Date(), dueAt: new Date(Date.now() + 30 * 86400000) } });
    await tx.auditLog.create({ data: { userId: actor.id, institutionId: invoice.institutionId, action: "INVOICE_ISSUED", entity: "Invoice", entityId: invoice.id, result: "SUCCESS" } });
  });
  revalidatePath("/admin/billing");
}

export async function requestDeletion(formData: FormData) {
  const actor = await requireSuperAdmin();
  if (!actor.id) throw new Error("Deletion requests require an identified requester. Sign in with a provisioned Super Admin account.");
  const input = z.object({ institutionId: z.uuid(), reason: z.string().trim().min(20).max(2000) }).safeParse(Object.fromEntries(formData.entries()));
  if (!input.success) throw new Error("A valid institution and a deletion reason of at least 20 characters are required.");
  await prisma.$transaction(async (tx) => {
    const request = await tx.institutionDeletionRequest.create({ data: { institutionId: input.data.institutionId, requestedById: actor.id, reason: input.data.reason } });
    await tx.auditLog.create({ data: { userId: actor.id, institutionId: input.data.institutionId, action: "INSTITUTION_DELETION_REQUESTED", entity: "InstitutionDeletionRequest", entityId: request.id, result: "SUCCESS" } });
  });
  revalidatePath("/admin/deletion");
}

export async function reviewDeletionRequest(formData: FormData) {
  const actor = await requireSuperAdmin();
  if (!actor.id) throw new Error("Deletion approvals and recovery actions require an identified Super Admin.");
  const input = z.object({ id: z.uuid(), decision: z.enum(["approve", "reject", "archive", "recover"]) }).safeParse(Object.fromEntries(formData.entries()));
  if (!input.success) throw new Error("Invalid deletion workflow action.");
  const request = await prisma.institutionDeletionRequest.findUnique({ where: { id: input.data.id }, select: { id: true, institutionId: true, requestedById: true, status: true, scheduledFor: true, retentionUntil: true } });
  if (!request) throw new Error("Deletion request not found.");
  await prisma.$transaction(async (tx) => {
    if (input.data.decision === "approve" || input.data.decision === "reject") {
      if (request.status !== "REQUESTED" || request.requestedById === actor.id) throw new Error("A different Super Admin must review a pending request.");
      const approved = input.data.decision === "approve";
      await tx.institutionDeletionRequest.update({ where: { id: request.id }, data: { status: approved ? "APPROVED" : "REJECTED", approvedById: actor.id, approvedAt: new Date(), scheduledFor: approved ? new Date(Date.now() + 30 * 86400000) : null, retentionUntil: approved ? new Date(Date.now() + 120 * 86400000) : null } });
    } else if (input.data.decision === "archive") {
      if (request.status !== "APPROVED" || !request.scheduledFor || request.scheduledFor > new Date()) throw new Error("This approved request is not yet eligible for archival.");
      await tx.institution.update({ where: { id: request.institutionId }, data: { status: "ARCHIVED", archivedAt: new Date() } });
      await tx.institutionDeletionRequest.update({ where: { id: request.id }, data: { status: "ARCHIVED", completedAt: new Date() } });
    } else {
      if (request.status !== "ARCHIVED" || !request.retentionUntil || request.retentionUntil <= new Date()) throw new Error("The recovery retention period has ended or this request is not archived.");
      await tx.institution.update({ where: { id: request.institutionId }, data: { status: "PENDING", archivedAt: null } });
      await tx.institutionDeletionRequest.update({ where: { id: request.id }, data: { status: "RECOVERED" } });
    }
    await tx.auditLog.create({ data: { userId: actor.id, institutionId: request.institutionId, action: `DELETION_${input.data.decision.toUpperCase()}`, entity: "InstitutionDeletionRequest", entityId: request.id, result: "SUCCESS", metadata: { priorStatus: request.status } } });
  });
  revalidatePath("/admin/deletion");
  revalidatePath("/admin/institutions");
  revalidatePath("/admin");
}

export async function requestSupportAccess(formData: FormData) {
  const actor = await requireSuperAdmin();
  if (!actor.id) throw new Error("Support access requests require an identified requester. Sign in with a provisioned Super Admin account.");
  const input = z.object({ institutionId: z.uuid(), ticketId: z.union([z.uuid(), z.literal("")]).optional(), reason: z.string().trim().min(20).max(2000), durationHours: z.coerce.number().int().min(1).max(8) }).safeParse(Object.fromEntries(formData.entries()));
  if (!input.success) throw new Error("Provide an institution, a detailed reason and a duration of at most eight hours.");
  const expiresAt = new Date(Date.now() + input.data.durationHours * 60 * 60 * 1000);
  if (input.data.ticketId) {
    const ticket = await prisma.supportTicket.findUnique({ where: { id: input.data.ticketId }, select: { institutionId: true } });
    if (!ticket || ticket.institutionId !== input.data.institutionId) throw new Error("The support ticket must belong to the selected institution.");
  }
  await prisma.$transaction(async (tx) => {
    const session = await tx.supportAccessSession.create({ data: { institutionId: input.data.institutionId, ticketId: input.data.ticketId || null, requestedById: actor.id, reason: input.data.reason, allowedActions: ["READ_SUPPORT_CONTEXT"], expiresAt } });
    await tx.auditLog.create({ data: { userId: actor.id, institutionId: input.data.institutionId, action: "SUPPORT_ACCESS_REQUESTED", entity: "SupportAccessSession", entityId: session.id, result: "SUCCESS" } });
  });
  revalidatePath("/admin/support-access");
}

export async function approveSupportAccess(formData: FormData) {
  const actor = await requireSuperAdmin();
  if (!actor.id) throw new Error("Support access approval requires a real Super Admin identity to enforce second-person review.");
  const id = z.uuid().safeParse(formData.get("id"));
  if (!id.success) throw new Error("Invalid support access request.");
  const session = await prisma.supportAccessSession.findUnique({ where: { id: id.data }, select: { id: true, requestedById: true, status: true, expiresAt: true, institutionId: true } });
  if (!session || session.status !== "REQUESTED" || session.requestedById === actor.id || session.expiresAt <= new Date()) throw new Error("This request is not eligible for approval. A different Super Admin must approve it before expiry.");
  await prisma.$transaction(async (tx) => {
    await tx.supportAccessSession.update({ where: { id: id.data }, data: { status: "APPROVED", approvedById: actor.id } });
    await tx.auditLog.create({ data: { userId: actor.id, institutionId: session.institutionId, action: "SUPPORT_ACCESS_APPROVED", entity: "SupportAccessSession", entityId: session.id, result: "SUCCESS" } });
  });
  revalidatePath("/admin/support-access");
}

export async function closeSupportAccess(formData: FormData) {
  const actor = await requireSuperAdmin();
  if (!actor.id) throw new Error("Support access decisions require an identified Super Admin for audit attribution.");
  const input = z.object({ id: z.uuid(), decision: z.enum(["deny", "revoke"]) }).safeParse(Object.fromEntries(formData.entries()));
  if (!input.success) throw new Error("Invalid support access action.");
  await prisma.$transaction(async (tx) => {
    const current = await tx.supportAccessSession.findUnique({ where: { id: input.data.id }, select: { institutionId: true, status: true, expiresAt: true } });
    const allowed = input.data.decision === "deny" ? current?.status === "REQUESTED" : current?.status === "APPROVED" || current?.status === "ACTIVE";
    if (!current || !allowed || current.expiresAt <= new Date()) throw new Error("This support access request is no longer eligible for that action.");
    await tx.supportAccessSession.update({ where: { id: input.data.id }, data: { status: input.data.decision === "deny" ? "DENIED" : "REVOKED", endedAt: new Date() } });
    await tx.auditLog.create({ data: { userId: actor.id, institutionId: current.institutionId, action: input.data.decision === "deny" ? "SUPPORT_ACCESS_DENIED" : "SUPPORT_ACCESS_REVOKED", entity: "SupportAccessSession", entityId: input.data.id, result: "SUCCESS" } });
  });
  revalidatePath("/admin/support-access");
}
