import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SuperAdminShell } from "@/components/super-admin/super-admin-shell";
import { LogoutButton } from "@/components/super-admin/logout-button";
import { hasSuperAdminRole } from "@/lib/super-admin/authorization";
import { createClient } from "@/lib/supabase/server";
import { isDevelopmentBypassEnabled } from "@/lib/super-admin/development-access";
import "../super-admin.css";

export const metadata: Metadata = {
  title: "Super Admin | SST-ERP",
  description: "Platform administration dashboard for SST-ERP.",
};

export default async function ProtectedAdminLayout({ children }: LayoutProps<"/admin">) {
  if (isDevelopmentBypassEnabled()) {
    return <SuperAdminShell userEmail="No authenticated user" developmentMode>{children}</SuperAdminShell>;
  }

  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) redirect("/admin/login");

  let isSuperAdmin = false;
  try {
    isSuperAdmin = await hasSuperAdminRole(user.id);
  } catch {
    return (
      <div className="super-admin sa-access-page">
        <section className="sa-access-card" role="alert">
          <h1>Access could not be verified</h1>
          <p>The platform could not verify your Super Admin access. Please try again later or contact your platform administrator.</p>
          <LogoutButton className="sa-back-link" />
        </section>
      </div>
    );
  }

  if (!isSuperAdmin) {
    return (
      <div className="super-admin sa-access-page">
        <section className="sa-access-card" role="alert">
          <h1>Super Admin access required</h1>
          <p>Your account is signed in, but it does not have an active Super Admin role.</p>
          <LogoutButton className="sa-back-link" />
        </section>
      </div>
    );
  }

  return <SuperAdminShell userEmail={user.phone ?? user.email ?? "Super Admin"}>{children}</SuperAdminShell>;
}
