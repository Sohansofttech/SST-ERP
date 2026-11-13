"use client";

import React, { useState, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useInstitution } from "@/lib/store";
import {
  CertificateType,
  CertificatePriority,
  CertificateApplicationStatus,
  CertificateApplicationItem,
  IssuedCertificateItem,
  CertificateTemplate,
} from "@/types/institution";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableEmpty,
} from "@/components/ui/table";
import {
  Award,
  FileText,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Plus,
  Search,
  Download,
  Printer,
  History,
  QrCode,
  RotateCcw,
  Building,
  Info,
  Sparkles,
  Sliders,
  Hash,
} from "lucide-react";

type ActiveTab =
  | "overview"
  | "applications"
  | "issued"
  | "verify"
  | "templates"
  | "numbering"
  | "reports"
  | "history";

const PRIORITY_BADGES: Record<CertificatePriority, { label: string; bg: string; text: string }> = {
  Normal: { label: "Normal", bg: "bg-slate-100", text: "text-slate-700" },
  Urgent: { label: "Urgent", bg: "bg-amber-100", text: "text-amber-800" },
  Immediate: { label: "Immediate", bg: "bg-red-100", text: "text-red-800" },
};

const STATUS_BADGES: Record<
  CertificateApplicationStatus,
  { label: string; bg: string; text: string; border: string }
> = {
  Draft: { label: "Draft", bg: "bg-slate-50", text: "text-slate-700", border: "border-slate-200" },
  Submitted: { label: "Submitted", bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  "Under Review": { label: "Under Review", bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200" },
  "Additional Info Required": {
    label: "Info Required",
    bg: "bg-amber-50",
    text: "text-amber-800",
    border: "border-amber-200",
  },
  Approved: { label: "Approved", bg: "bg-teal-50", text: "text-teal-700", border: "border-teal-200" },
  Rejected: { label: "Rejected", bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
  Generated: { label: "Generated", bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
  Issued: { label: "Issued", bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  Cancelled: { label: "Cancelled", bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200" },
};

function CertificatesContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab") as ActiveTab | null;

  const {
    profile,
    students,
    courses,
    certificateTemplates,
    certificateNumberConfig,
    certificateApplications,
    issuedCertificates,
    certificateAudits,
    evaluateCertificateEligibility,
    createCertificateApplication,
    transitionCertificateApplicationStatus,
    overrideCertificateEligibilityCheck,
    generateCertificateForApplication,
    issueCertificate,
    reissueCertificate,
    revokeCertificate,
    verifyCertificateQuery,
    updateCertificateTemplate,
    updateCertificateNumberConfig,
    getCertificateMetrics,
  } = useInstitution();

  // Active Tab State
  const [activeTab, setActiveTab] = useState<ActiveTab>(
    tabParam &&
      [
        "overview",
        "applications",
        "issued",
        "verify",
        "templates",
        "numbering",
        "reports",
        "history",
      ].includes(tabParam)
      ? tabParam
      : "overview"
  );

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL");
  const [courseFilter, setCourseFilter] = useState<string>("ALL");

  // Notifications
  const [actionAlert, setActionAlert] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);

  // Modals
  const [showNewAppModal, setShowNewAppModal] = useState(false);
  const [selectedAppForDetail, setSelectedAppForDetail] = useState<CertificateApplicationItem | null>(null);
  const [selectedCertForPreview, setSelectedCertForPreview] = useState<IssuedCertificateItem | null>(null);
  const [selectedCertForReissue, setSelectedCertForReissue] = useState<IssuedCertificateItem | null>(null);
  const [selectedCertForRevoke, setSelectedCertForRevoke] = useState<IssuedCertificateItem | null>(null);
  const [selectedTemplateForEdit, setSelectedTemplateForEdit] = useState<CertificateTemplate | null>(null);

  // Form States for Modals
  // New App Form
  const [newAppStudentId, setNewAppStudentId] = useState(students[0]?.id || "");
  const [newAppCertType, setNewAppCertType] = useState<CertificateType>("Bonafide Certificate");
  const [newAppPriority, setNewAppPriority] = useState<CertificatePriority>("Normal");
  const [newAppPurpose, setNewAppPurpose] = useState("");
  const [newAppRemarks, setNewAppRemarks] = useState("");

  // Rejection / Notes Prompt State
  const [rejectionReasonInput, setRejectionReasonInput] = useState("");
  const [showRejectPrompt, setShowRejectPrompt] = useState(false);
  const [infoNotesInput, setInfoNotesInput] = useState("");
  const [showInfoPrompt, setShowInfoPrompt] = useState(false);

  // Override Prompt State
  const [overrideCheckId, setOverrideCheckId] = useState("");
  const [overrideReasonInput, setOverrideReasonInput] = useState("");
  const [showOverridePrompt, setShowOverridePrompt] = useState(false);

  // Reissue Form State
  const [reissueReasonInput, setReissueReasonInput] = useState("");
  const [reissueCorrectedName, setReissueCorrectedName] = useState("");
  const [reissueCorrectedFather, setReissueCorrectedFather] = useState("");
  const [reissueCorrectedDob, setReissueCorrectedDob] = useState("");

  // Revoke Form State
  const [revokeReasonInput, setRevokeReasonInput] = useState("");

  // Verification Registry Tab State
  const [verifySearchQuery, setVerifySearchQuery] = useState("");
  const [verifyResult, setVerifyResult] = useState<ReturnType<typeof verifyCertificateQuery> | null>(null);
  const [verifyPerformed, setVerifyPerformed] = useState(false);

  // Numbering Config State
  const [tempNumberPrefix, setTempNumberPrefix] = useState(certificateNumberConfig.prefix);
  const [tempUseAY, setTempUseAY] = useState(certificateNumberConfig.useAcademicYear);
  const [tempSeparator, setTempSeparator] = useState(certificateNumberConfig.separator);
  const [tempPadding, setTempPadding] = useState(certificateNumberConfig.sequencePadding);

  // Metrics
  const metrics = useMemo(() => getCertificateMetrics(), [getCertificateMetrics]);

  // Filtered Applications
  const filteredApplications = useMemo(() => {
    return certificateApplications.filter((app) => {
      const matchSearch =
        searchTerm === "" ||
        app.applicationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.studentUniqueId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.certificateType.toLowerCase().includes(searchTerm.toLowerCase());

      const matchType = typeFilter === "ALL" || app.certificateType === typeFilter;
      const matchStatus = statusFilter === "ALL" || app.status === statusFilter;
      const matchPriority = priorityFilter === "ALL" || app.priority === priorityFilter;
      const matchCourse = courseFilter === "ALL" || app.courseId === courseFilter;

      return matchSearch && matchType && matchStatus && matchPriority && matchCourse;
    });
  }, [certificateApplications, searchTerm, typeFilter, statusFilter, priorityFilter, courseFilter]);

  // Filtered Issued Certificates
  const filteredIssuedCertificates = useMemo(() => {
    return issuedCertificates.filter((cert) => {
      const matchSearch =
        searchTerm === "" ||
        cert.certificateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.verificationCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.certificateType.toLowerCase().includes(searchTerm.toLowerCase());

      const matchType = typeFilter === "ALL" || cert.certificateType === typeFilter;
      const matchStatus = statusFilter === "ALL" || cert.status === statusFilter;

      return matchSearch && matchType && matchStatus;
    });
  }, [issuedCertificates, searchTerm, typeFilter, statusFilter]);

  // Live Eligibility Preview for New Application Modal
  const previewEligibility = useMemo(() => {
    if (!newAppStudentId || !newAppCertType) return null;
    return evaluateCertificateEligibility(newAppStudentId, newAppCertType);
  }, [newAppStudentId, newAppCertType, evaluateCertificateEligibility]);

  // ---------------------------------------------------------------------------
  // Action Handlers
  // ---------------------------------------------------------------------------

  const handleCreateApplication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAppPurpose.trim()) {
      setActionAlert({ type: "error", message: "Purpose of certificate request is mandatory." });
      return;
    }

    const res = createCertificateApplication({
      studentId: newAppStudentId,
      certificateType: newAppCertType,
      priority: newAppPriority,
      purpose: newAppPurpose.trim(),
      remarks: newAppRemarks.trim(),
      requestedBy: "Institution Admin",
    });

    if (res.success && res.application) {
      setActionAlert({ type: "success", message: res.message });
      setShowNewAppModal(false);
      setNewAppPurpose("");
      setNewAppRemarks("");
      setActiveTab("applications");
    } else {
      setActionAlert({ type: "error", message: res.message });
    }
  };

  const handleTransition = (
    id: string,
    newStatus: CertificateApplicationStatus,
    metadata?: { reason?: string; reviewerOrApprover?: string; notes?: string }
  ) => {
    const res = transitionCertificateApplicationStatus(id, newStatus, metadata);
    if (res.success) {
      setActionAlert({ type: "success", message: res.message });
      // Update selected app if modal is open
      const updated = certificateApplications.find((a) => a.id === id);
      if (updated) setSelectedAppForDetail({ ...updated, status: newStatus });
    } else {
      setActionAlert({ type: "error", message: res.message });
    }
  };

  const handleExecuteOverride = () => {
    if (!overrideReasonInput || overrideReasonInput.trim().length < 5) {
      setActionAlert({
        type: "error",
        message: "A mandatory documented justification (min 5 chars) is required for override.",
      });
      return;
    }
    if (!selectedAppForDetail) return;

    const res = overrideCertificateEligibilityCheck(
      selectedAppForDetail.id,
      overrideCheckId,
      overrideReasonInput.trim(),
      "Institution Admin"
    );

    if (res.success) {
      setActionAlert({ type: "success", message: res.message });
      setShowOverridePrompt(false);
      setOverrideReasonInput("");
      // Refresh current app view
      const up = certificateApplications.find((a) => a.id === selectedAppForDetail.id);
      if (up) setSelectedAppForDetail(up);
    } else {
      setActionAlert({ type: "error", message: res.message });
    }
  };

  const handleGenerateCertificate = (app: CertificateApplicationItem) => {
    const res = generateCertificateForApplication(app.id, {
      signatoryName: "Dr. K. S. Murthy",
      signatoryTitle: "Principal & Head of Institution",
      performedBy: "Institution Admin",
    });

    if (res.success && res.certificate) {
      setActionAlert({ type: "success", message: res.message });
      setSelectedCertForPreview(res.certificate);
      setSelectedAppForDetail(null);
    } else {
      setActionAlert({ type: "error", message: res.message });
    }
  };

  const handleIssueCertificate = (cert: IssuedCertificateItem) => {
    const res = issueCertificate(cert.id, "Institution Admin");
    if (res.success) {
      setActionAlert({ type: "success", message: res.message });
      setSelectedCertForPreview((prev) => (prev ? { ...prev, status: "Active" } : null));
    } else {
      setActionAlert({ type: "error", message: res.message });
    }
  };

  const handleExecuteReissue = () => {
    if (!selectedCertForReissue) return;
    if (!reissueReasonInput || reissueReasonInput.trim().length < 5) {
      setActionAlert({
        type: "error",
        message: "A mandatory detailed justification (min 5 chars) is required for reissue.",
      });
      return;
    }

    const res = reissueCertificate(
      selectedCertForReissue.id,
      reissueReasonInput.trim(),
      "Institution Admin",
      {
        studentName: reissueCorrectedName.trim() || undefined,
        fatherOrGuardianName: reissueCorrectedFather.trim() || undefined,
        dob: reissueCorrectedDob.trim() || undefined,
      }
    );

    if (res.success && res.newCertificate) {
      setActionAlert({ type: "success", message: res.message });
      setSelectedCertForReissue(null);
      setReissueReasonInput("");
      setReissueCorrectedName("");
      setReissueCorrectedFather("");
      setReissueCorrectedDob("");
      setSelectedCertForPreview(res.newCertificate);
    } else {
      setActionAlert({ type: "error", message: res.message });
    }
  };

  const handleExecuteRevoke = () => {
    if (!selectedCertForRevoke) return;
    if (!revokeReasonInput || revokeReasonInput.trim().length < 5) {
      setActionAlert({
        type: "error",
        message: "A mandatory detailed justification (min 5 chars) is required for revocation.",
      });
      return;
    }

    const res = revokeCertificate(
      selectedCertForRevoke.id,
      revokeReasonInput.trim(),
      "Institution Admin"
    );

    if (res.success) {
      setActionAlert({ type: "success", message: res.message });
      setSelectedCertForRevoke(null);
      setRevokeReasonInput("");
    } else {
      setActionAlert({ type: "error", message: res.message });
    }
  };

  const handleVerifySearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifySearchQuery.trim()) return;
    const res = verifyCertificateQuery(verifySearchQuery.trim());
    setVerifyResult(res);
    setVerifyPerformed(true);
  };

  const handleSaveNumberingConfig = (e: React.FormEvent) => {
    e.preventDefault();
    const res = updateCertificateNumberConfig({
      ...certificateNumberConfig,
      prefix: tempNumberPrefix.trim().toUpperCase(),
      useAcademicYear: tempUseAY,
      separator: tempSeparator,
      sequencePadding: Number(tempPadding) || 4,
    });
    if (res.success) {
      setActionAlert({ type: "success", message: res.message });
    } else {
      setActionAlert({ type: "error", message: res.message });
    }
  };

  const handlePrintCertificate = () => {
    window.print();
  };

  // ---------------------------------------------------------------------------
  // CSV Exports
  // ---------------------------------------------------------------------------

  const exportApplicationsCSV = () => {
    const headers = [
      "Application Number",
      "Student ID",
      "Roll Number",
      "Student Name",
      "Degree Course",
      "Department",
      "Academic Year",
      "Certificate Type",
      "Priority",
      "Status",
      "Request Date",
      "Purpose",
      "Eligibility Status",
    ];

    const rows = certificateApplications.map((a) => [
      a.applicationNumber,
      a.studentUniqueId,
      a.rollNumber,
      `"${a.studentName}"`,
      `"${a.courseName}"`,
      `"${a.departmentName}"`,
      a.academicYearName,
      `"${a.certificateType}"`,
      a.priority,
      a.status,
      a.requestDate,
      `"${a.purpose.replace(/"/g, '""')}"`,
      a.eligibilityResult.canIssue ? "Eligible" : "Pending / Overridden",
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `SST_Certificate_Applications_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportIssuedCertificatesCSV = () => {
    const headers = [
      "Certificate Number",
      "Verification ID",
      "Certificate Type",
      "Student ID",
      "Roll Number",
      "Student Name",
      "Degree Course",
      "Department",
      "Academic Period",
      "Issue Date",
      "Signatory Name",
      "Signatory Title",
      "Status",
      "Is Reissue",
      "Previous Cert Number",
    ];

    const rows = issuedCertificates.map((c) => [
      c.certificateNumber,
      c.verificationCode,
      `"${c.certificateType}"`,
      c.studentUniqueId,
      c.rollNumber,
      `"${c.studentName}"`,
      `"${c.courseName}"`,
      `"${c.departmentName}"`,
      c.academicYearName,
      c.issueDate,
      `"${c.signatoryName}"`,
      `"${c.signatoryTitle}"`,
      c.status,
      c.isReissue ? "Yes" : "No",
      c.previousCertificateNumber || "N/A",
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `SST_Issued_Certificates_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportAuditTrailCSV = () => {
    const headers = ["Audit ID", "Timestamp", "Action", "Cert / App Number", "Student Name", "Details", "Reason", "Performed By"];
    const rows = certificateAudits.map((l) => [
      l.id,
      l.timestamp,
      l.action,
      l.certificateNumber || l.applicationId || "N/A",
      `"${l.studentName || "N/A"}"`,
      `"${l.details.replace(/"/g, '""')}"`,
      `"${(l.reason || "").replace(/"/g, '""')}"`,
      `"${l.performedBy}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `SST_Certificate_Audit_Trail_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Print Stylesheet Overrides */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-certificate-area,
          #printable-certificate-area * {
            visibility: visible;
          }
          #printable-certificate-area {
            position: fixed;
            left: 0;
            top: 0;
            width: 100vw;
            height: 100vh;
            margin: 0;
            padding: 2.5cm 2cm;
            background: white !important;
            box-shadow: none !important;
            border: none !important;
          }
        }
      `}</style>

      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[#E2E8F0]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-[#14B8A6] uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Institution Admin Portal
            </span>
            <span className="text-[#CBD5E1]">•</span>
            <span className="text-xs font-semibold text-[#64748B]">Phase 4E</span>
            <span className="text-[#CBD5E1]">•</span>
            <span className="text-[10px] bg-[#14B8A6] text-white px-2 py-0.5 rounded-full font-bold">
              Active Module
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#1E293B] tracking-tight">
            Certificate & Degree Management
          </h1>
          <p className="text-sm text-[#64748B] mt-1">
            End-to-end institutional workflow for certificate requests, eligibility verification,
            formal issuance, cryptographic validation, and audit tracking.
          </p>
        </div>

        {/* Top Fast Actions */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <Link
            href="/admin/certificates/verify"
            className="h-9 px-3.5 rounded-lg border border-[#CBD5E1] bg-white hover:bg-[#F8FAFC] text-xs font-bold text-[#1E293B] flex items-center gap-2 shadow-2xs transition-colors"
          >
            <ShieldCheck className="w-4 h-4 text-[#2563EB]" /> Public Registry Desk
          </Link>
          <button
            type="button"
            onClick={() => setShowNewAppModal(true)}
            className="h-9 px-4 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" /> New Certificate Request
          </button>
        </div>
      </div>

      {/* Action Notification Alert */}
      {actionAlert && (
        <div
          className={`p-4 rounded-xl border flex items-start justify-between gap-3 ${
            actionAlert.type === "success"
              ? "bg-[#ECFDF5] border-[#A7F3D0] text-[#065F46]"
              : actionAlert.type === "error"
              ? "bg-[#FEF2F2] border-[#FECACA] text-[#991B1B]"
              : "bg-[#EFF6FF] border-[#BFDBFE] text-[#1E40AF]"
          }`}
        >
          <div className="flex items-start gap-2.5">
            {actionAlert.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 shrink-0 text-[#10B981]" />
            ) : actionAlert.type === "error" ? (
              <AlertTriangle className="w-5 h-5 shrink-0 text-[#EF4444]" />
            ) : (
              <Info className="w-5 h-5 shrink-0 text-[#3B82F6]" />
            )}
            <p className="text-xs font-semibold leading-relaxed">{actionAlert.message}</p>
          </div>
          <button
            onClick={() => setActionAlert(null)}
            className="text-xs font-bold opacity-60 hover:opacity-100 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Navigation Tabs Bar */}
      <div className="flex border-b border-[#E2E8F0] overflow-x-auto space-x-1 scrollbar-none">
        <button
          onClick={() => setActiveTab("overview")}
          className={`pb-3 px-3 text-xs font-bold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
            activeTab === "overview"
              ? "border-[#2563EB] text-[#2563EB]"
              : "border-transparent text-[#64748B] hover:text-[#1E293B]"
          }`}
        >
          <Award className="w-3.5 h-3.5" /> Overview & Metrics
        </button>

        <button
          onClick={() => setActiveTab("applications")}
          className={`pb-3 px-3 text-xs font-bold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
            activeTab === "applications"
              ? "border-[#2563EB] text-[#2563EB]"
              : "border-transparent text-[#64748B] hover:text-[#1E293B]"
          }`}
        >
          <FileText className="w-3.5 h-3.5" /> Applications
          <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-blue-100 text-[#2563EB]">
            {certificateApplications.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("issued")}
          className={`pb-3 px-3 text-xs font-bold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
            activeTab === "issued"
              ? "border-[#2563EB] text-[#2563EB]"
              : "border-transparent text-[#64748B] hover:text-[#1E293B]"
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" /> Issued Register
          <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-100 text-emerald-800">
            {metrics.certificatesIssued}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("verify")}
          className={`pb-3 px-3 text-xs font-bold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
            activeTab === "verify"
              ? "border-[#2563EB] text-[#2563EB]"
              : "border-transparent text-[#64748B] hover:text-[#1E293B]"
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" /> Verification Registry
        </button>

        <button
          onClick={() => setActiveTab("templates")}
          className={`pb-3 px-3 text-xs font-bold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
            activeTab === "templates"
              ? "border-[#2563EB] text-[#2563EB]"
              : "border-transparent text-[#64748B] hover:text-[#1E293B]"
          }`}
        >
          <Sliders className="w-3.5 h-3.5" /> Templates & Types
        </button>

        <button
          onClick={() => setActiveTab("numbering")}
          className={`pb-3 px-3 text-xs font-bold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
            activeTab === "numbering"
              ? "border-[#2563EB] text-[#2563EB]"
              : "border-transparent text-[#64748B] hover:text-[#1E293B]"
          }`}
        >
          <Hash className="w-3.5 h-3.5" /> Numbering Policy
        </button>

        <button
          onClick={() => setActiveTab("reports")}
          className={`pb-3 px-3 text-xs font-bold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
            activeTab === "reports"
              ? "border-[#2563EB] text-[#2563EB]"
              : "border-transparent text-[#64748B] hover:text-[#1E293B]"
          }`}
        >
          <Download className="w-3.5 h-3.5" /> Reports & CSV
        </button>

        <button
          onClick={() => setActiveTab("history")}
          className={`pb-3 px-3 text-xs font-bold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
            activeTab === "history"
              ? "border-[#2563EB] text-[#2563EB]"
              : "border-transparent text-[#64748B] hover:text-[#1E293B]"
          }`}
        >
          <History className="w-3.5 h-3.5" /> Audit Trail
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: OVERVIEW & DASHBOARD METRICS                                       */}
      {/* ========================================================================= */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* KPI Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-2xs">
              <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">
                Total Requests
              </span>
              <p className="text-xl font-extrabold text-[#1E293B] mt-1">
                {metrics.totalApplications}
              </p>
              <span className="text-[10px] text-[#64748B] mt-0.5 block">Lifetime recorded</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-blue-200 bg-blue-50/20 shadow-2xs">
              <span className="text-[10px] font-bold text-[#2563EB] uppercase tracking-wider block">
                Submitted
              </span>
              <p className="text-xl font-extrabold text-[#2563EB] mt-1">
                {metrics.pendingApplications}
              </p>
              <span className="text-[10px] text-[#2563EB] mt-0.5 block">Awaiting review</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-indigo-200 bg-indigo-50/20 shadow-2xs">
              <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider block">
                Under Review
              </span>
              <p className="text-xl font-extrabold text-indigo-700 mt-1">
                {metrics.underReviewApplications}
              </p>
              <span className="text-[10px] text-indigo-600 mt-0.5 block">Clearance / info</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-teal-200 bg-teal-50/20 shadow-2xs">
              <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wider block">
                Approved
              </span>
              <p className="text-xl font-extrabold text-teal-700 mt-1">
                {metrics.approvedApplications}
              </p>
              <span className="text-[10px] text-teal-600 mt-0.5 block">Ready for seal</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-emerald-200 bg-emerald-50/20 shadow-2xs">
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
                Issued Active
              </span>
              <p className="text-xl font-extrabold text-emerald-700 mt-1">
                {metrics.certificatesIssued}
              </p>
              <span className="text-[10px] text-emerald-600 mt-0.5 block">Verified active</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-red-200 bg-red-50/20 shadow-2xs">
              <span className="text-[10px] font-bold text-red-700 uppercase tracking-wider block">
                Rejected
              </span>
              <p className="text-xl font-extrabold text-red-700 mt-1">
                {metrics.rejectedApplications}
              </p>
              <span className="text-[10px] text-red-600 mt-0.5 block">Policy violations</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-rose-200 bg-rose-50/20 shadow-2xs">
              <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider block">
                Revoked
              </span>
              <p className="text-xl font-extrabold text-rose-700 mt-1">
                {metrics.certificatesRevoked}
              </p>
              <span className="text-[10px] text-rose-600 mt-0.5 block">Cancelled seals</span>
            </div>
          </div>

          {/* Institutional Information Anchor Card */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center shrink-0">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#1E293B]">{profile.name}</h3>
                  <p className="text-xs text-[#64748B]">
                    Code: <span className="font-mono font-semibold text-[#1E293B]">{profile.code}</span> •{" "}
                    {profile.affiliation} • {profile.accreditation}
                  </p>
                  <p className="text-[11px] text-[#94A3B8] mt-0.5">
                    Official Certificates are issued under the institutional seal with automatic
                    cryptographic verification hash and tamper-evident history.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href="/admin/settings"
                  className="px-3 py-1.5 rounded-lg border border-[#E2E8F0] text-xs font-semibold text-[#1E293B] hover:bg-[#F8FAFC] transition-colors"
                >
                  Configure Institution Header
                </Link>
                <button
                  type="button"
                  onClick={() => setActiveTab("numbering")}
                  className="px-3 py-1.5 rounded-lg bg-[#2563EB] text-white text-xs font-bold hover:bg-[#1D4ED8] transition-colors cursor-pointer"
                >
                  Manage Numbering ({certificateNumberConfig.prefix} / *)
                </button>
              </div>
            </div>
          </div>

          {/* Two-Column Activity & Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Applications Feed */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
              <div className="p-4 border-b border-[#E2E8F0] flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-[#1E293B]">Recent Certificate Requests</h3>
                  <p className="text-[11px] text-[#64748B]">
                    Latest student submissions and processing stages
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab("applications")}
                  className="text-xs font-bold text-[#2563EB] hover:underline"
                >
                  View All ({certificateApplications.length})
                </button>
              </div>

              <div className="divide-y divide-[#E2E8F0]">
                {certificateApplications.slice(0, 5).map((app) => {
                  const badge = STATUS_BADGES[app.status];
                  return (
                    <div
                      key={app.id}
                      className="p-4 hover:bg-[#F8FAFC] transition-colors flex items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#1E293B]">{app.studentName}</span>
                          <span className="text-[10px] font-mono text-[#64748B] bg-slate-100 px-1.5 py-0.2 rounded">
                            {app.rollNumber}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.bg} ${badge.text} ${badge.border}`}
                          >
                            {badge.label}
                          </span>
                        </div>
                        <p className="text-xs text-[#64748B]">
                          <strong className="text-[#1E293B]">{app.certificateType}</strong> • {app.courseName}
                        </p>
                        <p className="text-[11px] text-[#94A3B8]">
                          Req: {app.applicationNumber} on {app.requestDate} • Purpose: {app.purpose}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setSelectedAppForDetail(app)}
                        className="px-3 py-1.5 rounded-lg border border-[#CBD5E1] text-xs font-bold text-[#1E293B] hover:bg-[#EFF6FF] hover:border-[#2563EB] hover:text-[#2563EB] transition-colors cursor-pointer shrink-0"
                      >
                        Process
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Supported Categories Card */}
            <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs p-5 space-y-4">
              <div>
                <h3 className="text-xs font-bold text-[#1E293B]">Supported Certificate Catalog</h3>
                <p className="text-[11px] text-[#64748B]">Active templates configured in system</p>
              </div>

              <div className="space-y-2.5">
                {certificateTemplates.slice(0, 7).map((tpl) => (
                  <div
                    key={tpl.id}
                    className="flex items-center justify-between text-xs p-2 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]"
                  >
                    <div>
                      <span className="font-bold text-[#1E293B] block">{tpl.type}</span>
                      <span className="text-[10px] font-mono text-[#64748B]">
                        Prefix: {tpl.prefix} | {tpl.category}
                      </span>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                        tpl.isEnabled
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {tpl.isEnabled ? "Active" : "Disabled"}
                    </span>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setActiveTab("templates")}
                className="w-full py-2 rounded-lg border border-[#CBD5E1] text-xs font-bold text-[#2563EB] hover:bg-[#EFF6FF] transition-colors cursor-pointer"
              >
                View All Templates ({certificateTemplates.length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: APPLICATIONS MANAGEMENT                                            */}
      {/* ========================================================================= */}
      {activeTab === "applications" && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by student, roll no, app number..."
                  className="w-full h-9 pl-9 pr-3 text-xs border border-[#CBD5E1] rounded-lg bg-white text-[#1E293B] focus:outline-hidden focus:border-[#2563EB]"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewAppModal(true)}
                  className="h-9 px-3.5 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> New Application
                </button>
                <button
                  type="button"
                  onClick={exportApplicationsCSV}
                  className="h-9 px-3 rounded-lg border border-[#CBD5E1] bg-white hover:bg-[#F8FAFC] text-xs font-bold text-[#1E293B] flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-[#2563EB]" /> Export CSV
                </button>
              </div>
            </div>

            {/* Filter Dropdowns */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              <div>
                <label className="text-[10px] font-bold text-[#64748B] uppercase">Certificate Type</label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full h-8 mt-0.5 px-2 text-xs border border-[#E2E8F0] rounded-lg bg-white text-[#1E293B] focus:outline-hidden"
                >
                  <option value="ALL">All Types</option>
                  {certificateTemplates.map((t) => (
                    <option key={t.id} value={t.type}>
                      {t.type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#64748B] uppercase">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full h-8 mt-0.5 px-2 text-xs border border-[#E2E8F0] rounded-lg bg-white text-[#1E293B] focus:outline-hidden"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="Submitted">Submitted</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Approved">Approved</option>
                  <option value="Additional Info Required">Info Required</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Generated">Generated</option>
                  <option value="Issued">Issued</option>
                  <option value="Draft">Draft</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#64748B] uppercase">Priority</label>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="w-full h-8 mt-0.5 px-2 text-xs border border-[#E2E8F0] rounded-lg bg-white text-[#1E293B] focus:outline-hidden"
                >
                  <option value="ALL">All Priorities</option>
                  <option value="Normal">Normal</option>
                  <option value="Urgent">Urgent</option>
                  <option value="Immediate">Immediate</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#64748B] uppercase">Degree Course</label>
                <select
                  value={courseFilter}
                  onChange={(e) => setCourseFilter(e.target.value)}
                  className="w-full h-8 mt-0.5 px-2 text-xs border border-[#E2E8F0] rounded-lg bg-white text-[#1E293B] focus:outline-hidden"
                >
                  <option value="ALL">All Programs</option>
                  {courses.map((crs) => (
                    <option key={crs.id} value={crs.id}>
                      {crs.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Applications Table */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#F8FAFC]">
                  <TableHead className="text-xs font-bold text-[#1E293B]">App Number</TableHead>
                  <TableHead className="text-xs font-bold text-[#1E293B]">Student</TableHead>
                  <TableHead className="text-xs font-bold text-[#1E293B]">Certificate Type</TableHead>
                  <TableHead className="text-xs font-bold text-[#1E293B]">Degree & Class</TableHead>
                  <TableHead className="text-xs font-bold text-[#1E293B]">Date & Priority</TableHead>
                  <TableHead className="text-xs font-bold text-[#1E293B]">Eligibility</TableHead>
                  <TableHead className="text-xs font-bold text-[#1E293B]">Status</TableHead>
                  <TableHead className="text-xs font-bold text-[#1E293B] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApplications.length === 0 ? (
                  <TableEmpty colSpan={8} message="No certificate applications match your filter." />
                ) : (
                  filteredApplications.map((app) => {
                    const statusBadge = STATUS_BADGES[app.status];
                    const priorityBadge = PRIORITY_BADGES[app.priority];
                    const canIssue = app.eligibilityResult.canIssue;

                    return (
                      <TableRow key={app.id} className="hover:bg-[#F8FAFC] transition-colors">
                        <TableCell className="font-mono text-xs font-bold text-[#1E293B]">
                          {app.applicationNumber}
                        </TableCell>

                        <TableCell>
                          <div className="space-y-0.5">
                            <span className="text-xs font-bold text-[#1E293B] block">
                              {app.studentName}
                            </span>
                            <span className="text-[11px] font-mono text-[#64748B]">
                              Roll: {app.rollNumber} | {app.studentUniqueId}
                            </span>
                          </div>
                        </TableCell>

                        <TableCell className="text-xs font-semibold text-[#1E293B]">
                          {app.certificateType}
                        </TableCell>

                        <TableCell>
                          <span className="text-xs text-[#1E293B] block">{app.courseName}</span>
                          <span className="text-[11px] text-[#64748B]">{app.className}</span>
                        </TableCell>

                        <TableCell>
                          <span className="text-xs text-[#1E293B] block">{app.requestDate}</span>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${priorityBadge.bg} ${priorityBadge.text}`}
                          >
                            {priorityBadge.label}
                          </span>
                        </TableCell>

                        <TableCell>
                          {canIssue ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Eligible
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                              <AlertTriangle className="w-3 h-3 text-amber-600" /> Action Required
                            </span>
                          )}
                        </TableCell>

                        <TableCell>
                          <span
                            className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${statusBadge.bg} ${statusBadge.text} ${statusBadge.border}`}
                          >
                            {statusBadge.label}
                          </span>
                        </TableCell>

                        <TableCell className="text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedAppForDetail(app)}
                            className="px-2.5 py-1 text-xs font-bold rounded-lg bg-[#2563EB] text-white hover:bg-[#1D4ED8] transition-colors cursor-pointer shadow-2xs"
                          >
                            View & Process
                          </button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: ISSUED CERTIFICATES REGISTER                                       */}
      {/* ========================================================================= */}
      {activeTab === "issued" && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search certificate number, student, verification code..."
                className="w-full h-9 pl-9 pr-3 text-xs border border-[#CBD5E1] rounded-lg bg-white text-[#1E293B] focus:outline-hidden focus:border-[#2563EB]"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={exportIssuedCertificatesCSV}
                className="h-9 px-3.5 rounded-lg border border-[#CBD5E1] bg-white hover:bg-[#F8FAFC] text-xs font-bold text-[#1E293B] flex items-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-[#2563EB]" /> Export Issued Register CSV
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#F8FAFC]">
                  <TableHead className="text-xs font-bold text-[#1E293B]">Certificate No.</TableHead>
                  <TableHead className="text-xs font-bold text-[#1E293B]">Verification Code</TableHead>
                  <TableHead className="text-xs font-bold text-[#1E293B]">Certificate Type</TableHead>
                  <TableHead className="text-xs font-bold text-[#1E293B]">Student Name</TableHead>
                  <TableHead className="text-xs font-bold text-[#1E293B]">Issue Date</TableHead>
                  <TableHead className="text-xs font-bold text-[#1E293B]">Signatory</TableHead>
                  <TableHead className="text-xs font-bold text-[#1E293B]">Status</TableHead>
                  <TableHead className="text-xs font-bold text-[#1E293B] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredIssuedCertificates.length === 0 ? (
                  <TableEmpty colSpan={8} message="No issued certificates match your criteria." />
                ) : (
                  filteredIssuedCertificates.map((cert) => (
                    <TableRow key={cert.id} className="hover:bg-[#F8FAFC] transition-colors">
                      <TableCell className="font-mono text-xs font-extrabold text-[#1E293B]">
                        {cert.certificateNumber}
                      </TableCell>

                      <TableCell className="font-mono text-[11px] font-bold text-[#2563EB]">
                        {cert.verificationCode}
                      </TableCell>

                      <TableCell className="text-xs font-bold text-[#1E293B]">
                        {cert.certificateType}
                      </TableCell>

                      <TableCell>
                        <span className="text-xs font-bold text-[#1E293B] block">
                          {cert.studentName}
                        </span>
                        <span className="text-[11px] font-mono text-[#64748B]">
                          Roll: {cert.rollNumber} | {cert.courseName}
                        </span>
                      </TableCell>

                      <TableCell className="text-xs text-[#1E293B]">{cert.issueDate}</TableCell>

                      <TableCell className="text-xs text-[#64748B]">
                        <span className="block text-[#1E293B] font-semibold">{cert.signatoryName}</span>
                        <span className="text-[10px]">{cert.signatoryTitle}</span>
                      </TableCell>

                      <TableCell>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            cert.status === "Active"
                              ? "bg-emerald-100 text-emerald-800"
                              : cert.status === "Revoked / Cancelled"
                              ? "bg-red-100 text-red-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {cert.status}
                        </span>
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedCertForPreview(cert)}
                            className="px-2 py-1 text-xs font-bold rounded-lg border border-[#CBD5E1] text-[#1E293B] hover:bg-[#EFF6FF] hover:border-[#2563EB] hover:text-[#2563EB] transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <Printer className="w-3 h-3 text-[#2563EB]" /> View / Print
                          </button>

                          {cert.status === "Active" && (
                            <>
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedCertForReissue(cert);
                                  setReissueCorrectedName(cert.studentName);
                                  setReissueCorrectedFather(cert.fatherOrGuardianName);
                                  setReissueCorrectedDob(cert.dob);
                                }}
                                title="Reissue / Correct"
                                className="p-1 rounded-md text-[#64748B] hover:bg-slate-100 hover:text-[#1E293B] cursor-pointer"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={() => setSelectedCertForRevoke(cert)}
                                title="Revoke / Cancel"
                                className="p-1 rounded-md text-[#EF4444] hover:bg-red-50 cursor-pointer"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: VERIFICATION REGISTRY SEARCH DESK                                  */}
      {/* ========================================================================= */}
      {activeTab === "verify" && (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs p-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center mx-auto">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-[#1E293B]">Administrative Document Verification</h2>
            <p className="text-xs text-[#64748B] max-w-md mx-auto">
              Look up active or historical certificate credentials by Certificate Number, Student
              ID, Roll Number, or Verification Code.
            </p>

            <form onSubmit={handleVerifySearch} className="flex gap-2 pt-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={verifySearchQuery}
                  onChange={(e) => setVerifySearchQuery(e.target.value)}
                  placeholder="e.g. SST/BC/2026/0001 or SST-VER-89E41B"
                  className="w-full h-10 pl-9 pr-3 text-xs border border-[#CBD5E1] rounded-xl bg-white text-[#1E293B] focus:outline-hidden focus:border-[#2563EB]"
                />
              </div>
              <button
                type="submit"
                className="h-10 px-4 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                Verify
              </button>
            </form>
          </div>

          {/* Search Result */}
          {verifyPerformed && (
            <div>
              {!verifyResult?.found ? (
                <div className="p-6 bg-white rounded-xl border border-red-200 text-center space-y-2">
                  <XCircle className="w-8 h-8 text-red-500 mx-auto" />
                  <h4 className="text-xs font-bold text-[#1E293B]">Record Not Found</h4>
                  <p className="text-[11px] text-[#64748B]">{verifyResult?.message}</p>
                </div>
              ) : verifyResult.certificate ? (
                <div className="bg-white rounded-xl border border-emerald-200 shadow-xs overflow-hidden">
                  <div
                    className={`p-4 border-b flex items-center justify-between ${
                      verifyResult.status === "Valid"
                        ? "bg-emerald-50 text-emerald-900 border-emerald-100"
                        : verifyResult.status === "Revoked"
                        ? "bg-red-50 text-red-900 border-red-100"
                        : "bg-amber-50 text-amber-900 border-amber-100"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {verifyResult.status === "Valid" ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-amber-600" />
                      )}
                      <div>
                        <span className="text-xs font-extrabold uppercase tracking-wider block">
                          Status: {verifyResult.status.toUpperCase()}
                        </span>
                        <span className="text-[11px] font-mono">
                          {verifyResult.certificate.certificateNumber}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedCertForPreview(verifyResult.certificate!)}
                      className="px-3 py-1 bg-white border border-[#CBD5E1] rounded-lg text-xs font-bold text-[#1E293B] hover:bg-[#F8FAFC]"
                    >
                      View Preview
                    </button>
                  </div>

                  <div className="p-5 space-y-3 text-xs">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-[10px] text-[#94A3B8] font-bold uppercase">
                          Student Name
                        </span>
                        <p className="font-bold text-[#1E293B]">
                          {verifyResult.certificate.studentName}
                        </p>
                        <p className="text-[11px] text-[#64748B]">
                          Roll: {verifyResult.certificate.rollNumber}
                        </p>
                      </div>

                      <div>
                        <span className="text-[10px] text-[#94A3B8] font-bold uppercase">
                          Certificate Type
                        </span>
                        <p className="font-bold text-[#1E293B]">
                          {verifyResult.certificate.certificateType}
                        </p>
                        <p className="text-[11px] text-[#64748B]">
                          Issued on: {verifyResult.certificate.issueDate}
                        </p>
                      </div>
                    </div>

                    <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] space-y-1">
                      <span className="text-[10px] text-[#94A3B8] font-bold uppercase">
                        Certified Text
                      </span>
                      <p className="italic text-[#1E293B] font-serif">
                        &ldquo;{verifyResult.certificate.bodyText}&rdquo;
                      </p>
                    </div>

                    {verifyResult.certificate.status === "Revoked / Cancelled" && (
                      <div className="p-3 bg-red-50 rounded-lg border border-red-200 text-red-800 text-[11px]">
                        <strong>Revocation Justification:</strong> &ldquo;
                        {verifyResult.certificate.revocationReason}&rdquo;
                      </div>
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: CERTIFICATE TEMPLATES CONFIGURATION                                */}
      {/* ========================================================================= */}
      {activeTab === "templates" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-[#1E293B]">Configured Certificate Templates</h2>
              <p className="text-xs text-[#64748B]">
                Enable or customize institutional wording, signatory titles, and prerequisite checks
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {certificateTemplates.map((tpl) => (
              <div
                key={tpl.id}
                className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-2xs space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#2563EB] bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                        {tpl.category} • Prefix: {tpl.prefix}
                      </span>
                      <h3 className="text-sm font-bold text-[#1E293B] mt-1.5">{tpl.type}</h3>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        tpl.isEnabled
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      {tpl.isEnabled ? "Enabled" : "Disabled"}
                    </span>
                  </div>

                  <p className="text-xs text-[#64748B] mt-2 line-clamp-3 italic font-serif">
                    &ldquo;{tpl.customBodyTemplate}&rdquo;
                  </p>

                  {/* Prerequisites tags */}
                  <div className="flex flex-wrap gap-1.5 pt-3">
                    {tpl.requiresFeeClearance && (
                      <span className="text-[10px] bg-amber-50 text-amber-800 border border-amber-200 px-1.5 py-0.2 rounded font-semibold">
                        Requires Fee Clearance
                      </span>
                    )}
                    {tpl.requiresHostelClearance && (
                      <span className="text-[10px] bg-amber-50 text-amber-800 border border-amber-200 px-1.5 py-0.2 rounded font-semibold">
                        Requires Hostel Clearance
                      </span>
                    )}
                    {tpl.requiresAcademicPass && (
                      <span className="text-[10px] bg-teal-50 text-teal-800 border border-teal-200 px-1.5 py-0.2 rounded font-semibold">
                        Requires Academic Pass
                      </span>
                    )}
                    {tpl.requiresFinalSemester && (
                      <span className="text-[10px] bg-indigo-50 text-indigo-800 border border-indigo-200 px-1.5 py-0.2 rounded font-semibold">
                        Final Semester Required
                      </span>
                    )}
                    {tpl.requiresZeroBacklogs && (
                      <span className="text-[10px] bg-rose-50 text-rose-800 border border-rose-200 px-1.5 py-0.2 rounded font-semibold">
                        Zero Backlogs Required
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-between text-xs text-[#64748B]">
                  <span>Signatory: {tpl.authorizedSignatoryTitle}</span>
                  <button
                    type="button"
                    onClick={() => setSelectedTemplateForEdit(tpl)}
                    className="px-2.5 py-1 rounded-lg border border-[#CBD5E1] text-[#2563EB] font-bold hover:bg-[#EFF6FF] cursor-pointer"
                  >
                    Configure
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: NUMBERING POLICY CONFIGURATION                                     */}
      {/* ========================================================================= */}
      {activeTab === "numbering" && (
        <div className="max-w-xl mx-auto bg-white p-6 rounded-xl border border-[#E2E8F0] shadow-xs space-y-5">
          <div>
            <h2 className="text-sm font-bold text-[#1E293B]">
              Institutional Certificate Numbering Policy
            </h2>
            <p className="text-xs text-[#64748B]">
              Configure uniform numbering standards, prefixes, and sequence counters across
              certificate categories.
            </p>
          </div>

          <form onSubmit={handleSaveNumberingConfig} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#1E293B] mb-1">
                Institutional Prefix
              </label>
              <input
                type="text"
                value={tempNumberPrefix}
                onChange={(e) => setTempNumberPrefix(e.target.value)}
                className="w-full h-9 px-3 border border-[#CBD5E1] rounded-lg text-xs font-mono font-bold uppercase focus:outline-hidden focus:border-[#2563EB]"
              />
              <span className="text-[11px] text-[#64748B] mt-0.5 block">
                Standard institution code, e.g. &ldquo;SST&rdquo;
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#1E293B] mb-1">
                  Delimiter / Separator
                </label>
                <input
                  type="text"
                  value={tempSeparator}
                  onChange={(e) => setTempSeparator(e.target.value)}
                  className="w-full h-9 px-3 border border-[#CBD5E1] rounded-lg text-xs font-mono font-bold focus:outline-hidden focus:border-[#2563EB]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1E293B] mb-1">
                  Sequence Digit Padding
                </label>
                <select
                  value={tempPadding}
                  onChange={(e) => setTempPadding(Number(e.target.value))}
                  className="w-full h-9 px-3 border border-[#CBD5E1] rounded-lg text-xs focus:outline-hidden focus:border-[#2563EB]"
                >
                  <option value={3}>3 Digits (001)</option>
                  <option value={4}>4 Digits (0001)</option>
                  <option value={5}>5 Digits (00001)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="useAYCheckbox"
                checked={tempUseAY}
                onChange={(e) => setTempUseAY(e.target.checked)}
                className="rounded border-[#CBD5E1] text-[#2563EB] focus:ring-0"
              />
              <label htmlFor="useAYCheckbox" className="text-xs font-semibold text-[#1E293B] cursor-pointer">
                Use Academic Year in Number (e.g. 2026-27 instead of calendar year 2026)
              </label>
            </div>

            {/* Live Sample Preview */}
            <div className="p-4 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] space-y-1">
              <span className="text-[10px] font-bold text-[#64748B] uppercase">
                Generated Number Format Sample
              </span>
              <p className="font-mono text-sm font-extrabold text-[#2563EB]">
                {tempNumberPrefix}
                {tempSeparator}BC{tempSeparator}
                {tempUseAY ? "2026-27" : new Date().getFullYear()}
                {tempSeparator}
                {"0".repeat(tempPadding - 1)}1
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              Save Numbering Configuration
            </button>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 7: REPORTS & EXPORTS                                                  */}
      {/* ========================================================================= */}
      {activeTab === "reports" && (
        <div className="space-y-4">
          <div>
            <h2 className="text-sm font-bold text-[#1E293B]">Certificate Data Registers & Exports</h2>
            <p className="text-xs text-[#64748B]">
              Download audited datasets for governmental compliance, annual reports, and university audits
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs space-y-3 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#2563EB]">
                  Application Register
                </span>
                <h3 className="text-sm font-bold text-[#1E293B] mt-1">Certificate Applications CSV</h3>
                <p className="text-xs text-[#64748B] mt-1">
                  Complete register of all student certificate requests, priorities, eligibility
                  verifications, and approval states.
                </p>
              </div>
              <button
                type="button"
                onClick={exportApplicationsCSV}
                className="w-full py-2 rounded-lg bg-[#2563EB] text-white text-xs font-bold hover:bg-[#1D4ED8] flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" /> Download Register ({certificateApplications.length})
              </button>
            </div>

            <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs space-y-3 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                  Issued Ledger
                </span>
                <h3 className="text-sm font-bold text-[#1E293B] mt-1">Issued Certificates Ledger</h3>
                <p className="text-xs text-[#64748B] mt-1">
                  Official historical ledger of issued certificates with certificate numbers, issue
                  dates, signatories, and verification hashes.
                </p>
              </div>
              <button
                type="button"
                onClick={exportIssuedCertificatesCSV}
                className="w-full py-2 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" /> Download Ledger ({issuedCertificates.length})
              </button>
            </div>

            <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs space-y-3 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700">
                  Compliance Audit
                </span>
                <h3 className="text-sm font-bold text-[#1E293B] mt-1">Audit Trail & Revocations CSV</h3>
                <p className="text-xs text-[#64748B] mt-1">
                  Tamper-evident logs of administrative overrides, status approvals, reissues, and
                  mandated revocation reasons.
                </p>
              </div>
              <button
                type="button"
                onClick={exportAuditTrailCSV}
                className="w-full py-2 rounded-lg bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" /> Download Audit Trail ({certificateAudits.length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 8: AUDIT TRAIL                                                        */}
      {/* ========================================================================= */}
      {activeTab === "history" && (
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
          <div className="p-4 border-b border-[#E2E8F0] flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-[#1E293B]">Certificate Lifecycle Audit Trail</h3>
              <p className="text-[11px] text-[#64748B]">
                Immutable historical records of creations, approvals, overrides, and revocations
              </p>
            </div>
            <button
              type="button"
              onClick={exportAuditTrailCSV}
              className="text-xs font-bold text-[#2563EB] hover:underline flex items-center gap-1"
            >
              <Download className="w-3 h-3" /> Export Audit CSV
            </button>
          </div>

          <div className="divide-y divide-[#E2E8F0]">
            {certificateAudits.map((log) => (
              <div key={log.id} className="p-4 hover:bg-[#F8FAFC] transition-colors space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        log.action.includes("APPROVED") || log.action.includes("ISSUED")
                          ? "bg-emerald-100 text-emerald-800"
                          : log.action.includes("REVOKED") || log.action.includes("REJECTED")
                          ? "bg-red-100 text-red-800"
                          : "bg-blue-100 text-[#2563EB]"
                      }`}
                    >
                      {log.action}
                    </span>
                    <span className="text-xs font-bold text-[#1E293B]">
                      {log.studentName || "Institutional System"}
                    </span>
                    {log.certificateNumber && (
                      <span className="text-[11px] font-mono text-[#64748B]">
                        [{log.certificateNumber}]
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-[#94A3B8]">{log.timestamp}</span>
                </div>

                <p className="text-xs text-[#1E293B] pl-1">{log.details}</p>

                {log.reason && (
                  <p className="text-[11px] text-[#64748B] pl-1 italic">
                    Reason: &ldquo;{log.reason}&rdquo;
                  </p>
                )}

                <p className="text-[10px] text-[#94A3B8] pl-1">Authorized by: {log.performedBy}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: NEW CERTIFICATE APPLICATION MODAL                                */}
      {/* ========================================================================= */}
      {showNewAppModal && (
        <div className="fixed inset-0 z-50 bg-[#0F172A]/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-[#E2E8F0] shadow-xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center">
                  <Award className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-[#1E293B]">New Certificate Request</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowNewAppModal(false)}
                className="text-[#64748B] hover:text-[#1E293B] font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateApplication} className="space-y-4">
              {/* Student Selector */}
              <div>
                <label className="block text-xs font-bold text-[#1E293B] mb-1">
                  Select Enrolled Student <span className="text-red-500">*</span>
                </label>
                <select
                  value={newAppStudentId}
                  onChange={(e) => setNewAppStudentId(e.target.value)}
                  className="w-full h-9 px-3 border border-[#CBD5E1] rounded-lg text-xs bg-white text-[#1E293B] focus:outline-hidden focus:border-[#2563EB]"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.fullName} ({s.rollNumber} - {s.className})
                    </option>
                  ))}
                </select>
              </div>

              {/* Certificate Type */}
              <div>
                <label className="block text-xs font-bold text-[#1E293B] mb-1">
                  Certificate Category & Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={newAppCertType}
                  onChange={(e) => setNewAppCertType(e.target.value as CertificateType)}
                  className="w-full h-9 px-3 border border-[#CBD5E1] rounded-lg text-xs bg-white text-[#1E293B] focus:outline-hidden focus:border-[#2563EB]"
                >
                  {certificateTemplates
                    .filter((t) => t.isEnabled)
                    .map((t) => (
                      <option key={t.id} value={t.type}>
                        {t.type} ({t.category})
                      </option>
                    ))}
                </select>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-xs font-bold text-[#1E293B] mb-1">Processing Priority</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["Normal", "Urgent", "Immediate"] as CertificatePriority[]).map((p) => (
                    <button
                      type="button"
                      key={p}
                      onClick={() => setNewAppPriority(p)}
                      className={`py-1.5 text-xs font-bold rounded-lg border transition-colors cursor-pointer ${
                        newAppPriority === p
                          ? "bg-[#2563EB] text-white border-[#2563EB]"
                          : "border-[#E2E8F0] text-[#64748B] hover:bg-[#F8FAFC]"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Purpose */}
              <div>
                <label className="block text-xs font-bold text-[#1E293B] mb-1">
                  Purpose of Request <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newAppPurpose}
                  onChange={(e) => setNewAppPurpose(e.target.value)}
                  placeholder="e.g. Higher Education Passport Application, Bank Education Loan"
                  className="w-full h-9 px-3 border border-[#CBD5E1] rounded-lg text-xs focus:outline-hidden focus:border-[#2563EB]"
                  required
                />
              </div>

              {/* Remarks */}
              <div>
                <label className="block text-xs font-bold text-[#1E293B] mb-1">
                  Internal Remarks (Optional)
                </label>
                <textarea
                  value={newAppRemarks}
                  onChange={(e) => setNewAppRemarks(e.target.value)}
                  placeholder="Any supporting document references or student notes..."
                  rows={2}
                  className="w-full p-2 border border-[#CBD5E1] rounded-lg text-xs focus:outline-hidden focus:border-[#2563EB]"
                />
              </div>

              {/* Live Eligibility Preview Panel */}
              {previewEligibility && (
                <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                      Initial Eligibility Evaluation
                    </span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                        previewEligibility.canIssue
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {previewEligibility.canIssue ? "Eligible" : "Requires Verification"}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#64748B] leading-relaxed">
                    {previewEligibility.summary}
                  </p>
                </div>
              )}

              <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewAppModal(false)}
                  className="px-4 py-2 rounded-lg border border-[#CBD5E1] text-xs font-bold text-[#64748B] hover:bg-[#F8FAFC] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: APPLICATION DETAIL & ACTION MODAL                                */}
      {/* ========================================================================= */}
      {selectedAppForDetail && (
        <div className="fixed inset-0 z-50 bg-[#0F172A]/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto border border-[#E2E8F0] shadow-xl p-6 space-y-5">
            {/* Header */}
            <div className="flex items-start justify-between pb-3 border-b border-[#E2E8F0]">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-[#2563EB] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {selectedAppForDetail.applicationNumber}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      STATUS_BADGES[selectedAppForDetail.status].bg
                    } ${STATUS_BADGES[selectedAppForDetail.status].text} ${
                      STATUS_BADGES[selectedAppForDetail.status].border
                    }`}
                  >
                    {STATUS_BADGES[selectedAppForDetail.status].label}
                  </span>
                </div>
                <h3 className="text-base font-bold text-[#1E293B] mt-1">
                  {selectedAppForDetail.certificateType}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAppForDetail(null)}
                className="text-[#64748B] hover:text-[#1E293B] font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Student & Request Snapshot */}
            <div className="grid grid-cols-2 gap-3 p-3.5 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] text-xs">
              <div>
                <span className="text-[10px] font-bold uppercase text-[#94A3B8]">Student</span>
                <p className="font-bold text-[#1E293B]">{selectedAppForDetail.studentName}</p>
                <p className="text-[11px] text-[#64748B]">
                  Roll: {selectedAppForDetail.rollNumber} | ID: {selectedAppForDetail.studentUniqueId}
                </p>
                <p className="text-[11px] text-[#64748B]">
                  Parent: {selectedAppForDetail.fatherOrGuardianName}
                </p>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase text-[#94A3B8]">Academic Placement</span>
                <p className="font-bold text-[#1E293B]">{selectedAppForDetail.courseName}</p>
                <p className="text-[11px] text-[#64748B]">
                  {selectedAppForDetail.className} • {selectedAppForDetail.academicYearName}
                </p>
                <p className="text-[11px] text-[#64748B]">
                  Batch: {selectedAppForDetail.batch}
                </p>
              </div>

              <div className="col-span-2 pt-2 border-t border-[#E2E8F0]">
                <span className="text-[10px] font-bold uppercase text-[#94A3B8]">Purpose & Request Info</span>
                <p className="text-[#1E293B] mt-0.5">{selectedAppForDetail.purpose}</p>
                {selectedAppForDetail.remarks && (
                  <p className="text-[11px] text-[#64748B] mt-0.5">
                    <strong>Remarks:</strong> {selectedAppForDetail.remarks}
                  </p>
                )}
              </div>
            </div>

            {/* Eligibility Checklist */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-[#1E293B] flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#2563EB]" /> Prerequisites & Clearance
                  Verification Checklist
                </h4>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    selectedAppForDetail.eligibilityResult.canIssue
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {selectedAppForDetail.eligibilityResult.canIssue
                    ? "Verified for Approval"
                    : "Action / Override Required"}
                </span>
              </div>

              <div className="space-y-2">
                {selectedAppForDetail.eligibilityResult.checks.map((chk) => (
                  <div
                    key={chk.checkId}
                    className="p-3 rounded-lg border border-[#E2E8F0] bg-white flex items-start justify-between gap-3 text-xs"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#1E293B]">{chk.name}</span>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                            chk.status === "PASSED" || chk.overridden
                              ? "bg-emerald-100 text-emerald-800"
                              : chk.status === "FAILED"
                              ? "bg-red-100 text-red-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {chk.overridden
                            ? "Overridden (Passed)"
                            : chk.status === "NOT_INTEGRATED"
                            ? "Not Integrated (Pending)"
                            : chk.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#64748B] leading-relaxed">{chk.details}</p>
                      {chk.overridden && (
                        <p className="text-[10px] text-emerald-700 italic">
                          Authorized Override: &ldquo;{chk.overrideReason}&rdquo; by {chk.overriddenBy}
                        </p>
                      )}
                    </div>

                    {/* Override Button if unintegrated or failed and overridable */}
                    {(chk.status === "NOT_INTEGRATED" || chk.status === "FAILED") &&
                      chk.canOverride &&
                      !chk.overridden && (
                        <button
                          type="button"
                          onClick={() => {
                            setOverrideCheckId(chk.checkId);
                            setShowOverridePrompt(true);
                          }}
                          className="px-2 py-1 text-[11px] font-bold text-[#2563EB] border border-blue-200 bg-blue-50 hover:bg-blue-100 rounded-md shrink-0 cursor-pointer"
                        >
                          Authorize Override
                        </button>
                      )}
                  </div>
                ))}
              </div>
            </div>

            {/* Rejection / Additional Info Display */}
            {selectedAppForDetail.rejectionReason && (
              <div className="p-3 bg-red-50 rounded-lg border border-red-200 text-xs text-red-800">
                <strong>Rejection Reason:</strong> &ldquo;{selectedAppForDetail.rejectionReason}&rdquo;
              </div>
            )}
            {selectedAppForDetail.additionalInfoNotes && (
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-800">
                <strong>Requested Information Notes:</strong> &ldquo;
                {selectedAppForDetail.additionalInfoNotes}&rdquo;
              </div>
            )}

            {/* Workflow Action Buttons */}
            <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                {selectedAppForDetail.status === "Submitted" && (
                  <button
                    type="button"
                    onClick={() =>
                      handleTransition(selectedAppForDetail.id, "Under Review", {
                        reviewerOrApprover: "Institution Admin",
                      })
                    }
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-2xs cursor-pointer"
                  >
                    Move to Under Review
                  </button>
                )}

                {(selectedAppForDetail.status === "Under Review" ||
                  selectedAppForDetail.status === "Submitted") && (
                  <>
                    <button
                      type="button"
                      disabled={!selectedAppForDetail.eligibilityResult.canIssue}
                      onClick={() =>
                        handleTransition(selectedAppForDetail.id, "Approved", {
                          reviewerOrApprover: "Dr. K. S. Murthy (Principal)",
                        })
                      }
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg shadow-2xs cursor-pointer ${
                        selectedAppForDetail.eligibilityResult.canIssue
                          ? "bg-teal-600 hover:bg-teal-700 text-white"
                          : "bg-slate-200 text-slate-500 cursor-not-allowed"
                      }`}
                    >
                      Approve Application
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowRejectPrompt(true)}
                      className="px-3 py-1.5 border border-red-300 text-red-700 hover:bg-red-50 text-xs font-bold rounded-lg cursor-pointer"
                    >
                      Reject
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowInfoPrompt(true)}
                      className="px-3 py-1.5 border border-amber-300 text-amber-800 hover:bg-amber-50 text-xs font-bold rounded-lg cursor-pointer"
                    >
                      Request Info
                    </button>
                  </>
                )}

                {selectedAppForDetail.status === "Approved" && (
                  <button
                    type="button"
                    onClick={() => handleGenerateCertificate(selectedAppForDetail)}
                    className="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Award className="w-4 h-4" /> Generate Official Certificate
                  </button>
                )}

                {selectedAppForDetail.generatedCertificateId && (
                  <button
                    type="button"
                    onClick={() => {
                      const found = issuedCertificates.find(
                        (c) => c.id === selectedAppForDetail.generatedCertificateId
                      );
                      if (found) {
                        setSelectedCertForPreview(found);
                        setSelectedAppForDetail(null);
                      }
                    }}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-2xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" /> View Generated Certificate
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => setSelectedAppForDetail(null)}
                className="px-3 py-1.5 border border-[#CBD5E1] text-xs font-bold text-[#64748B] hover:bg-[#F8FAFC] rounded-lg cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: PRINTABLE CERTIFICATE DOCUMENT PREVIEW                          */}
      {/* ========================================================================= */}
      {selectedCertForPreview && (
        <div className="fixed inset-0 z-50 bg-[#0F172A]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[96vh] overflow-y-auto border border-[#E2E8F0] shadow-2xl flex flex-col">
            {/* Modal Control Bar */}
            <div className="p-4 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F8FAFC]">
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold text-[#1E293B]">
                  Official Printable Certificate Preview
                </span>
                <span className="text-[10px] font-mono bg-blue-100 text-[#2563EB] px-2 py-0.5 rounded font-bold">
                  {selectedCertForPreview.certificateNumber}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    selectedCertForPreview.status === "Active"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {selectedCertForPreview.status}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrintCertificate}
                  className="px-3 py-1.5 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" /> Print / Save PDF
                </button>

                {selectedCertForPreview.status !== "Active" && (
                  <button
                    type="button"
                    onClick={() => handleIssueCertificate(selectedCertForPreview)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer"
                  >
                    Confirm & Seal Issuance
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setSelectedCertForPreview(null)}
                  className="p-1 text-[#64748B] hover:text-[#1E293B] cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* The Certificate A4 Sheet */}
            <div className="p-8 sm:p-12 bg-slate-100 overflow-x-auto flex justify-center">
              <div
                id="printable-certificate-area"
                className="w-full max-w-[800px] bg-white border-8 border-double border-[#153B66] p-10 sm:p-14 shadow-lg relative text-[#1E293B] space-y-8"
              >
                {/* Institutional Header */}
                <div className="text-center space-y-1.5 border-b-2 border-[#153B66] pb-6">
                  <div className="w-12 h-12 rounded-full border-2 border-[#153B66] mx-auto flex items-center justify-center font-black text-[#153B66] text-sm tracking-wider mb-2">
                    SST
                  </div>
                  <h1 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-[#153B66]">
                    {selectedCertForPreview.institutionName}
                  </h1>
                  <p className="text-xs font-bold text-[#64748B]">
                    {selectedCertForPreview.affiliation} • {selectedCertForPreview.accreditation}
                  </p>
                  <p className="text-[11px] text-[#64748B] max-w-xl mx-auto">
                    {selectedCertForPreview.institutionAddress} | Email:{" "}
                    {selectedCertForPreview.institutionEmail} | Phone:{" "}
                    {selectedCertForPreview.institutionPhone}
                  </p>
                </div>

                {/* Certificate Number & Date Bar */}
                <div className="flex items-center justify-between text-xs font-mono font-bold text-[#64748B] pt-1">
                  <span>
                    REF NO: <strong className="text-[#1E293B]">{selectedCertForPreview.certificateNumber}</strong>
                  </span>
                  <span>
                    DATE OF ISSUE: <strong className="text-[#1E293B]">{selectedCertForPreview.issueDate}</strong>
                  </span>
                </div>

                {/* Document Title */}
                <div className="text-center py-2">
                  <h2 className="text-lg sm:text-xl font-extrabold uppercase tracking-widest text-[#153B66] underline underline-offset-8 decoration-2">
                    {selectedCertForPreview.title}
                  </h2>
                </div>

                {/* Main Body Text */}
                <div className="text-center px-4 sm:px-8 py-4 space-y-6">
                  <p className="text-sm sm:text-base leading-loose font-serif text-[#1E293B]">
                    {selectedCertForPreview.bodyText}
                  </p>

                  {selectedCertForPreview.purpose && (
                    <p className="text-xs font-sans text-[#64748B]">
                      This certificate is issued on request for:{" "}
                      <strong className="text-[#1E293B]">{selectedCertForPreview.purpose}</strong>.
                    </p>
                  )}
                </div>

                {/* Signature & Seal Footer */}
                <div className="pt-10 flex items-end justify-between px-4 sm:px-8">
                  {/* Left: Verification Seal & QR */}
                  <div className="flex items-center gap-3">
                    <div className="w-20 h-20 border-2 border-dashed border-[#CBD5E1] rounded-xl flex flex-col items-center justify-center p-1 bg-[#F8FAFC]">
                      <QrCode className="w-10 h-10 text-[#153B66]" />
                      <span className="text-[8px] font-mono text-[#64748B] mt-0.5">
                        {selectedCertForPreview.verificationCode}
                      </span>
                    </div>
                    <div className="text-left text-[10px] text-[#64748B] space-y-0.5">
                      <p className="font-bold text-[#153B66]">Official Digital Seal</p>
                      <p>Scan QR to verify authenticity</p>
                      <p className="font-mono text-[#2563EB]">
                        sst.edu.in/verify?code={selectedCertForPreview.verificationCode}
                      </p>
                    </div>
                  </div>

                  {/* Right: Signature Line */}
                  <div className="text-center space-y-1">
                    <div className="w-40 border-b border-[#1E293B] pb-1 mx-auto font-serif italic text-sm text-[#153B66]">
                      {selectedCertForPreview.signatoryName}
                    </div>
                    <p className="text-xs font-bold text-[#1E293B]">
                      {selectedCertForPreview.signatoryName}
                    </p>
                    <p className="text-[11px] text-[#64748B]">
                      {selectedCertForPreview.signatoryTitle}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: ADMINISTRATIVE OVERRIDE PROMPT                                   */}
      {/* ========================================================================= */}
      {showOverridePrompt && (
        <div className="fixed inset-0 z-50 bg-[#0F172A]/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-[#E2E8F0] shadow-xl p-6 space-y-4">
            <div className="flex items-center gap-2 text-amber-700">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h3 className="text-sm font-bold text-[#1E293B]">Authorize Prerequisite Override</h3>
            </div>
            <p className="text-xs text-[#64748B]">
              Override requirement &ldquo;{overrideCheckId}&rdquo; for {selectedAppForDetail?.studentName}.
              A formal institutional reason is required for compliance audit.
            </p>

            <textarea
              value={overrideReasonInput}
              onChange={(e) => setOverrideReasonInput(e.target.value)}
              placeholder="e.g. Offline Accounts clearance slip verified by Finance Dept under voucher #8841."
              rows={3}
              className="w-full p-2.5 border border-[#CBD5E1] rounded-lg text-xs focus:outline-hidden focus:border-[#2563EB]"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowOverridePrompt(false);
                  setOverrideReasonInput("");
                }}
                className="px-3 py-1.5 border border-[#CBD5E1] rounded-lg text-xs font-bold text-[#64748B] hover:bg-[#F8FAFC]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteOverride}
                className="px-3.5 py-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-lg text-xs font-bold shadow-xs"
              >
                Confirm Authorization
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: REJECTION REASON PROMPT                                          */}
      {/* ========================================================================= */}
      {showRejectPrompt && (
        <div className="fixed inset-0 z-50 bg-[#0F172A]/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-red-200 shadow-xl p-6 space-y-4">
            <div className="flex items-center gap-2 text-red-600">
              <XCircle className="w-5 h-5 shrink-0" />
              <h3 className="text-sm font-bold text-[#1E293B]">Reject Certificate Application</h3>
            </div>
            <p className="text-xs text-[#64748B]">
              Please state the mandatory reason for rejecting this application.
            </p>

            <textarea
              value={rejectionReasonInput}
              onChange={(e) => setRejectionReasonInput(e.target.value)}
              placeholder="e.g. Student does not meet final semester course completion criteria."
              rows={3}
              className="w-full p-2.5 border border-[#CBD5E1] rounded-lg text-xs focus:outline-hidden focus:border-red-500"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowRejectPrompt(false);
                  setRejectionReasonInput("");
                }}
                className="px-3 py-1.5 border border-[#CBD5E1] rounded-lg text-xs font-bold text-[#64748B] hover:bg-[#F8FAFC]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (selectedAppForDetail) {
                    handleTransition(selectedAppForDetail.id, "Rejected", {
                      reason: rejectionReasonInput.trim(),
                    });
                    setShowRejectPrompt(false);
                    setRejectionReasonInput("");
                  }
                }}
                className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold shadow-xs"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 6: ADDITIONAL INFO NOTES PROMPT                                     */}
      {/* ========================================================================= */}
      {showInfoPrompt && (
        <div className="fixed inset-0 z-50 bg-[#0F172A]/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-amber-200 shadow-xl p-6 space-y-4">
            <div className="flex items-center gap-2 text-amber-600">
              <Info className="w-5 h-5 shrink-0" />
              <h3 className="text-sm font-bold text-[#1E293B]">Request Additional Information</h3>
            </div>
            <p className="text-xs text-[#64748B]">
              Specify documents or clarification required from student before approval.
            </p>

            <textarea
              value={infoNotesInput}
              onChange={(e) => setInfoNotesInput(e.target.value)}
              placeholder="e.g. Please provide hostel clearance receipt from Warden Office."
              rows={3}
              className="w-full p-2.5 border border-[#CBD5E1] rounded-lg text-xs focus:outline-hidden focus:border-amber-500"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowInfoPrompt(false);
                  setInfoNotesInput("");
                }}
                className="px-3 py-1.5 border border-[#CBD5E1] rounded-lg text-xs font-bold text-[#64748B] hover:bg-[#F8FAFC]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (selectedAppForDetail) {
                    handleTransition(selectedAppForDetail.id, "Additional Info Required", {
                      notes: infoNotesInput.trim(),
                    });
                    setShowInfoPrompt(false);
                    setInfoNotesInput("");
                  }
                }}
                className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold shadow-xs"
              >
                Submit Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 7: REISSUE & CORRECTION MODAL                                       */}
      {/* ========================================================================= */}
      {selectedCertForReissue && (
        <div className="fixed inset-0 z-50 bg-[#0F172A]/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-[#E2E8F0] shadow-xl p-6 space-y-4">
            <div className="flex items-center gap-2 text-[#2563EB]">
              <RotateCcw className="w-5 h-5 shrink-0" />
              <h3 className="text-sm font-bold text-[#1E293B]">Reissue Certificate</h3>
            </div>
            <p className="text-xs text-[#64748B]">
              Reissuing <strong>{selectedCertForReissue.certificateNumber}</strong>. The previous
              document will be marked as Superseded and a replacement document will be generated.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-[#64748B] uppercase mb-1">
                  Reissue Justification <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={reissueReasonInput}
                  onChange={(e) => setReissueReasonInput(e.target.value)}
                  placeholder="e.g. Original damaged in transit / Correction of name spelling"
                  className="w-full h-8 px-2.5 text-xs border border-[#CBD5E1] rounded-lg focus:outline-hidden focus:border-[#2563EB]"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#64748B] uppercase mb-1">
                  Corrected Student Name (Optional)
                </label>
                <input
                  type="text"
                  value={reissueCorrectedName}
                  onChange={(e) => setReissueCorrectedName(e.target.value)}
                  className="w-full h-8 px-2.5 text-xs border border-[#CBD5E1] rounded-lg focus:outline-hidden focus:border-[#2563EB]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#64748B] uppercase mb-1">
                  Corrected Parent / Guardian Name (Optional)
                </label>
                <input
                  type="text"
                  value={reissueCorrectedFather}
                  onChange={(e) => setReissueCorrectedFather(e.target.value)}
                  className="w-full h-8 px-2.5 text-xs border border-[#CBD5E1] rounded-lg focus:outline-hidden focus:border-[#2563EB]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E2E8F0]">
              <button
                type="button"
                onClick={() => setSelectedCertForReissue(null)}
                className="px-3 py-1.5 border border-[#CBD5E1] rounded-lg text-xs font-bold text-[#64748B] hover:bg-[#F8FAFC]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteReissue}
                className="px-3.5 py-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
              >
                Generate Replacement
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 8: REVOCATION MODAL                                                 */}
      {/* ========================================================================= */}
      {selectedCertForRevoke && (
        <div className="fixed inset-0 z-50 bg-[#0F172A]/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-red-200 shadow-xl p-6 space-y-4">
            <div className="flex items-center gap-2 text-red-600">
              <XCircle className="w-5 h-5 shrink-0" />
              <h3 className="text-sm font-bold text-[#1E293B]">Revoke Official Certificate</h3>
            </div>
            <p className="text-xs text-[#64748B]">
              Revoking <strong>{selectedCertForRevoke.certificateNumber}</strong> will immediately
              invalidate the credential across all public and institutional verification queries.
            </p>

            <div>
              <label className="block text-[10px] font-bold text-[#64748B] uppercase mb-1">
                Mandatory Revocation Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                value={revokeReasonInput}
                onChange={(e) => setRevokeReasonInput(e.target.value)}
                placeholder="e.g. Issued erroneously based on unverified provisional credits."
                rows={3}
                className="w-full p-2.5 border border-[#CBD5E1] rounded-lg text-xs focus:outline-hidden focus:border-red-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E2E8F0]">
              <button
                type="button"
                onClick={() => setSelectedCertForRevoke(null)}
                className="px-3 py-1.5 border border-[#CBD5E1] rounded-lg text-xs font-bold text-[#64748B] hover:bg-[#F8FAFC]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteRevoke}
                className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
              >
                Confirm Revocation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 9: CONFIGURE TEMPLATE MODAL                                         */}
      {/* ========================================================================= */}
      {selectedTemplateForEdit && (
        <div className="fixed inset-0 z-50 bg-[#0F172A]/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-[#E2E8F0] shadow-xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
              <h3 className="text-sm font-bold text-[#1E293B]">
                Configure Template: {selectedTemplateForEdit.type}
              </h3>
              <button
                type="button"
                onClick={() => setSelectedTemplateForEdit(null)}
                className="text-[#64748B] hover:text-[#1E293B] font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateCertificateTemplate(selectedTemplateForEdit);
                setSelectedTemplateForEdit(null);
                setActionAlert({
                  type: "success",
                  message: `Template for "${selectedTemplateForEdit.type}" saved.`,
                });
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-bold text-[#1E293B] mb-1">
                  Authorized Signatory Title
                </label>
                <input
                  type="text"
                  value={selectedTemplateForEdit.authorizedSignatoryTitle}
                  onChange={(e) =>
                    setSelectedTemplateForEdit({
                      ...selectedTemplateForEdit,
                      authorizedSignatoryTitle: e.target.value,
                    })
                  }
                  className="w-full h-9 px-3 border border-[#CBD5E1] rounded-lg text-xs focus:outline-hidden focus:border-[#2563EB]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1E293B] mb-1">
                  Template Body Text (Supports tokens like [STUDENT_NAME], [ROLL_NUMBER], [COURSE_NAME])
                </label>
                <textarea
                  value={selectedTemplateForEdit.customBodyTemplate || ""}
                  onChange={(e) =>
                    setSelectedTemplateForEdit({
                      ...selectedTemplateForEdit,
                      customBodyTemplate: e.target.value,
                    })
                  }
                  rows={4}
                  className="w-full p-2.5 border border-[#CBD5E1] rounded-lg text-xs font-serif leading-relaxed focus:outline-hidden focus:border-[#2563EB]"
                />
              </div>

              <div className="space-y-2 pt-2 border-t border-[#E2E8F0]">
                <span className="block text-xs font-bold text-[#1E293B]">Prerequisite Policy Toggles</span>
                <label className="flex items-center gap-2 text-xs text-[#1E293B] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedTemplateForEdit.requiresFeeClearance}
                    onChange={(e) =>
                      setSelectedTemplateForEdit({
                        ...selectedTemplateForEdit,
                        requiresFeeClearance: e.target.checked,
                      })
                    }
                    className="rounded border-[#CBD5E1] text-[#2563EB]"
                  />
                  Require Institutional Fee Clearance
                </label>

                <label className="flex items-center gap-2 text-xs text-[#1E293B] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedTemplateForEdit.requiresHostelClearance}
                    onChange={(e) =>
                      setSelectedTemplateForEdit({
                        ...selectedTemplateForEdit,
                        requiresHostelClearance: e.target.checked,
                      })
                    }
                    className="rounded border-[#CBD5E1] text-[#2563EB]"
                  />
                  Require Hostel & Mess Clearance
                </label>

                <label className="flex items-center gap-2 text-xs text-[#1E293B] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedTemplateForEdit.requiresAcademicPass}
                    onChange={(e) =>
                      setSelectedTemplateForEdit({
                        ...selectedTemplateForEdit,
                        requiresAcademicPass: e.target.checked,
                      })
                    }
                    className="rounded border-[#CBD5E1] text-[#2563EB]"
                  />
                  Require Published Academic Pass Record
                </label>

                <label className="flex items-center gap-2 text-xs text-[#1E293B] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedTemplateForEdit.requiresFinalSemester}
                    onChange={(e) =>
                      setSelectedTemplateForEdit({
                        ...selectedTemplateForEdit,
                        requiresFinalSemester: e.target.checked,
                      })
                    }
                    className="rounded border-[#CBD5E1] text-[#2563EB]"
                  />
                  Require Final Semester Cohort Completion
                </label>

                <label className="flex items-center gap-2 text-xs text-[#1E293B] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedTemplateForEdit.requiresZeroBacklogs}
                    onChange={(e) =>
                      setSelectedTemplateForEdit({
                        ...selectedTemplateForEdit,
                        requiresZeroBacklogs: e.target.checked,
                      })
                    }
                    className="rounded border-[#CBD5E1] text-[#2563EB]"
                  />
                  Require Zero Outstanding Backlogs
                </label>

                <label className="flex items-center gap-2 text-xs text-[#1E293B] cursor-pointer pt-2">
                  <input
                    type="checkbox"
                    checked={selectedTemplateForEdit.isEnabled}
                    onChange={(e) =>
                      setSelectedTemplateForEdit({
                        ...selectedTemplateForEdit,
                        isEnabled: e.target.checked,
                      })
                    }
                    className="rounded border-[#CBD5E1] text-[#2563EB]"
                  />
                  Enable Certificate Type for Institutional Issuance
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => setSelectedTemplateForEdit(null)}
                  className="px-3 py-1.5 border border-[#CBD5E1] rounded-lg text-xs font-bold text-[#64748B] hover:bg-[#F8FAFC]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CertificatesPage() {
  return (
    <Suspense
      fallback={
        <div className="p-10 text-center text-xs text-[#64748B]">
          Loading Certificate Management...
        </div>
      }
    >
      <CertificatesContent />
    </Suspense>
  );
}
