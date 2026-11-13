"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  User,
  Users,
  Lock,
  School,
  AlertCircle,
  KeyRound,
  Smartphone,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/shared/Button";
import { FormInput } from "@/components/shared/FormInput";

export default function LoginPage() {
  const router = useRouter();
  const [authMethod, setAuthMethod] = useState<"PASSWORD" | "OTP">("PASSWORD");
  const [roleMode, setRoleMode] = useState<"STUDENT" | "PARENT">("STUDENT");
  const [email, setEmail] = useState("john.doe@student.apex.edu");
  const [password, setPassword] = useState("Student@123");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const setStudentDemo = () => {
    setRoleMode("STUDENT");
    setEmail("john.doe@student.apex.edu");
    setPassword("Student@123");
    setOtp("");
    setOtpSent(false);
    setError(null);
    setInfoMessage(null);
  };

  const setParentDemo = () => {
    setRoleMode("PARENT");
    setEmail("robert.doe@parent.apex.edu");
    setPassword("Parent@123");
    setOtp("");
    setOtpSent(false);
    setError(null);
    setInfoMessage(null);
  };

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

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-2xl bg-[#153B66] text-white flex items-center justify-center shadow-lg">
            <School className="w-8 h-8 text-[#14B8A6]" />
          </div>
        </div>
        <h1 className="mt-4 text-center text-2xl font-bold tracking-tight text-[#1E293B]">
          Apex Institutional ERP
        </h1>
        <p className="mt-1 text-center text-xs font-medium text-[#64748B]">
          Student & Parent Portal • Unified Shared Authentication
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl border border-[#E2E8F0] sm:rounded-2xl sm:px-10">
          {/* Quick Demo Selector */}
          <div className="mb-6 p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl">
            <p className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider mb-2">
              Quick One-Click Demo Credentials
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={setStudentDemo}
                className={`py-2 px-3 text-xs font-semibold rounded-lg border flex items-center justify-center gap-1.5 transition-all ${
                  roleMode === "STUDENT"
                    ? "bg-[#153B66] text-white border-[#153B66] shadow-sm"
                    : "bg-white text-[#1E293B] border-[#E2E8F0] hover:bg-slate-50"
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Student Login</span>
              </button>
              <button
                type="button"
                onClick={setParentDemo}
                className={`py-2 px-3 text-xs font-semibold rounded-lg border flex items-center justify-center gap-1.5 transition-all ${
                  roleMode === "PARENT"
                    ? "bg-[#153B66] text-white border-[#153B66] shadow-sm"
                    : "bg-white text-[#1E293B] border-[#E2E8F0] hover:bg-slate-50"
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Parent Login</span>
              </button>
            </div>
          </div>

          {/* Authentication Method Switcher: Password vs OTP (STU-FE-01) */}
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
              label="Institutional Email / Identifier"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. name@student.apex.edu"
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
              className="w-full mt-2"
              isLoading={loading}
            >
              Sign In to {roleMode === "STUDENT" ? "Student" : "Parent"} Portal
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-[#E2E8F0] text-center">
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
