"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

export type PasswordState = { error: string | null };

export async function updatePassword(_previous: PasswordState, formData: FormData): Promise<PasswordState> {
  const parsed = z.object({ password: z.string().min(12, "Use at least 12 characters."), confirm: z.string() }).refine((v) => v.password === v.confirm, { path: ["confirm"], message: "Passwords do not match." }).safeParse({ password: formData.get("password"), confirm: formData.get("confirm") });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check the password fields." };
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return { error: "Your reset link is invalid or has expired. Request a new one." };
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) return { error: "Password update failed. Request a new reset link and try again." };
  redirect("/admin");
}
