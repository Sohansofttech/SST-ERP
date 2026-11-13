"use client";

import { useActionState } from "react";
import Link from "next/link";
import { requestPasswordReset, type ResetState } from "./actions";

const initial: ResetState = { message: null, error: null };

export default function ForgotPasswordPage() {
  const [state, action, pending] = useActionState(requestPasswordReset, initial);
  return <main className="sa-login"><section className="sa-login-card"><div className="sa-login-kicker">ACCOUNT RECOVERY</div><h1>Reset password</h1><p className="sa-login-intro">Enter your administrator email to request a secure reset link.</p><form className="sa-login-form" action={action}><div className="sa-login-field"><label htmlFor="reset-email">Email address</label><input id="reset-email" name="email" type="email" autoComplete="email" required /></div>{state.error && <p role="alert" className="sa-login-error">{state.error}</p>}{state.message && <p className="sa-reset-success" role="status">{state.message}</p>}<button className="sa-login-submit" disabled={pending}>{pending ? "Requesting…" : "Request reset link"}</button></form><Link className="sa-reset-back" href="/admin/login">Back to sign in</Link></section></main>;
}
