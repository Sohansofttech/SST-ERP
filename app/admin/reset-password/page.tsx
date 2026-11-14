"use client";

import { useActionState } from "react";
import Link from "next/link";
import { updatePassword, type PasswordState } from "./actions";

const initial: PasswordState = { error: null };

export default function ResetPasswordPage() {
  const [state, action, pending] = useActionState(updatePassword, initial);
  return <main className="sa-login"><section className="sa-login-card"><div className="sa-login-kicker">ACCOUNT RECOVERY</div><h1>Choose a new password</h1><p className="sa-login-intro">Use at least 12 characters for your administrator account.</p><form className="sa-login-form" action={action}><div className="sa-login-field"><label htmlFor="new-password">New password</label><input id="new-password" name="password" type="password" minLength={12} autoComplete="new-password" required /></div><div className="sa-login-field"><label htmlFor="confirm-password">Confirm password</label><input id="confirm-password" name="confirm" type="password" minLength={12} autoComplete="new-password" required /></div>{state.error && <p role="alert" className="sa-login-error">{state.error}</p>}<button className="sa-login-submit" disabled={pending}>{pending ? "Updating…" : "Update password"}</button></form><Link className="sa-reset-back" href="/admin/login">Back to sign in</Link></section></main>;
}
