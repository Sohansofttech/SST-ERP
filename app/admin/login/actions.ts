"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { hasSuperAdminRole } from "@/lib/super-admin/authorization";
import { prisma } from "@/lib/super-admin/prisma";
import { createClient } from "@/lib/supabase/server";

export type LoginState = { error: string | null };

const loginSchema = z.object({
  email: z.email({ error: "Enter a valid email address." }).trim(),
  password: z.string().min(1, { error: "Enter your password." }),
});

export async function signIn(_previousState: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = loginSchema.safeParse({ email: formData.get("email"), password: formData.get("password") });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check your email and password." };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error || !data.user) return { error: "Email or password is incorrect." };

  try {
    if (!(await hasSuperAdminRole(data.user.id))) {
      await supabase.auth.signOut({ scope: "local" });
      return { error: "This account does not have active Super Admin access." };
    }
  } catch {
    await supabase.auth.signOut({ scope: "local" }).catch(() => undefined);
    return { error: "We could not verify your platform access. Please try again later." };
  }

  try {
    await prisma.auditLog.create({ data: { userId: data.user.id, action: "SUPER_ADMIN_LOGIN", entity: "User", entityId: data.user.id, result: "SUCCESS", requestId: crypto.randomUUID() } });
  } catch {
    await supabase.auth.signOut({ scope: "local" }).catch(() => undefined);
    return { error: "Sign-in could not be recorded. Try again after database access is restored." };
  }

  redirect("/admin");
}
