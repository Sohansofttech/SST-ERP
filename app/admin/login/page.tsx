"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useInstitution } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { Modal } from "@/components/ui/modal";
import {
  Building2,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  KeyRound,
  Sparkles,
  School,
  GraduationCap,
  Users,
  ShieldAlert,
} from "lucide-react";

export default function InstitutionLoginPage() {
  const router = useRouter();
  const { profile } = useInstitution();

  // Form states
  const [institutionCode, setInstitutionCode] = useState("SST-ENG-001");
  const [usernameOrEmail, setUsernameOrEmail] = useState("admin@sohansoft.in");
  const [password, setPassword] = useState("Admin@2026");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Status & Error states
  const [fieldErrors, setFieldErrors] = useState<{
    institutionCode?: string;
    usernameOrEmail?: string;
    password?: string;
  }>({});
  const [authError, setAuthError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);

  // Forgot password modal
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotCode, setForgotCode] = useState("SST-ENG-001");
  const [forgotEmail, setForgotEmail] = useState("admin@sohansoft.in");
  const [forgotSubmitted, setForgotSubmitted] = useState(false);
  const [forgotError, setForgotError] = useState("");

  const validateForm = () => {
    const errors: {
      institutionCode?: string;
      usernameOrEmail?: string;
      password?: string;
    } = {};

    if (!institutionCode.trim()) {
      errors.institutionCode = "Institution ID / Code is required.";
    }

    if (!usernameOrEmail.trim()) {
      errors.usernameOrEmail = "Administrator Email or Username is required.";
    } else if (
      usernameOrEmail.includes("@") &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(usernameOrEmail.trim())
    ) {
      errors.usernameOrEmail = "Please enter a valid institutional email address.";
    }

    if (!password) {
      errors.password = "Password is required.";
    } else if (password.length < 6) {
      errors.password = "Password must be at least 6 characters.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    // Simulated Demo Authentication Delay
    setTimeout(() => {
      // Demo validation: Check if user inputted something obviously invalid
      if (password === "wrongpassword" || institutionCode.toLowerCase() === "invalid") {
        setIsLoading(false);
        setAuthError("Authentication failed: Unrecognized Institution Code or Invalid Credentials.");
        return;
      }

      setLoginSuccess(true);
      setTimeout(() => {
        router.push("/admin");
      }, 700);
    }, 600);
  };

  const handleQuickDemoFill = () => {
    setInstitutionCode(profile.code || "SST-ENG-001");
    setUsernameOrEmail("admin@sohansoft.in");
    setPassword("Admin@2026");
    setFieldErrors({});
    setAuthError("");
  };

  const handleForgotPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError("");

    if (!forgotCode.trim()) {
      setForgotError("Institution Code is required.");
      return;
    }
    if (!forgotEmail.trim() || !forgotEmail.includes("@")) {
      setForgotError("A valid institutional contact email is required.");
      return;
    }

    setForgotSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between">
      {/* Top Navbar */}
      <header className="w-full bg-white border-b border-[#E2E8F0] px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 text-[#153B66] hover:opacity-90 transition-opacity">
            <div className="w-8 h-8 rounded-lg bg-[#153B66] text-white flex items-center justify-center font-black text-sm shadow-xs">
              SST
            </div>
            <div>
              <span className="text-sm font-extrabold tracking-tight text-[#153B66] block leading-tight">
                SST ERP
              </span>
              <span className="text-[10px] uppercase font-bold text-[#14B8A6] tracking-wider block">
                Institution Admin Portal
              </span>
            </div>
          </Link>

          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs font-semibold text-[#64748B] hover:text-[#153B66] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Main Portal</span>
          </Link>
        </div>
      </header>

      {/* Main Authentication Container */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-5xl bg-white rounded-2xl border border-[#E2E8F0] shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          {/* Left Hero Branded Banner (5 Cols) */}
          <div className="lg:col-span-5 bg-gradient-to-br from-[#153B66] via-[#1A4578] to-[#0E2847] text-white p-6 sm:p-8 flex flex-col justify-between">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#14B8A6]/20 border border-[#14B8A6]/40 text-[#14B8A6] text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Enterprise Administration</span>
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
                  SST ERP Institution Portal
                </h1>
                <p className="text-xs sm:text-sm text-[#93C5FD] mt-2 leading-relaxed">
                  Centralized governance, academic lifecycle setup, department orchestration, and role-based institutional administration.
                </p>
              </div>

              {/* Institutional Capabilities List */}
              <div className="space-y-3.5 pt-2">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-[#2563EB]/40 border border-[#2563EB] flex items-center justify-center shrink-0 mt-0.5 text-white">
                    <School className="w-4 h-4 text-[#93C5FD]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Institutional Settings</h4>
                    <p className="text-[11px] text-[#CBD5E1]">Campus profile, code, accreditation, and administrative metadata.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-[#14B8A6]/30 border border-[#14B8A6] flex items-center justify-center shrink-0 mt-0.5 text-white">
                    <GraduationCap className="w-4 h-4 text-[#99F6E4]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Academic Hierarchy</h4>
                    <p className="text-[11px] text-[#CBD5E1]">Academic cycles, degrees, departments, batches, sections, and subjects.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-[#2563EB]/40 border border-[#2563EB] flex items-center justify-center shrink-0 mt-0.5 text-white">
                    <Users className="w-4 h-4 text-[#93C5FD]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Role-Based Access Control</h4>
                    <p className="text-[11px] text-[#CBD5E1]">Granular permissions matrix for campus principals, deans, and officers.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Tenant Scoping Badge */}
            <div className="pt-8 border-t border-white/10 mt-6">
              <div className="flex items-center gap-2 text-xs text-[#CBD5E1]">
                <ShieldCheck className="w-4 h-4 text-[#14B8A6]" />
                <span>Tenant Scoped: <strong className="text-white">{profile.name}</strong></span>
              </div>
              <p className="text-[10px] text-[#93C5FD] mt-1 font-mono">
                Code: {profile.code} • {profile.type}
              </p>
            </div>
          </div>

          {/* Right Login Form (7 Cols) */}
          <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between">
            <div className="space-y-6">
              {/* Form Title */}
              <div>
                <div className="flex items-center justify-between">
                  <h2 className="text-xl sm:text-2xl font-black text-[#1E293B] tracking-tight">
                    Institution Sign In
                  </h2>
                  <span className="text-[11px] font-bold text-[#2563EB] bg-[#EFF6FF] px-2.5 py-1 rounded-full border border-[#DBEAFE]">
                    Demo Authentication
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-[#64748B] mt-1">
                  Enter your assigned institutional identifier and administrative credentials to manage your campus.
                </p>
              </div>

              {/* Demo Mode Notice */}
              <div className="p-3.5 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] text-xs text-[#1E3A8A] flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold text-[#1E3A8A]">
                    Prototype Demo Session Mode
                  </p>
                  <p className="text-[11px] text-[#1E40AF] leading-relaxed">
                    This portal currently operates in local demo mode until shared backend authentication is integrated. Default test credentials have been pre-filled for your review.
                  </p>
                </div>
              </div>

              {/* Auth Failure Alert */}
              {authError && (
                <Alert
                  variant="error"
                  title="Sign In Failed"
                  icon={<AlertCircle className="w-5 h-5 text-[#DC2626]" />}
                >
                  {authError}
                </Alert>
              )}

              {/* Success Notification */}
              {loginSuccess && (
                <Alert
                  variant="success"
                  title="Sign In Successful"
                  icon={<CheckCircle2 className="w-5 h-5 text-[#16A34A]" />}
                >
                  Redirecting to the Institution Admin Dashboard...
                </Alert>
              )}

              {/* Login Form */}
              <form onSubmit={handleSignIn} className="space-y-4">
                {/* Field 1: Institution Code */}
                <div>
                  <Input
                    label="Institution ID / Code"
                    id="institutionCode"
                    type="text"
                    value={institutionCode}
                    onChange={(e) => {
                      setInstitutionCode(e.target.value);
                      if (fieldErrors.institutionCode) {
                        setFieldErrors((prev) => ({ ...prev, institutionCode: undefined }));
                      }
                    }}
                    placeholder="e.g. SST-ENG-001"
                    leftIcon={<Building2 className="w-4 h-4 text-[#64748B]" />}
                    error={fieldErrors.institutionCode}
                    helperText="Enter your campus tenant identifier"
                  />
                </div>

                {/* Field 2: Username / Email */}
                <div>
                  <Input
                    label="Administrator Email or Username"
                    id="usernameOrEmail"
                    type="text"
                    value={usernameOrEmail}
                    onChange={(e) => {
                      setUsernameOrEmail(e.target.value);
                      if (fieldErrors.usernameOrEmail) {
                        setFieldErrors((prev) => ({ ...prev, usernameOrEmail: undefined }));
                      }
                    }}
                    placeholder="e.g. admin@sohansoft.in"
                    leftIcon={<Mail className="w-4 h-4 text-[#64748B]" />}
                    error={fieldErrors.usernameOrEmail}
                  />
                </div>

                {/* Field 3: Password with Show/Hide Toggle */}
                <div>
                  <label
                    htmlFor="adminPassword"
                    className="block text-xs font-semibold text-[#1E293B] uppercase tracking-wider mb-1.5"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#64748B]">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      id="adminPassword"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (fieldErrors.password) {
                          setFieldErrors((prev) => ({ ...prev, password: undefined }));
                        }
                      }}
                      placeholder="••••••••"
                      className={`w-full pl-9 pr-10 py-2.5 rounded-lg border text-sm transition-all focus:outline-none focus:ring-2 bg-white text-[#1E293B] ${
                        fieldErrors.password
                          ? "border-[#DC2626] focus:ring-[#DC2626]/20"
                          : "border-[#E2E8F0] focus:border-[#2563EB] focus:ring-[#2563EB]/20"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#64748B] hover:text-[#1E293B] transition-colors cursor-pointer"
                      title={showPassword ? "Hide password" : "Show password"}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {fieldErrors.password && (
                    <p className="mt-1 text-xs text-[#DC2626] font-medium">{fieldErrors.password}</p>
                  )}
                </div>

                {/* Options: Remember Me & Forgot Password */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded text-[#2563EB] border-[#CBD5E1] focus:ring-[#2563EB]"
                    />
                    <span className="text-xs font-medium text-[#64748B]">
                      Remember this institution
                    </span>
                  </label>

                  <button
                    type="button"
                    onClick={() => {
                      setForgotSubmitted(false);
                      setForgotError("");
                      setIsForgotModalOpen(true);
                    }}
                    className="text-xs font-semibold text-[#2563EB] hover:text-[#1D4ED8] hover:underline cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>

                {/* Primary Sign In Button */}
                <div className="pt-2 space-y-2.5">
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-full text-sm font-bold shadow-md"
                    isLoading={isLoading}
                    rightIcon={!isLoading ? <ArrowRight className="w-4 h-4" /> : undefined}
                  >
                    {isLoading ? "Validating Session..." : "Sign In to Institution Portal"}
                  </Button>

                  {/* Quick Fill / Reset Helper Button */}
                  <div className="flex items-center justify-between text-xs text-[#64748B] pt-1">
                    <span>Testing this prototype?</span>
                    <button
                      type="button"
                      onClick={handleQuickDemoFill}
                      className="font-semibold text-[#14B8A6] hover:text-[#0D9488] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Quick Fill Demo Credentials</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* Bottom Footer Details */}
            <div className="mt-8 pt-4 border-t border-[#F1F5F9] flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-[#94A3B8]">
              <span>SST ERP • Institution Administration Subsystem</span>
              <div className="flex items-center gap-1 text-[#64748B]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#14B8A6]" />
                <span>Isolated Institutional Context</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Page Footer */}
      <footer className="w-full text-center py-4 text-xs text-[#94A3B8] border-t border-[#E2E8F0] bg-white">
        © {new Date().getFullYear()} SST ERP Solutions. All institutional administrative rights reserved.
      </footer>

      {/* Forgot Password Modal */}
      <Modal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
        title="Institution Password Recovery"
        description="Request administrative credential reset instructions for your institution."
        maxWidth="md"
        footer={
          !forgotSubmitted ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsForgotModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleForgotPasswordSubmit}
                leftIcon={<KeyRound className="w-4 h-4" />}
              >
                Send Reset Link
              </Button>
            </>
          ) : (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsForgotModalOpen(false)}
            >
              Done
            </Button>
          )
        }
      >
        {!forgotSubmitted ? (
          <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
            <div className="p-3 rounded-lg bg-[#FEF3C7] border border-[#FDE68A] text-xs text-[#92400E] flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5" />
              <span>
                In demo mode, password recovery is simulated. In a live deployment, a cryptographic reset token is dispatched to the registered campus authority email.
              </span>
            </div>

            {forgotError && (
              <p className="text-xs text-[#DC2626] font-semibold">{forgotError}</p>
            )}

            <div>
              <Input
                label="Institution Code"
                value={forgotCode}
                onChange={(e) => setForgotCode(e.target.value)}
                placeholder="e.g. SST-ENG-001"
              />
            </div>

            <div>
              <Input
                label="Registered Administrator Email"
                type="email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="admin@sohansoft.in"
                helperText="Recovery instructions will be routed to this institutional inbox."
              />
            </div>
          </form>
        ) : (
          <div className="py-4 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#DCFCE7] text-[#16A34A] mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-[#1E293B]">
              Recovery Instructions Dispatched
            </h4>
            <p className="text-xs text-[#64748B] max-w-sm mx-auto">
              Simulated password reset instructions have been forwarded to <strong>{forgotEmail}</strong> for institution code <strong>{forgotCode}</strong>.
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}
