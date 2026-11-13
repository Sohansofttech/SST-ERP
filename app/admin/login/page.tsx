import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";
import { LoginForm } from "@/components/super-admin/login-form";
import "../super-admin.css";

export const metadata: Metadata = {
  title: "Super Admin Sign In | SST-ERP",
  description: "Sign in to the SST-ERP platform administration portal.",
};

export default function AdminLoginPage() {
  return (
    <main className="sa-login">
      <div className="sa-login-brand">
        <span className="sa-login-brand-icon"><ShieldCheck size={23} /></span>
        <span><strong>SST-ERP</strong><small>Platform Console</small></span>
      </div>
      <section className="sa-login-card">
        <div className="sa-login-kicker">PLATFORM ADMINISTRATION</div>
        <h1>Welcome back</h1>
        <p className="sa-login-intro">Sign in with your authorized platform administrator account.</p>
        <LoginForm />
        <p className="sa-login-security"><ShieldCheck size={15} /> Secure sign-in powered by Supabase Auth</p>
      </section>
      <p className="sa-login-footer">SST-ERP · Multi-institution platform</p>
    </main>
  );
}
