"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

export type ResetState = { message: string | null; error: string | null };

export async function requestPasswordReset(_previous: ResetState, formData: FormData): Promise<ResetState> {
  const email = z.email().safeParse(formData.get("email"));
  if (!email.success) return { message: null, error: "Enter a valid email address." };
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!siteUrl) return { message: null, error: "Password reset is not configured. Set NEXT_PUBLIC_SITE_URL and configure Supabase email delivery." };
  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email.data, { redirectTo: `${siteUrl.replace(/\/$/, "")}/admin/auth/callback?next=/admin/reset-password` });
  if (error) return { message: null, error: "We could not request a reset. Check the address and Supabase email configuration." };
  return { message: "If this account is registered, a password reset email will arrive shortly.", error: null };
}
