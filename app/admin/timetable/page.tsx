"use client";

import React, { useState, useMemo } from "react";
import { useInstitution } from "@/lib/store";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Alert } from "@/components/ui/alert";
import {
  Clock,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  Layers,
  Building,
  User,
  Users,
  Copy,
  AlertTriangle,
  BookOpen,
  Settings,
  Check,
} from "lucide-react";
import {
  TimetableSlot,
  TimetableDayOfWeek,
  PeriodConfig,
  SubjectType,
} from "@/types/institution";

const DAYS_OF_WEEK: TimetableDayOfWeek[] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export default function TimetablePage() {
  const {
    academicYears,
    activeAcademicYear,
    courses,
    classes,
    sections,
    subjects,
    staff,
    periodConfigs,
    timetableSlots,
    addTimetableSlot,
    updateTimetableSlot,
    deleteTimetableSlot,
    clearSectionTimetable,
    copyDaySchedule,
    checkTimetableConflicts,
    getSubjectAllocationStats,
    getAvailableRooms,
  } = useInstitution();

  // Academic Year & Term Context
  const [selectedAYId, setSelectedAYId] = useState<string>(
    activeAcademicYear?.id || academicYears[0]?.id || "ay-2026-27"
  );
  const currentAY = useMemo(
    () => academicYears.find((ay) => ay.id === selectedAYId) || academicYears[0],
    [academicYears, selectedAYId]
  );

  const [selectedTermId, setSelectedTermId] = useState<string>(
    currentAY?.terms.find((t) => t.isCurrent)?.id || currentAY?.terms[0]?.id || "term-odd-2026"
  );

  // View Mode: "class" | "teacher" | "day"
  const [viewMode, setViewMode] = useState<"class" | "teacher" | "day">("class");

  // Selection states for Class View
  const [selectedCourseId, setSelectedCourseId] = useState<string>(courses[0]?.id || "");
  const filteredClasses = useMemo(
    () => classes.filter((c) => !selectedCourseId || c.courseId === selectedCourseId),
    [classes, selectedCourseId]
  );

  const [selectedClassId, setSelectedClassId] = useState<string>(
    filteredClasses[0]?.id || classes[0]?.id || ""
  );

  const filteredSections = useMemo(
    () => sections.filter((s) => s.classId === selectedClassId),
    [sections, selectedClassId]
  );

  const [selectedSectionId, setSelectedSectionId] = useState<string>("");

  const effectiveSectionId = useMemo(() => {
    if (filteredSections.some((s) => s.id === selectedSectionId)) {
      return selectedSectionId;
    }
    return filteredSections[0]?.id || "";
  }, [filteredSections, selectedSectionId]);

  // Selected entities objects
  const activeClass = useMemo(
    () => classes.find((c) => c.id === selectedClassId),
    [classes, selectedClassId]
  );
  const activeSection = useMemo(
    () => sections.find((s) => s.id === effectiveSectionId),
    [sections, effectiveSectionId]
  );

  // Selection state for Teacher View
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>(
    staff.find((st) => st.status === "Active")?.id || staff[0]?.id || ""
  );
  const activeTeacher = useMemo(
    () => staff.find((st) => st.id === selectedTeacherId),
    [staff, selectedTeacherId]
  );

  // Selection state for Day Master View
  const [selectedDay, setSelectedDay] = useState<TimetableDayOfWeek>("Monday");

  // Slot Modal States
  const [isSlotModalOpen, setIsSlotModalOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<TimetableSlot | null>(null);

  // Form State for Slot
  const [slotDay, setSlotDay] = useState<TimetableDayOfWeek>("Monday");
  const [slotPeriodConfigId, setSlotPeriodConfigId] = useState<string>(
    periodConfigs.find((p) => !p.isBreak)?.id || "p-1"
  );
  const [slotStartTime, setSlotStartTime] = useState<string>("09:00");
  const [slotEndTime, setSlotEndTime] = useState<string>("09:50");
  const [slotSubjectId, setSlotSubjectId] = useState<string>("");
  const [slotTeacherId, setSlotTeacherId] = useState<string>("");
  const [slotRoomNumber, setSlotRoomNumber] = useState<string>("");
  const [slotRemarks, setSlotRemarks] = useState<string>("");

  // Period Config Modal
  const [isPeriodModalOpen, setIsPeriodModalOpen] = useState(false);

  // Copy Schedule Modal
  const [isCopyModalOpen, setIsCopyModalOpen] = useState(false);
  const [copySourceDay, setCopySourceDay] = useState<TimetableDayOfWeek>("Monday");
  const [copyTargetDay, setCopyTargetDay] = useState<TimetableDayOfWeek>("Tuesday");

  // Notifications
  const [toastMessage, setToastMessage] = useState<{
    type: "success" | "error" | "info" | "warning";
    text: string;
  } | null>(null);

  const showToast = (type: "success" | "error" | "info" | "warning", text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 5000);
  };

  // Filtered Slots for the current Class & Section
  const classSectionSlots = useMemo(() => {
    return timetableSlots.filter((slot) => {
      const matchAY = !selectedAYId || slot.academicYearId === selectedAYId;
      const matchTerm = !selectedTermId || slot.termId === selectedTermId;
      const matchClass = slot.classId === selectedClassId;
      const matchSection = slot.sectionId === effectiveSectionId;
      return matchAY && matchTerm && matchClass && matchSection;
    });
  }, [timetableSlots, selectedAYId, selectedTermId, selectedClassId, effectiveSectionId]);

  // Filtered Slots for selected Teacher
  const teacherSlots = useMemo(() => {
    return timetableSlots.filter((slot) => {
      const matchAY = !selectedAYId || slot.academicYearId === selectedAYId;
      const matchTerm = !selectedTermId || slot.termId === selectedTermId;
      const matchTeacher = slot.teacherId === selectedTeacherId;
      return matchAY && matchTerm && matchTeacher;
    });
  }, [timetableSlots, selectedAYId, selectedTermId, selectedTeacherId]);

  // Overall KPI statistics
  const kpiStats = useMemo(() => {
    const termSlots = timetableSlots.filter((s) => {
      const matchAY = !selectedAYId || s.academicYearId === selectedAYId;
      const matchTerm = !selectedTermId || s.termId === selectedTermId;
      return matchAY && matchTerm;
    });

    const totalSlots = termSlots.length;
    const uniqueTeachers = new Set(termSlots.map((s) => s.teacherId)).size;
    const uniqueRooms = new Set(termSlots.map((s) => s.roomNumber.trim().toLowerCase())).size;

    // Total weekly hours
    const totalMinutes = termSlots.reduce((acc, slot) => {
      const [sh, sm] = slot.startTime.split(":").map(Number);
      const [eh, em] = slot.endTime.split(":").map(Number);
      return acc + Math.max(0, eh * 60 + em - (sh * 60 + sm));
    }, 0);
    const totalHours = (totalMinutes / 60).toFixed(1);

    return { totalSlots, uniqueTeachers, uniqueRooms, totalHours };
  }, [timetableSlots, selectedAYId, selectedTermId]);

  // Subjects belonging to active class
  const classSubjects = useMemo(() => {
    return subjects.filter((s) => !selectedClassId || s.classId === selectedClassId);
  }, [subjects, selectedClassId]);

  // Available room suggestions
  const availableRoomsList = useMemo(() => getAvailableRooms(), [getAvailableRooms]);

  // Live Conflict Detection for current modal form values
  const currentFormConflicts = useMemo(() => {
    if (!isSlotModalOpen) return { hasConflicts: false, canProceed: true, conflicts: [] };

    return checkTimetableConflicts({
      id: editingSlot?.id,
      academicYearId: selectedAYId,
      termId: selectedTermId,
      dayOfWeek: slotDay,
      startTime: slotStartTime,
      endTime: slotEndTime,
      teacherId: slotTeacherId,
      roomNumber: slotRoomNumber,
      classId: selectedClassId,
      sectionId: effectiveSectionId,
    });
  }, [
    isSlotModalOpen,
    editingSlot,
    selectedAYId,
    selectedTermId,
    slotDay,
    slotStartTime,
    slotEndTime,
    slotTeacherId,
    slotRoomNumber,
    selectedClassId,
    effectiveSectionId,
    checkTimetableConflicts,
  ]);

  // Open Add Slot Modal
  const handleOpenAddSlot = (day?: TimetableDayOfWeek, periodConf?: PeriodConfig) => {
    setEditingSlot(null);
    setSlotDay(day || "Monday");

    const p = periodConf || periodConfigs.find((p) => !p.isBreak) || periodConfigs[0];
    setSlotPeriodConfigId(p.id);
    setSlotStartTime(p.startTime);
    setSlotEndTime(p.endTime);

    // Default subject to first available in class
    const defaultSubj = classSubjects[0];
    setSlotSubjectId(defaultSubj?.id || "");

    // Try to auto-select teacher allocated to subject, or fallback
    if (defaultSubj?.allocatedTeacherName) {
      const matchedTeacher = staff.find(
        (st) =>
          st.fullName.toLowerCase().includes(defaultSubj.allocatedTeacherName!.toLowerCase()) ||
          defaultSubj.allocatedTeacherName!.toLowerCase().includes(st.lastName.toLowerCase())
      );
      setSlotTeacherId(matchedTeacher?.id || staff[0]?.id || "");
    } else {
      setSlotTeacherId(staff[0]?.id || "");
    }

    // Default room from active section
    setSlotRoomNumber(activeSection?.roomNumber || availableRoomsList[0] || "LH-301, Ramanujan Block");
    setSlotRemarks("");
    setIsSlotModalOpen(true);
  };

  // Open Edit Slot Modal
  const handleOpenEditSlot = (slot: TimetableSlot) => {
    setEditingSlot(slot);
    setSlotDay(slot.dayOfWeek);
    setSlotPeriodConfigId(slot.periodConfigId);
    setSlotStartTime(slot.startTime);
    setSlotEndTime(slot.endTime);
    setSlotSubjectId(slot.subjectId);
    setSlotTeacherId(slot.teacherId);
    setSlotRoomNumber(slot.roomNumber);
    setSlotRemarks(slot.remarks || "");
    setIsSlotModalOpen(true);
  };

  // When user selects a Period preset in modal, auto-update times
  const handlePeriodPresetChange = (periodId: string) => {
    setSlotPeriodConfigId(periodId);
    const p = periodConfigs.find((pc) => pc.id === periodId);
    if (p) {
      setSlotStartTime(p.startTime);
      setSlotEndTime(p.endTime);
    }
  };

  // When user selects a Subject in modal, try to match teacher
  const handleSubjectChange = (subjectId: string) => {
    setSlotSubjectId(subjectId);
    const subj = subjects.find((s) => s.id === subjectId);
    if (subj?.allocatedTeacherName) {
      const matchedTeacher = staff.find((st) =>
        st.fullName.toLowerCase().includes(subj.allocatedTeacherName!.toLowerCase())
      );
      if (matchedTeacher) {
        setSlotTeacherId(matchedTeacher.id);
      }
    }
  };

  // Handle Save Slot (Add or Update)
  const handleSaveSlot = (e: React.FormEvent) => {
    e.preventDefault();

    if (!slotSubjectId) {
      showToast("error", "Please select a curriculum subject.");
      return;
    }
    if (!slotTeacherId) {
      showToast("error", "Please assign a faculty instructor.");
      return;
    }
    if (!slotRoomNumber.trim()) {
      showToast("error", "Please assign a lecture room or lab venue.");
      return;
    }

    const subj = subjects.find((s) => s.id === slotSubjectId);
    const teacher = staff.find((st) => st.id === slotTeacherId);
    const pConfig = periodConfigs.find((p) => p.id === slotPeriodConfigId);

    const slotPayload = {
      academicYearId: selectedAYId,
      academicYearName: currentAY?.name || "2026-2027",
      termId: selectedTermId,
      termName: currentAY?.terms.find((t) => t.id === selectedTermId)?.name || "Current Term",
      courseId: activeClass?.courseId || selectedCourseId,
      courseName: activeClass?.courseName || "B.Tech Program",
      classId: selectedClassId,
      className: activeClass?.name || "Selected Class",
      sectionId: effectiveSectionId,
      sectionName: activeSection?.name || "Section A",
      dayOfWeek: slotDay,
      periodNumber: pConfig ? pConfig.periodNumber : 1,
      periodConfigId: slotPeriodConfigId,
      startTime: slotStartTime,
      endTime: slotEndTime,
      subjectId: slotSubjectId,
      subjectCode: subj ? subj.code : "SUBJ",
      subjectName: subj ? subj.name : "Curriculum Subject",
      subjectType: (subj ? subj.type : "Core Theory") as SubjectType,
      teacherId: slotTeacherId,
      teacherName: teacher ? teacher.fullName : "Faculty Member",
      teacherEmployeeId: teacher?.employeeId,
      roomNumber: slotRoomNumber.trim(),
      remarks: slotRemarks.trim() || undefined,
    };

    if (editingSlot) {
      const res = updateTimetableSlot(editingSlot.id, slotPayload);
      if (!res.success) {
        const errorMsg = res.conflicts?.[0]?.message || "Could not update slot due to scheduling conflict.";
        showToast("error", errorMsg);
        return;
      }
      showToast("success", `Updated slot: ${slotPayload.subjectCode} on ${slotDay} (${slotStartTime}-${slotEndTime}).`);
    } else {
      const res = addTimetableSlot(slotPayload);
      if (!res.success) {
        const errorMsg = res.conflicts?.[0]?.message || "Could not schedule slot due to scheduling conflict.";
        showToast("error", errorMsg);
        return;
      }
      showToast("success", `Scheduled slot: ${slotPayload.subjectCode} on ${slotDay} (${slotStartTime}-${slotEndTime}).`);
    }

    setIsSlotModalOpen(false);
  };

  // Delete slot
  const handleDeleteSlot = (id: string, code: string, day: string) => {
    if (window.confirm(`Are you sure you want to delete the scheduled slot for ${code} on ${day}?`)) {
      deleteTimetableSlot(id);
      showToast("info", `Removed timetable slot for ${code}.`);
    }
  };

  // Clear entire day for section
  const handleClearDay = (day: TimetableDayOfWeek) => {
    if (
      window.confirm(
        `Are you sure you want to clear all scheduled slots for ${day} in ${activeClass?.name} (${activeSection?.name})?`
      )
    ) {
      clearSectionTimetable(selectedClassId, effectiveSectionId, day, selectedAYId, selectedTermId);
      showToast("info", `Cleared all slots for ${day}.`);
    }
  };

  // Execute Copy Day Schedule
  const handleExecuteCopy = () => {
    if (copySourceDay === copyTargetDay) {
      showToast("warning", "Source day and target day must be different.");
      return;
    }

    const res = copyDaySchedule(
      copySourceDay,
      copyTargetDay,
      selectedClassId,
      effectiveSectionId,
      selectedAYId,
      selectedTermId
    );

    if (res.copiedCount > 0) {
      showToast(
        "success",
        `Successfully replicated ${res.copiedCount} period slots from ${copySourceDay} to ${copyTargetDay}.${
          res.conflictCount > 0 ? ` (${res.conflictCount} slots skipped due to venue or faculty conflicts)` : ""
        }`
      );
    } else if (res.conflictCount > 0) {
      showToast("error", `Could not copy schedule: All ${res.conflictCount} slots encountered teacher/venue conflicts.`);
    } else {
      showToast("warning", `No slots found on ${copySourceDay} to copy.`);
    }

    setIsCopyModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 max-w-md animate-in fade-in slide-in-from-top-4 duration-200">
          <Alert
            variant={
              toastMessage.type === "success"
                ? "success"
                : toastMessage.type === "error"
                ? "error"
                : toastMessage.type === "warning"
                ? "warning"
                : "info"
            }
          >
            {toastMessage.text}
          </Alert>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-teal-600 bg-teal-50 px-2 py-0.5 rounded">
              Academic Operations
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs text-slate-500">Master Class Scheduling & Venue Matrix</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1 flex items-center gap-2.5">
            <Clock className="h-6 w-6 text-[#153B66]" />
            Timetable & Scheduling Management
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Construct weekly cohort timetables, allocate faculty teaching periods, balance subject quotas, and prevent room & teacher overlaps.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsPeriodModalOpen(true)}
            className="gap-1.5 text-slate-700 hover:text-slate-900 border-slate-300"
          >
            <Settings className="h-4 w-4 text-slate-500" />
            Bell Schedule / Periods
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCopyModalOpen(true)}
            disabled={!effectiveSectionId}
            className="gap-1.5 text-slate-700 hover:text-slate-900 border-slate-300"
          >
            <Copy className="h-4 w-4 text-slate-500" />
            Duplicate Day Schedule
          </Button>

          <Button
            onClick={() => handleOpenAddSlot()}
            disabled={!effectiveSectionId}
            className="gap-2 bg-[#153B66] hover:bg-[#153B66]/90 text-white shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Schedule Period Slot
          </Button>
        </div>
      </div>

      {/* Top Academic Year, Term & View Mode Controls Bar */}
      <Card className="border-slate-200 shadow-sm bg-white">
        <CardContent className="p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Academic Year Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-600">Academic Year:</span>
              <select
                value={selectedAYId}
                onChange={(e) => setSelectedAYId(e.target.value)}
                className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#153B66]"
              >
                {academicYears.map((ay) => (
                  <option key={ay.id} value={ay.id}>
                    AY {ay.name} {ay.isActive ? "(Active)" : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Academic Term Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-600">Term / Sem:</span>
              <select
                value={selectedTermId}
                onChange={(e) => setSelectedTermId(e.target.value)}
                className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#153B66]"
              >
                {currentAY?.terms.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} {t.isCurrent ? "• Current" : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* View Mode Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-start lg:self-center">
            <button
              onClick={() => setViewMode("class")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                viewMode === "class"
                  ? "bg-white text-[#153B66] shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              Class / Section Grid
            </button>
            <button
              onClick={() => setViewMode("teacher")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                viewMode === "teacher"
                  ? "bg-white text-[#153B66] shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <User className="h-3.5 w-3.5" />
              Faculty Workload View
            </button>
            <button
              onClick={() => setViewMode("day")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                viewMode === "day"
                  ? "bg-white text-[#153B66] shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Calendar className="h-3.5 w-3.5" />
              Day-wise Master View
            </button>
          </div>
        </CardContent>
      </Card>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-slate-200 shadow-sm bg-white hover:border-slate-300 transition-colors">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Scheduled Periods
              </p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{kpiStats.totalSlots}</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Active term sessions</p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Clock className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm bg-white hover:border-slate-300 transition-colors">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Weekly Teaching Hours
              </p>
              <h3 className="text-2xl font-bold text-teal-600 mt-1">{kpiStats.totalHours} hrs</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Contact hours scheduled</p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <BookOpen className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm bg-white hover:border-slate-300 transition-colors">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Teaching Faculty
              </p>
              <h3 className="text-2xl font-bold text-indigo-600 mt-1">{kpiStats.uniqueTeachers}</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Assigned to timetables</p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm bg-white hover:border-slate-300 transition-colors">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Venues & Labs Utilized
              </p>
              <h3 className="text-2xl font-bold text-amber-600 mt-1">{kpiStats.uniqueRooms}</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Assigned classrooms & labs</p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Building className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* =========================================================================
          VIEW 1: CLASS & SECTION WEEKLY GRID
      ========================================================================= */}
      {viewMode === "class" && (
        <div className="space-y-6">
          {/* Class & Section Selection Toolbar */}
          <Card className="border-slate-200 shadow-sm bg-white">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Course Dropdown */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Degree Program / Course
                  </label>
                  <select
                    value={selectedCourseId}
                    onChange={(e) => setSelectedCourseId(e.target.value)}
                    className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-md p-2.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#153B66]"
                  >
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.code} — {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Class Dropdown */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Class & Semester Cohort
                  </label>
                  <select
                    value={selectedClassId}
                    onChange={(e) => setSelectedClassId(e.target.value)}
                    className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-md p-2.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#153B66]"
                  >
                    {filteredClasses.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name} ({cls.code})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Section Dropdown */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Section
                  </label>
                  <select
                    value={effectiveSectionId}
                    onChange={(e) => setSelectedSectionId(e.target.value)}
                    className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-md p-2.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#153B66]"
                  >
                    {filteredSections.map((sec) => (
                      <option key={sec.id} value={sec.id}>
                        {sec.name} ({sec.batchName})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Active Section Summary & Subject Allocation Tracker */}
              {activeSection && activeClass && (
                <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4 text-xs">
                  <div className="flex flex-wrap items-center gap-3 text-slate-600">
                    <span className="font-semibold text-slate-900 flex items-center gap-1.5">
                      <Building className="h-3.5 w-3.5 text-slate-500" />
                      Home Room: <span className="text-[#153B66]">{activeSection.roomNumber}</span>
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="font-semibold text-slate-900 flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-slate-500" />
                      Class Teacher: <span className="text-[#153B66]">{activeSection.classTeacherName}</span>
                    </span>
                    <span className="text-slate-300">•</span>
                    <span>Cap: {activeSection.maxCapacity} students</span>
                  </div>

                  {/* Subject Hours Coverage Indicators */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mr-1">
                      Curriculum Hours:
                    </span>
                    {classSubjects.map((sub) => {
                      const stats = getSubjectAllocationStats(
                        sub.id,
                        selectedClassId,
                        effectiveSectionId,
                        selectedAYId,
                        selectedTermId
                      );

                      return (
                        <span
                          key={sub.id}
                          title={`${sub.name}: ${stats.scheduledHours} hrs scheduled out of ${stats.targetHoursPerWeek} hrs required (${stats.scheduledSlotsCount} periods)`}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium border ${
                            stats.isFulfilled
                              ? "bg-teal-50 text-teal-700 border-teal-200"
                              : stats.isOverAllocated
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : "bg-slate-50 text-slate-600 border-slate-200"
                          }`}
                        >
                          <span className="font-mono font-bold">{sub.code}:</span>
                          <span>{stats.scheduledHours} / {stats.targetHoursPerWeek}h</span>
                          {stats.isFulfilled && <Check className="h-2.5 w-2.5 text-teal-600" />}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Weekly Timetable Grid Table */}
          <Card className="border-slate-200 shadow-sm bg-white overflow-hidden">
            <CardHeader className="p-4 border-b border-slate-100 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
                  <span>Weekly Schedule Matrix: {activeClass?.name} — {activeSection?.name}</span>
                  <Badge variant="teal">
                    {classSectionSlots.length} sessions active
                  </Badge>
                </CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">
                  Click on any empty cell to schedule a period; click on existing session to modify.
                </p>
              </div>

              <div className="text-xs text-slate-400">
                Term: {currentAY?.terms.find((t) => t.id === selectedTermId)?.name}
              </div>
            </CardHeader>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="p-3 font-bold text-slate-700 w-28 text-center border-r border-slate-200 uppercase tracking-wider text-[11px]">
                      Day / Period
                    </th>
                    {periodConfigs.map((p) => (
                      <th
                        key={p.id}
                        className={`p-2.5 font-semibold text-center border-r border-slate-200 ${
                          p.isBreak ? "bg-amber-50/70 text-amber-900 w-24" : "text-slate-800 min-w-[150px]"
                        }`}
                      >
                        <div className="font-bold">{p.label}</div>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                          {p.startTime} - {p.endTime}
                        </div>
                        {p.isBreak && (
                          <span className="inline-block mt-0.5 text-[9px] uppercase tracking-wider font-bold text-amber-700 bg-amber-100/60 px-1.5 rounded">
                            Break
                          </span>
                        )}
                      </th>
                    ))}
                    <th className="p-3 text-center text-slate-600 font-semibold w-20">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {DAYS_OF_WEEK.map((day) => {
                    const daySlots = classSectionSlots.filter((s) => s.dayOfWeek === day);

                    return (
                      <tr key={day} className="hover:bg-slate-50/40 transition-colors">
                        {/* Day Column */}
                        <td className="p-3 font-bold text-slate-900 text-center bg-slate-50/60 border-r border-slate-200">
                          <div className="text-sm font-bold text-[#153B66]">{day.slice(0, 3)}</div>
                          <div className="text-[10px] font-normal text-slate-500">{day}</div>
                          <span className="inline-block mt-1 text-[10px] text-slate-500 font-mono">
                            {daySlots.length} slots
                          </span>
                        </td>

                        {/* Period Columns */}
                        {periodConfigs.map((p) => {
                          if (p.isBreak) {
                            return (
                              <td
                                key={p.id}
                                className="p-2 text-center bg-amber-50/30 border-r border-slate-200 align-middle"
                              >
                                <div className="text-[10px] font-medium text-amber-700 writing-mode-vertical transform rotate-180 inline-block uppercase tracking-wider opacity-60">
                                  {p.label}
                                </div>
                              </td>
                            );
                          }

                          // Find matching slot for this day and period
                          const slot = daySlots.find(
                            (s) =>
                              s.periodConfigId === p.id ||
                              (s.periodNumber === p.periodNumber &&
                                s.startTime === p.startTime &&
                                s.endTime === p.endTime)
                          );

                          return (
                            <td
                              key={p.id}
                              className="p-1.5 border-r border-slate-200 align-top h-24"
                            >
                              {slot ? (
                                <div className="h-full rounded-lg border border-slate-200 p-2 bg-white shadow-2xs hover:shadow-sm hover:border-[#153B66] transition-all flex flex-col justify-between group">
                                  <div>
                                    <div className="flex items-center justify-between gap-1 mb-1">
                                      <span className="font-mono font-bold text-[#153B66] text-xs">
                                        {slot.subjectCode}
                                      </span>
                                      <span
                                        className={`px-1.5 py-0.2 rounded text-[9px] font-semibold ${
                                          slot.subjectType === "Practical / Lab"
                                            ? "bg-purple-100 text-purple-700"
                                            : slot.subjectType === "Department Elective"
                                            ? "bg-amber-100 text-amber-700"
                                            : "bg-blue-100 text-blue-700"
                                        }`}
                                      >
                                        {slot.subjectType === "Practical / Lab"
                                          ? "Lab"
                                          : slot.subjectType === "Department Elective"
                                          ? "Elective"
                                          : "Theory"}
                                      </span>
                                    </div>
                                    <h5
                                      className="font-medium text-slate-800 text-[11px] line-clamp-1"
                                      title={slot.subjectName}
                                    >
                                      {slot.subjectName}
                                    </h5>
                                  </div>

                                  <div className="mt-1.5 pt-1.5 border-t border-slate-100 space-y-0.5 text-[10px] text-slate-500">
                                    <div className="flex items-center gap-1 text-slate-700 truncate" title={slot.teacherName}>
                                      <User className="h-2.5 w-2.5 text-slate-400 shrink-0" />
                                      <span className="truncate">{slot.teacherName}</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-slate-600 truncate" title={slot.roomNumber}>
                                      <Building className="h-2.5 w-2.5 text-slate-400 shrink-0" />
                                      <span className="truncate font-mono">{slot.roomNumber}</span>
                                    </div>
                                  </div>

                                  {/* Hover Actions */}
                                  <div className="mt-1.5 flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                      type="button"
                                      onClick={() => handleOpenEditSlot(slot)}
                                      className="p-1 text-slate-500 hover:text-blue-600 rounded hover:bg-slate-100"
                                      title="Edit Session"
                                    >
                                      <Edit2 className="h-3 w-3" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteSlot(slot.id, slot.subjectCode, day)}
                                      className="p-1 text-slate-400 hover:text-red-600 rounded hover:bg-red-50"
                                      title="Delete Session"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleOpenAddSlot(day, p)}
                                  className="w-full h-full min-h-[70px] rounded-lg border border-dashed border-slate-200 hover:border-[#153B66] hover:bg-blue-50/40 text-slate-400 hover:text-[#153B66] flex flex-col items-center justify-center gap-1 transition-all group"
                                  title={`Schedule period for ${day} ${p.label}`}
                                >
                                  <Plus className="h-3.5 w-3.5 group-hover:scale-110 transition-transform" />
                                  <span className="text-[10px] font-medium">Assign</span>
                                </button>
                              )}
                            </td>
                          );
                        })}

                        {/* Day Action */}
                        <td className="p-2 text-center align-middle">
                          <button
                            type="button"
                            onClick={() => handleClearDay(day)}
                            disabled={daySlots.length === 0}
                            className={`p-1.5 rounded transition-colors text-xs ${
                              daySlots.length > 0
                                ? "text-slate-400 hover:text-red-600 hover:bg-red-50"
                                : "text-slate-200 cursor-not-allowed"
                            }`}
                            title={`Clear all slots on ${day}`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* =========================================================================
          VIEW 2: FACULTY / TEACHER WORKLOAD VIEW
      ========================================================================= */}
      {viewMode === "teacher" && (
        <div className="space-y-6">
          <Card className="border-slate-200 shadow-sm bg-white">
            <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1 max-w-md">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Select Faculty Member
                </label>
                <select
                  value={selectedTeacherId}
                  onChange={(e) => setSelectedTeacherId(e.target.value)}
                  className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-md p-2.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#153B66]"
                >
                  {staff.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.fullName} ({st.employeeId}) — {st.designation} ({st.status})
                    </option>
                  ))}
                </select>
              </div>

              {activeTeacher && (
                <div className="flex flex-wrap items-center gap-4 bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase">Department</span>
                    <span className="font-semibold text-slate-800">{activeTeacher.departmentName}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase">Status</span>
                    <Badge variant={activeTeacher.status === "Active" ? "success" : "warning"}>
                      {activeTeacher.status}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase">Weekly Load</span>
                    <span className="font-bold text-[#153B66] text-sm">
                      {teacherSlots.length} periods ({teacherSlots.length * 0.83 > 0 ? (teacherSlots.length * 0.83).toFixed(1) : 0} hrs)
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Teacher Schedule Table */}
          <Card className="border-slate-200 shadow-sm bg-white overflow-hidden">
            <CardHeader className="p-4 border-b border-slate-100 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
                <span>Faculty Schedule: {activeTeacher?.fullName}</span>
                <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                  {teacherSlots.length} active sessions
                </span>
              </CardTitle>
              <span className="text-xs text-slate-500 font-mono">
                Emp ID: {activeTeacher?.employeeId}
              </span>
            </CardHeader>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="p-3 font-bold text-slate-700 w-28 text-center border-r border-slate-200">
                      Day
                    </th>
                    {periodConfigs
                      .filter((p) => !p.isBreak)
                      .map((p) => (
                        <th
                          key={p.id}
                          className="p-2.5 font-semibold text-center border-r border-slate-200 min-w-[140px]"
                        >
                          <div className="font-bold">{p.label}</div>
                          <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                            {p.startTime} - {p.endTime}
                          </div>
                        </th>
                      ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {DAYS_OF_WEEK.map((day) => {
                    const daySlots = teacherSlots.filter((s) => s.dayOfWeek === day);

                    return (
                      <tr key={day} className="hover:bg-slate-50/40 transition-colors">
                        <td className="p-3 font-bold text-[#153B66] text-center bg-slate-50/60 border-r border-slate-200">
                          {day}
                        </td>

                        {periodConfigs
                          .filter((p) => !p.isBreak)
                          .map((p) => {
                            const slot = daySlots.find(
                              (s) =>
                                s.periodConfigId === p.id ||
                                (s.startTime === p.startTime && s.endTime === p.endTime)
                            );

                            return (
                              <td
                                key={p.id}
                                className="p-2 border-r border-slate-200 align-top h-20"
                              >
                                {slot ? (
                                  <div className="h-full rounded-md border border-blue-200 p-2 bg-blue-50/50 flex flex-col justify-between">
                                    <div>
                                      <div className="flex items-center justify-between">
                                        <span className="font-mono font-bold text-[#153B66]">
                                          {slot.subjectCode}
                                        </span>
                                        <span className="font-semibold text-slate-700 text-[10px]">
                                          {slot.sectionName}
                                        </span>
                                      </div>
                                      <p className="text-[11px] text-slate-800 font-medium line-clamp-1 mt-0.5">
                                        {slot.className}
                                      </p>
                                    </div>
                                    <div className="mt-1 flex items-center justify-between text-[10px] text-slate-600 font-mono">
                                      <span>Room: {slot.roomNumber}</span>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="h-full flex items-center justify-center text-slate-300 text-[10px] font-medium">
                                    Free
                                  </div>
                                )}
                              </td>
                            );
                          })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* =========================================================================
          VIEW 3: DAY-WISE MASTER VIEW
      ========================================================================= */}
      {viewMode === "day" && (
        <div className="space-y-6">
          <Card className="border-slate-200 shadow-sm bg-white">
            <CardContent className="p-4 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-700">Select Day:</span>
                <div className="flex items-center gap-1">
                  {DAYS_OF_WEEK.map((day) => (
                    <button
                      key={day}
                      onClick={() => setSelectedDay(day)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        selectedDay === day
                          ? "bg-[#153B66] text-white shadow-xs"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>

              <div className="text-xs text-slate-500">
                Institutional view across all classes for {selectedDay}
              </div>
            </CardContent>
          </Card>

          {/* Master Daily Schedule Across All Sections */}
          <Card className="border-slate-200 shadow-sm bg-white overflow-hidden">
            <CardHeader className="p-4 border-b border-slate-100">
              <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
                <span>Institution Master Schedule: {selectedDay}</span>
              </CardTitle>
            </CardHeader>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="p-3 font-bold text-slate-700 w-48 border-r border-slate-200">
                      Class & Section
                    </th>
                    {periodConfigs
                      .filter((p) => !p.isBreak)
                      .map((p) => (
                        <th
                          key={p.id}
                          className="p-2.5 font-semibold text-center border-r border-slate-200 min-w-[130px]"
                        >
                          <div className="font-bold">{p.label}</div>
                          <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                            {p.startTime} - {p.endTime}
                          </div>
                        </th>
                      ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {sections.map((sec) => {
                    const secClass = classes.find((c) => c.id === sec.classId);
                    const secSlots = timetableSlots.filter(
                      (s) =>
                        s.sectionId === sec.id &&
                        s.dayOfWeek === selectedDay &&
                        (!selectedAYId || s.academicYearId === selectedAYId) &&
                        (!selectedTermId || s.termId === selectedTermId)
                    );

                    return (
                      <tr key={sec.id} className="hover:bg-slate-50/40 transition-colors">
                        <td className="p-3 bg-slate-50/50 border-r border-slate-200">
                          <div className="font-bold text-slate-900">{secClass?.code} — {sec.name}</div>
                          <div className="text-[10px] text-slate-500">{sec.batchName}</div>
                          <div className="text-[10px] text-[#153B66] font-mono mt-0.5">{sec.roomNumber}</div>
                        </td>

                        {periodConfigs
                          .filter((p) => !p.isBreak)
                          .map((p) => {
                            const slot = secSlots.find(
                              (s) =>
                                s.periodConfigId === p.id ||
                                (s.startTime === p.startTime && s.endTime === p.endTime)
                            );

                            return (
                              <td
                                key={p.id}
                                className="p-2 border-r border-slate-200 align-top h-16"
                              >
                                {slot ? (
                                  <div className="h-full rounded p-1.5 bg-slate-100 border border-slate-200 flex flex-col justify-between">
                                    <div className="font-mono font-bold text-[#153B66] text-xs">
                                      {slot.subjectCode}
                                    </div>
                                    <div className="text-[10px] text-slate-600 truncate mt-0.5">
                                      {slot.teacherName.split(" ").slice(-1)[0]} • {slot.roomNumber.split(",")[0]}
                                    </div>
                                  </div>
                                ) : (
                                  <div className="h-full flex items-center justify-center text-slate-300 text-[10px]">
                                    —
                                  </div>
                                )}
                              </td>
                            );
                          })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* =========================================================================
          MODAL 1: ASSIGN / EDIT PERIOD SLOT
      ========================================================================= */}
      <Modal
        isOpen={isSlotModalOpen}
        onClose={() => setIsSlotModalOpen(false)}
        title={editingSlot ? `Edit Period Slot (${editingSlot.subjectCode})` : "Schedule Period Slot"}
        maxWidth="lg"
      >
        <form onSubmit={handleSaveSlot} className="space-y-4">
          {/* Target Placement Badge */}
          <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-lg text-xs flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="font-semibold text-blue-900 block">
                Target: {activeClass?.name} — {activeSection?.name}
              </span>
              <span className="text-blue-700 text-[11px]">
                Term: {currentAY?.terms.find((t) => t.id === selectedTermId)?.name}
              </span>
            </div>
            <Badge variant="teal">{slotDay}</Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Day of Week */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Day of Week <span className="text-red-500">*</span>
              </label>
              <select
                value={slotDay}
                onChange={(e) => setSlotDay(e.target.value as TimetableDayOfWeek)}
                className="w-full text-xs font-medium bg-white border border-slate-300 rounded-md p-2.5 focus:outline-none focus:ring-1 focus:ring-[#153B66]"
              >
                {DAYS_OF_WEEK.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {/* Period Preset Bell Schedule */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Standard Period Preset <span className="text-red-500">*</span>
              </label>
              <select
                value={slotPeriodConfigId}
                onChange={(e) => handlePeriodPresetChange(e.target.value)}
                className="w-full text-xs font-medium bg-white border border-slate-300 rounded-md p-2.5 focus:outline-none focus:ring-1 focus:ring-[#153B66]"
              >
                {periodConfigs
                  .filter((p) => !p.isBreak)
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.label} ({p.startTime} - {p.endTime})
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {/* Start Time & End Time (Exact Overlap Support) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Start Time (24h) <span className="text-red-500">*</span>
              </label>
              <Input
                type="time"
                value={slotStartTime}
                onChange={(e) => setSlotStartTime(e.target.value)}
                className="font-mono text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                End Time (24h) <span className="text-red-500">*</span>
              </label>
              <Input
                type="time"
                value={slotEndTime}
                onChange={(e) => setSlotEndTime(e.target.value)}
                className="font-mono text-xs"
              />
            </div>
          </div>

          {/* Subject Dropdown */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Curriculum Subject <span className="text-red-500">*</span>
            </label>
            <select
              value={slotSubjectId}
              onChange={(e) => handleSubjectChange(e.target.value)}
              className="w-full text-xs font-medium bg-white border border-slate-300 rounded-md p-2.5 focus:outline-none focus:ring-1 focus:ring-[#153B66]"
            >
              <option value="">-- Choose Subject from Class Syllabus --</option>
              {classSubjects.map((sub) => {
                const stats = getSubjectAllocationStats(
                  sub.id,
                  selectedClassId,
                  effectiveSectionId,
                  selectedAYId,
                  selectedTermId
                );
                return (
                  <option key={sub.id} value={sub.id}>
                    {sub.code} — {sub.name} ({sub.type}, {stats.scheduledHours}h/{sub.hoursPerWeek}h allocated)
                  </option>
                );
              })}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Faculty Instructor */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Assigned Faculty Member <span className="text-red-500">*</span>
              </label>
              <select
                value={slotTeacherId}
                onChange={(e) => setSlotTeacherId(e.target.value)}
                className="w-full text-xs font-medium bg-white border border-slate-300 rounded-md p-2.5 focus:outline-none focus:ring-1 focus:ring-[#153B66]"
              >
                <option value="">-- Select Instructor --</option>
                {staff.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.fullName} ({st.employeeId}) {st.status === "On Leave" ? "• On Leave" : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Room / Venue Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Lecture Room / Venue <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="e.g. LH-301, Ramanujan Block"
                value={slotRoomNumber}
                onChange={(e) => setSlotRoomNumber(e.target.value)}
                list="room-suggestions"
              />
              <datalist id="room-suggestions">
                {availableRoomsList.map((rm) => (
                  <option key={rm} value={rm} />
                ))}
              </datalist>
            </div>
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Session Notes / Remarks (Optional)
            </label>
            <Input
              placeholder="e.g. Bring Lab manuals, Unit 2 test"
              value={slotRemarks}
              onChange={(e) => setSlotRemarks(e.target.value)}
            />
          </div>

          {/* Real-time Conflict Diagnostics Banner */}
          {currentFormConflicts.hasConflicts && (
            <div className="space-y-2 pt-2">
              {currentFormConflicts.conflicts.map((conf, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg border text-xs flex items-start gap-2 ${
                    conf.severity === "error"
                      ? "bg-red-50 border-red-200 text-red-800"
                      : "bg-amber-50 border-amber-200 text-amber-800"
                  }`}
                >
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-red-600" />
                  <div>
                    <span className="font-bold block">
                      {conf.severity === "error" ? "Scheduling Overlap Detected" : "Faculty Advisory"}
                    </span>
                    <span className="leading-relaxed">{conf.message}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsSlotModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!currentFormConflicts.canProceed}
              className="bg-[#153B66] hover:bg-[#153B66]/90 text-white"
            >
              {editingSlot ? "Update Session" : "Confirm & Schedule"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* =========================================================================
          MODAL 2: PERIOD / BELL SCHEDULE DRAWER
      ========================================================================= */}
      <Modal
        isOpen={isPeriodModalOpen}
        onClose={() => setIsPeriodModalOpen(false)}
        title="Institution Bell Schedule & Period Configuration"
        maxWidth="lg"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            Standard institutional period timings applied across degrees and cohort sections. Timetables dynamically check start and end time boundaries.
          </p>

          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="p-2.5 font-bold text-slate-700">Period</th>
                  <th className="p-2.5 font-bold text-slate-700">Label</th>
                  <th className="p-2.5 font-bold text-slate-700">Start Time</th>
                  <th className="p-2.5 font-bold text-slate-700">End Time</th>
                  <th className="p-2.5 font-bold text-slate-700 text-center">Type</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {periodConfigs.map((p) => (
                  <tr key={p.id} className={p.isBreak ? "bg-amber-50/40" : ""}>
                    <td className="p-2.5 font-mono font-bold text-[#153B66]">
                      {p.isBreak ? "Break" : `P-${p.periodNumber}`}
                    </td>
                    <td className="p-2.5 font-medium text-slate-800">{p.label}</td>
                    <td className="p-2.5 font-mono text-slate-600">{p.startTime}</td>
                    <td className="p-2.5 font-mono text-slate-600">{p.endTime}</td>
                    <td className="p-2.5 text-center">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          p.isBreak
                            ? "bg-amber-100 text-amber-800"
                            : "bg-blue-50 text-blue-800"
                        }`}
                      >
                        {p.type}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-end pt-3 border-t border-slate-200">
            <Button
              variant="outline"
              onClick={() => setIsPeriodModalOpen(false)}
            >
              Close
            </Button>
          </div>
        </div>
      </Modal>

      {/* =========================================================================
          MODAL 3: DUPLICATE / REPLICATE DAY SCHEDULE
      ========================================================================= */}
      <Modal
        isOpen={isCopyModalOpen}
        onClose={() => setIsCopyModalOpen(false)}
        title="Duplicate Day Schedule"
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="p-3 bg-blue-50 text-blue-800 border border-blue-200 rounded-lg text-xs leading-relaxed">
            Quickly duplicate Monday&apos;s schedule to another weekday. The conflict engine automatically verifies that faculty and classrooms are free on the destination day.
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Source Day (Copy From)
              </label>
              <select
                value={copySourceDay}
                onChange={(e) => setCopySourceDay(e.target.value as TimetableDayOfWeek)}
                className="w-full text-xs font-medium bg-white border border-slate-300 rounded-md p-2.5 focus:outline-none focus:ring-1 focus:ring-[#153B66]"
              >
                {DAYS_OF_WEEK.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Target Day (Paste Into)
              </label>
              <select
                value={copyTargetDay}
                onChange={(e) => setCopyTargetDay(e.target.value as TimetableDayOfWeek)}
                className="w-full text-xs font-medium bg-white border border-slate-300 rounded-md p-2.5 focus:outline-none focus:ring-1 focus:ring-[#153B66]"
              >
                {DAYS_OF_WEEK.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <Button
              variant="outline"
              onClick={() => setIsCopyModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleExecuteCopy}
              className="bg-[#153B66] hover:bg-[#153B66]/90 text-white"
            >
              Replicate Schedule
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
