"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/super-admin/prisma";
import { requireSuperAdmin } from "@/lib/super-admin/require-super-admin";

const institutionInput = z.object({
  name: z.string().trim().min(2).max(160),
  code: z.string().trim().max(40).optional(),
  slug: z.string().trim().toLowerCase().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens for the slug.").max(80),
  type: z.enum(["SCHOOL", "COLLEGE", "OTHER"]),
  email: z.union([z.email(), z.literal("")]).optional(),
  phone: z.string().trim().max(40).optional(),
  address: z.string().trim().max(300).optional(),
  city: z.string().trim().max(100).optional(),
  state: z.string().trim().max(100).optional(),
  postalCode: z.string().trim().max(20).optional(),
  country: z.string().trim().min(2).max(80),
  website: z.union([z.url().refine((value) => value.startsWith("https://") || value.startsWith("http://")), z.literal("")]).optional(),
});

export type InstitutionFormState = { error: string | null; success: string | null };

function readInput(formData: FormData) {
  return institutionInput.safeParse(Object.fromEntries(formData.entries()));
}

export async function createInstitution(_previous: InstitutionFormState, formData: FormData): Promise<InstitutionFormState> {
  const actor = await requireSuperAdmin();
  const parsed = readInput(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check the institution details.", success: null };
  const data = parsed.data;
  try {
    await prisma.$transaction(async (tx) => {
      const institution = await tx.institution.create({ data: {
        name: data.name, code: data.code || null, slug: data.slug, type: data.type,
        email: data.email || null, phone: data.phone || null, address: data.address || null,
        city: data.city || null, state: data.state || null, postalCode: data.postalCode || null,
        country: data.country, website: data.website || null,
      } });
      await tx.auditLog.create({ data: { userId: actor.id, institutionId: institution.id, action: "INSTITUTION_CREATED", entity: "Institution", entityId: institution.id, result: "SUCCESS", metadata: { slug: institution.slug } } });
    });
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "P2002") return { error: "That institution code or slug is already in use.", success: null };
    return { error: "The institution could not be saved. Confirm that the database migration is applied and try again.", success: null };
  }
  revalidatePath("/admin");
  revalidatePath("/admin/institutions");
  return { error: null, success: "Institution created." };
}

export async function editInstitution(_previous: InstitutionFormState, formData: FormData): Promise<InstitutionFormState> {
  const actor = await requireSuperAdmin();
  const id = z.uuid().safeParse(formData.get("id"));
  const parsed = readInput(formData);
  if (!id.success) return { error: "Invalid institution.", success: null };
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check the institution details.", success: null };
  try {
    await prisma.$transaction(async (tx) => {
      await tx.institution.update({ where: { id: id.data, archivedAt: null }, data: {
        name: parsed.data.name, code: parsed.data.code || null, slug: parsed.data.slug,
        type: parsed.data.type, email: parsed.data.email || null, phone: parsed.data.phone || null,
        address: parsed.data.address || null, city: parsed.data.city || null, state: parsed.data.state || null,
        postalCode: parsed.data.postalCode || null, country: parsed.data.country, website: parsed.data.website || null,
      } });
      await tx.auditLog.create({ data: { userId: actor.id, institutionId: id.data, action: "INSTITUTION_UPDATED", entity: "Institution", entityId: id.data, result: "SUCCESS" } });
    });
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "P2002") return { error: "That institution code or slug is already in use.", success: null };
    return { error: "The institution could not be updated. Check the database and try again.", success: null };
  }
  revalidatePath("/admin");
  revalidatePath("/admin/institutions");
  revalidatePath(`/admin/institutions/${id.data}`);
  return { error: null, success: "Institution details updated." };
}

export async function updateInstitutionStatus(formData: FormData) {
  const actor = await requireSuperAdmin();
  const parsed = z.object({ id: z.uuid(), status: z.enum(["ACTIVE", "SUSPENDED"]) }).safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) throw new Error("Invalid institution status request.");
  const institution = await prisma.institution.findUnique({ where: { id: parsed.data.id }, select: { id: true, status: true, archivedAt: true } });
  if (!institution || institution.archivedAt) throw new Error("Institution not found or archived.");
  await prisma.$transaction(async (tx) => {
    await tx.institution.update({ where: { id: institution.id }, data: { status: parsed.data.status } });
    await tx.auditLog.create({ data: { userId: actor.id, institutionId: institution.id, action: parsed.data.status === "ACTIVE" ? "INSTITUTION_ACTIVATED" : "INSTITUTION_SUSPENDED", entity: "Institution", entityId: institution.id, result: "SUCCESS", metadata: { previousStatus: institution.status, status: parsed.data.status } } });
  });
  revalidatePath("/admin");
  revalidatePath("/admin/institutions");
  revalidatePath(`/admin/institutions/${institution.id}`);
}

export async function archiveInstitution(formData: FormData) {
  const actor = await requireSuperAdmin();
  const id = z.uuid().safeParse(formData.get("id"));
  if (!id.success) throw new Error("Invalid institution request.");
  const institution = await prisma.institution.findUnique({ where: { id: id.data }, select: { id: true, status: true, archivedAt: true } });
  if (!institution || institution.archivedAt) throw new Error("Institution not found or already archived.");
  await prisma.$transaction(async (tx) => {
    await tx.institution.update({ where: { id: institution.id }, data: { status: "ARCHIVED", archivedAt: new Date() } });
    await tx.auditLog.create({ data: { userId: actor.id, institutionId: institution.id, action: "INSTITUTION_ARCHIVED", entity: "Institution", entityId: institution.id, result: "SUCCESS", metadata: { previousStatus: institution.status } } });
  });
  revalidatePath("/admin");
  revalidatePath("/admin/institutions");
}

export async function setInstitutionFeatureOverride(formData: FormData) {
  const actor = await requireSuperAdmin();
  const input = z.object({ institutionId: z.uuid(), featureId: z.uuid(), enabled: z.enum(["true", "false"]), reason: z.string().trim().min(5).max(500), expiresAt: z.string().optional() }).safeParse(Object.fromEntries(formData.entries()));
  if (!input.success) throw new Error("Provide a valid feature override and a reason.");
  const expiresAt = input.data.expiresAt ? new Date(`${input.data.expiresAt}T00:00:00.000Z`) : null;
  if (expiresAt && (Number.isNaN(expiresAt.getTime()) || expiresAt <= new Date())) throw new Error("Override expiry must be a future date.");
  await prisma.$transaction(async (tx) => {
    await tx.institutionFeatureOverride.upsert({ where: { institutionId_featureId: { institutionId: input.data.institutionId, featureId: input.data.featureId } }, create: { institutionId: input.data.institutionId, featureId: input.data.featureId, enabled: input.data.enabled === "true", reason: input.data.reason, expiresAt }, update: { enabled: input.data.enabled === "true", reason: input.data.reason, expiresAt } });
    await tx.auditLog.create({ data: { userId: actor.id, institutionId: input.data.institutionId, action: "INSTITUTION_FEATURE_OVERRIDE_CHANGED", entity: "InstitutionFeatureOverride", entityId: input.data.featureId, result: "SUCCESS", metadata: { enabled: input.data.enabled === "true", expiresAt: expiresAt?.toISOString() ?? null, reason: input.data.reason } } });
  });
  revalidatePath(`/admin/institutions/${input.data.institutionId}`);
  revalidatePath("/admin/modules");
}
