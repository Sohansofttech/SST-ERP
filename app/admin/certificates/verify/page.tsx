"use client";

import React, { useState, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useInstitution } from "@/lib/store";
import {
  ShieldCheck,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowLeft,
  Building2,
  Calendar,
  Award,
  ExternalLink,
  QrCode,
  Sparkles,
} from "lucide-react";

function VerifyContent() {
  const searchParams = useSearchParams();
  const initialQuery =
    searchParams.get("query") ||
    searchParams.get("cert") ||
    searchParams.get("code") ||
    searchParams.get("v") ||
    "";

  const { verifyCertificateQuery, profile } = useInstitution();
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [activeQuery, setActiveQuery] = useState(initialQuery);

  const result = useMemo(() => {
    if (!activeQuery.trim()) return null;
    return verifyCertificateQuery(activeQuery.trim());
  }, [activeQuery, verifyCertificateQuery]);

  const hasSearched = Boolean(activeQuery.trim());

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchTerm.trim()) return;
    setActiveQuery(searchTerm.trim());
  };

  const cert = result?.certificate;

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Back Link */}
        <div className="flex items-center justify-between">
          <Link
            href="/admin/certificates"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2563EB] hover:text-[#1D4ED8] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Certificate Console
          </Link>
          <span className="text-[11px] font-bold text-[#64748B] flex items-center gap-1 bg-white px-2.5 py-1 rounded-full border border-[#E2E8F0]">
            <Sparkles className="w-3 h-3 text-[#14B8A6]" /> Public Verification Registry
          </span>
        </div>

        {/* Verification Header */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs p-6 sm:p-8 text-center space-y-3">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#EFF6FF] text-[#2563EB] mb-1">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#1E293B] tracking-tight">
            Institutional Document Verification Registry
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] max-w-lg mx-auto">
            Verify the authenticity and current validity of certificates, degree transcripts, and
            clearance records issued by {profile.name}.
          </p>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="max-w-xl mx-auto pt-4 flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Enter Certificate No. (e.g. SST/BC/2026/0001) or Verification ID"
                className="w-full h-11 pl-10 pr-4 text-xs sm:text-sm font-medium border border-[#CBD5E1] rounded-xl bg-white text-[#1E293B] placeholder:text-[#94A3B8] focus:outline-hidden focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10 transition-all"
              />
            </div>
            <button
              type="submit"
              className="h-11 px-5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs sm:text-sm font-bold shadow-xs hover:shadow-md transition-all flex items-center gap-2 shrink-0 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" /> Verify
            </button>
          </form>

          {/* Quick Examples */}
          <div className="text-[11px] text-[#94A3B8] pt-1 flex items-center justify-center gap-2 flex-wrap">
            <span>Try sample queries:</span>
            <button
              type="button"
              onClick={() => {
                setSearchTerm("SST/BC/2026/0001");
                setActiveQuery("SST/BC/2026/0001");
              }}
              className="text-[#2563EB] hover:underline font-mono"
            >
              SST/BC/2026/0001
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => {
                setSearchTerm("SST-VER-89E41B");
                setActiveQuery("SST-VER-89E41B");
              }}
              className="text-[#2563EB] hover:underline font-mono"
            >
              SST-VER-89E41B
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => {
                setSearchTerm("SST/BC/2026/0002");
                setActiveQuery("SST/BC/2026/0002");
              }}
              className="text-[#DC2626] hover:underline font-mono"
            >
              SST/BC/2026/0002 (Revoked)
            </button>
          </div>
        </div>

        {/* Verification Result Card */}
        {hasSearched && (
          <div>
            {!result?.found ? (
              <div className="bg-white rounded-2xl border border-red-200 shadow-xs p-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
                  <XCircle className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-[#1E293B]">
                  No Matching Certificate Record Found
                </h3>
                <p className="text-xs text-[#64748B] max-w-md mx-auto">
                  No official document could be verified matching &ldquo;{activeQuery}&rdquo;. Please verify the
                  certificate number, registration ID, or barcode and try again.
                </p>
              </div>
            ) : cert ? (
              <div
                className={`bg-white rounded-2xl border shadow-xs overflow-hidden ${
                  result.status === "Valid"
                    ? "border-emerald-200"
                    : result.status === "Revoked"
                    ? "border-red-200"
                    : "border-amber-200"
                }`}
              >
                {/* Result Header Banner */}
                <div
                  className={`p-5 sm:p-6 flex items-start justify-between gap-4 border-b ${
                    result.status === "Valid"
                      ? "bg-emerald-50/70 border-emerald-100 text-emerald-950"
                      : result.status === "Revoked"
                      ? "bg-red-50/70 border-red-100 text-red-950"
                      : "bg-amber-50/70 border-amber-100 text-amber-950"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        result.status === "Valid"
                          ? "bg-emerald-600 text-white"
                          : result.status === "Revoked"
                          ? "bg-red-600 text-white"
                          : "bg-amber-600 text-white"
                      }`}
                    >
                      {result.status === "Valid" ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : result.status === "Revoked" ? (
                        <XCircle className="w-5 h-5" />
                      ) : (
                        <AlertTriangle className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            result.status === "Valid"
                              ? "bg-emerald-200 text-emerald-900"
                              : result.status === "Revoked"
                              ? "bg-red-200 text-red-900"
                              : "bg-amber-200 text-amber-900"
                          }`}
                        >
                          {result.status === "Valid"
                            ? "OFFICIALLY VERIFIED & ACTIVE"
                            : result.status === "Revoked"
                            ? "REVOKED / CANCELLED"
                            : "SUPERSEDED BY REISSUE"}
                        </span>
                        <span className="text-xs font-mono font-bold text-[#64748B]">
                          ID: {cert.verificationCode}
                        </span>
                      </div>
                      <h2 className="text-base sm:text-lg font-black text-[#1E293B] mt-1">
                        {cert.title}
                      </h2>
                      <p className="text-xs text-[#64748B]">
                        Certificate Reference:{" "}
                        <strong className="text-[#1E293B] font-mono">{cert.certificateNumber}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="hidden sm:flex flex-col items-end">
                    <span className="text-[10px] text-[#64748B] uppercase font-bold">Issued On</span>
                    <span className="text-xs font-bold text-[#1E293B] flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-[#2563EB]" /> {cert.issueDate}
                    </span>
                  </div>
                </div>

                {/* Revocation notice if revoked */}
                {result.status === "Revoked" && cert.revocationReason && (
                  <div className="bg-red-50 p-4 border-b border-red-100 flex items-start gap-2.5 text-xs text-red-800">
                    <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-bold">Official Revocation Notice:</strong> This
                      document was cancelled/revoked on {cert.revokedAt?.split("T")[0] || "record"}.
                      <p className="mt-0.5 text-red-700">Reason: &ldquo;{cert.revocationReason}&rdquo;</p>
                    </div>
                  </div>
                )}

                {/* Superseded notice if reissued */}
                {result.status === "Superseded" && (
                  <div className="bg-amber-50 p-4 border-b border-amber-100 flex items-start gap-2.5 text-xs text-amber-800">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-bold">Document Superseded:</strong> A replacement
                      certificate has been issued due to: &ldquo;{cert.reissueReason || "Administrative Reissue"}&rdquo;.
                    </div>
                  </div>
                )}

                {/* Body Details */}
                <div className="p-6 space-y-6">
                  {/* Verified Metadata Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="p-3.5 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
                        Recipient Student
                      </span>
                      <p className="text-sm font-extrabold text-[#1E293B]">{cert.studentName}</p>
                      <p className="text-xs text-[#64748B]">
                        Roll No: <span className="font-mono text-[#1E293B]">{cert.rollNumber}</span> | ID:{" "}
                        <span className="font-mono text-[#1E293B]">{cert.studentUniqueId}</span>
                      </p>
                      <p className="text-[11px] text-[#64748B]">
                        Parent/Guardian: {cert.fatherOrGuardianName}
                      </p>
                    </div>

                    <div className="p-3.5 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
                        Academic Placement
                      </span>
                      <p className="text-sm font-extrabold text-[#1E293B]">{cert.courseName}</p>
                      <p className="text-xs text-[#64748B]">{cert.departmentName}</p>
                      <p className="text-[11px] text-[#64748B]">
                        Cohort Batch: {cert.batch} | Term: {cert.academicYearName}
                      </p>
                    </div>
                  </div>

                  {/* Certified Statement */}
                  <div className="p-4 bg-white rounded-xl border border-[#E2E8F0] space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-[#2563EB]" /> Certified Statement of Record
                    </span>
                    <p className="text-xs sm:text-sm text-[#1E293B] leading-relaxed italic font-serif">
                      &ldquo;{cert.bodyText}&rdquo;
                    </p>
                    {cert.purpose && (
                      <p className="text-[11px] text-[#64748B] pt-1">
                        <strong>Issued for:</strong> {cert.purpose}
                      </p>
                    )}
                  </div>

                  {/* Issuing Authority Snapshot */}
                  <div className="pt-2 border-t border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-[#64748B]">
                    <div className="space-y-0.5">
                      <p className="font-bold text-[#1E293B] flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-[#2563EB]" /> {cert.institutionName}
                      </p>
                      <p className="text-[11px]">
                        {cert.affiliation} • {cert.accreditation}
                      </p>
                      <p className="text-[11px] text-[#94A3B8]">{cert.institutionAddress}</p>
                    </div>

                    <div className="text-left sm:text-right space-y-0.5 shrink-0">
                      <p className="font-bold text-[#1E293B]">{cert.signatoryName}</p>
                      <p className="text-[11px]">{cert.signatoryTitle}</p>
                      <p className="text-[10px] text-emerald-600 font-semibold flex items-center sm:justify-end gap-1">
                        <QrCode className="w-3 h-3" /> Digitally Verified
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer Bar */}
                <div className="bg-[#F8FAFC] px-6 py-3 border-t border-[#E2E8F0] flex items-center justify-between text-[11px] text-[#94A3B8]">
                  <span>SST ERP Cryptographic Trust Verification Registry</span>
                  <Link
                    href={`/admin/certificates`}
                    className="text-[#2563EB] hover:underline font-semibold flex items-center gap-1"
                  >
                    View in Administrative Console <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}

export default function CertificateVerificationPage() {
  return (
    <Suspense
      fallback={
        <div className="p-10 text-center text-xs text-[#64748B]">
          Loading verification registry...
        </div>
      }
    >
      <VerifyContent />
    </Suspense>
  );
}
