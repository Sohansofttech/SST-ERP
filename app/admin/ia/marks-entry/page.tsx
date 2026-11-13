"use client";

import React, { useState, useMemo, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useInstitution } from "@/lib/store";
import {
  StudentAssessmentRecord,
  StudentMarksStatus,
  MarksSubmissionStatus,
  IAAssessment,
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
  ArrowLeft,
  Sparkles,
  Save,
  CheckCircle2,
  Lock,
  Unlock,
  Download,
  Sliders,
  Award,
  History,
  FileSpreadsheet,
  AlertCircle,
} from "lucide-react";

type SubTab = "entry" | "review" | "audit";

const SUBMISSION_STATUS_VARIANTS: Record<
  MarksSubmissionStatus,
  { label: string; variant: "neutral" | "warning" | "success" }
> = {
  Draft: { label: "Draft Saved", variant: "warning" },
  Submitted: { label: "Submitted", variant: "neutral" },
  Locked: { label: "Locked & Verified", variant: "success" },
};

function MarksEntryContent() {
  const searchParams = useSearchParams();
  const initialParamAssessmentId = searchParams.get("assessmentId") || "";
  const initialParamClassId = searchParams.get("classId") || "";
  const initialParamSectionId = searchParams.get("sectionId") || "ALL";

  const {
    classes,
    sections,
    subjects,
    students,
    iaAssessments,
    marksAudits,
    getMarksSheetForAssessment,
    saveMarksSheet,
    lockMarksSheet,
    unlockMarksSheet,
    moderateStudentMarks,
  } = useInstitution();

  // Active Sub-Tab
  const [activeSubTab, setActiveSubTab] = useState<SubTab>("entry");

  // Selection Filters
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string>(() => {
    if (initialParamAssessmentId) return initialParamAssessmentId;
    return iaAssessments[0]?.id || "";
  });

  const currentAssessment: IAAssessment | null = useMemo(() => {
    return iaAssessments.find((a) => a.id === selectedAssessmentId) || iaAssessments[0] || null;
  }, [iaAssessments, selectedAssessmentId]);

  const [selectedClassId, setSelectedClassId] = useState<string>(() => {
    return initialParamClassId || currentAssessment?.classId || "";
  });

  const [selectedSectionId, setSelectedSectionId] = useState<string>(() => {
    return initialParamSectionId || currentAssessment?.sectionId || "ALL";
  });

  // Handle assessment dropdown selection
  const handleSelectAssessment = (assessmentId: string) => {
    setSelectedAssessmentId(assessmentId);
    const found = iaAssessments.find((a) => a.id === assessmentId);
    if (found) {
      setSelectedClassId(found.classId);
      setSelectedSectionId(found.sectionId || "ALL");
    }
  };

  // Find existing marks sheet from store
  const existingSheet = useMemo(() => {
    if (!currentAssessment) return undefined;
    return getMarksSheetForAssessment(currentAssessment.id, selectedSectionId);
  }, [currentAssessment, selectedSectionId, getMarksSheetForAssessment]);

  const isSheetLocked = existingSheet?.status === "Locked";

  // Enrolled students in selected class & section
  const enrolledStudents = useMemo(() => {
    const classIdToMatch = selectedClassId || currentAssessment?.classId;
    if (!classIdToMatch) return [];
    return students.filter((s) => {
      const matchClass = s.classId === classIdToMatch;
      const matchSection =
        !selectedSectionId ||
        selectedSectionId === "ALL" ||
        !s.sectionId ||
        s.sectionId === selectedSectionId;
      const matchActive = s.status === "Active";
      return matchClass && matchSection && matchActive;
    });
  }, [students, selectedClassId, currentAssessment, selectedSectionId]);

  // Feedback Notification
  const [feedback, setFeedback] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);

  const showFeedback = (type: "success" | "error" | "info", message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  // -----------------------------------------------------------
  // Grid Component with Synchronous Initialization
  // -----------------------------------------------------------
  return (
    <div className="space-y-6">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[#E2E8F0]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/admin/ia"
              className="text-xs font-semibold text-[#2563EB] hover:underline flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Internal Assessments
            </Link>
            <span className="text-[#CBD5E1]">/</span>
            <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">
              Evaluation & Grading
            </span>
            <span className="text-[#CBD5E1]">•</span>
            <span className="text-xs font-bold text-[#14B8A6] uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Phase 4B
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#1E293B] tracking-tight">
            Student Marks Entry & Assessment Processing
          </h1>
          <p className="text-sm text-[#64748B] mt-1">
            Capture component-level scores, manage attendance exemptions, perform verified moderation with grace marks audit, and lock assessment sheets.
          </p>
        </div>
      </div>

      {/* Toast Alert Feedback */}
      {feedback && (
        <Alert
          variant={feedback.type === "error" ? "error" : feedback.type === "success" ? "success" : "info"}
          className="shadow-xs"
        >
          {feedback.message}
        </Alert>
      )}

      {/* Target Assessment & Academic Cascade Selector Card */}
      <Card className="p-4 border-[#E2E8F0] shadow-xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-[#F1F5F9]">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-[#2563EB]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#153B66]">
              Target Assessment Selection
            </span>
          </div>
          {currentAssessment && (
            <div className="flex items-center gap-2 text-xs">
              <span className="font-mono text-[#2563EB] font-bold">
                {currentAssessment.assessmentCode}
              </span>
              <span className="text-[#CBD5E1]">•</span>
              <span className="text-[#64748B]">
                Max: <strong>{currentAssessment.totalMaxMarks} M</strong> (Pass: {currentAssessment.totalPassingMarks} M)
              </span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          {/* Assessment Picker */}
          <div>
            <label className="text-[11px] font-semibold text-[#64748B] block mb-1">
              Internal Assessment (IA)
            </label>
            <select
              value={selectedAssessmentId}
              onChange={(e) => handleSelectAssessment(e.target.value)}
              className="w-full h-9 px-2.5 bg-white border border-[#CBD5E1] rounded-md font-semibold text-[#1E293B] focus:outline-hidden focus:ring-2 focus:ring-[#2563EB]"
            >
              {iaAssessments.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.assessmentCode} - {a.name}
                </option>
              ))}
            </select>
          </div>

          {/* Class / Cohort */}
          <div>
            <label className="text-[11px] font-semibold text-[#64748B] block mb-1">
              Class Cohort
            </label>
            <select
              value={selectedClassId || currentAssessment?.classId}
              disabled
              className="w-full h-9 px-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-md text-[#475569] cursor-not-allowed"
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Section Filter */}
          <div>
            <label className="text-[11px] font-semibold text-[#64748B] block mb-1">
              Section Cohort
            </label>
            <select
              value={selectedSectionId}
              onChange={(e) => setSelectedSectionId(e.target.value)}
              className="w-full h-9 px-2.5 bg-white border border-[#CBD5E1] rounded-md text-[#1E293B] focus:outline-hidden"
            >
              <option value="ALL">All Sections (Entire Cohort)</option>
              {sections
                .filter((s) => s.classId === (selectedClassId || currentAssessment?.classId))
                .map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
            </select>
          </div>

          {/* Subject */}
          <div>
            <label className="text-[11px] font-semibold text-[#64748B] block mb-1">
              Subject
            </label>
            <select
              value={currentAssessment?.subjectId || ""}
              disabled
              className="w-full h-9 px-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-md text-[#475569] cursor-not-allowed"
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.code} - {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Assessment Component Pills */}
        {currentAssessment?.components && currentAssessment.components.length > 0 && (
          <div className="pt-2 border-t border-[#F1F5F9] flex items-center gap-2 flex-wrap text-xs">
            <span className="text-[11px] font-semibold text-[#64748B]">Evaluation Components:</span>
            {currentAssessment.components.map((comp) => (
              <span
                key={comp.id}
                className="px-2 py-0.5 rounded-md bg-[#EFF6FF] border border-[#BFDBFE] text-[#1D4ED8] font-medium text-[11px] flex items-center gap-1.5"
              >
                <span>{comp.name}</span>
                <span className="font-bold">({comp.maxMarks}M • {comp.weightagePercentage}%)</span>
              </span>
            ))}
          </div>
        )}
      </Card>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1 border-b border-[#E2E8F0] overflow-x-auto pb-px">
        <button
          onClick={() => setActiveSubTab("entry")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition-colors cursor-pointer border-b-2 whitespace-nowrap ${
            activeSubTab === "entry"
              ? "border-[#2563EB] text-[#2563EB]"
              : "border-transparent text-[#64748B] hover:text-[#1E293B]"
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" /> Marks Entry Grid
        </button>

        <button
          onClick={() => setActiveSubTab("review")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition-colors cursor-pointer border-b-2 whitespace-nowrap ${
            activeSubTab === "review"
              ? "border-[#2563EB] text-[#2563EB]"
              : "border-transparent text-[#64748B] hover:text-[#1E293B]"
          }`}
        >
          <Sliders className="w-4 h-4" /> Review & Moderation Desk
        </button>

        <button
          onClick={() => setActiveSubTab("audit")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition-colors cursor-pointer border-b-2 whitespace-nowrap ${
            activeSubTab === "audit"
              ? "border-[#2563EB] text-[#2563EB]"
              : "border-transparent text-[#64748B] hover:text-[#1E293B]"
          }`}
        >
          <History className="w-4 h-4" /> Lock & Moderation Audit Trail
        </button>
      </div>

      {/* Active Grid Body Keyed by Assessment & Section to Avoid SetState in Effect */}
      {currentAssessment && (
        <MarksSheetGrid
          key={`${currentAssessment.id}-${selectedSectionId}`}
          assessment={currentAssessment}
          sectionId={selectedSectionId}
          enrolledStudents={enrolledStudents}
          existingSheet={existingSheet}
          isSheetLocked={isSheetLocked}
          activeSubTab={activeSubTab}
          onSaveDraft={(records) => {
            const res = saveMarksSheet({
              assessmentId: currentAssessment.id,
              sectionId: selectedSectionId,
              records,
              isDraft: true,
            });
            if (res.success) {
              showFeedback("success", res.message);
            } else {
              showFeedback("error", res.message);
            }
          }}
          onSubmitFinal={(records) => {
            const res = saveMarksSheet({
              assessmentId: currentAssessment.id,
              sectionId: selectedSectionId,
              records,
              isDraft: false,
            });
            if (res.success) {
              showFeedback("success", res.message);
            } else {
              showFeedback("error", res.message);
            }
          }}
          onLockSheet={() => {
            if (existingSheet) {
              const res = lockMarksSheet(existingSheet.id);
              if (res.success) showFeedback("success", res.message);
              else showFeedback("error", res.message);
            }
          }}
          onUnlockSheet={(reason) => {
            if (existingSheet) {
              const res = unlockMarksSheet(existingSheet.id, reason);
              if (res.success) showFeedback("success", res.message);
              else showFeedback("error", res.message);
            }
          }}
          onModerateStudent={(studentId, newTotalMarks, reason) => {
            if (existingSheet) {
              const res = moderateStudentMarks({
                sheetId: existingSheet.id,
                studentId,
                newTotalMarks,
                reason,
              });
              if (res.success) showFeedback("success", res.message);
              else showFeedback("error", res.message);
            }
          }}
          marksAudits={marksAudits}
        />
      )}
    </div>
  );
}

// -------------------------------------------------------------
// Dedicated Inner Component for Grid & Moderation Actions
// -------------------------------------------------------------
interface MarksSheetGridProps {
  assessment: IAAssessment;
  sectionId: string;
  enrolledStudents: typeof useInstitution extends () => infer R ? (R extends { students: infer S } ? S : never) : never;
  existingSheet?: ReturnType<typeof useInstitution>["marksSheets"][0];
  isSheetLocked: boolean;
  activeSubTab: SubTab;
  onSaveDraft: (records: StudentAssessmentRecord[]) => void;
  onSubmitFinal: (records: StudentAssessmentRecord[]) => void;
  onLockSheet: () => void;
  onUnlockSheet: (reason: string) => void;
  onModerateStudent: (studentId: string, newTotalMarks: number, reason: string) => void;
  marksAudits: ReturnType<typeof useInstitution>["marksAudits"];
}

function MarksSheetGrid({
  assessment,
  sectionId,
  enrolledStudents,
  existingSheet,
  isSheetLocked,
  activeSubTab,
  onSaveDraft,
  onSubmitFinal,
  onLockSheet,
  onUnlockSheet,
  onModerateStudent,
  marksAudits,
}: MarksSheetGridProps) {
  // Synchronous State Initialization
  const [gridRecords, setGridRecords] = useState<StudentAssessmentRecord[]>(() => {
    if (existingSheet && existingSheet.records && existingSheet.records.length > 0) {
      return existingSheet.records;
    }
    const components = assessment.components || [];
    return enrolledStudents.map((st) => ({
      id: `mrk-${assessment.id}-${st.id}`,
      assessmentId: assessment.id,
      studentId: st.id,
      studentName: st.fullName,
      rollNumber: st.rollNumber,
      classId: st.classId,
      className: st.className,
      sectionId: st.sectionId,
      sectionName: st.sectionName,
      attendanceStatus: "Present" as StudentMarksStatus,
      componentMarks: components.map((comp) => ({
        componentId: comp.id,
        componentName: comp.name,
        maxMarks: comp.maxMarks,
        weightagePercentage: comp.weightagePercentage,
        marksObtained: null,
        status: "Present" as StudentMarksStatus,
      })),
      totalMarksObtained: 0,
      totalMaxMarks: assessment.totalMaxMarks,
      isPassed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
  });

  const [isDirty, setIsDirty] = useState(false);

  // Unsaved changes window listener
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  // Calculation Helper
  const calculateTotalAndPass = (
    components: StudentAssessmentRecord["componentMarks"],
    overallStatus: StudentMarksStatus,
    graceMarks: number = 0
  ) => {
    if (overallStatus === "Absent") return { total: 0, isPassed: false };
    if (overallStatus === "Exempt") return { total: 0, isPassed: true };

    let calculatedTotal = 0;
    if (assessment.hasMultipleComponents && components.length > 0) {
      components.forEach((c) => {
        if (c.status === "Present" && c.marksObtained !== null) {
          const ratio = c.marksObtained / (c.maxMarks || 1);
          calculatedTotal += ratio * (c.weightagePercentage || 0);
        }
      });
      calculatedTotal = Math.round(calculatedTotal * 10) / 10;
    } else {
      const single = components[0];
      calculatedTotal = single && single.marksObtained !== null ? single.marksObtained : 0;
    }

    const finalWithGrace = Math.min(calculatedTotal + graceMarks, assessment.totalMaxMarks);
    const isPassed = finalWithGrace >= assessment.totalPassingMarks;
    return { total: finalWithGrace, isPassed };
  };

  // Cell Updates
  const handleUpdateComponentMark = (
    studentId: string,
    componentId: string,
    marksInput: string
  ) => {
    if (isSheetLocked) return;

    setGridRecords((prev) =>
      prev.map((rec) => {
        if (rec.studentId !== studentId) return rec;

        const val = marksInput.trim() === "" ? null : Number(marksInput);
        const updatedComps = rec.componentMarks.map((c) => {
          if (c.componentId === componentId) {
            return {
              ...c,
              marksObtained: val !== null && !isNaN(val) ? Math.max(0, Math.min(val, c.maxMarks)) : null,
              status: val === null ? c.status : "Present",
            };
          }
          return c;
        });

        const { total, isPassed } = calculateTotalAndPass(
          updatedComps,
          rec.attendanceStatus,
          rec.graceMarks || 0
        );

        return {
          ...rec,
          componentMarks: updatedComps,
          totalMarksObtained: total,
          isPassed,
          updatedAt: new Date().toISOString(),
        };
      })
    );
    setIsDirty(true);
  };

  const handleUpdateStudentAttendance = (
    studentId: string,
    newStatus: StudentMarksStatus
  ) => {
    if (isSheetLocked) return;

    setGridRecords((prev) =>
      prev.map((rec) => {
        if (rec.studentId !== studentId) return rec;

        const updatedComps = rec.componentMarks.map((c) => ({
          ...c,
          status: newStatus,
          marksObtained: newStatus === "Present" ? c.marksObtained : null,
        }));

        const { total, isPassed } = calculateTotalAndPass(
          updatedComps,
          newStatus,
          rec.graceMarks || 0
        );

        return {
          ...rec,
          attendanceStatus: newStatus,
          componentMarks: updatedComps,
          totalMarksObtained: total,
          isPassed,
          updatedAt: new Date().toISOString(),
        };
      })
    );
    setIsDirty(true);
  };

  const handleUpdateRemarks = (studentId: string, remarks: string) => {
    if (isSheetLocked) return;
    setGridRecords((prev) =>
      prev.map((rec) => (rec.studentId === studentId ? { ...rec, remarks } : rec))
    );
    setIsDirty(true);
  };

  // Bulk Actions
  const handleBulkMarkAllPresent = () => {
    if (isSheetLocked) return;
    setGridRecords((prev) =>
      prev.map((rec) => ({
        ...rec,
        attendanceStatus: "Present",
        componentMarks: rec.componentMarks.map((c) => ({ ...c, status: "Present" })),
      }))
    );
    setIsDirty(true);
  };

  const handleBulkFillPassingMarks = () => {
    if (isSheetLocked) return;
    setGridRecords((prev) =>
      prev.map((rec) => {
        const updatedComps = rec.componentMarks.map((c) => {
          const pass = Math.round(c.maxMarks * 0.4);
          return {
            ...c,
            status: "Present" as StudentMarksStatus,
            marksObtained: pass,
          };
        });
        const { total, isPassed } = calculateTotalAndPass(updatedComps, "Present", 0);
        return {
          ...rec,
          attendanceStatus: "Present",
          componentMarks: updatedComps,
          totalMarksObtained: total,
          isPassed,
        };
      })
    );
    setIsDirty(true);
  };

  const handleBulkResetAll = () => {
    if (isSheetLocked) return;
    setGridRecords((prev) =>
      prev.map((rec) => ({
        ...rec,
        attendanceStatus: "Present",
        componentMarks: rec.componentMarks.map((c) => ({
          ...c,
          marksObtained: null,
          status: "Present",
        })),
        totalMarksObtained: 0,
        isPassed: false,
        graceMarks: 0,
        isModerated: false,
      }))
    );
    setIsDirty(true);
  };

  // Review Metrics
  const reviewStats = useMemo(() => {
    const total = gridRecords.length;
    const present = gridRecords.filter((r) => r.attendanceStatus === "Present").length;
    const absent = gridRecords.filter((r) => r.attendanceStatus === "Absent").length;
    const exempt = gridRecords.filter((r) => r.attendanceStatus === "Exempt").length;
    const passed = gridRecords.filter((r) => r.isPassed).length;
    const failed = total - passed - exempt;

    const scores = gridRecords
      .filter((r) => r.attendanceStatus === "Present")
      .map((r) => r.totalMarksObtained);
    const highest = scores.length > 0 ? Math.max(...scores) : 0;
    const lowest = scores.length > 0 ? Math.min(...scores) : 0;
    const avg = scores.length > 0 ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10 : 0;
    const passRate = total > 0 ? Math.round((passed / (total - exempt || 1)) * 100) : 0;

    return { total, present, absent, exempt, passed, failed, highest, lowest, avg, passRate };
  }, [gridRecords]);

  // Modals State
  const [isLockModalOpen, setIsLockModalOpen] = useState(false);
  const [isUnlockModalOpen, setIsUnlockModalOpen] = useState(false);
  const [unlockReasonInput, setUnlockReasonInput] = useState("");

  const [isModerateModalOpen, setIsModerateModalOpen] = useState(false);
  const [selectedStudentForModeration, setSelectedStudentForModeration] = useState<StudentAssessmentRecord | null>(null);
  const [moderatedScoreInput, setModeratedScoreInput] = useState<number>(0);
  const [moderationReasonInput, setModerationReasonInput] = useState<string>("");

  const handleOpenModeration = (record: StudentAssessmentRecord) => {
    setSelectedStudentForModeration(record);
    setModeratedScoreInput(record.totalMarksObtained);
    setModerationReasonInput(record.moderationReason || "");
    setIsModerateModalOpen(true);
  };

  // CSV Export
  const handleExportCSV = () => {
    if (gridRecords.length === 0) return;

    const compHeaders = (assessment.components || []).map(
      (c) => `"${c.name} (${c.maxMarks}M / ${c.weightagePercentage}%)"`
    );
    const headers = [
      "Roll Number",
      "Student Name",
      "Attendance Status",
      ...compHeaders,
      "Total Marks Obtained",
      "Total Max Marks",
      "Result",
      "Grace Marks",
      "Moderation Remarks",
    ];

    const rows = gridRecords.map((r) => {
      const compScores = (assessment.components || []).map((c) => {
        const found = r.componentMarks.find((cm) => cm.componentId === c.id);
        if (!found || found.status !== "Present") return `"${found?.status || "N/A"}"`;
        return found.marksObtained !== null ? found.marksObtained : '""';
      });

      return [
        `"${r.rollNumber}"`,
        `"${r.studentName}"`,
        `"${r.attendanceStatus}"`,
        ...compScores,
        r.totalMarksObtained,
        r.totalMaxMarks,
        r.isPassed ? '"PASS"' : '"FAIL"',
        r.graceMarks || 0,
        `"${(r.moderationReason || r.remarks || "").replace(/"/g, '""')}"`,
      ];
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `SST_ERP_Marks_${assessment.assessmentCode}_${sectionId}_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* KPI Counters Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <Card className="p-3 border-[#E2E8F0] shadow-xs">
          <span className="text-[11px] font-semibold text-[#64748B] uppercase">Enrolled</span>
          <div className="text-xl font-black text-[#153B66]">{enrolledStudents.length}</div>
          <span className="text-[10px] text-[#64748B]">Class Cohort</span>
        </Card>

        <Card className="p-3 border-[#E2E8F0] shadow-xs">
          <span className="text-[11px] font-semibold text-[#64748B] uppercase">Evaluated</span>
          <div className="text-xl font-black text-[#16A34A]">{reviewStats.present}</div>
          <span className="text-[10px] text-[#16A34A]">Present Scores</span>
        </Card>

        <Card className="p-3 border-[#E2E8F0] shadow-xs">
          <span className="text-[11px] font-semibold text-[#64748B] uppercase">Absent</span>
          <div className="text-xl font-black text-[#DC2626]">{reviewStats.absent}</div>
          <span className="text-[10px] text-[#DC2626]">Retest Candidates</span>
        </Card>

        <Card className="p-3 border-[#E2E8F0] shadow-xs">
          <span className="text-[11px] font-semibold text-[#64748B] uppercase">Exempt</span>
          <div className="text-xl font-black text-[#64748B]">{reviewStats.exempt}</div>
          <span className="text-[10px] text-[#64748B]">Sports / Medical</span>
        </Card>

        <Card className="p-3 border-[#E2E8F0] shadow-xs">
          <span className="text-[11px] font-semibold text-[#64748B] uppercase">Class Avg</span>
          <div className="text-xl font-black text-[#2563EB]">{reviewStats.avg} M</div>
          <span className="text-[10px] text-[#2563EB]">Mean Score</span>
        </Card>

        <Card className="p-3 border-[#E2E8F0] shadow-xs">
          <span className="text-[11px] font-semibold text-[#64748B] uppercase">Pass Rate</span>
          <div className="text-xl font-black text-[#0D9488]">{reviewStats.passRate}%</div>
          <span className="text-[10px] text-[#0D9488]">Benchmark 40%</span>
        </Card>

        <Card className="p-3 border-[#E2E8F0] shadow-xs">
          <span className="text-[11px] font-semibold text-[#64748B] uppercase">Status</span>
          <div className="mt-1">
            <Badge
              variant={SUBMISSION_STATUS_VARIANTS[existingSheet?.status || "Draft"].variant}
              size="sm"
            >
              {existingSheet?.status || "Draft"}
            </Badge>
          </div>
          <span className="text-[10px] text-[#64748B] mt-0.5 block">
            {isSheetLocked ? "Immutable" : "Editable"}
          </span>
        </Card>
      </div>

      {/* Unsaved Changes Banner */}
      {isDirty && !isSheetLocked && (
        <div className="p-3 bg-[#FEF3C7] border border-[#FDE68A] text-[#92400E] rounded-xl flex items-center justify-between text-xs shadow-xs">
          <div className="flex items-center gap-2 font-semibold">
            <AlertCircle className="w-4 h-4 text-[#D97706]" />
            <span>You have unsaved marks modifications in the active grid.</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setIsDirty(false)} className="h-7 text-xs">
              Discard
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                onSaveDraft(gridRecords);
                setIsDirty(false);
              }}
              className="h-7 text-xs bg-[#D97706] hover:bg-[#B45309]"
            >
              Save Now
            </Button>
          </div>
        </div>
      )}

      {/* Main Grid View */}
      {activeSubTab === "entry" && (
        <div className="space-y-4">
          {/* Quick Actions & Bulk Controls Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-[#64748B]">Bulk Actions:</span>
              <Button
                variant="outline"
                size="sm"
                disabled={isSheetLocked}
                onClick={handleBulkMarkAllPresent}
              >
                Mark All Present
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={isSheetLocked}
                onClick={handleBulkFillPassingMarks}
              >
                Populate Benchmark Pass
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={isSheetLocked}
                onClick={handleBulkResetAll}
              >
                Clear Marks
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCSV}
                leftIcon={<Download className="w-4 h-4 text-[#2563EB]" />}
              >
                Export CSV
              </Button>

              {isSheetLocked ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsUnlockModalOpen(true)}
                  leftIcon={<Unlock className="w-4 h-4 text-[#D97706]" />}
                  className="border-[#FDE68A] bg-[#FEF3C7] text-[#D97706] hover:bg-[#FDE68A]"
                >
                  Unlock Sheet
                </Button>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      onSaveDraft(gridRecords);
                      setIsDirty(false);
                    }}
                    disabled={gridRecords.length === 0}
                    leftIcon={<Save className="w-4 h-4 text-[#64748B]" />}
                  >
                    Save Draft
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      onSubmitFinal(gridRecords);
                      setIsDirty(false);
                    }}
                    disabled={gridRecords.length === 0}
                    leftIcon={<CheckCircle2 className="w-4 h-4" />}
                  >
                    Submit Marks
                  </Button>
                  {existingSheet?.status === "Submitted" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsLockModalOpen(true)}
                      leftIcon={<Lock className="w-4 h-4 text-[#16A34A]" />}
                      className="border-[#BBF7D0] bg-[#DCFCE7] text-[#16A34A] hover:bg-[#BBF7D0]"
                    >
                      Lock Sheet
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Marks Entry Interactive Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-24">Roll No</TableHead>
                <TableHead className="min-w-44">Student Name</TableHead>
                <TableHead className="w-32">Attendance</TableHead>
                {(assessment.components || []).map((comp) => (
                  <TableHead key={comp.id} className="min-w-36 text-center">
                    <div>{comp.name}</div>
                    <div className="text-[10px] text-[#2563EB] font-normal">
                      Max: {comp.maxMarks}M ({comp.weightagePercentage}%)
                    </div>
                  </TableHead>
                ))}
                <TableHead className="w-28 text-center">
                  <div>Total Score</div>
                  <div className="text-[10px] text-[#64748B] font-normal">
                    Max: {assessment.totalMaxMarks}M
                  </div>
                </TableHead>
                <TableHead className="w-24 text-center">Result</TableHead>
                <TableHead className="min-w-40">Remarks</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {gridRecords.length === 0 ? (
                <TableEmpty
                  colSpan={6 + (assessment.components?.length || 0)}
                  message="No active students found in the selected class and section."
                />
              ) : (
                gridRecords.map((rec) => (
                  <TableRow key={rec.studentId} className="hover:bg-[#F8FAFC]">
                    {/* Roll Number */}
                    <TableCell className="font-mono text-xs font-bold text-[#153B66]">
                      {rec.rollNumber}
                    </TableCell>

                    {/* Student Name */}
                    <TableCell>
                      <div className="font-bold text-[#1E293B] text-xs">{rec.studentName}</div>
                      <div className="text-[10px] text-[#64748B]">{rec.sectionName || "Section A"}</div>
                    </TableCell>

                    {/* Attendance Status Selector */}
                    <TableCell>
                      <select
                        value={rec.attendanceStatus}
                        disabled={isSheetLocked}
                        onChange={(e) =>
                          handleUpdateStudentAttendance(
                            rec.studentId,
                            e.target.value as StudentMarksStatus
                          )
                        }
                        className={`w-full h-8 px-2 text-xs font-semibold rounded border focus:outline-hidden ${
                          rec.attendanceStatus === "Present"
                            ? "bg-white text-[#16A34A] border-[#BBF7D0]"
                            : rec.attendanceStatus === "Absent"
                            ? "bg-[#FEE2E2] text-[#DC2626] border-[#FECACA]"
                            : "bg-[#F1F5F9] text-[#475569] border-[#E2E8F0]"
                        }`}
                      >
                        <option value="Present">Present</option>
                        <option value="Absent">Absent</option>
                        <option value="Exempt">Exempt</option>
                      </select>
                    </TableCell>

                    {/* Component Marks Inputs */}
                    {(assessment.components || []).map((comp) => {
                      const compMark = rec.componentMarks.find((c) => c.componentId === comp.id);
                      const isAbsentOrExempt = rec.attendanceStatus !== "Present";

                      return (
                        <TableCell key={comp.id} className="text-center">
                          {isAbsentOrExempt ? (
                            <span className="text-xs text-[#94A3B8] italic font-semibold">
                              {rec.attendanceStatus}
                            </span>
                          ) : (
                            <div className="flex items-center justify-center gap-1">
                              <Input
                                type="number"
                                min="0"
                                max={comp.maxMarks}
                                disabled={isSheetLocked}
                                value={
                                  compMark && compMark.marksObtained !== null
                                    ? compMark.marksObtained
                                    : ""
                                }
                                placeholder={`0-${comp.maxMarks}`}
                                onChange={(e) =>
                                  handleUpdateComponentMark(
                                    rec.studentId,
                                    comp.id,
                                    e.target.value
                                  )
                                }
                                className="w-20 h-8 text-center font-bold text-xs"
                              />
                            </div>
                          )}
                        </TableCell>
                      );
                    })}

                    {/* Total Calculated Score */}
                    <TableCell className="text-center font-bold text-sm">
                      {rec.attendanceStatus === "Absent" ? (
                        <span className="text-xs text-[#DC2626] font-semibold">0 (AB)</span>
                      ) : rec.attendanceStatus === "Exempt" ? (
                        <span className="text-xs text-[#64748B] font-semibold">Exempt</span>
                      ) : (
                        <div className="flex flex-col items-center">
                          <span
                            className={
                              rec.totalMarksObtained >= (assessment.totalPassingMarks || 40)
                                ? "text-[#153B66]"
                                : "text-[#DC2626]"
                            }
                          >
                            {rec.totalMarksObtained} M
                          </span>
                          {rec.graceMarks && rec.graceMarks > 0 ? (
                            <span className="text-[10px] text-[#D97706] font-semibold">
                              (+{rec.graceMarks} Grace)
                            </span>
                          ) : null}
                        </div>
                      )}
                    </TableCell>

                    {/* Pass / Fail Result */}
                    <TableCell className="text-center">
                      {rec.attendanceStatus === "Exempt" ? (
                        <Badge variant="neutral" size="sm">
                          Exempt
                        </Badge>
                      ) : rec.isPassed ? (
                        <Badge variant="success" size="sm">
                          Pass
                        </Badge>
                      ) : (
                        <Badge variant="error" size="sm">
                          Fail
                        </Badge>
                      )}
                    </TableCell>

                    {/* Remarks Input */}
                    <TableCell>
                      <Input
                        type="text"
                        disabled={isSheetLocked}
                        placeholder="Optional remarks..."
                        value={rec.remarks || ""}
                        onChange={(e) => handleUpdateRemarks(rec.studentId, e.target.value)}
                        className="h-8 text-xs"
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Review & Moderation Tab */}
      {activeSubTab === "review" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#1E293B]">
                Marks Review & Administrative Moderation Desk
              </h3>
              <p className="text-xs text-[#64748B]">
                Review borderline student failures, award audited grace marks with mandatory justifications, and audit score distributions.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCSV}
                leftIcon={<Download className="w-4 h-4 text-[#2563EB]" />}
              >
                Export Moderation List
              </Button>
            </div>
          </div>

          {/* Statistical Distribution Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="p-4 border-[#E2E8F0] shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-[#64748B]">
                <span>Pass vs Fail Ratio</span>
                <span className="text-[#16A34A] font-bold">{reviewStats.passRate}% Passed</span>
              </div>
              <div className="w-full bg-[#FEE2E2] h-2.5 rounded-full overflow-hidden flex">
                <div
                  className="bg-[#16A34A] h-full"
                  style={{ width: `${reviewStats.passRate}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-[#64748B]">
                <span>Passed: {reviewStats.passed}</span>
                <span>Failed: {reviewStats.failed}</span>
              </div>
            </Card>

            <Card className="p-4 border-[#E2E8F0] shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-[#64748B]">
                <span>Score Extremes</span>
                <span className="text-[#2563EB] font-bold">Class Avg: {reviewStats.avg} M</span>
              </div>
              <div className="flex items-center justify-between text-xs pt-1">
                <div>
                  <span className="text-[#64748B] block text-[10px]">Cohort Highest:</span>
                  <span className="text-sm font-black text-[#16A34A]">{reviewStats.highest} M</span>
                </div>
                <div>
                  <span className="text-[#64748B] block text-[10px]">Cohort Lowest:</span>
                  <span className="text-sm font-black text-[#DC2626]">{reviewStats.lowest} M</span>
                </div>
              </div>
            </Card>

            <Card className="p-4 border-[#E2E8F0] shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-[#64748B]">
                <span>Marks Sheet Lifecycle</span>
                <Badge
                  variant={SUBMISSION_STATUS_VARIANTS[existingSheet?.status || "Draft"].variant}
                  size="sm"
                >
                  {existingSheet?.status || "Draft"}
                </Badge>
              </div>
              <p className="text-[11px] text-[#64748B]">
                {isSheetLocked
                  ? "Sheet locked by Institution Admin. To adjust scores, use the unlock procedure."
                  : "Sheet is open for edits and grace marks allocation."}
              </p>
            </Card>
          </div>

          {/* Student Review Table with Moderation Trigger */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Roll No</TableHead>
                <TableHead>Student Name</TableHead>
                <TableHead>Attendance</TableHead>
                <TableHead>Raw Total</TableHead>
                <TableHead>Grace Marks</TableHead>
                <TableHead>Final Score</TableHead>
                <TableHead>Result</TableHead>
                <TableHead>Moderation Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {gridRecords.map((rec) => (
                <TableRow key={rec.studentId} className="hover:bg-[#F8FAFC]">
                  <TableCell className="font-mono text-xs font-bold text-[#153B66]">
                    {rec.rollNumber}
                  </TableCell>
                  <TableCell className="font-bold text-xs text-[#1E293B]">
                    {rec.studentName}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        rec.attendanceStatus === "Present"
                          ? "success"
                          : rec.attendanceStatus === "Absent"
                          ? "error"
                          : "neutral"
                      }
                      size="sm"
                    >
                      {rec.attendanceStatus}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs font-bold text-[#475569]">
                    {rec.originalMarks !== undefined ? rec.originalMarks : rec.totalMarksObtained} M
                  </TableCell>
                  <TableCell className="text-xs font-bold text-[#D97706]">
                    {rec.graceMarks && rec.graceMarks > 0 ? `+${rec.graceMarks} M` : "—"}
                  </TableCell>
                  <TableCell className="text-xs font-black text-[#153B66]">
                    {rec.totalMarksObtained} M
                  </TableCell>
                  <TableCell>
                    {rec.attendanceStatus === "Exempt" ? (
                      <Badge variant="neutral" size="sm">
                        Exempt
                      </Badge>
                    ) : rec.isPassed ? (
                      <Badge variant="success" size="sm">
                        Pass
                      </Badge>
                    ) : (
                      <Badge variant="error" size="sm">
                        Fail
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {rec.isModerated ? (
                      <span className="text-[11px] font-semibold text-[#0D9488] bg-[#CCFBF1] px-2 py-0.5 rounded border border-[#99F6E4]">
                        Moderated
                      </span>
                    ) : (
                      <span className="text-[11px] text-[#94A3B8]">Standard</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenModeration(rec)}
                    >
                      Moderate Marks
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Audit Trail Tab */}
      {activeSubTab === "audit" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#1E293B]">
                Marks Entry, Moderation & Lock Audit Trail
              </h3>
              <p className="text-xs text-[#64748B]">
                Immutable chronological log of all marks submissions, grace adjustments, and authorization events.
              </p>
            </div>
          </div>

          <Card className="p-4 border-[#E2E8F0] shadow-xs">
            <div className="space-y-3">
              {marksAudits
                .filter((a) => a.assessmentId === assessment.id)
                .length === 0 ? (
                <div className="text-center py-8 text-xs text-[#64748B]">
                  No audit logs recorded for this assessment yet.
                </div>
              ) : (
                marksAudits
                  .filter((a) => a.assessmentId === assessment.id)
                  .map((log) => (
                    <div
                      key={log.id}
                      className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-xs flex items-start justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              log.action === "MARKS_LOCKED"
                                ? "success"
                                : log.action === "MARKS_UNLOCKED"
                                ? "warning"
                                : log.action === "GRACE_MARKS_AWARDED"
                                ? "teal"
                                : "info"
                            }
                            size="sm"
                          >
                            {log.action}
                          </Badge>
                          <span className="font-bold text-[#1E293B]">
                            {log.assessmentName}
                          </span>
                          {log.studentName && (
                            <span className="text-[#2563EB] font-semibold">
                              — {log.studentName}
                            </span>
                          )}
                        </div>
                        <p className="text-[#475569] text-[11px]">{log.reason}</p>
                        <div className="text-[10px] text-[#94A3B8]">
                          Authorized By: <strong className="text-[#334155]">{log.performedBy}</strong>
                        </div>
                      </div>
                      <div className="text-right text-[11px] text-[#64748B] shrink-0">
                        {new Date(log.timestamp).toLocaleDateString()}{" "}
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  ))
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Moderation / Grace Marks Modal */}
      <Modal
        isOpen={isModerateModalOpen}
        onClose={() => setIsModerateModalOpen(false)}
        title="Moderate Student Marks & Award Grace"
        description={selectedStudentForModeration ? `${selectedStudentForModeration.studentName} (${selectedStudentForModeration.rollNumber})` : ""}
        maxWidth="md"
        footer={
          <div className="flex items-center justify-between w-full">
            <Button variant="outline" size="sm" onClick={() => setIsModerateModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                if (selectedStudentForModeration) {
                  onModerateStudent(
                    selectedStudentForModeration.studentId,
                    Number(moderatedScoreInput),
                    moderationReasonInput.trim()
                  );
                  setIsModerateModalOpen(false);
                }
              }}
            >
              Apply Moderation
            </Button>
          </div>
        }
      >
        {selectedStudentForModeration && (
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[#64748B]">Raw Total Marks:</span>
                <span className="font-bold text-[#1E293B]">
                  {selectedStudentForModeration.originalMarks !== undefined
                    ? selectedStudentForModeration.originalMarks
                    : selectedStudentForModeration.totalMarksObtained}{" "}
                  / {selectedStudentForModeration.totalMaxMarks} M
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#64748B]">Benchmark Passing Score:</span>
                <span className="font-bold text-[#2563EB]">
                  {assessment.totalPassingMarks} M
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#64748B]">Current Result:</span>
                <Badge
                  variant={selectedStudentForModeration.isPassed ? "success" : "error"}
                  size="sm"
                >
                  {selectedStudentForModeration.isPassed ? "Pass" : "Fail"}
                </Badge>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-[#475569] block mb-1">
                Adjusted Total Marks (Max: {selectedStudentForModeration.totalMaxMarks} M)
              </label>
              <Input
                type="number"
                min="0"
                max={selectedStudentForModeration.totalMaxMarks}
                value={moderatedScoreInput}
                onChange={(e) => setModeratedScoreInput(Number(e.target.value))}
                className="font-bold text-sm"
              />
              <span className="text-[10px] text-[#64748B] mt-0.5 block">
                Calculated Grace Marks:{" "}
                <strong className="text-[#D97706]">
                  {Math.max(
                    0,
                    moderatedScoreInput -
                      (selectedStudentForModeration.originalMarks ||
                        selectedStudentForModeration.totalMarksObtained)
                  )}{" "}
                  M
                </strong>
              </span>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-[#475569] block mb-1">
                Mandatory Moderation Justification <span className="text-[#DC2626]">*</span>
              </label>
              <textarea
                rows={3}
                placeholder="State formal basis for adjustment (e.g. Academic Council medical concession, re-evaluation adjustment, etc.)."
                value={moderationReasonInput}
                onChange={(e) => setModerationReasonInput(e.target.value)}
                className="w-full p-2.5 text-xs bg-white border border-[#CBD5E1] rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#2563EB]"
                required
              />
            </div>

            <Alert variant="warning" className="text-[11px] py-2">
              All mark alterations are irreversibly logged with original scores and administrative justification.
            </Alert>
          </div>
        )}
      </Modal>

      {/* Lock Modal */}
      <Modal
        isOpen={isLockModalOpen}
        onClose={() => setIsLockModalOpen(false)}
        title="Lock Assessment Marks Sheet"
        description="Verify and protect marks against further modifications"
        maxWidth="sm"
        footer={
          <div className="flex items-center justify-between w-full">
            <Button variant="outline" size="sm" onClick={() => setIsLockModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              className="bg-[#16A34A] hover:bg-[#15803D]"
              onClick={() => {
                onLockSheet();
                setIsLockModalOpen(false);
              }}
            >
              Confirm & Lock
            </Button>
          </div>
        }
      >
        <div className="space-y-3 text-xs">
          <p className="text-[#475569]">
            Are you sure you want to lock the marks sheet for{" "}
            <strong className="text-[#1E293B]">{assessment.name}</strong>?
          </p>
          <p className="text-[#64748B] text-[11px]">
            Once locked, teachers and administrators cannot modify student marks without executing an authorized administrative unlock procedure.
          </p>
        </div>
      </Modal>

      {/* Unlock Modal */}
      <Modal
        isOpen={isUnlockModalOpen}
        onClose={() => setIsUnlockModalOpen(false)}
        title="Unlock Assessment Marks Sheet"
        description="Authorized administrative override"
        maxWidth="md"
        footer={
          <div className="flex items-center justify-between w-full">
            <Button variant="outline" size="sm" onClick={() => setIsUnlockModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              className="bg-[#D97706] hover:bg-[#B45309]"
              onClick={() => {
                onUnlockSheet(unlockReasonInput.trim());
                setIsUnlockModalOpen(false);
              }}
            >
              Authorize & Unlock
            </Button>
          </div>
        }
      >
        <div className="space-y-3 text-xs">
          <p className="text-[#475569]">
            You are unlocking the marks sheet for{" "}
            <strong className="text-[#1E293B]">{assessment.name}</strong>.
          </p>

          <div>
            <label className="text-[11px] font-semibold text-[#475569] block mb-1">
              Mandatory Unlock Justification Reason <span className="text-[#DC2626]">*</span>
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Scrutiny committee identified evaluation discrepancy; reopening for re-entry."
              value={unlockReasonInput}
              onChange={(e) => setUnlockReasonInput(e.target.value)}
              className="w-full p-2.5 text-xs bg-white border border-[#CBD5E1] rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#2563EB]"
              required
            />
          </div>

          <Alert variant="warning" className="text-[11px] py-2">
            This unlock action will be permanently recorded in the institutional audit log.
          </Alert>
        </div>
      </Modal>
    </div>
  );
}

export default function MarksEntryPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs text-[#64748B]">
          Loading Marks Entry & Assessment Processing...
        </div>
      }
    >
      <MarksEntryContent />
    </Suspense>
  );
}
