"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, User, Users, Lock, School, AlertCircle } from "lucide-react";
import { Button } from "@/components/shared/Button";
import { FormInput } from "@/components/shared/FormInput";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("john.doe@student.apex.edu");
  const [password, setPassword] = useState("Student@123");
  const [roleMode, setRoleMode] = useState<"STUDENT" | "PARENT">("STUDENT");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setStudentDemo = () => {
    setRoleMode("STUDENT");
    setEmail("john.doe@student.apex.edu");
    setPassword("Student@123");
    setError(null);
  };

  const setParentDemo = () => {
    setRoleMode("PARENT");
    setEmail("robert.doe@parent.apex.edu");
    setPassword("Parent@123");
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
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
              Quick One-Click Demo Logins
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

          {error && (
            <div className="mb-4 p-3 bg-[#FEE2E2] border border-[#FECACA] rounded-lg text-xs text-[#DC2626] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <FormInput
              label="Institutional Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. name@student.apex.edu"
              required
            />

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

