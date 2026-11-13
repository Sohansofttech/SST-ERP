"use client";

import React, { useState, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useInstitution } from "@/lib/store";
import {
  PromotionPolicy,
  PromotionBatchItem,
  PromotionBatchStatus,
  PromotionEligibilityStatus,
} from "@/types/institution";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Alert } from "@/components/ui/alert";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableEmpty,
} from "@/components/ui/table";
import {
  TrendingUp,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Download,
  Search,
  Sliders,
  Users,
  ShieldCheck,
  Check,
  Trash2,
  Layers,
  ArrowRight,
  ShieldAlert,
  UserCheck,
  UserX,
  History,
} from "lucide-react";

type ActiveTab =
  | "overview"
  | "checker"
  | "batch_execution"
  | "detention"
  | "backlogs"
  | "reallocation"
  | "policies"
  | "history";

const ELIGIBILITY_STATUS_CONFIG: Record<
  PromotionEligibilityStatus,
  { label: string; variant: "success" | "teal" | "warning" | "error" | "neutral" }
> = {
  Eligible: { label: "Eligible", variant: "success" },
  "Eligible with Backlogs": { label: "Eligible w/ Backlogs", variant: "teal" },
  "Pending Review": { label: "Pending Review", variant: "warning" },
  Detained: { label: "Detained", variant: "error" },
  "Already Promoted": { label: "Already Promoted", variant: "neutral" },
};

const BATCH_STATUS_CONFIG: Record<
  PromotionBatchStatus,
  { label: string; variant: "neutral" | "warning" | "teal" | "success" }
> = {
  Draft: { label: "Draft", variant: "neutral" },
  "Under Review": { label: "Under Review", variant: "warning" },
  Approved: { label: "Approved", variant: "teal" },
  Executed: { label: "Executed", variant: "success" },
};

function PromotionsContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab") as ActiveTab | null;

  const {
    academicYears,
    courses,
    classes,
    sections,
    promotionPolicies,
    promotionBatches,
    promotionHistory,
    promotionAudits,
    updatePromotionPolicy,
    evaluateStudentsForPromotion,
    createPromotionBatch,
    transitionPromotionBatchStatus,
    executePromotionBatch,
    overrideStudentEligibility,
    reallocateStudentSection,
    deletePromotionBatch,
    getPromotionMetrics,
  } = useInstitution();

  // Active Tab
  const [activeTab, setActiveTab] = useState<ActiveTab>(
    tabParam &&
      [
        "overview",
        "checker",
        "batch_execution",
        "detention",
        "backlogs",
        "reallocation",
        "policies",
        "history",
      ].includes(tabParam)
      ? tabParam
      : "overview"
  );

  // Selection & Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAcademicYearId, setSelectedAcademicYearId] = useState<string>(
    academicYears.find((ay) => ay.isActive)?.id || academicYears[0]?.id || ""
  );
  const [selectedCourseId, setSelectedCourseId] = useState<string>("ALL");
  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || "");
  const [selectedSectionId, setSelectedSectionId] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Batch Execution Wizard State
  const [execSourceAYId, setExecSourceAYId] = useState<string>(
    academicYears.find((ay) => ay.isActive)?.id || academicYears[0]?.id || ""
  );
  const [execDestAYId, setExecDestAYId] = useState<string>(
    academicYears.find((ay) => !ay.isActive)?.id || academicYears[0]?.id || ""
  );
  const [execCourseId, setExecCourseId] = useState<string>(courses[0]?.id || "");
  const [execSourceClassId, setExecSourceClassId] = useState<string>(classes[0]?.id || "");
  const [execSourceSectionId, setExecSourceSectionId] = useState<string>("sec-cse-3a");
  const [execDestClassId, setExecDestClassId] = useState<string>(classes[1]?.id || classes[0]?.id || "");
  const [execDestSectionId, setExecDestSectionId] = useState<string>("sec-cse-4a");
  const [execBatchName, setExecBatchName] = useState<string>("");
  const [selectedStudentIdsForExec, setSelectedStudentIdsForExec] = useState<string[]>([]);

  // Execution Confirmation Modal State
  const [executingBatch, setExecutingBatch] = useState<PromotionBatchItem | null>(null);
  const [executionConfirmed, setExecutionConfirmed] = useState(false);
  const [executionError, setExecutionError] = useState("");

  // Override Modal State
  const [overrideStudentId, setOverrideStudentId] = useState<string | null>(null);
  const [overrideReasonInput, setOverrideReasonInput] = useState("");
  const [overrideError, setOverrideError] = useState("");

  // Section Reallocation Modal State
  const [reallocStudentId, setReallocStudentId] = useState<string | null>(null);
  const [reallocDestSectionId, setReallocDestSectionId] = useState<string>("");
  const [reallocReason, setReallocReason] = useState<string>("");
  const [reallocError, setReallocError] = useState("");

  // Policy Form State
  const [activePolicy, setActivePolicy] = useState<PromotionPolicy>(
    promotionPolicies[0] || {
      id: "policy-new",
      institutionId: "inst-sst-01",
      name: "Standard Progression Policy",
      courseId: "ALL",
      courseName: "All Courses",
      minCgpa: 5.0,
      minSgpa: 4.0,
      minEarnedCredits: 18,
      minCreditsPercentage: 60,
      maxAllowedBacklogs: 2,
      allowBacklogPromotion: true,
      detentionConditions: {
        maxBacklogsExceeded: true,
        belowMinCgpa: true,
        belowMinCredits: true,
      },
      allowAdministrativeOverride: true,
      isDefault: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  );
  const [policySaveSuccess, setPolicySaveSuccess] = useState("");
  const [policySaveError, setPolicySaveError] = useState("");

  // Banner Notification
  const [actionAlert, setActionAlert] = useState<{ type: "success" | "error"; message: string } | null>(
    null
  );

  // Metrics
  const metrics = useMemo(() => getPromotionMetrics(), [getPromotionMetrics]);

  // Evaluated Students for the Selected Class & Section
  const evaluatedStudents = useMemo(() => {
    if (!selectedClassId) return [];
    return evaluateStudentsForPromotion({
      classId: selectedClassId,
      sectionId: selectedSectionId,
    });
  }, [evaluateStudentsForPromotion, selectedClassId, selectedSectionId]);

  // Filtered Students for Eligibility Checker
  const filteredEvaluatedStudents = useMemo(() => {
    return evaluatedStudents.filter((stu) => {
      const matchSearch =
        stu.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stu.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stu.studentUniqueId.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = statusFilter === "ALL" || stu.status === statusFilter;
      const matchCourse = selectedCourseId === "ALL" || stu.courseId === selectedCourseId;
      return matchSearch && matchStatus && matchCourse;
    });
  }, [evaluatedStudents, searchTerm, statusFilter, selectedCourseId]);

  // Students Evaluated for Wizard Source
  const wizardEvaluatedStudents = useMemo(() => {
    if (!execSourceClassId) return [];
    return evaluateStudentsForPromotion({
      classId: execSourceClassId,
      sectionId: execSourceSectionId,
    });
  }, [evaluateStudentsForPromotion, execSourceClassId, execSourceSectionId]);

  // Destination Section Entity
  const selectedDestSectionEntity = useMemo(() => {
    return sections.find((s) => s.id === execDestSectionId);
  }, [sections, execDestSectionId]);

  // Destination Section Remaining Capacity
  const destRemainingCapacity = useMemo(() => {
    if (!selectedDestSectionEntity) return 0;
    return selectedDestSectionEntity.maxCapacity - selectedDestSectionEntity.currentEnrollment;
  }, [selectedDestSectionEntity]);

  // Toggle Single Student for Batch Execution
  const handleToggleStudentSelection = (studentId: string) => {
    setSelectedStudentIdsForExec((prev) =>
      prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId]
    );
  };

  // Select All Eligible Students in Wizard
  const handleSelectAllEligible = () => {
    const eligibleIds = wizardEvaluatedStudents
      .filter((s) => s.status === "Eligible" || s.status === "Eligible with Backlogs")
      .map((s) => s.studentId);
    setSelectedStudentIdsForExec(eligibleIds);
  };

  // Create Batch from Wizard
  const handleCreateBatchFromWizard = () => {
    setActionAlert(null);
    if (selectedStudentIdsForExec.length === 0) {
      setActionAlert({ type: "error", message: "Please select at least one student for promotion." });
      return;
    }

    const srcAy = academicYears.find((ay) => ay.id === execSourceAYId);
    const destAy = academicYears.find((ay) => ay.id === execDestAYId);
    const crs = courses.find((c) => c.id === execCourseId);
    const srcCls = classes.find((c) => c.id === execSourceClassId);
    const srcSec = sections.find((s) => s.id === execSourceSectionId);
    const destCls = classes.find((c) => c.id === execDestClassId);
    const destSec = sections.find((s) => s.id === execDestSectionId);

    const selectedStudentsData = wizardEvaluatedStudents.filter((s) =>
      selectedStudentIdsForExec.includes(s.studentId)
    );

    const studentRecords = selectedStudentsData.map((s) => ({
      studentId: s.studentId,
      rollNumber: s.rollNumber,
      studentName: s.studentName,
      eligibilityStatus: s.status,
      destinationClassId: execDestClassId,
      destinationClassName: destCls?.name || "Next Class",
      destinationSectionId: execDestSectionId,
      destinationSectionName: destSec?.name || "Next Section",
      destinationSemester: (destCls?.semester ?? srcCls?.semester ?? 5) + 1,
      isOverride: !!s.isOverrideAuthorized,
      overrideReason: s.overrideReason,
      sgpaAtPromotion: s.sgpa,
      cgpaAtPromotion: s.cgpa,
      carriedBacklogCodes: s.failedSubjectCodes,
    }));

    const promotedRegular = studentRecords.filter((r) => r.eligibilityStatus === "Eligible").length;
    const promotedBacklog = studentRecords.filter((r) => r.eligibilityStatus === "Eligible with Backlogs").length;
    const overrideCount = studentRecords.filter((r) => r.isOverride).length;

    const res = createPromotionBatch({
      institutionId: "inst-sst-01",
      batchName:
        execBatchName.trim() ||
        `${srcCls?.name || "Cohort"} to ${destCls?.name || "Next Year"} Promotion`,
      sourceAcademicYearId: execSourceAYId,
      sourceAcademicYearName: srcAy?.name || "2026-2027",
      destinationAcademicYearId: execDestAYId,
      destinationAcademicYearName: destAy?.name || "2027-2028",
      courseId: execCourseId,
      courseName: crs?.name || "Course",
      sourceClassId: execSourceClassId,
      sourceClassName: srcCls?.name || "Class",
      sourceSectionId: execSourceSectionId,
      sourceSectionName: srcSec?.name || "Section A",
      destinationClassId: execDestClassId,
      destinationClassName: destCls?.name || "Class",
      destinationSectionId: execDestSectionId,
      destinationSectionName: destSec?.name || "Section A",
      destinationSemester: (destCls?.semester ?? 6),
      policyId: activePolicy.id,
      policyName: activePolicy.name,
      status: "Draft",
      totalStudentsEvaluated: wizardEvaluatedStudents.length,
      promotedCount: promotedRegular,
      promotedWithBacklogsCount: promotedBacklog,
      detainedCount: wizardEvaluatedStudents.filter((s) => s.status === "Detained").length,
      overrideCount,
      studentRecords,
      createdBy: "Institution Admin",
    });

    if (res.success && res.batch) {
      setActionAlert({ type: "success", message: res.message });
      setActiveTab("overview");
    } else {
      setActionAlert({ type: "error", message: res.message });
    }
  };

  // Status Transitions (Submit review, Approve)
  const handleTransitionStatus = (batch: PromotionBatchItem, newStatus: PromotionBatchStatus) => {
    if (newStatus === "Executed") {
      setExecutingBatch(batch);
      setExecutionConfirmed(false);
      setExecutionError("");
      return;
    }

    const res = transitionPromotionBatchStatus(batch.id, newStatus);
    if (res.success) {
      setActionAlert({ type: "success", message: res.message });
    } else {
      setActionAlert({ type: "error", message: res.message });
    }
  };

  // Confirm and Execute Promotion Batch
  const handleConfirmExecutePromotion = () => {
    if (!executingBatch) return;
    if (!executionConfirmed) {
      setExecutionError("Please confirm the execution declaration before proceeding.");
      return;
    }

    const res = executePromotionBatch(executingBatch.id, "Institution Admin");
    if (res.success) {
      setActionAlert({
        type: "success",
        message: `Success: ${res.message} Cohort placement updated.`,
      });
      setExecutingBatch(null);
    } else {
      setExecutionError(res.message);
    }
  };

  // Submit Administrative Override
  const handleSubmitOverride = () => {
    if (!overrideStudentId) return;
    if (!overrideReasonInput.trim() || overrideReasonInput.trim().length < 5) {
      setOverrideError("A detailed administrative justification (min 5 characters) is mandatory.");
      return;
    }

    const res = overrideStudentEligibility({
      studentId: overrideStudentId,
      reason: overrideReasonInput.trim(),
      authorizedBy: "Dean of Academic Affairs",
    });

    if (res.success) {
      setActionAlert({ type: "success", message: res.message });
      setOverrideStudentId(null);
      setOverrideReasonInput("");
      setOverrideError("");
    } else {
      setOverrideError(res.message);
    }
  };

  // Submit Section Reallocation
  const handleSubmitReallocation = () => {
    if (!reallocStudentId || !reallocDestSectionId) {
      setReallocError("Please select a destination section.");
      return;
    }

    const res = reallocateStudentSection({
      studentId: reallocStudentId,
      newSectionId: reallocDestSectionId,
      reason: reallocReason.trim() || "Administrative section balancing.",
    });

    if (res.success) {
      setActionAlert({ type: "success", message: res.message });
      setReallocStudentId(null);
      setReallocDestSectionId("");
      setReallocReason("");
      setReallocError("");
    } else {
      setReallocError(res.message);
    }
  };

  // Save Policy
  const handleSavePolicy = () => {
    setPolicySaveSuccess("");
    setPolicySaveError("");

    const res = updatePromotionPolicy(activePolicy);
    if (res.success) {
      setPolicySaveSuccess(res.message);
      setActionAlert({ type: "success", message: res.message });
    } else {
      setPolicySaveError(res.message);
    }
  };

  // Export CSV Helper
  const handleExportBatchCSV = (batch: PromotionBatchItem) => {
    const headers = [
      "Roll No",
      "Student Name",
      "Eligibility Status",
      "Destination Class",
      "Destination Section",
      "Destination Sem",
      "SGPA at Promotion",
      "CGPA at Promotion",
      "Carried Backlogs",
      "Override Status",
      "Override Justification",
    ];

    const rows = batch.studentRecords.map((r) => [
      r.rollNumber,
      `"${r.studentName}"`,
      r.eligibilityStatus,
      `"${r.destinationClassName}"`,
      `"${r.destinationSectionName}"`,
      r.destinationSemester,
      r.sgpaAtPromotion,
      r.cgpaAtPromotion,
      `"${r.carriedBacklogCodes.join("; ")}"`,
      r.isOverride ? "Yes" : "No",
      `"${r.overrideReason || "N/A"}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${batch.batchName.replace(/\s+/g, "_")}_Promotion_Roster.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export Eligibility Roster CSV
  const handleExportEligibilityCSV = () => {
    const headers = [
      "Roll No",
      "Student Name",
      "Current Class",
      "Section",
      "SGPA",
      "CGPA",
      "Earned Credits",
      "Required Credits",
      "Active Backlogs",
      "Failed Subjects",
      "Promotion Status",
      "Evaluation Reason",
    ];

    const rows = filteredEvaluatedStudents.map((s) => [
      s.rollNumber,
      `"${s.studentName}"`,
      `"${s.className}"`,
      `"${s.sectionName || "N/A"}"`,
      s.sgpa,
      s.cgpa,
      s.totalCreditsEarned,
      s.totalCreditsRegistered,
      s.activeBacklogsCount,
      `"${s.failedSubjectCodes.join("; ")}"`,
      s.status,
      `"${s.reason}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Promotion_Eligibility_Roster.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[#E2E8F0]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/admin"
              className="text-xs font-semibold text-[#64748B] hover:text-[#153B66] flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Dashboard
            </Link>
            <span className="text-[#CBD5E1]">•</span>
            <span className="text-xs font-semibold text-[#14B8A6] uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Phase 4D Academic Progression
            </span>
            <span className="text-[#CBD5E1]">•</span>
            <span className="text-xs font-semibold text-[#64748B]">Promotions & Standing</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#1E293B] tracking-tight">
            Promotions & Academic Standing
          </h1>
          <p className="text-xs md:text-sm text-[#64748B] mt-1">
            Manage cohort progression across academic years based on published exam results, earned credits, backlog carry-forward policies, and detention rules.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setActiveTab("policies")}
            leftIcon={<Sliders className="w-4 h-4 text-[#2563EB]" />}
          >
            Progression Rules
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setActiveTab("batch_execution")}
            leftIcon={<TrendingUp className="w-4 h-4" />}
          >
            Launch Promotion Wizard
          </Button>
        </div>
      </div>

      {/* Action Notification Alert */}
      {actionAlert && (
        <div className="relative">
          <Alert
            variant={actionAlert.type === "success" ? "success" : "error"}
            title={actionAlert.type === "success" ? "Operation Successful" : "Validation Error"}
          >
            {actionAlert.message}
          </Alert>
          <button
            onClick={() => setActionAlert(null)}
            className="absolute top-3 right-3 text-[#64748B] hover:text-[#1E293B] text-xs font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* KPI Metrics Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card className="border-l-4 border-l-[#153B66]">
          <div className="p-3.5">
            <span className="text-[10px] uppercase font-bold text-[#64748B] tracking-wider block">
              Total Evaluated
            </span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xl font-black text-[#1E293B]">
                {metrics.totalEligibleStudents}
              </span>
              <Users className="w-4 h-4 text-[#153B66]/60" />
            </div>
            <span className="text-[10px] text-[#64748B] mt-1 block">Active undergraduates</span>
          </div>
        </Card>

        <Card className="border-l-4 border-l-[#16A34A]">
          <div className="p-3.5">
            <span className="text-[10px] uppercase font-bold text-[#64748B] tracking-wider block">
              Promotion Ready
            </span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xl font-black text-[#16A34A]">
                {metrics.studentsEligibleForPromotion}
              </span>
              <UserCheck className="w-4 h-4 text-[#16A34A]/60" />
            </div>
            <span className="text-[10px] text-[#64748B] mt-1 block">
              {metrics.studentsWithBacklogs} with backlogs
            </span>
          </div>
        </Card>

        <Card className="border-l-4 border-l-[#DC2626]">
          <div className="p-3.5">
            <span className="text-[10px] uppercase font-bold text-[#64748B] tracking-wider block">
              Detained / Arrears
            </span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xl font-black text-[#DC2626]">{metrics.studentsDetained}</span>
              <UserX className="w-4 h-4 text-[#DC2626]/60" />
            </div>
            <span className="text-[10px] text-[#64748B] mt-1 block">Exceeds backlog limit</span>
          </div>
        </Card>

        <Card className="border-l-4 border-l-[#F59E0B]">
          <div className="p-3.5">
            <span className="text-[10px] uppercase font-bold text-[#64748B] tracking-wider block">
              Pending Review
            </span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xl font-black text-[#B45309]">
                {metrics.studentsPendingReview}
              </span>
              <AlertTriangle className="w-4 h-4 text-[#F59E0B]/60" />
            </div>
            <span className="text-[10px] text-[#64748B] mt-1 block">Results unpublished</span>
          </div>
        </Card>

        <Card className="border-l-4 border-l-[#2563EB]">
          <div className="p-3.5">
            <span className="text-[10px] uppercase font-bold text-[#64748B] tracking-wider block">
              Already Promoted
            </span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xl font-black text-[#2563EB]">
                {metrics.studentsAlreadyPromoted}
              </span>
              <CheckCircle2 className="w-4 h-4 text-[#2563EB]/60" />
            </div>
            <span className="text-[10px] text-[#64748B] mt-1 block">In executed batches</span>
          </div>
        </Card>

        <Card className="border-l-4 border-l-[#14B8A6]">
          <div className="p-3.5">
            <span className="text-[10px] uppercase font-bold text-[#64748B] tracking-wider block">
              Batches Executed
            </span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xl font-black text-[#14B8A6]">
                {metrics.executedBatches} / {metrics.totalPromotionBatches}
              </span>
              <TrendingUp className="w-4 h-4 text-[#14B8A6]/60" />
            </div>
            <span className="text-[10px] text-[#64748B] mt-1 block">Annual cycle decrees</span>
          </div>
        </Card>
      </div>

      {/* Main Tab Navigation */}
      <div className="flex items-center gap-1.5 border-b border-[#E2E8F0] pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab("overview")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all shrink-0 ${
            activeTab === "overview"
              ? "bg-[#153B66] text-white shadow-xs"
              : "text-[#64748B] hover:text-[#1E293B] hover:bg-[#F1F5F9]"
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Promotion Batches</span>
          <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded font-semibold ml-1">
            {promotionBatches.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("checker")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all shrink-0 ${
            activeTab === "checker"
              ? "bg-[#153B66] text-white shadow-xs"
              : "text-[#64748B] hover:text-[#1E293B] hover:bg-[#F1F5F9]"
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Eligibility Checker</span>
        </button>

        <button
          onClick={() => setActiveTab("batch_execution")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all shrink-0 ${
            activeTab === "batch_execution"
              ? "bg-[#153B66] text-white shadow-xs"
              : "text-[#64748B] hover:text-[#1E293B] hover:bg-[#F1F5F9]"
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Batch Execution Wizard</span>
        </button>

        <button
          onClick={() => setActiveTab("detention")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all shrink-0 ${
            activeTab === "detention"
              ? "bg-[#153B66] text-white shadow-xs"
              : "text-[#64748B] hover:text-[#1E293B] hover:bg-[#F1F5F9]"
          }`}
        >
          <UserX className="w-4 h-4" />
          <span>Detention & Standing</span>
          <span className="text-[10px] bg-red-500/20 text-red-100 px-1.5 py-0.2 rounded font-semibold ml-1">
            {metrics.studentsDetained}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("backlogs")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all shrink-0 ${
            activeTab === "backlogs"
              ? "bg-[#153B66] text-white shadow-xs"
              : "text-[#64748B] hover:text-[#1E293B] hover:bg-[#F1F5F9]"
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Backlog Carry-Forward</span>
        </button>

        <button
          onClick={() => setActiveTab("reallocation")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all shrink-0 ${
            activeTab === "reallocation"
              ? "bg-[#153B66] text-white shadow-xs"
              : "text-[#64748B] hover:text-[#1E293B] hover:bg-[#F1F5F9]"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Section Capacity & Allocation</span>
        </button>

        <button
          onClick={() => setActiveTab("policies")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all shrink-0 ${
            activeTab === "policies"
              ? "bg-[#153B66] text-white shadow-xs"
              : "text-[#64748B] hover:text-[#1E293B] hover:bg-[#F1F5F9]"
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Progression Policies</span>
        </button>

        <button
          onClick={() => setActiveTab("history")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all shrink-0 ${
            activeTab === "history"
              ? "bg-[#153B66] text-white shadow-xs"
              : "text-[#64748B] hover:text-[#1E293B] hover:bg-[#F1F5F9]"
          }`}
        >
          <History className="w-4 h-4" />
          <span>Promotion History</span>
          <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded font-semibold ml-1">
            {promotionHistory.length}
          </span>
        </button>
      </div>

      {/* =========================================================================
          TAB 1: PROMOTIONS DASHBOARD & BATCH DIRECTORY
         ========================================================================= */}
      {activeTab === "overview" && (
        <div className="space-y-4">
          {/* Batches Table */}
          <Card>
            <div className="p-4 border-b border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-[#1E293B]">Cohort Promotion Batches</h3>
                <span className="text-xs text-[#64748B]">
                  Manage annual and semester progression decrees across courses and class cohorts.
                </span>
              </div>

              <Button
                variant="primary"
                size="sm"
                onClick={() => setActiveTab("batch_execution")}
                leftIcon={<TrendingUp className="w-3.5 h-3.5" />}
              >
                New Promotion Batch
              </Button>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Batch Title & Degree</TableHead>
                    <TableHead>Progression Pathway</TableHead>
                    <TableHead>Policy Applied</TableHead>
                    <TableHead className="text-center">Students</TableHead>
                    <TableHead className="text-center">Promoted</TableHead>
                    <TableHead className="text-center">Backlogs</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {promotionBatches.length === 0 ? (
                    <TableEmpty colSpan={8} message="No promotion batches created yet." />
                  ) : (
                    promotionBatches.map((batch) => {
                      const statusConf = BATCH_STATUS_CONFIG[batch.status];
                      return (
                        <TableRow key={batch.id} className="hover:bg-[#F8FAFC]">
                          <TableCell>
                            <div>
                              <strong className="text-xs font-bold text-[#1E293B] block">
                                {batch.batchName}
                              </strong>
                              <span className="text-[11px] text-[#64748B]">
                                {batch.courseName}
                              </span>
                            </div>
                          </TableCell>

                          <TableCell>
                            <div className="flex items-center gap-1.5 text-xs">
                              <span className="font-semibold text-[#1E293B]">
                                {batch.sourceClassName}
                              </span>
                              <ArrowRight className="w-3.5 h-3.5 text-[#2563EB]" />
                              <span className="font-extrabold text-[#2563EB]">
                                {batch.destinationClassName} ({batch.destinationSectionName})
                              </span>
                            </div>
                            <span className="text-[10px] text-[#64748B] block mt-0.5">
                              {batch.sourceAcademicYearName} → {batch.destinationAcademicYearName}
                            </span>
                          </TableCell>

                          <TableCell>
                            <span className="text-[11px] text-[#153B66] bg-[#F1F5F9] px-2 py-0.5 rounded border border-[#E2E8F0]">
                              {batch.policyName}
                            </span>
                          </TableCell>

                          <TableCell className="text-center font-bold text-xs text-[#1E293B]">
                            {batch.totalStudentsEvaluated}
                          </TableCell>

                          <TableCell className="text-center font-bold text-xs text-[#16A34A]">
                            {batch.promotedCount}
                          </TableCell>

                          <TableCell className="text-center font-bold text-xs text-[#D97706]">
                            {batch.promotedWithBacklogsCount}
                          </TableCell>

                          <TableCell>
                            <Badge variant={statusConf.variant} size="sm">
                              {statusConf.label}
                            </Badge>
                            {batch.status === "Executed" && batch.executedAt && (
                              <span className="text-[10px] text-[#16A34A] block mt-0.5">
                                On {new Date(batch.executedAt).toLocaleDateString()}
                              </span>
                            )}
                          </TableCell>

                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1.5 flex-wrap">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleExportBatchCSV(batch)}
                                title="Export Batch CSV"
                                className="h-7 text-xs px-2"
                              >
                                <Download className="w-3.5 h-3.5" />
                              </Button>

                              {batch.status === "Draft" && (
                                <Button
                                  variant="primary"
                                  size="sm"
                                  onClick={() => handleTransitionStatus(batch, "Under Review")}
                                  className="h-7 text-[11px] px-2 bg-[#D97706] hover:bg-[#B45309]"
                                >
                                  Submit Review
                                </Button>
                              )}

                              {batch.status === "Under Review" && (
                                <Button
                                  variant="primary"
                                  size="sm"
                                  onClick={() => handleTransitionStatus(batch, "Approved")}
                                  className="h-7 text-[11px] px-2 bg-[#0D9488] hover:bg-[#0F766E]"
                                >
                                  Approve
                                </Button>
                              )}

                              {batch.status === "Approved" && (
                                <Button
                                  variant="primary"
                                  size="sm"
                                  onClick={() => handleTransitionStatus(batch, "Executed")}
                                  className="h-7 text-[11px] px-2 bg-[#16A34A] hover:bg-[#15803D]"
                                  leftIcon={<TrendingUp className="w-3 h-3" />}
                                >
                                  Execute Promotion
                                </Button>
                              )}

                              {batch.status !== "Executed" && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    if (confirm(`Delete draft batch "${batch.batchName}"?`)) {
                                      deletePromotionBatch(batch.id);
                                    }
                                  }}
                                  className="h-7 text-xs px-2 text-[#DC2626] hover:bg-[#FEE2E2]"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>

          {/* Recent Promotion Activity Card */}
          <Card>
            <div className="p-4 border-b border-[#E2E8F0]">
              <h3 className="text-sm font-bold text-[#1E293B]">Recent Progression Events</h3>
            </div>
            <div className="p-4 divide-y divide-[#F1F5F9] text-xs">
              {promotionAudits.slice(0, 5).map((audit) => (
                <div key={audit.id} className="py-2.5 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="font-bold text-[#1E293B] block">{audit.details}</span>
                    <span className="text-[10px] text-[#64748B]">
                      {audit.action} • Authorized by: <strong>{audit.performedBy}</strong>
                    </span>
                  </div>
                  <span className="text-[10px] text-[#94A3B8]">
                    {new Date(audit.timestamp).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* =========================================================================
          TAB 2: PROMOTION ELIGIBILITY CHECKER
         ========================================================================= */}
      {activeTab === "checker" && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <Card>
            <div className="p-4 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#64748B] uppercase mb-1">
                    Academic Year
                  </label>
                  <select
                    value={selectedAcademicYearId}
                    onChange={(e) => setSelectedAcademicYearId(e.target.value)}
                    className="w-full h-9 px-3 border border-[#E2E8F0] rounded-lg text-xs text-[#1E293B] bg-white focus:outline-hidden focus:border-[#2563EB]"
                  >
                    {academicYears.map((ay) => (
                      <option key={ay.id} value={ay.id}>
                        {ay.name} {ay.isActive ? "(Active)" : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#64748B] uppercase mb-1">
                    Degree Course
                  </label>
                  <select
                    value={selectedCourseId}
                    onChange={(e) => setSelectedCourseId(e.target.value)}
                    className="w-full h-9 px-3 border border-[#E2E8F0] rounded-lg text-xs text-[#1E293B] bg-white focus:outline-hidden focus:border-[#2563EB]"
                  >
                    <option value="ALL">All Degree Courses</option>
                    {courses.map((crs) => (
                      <option key={crs.id} value={crs.id}>
                        {crs.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#64748B] uppercase mb-1">
                    Cohort Class
                  </label>
                  <select
                    value={selectedClassId}
                    onChange={(e) => setSelectedClassId(e.target.value)}
                    className="w-full h-9 px-3 border border-[#E2E8F0] rounded-lg text-xs text-[#1E293B] bg-white focus:outline-hidden focus:border-[#2563EB]"
                  >
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name} (Sem {cls.semester})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#64748B] uppercase mb-1">
                    Section
                  </label>
                  <select
                    value={selectedSectionId}
                    onChange={(e) => setSelectedSectionId(e.target.value)}
                    className="w-full h-9 px-3 border border-[#E2E8F0] rounded-lg text-xs text-[#1E293B] bg-white focus:outline-hidden focus:border-[#2563EB]"
                  >
                    <option value="ALL">All Sections</option>
                    {sections.map((sec) => (
                      <option key={sec.id} value={sec.id}>
                        {sec.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#64748B] uppercase mb-1">
                    Standing Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full h-9 px-3 border border-[#E2E8F0] rounded-lg text-xs text-[#1E293B] bg-white focus:outline-hidden focus:border-[#2563EB]"
                  >
                    <option value="ALL">All Eligibility Statuses</option>
                    <option value="Eligible">Eligible</option>
                    <option value="Eligible with Backlogs">Eligible w/ Backlogs</option>
                    <option value="Detained">Detained</option>
                    <option value="Pending Review">Pending Review</option>
                    <option value="Already Promoted">Already Promoted</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#94A3B8]" />
                  <Input
                    placeholder="Search by student name or roll number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 h-9 text-xs"
                  />
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportEligibilityCSV}
                  leftIcon={<Download className="w-3.5 h-3.5" />}
                >
                  Export Eligibility Roster (CSV)
                </Button>
              </div>
            </div>
          </Card>

          {/* Student Evaluation Table */}
          <Card>
            <div className="p-4 border-b border-[#E2E8F0] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#1E293B]">Cohort Standing & Eligibility Matrix</h3>
                <span className="text-xs text-[#64748B]">
                  Evaluated using live Phase 4C academic results and institutional credit progression rules.
                </span>
              </div>
              <Badge variant="navy" size="sm">
                {filteredEvaluatedStudents.length} Students Evaluated
              </Badge>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student Details</TableHead>
                    <TableHead className="text-center">Credits (Earned / Req)</TableHead>
                    <TableHead className="text-center">SGPA</TableHead>
                    <TableHead className="text-center">CGPA</TableHead>
                    <TableHead>Backlogs Status</TableHead>
                    <TableHead>Eligibility Status</TableHead>
                    <TableHead className="max-w-xs">Detailed Evaluation Reason</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEvaluatedStudents.length === 0 ? (
                    <TableEmpty colSpan={8} message="No student records found matching selected criteria." />
                  ) : (
                    filteredEvaluatedStudents.map((stu) => {
                      const statusConf = ELIGIBILITY_STATUS_CONFIG[stu.status];
                      return (
                        <TableRow key={stu.studentId} className="hover:bg-[#F8FAFC]">
                          <TableCell>
                            <div>
                              <strong className="text-xs font-bold text-[#1E293B] block">
                                {stu.studentName}
                              </strong>
                              <span className="text-[11px] text-[#64748B]">
                                {stu.rollNumber} • {stu.className} ({stu.sectionName})
                              </span>
                            </div>
                          </TableCell>

                          <TableCell className="text-center font-bold text-xs text-[#1E293B]">
                            {stu.totalCreditsEarned} / {stu.totalCreditsRegistered}
                          </TableCell>

                          <TableCell className="text-center font-bold text-xs text-[#2563EB]">
                            {stu.sgpa > 0 ? stu.sgpa.toFixed(2) : "N/A"}
                          </TableCell>

                          <TableCell className="text-center font-bold text-xs text-[#153B66]">
                            {stu.cgpa > 0 ? stu.cgpa.toFixed(2) : "N/A"}
                          </TableCell>

                          <TableCell>
                            {stu.activeBacklogsCount > 0 ? (
                              <div>
                                <span className="text-[11px] font-bold text-[#DC2626] block">
                                  {stu.activeBacklogsCount} Arrears
                                </span>
                                <span className="text-[10px] text-[#DC2626]">
                                  {stu.failedSubjectCodes.join(", ")}
                                </span>
                              </div>
                            ) : (
                              <span className="text-[11px] text-[#16A34A] font-semibold">
                                Clean (0)
                              </span>
                            )}
                          </TableCell>

                          <TableCell>
                            <Badge variant={statusConf.variant} size="sm">
                              {statusConf.label}
                            </Badge>
                          </TableCell>

                          <TableCell className="max-w-xs text-xs text-[#475569]">
                            <span>{stu.reason}</span>
                          </TableCell>

                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1.5 flex-wrap">
                              {stu.status === "Detained" && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setOverrideStudentId(stu.studentId);
                                    setOverrideReasonInput("");
                                    setOverrideError("");
                                  }}
                                  className="h-7 text-[11px] px-2 border-[#D97706] text-[#D97706] hover:bg-[#FEF3C7]"
                                  title="Authorize Administrative Override"
                                >
                                  <ShieldAlert className="w-3.5 h-3.5 mr-1" /> Override
                                </Button>
                              )}

                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setReallocStudentId(stu.studentId);
                                  setReallocDestSectionId(stu.sectionId || "");
                                  setReallocReason("");
                                  setReallocError("");
                                }}
                                className="h-7 text-[11px] px-2 text-[#2563EB]"
                                title="Reallocate Section"
                              >
                                <Layers className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>
      )}

      {/* =========================================================================
          TAB 3: BATCH PROMOTION EXECUTION WIZARD
         ========================================================================= */}
      {activeTab === "batch_execution" && (
        <div className="space-y-6">
          <Card>
            <div className="p-5 border-b border-[#E2E8F0]">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-[#2563EB] uppercase tracking-wider">
                  Progression Engine
                </span>
                <span className="text-[#CBD5E1]">•</span>
                <span className="text-xs text-[#64748B]">Batch Execution Wizard</span>
              </div>
              <h2 className="text-lg font-bold text-[#1E293B]">
                Configure and Execute Cohort Progression
              </h2>
              <p className="text-xs text-[#64748B] mt-0.5">
                Select origin and target academic cycles, review real-time eligibility outcomes, assign destination sections with capacity tracking, and launch the promotion workflow.
              </p>
            </div>

            <div className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Source AY */}
                <div>
                  <label className="block text-xs font-bold text-[#1E293B] mb-1">
                    Source Academic Year <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={execSourceAYId}
                    onChange={(e) => setExecSourceAYId(e.target.value)}
                    className="w-full h-9 px-3 border border-[#E2E8F0] rounded-lg text-xs text-[#1E293B] bg-white focus:outline-hidden focus:border-[#2563EB]"
                  >
                    {academicYears.map((ay) => (
                      <option key={ay.id} value={ay.id}>
                        {ay.name} {ay.isActive ? "(Active)" : ""}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Destination AY */}
                <div>
                  <label className="block text-xs font-bold text-[#1E293B] mb-1">
                    Destination Academic Year <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={execDestAYId}
                    onChange={(e) => setExecDestAYId(e.target.value)}
                    className="w-full h-9 px-3 border border-[#E2E8F0] rounded-lg text-xs text-[#1E293B] bg-white focus:outline-hidden focus:border-[#2563EB]"
                  >
                    {academicYears.map((ay) => (
                      <option key={ay.id} value={ay.id}>
                        {ay.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Source Class */}
                <div>
                  <label className="block text-xs font-bold text-[#1E293B] mb-1">
                    Source Class (Current) <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={execSourceClassId}
                    onChange={(e) => setExecSourceClassId(e.target.value)}
                    className="w-full h-9 px-3 border border-[#E2E8F0] rounded-lg text-xs text-[#1E293B] bg-white focus:outline-hidden focus:border-[#2563EB]"
                  >
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name} (Sem {cls.semester})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Source Section */}
                <div>
                  <label className="block text-xs font-bold text-[#1E293B] mb-1">
                    Source Section <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={execSourceSectionId}
                    onChange={(e) => setExecSourceSectionId(e.target.value)}
                    className="w-full h-9 px-3 border border-[#E2E8F0] rounded-lg text-xs text-[#1E293B] bg-white focus:outline-hidden focus:border-[#2563EB]"
                  >
                    <option value="ALL">All Sections (Cohort Consolidated)</option>
                    {sections.map((sec) => (
                      <option key={sec.id} value={sec.id}>
                        {sec.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
                {/* Program / Course */}
                <div>
                  <label className="block text-xs font-bold text-[#1E293B] mb-1">
                    Program / Degree Course <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={execCourseId}
                    onChange={(e) => setExecCourseId(e.target.value)}
                    className="w-full h-9 px-3 border border-[#E2E8F0] rounded-lg text-xs text-[#1E293B] bg-white focus:outline-hidden focus:border-[#2563EB]"
                  >
                    {courses.map((crs) => (
                      <option key={crs.id} value={crs.id}>
                        {crs.name} ({crs.code})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Destination Class */}
                <div>
                  <label className="block text-xs font-bold text-[#1E293B] mb-1">
                    Destination Class (Promoted To) <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={execDestClassId}
                    onChange={(e) => setExecDestClassId(e.target.value)}
                    className="w-full h-9 px-3 border border-[#E2E8F0] rounded-lg text-xs text-[#1E293B] bg-white focus:outline-hidden focus:border-[#2563EB]"
                  >
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name} (Sem {cls.semester})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Destination Section */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-[#1E293B]">
                      Destination Section <span className="text-red-500">*</span>
                    </label>
                    {selectedDestSectionEntity && (
                      <span
                        className={`text-[10px] font-bold ${
                          destRemainingCapacity > 0 ? "text-[#16A34A]" : "text-[#DC2626]"
                        }`}
                      >
                        Cap: {selectedDestSectionEntity.currentEnrollment} /{" "}
                        {selectedDestSectionEntity.maxCapacity} ({destRemainingCapacity} seats left)
                      </span>
                    )}
                  </div>
                  <select
                    value={execDestSectionId}
                    onChange={(e) => setExecDestSectionId(e.target.value)}
                    className="w-full h-9 px-3 border border-[#E2E8F0] rounded-lg text-xs text-[#1E293B] bg-white focus:outline-hidden focus:border-[#2563EB]"
                  >
                    {sections.map((sec) => (
                      <option key={sec.id} value={sec.id}>
                        {sec.name} (Cap: {sec.currentEnrollment}/{sec.maxCapacity})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Custom Batch Title */}
                <div>
                  <label className="block text-xs font-bold text-[#1E293B] mb-1">
                    Batch Title (Optional)
                  </label>
                  <Input
                    placeholder="e.g. B.Tech CSE - 3rd to 4th Year Cohort Progression"
                    value={execBatchName}
                    onChange={(e) => setExecBatchName(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
              </div>

              {/* Policy Criteria Banner */}
              <div className="p-3.5 rounded-lg bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-between text-xs text-[#1E40AF]">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#2563EB]" />
                  <span>
                    Applicable Policy: <strong>{activePolicy.name}</strong> • Min CGPA:{" "}
                    <strong>{activePolicy.minCgpa.toFixed(1)}</strong> • Min Credits:{" "}
                    <strong>{activePolicy.minEarnedCredits}</strong> • Max Backlogs:{" "}
                    <strong>{activePolicy.maxAllowedBacklogs}</strong>
                  </span>
                </div>
                <button
                  onClick={() => setActiveTab("policies")}
                  className="text-xs font-bold underline hover:text-[#153B66]"
                >
                  Configure Rules
                </button>
              </div>
            </div>
          </Card>

          {/* Student Selection Grid */}
          <Card>
            <div className="p-4 border-b border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-[#1E293B]">Select Students for Progression</h3>
                <span className="text-xs text-[#64748B]">
                  {selectedStudentIdsForExec.length} of {wizardEvaluatedStudents.length} students selected for batch progression.
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAllEligible}
                  className="h-8 text-xs text-[#16A34A] border-[#16A34A] hover:bg-[#DCFCE7]"
                >
                  Select All Eligible
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedStudentIdsForExec([])}
                  className="h-8 text-xs"
                >
                  Clear Selection
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12 text-center">
                      <input
                        type="checkbox"
                        checked={
                          wizardEvaluatedStudents.length > 0 &&
                          selectedStudentIdsForExec.length === wizardEvaluatedStudents.length
                        }
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedStudentIdsForExec(wizardEvaluatedStudents.map((s) => s.studentId));
                          } else {
                            setSelectedStudentIdsForExec([]);
                          }
                        }}
                        className="rounded border-[#CBD5E1] text-[#2563EB]"
                      />
                    </TableHead>
                    <TableHead>Roll No & Name</TableHead>
                    <TableHead className="text-center">Credits</TableHead>
                    <TableHead className="text-center">SGPA</TableHead>
                    <TableHead className="text-center">CGPA</TableHead>
                    <TableHead>Eligibility Status</TableHead>
                    <TableHead>Failed Subjects / Arrears</TableHead>
                    <TableHead>Evaluation Outcome</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {wizardEvaluatedStudents.length === 0 ? (
                    <TableEmpty colSpan={8} message="No enrolled students found in source class/section." />
                  ) : (
                    wizardEvaluatedStudents.map((stu) => {
                      const isSelected = selectedStudentIdsForExec.includes(stu.studentId);
                      const isDetained = stu.status === "Detained";
                      return (
                        <TableRow
                          key={stu.studentId}
                          className={`hover:bg-[#F8FAFC] ${isSelected ? "bg-[#EFF6FF]/40" : ""}`}
                        >
                          <TableCell className="text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleStudentSelection(stu.studentId)}
                              className="rounded border-[#CBD5E1] text-[#2563EB]"
                            />
                          </TableCell>

                          <TableCell>
                            <div>
                              <strong className="text-xs font-bold text-[#1E293B] block">
                                {stu.studentName}
                              </strong>
                              <span className="text-[11px] text-[#64748B]">
                                {stu.rollNumber} • {stu.sectionName}
                              </span>
                            </div>
                          </TableCell>

                          <TableCell className="text-center font-bold text-xs text-[#1E293B]">
                            {stu.totalCreditsEarned} / {stu.totalCreditsRegistered}
                          </TableCell>

                          <TableCell className="text-center font-bold text-xs text-[#2563EB]">
                            {stu.sgpa > 0 ? stu.sgpa.toFixed(2) : "N/A"}
                          </TableCell>

                          <TableCell className="text-center font-bold text-xs text-[#153B66]">
                            {stu.cgpa > 0 ? stu.cgpa.toFixed(2) : "N/A"}
                          </TableCell>

                          <TableCell>
                            <Badge variant={ELIGIBILITY_STATUS_CONFIG[stu.status].variant} size="sm">
                              {stu.status}
                            </Badge>
                          </TableCell>

                          <TableCell>
                            {stu.failedSubjectCodes.length > 0 ? (
                              <span className="text-[11px] font-bold text-[#DC2626]">
                                {stu.failedSubjectCodes.join(", ")}
                              </span>
                            ) : (
                              <span className="text-[11px] text-[#16A34A] font-semibold">None</span>
                            )}
                          </TableCell>

                          <TableCell className="text-xs text-[#475569] max-w-xs">
                            <span>{stu.reason}</span>
                            {isDetained && (
                              <button
                                onClick={() => {
                                  setOverrideStudentId(stu.studentId);
                                  setOverrideReasonInput("");
                                  setOverrideError("");
                                }}
                                className="block mt-1 text-[10px] font-bold text-[#D97706] underline"
                              >
                                Authorize Override
                              </button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="p-4 border-t border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="text-xs text-[#64748B]">
                Selected for Progression: <strong>{selectedStudentIdsForExec.length}</strong> students.
              </div>

              <Button
                variant="primary"
                size="sm"
                onClick={handleCreateBatchFromWizard}
                leftIcon={<TrendingUp className="w-4 h-4" />}
              >
                Create Promotion Batch
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* =========================================================================
          TAB 4: DETENTION & ACADEMIC STANDING DESK
         ========================================================================= */}
      {activeTab === "detention" && (
        <div className="space-y-4">
          <Card>
            <div className="p-4 border-b border-[#E2E8F0] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#DC2626] flex items-center gap-2">
                  <UserX className="w-4 h-4 text-[#DC2626]" /> Detained & Academic Probation Roster
                </h3>
                <span className="text-xs text-[#64748B]">
                  Undergraduates who do not satisfy progression thresholds (credit deficit, backlog overflow, or CGPA minimum).
                </span>
              </div>
              <Badge variant="error" size="sm">
                {evaluatedStudents.filter((s) => s.status === "Detained").length} Detained Cases
              </Badge>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Roll No & Name</TableHead>
                    <TableHead>Cohort Class</TableHead>
                    <TableHead className="text-center">CGPA</TableHead>
                    <TableHead className="text-center">Earned Credits</TableHead>
                    <TableHead>Arrear Subjects</TableHead>
                    <TableHead className="max-w-xs">Detention Condition</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {evaluatedStudents.filter((s) => s.status === "Detained").length === 0 ? (
                    <TableEmpty colSpan={7} message="No detained students found. All cohorts satisfy progression standards." />
                  ) : (
                    evaluatedStudents
                      .filter((s) => s.status === "Detained")
                      .map((stu) => (
                        <TableRow key={stu.studentId} className="hover:bg-[#F8FAFC]">
                          <TableCell>
                            <div>
                              <strong className="text-xs font-bold text-[#1E293B] block">
                                {stu.studentName}
                              </strong>
                              <span className="text-[11px] text-[#64748B]">
                                {stu.rollNumber} • {stu.sectionName}
                              </span>
                            </div>
                          </TableCell>

                          <TableCell className="text-xs font-semibold text-[#1E293B]">
                            {stu.className}
                          </TableCell>

                          <TableCell className="text-center font-extrabold text-xs text-[#DC2626]">
                            {stu.cgpa.toFixed(2)}
                          </TableCell>

                          <TableCell className="text-center font-bold text-xs text-[#64748B]">
                            {stu.totalCreditsEarned} / {stu.totalCreditsRegistered}
                          </TableCell>

                          <TableCell>
                            <div className="flex items-center gap-1 flex-wrap">
                              {stu.failedSubjectCodes.map((code) => (
                                <span
                                  key={code}
                                  className="text-[10px] font-bold bg-[#FEE2E2] text-[#DC2626] border border-[#FECACA] px-1.5 py-0.2 rounded"
                                >
                                  {code}
                                </span>
                              ))}
                            </div>
                          </TableCell>

                          <TableCell className="text-xs text-[#DC2626] max-w-xs">
                            {stu.reason}
                          </TableCell>

                          <TableCell className="text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setOverrideStudentId(stu.studentId);
                                setOverrideReasonInput("");
                                setOverrideError("");
                              }}
                              className="h-7 text-xs px-2 border-[#D97706] text-[#D97706] hover:bg-[#FEF3C7]"
                            >
                              <ShieldAlert className="w-3.5 h-3.5 mr-1" /> Authorize Override
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>
      )}

      {/* =========================================================================
          TAB 5: BACKLOG CARRY-FORWARD MANAGEMENT
         ========================================================================= */}
      {activeTab === "backlogs" && (
        <div className="space-y-4">
          <Card>
            <div className="p-4 border-b border-[#E2E8F0]">
              <h3 className="text-sm font-bold text-[#1E293B]">Active Backlog Carry-Forward Register</h3>
              <span className="text-xs text-[#64748B]">
                Curriculum arrears carried forward into subsequent semesters. Linked to actual published result sheets.
              </span>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Roll No & Name</TableHead>
                    <TableHead>Current Placement</TableHead>
                    <TableHead>Pending Arrear Code</TableHead>
                    <TableHead className="text-center">Credits</TableHead>
                    <TableHead>Carry-Forward Standing</TableHead>
                    <TableHead>Remedial Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {evaluatedStudents.filter((s) => s.activeBacklogsCount > 0).length === 0 ? (
                    <TableEmpty colSpan={6} message="No active arrears or carry-forward backlogs detected." />
                  ) : (
                    evaluatedStudents
                      .filter((s) => s.activeBacklogsCount > 0)
                      .map((stu) => (
                        <TableRow key={stu.studentId} className="hover:bg-[#F8FAFC]">
                          <TableCell>
                            <div>
                              <strong className="text-xs font-bold text-[#1E293B] block">
                                {stu.studentName}
                              </strong>
                              <span className="text-[11px] text-[#64748B]">
                                {stu.rollNumber}
                              </span>
                            </div>
                          </TableCell>

                          <TableCell className="text-xs text-[#1E293B]">
                            {stu.className} ({stu.sectionName})
                          </TableCell>

                          <TableCell>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {stu.failedSubjectCodes.map((code) => (
                                <span
                                  key={code}
                                  className="text-xs font-black bg-[#FEE2E2] text-[#DC2626] border border-[#FECACA] px-2 py-0.5 rounded"
                                >
                                  {code}
                                </span>
                              ))}
                            </div>
                          </TableCell>

                          <TableCell className="text-center font-bold text-xs text-[#1E293B]">
                            4.0
                          </TableCell>

                          <TableCell>
                            <Badge variant="teal" size="sm">
                              Carried Forward (Sem {stu.currentSemester + 1})
                            </Badge>
                          </TableCell>

                          <TableCell className="text-xs text-[#64748B]">
                            Supplementary Exam Registration Required
                          </TableCell>
                        </TableRow>
                      ))
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>
      )}

      {/* =========================================================================
          TAB 6: SECTION CAPACITY & ALLOCATION
         ========================================================================= */}
      {activeTab === "reallocation" && (
        <div className="space-y-4">
          <Card>
            <div className="p-4 border-b border-[#E2E8F0]">
              <h3 className="text-sm font-bold text-[#1E293B]">Section Capacity & Occupancy Monitor</h3>
              <span className="text-xs text-[#64748B]">
                Live enrollment headcount vs. maximum room capacity to prevent overcrowding during progression.
              </span>
            </div>

            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {sections.map((sec) => {
                const occupancyRate = Math.round((sec.currentEnrollment / sec.maxCapacity) * 100);
                const isOverCapacity = sec.currentEnrollment >= sec.maxCapacity;
                const seatsLeft = sec.maxCapacity - sec.currentEnrollment;

                return (
                  <div
                    key={sec.id}
                    className={`p-4 rounded-xl border ${
                      isOverCapacity
                        ? "border-[#FECACA] bg-[#FEF2F2]"
                        : "border-[#E2E8F0] bg-[#F8FAFC]"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <strong className="text-sm font-extrabold text-[#1E293B]">
                        {sec.name}
                      </strong>
                      <Badge variant={isOverCapacity ? "error" : "success"} size="sm">
                        {isOverCapacity ? "At Full Capacity" : `${seatsLeft} Seats Open`}
                      </Badge>
                    </div>

                    <p className="text-[11px] text-[#64748B] mb-3">
                      Venue: {sec.roomNumber} • Mentor: {sec.classTeacherName}
                    </p>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#64748B]">Enrolled / Max:</span>
                        <strong className="font-bold text-[#1E293B]">
                          {sec.currentEnrollment} / {sec.maxCapacity}
                        </strong>
                      </div>
                      <div className="h-2.5 bg-[#E2E8F0] rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
                            occupancyRate >= 100
                              ? "bg-[#DC2626]"
                              : occupancyRate >= 80
                              ? "bg-[#D97706]"
                              : "bg-[#16A34A]"
                          }`}
                          style={{ width: `${Math.min(100, occupancyRate)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}

      {/* =========================================================================
          TAB 7: PROMOTION POLICY CONFIGURATION
         ========================================================================= */}
      {activeTab === "policies" && (
        <div className="space-y-4">
          <Card>
            <div className="p-5 border-b border-[#E2E8F0] flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#1E293B]">Promotion Policy Rules</h3>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Configure minimum credits, CGPA/SGPA thresholds, maximum backlogs, and detention criteria.
                </p>
              </div>

              <Button
                variant="primary"
                size="sm"
                onClick={handleSavePolicy}
                leftIcon={<Check className="w-4 h-4" />}
              >
                Save Policy
              </Button>
            </div>

            {policySaveSuccess && (
              <div className="m-5">
                <Alert variant="success" title="Success">
                  {policySaveSuccess}
                </Alert>
              </div>
            )}

            {policySaveError && (
              <div className="m-5">
                <Alert variant="error" title="Error">
                  {policySaveError}
                </Alert>
              </div>
            )}

            <div className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#1E293B] mb-1">
                    Policy Title
                  </label>
                  <Input
                    value={activePolicy.name}
                    onChange={(e) => setActivePolicy({ ...activePolicy, name: e.target.value })}
                    className="h-9 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1E293B] mb-1">
                    Minimum Cumulative CGPA (0.0 - 10.0)
                  </label>
                  <Input
                    type="number"
                    min={0}
                    max={10}
                    step={0.1}
                    value={activePolicy.minCgpa}
                    onChange={(e) =>
                      setActivePolicy({ ...activePolicy, minCgpa: Number(e.target.value) })
                    }
                    className="h-9 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1E293B] mb-1">
                    Minimum Earned Credits
                  </label>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={activePolicy.minEarnedCredits}
                    onChange={(e) =>
                      setActivePolicy({ ...activePolicy, minEarnedCredits: Number(e.target.value) })
                    }
                    className="h-9 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1E293B] mb-1">
                    Maximum Allowed Active Backlogs
                  </label>
                  <Input
                    type="number"
                    min={0}
                    max={10}
                    value={activePolicy.maxAllowedBacklogs}
                    onChange={(e) =>
                      setActivePolicy({
                        ...activePolicy,
                        maxAllowedBacklogs: Number(e.target.value),
                      })
                    }
                    className="h-9 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1E293B] mb-1">
                    Permit Backlog Promotion?
                  </label>
                  <select
                    value={activePolicy.allowBacklogPromotion ? "YES" : "NO"}
                    onChange={(e) =>
                      setActivePolicy({
                        ...activePolicy,
                        allowBacklogPromotion: e.target.value === "YES",
                      })
                    }
                    className="w-full h-9 px-3 border border-[#E2E8F0] rounded-lg text-xs text-[#1E293B] bg-white focus:outline-hidden focus:border-[#2563EB]"
                  >
                    <option value="YES">Yes - Allow Carry-Forward of Pending Subjects</option>
                    <option value="NO">No - Strict Zero-Backlog Clearance Required</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1E293B] mb-1">
                    Administrative Override Allowed?
                  </label>
                  <select
                    value={activePolicy.allowAdministrativeOverride ? "YES" : "NO"}
                    onChange={(e) =>
                      setActivePolicy({
                        ...activePolicy,
                        allowAdministrativeOverride: e.target.value === "YES",
                      })
                    }
                    className="w-full h-9 px-3 border border-[#E2E8F0] rounded-lg text-xs text-[#1E293B] bg-white focus:outline-hidden focus:border-[#2563EB]"
                  >
                    <option value="YES">Yes - Dean May Grant Overrides With Reason</option>
                    <option value="NO">No - System Enforced Strictly</option>
                  </select>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* =========================================================================
          TAB 8: PROMOTION HISTORY & AUDIT TRAIL
         ========================================================================= */}
      {activeTab === "history" && (
        <div className="space-y-4">
          <Card>
            <div className="p-4 border-b border-[#E2E8F0]">
              <h3 className="text-sm font-bold text-[#1E293B]">Historical Student Progression Records</h3>
              <span className="text-xs text-[#64748B]">
                Permanent institutional ledger of all executed student promotions across past terms.
              </span>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Promotion Date</TableHead>
                    <TableHead>Student Roll No & Name</TableHead>
                    <TableHead>Previous Placement</TableHead>
                    <TableHead>Promoted Placement</TableHead>
                    <TableHead className="text-center">SGPA / CGPA</TableHead>
                    <TableHead>Progression Decree</TableHead>
                    <TableHead>Authorized By</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {promotionHistory.length === 0 ? (
                    <TableEmpty colSpan={7} message="No historical promotion records logged." />
                  ) : (
                    promotionHistory.map((hist) => (
                      <TableRow key={hist.id} className="hover:bg-[#F8FAFC]">
                        <TableCell className="text-xs text-[#64748B]">
                          {new Date(hist.promotionDate).toLocaleDateString()}
                        </TableCell>

                        <TableCell>
                          <div>
                            <strong className="text-xs font-bold text-[#1E293B] block">
                              {hist.studentName}
                            </strong>
                            <span className="text-[11px] text-[#64748B]">{hist.rollNumber}</span>
                          </div>
                        </TableCell>

                        <TableCell className="text-xs text-[#64748B]">
                          {hist.previousClassName} ({hist.previousSectionName}) •{" "}
                          {hist.previousAcademicYearName}
                        </TableCell>

                        <TableCell className="text-xs font-bold text-[#2563EB]">
                          {hist.newClassName} ({hist.newSectionName}) • {hist.newAcademicYearName}
                        </TableCell>

                        <TableCell className="text-center font-bold text-xs text-[#1E293B]">
                          {hist.sgpaAtPromotion.toFixed(2)} / {hist.cgpaAtPromotion.toFixed(2)}
                        </TableCell>

                        <TableCell>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              hist.decision === "PROMOTED_REGULAR"
                                ? "bg-[#DCFCE7] text-[#16A34A]"
                                : hist.decision === "PROMOTED_WITH_BACKLOGS"
                                ? "bg-[#CCFBF1] text-[#0D9488]"
                                : "bg-[#FEF3C7] text-[#D97706]"
                            }`}
                          >
                            {hist.decision}
                          </span>
                        </TableCell>

                        <TableCell className="text-xs font-semibold text-[#153B66]">
                          {hist.authorizedBy}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>
      )}

      {/* =========================================================================
          MODAL 1: CONFIRM AND EXECUTE PROMOTION
         ========================================================================= */}
      {executingBatch && (
        <Modal
          isOpen={!!executingBatch}
          onClose={() => setExecutingBatch(null)}
          title="Confirm Execution of Promotion Batch"
          description="Official decree updating active student cohorts and locking academic progression."
          maxWidth="md"
        >
          <div className="space-y-4 py-2">
            <div className="p-3.5 rounded-xl bg-[#FEF3C7] border border-[#FDE68A] text-xs text-[#92400E] space-y-1">
              <strong className="block font-bold">Important Academic Progression Notice:</strong>
              <p>
                Executing this promotion decree will officially advance{" "}
                <strong>{executingBatch.studentRecords.length} students</strong> into{" "}
                <strong>{executingBatch.destinationClassName}</strong> (
                {executingBatch.destinationSectionName}) for Academic Year{" "}
                <strong>{executingBatch.destinationAcademicYearName}</strong>. Prior placements are archived into enrollment history.
              </p>
            </div>

            {executionError && (
              <Alert variant="error" title="Error">
                {executionError}
              </Alert>
            )}

            <div className="flex items-start gap-2.5 pt-2">
              <input
                type="checkbox"
                id="confirmExec"
                checked={executionConfirmed}
                onChange={(e) => setExecutionConfirmed(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-[#CBD5E1] text-[#16A34A] focus:ring-[#16A34A]"
              />
              <label htmlFor="confirmExec" className="text-xs text-[#1E293B] leading-snug">
                I confirm that this promotion cohort has been approved by the Dean of Academic Affairs and is authorized for active institutional execution.
              </label>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[#E2E8F0]">
              <Button variant="outline" size="sm" onClick={() => setExecutingBatch(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleConfirmExecutePromotion}
                className="bg-[#16A34A] hover:bg-[#15803D]"
                leftIcon={<TrendingUp className="w-4 h-4" />}
              >
                Execute Promotion
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* =========================================================================
          MODAL 2: AUTHORIZE ADMINISTRATIVE OVERRIDE
         ========================================================================= */}
      {overrideStudentId && (
        <Modal
          isOpen={!!overrideStudentId}
          onClose={() => setOverrideStudentId(null)}
          title="Authorize Administrative Promotion Override"
          description="Grant an authorized progression exception with immutable audit justification."
          maxWidth="md"
        >
          <div className="space-y-4 py-2">
            {overrideError && (
              <Alert variant="error" title="Error">
                {overrideError}
              </Alert>
            )}

            <div className="text-xs text-[#1E293B]">
              Student ID: <strong>{overrideStudentId}</strong>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1E293B] mb-1">
                Mandatory Written Justification <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                value={overrideReasonInput}
                onChange={(e) => setOverrideReasonInput(e.target.value)}
                placeholder="e.g. Academic Council authorized medical exception based on hospitalization certificates."
                className="w-full p-2.5 border border-[#E2E8F0] rounded-lg text-xs text-[#1E293B] focus:outline-hidden focus:border-[#2563EB]"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[#E2E8F0]">
              <Button variant="outline" size="sm" onClick={() => setOverrideStudentId(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSubmitOverride}
                className="bg-[#D97706] hover:bg-[#B45309]"
                leftIcon={<ShieldAlert className="w-4 h-4" />}
              >
                Grant Override
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* =========================================================================
          MODAL 3: SECTION REALLOCATION
         ========================================================================= */}
      {reallocStudentId && (
        <Modal
          isOpen={!!reallocStudentId}
          onClose={() => setReallocStudentId(null)}
          title="Reallocate Student Section"
          description="Transfer student to a balanced destination section."
          maxWidth="md"
        >
          <div className="space-y-4 py-2">
            {reallocError && (
              <Alert variant="error" title="Error">
                {reallocError}
              </Alert>
            )}

            <div>
              <label className="block text-xs font-bold text-[#1E293B] mb-1">
                Select Destination Section <span className="text-red-500">*</span>
              </label>
              <select
                value={reallocDestSectionId}
                onChange={(e) => setReallocDestSectionId(e.target.value)}
                className="w-full h-9 px-3 border border-[#E2E8F0] rounded-lg text-xs text-[#1E293B] bg-white focus:outline-hidden focus:border-[#2563EB]"
              >
                <option value="">-- Choose Section --</option>
                {sections.map((sec) => (
                  <option key={sec.id} value={sec.id}>
                    {sec.name} (Enrolled: {sec.currentEnrollment}/{sec.maxCapacity})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1E293B] mb-1">
                Reason for Reallocation
              </label>
              <Input
                placeholder="e.g. Elective choice alignment or lab capacity re-balancing"
                value={reallocReason}
                onChange={(e) => setReallocReason(e.target.value)}
                className="h-9 text-xs"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[#E2E8F0]">
              <Button variant="outline" size="sm" onClick={() => setReallocStudentId(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSubmitReallocation}
                leftIcon={<Layers className="w-4 h-4" />}
              >
                Confirm Reallocation
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default function PromotionsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-[#64748B]">
          <TrendingUp className="w-8 h-8 animate-bounce mx-auto text-[#2563EB] mb-2" />
          <p className="font-semibold text-sm">Loading Promotions & Academic Standing Console...</p>
        </div>
      }
    >
      <PromotionsContent />
    </Suspense>
  );
}
