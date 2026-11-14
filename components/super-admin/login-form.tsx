"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, LoaderCircle, LogIn } from "lucide-react";
import { signIn, type LoginState } from "@/app/admin/login/actions";

const initialState: LoginState = { error: null };

export function LoginForm() {
  const [state, formAction, pending] = useActionState(signIn, initialState);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form className="sa-login-form" action={formAction}>
      <div className="sa-login-field">
        <label htmlFor="admin-email">Email address</label>
        <input id="admin-email" name="email" type="email" autoComplete="username" defaultValue="vidhyalakshmi@i.sohansoft.in" required />
      </div>
      <div className="sa-login-field">
        <div className="sa-login-label-row">
          <label htmlFor="admin-password">Password</label>
          <Link href="/admin/forgot-password" className="sa-text-button">Forgot password?</Link>
        </div>
        <div className="sa-password-wrap">
          <input id="admin-password" name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" placeholder="Enter your password" required />
          <button className="sa-password-toggle" type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Hide password" : "Show password"} aria-pressed={showPassword}>
            {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        </div>
      </div>
      {state.error && <p className="sa-login-error" role="alert">{state.error}</p>}
      <button className="sa-login-submit" type="submit" disabled={pending}>
        {pending ? <LoaderCircle size={17} className="sa-spinner" /> : <LogIn size={17} />}
          {pending ? "Signing in…" : "Sign In"}
      </button>
    </form>
  );
}
