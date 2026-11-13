"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useInstitution } from "@/lib/store";
import {
  AttendanceStatus,
  AttendanceRecord,
} from "@/types/institution";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";
import { Modal } from "@/components/ui/modal";
import {
  CalendarCheck,
  Calendar,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  FileSpreadsheet,
  History,
  Download,
  Filter,
  Search,
  ArrowLeft,
  Sparkles,
  Save,
  CheckCheck,
  RotateCcw,
  Sliders,
  Send,
  UserCheck,
  BarChart3,
  Check,
} from "lucide-react";

type ActiveTab =
  | "dashboard"
  | "mark"
  | "history"
  | "reports"
  | "alerts"
  | "audits";

const SESSIONS_LIST = [
  "Full Day",
  "Morning Session",
  "Afternoon Session",
  "Period 1 (09:00 - 09:50)",
  "Period 2 (09:50 - 10:40)",
  "Period 3 (11:00 - 11:50)",
  "Period 4 (11:50 - 12:40)",
  "Period 5 (13:30 - 14:20)",
  "Period 6 (14:20 - 15:10)",
];

export default function AttendancePage() {
  const {
    profile,
    academicYears,
    activeAcademicYear,
    courses,
    classes,
    sections,
    students,
    attendanceThreshold,
    updateAttendanceThreshold,
    attendanceRecords,
    attendanceAudits,
    saveBatchAttendance,
    correctAttendanceRecord,
    getStudentAttendanceSummaries,
    getClassAttendanceSummaries,
    getAttendanceMetrics,
  } = useInstitution();

  // Active top-level tab
  const [activeTab, setActiveTab] = useState<ActiveTab>("dashboard");

  // Notification Banner
  const [feedback, setFeedback] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);

  // -------------------------------------------------------------
  // Mark Attendance State
  // -------------------------------------------------------------
  const [markAYId, setMarkAYId] = useState<string>(activeAcademicYear?.id || (academicYears[0]?.id ?? ""));
  const [markCourseId, setMarkCourseId] = useState<string>(courses[0]?.id || "");

  // Available classes for selected course
  const availableClassesForMark = useMemo(() => {
    return classes.filter((c) => !markCourseId || c.courseId === markCourseId);
  }, [classes, markCourseId]);

  const [markClassId, setMarkClassId] = useState<string>(
    classes.find((c) => c.id === "class-cse-3")?.id || (classes[0]?.id ?? "")
  );

  // Available sections for selected class
  const availableSectionsForMark = useMemo(() => {
    return sections.filter((s) => s.classId === markClassId);
  }, [sections, markClassId]);

  const [markSectionId, setMarkSectionId] = useState<string>(
    availableSectionsForMark[0]?.id || "sec-cse-3a"
  );

  const [markDate, setMarkDate] = useState<string>("2026-11-13");
  const [markSession, setMarkSession] = useState<string>("Full Day");
  const [markedBy] = useState<string>("Prof. Sudha Murthy (Class Teacher)");

  // Students enrolled in the selected class and section
  const enrolledStudentsForMark = useMemo(() => {
    return students.filter((s) => {
      const matchesClass = s.classId === markClassId || (markClassId === "class-cse-3" && s.classId === "class-cse-y3");
      const matchesSection = !markSectionId || s.sectionId === markSectionId;
      return matchesClass && matchesSection && s.status === "Active";
    });
  }, [students, markClassId, markSectionId]);

  // Existing records if this session was already recorded
  const existingRecordsForSession = useMemo(() => {
    return attendanceRecords.filter(
      (r) =>
        r.classId === markClassId &&
        r.sectionId === markSectionId &&
        r.date === markDate &&
        r.session === markSession
    );
  }, [attendanceRecords, markClassId, markSectionId, markDate, markSession]);

  // Local overrides for marking table
  const [overrideStatuses, setOverrideStatuses] = useState<
    Record<string, { status?: AttendanceStatus; remarks?: string }>
  >({});

  const getEffectiveStatus = (studentId: string, rollNumber: string): AttendanceStatus => {
    if (overrideStatuses[studentId]?.status) {
      return overrideStatuses[studentId].status!;
    }
    const existing = existingRecordsForSession.find(
      (r) => r.studentId === studentId || r.rollNumber === rollNumber
    );
    return existing?.status ?? "Present";
  };

  const getEffectiveRemarks = (studentId: string, rollNumber: string): string => {
    if (overrideStatuses[studentId]?.remarks !== undefined) {
      return overrideStatuses[studentId].remarks!;
    }
    const existing = existingRecordsForSession.find(
      (r) => r.studentId === studentId || r.rollNumber === rollNumber
    );
    return existing?.remarks ?? "";
  };

  const handleSetStudentStatus = (studentId: string, status: AttendanceStatus) => {
    setOverrideStatuses((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status,
      },
    }));
  };

  const handleSetStudentRemarks = (studentId: string, remarks: string) => {
    setOverrideStatuses((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        remarks,
      },
    }));
  };

  const handleMarkAll = (status: AttendanceStatus) => {
    setOverrideStatuses((prev) => {
      const updated: Record<string, { status?: AttendanceStatus; remarks?: string }> = { ...prev };
      enrolledStudentsForMark.forEach((s) => {
        updated[s.id] = {
          ...updated[s.id],
          status,
        };
      });
      return updated;
    });
    setFeedback({
      type: "info",
      message: `Marked all ${enrolledStudentsForMark.length} students as ${status}. Click "Save Attendance Register" to persist.`,
    });
  };

  const handleSaveAttendance = () => {
    if (enrolledStudentsForMark.length === 0) {
      setFeedback({
        type: "error",
        message: "No active students found in the selected cohort to mark attendance.",
      });
      return;
    }

    const entries = enrolledStudentsForMark.map((s) => ({
      studentId: s.id,
      studentUniqueId: s.studentId,
      rollNumber: s.rollNumber,
      studentName: s.fullName,
      status: getEffectiveStatus(s.id, s.rollNumber),
      remarks: getEffectiveRemarks(s.id, s.rollNumber) || undefined,
    }));

    const result = saveBatchAttendance({
      academicYearId: markAYId,
      courseId: markCourseId,
      classId: markClassId,
      sectionId: markSectionId,
      date: markDate,
      session: markSession,
      markedBy,
      entries,
    });

    if (result.success) {
      setFeedback({
        type: "success",
        message: result.message,
      });
    }
  };

  // -------------------------------------------------------------
  // History View State
  // -------------------------------------------------------------
  const [historyFilterClass, setHistoryFilterClass] = useState<string>("all");
  const [historyFilterStatus, setHistoryFilterStatus] = useState<string>("all");
  const [historyStartDate, setHistoryStartDate] = useState<string>("2026-11-01");
  const [historyEndDate, setHistoryEndDate] = useState<string>("2026-11-13");
  const [historySearch, setHistorySearch] = useState<string>("");

  const filteredHistoryRecords = useMemo(() => {
    return attendanceRecords.filter((r) => {
      if (historyFilterClass !== "all" && r.classId !== historyFilterClass) return false;
      if (historyFilterStatus !== "all" && r.status !== historyFilterStatus) return false;
      if (historyStartDate && r.date < historyStartDate) return false;
      if (historyEndDate && r.date > historyEndDate) return false;
      if (historySearch) {
        const query = historySearch.toLowerCase();
        const matchesName = r.studentName.toLowerCase().includes(query);
        const matchesRoll = r.rollNumber.toLowerCase().includes(query);
        const matchesDate = r.date.includes(query);
        if (!matchesName && !matchesRoll && !matchesDate) return false;
      }
      return true;
    });
  }, [
    attendanceRecords,
    historyFilterClass,
    historyFilterStatus,
    historyStartDate,
    historyEndDate,
    historySearch,
  ]);

  // -------------------------------------------------------------
  // Attendance Correction Modal State
  // -------------------------------------------------------------
  const [correctionTarget, setCorrectionTarget] = useState<AttendanceRecord | null>(null);
  const [correctionNewStatus, setCorrectionNewStatus] = useState<AttendanceStatus>("Present");
  const [correctionReason, setCorrectionReason] = useState<string>("");
  const [correctionAuthor, setCorrectionAuthor] = useState<string>("Admin - Principal Office");
  const [correctionError, setCorrectionError] = useState<string | null>(null);

  const openCorrectionModal = (rec: AttendanceRecord) => {
    setCorrectionTarget(rec);
    setCorrectionNewStatus(rec.status === "Present" ? "On Leave" : "Present");
    setCorrectionReason("");
    setCorrectionError(null);
  };

  const handleApplyCorrection = () => {
    if (!correctionTarget) return;
    if (!correctionReason.trim()) {
      setCorrectionError("A valid correction reason is required for institutional audit compliance.");
      return;
    }
    if (correctionTarget.status === correctionNewStatus) {
      setCorrectionError("The new status must be different from the currently recorded status.");
      return;
    }

    const res = correctAttendanceRecord(
      correctionTarget.id,
      correctionNewStatus,
      correctionReason,
      correctionAuthor
    );

    if (res.success) {
      setFeedback({
        type: "success",
        message: res.message,
      });
      setCorrectionTarget(null);
    } else {
      setCorrectionError(res.message);
    }
  };

  // -------------------------------------------------------------
  // Threshold Configuration State
  // -------------------------------------------------------------
  const [customMinThreshold, setCustomMinThreshold] = useState<number>(
    attendanceThreshold.minimumPercentage
  );
  const [thresholdSavedNotice, setThresholdSavedNotice] = useState<boolean>(false);

  const handleSaveThreshold = () => {
    updateAttendanceThreshold({
      minimumPercentage: customMinThreshold,
      warningPercentage: Math.min(100, customMinThreshold + 5),
    });
    setThresholdSavedNotice(true);
    setTimeout(() => setThresholdSavedNotice(false), 3000);
    setFeedback({
      type: "success",
      message: `Minimum attendance threshold updated to ${customMinThreshold}%. Alert rosters updated automatically.`,
    });
  };

  // -------------------------------------------------------------
  // Reports & Analytics Data
  // -------------------------------------------------------------
  const [reportClassFilter, setReportClassFilter] = useState<string>("all");
  const [reportSearch, setReportSearch] = useState<string>("");

  const studentSummaries = useMemo(() => {
    const list = getStudentAttendanceSummaries(
      reportClassFilter === "all" ? undefined : reportClassFilter
    );
    if (!reportSearch) return list;
    const q = reportSearch.toLowerCase();
    return list.filter(
      (s) =>
        s.studentName.toLowerCase().includes(q) ||
        s.rollNumber.toLowerCase().includes(q) ||
        s.className.toLowerCase().includes(q)
    );
  }, [getStudentAttendanceSummaries, reportClassFilter, reportSearch]);

  const classSummaries = useMemo(() => {
    return getClassAttendanceSummaries();
  }, [getClassAttendanceSummaries]);

  // Overall attendance metrics for today / general
  const overallMetrics = useMemo(() => {
    return getAttendanceMetrics();
  }, [getAttendanceMetrics]);

  // Students below minimum attendance threshold
  const defaulterStudents = useMemo(() => {
    return studentSummaries.filter((s) => s.isBelowThreshold);
  }, [studentSummaries]);

  // Students at risk (between threshold and threshold + 5%)
  const warningStudents = useMemo(() => {
    return studentSummaries.filter((s) => s.isWarning);
  }, [studentSummaries]);

  // Guardian Alert Dispatch Modal State
  const [alertTargetStudent, setAlertTargetStudent] = useState<
    (typeof studentSummaries)[0] | null
  >(null);
  const [alertChannel, setAlertChannel] = useState<"sms" | "email" | "both">("both");
  const [alertSuccessMessage, setAlertSuccessMessage] = useState<string | null>(null);

  const handleDispatchGuardianAlert = () => {
    if (!alertTargetStudent) return;
    setAlertSuccessMessage(
      `Official low attendance notice dispatched via ${alertChannel.toUpperCase()} to ${
        alertTargetStudent.guardianName || "Guardian"
      } (${alertTargetStudent.guardianPhone || alertTargetStudent.guardianEmail || "On Record"}).`
    );
    setTimeout(() => {
      setAlertSuccessMessage(null);
      setAlertTargetStudent(null);
    }, 2500);
  };

  // Export CSV Function
  const handleExportCSV = () => {
    const headers = [
      "Roll Number",
      "Student Name",
      "Class",
      "Section",
      "Total Sessions",
      "Present",
      "Absent",
      "Late",
      "On Leave",
      "Attendance Percentage",
      "Compliance Status",
      "Guardian Name",
      "Guardian Phone",
    ];

    const rows = studentSummaries.map((s) => [
      `"${s.rollNumber}"`,
      `"${s.studentName}"`,
      `"${s.className}"`,
      `"${s.sectionName || "N/A"}"`,
      s.totalSessions,
      s.presentCount,
      s.absentCount,
      s.lateCount,
      s.leaveCount,
      `${s.percentage}%`,
      `"${s.isBelowThreshold ? "Defaulter (<" + attendanceThreshold.minimumPercentage + "%)" : s.isWarning ? "At Risk" : "Compliant"}"`,
      `"${s.guardianName || "N/A"}"`,
      `"${s.guardianPhone || "N/A"}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `SST_ERP_Attendance_Report_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setFeedback({
      type: "success",
      message: `Exported attendance report for ${studentSummaries.length} students to CSV.`,
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[#E2E8F0]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/admin"
              className="text-xs font-semibold text-[#2563EB] hover:underline flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Dashboard
            </Link>
            <span className="text-[#CBD5E1]">/</span>
            <span className="text-xs font-semibold text-[#14B8A6] uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Academic Operations
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#1E293B] tracking-tight">
            Attendance Management
          </h1>
          <p className="text-sm text-[#64748B] mt-0.5">
            Institutional attendance registers, daily/period marking, low-attendance alerts, and auditable correction records for{" "}
            <strong className="text-[#153B66]">{profile.name}</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            leftIcon={<Download className="w-4 h-4 text-[#2563EB]" />}
          >
            Export Register
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setActiveTab("mark")}
            leftIcon={<CalendarCheck className="w-4 h-4" />}
          >
            Mark Attendance
          </Button>
        </div>
      </div>

      {/* Global Feedback Banner */}
      {feedback && (
        <Alert
          variant={feedback.type === "success" ? "success" : feedback.type === "error" ? "error" : "info"}
          title={feedback.type === "success" ? "Operation Successful" : feedback.type === "error" ? "Action Required" : "System Notice"}
          icon={feedback.type === "success" ? <CheckCircle2 className="w-5 h-5 text-[#16A34A]" /> : feedback.type === "error" ? <AlertTriangle className="w-5 h-5 text-[#DC2626]" /> : <Calendar className="w-5 h-5 text-[#2563EB]" />}
        >
          <div className="flex items-center justify-between">
            <span>{feedback.message}</span>
            <button
              onClick={() => setFeedback(null)}
              className="text-xs underline ml-4 cursor-pointer hover:opacity-80"
            >
              Dismiss
            </button>
          </div>
        </Alert>
      )}

      {/* Navigation Tabs */}
      <div className="flex border-b border-[#CBD5E1] gap-1 overflow-x-auto pb-px">
        <button
          onClick={() => setActiveTab("dashboard")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-lg transition-colors cursor-pointer shrink-0 ${
            activeTab === "dashboard"
              ? "bg-white border-t-2 border-t-[#2563EB] border-x border-[#CBD5E1] text-[#2563EB] shadow-xs"
              : "text-[#64748B] hover:text-[#1E293B] hover:bg-[#F1F5F9]"
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Dashboard & Analytics</span>
        </button>

        <button
          onClick={() => setActiveTab("mark")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-lg transition-colors cursor-pointer shrink-0 ${
            activeTab === "mark"
              ? "bg-white border-t-2 border-t-[#2563EB] border-x border-[#CBD5E1] text-[#2563EB] shadow-xs"
              : "text-[#64748B] hover:text-[#1E293B] hover:bg-[#F1F5F9]"
          }`}
        >
          <CalendarCheck className="w-4 h-4" />
          <span>Mark Attendance Register</span>
        </button>

        <button
          onClick={() => setActiveTab("history")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-lg transition-colors cursor-pointer shrink-0 ${
            activeTab === "history"
              ? "bg-white border-t-2 border-t-[#2563EB] border-x border-[#CBD5E1] text-[#2563EB] shadow-xs"
              : "text-[#64748B] hover:text-[#1E293B] hover:bg-[#F1F5F9]"
          }`}
        >
          <History className="w-4 h-4" />
          <span>Attendance History & Logs</span>
        </button>

        <button
          onClick={() => setActiveTab("reports")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-lg transition-colors cursor-pointer shrink-0 ${
            activeTab === "reports"
              ? "bg-white border-t-2 border-t-[#2563EB] border-x border-[#CBD5E1] text-[#2563EB] shadow-xs"
              : "text-[#64748B] hover:text-[#1E293B] hover:bg-[#F1F5F9]"
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Attendance Reports</span>
        </button>

        <button
          onClick={() => setActiveTab("alerts")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-lg transition-colors cursor-pointer shrink-0 ${
            activeTab === "alerts"
              ? "bg-white border-t-2 border-t-[#2563EB] border-x border-[#CBD5E1] text-[#2563EB] shadow-xs"
              : "text-[#64748B] hover:text-[#1E293B] hover:bg-[#F1F5F9]"
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-[#D97706]" />
          <span>Low Attendance Alerts</span>
          {defaulterStudents.length > 0 && (
            <span className="text-[10px] bg-[#DC2626] text-white px-1.5 py-0.2 rounded-full font-extrabold">
              {defaulterStudents.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("audits")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-lg transition-colors cursor-pointer shrink-0 ${
            activeTab === "audits"
              ? "bg-white border-t-2 border-t-[#2563EB] border-x border-[#CBD5E1] text-[#2563EB] shadow-xs"
              : "text-[#64748B] hover:text-[#1E293B] hover:bg-[#F1F5F9]"
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Correction Audit Trail</span>
          {attendanceAudits.length > 0 && (
            <span className="text-[10px] bg-[#14B8A6] text-white px-1.5 py-0.2 rounded-full font-bold">
              {attendanceAudits.length}
            </span>
          )}
        </button>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: ATTENDANCE DASHBOARD & OVERVIEW                   */}
      {/* ========================================================= */}
      {activeTab === "dashboard" && (
        <div className="space-y-6">
          {/* Institutional KPI Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
            {/* 1. Total Enrolled */}
            <Card className="border-l-4 border-l-[#2563EB]">
              <CardContent className="p-4">
                <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block">
                  Total Enrolled
                </span>
                <p className="text-2xl font-black text-[#1E293B] mt-1">
                  {students.filter((s) => s.status === "Active").length}
                </p>
                <span className="text-[10px] text-[#2563EB] font-semibold mt-1 flex items-center gap-1">
                  <Users className="w-3 h-3" /> All Cohorts
                </span>
              </CardContent>
            </Card>

            {/* 2. Present */}
            <Card className="border-l-4 border-l-[#16A34A]">
              <CardContent className="p-4">
                <span className="text-[11px] font-bold text-[#16A34A] uppercase tracking-wider block">
                  Present Today
                </span>
                <p className="text-2xl font-black text-[#16A34A] mt-1">
                  {overallMetrics.present}
                </p>
                <span className="text-[10px] text-[#64748B] font-medium mt-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-[#16A34A]" /> Recorded In-Class
                </span>
              </CardContent>
            </Card>

            {/* 3. Absent */}
            <Card className="border-l-4 border-l-[#DC2626]">
              <CardContent className="p-4">
                <span className="text-[11px] font-bold text-[#DC2626] uppercase tracking-wider block">
                  Absent
                </span>
                <p className="text-2xl font-black text-[#DC2626] mt-1">
                  {overallMetrics.absent}
                </p>
                <span className="text-[10px] text-[#DC2626] font-medium mt-1 flex items-center gap-1">
                  <XCircle className="w-3 h-3" /> Unexcused
                </span>
              </CardContent>
            </Card>

            {/* 4. Late */}
            <Card className="border-l-4 border-l-[#F59E0B]">
              <CardContent className="p-4">
                <span className="text-[11px] font-bold text-[#D97706] uppercase tracking-wider block">
                  Late Arrivals
                </span>
                <p className="text-2xl font-black text-[#D97706] mt-1">
                  {overallMetrics.late}
                </p>
                <span className="text-[10px] text-[#D97706] font-medium mt-1 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Grace entry
                </span>
              </CardContent>
            </Card>

            {/* 5. On Leave */}
            <Card className="border-l-4 border-l-[#0284C7]">
              <CardContent className="p-4">
                <span className="text-[11px] font-bold text-[#0284C7] uppercase tracking-wider block">
                  On Leave
                </span>
                <p className="text-2xl font-black text-[#0284C7] mt-1">
                  {overallMetrics.onLeave}
                </p>
                <span className="text-[10px] text-[#0284C7] font-medium mt-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Authorized
                </span>
              </CardContent>
            </Card>

            {/* 6. Overall Percentage */}
            <Card className="border-l-4 border-l-[#153B66]">
              <CardContent className="p-4">
                <span className="text-[11px] font-bold text-[#153B66] uppercase tracking-wider block">
                  Attendance Rate
                </span>
                <p className="text-2xl font-black text-[#153B66] mt-1">
                  {overallMetrics.percentage}%
                </p>
                <div className="w-full bg-[#E2E8F0] h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-[#14B8A6] h-full rounded-full transition-all duration-500"
                    style={{ width: `${overallMetrics.percentage}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Graphical Analytics & Breakdown Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Daily Trend Visualizer (2 Cols) */}
            <Card className="lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle>Attendance Trend by Date</CardTitle>
                  <p className="text-xs text-[#64748B] mt-0.5">
                    Daily student presence across tracked instructional sessions
                  </p>
                </div>
                <Badge variant="teal" size="sm">
                  Active Term: {activeAcademicYear?.name || "2026-2027"}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <div className="space-y-3">
                  {[
                    { date: "2026-11-12", day: "Thursday", present: 5, late: 0, absent: 1, leave: 0, total: 6, pct: 83.3 },
                    { date: "2026-11-11", day: "Wednesday", present: 4, late: 0, absent: 2, leave: 0, total: 6, pct: 66.7 },
                    { date: "2026-11-10", day: "Tuesday", present: 5, late: 1, absent: 0, leave: 0, total: 6, pct: 100 },
                    { date: "2026-11-09", day: "Monday", present: 4, late: 0, absent: 1, leave: 1, total: 6, pct: 83.3 },
                    { date: "2026-11-06", day: "Friday", present: 5, late: 0, absent: 0, leave: 1, total: 6, pct: 100 },
                    { date: "2026-11-05", day: "Thursday", present: 5, late: 0, absent: 1, leave: 0, total: 6, pct: 83.3 },
                  ].map((row) => (
                    <div key={row.date} className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] space-y-2">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#1E293B]">{row.date}</span>
                          <span className="text-[#64748B]">({row.day})</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[11px] text-[#16A34A] font-bold">{row.present} Present</span>
                          <span className="text-[11px] text-[#DC2626] font-bold">{row.absent} Absent</span>
                          {row.late > 0 && <span className="text-[11px] text-[#D97706] font-bold">{row.late} Late</span>}
                          {row.leave > 0 && <span className="text-[11px] text-[#0284C7] font-bold">{row.leave} Leave</span>}
                          <span className="text-xs font-black text-[#153B66] ml-2">{row.pct}%</span>
                        </div>
                      </div>
                      <div className="w-full bg-[#E2E8F0] h-2 rounded-full overflow-hidden flex">
                        <div style={{ width: `${(row.present / row.total) * 100}%` }} className="bg-[#16A34A] h-full" title="Present" />
                        <div style={{ width: `${(row.late / row.total) * 100}%` }} className="bg-[#F59E0B] h-full" title="Late" />
                        <div style={{ width: `${(row.leave / row.total) * 100}%` }} className="bg-[#0284C7] h-full" title="Leave" />
                        <div style={{ width: `${(row.absent / row.total) * 100}%` }} className="bg-[#DC2626] h-full" title="Absent" />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-center gap-6 pt-2 text-xs font-medium text-[#64748B]">
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-[#16A34A]" /> Present</span>
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-[#F59E0B]" /> Late Arrival</span>
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-[#0284C7]" /> Authorized Leave</span>
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-[#DC2626]" /> Unexcused Absence</span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions & Low Attendance Warning Card */}
            <div className="space-y-4">
              <Card className="border-t-4 border-t-[#F59E0B]">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-[#D97706]" />
                    Attendance Compliance Alert
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-xs text-[#64748B]">
                    Students below the mandatory <strong className="text-[#1E293B]">{attendanceThreshold.minimumPercentage}%</strong> minimum threshold are flagged for immediate academic intervention.
                  </p>

                  <div className="p-3 rounded-lg bg-[#FEF2F2] border border-[#FECACA] flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-[#991B1B] block">Defaulter Students</span>
                      <span className="text-[11px] text-[#B91C1C]">Exam hall ticket eligibility at risk</span>
                    </div>
                    <span className="text-2xl font-black text-[#DC2626]">
                      {defaulterStudents.length}
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-[#FFFBEB] border border-[#FDE68A] flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-[#92400E] block">At-Risk Students</span>
                      <span className="text-[11px] text-[#B45309]">Attendance between 75% and 80%</span>
                    </div>
                    <span className="text-2xl font-black text-[#D97706]">
                      {warningStudents.length}
                    </span>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => setActiveTab("alerts")}
                  >
                    View Defaulters & Notify Guardians
                  </Button>
                </CardContent>
              </Card>

              {/* Class Summary Snapshot */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Class Performance Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2.5">
                  {classSummaries.slice(0, 3).map((cls) => (
                    <div key={cls.classId} className="flex items-center justify-between p-2.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-xs">
                      <div>
                        <span className="font-bold text-[#1E293B] block">{cls.className}</span>
                        <span className="text-[10px] text-[#64748B]">{cls.totalEnrolled} Enrolled • {cls.totalSessions} Sessions</span>
                      </div>
                      <div className="text-right">
                        <span className="font-black text-[#153B66] text-sm block">{cls.averagePercentage}%</span>
                        {cls.lowAttendanceCount > 0 ? (
                          <span className="text-[10px] text-[#DC2626] font-bold">{cls.lowAttendanceCount} Defaulters</span>
                        ) : (
                          <span className="text-[10px] text-[#16A34A] font-bold">Compliant</span>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: MARK ATTENDANCE REGISTER                          */}
      {/* ========================================================= */}
      {activeTab === "mark" && (
        <div className="space-y-6">
          {/* Cohort & Session Filter Header */}
          <Card>
            <CardHeader className="pb-3 border-b border-[#E2E8F0]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <CardTitle>Attendance Register Selection</CardTitle>
                  <p className="text-xs text-[#64748B] mt-0.5">
                    Select academic cohort, date, and instructional session to record attendance
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#64748B]">
                  <span className="w-2 h-2 rounded-full bg-[#16A34A]" />
                  <span>Marking Officer: <strong>{markedBy}</strong></span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3.5">
                {/* 1. Academic Year */}
                <div>
                  <label className="text-[11px] font-bold text-[#475569] uppercase tracking-wider block mb-1">
                    Academic Year
                  </label>
                  <select
                    value={markAYId}
                    onChange={(e) => setMarkAYId(e.target.value)}
                    className="w-full text-xs font-medium border border-[#CBD5E1] rounded-lg p-2 bg-white text-[#1E293B]"
                  >
                    {academicYears.map((ay) => (
                      <option key={ay.id} value={ay.id}>
                        AY {ay.name} {ay.isActive ? "(Active)" : ""}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. Course */}
                <div>
                  <label className="text-[11px] font-bold text-[#475569] uppercase tracking-wider block mb-1">
                    Course / Degree
                  </label>
                  <select
                    value={markCourseId}
                    onChange={(e) => {
                      setMarkCourseId(e.target.value);
                      const matchingClass = classes.find((c) => c.courseId === e.target.value);
                      if (matchingClass) {
                        setMarkClassId(matchingClass.id);
                        const matchingSec = sections.find((s) => s.classId === matchingClass.id);
                        if (matchingSec) setMarkSectionId(matchingSec.id);
                      }
                    }}
                    className="w-full text-xs font-medium border border-[#CBD5E1] rounded-lg p-2 bg-white text-[#1E293B]"
                  >
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.code} – {c.name.slice(0, 24)}...
                      </option>
                    ))}
                  </select>
                </div>

                {/* 3. Class */}
                <div>
                  <label className="text-[11px] font-bold text-[#475569] uppercase tracking-wider block mb-1">
                    Class & Cohort
                  </label>
                  <select
                    value={markClassId}
                    onChange={(e) => {
                      setMarkClassId(e.target.value);
                      const matchingSec = sections.find((s) => s.classId === e.target.value);
                      if (matchingSec) setMarkSectionId(matchingSec.id);
                    }}
                    className="w-full text-xs font-medium border border-[#CBD5E1] rounded-lg p-2 bg-white text-[#1E293B]"
                  >
                    {availableClassesForMark.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 4. Section */}
                <div>
                  <label className="text-[11px] font-bold text-[#475569] uppercase tracking-wider block mb-1">
                    Section
                  </label>
                  <select
                    value={markSectionId}
                    onChange={(e) => setMarkSectionId(e.target.value)}
                    className="w-full text-xs font-medium border border-[#CBD5E1] rounded-lg p-2 bg-white text-[#1E293B]"
                  >
                    {availableSectionsForMark.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.roomNumber || "Campus"})
                      </option>
                    ))}
                  </select>
                </div>

                {/* 5. Date */}
                <div>
                  <label className="text-[11px] font-bold text-[#475569] uppercase tracking-wider block mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={markDate}
                    onChange={(e) => setMarkDate(e.target.value)}
                    className="w-full text-xs font-medium border border-[#CBD5E1] rounded-lg p-2 bg-white text-[#1E293B]"
                  />
                </div>

                {/* 6. Session */}
                <div>
                  <label className="text-[11px] font-bold text-[#475569] uppercase tracking-wider block mb-1">
                    Period / Session
                  </label>
                  <select
                    value={markSession}
                    onChange={(e) => setMarkSession(e.target.value)}
                    className="w-full text-xs font-medium border border-[#CBD5E1] rounded-lg p-2 bg-white text-[#1E293B]"
                  >
                    {SESSIONS_LIST.map((sess) => (
                      <option key={sess} value={sess}>
                        {sess}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Duplicate Detection & Status Notification */}
              <div className="mt-4 pt-3 border-t border-[#F1F5F9] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {existingRecordsForSession.length > 0 ? (
                    <Badge variant="teal" size="md">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-[#0D9488]" />
                      Already Marked: {existingRecordsForSession.length} Students
                    </Badge>
                  ) : (
                    <Badge variant="navy" size="md">
                      <Clock className="w-3.5 h-3.5 mr-1 text-[#93C5FD]" />
                      Unrecorded Session: Ready to Mark
                    </Badge>
                  )}
                  <span className="text-xs text-[#64748B]">
                    Cohort Enrolled: <strong>{enrolledStudentsForMark.length} Active Students</strong>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleMarkAll("Present")}
                    leftIcon={<CheckCheck className="w-3.5 h-3.5 text-[#16A34A]" />}
                  >
                    Mark All Present
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleMarkAll("Absent")}
                    leftIcon={<XCircle className="w-3.5 h-3.5 text-[#DC2626]" />}
                  >
                    Mark All Absent
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Student Roster Table for Marking */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle>Attendance Register Roster</CardTitle>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Record individual presence, absence, late arrivals or authorized leaves
                </p>
              </div>

              <Button
                variant="primary"
                size="sm"
                onClick={handleSaveAttendance}
                leftIcon={<Save className="w-4 h-4" />}
              >
                Save Attendance Register
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {enrolledStudentsForMark.length === 0 ? (
                <div className="p-12 text-center text-[#64748B]">
                  <Users className="w-10 h-10 mx-auto text-[#CBD5E1] mb-2" />
                  <p className="text-sm font-semibold">No students enrolled in this section.</p>
                  <p className="text-xs mt-1">Please select another class or section above.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#F8FAFC] text-[#475569] uppercase font-bold text-[11px] border-y border-[#E2E8F0]">
                      <tr>
                        <th className="py-3 px-4">Student ID & Roll No</th>
                        <th className="py-3 px-4">Student Name</th>
                        <th className="py-3 px-4">Attendance Status</th>
                        <th className="py-3 px-4">Remarks / Exception Note</th>
                        <th className="py-3 px-4 text-right">Quick Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F1F5F9]">
                      {enrolledStudentsForMark.map((s) => {
                        const currentStatus = getEffectiveStatus(s.id, s.rollNumber);
                        const currentRemarks = getEffectiveRemarks(s.id, s.rollNumber);

                        return (
                          <tr key={s.id} className="hover:bg-[#F8FAFC] transition-colors">
                            {/* Student ID & Roll No */}
                            <td className="py-3 px-4">
                              <span className="font-extrabold text-[#153B66] block">{s.rollNumber}</span>
                              <span className="text-[10px] text-[#64748B]">{s.studentId}</span>
                            </td>

                            {/* Name & Avatar */}
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-full bg-[#153B66]/10 text-[#153B66] flex items-center justify-center font-bold text-xs shrink-0">
                                  {s.firstName[0]}
                                  {s.lastName[0]}
                                </div>
                                <div>
                                  <span className="font-bold text-[#1E293B] block">{s.fullName}</span>
                                  <span className="text-[10px] text-[#64748B]">{s.gender} • {s.batch}</span>
                                </div>
                              </div>
                            </td>

                            {/* Attendance Status Selection */}
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {/* Present */}
                                <button
                                  type="button"
                                  onClick={() => handleSetStudentStatus(s.id, "Present")}
                                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                                    currentStatus === "Present"
                                      ? "bg-[#16A34A] text-white shadow-xs"
                                      : "bg-[#F1F5F9] text-[#475569] hover:bg-[#E2E8F0]"
                                  }`}
                                >
                                  {currentStatus === "Present" && <Check className="w-3.5 h-3.5" />}
                                  <span>Present</span>
                                </button>

                                {/* Absent */}
                                <button
                                  type="button"
                                  onClick={() => handleSetStudentStatus(s.id, "Absent")}
                                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                                    currentStatus === "Absent"
                                      ? "bg-[#DC2626] text-white shadow-xs"
                                      : "bg-[#F1F5F9] text-[#475569] hover:bg-[#E2E8F0]"
                                  }`}
                                >
                                  {currentStatus === "Absent" && <Check className="w-3.5 h-3.5" />}
                                  <span>Absent</span>
                                </button>

                                {/* Late */}
                                <button
                                  type="button"
                                  onClick={() => handleSetStudentStatus(s.id, "Late")}
                                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                                    currentStatus === "Late"
                                      ? "bg-[#D97706] text-white shadow-xs"
                                      : "bg-[#F1F5F9] text-[#475569] hover:bg-[#E2E8F0]"
                                  }`}
                                >
                                  {currentStatus === "Late" && <Check className="w-3.5 h-3.5" />}
                                  <span>Late</span>
                                </button>

                                {/* On Leave */}
                                <button
                                  type="button"
                                  onClick={() => handleSetStudentStatus(s.id, "On Leave")}
                                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                                    currentStatus === "On Leave"
                                      ? "bg-[#0284C7] text-white shadow-xs"
                                      : "bg-[#F1F5F9] text-[#475569] hover:bg-[#E2E8F0]"
                                  }`}
                                >
                                  {currentStatus === "On Leave" && <Check className="w-3.5 h-3.5" />}
                                  <span>On Leave</span>
                                </button>
                              </div>
                            </td>

                            {/* Remarks Input */}
                            <td className="py-3 px-4">
                              <input
                                type="text"
                                placeholder="Optional remark (e.g. medical, transport)"
                                value={currentRemarks}
                                onChange={(e) => handleSetStudentRemarks(s.id, e.target.value)}
                                className="w-full text-xs border border-[#CBD5E1] rounded px-2.5 py-1.5 bg-white text-[#1E293B] focus:border-[#2563EB] focus:outline-none"
                              />
                            </td>

                            {/* Action */}
                            <td className="py-3 px-4 text-right">
                              <Link href={`/admin/students`}>
                                <Button variant="ghost" size="sm">
                                  Profile
                                </Button>
                              </Link>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Bottom Footer Action Bar */}
              <div className="p-4 bg-[#F8FAFC] border-t border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <span className="text-xs text-[#64748B]">
                  Ensure all records are reviewed before finalizing register entry. Duplicate prevention is enforced.
                </span>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setOverrideStatuses({})}
                    leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                  >
                    Reset Roster
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleSaveAttendance}
                    leftIcon={<Save className="w-4 h-4" />}
                  >
                    Save Attendance Register
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: ATTENDANCE HISTORY & LOGS                         */}
      {/* ========================================================= */}
      {activeTab === "history" && (
        <div className="space-y-6">
          {/* History Filters Card */}
          <Card>
            <CardHeader className="pb-3 border-b border-[#E2E8F0]">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Attendance Register History</CardTitle>
                  <p className="text-xs text-[#64748B] mt-0.5">
                    Search and inspect recorded attendance registers across dates and cohorts
                  </p>
                </div>
                <Badge variant="teal" size="sm">
                  {filteredHistoryRecords.length} Records Found
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
                {/* Search */}
                <div>
                  <label className="text-[11px] font-bold text-[#475569] uppercase tracking-wider block mb-1">
                    Search Student / Roll No
                  </label>
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-2.5 top-2.5 text-[#94A3B8]" />
                    <input
                      type="text"
                      placeholder="e.g. Aarav, 24CSE001"
                      value={historySearch}
                      onChange={(e) => setHistorySearch(e.target.value)}
                      className="w-full text-xs pl-8 pr-3 py-2 border border-[#CBD5E1] rounded-lg bg-white text-[#1E293B]"
                    />
                  </div>
                </div>

                {/* Class Filter */}
                <div>
                  <label className="text-[11px] font-bold text-[#475569] uppercase tracking-wider block mb-1">
                    Filter Cohort
                  </label>
                  <select
                    value={historyFilterClass}
                    onChange={(e) => setHistoryFilterClass(e.target.value)}
                    className="w-full text-xs border border-[#CBD5E1] rounded-lg p-2 bg-white text-[#1E293B]"
                  >
                    <option value="all">All Classes</option>
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status Filter */}
                <div>
                  <label className="text-[11px] font-bold text-[#475569] uppercase tracking-wider block mb-1">
                    Status
                  </label>
                  <select
                    value={historyFilterStatus}
                    onChange={(e) => setHistoryFilterStatus(e.target.value)}
                    className="w-full text-xs border border-[#CBD5E1] rounded-lg p-2 bg-white text-[#1E293B]"
                  >
                    <option value="all">All Statuses</option>
                    <option value="Present">Present Only</option>
                    <option value="Absent">Absent Only</option>
                    <option value="Late">Late Arrivals</option>
                    <option value="On Leave">Authorized Leave</option>
                  </select>
                </div>

                {/* Start Date */}
                <div>
                  <label className="text-[11px] font-bold text-[#475569] uppercase tracking-wider block mb-1">
                    From Date
                  </label>
                  <input
                    type="date"
                    value={historyStartDate}
                    onChange={(e) => setHistoryStartDate(e.target.value)}
                    className="w-full text-xs border border-[#CBD5E1] rounded-lg p-2 bg-white text-[#1E293B]"
                  />
                </div>

                {/* End Date */}
                <div>
                  <label className="text-[11px] font-bold text-[#475569] uppercase tracking-wider block mb-1">
                    To Date
                  </label>
                  <input
                    type="date"
                    value={historyEndDate}
                    onChange={(e) => setHistoryEndDate(e.target.value)}
                    className="w-full text-xs border border-[#CBD5E1] rounded-lg p-2 bg-white text-[#1E293B]"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* History Records Table */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F8FAFC] text-[#475569] uppercase font-bold text-[11px] border-b border-[#E2E8F0]">
                    <tr>
                      <th className="py-3 px-4">Date & Session</th>
                      <th className="py-3 px-4">Student & Roll No</th>
                      <th className="py-3 px-4">Class & Section</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Recorded By / Remarks</th>
                      <th className="py-3 px-4 text-right">Auditable Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F1F5F9]">
                    {filteredHistoryRecords.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-[#64748B]">
                          No attendance records matched the specified filter criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredHistoryRecords.map((r) => (
                        <tr key={r.id} className="hover:bg-[#F8FAFC] transition-colors">
                          {/* Date & Session */}
                          <td className="py-3 px-4">
                            <span className="font-bold text-[#1E293B] block">{r.date}</span>
                            <span className="text-[10px] text-[#64748B]">{r.session}</span>
                          </td>

                          {/* Student */}
                          <td className="py-3 px-4">
                            <span className="font-bold text-[#153B66] block">{r.studentName}</span>
                            <span className="text-[10px] text-[#64748B]">Roll: {r.rollNumber}</span>
                          </td>

                          {/* Class */}
                          <td className="py-3 px-4">
                            <span className="font-medium text-[#1E293B] block">{r.className || "Class Cohort"}</span>
                            <span className="text-[10px] text-[#64748B]">{r.sectionName || "Section A"}</span>
                          </td>

                          {/* Status */}
                          <td className="py-3 px-4">
                            <Badge
                              variant={
                                r.status === "Present"
                                  ? "teal"
                                  : r.status === "Absent"
                                  ? "error"
                                  : r.status === "Late"
                                  ? "warning"
                                  : "navy"
                              }
                              size="sm"
                            >
                              {r.status}
                            </Badge>
                            {r.isCorrected && (
                              <span className="text-[9px] bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE] px-1 py-0.2 rounded ml-1 font-semibold">
                                Corrected
                              </span>
                            )}
                          </td>

                          {/* Remarks */}
                          <td className="py-3 px-4">
                            <span className="text-[#1E293B] block">{r.remarks || "—"}</span>
                            <span className="text-[10px] text-[#64748B]">By {r.markedBy}</span>
                          </td>

                          {/* Action */}
                          <td className="py-3 px-4 text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openCorrectionModal(r)}
                              leftIcon={<RotateCcw className="w-3.5 h-3.5 text-[#2563EB]" />}
                            >
                              Correct Record
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: ATTENDANCE REPORTS & METRICS                      */}
      {/* ========================================================= */}
      {activeTab === "reports" && (
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2E8F0] pb-3">
              <div>
                <CardTitle>Student Attendance Reports & Compliance</CardTitle>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Term aggregate calculations, percentage fulfillment, and institutional compliance matrices
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportCSV}
                  leftIcon={<Download className="w-4 h-4 text-[#2563EB]" />}
                >
                  Download CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              {/* Search & Filter Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-2.5 top-2.5 text-[#94A3B8]" />
                  <input
                    type="text"
                    placeholder="Search student name, roll number..."
                    value={reportSearch}
                    onChange={(e) => setReportSearch(e.target.value)}
                    className="w-full text-xs pl-8 pr-3 py-2 border border-[#CBD5E1] rounded-lg bg-white text-[#1E293B]"
                  />
                </div>

                <div>
                  <select
                    value={reportClassFilter}
                    onChange={(e) => setReportClassFilter(e.target.value)}
                    className="w-full text-xs border border-[#CBD5E1] rounded-lg p-2 bg-white text-[#1E293B]"
                  >
                    <option value="all">All Classes & Cohorts</option>
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2 text-xs text-[#64748B] justify-end">
                  <Filter className="w-4 h-4 text-[#2563EB]" />
                  <span>Showing {studentSummaries.length} Students</span>
                </div>
              </div>

              {/* Aggregated Student Table */}
              <div className="overflow-x-auto border border-[#E2E8F0] rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F8FAFC] text-[#475569] uppercase font-bold text-[11px] border-b border-[#E2E8F0]">
                    <tr>
                      <th className="py-3 px-4">Roll No</th>
                      <th className="py-3 px-4">Student Name</th>
                      <th className="py-3 px-4">Class & Section</th>
                      <th className="py-3 px-4 text-center">Sessions</th>
                      <th className="py-3 px-4 text-center">Present</th>
                      <th className="py-3 px-4 text-center">Absent</th>
                      <th className="py-3 px-4 text-center">Late</th>
                      <th className="py-3 px-4 text-center">Leave</th>
                      <th className="py-3 px-4 text-right">Attendance Rate</th>
                      <th className="py-3 px-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F1F5F9]">
                    {studentSummaries.map((s) => (
                      <tr key={s.studentId} className="hover:bg-[#F8FAFC] transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-[#153B66]">
                          {s.rollNumber}
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-bold text-[#1E293B] block">{s.studentName}</span>
                          <span className="text-[10px] text-[#64748B]">{s.studentUniqueId}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-[#1E293B] block">{s.className}</span>
                          <span className="text-[10px] text-[#64748B]">{s.sectionName || "Section A"}</span>
                        </td>
                        <td className="py-3 px-4 text-center font-bold text-[#1E293B]">
                          {s.totalSessions}
                        </td>
                        <td className="py-3 px-4 text-center font-bold text-[#16A34A]">
                          {s.presentCount}
                        </td>
                        <td className="py-3 px-4 text-center font-bold text-[#DC2626]">
                          {s.absentCount}
                        </td>
                        <td className="py-3 px-4 text-center font-bold text-[#D97706]">
                          {s.lateCount}
                        </td>
                        <td className="py-3 px-4 text-center font-bold text-[#0284C7]">
                          {s.leaveCount}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex flex-col items-end">
                            <span className="font-black text-[#153B66] text-sm">{s.percentage}%</span>
                            <div className="w-16 bg-[#E2E8F0] h-1.5 rounded-full overflow-hidden mt-1">
                              <div
                                className={`h-full rounded-full ${
                                  s.isBelowThreshold
                                    ? "bg-[#DC2626]"
                                    : s.isWarning
                                    ? "bg-[#F59E0B]"
                                    : "bg-[#16A34A]"
                                }`}
                                style={{ width: `${Math.min(100, s.percentage)}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {s.isBelowThreshold ? (
                            <Badge variant="error" size="sm">
                              Defaulter
                            </Badge>
                          ) : s.isWarning ? (
                            <Badge variant="warning" size="sm">
                              At Risk
                            </Badge>
                          ) : (
                            <Badge variant="teal" size="sm">
                              Eligible
                            </Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 5: LOW ATTENDANCE ALERTS & CONFIGURATION             */}
      {/* ========================================================= */}
      {activeTab === "alerts" && (
        <div className="space-y-6">
          {/* Threshold Configuration Card */}
          <Card className="border-l-4 border-l-[#2563EB]">
            <CardHeader className="pb-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Sliders className="w-5 h-5 text-[#2563EB]" />
                    Institutional Minimum Attendance Threshold
                  </CardTitle>
                  <p className="text-xs text-[#64748B] mt-0.5">
                    Configure the mandatory institutional minimum attendance policy for examination eligibility
                  </p>
                </div>
                {thresholdSavedNotice && (
                  <Badge variant="teal" size="md">
                    Threshold Settings Saved
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0]">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#1E293B]">
                    Minimum Attendance Required: <span className="text-[#2563EB] text-sm">{customMinThreshold}%</span>
                  </label>
                  <p className="text-[11px] text-[#64748B]">
                    University/VTU standard policy requires 75% attendance for examination hall ticket generation.
                  </p>
                </div>

                <div className="flex items-center gap-3 ml-auto">
                  <input
                    type="range"
                    min="50"
                    max="90"
                    step="1"
                    value={customMinThreshold}
                    onChange={(e) => setCustomMinThreshold(Number(e.target.value))}
                    className="w-48 accent-[#2563EB]"
                  />
                  <span className="text-sm font-extrabold text-[#153B66] w-12 text-center">
                    {customMinThreshold}%
                  </span>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleSaveThreshold}
                  >
                    Save Threshold
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Defaulter Students Table */}
          <Card className="border-t-4 border-t-[#DC2626]">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="flex items-center gap-2 text-[#991B1B]">
                  <AlertTriangle className="w-5 h-5 text-[#DC2626]" />
                  Defaulter Students Below Threshold ({defaulterStudents.length})
                </CardTitle>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Students below {attendanceThreshold.minimumPercentage}% attendance requiring immediate parental notification
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCSV}
                leftIcon={<Download className="w-4 h-4 text-[#DC2626]" />}
              >
                Export Defaulter List
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {defaulterStudents.length === 0 ? (
                <div className="p-12 text-center text-[#16A34A]">
                  <CheckCircle2 className="w-10 h-10 mx-auto text-[#16A34A] mb-2" />
                  <p className="text-sm font-bold">Excellent! No students are currently below the attendance threshold.</p>
                  <p className="text-xs text-[#64748B] mt-1">All active students are meeting the {attendanceThreshold.minimumPercentage}% compliance mark.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#FEF2F2] text-[#991B1B] uppercase font-bold text-[11px] border-b border-[#FECACA]">
                      <tr>
                        <th className="py-3 px-4">Roll No</th>
                        <th className="py-3 px-4">Student Name</th>
                        <th className="py-3 px-4">Class & Section</th>
                        <th className="py-3 px-4 text-center">Sessions Attended</th>
                        <th className="py-3 px-4 text-right">Attendance Rate</th>
                        <th className="py-3 px-4">Guardian Contact</th>
                        <th className="py-3 px-4 text-right">Intervention Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#FEE2E2]">
                      {defaulterStudents.map((s) => (
                        <tr key={s.studentId} className="hover:bg-[#FEF2F2]/50 transition-colors">
                          <td className="py-3 px-4 font-mono font-bold text-[#DC2626]">
                            {s.rollNumber}
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-bold text-[#1E293B] block">{s.studentName}</span>
                            <span className="text-[10px] text-[#64748B]">{s.studentUniqueId}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-[#1E293B] block">{s.className}</span>
                            <span className="text-[10px] text-[#64748B]">{s.sectionName || "Section A"}</span>
                          </td>
                          <td className="py-3 px-4 text-center font-bold text-[#1E293B]">
                            {s.presentCount + s.lateCount} / {s.totalSessions} sessions
                          </td>
                          <td className="py-3 px-4 text-right">
                            <span className="text-sm font-black text-[#DC2626] block">{s.percentage}%</span>
                            <span className="text-[10px] text-[#991B1B] font-semibold">
                              Shortfall: {(attendanceThreshold.minimumPercentage - s.percentage).toFixed(1)}%
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-bold text-[#1E293B] block">{s.guardianName || "Guardian On Record"}</span>
                            <span className="text-[10px] text-[#64748B]">{s.guardianPhone || s.guardianEmail || "+91 98450 77665"}</span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-[#FECACA] hover:bg-[#FEE2E2] text-[#DC2626]"
                              onClick={() => setAlertTargetStudent(s)}
                              leftIcon={<Send className="w-3.5 h-3.5 text-[#DC2626]" />}
                            >
                              Dispatch Notice
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Warning Cohort Table (At Risk) */}
          {warningStudents.length > 0 && (
            <Card className="border-t-4 border-t-[#F59E0B]">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-[#D97706] flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  At-Risk Students (Between {attendanceThreshold.minimumPercentage}% and {attendanceThreshold.warningPercentage}%)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#FFFBEB] text-[#92400E] uppercase font-bold text-[11px] border-b border-[#FDE68A]">
                      <tr>
                        <th className="py-2.5 px-4">Roll No</th>
                        <th className="py-2.5 px-4">Student Name</th>
                        <th className="py-2.5 px-4">Class</th>
                        <th className="py-2.5 px-4 text-right">Attendance %</th>
                        <th className="py-2.5 px-4 text-right">Advisory Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#FEF3C7]">
                      {warningStudents.map((s) => (
                        <tr key={s.studentId} className="hover:bg-[#FFFBEB]/50 transition-colors">
                          <td className="py-2.5 px-4 font-mono font-bold text-[#D97706]">{s.rollNumber}</td>
                          <td className="py-2.5 px-4 font-bold text-[#1E293B]">{s.studentName}</td>
                          <td className="py-2.5 px-4 text-[#64748B]">{s.className}</td>
                          <td className="py-2.5 px-4 text-right font-black text-[#D97706]">{s.percentage}%</td>
                          <td className="py-2.5 px-4 text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setAlertTargetStudent(s)}
                            >
                              Send Advisory
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 6: CORRECTION AUDIT TRAIL LOG                        */}
      {/* ========================================================= */}
      {activeTab === "audits" && (
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-[#E2E8F0]">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <History className="w-5 h-5 text-[#2563EB]" />
                  Attendance Correction Audit Trail
                </CardTitle>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Complete immutable historical log of authorized attendance adjustments and compliance justifications
                </p>
              </div>
              <Badge variant="navy" size="md">
                {attendanceAudits.length} Audit Entries
              </Badge>
            </CardHeader>
            <CardContent className="p-0">
              {attendanceAudits.length === 0 ? (
                <div className="p-12 text-center text-[#64748B]">
                  <CheckCircle2 className="w-10 h-10 mx-auto text-[#CBD5E1] mb-2" />
                  <p className="text-sm font-semibold">No attendance corrections on record.</p>
                  <p className="text-xs mt-1">All registers currently reflect original marking data.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#F8FAFC] text-[#475569] uppercase font-bold text-[11px] border-b border-[#E2E8F0]">
                      <tr>
                        <th className="py-3 px-4">Audit Timestamp</th>
                        <th className="py-3 px-4">Student & Roll No</th>
                        <th className="py-3 px-4">Date & Session</th>
                        <th className="py-3 px-4">Status Transition</th>
                        <th className="py-3 px-4">Institutional Reason</th>
                        <th className="py-3 px-4">Authorized By</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F1F5F9]">
                      {attendanceAudits.map((a) => (
                        <tr key={a.id} className="hover:bg-[#F8FAFC] transition-colors">
                          <td className="py-3 px-4">
                            <span className="font-bold text-[#1E293B] block">
                              {new Date(a.correctedAt).toLocaleDateString("en-IN", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                            <span className="text-[10px] text-[#64748B]">
                              {new Date(a.correctedAt).toLocaleTimeString("en-IN", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-bold text-[#153B66] block">{a.studentName}</span>
                            <span className="text-[10px] text-[#64748B]">Roll: {a.rollNumber}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-medium text-[#1E293B] block">{a.date}</span>
                            <span className="text-[10px] text-[#64748B]">{a.session}</span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1.5 font-bold">
                              <span className="text-[#DC2626] line-through">{a.previousStatus}</span>
                              <span className="text-[#64748B]">➔</span>
                              <span className="text-[#16A34A]">{a.updatedStatus}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 max-w-xs">
                            <p className="text-[#1E293B] font-medium leading-relaxed">{a.reason}</p>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-semibold text-[#153B66] block">{a.correctedBy}</span>
                            <span className="text-[10px] text-[#14B8A6] font-bold">Verified Audit Record</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: CORRECTION AUDIT MODAL                            */}
      {/* ========================================================= */}
      {correctionTarget && (
        <Modal
          isOpen={true}
          onClose={() => setCorrectionTarget(null)}
          title="Attendance Record Correction"
          maxWidth="md"
        >
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-[#64748B]">Student:</span>
                <span className="font-bold text-[#1E293B]">
                  {correctionTarget.studentName} ({correctionTarget.rollNumber})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Class Cohort:</span>
                <span className="font-medium text-[#1E293B]">
                  {correctionTarget.className} – {correctionTarget.sectionName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Session Date:</span>
                <span className="font-medium text-[#1E293B]">
                  {correctionTarget.date} ({correctionTarget.session})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Current Status:</span>
                <Badge
                  variant={
                    correctionTarget.status === "Present"
                      ? "teal"
                      : correctionTarget.status === "Absent"
                      ? "error"
                      : "warning"
                  }
                  size="sm"
                >
                  {correctionTarget.status}
                </Badge>
              </div>
            </div>

            {correctionError && (
              <Alert variant="error" title="Validation Error">
                {correctionError}
              </Alert>
            )}

            <div>
              <label className="text-xs font-bold text-[#475569] uppercase tracking-wider block mb-1.5">
                New Corrected Status <span className="text-[#DC2626]">*</span>
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(["Present", "Absent", "Late", "On Leave"] as AttendanceStatus[]).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setCorrectionNewStatus(st)}
                    className={`p-2 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                      correctionNewStatus === st
                        ? "bg-[#2563EB] text-white border-[#2563EB] shadow-xs"
                        : "bg-white text-[#475569] border-[#CBD5E1] hover:bg-[#F1F5F9]"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-[#475569] uppercase tracking-wider block mb-1.5">
                Correction Justification & Reason <span className="text-[#DC2626]">*</span>
              </label>
              <textarea
                rows={3}
                placeholder="State the verifiable reason (e.g., medical slip submitted to HOD office, transport bus breakdown)..."
                value={correctionReason}
                onChange={(e) => setCorrectionReason(e.target.value)}
                className="w-full text-xs border border-[#CBD5E1] rounded-lg p-2.5 bg-white text-[#1E293B] focus:border-[#2563EB] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#475569] uppercase tracking-wider block mb-1.5">
                Authorizing Administrator
              </label>
              <input
                type="text"
                value={correctionAuthor}
                onChange={(e) => setCorrectionAuthor(e.target.value)}
                className="w-full text-xs border border-[#CBD5E1] rounded-lg p-2 bg-white text-[#1E293B]"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#E2E8F0]">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCorrectionTarget(null)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleApplyCorrection}
                leftIcon={<Save className="w-4 h-4" />}
              >
                Apply & Record Audit
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ========================================================= */}
      {/* MODAL: GUARDIAN ALERT DISPATCH MODAL                      */}
      {/* ========================================================= */}
      {alertTargetStudent && (
        <Modal
          isOpen={true}
          onClose={() => setAlertTargetStudent(null)}
          title="Dispatch Low Attendance Guardian Notice"
          maxWidth="md"
        >
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-[#FEF2F2] border border-[#FECACA] space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-[#991B1B] font-semibold">Student:</span>
                <span className="font-bold text-[#1E293B]">
                  {alertTargetStudent.studentName} ({alertTargetStudent.rollNumber})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#991B1B] font-semibold">Attendance Rate:</span>
                <span className="font-black text-[#DC2626]">
                  {alertTargetStudent.percentage}% (Threshold: {attendanceThreshold.minimumPercentage}%)
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#991B1B] font-semibold">Primary Guardian:</span>
                <span className="font-bold text-[#1E293B]">
                  {alertTargetStudent.guardianName || "Guardian On Record"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#991B1B] font-semibold">Contact Details:</span>
                <span className="text-[#1E293B]">
                  {alertTargetStudent.guardianPhone || alertTargetStudent.guardianEmail || "+91 98450 77665"}
                </span>
              </div>
            </div>

            {alertSuccessMessage && (
              <Alert variant="success" title="Dispatch Successful">
                {alertSuccessMessage}
              </Alert>
            )}

            <div>
              <label className="text-xs font-bold text-[#475569] uppercase tracking-wider block mb-1.5">
                Dispatch Notification Channel
              </label>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {(["sms", "email", "both"] as const).map((ch) => (
                  <button
                    key={ch}
                    type="button"
                    onClick={() => setAlertChannel(ch)}
                    className={`p-2.5 rounded-lg font-bold border transition-all cursor-pointer uppercase ${
                      alertChannel === ch
                        ? "bg-[#153B66] text-white border-[#153B66] shadow-xs"
                        : "bg-white text-[#475569] border-[#CBD5E1] hover:bg-[#F1F5F9]"
                    }`}
                  >
                    {ch}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-xs text-[#64748B]">
              <p className="font-bold text-[#1E293B] mb-1">Standard Institutional Notice Text:</p>
              <p className="italic">
                &ldquo;Dear Guardian, this is an official advisory from {profile.name}. Your ward {alertTargetStudent.studentName} has recorded {alertTargetStudent.percentage}% attendance, which is below the mandatory {attendanceThreshold.minimumPercentage}% institutional threshold. Please contact the department mentor immediately.&rdquo;
              </p>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#E2E8F0]">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAlertTargetStudent(null)}
              >
                Close
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleDispatchGuardianAlert}
                leftIcon={<Send className="w-4 h-4" />}
              >
                Send Official Notice
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
