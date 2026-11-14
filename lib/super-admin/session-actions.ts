"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/super-admin/prisma";

export async function signOut() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) await prisma.platformAuditLog.create({ data: { userId: user.id, action: "SUPER_ADMIN_LOGOUT", entity: "User", entityId: user.id, result: "SUCCESS", requestId: crypto.randomUUID() } }).catch(() => undefined);
  await supabase.auth.signOut({ scope: "local" });
  redirect("/admin/login");
}
