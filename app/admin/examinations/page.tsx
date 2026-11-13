"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useInstitution } from "@/lib/store";
import {
  ExamType,
  ExamStatus,
  ExamMode,
  ExamHall,
  ExamSubjectSlot,
  ExaminationItem,
  ExamConflict,
} from "@/types/institution";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";
import { Modal } from "@/components/ui/modal";
import {
  FileSpreadsheet,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Search,
  Filter,
  Download,
  Edit,
  Trash2,
  ShieldAlert,
  ArrowLeft,
  Sparkles,
  BookOpen,
  History,
  DoorOpen,
  UserCheck,
  Layers,
} from "lucide-react";

interface StudentEligibilityItem {
  studentId: string;
  studentName: string;
  rollNumber: string;
  className: string;
  sectionName?: string;
  attendancePercentage: number;
  isAttendanceEligible: boolean;
  hasOverride: boolean;
  overrideStatus?: "Approved" | "Rejected";
  overrideReason?: string;
  finalEligible: boolean;
}

type ActiveTab =
  | "dashboard"
  | "examinations"
  | "scheduling"
  | "halls"
  | "invigilators"
  | "eligibility"
  | "reports";

const EXAM_TYPES: ExamType[] = [
  "End-Term",
  "Semester Examination",
  "Mid-Term",
  "Internal Assessment",
  "Practical Examination",
];

const EXAM_MODES: ExamMode[] = ["Theory", "Practical", "Both"];

export default function ExaminationsPage() {
  const {
    profile,
    academicYears,
    activeAcademicYear,
    courses,
    classes,
    sections,
    subjects,
    staff,
    attendanceThreshold,
    examinations,
    examHalls,
    examAudits,
    addExamination,
    updateExamination,
    deleteExamination,
    addExamSubjectSlot,
    updateExamSubjectSlot,
    deleteExamSubjectSlot,
    addExamHall,
    updateExamHall,
    deleteExamHall,
    checkExamConflicts,
    recordEligibilityOverride,
    getExamStudentsWithEligibility,
    getExamMetrics,
  } = useInstitution();

  // Navigation tab
  const [activeTab, setActiveTab] = useState<ActiveTab>("dashboard");

  // Notification Banner
  const [feedback, setFeedback] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);

  const showFeedback = (type: "success" | "error" | "info", message: string) => {
    setFeedback({ type, message });
    setTimeout(() => {
      setFeedback((prev) => (prev?.message === message ? null : prev));
    }, 6000);
  };

  // -------------------------------------------------------------
  // Filter States
  // -------------------------------------------------------------
  const [selectedAYId, setSelectedAYId] = useState<string>(
    activeAcademicYear?.id || (academicYears[0]?.id ?? "")
  );
  const [selectedCourseId, setSelectedCourseId] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchKeyword, setSearchKeyword] = useState<string>("");

  // Target examination for schedule management
  const [activeExamId, setActiveExamId] = useState<string>(
    examinations[0]?.id || ""
  );

  const selectedExam = useMemo(() => {
    return examinations.find((e) => e.id === activeExamId) || examinations[0] || null;
  }, [examinations, activeExamId]);

  // Filtered examinations list
  const filteredExaminations = useMemo(() => {
    return examinations.filter((exam) => {
      if (selectedAYId !== "all" && exam.academicYearId !== selectedAYId) return false;
      if (selectedCourseId !== "all" && exam.courseId !== selectedCourseId) return false;
      if (selectedStatus !== "all" && exam.status !== selectedStatus) return false;
      if (searchKeyword.trim()) {
        const q = searchKeyword.toLowerCase();
        const matchesName = exam.name.toLowerCase().includes(q);
        const matchesCode = exam.code.toLowerCase().includes(q);
        const matchesCourse = exam.courseName ? exam.courseName.toLowerCase().includes(q) : false;
        if (!matchesName && !matchesCode && !matchesCourse) return false;
      }
      return true;
    });
  }, [examinations, selectedAYId, selectedCourseId, selectedStatus, searchKeyword]);

  // Overall metrics
  const metrics = useMemo(() => getExamMetrics(), [getExamMetrics]);

  // -------------------------------------------------------------
  // Modal: Create / Edit Examination
  // -------------------------------------------------------------
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const [editingExamId, setEditingExamId] = useState<string | null>(null);
  const [examFormData, setExamFormData] = useState<{
    name: string;
    code: string;
    academicYearId: string;
    type: ExamType;
    courseId: string;
    classId: string;
    sectionId: string;
    startDate: string;
    endDate: string;
    description: string;
    status: ExamStatus;
  }>({
    name: "",
    code: "",
    academicYearId: activeAcademicYear?.id || (academicYears[0]?.id ?? ""),
    type: "End-Term",
    courseId: courses[0]?.id || "",
    classId: classes[0]?.id || "",
    sectionId: "all",
    startDate: "2026-11-13",
    endDate: "2026-11-27",
    description: "",
    status: "Draft",
  });

  const openCreateExamModal = () => {
    setEditingExamId(null);
    const defaultCourseId = courses[0]?.id || "";
    const matchingClasses = classes.filter((c) => c.courseId === defaultCourseId);
    const targetClass = matchingClasses[0] || classes[0];
    setExamFormData({
      name: "",
      code: `EXAM-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      academicYearId: activeAcademicYear?.id || (academicYears[0]?.id ?? ""),
      type: "End-Term",
      courseId: defaultCourseId,
      classId: targetClass?.id || "",
      sectionId: "all",
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0],
      description: "",
      status: "Draft",
    });
    setIsExamModalOpen(true);
  };

  const openEditExamModal = (exam: ExaminationItem) => {
    setEditingExamId(exam.id);
    setExamFormData({
      name: exam.name,
      code: exam.code,
      academicYearId: exam.academicYearId,
      type: exam.type,
      courseId: exam.courseId,
      classId: exam.classId,
      sectionId: exam.sectionId || "all",
      startDate: exam.startDate,
      endDate: exam.endDate,
      description: exam.description || "",
      status: exam.status,
    });
    setIsExamModalOpen(true);
  };

  const handleSaveExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!examFormData.name.trim() || !examFormData.code.trim()) {
      showFeedback("error", "Examination name and code are required.");
      return;
    }
    if (examFormData.startDate > examFormData.endDate) {
      showFeedback("error", "Examination Start Date cannot be after End Date.");
      return;
    }

    const selectedCourse = courses.find((c) => c.id === examFormData.courseId);
    const selectedAY = academicYears.find((ay) => ay.id === examFormData.academicYearId);
    const targetClass = classes.find((c) => c.id === examFormData.classId);
    const targetSection = sections.find((s) => s.id === examFormData.sectionId);

    if (editingExamId) {
      updateExamination(editingExamId, {
        name: examFormData.name.trim(),
        code: examFormData.code.trim().toUpperCase(),
        academicYearId: examFormData.academicYearId,
        academicYearName: selectedAY?.name || "",
        type: examFormData.type,
        courseId: examFormData.courseId,
        courseName: selectedCourse?.name || "",
        classId: examFormData.classId,
        className: targetClass?.name || "",
        sectionId: examFormData.sectionId === "all" ? undefined : examFormData.sectionId,
        sectionName: examFormData.sectionId === "all" ? "All Sections" : targetSection?.name,
        startDate: examFormData.startDate,
        endDate: examFormData.endDate,
        description: examFormData.description.trim(),
        status: examFormData.status,
      });
      showFeedback("success", `Examination "${examFormData.name}" updated successfully.`);
    } else {
      const res = addExamination({
        institutionId: profile.id,
        name: examFormData.name.trim(),
        code: examFormData.code.trim().toUpperCase(),
        academicYearId: examFormData.academicYearId,
        academicYearName: selectedAY?.name || "",
        type: examFormData.type,
        courseId: examFormData.courseId,
        courseName: selectedCourse?.name || "",
        classId: examFormData.classId,
        className: targetClass?.name || "",
        sectionId: examFormData.sectionId === "all" ? undefined : examFormData.sectionId,
        sectionName: examFormData.sectionId === "all" ? "All Sections" : targetSection?.name,
        startDate: examFormData.startDate,
        endDate: examFormData.endDate,
        status: examFormData.status,
        description: examFormData.description.trim(),
        slots: [],
      });
      if (res.success && res.examination) {
        setActiveExamId(res.examination.id);
        showFeedback("success", `Examination cycle "${res.examination.name}" created successfully.`);
      } else {
        showFeedback("error", res.message || "Failed to create examination.");
      }
    }
    setIsExamModalOpen(false);
  };

  const handleDeleteExam = (exam: ExaminationItem) => {
    if (exam.status === "Ongoing") {
      showFeedback("error", "Cannot delete an ongoing examination. Mark it cancelled or completed first.");
      return;
    }
    if (
      confirm(
        `Are you sure you want to delete examination "${exam.name}" (${exam.code}) and all its scheduled paper slots? This cannot be undone.`
      )
    ) {
      deleteExamination(exam.id);
      showFeedback("info", `Examination "${exam.name}" deleted.`);
    }
  };

  // -------------------------------------------------------------
  // Modal: Add / Edit Subject Slot (Timetable Entry)
  // -------------------------------------------------------------
  const [isSlotModalOpen, setIsSlotModalOpen] = useState(false);
  const [editingSlotId, setEditingSlotId] = useState<string | null>(null);
  const [slotFormData, setSlotFormData] = useState<{
    subjectId: string;
    examDate: string;
    startTime: string;
    endTime: string;
    mode: ExamMode;
    hallId: string;
    invigilatorId: string;
    maxMarks: number;
    passingMarks: number;
    instructions: string;
  }>({
    subjectId: "",
    examDate: "2026-11-13",
    startTime: "10:00",
    endTime: "13:00",
    mode: "Theory",
    hallId: examHalls[0]?.id || "",
    invigilatorId: staff[0]?.id || "",
    maxMarks: 100,
    passingMarks: 40,
    instructions: "",
  });

  // Clashes live check state inside modal
  const [slotConflicts, setSlotConflicts] = useState<ExamConflict[]>([]);

  // Filter available subjects for the active examination's course/classes
  const availableSubjectsForExam = useMemo(() => {
    if (!selectedExam) return subjects;
    return subjects.filter((s) => s.courseId === selectedExam.courseId);
  }, [subjects, selectedExam]);

  // Faculty staff (teachers)
  const facultyStaff = useMemo(() => {
    return staff.filter((st) => st.status === "Active");
  }, [staff]);

  const openCreateSlotModal = () => {
    if (!selectedExam) {
      showFeedback("error", "Please select or create an examination first.");
      return;
    }
    setEditingSlotId(null);
    const defaultSubject = availableSubjectsForExam[0] || subjects[0];

    setSlotFormData({
      subjectId: defaultSubject?.id || "",
      examDate: selectedExam.startDate,
      startTime: "10:00",
      endTime: "13:00",
      mode: "Theory",
      hallId: examHalls[0]?.id || "",
      invigilatorId: facultyStaff[0]?.id || "",
      maxMarks: 100,
      passingMarks: 40,
      instructions: "",
    });
    setSlotConflicts([]);
    setIsSlotModalOpen(true);
  };

  const openEditSlotModal = (slot: ExamSubjectSlot) => {
    setEditingSlotId(slot.id);
    setSlotFormData({
      subjectId: slot.subjectId,
      examDate: slot.examDate,
      startTime: slot.startTime,
      endTime: slot.endTime,
      mode: slot.mode,
      hallId: slot.hallId || examHalls[0]?.id || "",
      invigilatorId: slot.invigilatorId || facultyStaff[0]?.id || "",
      maxMarks: slot.maxMarks,
      passingMarks: slot.passingMarks,
      instructions: slot.instructions || "",
    });
    setSlotConflicts([]);
    setIsSlotModalOpen(true);
  };

  // Run live conflict preview whenever slot timings/hall/invigilator change
  const triggerConflictCheck = () => {
    if (!selectedExam) return [];
    const targetHall = examHalls.find((h) => h.id === slotFormData.hallId);
    const targetClass = classes.find((c) => c.id === selectedExam.classId);
    const enrolledStudents = targetClass ? targetClass.totalStudents : 60;

    const result = checkExamConflicts({
      slotId: editingSlotId || undefined,
      examinationId: selectedExam.id,
      examDate: slotFormData.examDate,
      startTime: slotFormData.startTime,
      endTime: slotFormData.endTime,
      hallId: slotFormData.hallId,
      capacity: targetHall?.capacity,
      allocatedCount: enrolledStudents,
      invigilatorId: slotFormData.invigilatorId,
      classId: selectedExam.classId,
      sectionId: selectedExam.sectionId,
      subjectId: slotFormData.subjectId,
    });
    setSlotConflicts(result.conflicts);
    return result.conflicts;
  };

  const handleSaveSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExam) return;

    if (slotFormData.startTime >= slotFormData.endTime) {
      showFeedback("error", "End time must be after Start time.");
      return;
    }

    const conflicts = triggerConflictCheck();
    const hardErrors = conflicts.filter((c) => c.severity === "error");
    if (hardErrors.length > 0) {
      showFeedback(
        "error",
        `Cannot save schedule slot due to ${hardErrors.length} conflict(s): ${hardErrors[0].message}`
      );
      return;
    }

    const targetSubject = subjects.find((s) => s.id === slotFormData.subjectId);
    const targetClass = classes.find((c) => c.id === selectedExam.classId);
    const targetHall = examHalls.find((h) => h.id === slotFormData.hallId);
    const primaryInv = staff.find((st) => st.id === slotFormData.invigilatorId);

    // Calculate duration in minutes
    const [sh, sm] = slotFormData.startTime.split(":").map(Number);
    const [eh, em] = slotFormData.endTime.split(":").map(Number);
    const durationMinutes = (eh * 60 + em) - (sh * 60 + sm);

    const slotPayload: Omit<ExamSubjectSlot, "id"> = {
      examinationId: selectedExam.id,
      subjectId: slotFormData.subjectId,
      subjectCode: targetSubject?.code || "SUB-001",
      subjectName: targetSubject?.name || "Subject",
      examDate: slotFormData.examDate,
      startTime: slotFormData.startTime,
      endTime: slotFormData.endTime,
      durationMinutes: durationMinutes > 0 ? durationMinutes : 180,
      mode: slotFormData.mode,
      hallId: slotFormData.hallId,
      hallName: targetHall?.name || "Main Examination Hall",
      hallCapacity: targetHall?.capacity || 60,
      allocatedStudentCount: targetClass ? targetClass.totalStudents : 60,
      invigilatorId: slotFormData.invigilatorId,
      invigilatorName: primaryInv?.fullName || "Invigilator",
      invigilatorEmployeeId: primaryInv?.employeeId,
      invigilatorDepartment: primaryInv?.departmentName,
      maxMarks: slotFormData.maxMarks,
      passingMarks: slotFormData.passingMarks,
      status: "Scheduled",
      instructions: slotFormData.instructions.trim() || undefined,
    };

    if (editingSlotId) {
      const res = updateExamSubjectSlot(selectedExam.id, editingSlotId, slotPayload);
      if (res.success) {
        showFeedback("success", `Paper "${targetSubject?.name}" updated in examination timetable.`);
        setIsSlotModalOpen(false);
      } else {
        showFeedback("error", res.conflicts?.[0]?.message || "Could not update slot.");
      }
    } else {
      const res = addExamSubjectSlot(selectedExam.id, slotPayload);
      if (res.success) {
        showFeedback("success", `Paper "${targetSubject?.name}" scheduled on ${slotFormData.examDate}.`);
        setIsSlotModalOpen(false);
      } else {
        showFeedback("error", res.conflicts?.[0]?.message || "Could not schedule slot.");
      }
    }
  };

  const handleDeleteSlot = (slot: ExamSubjectSlot) => {
    if (!selectedExam) return;
    if (confirm(`Remove paper "${slot.subjectName}" scheduled on ${slot.examDate}?`)) {
      deleteExamSubjectSlot(selectedExam.id, slot.id);
      showFeedback("info", `Paper "${slot.subjectName}" removed from examination schedule.`);
    }
  };

  // -------------------------------------------------------------
  // Modal: Examination Hall (Venue Management)
  // -------------------------------------------------------------
  const [isHallModalOpen, setIsHallModalOpen] = useState(false);
  const [editingHallId, setEditingHallId] = useState<string | null>(null);
  const [hallFormData, setHallFormData] = useState<{
    name: string;
    code: string;
    building: string;
    floor: string;
    capacity: number;
    status: "Available" | "Occupied" | "Maintenance";
  }>({
    name: "",
    code: "",
    building: "Academic Block A",
    floor: "3rd Floor",
    capacity: 60,
    status: "Available",
  });

  const openCreateHallModal = () => {
    setEditingHallId(null);
    setHallFormData({
      name: "",
      code: `HALL-${Math.floor(100 + Math.random() * 900)}`,
      building: "Academic Block A",
      floor: "2nd Floor",
      capacity: 60,
      status: "Available",
    });
    setIsHallModalOpen(true);
  };

  const openEditHallModal = (hall: ExamHall) => {
    setEditingHallId(hall.id);
    setHallFormData({
      name: hall.name,
      code: hall.code,
      building: hall.building,
      floor: hall.floor,
      capacity: hall.capacity,
      status: hall.status,
    });
    setIsHallModalOpen(true);
  };

  const handleSaveHall = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hallFormData.name.trim() || !hallFormData.code.trim()) {
      showFeedback("error", "Hall Name and Code are required.");
      return;
    }
    if (hallFormData.capacity <= 0) {
      showFeedback("error", "Capacity must be greater than 0.");
      return;
    }

    if (editingHallId) {
      updateExamHall(editingHallId, {
        name: hallFormData.name.trim(),
        code: hallFormData.code.trim().toUpperCase(),
        building: hallFormData.building.trim(),
        floor: hallFormData.floor.trim(),
        capacity: Number(hallFormData.capacity),
        status: hallFormData.status,
      });
      showFeedback("success", `Hall "${hallFormData.name}" updated successfully.`);
    } else {
      addExamHall({
        name: hallFormData.name.trim(),
        code: hallFormData.code.trim().toUpperCase(),
        building: hallFormData.building.trim(),
        floor: hallFormData.floor.trim(),
        capacity: Number(hallFormData.capacity),
        status: hallFormData.status,
      });
      showFeedback("success", `Examination Hall "${hallFormData.name}" created.`);
    }
    setIsHallModalOpen(false);
  };

  const handleDeleteHall = (hall: ExamHall) => {
    const isUsed = examinations.some((e) => e.slots.some((s) => s.hallId === hall.id));
    if (isUsed) {
      showFeedback("error", `Cannot delete hall "${hall.name}" because it is assigned to exam timetable slots.`);
      return;
    }
    if (confirm(`Are you sure you want to delete hall "${hall.name}" (${hall.code})?`)) {
      deleteExamHall(hall.id);
      showFeedback("info", `Hall "${hall.name}" deleted.`);
    }
  };

  // -------------------------------------------------------------
  // Eligibility & Overrides Tab State
  // -------------------------------------------------------------
  const [eligibilityExamId, setEligibilityExamId] = useState<string>(activeExamId);
  const targetEligibilityExam = useMemo(() => {
    return examinations.find((e) => e.id === eligibilityExamId) || examinations[0] || null;
  }, [examinations, eligibilityExamId]);

  const [eligibilityClassId, setEligibilityClassId] = useState<string>("all");

  const studentsWithEligibility = useMemo(() => {
    if (!targetEligibilityExam) return [];
    return getExamStudentsWithEligibility(targetEligibilityExam.id);
  }, [targetEligibilityExam, getExamStudentsWithEligibility]);

  // Eligibility summary counts
  const eligibilitySummary = useMemo(() => {
    const total = studentsWithEligibility.length;
    const eligibleCount = studentsWithEligibility.filter((s) => s.finalEligible).length;
    const defaultersCount = studentsWithEligibility.filter((s) => !s.finalEligible).length;
    const overriddenCount = studentsWithEligibility.filter((s) => s.hasOverride).length;
    return { total, eligibleCount, defaultersCount, overriddenCount };
  }, [studentsWithEligibility]);

  // Modal: Record Exemption / Override
  const [isOverrideModalOpen, setIsOverrideModalOpen] = useState(false);
  const [selectedStudentForOverride, setSelectedStudentForOverride] =
    useState<StudentEligibilityItem | null>(null);
  const [overrideDecision, setOverrideDecision] = useState<boolean>(true);
  const [overrideReason, setOverrideReason] = useState<string>("");

  const openOverrideModal = (item: StudentEligibilityItem) => {
    setSelectedStudentForOverride(item);
    setOverrideDecision(!item.finalEligible);
    setOverrideReason(item.overrideReason || "");
    setIsOverrideModalOpen(true);
  };

  const handleSaveOverride = (e: React.FormEvent) => {
    e.preventDefault();
    if (!overrideReason.trim()) {
      showFeedback("error", "A valid administrative justification reason is required.");
      return;
    }
    if (!targetEligibilityExam || !selectedStudentForOverride) return;

    recordEligibilityOverride({
      examinationId: targetEligibilityExam.id,
      studentId: selectedStudentForOverride.studentId,
      studentName: selectedStudentForOverride.studentName,
      rollNumber: selectedStudentForOverride.rollNumber,
      attendancePercentage: selectedStudentForOverride.attendancePercentage,
      status: overrideDecision ? "Approved" : "Rejected",
      reason: overrideReason.trim(),
      authorizedBy: "Institution Admin (Admin Console)",
    });

    showFeedback(
      "success",
      `Eligibility status updated for student ${selectedStudentForOverride.studentName}.`
    );
    setIsOverrideModalOpen(false);
  };

  // -------------------------------------------------------------
  // Invigilator Roster Data
  // -------------------------------------------------------------
  const [invigilatorFilterStaffId, setInvigilatorFilterStaffId] = useState<string>("all");

  const allScheduledSlotsAcrossExams = useMemo(() => {
    const list: (ExamSubjectSlot & { examName: string; examCode: string })[] = [];
    examinations.forEach((ex) => {
      ex.slots.forEach((sl) => {
        list.push({
          ...sl,
          examName: ex.name,
          examCode: ex.code,
        });
      });
    });
    return list;
  }, [examinations]);

  const invigilatorRoster = useMemo(() => {
    return facultyStaff.map((f) => {
      const duties = allScheduledSlotsAcrossExams.filter((s) => s.invigilatorId === f.id);
      return {
        faculty: f,
        duties,
        totalDuties: duties.length,
      };
    }).sort((a, b) => b.totalDuties - a.totalDuties);
  }, [facultyStaff, allScheduledSlotsAcrossExams]);

  const filteredInvigilatorRoster = useMemo(() => {
    if (invigilatorFilterStaffId === "all") return invigilatorRoster;
    return invigilatorRoster.filter((item) => item.faculty.id === invigilatorFilterStaffId);
  }, [invigilatorRoster, invigilatorFilterStaffId]);

  // -------------------------------------------------------------
  // CSV Exports
  // -------------------------------------------------------------
  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.setAttribute("download", filename);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showFeedback("success", `File "${filename}" downloaded successfully.`);
  };

  const exportExamTimetableCSV = () => {
    if (!selectedExam) {
      showFeedback("error", "Please select an examination first.");
      return;
    }
    const headers = [
      "Exam Name",
      "Exam Code",
      "Date",
      "Mode",
      "Start Time",
      "End Time",
      "Duration (mins)",
      "Subject Code",
      "Subject Name",
      "Exam Hall",
      "Allocated Students",
      "Invigilator",
      "Max Marks",
      "Passing Marks",
    ];
    const rows = selectedExam.slots.map((s) => [
      `"${selectedExam.name}"`,
      `"${selectedExam.code}"`,
      s.examDate,
      s.mode,
      s.startTime,
      s.endTime,
      s.durationMinutes,
      `"${s.subjectCode}"`,
      `"${s.subjectName}"`,
      `"${s.hallName || "TBD"}"`,
      s.allocatedStudentCount || 60,
      `"${s.invigilatorName || "Unassigned"}"`,
      s.maxMarks,
      s.passingMarks,
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    downloadCSV(csv, `${selectedExam.code}_Timetable.csv`);
  };

  const exportHallAllocationsCSV = () => {
    const headers = ["Hall Code", "Hall Name", "Building", "Floor", "Seating Capacity", "Status"];
    const rows = examHalls.map((h) => [
      h.code,
      `"${h.name}"`,
      `"${h.building}"`,
      `"${h.floor}"`,
      h.capacity,
      h.status,
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    downloadCSV(csv, "Examination_Halls_Matrix.csv");
  };

  const exportEligibilityCSV = () => {
    if (!targetEligibilityExam) return;
    const headers = [
      "Student ID",
      "Roll No",
      "Full Name",
      "Class",
      "Section",
      "Attendance %",
      "Threshold %",
      "System Eligible",
      "Admin Overridden",
      "Final Eligibility",
      "Override Justification",
    ];
    const rows = studentsWithEligibility.map((item) => [
      item.studentId,
      item.rollNumber || "-",
      `"${item.studentName}"`,
      `"${item.className || "-"}"`,
      `"${item.sectionName || "-"}"`,
      `${item.attendancePercentage.toFixed(1)}%`,
      `${attendanceThreshold.minimumPercentage}%`,
      item.isAttendanceEligible ? "YES" : "NO",
      item.hasOverride ? "YES" : "NO",
      item.finalEligible ? "ELIGIBLE" : "DEFAULTER",
      `"${item.overrideReason || "-"}"`,
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    downloadCSV(csv, `${targetEligibilityExam.code}_Student_Eligibility.csv`);
  };

  const exportInvigilatorRosterCSV = () => {
    const headers = [
      "Faculty ID",
      "Faculty Name",
      "Department",
      "Designation",
      "Total Duties",
      "Exam Code",
      "Exam Name",
      "Exam Date",
      "Time",
      "Subject",
      "Venue / Hall",
    ];
    const rows: string[][] = [];
    invigilatorRoster.forEach((item) => {
      if (item.duties.length === 0) {
        rows.push([
          item.faculty.employeeId,
          `"${item.faculty.fullName}"`,
          `"${item.faculty.departmentName || "-"}"`,
          `"${item.faculty.designation}"`,
          "0",
          "-",
          "-",
          "-",
          "-",
          "-",
          "-",
        ]);
      } else {
        item.duties.forEach((d) => {
          rows.push([
            item.faculty.employeeId,
            `"${item.faculty.fullName}"`,
            `"${item.faculty.departmentName || "-"}"`,
            `"${item.faculty.designation}"`,
            item.totalDuties.toString(),
            `"${d.examCode}"`,
            `"${d.examName}"`,
            d.examDate,
            `${d.startTime} - ${d.endTime}`,
            `"${d.subjectName}"`,
            `"${d.hallName || "TBD"}"`,
          ]);
        });
      }
    });
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    downloadCSV(csv, "Invigilator_Duty_Roster.csv");
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E2E8F0]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/admin"
              className="text-xs font-semibold text-[#2563EB] hover:underline flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Dashboard
            </Link>
            <span className="text-[#CBD5E1]">/</span>
            <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">
              Operations & Assessments
            </span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-[#1E293B] flex items-center gap-2.5">
              <FileSpreadsheet className="w-7 h-7 text-[#2563EB]" />
              Examination Management
            </h1>
            <Badge variant="teal" size="md">
              Phase 3 Live
            </Badge>
            <Badge variant="navy" size="md">
              {profile.name}
            </Badge>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={openCreateHallModal}
            className="text-xs font-medium border-[#CBD5E1]"
          >
            <DoorOpen className="w-3.5 h-3.5 mr-1 text-[#2563EB]" />
            Add Hall
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={openCreateSlotModal}
            className="text-xs font-medium border-[#CBD5E1]"
          >
            <Calendar className="w-3.5 h-3.5 mr-1 text-[#14B8A6]" />
            Schedule Paper
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={openCreateExamModal}
            className="text-xs font-semibold shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            New Examination
          </Button>
        </div>
      </div>

      {/* Notification / Feedback Banner */}
      {feedback && (
        <Alert
          variant={
            feedback.type === "success"
              ? "success"
              : feedback.type === "error"
              ? "error"
              : "info"
          }
          title={
            feedback.type === "success"
              ? "Success"
              : feedback.type === "error"
              ? "Attention Required"
              : "Information"
          }
          icon={
            feedback.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-[#16A34A]" />
            ) : feedback.type === "error" ? (
              <AlertTriangle className="w-5 h-5 text-[#DC2626]" />
            ) : (
              <Sparkles className="w-5 h-5 text-[#2563EB]" />
            )
          }
        >
          {feedback.message}
        </Alert>
      )}

      {/* Primary Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-[#E2E8F0]">
        {[
          { id: "dashboard", label: "Overview & Dashboard", icon: Layers },
          { id: "examinations", label: "Examination Cycles", icon: BookOpen },
          { id: "scheduling", label: "Subject Timetable", icon: Clock },
          { id: "halls", label: "Halls & Capacity", icon: DoorOpen },
          { id: "invigilators", label: "Invigilator Roster", icon: UserCheck },
          { id: "eligibility", label: "Attendance Eligibility", icon: ShieldAlert },
          { id: "reports", label: "Reports & Audits", icon: History },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as ActiveTab)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                isActive
                  ? "bg-[#2563EB] text-white shadow-xs"
                  : "text-[#475569] hover:bg-[#F1F5F9] hover:text-[#1E293B]"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-[#64748B]"}`} />
              {tab.label}
              {tab.id === "scheduling" && selectedExam && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive ? "bg-white/20 text-white" : "bg-[#EFF6FF] text-[#2563EB]"
                  }`}
                >
                  {selectedExam.slots.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* =====================================================================
          TAB 1: OVERVIEW & DASHBOARD METRICS
      ===================================================================== */}
      {activeTab === "dashboard" && (
        <div className="space-y-6">
          {/* KPI Cards Row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
            <Card className="border-l-4 border-l-[#2563EB]">
              <CardContent className="p-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                  Total Exams
                </span>
                <p className="text-2xl font-black text-[#1E293B] mt-1">{metrics.totalExams}</p>
                <span className="text-[10px] text-[#2563EB] font-medium">Configured Cycles</span>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-[#14B8A6]">
              <CardContent className="p-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                  Upcoming
                </span>
                <p className="text-2xl font-black text-[#0D9488] mt-1">{metrics.upcomingExams}</p>
                <span className="text-[10px] text-[#64748B] font-medium">Draft & Scheduled</span>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-[#F59E0B]">
              <CardContent className="p-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                  Ongoing
                </span>
                <p className="text-2xl font-black text-[#D97706] mt-1">{metrics.ongoingExams}</p>
                <span className="text-[10px] text-[#D97706] font-medium">Active Session</span>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-[#10B981]">
              <CardContent className="p-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                  Completed
                </span>
                <p className="text-2xl font-black text-[#059669] mt-1">{metrics.completedExams}</p>
                <span className="text-[10px] text-[#64748B] font-medium">Concluded</span>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-[#6366F1]">
              <CardContent className="p-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                  Papers Scheduled
                </span>
                <p className="text-2xl font-black text-[#4F46E5] mt-1">
                  {metrics.scheduledSubjects}
                </p>
                <span className="text-[10px] text-[#64748B] font-medium">Subject Slots</span>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-[#0284C7]">
              <CardContent className="p-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                  Exam Halls
                </span>
                <p className="text-2xl font-black text-[#0369A1] mt-1">
                  {metrics.availableHalls} / {examHalls.length}
                </p>
                <span className="text-[10px] text-[#64748B] font-medium">Halls Ready</span>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions Panel */}
          <Card className="bg-[#F8FAFC] border-[#E2E8F0]">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-[#1E293B]">
                    Examination Operational Workflow
                  </h3>
                  <p className="text-xs text-[#64748B] mt-0.5">
                    Configure cycles, schedule paper slots, allocate halls, check student eligibility,
                    and dispatch invigilator duty rosters.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveTab("examinations")}
                    className="text-xs"
                  >
                    <BookOpen className="w-3.5 h-3.5 mr-1.5 text-[#2563EB]" />
                    View All Cycles
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveTab("scheduling")}
                    className="text-xs"
                  >
                    <Clock className="w-3.5 h-3.5 mr-1.5 text-[#14B8A6]" />
                    Manage Timetable
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveTab("eligibility")}
                    className="text-xs"
                  >
                    <ShieldAlert className="w-3.5 h-3.5 mr-1.5 text-[#D97706]" />
                    Check Eligibility
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={openCreateExamModal}
                    className="text-xs"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    New Examination
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Examinations Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#1E293B] flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#2563EB]" />
                Active & Upcoming Examinations
              </h3>
              <span className="text-xs text-[#64748B]">
                {examinations.length} total cycles registered
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {examinations.map((exam) => (
                <Card
                  key={exam.id}
                  className={`transition-all hover:shadow-md cursor-pointer border-t-4 ${
                    exam.status === "Ongoing"
                      ? "border-t-[#F59E0B]"
                      : exam.status === "Scheduled"
                      ? "border-t-[#2563EB]"
                      : exam.status === "Completed"
                      ? "border-t-[#10B981]"
                      : "border-t-[#94A3B8]"
                  }`}
                  onClick={() => {
                    setActiveExamId(exam.id);
                  }}
                >
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]">
                          {exam.code}
                        </span>
                        <h4 className="text-sm font-bold text-[#1E293B] mt-1 line-clamp-1">
                          {exam.name}
                        </h4>
                      </div>
                      <Badge
                        variant={
                          exam.status === "Ongoing"
                            ? "warning"
                            : exam.status === "Scheduled"
                            ? "info"
                            : exam.status === "Completed"
                            ? "success"
                            : "neutral"
                        }
                        size="sm"
                      >
                        {exam.status}
                      </Badge>
                    </div>

                    <div className="space-y-1 text-xs text-[#64748B]">
                      <div className="flex items-center justify-between">
                        <span>Type:</span>
                        <span className="font-semibold text-[#1E293B]">{exam.type}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Course:</span>
                        <span className="font-semibold text-[#1E293B]">{exam.courseName || "B.Tech"}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Cohort:</span>
                        <span className="font-semibold text-[#1E293B]">{exam.className || "Class Cohort"}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Duration:</span>
                        <span className="font-semibold text-[#1E293B]">
                          {exam.startDate} to {exam.endDate}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Scheduled Papers:</span>
                        <span className="font-bold text-[#2563EB]">
                          {exam.slots.length} Papers
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[#F1F5F9] flex items-center justify-between gap-2">
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveExamId(exam.id);
                          setActiveTab("scheduling");
                        }}
                        className="text-[11px]"
                      >
                        <Clock className="w-3 h-3 mr-1 text-[#2563EB]" />
                        Schedule ({exam.slots.length})
                      </Button>
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditExamModal(exam);
                        }}
                        className="text-[11px] text-[#64748B] hover:text-[#1E293B]"
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Recent Audit Activities Stream */}
          <Card>
            <CardHeader className="py-3 px-4 border-b border-[#E2E8F0] flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-[#64748B] flex items-center gap-2">
                <History className="w-4 h-4 text-[#2563EB]" />
                Recent Examination Activity Logs
              </CardTitle>
              <Button
                variant="ghost"
                size="xs"
                onClick={() => setActiveTab("reports")}
                className="text-xs text-[#2563EB]"
              >
                View Full Audit
              </Button>
            </CardHeader>
            <CardContent className="p-0 divide-y divide-[#F1F5F9]">
              {examAudits.slice(0, 5).map((log) => (
                <div key={log.id} className="p-3.5 flex items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center shrink-0">
                      <FileSpreadsheet className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-[#1E293B]">{log.details}</p>
                      <p className="text-[11px] text-[#64748B]">
                        Action: <span className="font-medium">{log.action}</span> • By{" "}
                        {log.performedBy}
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] text-[#94A3B8] shrink-0 font-mono">
                    {new Date(log.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* =====================================================================
          TAB 2: EXAMINATIONS MANAGEMENT (CYCLES & CONFIGURATION)
      ===================================================================== */}
      {activeTab === "examinations" && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <Card className="bg-white border-[#E2E8F0]">
            <CardContent className="p-3.5 flex flex-wrap items-center gap-3 justify-between">
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5 text-[#64748B]" />
                  <span className="text-xs font-bold text-[#475569]">Filters:</span>
                </div>

                <select
                  aria-label="Filter by Academic Year"
                  value={selectedAYId}
                  onChange={(e) => setSelectedAYId(e.target.value)}
                  className="text-xs bg-[#F8FAFC] border border-[#CBD5E1] rounded-md px-2.5 py-1.5 text-[#1E293B]"
                >
                  <option value="all">All Academic Years</option>
                  {academicYears.map((ay) => (
                    <option key={ay.id} value={ay.id}>
                      {ay.name} {ay.isActive ? "(Active)" : ""}
                    </option>
                  ))}
                </select>

                <select
                  aria-label="Filter by Course"
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  className="text-xs bg-[#F8FAFC] border border-[#CBD5E1] rounded-md px-2.5 py-1.5 text-[#1E293B]"
                >
                  <option value="all">All Courses / Programs</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.code})
                    </option>
                  ))}
                </select>

                <select
                  aria-label="Filter by Status"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="text-xs bg-[#F8FAFC] border border-[#CBD5E1] rounded-md px-2.5 py-1.5 text-[#1E293B]"
                >
                  <option value="all">All Statuses</option>
                  <option value="Draft">Draft</option>
                  <option value="Scheduled">Scheduled</option>
                  <option value="Ongoing">Ongoing</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              {/* Search input */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[#94A3B8] absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Search exam name, code..."
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  className="text-xs pl-8 pr-3 py-1.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-md text-[#1E293B] w-56 focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                />
              </div>
            </CardContent>
          </Card>

          {/* Table of Examinations */}
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#F8FAFC] text-[#64748B] uppercase tracking-wider font-semibold border-b border-[#E2E8F0]">
                  <tr>
                    <th className="px-4 py-3">Code & Name</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Course & Class</th>
                    <th className="px-4 py-3">Dates</th>
                    <th className="px-4 py-3">Papers</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9]">
                  {filteredExaminations.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-[#64748B]">
                        No examinations match the selected filters.
                      </td>
                    </tr>
                  ) : (
                    filteredExaminations.map((exam) => (
                      <tr key={exam.id} className="hover:bg-[#F8FAFC] transition-colors">
                        <td className="px-4 py-3 font-medium text-[#1E293B]">
                          <span className="font-mono text-[11px] font-bold text-[#2563EB] bg-[#EFF6FF] px-1.5 py-0.5 rounded border border-[#BFDBFE] mr-1.5">
                            {exam.code}
                          </span>
                          <span className="font-bold">{exam.name}</span>
                          <div className="text-[11px] text-[#64748B] mt-0.5">
                            AY: {exam.academicYearName}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-semibold text-[#1E293B]">{exam.type}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-semibold text-[#1E293B]">{exam.courseName || "B.Tech"}</p>
                          <p className="text-[11px] text-[#64748B]">
                            {exam.className || "All Cohorts"}
                          </p>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-1 font-medium text-[#1E293B]">
                            <Calendar className="w-3.5 h-3.5 text-[#64748B]" />
                            {exam.startDate}
                          </div>
                          <div className="text-[11px] text-[#64748B]">to {exam.endDate}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-bold text-[#2563EB]">
                            {exam.slots.length} Papers
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            variant={
                              exam.status === "Ongoing"
                                ? "warning"
                                : exam.status === "Scheduled"
                                ? "info"
                                : exam.status === "Completed"
                                ? "success"
                                : "neutral"
                            }
                            size="sm"
                          >
                            {exam.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right whitespace-nowrap space-x-1.5">
                          <Button
                            variant="outline"
                            size="xs"
                            onClick={() => {
                              setActiveExamId(exam.id);
                              setActiveTab("scheduling");
                            }}
                            className="text-[11px]"
                          >
                            <Clock className="w-3 h-3 mr-1 text-[#2563EB]" />
                            Timetable
                          </Button>
                          <Button
                            variant="ghost"
                            size="xs"
                            onClick={() => openEditExamModal(exam)}
                            className="text-[11px] text-[#64748B]"
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="xs"
                            onClick={() => handleDeleteExam(exam)}
                            className="text-[11px] text-[#DC2626] hover:bg-[#FEE2E2]"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* =====================================================================
          TAB 3: SUBJECT & TIMETABLE SCHEDULING
      ===================================================================== */}
      {activeTab === "scheduling" && (
        <div className="space-y-4">
          {/* Selected Exam Selector Banner */}
          <Card className="bg-[#F8FAFC] border-[#CBD5E1]">
            <CardContent className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div>
                  <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                    Active Examination:
                  </span>
                  <div className="mt-1">
                    <select
                      aria-label="Active Examination"
                      value={activeExamId}
                      onChange={(e) => setActiveExamId(e.target.value)}
                      className="text-sm font-bold bg-white border border-[#94A3B8] rounded-md px-3 py-1.5 text-[#1E293B] shadow-xs"
                    >
                      {examinations.map((ex) => (
                        <option key={ex.id} value={ex.id}>
                          {ex.name} ({ex.code}) - {ex.status}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {selectedExam && (
                  <div className="sm:border-l border-[#CBD5E1] sm:pl-3 space-y-0.5 text-xs text-[#64748B]">
                    <p>
                      <strong className="text-[#1E293B]">Course:</strong> {selectedExam.courseName || "B.Tech"}
                    </p>
                    <p>
                      <strong className="text-[#1E293B]">Cohort:</strong> {selectedExam.className || "Class"}
                    </p>
                    <p>
                      <strong className="text-[#1E293B]">Dates:</strong> {selectedExam.startDate}{" "}
                      to {selectedExam.endDate}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportExamTimetableCSV}
                  className="text-xs"
                >
                  <Download className="w-3.5 h-3.5 mr-1" />
                  Export Schedule (CSV)
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={openCreateSlotModal}
                  className="text-xs shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Schedule Paper
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Scheduled Slots Table */}
          <Card>
            <CardHeader className="py-3 px-4 border-b border-[#E2E8F0] flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold text-[#1E293B] flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#2563EB]" />
                Scheduled Examination Papers ({selectedExam ? selectedExam.slots.length : 0})
              </CardTitle>
              <Badge variant="teal" size="sm">
                No Timing Clashes Detected
              </Badge>
            </CardHeader>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#F8FAFC] text-[#64748B] uppercase tracking-wider font-semibold border-b border-[#E2E8F0]">
                  <tr>
                    <th className="px-4 py-3">Date & Mode</th>
                    <th className="px-4 py-3">Timing & Duration</th>
                    <th className="px-4 py-3">Subject</th>
                    <th className="px-4 py-3">Hall / Venue</th>
                    <th className="px-4 py-3">Invigilator</th>
                    <th className="px-4 py-3">Marks</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9]">
                  {!selectedExam || selectedExam.slots.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-10 text-center text-[#64748B]">
                        <Clock className="w-8 h-8 text-[#94A3B8] mx-auto mb-2 opacity-50" />
                        <p className="font-semibold text-sm">No exam papers scheduled yet.</p>
                        <p className="text-xs text-[#94A3B8] mt-1">
                          Click &quot;Schedule Paper&quot; above to allocate subjects, timings, and examination halls.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    selectedExam.slots.map((slot) => (
                      <tr key={slot.id} className="hover:bg-[#F8FAFC] transition-colors">
                        <td className="px-4 py-3 font-medium text-[#1E293B]">
                          <div className="flex items-center gap-1.5 font-bold">
                            <Calendar className="w-3.5 h-3.5 text-[#2563EB]" />
                            {slot.examDate}
                          </div>
                          <Badge
                            variant={
                              slot.mode === "Theory"
                                ? "info"
                                : slot.mode === "Practical"
                                ? "warning"
                                : "navy"
                            }
                            size="sm"
                            className="mt-1"
                          >
                            {slot.mode}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-bold text-[#1E293B]">
                            {slot.startTime} - {slot.endTime}
                          </p>
                          <p className="text-[11px] text-[#64748B]">{slot.durationMinutes} mins</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-mono text-[11px] font-bold text-[#0D9488] bg-[#CCFBF1] px-1 py-0.5 rounded border border-[#99F6E4] mr-1">
                            {slot.subjectCode}
                          </span>
                          <span className="font-bold text-[#1E293B]">{slot.subjectName}</span>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-bold text-[#1E293B]">{slot.hallName || "Main Hall"}</p>
                          <p className="text-[11px] text-[#64748B]">
                            Cap: {slot.hallCapacity || 60} • {slot.allocatedStudentCount || 60} Candidates
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-semibold text-[#1E293B]">
                            {slot.invigilatorName || "Unassigned"}
                          </p>
                          {slot.invigilatorDepartment && (
                            <p className="text-[11px] text-[#64748B]">
                              {slot.invigilatorDepartment}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-bold text-[#1E293B]">Max: {slot.maxMarks}</p>
                          <p className="text-[11px] text-[#64748B]">Pass: {slot.passingMarks}</p>
                        </td>
                        <td className="px-4 py-3 text-right whitespace-nowrap space-x-1.5">
                          <Button
                            variant="ghost"
                            size="xs"
                            onClick={() => openEditSlotModal(slot)}
                            className="text-[11px] text-[#64748B]"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="xs"
                            onClick={() => handleDeleteSlot(slot)}
                            className="text-[11px] text-[#DC2626] hover:bg-[#FEE2E2]"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* =====================================================================
          TAB 4: EXAMINATION HALLS & CAPACITY MANAGEMENT
      ===================================================================== */}
      {activeTab === "halls" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-[#1E293B] flex items-center gap-2">
                <DoorOpen className="w-4 h-4 text-[#2563EB]" />
                Examination Halls & Seating Infrastructure
              </h3>
              <p className="text-xs text-[#64748B]">
                Manage examination venues, seating capacities, and room availability constraints.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={exportHallAllocationsCSV}
                className="text-xs"
              >
                <Download className="w-3.5 h-3.5 mr-1" />
                Export Matrix (CSV)
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={openCreateHallModal}
                className="text-xs shadow-xs"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Add Hall
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {examHalls.map((hall) => (
              <Card key={hall.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]">
                        {hall.code}
                      </span>
                      <h4 className="text-sm font-bold text-[#1E293B] mt-1">{hall.name}</h4>
                      <p className="text-xs text-[#64748B]">
                        {hall.building} • {hall.floor}
                      </p>
                    </div>
                    <Badge
                      variant={
                        hall.status === "Available"
                          ? "success"
                          : hall.status === "Occupied"
                          ? "warning"
                          : "neutral"
                      }
                      size="sm"
                    >
                      {hall.status}
                    </Badge>
                  </div>

                  {/* Capacity Bar */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#64748B]">Seating Capacity:</span>
                      <span className="font-bold text-[#1E293B]">{hall.capacity} Desks</span>
                    </div>
                    <div className="w-full h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#2563EB] rounded-full"
                        style={{
                          width: `${Math.min(100, (hall.capacity / 150) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#F1F5F9] flex items-center justify-between">
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() => openEditHallModal(hall)}
                      className="text-xs text-[#64748B]"
                    >
                      <Edit className="w-3.5 h-3.5 mr-1" /> Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() => handleDeleteHall(hall)}
                      className="text-xs text-[#DC2626] hover:bg-[#FEE2E2]"
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 5: INVIGILATOR DUTY ROSTER
      ===================================================================== */}
      {activeTab === "invigilators" && (
        <div className="space-y-4">
          <Card className="bg-[#F8FAFC] border-[#E2E8F0]">
            <CardContent className="p-3.5 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-[#64748B]" />
                <span className="text-xs font-bold text-[#475569]">Filter by Faculty:</span>
                <select
                  aria-label="Filter by Faculty"
                  value={invigilatorFilterStaffId}
                  onChange={(e) => setInvigilatorFilterStaffId(e.target.value)}
                  className="text-xs bg-white border border-[#CBD5E1] rounded-md px-2.5 py-1.5 text-[#1E293B]"
                >
                  <option value="all">All Faculty Members ({facultyStaff.length})</option>
                  {facultyStaff.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.fullName} ({f.designation})
                    </option>
                  ))}
                </select>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={exportInvigilatorRosterCSV}
                className="text-xs"
              >
                <Download className="w-3.5 h-3.5 mr-1" />
                Export Duty Roster (CSV)
              </Button>
            </CardContent>
          </Card>

          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#F8FAFC] text-[#64748B] uppercase tracking-wider font-semibold border-b border-[#E2E8F0]">
                  <tr>
                    <th className="px-4 py-3">Faculty / Invigilator</th>
                    <th className="px-4 py-3">Department & Role</th>
                    <th className="px-4 py-3">Total Duties</th>
                    <th className="px-4 py-3">Assigned Exam Schedules</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9]">
                  {filteredInvigilatorRoster.map((item) => (
                    <tr key={item.faculty.id} className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="px-4 py-3 font-bold text-[#1E293B]">
                        {item.faculty.fullName}
                        <p className="text-[11px] text-[#64748B] font-mono font-normal">
                          {item.faculty.employeeId}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-[#1E293B]">
                          {item.faculty.departmentName || "Engineering"}
                        </p>
                        <p className="text-[11px] text-[#64748B]">{item.faculty.designation}</p>
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={item.totalDuties > 0 ? "teal" : "neutral"}
                          size="sm"
                          className="font-bold"
                        >
                          {item.totalDuties} Duties
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        {item.duties.length === 0 ? (
                          <span className="text-[#94A3B8] italic">No duties assigned</span>
                        ) : (
                          <div className="space-y-1.5 max-w-lg">
                            {item.duties.map((duty) => (
                              <div
                                key={duty.id}
                                className="p-2 rounded bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-between gap-2"
                              >
                                <div>
                                  <div className="font-semibold text-[#1E293B]">
                                    {duty.examDate} • {duty.startTime} - {duty.endTime}
                                  </div>
                                  <div className="text-[11px] text-[#64748B]">
                                    {duty.subjectName} ({duty.subjectCode}) • {duty.hallName || "Hall"}
                                  </div>
                                </div>
                                <Badge variant="info" size="sm">
                                  Invigilator
                                </Badge>
                              </div>
                            ))}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* =====================================================================
          TAB 6: ATTENDANCE-BASED ELIGIBILITY & OVERRIDES
      ===================================================================== */}
      {activeTab === "eligibility" && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <Card className="bg-[#F8FAFC] border-[#E2E8F0]">
            <CardContent className="p-4 space-y-3">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-3">
                  <div>
                    <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block mb-1">
                      Target Examination:
                    </span>
                    <select
                      aria-label="Target Examination for Eligibility"
                      value={eligibilityExamId}
                      onChange={(e) => setEligibilityExamId(e.target.value)}
                      className="text-xs font-semibold bg-white border border-[#CBD5E1] rounded-md px-3 py-1.5 text-[#1E293B]"
                    >
                      {examinations.map((ex) => (
                        <option key={ex.id} value={ex.id}>
                          {ex.name} ({ex.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block mb-1">
                      Filter Class:
                    </span>
                    <select
                      aria-label="Filter Class for Eligibility"
                      value={eligibilityClassId}
                      onChange={(e) => setEligibilityClassId(e.target.value)}
                      className="text-xs bg-white border border-[#CBD5E1] rounded-md px-3 py-1.5 text-[#1E293B]"
                    >
                      <option value="all">All Applicable Classes</option>
                      {classes.map((cl) => (
                        <option key={cl.id} value={cl.id}>
                          {cl.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={exportEligibilityCSV}
                    className="text-xs"
                  >
                    <Download className="w-3.5 h-3.5 mr-1" />
                    Export Eligibility List (CSV)
                  </Button>
                </div>
              </div>

              {/* Threshold Note */}
              <div className="p-3 bg-[#EFF6FF] border border-[#BFDBFE] rounded-lg flex items-center justify-between text-xs text-[#1E40AF]">
                <span>
                  Institutional Attendance Rule: Minimum{" "}
                  <strong>{attendanceThreshold.minimumPercentage}%</strong> attendance is mandatory
                  for examination eligibility. Defaulters below this threshold require an
                  authorized administrative override.
                </span>
                <Badge variant="info" size="sm">
                  Threshold: {attendanceThreshold.minimumPercentage}%
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* KPI Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <Card>
              <CardContent className="p-3.5 text-center">
                <span className="text-[11px] font-bold uppercase text-[#64748B]">
                  Total Candidates
                </span>
                <p className="text-xl font-black text-[#1E293B] mt-1">
                  {eligibilitySummary.total}
                </p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-[#10B981]">
              <CardContent className="p-3.5 text-center">
                <span className="text-[11px] font-bold uppercase text-[#16A34A]">
                  Eligible Students
                </span>
                <p className="text-xl font-black text-[#16A34A] mt-1">
                  {eligibilitySummary.eligibleCount}
                </p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-[#EF4444]">
              <CardContent className="p-3.5 text-center">
                <span className="text-[11px] font-bold uppercase text-[#DC2626]">
                  Defaulters (&lt; {attendanceThreshold.minimumPercentage}%)
                </span>
                <p className="text-xl font-black text-[#DC2626] mt-1">
                  {eligibilitySummary.defaultersCount}
                </p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-[#8B5CF6]">
              <CardContent className="p-3.5 text-center">
                <span className="text-[11px] font-bold uppercase text-[#7C3AED]">
                  Overridden / Condoned
                </span>
                <p className="text-xl font-black text-[#7C3AED] mt-1">
                  {eligibilitySummary.overriddenCount}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Students Eligibility Table */}
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#F8FAFC] text-[#64748B] uppercase tracking-wider font-semibold border-b border-[#E2E8F0]">
                  <tr>
                    <th className="px-4 py-3">Student Name & ID</th>
                    <th className="px-4 py-3">Class & Section</th>
                    <th className="px-4 py-3">Attendance %</th>
                    <th className="px-4 py-3">System Eligibility</th>
                    <th className="px-4 py-3">Admin Status</th>
                    <th className="px-4 py-3 text-right">Exemption Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9]">
                  {studentsWithEligibility.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-[#64748B]">
                        No students found for this examination criteria.
                      </td>
                    </tr>
                  ) : (
                    studentsWithEligibility.map((item) => (
                      <tr key={item.studentId} className="hover:bg-[#F8FAFC] transition-colors">
                        <td className="px-4 py-3 font-bold text-[#1E293B]">
                          {item.studentName}
                          <p className="text-[11px] text-[#64748B] font-mono font-normal">
                            {item.studentId} • Roll: {item.rollNumber || "-"}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-semibold text-[#1E293B]">{item.className}</p>
                          <p className="text-[11px] text-[#64748B]">
                            {item.sectionName || "Section A"}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span
                              className={`font-black ${
                                item.attendancePercentage >= attendanceThreshold.minimumPercentage
                                  ? "text-[#16A34A]"
                                  : "text-[#DC2626]"
                              }`}
                            >
                              {item.attendancePercentage.toFixed(1)}%
                            </span>
                            <div className="w-16 h-1.5 bg-[#E2E8F0] rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  item.attendancePercentage >= attendanceThreshold.minimumPercentage
                                    ? "bg-[#16A34A]"
                                    : "bg-[#DC2626]"
                                }`}
                                style={{ width: `${Math.min(100, item.attendancePercentage)}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            variant={item.isAttendanceEligible ? "success" : "error"}
                            size="sm"
                          >
                            {item.isAttendanceEligible ? "Eligible" : "Defaulter"}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          {item.hasOverride ? (
                            <div>
                              <Badge variant="teal" size="sm">
                                Overridden: {item.finalEligible ? "Eligible" : "Ineligible"}
                              </Badge>
                              <p className="text-[10px] text-[#64748B] italic mt-0.5 line-clamp-1">
                                {item.overrideReason}
                              </p>
                            </div>
                          ) : (
                            <span className="text-[11px] text-[#94A3B8]">Automatic</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button
                            variant="outline"
                            size="xs"
                            onClick={() => openOverrideModal(item)}
                            className="text-[11px]"
                          >
                            <ShieldAlert className="w-3 h-3 mr-1 text-[#2563EB]" />
                            {item.hasOverride ? "Edit Override" : "Override"}
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* =====================================================================
          TAB 7: AUDIT TRAIL & REPORTS
      ===================================================================== */}
      {activeTab === "reports" && (
        <div className="space-y-4">
          <Card>
            <CardHeader className="py-3 px-4 border-b border-[#E2E8F0]">
              <CardTitle className="text-sm font-bold text-[#1E293B] flex items-center gap-2">
                <Download className="w-4 h-4 text-[#2563EB]" />
                Institutional Examination Reports & Export Center
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
              <div className="p-4 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-sm text-[#1E293B]">Exam Timetable Schedule</h4>
                  <p className="text-xs text-[#64748B] mt-1">
                    Complete subject slots, dates, rooms, and invigilator assignments.
                  </p>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={exportExamTimetableCSV}
                  className="mt-4 text-xs"
                >
                  <Download className="w-3.5 h-3.5 mr-1" />
                  Download CSV
                </Button>
              </div>

              <div className="p-4 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-sm text-[#1E293B]">Hall Allocation Matrix</h4>
                  <p className="text-xs text-[#64748B] mt-1">
                    Venues, seating capacities, and floor locations.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportHallAllocationsCSV}
                  className="mt-4 text-xs"
                >
                  <Download className="w-3.5 h-3.5 mr-1" />
                  Download CSV
                </Button>
              </div>

              <div className="p-4 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-sm text-[#1E293B]">Eligibility & Defaulters</h4>
                  <p className="text-xs text-[#64748B] mt-1">
                    Student attendance %, threshold evaluation, and administrative exemptions.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportEligibilityCSV}
                  className="mt-4 text-xs"
                >
                  <Download className="w-3.5 h-3.5 mr-1" />
                  Download CSV
                </Button>
              </div>

              <div className="p-4 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-sm text-[#1E293B]">Invigilator Duty Roster</h4>
                  <p className="text-xs text-[#64748B] mt-1">
                    Faculty exam duties, assigned sessions, dates, and venue details.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportInvigilatorRosterCSV}
                  className="mt-4 text-xs"
                >
                  <Download className="w-3.5 h-3.5 mr-1" />
                  Download CSV
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Full Audit Trail */}
          <Card>
            <CardHeader className="py-3 px-4 border-b border-[#E2E8F0]">
              <CardTitle className="text-sm font-bold text-[#1E293B] flex items-center gap-2">
                <History className="w-4 h-4 text-[#2563EB]" />
                Complete Examination Audit Trail
              </CardTitle>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#F8FAFC] text-[#64748B] uppercase tracking-wider font-semibold border-b border-[#E2E8F0]">
                  <tr>
                    <th className="px-4 py-3">Timestamp</th>
                    <th className="px-4 py-3">Action</th>
                    <th className="px-4 py-3">Details / Entity</th>
                    <th className="px-4 py-3">Performed By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9]">
                  {examAudits.map((log) => (
                    <tr key={log.id} className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap font-mono text-[11px] text-[#64748B]">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 font-semibold text-[#1E293B]">
                        <Badge variant="navy" size="sm">
                          {log.action}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-[#334155]">{log.details}</td>
                      <td className="px-4 py-3 font-medium text-[#1E293B]">
                        {log.performedBy}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* =====================================================================
          MODAL: CREATE / EDIT EXAMINATION
      ===================================================================== */}
      <Modal
        isOpen={isExamModalOpen}
        onClose={() => setIsExamModalOpen(false)}
        title={editingExamId ? "Edit Examination Cycle" : "Create New Examination"}
        maxWidth="lg"
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExamModalOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSaveExam}>
              {editingExamId ? "Update Examination" : "Create Examination"}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSaveExam} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-[#1E293B] block mb-1">
                Examination Title / Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. End-Term Semester Examinations 2024-25"
                value={examFormData.name}
                onChange={(e) => setExamFormData({ ...examFormData, name: e.target.value })}
                className="w-full text-xs p-2 border border-[#CBD5E1] rounded-md text-[#1E293B]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#1E293B] block mb-1">
                Exam Code *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. EXAM-2024-SEM2"
                value={examFormData.code}
                onChange={(e) => setExamFormData({ ...examFormData, code: e.target.value })}
                className="w-full text-xs p-2 border border-[#CBD5E1] rounded-md font-mono text-[#1E293B]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#1E293B] block mb-1">
                Academic Year *
              </label>
              <select
                value={examFormData.academicYearId}
                onChange={(e) => setExamFormData({ ...examFormData, academicYearId: e.target.value })}
                className="w-full text-xs p-2 border border-[#CBD5E1] rounded-md text-[#1E293B]"
              >
                {academicYears.map((ay) => (
                  <option key={ay.id} value={ay.id}>
                    {ay.name} {ay.isActive ? "(Active)" : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-[#1E293B] block mb-1">
                Examination Type *
              </label>
              <select
                value={examFormData.type}
                onChange={(e) => setExamFormData({ ...examFormData, type: e.target.value as ExamType })}
                className="w-full text-xs p-2 border border-[#CBD5E1] rounded-md text-[#1E293B]"
              >
                {EXAM_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-[#1E293B] block mb-1">
                Course / Program *
              </label>
              <select
                value={examFormData.courseId}
                onChange={(e) => {
                  const newCourseId = e.target.value;
                  const matchingClasses = classes.filter((c) => c.courseId === newCourseId);
                  setExamFormData({
                    ...examFormData,
                    courseId: newCourseId,
                    classId: matchingClasses[0]?.id || "",
                  });
                }}
                className="w-full text-xs p-2 border border-[#CBD5E1] rounded-md text-[#1E293B]"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-[#1E293B] block mb-1">
                Applicable Class / Cohort *
              </label>
              <select
                value={examFormData.classId}
                onChange={(e) => setExamFormData({ ...examFormData, classId: e.target.value })}
                className="w-full text-xs p-2 border border-[#CBD5E1] rounded-md text-[#1E293B]"
              >
                {classes
                  .filter((c) => !examFormData.courseId || c.courseId === examFormData.courseId)
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.totalStudents} students)
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-[#1E293B] block mb-1">
                Section
              </label>
              <select
                value={examFormData.sectionId}
                onChange={(e) => setExamFormData({ ...examFormData, sectionId: e.target.value })}
                className="w-full text-xs p-2 border border-[#CBD5E1] rounded-md text-[#1E293B]"
              >
                <option value="all">All Sections (Entire Cohort)</option>
                {sections
                  .filter((sec) => sec.classId === examFormData.classId)
                  .map((sec) => (
                    <option key={sec.id} value={sec.id}>
                      {sec.name}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-[#1E293B] block mb-1">
                Status *
              </label>
              <select
                value={examFormData.status}
                onChange={(e) => setExamFormData({ ...examFormData, status: e.target.value as ExamStatus })}
                className="w-full text-xs p-2 border border-[#CBD5E1] rounded-md text-[#1E293B]"
              >
                <option value="Draft">Draft</option>
                <option value="Scheduled">Scheduled</option>
                <option value="Ongoing">Ongoing</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-[#1E293B] block mb-1">
                Start Date *
              </label>
              <input
                type="date"
                required
                value={examFormData.startDate}
                onChange={(e) => setExamFormData({ ...examFormData, startDate: e.target.value })}
                className="w-full text-xs p-2 border border-[#CBD5E1] rounded-md text-[#1E293B]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#1E293B] block mb-1">
                End Date *
              </label>
              <input
                type="date"
                required
                value={examFormData.endDate}
                onChange={(e) => setExamFormData({ ...examFormData, endDate: e.target.value })}
                className="w-full text-xs p-2 border border-[#CBD5E1] rounded-md text-[#1E293B]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-[#1E293B] block mb-1">
                Instructions / Notes
              </label>
              <textarea
                rows={2}
                placeholder="Special guidelines, admit card rules, or passing criteria..."
                value={examFormData.description}
                onChange={(e) => setExamFormData({ ...examFormData, description: e.target.value })}
                className="w-full text-xs p-2 border border-[#CBD5E1] rounded-md text-[#1E293B]"
              />
            </div>
          </div>
        </form>
      </Modal>

      {/* =====================================================================
          MODAL: SCHEDULE SUBJECT PAPER (TIMETABLE SLOT)
      ===================================================================== */}
      <Modal
        isOpen={isSlotModalOpen}
        onClose={() => setIsSlotModalOpen(false)}
        title={editingSlotId ? "Edit Paper Schedule" : "Schedule Exam Paper"}
        maxWidth="lg"
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsSlotModalOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSaveSlot}>
              {editingSlotId ? "Update Paper" : "Schedule Paper"}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSaveSlot} className="space-y-4">
          {/* Conflict warnings banner inside modal */}
          {slotConflicts.length > 0 && (
            <div className="space-y-1.5 p-3 rounded-lg bg-[#FEF2F2] border border-[#FECACA]">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#DC2626]">
                <AlertTriangle className="w-4 h-4" />
                Scheduling Conflict(s) Detected:
              </div>
              <ul className="list-disc pl-5 text-[11px] text-[#B91C1C] space-y-0.5">
                {slotConflicts.map((c, i) => (
                  <li key={i}>{c.message}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-[#1E293B] block mb-1">
                Subject / Paper *
              </label>
              <select
                value={slotFormData.subjectId}
                onChange={(e) => {
                  setSlotFormData({ ...slotFormData, subjectId: e.target.value });
                  setTimeout(triggerConflictCheck, 50);
                }}
                className="w-full text-xs p-2 border border-[#CBD5E1] rounded-md text-[#1E293B]"
              >
                {availableSubjectsForExam.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.code}) - {s.type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-[#1E293B] block mb-1">
                Exam Date *
              </label>
              <input
                type="date"
                required
                value={slotFormData.examDate}
                onChange={(e) => {
                  setSlotFormData({ ...slotFormData, examDate: e.target.value });
                  setTimeout(triggerConflictCheck, 50);
                }}
                className="w-full text-xs p-2 border border-[#CBD5E1] rounded-md text-[#1E293B]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#1E293B] block mb-1">
                Mode *
              </label>
              <select
                value={slotFormData.mode}
                onChange={(e) =>
                  setSlotFormData({
                    ...slotFormData,
                    mode: e.target.value as ExamMode,
                  })
                }
                className="w-full text-xs p-2 border border-[#CBD5E1] rounded-md text-[#1E293B]"
              >
                {EXAM_MODES.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-[#1E293B] block mb-1">
                Start Time *
              </label>
              <input
                type="time"
                required
                value={slotFormData.startTime}
                onChange={(e) => {
                  setSlotFormData({ ...slotFormData, startTime: e.target.value });
                  setTimeout(triggerConflictCheck, 50);
                }}
                className="w-full text-xs p-2 border border-[#CBD5E1] rounded-md text-[#1E293B]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#1E293B] block mb-1">
                End Time *
              </label>
              <input
                type="time"
                required
                value={slotFormData.endTime}
                onChange={(e) => {
                  setSlotFormData({ ...slotFormData, endTime: e.target.value });
                  setTimeout(triggerConflictCheck, 50);
                }}
                className="w-full text-xs p-2 border border-[#CBD5E1] rounded-md text-[#1E293B]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#1E293B] block mb-1">
                Examination Hall / Venue *
              </label>
              <select
                value={slotFormData.hallId}
                onChange={(e) => {
                  setSlotFormData({ ...slotFormData, hallId: e.target.value });
                  setTimeout(triggerConflictCheck, 50);
                }}
                className="w-full text-xs p-2 border border-[#CBD5E1] rounded-md text-[#1E293B]"
              >
                {examHalls.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name} ({h.code}) - Cap: {h.capacity}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-[#1E293B] block mb-1">
                Assigned Invigilator *
              </label>
              <select
                value={slotFormData.invigilatorId}
                onChange={(e) => {
                  setSlotFormData({ ...slotFormData, invigilatorId: e.target.value });
                  setTimeout(triggerConflictCheck, 50);
                }}
                className="w-full text-xs p-2 border border-[#CBD5E1] rounded-md text-[#1E293B]"
              >
                {facultyStaff.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.fullName} ({f.designation})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-[#1E293B] block mb-1">
                Max Marks *
              </label>
              <input
                type="number"
                min={10}
                max={500}
                required
                value={slotFormData.maxMarks}
                onChange={(e) => setSlotFormData({ ...slotFormData, maxMarks: Number(e.target.value) })}
                className="w-full text-xs p-2 border border-[#CBD5E1] rounded-md text-[#1E293B]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#1E293B] block mb-1">
                Passing Marks *
              </label>
              <input
                type="number"
                min={1}
                max={500}
                required
                value={slotFormData.passingMarks}
                onChange={(e) => setSlotFormData({ ...slotFormData, passingMarks: Number(e.target.value) })}
                className="w-full text-xs p-2 border border-[#CBD5E1] rounded-md text-[#1E293B]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-[#1E293B] block mb-1">
                Instructions / Allowed Materials
              </label>
              <input
                type="text"
                placeholder="e.g. Non-programmable scientific calculator permitted; drawing kit required"
                value={slotFormData.instructions}
                onChange={(e) => setSlotFormData({ ...slotFormData, instructions: e.target.value })}
                className="w-full text-xs p-2 border border-[#CBD5E1] rounded-md text-[#1E293B]"
              />
            </div>
          </div>
        </form>
      </Modal>

      {/* =====================================================================
          MODAL: ADD / EDIT EXAMINATION HALL
      ===================================================================== */}
      <Modal
        isOpen={isHallModalOpen}
        onClose={() => setIsHallModalOpen(false)}
        title={editingHallId ? "Edit Examination Hall" : "Add Examination Hall"}
        maxWidth="md"
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsHallModalOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSaveHall}>
              {editingHallId ? "Update Hall" : "Save Hall"}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSaveHall} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-[#1E293B] block mb-1">
              Hall Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Main Auditorium Hall A"
              value={hallFormData.name}
              onChange={(e) => setHallFormData({ ...hallFormData, name: e.target.value })}
              className="w-full text-xs p-2 border border-[#CBD5E1] rounded-md text-[#1E293B]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-[#1E293B] block mb-1">
                Hall Code *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. LH-301"
                value={hallFormData.code}
                onChange={(e) => setHallFormData({ ...hallFormData, code: e.target.value })}
                className="w-full text-xs p-2 border border-[#CBD5E1] rounded-md font-mono text-[#1E293B]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#1E293B] block mb-1">
                Seating Capacity *
              </label>
              <input
                type="number"
                min={10}
                max={500}
                required
                value={hallFormData.capacity}
                onChange={(e) => setHallFormData({ ...hallFormData, capacity: Number(e.target.value) })}
                className="w-full text-xs p-2 border border-[#CBD5E1] rounded-md text-[#1E293B]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-[#1E293B] block mb-1">
                Building *
              </label>
              <input
                type="text"
                required
                value={hallFormData.building}
                onChange={(e) => setHallFormData({ ...hallFormData, building: e.target.value })}
                className="w-full text-xs p-2 border border-[#CBD5E1] rounded-md text-[#1E293B]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#1E293B] block mb-1">
                Floor *
              </label>
              <input
                type="text"
                required
                value={hallFormData.floor}
                onChange={(e) => setHallFormData({ ...hallFormData, floor: e.target.value })}
                className="w-full text-xs p-2 border border-[#CBD5E1] rounded-md text-[#1E293B]"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[#1E293B] block mb-1">
              Hall Availability Status
            </label>
            <select
              value={hallFormData.status}
              onChange={(e) =>
                setHallFormData({
                  ...hallFormData,
                  status: e.target.value as "Available" | "Occupied" | "Maintenance",
                })
              }
              className="w-full text-xs p-2 border border-[#CBD5E1] rounded-md text-[#1E293B]"
            >
              <option value="Available">Available for Examinations</option>
              <option value="Occupied">Currently Occupied</option>
              <option value="Maintenance">Under Maintenance</option>
            </select>
          </div>
        </form>
      </Modal>

      {/* =====================================================================
          MODAL: RECORD ATTENDANCE ELIGIBILITY OVERRIDE
      ===================================================================== */}
      <Modal
        isOpen={isOverrideModalOpen}
        onClose={() => setIsOverrideModalOpen(false)}
        title="Administrative Eligibility Override"
        maxWidth="md"
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsOverrideModalOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSaveOverride}>
              Confirm Override Decision
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSaveOverride} className="space-y-4">
          {selectedStudentForOverride && (
            <div className="p-3 bg-[#F8FAFC] border border-[#CBD5E1] rounded-md space-y-1 text-xs text-[#1E293B]">
              <p>
                <strong>Student:</strong> {selectedStudentForOverride.studentName} (
                {selectedStudentForOverride.studentId})
              </p>
              <p>
                <strong>Class:</strong> {selectedStudentForOverride.className}
              </p>
              <p>
                <strong>Calculated Attendance:</strong>{" "}
                <span
                  className={
                    selectedStudentForOverride.attendancePercentage >=
                    attendanceThreshold.minimumPercentage
                      ? "text-[#16A34A] font-bold"
                      : "text-[#DC2626] font-bold"
                  }
                >
                  {selectedStudentForOverride.attendancePercentage.toFixed(1)}%
                </span>
              </p>
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-[#1E293B] block mb-1">
              Override Decision *
            </label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-xs font-semibold text-[#16A34A] cursor-pointer">
                <input
                  type="radio"
                  name="overrideDecision"
                  checked={overrideDecision === true}
                  onChange={() => setOverrideDecision(true)}
                />
                Grant Eligibility (Condone Absence)
              </label>
              <label className="flex items-center gap-2 text-xs font-semibold text-[#DC2626] cursor-pointer">
                <input
                  type="radio"
                  name="overrideDecision"
                  checked={overrideDecision === false}
                  onChange={() => setOverrideDecision(false)}
                />
                Mark Ineligible / Disallow
              </label>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[#1E293B] block mb-1">
              Mandatory Justification / Exemption Reason *
            </label>
            <textarea
              required
              rows={3}
              placeholder="Provide official justification e.g.: Medical leave condoned per Medical Certificate #MED-4091 signed by Principal; Sports Duty OD approval on 12-Nov-2026."
              value={overrideReason}
              onChange={(e) => setOverrideReason(e.target.value)}
              className="w-full text-xs p-2 border border-[#CBD5E1] rounded-md text-[#1E293B]"
            />
            <p className="text-[10px] text-[#64748B] mt-1">
              All exemptions are permanently tracked in the Institutional Examination Audit Trail.
            </p>
          </div>
        </form>
      </Modal>
    </div>
  );
}
