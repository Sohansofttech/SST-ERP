"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck,
  GraduationCap,
  Users,
  School,
  AlertCircle,
  KeyRound,
  Smartphone,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/shared/Button";
import { FormInput } from "@/components/shared/FormInput";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleParam = searchParams.get("role")?.toLowerCase();

  const isStudent = roleParam === "student";
  const isParent = roleParam === "parent";

  const [authMethod, setAuthMethod] = useState<"PASSWORD" | "OTP">("PASSWORD");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  // Set default credentials based strictly on the selected role
  useEffect(() => {
    if (isStudent) {
      setEmail("john.doe@student.apex.edu");
      setPassword("Student@123");
      setOtp("");
      setOtpSent(false);
      setError(null);
      setInfoMessage(null);
    } else if (isParent) {
      setEmail("robert.doe@parent.apex.edu");
      setPassword("Parent@123");
      setOtp("");
      setOtpSent(false);
      setError(null);
      setInfoMessage(null);
    }
  }, [isStudent, isParent]);

  const handleSendOtp = () => {
    if (!email) {
      setError("Please enter your registered email address first.");
      return;
    }
    setError(null);
    setOtpSent(true);
    setOtp("123456"); // Pre-fill or suggest demo OTP
    setInfoMessage("Verification OTP sent! For testing, use demo OTP: 123456");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload: any = {
        email,
        loginType: authMethod,
      };

      if (authMethod === "PASSWORD") {
        payload.password = password;
      } else {
        payload.otp = otp;
      }

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!json.success) {
        throw new Error(json.error || "Authentication failed.");
      }

      const role = json.data.user.role;
      if (role === "PARENT") {
        router.push("/parent/dashboard");
      } else {
        router.push("/student/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Failed to sign in. Please verify your credentials.");
    } finally {
      setLoading(false);
    }
  };

  // Case 1: Visited /login with NO role or an invalid role -> Show simple portal selection screen
  if (!isStudent && !isParent) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0 mb-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#153B66] hover:text-[#2563EB] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Sohan Soft Tech ERP Home</span>
          </Link>
        </div>

        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
          <div className="flex justify-center">
            <div className="w-14 h-14 rounded-2xl bg-[#153B66] text-white flex items-center justify-center shadow-lg">
              <School className="w-8 h-8 text-[#14B8A6]" />
            </div>
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-[#1E293B]">
            Sohan Soft Tech ERP
          </h1>
          <p className="mt-1 text-xs font-medium text-[#64748B]">
            Please select your portal to continue to login
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
          <div className="bg-white p-6 shadow-xl border border-[#E2E8F0] sm:rounded-2xl space-y-4">
            <Link
              href="/login?role=student"
              className="flex items-center justify-between p-4 rounded-xl border border-[#E2E8F0] hover:border-[#2563EB] hover:bg-blue-50/50 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center group-hover:scale-105 transition-transform">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <h2 className="text-sm font-bold text-[#1E293B] group-hover:text-[#2563EB] transition-colors">
                    Student Login
                  </h2>
                  <p className="text-xs text-[#64748B]">Sign in to Student Portal</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[#64748B] group-hover:text-[#2563EB] transition-colors" />
            </Link>

            <Link
              href="/login?role=parent"
              className="flex items-center justify-between p-4 rounded-xl border border-[#E2E8F0] hover:border-[#0D9488] hover:bg-teal-50/50 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-teal-50 text-[#0D9488] flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Users className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <h2 className="text-sm font-bold text-[#1E293B] group-hover:text-[#0D9488] transition-colors">
                    Parent Login
                  </h2>
                  <p className="text-xs text-[#64748B]">Sign in to Parent Portal</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[#64748B] group-hover:text-[#0D9488] transition-colors" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Case 2 & 3: Role is explicitly "student" OR "parent" -> Render ONLY that role's interface
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Back to Home Link */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0 mb-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#153B66] hover:text-[#2563EB] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Sohan Soft Tech ERP Home</span>
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="flex justify-center">
          <div
            className={`w-14 h-14 rounded-2xl text-white flex items-center justify-center shadow-lg ${
              isStudent ? "bg-[#153B66]" : "bg-[#0D9488]"
            }`}
          >
            {isStudent ? (
              <GraduationCap className="w-8 h-8 text-[#14B8A6]" />
            ) : (
              <Users className="w-8 h-8 text-white" />
            )}
          </div>
        </div>
        <h1 className="mt-4 text-2xl font-bold tracking-tight text-[#1E293B]">
          {isStudent ? "Student Portal Login" : "Parent Portal Login"}
        </h1>
        <p className="mt-1 text-xs font-medium text-[#64748B]">
          {isStudent
            ? "Sign in with your student credentials to access your dashboard"
            : "Sign in with your guardian credentials to monitor your ward"}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl border border-[#E2E8F0] sm:rounded-2xl sm:px-10">
          {/* Authentication Method Switcher: Password vs OTP */}
          <div className="mb-6">
            <div className="flex bg-[#F1F5F9] p-1 rounded-xl border border-[#E2E8F0]">
              <button
                type="button"
                onClick={() => {
                  setAuthMethod("PASSWORD");
                  setError(null);
                  setInfoMessage(null);
                }}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  authMethod === "PASSWORD"
                    ? "bg-white text-[#153B66] shadow-sm"
                    : "text-[#64748B] hover:text-[#1E293B]"
                }`}
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Password Login</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMethod("OTP");
                  setError(null);
                  setInfoMessage(null);
                }}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  authMethod === "OTP"
                    ? "bg-white text-[#153B66] shadow-sm"
                    : "text-[#64748B] hover:text-[#1E293B]"
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>OTP Login</span>
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-[#FEE2E2] border border-[#FECACA] rounded-lg text-xs text-[#DC2626] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {infoMessage && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" />
              <span>{infoMessage}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <FormInput
              label={isStudent ? "Student Institutional Email" : "Registered Guardian Email"}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={isStudent ? "e.g. name@student.apex.edu" : "e.g. name@parent.apex.edu"}
              required
            />

            {authMethod === "PASSWORD" ? (
              <>
                <FormInput
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />

                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      defaultChecked
                      className="h-4 w-4 text-[#2563EB] focus:ring-[#2563EB] border-[#E2E8F0] rounded"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-[#64748B]">
                      Remember session
                    </label>
                  </div>
                  <span className="text-[#2563EB] font-medium hover:underline cursor-pointer">
                    Forgot password?
                  </span>
                </div>
              </>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-[13px] font-medium text-[#1E293B]">
                    6-Digit One-Time Password (OTP)
                  </label>
                  {!otpSent ? (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      className="text-xs font-semibold text-[#2563EB] hover:underline"
                    >
                      Send OTP Code
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      className="text-xs text-[#64748B] hover:underline"
                    >
                      Resend OTP
                    </button>
                  )}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter 6-digit OTP"
                    className="w-full px-3.5 py-2 text-sm tracking-widest font-mono text-center border border-[#E2E8F0] rounded-lg focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 bg-white"
                    required
                  />
                  {!otpSent && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleSendOtp}
                      className="shrink-0"
                    >
                      Request OTP
                    </Button>
                  )}
                </div>
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              className={`w-full mt-2 ${
                isStudent
                  ? "bg-[#2563EB] hover:bg-[#1D4ED8]"
                  : "bg-[#0D9488] hover:bg-[#0F766E]"
              }`}
              isLoading={loading}
            >
              Sign In to {isStudent ? "Student" : "Parent"} Portal
            </Button>
          </form>

          {/* Quick Switch Link between Student & Parent */}
          <div className="mt-6 pt-4 border-t border-[#E2E8F0] text-center space-y-3">
            <div>
              {isStudent ? (
                <Link
                  href="/login?role=parent"
                  className="text-xs font-medium text-[#0D9488] hover:underline inline-flex items-center gap-1"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Looking for Parent Login? Click here →</span>
                </Link>
              ) : (
                <Link
                  href="/login?role=student"
                  className="text-xs font-medium text-[#2563EB] hover:underline inline-flex items-center gap-1"
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>Looking for Student Login? Click here →</span>
                </Link>
              )}
            </div>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#64748B]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#14B8A6]" />
              <span>Secured with institution-level tenant isolation & JWT RBAC</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-3 border-[#153B66] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-xs text-[#64748B] font-medium">Loading portal login...</p>
          </div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
