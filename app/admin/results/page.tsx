"use client";

import React, { useState, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useInstitution } from "@/lib/store";
import {
  ResultBatchItem,
  ResultBatchStatus,
  GradingScaleConfig,
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
  GraduationCap,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Download,
  Printer,
  Search,
  Eye,
  Sliders,
  RotateCcw,
  BookOpen,
  Users,
  Award,
  ShieldCheck,
  TrendingUp,
  FileText,
  Check,
  Trash2,
  Send,
  Edit3,
} from "lucide-react";

type ActiveTab = "dashboard" | "processing" | "config" | "gradecards" | "reports" | "audit";

const BATCH_STATUS_CONFIG: Record<
  ResultBatchStatus,
  { label: string; variant: "neutral" | "warning" | "teal" | "success" }
> = {
  Draft: { label: "Draft", variant: "neutral" },
  "Under Review": { label: "Under Review", variant: "warning" },
  Approved: { label: "Approved", variant: "teal" },
  Published: { label: "Published", variant: "success" },
};

function ResultsManagementContent() {
  const searchParams = useSearchParams();
  const initialBatchId = searchParams.get("batchId") || "";

  const {
    profile,
    academicYears,
    courses,
    classes,
    sections,
    examinations,
    gradingConfig,
    updateGradingConfig,
    resultBatches,
    resultAudits,
    calculateSemesterResults,
    transitionBatchStatus,
    correctPublishedResult,
    deleteResultBatch,
    getResultMetrics,
  } = useInstitution();

  // Active Tab State
  const [activeTab, setActiveTab] = useState<ActiveTab>("dashboard");

  // Selection & Search States
  const [selectedBatchId, setSelectedBatchId] = useState<string>(
    initialBatchId || (resultBatches[0]?.id ?? "")
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [classFilter, setClassFilter] = useState<string>("ALL");

  // Calculation Workflow States
  const [calcAcademicYearId, setCalcAcademicYearId] = useState<string>(
    academicYears.find((a) => a.isActive)?.id || academicYears[0]?.id || ""
  );
  const [calcCourseId, setCalcCourseId] = useState<string>(courses[0]?.id || "");
  const [calcClassId, setCalcClassId] = useState<string>(classes[0]?.id || "");
  const [calcSectionId, setCalcSectionId] = useState<string>("sec-cse-3a");
  const [calcSemester, setCalcSemester] = useState<number>(5);
  const [calcExamId, setCalcExamId] = useState<string>(examinations[0]?.id || "");
  const [calcBatchName, setCalcBatchName] = useState<string>("");
  const [customIAWeight, setCustomIAWeight] = useState<number>(gradingConfig.iaWeightage);
  const [customExamWeight, setCustomExamWeight] = useState<number>(gradingConfig.semesterExamWeightage);

  // Status Modals
  const [publishModalBatch, setPublishModalBatch] = useState<ResultBatchItem | null>(null);
  const [publishConfirmed, setPublishConfirmed] = useState(false);
  const [publishError, setPublishError] = useState("");

  // Post-Publication Correction Modal
  const [correctionModalBatch, setCorrectionModalBatch] = useState<ResultBatchItem | null>(null);
  const [selectedStudentForCorrection, setSelectedStudentForCorrection] = useState<string>("");
  const [selectedSubjectForCorrection, setSelectedSubjectForCorrection] = useState<string>("");
  const [newScoreInput, setNewScoreInput] = useState<number>(0);
  const [correctionReason, setCorrectionReason] = useState<string>("");
  const [correctionError, setCorrectionError] = useState<string>("");
  const [correctionSuccess, setCorrectionSuccess] = useState<string>("");

  // Grade Card Selection
  const [gradeCardStudentId, setGradeCardStudentId] = useState<string>("");

  // Grade Scale Config Local State
  const [localGradingConfig, setLocalGradingConfig] = useState<GradingScaleConfig>(gradingConfig);
  const [configSuccessMessage, setConfigSuccessMessage] = useState("");
  const [configErrorMessage, setConfigErrorMessage] = useState("");

  // Banner Alerts
  const [actionAlert, setActionAlert] = useState<{ type: "success" | "error"; message: string } | null>(
    null
  );

  // Metrics
  const metrics = useMemo(() => getResultMetrics(), [getResultMetrics]);

  // Active Batch Object
  const currentBatch = useMemo(() => {
    return resultBatches.find((b) => b.id === selectedBatchId) || resultBatches[0];
  }, [resultBatches, selectedBatchId]);

  // Filtered Batches for Table
  const filteredBatches = useMemo(() => {
    return resultBatches.filter((b) => {
      const matchSearch =
        b.batchName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.className.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.courseName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = statusFilter === "ALL" || b.status === statusFilter;
      const matchClass = classFilter === "ALL" || b.classId === classFilter;
      return matchSearch && matchStatus && matchClass;
    });
  }, [resultBatches, searchTerm, statusFilter, classFilter]);

  // Selected Student for Grade Card
  const selectedStudentResult = useMemo(() => {
    if (!currentBatch || !currentBatch.studentResults) return null;
    if (gradeCardStudentId) {
      return currentBatch.studentResults.find((s) => s.studentId === gradeCardStudentId) || currentBatch.studentResults[0];
    }
    return currentBatch.studentResults[0] || null;
  }, [currentBatch, gradeCardStudentId]);

  // Execute Result Calculation
  const handleRunCalculation = () => {
    setActionAlert(null);
    const res = calculateSemesterResults({
      classId: calcClassId,
      sectionId: calcSectionId,
      academicYearId: calcAcademicYearId,
      semester: Number(calcSemester),
      examinationId: calcExamId,
      batchName: calcBatchName,
      iaWeightage: Number(customIAWeight),
      semesterExamWeightage: Number(customExamWeight),
    });

    if (res.success && res.batch) {
      setSelectedBatchId(res.batch.id);
      setActionAlert({
        type: "success",
        message: `${res.message} Draft batch created: "${res.batch.batchName}".`,
      });
      setActiveTab("processing");
    } else {
      setActionAlert({
        type: "error",
        message: res.message || "Failed to execute result calculation.",
      });
    }
  };

  // Status Transitions
  const handleTransitionStatus = (batch: ResultBatchItem, newStatus: ResultBatchStatus) => {
    if (newStatus === "Published") {
      setPublishModalBatch(batch);
      setPublishConfirmed(false);
      setPublishError("");
      return;
    }

    const res = transitionBatchStatus(batch.id, newStatus);
    if (res.success) {
      setActionAlert({ type: "success", message: res.message });
    } else {
      setActionAlert({ type: "error", message: res.message });
    }
  };

  // Confirm Official Publication
  const handleConfirmPublication = () => {
    if (!publishModalBatch) return;
    if (!publishConfirmed) {
      setPublishError("Please check the declaration box to authorize official publication.");
      return;
    }

    const res = transitionBatchStatus(
      publishModalBatch.id,
      "Published",
      "Official academic decree: Results published to student records and transcript vault."
    );

    if (res.success) {
      setActionAlert({
        type: "success",
        message: `Official Publication Complete! "${publishModalBatch.batchName}" is now officially published.`,
      });
      setPublishModalBatch(null);
    } else {
      setPublishError(res.message);
    }
  };

  // Open Post-Publication Correction Modal
  const handleOpenCorrection = (batch: ResultBatchItem) => {
    setCorrectionModalBatch(batch);
    const firstStudent = batch.studentResults[0];
    setSelectedStudentForCorrection(firstStudent?.studentId || "");
    const firstSubject = firstStudent?.subjectResults[0];
    setSelectedSubjectForCorrection(firstSubject?.subjectCode || "");
    setNewScoreInput(firstSubject?.totalWeightedScore || 0);
    setCorrectionReason("");
    setCorrectionError("");
    setCorrectionSuccess("");
  };

  // Submit Post-Publication Correction
  const handleSubmitCorrection = () => {
    if (!correctionModalBatch) return;
    setCorrectionError("");
    setCorrectionSuccess("");

    if (!correctionReason.trim() || correctionReason.trim().length < 5) {
      setCorrectionError("A formal administrative justification (minimum 5 characters) is mandatory.");
      return;
    }

    const res = correctPublishedResult({
      batchId: correctionModalBatch.id,
      studentId: selectedStudentForCorrection,
      subjectCode: selectedSubjectForCorrection,
      newTotalScore: Number(newScoreInput),
      reason: correctionReason.trim(),
    });

    if (res.success) {
      setCorrectionSuccess(res.message);
      setActionAlert({ type: "success", message: res.message });
      setTimeout(() => {
        setCorrectionModalBatch(null);
      }, 1200);
    } else {
      setCorrectionError(res.message);
    }
  };

  // Save Grading Config
  const handleSaveGradingConfig = () => {
    setConfigSuccessMessage("");
    setConfigErrorMessage("");

    const res = updateGradingConfig(localGradingConfig);
    if (res.success) {
      setConfigSuccessMessage(res.message);
      setActionAlert({ type: "success", message: res.message });
    } else {
      setConfigErrorMessage(res.message);
    }
  };

  // Export Results to CSV
  const handleExportCSV = (batch: ResultBatchItem) => {
    const subjectsList = batch.studentResults[0]?.subjectResults || [];
    const headers = [
      "Roll No",
      "Student Name",
      "Class / Section",
      ...subjectsList.flatMap((s) => [`${s.subjectCode} (IA)`, `${s.subjectCode} (Exam)`, `${s.subjectCode} (Total)`, `${s.subjectCode} (Grade)`]),
      "Credits Registered",
      "Credits Earned",
      "SGPA",
      "CGPA",
      "Classification",
      "Backlogs Count",
      "Backlog Subjects",
    ];

    const rows = batch.studentResults.map((s) => [
      s.rollNumber,
      `"${s.studentName}"`,
      `"${s.className} - ${s.sectionName}"`,
      ...s.subjectResults.flatMap((sr) => [
        sr.iaMarksObtained,
        sr.semesterExamMarksObtained,
        sr.totalWeightedScore,
        sr.letterGrade,
      ]),
      s.totalCreditsRegistered,
      s.totalCreditsEarned,
      s.sgpa,
      s.cgpa,
      `"${s.classification}"`,
      s.backlogSubjectsCount,
      `"${s.backlogSubjectCodes.join("; ")}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${batch.batchName.replace(/\s+/g, "_")}_Results.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print Grade Card Trigger
  const handlePrintGradeCard = () => {
    window.print();
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
              <Sparkles className="w-3.5 h-3.5" /> Phase 4C Assessment Engine
            </span>
            <span className="text-[#CBD5E1]">•</span>
            <span className="text-xs font-semibold text-[#64748B]">Results & Grade Cards</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#1E293B] tracking-tight">
            Result Processing & Grade Cards
          </h1>
          <p className="text-xs md:text-sm text-[#64748B] mt-1">
            Multi-component score aggregation, credit-weighted SGPA/CGPA evaluation, formal publication approval, and official transcript generation.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setActiveTab("config")}
            leftIcon={<Sliders className="w-4 h-4 text-[#2563EB]" />}
          >
            Grading Rules
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setActiveTab("processing")}
            leftIcon={<GraduationCap className="w-4 h-4" />}
          >
            Compute Results
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
              Total Batches
            </span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xl font-black text-[#1E293B]">{metrics.totalBatches}</span>
              <BookOpen className="w-4 h-4 text-[#153B66]/60" />
            </div>
            <span className="text-[10px] text-[#64748B] mt-1 block">
              {metrics.draftBatches} Draft • {metrics.underReviewBatches} Review
            </span>
          </div>
        </Card>

        <Card className="border-l-4 border-l-[#16A34A]">
          <div className="p-3.5">
            <span className="text-[10px] uppercase font-bold text-[#64748B] tracking-wider block">
              Published
            </span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xl font-black text-[#16A34A]">{metrics.publishedBatches}</span>
              <CheckCircle2 className="w-4 h-4 text-[#16A34A]/60" />
            </div>
            <span className="text-[10px] text-[#64748B] mt-1 block">Official decrees</span>
          </div>
        </Card>

        <Card className="border-l-4 border-l-[#2563EB]">
          <div className="p-3.5">
            <span className="text-[10px] uppercase font-bold text-[#64748B] tracking-wider block">
              Processed
            </span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xl font-black text-[#2563EB]">
                {metrics.totalStudentsProcessed}
              </span>
              <Users className="w-4 h-4 text-[#2563EB]/60" />
            </div>
            <span className="text-[10px] text-[#64748B] mt-1 block">Students evaluated</span>
          </div>
        </Card>

        <Card className="border-l-4 border-l-[#14B8A6]">
          <div className="p-3.5">
            <span className="text-[10px] uppercase font-bold text-[#64748B] tracking-wider block">
              Pass Rate
            </span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xl font-black text-[#14B8A6]">
                {metrics.overallPassPercentage}%
              </span>
              <TrendingUp className="w-4 h-4 text-[#14B8A6]/60" />
            </div>
            <span className="text-[10px] text-[#64748B] mt-1 block">Institutional aggregate</span>
          </div>
        </Card>

        <Card className="border-l-4 border-l-[#DC2626]">
          <div className="p-3.5">
            <span className="text-[10px] uppercase font-bold text-[#64748B] tracking-wider block">
              Backlogs
            </span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xl font-black text-[#DC2626]">{metrics.totalBacklogsActive}</span>
              <AlertTriangle className="w-4 h-4 text-[#DC2626]/60" />
            </div>
            <span className="text-[10px] text-[#64748B] mt-1 block">Arrears active</span>
          </div>
        </Card>

        <Card className="border-l-4 border-l-[#F59E0B]">
          <div className="p-3.5">
            <span className="text-[10px] uppercase font-bold text-[#64748B] tracking-wider block">
              Grading Scale
            </span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-lg font-black text-[#B45309]">10.0 CBCS</span>
              <Award className="w-4 h-4 text-[#F59E0B]/60" />
            </div>
            <span className="text-[10px] text-[#64748B] mt-1 block">
              IA {gradingConfig.iaWeightage}% / Sem {gradingConfig.semesterExamWeightage}%
            </span>
          </div>
        </Card>
      </div>

      {/* Main Tab Navigation */}
      <div className="flex items-center gap-1.5 border-b border-[#E2E8F0] pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab("dashboard")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all shrink-0 ${
            activeTab === "dashboard"
              ? "bg-[#153B66] text-white shadow-xs"
              : "text-[#64748B] hover:text-[#1E293B] hover:bg-[#F1F5F9]"
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Result Batches Directory</span>
          <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded font-semibold ml-1">
            {resultBatches.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("processing")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all shrink-0 ${
            activeTab === "processing"
              ? "bg-[#153B66] text-white shadow-xs"
              : "text-[#64748B] hover:text-[#1E293B] hover:bg-[#F1F5F9]"
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>Computation & Review Desk</span>
        </button>

        <button
          onClick={() => setActiveTab("gradecards")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all shrink-0 ${
            activeTab === "gradecards"
              ? "bg-[#153B66] text-white shadow-xs"
              : "text-[#64748B] hover:text-[#1E293B] hover:bg-[#F1F5F9]"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Student Grade Cards & Transcripts</span>
        </button>

        <button
          onClick={() => setActiveTab("reports")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all shrink-0 ${
            activeTab === "reports"
              ? "bg-[#153B66] text-white shadow-xs"
              : "text-[#64748B] hover:text-[#1E293B] hover:bg-[#F1F5F9]"
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Reports & Backlogs</span>
        </button>

        <button
          onClick={() => setActiveTab("config")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all shrink-0 ${
            activeTab === "config"
              ? "bg-[#153B66] text-white shadow-xs"
              : "text-[#64748B] hover:text-[#1E293B] hover:bg-[#F1F5F9]"
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Grading Scale & Weightages</span>
        </button>

        <button
          onClick={() => setActiveTab("audit")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all shrink-0 ${
            activeTab === "audit"
              ? "bg-[#153B66] text-white shadow-xs"
              : "text-[#64748B] hover:text-[#1E293B] hover:bg-[#F1F5F9]"
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Publication & Audit Trail</span>
          <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded font-semibold ml-1">
            {resultAudits.length}
          </span>
        </button>
      </div>

      {/* =========================================================================
          TAB 1: RESULT BATCHES DIRECTORY (DASHBOARD)
         ========================================================================= */}
      {activeTab === "dashboard" && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <Card>
            <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-center gap-3 flex-1">
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#94A3B8]" />
                  <Input
                    placeholder="Search by program, class or batch title..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 h-9 text-xs"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="h-9 px-3 border border-[#E2E8F0] rounded-lg text-xs text-[#1E293B] bg-white focus:outline-hidden focus:border-[#2563EB]"
                >
                  <option value="ALL">All Publication Statuses</option>
                  <option value="Draft">Draft</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Approved">Approved</option>
                  <option value="Published">Published</option>
                </select>

                <select
                  value={classFilter}
                  onChange={(e) => setClassFilter(e.target.value)}
                  className="h-9 px-3 border border-[#E2E8F0] rounded-lg text-xs text-[#1E293B] bg-white focus:outline-hidden focus:border-[#2563EB]"
                >
                  <option value="ALL">All Cohort Classes</option>
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("ALL");
                    setClassFilter("ALL");
                  }}
                  leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                >
                  Reset
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setActiveTab("processing")}
                  leftIcon={<GraduationCap className="w-4 h-4" />}
                >
                  New Result Cycle
                </Button>
              </div>
            </div>
          </Card>

          {/* Batches Table */}
          <Card>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Batch Name & Degree</TableHead>
                    <TableHead>Term & Cohort</TableHead>
                    <TableHead>Weightage Setup</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-center">Students</TableHead>
                    <TableHead className="text-center">Pass %</TableHead>
                    <TableHead className="text-center">Avg SGPA</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBatches.length === 0 ? (
                    <TableEmpty colSpan={8} message="No result batches matching selected filters." />
                  ) : (
                    filteredBatches.map((batch) => {
                      const statusConf = BATCH_STATUS_CONFIG[batch.status];
                      return (
                        <TableRow key={batch.id} className="hover:bg-[#F8FAFC]">
                          <TableCell>
                            <div>
                              <span className="font-bold text-xs text-[#1E293B] block">
                                {batch.batchName}
                              </span>
                              <span className="text-[11px] text-[#64748B]">
                                {batch.courseName} • Sem {batch.semester}
                              </span>
                            </div>
                          </TableCell>

                          <TableCell>
                            <div>
                              <span className="text-xs font-semibold text-[#1E293B] block">
                                {batch.academicYearName}
                              </span>
                              <span className="text-[11px] text-[#64748B]">
                                {batch.className} ({batch.sectionName})
                              </span>
                            </div>
                          </TableCell>

                          <TableCell>
                            <span className="text-[11px] font-medium text-[#1E293B] bg-[#F1F5F9] px-2 py-0.5 rounded border border-[#E2E8F0]">
                              IA {batch.iaWeightage}% : Exam {batch.semesterExamWeightage}%
                            </span>
                          </TableCell>

                          <TableCell>
                            <Badge variant={statusConf.variant} size="sm">
                              {statusConf.label}
                            </Badge>
                            {batch.status === "Published" && batch.publishedAt && (
                              <span className="text-[10px] text-[#16A34A] block mt-0.5">
                                On {new Date(batch.publishedAt).toLocaleDateString()}
                              </span>
                            )}
                          </TableCell>

                          <TableCell className="text-center">
                            <span className="font-bold text-xs text-[#1E293B]">
                              {batch.totalStudents}
                            </span>
                          </TableCell>

                          <TableCell className="text-center">
                            <span
                              className={`font-bold text-xs ${
                                batch.passPercentage >= 75
                                  ? "text-[#16A34A]"
                                  : batch.passPercentage >= 50
                                  ? "text-[#D97706]"
                                  : "text-[#DC2626]"
                              }`}
                            >
                              {batch.passPercentage}%
                            </span>
                          </TableCell>

                          <TableCell className="text-center">
                            <span className="font-bold text-xs text-[#2563EB]">
                              {batch.batchAverageSgpa.toFixed(2)}
                            </span>
                          </TableCell>

                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1.5 flex-wrap">
                              <Button
                                variant="outline"
                                size="sm"
                                title="View & Review Student Results"
                                onClick={() => {
                                  setSelectedBatchId(batch.id);
                                  setActiveTab("processing");
                                }}
                                className="h-7 text-xs px-2"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </Button>

                              <Button
                                variant="outline"
                                size="sm"
                                title="Generate Grade Cards"
                                onClick={() => {
                                  setSelectedBatchId(batch.id);
                                  setGradeCardStudentId(batch.studentResults[0]?.studentId || "");
                                  setActiveTab("gradecards");
                                }}
                                className="h-7 text-xs px-2 text-[#2563EB]"
                              >
                                <FileText className="w-3.5 h-3.5" />
                              </Button>

                              <Button
                                variant="outline"
                                size="sm"
                                title="Export Class CSV"
                                onClick={() => handleExportCSV(batch)}
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
                                  onClick={() => handleTransitionStatus(batch, "Published")}
                                  className="h-7 text-[11px] px-2 bg-[#16A34A] hover:bg-[#15803D]"
                                >
                                  Publish
                                </Button>
                              )}

                              {batch.status === "Published" && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleOpenCorrection(batch)}
                                  className="h-7 text-[11px] px-2 border-[#D97706] text-[#D97706] hover:bg-[#FEF3C7]"
                                >
                                  <Edit3 className="w-3 h-3 mr-1" /> Correction
                                </Button>
                              )}

                              {batch.status !== "Published" && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    if (confirm(`Are you sure you want to delete "${batch.batchName}"?`)) {
                                      deleteResultBatch(batch.id);
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
        </div>
      )}

      {/* =========================================================================
          TAB 2: COMPUTATION & REVIEW DESK
         ========================================================================= */}
      {activeTab === "processing" && (
        <div className="space-y-6">
          {/* Computation Engine Parameters Card */}
          <Card>
            <div className="p-5 border-b border-[#E2E8F0]">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-[#2563EB] uppercase tracking-wider">
                  Calculation Engine
                </span>
                <span className="text-[#CBD5E1]">•</span>
                <span className="text-xs text-[#64748B]">Multi-Source Mark Aggregation</span>
              </div>
              <h2 className="text-lg font-bold text-[#1E293B]">
                Execute Semester Result Computation
              </h2>
              <p className="text-xs text-[#64748B] mt-0.5">
                Automatically fetches locked IA marks sheets from Phase 4B and combines them with end-semester examination evaluations according to weighted grading rules.
              </p>
            </div>

            <div className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#1E293B] mb-1">
                    Academic Year <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={calcAcademicYearId}
                    onChange={(e) => setCalcAcademicYearId(e.target.value)}
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
                  <label className="block text-xs font-bold text-[#1E293B] mb-1">
                    Degree / Course <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={calcCourseId}
                    onChange={(e) => setCalcCourseId(e.target.value)}
                    className="w-full h-9 px-3 border border-[#E2E8F0] rounded-lg text-xs text-[#1E293B] bg-white focus:outline-hidden focus:border-[#2563EB]"
                  >
                    {courses.map((crs) => (
                      <option key={crs.id} value={crs.id}>
                        {crs.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1E293B] mb-1">
                    Class & Cohort <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={calcClassId}
                    onChange={(e) => setCalcClassId(e.target.value)}
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
                  <label className="block text-xs font-bold text-[#1E293B] mb-1">
                    Section Scope <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={calcSectionId}
                    onChange={(e) => setCalcSectionId(e.target.value)}
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

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
                <div>
                  <label className="block text-xs font-bold text-[#1E293B] mb-1">
                    Semester <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="number"
                    min={1}
                    max={10}
                    value={calcSemester}
                    onChange={(e) => setCalcSemester(Number(e.target.value))}
                    className="h-9 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1E293B] mb-1">
                    Associated Examination
                  </label>
                  <select
                    value={calcExamId}
                    onChange={(e) => setCalcExamId(e.target.value)}
                    className="w-full h-9 px-3 border border-[#E2E8F0] rounded-lg text-xs text-[#1E293B] bg-white focus:outline-hidden focus:border-[#2563EB]"
                  >
                    <option value="">-- No Direct Exam Link --</option>
                    {examinations.map((ex) => (
                      <option key={ex.id} value={ex.id}>
                        {ex.name} ({ex.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1E293B] mb-1">
                    IA Weightage %
                  </label>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={customIAWeight}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setCustomIAWeight(val);
                      setCustomExamWeight(100 - val);
                    }}
                    className="h-9 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1E293B] mb-1">
                    Semester Exam Weightage %
                  </label>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={customExamWeight}
                    readOnly
                    className="h-9 text-xs bg-[#F8FAFC]"
                  />
                </div>

                <div className="sm:col-span-2 lg:col-span-4">
                  <label className="block text-xs font-bold text-[#1E293B] mb-1">
                    Custom Batch Title (Optional)
                  </label>
                  <Input
                    placeholder="e.g. B.Tech CSE - 5th Semester End-Term Assessment & Examination Results"
                    value={calcBatchName}
                    onChange={(e) => setCalcBatchName(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-[#F1F5F9]">
                <div className="flex items-center gap-2 text-xs text-[#64748B]">
                  <ShieldCheck className="w-4 h-4 text-[#16A34A]" />
                  <span>
                    Grading System: <strong>{gradingConfig.name}</strong> (Pass Threshold:{" "}
                    {gradingConfig.minAggregatePassingPercentage}%)
                  </span>
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleRunCalculation}
                  leftIcon={<GraduationCap className="w-4 h-4" />}
                >
                  Run Result Processing
                </Button>
              </div>
            </div>
          </Card>

          {/* Active Batch Inspection & Review Details */}
          {currentBatch ? (
            <div className="space-y-4">
              {/* Batch Header Bar */}
              <Card>
                <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-[#153B66]">Batch Review:</span>
                      <h3 className="text-base font-extrabold text-[#1E293B]">
                        {currentBatch.batchName}
                      </h3>
                      <Badge variant={BATCH_STATUS_CONFIG[currentBatch.status].variant} size="sm">
                        {currentBatch.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-[#64748B]">
                      {currentBatch.courseName} • {currentBatch.className} ({currentBatch.sectionName}) •{" "}
                      {currentBatch.academicYearName} • Total Students: {currentBatch.totalStudents} • Pass:{" "}
                      {currentBatch.passedStudents} ({currentBatch.passPercentage}%) • Backlogs:{" "}
                      {currentBatch.backlogStudents}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleExportCSV(currentBatch)}
                      leftIcon={<Download className="w-3.5 h-3.5" />}
                    >
                      Export CSV
                    </Button>

                    {currentBatch.status === "Draft" && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleTransitionStatus(currentBatch, "Under Review")}
                        className="bg-[#D97706] hover:bg-[#B45309]"
                        leftIcon={<Send className="w-3.5 h-3.5" />}
                      >
                        Submit for Review
                      </Button>
                    )}

                    {currentBatch.status === "Under Review" && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleTransitionStatus(currentBatch, "Approved")}
                        className="bg-[#0D9488] hover:bg-[#0F766E]"
                        leftIcon={<Check className="w-3.5 h-3.5" />}
                      >
                        Approve Results
                      </Button>
                    )}

                    {currentBatch.status === "Approved" && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleTransitionStatus(currentBatch, "Published")}
                        className="bg-[#16A34A] hover:bg-[#15803D]"
                        leftIcon={<ShieldCheck className="w-3.5 h-3.5" />}
                      >
                        Publish Official Results
                      </Button>
                    )}

                    {currentBatch.status === "Published" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenCorrection(currentBatch)}
                        className="border-[#D97706] text-[#D97706] hover:bg-[#FEF3C7]"
                        leftIcon={<Edit3 className="w-3.5 h-3.5" />}
                      >
                        Authorized Correction
                      </Button>
                    )}
                  </div>
                </div>
              </Card>

              {/* Student Results Table */}
              <Card>
                <div className="p-4 border-b border-[#E2E8F0] flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-[#1E293B]">Student Performance Matrix</h4>
                    <span className="text-xs text-[#64748B]">
                      Detailed subject scores, letter grades, credit points, and SGPA/CGPA evaluation.
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-[#153B66] bg-[#EFF6FF] px-2.5 py-1 rounded border border-[#BFDBFE]">
                    Batch Avg SGPA: {currentBatch.batchAverageSgpa.toFixed(2)}
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Roll No & Name</TableHead>
                        {currentBatch.studentResults[0]?.subjectResults.map((subj) => (
                          <TableHead key={subj.subjectId} className="text-center min-w-[110px]">
                            <span className="block font-bold text-xs">{subj.subjectCode}</span>
                            <span className="text-[10px] text-[#64748B] block">
                              {subj.credits} Credits
                            </span>
                          </TableHead>
                        ))}
                        <TableHead className="text-center">Credits</TableHead>
                        <TableHead className="text-center">SGPA</TableHead>
                        <TableHead className="text-center">CGPA</TableHead>
                        <TableHead>Classification</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentBatch.studentResults.map((stu) => {
                        return (
                          <TableRow key={stu.studentId} className="hover:bg-[#F8FAFC]">
                            <TableCell>
                              <div>
                                <span className="font-bold text-xs text-[#1E293B] block">
                                  {stu.studentName}
                                </span>
                                <span className="text-[11px] text-[#64748B]">
                                  {stu.rollNumber} • {stu.studentUniqueId || stu.studentId}
                                </span>
                                {stu.isModifiedPostPublication && (
                                  <span className="text-[9px] bg-[#FEF3C7] text-[#D97706] px-1 py-0.2 rounded font-bold inline-block mt-0.5">
                                    Post-Pub Corrected
                                  </span>
                                )}
                              </div>
                            </TableCell>

                            {stu.subjectResults.map((sr) => (
                              <TableCell key={sr.subjectId} className="text-center">
                                <div className="space-y-0.5">
                                  <span
                                    className={`inline-block font-extrabold text-xs px-2 py-0.5 rounded ${
                                      sr.finalStatus === "Pass"
                                        ? "bg-[#DCFCE7] text-[#16A34A]"
                                        : sr.finalStatus === "Absent"
                                        ? "bg-[#FEE2E2] text-[#DC2626]"
                                        : "bg-[#FEE2E2] text-[#DC2626]"
                                    }`}
                                  >
                                    {sr.letterGrade} ({sr.gradePoint})
                                  </span>
                                  <span className="text-[10px] text-[#64748B] block">
                                    {sr.totalWeightedScore}%
                                  </span>
                                </div>
                              </TableCell>
                            ))}

                            <TableCell className="text-center">
                              <span className="font-bold text-xs text-[#1E293B]">
                                {stu.totalCreditsEarned} / {stu.totalCreditsRegistered}
                              </span>
                            </TableCell>

                            <TableCell className="text-center">
                              <span className="font-bold text-xs text-[#2563EB]">
                                {stu.sgpa.toFixed(2)}
                              </span>
                            </TableCell>

                            <TableCell className="text-center">
                              <span className="font-bold text-xs text-[#153B66]">
                                {stu.cgpa.toFixed(2)}
                              </span>
                            </TableCell>

                            <TableCell>
                              <span
                                className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                                  stu.isAllPassed
                                    ? "bg-[#DCFCE7] text-[#16A34A]"
                                    : "bg-[#FEE2E2] text-[#DC2626]"
                                }`}
                              >
                                {stu.classification}
                              </span>
                              {stu.hasBacklogs && (
                                <span className="text-[10px] text-[#DC2626] block mt-0.5 font-medium">
                                  Arrear: {stu.backlogSubjectCodes.join(", ")}
                                </span>
                              )}
                            </TableCell>

                            <TableCell className="text-right">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setGradeCardStudentId(stu.studentId);
                                  setActiveTab("gradecards");
                                }}
                                className="h-7 text-xs px-2 text-[#2563EB]"
                                title="View Grade Card"
                              >
                                <FileText className="w-3.5 h-3.5" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </Card>
            </div>
          ) : (
            <Card>
              <div className="p-8 text-center text-[#64748B]">
                <GraduationCap className="w-10 h-10 mx-auto text-[#94A3B8] mb-2" />
                <p className="font-medium text-sm">No result batch selected.</p>
                <p className="text-xs mt-1">Select an existing batch or run computation above.</p>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 3: STUDENT GRADE CARDS & TRANSCRIPTS
         ========================================================================= */}
      {activeTab === "gradecards" && (
        <div className="space-y-4">
          {/* Student Selector Toolbar */}
          <Card className="no-print">
            <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-center gap-3 flex-1">
                <div className="w-64">
                  <label className="block text-[11px] font-bold text-[#64748B] uppercase mb-1">
                    Select Batch
                  </label>
                  <select
                    value={selectedBatchId}
                    onChange={(e) => {
                      setSelectedBatchId(e.target.value);
                      const targetBatch = resultBatches.find((b) => b.id === e.target.value);
                      if (targetBatch && targetBatch.studentResults[0]) {
                        setGradeCardStudentId(targetBatch.studentResults[0].studentId);
                      }
                    }}
                    className="w-full h-9 px-3 border border-[#E2E8F0] rounded-lg text-xs text-[#1E293B] bg-white focus:outline-hidden focus:border-[#2563EB]"
                  >
                    {resultBatches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.batchName} ({b.status})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="w-64">
                  <label className="block text-[11px] font-bold text-[#64748B] uppercase mb-1">
                    Select Student
                  </label>
                  <select
                    value={selectedStudentResult?.studentId || ""}
                    onChange={(e) => setGradeCardStudentId(e.target.value)}
                    className="w-full h-9 px-3 border border-[#E2E8F0] rounded-lg text-xs text-[#1E293B] bg-white focus:outline-hidden focus:border-[#2563EB]"
                  >
                    {currentBatch?.studentResults.map((s) => (
                      <option key={s.studentId} value={s.studentId}>
                        {s.rollNumber} - {s.studentName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 md:pt-0">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handlePrintGradeCard}
                  leftIcon={<Printer className="w-4 h-4" />}
                >
                  Print Official Grade Card
                </Button>
              </div>
            </div>
          </Card>

          {/* Printable Official Student Grade Card */}
          {selectedStudentResult && currentBatch ? (
            <div className="print-container bg-white p-6 md:p-8 rounded-xl border border-[#CBD5E1] shadow-xs max-w-4xl mx-auto space-y-6">
              {/* Institution Official Header */}
              <div className="border-b-2 border-[#153B66] pb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#153B66] text-white flex items-center justify-center font-black text-xl shadow-xs">
                    SST
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-[#153B66] tracking-tight uppercase">
                      {profile.name}
                    </h2>
                    <p className="text-xs text-[#475569] font-medium">
                      {profile.affiliation} • {profile.accreditation}
                    </p>
                    <p className="text-[11px] text-[#64748B]">
                      {profile.addressLine1}, {profile.city}, {profile.state} - {profile.postalCode}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="inline-block text-[11px] uppercase tracking-wider font-extrabold bg-[#153B66] text-white px-2.5 py-1 rounded">
                    Official Grade Card
                  </span>
                  <span className="text-[11px] text-[#64748B] block mt-1">
                    Academic Year {currentBatch.academicYearName}
                  </span>
                </div>
              </div>

              {/* Student Bio Profile Metadata */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-xs">
                <div>
                  <span className="text-[10px] font-bold text-[#64748B] uppercase block">
                    Student Name
                  </span>
                  <strong className="text-sm font-extrabold text-[#1E293B]">
                    {selectedStudentResult.studentName}
                  </strong>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#64748B] uppercase block">
                    Roll Number
                  </span>
                  <strong className="text-sm font-extrabold text-[#2563EB]">
                    {selectedStudentResult.rollNumber}
                  </strong>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#64748B] uppercase block">
                    Registration No
                  </span>
                  <strong className="text-[#1E293B] font-semibold">
                    {selectedStudentResult.studentUniqueId || selectedStudentResult.studentId}
                  </strong>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#64748B] uppercase block">
                    Program / Degree
                  </span>
                  <strong className="text-[#1E293B] font-semibold">
                    {currentBatch.courseName}
                  </strong>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#64748B] uppercase block">
                    Cohort Class
                  </span>
                  <span className="text-[#1E293B] font-semibold">
                    {selectedStudentResult.className}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#64748B] uppercase block">
                    Semester & Section
                  </span>
                  <span className="text-[#1E293B] font-semibold">
                    Semester {currentBatch.semester} ({selectedStudentResult.sectionName})
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#64748B] uppercase block">
                    Grading System
                  </span>
                  <span className="text-[#1E293B] font-semibold">10-Point CBCS Scale</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#64748B] uppercase block">
                    Publication Status
                  </span>
                  <Badge variant={BATCH_STATUS_CONFIG[currentBatch.status].variant} size="sm">
                    {currentBatch.status}
                  </Badge>
                </div>
              </div>

              {/* Subject Breakdown Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs border border-[#CBD5E1]">
                  <thead className="bg-[#153B66] text-white">
                    <tr>
                      <th className="p-2.5 text-left font-bold">Subject Code & Name</th>
                      <th className="p-2.5 text-center font-bold">Credits</th>
                      <th className="p-2.5 text-center font-bold">
                        IA ({currentBatch.iaWeightage}%)
                      </th>
                      <th className="p-2.5 text-center font-bold">
                        Exam ({currentBatch.semesterExamWeightage}%)
                      </th>
                      <th className="p-2.5 text-center font-bold">Total (100)</th>
                      <th className="p-2.5 text-center font-bold">Letter Grade</th>
                      <th className="p-2.5 text-center font-bold">Grade Point</th>
                      <th className="p-2.5 text-center font-bold">Credit Points</th>
                      <th className="p-2.5 text-center font-bold">Result</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0]">
                    {selectedStudentResult.subjectResults.map((subj) => (
                      <tr key={subj.subjectId} className="hover:bg-[#F8FAFC]">
                        <td className="p-2.5">
                          <strong className="text-[#1E293B] font-bold">{subj.subjectCode}</strong>:{" "}
                          <span className="text-[#475569]">{subj.subjectName}</span>
                        </td>
                        <td className="p-2.5 text-center font-semibold">{subj.credits}</td>
                        <td className="p-2.5 text-center">
                          {subj.iaMarksObtained} / {subj.iaMaxMarks}
                        </td>
                        <td className="p-2.5 text-center">
                          {subj.semesterExamMarksObtained} / {subj.semesterExamMaxMarks}
                        </td>
                        <td className="p-2.5 text-center font-bold text-[#1E293B]">
                          {subj.totalWeightedScore}
                        </td>
                        <td className="p-2.5 text-center font-extrabold text-[#153B66]">
                          {subj.letterGrade}
                        </td>
                        <td className="p-2.5 text-center font-bold">{subj.gradePoint}</td>
                        <td className="p-2.5 text-center font-bold text-[#2563EB]">
                          {subj.creditPoints}
                        </td>
                        <td className="p-2.5 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              subj.finalStatus === "Pass"
                                ? "bg-[#DCFCE7] text-[#16A34A]"
                                : "bg-[#FEE2E2] text-[#DC2626]"
                            }`}
                          >
                            {subj.finalStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-[#F8FAFC] font-bold text-xs border-t-2 border-[#153B66]">
                    <tr>
                      <td className="p-2.5 text-left font-black text-[#153B66]">
                        Semester Aggregate
                      </td>
                      <td className="p-2.5 text-center font-black">
                        {selectedStudentResult.totalCreditsRegistered}
                      </td>
                      <td colSpan={5} className="p-2.5 text-right font-black text-[#153B66]">
                        Total Credit Points Earned:
                      </td>
                      <td className="p-2.5 text-center font-black text-[#2563EB]">
                        {selectedStudentResult.totalCreditPoints}
                      </td>
                      <td className="p-2.5 text-center font-black text-[#16A34A]">
                        {selectedStudentResult.isAllPassed ? "PASSED" : "BACKLOG"}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Performance Summary Banner */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-gradient-to-r from-[#153B66] to-[#1E4D82] text-white">
                <div>
                  <span className="text-[10px] text-[#93C5FD] uppercase font-bold tracking-wider block">
                    Credits Earned
                  </span>
                  <span className="text-xl font-black">
                    {selectedStudentResult.totalCreditsEarned} /{" "}
                    {selectedStudentResult.totalCreditsRegistered}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#93C5FD] uppercase font-bold tracking-wider block">
                    Semester SGPA
                  </span>
                  <span className="text-2xl font-black text-[#FDE047]">
                    {selectedStudentResult.sgpa.toFixed(2)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#93C5FD] uppercase font-bold tracking-wider block">
                    Cumulative CGPA
                  </span>
                  <span className="text-2xl font-black text-[#67E8F9]">
                    {selectedStudentResult.cgpa.toFixed(2)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#93C5FD] uppercase font-bold tracking-wider block">
                    Classification
                  </span>
                  <span className="text-xs font-extrabold text-white block mt-1">
                    {selectedStudentResult.classification}
                  </span>
                </div>
              </div>

              {/* Signatures & Controller Seal Block */}
              <div className="pt-8 border-t border-[#CBD5E1] grid grid-cols-3 gap-6 text-center text-xs">
                <div>
                  <div className="h-10 border-b border-dashed border-[#94A3B8] mb-1"></div>
                  <span className="font-bold text-[#1E293B] block">Prepared & Tabulated By</span>
                  <span className="text-[10px] text-[#64748B]">Examination Section</span>
                </div>

                <div>
                  <div className="h-10 border-b border-dashed border-[#94A3B8] mb-1"></div>
                  <span className="font-bold text-[#1E293B] block">Dean of Academic Affairs</span>
                  <span className="text-[10px] text-[#64748B]">SST Academic Council</span>
                </div>

                <div>
                  <div className="h-10 border-b border-dashed border-[#94A3B8] mb-1"></div>
                  <span className="font-bold text-[#1E293B] block">
                    Controller of Examinations
                  </span>
                  <span className="text-[10px] text-[#64748B]">Institutional Seal</span>
                </div>
              </div>

              {/* Verification & Security Notice */}
              <div className="text-[10px] text-[#94A3B8] text-center pt-2">
                This document is a certified transcript generated by SST ERP. Any alteration or unauthorized reproduction renders this document invalid. Date of Issue: {new Date().toLocaleDateString()}.
              </div>
            </div>
          ) : (
            <Card>
              <div className="p-8 text-center text-[#64748B]">
                <FileText className="w-10 h-10 mx-auto text-[#94A3B8] mb-2" />
                <p className="font-medium text-sm">No student selected for grade card generation.</p>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 4: REPORTS & ANALYTICS
         ========================================================================= */}
      {activeTab === "reports" && currentBatch && (
        <div className="space-y-6">
          {/* Grade Distribution Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <div className="p-4 border-b border-[#E2E8F0]">
                <h3 className="text-sm font-bold text-[#1E293B]">
                  Grade Distribution: {currentBatch.batchName}
                </h3>
                <span className="text-xs text-[#64748B]">
                  Distribution of awarded letter grades across all enrolled subjects.
                </span>
              </div>
              <div className="p-4 space-y-2.5">
                {gradingConfig.grades.map((g) => {
                  let count = 0;
                  currentBatch.studentResults.forEach((stu) => {
                    stu.subjectResults.forEach((sr) => {
                      if (sr.letterGrade === g.grade) count += 1;
                    });
                  });
                  const totalEvaluated = currentBatch.studentResults.reduce(
                    (acc, s) => acc + s.subjectResults.length,
                    0
                  );
                  const pct = totalEvaluated > 0 ? Math.round((count / totalEvaluated) * 100) : 0;

                  return (
                    <div key={g.grade} className="flex items-center gap-3 text-xs">
                      <span className="w-8 font-extrabold text-[#153B66]">{g.grade}</span>
                      <div className="flex-1 h-3.5 bg-[#F1F5F9] rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
                            g.isPassing
                              ? g.gradePoint >= 9
                                ? "bg-[#16A34A]"
                                : g.gradePoint >= 7
                                ? "bg-[#2563EB]"
                                : "bg-[#14B8A6]"
                              : "bg-[#DC2626]"
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="w-16 text-right font-semibold text-[#1E293B]">
                        {count} ({pct}%)
                      </span>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Subject-Wise Performance Roster */}
            <Card>
              <div className="p-4 border-b border-[#E2E8F0]">
                <h3 className="text-sm font-bold text-[#1E293B]">Subject-Wise Pass Ratios</h3>
                <span className="text-xs text-[#64748B]">
                  Evaluation results and pass rates for each curriculum subject.
                </span>
              </div>
              <div className="p-4 space-y-3">
                {currentBatch.studentResults[0]?.subjectResults.map((sr) => {
                  let passCount = 0;
                  let totalCount = 0;
                  let scoreSum = 0;

                  currentBatch.studentResults.forEach((stu) => {
                    const match = stu.subjectResults.find((s) => s.subjectId === sr.subjectId);
                    if (match) {
                      totalCount += 1;
                      scoreSum += match.totalWeightedScore;
                      if (match.finalStatus === "Pass") passCount += 1;
                    }
                  });

                  const passRate = totalCount > 0 ? Math.round((passCount / totalCount) * 100) : 0;
                  const avgScore = totalCount > 0 ? Math.round((scoreSum / totalCount) * 10) / 10 : 0;

                  return (
                    <div
                      key={sr.subjectId}
                      className="p-3 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-between"
                    >
                      <div>
                        <strong className="text-xs font-bold text-[#1E293B] block">
                          {sr.subjectCode}: {sr.subjectName}
                        </strong>
                        <span className="text-[11px] text-[#64748B]">
                          Credits: {sr.credits} • Avg Score: {avgScore}%
                        </span>
                      </div>
                      <div className="text-right">
                        <span
                          className={`font-black text-sm block ${
                            passRate >= 80
                              ? "text-[#16A34A]"
                              : passRate >= 60
                              ? "text-[#D97706]"
                              : "text-[#DC2626]"
                          }`}
                        >
                          {passRate}% Pass
                        </span>
                        <span className="text-[10px] text-[#64748B]">
                          {passCount} / {totalCount} Students
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Dedicated Backlog Roster */}
          <Card>
            <div className="p-4 border-b border-[#E2E8F0] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#DC2626] flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-[#DC2626]" /> Active Arrear & Backlog Roster
                </h3>
                <span className="text-xs text-[#64748B]">
                  Students needing re-evaluation or supplementary examination registration.
                </span>
              </div>
              <Badge variant="error" size="sm">
                {currentBatch.studentResults.filter((s) => s.hasBacklogs).length} Backlog Cases
              </Badge>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Roll No</TableHead>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Failed Subject(s)</TableHead>
                    <TableHead className="text-center">Credits Earned / Total</TableHead>
                    <TableHead className="text-center">Current SGPA</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentBatch.studentResults.filter((s) => s.hasBacklogs).length === 0 ? (
                    <TableEmpty colSpan={6} message="No backlog cases recorded in this batch! 100% pass rate achieved." />
                  ) : (
                    currentBatch.studentResults
                      .filter((s) => s.hasBacklogs)
                      .map((stu) => (
                        <TableRow key={stu.studentId} className="hover:bg-[#F8FAFC]">
                          <TableCell className="font-bold text-xs text-[#1E293B]">
                            {stu.rollNumber}
                          </TableCell>
                          <TableCell className="font-semibold text-xs text-[#1E293B]">
                            {stu.studentName}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {stu.backlogSubjectCodes.map((code) => (
                                <span
                                  key={code}
                                  className="text-[11px] font-bold bg-[#FEE2E2] text-[#DC2626] border border-[#FECACA] px-2 py-0.5 rounded"
                                >
                                  {code}
                                </span>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell className="text-center font-bold text-xs text-[#64748B]">
                            {stu.totalCreditsEarned} / {stu.totalCreditsRegistered}
                          </TableCell>
                          <TableCell className="text-center font-extrabold text-xs text-[#DC2626]">
                            {stu.sgpa.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setGradeCardStudentId(stu.studentId);
                                setActiveTab("gradecards");
                              }}
                              className="h-7 text-xs px-2 text-[#2563EB]"
                            >
                              Inspect Grade Card
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
          TAB 5: GRADING SCALE & WEIGHTAGES CONFIG
         ========================================================================= */}
      {activeTab === "config" && (
        <div className="space-y-6">
          <Card>
            <div className="p-5 border-b border-[#E2E8F0] flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#1E293B]">
                  Institution Grading Scheme & Weightage Rules
                </h3>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Configure universal grading boundaries, grade points, passing thresholds, and IA vs. Semester Exam weightages.
                </p>
              </div>

              <Button
                variant="primary"
                size="sm"
                onClick={handleSaveGradingConfig}
                leftIcon={<Check className="w-4 h-4" />}
              >
                Save Grading System
              </Button>
            </div>

            {configSuccessMessage && (
              <div className="m-5">
                <Alert variant="success" title="Settings Saved">
                  {configSuccessMessage}
                </Alert>
              </div>
            )}

            {configErrorMessage && (
              <div className="m-5">
                <Alert variant="error" title="Configuration Inconsistency">
                  {configErrorMessage}
                </Alert>
              </div>
            )}

            <div className="p-5 space-y-5">
              {/* Weightage Balancer Section */}
              <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#153B66] uppercase tracking-wider">
                    Assessment Weightage Distribution
                  </span>
                  <span
                    className={`text-xs font-extrabold px-2.5 py-0.5 rounded ${
                      Number(localGradingConfig.iaWeightage) + Number(localGradingConfig.semesterExamWeightage) === 100
                        ? "bg-[#DCFCE7] text-[#16A34A]"
                        : "bg-[#FEE2E2] text-[#DC2626]"
                    }`}
                  >
                    Sum: {Number(localGradingConfig.iaWeightage) + Number(localGradingConfig.semesterExamWeightage)}% / 100%
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#1E293B] mb-1">
                      Continuous Internal Assessment (IA) %
                    </label>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={localGradingConfig.iaWeightage}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setLocalGradingConfig({
                          ...localGradingConfig,
                          iaWeightage: val,
                          semesterExamWeightage: 100 - val,
                        });
                      }}
                      className="h-9 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1E293B] mb-1">
                      Semester End-Term Examination %
                    </label>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={localGradingConfig.semesterExamWeightage}
                      readOnly
                      className="h-9 text-xs bg-[#F1F5F9]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1E293B] mb-1">
                      Minimum Passing Score %
                    </label>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={localGradingConfig.minAggregatePassingPercentage}
                      onChange={(e) =>
                        setLocalGradingConfig({
                          ...localGradingConfig,
                          minAggregatePassingPercentage: Number(e.target.value),
                        })
                      }
                      className="h-9 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Letter Grades & Boundaries Table */}
              <div>
                <h4 className="text-xs font-bold text-[#1E293B] uppercase tracking-wider mb-2">
                  Grading Scale Scale Bands
                </h4>
                <div className="overflow-x-auto border border-[#E2E8F0] rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Letter Grade</TableHead>
                        <TableHead>Grade Point (0-10)</TableHead>
                        <TableHead>Min %</TableHead>
                        <TableHead>Max %</TableHead>
                        <TableHead>Pass / Fail Status</TableHead>
                        <TableHead>Description</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {localGradingConfig.grades.map((gradeItem, idx) => (
                        <TableRow key={gradeItem.grade}>
                          <TableCell className="font-bold text-xs text-[#153B66]">
                            {gradeItem.grade}
                          </TableCell>

                          <TableCell>
                            <Input
                              type="number"
                              min={0}
                              max={10}
                              step={1}
                              value={gradeItem.gradePoint}
                              onChange={(e) => {
                                const newGrades = [...localGradingConfig.grades];
                                newGrades[idx] = { ...gradeItem, gradePoint: Number(e.target.value) };
                                setLocalGradingConfig({ ...localGradingConfig, grades: newGrades });
                              }}
                              className="h-8 w-20 text-xs"
                            />
                          </TableCell>

                          <TableCell>
                            <Input
                              type="number"
                              min={0}
                              max={100}
                              value={gradeItem.minPercentage}
                              onChange={(e) => {
                                const newGrades = [...localGradingConfig.grades];
                                newGrades[idx] = { ...gradeItem, minPercentage: Number(e.target.value) };
                                setLocalGradingConfig({ ...localGradingConfig, grades: newGrades });
                              }}
                              className="h-8 w-20 text-xs"
                            />
                          </TableCell>

                          <TableCell>
                            <Input
                              type="number"
                              min={0}
                              max={100}
                              value={gradeItem.maxPercentage}
                              onChange={(e) => {
                                const newGrades = [...localGradingConfig.grades];
                                newGrades[idx] = { ...gradeItem, maxPercentage: Number(e.target.value) };
                                setLocalGradingConfig({ ...localGradingConfig, grades: newGrades });
                              }}
                              className="h-8 w-20 text-xs"
                            />
                          </TableCell>

                          <TableCell>
                            <Badge
                              variant={gradeItem.isPassing ? "success" : "error"}
                              size="sm"
                            >
                              {gradeItem.isPassing ? "Pass" : "Fail / Backlog"}
                            </Badge>
                          </TableCell>

                          <TableCell>
                            <Input
                              value={gradeItem.description}
                              onChange={(e) => {
                                const newGrades = [...localGradingConfig.grades];
                                newGrades[idx] = { ...gradeItem, description: e.target.value };
                                setLocalGradingConfig({ ...localGradingConfig, grades: newGrades });
                              }}
                              className="h-8 text-xs"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* =========================================================================
          TAB 6: PUBLICATION & AUDIT TRAIL
         ========================================================================= */}
      {activeTab === "audit" && (
        <div className="space-y-4">
          <Card>
            <div className="p-4 border-b border-[#E2E8F0]">
              <h3 className="text-sm font-bold text-[#1E293B]">
                Publication & Post-Publication Correction Audit Log
              </h3>
              <span className="text-xs text-[#64748B]">
                Immutable historical record of every batch compilation, state transition, approval decree, and authorized score adjustment.
              </span>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Batch Context</TableHead>
                    <TableHead>Event Action</TableHead>
                    <TableHead>Target Entity</TableHead>
                    <TableHead>Change Detail / Reason</TableHead>
                    <TableHead>Operator</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {resultAudits.length === 0 ? (
                    <TableEmpty colSpan={6} message="No audit records logged yet." />
                  ) : (
                    resultAudits.map((audit) => (
                      <TableRow key={audit.id} className="hover:bg-[#F8FAFC]">
                        <TableCell className="text-xs text-[#64748B]">
                          {new Date(audit.timestamp).toLocaleString()}
                        </TableCell>

                        <TableCell>
                          <strong className="text-xs font-bold text-[#1E293B]">
                            {audit.batchName}
                          </strong>
                        </TableCell>

                        <TableCell>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              audit.action === "BATCH_PUBLISHED"
                                ? "bg-[#DCFCE7] text-[#16A34A]"
                                : audit.action === "BATCH_APPROVED"
                                ? "bg-[#CCFBF1] text-[#0D9488]"
                                : audit.action === "POST_PUBLICATION_CORRECTION"
                                ? "bg-[#FEF3C7] text-[#D97706]"
                                : "bg-[#F1F5F9] text-[#64748B]"
                            }`}
                          >
                            {audit.action}
                          </span>
                        </TableCell>

                        <TableCell className="text-xs text-[#1E293B]">
                          {audit.studentName ? (
                            <div>
                              <span>{audit.studentName}</span>
                              {audit.subjectCode && (
                                <span className="text-[10px] text-[#2563EB] block">
                                  Subject: {audit.subjectCode}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-[#94A3B8]">Batch Level</span>
                          )}
                        </TableCell>

                        <TableCell className="text-xs text-[#475569] max-w-sm">
                          <span>{audit.reason}</span>
                          {audit.previousValue && audit.newValue && (
                            <span className="text-[10px] text-[#153B66] font-semibold block mt-0.5">
                              {audit.previousValue} → {audit.newValue}
                            </span>
                          )}
                        </TableCell>

                        <TableCell className="text-xs font-semibold text-[#153B66]">
                          {audit.performedBy}
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
          MODAL 1: PUBLISH RESULTS CONFIRMATION
         ========================================================================= */}
      {publishModalBatch && (
        <Modal
          isOpen={!!publishModalBatch}
          onClose={() => setPublishModalBatch(null)}
          title="Confirm Official Result Publication"
          description="Formal publication seals semester marks and makes grade cards visible across institutional transcripts."
          maxWidth="md"
        >
          <div className="space-y-4 py-2">
            <div className="p-4 rounded-xl bg-[#FEF3C7] border border-[#FDE68A] text-xs text-[#92400E] space-y-1">
              <strong className="block font-bold">Important Administrative Notice:</strong>
              <p>
                Once published, result sheets <strong>cannot be silently modified or deleted</strong>. Subsequent alterations require an Authorized Correction Decree with a documented justification.
              </p>
            </div>

            <div className="text-xs text-[#1E293B] space-y-1 p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
              <p>
                <strong>Batch:</strong> {publishModalBatch.batchName}
              </p>
              <p>
                <strong>Cohort:</strong> {publishModalBatch.className} ({publishModalBatch.sectionName})
              </p>
              <p>
                <strong>Total Students:</strong> {publishModalBatch.totalStudents} (Pass Rate:{" "}
                {publishModalBatch.passPercentage}%)
              </p>
            </div>

            {publishError && (
              <Alert variant="error" title="Validation Error">
                {publishError}
              </Alert>
            )}

            <div className="flex items-start gap-2.5 pt-2">
              <input
                type="checkbox"
                id="confirmPublish"
                checked={publishConfirmed}
                onChange={(e) => setPublishConfirmed(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-[#CBD5E1] text-[#16A34A] focus:ring-[#16A34A]"
              />
              <label htmlFor="confirmPublish" className="text-xs text-[#1E293B] leading-snug">
                I confirm that all continuous internal assessment scores and end-semester evaluations have been verified by departmental faculties and authorized for official publication.
              </label>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[#E2E8F0]">
              <Button variant="outline" size="sm" onClick={() => setPublishModalBatch(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleConfirmPublication}
                className="bg-[#16A34A] hover:bg-[#15803D]"
                leftIcon={<ShieldCheck className="w-4 h-4" />}
              >
                Publish Results
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* =========================================================================
          MODAL 2: AUTHORIZED POST-PUBLICATION CORRECTION
         ========================================================================= */}
      {correctionModalBatch && (
        <Modal
          isOpen={!!correctionModalBatch}
          onClose={() => setCorrectionModalBatch(null)}
          title="Authorized Post-Publication Correction"
          description="Legitimate adjustment of finalized student results with immutable audit tracking."
          maxWidth="md"
        >
          <div className="space-y-4 py-2">
            <div className="p-3 rounded-lg bg-[#EFF6FF] border border-[#BFDBFE] text-xs text-[#1E40AF]">
              Target Batch: <strong>{correctionModalBatch.batchName}</strong> (Status: Published)
            </div>

            {correctionError && (
              <Alert variant="error" title="Error">
                {correctionError}
              </Alert>
            )}

            {correctionSuccess && (
              <Alert variant="success" title="Success">
                {correctionSuccess}
              </Alert>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#1E293B] mb-1">
                  Select Student <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedStudentForCorrection}
                  onChange={(e) => {
                    setSelectedStudentForCorrection(e.target.value);
                    const stu = correctionModalBatch.studentResults.find((s) => s.studentId === e.target.value);
                    const subj = stu?.subjectResults.find((s) => s.subjectCode === selectedSubjectForCorrection) || stu?.subjectResults[0];
                    if (subj) setNewScoreInput(subj.totalWeightedScore);
                  }}
                  className="w-full h-9 px-3 border border-[#E2E8F0] rounded-lg text-xs text-[#1E293B] bg-white focus:outline-hidden focus:border-[#2563EB]"
                >
                  {correctionModalBatch.studentResults.map((stu) => (
                    <option key={stu.studentId} value={stu.studentId}>
                      {stu.rollNumber} - {stu.studentName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1E293B] mb-1">
                  Select Subject <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedSubjectForCorrection}
                  onChange={(e) => {
                    setSelectedSubjectForCorrection(e.target.value);
                    const stu = correctionModalBatch.studentResults.find((s) => s.studentId === selectedStudentForCorrection);
                    const subj = stu?.subjectResults.find((s) => s.subjectCode === e.target.value);
                    if (subj) setNewScoreInput(subj.totalWeightedScore);
                  }}
                  className="w-full h-9 px-3 border border-[#E2E8F0] rounded-lg text-xs text-[#1E293B] bg-white focus:outline-hidden focus:border-[#2563EB]"
                >
                  {correctionModalBatch.studentResults[0]?.subjectResults.map((subj) => (
                    <option key={subj.subjectId} value={subj.subjectCode}>
                      {subj.subjectCode} - {subj.subjectName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1E293B] mb-1">
                  New Adjusted Total Score (0 - 100) <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  step={0.1}
                  value={newScoreInput}
                  onChange={(e) => setNewScoreInput(Number(e.target.value))}
                  className="h-9 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1E293B] mb-1">
                  Administrative Justification / Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={correctionReason}
                  onChange={(e) => setCorrectionReason(e.target.value)}
                  placeholder="e.g. Re-evaluation committee revised query optimization question paper marks (+4)."
                  className="w-full p-2.5 border border-[#E2E8F0] rounded-lg text-xs text-[#1E293B] focus:outline-hidden focus:border-[#2563EB]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[#E2E8F0]">
              <Button variant="outline" size="sm" onClick={() => setCorrectionModalBatch(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSubmitCorrection}
                className="bg-[#D97706] hover:bg-[#B45309]"
                leftIcon={<Edit3 className="w-4 h-4" />}
              >
                Apply Correction Decree
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Print Styles for Grade Card */}
      <style jsx global>{`
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          aside,
          header,
          .no-print {
            display: none !important;
          }
          .print-container {
            border: none !important;
            box-shadow: none !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
          }
        }
      `}</style>
    </div>
  );
}

export default function ResultsManagementPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-[#64748B]">
          <GraduationCap className="w-8 h-8 animate-bounce mx-auto text-[#2563EB] mb-2" />
          <p className="font-semibold text-sm">Loading Results & Grade Management Console...</p>
        </div>
      }
    >
      <ResultsManagementContent />
    </Suspense>
  );
}
