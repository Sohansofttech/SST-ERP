"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useInstitution } from "@/lib/store";
import {
  IAAssessment,
  IAAssessmentStatus,
  IAAssessmentType,
  IAComponent,
  IAComponentType,
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
  Award,
  Plus,
  Search,
  Calendar,
  Clock,
  BookOpen,
  Users,
  CheckCircle2,
  ArrowLeft,
  Sparkles,
  Download,
  Edit2,
  Trash2,
  Eye,
  Layers,
  Check,
  Copy,
  TrendingUp,
  FileText,
  RotateCcw,
  BarChart2,
  Sliders,
  CalendarDays,
  ShieldCheck,
  HelpCircle,
  FileSpreadsheet,
} from "lucide-react";

type ActiveTab = "dashboard" | "assessments" | "components" | "matrix" | "history";

const ASSESSMENT_TYPES: IAAssessmentType[] = [
  "Continuous Internal Assessment (CIA)",
  "Unit Test",
  "Mid-Term Assessment",
  "Practical Assessment",
  "Assignment / Project Evaluation",
  "Quiz / Class Test",
];

const COMPONENT_TYPES: IAComponentType[] = [
  "Theory / Written Test",
  "Assignment",
  "Practical / Lab",
  "Seminar / Presentation",
  "Viva Voce",
  "Class Attendance & Participation",
  "Project Work",
];

const STATUS_VARIANTS: Record<
  IAAssessmentStatus,
  { label: string; variant: "neutral" | "info" | "warning" | "success" | "teal" | "error" }
> = {
  Draft: { label: "Draft", variant: "neutral" },
  Scheduled: { label: "Scheduled", variant: "info" },
  Ongoing: { label: "Ongoing", variant: "warning" },
  Completed: { label: "Completed", variant: "teal" },
  Published: { label: "Published", variant: "success" },
  Cancelled: { label: "Cancelled", variant: "error" },
};

export default function InternalAssessmentsPage() {
  const {
    academicYears,
    activeAcademicYear,
    courses,
    classes,
    sections,
    subjects,
    staff,
    iaAssessments,
    addIAAssessment,
    updateIAAssessment,
    deleteIAAssessment,
    transitionIAAssessmentStatus,
    getIAMetrics,
  } = useInstitution();

  // Active top-level tab
  const [activeTab, setActiveTab] = useState<ActiveTab>("dashboard");

  // Metrics
  const metrics = getIAMetrics();

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [ayFilter, setAyFilter] = useState("ALL");
  const [courseFilter, setCourseFilter] = useState("ALL");
  const [classFilter, setClassFilter] = useState("ALL");
  const [subjectFilter, setSubjectFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Toast / Feedback
  const [feedback, setFeedback] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);

  const showFeedback = (type: "success" | "error" | "info", message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  // -----------------------------------------------------------
  // Modal States: Creation / Editing
  // -----------------------------------------------------------
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingAssessmentId, setEditingAssessmentId] = useState<string | null>(null);

  // Form Fields
  const [formName, setFormName] = useState("");
  const [formCode, setFormCode] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formAyId, setFormAyId] = useState(activeAcademicYear?.id || "");
  const [formCourseId, setFormCourseId] = useState("");
  const [formClassId, setFormClassId] = useState("");
  const [formSectionId, setFormSectionId] = useState("ALL");
  const [formSubjectId, setFormSubjectId] = useState("");
  const [formTeacherId, setFormTeacherId] = useState("");
  const [formType, setFormType] = useState<IAAssessmentType>("Continuous Internal Assessment (CIA)");
  const [formStartDate, setFormStartDate] = useState("");
  const [formEndDate, setFormEndDate] = useState("");
  const [formTotalMaxMarks, setFormTotalMaxMarks] = useState<number>(100);
  const [formTotalPassingMarks, setFormTotalPassingMarks] = useState<number>(40);
  const [formStatus, setFormStatus] = useState<IAAssessmentStatus>("Draft");

  // Multi-component toggle & list
  const [hasMultipleComponents, setHasMultipleComponents] = useState(false);
  const [formComponents, setFormComponents] = useState<IAComponent[]>([
    {
      id: "comp-1",
      name: "Written Test (Theory)",
      type: "Theory / Written Test",
      maxMarks: 50,
      weightagePercentage: 50,
      passingMarks: 20,
      dueDate: "",
      instructions: "",
    },
    {
      id: "comp-2",
      name: "Assignment / Practical Lab",
      type: "Assignment",
      maxMarks: 50,
      weightagePercentage: 50,
      passingMarks: 20,
      dueDate: "",
      instructions: "",
    },
  ]);

  // Form error message
  const [formError, setFormError] = useState<string | null>(null);

  // -----------------------------------------------------------
  // Detail View Modal & Status Transition Modal
  // -----------------------------------------------------------
  const [selectedAssessment, setSelectedAssessment] = useState<IAAssessment | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Status transition state
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [statusTargetAssessment, setStatusTargetAssessment] = useState<IAAssessment | null>(null);
  const [newTargetStatus, setNewTargetStatus] = useState<IAAssessmentStatus>("Scheduled");
  const [statusRemarks, setStatusRemarks] = useState("");

  // Delete Confirmation Modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [assessmentToDelete, setAssessmentToDelete] = useState<IAAssessment | null>(null);

  // -----------------------------------------------------------
  // Cascading Dropdown Handlers
  // -----------------------------------------------------------
  // Filter classes by course
  const availableClasses = useMemo(() => {
    if (!formCourseId) return classes;
    return classes.filter((c) => c.courseId === formCourseId);
  }, [classes, formCourseId]);

  // Filter sections by class
  const availableSections = useMemo(() => {
    if (!formClassId) return sections;
    return sections.filter((s) => s.classId === formClassId);
  }, [sections, formClassId]);

  // Filter subjects by class and course
  const availableSubjects = useMemo(() => {
    return subjects.filter((s) => {
      const matchCourse = !formCourseId || s.courseId === formCourseId;
      const matchClass = !formClassId || !s.classId || s.classId === formClassId;
      return matchCourse && matchClass;
    });
  }, [subjects, formCourseId, formClassId]);

  // Auto-fill allocated teacher when subject changes
  const handleSubjectChange = (subjId: string) => {
    setFormSubjectId(subjId);
    const chosenSubject = subjects.find((s) => s.id === subjId);
    if (chosenSubject) {
      if (chosenSubject.allocatedTeacherName) {
        const foundStaff = staff.find((st) => st.fullName === chosenSubject.allocatedTeacherName);
        if (foundStaff) {
          setFormTeacherId(foundStaff.id);
        }
      }
      if (!formCode || formCode.startsWith("IA-")) {
        setFormCode(`IA-${chosenSubject.code}-${new Date().getFullYear().toString().slice(-2)}`);
      }
    }
  };

  // Multi-component weightage calculation
  const totalComponentWeightage = useMemo(() => {
    if (!hasMultipleComponents) return 100;
    return formComponents.reduce((acc, c) => acc + (Number(c.weightagePercentage) || 0), 0);
  }, [hasMultipleComponents, formComponents]);

  const isWeightageValid = Math.abs(totalComponentWeightage - 100) < 0.01;

  // Add component
  const handleAddComponent = () => {
    const newComp: IAComponent = {
      id: `comp-${Date.now()}-${formComponents.length + 1}`,
      name: `Component ${formComponents.length + 1}`,
      type: "Theory / Written Test",
      maxMarks: 25,
      weightagePercentage: 25,
      passingMarks: 10,
      dueDate: formEndDate || "",
      instructions: "",
    };
    setFormComponents([...formComponents, newComp]);
  };

  // Remove component
  const handleRemoveComponent = (id: string) => {
    if (formComponents.length <= 1) {
      setFormError("At least one component is required in multi-component mode.");
      return;
    }
    setFormComponents(formComponents.filter((c) => c.id !== id));
  };

  // Update component field
  const handleUpdateComponent = (
    id: string,
    field: keyof IAComponent,
    value: string | number
  ) => {
    setFormComponents(
      formComponents.map((c) => {
        if (c.id === id) {
          return { ...c, [field]: value };
        }
        return c;
      })
    );
  };

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setEditingAssessmentId(null);
    setFormName("");
    setFormCode("");
    setFormDescription("");
    setFormAyId(activeAcademicYear?.id || academicYears[0]?.id || "");
    const firstCourse = courses[0]?.id || "";
    setFormCourseId(firstCourse);
    const firstClass = classes.find((c) => c.courseId === firstCourse)?.id || classes[0]?.id || "";
    setFormClassId(firstClass);
    setFormSectionId("ALL");
    const firstSubject = subjects.find((s) => s.classId === firstClass)?.id || subjects[0]?.id || "";
    setFormSubjectId(firstSubject);
    setFormTeacherId(staff[0]?.id || "");
    setFormType("Continuous Internal Assessment (CIA)");
    setFormStartDate("");
    setFormEndDate("");
    setFormTotalMaxMarks(100);
    setFormTotalPassingMarks(40);
    setFormStatus("Draft");
    setHasMultipleComponents(true);
    setFormComponents([
      {
        id: "comp-1",
        name: "Written Test (Theory)",
        type: "Theory / Written Test",
        maxMarks: 50,
        weightagePercentage: 50,
        passingMarks: 20,
        dueDate: "",
        instructions: "",
      },
      {
        id: "comp-2",
        name: "Lab Practical Exam / Assignment",
        type: "Practical / Lab",
        maxMarks: 50,
        weightagePercentage: 50,
        passingMarks: 20,
        dueDate: "",
        instructions: "",
      },
    ]);
    setFormError(null);
    setIsFormModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (assessment: IAAssessment) => {
    setEditingAssessmentId(assessment.id);
    setFormName(assessment.name);
    setFormCode(assessment.assessmentCode);
    setFormDescription(assessment.description || "");
    setFormAyId(assessment.academicYearId);
    setFormCourseId(assessment.courseId);
    setFormClassId(assessment.classId);
    setFormSectionId(assessment.sectionId || "ALL");
    setFormSubjectId(assessment.subjectId);
    setFormTeacherId(assessment.teacherId || "");
    setFormType(assessment.type);
    setFormStartDate(assessment.startDate);
    setFormEndDate(assessment.endDate);
    setFormTotalMaxMarks(assessment.totalMaxMarks);
    setFormTotalPassingMarks(assessment.totalPassingMarks);
    setFormStatus(assessment.status);
    setHasMultipleComponents(assessment.hasMultipleComponents);
    setFormComponents(
      assessment.components && assessment.components.length > 0
        ? assessment.components
        : [
            {
              id: "comp-1",
              name: "Standard Assessment",
              type: "Theory / Written Test",
              maxMarks: assessment.totalMaxMarks,
              weightagePercentage: 100,
              passingMarks: assessment.totalPassingMarks,
              dueDate: assessment.endDate,
            },
          ]
    );
    setFormError(null);
    setIsFormModalOpen(true);
  };

  // Save / Submit Form
  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Basic Validation
    if (!formName.trim()) {
      setFormError("Assessment Name is required.");
      return;
    }
    if (!formCourseId || !formClassId || !formSubjectId) {
      setFormError("Course, Class, and Subject must be selected.");
      return;
    }
    if (!formStartDate || !formEndDate) {
      setFormError("Both Start Date and End Date are mandatory.");
      return;
    }
    if (formStartDate > formEndDate) {
      setFormError("End Date must be on or after Start Date.");
      return;
    }
    if (formTotalMaxMarks <= 0) {
      setFormError("Total Maximum Marks must be greater than 0.");
      return;
    }
    if (formTotalPassingMarks <= 0 || formTotalPassingMarks > formTotalMaxMarks) {
      setFormError("Passing Marks must be greater than 0 and cannot exceed Total Maximum Marks.");
      return;
    }

    // Components check
    let finalComponents: IAComponent[] = [];
    if (hasMultipleComponents) {
      if (formComponents.length === 0) {
        setFormError("Please configure at least one assessment component.");
        return;
      }
      if (!isWeightageValid) {
        setFormError(
          `Total component weightage must equal exactly 100%. Current total: ${totalComponentWeightage}%.`
        );
        return;
      }
      for (const comp of formComponents) {
        if (!comp.name.trim()) {
          setFormError("All components must have a valid descriptive name.");
          return;
        }
        if (comp.maxMarks <= 0) {
          setFormError(`Component "${comp.name}" maximum marks must be greater than 0.`);
          return;
        }
        if (comp.passingMarks > comp.maxMarks) {
          setFormError(
            `Component "${comp.name}" passing marks cannot exceed its maximum marks.`
          );
          return;
        }
      }
      finalComponents = formComponents;
    } else {
      // Single component
      finalComponents = [
        {
          id: `comp-single-${Date.now()}`,
          name: formName.trim(),
          type: "Theory / Written Test",
          maxMarks: formTotalMaxMarks,
          weightagePercentage: 100,
          passingMarks: formTotalPassingMarks,
          dueDate: formEndDate,
        },
      ];
    }

    const selectedCourse = courses.find((c) => c.id === formCourseId);
    const selectedClass = classes.find((c) => c.id === formClassId);
    const selectedSection = sections.find((s) => s.id === formSectionId);
    const selectedSubject = subjects.find((s) => s.id === formSubjectId);
    const selectedAy = academicYears.find((ay) => ay.id === formAyId);
    const selectedTeacher = staff.find((st) => st.id === formTeacherId);

    const payload = {
      assessmentCode: formCode.trim() || `IA-${selectedSubject?.code || "SUBJ"}-${Date.now().toString().slice(-4)}`,
      name: formName.trim(),
      description: formDescription.trim(),
      academicYearId: formAyId,
      academicYearName: selectedAy?.name || "2026-2027",
      courseId: formCourseId,
      courseName: selectedCourse?.name || "",
      classId: formClassId,
      className: selectedClass?.name || "",
      sectionId: formSectionId,
      sectionName: formSectionId === "ALL" ? "All Sections" : selectedSection?.name || "Section",
      subjectId: formSubjectId,
      subjectCode: selectedSubject?.code || "",
      subjectName: selectedSubject?.name || "",
      subjectType: selectedSubject?.type || "Core Theory",
      teacherId: formTeacherId || undefined,
      teacherName: selectedTeacher?.fullName || selectedSubject?.allocatedTeacherName || "Faculty Assigned",
      type: formType,
      startDate: formStartDate,
      endDate: formEndDate,
      totalMaxMarks: formTotalMaxMarks,
      totalPassingMarks: formTotalPassingMarks,
      status: formStatus,
      hasMultipleComponents,
      components: finalComponents,
      statusHistory: [],
      totalEnrolledStudents: selectedClass?.totalStudents || 60,
      marksEnteredCount: 0,
    };

    if (editingAssessmentId) {
      const res = updateIAAssessment(editingAssessmentId, payload);
      if (!res.success) {
        setFormError(res.message);
        return;
      }
      showFeedback("success", res.message);
    } else {
      const res = addIAAssessment(payload);
      if (!res.success) {
        setFormError(res.message);
        return;
      }
      showFeedback("success", res.message);
    }

    setIsFormModalOpen(false);
  };

  // Open Status Transition Modal
  const handleOpenStatusModal = (assessment: IAAssessment) => {
    setStatusTargetAssessment(assessment);
    setNewTargetStatus(
      assessment.status === "Draft"
        ? "Scheduled"
        : assessment.status === "Scheduled"
        ? "Ongoing"
        : assessment.status === "Ongoing"
        ? "Completed"
        : "Published"
    );
    setStatusRemarks("");
    setIsStatusModalOpen(true);
  };

  // Execute Status Transition
  const handleExecuteStatusTransition = () => {
    if (!statusTargetAssessment) return;
    const res = transitionIAAssessmentStatus(
      statusTargetAssessment.id,
      newTargetStatus,
      statusRemarks.trim() || undefined
    );
    if (!res.success) {
      showFeedback("error", res.message);
      return;
    }
    showFeedback("success", res.message);
    setIsStatusModalOpen(false);
    if (selectedAssessment?.id === statusTargetAssessment.id) {
      setSelectedAssessment({
        ...selectedAssessment,
        status: newTargetStatus,
      });
    }
  };

  // Delete Assessment
  const handleDeleteAssessment = () => {
    if (!assessmentToDelete) return;
    const res = deleteIAAssessment(assessmentToDelete.id);
    if (!res.success) {
      showFeedback("error", res.message);
    } else {
      showFeedback("success", res.message);
    }
    setIsDeleteModalOpen(false);
    if (selectedAssessment?.id === assessmentToDelete.id) {
      setIsDetailModalOpen(false);
      setSelectedAssessment(null);
    }
  };

  // Duplicate Assessment
  const handleDuplicateAssessment = (assessment: IAAssessment) => {
    const duplicatedName = `${assessment.name} (Copy)`;
    const duplicatedCode = `${assessment.assessmentCode}-C`;
    const res = addIAAssessment({
      ...assessment,
      name: duplicatedName,
      assessmentCode: duplicatedCode,
      status: "Draft",
      marksEnteredCount: 0,
    });
    if (!res.success) {
      showFeedback("error", res.message);
    } else {
      showFeedback("success", `Duplicated assessment created as Draft: ${duplicatedName}`);
    }
  };

  // -----------------------------------------------------------
  // Filtered Assessments Data
  // -----------------------------------------------------------
  const filteredAssessments = useMemo(() => {
    return iaAssessments.filter((a) => {
      // Query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = a.name.toLowerCase().includes(q);
        const matchesCode = a.assessmentCode.toLowerCase().includes(q);
        const matchesSubject =
          a.subjectName.toLowerCase().includes(q) || a.subjectCode.toLowerCase().includes(q);
        const matchesClass = a.className?.toLowerCase().includes(q);
        const matchesTeacher = a.teacherName?.toLowerCase().includes(q);
        if (!matchesName && !matchesCode && !matchesSubject && !matchesClass && !matchesTeacher) {
          return false;
        }
      }

      // Academic Year
      if (ayFilter !== "ALL" && a.academicYearId !== ayFilter) return false;

      // Course
      if (courseFilter !== "ALL" && a.courseId !== courseFilter) return false;

      // Class
      if (classFilter !== "ALL" && a.classId !== classFilter) return false;

      // Subject
      if (subjectFilter !== "ALL" && a.subjectId !== subjectFilter) return false;

      // Assessment Type
      if (typeFilter !== "ALL" && a.type !== typeFilter) return false;

      // Status
      if (statusFilter !== "ALL" && a.status !== statusFilter) return false;

      return true;
    });
  }, [
    iaAssessments,
    searchQuery,
    ayFilter,
    courseFilter,
    classFilter,
    subjectFilter,
    typeFilter,
    statusFilter,
  ]);

  // Export CSV
  const handleExportCSV = () => {
    if (filteredAssessments.length === 0) {
      showFeedback("info", "No assessment records to export.");
      return;
    }
    const headers = [
      "Assessment Code",
      "Assessment Name",
      "Type",
      "Academic Year",
      "Course",
      "Class",
      "Section",
      "Subject Code",
      "Subject Name",
      "Allocated Teacher",
      "Start Date",
      "End Date",
      "Max Marks",
      "Passing Marks",
      "Status",
      "Multi-Component",
      "Component Count",
    ];

    const rows = filteredAssessments.map((a) => [
      `"${a.assessmentCode}"`,
      `"${a.name.replace(/"/g, '""')}"`,
      `"${a.type}"`,
      `"${a.academicYearName || ""}"`,
      `"${a.courseName || ""}"`,
      `"${a.className || ""}"`,
      `"${a.sectionName || "All Sections"}"`,
      `"${a.subjectCode}"`,
      `"${a.subjectName.replace(/"/g, '""')}"`,
      `"${a.teacherName || ""}"`,
      `"${a.startDate}"`,
      `"${a.endDate}"`,
      a.totalMaxMarks,
      a.totalPassingMarks,
      `"${a.status}"`,
      a.hasMultipleComponents ? "Yes" : "No",
      a.components ? a.components.length : 1,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `SST_ERP_IA_Assessments_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showFeedback("success", "Assessment schedule exported to CSV.");
  };

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Page Header */}
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
            <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">
              Operations & Assessments
            </span>
            <span className="text-[#CBD5E1]">•</span>
            <span className="text-xs font-bold text-[#14B8A6] uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Phase 4A
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#1E293B] tracking-tight">
            Internal Assessment (IA) Management
          </h1>
          <p className="text-sm text-[#64748B] mt-1">
            Define continuous internal assessments (CIA), unit tests, multi-component rubrics, and weightage distribution across academic terms.
          </p>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <Link href="/admin/ia/marks-entry">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<FileSpreadsheet className="w-4 h-4 text-[#0D9488]" />}
              className="border-[#99F6E4] bg-[#CCFBF1] text-[#0D9488] hover:bg-[#99F6E4]"
            >
              Marks Entry Desk
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            leftIcon={<Download className="w-4 h-4 text-[#2563EB]" />}
          >
            Export Schedule
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenCreateModal}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Create Assessment
          </Button>
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

      {/* KPI Dashboard Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card className="p-3.5 border-[#E2E8F0] shadow-xs">
          <div className="flex items-center justify-between text-[#64748B] mb-1">
            <span className="text-xs font-medium uppercase tracking-wider">Total</span>
            <Award className="w-4 h-4 text-[#153B66]" />
          </div>
          <div className="text-2xl font-black text-[#153B66]">{metrics.totalAssessments}</div>
          <div className="text-[11px] text-[#64748B] mt-0.5">All IA cycles</div>
        </Card>

        <Card className="p-3.5 border-[#E2E8F0] shadow-xs">
          <div className="flex items-center justify-between text-[#64748B] mb-1">
            <span className="text-xs font-medium uppercase tracking-wider">Draft</span>
            <FileText className="w-4 h-4 text-[#64748B]" />
          </div>
          <div className="text-2xl font-black text-[#64748B]">{metrics.draftAssessments}</div>
          <div className="text-[11px] text-[#64748B] mt-0.5">In configuration</div>
        </Card>

        <Card className="p-3.5 border-[#E2E8F0] shadow-xs">
          <div className="flex items-center justify-between text-[#64748B] mb-1">
            <span className="text-xs font-medium uppercase tracking-wider">Scheduled</span>
            <Calendar className="w-4 h-4 text-[#2563EB]" />
          </div>
          <div className="text-2xl font-black text-[#2563EB]">{metrics.scheduledAssessments}</div>
          <div className="text-[11px] text-[#2563EB] mt-0.5">On timetable</div>
        </Card>

        <Card className="p-3.5 border-[#E2E8F0] shadow-xs">
          <div className="flex items-center justify-between text-[#64748B] mb-1">
            <span className="text-xs font-medium uppercase tracking-wider">Ongoing</span>
            <Clock className="w-4 h-4 text-[#D97706]" />
          </div>
          <div className="text-2xl font-black text-[#D97706]">{metrics.ongoingAssessments}</div>
          <div className="text-[11px] text-[#D97706] mt-0.5">In conduct window</div>
        </Card>

        <Card className="p-3.5 border-[#E2E8F0] shadow-xs">
          <div className="flex items-center justify-between text-[#64748B] mb-1">
            <span className="text-xs font-medium uppercase tracking-wider">Completed</span>
            <CheckCircle2 className="w-4 h-4 text-[#0D9488]" />
          </div>
          <div className="text-2xl font-black text-[#0D9488]">{metrics.completedAssessments}</div>
          <div className="text-[11px] text-[#0D9488] mt-0.5">Conducted</div>
        </Card>

        <Card className="p-3.5 border-[#E2E8F0] shadow-xs">
          <div className="flex items-center justify-between text-[#64748B] mb-1">
            <span className="text-xs font-medium uppercase tracking-wider">Published</span>
            <Check className="w-4 h-4 text-[#16A34A]" />
          </div>
          <div className="text-2xl font-black text-[#16A34A]">{metrics.publishedAssessments}</div>
          <div className="text-[11px] text-[#16A34A] mt-0.5">Student visible</div>
        </Card>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1 border-b border-[#E2E8F0] overflow-x-auto pb-px">
        <button
          onClick={() => setActiveTab("dashboard")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition-colors cursor-pointer border-b-2 whitespace-nowrap ${
            activeTab === "dashboard"
              ? "border-[#2563EB] text-[#2563EB]"
              : "border-transparent text-[#64748B] hover:text-[#1E293B]"
          }`}
        >
          <BarChart2 className="w-4 h-4" /> Dashboard & Schedule
        </button>

        <button
          onClick={() => setActiveTab("assessments")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition-colors cursor-pointer border-b-2 whitespace-nowrap ${
            activeTab === "assessments"
              ? "border-[#2563EB] text-[#2563EB]"
              : "border-transparent text-[#64748B] hover:text-[#1E293B]"
          }`}
        >
          <Award className="w-4 h-4" /> All Assessments ({filteredAssessments.length})
        </button>

        <button
          onClick={() => setActiveTab("components")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition-colors cursor-pointer border-b-2 whitespace-nowrap ${
            activeTab === "components"
              ? "border-[#2563EB] text-[#2563EB]"
              : "border-transparent text-[#64748B] hover:text-[#1E293B]"
          }`}
        >
          <Sliders className="w-4 h-4" /> Components & Weightage
        </button>

        <button
          onClick={() => setActiveTab("matrix")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition-colors cursor-pointer border-b-2 whitespace-nowrap ${
            activeTab === "matrix"
              ? "border-[#2563EB] text-[#2563EB]"
              : "border-transparent text-[#64748B] hover:text-[#1E293B]"
          }`}
        >
          <Layers className="w-4 h-4" /> Class & Subject Matrix
        </button>

        <button
          onClick={() => setActiveTab("history")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition-colors cursor-pointer border-b-2 whitespace-nowrap ${
            activeTab === "history"
              ? "border-[#2563EB] text-[#2563EB]"
              : "border-transparent text-[#64748B] hover:text-[#1E293B]"
          }`}
        >
          <RotateCcw className="w-4 h-4" /> Lifecycle & Audit Trail
        </button>
      </div>

      {/* ----------------------------------------------------------- */}
      {/* TAB 1: DASHBOARD & UPCOMING SCHEDULE */}
      {/* ----------------------------------------------------------- */}
      {activeTab === "dashboard" && (
        <div className="space-y-6">
          {/* Institutional Alert / Info Banner */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-[#153B66] to-[#1E4D82] text-white shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#14B8A6] bg-[#14B8A6]/20 px-2.5 py-0.5 rounded border border-[#14B8A6]/30">
                  Continuous Evaluation
                </span>
                <span className="text-xs text-[#93C5FD]">
                  Active Academic Year: {activeAcademicYear?.name || "2026-2027"}
                </span>
              </div>
              <h2 className="text-lg font-bold text-white">
                Internal Assessment Planning & Rubrics Architecture
              </h2>
              <p className="text-xs text-[#CBD5E1] max-w-2xl">
                Configure mid-semester evaluations with flexible multi-component rubrics (Theory 50%, Practical 30%, Assignment 20%). Validated weightage ensures 100% mathematical integrity before scheduling.
              </p>
            </div>
            <div className="flex items-center gap-2.5 shrink-0">
              <Button
                variant="primary"
                size="sm"
                onClick={handleOpenCreateModal}
                className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white"
                leftIcon={<Plus className="w-4 h-4" />}
              >
                New Assessment
              </Button>
            </div>
          </div>

          {/* Timeline Cards: Scheduled & Ongoing Assessments */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Upcoming / Active Schedule Feed */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#1E293B] uppercase tracking-wider flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-[#2563EB]" /> Upcoming Assessment Schedule
                </h3>
                <span className="text-xs text-[#64748B]">
                  {iaAssessments.filter((a) => a.status === "Scheduled" || a.status === "Ongoing").length} active cycles
                </span>
              </div>

              {iaAssessments.filter((a) => a.status === "Scheduled" || a.status === "Ongoing").length === 0 ? (
                <Card className="p-8 text-center border-dashed border-[#CBD5E1]">
                  <Award className="w-10 h-10 text-[#94A3B8] mx-auto mb-2 opacity-50" />
                  <p className="text-sm font-semibold text-[#1E293B]">No upcoming assessments scheduled</p>
                  <p className="text-xs text-[#64748B] mt-1">Create and schedule continuous assessments for active classes.</p>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleOpenCreateModal}
                    className="mt-4"
                    leftIcon={<Plus className="w-4 h-4" />}
                  >
                    Schedule Assessment
                  </Button>
                </Card>
              ) : (
                <div className="space-y-3">
                  {iaAssessments
                    .filter((a) => a.status === "Scheduled" || a.status === "Ongoing")
                    .map((assessment) => (
                      <Card
                        key={assessment.id}
                        className="p-4 border-[#E2E8F0] hover:border-[#BFDBFE] transition-colors shadow-xs"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge variant={STATUS_VARIANTS[assessment.status].variant} size="sm">
                                {assessment.status}
                              </Badge>
                              <span className="text-xs font-bold text-[#153B66] bg-[#F1F5F9] px-2 py-0.5 rounded font-mono">
                                {assessment.assessmentCode}
                              </span>
                              <span className="text-xs text-[#64748B]">•</span>
                              <span className="text-xs font-semibold text-[#2563EB]">
                                {assessment.type}
                              </span>
                            </div>
                            <h4 className="text-sm font-bold text-[#1E293B]">{assessment.name}</h4>
                            <div className="flex items-center gap-3 text-xs text-[#64748B] flex-wrap">
                              <span className="flex items-center gap-1">
                                <BookOpen className="w-3.5 h-3.5 text-[#14B8A6]" />
                                {assessment.subjectCode} - {assessment.subjectName}
                              </span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Users className="w-3.5 h-3.5 text-[#64748B]" />
                                {assessment.className} ({assessment.sectionName})
                              </span>
                            </div>
                          </div>

                          <div className="text-right sm:border-l sm:pl-4 sm:border-[#E2E8F0] shrink-0 space-y-1">
                            <div className="text-xs font-bold text-[#1E293B] flex items-center sm:justify-end gap-1">
                              <Calendar className="w-3.5 h-3.5 text-[#2563EB]" />
                              {assessment.startDate} to {assessment.endDate}
                            </div>
                            <div className="text-[11px] text-[#64748B]">
                              Max: <strong className="text-[#1E293B]">{assessment.totalMaxMarks}</strong> | Passing: <strong className="text-[#1E293B]">{assessment.totalPassingMarks}</strong>
                            </div>
                            <div className="flex items-center sm:justify-end gap-1.5 pt-1">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedAssessment(assessment);
                                  setIsDetailModalOpen(true);
                                }}
                              >
                                View Rubrics
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenStatusModal(assessment)}
                              >
                                Transition
                              </Button>
                            </div>
                          </div>
                        </div>

                        {/* Component Pill Badges */}
                        {assessment.components && assessment.components.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-[#F1F5F9] flex items-center gap-2 flex-wrap">
                            <span className="text-[11px] font-semibold text-[#64748B]">Components:</span>
                            {assessment.components.map((c) => (
                              <span
                                key={c.id}
                                className="text-[11px] bg-[#F8FAFC] border border-[#E2E8F0] text-[#334155] px-2 py-0.5 rounded-md flex items-center gap-1.5"
                              >
                                <span className="font-semibold">{c.name}</span>
                                <span className="text-[#2563EB] font-bold">({c.weightagePercentage}%)</span>
                              </span>
                            ))}
                          </div>
                        )}
                      </Card>
                    ))}
                </div>
              )}
            </div>

            {/* Quick Summary & Operational Health Card */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-[#1E293B] uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#14B8A6]" /> Assessment Health
              </h3>

              <Card className="p-4 border-[#E2E8F0] space-y-3.5 shadow-xs">
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-[#64748B]">Multi-Component Ratio</span>
                    <span className="text-[#153B66] font-bold">
                      {Math.round(
                        (iaAssessments.filter((a) => a.hasMultipleComponents).length /
                          (iaAssessments.length || 1)) *
                          100
                      )}
                      %
                    </span>
                  </div>
                  <div className="w-full bg-[#E2E8F0] h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-[#2563EB] h-full rounded-full"
                      style={{
                        width: `${Math.round(
                          (iaAssessments.filter((a) => a.hasMultipleComponents).length /
                            (iaAssessments.length || 1)) *
                            100
                        )}%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-[#64748B]">Published to Student Portal</span>
                    <span className="text-[#16A34A] font-bold">
                      {Math.round(
                        (metrics.publishedAssessments / (iaAssessments.length || 1)) * 100
                      )}
                      %
                    </span>
                  </div>
                  <div className="w-full bg-[#E2E8F0] h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-[#16A34A] h-full rounded-full"
                      style={{
                        width: `${Math.round(
                          (metrics.publishedAssessments / (iaAssessments.length || 1)) * 100
                        )}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-[#F1F5F9] space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[#64748B]">Pending Marks Entry</span>
                    <span className="font-bold text-[#D97706] bg-[#FEF3C7] px-2 py-0.5 rounded">
                      {metrics.pendingMarksEntry} cycles
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#64748B]">Weightage Validation</span>
                    <span className="font-bold text-[#16A34A] bg-[#DCFCE7] px-2 py-0.5 rounded flex items-center gap-1">
                      <Check className="w-3 h-3" /> 100% Strictly Enforced
                    </span>
                  </div>
                </div>
              </Card>

              {/* Assessment Guidelines Card */}
              <Card className="p-4 bg-[#F8FAFC] border-[#E2E8F0] space-y-2 text-xs">
                <div className="font-bold text-[#1E293B] flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-[#2563EB]" /> Institutional CIA Policy
                </div>
                <ul className="list-disc list-inside text-[#64748B] space-y-1 text-[11px] leading-relaxed">
                  <li>Continuous Internal Assessments (CIA) require at least 2 distinct components.</li>
                  <li>Total component weightage must equal exactly 100%.</li>
                  <li>Draft assessments must be transitioned to Scheduled before students can view dates.</li>
                  <li>Publishing results occurs after marks entry and moderation (Phase 4B).</li>
                </ul>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------- */}
      {/* TAB 2: ALL ASSESSMENTS MASTER DIRECTORY */}
      {/* ----------------------------------------------------------- */}
      {activeTab === "assessments" && (
        <div className="space-y-4">
          {/* Multi-Tier Filter & Search Toolbar */}
          <Card className="p-4 border-[#E2E8F0] shadow-xs space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {/* Search query */}
              <div className="md:col-span-2 relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                <Input
                  type="text"
                  placeholder="Search assessment name, code, subject, class, or faculty..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* Status Filter */}
              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full h-10 px-3 text-xs bg-white border border-[#CBD5E1] rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#2563EB]"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="Draft">Draft</option>
                  <option value="Scheduled">Scheduled</option>
                  <option value="Ongoing">Ongoing</option>
                  <option value="Completed">Completed</option>
                  <option value="Published">Published</option>
                </select>
              </div>

              {/* Assessment Type Filter */}
              <div>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full h-10 px-3 text-xs bg-white border border-[#CBD5E1] rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#2563EB]"
                >
                  <option value="ALL">All Assessment Types</option>
                  {ASSESSMENT_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Secondary Filter Row: Course, Class, Subject */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2 border-t border-[#F1F5F9] text-xs">
              <div>
                <label className="text-[11px] font-semibold text-[#64748B] block mb-1">
                  Academic Year
                </label>
                <select
                  value={ayFilter}
                  onChange={(e) => setAyFilter(e.target.value)}
                  className="w-full h-9 px-2.5 bg-white border border-[#CBD5E1] rounded-md focus:outline-hidden"
                >
                  <option value="ALL">All Academic Years</option>
                  {academicYears.map((ay) => (
                    <option key={ay.id} value={ay.id}>
                      {ay.name} {ay.isActive ? "(Active)" : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#64748B] block mb-1">
                  Course / Program
                </label>
                <select
                  value={courseFilter}
                  onChange={(e) => {
                    setCourseFilter(e.target.value);
                    setClassFilter("ALL");
                    setSubjectFilter("ALL");
                  }}
                  className="w-full h-9 px-2.5 bg-white border border-[#CBD5E1] rounded-md focus:outline-hidden"
                >
                  <option value="ALL">All Courses</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#64748B] block mb-1">
                  Class / Semester
                </label>
                <select
                  value={classFilter}
                  onChange={(e) => setClassFilter(e.target.value)}
                  className="w-full h-9 px-2.5 bg-white border border-[#CBD5E1] rounded-md focus:outline-hidden"
                >
                  <option value="ALL">All Classes</option>
                  {classes
                    .filter((c) => courseFilter === "ALL" || c.courseId === courseFilter)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#64748B] block mb-1">
                  Subject
                </label>
                <select
                  value={subjectFilter}
                  onChange={(e) => setSubjectFilter(e.target.value)}
                  className="w-full h-9 px-2.5 bg-white border border-[#CBD5E1] rounded-md focus:outline-hidden"
                >
                  <option value="ALL">All Subjects</option>
                  {subjects
                    .filter((s) => classFilter === "ALL" || s.classId === classFilter)
                    .map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.code} - {s.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            {/* Active Filters Clear Bar */}
            {(searchQuery ||
              ayFilter !== "ALL" ||
              courseFilter !== "ALL" ||
              classFilter !== "ALL" ||
              subjectFilter !== "ALL" ||
              typeFilter !== "ALL" ||
              statusFilter !== "ALL") && (
              <div className="flex items-center justify-between text-xs pt-1 text-[#64748B]">
                <span>
                  Showing <strong className="text-[#1E293B]">{filteredAssessments.length}</strong> of{" "}
                  {iaAssessments.length} assessments
                </span>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setAyFilter("ALL");
                    setCourseFilter("ALL");
                    setClassFilter("ALL");
                    setSubjectFilter("ALL");
                    setTypeFilter("ALL");
                    setStatusFilter("ALL");
                  }}
                  className="text-xs text-[#2563EB] hover:underline font-semibold cursor-pointer"
                >
                  Reset all filters
                </button>
              </div>
            )}
          </Card>

          {/* Master Table of Assessments */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Assessment & Code</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Class & Section</TableHead>
                <TableHead>Subject & Faculty</TableHead>
                <TableHead>Timeline</TableHead>
                <TableHead>Marks (Max / Pass)</TableHead>
                <TableHead>Components</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAssessments.length === 0 ? (
                <TableEmpty colSpan={9} message="No assessments match the selected search and filter criteria." />
              ) : (
                filteredAssessments.map((assessment) => (
                  <TableRow key={assessment.id} className="hover:bg-[#F8FAFC]">
                    {/* Code & Name */}
                    <TableCell>
                      <div className="font-bold text-[#1E293B]">{assessment.name}</div>
                      <div className="text-[11px] font-mono text-[#2563EB] font-semibold">
                        {assessment.assessmentCode}
                      </div>
                    </TableCell>

                    {/* Type */}
                    <TableCell>
                      <span className="text-xs font-semibold text-[#475569]">{assessment.type}</span>
                    </TableCell>

                    {/* Class & Section */}
                    <TableCell>
                      <div className="font-semibold text-[#1E293B] text-xs">{assessment.className}</div>
                      <div className="text-[11px] text-[#64748B]">{assessment.sectionName || "All Sections"}</div>
                    </TableCell>

                    {/* Subject & Faculty */}
                    <TableCell>
                      <div className="font-semibold text-xs text-[#153B66]">
                        {assessment.subjectCode} - {assessment.subjectName}
                      </div>
                      <div className="text-[11px] text-[#64748B]">
                        Faculty: {assessment.teacherName || "Unassigned"}
                      </div>
                    </TableCell>

                    {/* Timeline */}
                    <TableCell>
                      <div className="text-xs font-medium text-[#1E293B] whitespace-nowrap">
                        {assessment.startDate}
                      </div>
                      <div className="text-[11px] text-[#64748B] whitespace-nowrap">
                        to {assessment.endDate}
                      </div>
                    </TableCell>

                    {/* Marks */}
                    <TableCell>
                      <div className="text-xs font-bold text-[#1E293B]">
                        {assessment.totalMaxMarks} M
                      </div>
                      <div className="text-[11px] text-[#16A34A]">Pass: {assessment.totalPassingMarks} M</div>
                    </TableCell>

                    {/* Components */}
                    <TableCell>
                      {assessment.hasMultipleComponents ? (
                        <span className="text-xs font-bold text-[#2563EB] bg-[#EFF6FF] px-2 py-0.5 rounded border border-[#BFDBFE]">
                          {assessment.components?.length || 0} Components
                        </span>
                      ) : (
                        <span className="text-xs text-[#64748B] bg-[#F1F5F9] px-2 py-0.5 rounded">
                          Single
                        </span>
                      )}
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <Badge variant={STATUS_VARIANTS[assessment.status].variant} size="sm">
                        {assessment.status}
                      </Badge>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/admin/ia/marks-entry?assessmentId=${assessment.id}&classId=${assessment.classId}&sectionId=${assessment.sectionId || "ALL"}`}
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Enter & Process Marks"
                          >
                            <FileSpreadsheet className="w-4 h-4 text-[#0D9488]" />
                          </Button>
                        </Link>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedAssessment(assessment);
                            setIsDetailModalOpen(true);
                          }}
                          title="View Details"
                        >
                          <Eye className="w-4 h-4 text-[#64748B]" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenStatusModal(assessment)}
                          title="Change Status"
                        >
                          <TrendingUp className="w-4 h-4 text-[#2563EB]" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEditModal(assessment)}
                          title="Edit Assessment"
                        >
                          <Edit2 className="w-4 h-4 text-[#153B66]" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDuplicateAssessment(assessment)}
                          title="Duplicate Assessment"
                        >
                          <Copy className="w-4 h-4 text-[#0D9488]" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={assessment.status === "Published"}
                          onClick={() => {
                            setAssessmentToDelete(assessment);
                            setIsDeleteModalOpen(true);
                          }}
                          title={
                            assessment.status === "Published"
                              ? "Cannot delete published assessment"
                              : "Delete Assessment"
                          }
                        >
                          <Trash2 className="w-4 h-4 text-[#EF4444]" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* ----------------------------------------------------------- */}
      {/* TAB 3: COMPONENTS & RUBRICS WEIGHTAGE */}
      {/* ----------------------------------------------------------- */}
      {activeTab === "components" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#1E293B]">
                Assessment Components & Rubrics Overview
              </h3>
              <p className="text-xs text-[#64748B]">
                Review all constituent evaluation components across active internal assessments.
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={handleOpenCreateModal}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              New Multi-Component Assessment
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {iaAssessments.map((assessment) => (
              <Card key={assessment.id} className="p-4 border-[#E2E8F0] shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant={STATUS_VARIANTS[assessment.status].variant} size="sm">
                    {assessment.status}
                  </Badge>
                  <span className="text-xs font-mono font-bold text-[#2563EB]">
                    {assessment.assessmentCode}
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-[#1E293B]">{assessment.name}</h4>
                  <p className="text-xs text-[#64748B]">
                    {assessment.subjectCode} - {assessment.className}
                  </p>
                </div>

                <div className="pt-2 border-t border-[#F1F5F9] space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-[#475569]">
                    <span>Evaluation Breakdown</span>
                    <span>Total: {assessment.totalMaxMarks} M</span>
                  </div>

                  {assessment.components && assessment.components.length > 0 ? (
                    assessment.components.map((c) => (
                      <div key={c.id} className="p-2 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-[#1E293B]">{c.name}</span>
                          <span className="font-bold text-[#2563EB]">{c.weightagePercentage}%</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-[#64748B]">
                          <span>{c.type}</span>
                          <span>Max: {c.maxMarks} M | Pass: {c.passingMarks} M</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-2 rounded-lg bg-[#F8FAFC] text-xs text-[#64748B] text-center">
                      Single unitary assessment (100% weightage)
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-[#F1F5F9] flex items-center justify-between text-xs">
                  <span className="text-[#64748B]">Faculty:</span>
                  <span className="font-semibold text-[#1E293B]">{assessment.teacherName}</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------- */}
      {/* TAB 4: CLASS & SUBJECT COVERAGE MATRIX */}
      {/* ----------------------------------------------------------- */}
      {activeTab === "matrix" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#1E293B]">
                Class & Subject Assessment Matrix
              </h3>
              <p className="text-xs text-[#64748B]">
                Audit continuous assessment coverage across every curriculum subject in active class cohorts.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              leftIcon={<Download className="w-4 h-4 text-[#2563EB]" />}
            >
              Export Matrix Report
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Class / Cohort</TableHead>
                <TableHead>Subject Code</TableHead>
                <TableHead>Subject Name</TableHead>
                <TableHead>Subject Type</TableHead>
                <TableHead>Allocated Assessments</TableHead>
                <TableHead>Status Breakdown</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subjects.map((subj) => {
                const matchedAssessments = iaAssessments.filter((a) => a.subjectId === subj.id);
                return (
                  <TableRow key={subj.id} className="hover:bg-[#F8FAFC]">
                    <TableCell className="font-semibold text-xs text-[#1E293B]">
                      {subj.className || "3rd Year Computer Science"}
                    </TableCell>
                    <TableCell className="font-mono text-xs font-bold text-[#2563EB]">
                      {subj.code}
                    </TableCell>
                    <TableCell className="text-xs font-medium text-[#1E293B]">
                      {subj.name}
                    </TableCell>
                    <TableCell>
                      <Badge variant={subj.type === "Practical / Lab" ? "teal" : "navy"} size="sm">
                        {subj.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {matchedAssessments.length === 0 ? (
                          <span className="text-xs text-[#DC2626] font-semibold bg-[#FEE2E2] px-2 py-0.5 rounded">
                            0 Assessments (Missing)
                          </span>
                        ) : (
                          matchedAssessments.map((a) => (
                            <span
                              key={a.id}
                              className="text-xs bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE] px-2 py-0.5 rounded-md font-medium"
                            >
                              {a.assessmentCode}
                            </span>
                          ))
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {matchedAssessments.map((a) => (
                          <Badge key={a.id} variant={STATUS_VARIANTS[a.status].variant} size="sm">
                            {a.status}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          handleOpenCreateModal();
                          setFormClassId(subj.classId || classes[0]?.id || "");
                          setFormSubjectId(subj.id);
                        }}
                      >
                        + Add IA
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* ----------------------------------------------------------- */}
      {/* TAB 5: LIFECYCLE & AUDIT TRAIL */}
      {/* ----------------------------------------------------------- */}
      {activeTab === "history" && (
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-bold text-[#1E293B]">
              Assessment Lifecycle & Status Transition Audit Trail
            </h3>
            <p className="text-xs text-[#64748B]">
              Immutable chronological record of administrative assessment updates, scheduling milestones, and publication stamps.
            </p>
          </div>

          <Card className="p-4 border-[#E2E8F0] shadow-xs">
            <div className="space-y-4">
              {iaAssessments.flatMap((a) =>
                (a.statusHistory || []).map((entry, idx) => ({
                  ...entry,
                  assessmentId: a.id,
                  assessmentCode: a.assessmentCode,
                  assessmentName: a.name,
                  subjectCode: a.subjectCode,
                  uniqueKey: `${a.id}-${idx}`,
                }))
              ).length === 0 ? (
                <div className="text-center py-8 text-xs text-[#64748B]">
                  No lifecycle history recorded yet.
                </div>
              ) : (
                iaAssessments
                  .flatMap((a) =>
                    (a.statusHistory || []).map((entry, idx) => ({
                      ...entry,
                      assessmentId: a.id,
                      assessmentCode: a.assessmentCode,
                      assessmentName: a.name,
                      subjectCode: a.subjectCode,
                      uniqueKey: `${a.id}-${idx}`,
                    }))
                  )
                  .sort(
                    (x, y) =>
                      new Date(y.changedAt).getTime() - new Date(x.changedAt).getTime()
                  )
                  .map((log) => (
                    <div
                      key={log.uniqueKey}
                      className="flex items-start justify-between gap-4 p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant={STATUS_VARIANTS[log.status].variant} size="sm">
                            {log.status}
                          </Badge>
                          <span className="font-bold text-[#1E293B]">{log.assessmentName}</span>
                          <span className="font-mono text-[#2563EB]">({log.assessmentCode})</span>
                        </div>
                        <p className="text-[#64748B] text-[11px]">
                          Remarks: {log.remarks || `Status transitioned to ${log.status}`}
                        </p>
                        <div className="text-[10px] text-[#94A3B8]">
                          Authorized By: <strong className="text-[#475569]">{log.changedBy}</strong>
                        </div>
                      </div>
                      <div className="text-right shrink-0 text-[11px] font-medium text-[#64748B]">
                        {new Date(log.changedAt).toLocaleDateString()} {new Date(log.changedAt).toLocaleTimeString()}
                      </div>
                    </div>
                  ))
              )}
            </div>
          </Card>
        </div>
      )}

      {/* ----------------------------------------------------------- */}
      {/* MODAL 1: CREATE / EDIT ASSESSMENT FORM */}
      {/* ----------------------------------------------------------- */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={editingAssessmentId ? "Edit Internal Assessment" : "Create Internal Assessment (IA)"}
        description="Configure evaluation parameters, academic alignment, and component weightages."
        maxWidth="2xl"
        footer={
          <div className="flex items-center justify-between w-full">
            <Button variant="outline" size="sm" onClick={() => setIsFormModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSubmitForm}>
              {editingAssessmentId ? "Save Changes" : "Create Assessment"}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSubmitForm} className="space-y-4 text-xs">
          {formError && (
            <Alert variant="error" className="py-2">
              {formError}
            </Alert>
          )}

          {/* Section: Basic Information */}
          <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] space-y-3">
            <div className="font-bold text-[#1E293B] text-xs flex items-center gap-1.5 uppercase tracking-wider">
              <Award className="w-3.5 h-3.5 text-[#2563EB]" /> Assessment Information
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-[#475569] block mb-1">
                  Assessment Name <span className="text-[#DC2626]">*</span>
                </label>
                <Input
                  type="text"
                  placeholder="e.g. Continuous Internal Assessment 1 (CIA-1)"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#475569] block mb-1">
                  Assessment Code (Identifier)
                </label>
                <Input
                  type="text"
                  placeholder="e.g. CIA-1-CS501"
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-[#475569] block mb-1">
                  Assessment Type <span className="text-[#DC2626]">*</span>
                </label>
                <select
                  value={formType}
                  onChange={(e) => setFormType(e.target.value as IAAssessmentType)}
                  className="w-full h-10 px-3 bg-white border border-[#CBD5E1] rounded-lg focus:outline-hidden text-xs"
                >
                  {ASSESSMENT_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#475569] block mb-1">
                  Academic Year <span className="text-[#DC2626]">*</span>
                </label>
                <select
                  value={formAyId}
                  onChange={(e) => setFormAyId(e.target.value)}
                  className="w-full h-10 px-3 bg-white border border-[#CBD5E1] rounded-lg focus:outline-hidden text-xs"
                >
                  {academicYears.map((ay) => (
                    <option key={ay.id} value={ay.id}>
                      {ay.name} {ay.isActive ? "(Active)" : ""}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-[#475569] block mb-1">
                Description / Syllabus Units Covered
              </label>
              <textarea
                rows={2}
                placeholder="Specify assessment coverage, student guidelines, closed-book rules, etc."
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                className="w-full p-2.5 text-xs bg-white border border-[#CBD5E1] rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#2563EB]"
              />
            </div>
          </div>

          {/* Section: Academic Structure Mapping */}
          <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] space-y-3">
            <div className="font-bold text-[#1E293B] text-xs flex items-center gap-1.5 uppercase tracking-wider">
              <Layers className="w-3.5 h-3.5 text-[#14B8A6]" /> Academic Structure & Subject Mapping
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-[#475569] block mb-1">
                  Course / Program <span className="text-[#DC2626]">*</span>
                </label>
                <select
                  value={formCourseId}
                  onChange={(e) => {
                    const cId = e.target.value;
                    setFormCourseId(cId);
                    const matchedClass = classes.find((c) => c.courseId === cId)?.id || "";
                    setFormClassId(matchedClass);
                    const matchedSubj = subjects.find((s) => s.classId === matchedClass)?.id || "";
                    handleSubjectChange(matchedSubj);
                  }}
                  className="w-full h-10 px-3 bg-white border border-[#CBD5E1] rounded-lg focus:outline-hidden text-xs"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#475569] block mb-1">
                  Class / Cohort <span className="text-[#DC2626]">*</span>
                </label>
                <select
                  value={formClassId}
                  onChange={(e) => {
                    const clId = e.target.value;
                    setFormClassId(clId);
                    const matchedSubj = subjects.find((s) => s.classId === clId)?.id || "";
                    handleSubjectChange(matchedSubj);
                  }}
                  className="w-full h-10 px-3 bg-white border border-[#CBD5E1] rounded-lg focus:outline-hidden text-xs"
                >
                  {availableClasses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-[#475569] block mb-1">
                  Section Allocation
                </label>
                <select
                  value={formSectionId}
                  onChange={(e) => setFormSectionId(e.target.value)}
                  className="w-full h-10 px-3 bg-white border border-[#CBD5E1] rounded-lg focus:outline-hidden text-xs"
                >
                  <option value="ALL">All Sections (Entire Class Cohort)</option>
                  {availableSections.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#475569] block mb-1">
                  Curriculum Subject <span className="text-[#DC2626]">*</span>
                </label>
                <select
                  value={formSubjectId}
                  onChange={(e) => handleSubjectChange(e.target.value)}
                  className="w-full h-10 px-3 bg-white border border-[#CBD5E1] rounded-lg focus:outline-hidden text-xs"
                >
                  {availableSubjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.code} - {s.name} ({s.type})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-[#475569] block mb-1">
                Faculty / Teacher Responsible
              </label>
              <select
                value={formTeacherId}
                onChange={(e) => setFormTeacherId(e.target.value)}
                className="w-full h-10 px-3 bg-white border border-[#CBD5E1] rounded-lg focus:outline-hidden text-xs"
              >
                <option value="">Unassigned</option>
                {staff.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.fullName} ({st.designation} - {st.departmentName})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Section: Timeline & Marks */}
          <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] space-y-3">
            <div className="font-bold text-[#1E293B] text-xs flex items-center gap-1.5 uppercase tracking-wider">
              <Calendar className="w-3.5 h-3.5 text-[#2563EB]" /> Schedule & Total Marks
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-[#475569] block mb-1">
                  Start Date <span className="text-[#DC2626]">*</span>
                </label>
                <Input
                  type="date"
                  value={formStartDate}
                  onChange={(e) => setFormStartDate(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#475569] block mb-1">
                  End Date <span className="text-[#DC2626]">*</span>
                </label>
                <Input
                  type="date"
                  value={formEndDate}
                  onChange={(e) => setFormEndDate(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-[#475569] block mb-1">
                  Total Maximum Marks <span className="text-[#DC2626]">*</span>
                </label>
                <Input
                  type="number"
                  min="1"
                  max="500"
                  value={formTotalMaxMarks}
                  onChange={(e) => setFormTotalMaxMarks(Number(e.target.value))}
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#475569] block mb-1">
                  Passing Marks <span className="text-[#DC2626]">*</span>
                </label>
                <Input
                  type="number"
                  min="1"
                  max={formTotalMaxMarks}
                  value={formTotalPassingMarks}
                  onChange={(e) => setFormTotalPassingMarks(Number(e.target.value))}
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#475569] block mb-1">
                  Initial Status
                </label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as IAAssessmentStatus)}
                  className="w-full h-10 px-3 bg-white border border-[#CBD5E1] rounded-lg focus:outline-hidden text-xs"
                >
                  <option value="Draft">Draft</option>
                  <option value="Scheduled">Scheduled</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section: Component Breakdown & Weightage Validator */}
          <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] space-y-3">
            <div className="flex items-center justify-between">
              <div className="font-bold text-[#1E293B] text-xs flex items-center gap-1.5 uppercase tracking-wider">
                <Sliders className="w-3.5 h-3.5 text-[#14B8A6]" /> Multi-Component Rubrics & Weightages
              </div>
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#153B66]">
                <input
                  type="checkbox"
                  checked={hasMultipleComponents}
                  onChange={(e) => setHasMultipleComponents(e.target.checked)}
                  className="rounded text-[#2563EB] focus:ring-[#2563EB] w-4 h-4 cursor-pointer"
                />
                <span>Enable Multi-Component Rubrics</span>
              </label>
            </div>

            {hasMultipleComponents ? (
              <div className="space-y-3">
                {/* Weightage Progress Bar */}
                <div className="p-2.5 rounded-lg bg-white border border-[#E2E8F0] space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#475569]">
                      Total Component Weightage:
                    </span>
                    <span
                      className={`font-black text-xs ${
                        isWeightageValid ? "text-[#16A34A]" : "text-[#DC2626]"
                      }`}
                    >
                      {totalComponentWeightage}% / 100% {isWeightageValid ? "✓ (Valid)" : "⚠ (Must Equal 100%)"}
                    </span>
                  </div>
                  <div className="w-full bg-[#E2E8F0] h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        isWeightageValid
                          ? "bg-[#16A34A]"
                          : totalComponentWeightage > 100
                          ? "bg-[#DC2626]"
                          : "bg-[#D97706]"
                      }`}
                      style={{ width: `${Math.min(totalComponentWeightage, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Components Table List */}
                <div className="space-y-2">
                  {formComponents.map((comp, idx) => (
                    <div
                      key={comp.id}
                      className="p-3 bg-white border border-[#CBD5E1] rounded-lg space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-[#1E293B]">
                          Component #{idx + 1}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveComponent(comp.id)}
                          className="text-[#DC2626] hover:bg-[#FEE2E2] h-7 px-2"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Remove
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div className="sm:col-span-2">
                          <label className="text-[10px] font-semibold text-[#64748B] block mb-0.5">
                            Component Name
                          </label>
                          <Input
                            type="text"
                            placeholder="e.g. Theory Test 1"
                            value={comp.name}
                            onChange={(e) =>
                              handleUpdateComponent(comp.id, "name", e.target.value)
                            }
                            className="h-8 text-xs"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-semibold text-[#64748B] block mb-0.5">
                            Component Type
                          </label>
                          <select
                            value={comp.type}
                            onChange={(e) =>
                              handleUpdateComponent(
                                comp.id,
                                "type",
                                e.target.value as IAComponentType
                              )
                            }
                            className="w-full h-8 px-2 text-xs bg-white border border-[#CBD5E1] rounded focus:outline-hidden"
                          >
                            {COMPONENT_TYPES.map((ct) => (
                              <option key={ct} value={ct}>
                                {ct}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        <div>
                          <label className="text-[10px] font-semibold text-[#64748B] block mb-0.5">
                            Max Marks
                          </label>
                          <Input
                            type="number"
                            min="1"
                            value={comp.maxMarks}
                            onChange={(e) =>
                              handleUpdateComponent(comp.id, "maxMarks", Number(e.target.value))
                            }
                            className="h-8 text-xs"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-semibold text-[#64748B] block mb-0.5">
                            Weightage (%)
                          </label>
                          <Input
                            type="number"
                            min="1"
                            max="100"
                            value={comp.weightagePercentage}
                            onChange={(e) =>
                              handleUpdateComponent(
                                comp.id,
                                "weightagePercentage",
                                Number(e.target.value)
                              )
                            }
                            className="h-8 text-xs font-bold text-[#2563EB]"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-semibold text-[#64748B] block mb-0.5">
                            Pass Marks
                          </label>
                          <Input
                            type="number"
                            min="1"
                            max={comp.maxMarks}
                            value={comp.passingMarks}
                            onChange={(e) =>
                              handleUpdateComponent(
                                comp.id,
                                "passingMarks",
                                Number(e.target.value)
                              )
                            }
                            className="h-8 text-xs"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-semibold text-[#64748B] block mb-0.5">
                            Conduct / Due Date
                          </label>
                          <Input
                            type="date"
                            value={comp.dueDate || ""}
                            onChange={(e) =>
                              handleUpdateComponent(comp.id, "dueDate", e.target.value)
                            }
                            className="h-8 text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddComponent}
                    className="w-full border-dashed"
                    leftIcon={<Plus className="w-4 h-4 text-[#2563EB]" />}
                  >
                    Add Component
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-xs text-[#64748B] p-2 bg-white rounded border border-[#E2E8F0]">
                Single component mode: 100% of assessment marks will be evaluated based on Total Maximum Marks ({formTotalMaxMarks} M).
              </div>
            )}
          </div>
        </form>
      </Modal>

      {/* ----------------------------------------------------------- */}
      {/* MODAL 2: 360° ASSESSMENT DETAIL DRAWER */}
      {/* ----------------------------------------------------------- */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title={selectedAssessment?.name || "Assessment Details"}
        description={selectedAssessment?.assessmentCode}
        maxWidth="xl"
        footer={
          <div className="flex items-center justify-between w-full">
            <Button variant="outline" size="sm" onClick={() => setIsDetailModalOpen(false)}>
              Close
            </Button>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (selectedAssessment) {
                    setIsDetailModalOpen(false);
                    handleOpenEditModal(selectedAssessment);
                  }
                }}
              >
                Edit Details
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  if (selectedAssessment) {
                    setIsDetailModalOpen(false);
                    handleOpenStatusModal(selectedAssessment);
                  }
                }}
              >
                Transition Status
              </Button>
            </div>
          </div>
        }
      >
        {selectedAssessment && (
          <div className="space-y-4 text-xs">
            {/* Header Status & Code Banner */}
            <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#64748B]">Assessment Status</span>
                <div className="mt-0.5">
                  <Badge variant={STATUS_VARIANTS[selectedAssessment.status].variant} size="md">
                    {selectedAssessment.status}
                  </Badge>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-[#64748B]">Assessment Type</span>
                <div className="font-bold text-[#153B66] text-xs">{selectedAssessment.type}</div>
              </div>
            </div>

            {/* Academic Structure Grid */}
            <div className="grid grid-cols-2 gap-3 p-3 bg-white rounded-lg border border-[#E2E8F0]">
              <div>
                <span className="text-[10px] text-[#64748B] uppercase font-bold">Subject</span>
                <div className="font-bold text-[#1E293B] text-xs">
                  {selectedAssessment.subjectCode} - {selectedAssessment.subjectName}
                </div>
                <div className="text-[11px] text-[#64748B]">{selectedAssessment.subjectType}</div>
              </div>

              <div>
                <span className="text-[10px] text-[#64748B] uppercase font-bold">Class & Cohort</span>
                <div className="font-bold text-[#1E293B] text-xs">{selectedAssessment.className}</div>
                <div className="text-[11px] text-[#64748B]">{selectedAssessment.sectionName}</div>
              </div>

              <div>
                <span className="text-[10px] text-[#64748B] uppercase font-bold">Timeline</span>
                <div className="font-medium text-[#1E293B] text-xs">
                  {selectedAssessment.startDate} to {selectedAssessment.endDate}
                </div>
              </div>

              <div>
                <span className="text-[10px] text-[#64748B] uppercase font-bold">Faculty Allocated</span>
                <div className="font-medium text-[#1E293B] text-xs">
                  {selectedAssessment.teacherName || "Unassigned"}
                </div>
              </div>
            </div>

            {/* Description */}
            {selectedAssessment.description && (
              <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
                <span className="text-[10px] text-[#64748B] uppercase font-bold block mb-1">
                  Syllabus & Guidelines
                </span>
                <p className="text-xs text-[#334155] leading-relaxed">
                  {selectedAssessment.description}
                </p>
              </div>
            )}

            {/* Components Breakdown */}
            <div className="space-y-2">
              <span className="text-[10px] text-[#64748B] uppercase font-bold block">
                Component Breakdown ({selectedAssessment.components?.length || 1})
              </span>
              <div className="space-y-1.5">
                {selectedAssessment.components?.map((c) => (
                  <div
                    key={c.id}
                    className="p-2.5 rounded-lg bg-white border border-[#E2E8F0] flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-[#1E293B]">{c.name}</div>
                      <div className="text-[11px] text-[#64748B]">
                        {c.type} • Due: {c.dueDate || "N/A"}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-[#2563EB]">{c.weightagePercentage}% weightage</div>
                      <div className="text-[11px] text-[#64748B]">
                        Max: {c.maxMarks} M | Pass: {c.passingMarks} M
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Lifecycle Status History */}
            <div className="space-y-2">
              <span className="text-[10px] text-[#64748B] uppercase font-bold block">
                Status History Trail
              </span>
              <div className="space-y-1.5">
                {selectedAssessment.statusHistory?.map((h, i) => (
                  <div
                    key={i}
                    className="p-2 rounded bg-[#F8FAFC] border border-[#E2E8F0] text-[11px] flex items-center justify-between"
                  >
                    <div>
                      <span className="font-bold text-[#1E293B]">{h.status}</span> — {h.remarks}
                      <span className="text-[#64748B] block text-[10px]">By {h.changedBy}</span>
                    </div>
                    <div className="text-[#64748B] text-[10px]">
                      {new Date(h.changedAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* ----------------------------------------------------------- */}
      {/* MODAL 3: STATUS TRANSITION MODAL */}
      {/* ----------------------------------------------------------- */}
      <Modal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        title="Transition Assessment Status"
        description={`Current status: ${statusTargetAssessment?.status}`}
        maxWidth="md"
        footer={
          <div className="flex items-center justify-between w-full">
            <Button variant="outline" size="sm" onClick={() => setIsStatusModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleExecuteStatusTransition}>
              Confirm Transition
            </Button>
          </div>
        }
      >
        <div className="space-y-3 text-xs">
          <p className="text-[#475569]">
            Select target lifecycle state for{" "}
            <strong className="text-[#1E293B]">{statusTargetAssessment?.name}</strong>.
          </p>

          <div>
            <label className="text-[11px] font-semibold text-[#475569] block mb-1">
              Target Status
            </label>
            <select
              value={newTargetStatus}
              onChange={(e) => setNewTargetStatus(e.target.value as IAAssessmentStatus)}
              className="w-full h-10 px-3 bg-white border border-[#CBD5E1] rounded-lg focus:outline-hidden text-xs"
            >
              <option value="Draft">Draft (Planning)</option>
              <option value="Scheduled">Scheduled (On Timetable)</option>
              <option value="Ongoing">Ongoing (In Conduct)</option>
              <option value="Completed">Completed (Concluded)</option>
              <option value="Published">Published (Student Portal)</option>
              <option value="Cancelled">Cancelled (Withdrawn)</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-[#475569] block mb-1">
              Transition Justification / Remarks
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Schedule approved by academic committee, marks compiled, etc."
              value={statusRemarks}
              onChange={(e) => setStatusRemarks(e.target.value)}
              className="w-full p-2.5 text-xs bg-white border border-[#CBD5E1] rounded-lg focus:outline-hidden"
            />
          </div>

          <Alert variant="info" className="text-[11px] py-2">
            Status changes are permanently recorded in the institutional audit log with your admin identity.
          </Alert>
        </div>
      </Modal>

      {/* ----------------------------------------------------------- */}
      {/* MODAL 4: DELETE CONFIRMATION MODAL */}
      {/* ----------------------------------------------------------- */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Internal Assessment"
        description="Irreversible administrative action"
        maxWidth="sm"
        footer={
          <div className="flex items-center justify-between w-full">
            <Button variant="outline" size="sm" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              className="bg-[#DC2626] hover:bg-[#B91C1C]"
              onClick={handleDeleteAssessment}
            >
              Delete Assessment
            </Button>
          </div>
        }
      >
        <div className="space-y-3 text-xs">
          <p className="text-[#475569]">
            Are you sure you want to permanently delete{" "}
            <strong className="text-[#1E293B]">{assessmentToDelete?.name}</strong> (
            {assessmentToDelete?.assessmentCode})?
          </p>
          <Alert variant="error" className="py-2 text-[11px]">
            This will remove all associated rubrics, weightage configurations, and component definitions.
          </Alert>
        </div>
      </Modal>
    </div>
  );
}
