import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { hasSuperAdminRole } from "@/lib/super-admin/authorization";
import { isDevelopmentBypassEnabled } from "@/lib/super-admin/development-access";

export async function requireSuperAdmin() {
  if (isDevelopmentBypassEnabled()) return { id: null, email: null, developmentMode: true as const };

  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) redirect("/admin/login");
  if (!(await hasSuperAdminRole(user.id))) throw new Error("Super Admin access is required.");
  return { id: user.id, email: user.email ?? null, developmentMode: false as const };
}
