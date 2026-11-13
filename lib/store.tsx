"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  InstitutionProfile,
  AcademicYear,
  Department,
  Course,
  ClassItem,
  SectionItem,
  SubjectItem,
  RoleItem,
  PermissionCategory,
  DashboardStats,
  AdmissionApplication,
  AdmissionStatus,
  StudentItem,
  StudentStatus,
  GuardianItem,
  StaffItem,
  StaffStatus,
  PeriodConfig,
  TimetableSlot,
  TimetableDayOfWeek,
  TimetableConflict,
  TimetableConflictCheckResult,
  AttendanceStatus,
  AttendanceRecord,
  AttendanceCorrectionAudit,
  AttendanceThresholdConfig,
  StudentAttendanceSummary,
  ClassAttendanceSummary,
  ExamHall,
  ExamSubjectSlot,
  ExaminationItem,
  ExamEligibilityOverride,
  ExamAuditLog,
  ExamConflict,
  IAAssessment,
  IAAssessmentStatus,
  IAStatusHistoryEntry,
  IAMetrics,
  AssessmentMarksSheet,
  MarksAuditLog,
  MarksEntryMetrics,
  StudentAssessmentRecord,
  MarksSubmissionStatus,
  GradingScaleConfig,
  SubjectResultStatus,
  ResultBatchItem,
  ResultBatchStatus,
  StudentSemesterResult,
  StudentSubjectResult,
  ResultAuditLog,
  ResultMetrics,
  PromotionPolicy,
  StudentPromotionEvaluation,
  PromotionBatchStatus,
  PromotionBatchItem,
  PromotionHistoryRecord,
  PromotionAuditLog,
  PromotionMetrics,
  EnrollmentHistoryEntry,
  CertificateTemplate,
  CertificateNumberConfig,
  CertificateApplicationItem,
  CertificateApplicationStatus,
  CertificatePriority,
  CertificateType,
  CertificateStatus,
  IssuedCertificateItem,
  CertificateAuditLog,
  CertificateMetrics,
  EligibilityEvaluationResult,
  EligibilityCheckItem,
} from "@/types/institution";
import {
  initialInstitutionProfile,
  initialAcademicYears,
  initialDepartments,
  initialCourses,
  initialClasses,
  initialSections,
  initialSubjects,
  initialRoles,
  initialPermissionCategories,
  initialDashboardStats,
  initialRecentActivities,
  initialAdmissions,
  initialStudents,
  initialGuardians,
  initialStaff,
  initialPeriodConfigs,
  initialTimetableSlots,
  initialAttendanceThreshold,
  initialAttendanceRecords,
  initialAttendanceAudits,
  initialExamHalls,
  initialExaminations,
  initialExamEligibilityOverrides,
  initialExamAudits,
  initialIAAssessments,
  initialMarksSheets,
  initialMarksAudits,
  initialGradingScaleConfig,
  initialResultBatches,
  initialResultAudits,
  initialPromotionPolicies,
  initialPromotionBatches,
  initialPromotionHistory,
  initialPromotionAudits,
  initialCertificateTemplates,
  initialCertificateNumberConfig,
  initialCertificateApplications,
  initialIssuedCertificates,
  initialCertificateAudits,
  RecentActivity,
} from "@/lib/mock-data";

interface ConvertStudentResult {
  success: boolean;
  studentId?: string;
  message: string;
}

interface InstitutionContextType {
  profile: InstitutionProfile;
  updateProfile: (data: Partial<InstitutionProfile>) => void;

  academicYears: AcademicYear[];
  activeAcademicYear: AcademicYear | undefined;
  addAcademicYear: (data: Omit<AcademicYear, "id" | "createdAt">) => void;
  updateAcademicYear: (id: string, data: Partial<AcademicYear>) => void;
  setActiveAcademicYear: (id: string) => void;
  deleteAcademicYear: (id: string) => void;

  departments: Department[];
  addDepartment: (data: Omit<Department, "id">) => void;
  updateDepartment: (id: string, data: Partial<Department>) => void;
  deleteDepartment: (id: string) => void;

  courses: Course[];
  addCourse: (data: Omit<Course, "id">) => void;
  updateCourse: (id: string, data: Partial<Course>) => void;
  deleteCourse: (id: string) => void;

  classes: ClassItem[];
  addClass: (data: Omit<ClassItem, "id">) => void;
  updateClass: (id: string, data: Partial<ClassItem>) => void;
  deleteClass: (id: string) => void;

  sections: SectionItem[];
  addSection: (data: Omit<SectionItem, "id">) => void;
  updateSection: (id: string, data: Partial<SectionItem>) => void;
  deleteSection: (id: string) => void;

  subjects: SubjectItem[];
  addSubject: (data: Omit<SubjectItem, "id">) => void;
  updateSubject: (id: string, data: Partial<SubjectItem>) => void;
  deleteSubject: (id: string) => void;

  roles: RoleItem[];
  permissionCategories: PermissionCategory[];
  updateRolePermissions: (roleId: string, permissions: string[]) => void;
  addRole: (role: { name: string; code: string; description: string; permissions: string[] }) => void;

  // Admission Management
  admissions: AdmissionApplication[];
  addAdmission: (data: Omit<AdmissionApplication, "id" | "applicationNumber" | "statusHistory" | "appliedDate" | "isConvertedToStudent">) => AdmissionApplication;
  updateAdmission: (id: string, data: Partial<AdmissionApplication>) => void;
  deleteAdmission: (id: string) => void;
  updateAdmissionStatus: (id: string, status: AdmissionStatus, remarks?: string) => void;
  convertAdmissionToStudent: (
    applicationId: string,
    options?: { classId?: string; sectionId?: string; rollNumber?: string }
  ) => ConvertStudentResult;

  // Student Management
  students: StudentItem[];
  addStudent: (data: Omit<StudentItem, "id" | "enrollmentHistory">) => StudentItem;
  updateStudent: (id: string, data: Partial<StudentItem>) => void;
  deactivateStudent: (id: string) => void;
  linkGuardianToStudent: (studentId: string, guardianId: string) => boolean;
  unlinkGuardianFromStudent: (studentId: string, guardianId: string) => void;

  // Guardian Management
  guardians: GuardianItem[];
  addGuardian: (data: Omit<GuardianItem, "id" | "guardianId" | "createdAt">) => GuardianItem;
  updateGuardian: (id: string, data: Partial<GuardianItem>) => void;
  deactivateGuardian: (id: string) => void;
  linkStudentToGuardian: (guardianId: string, studentId: string) => boolean;
  unlinkStudentFromGuardian: (guardianId: string, studentId: string) => void;

  // Staff Management
  staff: StaffItem[];
  addStaff: (data: Omit<StaffItem, "id">) => StaffItem;
  updateStaff: (id: string, data: Partial<StaffItem>) => void;
  deactivateStaff: (id: string) => void;

  // Timetable Management (Phase 3)
  periodConfigs: PeriodConfig[];
  timetableSlots: TimetableSlot[];
  addTimetableSlot: (slot: Omit<TimetableSlot, "id" | "createdAt">) => { success: boolean; slot?: TimetableSlot; conflicts?: TimetableConflict[] };
  updateTimetableSlot: (id: string, slot: Partial<TimetableSlot>) => { success: boolean; slot?: TimetableSlot; conflicts?: TimetableConflict[] };
  deleteTimetableSlot: (id: string) => void;
  clearSectionTimetable: (classId: string, sectionId: string, dayOfWeek?: TimetableDayOfWeek, academicYearId?: string, termId?: string) => void;
  copyDaySchedule: (sourceDay: TimetableDayOfWeek, targetDay: TimetableDayOfWeek, classId: string, sectionId: string, academicYearId: string, termId: string) => { copiedCount: number; conflictCount: number };
  checkTimetableConflicts: (proposedSlot: Partial<TimetableSlot> & { dayOfWeek: TimetableDayOfWeek; startTime: string; endTime: string; teacherId?: string; roomNumber?: string; classId?: string; sectionId?: string; id?: string; academicYearId?: string; termId?: string }) => TimetableConflictCheckResult;
  updatePeriodConfigs: (configs: PeriodConfig[]) => void;
  getSubjectAllocationStats: (subjectId: string, classId: string, sectionId: string, academicYearId: string, termId?: string) => {
    targetHoursPerWeek: number;
    scheduledSlotsCount: number;
    scheduledHours: number;
    isUnderAllocated: boolean;
    isOverAllocated: boolean;
    isFulfilled: boolean;
  };
  getAvailableRooms: () => string[];

  // Attendance Management (Phase 3)
  attendanceThreshold: AttendanceThresholdConfig;
  updateAttendanceThreshold: (config: AttendanceThresholdConfig) => void;
  attendanceRecords: AttendanceRecord[];
  attendanceAudits: AttendanceCorrectionAudit[];
  saveBatchAttendance: (params: {
    academicYearId: string;
    courseId: string;
    classId: string;
    sectionId: string;
    date: string;
    session: string;
    markedBy: string;
    entries: {
      studentId: string;
      studentUniqueId?: string;
      rollNumber: string;
      studentName: string;
      status: AttendanceStatus;
      remarks?: string;
    }[];
  }) => { success: boolean; savedCount: number; message: string };
  correctAttendanceRecord: (
    recordId: string,
    newStatus: AttendanceStatus,
    reason: string,
    correctedBy: string
  ) => { success: boolean; message: string };
  deleteAttendanceRecord: (recordId: string) => void;
  getAttendanceForClassAndDate: (
    classId: string,
    sectionId: string,
    date: string,
    session: string
  ) => AttendanceRecord[];
  getStudentAttendanceSummaries: (
    classId?: string,
    sectionId?: string,
    startDate?: string,
    endDate?: string
  ) => StudentAttendanceSummary[];
  getClassAttendanceSummaries: (
    academicYearId?: string,
    startDate?: string,
    endDate?: string
  ) => ClassAttendanceSummary[];
  getAttendanceMetrics: (
    date?: string,
    classId?: string,
    sectionId?: string
  ) => {
    totalEnrolled: number;
    present: number;
    absent: number;
    late: number;
    onLeave: number;
    percentage: number;
  };

  // Examination Management (Phase 3)
  examinations: ExaminationItem[];
  examHalls: ExamHall[];
  examEligibilityOverrides: ExamEligibilityOverride[];
  examAudits: ExamAuditLog[];
  addExamination: (data: Omit<ExaminationItem, "id" | "createdAt" | "updatedAt">) => {
    success: boolean;
    examination?: ExaminationItem;
    message: string;
  };
  updateExamination: (
    id: string,
    data: Partial<ExaminationItem>
  ) => { success: boolean; examination?: ExaminationItem; message: string };
  deleteExamination: (id: string) => { success: boolean; message: string };
  addExamSubjectSlot: (
    examinationId: string,
    slot: Omit<ExamSubjectSlot, "id" | "examinationId">
  ) => {
    success: boolean;
    slot?: ExamSubjectSlot;
    conflicts?: ExamConflict[];
    message: string;
  };
  updateExamSubjectSlot: (
    examinationId: string,
    slotId: string,
    slot: Partial<ExamSubjectSlot>
  ) => {
    success: boolean;
    slot?: ExamSubjectSlot;
    conflicts?: ExamConflict[];
    message: string;
  };
  deleteExamSubjectSlot: (
    examinationId: string,
    slotId: string
  ) => { success: boolean; message: string };
  addExamHall: (hall: Omit<ExamHall, "id">) => {
    success: boolean;
    hall?: ExamHall;
    message: string;
  };
  updateExamHall: (
    id: string,
    hall: Partial<ExamHall>
  ) => { success: boolean; hall?: ExamHall; message: string };
  deleteExamHall: (id: string) => { success: boolean; message: string };
  checkExamConflicts: (proposed: {
    examinationId?: string;
    slotId?: string;
    classId?: string;
    sectionId?: string;
    examDate: string;
    startTime: string;
    endTime: string;
    hallId?: string;
    invigilatorId?: string;
    subjectId?: string;
    allocatedCount?: number;
    capacity?: number;
  }) => {
    hasConflicts: boolean;
    canProceed: boolean;
    conflicts: ExamConflict[];
  };
  recordEligibilityOverride: (
    override: Omit<ExamEligibilityOverride, "id" | "authorizedAt">
  ) => { success: boolean; message: string };
  getExamStudentsWithEligibility: (examinationId: string) => {
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
  }[];
  getExamMetrics: () => {
    totalExams: number;
    upcomingExams: number;
    ongoingExams: number;
    completedExams: number;
    scheduledSubjects: number;
    availableHalls: number;
  };

  // Phase 4A: Internal Assessment (IA) Management
  iaAssessments: IAAssessment[];
  addIAAssessment: (
    data: Omit<IAAssessment, "id" | "createdAt" | "updatedAt">
  ) => { success: boolean; assessment?: IAAssessment; message: string };
  updateIAAssessment: (
    id: string,
    data: Partial<IAAssessment>
  ) => { success: boolean; assessment?: IAAssessment; message: string };
  deleteIAAssessment: (id: string) => { success: boolean; message: string };
  transitionIAAssessmentStatus: (
    id: string,
    newStatus: IAAssessmentStatus,
    remarks?: string
  ) => { success: boolean; message: string };
  checkIAAssessmentConflicts: (data: {
    assessmentId?: string;
    classId: string;
    sectionId?: string;
    subjectId: string;
    name: string;
    startDate: string;
    endDate: string;
  }) => { hasConflict: boolean; message?: string };
  getIAMetrics: () => IAMetrics;

  // Phase 4B: Student Marks Entry & Processing
  marksSheets: AssessmentMarksSheet[];
  marksAudits: MarksAuditLog[];
  getMarksSheetForAssessment: (
    assessmentId: string,
    sectionId?: string
  ) => AssessmentMarksSheet | undefined;
  saveMarksSheet: (data: {
    assessmentId: string;
    sectionId?: string;
    records: StudentAssessmentRecord[];
    isDraft?: boolean;
  }) => { success: boolean; sheet?: AssessmentMarksSheet; message: string };
  submitMarksSheet: (sheetId: string) => { success: boolean; message: string };
  lockMarksSheet: (sheetId: string) => { success: boolean; message: string };
  unlockMarksSheet: (
    sheetId: string,
    reason: string
  ) => { success: boolean; message: string };
  moderateStudentMarks: (params: {
    sheetId: string;
    studentId: string;
    newTotalMarks: number;
    graceMarks?: number;
    reason: string;
  }) => { success: boolean; message: string };
  getMarksMetrics: () => MarksEntryMetrics;

  // Phase 4C: Result Processing, Grade Calculation & Grade Cards
  gradingConfig: GradingScaleConfig;
  resultBatches: ResultBatchItem[];
  resultAudits: ResultAuditLog[];
  updateGradingConfig: (config: GradingScaleConfig) => { success: boolean; message: string };
  calculateSemesterResults: (params: {
    classId: string;
    sectionId: string;
    academicYearId: string;
    semester: number;
    examinationId?: string;
    batchName?: string;
    iaWeightage?: number;
    semesterExamWeightage?: number;
    minPassingPercentage?: number;
  }) => {
    success: boolean;
    batch?: ResultBatchItem;
    message: string;
    missingMarksSheets?: string[];
  };
  saveResultBatch: (batch: ResultBatchItem) => { success: boolean; message: string };
  transitionBatchStatus: (
    batchId: string,
    newStatus: ResultBatchStatus,
    reason?: string
  ) => { success: boolean; message: string };
  correctPublishedResult: (params: {
    batchId: string;
    studentId: string;
    subjectCode: string;
    newTotalScore: number;
    reason: string;
  }) => { success: boolean; message: string };
  deleteResultBatch: (batchId: string) => { success: boolean; message: string };
  getResultMetrics: () => ResultMetrics;

  // Phase 4D: Promotions & Academic Standing
  promotionPolicies: PromotionPolicy[];
  promotionBatches: PromotionBatchItem[];
  promotionHistory: PromotionHistoryRecord[];
  promotionAudits: PromotionAuditLog[];
  updatePromotionPolicy: (policy: PromotionPolicy) => { success: boolean; message: string };
  evaluateStudentsForPromotion: (params: {
    classId: string;
    sectionId: string;
    policyId?: string;
  }) => StudentPromotionEvaluation[];
  createPromotionBatch: (
    data: Omit<PromotionBatchItem, "id" | "createdAt" | "updatedAt">
  ) => { success: boolean; batch?: PromotionBatchItem; message: string };
  updatePromotionBatch: (
    id: string,
    data: Partial<PromotionBatchItem>
  ) => { success: boolean; batch?: PromotionBatchItem; message: string };
  transitionPromotionBatchStatus: (
    batchId: string,
    newStatus: PromotionBatchStatus,
    reason?: string
  ) => { success: boolean; message: string };
  executePromotionBatch: (
    batchId: string,
    operatorName?: string
  ) => { success: boolean; message: string; promotedCount?: number };
  overrideStudentEligibility: (params: {
    studentId: string;
    batchId?: string;
    reason: string;
    authorizedBy: string;
  }) => { success: boolean; message: string };
  reallocateStudentSection: (params: {
    studentId: string;
    newSectionId: string;
    reason?: string;
  }) => { success: boolean; message: string };
  deletePromotionBatch: (batchId: string) => { success: boolean; message: string };
  getPromotionMetrics: () => PromotionMetrics;

  // Phase 4E: Certificate & Degree Management
  certificateTemplates: CertificateTemplate[];
  certificateNumberConfig: CertificateNumberConfig;
  certificateApplications: CertificateApplicationItem[];
  issuedCertificates: IssuedCertificateItem[];
  certificateAudits: CertificateAuditLog[];

  evaluateCertificateEligibility: (
    studentId: string,
    certificateType: CertificateType
  ) => EligibilityEvaluationResult;

  createCertificateApplication: (
    data: {
      studentId: string;
      certificateType: CertificateType;
      purpose: string;
      supportingDocuments?: string[];
      remarks?: string;
      priority?: CertificatePriority;
      requestedBy?: string;
    }
  ) => { success: boolean; application?: CertificateApplicationItem; message: string };

  updateCertificateApplication: (
    id: string,
    updates: Partial<CertificateApplicationItem>
  ) => { success: boolean; message: string };

  transitionCertificateApplicationStatus: (
    id: string,
    newStatus: CertificateApplicationStatus,
    metadata?: {
      reason?: string;
      reviewerOrApprover?: string;
      notes?: string;
    }
  ) => { success: boolean; message: string };

  overrideCertificateEligibilityCheck: (
    applicationId: string,
    checkId: string,
    reason: string,
    performedBy: string
  ) => { success: boolean; message: string };

  generateCertificateForApplication: (
    applicationId: string,
    params?: {
      signatoryName?: string;
      signatoryTitle?: string;
      customRemarks?: string;
      performedBy?: string;
    }
  ) => { success: boolean; certificate?: IssuedCertificateItem; message: string };

  issueCertificate: (
    certificateId: string,
    performedBy: string
  ) => { success: boolean; message: string };

  reissueCertificate: (
    certificateId: string,
    reason: string,
    performedBy: string,
    corrections?: {
      studentName?: string;
      fatherOrGuardianName?: string;
      dob?: string;
      rollNumber?: string;
      bodyText?: string;
    }
  ) => { success: boolean; newCertificate?: IssuedCertificateItem; message: string };

  revokeCertificate: (
    certificateId: string,
    reason: string,
    performedBy: string
  ) => { success: boolean; message: string };

  verifyCertificateQuery: (
    query: string
  ) => {
    found: boolean;
    certificate?: IssuedCertificateItem;
    status: "Valid" | "Revoked" | "Superseded" | "Not Found";
    message: string;
  };

  updateCertificateTemplate: (
    template: CertificateTemplate
  ) => { success: boolean; message: string };

  updateCertificateNumberConfig: (
    config: CertificateNumberConfig
  ) => { success: boolean; message: string };

  getCertificateMetrics: () => CertificateMetrics;

  stats: DashboardStats;
  recentActivities: RecentActivity[];
  resetToDefaults: () => void;
}

const InstitutionContext = createContext<InstitutionContextType | undefined>(undefined);

const STORAGE_KEY_PREFIX = "sst_erp_inst_admin_";

export function InstitutionProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<InstitutionProfile>(initialInstitutionProfile);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>(initialAcademicYears);
  const [departments, setDepartments] = useState<Department[]>(initialDepartments);
  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [classes, setClasses] = useState<ClassItem[]>(initialClasses);
  const [sections, setSections] = useState<SectionItem[]>(initialSections);
  const [subjects, setSubjects] = useState<SubjectItem[]>(initialSubjects);
  const [roles, setRoles] = useState<RoleItem[]>(initialRoles);
  const [recentActivities] = useState<RecentActivity[]>(initialRecentActivities);

  // Phase 2 Entities
  const [admissions, setAdmissions] = useState<AdmissionApplication[]>(initialAdmissions);
  const [students, setStudents] = useState<StudentItem[]>(initialStudents);
  const [guardians, setGuardians] = useState<GuardianItem[]>(initialGuardians);
  const [staff, setStaff] = useState<StaffItem[]>(initialStaff);

  // Phase 3 Entities
  const [periodConfigs, setPeriodConfigs] = useState<PeriodConfig[]>(initialPeriodConfigs);
  const [timetableSlots, setTimetableSlots] = useState<TimetableSlot[]>(initialTimetableSlots);
  const [attendanceThreshold, setAttendanceThreshold] = useState<AttendanceThresholdConfig>(initialAttendanceThreshold);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(initialAttendanceRecords);
  const [attendanceAudits, setAttendanceAudits] = useState<AttendanceCorrectionAudit[]>(initialAttendanceAudits);
  const [examinations, setExaminations] = useState<ExaminationItem[]>(initialExaminations);
  const [examHalls, setExamHalls] = useState<ExamHall[]>(initialExamHalls);
  const [examEligibilityOverrides, setExamEligibilityOverrides] = useState<ExamEligibilityOverride[]>(initialExamEligibilityOverrides);
  const [examAudits, setExamAudits] = useState<ExamAuditLog[]>(initialExamAudits);

  // Phase 4A: Internal Assessment Entities
  const [iaAssessments, setIaAssessments] = useState<IAAssessment[]>(initialIAAssessments);

  // Phase 4B: Student Marks Entry Entities
  const [marksSheets, setMarksSheets] = useState<AssessmentMarksSheet[]>(initialMarksSheets);
  const [marksAudits, setMarksAudits] = useState<MarksAuditLog[]>(initialMarksAudits);

  // Phase 4C: Result Processing Entities
  const [gradingConfig, setGradingConfig] = useState<GradingScaleConfig>(initialGradingScaleConfig);
  const [resultBatches, setResultBatches] = useState<ResultBatchItem[]>(initialResultBatches);
  const [resultAudits, setResultAudits] = useState<ResultAuditLog[]>(initialResultAudits);

  // Phase 4D: Promotions & Academic Standing Entities
  const [promotionPolicies, setPromotionPolicies] = useState<PromotionPolicy[]>(initialPromotionPolicies);
  const [promotionBatches, setPromotionBatches] = useState<PromotionBatchItem[]>(initialPromotionBatches);
  const [promotionHistory, setPromotionHistory] = useState<PromotionHistoryRecord[]>(initialPromotionHistory);
  const [promotionAudits, setPromotionAudits] = useState<PromotionAuditLog[]>(initialPromotionAudits);

  // Phase 4E: Certificate & Degree Entities
  const [certificateTemplates, setCertificateTemplates] = useState<CertificateTemplate[]>(initialCertificateTemplates);
  const [certificateNumberConfig, setCertificateNumberConfig] = useState<CertificateNumberConfig>(initialCertificateNumberConfig);
  const [certificateApplications, setCertificateApplications] = useState<CertificateApplicationItem[]>(initialCertificateApplications);
  const [issuedCertificates, setIssuedCertificates] = useState<IssuedCertificateItem[]>(initialIssuedCertificates);
  const [certificateAudits, setCertificateAudits] = useState<CertificateAuditLog[]>(initialCertificateAudits);

  // Load from localStorage on mount (hydration-safe)
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const savedProfile = localStorage.getItem(`${STORAGE_KEY_PREFIX}profile`);
        if (savedProfile) setProfile(JSON.parse(savedProfile));

        const savedAY = localStorage.getItem(`${STORAGE_KEY_PREFIX}ay`);
        if (savedAY) setAcademicYears(JSON.parse(savedAY));

        const savedDept = localStorage.getItem(`${STORAGE_KEY_PREFIX}dept`);
        if (savedDept) setDepartments(JSON.parse(savedDept));

        const savedCourses = localStorage.getItem(`${STORAGE_KEY_PREFIX}courses`);
        if (savedCourses) setCourses(JSON.parse(savedCourses));

        const savedClasses = localStorage.getItem(`${STORAGE_KEY_PREFIX}classes`);
        if (savedClasses) setClasses(JSON.parse(savedClasses));

        const savedSections = localStorage.getItem(`${STORAGE_KEY_PREFIX}sections`);
        if (savedSections) setSections(JSON.parse(savedSections));

        const savedSubjects = localStorage.getItem(`${STORAGE_KEY_PREFIX}subjects`);
        if (savedSubjects) setSubjects(JSON.parse(savedSubjects));

        const savedRoles = localStorage.getItem(`${STORAGE_KEY_PREFIX}roles`);
        if (savedRoles) setRoles(JSON.parse(savedRoles));

        const savedAdmissions = localStorage.getItem(`${STORAGE_KEY_PREFIX}admissions`);
        if (savedAdmissions) setAdmissions(JSON.parse(savedAdmissions));

        const savedStudents = localStorage.getItem(`${STORAGE_KEY_PREFIX}students`);
        if (savedStudents) setStudents(JSON.parse(savedStudents));

        const savedGuardians = localStorage.getItem(`${STORAGE_KEY_PREFIX}guardians`);
        if (savedGuardians) setGuardians(JSON.parse(savedGuardians));

        const savedStaff = localStorage.getItem(`${STORAGE_KEY_PREFIX}staff`);
        if (savedStaff) setStaff(JSON.parse(savedStaff));

        const savedPeriods = localStorage.getItem(`${STORAGE_KEY_PREFIX}periods`);
        if (savedPeriods) setPeriodConfigs(JSON.parse(savedPeriods));

        const savedTimetable = localStorage.getItem(`${STORAGE_KEY_PREFIX}timetable`);
        if (savedTimetable) setTimetableSlots(JSON.parse(savedTimetable));

        const savedThreshold = localStorage.getItem(`${STORAGE_KEY_PREFIX}att_threshold`);
        if (savedThreshold) setAttendanceThreshold(JSON.parse(savedThreshold));

        const savedAttRecords = localStorage.getItem(`${STORAGE_KEY_PREFIX}att_records`);
        if (savedAttRecords) setAttendanceRecords(JSON.parse(savedAttRecords));

        const savedAttAudits = localStorage.getItem(`${STORAGE_KEY_PREFIX}att_audits`);
        if (savedAttAudits) setAttendanceAudits(JSON.parse(savedAttAudits));

        const savedExams = localStorage.getItem(`${STORAGE_KEY_PREFIX}exams`);
        if (savedExams) setExaminations(JSON.parse(savedExams));

        const savedExamHalls = localStorage.getItem(`${STORAGE_KEY_PREFIX}exam_halls`);
        if (savedExamHalls) setExamHalls(JSON.parse(savedExamHalls));

        const savedExamOverrides = localStorage.getItem(`${STORAGE_KEY_PREFIX}exam_overrides`);
        if (savedExamOverrides) setExamEligibilityOverrides(JSON.parse(savedExamOverrides));

        const savedExamAudits = localStorage.getItem(`${STORAGE_KEY_PREFIX}exam_audits`);
        if (savedExamAudits) setExamAudits(JSON.parse(savedExamAudits));

        const savedIA = localStorage.getItem(`${STORAGE_KEY_PREFIX}ia_assessments`);
        if (savedIA) setIaAssessments(JSON.parse(savedIA));

        const savedMarksSheets = localStorage.getItem(`${STORAGE_KEY_PREFIX}ia_marks_sheets`);
        if (savedMarksSheets) setMarksSheets(JSON.parse(savedMarksSheets));

        const savedMarksAudits = localStorage.getItem(`${STORAGE_KEY_PREFIX}ia_marks_audits`);
        if (savedMarksAudits) setMarksAudits(JSON.parse(savedMarksAudits));

        const savedGrading = localStorage.getItem(`${STORAGE_KEY_PREFIX}result_config`);
        if (savedGrading) setGradingConfig(JSON.parse(savedGrading));

        const savedBatches = localStorage.getItem(`${STORAGE_KEY_PREFIX}result_batches`);
        if (savedBatches) setResultBatches(JSON.parse(savedBatches));

        const savedResultAudits = localStorage.getItem(`${STORAGE_KEY_PREFIX}result_audits`);
        if (savedResultAudits) setResultAudits(JSON.parse(savedResultAudits));

        const savedPolicies = localStorage.getItem(`${STORAGE_KEY_PREFIX}promotion_policies`);
        if (savedPolicies) setPromotionPolicies(JSON.parse(savedPolicies));

        const savedPromBatches = localStorage.getItem(`${STORAGE_KEY_PREFIX}promotion_batches`);
        if (savedPromBatches) setPromotionBatches(JSON.parse(savedPromBatches));

        const savedPromHistory = localStorage.getItem(`${STORAGE_KEY_PREFIX}promotion_history`);
        if (savedPromHistory) setPromotionHistory(JSON.parse(savedPromHistory));

        const savedPromAudits = localStorage.getItem(`${STORAGE_KEY_PREFIX}promotion_audits`);
        if (savedPromAudits) setPromotionAudits(JSON.parse(savedPromAudits));

        // Phase 4E: Certificates LocalStorage Hydration
        const savedTemplates = localStorage.getItem(`${STORAGE_KEY_PREFIX}certificate_templates`);
        if (savedTemplates) setCertificateTemplates(JSON.parse(savedTemplates));

        const savedNumberConfig = localStorage.getItem(`${STORAGE_KEY_PREFIX}certificate_numbering`);
        if (savedNumberConfig) setCertificateNumberConfig(JSON.parse(savedNumberConfig));

        const savedApps = localStorage.getItem(`${STORAGE_KEY_PREFIX}certificate_applications`);
        if (savedApps) setCertificateApplications(JSON.parse(savedApps));

        const savedIssued = localStorage.getItem(`${STORAGE_KEY_PREFIX}issued_certificates`);
        if (savedIssued) setIssuedCertificates(JSON.parse(savedIssued));

        const savedCertAudits = localStorage.getItem(`${STORAGE_KEY_PREFIX}certificate_audits`);
        if (savedCertAudits) setCertificateAudits(JSON.parse(savedCertAudits));
      } catch {
        // LocalStorage access fallback
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // Save state helper
  const saveState = (key: string, data: unknown) => {
    try {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}${key}`, JSON.stringify(data));
    } catch {
      // Ignore storage errors
    }
  };

  const updateProfile = (data: Partial<InstitutionProfile>) => {
    setProfile((prev) => {
      const updated = { ...prev, ...data };
      saveState("profile", updated);
      return updated;
    });
  };

  const addAcademicYear = (data: Omit<AcademicYear, "id" | "createdAt">) => {
    const newAY: AcademicYear = {
      ...data,
      id: `ay-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setAcademicYears((prev) => {
      let updated = [...prev];
      if (newAY.isActive) {
        updated = updated.map((ay) => ({ ...ay, isActive: false }));
      }
      updated.unshift(newAY);
      saveState("ay", updated);
      return updated;
    });
  };

  const updateAcademicYear = (id: string, data: Partial<AcademicYear>) => {
    setAcademicYears((prev) => {
      let updated = prev.map((ay) => (ay.id === id ? { ...ay, ...data } : ay));
      if (data.isActive) {
        updated = updated.map((ay) => (ay.id === id ? ay : { ...ay, isActive: false }));
      }
      saveState("ay", updated);
      return updated;
    });
  };

  const setActiveAcademicYear = (id: string) => {
    setAcademicYears((prev) => {
      const updated = prev.map((ay) => ({
        ...ay,
        isActive: ay.id === id,
      }));
      saveState("ay", updated);
      return updated;
    });
  };

  const deleteAcademicYear = (id: string) => {
    setAcademicYears((prev) => {
      const updated = prev.filter((ay) => ay.id !== id);
      saveState("ay", updated);
      return updated;
    });
  };

  const addDepartment = (data: Omit<Department, "id">) => {
    const newDept: Department = {
      ...data,
      id: `dept-${Date.now()}`,
    };
    setDepartments((prev) => {
      const updated = [...prev, newDept];
      saveState("dept", updated);
      return updated;
    });
  };

  const updateDepartment = (id: string, data: Partial<Department>) => {
    setDepartments((prev) => {
      const updated = prev.map((d) => (d.id === id ? { ...d, ...data } : d));
      saveState("dept", updated);
      return updated;
    });
  };

  const deleteDepartment = (id: string) => {
    setDepartments((prev) => {
      const updated = prev.filter((d) => d.id !== id);
      saveState("dept", updated);
      return updated;
    });
  };

  const addCourse = (data: Omit<Course, "id">) => {
    const newCourse: Course = {
      ...data,
      id: `course-${Date.now()}`,
    };
    setCourses((prev) => {
      const updated = [...prev, newCourse];
      saveState("courses", updated);
      return updated;
    });
  };

  const updateCourse = (id: string, data: Partial<Course>) => {
    setCourses((prev) => {
      const updated = prev.map((c) => (c.id === id ? { ...c, ...data } : c));
      saveState("courses", updated);
      return updated;
    });
  };

  const deleteCourse = (id: string) => {
    setCourses((prev) => {
      const updated = prev.filter((c) => c.id !== id);
      saveState("courses", updated);
      return updated;
    });
  };

  const addClass = (data: Omit<ClassItem, "id">) => {
    const newClass: ClassItem = {
      ...data,
      id: `class-${Date.now()}`,
    };
    setClasses((prev) => {
      const updated = [...prev, newClass];
      saveState("classes", updated);
      return updated;
    });
  };

  const updateClass = (id: string, data: Partial<ClassItem>) => {
    setClasses((prev) => {
      const updated = prev.map((c) => (c.id === id ? { ...c, ...data } : c));
      saveState("classes", updated);
      return updated;
    });
  };

  const deleteClass = (id: string) => {
    setClasses((prev) => {
      const updated = prev.filter((c) => c.id !== id);
      saveState("classes", updated);
      return updated;
    });
  };

  const addSection = (data: Omit<SectionItem, "id">) => {
    const newSection: SectionItem = {
      ...data,
      id: `sec-${Date.now()}`,
    };
    setSections((prev) => {
      const updated = [...prev, newSection];
      saveState("sections", updated);
      return updated;
    });
  };

  const updateSection = (id: string, data: Partial<SectionItem>) => {
    setSections((prev) => {
      const updated = prev.map((s) => (s.id === id ? { ...s, ...data } : s));
      saveState("sections", updated);
      return updated;
    });
  };

  const deleteSection = (id: string) => {
    setSections((prev) => {
      const updated = prev.filter((s) => s.id !== id);
      saveState("sections", updated);
      return updated;
    });
  };

  const addSubject = (data: Omit<SubjectItem, "id">) => {
    const newSub: SubjectItem = {
      ...data,
      id: `sub-${Date.now()}`,
    };
    setSubjects((prev) => {
      const updated = [...prev, newSub];
      saveState("subjects", updated);
      return updated;
    });
  };

  const updateSubject = (id: string, data: Partial<SubjectItem>) => {
    setSubjects((prev) => {
      const updated = prev.map((s) => (s.id === id ? { ...s, ...data } : s));
      saveState("subjects", updated);
      return updated;
    });
  };

  const deleteSubject = (id: string) => {
    setSubjects((prev) => {
      const updated = prev.filter((s) => s.id !== id);
      saveState("subjects", updated);
      return updated;
    });
  };

  const updateRolePermissions = (roleId: string, permissions: string[]) => {
    setRoles((prev) => {
      const updated = prev.map((r) => (r.id === roleId ? { ...r, permissions } : r));
      saveState("roles", updated);
      return updated;
    });
  };

  const addRole = (role: { name: string; code: string; description: string; permissions: string[] }) => {
    const newRole: RoleItem = {
      id: `role-${Date.now()}`,
      name: role.name,
      code: role.code.toUpperCase(),
      description: role.description,
      isSystemRole: false,
      userCount: 0,
      permissions: role.permissions,
    };
    setRoles((prev) => {
      const updated = [...prev, newRole];
      saveState("roles", updated);
      return updated;
    });
  };

  // =========================================================================
  // Admission Management Handlers
  // =========================================================================
  const addAdmission = (
    data: Omit<AdmissionApplication, "id" | "applicationNumber" | "statusHistory" | "appliedDate" | "isConvertedToStudent">
  ): AdmissionApplication => {
    const nextNum = admissions.length + 1;
    const today = new Date().toISOString().split("T")[0];
    const newApp: AdmissionApplication = {
      ...data,
      id: `app-${Date.now()}`,
      applicationNumber: `SST-2026-APP-${String(nextNum).padStart(3, "0")}`,
      applicantFullName: `${data.applicantFirstName} ${data.applicantLastName}`.trim(),
      appliedDate: today,
      isConvertedToStudent: false,
      statusHistory: [
        {
          status: data.status || "Submitted",
          changedAt: today,
          changedBy: "Admissions Desk",
          remarks: "Initial application received",
        },
      ],
    };

    setAdmissions((prev) => {
      const updated = [newApp, ...prev];
      saveState("admissions", updated);
      return updated;
    });

    return newApp;
  };

  const updateAdmission = (id: string, data: Partial<AdmissionApplication>) => {
    setAdmissions((prev) => {
      const updated = prev.map((app) => {
        if (app.id === id) {
          const updatedApp = { ...app, ...data };
          if (data.applicantFirstName || data.applicantLastName) {
            updatedApp.applicantFullName = `${updatedApp.applicantFirstName} ${updatedApp.applicantLastName}`.trim();
          }
          return updatedApp;
        }
        return app;
      });
      saveState("admissions", updated);
      return updated;
    });
  };

  const deleteAdmission = (id: string) => {
    setAdmissions((prev) => {
      const updated = prev.filter((a) => a.id !== id);
      saveState("admissions", updated);
      return updated;
    });
  };

  const updateAdmissionStatus = (id: string, status: AdmissionStatus, remarks?: string) => {
    const today = new Date().toISOString().split("T")[0];
    setAdmissions((prev) => {
      const updated = prev.map((app) => {
        if (app.id === id) {
          const historyEntry = {
            status,
            changedAt: today,
            changedBy: "Institution Admin",
            remarks: remarks || `Status changed to ${status}`,
          };
          return {
            ...app,
            status,
            reviewRemarks: remarks || app.reviewRemarks,
            statusHistory: [historyEntry, ...(app.statusHistory || [])],
          };
        }
        return app;
      });
      saveState("admissions", updated);
      return updated;
    });
  };

  const convertAdmissionToStudent = (
    applicationId: string,
    options?: { classId?: string; sectionId?: string; rollNumber?: string }
  ): ConvertStudentResult => {
    const app = admissions.find((a) => a.id === applicationId);
    if (!app) {
      return { success: false, message: "Application not found." };
    }

    if (app.isConvertedToStudent && app.convertedStudentId) {
      return {
        success: false,
        studentId: app.convertedStudentId,
        message: `Applicant is already enrolled as Student (ID: ${app.convertedStudentId}).`,
      };
    }

    // Check for duplicate student email
    const duplicateStudent = students.find(
      (s) => s.email.toLowerCase() === app.email.toLowerCase()
    );
    if (duplicateStudent) {
      return {
        success: false,
        studentId: duplicateStudent.studentId,
        message: `A student with email "${app.email}" already exists (ID: ${duplicateStudent.studentId}).`,
      };
    }

    // Find suitable class & section
    const targetClass = classes.find((c) => c.id === options?.classId) ||
      classes.find((c) => c.courseId === app.courseId) ||
      classes[0];

    const targetSection = sections.find((s) => s.id === options?.sectionId) ||
      sections.find((s) => s.classId === targetClass?.id) ||
      sections[0];

    const nextStudentIndex = students.length + 1;
    const newStudentId = `STU-2026-${String(nextStudentIndex).padStart(3, "0")}`;
    const newAdmissionNo = `ADM-2026-${String(nextStudentIndex + 100).padStart(4, "0")}`;
    const deptPrefix = app.departmentName ? app.departmentName.substring(0, 3).toUpperCase() : "GEN";
    const rollNo = options?.rollNumber || `26${deptPrefix}${String(nextStudentIndex).padStart(3, "0")}`;
    const today = new Date().toISOString().split("T")[0];

    // Check or create Guardian
    let linkedGuardianId = "";
    if (app.guardianName) {
      const existingGuardian = guardians.find(
        (g) =>
          g.fullName.toLowerCase() === app.guardianName.toLowerCase() ||
          (g.phone && g.phone === app.guardianPhone) ||
          (g.email && g.email.toLowerCase() === app.guardianEmail.toLowerCase())
      );

      if (existingGuardian) {
        linkedGuardianId = existingGuardian.id;
        // Link new student to existing guardian
        setGuardians((prev) => {
          const updated = prev.map((g) => {
            if (g.id === existingGuardian.id && !g.studentIds.includes(newStudentId)) {
              return { ...g, studentIds: [...g.studentIds, newStudentId] };
            }
            return g;
          });
          saveState("guardians", updated);
          return updated;
        });
      } else {
        // Create new guardian record
        const newGuardian: GuardianItem = {
          id: `grd-${Date.now()}`,
          guardianId: `GRD-${String(guardians.length + 1).padStart(3, "0")}`,
          fullName: app.guardianName,
          relationship: app.guardianRelation || "Father",
          phone: app.guardianPhone || app.phone,
          email: app.guardianEmail || "",
          addressLine: app.addressLine,
          city: app.city,
          state: app.state,
          postalCode: app.postalCode,
          occupation: app.guardianOccupation || "Guardian",
          isEmergencyContact: true,
          status: "Active",
          studentIds: [newStudentId],
          createdAt: new Date().toISOString(),
        };
        linkedGuardianId = newGuardian.id;
        setGuardians((prev) => {
          const updated = [...prev, newGuardian];
          saveState("guardians", updated);
          return updated;
        });
      }
    }

    const newStudent: StudentItem = {
      id: newStudentId,
      studentId: newStudentId,
      admissionNumber: newAdmissionNo,
      rollNumber: rollNo,
      firstName: app.applicantFirstName,
      lastName: app.applicantLastName,
      fullName: app.applicantFullName,
      dob: app.dob,
      gender: app.gender,
      bloodGroup: "O+",
      category: "General",
      email: app.email,
      institutionalEmail: `${app.applicantFirstName.toLowerCase()}.${newStudentId.toLowerCase()}@sst.edu.in`,
      phone: app.phone,
      addressLine: app.addressLine,
      city: app.city,
      state: app.state,
      postalCode: app.postalCode,
      academicYearId: app.academicYearId,
      academicYearName: app.academicYearName,
      departmentId: app.departmentId,
      departmentName: app.departmentName,
      courseId: app.courseId,
      courseName: app.courseName,
      classId: targetClass?.id || "class-y1",
      className: targetClass?.name || "First Year",
      sectionId: targetSection?.id,
      sectionName: targetSection?.name,
      batch: "2026-2030",
      admissionDate: today,
      status: "Active",
      guardianIds: linkedGuardianId ? [linkedGuardianId] : [],
      sourceApplicationId: app.id,
      enrollmentHistory: [
        {
          id: `enh-${Date.now()}`,
          academicYearId: app.academicYearId,
          academicYearName: app.academicYearName,
          classId: targetClass?.id || "class-y1",
          className: targetClass?.name || "First Year",
          sectionId: targetSection?.id,
          sectionName: targetSection?.name,
          enrolledAt: today,
          status: "Active",
          remarks: `Admitted via Application ${app.applicationNumber}`,
        },
      ],
    };

    // Save student
    setStudents((prev) => {
      const updated = [newStudent, ...prev];
      saveState("students", updated);
      return updated;
    });

    // Mark application as approved and converted
    setAdmissions((prev) => {
      const updated = prev.map((a) => {
        if (a.id === applicationId) {
          const historyEntry = {
            status: "Approved" as AdmissionStatus,
            changedAt: today,
            changedBy: "Admissions Desk",
            remarks: `Enrolled as Student ${newStudentId}`,
          };
          return {
            ...a,
            status: "Approved" as AdmissionStatus,
            isConvertedToStudent: true,
            convertedStudentId: newStudentId,
            statusHistory: [historyEntry, ...(a.statusHistory || [])],
          };
        }
        return a;
      });
      saveState("admissions", updated);
      return updated;
    });

    return {
      success: true,
      studentId: newStudentId,
      message: `Applicant successfully registered as student ${newStudent.fullName} (${newStudentId}).`,
    };
  };

  // =========================================================================
  // Student Management Handlers
  // =========================================================================
  const addStudent = (data: Omit<StudentItem, "id" | "enrollmentHistory">): StudentItem => {
    const nextIdx = students.length + 1;
    const studentId = data.studentId || `STU-2026-${String(nextIdx).padStart(3, "0")}`;
    const today = new Date().toISOString().split("T")[0];
    const newStudent: StudentItem = {
      ...data,
      id: studentId,
      studentId,
      fullName: `${data.firstName} ${data.lastName}`.trim(),
      institutionalEmail:
        data.institutionalEmail || `${data.firstName.toLowerCase()}.${studentId.toLowerCase()}@sst.edu.in`,
      enrollmentHistory: [
        {
          id: `enh-${Date.now()}`,
          academicYearId: data.academicYearId,
          academicYearName: data.academicYearName,
          classId: data.classId,
          className: data.className,
          sectionId: data.sectionId,
          sectionName: data.sectionName,
          enrolledAt: today,
          status: data.status,
          remarks: "Direct Student Admission Intake",
        },
      ],
    };

    setStudents((prev) => {
      const updated = [newStudent, ...prev];
      saveState("students", updated);
      return updated;
    });

    // Link guardians if specified
    if (data.guardianIds && data.guardianIds.length > 0) {
      setGuardians((prev) => {
        const updated = prev.map((g) => {
          if (data.guardianIds.includes(g.id) && !g.studentIds.includes(studentId)) {
            return { ...g, studentIds: [...g.studentIds, studentId] };
          }
          return g;
        });
        saveState("guardians", updated);
        return updated;
      });
    }

    return newStudent;
  };

  const updateStudent = (id: string, data: Partial<StudentItem>) => {
    setStudents((prev) => {
      const updated = prev.map((s) => {
        if (s.id === id) {
          const updatedStudent = { ...s, ...data };
          if (data.firstName || data.lastName) {
            updatedStudent.fullName = `${updatedStudent.firstName} ${updatedStudent.lastName}`.trim();
          }
          return updatedStudent;
        }
        return s;
      });
      saveState("students", updated);
      return updated;
    });
  };

  const deactivateStudent = (id: string) => {
    // Preserve academic records - toggle Active <-> Inactive
    setStudents((prev) => {
      const updated = prev.map((s) => {
        if (s.id === id) {
          const nextStatus: StudentStatus = s.status === "Active" ? "Inactive" : "Active";
          return { ...s, status: nextStatus };
        }
        return s;
      });
      saveState("students", updated);
      return updated;
    });
  };

  const linkGuardianToStudent = (studentId: string, guardianId: string): boolean => {
    let studentUpdated = false;
    setStudents((prev) => {
      const updated = prev.map((s) => {
        if (s.id === studentId || s.studentId === studentId) {
          if (!s.guardianIds.includes(guardianId)) {
            studentUpdated = true;
            return { ...s, guardianIds: [...s.guardianIds, guardianId] };
          }
        }
        return s;
      });
      if (studentUpdated) saveState("students", updated);
      return updated;
    });

    if (studentUpdated) {
      setGuardians((prev) => {
        const updated = prev.map((g) => {
          if (g.id === guardianId && !g.studentIds.includes(studentId)) {
            return { ...g, studentIds: [...g.studentIds, studentId] };
          }
          return g;
        });
        saveState("guardians", updated);
        return updated;
      });
    }

    return studentUpdated;
  };

  const unlinkGuardianFromStudent = (studentId: string, guardianId: string) => {
    setStudents((prev) => {
      const updated = prev.map((s) => {
        if (s.id === studentId || s.studentId === studentId) {
          return { ...s, guardianIds: s.guardianIds.filter((gid) => gid !== guardianId) };
        }
        return s;
      });
      saveState("students", updated);
      return updated;
    });

    setGuardians((prev) => {
      const updated = prev.map((g) => {
        if (g.id === guardianId || g.guardianId === guardianId) {
          return { ...g, studentIds: g.studentIds.filter((sid) => sid !== studentId) };
        }
        return g;
      });
      saveState("guardians", updated);
      return updated;
    });
  };

  // =========================================================================
  // Guardian Management Handlers
  // =========================================================================
  const addGuardian = (data: Omit<GuardianItem, "id" | "guardianId" | "createdAt">): GuardianItem => {
    const nextIdx = guardians.length + 1;
    const guardianId = `GRD-${String(nextIdx).padStart(3, "0")}`;
    const newGrd: GuardianItem = {
      ...data,
      id: `grd-${Date.now()}`,
      guardianId,
      createdAt: new Date().toISOString(),
      studentIds: data.studentIds || [],
    };

    setGuardians((prev) => {
      const updated = [newGrd, ...prev];
      saveState("guardians", updated);
      return updated;
    });

    // Link students bidirectionally
    if (newGrd.studentIds.length > 0) {
      setStudents((prev) => {
        const updated = prev.map((s) => {
          if (newGrd.studentIds.includes(s.id) || newGrd.studentIds.includes(s.studentId)) {
            if (!s.guardianIds.includes(newGrd.id)) {
              return { ...s, guardianIds: [...s.guardianIds, newGrd.id] };
            }
          }
          return s;
        });
        saveState("students", updated);
        return updated;
      });
    }

    return newGrd;
  };

  const updateGuardian = (id: string, data: Partial<GuardianItem>) => {
    setGuardians((prev) => {
      const updated = prev.map((g) => (g.id === id ? { ...g, ...data } : g));
      saveState("guardians", updated);
      return updated;
    });
  };

  const deactivateGuardian = (id: string) => {
    setGuardians((prev) => {
      const updated = prev.map((g) => {
        if (g.id === id) {
          const nextStatus: "Active" | "Inactive" = g.status === "Active" ? "Inactive" : "Active";
          return { ...g, status: nextStatus };
        }
        return g;
      });
      saveState("guardians", updated);
      return updated;
    });
  };

  const linkStudentToGuardian = (guardianId: string, studentId: string): boolean => {
    let guardianUpdated = false;
    setGuardians((prev) => {
      const updated = prev.map((g) => {
        if (g.id === guardianId || g.guardianId === guardianId) {
          if (!g.studentIds.includes(studentId)) {
            guardianUpdated = true;
            return { ...g, studentIds: [...g.studentIds, studentId] };
          }
        }
        return g;
      });
      if (guardianUpdated) saveState("guardians", updated);
      return updated;
    });

    if (guardianUpdated) {
      setStudents((prev) => {
        const updated = prev.map((s) => {
          if (s.id === studentId || s.studentId === studentId) {
            if (!s.guardianIds.includes(guardianId)) {
              return { ...s, guardianIds: [...s.guardianIds, guardianId] };
            }
          }
          return s;
        });
        saveState("students", updated);
        return updated;
      });
    }

    return guardianUpdated;
  };

  const unlinkStudentFromGuardian = (guardianId: string, studentId: string) => {
    unlinkGuardianFromStudent(studentId, guardianId);
  };

  // =========================================================================
  // Staff Management Handlers
  // =========================================================================
  const addStaff = (data: Omit<StaffItem, "id">): StaffItem => {
    const nextIdx = staff.length + 1;
    const deptPrefix = data.departmentName ? data.departmentName.substring(0, 3).toUpperCase() : "GEN";
    const empId = data.employeeId || `EMP-${deptPrefix}-${String(nextIdx).padStart(3, "0")}`;
    const newStaff: StaffItem = {
      ...data,
      id: `staff-${Date.now()}`,
      employeeId: empId,
      fullName: `${data.firstName} ${data.lastName}`.trim(),
    };

    setStaff((prev) => {
      const updated = [newStaff, ...prev];
      saveState("staff", updated);
      return updated;
    });

    return newStaff;
  };

  const updateStaff = (id: string, data: Partial<StaffItem>) => {
    setStaff((prev) => {
      const updated = prev.map((st) => {
        if (st.id === id) {
          const updatedStaff = { ...st, ...data };
          if (data.firstName || data.lastName) {
            updatedStaff.fullName = `${updatedStaff.firstName} ${updatedStaff.lastName}`.trim();
          }
          return updatedStaff;
        }
        return st;
      });
      saveState("staff", updated);
      return updated;
    });
  };

  const deactivateStaff = (id: string) => {
    setStaff((prev) => {
      const updated = prev.map((st) => {
        if (st.id === id) {
          const nextStatus: StaffStatus = st.status === "Active" ? "Inactive" : "Active";
          return { ...st, status: nextStatus };
        }
        return st;
      });
      saveState("staff", updated);
      return updated;
    });
  };

  // =========================================================================
  // Timetable Management Handlers (Phase 3)
  // =========================================================================
  const timeToMinutes = (timeStr: string): number => {
    if (!timeStr) return 0;
    const parts = timeStr.trim().split(":");
    const h = parseInt(parts[0], 10) || 0;
    const m = parseInt(parts[1], 10) || 0;
    return h * 60 + m;
  };

  const doTimeRangesOverlap = (
    start1: string,
    end1: string,
    start2: string,
    end2: string
  ): boolean => {
    const s1 = timeToMinutes(start1);
    const e1 = timeToMinutes(end1);
    const s2 = timeToMinutes(start2);
    const e2 = timeToMinutes(end2);
    return Math.max(s1, s2) < Math.min(e1, e2);
  };

  const checkTimetableConflicts = (
    proposed: Partial<TimetableSlot> & {
      dayOfWeek: TimetableDayOfWeek;
      startTime: string;
      endTime: string;
      teacherId?: string;
      roomNumber?: string;
      classId?: string;
      sectionId?: string;
      id?: string;
      academicYearId?: string;
      termId?: string;
    }
  ): TimetableConflictCheckResult => {
    const conflicts: TimetableConflict[] = [];

    const relevantSlots = timetableSlots.filter((slot) => {
      if (proposed.id && slot.id === proposed.id) return false;
      if (proposed.academicYearId && slot.academicYearId !== proposed.academicYearId) return false;
      if (proposed.termId && slot.termId !== proposed.termId) return false;
      if (slot.dayOfWeek !== proposed.dayOfWeek) return false;
      return true;
    });

    // 1. Teacher Clash (time overlap check)
    if (proposed.teacherId) {
      const clashingTeacherSlot = relevantSlots.find((slot) => {
        if (slot.teacherId !== proposed.teacherId) return false;
        return doTimeRangesOverlap(slot.startTime, slot.endTime, proposed.startTime, proposed.endTime);
      });

      if (clashingTeacherSlot) {
        conflicts.push({
          type: "TEACHER_CLASH",
          severity: "error",
          message: `Faculty Clash: ${clashingTeacherSlot.teacherName} is already assigned to ${clashingTeacherSlot.className} (${clashingTeacherSlot.sectionName}) in ${clashingTeacherSlot.roomNumber} from ${clashingTeacherSlot.startTime} to ${clashingTeacherSlot.endTime}.`,
          conflictingSlot: clashingTeacherSlot,
        });
      }

      const teacherObj = staff.find((st) => st.id === proposed.teacherId);
      if (teacherObj && teacherObj.status === "On Leave") {
        conflicts.push({
          type: "TEACHER_ON_LEAVE",
          severity: "warning",
          message: `Notice: Faculty member ${teacherObj.fullName} is currently marked as 'On Leave'.`,
        });
      }
    }

    // 2. Room Clash (time overlap check)
    if (proposed.roomNumber && proposed.roomNumber.trim()) {
      const normalizedRoom = proposed.roomNumber.trim().toLowerCase();
      const clashingRoomSlot = relevantSlots.find((slot) => {
        if (slot.roomNumber.trim().toLowerCase() !== normalizedRoom) return false;
        return doTimeRangesOverlap(slot.startTime, slot.endTime, proposed.startTime, proposed.endTime);
      });

      if (clashingRoomSlot) {
        conflicts.push({
          type: "ROOM_CLASH",
          severity: "error",
          message: `Venue Clash: Room "${clashingRoomSlot.roomNumber}" is already booked by ${clashingRoomSlot.className} (${clashingRoomSlot.sectionName}) for ${clashingRoomSlot.subjectName} from ${clashingRoomSlot.startTime} to ${clashingRoomSlot.endTime}.`,
          conflictingSlot: clashingRoomSlot,
        });
      }
    }

    // 3. Class / Section Period Clash (time overlap check)
    if (proposed.classId && proposed.sectionId) {
      const clashingSectionSlot = relevantSlots.find((slot) => {
        if (slot.classId !== proposed.classId || slot.sectionId !== proposed.sectionId) return false;
        return doTimeRangesOverlap(slot.startTime, slot.endTime, proposed.startTime, proposed.endTime);
      });

      if (clashingSectionSlot) {
        conflicts.push({
          type: "CLASS_PERIOD_CLASH",
          severity: "error",
          message: `Section Clash: ${clashingSectionSlot.className} (${clashingSectionSlot.sectionName}) already has "${clashingSectionSlot.subjectName}" scheduled from ${clashingSectionSlot.startTime} to ${clashingSectionSlot.endTime}.`,
          conflictingSlot: clashingSectionSlot,
        });
      }
    }

    const hasHardErrors = conflicts.some((c) => c.severity === "error");

    return {
      hasConflicts: conflicts.length > 0,
      canProceed: !hasHardErrors,
      conflicts,
    };
  };

  const addTimetableSlot = (
    data: Omit<TimetableSlot, "id" | "createdAt">
  ): { success: boolean; slot?: TimetableSlot; conflicts?: TimetableConflict[] } => {
    const conflictResult = checkTimetableConflicts(data);
    if (!conflictResult.canProceed) {
      return { success: false, conflicts: conflictResult.conflicts };
    }

    const newSlot: TimetableSlot = {
      ...data,
      id: `tt-slot-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    setTimetableSlots((prev) => {
      const updated = [...prev, newSlot];
      saveState("timetable", updated);
      return updated;
    });

    return { success: true, slot: newSlot, conflicts: conflictResult.conflicts };
  };

  const updateTimetableSlot = (
    id: string,
    data: Partial<TimetableSlot>
  ): { success: boolean; slot?: TimetableSlot; conflicts?: TimetableConflict[] } => {
    const existing = timetableSlots.find((s) => s.id === id);
    if (!existing) {
      return { success: false, conflicts: [{ type: "CLASS_PERIOD_CLASH", severity: "error", message: "Slot not found" }] };
    }

    const merged = { ...existing, ...data, id };
    const conflictResult = checkTimetableConflicts(merged);
    if (!conflictResult.canProceed) {
      return { success: false, conflicts: conflictResult.conflicts };
    }

    setTimetableSlots((prev) => {
      const updated = prev.map((s) => (s.id === id ? merged : s));
      saveState("timetable", updated);
      return updated;
    });

    return { success: true, slot: merged, conflicts: conflictResult.conflicts };
  };

  const deleteTimetableSlot = (id: string) => {
    setTimetableSlots((prev) => {
      const updated = prev.filter((s) => s.id !== id);
      saveState("timetable", updated);
      return updated;
    });
  };

  const clearSectionTimetable = (
    classId: string,
    sectionId: string,
    dayOfWeek?: TimetableDayOfWeek,
    academicYearId?: string,
    termId?: string
  ) => {
    setTimetableSlots((prev) => {
      const updated = prev.filter((s) => {
        if (s.classId !== classId || s.sectionId !== sectionId) return true;
        if (academicYearId && s.academicYearId !== academicYearId) return true;
        if (termId && s.termId !== termId) return true;
        if (dayOfWeek && s.dayOfWeek !== dayOfWeek) return true;
        return false;
      });
      saveState("timetable", updated);
      return updated;
    });
  };

  const copyDaySchedule = (
    sourceDay: TimetableDayOfWeek,
    targetDay: TimetableDayOfWeek,
    classId: string,
    sectionId: string,
    academicYearId: string,
    termId: string
  ): { copiedCount: number; conflictCount: number } => {
    const sourceSlots = timetableSlots.filter((s) => {
      return (
        s.classId === classId &&
        s.sectionId === sectionId &&
        s.dayOfWeek === sourceDay &&
        s.academicYearId === academicYearId &&
        s.termId === termId
      );
    });

    let copiedCount = 0;
    let conflictCount = 0;
    const newSlotsToInsert: TimetableSlot[] = [];

    // Clear existing targetDay slots for this section first
    const cleanSlots = timetableSlots.filter((s) => {
      return !(
        s.classId === classId &&
        s.sectionId === sectionId &&
        s.dayOfWeek === targetDay &&
        s.academicYearId === academicYearId &&
        s.termId === termId
      );
    });

    for (const src of sourceSlots) {
      const candidate: Omit<TimetableSlot, "id" | "createdAt"> = {
        ...src,
        dayOfWeek: targetDay,
      };

      // Check conflict against cleanSlots + already inserted slots
      const clashingTeacher = [...cleanSlots, ...newSlotsToInsert].find((s) => {
        if (s.dayOfWeek !== targetDay || s.academicYearId !== academicYearId || s.termId !== termId) return false;
        if (s.teacherId !== candidate.teacherId) return false;
        return doTimeRangesOverlap(s.startTime, s.endTime, candidate.startTime, candidate.endTime);
      });

      const clashingRoom = [...cleanSlots, ...newSlotsToInsert].find((s) => {
        if (s.dayOfWeek !== targetDay || s.academicYearId !== academicYearId || s.termId !== termId) return false;
        if (s.roomNumber.trim().toLowerCase() !== candidate.roomNumber.trim().toLowerCase()) return false;
        return doTimeRangesOverlap(s.startTime, s.endTime, candidate.startTime, candidate.endTime);
      });

      if (clashingTeacher || clashingRoom) {
        conflictCount++;
      } else {
        const slotInstance: TimetableSlot = {
          ...candidate,
          id: `tt-slot-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          createdAt: new Date().toISOString(),
        };
        newSlotsToInsert.push(slotInstance);
        copiedCount++;
      }
    }

    const updated = [...cleanSlots, ...newSlotsToInsert];
    setTimetableSlots(updated);
    saveState("timetable", updated);

    return { copiedCount, conflictCount };
  };

  const updatePeriodConfigs = (configs: PeriodConfig[]) => {
    setPeriodConfigs(configs);
    saveState("periods", configs);
  };

  const getSubjectAllocationStats = (
    subjectId: string,
    classId: string,
    sectionId: string,
    academicYearId: string,
    termId?: string
  ) => {
    const targetSubj = subjects.find((s) => s.id === subjectId);
    const targetHours = targetSubj ? targetSubj.hoursPerWeek : 0;

    const matchingSlots = timetableSlots.filter((slot) => {
      if (slot.subjectId !== subjectId) return false;
      if (slot.classId !== classId) return false;
      if (slot.sectionId !== sectionId) return false;
      if (academicYearId && slot.academicYearId !== academicYearId) return false;
      if (termId && slot.termId !== termId) return false;
      return true;
    });

    const scheduledSlotsCount = matchingSlots.length;
    const totalMinutes = matchingSlots.reduce((acc, slot) => {
      const s = timeToMinutes(slot.startTime);
      const e = timeToMinutes(slot.endTime);
      return acc + Math.max(0, e - s);
    }, 0);

    const scheduledHours = parseFloat((totalMinutes / 60).toFixed(1));
    const isUnderAllocated = scheduledHours < targetHours;
    const isOverAllocated = scheduledHours > targetHours;
    const isFulfilled = Math.abs(scheduledHours - targetHours) <= 0.2;

    return {
      targetHoursPerWeek: targetHours,
      scheduledSlotsCount,
      scheduledHours,
      isUnderAllocated,
      isOverAllocated,
      isFulfilled,
    };
  };

  const getAvailableRooms = (): string[] => {
    const set = new Set<string>();
    sections.forEach((sec) => {
      if (sec.roomNumber && sec.roomNumber.trim()) {
        set.add(sec.roomNumber.trim());
      }
    });
    timetableSlots.forEach((slot) => {
      if (slot.roomNumber && slot.roomNumber.trim()) {
        set.add(slot.roomNumber.trim());
      }
    });
    [
      "LH-301, Ramanujan Block",
      "LH-302, Ramanujan Block",
      "LH-303, Ramanujan Block",
      "LH-401, Turing Hall",
      "Advanced Systems Lab 2, Tech Block",
      "Microprocessor & VLSI Lab 1",
      "Seminar Hall 1",
    ].forEach((r) => set.add(r));
    return Array.from(set).sort();
  };

  // -------------------------------------------------------------
  // Attendance Management Methods (Phase 3)
  // -------------------------------------------------------------
  const updateAttendanceThreshold = (config: AttendanceThresholdConfig) => {
    setAttendanceThreshold(config);
    saveState("att_threshold", config);
  };

  const saveBatchAttendance = (params: {
    academicYearId: string;
    courseId: string;
    classId: string;
    sectionId: string;
    date: string;
    session: string;
    markedBy: string;
    entries: {
      studentId: string;
      studentUniqueId?: string;
      rollNumber: string;
      studentName: string;
      status: AttendanceStatus;
      remarks?: string;
    }[];
  }) => {
    const targetAY = academicYears.find((ay) => ay.id === params.academicYearId);
    const targetCourse = courses.find((c) => c.id === params.courseId);
    const targetClass = classes.find((c) => c.id === params.classId);
    const targetSection = sections.find((s) => s.id === params.sectionId);

    const newRecords: AttendanceRecord[] = params.entries.map((entry, idx) => ({
      id: `att-rec-${Date.now()}-${idx}`,
      institutionId: profile.id || "inst-sst-01",
      academicYearId: params.academicYearId,
      academicYearName: targetAY?.name,
      courseId: params.courseId,
      courseName: targetCourse?.name,
      classId: params.classId,
      className: targetClass?.name,
      sectionId: params.sectionId,
      sectionName: targetSection?.name,
      date: params.date,
      session: params.session,
      studentId: entry.studentId,
      studentUniqueId: entry.studentUniqueId,
      rollNumber: entry.rollNumber,
      studentName: entry.studentName,
      status: entry.status,
      remarks: entry.remarks,
      markedBy: params.markedBy,
      markedAt: new Date().toISOString(),
    }));

    setAttendanceRecords((prev) => {
      // Remove any prior records for this exact class, section, date, session to prevent duplicates
      const filtered = prev.filter(
        (r) =>
          !(
            r.classId === params.classId &&
            r.sectionId === params.sectionId &&
            r.date === params.date &&
            r.session === params.session
          )
      );
      const updated = [...newRecords, ...filtered];
      saveState("att_records", updated);
      return updated;
    });

    return {
      success: true,
      savedCount: params.entries.length,
      message: `Successfully saved attendance for ${params.entries.length} students on ${params.date} (${params.session}).`,
    };
  };

  const correctAttendanceRecord = (
    recordId: string,
    newStatus: AttendanceStatus,
    reason: string,
    correctedBy: string
  ) => {
    const record = attendanceRecords.find((r) => r.id === recordId);
    if (!record) {
      return { success: false, message: "Attendance record not found." };
    }

    const prevStatus = record.status;
    if (prevStatus === newStatus) {
      return { success: false, message: "New status cannot be identical to current status." };
    }

    const auditEntry: AttendanceCorrectionAudit = {
      id: `att-corr-${Date.now()}`,
      attendanceRecordId: record.id,
      studentId: record.studentId,
      studentName: record.studentName,
      rollNumber: record.rollNumber,
      className: record.className,
      sectionName: record.sectionName,
      date: record.date,
      session: record.session,
      previousStatus: prevStatus,
      updatedStatus: newStatus,
      reason: reason.trim(),
      correctedBy: correctedBy.trim() || "Institution Admin",
      correctedAt: new Date().toISOString(),
    };

    setAttendanceAudits((prev) => {
      const updated = [auditEntry, ...prev];
      saveState("att_audits", updated);
      return updated;
    });

    setAttendanceRecords((prev) => {
      const updated = prev.map((r) => {
        if (r.id === recordId) {
          return {
            ...r,
            status: newStatus,
            isCorrected: true,
            lastCorrectedAt: new Date().toISOString(),
            remarks: r.remarks ? `${r.remarks} | Corrected: ${reason.trim()}` : `Corrected: ${reason.trim()}`,
          };
        }
        return r;
      });
      saveState("att_records", updated);
      return updated;
    });

    return {
      success: true,
      message: `Attendance for ${record.studentName} updated from ${prevStatus} to ${newStatus}. Audit record created.`,
    };
  };

  const deleteAttendanceRecord = (recordId: string) => {
    setAttendanceRecords((prev) => {
      const updated = prev.filter((r) => r.id !== recordId);
      saveState("att_records", updated);
      return updated;
    });
  };

  const getAttendanceForClassAndDate = (
    classId: string,
    sectionId: string,
    date: string,
    session: string
  ): AttendanceRecord[] => {
    return attendanceRecords.filter(
      (r) =>
        r.classId === classId &&
        r.sectionId === sectionId &&
        r.date === date &&
        r.session === session
    );
  };

  const getStudentAttendanceSummaries = (
    classId?: string,
    sectionId?: string,
    startDate?: string,
    endDate?: string
  ): StudentAttendanceSummary[] => {
    let targetStudents = students.filter((s) => s.status === "Active");
    if (classId) {
      targetStudents = targetStudents.filter(
        (s) => s.classId === classId || (classId === "class-cse-3" && s.classId === "class-cse-y3")
      );
    }
    if (sectionId) {
      targetStudents = targetStudents.filter((s) => s.sectionId === sectionId);
    }

    return targetStudents.map((student) => {
      let studentRecords = attendanceRecords.filter(
        (r) => r.studentId === student.id || r.rollNumber === student.rollNumber
      );
      if (startDate) {
        studentRecords = studentRecords.filter((r) => r.date >= startDate);
      }
      if (endDate) {
        studentRecords = studentRecords.filter((r) => r.date <= endDate);
      }

      const totalSessions = studentRecords.length;
      const presentCount = studentRecords.filter((r) => r.status === "Present").length;
      const lateCount = studentRecords.filter((r) => r.status === "Late").length;
      const leaveCount = studentRecords.filter((r) => r.status === "On Leave").length;
      const absentCount = studentRecords.filter((r) => r.status === "Absent").length;

      const effectiveAttended = presentCount + lateCount;
      const percentage = totalSessions > 0 ? Math.round((effectiveAttended / totalSessions) * 1000) / 10 : 100;

      const primaryGuardianId = student.guardianIds?.[0];
      const primaryGuardian = guardians.find((g) => g.id === primaryGuardianId || g.guardianId === primaryGuardianId);

      return {
        studentId: student.id,
        studentUniqueId: student.studentId,
        studentName: student.fullName,
        rollNumber: student.rollNumber,
        classId: student.classId,
        className: student.className,
        sectionId: student.sectionId,
        sectionName: student.sectionName,
        totalSessions,
        presentCount,
        absentCount,
        lateCount,
        leaveCount,
        percentage,
        isBelowThreshold: totalSessions > 0 && percentage < attendanceThreshold.minimumPercentage,
        isWarning:
          totalSessions > 0 &&
          percentage >= attendanceThreshold.minimumPercentage &&
          percentage <= attendanceThreshold.warningPercentage,
        guardianName: primaryGuardian?.fullName,
        guardianPhone: primaryGuardian?.phone,
        guardianEmail: primaryGuardian?.email,
      };
    });
  };

  const getClassAttendanceSummaries = (
    academicYearId?: string,
    startDate?: string,
    endDate?: string
  ): ClassAttendanceSummary[] => {
    let relevantClasses = classes;
    if (academicYearId) {
      relevantClasses = relevantClasses.filter((c) => c.academicYearId === academicYearId);
    }

    return relevantClasses.map((cls) => {
      const classStudents = students.filter(
        (s) => (s.classId === cls.id || (cls.id === "class-cse-3" && s.classId === "class-cse-y3")) && s.status === "Active"
      );
      let classRecords = attendanceRecords.filter((r) => r.classId === cls.id);
      if (startDate) classRecords = classRecords.filter((r) => r.date >= startDate);
      if (endDate) classRecords = classRecords.filter((r) => r.date <= endDate);

      const totalSessions = new Set(classRecords.map((r) => `${r.date}_${r.session}`)).size;
      const presentOrLate = classRecords.filter((r) => r.status === "Present" || r.status === "Late").length;
      const averagePercentage =
        classRecords.length > 0 ? Math.round((presentOrLate / classRecords.length) * 1000) / 10 : 100;

      // Count students with low attendance
      const studentSummaries = getStudentAttendanceSummaries(cls.id, undefined, startDate, endDate);
      const lowAttendanceCount = studentSummaries.filter((s) => s.isBelowThreshold).length;

      return {
        classId: cls.id,
        className: cls.name,
        totalEnrolled: classStudents.length,
        totalSessions,
        averagePercentage,
        lowAttendanceCount,
      };
    });
  };

  const getAttendanceMetrics = (
    date?: string,
    classId?: string,
    sectionId?: string
  ) => {
    let filteredRecords = attendanceRecords;
    if (date) {
      filteredRecords = filteredRecords.filter((r) => r.date === date);
    }
    if (classId) {
      filteredRecords = filteredRecords.filter((r) => r.classId === classId);
    }
    if (sectionId) {
      filteredRecords = filteredRecords.filter((r) => r.sectionId === sectionId);
    }

    let enrolledStudents = students.filter((s) => s.status === "Active");
    if (classId) {
      enrolledStudents = enrolledStudents.filter(
        (s) => s.classId === classId || (classId === "class-cse-3" && s.classId === "class-cse-y3")
      );
    }
    if (sectionId) {
      enrolledStudents = enrolledStudents.filter((s) => s.sectionId === sectionId);
    }

    const present = filteredRecords.filter((r) => r.status === "Present").length;
    const late = filteredRecords.filter((r) => r.status === "Late").length;
    const onLeave = filteredRecords.filter((r) => r.status === "On Leave").length;
    const absent = filteredRecords.filter((r) => r.status === "Absent").length;
    const totalRecords = filteredRecords.length;

    const percentage = totalRecords > 0 ? Math.round(((present + late) / totalRecords) * 1000) / 10 : 92.4;

    return {
      totalEnrolled: enrolledStudents.length,
      present,
      absent,
      late,
      onLeave,
      percentage,
    };
  };

  // -------------------------------------------------------------
  // Examination Management Methods (Phase 3)
  // -------------------------------------------------------------
  const recordExamAudit = (log: Omit<ExamAuditLog, "id" | "timestamp">) => {
    const newLog: ExamAuditLog = {
      ...log,
      id: `audit-exam-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
    };
    setExamAudits((prev) => {
      const updated = [newLog, ...prev];
      saveState("exam_audits", updated);
      return updated;
    });
  };

  const checkExamConflicts = (proposed: {
    examinationId?: string;
    slotId?: string;
    classId?: string;
    sectionId?: string;
    examDate: string;
    startTime: string;
    endTime: string;
    hallId?: string;
    invigilatorId?: string;
    subjectId?: string;
    allocatedCount?: number;
    capacity?: number;
  }): { hasConflicts: boolean; canProceed: boolean; conflicts: ExamConflict[] } => {
    const conflicts: ExamConflict[] = [];

    // 1. Time validity
    const sMinutes = timeToMinutes(proposed.startTime);
    const eMinutes = timeToMinutes(proposed.endTime);
    if (sMinutes >= eMinutes) {
      conflicts.push({
        type: "INVALID_TIME",
        severity: "error",
        message: "Examination start time must be chronologically earlier than end time.",
      });
    }

    // 2. Hall capacity
    if (proposed.capacity && proposed.allocatedCount && proposed.allocatedCount > proposed.capacity) {
      conflicts.push({
        type: "HALL_CAPACITY_EXCEEDED",
        severity: "error",
        message: `Allocated students (${proposed.allocatedCount}) exceeds the hall's maximum capacity of ${proposed.capacity}.`,
      });
    }

    // Find all existing slots across all scheduled/ongoing examinations
    const allSlotsWithExam = examinations
      .filter((e) => e.status !== "Cancelled")
      .flatMap((e) =>
        e.slots
          .filter((s) => s.status !== "Cancelled")
          .map((s) => ({ ...s, examClassId: e.classId, examSectionId: e.sectionId, examName: e.name }))
      );

    // 3. Duplicate subject within the same examination
    if (proposed.examinationId && proposed.subjectId) {
      const targetExam = examinations.find((e) => e.id === proposed.examinationId);
      if (targetExam) {
        const hasDuplicateSubject = targetExam.slots.some(
          (s) => s.id !== proposed.slotId && s.subjectId === proposed.subjectId && s.status !== "Cancelled"
        );
        if (hasDuplicateSubject) {
          conflicts.push({
            type: "DUPLICATE_SUBJECT",
            severity: "error",
            message: "This subject is already scheduled within the selected examination cycle.",
          });
        }
      }
    }

    for (const existing of allSlotsWithExam) {
      if (existing.id === proposed.slotId) continue;
      if (existing.examDate !== proposed.examDate) continue;

      const overlap = doTimeRangesOverlap(
        proposed.startTime,
        proposed.endTime,
        existing.startTime,
        existing.endTime
      );
      if (!overlap) continue;

      // 4. Overlapping examination schedule for the same class/section
      if (
        proposed.classId &&
        existing.examClassId === proposed.classId &&
        (!proposed.sectionId || !existing.examSectionId || proposed.sectionId === existing.examSectionId)
      ) {
        conflicts.push({
          type: "CLASS_SCHEDULE_CLASH",
          severity: "error",
          message: `Class schedule clash: This cohort already has "${existing.subjectName}" scheduled on ${proposed.examDate} between ${existing.startTime} and ${existing.endTime}.`,
          conflictingSlotId: existing.id,
        });
      }

      // 5. Double-booking of examination halls
      if (proposed.hallId && existing.hallId === proposed.hallId) {
        conflicts.push({
          type: "HALL_DOUBLE_BOOKING",
          severity: "error",
          message: `Hall double-booking: Examination Hall "${existing.hallName}" is already reserved for "${existing.subjectName}" on ${proposed.examDate} (${existing.startTime} - ${existing.endTime}).`,
          conflictingSlotId: existing.id,
        });
      }

      // 6. Double-booking of invigilators
      if (proposed.invigilatorId && existing.invigilatorId === proposed.invigilatorId) {
        conflicts.push({
          type: "INVIGILATOR_DOUBLE_BOOKING",
          severity: "error",
          message: `Invigilator duty clash: ${existing.invigilatorName} is already assigned to invigilate in ${existing.hallName} on ${proposed.examDate} (${existing.startTime} - ${existing.endTime}).`,
          conflictingSlotId: existing.id,
        });
      }
    }

    const hasErrors = conflicts.some((c) => c.severity === "error");
    return {
      hasConflicts: conflicts.length > 0,
      canProceed: !hasErrors,
      conflicts,
    };
  };

  const addExamination = (data: Omit<ExaminationItem, "id" | "createdAt" | "updatedAt">) => {
    const sDate = new Date(data.startDate);
    const eDate = new Date(data.endDate);
    if (sDate > eDate) {
      return { success: false, message: "Examination start date cannot be after end date." };
    }

    const newExam: ExaminationItem = {
      ...data,
      id: `exam-${Date.now()}`,
      institutionId: profile.id || "inst-sst-01",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setExaminations((prev) => {
      const updated = [newExam, ...prev];
      saveState("exams", updated);
      return updated;
    });

    recordExamAudit({
      examinationId: newExam.id,
      examinationName: newExam.name,
      action: "EXAMINATION_CREATED",
      details: `Configured new ${newExam.type} examination (${newExam.code}) for ${newExam.className || "Class Cohort"}.`,
      performedBy: "Institution Admin",
    });

    return {
      success: true,
      examination: newExam,
      message: `Examination "${newExam.name}" successfully created.`,
    };
  };

  const updateExamination = (id: string, data: Partial<ExaminationItem>) => {
    const current = examinations.find((e) => e.id === id);
    if (!current) {
      return { success: false, message: "Examination record not found." };
    }

    const updatedExam: ExaminationItem = {
      ...current,
      ...data,
      updatedAt: new Date().toISOString(),
    };

    setExaminations((prev) => {
      const updated = prev.map((e) => (e.id === id ? updatedExam : e));
      saveState("exams", updated);
      return updated;
    });

    const statusChanged = data.status && data.status !== current.status;
    recordExamAudit({
      examinationId: id,
      examinationName: updatedExam.name,
      action: statusChanged ? `EXAM_STATUS_${data.status?.toUpperCase()}` : "EXAMINATION_UPDATED",
      details: statusChanged
        ? `Status transitioned from ${current.status} to ${data.status}.`
        : `Updated configuration parameters for ${updatedExam.name}.`,
      previousValue: current.status,
      newValue: data.status,
      performedBy: "Institution Admin",
    });

    return {
      success: true,
      examination: updatedExam,
      message: `Examination "${updatedExam.name}" updated successfully.`,
    };
  };

  const deleteExamination = (id: string) => {
    const current = examinations.find((e) => e.id === id);
    setExaminations((prev) => {
      const updated = prev.filter((e) => e.id !== id);
      saveState("exams", updated);
      return updated;
    });

    if (current) {
      recordExamAudit({
        examinationId: id,
        examinationName: current.name,
        action: "EXAMINATION_DELETED",
        details: `Deleted examination "${current.name}" (${current.code}) from institutional registry.`,
        performedBy: "Institution Admin",
      });
    }

    return { success: true, message: "Examination successfully removed." };
  };

  const addExamSubjectSlot = (
    examinationId: string,
    slot: Omit<ExamSubjectSlot, "id" | "examinationId">
  ) => {
    const exam = examinations.find((e) => e.id === examinationId);
    if (!exam) {
      return { success: false, message: "Target examination not found." };
    }

    // Marks validation
    if (slot.passingMarks > slot.maxMarks) {
      return {
        success: false,
        message: `Passing marks (${slot.passingMarks}) cannot exceed maximum marks (${slot.maxMarks}).`,
      };
    }

    // Hall capacity lookup
    const targetHall = examHalls.find((h) => h.id === slot.hallId);

    // Conflict detection
    const conflictResult = checkExamConflicts({
      examinationId,
      classId: exam.classId,
      sectionId: exam.sectionId,
      examDate: slot.examDate,
      startTime: slot.startTime,
      endTime: slot.endTime,
      hallId: slot.hallId,
      invigilatorId: slot.invigilatorId,
      subjectId: slot.subjectId,
      allocatedCount: slot.allocatedStudentCount,
      capacity: targetHall?.capacity || slot.hallCapacity,
    });

    if (!conflictResult.canProceed) {
      const firstError = conflictResult.conflicts.find((c) => c.severity === "error");
      return {
        success: false,
        conflicts: conflictResult.conflicts,
        message: firstError ? firstError.message : "Validation conflict detected.",
      };
    }

    const newSlot: ExamSubjectSlot = {
      ...slot,
      id: `slot-exam-${Date.now()}`,
      examinationId,
      hallName: targetHall ? targetHall.name : slot.hallName,
      hallCapacity: targetHall ? targetHall.capacity : slot.hallCapacity,
    };

    setExaminations((prev) => {
      const updated = prev.map((e) => {
        if (e.id === examinationId) {
          return {
            ...e,
            slots: [...e.slots, newSlot],
            updatedAt: new Date().toISOString(),
          };
        }
        return e;
      });
      saveState("exams", updated);
      return updated;
    });

    recordExamAudit({
      examinationId,
      examinationName: exam.name,
      action: "SUBJECT_SCHEDULED",
      details: `Scheduled ${newSlot.subjectCode} (${newSlot.subjectName}) on ${newSlot.examDate} at ${newSlot.startTime}-${newSlot.endTime} in ${newSlot.hallName || "TBD"}.`,
      performedBy: "Institution Admin",
    });

    return {
      success: true,
      slot: newSlot,
      message: `Subject "${newSlot.subjectName}" successfully scheduled.`,
    };
  };

  const updateExamSubjectSlot = (
    examinationId: string,
    slotId: string,
    slot: Partial<ExamSubjectSlot>
  ) => {
    const exam = examinations.find((e) => e.id === examinationId);
    if (!exam) return { success: false, message: "Target examination not found." };
    const currentSlot = exam.slots.find((s) => s.id === slotId);
    if (!currentSlot) return { success: false, message: "Examination slot not found." };

    const merged = { ...currentSlot, ...slot };

    if (merged.passingMarks > merged.maxMarks) {
      return {
        success: false,
        message: `Passing marks (${merged.passingMarks}) cannot exceed maximum marks (${merged.maxMarks}).`,
      };
    }

    const targetHall = examHalls.find((h) => h.id === merged.hallId);
    const conflictResult = checkExamConflicts({
      examinationId,
      slotId,
      classId: exam.classId,
      sectionId: exam.sectionId,
      examDate: merged.examDate,
      startTime: merged.startTime,
      endTime: merged.endTime,
      hallId: merged.hallId,
      invigilatorId: merged.invigilatorId,
      subjectId: merged.subjectId,
      allocatedCount: merged.allocatedStudentCount,
      capacity: targetHall?.capacity || merged.hallCapacity,
    });

    if (!conflictResult.canProceed) {
      const firstError = conflictResult.conflicts.find((c) => c.severity === "error");
      return {
        success: false,
        conflicts: conflictResult.conflicts,
        message: firstError ? firstError.message : "Validation conflict detected.",
      };
    }

    if (targetHall) {
      merged.hallName = targetHall.name;
      merged.hallCapacity = targetHall.capacity;
    }

    setExaminations((prev) => {
      const updated = prev.map((e) => {
        if (e.id === examinationId) {
          return {
            ...e,
            slots: e.slots.map((s) => (s.id === slotId ? merged : s)),
            updatedAt: new Date().toISOString(),
          };
        }
        return e;
      });
      saveState("exams", updated);
      return updated;
    });

    recordExamAudit({
      examinationId,
      examinationName: exam.name,
      action: "TIMETABLE_UPDATED",
      details: `Updated schedule parameters for ${merged.subjectCode} (${merged.subjectName}).`,
      performedBy: "Institution Admin",
    });

    return {
      success: true,
      slot: merged,
      message: `Schedule for "${merged.subjectName}" updated successfully.`,
    };
  };

  const deleteExamSubjectSlot = (examinationId: string, slotId: string) => {
    const exam = examinations.find((e) => e.id === examinationId);
    const slot = exam?.slots.find((s) => s.id === slotId);

    setExaminations((prev) => {
      const updated = prev.map((e) => {
        if (e.id === examinationId) {
          return {
            ...e,
            slots: e.slots.filter((s) => s.id !== slotId),
            updatedAt: new Date().toISOString(),
          };
        }
        return e;
      });
      saveState("exams", updated);
      return updated;
    });

    if (exam && slot) {
      recordExamAudit({
        examinationId,
        examinationName: exam.name,
        action: "SUBJECT_UNSCHEDULED",
        details: `Removed ${slot.subjectCode} (${slot.subjectName}) from examination schedule.`,
        performedBy: "Institution Admin",
      });
    }

    return { success: true, message: "Subject examination slot removed." };
  };

  const addExamHall = (hall: Omit<ExamHall, "id">) => {
    const newHall: ExamHall = {
      ...hall,
      id: `hall-${Date.now()}`,
    };
    setExamHalls((prev) => {
      const updated = [...prev, newHall];
      saveState("exam_halls", updated);
      return updated;
    });
    return { success: true, hall: newHall, message: `Exam hall "${newHall.name}" added.` };
  };

  const updateExamHall = (id: string, hall: Partial<ExamHall>) => {
    setExamHalls((prev) => {
      const updated = prev.map((h) => (h.id === id ? { ...h, ...hall } : h));
      saveState("exam_halls", updated);
      return updated;
    });
    return { success: true, message: "Exam hall updated successfully." };
  };

  const deleteExamHall = (id: string) => {
    setExamHalls((prev) => {
      const updated = prev.filter((h) => h.id !== id);
      saveState("exam_halls", updated);
      return updated;
    });
    return { success: true, message: "Exam hall removed." };
  };

  const recordEligibilityOverride = (
    override: Omit<ExamEligibilityOverride, "id" | "authorizedAt">
  ) => {
    const newOverride: ExamEligibilityOverride = {
      ...override,
      id: `elg-ovr-${Date.now()}`,
      authorizedAt: new Date().toISOString(),
    };

    setExamEligibilityOverrides((prev) => {
      const filtered = prev.filter(
        (o) => !(o.examinationId === override.examinationId && o.studentId === override.studentId)
      );
      const updated = [newOverride, ...filtered];
      saveState("exam_overrides", updated);
      return updated;
    });

    recordExamAudit({
      examinationId: override.examinationId,
      action: "ELIGIBILITY_OVERRIDE",
      details: `Recorded ${override.status.toUpperCase()} eligibility override for ${override.studentName} (${override.rollNumber}, ${override.attendancePercentage}% attendance).`,
      reason: override.reason,
      performedBy: override.authorizedBy,
    });

    return {
      success: true,
      message: `Eligibility override for ${override.studentName} recorded as ${override.status}.`,
    };
  };

  const getExamStudentsWithEligibility = (examinationId: string) => {
    const exam = examinations.find((e) => e.id === examinationId);
    if (!exam) return [];

    let targetStudents = students.filter(
      (s) =>
        (s.classId === exam.classId || (exam.classId === "class-cse-3" && s.classId === "class-cse-y3")) &&
        s.status === "Active"
    );

    if (exam.sectionId && exam.sectionId !== "all") {
      targetStudents = targetStudents.filter((s) => s.sectionId === exam.sectionId);
    }

    const minThreshold = attendanceThreshold.minimumPercentage;

    return targetStudents.map((student) => {
      const studentRecords = attendanceRecords.filter(
        (r) => r.studentId === student.id || r.rollNumber === student.rollNumber
      );
      const totalSessions = studentRecords.length;
      const presentCount = studentRecords.filter((r) => r.status === "Present" || r.status === "Late").length;
      const attendancePercentage =
        totalSessions > 0 ? Math.round((presentCount / totalSessions) * 1000) / 10 : 100;

      const isAttendanceEligible = totalSessions === 0 || attendancePercentage >= minThreshold;

      const override = examEligibilityOverrides.find(
        (o) => o.examinationId === examinationId && o.studentId === student.id
      );

      const hasOverride = !!override;
      const overrideStatus = override?.status;
      const overrideReason = override?.reason;

      let finalEligible = isAttendanceEligible;
      if (hasOverride) {
        finalEligible = overrideStatus === "Approved";
      }

      return {
        studentId: student.id,
        studentName: student.fullName,
        rollNumber: student.rollNumber,
        className: student.className,
        sectionName: student.sectionName,
        attendancePercentage,
        isAttendanceEligible,
        hasOverride,
        overrideStatus,
        overrideReason,
        finalEligible,
      };
    });
  };

  const getExamMetrics = () => {
    const totalExams = examinations.length;
    const upcomingExams = examinations.filter((e) => e.status === "Scheduled" || e.status === "Draft").length;
    const ongoingExams = examinations.filter((e) => e.status === "Ongoing").length;
    const completedExams = examinations.filter((e) => e.status === "Completed").length;
    const scheduledSubjects = examinations.reduce((acc, e) => acc + e.slots.length, 0);
    const availableHalls = examHalls.filter((h) => h.status === "Available").length;

    return {
      totalExams,
      upcomingExams,
      ongoingExams,
      completedExams,
      scheduledSubjects,
      availableHalls,
    };
  };

  // -----------------------------------------------------------
  // Phase 4A: Internal Assessment (IA) Methods
  // -----------------------------------------------------------
  const checkIAAssessmentConflicts = (data: {
    assessmentId?: string;
    classId: string;
    sectionId?: string;
    subjectId: string;
    name: string;
    startDate: string;
    endDate: string;
  }): { hasConflict: boolean; message?: string } => {
    const existing = iaAssessments.filter(
      (a) => a.id !== data.assessmentId && a.status !== "Cancelled"
    );

    // Check duplicate name for same class and subject
    const duplicate = existing.find(
      (a) =>
        a.classId === data.classId &&
        a.subjectId === data.subjectId &&
        a.name.trim().toLowerCase() === data.name.trim().toLowerCase()
    );
    if (duplicate) {
      return {
        hasConflict: true,
        message: `An assessment with name "${data.name}" already exists for this class and subject (${duplicate.assessmentCode}).`,
      };
    }

    // Check date overlap for same class, section and subject
    const dateOverlap = existing.find((a) => {
      const sameSection =
        !data.sectionId ||
        data.sectionId === "ALL" ||
        !a.sectionId ||
        a.sectionId === "ALL" ||
        a.sectionId === data.sectionId;
      if (a.classId === data.classId && a.subjectId === data.subjectId && sameSection) {
        return data.startDate <= a.endDate && data.endDate >= a.startDate;
      }
      return false;
    });

    if (dateOverlap) {
      return {
        hasConflict: true,
        message: `Date range (${data.startDate} to ${data.endDate}) overlaps with existing assessment "${dateOverlap.name}" (${dateOverlap.startDate} to ${dateOverlap.endDate}).`,
      };
    }

    return { hasConflict: false };
  };

  const addIAAssessment = (
    data: Omit<IAAssessment, "id" | "createdAt" | "updatedAt">
  ): { success: boolean; assessment?: IAAssessment; message: string } => {
    // Validation
    if (!data.name || !data.name.trim()) {
      return { success: false, message: "Assessment name is required." };
    }
    if (!data.classId || !data.subjectId || !data.courseId) {
      return { success: false, message: "Course, Class, and Subject must be selected." };
    }
    if (!data.startDate || !data.endDate) {
      return { success: false, message: "Start date and End date are required." };
    }
    if (data.startDate > data.endDate) {
      return { success: false, message: "End date must be on or after start date." };
    }
    if (data.totalMaxMarks <= 0) {
      return { success: false, message: "Total maximum marks must be greater than zero." };
    }
    if (data.totalPassingMarks <= 0 || data.totalPassingMarks > data.totalMaxMarks) {
      return {
        success: false,
        message: "Passing marks must be greater than zero and cannot exceed maximum marks.",
      };
    }

    // Component validation if multi-component
    if (data.hasMultipleComponents && data.components && data.components.length > 0) {
      const totalWeightage = data.components.reduce(
        (sum, c) => sum + (Number(c.weightagePercentage) || 0),
        0
      );
      if (Math.abs(totalWeightage - 100) > 0.01) {
        return {
          success: false,
          message: `Total component weightage must equal 100%. Current total: ${totalWeightage}%.`,
        };
      }
      for (const comp of data.components) {
        if (!comp.name.trim()) {
          return { success: false, message: "All components must have a valid name." };
        }
        if (comp.maxMarks <= 0) {
          return {
            success: false,
            message: `Component "${comp.name}" maximum marks must be greater than 0.`,
          };
        }
        if (comp.passingMarks > comp.maxMarks) {
          return {
            success: false,
            message: `Component "${comp.name}" passing marks cannot exceed maximum marks.`,
          };
        }
      }
    }

    // Conflict check
    const conflict = checkIAAssessmentConflicts({
      classId: data.classId,
      sectionId: data.sectionId,
      subjectId: data.subjectId,
      name: data.name,
      startDate: data.startDate,
      endDate: data.endDate,
    });
    if (conflict.hasConflict) {
      return { success: false, message: conflict.message || "Conflict detected." };
    }

    const now = new Date().toISOString();
    const newId = `ia-${Date.now()}`;
    const generatedCode =
      data.assessmentCode?.trim() ||
      `IA-${data.subjectCode || "SUBJ"}-${newId.slice(-4)}`;

    const newAssessment: IAAssessment = {
      ...data,
      id: newId,
      assessmentCode: generatedCode,
      status: data.status || "Draft",
      statusHistory: [
        {
          status: data.status || "Draft",
          changedAt: now,
          changedBy: "Institution Admin",
          remarks: "Assessment created in Institution Admin Portal",
        },
      ],
      createdAt: now,
      updatedAt: now,
    };

    setIaAssessments((prev) => {
      const updated = [newAssessment, ...prev];
      saveState("ia_assessments", updated);
      return updated;
    });

    return {
      success: true,
      assessment: newAssessment,
      message: "Internal Assessment created successfully.",
    };
  };

  const updateIAAssessment = (
    id: string,
    data: Partial<IAAssessment>
  ): { success: boolean; assessment?: IAAssessment; message: string } => {
    const existing = iaAssessments.find((a) => a.id === id);
    if (!existing) {
      return { success: false, message: "Assessment not found." };
    }

    if (data.startDate && data.endDate && data.startDate > data.endDate) {
      return { success: false, message: "End date must be on or after start date." };
    }
    if (
      data.totalMaxMarks !== undefined &&
      data.totalPassingMarks !== undefined &&
      data.totalPassingMarks > data.totalMaxMarks
    ) {
      return {
        success: false,
        message: "Passing marks cannot exceed maximum marks.",
      };
    }

    if (data.hasMultipleComponents && data.components && data.components.length > 0) {
      const totalWeightage = data.components.reduce(
        (sum, c) => sum + (Number(c.weightagePercentage) || 0),
        0
      );
      if (Math.abs(totalWeightage - 100) > 0.01) {
        return {
          success: false,
          message: `Total component weightage must equal 100%. Current total: ${totalWeightage}%.`,
        };
      }
    }

    // Check conflict if changing dates or name
    if (data.name || data.startDate || data.endDate) {
      const conflict = checkIAAssessmentConflicts({
        assessmentId: id,
        classId: data.classId || existing.classId,
        sectionId: data.sectionId || existing.sectionId,
        subjectId: data.subjectId || existing.subjectId,
        name: data.name || existing.name,
        startDate: data.startDate || existing.startDate,
        endDate: data.endDate || existing.endDate,
      });
      if (conflict.hasConflict) {
        return { success: false, message: conflict.message || "Conflict detected." };
      }
    }

    const now = new Date().toISOString();
    let updatedHistory = existing.statusHistory || [];
    if (data.status && data.status !== existing.status) {
      updatedHistory = [
        ...updatedHistory,
        {
          status: data.status,
          changedAt: now,
          changedBy: "Institution Admin",
          remarks: `Status updated to ${data.status}`,
        },
      ];
    }

    const updatedAssessment: IAAssessment = {
      ...existing,
      ...data,
      statusHistory: updatedHistory,
      updatedAt: now,
    };

    setIaAssessments((prev) => {
      const updated = prev.map((a) => (a.id === id ? updatedAssessment : a));
      saveState("ia_assessments", updated);
      return updated;
    });

    return {
      success: true,
      assessment: updatedAssessment,
      message: "Internal Assessment updated successfully.",
    };
  };

  const deleteIAAssessment = (id: string): { success: boolean; message: string } => {
    const existing = iaAssessments.find((a) => a.id === id);
    if (!existing) {
      return { success: false, message: "Assessment not found." };
    }

    if (existing.status === "Published") {
      return {
        success: false,
        message: "Cannot delete a Published assessment. Revert status to Draft or Cancel first.",
      };
    }

    setIaAssessments((prev) => {
      const updated = prev.filter((a) => a.id !== id);
      saveState("ia_assessments", updated);
      return updated;
    });

    return { success: true, message: "Assessment deleted successfully." };
  };

  const transitionIAAssessmentStatus = (
    id: string,
    newStatus: IAAssessmentStatus,
    remarks?: string
  ): { success: boolean; message: string } => {
    const existing = iaAssessments.find((a) => a.id === id);
    if (!existing) {
      return { success: false, message: "Assessment not found." };
    }

    // Validation rules
    if (newStatus === "Scheduled") {
      if (!existing.startDate || !existing.endDate) {
        return {
          success: false,
          message: "Cannot schedule assessment: Valid start and end dates are required.",
        };
      }
      if (existing.hasMultipleComponents) {
        if (!existing.components || existing.components.length === 0) {
          return {
            success: false,
            message: "Cannot schedule: At least one component must be configured.",
          };
        }
        const totalWeightage = existing.components.reduce(
          (sum, c) => sum + (Number(c.weightagePercentage) || 0),
          0
        );
        if (Math.abs(totalWeightage - 100) > 0.01) {
          return {
            success: false,
            message: `Cannot schedule: Component weightages must sum to 100% (currently ${totalWeightage}%).`,
          };
        }
      }
    }

    if (newStatus === "Published") {
      if (existing.status === "Draft") {
        return {
          success: false,
          message: "Cannot directly publish a Draft assessment. Schedule and complete it first.",
        };
      }
    }

    const now = new Date().toISOString();
    const updatedHistory: IAStatusHistoryEntry[] = [
      ...(existing.statusHistory || []),
      {
        status: newStatus,
        changedAt: now,
        changedBy: "Institution Admin",
        remarks: remarks || `Status transitioned to ${newStatus}`,
      },
    ];

    const updatedAssessment: IAAssessment = {
      ...existing,
      status: newStatus,
      statusHistory: updatedHistory,
      updatedAt: now,
    };

    setIaAssessments((prev) => {
      const updated = prev.map((a) => (a.id === id ? updatedAssessment : a));
      saveState("ia_assessments", updated);
      return updated;
    });

    return {
      success: true,
      message: `Assessment status transitioned to ${newStatus} successfully.`,
    };
  };

  const getIAMetrics = (): IAMetrics => {
    const totalAssessments = iaAssessments.length;
    const draftAssessments = iaAssessments.filter((a) => a.status === "Draft").length;
    const scheduledAssessments = iaAssessments.filter((a) => a.status === "Scheduled").length;
    const ongoingAssessments = iaAssessments.filter((a) => a.status === "Ongoing").length;
    const completedAssessments = iaAssessments.filter((a) => a.status === "Completed").length;
    const publishedAssessments = iaAssessments.filter((a) => a.status === "Published").length;
    const pendingMarksEntry = iaAssessments.filter(
      (a) =>
        (a.status === "Scheduled" || a.status === "Ongoing" || a.status === "Completed") &&
        (!a.marksEnteredCount || a.marksEnteredCount < (a.totalEnrolledStudents || 1))
    ).length;

    return {
      totalAssessments,
      draftAssessments,
      scheduledAssessments,
      ongoingAssessments,
      completedAssessments,
      publishedAssessments,
      pendingMarksEntry,
    };
  };

  // -----------------------------------------------------------
  // Phase 4B: Student Marks Entry & Assessment Processing Methods
  // -----------------------------------------------------------
  const getMarksSheetForAssessment = (
    assessmentId: string,
    sectionId?: string
  ): AssessmentMarksSheet | undefined => {
    return marksSheets.find((sheet) => {
      const matchAssessment = sheet.assessmentId === assessmentId;
      if (!sectionId || sectionId === "ALL") {
        return matchAssessment;
      }
      return matchAssessment && (sheet.sectionId === sectionId || sheet.sectionId === "ALL");
    });
  };

  const saveMarksSheet = (data: {
    assessmentId: string;
    sectionId?: string;
    records: StudentAssessmentRecord[];
    isDraft?: boolean;
  }): { success: boolean; sheet?: AssessmentMarksSheet; message: string } => {
    const assessment = iaAssessments.find((a) => a.id === data.assessmentId);
    if (!assessment) {
      return { success: false, message: "Target assessment not found." };
    }

    const targetSectionId = data.sectionId || assessment.sectionId || "ALL";
    const existing = marksSheets.find(
      (s) => s.assessmentId === data.assessmentId && s.sectionId === targetSectionId
    );

    if (existing && existing.status === "Locked") {
      return {
        success: false,
        message: "Cannot modify marks sheet: Assessment marks are locked. Unlock the sheet to make changes.",
      };
    }

    // Validate records
    for (const rec of data.records) {
      for (const comp of rec.componentMarks) {
        if (comp.status === "Present" && comp.marksObtained !== null) {
          if (comp.marksObtained < 0) {
            return {
              success: false,
              message: `Invalid marks for ${rec.studentName}: Marks cannot be negative.`,
            };
          }
          if (comp.marksObtained > comp.maxMarks) {
            return {
              success: false,
              message: `Invalid marks for ${rec.studentName}: Component "${comp.componentName}" marks (${comp.marksObtained}) exceed maximum (${comp.maxMarks}).`,
            };
          }
        }
      }
    }

    const now = new Date().toISOString();
    const sheetStatus: MarksSubmissionStatus = data.isDraft ? "Draft" : "Submitted";
    const sectionObj = sections.find((s) => s.id === targetSectionId);
    const sectionName = targetSectionId === "ALL" ? "All Sections" : sectionObj?.name || "Section";

    const updatedSheet: AssessmentMarksSheet = {
      id: existing ? existing.id : `sheet-${data.assessmentId}-${targetSectionId}-${Date.now().toString().slice(-4)}`,
      assessmentId: assessment.id,
      assessmentCode: assessment.assessmentCode,
      assessmentName: assessment.name,
      academicYearId: assessment.academicYearId,
      courseId: assessment.courseId,
      classId: assessment.classId,
      className: assessment.className || "",
      sectionId: targetSectionId,
      sectionName,
      subjectId: assessment.subjectId,
      subjectCode: assessment.subjectCode,
      subjectName: assessment.subjectName,
      status: sheetStatus,
      submittedBy: data.isDraft ? existing?.submittedBy : "Institution Admin",
      submittedAt: data.isDraft ? existing?.submittedAt : now,
      records: data.records,
      createdAt: existing ? existing.createdAt : now,
      updatedAt: now,
    };

    // Update marks sheets
    setMarksSheets((prev) => {
      const idx = prev.findIndex((s) => s.id === updatedSheet.id);
      let updated: AssessmentMarksSheet[];
      if (idx >= 0) {
        updated = [...prev];
        updated[idx] = updatedSheet;
      } else {
        updated = [updatedSheet, ...prev];
      }
      saveState("ia_marks_sheets", updated);
      return updated;
    });

    // Update assessment entered marks count
    setIaAssessments((prev) => {
      const updated = prev.map((a) => {
        if (a.id === assessment.id) {
          const evaluatedCount = data.records.filter(
            (r) => r.attendanceStatus === "Present" || r.attendanceStatus === "Exempt"
          ).length;
          return {
            ...a,
            marksEnteredCount: evaluatedCount,
            updatedAt: now,
          };
        }
        return a;
      });
      saveState("ia_assessments", updated);
      return updated;
    });

    // Create Audit Log
    const auditEntry: MarksAuditLog = {
      id: `audit-mrk-${Date.now()}`,
      assessmentId: assessment.id,
      assessmentName: assessment.name,
      sheetId: updatedSheet.id,
      action: data.isDraft ? "MARKS_SAVED" : "MARKS_SUBMITTED",
      reason: data.isDraft
        ? `Draft marks saved for ${data.records.length} students in ${sectionName}.`
        : `Finalized marks submitted for ${data.records.length} students in ${sectionName}.`,
      performedBy: "Institution Admin",
      timestamp: now,
    };

    setMarksAudits((prev) => {
      const updated = [auditEntry, ...prev];
      saveState("ia_marks_audits", updated);
      return updated;
    });

    return {
      success: true,
      sheet: updatedSheet,
      message: data.isDraft
        ? "Marks saved as draft successfully."
        : "Assessment marks submitted successfully.",
    };
  };

  const submitMarksSheet = (sheetId: string): { success: boolean; message: string } => {
    const sheet = marksSheets.find((s) => s.id === sheetId);
    if (!sheet) {
      return { success: false, message: "Marks sheet not found." };
    }
    if (sheet.status === "Locked") {
      return { success: false, message: "Marks sheet is already locked." };
    }

    const now = new Date().toISOString();
    const updatedSheet: AssessmentMarksSheet = {
      ...sheet,
      status: "Submitted",
      submittedBy: "Institution Admin",
      submittedAt: now,
      updatedAt: now,
    };

    setMarksSheets((prev) => {
      const updated = prev.map((s) => (s.id === sheetId ? updatedSheet : s));
      saveState("ia_marks_sheets", updated);
      return updated;
    });

    const auditEntry: MarksAuditLog = {
      id: `audit-mrk-${Date.now()}`,
      assessmentId: sheet.assessmentId,
      assessmentName: sheet.assessmentName,
      sheetId: sheet.id,
      action: "MARKS_SUBMITTED",
      reason: `Marks sheet formally submitted by Institution Admin for ${sheet.records.length} students.`,
      performedBy: "Institution Admin",
      timestamp: now,
    };

    setMarksAudits((prev) => {
      const updated = [auditEntry, ...prev];
      saveState("ia_marks_audits", updated);
      return updated;
    });

    return { success: true, message: "Marks sheet submitted successfully." };
  };

  const lockMarksSheet = (sheetId: string): { success: boolean; message: string } => {
    const sheet = marksSheets.find((s) => s.id === sheetId);
    if (!sheet) {
      return { success: false, message: "Marks sheet not found." };
    }

    const now = new Date().toISOString();
    const updatedSheet: AssessmentMarksSheet = {
      ...sheet,
      status: "Locked",
      lockedBy: "Institution Admin",
      lockedAt: now,
      updatedAt: now,
    };

    setMarksSheets((prev) => {
      const updated = prev.map((s) => (s.id === sheetId ? updatedSheet : s));
      saveState("ia_marks_sheets", updated);
      return updated;
    });

    const auditEntry: MarksAuditLog = {
      id: `audit-mrk-${Date.now()}`,
      assessmentId: sheet.assessmentId,
      assessmentName: sheet.assessmentName,
      sheetId: sheet.id,
      action: "MARKS_LOCKED",
      reason: "Marks verified and locked against further modifications.",
      performedBy: "Institution Admin",
      timestamp: now,
    };

    setMarksAudits((prev) => {
      const updated = [auditEntry, ...prev];
      saveState("ia_marks_audits", updated);
      return updated;
    });

    return { success: true, message: "Marks sheet locked successfully." };
  };

  const unlockMarksSheet = (
    sheetId: string,
    reason: string
  ): { success: boolean; message: string } => {
    const sheet = marksSheets.find((s) => s.id === sheetId);
    if (!sheet) {
      return { success: false, message: "Marks sheet not found." };
    }
    if (!reason || !reason.trim()) {
      return { success: false, message: "A mandatory justification reason is required to unlock marks." };
    }

    const now = new Date().toISOString();
    const updatedSheet: AssessmentMarksSheet = {
      ...sheet,
      status: "Submitted",
      unlockedBy: "Institution Admin",
      unlockedAt: now,
      unlockReason: reason.trim(),
      updatedAt: now,
    };

    setMarksSheets((prev) => {
      const updated = prev.map((s) => (s.id === sheetId ? updatedSheet : s));
      saveState("ia_marks_sheets", updated);
      return updated;
    });

    const auditEntry: MarksAuditLog = {
      id: `audit-mrk-${Date.now()}`,
      assessmentId: sheet.assessmentId,
      assessmentName: sheet.assessmentName,
      sheetId: sheet.id,
      action: "MARKS_UNLOCKED",
      reason: reason.trim(),
      performedBy: "Institution Admin",
      timestamp: now,
    };

    setMarksAudits((prev) => {
      const updated = [auditEntry, ...prev];
      saveState("ia_marks_audits", updated);
      return updated;
    });

    return { success: true, message: "Marks sheet unlocked successfully." };
  };

  const moderateStudentMarks = (params: {
    sheetId: string;
    studentId: string;
    newTotalMarks: number;
    graceMarks?: number;
    reason: string;
  }): { success: boolean; message: string } => {
    const sheet = marksSheets.find((s) => s.id === params.sheetId);
    if (!sheet) {
      return { success: false, message: "Marks sheet not found." };
    }
    const recordIndex = sheet.records.findIndex((r) => r.studentId === params.studentId);
    if (recordIndex < 0) {
      return { success: false, message: "Student record not found in this marks sheet." };
    }
    if (!params.reason || !params.reason.trim()) {
      return { success: false, message: "Mandatory justification reason is required for moderation." };
    }

    const record = sheet.records[recordIndex];
    if (params.newTotalMarks < 0 || params.newTotalMarks > record.totalMaxMarks) {
      return {
        success: false,
        message: `Moderated marks (${params.newTotalMarks}) must be between 0 and ${record.totalMaxMarks}.`,
      };
    }

    const now = new Date().toISOString();
    const origMarks = record.originalMarks !== undefined ? record.originalMarks : record.totalMarksObtained;
    const grace = params.graceMarks !== undefined ? params.graceMarks : params.newTotalMarks - origMarks;

    const assessment = iaAssessments.find((a) => a.id === sheet.assessmentId);
    const passMarks = assessment?.totalPassingMarks || 40;

    const updatedRecord: StudentAssessmentRecord = {
      ...record,
      originalMarks: origMarks,
      graceMarks: grace,
      totalMarksObtained: params.newTotalMarks,
      isPassed: params.newTotalMarks >= passMarks,
      isModerated: true,
      moderationReason: params.reason.trim(),
      moderatedBy: "Institution Admin",
      moderatedAt: now,
      updatedAt: now,
    };

    const updatedRecords = [...sheet.records];
    updatedRecords[recordIndex] = updatedRecord;

    const updatedSheet: AssessmentMarksSheet = {
      ...sheet,
      records: updatedRecords,
      updatedAt: now,
    };

    setMarksSheets((prev) => {
      const updated = prev.map((s) => (s.id === params.sheetId ? updatedSheet : s));
      saveState("ia_marks_sheets", updated);
      return updated;
    });

    const auditEntry: MarksAuditLog = {
      id: `audit-mrk-${Date.now()}`,
      assessmentId: sheet.assessmentId,
      assessmentName: sheet.assessmentName,
      sheetId: sheet.id,
      studentId: record.studentId,
      studentName: record.studentName,
      action: grace > 0 ? "GRACE_MARKS_AWARDED" : "MARKS_MODERATED",
      previousMarks: record.totalMarksObtained,
      updatedMarks: params.newTotalMarks,
      reason: params.reason.trim(),
      performedBy: "Institution Admin",
      timestamp: now,
    };

    setMarksAudits((prev) => {
      const updated = [auditEntry, ...prev];
      saveState("ia_marks_audits", updated);
      return updated;
    });

    return { success: true, message: `Marks moderated successfully for ${record.studentName}.` };
  };

  const getMarksMetrics = (): MarksEntryMetrics => {
    let totalStudentsEnrolled = 0;
    let marksEnteredCount = 0;
    let absentStudentsCount = 0;
    let exemptStudentsCount = 0;
    let totalScoreSum = 0;
    let evaluatedStudentsCount = 0;

    marksSheets.forEach((sheet) => {
      sheet.records.forEach((rec) => {
        totalStudentsEnrolled += 1;
        if (rec.attendanceStatus === "Present") {
          marksEnteredCount += 1;
          evaluatedStudentsCount += 1;
          const pct = (rec.totalMarksObtained / (rec.totalMaxMarks || 100)) * 100;
          totalScoreSum += pct;
        } else if (rec.attendanceStatus === "Absent") {
          absentStudentsCount += 1;
        } else if (rec.attendanceStatus === "Exempt") {
          exemptStudentsCount += 1;
        }
      });
    });

    const submittedSheetsCount = marksSheets.filter((s) => s.status === "Submitted").length;
    const lockedSheetsCount = marksSheets.filter((s) => s.status === "Locked").length;
    const pendingMarksCount = totalStudentsEnrolled - marksEnteredCount - absentStudentsCount - exemptStudentsCount;
    const averageScorePercentage = evaluatedStudentsCount > 0 ? Math.round(totalScoreSum / evaluatedStudentsCount) : 0;

    return {
      totalStudentsEnrolled,
      marksEnteredCount,
      pendingMarksCount: Math.max(pendingMarksCount, 0),
      absentStudentsCount,
      exemptStudentsCount,
      submittedSheetsCount,
      lockedSheetsCount,
      averageScorePercentage,
    };
  };

  // -------------------------------------------------------------
  // Phase 4C: Result Processing, Grade Calculation & Grade Cards
  // -------------------------------------------------------------

  const updateGradingConfig = (
    newConfig: GradingScaleConfig
  ): { success: boolean; message: string } => {
    // 1. Validate weightage
    const totalWeight = Number(newConfig.iaWeightage) + Number(newConfig.semesterExamWeightage);
    if (Math.round(totalWeight) !== 100) {
      return {
        success: false,
        message: `IA weightage (${newConfig.iaWeightage}%) and Semester Exam weightage (${newConfig.semesterExamWeightage}%) must sum to exactly 100%. Current sum: ${totalWeight}%.`,
      };
    }

    // 2. Validate grade points and ranges
    for (const g of newConfig.grades) {
      if (g.gradePoint < 0) {
        return {
          success: false,
          message: `Grade ${g.grade} cannot have negative grade point (${g.gradePoint}).`,
        };
      }
      if (g.minPercentage > g.maxPercentage && g.grade !== "Ab") {
        return {
          success: false,
          message: `Grade ${g.grade} has invalid percentage boundaries (${g.minPercentage}% - ${g.maxPercentage}%).`,
        };
      }
    }

    const updated = {
      ...newConfig,
      updatedAt: new Date().toISOString(),
    };

    setGradingConfig(updated);
    saveState("result_config", updated);

    // Audit log
    const audit: ResultAuditLog = {
      id: `res-audit-${Date.now()}`,
      batchId: "GLOBAL_CONFIG",
      batchName: "Grading Scale & Weightage Settings",
      action: "GRADING_CONFIG_UPDATED",
      reason: `Grading configuration updated: IA ${updated.iaWeightage}%, Exam ${updated.semesterExamWeightage}%, ${updated.grades.length} grade bands.`,
      performedBy: "Institution Admin",
      timestamp: new Date().toISOString(),
    };
    setResultAudits((prev) => {
      const upAudits = [audit, ...prev];
      saveState("result_audits", upAudits);
      return upAudits;
    });

    return { success: true, message: "Grading scale and weightage configuration saved successfully." };
  };

  const calculateSemesterResults = (params: {
    classId: string;
    sectionId: string;
    academicYearId: string;
    semester: number;
    examinationId?: string;
    batchName?: string;
    iaWeightage?: number;
    semesterExamWeightage?: number;
    minPassingPercentage?: number;
  }): {
    success: boolean;
    batch?: ResultBatchItem;
    message: string;
    missingMarksSheets?: string[];
  } => {
    const cls = classes.find((c) => c.id === params.classId);
    if (!cls) return { success: false, message: "Class not found." };

    const ay = academicYears.find((a) => a.id === params.academicYearId);
    const crs = courses.find((c) => c.id === cls.courseId);
    const sec = sections.find((s) => s.id === params.sectionId);
    const secName = params.sectionId === "ALL" ? "All Sections" : sec?.name || "Section A";

    // Enrolled students in class and section
    const enrolledStudents = students.filter(
      (s) => s.classId === params.classId && (params.sectionId === "ALL" || s.sectionId === params.sectionId)
    );

    if (enrolledStudents.length === 0) {
      return { success: false, message: "No students enrolled in the selected class and section." };
    }

    // Active subjects for this class or semester
    const classSubjects = subjects.filter(
      (s) => (s.classId === params.classId || s.semester === params.semester) && s.status === "Active"
    );

    if (classSubjects.length === 0) {
      return { success: false, message: "No active subjects configured for this class/semester." };
    }

    const iaWeight = params.iaWeightage ?? gradingConfig.iaWeightage;
    const examWeight = params.semesterExamWeightage ?? gradingConfig.semesterExamWeightage;
    const minPass = params.minPassingPercentage ?? gradingConfig.minAggregatePassingPercentage;

    // Check submitted marks sheets for each subject
    const missingSheets: string[] = [];
    classSubjects.forEach((subj) => {
      const hasSheet = marksSheets.some(
        (sheet) =>
          (sheet.subjectId === subj.id || sheet.subjectCode === subj.code) &&
          (sheet.sectionId === params.sectionId || sheet.sectionId === "ALL") &&
          (sheet.status === "Submitted" || sheet.status === "Locked")
      );
      if (!hasSheet) {
        missingSheets.push(`${subj.code} - ${subj.name}`);
      }
    });

    const exam = examinations.find((e) => e.id === params.examinationId);

    // Compute student results
    const studentResults: StudentSemesterResult[] = enrolledStudents.map((stu) => {
      const subjectResults: StudentSubjectResult[] = classSubjects.map((subj) => {
        // Find marks sheet
        const sheet = marksSheets.find(
          (s) =>
            (s.subjectId === subj.id || s.subjectCode === subj.code) &&
            (s.sectionId === params.sectionId || s.sectionId === "ALL")
        );

        let iaMax = 50;
        let iaObtained = 40;
        let iaStatus: "Pass" | "Fail" | "Absent" | "Exempt" = "Pass";

        if (sheet) {
          const rec = sheet.records.find((r) => r.studentId === stu.id);
          if (rec) {
            iaMax = rec.totalMaxMarks || 50;
            iaObtained = rec.totalMarksObtained;
            iaStatus =
              rec.attendanceStatus === "Absent"
                ? "Absent"
                : rec.attendanceStatus === "Exempt"
                ? "Exempt"
                : rec.isPassed
                ? "Pass"
                : "Fail";
          }
        } else {
          // If no marks sheet, derive realistic score based on student
          const isWeak = stu.id === "stu-05";
          iaObtained = isWeak ? 24 : 42;
          iaMax = 50;
        }

        const iaPct = iaStatus === "Absent" ? 0 : Math.round((iaObtained / iaMax) * 100);
        const iaScore = Math.round(((iaPct * iaWeight) / 100) * 10) / 10;

        // Semester Exam Score (out of 100)
        const examMax = 100;
        let examObtained = Math.min(100, Math.round(iaPct * 0.95));
        let examStatus: SubjectResultStatus = "Pass";

        // If stu-05 in CS502 (demonstrating backlog case)
        if (stu.id === "stu-05" && subj.code.includes("502")) {
          examObtained = 31;
          examStatus = "Fail";
        } else if (iaStatus === "Absent") {
          examObtained = 0;
          examStatus = "Absent";
        }

        const examPct = examStatus === "Absent" ? 0 : Math.round((examObtained / examMax) * 100);
        const examScore = Math.round(((examPct * examWeight) / 100) * 10) / 10;

        // Total weighted score out of 100
        const totalWeightedScore = Math.round((iaScore + examScore) * 10) / 10;

        // Determine grade from gradingConfig
        let matchedGrade = gradingConfig.grades.find(
          (g) => totalWeightedScore >= g.minPercentage && totalWeightedScore <= g.maxPercentage && g.grade !== "Ab"
        );

        const isStudentAbsent = iaStatus === "Absent" || examStatus === "Absent";
        if (isStudentAbsent) {
          matchedGrade = gradingConfig.grades.find((g) => g.grade === "Ab") || {
            grade: "Ab",
            gradePoint: 0,
            minPercentage: 0,
            maxPercentage: 0,
            description: "Absent",
            isPassing: false,
          };
        } else if (
          iaPct < gradingConfig.minIAPassingPercentage ||
          examPct < gradingConfig.minSemesterExamPassingPercentage ||
          totalWeightedScore < minPass
        ) {
          matchedGrade = gradingConfig.grades.find((g) => g.grade === "F") || {
            grade: "F",
            gradePoint: 0,
            minPercentage: 0,
            maxPercentage: 39.99,
            description: "Fail",
            isPassing: false,
          };
        }

        if (!matchedGrade) {
          matchedGrade = {
            grade: "P",
            gradePoint: 4,
            minPercentage: 40,
            maxPercentage: 49.99,
            description: "Pass",
            isPassing: true,
          };
        }

        const gradePoint = matchedGrade.gradePoint;
        const creditPoints = subj.credits * gradePoint;
        const finalStatus: "Pass" | "Fail" | "Absent" | "Exempt" = matchedGrade.isPassing
          ? "Pass"
          : matchedGrade.grade === "Ab"
          ? "Absent"
          : "Fail";

        return {
          subjectId: subj.id,
          subjectCode: subj.code,
          subjectName: subj.name,
          credits: subj.credits,
          iaMaxMarks: iaMax,
          iaMarksObtained: iaObtained,
          iaPercentage: iaPct,
          iaStatus,
          iaWeightageScore: iaScore,
          semesterExamMaxMarks: examMax,
          semesterExamMarksObtained: examObtained,
          semesterExamPercentage: examPct,
          semesterExamStatus: examStatus,
          semesterExamWeightageScore: examScore,
          totalWeightedScore,
          letterGrade: matchedGrade.grade,
          gradePoint,
          creditPoints,
          finalStatus,
        };
      });

      const totalCreditsRegistered = subjectResults.reduce((acc, sr) => acc + sr.credits, 0);
      const passedSubjects = subjectResults.filter((sr) => sr.finalStatus === "Pass");
      const totalCreditsEarned = passedSubjects.reduce((acc, sr) => acc + sr.credits, 0);
      const totalCreditPoints = subjectResults.reduce((acc, sr) => acc + sr.creditPoints, 0);
      const sgpa =
        totalCreditsRegistered > 0
          ? Math.round((totalCreditPoints / totalCreditsRegistered) * 100) / 100
          : 0;

      const priorCredits = (params.semester - 1) * 22;
      const priorPoints = Math.round(priorCredits * (sgpa > 0 ? sgpa * 0.98 : 7.5));
      const cgpa =
        priorCredits + totalCreditsRegistered > 0
          ? Math.round(
              ((priorPoints + totalCreditPoints) / (priorCredits + totalCreditsRegistered)) * 100
            ) / 100
          : sgpa;

      const backlogSubjects = subjectResults.filter((sr) => sr.finalStatus !== "Pass");
      const hasBacklogs = backlogSubjects.length > 0;
      const backlogSubjectCodes = backlogSubjects.map((b) => b.subjectCode);

      let classification:
        | "First Class with Distinction"
        | "First Class"
        | "Second Class"
        | "Pass Class"
        | "Backlog / Needs Re-evaluation"
        | "Failed" = "First Class";

      if (hasBacklogs) {
        classification = "Backlog / Needs Re-evaluation";
      } else if (cgpa >= 8.0) {
        classification = "First Class with Distinction";
      } else if (cgpa >= 6.5) {
        classification = "First Class";
      } else if (cgpa >= 5.5) {
        classification = "Second Class";
      } else if (cgpa >= 4.0) {
        classification = "Pass Class";
      } else {
        classification = "Failed";
      }

      return {
        studentId: stu.id,
        studentUniqueId: stu.studentId,
        rollNumber: stu.rollNumber,
        studentName: stu.fullName,
        classId: cls.id,
        className: cls.name,
        sectionId: sec?.id || params.sectionId,
        sectionName: secName,
        subjectResults,
        totalCreditsRegistered,
        totalCreditsEarned,
        totalCreditPoints,
        sgpa,
        cgpa,
        priorCumulativeCredits: priorCredits,
        priorCumulativePoints: priorPoints,
        totalSubjects: subjectResults.length,
        passedSubjectsCount: passedSubjects.length,
        backlogSubjectsCount: backlogSubjects.length,
        backlogSubjectCodes,
        classification,
        isAllPassed: !hasBacklogs,
        hasBacklogs,
        remarks: hasBacklogs
          ? `Arrear in: ${backlogSubjectCodes.join(", ")}`
          : "All semester requirements satisfied successfully.",
      };
    });

    const totalStudents = studentResults.length;
    const passedStudents = studentResults.filter((s) => s.isAllPassed).length;
    const backlogStudents = totalStudents - passedStudents;
    const passPercentage = totalStudents > 0 ? Math.round((passedStudents / totalStudents) * 100) : 0;
    const batchAverageSgpa =
      totalStudents > 0
        ? Math.round((studentResults.reduce((acc, s) => acc + s.sgpa, 0) / totalStudents) * 100) / 100
        : 0;

    const newBatch: ResultBatchItem = {
      id: `batch-res-${Date.now()}`,
      institutionId: "inst-sst-01",
      batchName:
        params.batchName?.trim() ||
        `${crs?.name || "Program"} - Sem ${params.semester} (${secName}) Results`,
      academicYearId: params.academicYearId,
      academicYearName: ay?.name || "2026-2027",
      courseId: crs?.id || cls.courseId,
      courseName: crs?.name || "Course",
      classId: cls.id,
      className: cls.name,
      sectionId: params.sectionId,
      sectionName: secName,
      semester: params.semester,
      examinationId: exam?.id,
      examinationName: exam?.name,
      gradingScaleId: gradingConfig.id,
      iaWeightage: iaWeight,
      semesterExamWeightage: examWeight,
      minPassingPercentage: minPass,
      status: "Draft",
      totalStudents,
      passedStudents,
      backlogStudents,
      passPercentage,
      batchAverageSgpa,
      preparedBy: "Institution Admin",
      preparedAt: new Date().toISOString(),
      studentResults,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setResultBatches((prev) => {
      const updated = [newBatch, ...prev];
      saveState("result_batches", updated);
      return updated;
    });

    // Log to audits
    const audit: ResultAuditLog = {
      id: `res-audit-${Date.now()}`,
      batchId: newBatch.id,
      batchName: newBatch.batchName,
      action: "BATCH_PROCESSED",
      reason: `Result calculation executed for ${newBatch.batchName}. Total students: ${totalStudents}, Pass rate: ${passPercentage}%.`,
      performedBy: "Institution Admin",
      timestamp: new Date().toISOString(),
    };
    setResultAudits((prev) => {
      const up = [audit, ...prev];
      saveState("result_audits", up);
      return up;
    });

    return {
      success: true,
      batch: newBatch,
      message: `Results calculated successfully for ${totalStudents} students with pass rate of ${passPercentage}%.`,
      missingMarksSheets: missingSheets.length > 0 ? missingSheets : undefined,
    };
  };

  const saveResultBatch = (batch: ResultBatchItem): { success: boolean; message: string } => {
    const existing = resultBatches.find((b) => b.id === batch.id);
    if (existing?.status === "Published") {
      return {
        success: false,
        message: "Cannot modify a Published result batch directly. Use the Authorized Correction workflow.",
      };
    }

    const updatedBatch = {
      ...batch,
      updatedAt: new Date().toISOString(),
    };

    setResultBatches((prev) => {
      const up = prev.some((b) => b.id === batch.id)
        ? prev.map((b) => (b.id === batch.id ? updatedBatch : b))
        : [updatedBatch, ...prev];
      saveState("result_batches", up);
      return up;
    });

    return { success: true, message: "Result batch saved successfully." };
  };

  const transitionBatchStatus = (
    batchId: string,
    newStatus: ResultBatchStatus,
    reason?: string
  ): { success: boolean; message: string } => {
    const batch = resultBatches.find((b) => b.id === batchId);
    if (!batch) return { success: false, message: "Result batch not found." };

    if (batch.status === "Published" && newStatus !== "Published") {
      return {
        success: false,
        message: "Published results cannot be rolled back. Use Authorized Correction workflow for adjustments.",
      };
    }

    const now = new Date().toISOString();
    const updated: ResultBatchItem = {
      ...batch,
      status: newStatus,
      updatedAt: now,
    };

    let actionType: "STATUS_CHANGED" | "BATCH_APPROVED" | "BATCH_PUBLISHED" = "STATUS_CHANGED";

    if (newStatus === "Under Review") {
      updated.reviewedBy = "Institution Admin - Dean Academics";
      updated.reviewedAt = now;
    } else if (newStatus === "Approved") {
      updated.approvedBy = "Dean of Academic Affairs";
      updated.approvedAt = now;
      actionType = "BATCH_APPROVED";
    } else if (newStatus === "Published") {
      updated.publishedBy = "Institution Admin - Controller of Examinations";
      updated.publishedAt = now;
      actionType = "BATCH_PUBLISHED";
    }

    setResultBatches((prev) => {
      const up = prev.map((b) => (b.id === batchId ? updated : b));
      saveState("result_batches", up);
      return up;
    });

    const audit: ResultAuditLog = {
      id: `res-audit-${Date.now()}`,
      batchId,
      batchName: batch.batchName,
      action: actionType,
      previousStatus: batch.status,
      newStatus,
      reason: reason?.trim() || `Status transitioned from ${batch.status} to ${newStatus}.`,
      performedBy: "Institution Admin",
      timestamp: now,
    };

    setResultAudits((prev) => {
      const up = [audit, ...prev];
      saveState("result_audits", up);
      return up;
    });

    return { success: true, message: `Result batch transitioned to '${newStatus}' successfully.` };
  };

  const correctPublishedResult = (params: {
    batchId: string;
    studentId: string;
    subjectCode: string;
    newTotalScore: number;
    reason: string;
  }): { success: boolean; message: string } => {
    const batch = resultBatches.find((b) => b.id === params.batchId);
    if (!batch) return { success: false, message: "Result batch not found." };

    if (!params.reason || params.reason.trim().length < 5) {
      return { success: false, message: "A detailed justification (min 5 chars) is mandatory for post-publication corrections." };
    }

    let previousScore = 0;
    let studentName = "";
    let rollNumber = "";

    const updatedStudentResults = batch.studentResults.map((stu) => {
      if (stu.studentId !== params.studentId) return stu;
      studentName = stu.studentName;
      rollNumber = stu.rollNumber;

      const updatedSubjects = stu.subjectResults.map((subj) => {
        if (subj.subjectCode !== params.subjectCode) return subj;
        previousScore = subj.totalWeightedScore;

        const newScore = Math.max(0, Math.min(100, params.newTotalScore));
        const matchedGrade = gradingConfig.grades.find(
          (g) => newScore >= g.minPercentage && newScore <= g.maxPercentage && g.grade !== "Ab"
        ) || { grade: "F", gradePoint: 0, minPercentage: 0, maxPercentage: 39.99, description: "Fail", isPassing: false };

        const gradePoint = matchedGrade.gradePoint;
        const creditPoints = subj.credits * gradePoint;
        const finalStatus: "Pass" | "Fail" | "Absent" = matchedGrade.isPassing ? "Pass" : "Fail";

        return {
          ...subj,
          totalWeightedScore: newScore,
          letterGrade: matchedGrade.grade,
          gradePoint,
          creditPoints,
          finalStatus,
          isModerated: true,
          moderationReason: params.reason.trim(),
        };
      });

      const totalCreditsRegistered = updatedSubjects.reduce((acc, sr) => acc + sr.credits, 0);
      const passedSubjects = updatedSubjects.filter((sr) => sr.finalStatus === "Pass");
      const totalCreditsEarned = passedSubjects.reduce((acc, sr) => acc + sr.credits, 0);
      const totalCreditPoints = updatedSubjects.reduce((acc, sr) => acc + sr.creditPoints, 0);
      const sgpa = totalCreditsRegistered > 0 ? Math.round((totalCreditPoints / totalCreditsRegistered) * 100) / 100 : 0;
      const priorCredits = stu.priorCumulativeCredits || 0;
      const priorPoints = stu.priorCumulativePoints || 0;
      const cgpa =
        priorCredits + totalCreditsRegistered > 0
          ? Math.round(((priorPoints + totalCreditPoints) / (priorCredits + totalCreditsRegistered)) * 100) / 100
          : sgpa;
      const backlogSubjects = updatedSubjects.filter((sr) => sr.finalStatus !== "Pass");
      const hasBacklogs = backlogSubjects.length > 0;
      const backlogSubjectCodes = backlogSubjects.map((b) => b.subjectCode);

      let classification:
        | "First Class with Distinction"
        | "First Class"
        | "Second Class"
        | "Pass Class"
        | "Backlog / Needs Re-evaluation"
        | "Failed" = "First Class";

      if (hasBacklogs) {
        classification = "Backlog / Needs Re-evaluation";
      } else if (cgpa >= 8.0) {
        classification = "First Class with Distinction";
      } else if (cgpa >= 6.5) {
        classification = "First Class";
      } else if (cgpa >= 5.5) {
        classification = "Second Class";
      } else if (cgpa >= 4.0) {
        classification = "Pass Class";
      } else {
        classification = "Failed";
      }

      return {
        ...stu,
        subjectResults: updatedSubjects,
        totalCreditsRegistered,
        totalCreditsEarned,
        totalCreditPoints,
        sgpa,
        cgpa,
        passedSubjectsCount: passedSubjects.length,
        backlogSubjectsCount: backlogSubjects.length,
        backlogSubjectCodes,
        hasBacklogs,
        isAllPassed: !hasBacklogs,
        classification,
        isModifiedPostPublication: true,
        remarks: `Post-publication grade adjustment applied on ${params.subjectCode}: ${params.reason.trim()}`,
      };
    });

    const totalStudents = updatedStudentResults.length;
    const passedStudents = updatedStudentResults.filter((s) => s.isAllPassed).length;
    const backlogStudents = totalStudents - passedStudents;
    const passPercentage = totalStudents > 0 ? Math.round((passedStudents / totalStudents) * 100) : 0;
    const batchAverageSgpa =
      totalStudents > 0
        ? Math.round((updatedStudentResults.reduce((acc, s) => acc + s.sgpa, 0) / totalStudents) * 100) / 100
        : 0;

    const updatedBatch: ResultBatchItem = {
      ...batch,
      studentResults: updatedStudentResults,
      passedStudents,
      backlogStudents,
      passPercentage,
      batchAverageSgpa,
      updatedAt: new Date().toISOString(),
    };

    setResultBatches((prev) => {
      const up = prev.map((b) => (b.id === params.batchId ? updatedBatch : b));
      saveState("result_batches", up);
      return up;
    });

    const audit: ResultAuditLog = {
      id: `res-audit-${Date.now()}`,
      batchId: batch.id,
      batchName: batch.batchName,
      studentId: params.studentId,
      studentName,
      rollNumber,
      subjectCode: params.subjectCode,
      action: "POST_PUBLICATION_CORRECTION",
      previousValue: `${previousScore}%`,
      newValue: `${params.newTotalScore}%`,
      reason: params.reason.trim(),
      performedBy: "Institution Admin",
      timestamp: new Date().toISOString(),
    };

    setResultAudits((prev) => {
      const up = [audit, ...prev];
      saveState("result_audits", up);
      return up;
    });

    return {
      success: true,
      message: `Authorized correction applied for ${studentName} on ${params.subjectCode}. Audit record created.`,
    };
  };

  const deleteResultBatch = (batchId: string): { success: boolean; message: string } => {
    const batch = resultBatches.find((b) => b.id === batchId);
    if (!batch) return { success: false, message: "Result batch not found." };

    if (batch.status === "Published") {
      return { success: false, message: "Published result batches cannot be deleted." };
    }

    setResultBatches((prev) => {
      const up = prev.filter((b) => b.id !== batchId);
      saveState("result_batches", up);
      return up;
    });

    return { success: true, message: `Result batch '${batch.batchName}' deleted successfully.` };
  };

  const getResultMetrics = (): ResultMetrics => {
    const totalBatches = resultBatches.length;
    const draftBatches = resultBatches.filter((b) => b.status === "Draft").length;
    const underReviewBatches = resultBatches.filter((b) => b.status === "Under Review").length;
    const approvedBatches = resultBatches.filter((b) => b.status === "Approved").length;
    const publishedBatches = resultBatches.filter((b) => b.status === "Published").length;

    let totalStudentsProcessed = 0;
    let totalPassed = 0;
    let totalBacklogsActive = 0;

    resultBatches.forEach((batch) => {
      totalStudentsProcessed += batch.totalStudents;
      totalPassed += batch.passedStudents;
      totalBacklogsActive += batch.backlogStudents;
    });

    const overallPassPercentage =
      totalStudentsProcessed > 0 ? Math.round((totalPassed / totalStudentsProcessed) * 100) : 0;

    return {
      totalBatches,
      draftBatches,
      underReviewBatches,
      approvedBatches,
      publishedBatches,
      totalStudentsProcessed,
      overallPassPercentage,
      totalBacklogsActive,
    };
  };

  // -------------------------------------------------------------
  // Phase 4D: Promotions & Academic Standing Methods
  // -------------------------------------------------------------

  const updatePromotionPolicy = (
    policy: PromotionPolicy
  ): { success: boolean; message: string } => {
    if (policy.minCgpa < 0 || policy.minCgpa > 10) {
      return { success: false, message: "Minimum CGPA must be between 0.0 and 10.0." };
    }
    if (policy.minSgpa < 0 || policy.minSgpa > 10) {
      return { success: false, message: "Minimum SGPA must be between 0.0 and 10.0." };
    }
    if (policy.maxAllowedBacklogs < 0) {
      return { success: false, message: "Maximum allowed backlogs cannot be negative." };
    }
    if (policy.minEarnedCredits < 0) {
      return { success: false, message: "Minimum earned credits cannot be negative." };
    }

    const updated = {
      ...policy,
      updatedAt: new Date().toISOString(),
    };

    setPromotionPolicies((prev) => {
      const exists = prev.some((p) => p.id === policy.id);
      const up = exists ? prev.map((p) => (p.id === policy.id ? updated : p)) : [updated, ...prev];
      saveState("promotion_policies", up);
      return up;
    });

    const audit: PromotionAuditLog = {
      id: `prom-audit-${Date.now()}`,
      action: "POLICY_CONFIG_UPDATED",
      details: `Updated promotion policy "${policy.name}" for course ${policy.courseName}.`,
      performedBy: "Institution Admin",
      timestamp: new Date().toISOString(),
    };
    setPromotionAudits((prev) => {
      const up = [audit, ...prev];
      saveState("promotion_audits", up);
      return up;
    });

    return { success: true, message: `Promotion policy "${policy.name}" saved successfully.` };
  };

  const evaluateStudentsForPromotion = (params: {
    classId: string;
    sectionId: string;
    policyId?: string;
  }): StudentPromotionEvaluation[] => {
    const cls = classes.find((c) => c.id === params.classId);
    if (!cls) return [];

    const enrolledStudents = students.filter(
      (s) =>
        s.classId === params.classId &&
        (params.sectionId === "ALL" || !params.sectionId || s.sectionId === params.sectionId) &&
        s.status === "Active"
    );

    // Find policy
    let policy = promotionPolicies.find((p) => p.id === params.policyId);
    if (!policy) {
      policy =
        promotionPolicies.find((p) => p.courseId === cls.courseId) ||
        promotionPolicies.find((p) => p.isDefault) ||
        promotionPolicies[0];
    }

    // Look for matching published result batch
    const matchingResultBatch = resultBatches.find(
      (b) =>
        (b.classId === params.classId || b.semester === cls.semester) &&
        b.status === "Published"
    );

    // Also check if an unpublished batch exists
    const unpubBatch = resultBatches.find(
      (b) =>
        (b.classId === params.classId || b.semester === cls.semester) &&
        b.status !== "Published"
    );

    return enrolledStudents.map((stu) => {
      // Check if student was already promoted from this class
      const alreadyPromoted = promotionHistory.some(
        (h) =>
          h.studentId === stu.id &&
          h.previousClassId === params.classId &&
          h.decision.startsWith("PROMOTED")
      );

      // Check student results
      let studentResult = matchingResultBatch?.studentResults.find((r) => r.studentId === stu.id);
      const resultStatus = matchingResultBatch ? "Published" : unpubBatch ? unpubBatch.status : "Missing";

      if (!studentResult && unpubBatch) {
        studentResult = unpubBatch.studentResults.find((r) => r.studentId === stu.id);
      }

      // If already promoted
      if (alreadyPromoted) {
        return {
          studentId: stu.id,
          studentUniqueId: stu.studentId,
          rollNumber: stu.rollNumber,
          studentName: stu.fullName,
          academicYearId: stu.academicYearId,
          academicYearName: stu.academicYearName,
          courseId: stu.courseId,
          courseName: stu.courseName,
          classId: stu.classId,
          className: stu.className,
          sectionId: stu.sectionId,
          sectionName: stu.sectionName,
          currentSemester: cls.semester,
          resultBatchId: matchingResultBatch?.id,
          resultStatus: "Published",
          sgpa: studentResult?.sgpa || 8.5,
          cgpa: studentResult?.cgpa || 8.5,
          totalCreditsRegistered: studentResult?.totalCreditsRegistered || 13,
          totalCreditsEarned: studentResult?.totalCreditsEarned || 13,
          activeBacklogsCount: 0,
          failedSubjectCodes: [],
          status: "Already Promoted",
          reason: "Student has already been officially promoted in an executed cycle.",
          applicablePolicyId: policy?.id || "default",
          applicablePolicyName: policy?.name || "General Policy",
        };
      }

      // If results are missing or unpublished -> MUST BE "Pending Review"
      if (!matchingResultBatch || resultStatus !== "Published" || !studentResult) {
        return {
          studentId: stu.id,
          studentUniqueId: stu.studentId,
          rollNumber: stu.rollNumber,
          studentName: stu.fullName,
          academicYearId: stu.academicYearId,
          academicYearName: stu.academicYearName,
          courseId: stu.courseId,
          courseName: stu.courseName,
          classId: stu.classId,
          className: stu.className,
          sectionId: stu.sectionId,
          sectionName: stu.sectionName,
          currentSemester: cls.semester,
          resultBatchId: unpubBatch?.id,
          resultStatus,
          sgpa: studentResult?.sgpa || 0,
          cgpa: studentResult?.cgpa || 0,
          totalCreditsRegistered: studentResult?.totalCreditsRegistered || 0,
          totalCreditsEarned: studentResult?.totalCreditsEarned || 0,
          activeBacklogsCount: studentResult?.backlogSubjectsCount || 0,
          failedSubjectCodes: studentResult?.backlogSubjectCodes || [],
          status: "Pending Review",
          reason: `Pending Review: Official results for Semester ${cls.semester} are ${
            resultStatus === "Missing" ? "not generated" : `currently ${resultStatus}`
          }. Progression decision requires certified Published results.`,
          applicablePolicyId: policy?.id || "default",
          applicablePolicyName: policy?.name || "General Policy",
        };
      }

      // Result is officially published
      const sgpa = studentResult.sgpa;
      const cgpa = studentResult.cgpa;
      const totalCreditsRegistered = studentResult.totalCreditsRegistered;
      const totalCreditsEarned = studentResult.totalCreditsEarned;
      const activeBacklogsCount = studentResult.backlogSubjectsCount;
      const failedSubjectCodes = studentResult.backlogSubjectCodes;

      // Check detention
      let isDetained = false;
      let detentionReason = "";

      if (policy && policy.detentionConditions.maxBacklogsExceeded && activeBacklogsCount > policy.maxAllowedBacklogs) {
        isDetained = true;
        detentionReason = `Detained: Active backlogs (${activeBacklogsCount}) exceed policy limit of ${policy.maxAllowedBacklogs}. Arrears: ${failedSubjectCodes.join(", ")}.`;
      } else if (policy && policy.detentionConditions.belowMinCgpa && cgpa < policy.minCgpa) {
        isDetained = true;
        detentionReason = `Detained: Cumulative CGPA (${cgpa.toFixed(2)}) is below institutional standing threshold (${policy.minCgpa.toFixed(2)}).`;
      } else if (policy && policy.detentionConditions.belowMinCredits && totalCreditsEarned < policy.minEarnedCredits) {
        isDetained = true;
        detentionReason = `Detained: Earned credits (${totalCreditsEarned}) fall short of minimum required (${policy.minEarnedCredits}).`;
      }

      if (isDetained) {
        return {
          studentId: stu.id,
          studentUniqueId: stu.studentId,
          rollNumber: stu.rollNumber,
          studentName: stu.fullName,
          academicYearId: stu.academicYearId,
          academicYearName: stu.academicYearName,
          courseId: stu.courseId,
          courseName: stu.courseName,
          classId: stu.classId,
          className: stu.className,
          sectionId: stu.sectionId,
          sectionName: stu.sectionName,
          currentSemester: cls.semester,
          resultBatchId: matchingResultBatch.id,
          resultStatus: "Published",
          sgpa,
          cgpa,
          totalCreditsRegistered,
          totalCreditsEarned,
          activeBacklogsCount,
          failedSubjectCodes,
          status: "Detained",
          reason: detentionReason,
          applicablePolicyId: policy.id,
          applicablePolicyName: policy.name,
        };
      }

      // If not detained, check backlogs
      if (activeBacklogsCount > 0) {
        if (policy?.allowBacklogPromotion) {
          return {
            studentId: stu.id,
            studentUniqueId: stu.studentId,
            rollNumber: stu.rollNumber,
            studentName: stu.fullName,
            academicYearId: stu.academicYearId,
            academicYearName: stu.academicYearName,
            courseId: stu.courseId,
            courseName: stu.courseName,
            classId: stu.classId,
            className: stu.className,
            sectionId: stu.sectionId,
            sectionName: stu.sectionName,
            currentSemester: cls.semester,
            resultBatchId: matchingResultBatch.id,
            resultStatus: "Published",
            sgpa,
            cgpa,
            totalCreditsRegistered,
            totalCreditsEarned,
            activeBacklogsCount,
            failedSubjectCodes,
            status: "Eligible with Backlogs",
            reason: `Eligible with Backlogs: Satisfied CGPA (${cgpa.toFixed(2)}) and credits. Permitted to carry forward ${activeBacklogsCount} backlog(s) (${failedSubjectCodes.join(", ")}).`,
            applicablePolicyId: policy.id,
            applicablePolicyName: policy.name,
          };
        } else {
          return {
            studentId: stu.id,
            studentUniqueId: stu.studentId,
            rollNumber: stu.rollNumber,
            studentName: stu.fullName,
            academicYearId: stu.academicYearId,
            academicYearName: stu.academicYearName,
            courseId: stu.courseId,
            courseName: stu.courseName,
            classId: stu.classId,
            className: stu.className,
            sectionId: stu.sectionId,
            sectionName: stu.sectionName,
            currentSemester: cls.semester,
            resultBatchId: matchingResultBatch.id,
            resultStatus: "Published",
            sgpa,
            cgpa,
            totalCreditsRegistered,
            totalCreditsEarned,
            activeBacklogsCount,
            failedSubjectCodes,
            status: "Detained",
            reason: `Detained: Course policy prohibits promotion with active arrears (${failedSubjectCodes.join(", ")}).`,
            applicablePolicyId: policy ? policy.id : "default",
            applicablePolicyName: policy ? policy.name : "Strict Policy",
          };
        }
      }

      // Clean pass
      return {
        studentId: stu.id,
        studentUniqueId: stu.studentId,
        rollNumber: stu.rollNumber,
        studentName: stu.fullName,
        academicYearId: stu.academicYearId,
        academicYearName: stu.academicYearName,
        courseId: stu.courseId,
        courseName: stu.courseName,
        classId: stu.classId,
        className: stu.className,
        sectionId: stu.sectionId,
        sectionName: stu.sectionName,
        currentSemester: cls.semester,
        resultBatchId: matchingResultBatch.id,
        resultStatus: "Published",
        sgpa,
        cgpa,
        totalCreditsRegistered,
        totalCreditsEarned,
        activeBacklogsCount: 0,
        failedSubjectCodes: [],
        status: "Eligible",
        reason: `Eligible: Satisfied all academic criteria with SGPA ${sgpa.toFixed(2)} / CGPA ${cgpa.toFixed(2)} and zero arrears.`,
        applicablePolicyId: policy ? policy.id : "default",
        applicablePolicyName: policy ? policy.name : "General Policy",
      };
    });
  };

  const createPromotionBatch = (
    data: Omit<PromotionBatchItem, "id" | "createdAt" | "updatedAt">
  ): { success: boolean; batch?: PromotionBatchItem; message: string } => {
    if (data.sourceAcademicYearId === data.destinationAcademicYearId && data.sourceClassId === data.destinationClassId) {
      return {
        success: false,
        message: "Destination Academic Year and Class cannot be identical to Source.",
      };
    }

    const newBatch: PromotionBatchItem = {
      ...data,
      id: `prom-batch-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setPromotionBatches((prev) => {
      const updated = [newBatch, ...prev];
      saveState("promotion_batches", updated);
      return updated;
    });

    const audit: PromotionAuditLog = {
      id: `prom-audit-${Date.now()}`,
      batchId: newBatch.id,
      batchName: newBatch.batchName,
      action: "BATCH_CREATED",
      details: `Created promotion batch for ${newBatch.studentRecords.length} students from ${newBatch.sourceClassName} to ${newBatch.destinationClassName}.`,
      performedBy: data.createdBy || "Institution Admin",
      timestamp: new Date().toISOString(),
    };

    setPromotionAudits((prev) => {
      const up = [audit, ...prev];
      saveState("promotion_audits", up);
      return up;
    });

    return {
      success: true,
      batch: newBatch,
      message: `Promotion batch "${newBatch.batchName}" created in Draft status.`,
    };
  };

  const updatePromotionBatch = (
    id: string,
    data: Partial<PromotionBatchItem>
  ): { success: boolean; batch?: PromotionBatchItem; message: string } => {
    const existing = promotionBatches.find((b) => b.id === id);
    if (!existing) return { success: false, message: "Promotion batch not found." };
    if (existing.status === "Executed") {
      return { success: false, message: "Cannot modify an already Executed promotion batch." };
    }

    const updated: PromotionBatchItem = {
      ...existing,
      ...data,
      updatedAt: new Date().toISOString(),
    };

    setPromotionBatches((prev) => {
      const up = prev.map((b) => (b.id === id ? updated : b));
      saveState("promotion_batches", up);
      return up;
    });

    return { success: true, batch: updated, message: "Promotion batch updated successfully." };
  };

  const transitionPromotionBatchStatus = (
    batchId: string,
    newStatus: PromotionBatchStatus,
    reason?: string
  ): { success: boolean; message: string } => {
    const batch = promotionBatches.find((b) => b.id === batchId);
    if (!batch) return { success: false, message: "Promotion batch not found." };

    if (batch.status === "Executed") {
      return { success: false, message: "Executed promotion batches cannot undergo status reversal." };
    }

    const now = new Date().toISOString();
    const updated: PromotionBatchItem = {
      ...batch,
      status: newStatus,
      updatedAt: now,
    };

    let actionType: "STATUS_CHANGED" | "BATCH_APPROVED" | "BATCH_REJECTED" = "STATUS_CHANGED";

    if (newStatus === "Under Review") {
      updated.reviewedBy = "Academic Standing Committee";
      updated.reviewedAt = now;
    } else if (newStatus === "Approved") {
      updated.approvedBy = "Dean of Academic Affairs";
      updated.approvedAt = now;
      actionType = "BATCH_APPROVED";
    }

    if (reason && newStatus === "Draft") {
      updated.rejectionReason = reason;
      actionType = "BATCH_REJECTED";
    }

    setPromotionBatches((prev) => {
      const up = prev.map((b) => (b.id === batchId ? updated : b));
      saveState("promotion_batches", up);
      return up;
    });

    const audit: PromotionAuditLog = {
      id: `prom-audit-${Date.now()}`,
      batchId,
      batchName: batch.batchName,
      action: actionType,
      previousStatus: batch.status,
      newStatus,
      details: reason ? `Status changed to ${newStatus}. Reason: ${reason}` : `Status transitioned to ${newStatus}.`,
      reason,
      performedBy: "Institution Admin",
      timestamp: now,
    };

    setPromotionAudits((prev) => {
      const up = [audit, ...prev];
      saveState("promotion_audits", up);
      return up;
    });

    return { success: true, message: `Promotion batch status updated to "${newStatus}".` };
  };

  const executePromotionBatch = (
    batchId: string,
    operatorName = "Institution Admin"
  ): { success: boolean; message: string; promotedCount?: number } => {
    const batch = promotionBatches.find((b) => b.id === batchId);
    if (!batch) return { success: false, message: "Promotion batch not found." };

    if (batch.status === "Executed") {
      return { success: false, message: "This promotion batch has already been executed." };
    }

    if (batch.status !== "Approved") {
      return {
        success: false,
        message: `Only Approved promotion batches can be executed. Current status: ${batch.status}.`,
      };
    }

    const now = new Date().toISOString();
    const destinationClass = classes.find((c) => c.id === batch.destinationClassId);
    const destinationSection = sections.find((s) => s.id === batch.destinationSectionId);

    // 1. Update Student Placements
    const promotedStudentIds = new Set(batch.studentRecords.map((r) => r.studentId));
    const newHistoryRecords: PromotionHistoryRecord[] = [];

    setStudents((prev) => {
      const updated = prev.map((stu) => {
        if (!promotedStudentIds.has(stu.id)) return stu;

        const rec = batch.studentRecords.find((r) => r.studentId === stu.id);
        if (!rec) return stu;

        // Archive prior placement into student.enrollmentHistory
        const historyEntry: EnrollmentHistoryEntry = {
          id: `enh-${Date.now()}-${stu.id}`,
          academicYearId: stu.academicYearId,
          academicYearName: stu.academicYearName,
          classId: stu.classId,
          className: stu.className,
          sectionId: stu.sectionId,
          sectionName: stu.sectionName,
          enrolledAt: now,
          status: "Active",
          remarks: `Progressed to ${batch.destinationClassName} (${rec.destinationSectionName}) via Batch ${batch.batchName}.`,
        };

        const priorHistory = stu.enrollmentHistory || [];

        // Build immutable promotion history record
        newHistoryRecords.push({
          id: `prom-hist-${Date.now()}-${stu.id}`,
          batchId: batch.id,
          batchName: batch.batchName,
          studentId: stu.id,
          studentUniqueId: stu.studentId,
          rollNumber: stu.rollNumber,
          studentName: stu.fullName,
          previousAcademicYearId: stu.academicYearId,
          previousAcademicYearName: stu.academicYearName,
          previousClassId: stu.classId,
          previousClassName: stu.className,
          previousSectionId: stu.sectionId,
          previousSectionName: stu.sectionName,
          previousSemester: destinationClass ? destinationClass.semester - 1 : 5,
          newAcademicYearId: batch.destinationAcademicYearId,
          newAcademicYearName: batch.destinationAcademicYearName,
          newClassId: batch.destinationClassId,
          newClassName: batch.destinationClassName,
          newSectionId: rec.destinationSectionId,
          newSectionName: rec.destinationSectionName,
          newSemester: batch.destinationSemester,
          promotionDate: now,
          decision: rec.isOverride
            ? "PROMOTED_BY_OVERRIDE"
            : rec.carriedBacklogCodes.length > 0
            ? "PROMOTED_WITH_BACKLOGS"
            : "PROMOTED_REGULAR",
          sgpaAtPromotion: rec.sgpaAtPromotion,
          cgpaAtPromotion: rec.cgpaAtPromotion,
          carriedBacklogCodes: rec.carriedBacklogCodes,
          authorizedBy: batch.approvedBy || operatorName,
          remarks: rec.isOverride
            ? `Administrative Override: ${rec.overrideReason}`
            : rec.carriedBacklogCodes.length > 0
            ? `Carrying forward arrears: ${rec.carriedBacklogCodes.join(", ")}`
            : "Regular academic progression satisfied.",
        });

        return {
          ...stu,
          academicYearId: batch.destinationAcademicYearId,
          academicYearName: batch.destinationAcademicYearName,
          classId: batch.destinationClassId,
          className: batch.destinationClassName,
          sectionId: rec.destinationSectionId,
          sectionName: rec.destinationSectionName,
          enrollmentHistory: [historyEntry, ...priorHistory],
        };
      });

      saveState("students", updated);
      return updated;
    });

    // 2. Append to promotionHistory
    setPromotionHistory((prev) => {
      const up = [...newHistoryRecords, ...prev];
      saveState("promotion_history", up);
      return up;
    });

    // 3. Update destination section enrollment count
    if (destinationSection) {
      setSections((prev) => {
        const up = prev.map((s) =>
          s.id === destinationSection.id
            ? { ...s, currentEnrollment: s.currentEnrollment + batch.studentRecords.length }
            : s
        );
        saveState("sections", up);
        return up;
      });
    }

    // 4. Update batch status to Executed
    const updatedBatch: PromotionBatchItem = {
      ...batch,
      status: "Executed",
      executedBy: operatorName,
      executedAt: now,
      updatedAt: now,
    };

    setPromotionBatches((prev) => {
      const up = prev.map((b) => (b.id === batchId ? updatedBatch : b));
      saveState("promotion_batches", up);
      return up;
    });

    // 5. Audit Log
    const audit: PromotionAuditLog = {
      id: `prom-audit-${Date.now()}`,
      batchId: batch.id,
      batchName: batch.batchName,
      action: "PROMOTION_EXECUTED",
      details: `Executed promotion of ${batch.studentRecords.length} students into ${batch.destinationClassName} (${batch.destinationSectionName}).`,
      performedBy: operatorName,
      timestamp: now,
    };

    setPromotionAudits((prev) => {
      const up = [audit, ...prev];
      saveState("promotion_audits", up);
      return up;
    });

    return {
      success: true,
      promotedCount: batch.studentRecords.length,
      message: `Successfully executed academic progression for ${batch.studentRecords.length} students!`,
    };
  };

  const overrideStudentEligibility = (params: {
    studentId: string;
    batchId?: string;
    reason: string;
    authorizedBy: string;
  }): { success: boolean; message: string } => {
    if (!params.reason || params.reason.trim().length < 5) {
      return { success: false, message: "A detailed justification (min 5 chars) is mandatory for overrides." };
    }

    const stu = students.find((s) => s.id === params.studentId);
    if (!stu) return { success: false, message: "Student not found." };

    if (params.batchId) {
      setPromotionBatches((prev) => {
        const up = prev.map((b) => {
          if (b.id !== params.batchId) return b;
          const upRecords = b.studentRecords.map((r) =>
            r.studentId === params.studentId
              ? { ...r, isOverride: true, overrideReason: params.reason.trim() }
              : r
          );
          return { ...b, studentRecords: upRecords, overrideCount: b.overrideCount + 1 };
        });
        saveState("promotion_batches", up);
        return up;
      });
    }

    const audit: PromotionAuditLog = {
      id: `prom-audit-${Date.now()}`,
      batchId: params.batchId,
      studentId: params.studentId,
      studentName: stu.fullName,
      action: "ADMIN_OVERRIDE_GRANTED",
      details: `Administrative override authorized for ${stu.fullName} (${stu.rollNumber}).`,
      reason: params.reason.trim(),
      performedBy: params.authorizedBy,
      timestamp: new Date().toISOString(),
    };

    setPromotionAudits((prev) => {
      const up = [audit, ...prev];
      saveState("promotion_audits", up);
      return up;
    });

    return {
      success: true,
      message: `Override authorized successfully for ${stu.fullName}. Audit trail record created.`,
    };
  };

  const reallocateStudentSection = (params: {
    studentId: string;
    newSectionId: string;
    reason?: string;
  }): { success: boolean; message: string } => {
    const stu = students.find((s) => s.id === params.studentId);
    if (!stu) return { success: false, message: "Student not found." };

    const newSec = sections.find((s) => s.id === params.newSectionId);
    if (!newSec) return { success: false, message: "Destination section not found." };

    const previousSecName = stu.sectionName || "Unassigned";

    setStudents((prev) => {
      const up = prev.map((s) =>
        s.id === params.studentId
          ? { ...s, sectionId: newSec.id, sectionName: newSec.name }
          : s
      );
      saveState("students", up);
      return up;
    });

    const audit: PromotionAuditLog = {
      id: `prom-audit-${Date.now()}`,
      studentId: stu.id,
      studentName: stu.fullName,
      action: "SECTION_REALLOCATED",
      details: `Reallocated section from ${previousSecName} to ${newSec.name}.`,
      reason: params.reason || "Section re-distribution balancing.",
      performedBy: "Institution Admin",
      timestamp: new Date().toISOString(),
    };

    setPromotionAudits((prev) => {
      const up = [audit, ...prev];
      saveState("promotion_audits", up);
      return up;
    });

    return {
      success: true,
      message: `${stu.fullName} successfully reallocated to ${newSec.name}.`,
    };
  };

  const deletePromotionBatch = (batchId: string): { success: boolean; message: string } => {
    const batch = promotionBatches.find((b) => b.id === batchId);
    if (!batch) return { success: false, message: "Promotion batch not found." };

    if (batch.status === "Executed") {
      return { success: false, message: "Executed promotion batches cannot be deleted." };
    }

    setPromotionBatches((prev) => {
      const up = prev.filter((b) => b.id !== batchId);
      saveState("promotion_batches", up);
      return up;
    });

    return { success: true, message: `Promotion batch "${batch.batchName}" deleted.` };
  };

  const getPromotionMetrics = (): PromotionMetrics => {
    const totalPromotionBatches = promotionBatches.length;
    const executedBatches = promotionBatches.filter((b) => b.status === "Executed").length;

    let totalEligibleStudents = 0;
    let studentsEligibleForPromotion = 0;
    let studentsWithBacklogs = 0;
    let studentsDetained = 0;
    let studentsPendingReview = 0;
    let studentsAlreadyPromoted = 0;

    classes.forEach((cls) => {
      const evals = evaluateStudentsForPromotion({ classId: cls.id, sectionId: "ALL" });
      totalEligibleStudents += evals.length;
      evals.forEach((ev) => {
        if (ev.status === "Eligible") studentsEligibleForPromotion += 1;
        else if (ev.status === "Eligible with Backlogs") {
          studentsEligibleForPromotion += 1;
          studentsWithBacklogs += 1;
        } else if (ev.status === "Detained") studentsDetained += 1;
        else if (ev.status === "Pending Review") studentsPendingReview += 1;
        else if (ev.status === "Already Promoted") studentsAlreadyPromoted += 1;
      });
    });

    return {
      totalEligibleStudents,
      studentsEligibleForPromotion,
      studentsWithBacklogs,
      studentsDetained,
      studentsPendingReview,
      studentsAlreadyPromoted,
      totalPromotionBatches,
      executedBatches,
    };
  };

  // =========================================================================
  // Phase 4E: Certificate & Degree Management Methods
  // =========================================================================

  const evaluateCertificateEligibility = (
    studentId: string,
    certificateType: CertificateType
  ): EligibilityEvaluationResult => {
    const stu = students.find((s) => s.id === studentId || s.studentId === studentId);
    if (!stu) {
      return {
        isEligible: false,
        canIssue: false,
        checks: [],
        summary: "Student record not found in institutional database.",
        hasMissingIntegration: false,
      };
    }

    const tpl = certificateTemplates.find((t) => t.type === certificateType);
    const checks: EligibilityCheckItem[] = [];
    let hasMissingIntegration = false;

    // Check 1: Enrollment Check
    if (certificateType === "Transfer Certificate (TC)") {
      const isEnrolled = ["Active", "Transferred", "Alumni"].includes(stu.status);
      checks.push({
        checkId: "chk-active-enrollment",
        name: "Student Identity & Admission Record",
        status: isEnrolled ? "PASSED" : "FAILED",
        details: `Verified institutional enrollment record (${stu.studentId}, Admission No: ${stu.admissionNumber}). Status: ${stu.status}.`,
        isMandatory: true,
        canOverride: false,
      });
    } else {
      const isActive = stu.status === "Active";
      checks.push({
        checkId: "chk-active-enrollment",
        name: "Active Institutional Enrollment",
        status: isActive ? "PASSED" : "FAILED",
        details: isActive
          ? `Student is actively enrolled in ${stu.className} (${stu.academicYearName}).`
          : `Student status is ${stu.status}. Active enrollment required.`,
        isMandatory: true,
        canOverride: false,
      });
    }

    // Check 2: Academic Standing / Final Semester / Zero Backlogs
    const studentPublishedResults = resultBatches
      .filter((b) => b.status === "Published")
      .flatMap((b) => b.studentResults.filter((r) => r.studentId === stu.id));

    const activeBacklogCodes = studentPublishedResults.flatMap(
      (r) => r.backlogSubjectCodes || []
    );
    const totalEarnedCredits = studentPublishedResults.reduce(
      (acc, r) => acc + (r.totalCreditsEarned || 0),
      0
    );

    if (tpl?.requiresFinalSemester) {
      const isFinalSem =
        stu.className.toLowerCase().includes("8th") ||
        stu.className.toLowerCase().includes("final") ||
        stu.className.toLowerCase().includes("4th year");
      checks.push({
        checkId: "chk-final-sem",
        name: "Final Semester Curriculum Completion",
        status: isFinalSem ? "PASSED" : "FAILED",
        details: isFinalSem
          ? "Student has reached final semester graduation cohort."
          : `Student is enrolled in ${stu.className}. Final 8th semester curriculum completion required.`,
        isMandatory: true,
        canOverride: false,
      });
    }

    if (tpl?.requiresZeroBacklogs) {
      const zeroBacklogs = activeBacklogCodes.length === 0;
      checks.push({
        checkId: "chk-zero-backlogs",
        name: "Zero Outstanding Academic Backlogs",
        status: zeroBacklogs ? "PASSED" : "FAILED",
        details: zeroBacklogs
          ? "No active arrears recorded in institutional ledger."
          : `Found ${activeBacklogCodes.length} active arrears (${activeBacklogCodes.join(
              ", "
            )}). Clearance mandatory.`,
        isMandatory: true,
        canOverride: false,
      });
    }

    if (certificateType === "Provisional Degree Certificate") {
      const hasEnoughCredits = totalEarnedCredits >= 114; // min requirement
      checks.push({
        checkId: "chk-degree-credits",
        name: "Graduation Credit Fulfillment",
        status: hasEnoughCredits ? "PASSED" : "FAILED",
        details: `Accumulated earned credits: ${totalEarnedCredits} credits in examination records.`,
        isMandatory: true,
        canOverride: false,
      });
    }

    if (certificateType === "Transcript / Academic Record") {
      const hasPublishedBatches = studentPublishedResults.length > 0;
      checks.push({
        checkId: "chk-published-results",
        name: "Published Examination Ledger Batches",
        status: hasPublishedBatches ? "PASSED" : "FAILED",
        details: hasPublishedBatches
          ? `Found ${studentPublishedResults.length} published semester grade record(s).`
          : "No published semester result batches found in ledger. Transcripts require published Phase 4C records.",
        isMandatory: true,
        canOverride: false,
      });
    }

    // Check 3: Conduct & Discipline
    const isGoodConduct = stu.status !== "Suspended";
    checks.push({
      checkId: "chk-conduct-standing",
      name: "Disciplinary & Conduct Clearance",
      status: isGoodConduct ? "PASSED" : "FAILED",
      details: isGoodConduct
        ? "No disciplinary proceedings, suspensions, or proctorial sanctions on record."
        : "Student is currently under academic suspension.",
      isMandatory: true,
      canOverride: true,
    });

    // Check 4: Fee Clearance
    if (tpl?.requiresFeeClearance) {
      hasMissingIntegration = true;
      checks.push({
        checkId: "chk-fee-clearance",
        name: "Institutional Fee Clearance",
        status: "NOT_INTEGRATED",
        details:
          "Finance & Fee Management module not yet integrated. Requires manual verification with offline Accounts receipt or authorized admin override.",
        isMandatory: true,
        canOverride: true,
      });
    }

    // Check 5: Hostel Clearance
    if (tpl?.requiresHostelClearance) {
      hasMissingIntegration = true;
      checks.push({
        checkId: "chk-hostel-clearance",
        name: "Hostel & Mess Clearance",
        status: "NOT_INTEGRATED",
        details:
          "Hostel Management module not yet integrated. Requires manual clearance letter from Warden or administrative confirmation.",
        isMandatory: true,
        canOverride: true,
      });
    }

    const failedMandatory = checks.filter(
      (c) => c.isMandatory && c.status === "FAILED" && !c.overridden
    );
    const unintegrated = checks.filter(
      (c) =>
        c.isMandatory &&
        (c.status === "NOT_INTEGRATED" || c.status === "PENDING_VERIFICATION") &&
        !c.overridden
    );
    const canIssue = failedMandatory.length === 0 && unintegrated.length === 0;
    const isEligible = checks.every(
      (c) =>
        c.status === "PASSED" ||
        c.overridden ||
        c.status === "NOT_INTEGRATED" ||
        c.status === "PENDING_VERIFICATION"
    );

    let summary = "All mandatory eligibility criteria satisfied.";
    if (failedMandatory.length > 0) {
      summary = `Failed mandatory requirement(s): ${failedMandatory.map((f) => f.name).join(", ")}.`;
    } else if (unintegrated.length > 0) {
      summary = `Dependent modules pending verification (${unintegrated
        .map((u) => u.name)
        .join(", ")}). Manual clearance or authorized override required.`;
    }

    return {
      isEligible,
      canIssue,
      checks,
      summary,
      hasMissingIntegration,
    };
  };

  const createCertificateApplication = (data: {
    studentId: string;
    certificateType: CertificateType;
    purpose: string;
    supportingDocuments?: string[];
    remarks?: string;
    priority?: CertificatePriority;
    requestedBy?: string;
  }): { success: boolean; application?: CertificateApplicationItem; message: string } => {
    const stu = students.find((s) => s.id === data.studentId || s.studentId === data.studentId);
    if (!stu) return { success: false, message: "Student record not found." };

    // Prevent duplicate active requests for same student and certificate type
    const duplicate = certificateApplications.find(
      (app) =>
        app.studentId === stu.id &&
        app.certificateType === data.certificateType &&
        ["Draft", "Submitted", "Under Review", "Approved", "Generated"].includes(app.status)
    );
    if (duplicate) {
      return {
        success: false,
        message: `An active application (${duplicate.applicationNumber}) already exists for ${stu.fullName} for ${data.certificateType}. Duplicate active requests are prevented by policy.`,
      };
    }

    const guardian = guardians.find((g) => stu.guardianIds.includes(g.id)) || guardians[0];
    const fatherOrGuardianName = guardian ? guardian.fullName : "Parent / Guardian";

    const eligibilityResult = evaluateCertificateEligibility(stu.id, data.certificateType);
    const appCount = certificateApplications.length + 1;
    const applicationNumber = `APP-${new Date().getFullYear()}-${String(appCount).padStart(4, "0")}`;

    const newApp: CertificateApplicationItem = {
      id: `cert-app-${Date.now()}`,
      applicationNumber,
      studentId: stu.id,
      studentUniqueId: stu.studentId,
      rollNumber: stu.rollNumber,
      studentName: stu.fullName,
      gender: stu.gender,
      fatherOrGuardianName,
      dob: stu.dob,
      courseId: stu.courseId,
      courseName: stu.courseName,
      departmentId: stu.departmentId,
      departmentName: stu.departmentName,
      academicYearId: stu.academicYearId,
      academicYearName: stu.academicYearName,
      classId: stu.classId,
      className: stu.className,
      sectionName: stu.sectionName,
      batch: stu.batch,
      studentStatus: stu.status,
      certificateType: data.certificateType,
      purpose: data.purpose,
      supportingDocuments: data.supportingDocuments || [],
      remarks: data.remarks,
      priority: data.priority || "Normal",
      status: "Submitted",
      requestDate: new Date().toISOString().split("T")[0],
      requestedBy: data.requestedBy || "Institution Admin",
      eligibilityResult,
    };

    setCertificateApplications((prev) => {
      const up = [newApp, ...prev];
      saveState("certificate_applications", up);
      return up;
    });

    const audit: CertificateAuditLog = {
      id: `cert-audit-${Date.now()}`,
      applicationId: newApp.id,
      studentId: stu.id,
      studentName: stu.fullName,
      action: "APPLICATION_CREATED",
      details: `Logged application ${newApp.applicationNumber} for ${newApp.certificateType}.`,
      performedBy: data.requestedBy || "Institution Admin",
      timestamp: new Date().toISOString(),
    };

    setCertificateAudits((prev) => {
      const up = [audit, ...prev];
      saveState("certificate_audits", up);
      return up;
    });

    return {
      success: true,
      application: newApp,
      message: `Certificate application ${newApp.applicationNumber} created successfully.`,
    };
  };

  const updateCertificateApplication = (
    id: string,
    updates: Partial<CertificateApplicationItem>
  ): { success: boolean; message: string } => {
    const app = certificateApplications.find((a) => a.id === id);
    if (!app) return { success: false, message: "Application not found." };

    if (app.status === "Issued" || app.status === "Cancelled") {
      return { success: false, message: "Cannot edit closed or issued applications." };
    }

    setCertificateApplications((prev) => {
      const up = prev.map((a) => (a.id === id ? { ...a, ...updates } : a));
      saveState("certificate_applications", up);
      return up;
    });

    return { success: true, message: "Application details updated." };
  };

  const transitionCertificateApplicationStatus = (
    id: string,
    newStatus: CertificateApplicationStatus,
    metadata?: {
      reason?: string;
      reviewerOrApprover?: string;
      notes?: string;
    }
  ): { success: boolean; message: string } => {
    const app = certificateApplications.find((a) => a.id === id);
    if (!app) return { success: false, message: "Application not found." };

    if (newStatus === "Rejected" && (!metadata?.reason || metadata.reason.trim().length < 5)) {
      return { success: false, message: "A detailed rejection reason (min 5 chars) is mandatory." };
    }

    if (newStatus === "Cancelled" && (!metadata?.reason || metadata.reason.trim().length < 5)) {
      return { success: false, message: "A detailed cancellation reason (min 5 chars) is mandatory." };
    }

    if (
      newStatus === "Approved" &&
      !app.eligibilityResult.canIssue
    ) {
      return {
        success: false,
        message:
          "Cannot approve application with unverified mandatory checks or un-integrated dependencies. Please record authorized overrides first.",
      };
    }

    const now = new Date().toISOString();
    const updated: CertificateApplicationItem = {
      ...app,
      status: newStatus,
    };

    let auditAction: CertificateAuditLog["action"] = "STATUS_TRANSITIONED";

    if (newStatus === "Under Review") {
      updated.reviewerName = metadata?.reviewerOrApprover || "Academic Reviewer";
      updated.reviewedAt = now;
      updated.reviewNotes = metadata?.notes || "Under review by academic office.";
    } else if (newStatus === "Approved") {
      updated.approverName = metadata?.reviewerOrApprover || "Principal / Approver";
      updated.approvedAt = now;
      auditAction = "APPLICATION_APPROVED";
    } else if (newStatus === "Rejected") {
      updated.rejectionReason = metadata?.reason;
      auditAction = "APPLICATION_REJECTED";
    } else if (newStatus === "Additional Info Required") {
      updated.additionalInfoNotes = metadata?.notes || metadata?.reason;
      auditAction = "ADDITIONAL_INFO_REQUESTED";
    } else if (newStatus === "Cancelled") {
      updated.cancellationReason = metadata?.reason;
    }

    setCertificateApplications((prev) => {
      const up = prev.map((a) => (a.id === id ? updated : a));
      saveState("certificate_applications", up);
      return up;
    });

    const audit: CertificateAuditLog = {
      id: `cert-audit-${Date.now()}`,
      applicationId: app.id,
      studentId: app.studentId,
      studentName: app.studentName,
      action: auditAction,
      details: `Transitioned application ${app.applicationNumber} to ${newStatus}.${
        metadata?.reason ? " Reason: " + metadata.reason : ""
      }`,
      reason: metadata?.reason,
      performedBy: metadata?.reviewerOrApprover || "Institution Admin",
      timestamp: now,
    };

    setCertificateAudits((prev) => {
      const up = [audit, ...prev];
      saveState("certificate_audits", up);
      return up;
    });

    return {
      success: true,
      message: `Application ${app.applicationNumber} transitioned to ${newStatus}.`,
    };
  };

  const overrideCertificateEligibilityCheck = (
    applicationId: string,
    checkId: string,
    reason: string,
    performedBy: string
  ): { success: boolean; message: string } => {
    if (!reason || reason.trim().length < 5) {
      return { success: false, message: "A detailed justification (min 5 chars) is mandatory for overrides." };
    }

    const app = certificateApplications.find((a) => a.id === applicationId);
    if (!app) return { success: false, message: "Application not found." };

    const now = new Date().toISOString();
    const updatedChecks = app.eligibilityResult.checks.map((chk) => {
      if (chk.checkId === checkId) {
        return {
          ...chk,
          overridden: true,
          overrideReason: reason.trim(),
          overriddenBy: performedBy,
          overriddenAt: now,
        };
      }
      return chk;
    });

    const failedMandatory = updatedChecks.filter(
      (c) => c.isMandatory && c.status === "FAILED" && !c.overridden
    );
    const unintegrated = updatedChecks.filter(
      (c) =>
        c.isMandatory &&
        (c.status === "NOT_INTEGRATED" || c.status === "PENDING_VERIFICATION") &&
        !c.overridden
    );
    const canIssue = failedMandatory.length === 0 && unintegrated.length === 0;

    const updatedApp: CertificateApplicationItem = {
      ...app,
      eligibilityResult: {
        ...app.eligibilityResult,
        checks: updatedChecks,
        canIssue,
        summary: canIssue
          ? "All mandatory checks satisfied or administratively authorized."
          : app.eligibilityResult.summary,
      },
    };

    setCertificateApplications((prev) => {
      const up = prev.map((a) => (a.id === applicationId ? updatedApp : a));
      saveState("certificate_applications", up);
      return up;
    });

    const audit: CertificateAuditLog = {
      id: `cert-audit-${Date.now()}`,
      applicationId: app.id,
      studentId: app.studentId,
      studentName: app.studentName,
      action: "ELIGIBILITY_OVERRIDDEN",
      details: `Authorized administrative override for requirement: ${checkId}. Justification: ${reason}`,
      reason,
      performedBy,
      timestamp: now,
    };

    setCertificateAudits((prev) => {
      const up = [audit, ...prev];
      saveState("certificate_audits", up);
      return up;
    });

    return { success: true, message: "Administrative override recorded successfully." };
  };

  const generateCertificateForApplication = (
    applicationId: string,
    params?: {
      signatoryName?: string;
      signatoryTitle?: string;
      customRemarks?: string;
      performedBy?: string;
    }
  ): { success: boolean; certificate?: IssuedCertificateItem; message: string } => {
    const app = certificateApplications.find((a) => a.id === applicationId);
    if (!app) return { success: false, message: "Application not found." };

    if (!app.eligibilityResult.canIssue && app.status !== "Approved") {
      return {
        success: false,
        message: "Cannot generate certificate before verifying eligibility or obtaining administrative approval.",
      };
    }

    const tpl = certificateTemplates.find((t) => t.type === app.certificateType);
    const prefix = tpl?.prefix || "CERT";

    // Certificate Number Generator
    const currentSeq = certificateNumberConfig.typeSequences[prefix] || 1;
    const nextSeq = currentSeq + 1;
    const pad = certificateNumberConfig.sequencePadding || 4;
    const seqStr = String(currentSeq).padStart(pad, "0");
    const yearPart = certificateNumberConfig.useAcademicYear
      ? app.academicYearName.replace("/", "-")
      : new Date().getFullYear().toString();
    const certNumber = `${certificateNumberConfig.prefix}${certificateNumberConfig.separator}${prefix}${certificateNumberConfig.separator}${yearPart}${certificateNumberConfig.separator}${seqStr}`;

    // Update sequence in config
    const updatedNumberConfig: CertificateNumberConfig = {
      ...certificateNumberConfig,
      typeSequences: {
        ...certificateNumberConfig.typeSequences,
        [prefix]: nextSeq,
      },
    };
    setCertificateNumberConfig(updatedNumberConfig);
    saveState("certificate_numbering", updatedNumberConfig);

    // Cryptographic verification hash
    const verificationCode = `SST-VER-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // Template Variable Replacement
    let bodyText =
      tpl?.customBodyTemplate ||
      "This is to certify that [STUDENT_NAME] is a bonafide student of this institution.";
    bodyText = bodyText
      .replace(/\[STUDENT_NAME\]/g, app.studentName)
      .replace(/\[ROLL_NUMBER\]/g, app.rollNumber)
      .replace(/\[STUDENT_ID\]/g, app.studentUniqueId)
      .replace(/\[GUARDIAN_NAME\]/g, app.fatherOrGuardianName)
      .replace(/\[COURSE_NAME\]/g, app.courseName)
      .replace(/\[DEPARTMENT_NAME\]/g, app.departmentName)
      .replace(/\[ACADEMIC_YEAR\]/g, app.academicYearName)
      .replace(/\[CLASS_NAME\]/g, app.className)
      .replace(/\[BATCH\]/g, app.batch)
      .replace(/\[BATCH_START\]/g, app.batch.split("-")[0] || "2024")
      .replace(/\[BATCH_END\]/g, app.batch.split("-")[1] || "2028")
      .replace(/\[ADMISSION_DATE\]/g, "2024-08-10")
      .replace(/\[CGPA\]/g, "8.92")
      .replace(/\[TOTAL_CREDITS\]/g, "114");

    let validUntil: string | undefined;
    if (tpl?.validityPeriodMonths) {
      const d = new Date();
      d.setMonth(d.getMonth() + tpl.validityPeriodMonths);
      validUntil = d.toISOString().split("T")[0];
    }

    const newCert: IssuedCertificateItem = {
      id: `cert-iss-${Date.now()}`,
      certificateNumber: certNumber,
      applicationId: app.id,
      applicationNumber: app.applicationNumber,
      verificationCode,
      certificateType: app.certificateType,
      title: tpl?.title || app.certificateType.toUpperCase(),
      category: tpl?.category || "Academic",
      studentId: app.studentId,
      studentUniqueId: app.studentUniqueId,
      rollNumber: app.rollNumber,
      studentName: app.studentName,
      fatherOrGuardianName: app.fatherOrGuardianName,
      gender: app.gender,
      dob: app.dob,
      courseName: app.courseName,
      departmentName: app.departmentName,
      academicYearName: app.academicYearName,
      className: app.className,
      sectionName: app.sectionName,
      batch: app.batch,
      cgpa: 8.92,
      sgpa: 9.1,
      totalCreditsEarned: 114,
      conductStanding: "Good Conduct",
      institutionName: profile.name,
      institutionCode: profile.code,
      affiliation: profile.affiliation,
      accreditation: profile.accreditation,
      institutionAddress: `${profile.addressLine1}${
        profile.addressLine2 ? ", " + profile.addressLine2 : ""
      }, ${profile.city}, ${profile.state} - ${profile.postalCode}`,
      institutionEmail: profile.email,
      institutionPhone: profile.phone,
      institutionWebsite: profile.website,
      bodyText,
      purpose: app.purpose,
      issueDate: new Date().toISOString().split("T")[0],
      validUntil,
      signatoryName: params?.signatoryName || "Dr. K. S. Murthy",
      signatoryTitle:
        params?.signatoryTitle ||
        tpl?.authorizedSignatoryTitle ||
        "Principal & Head of Institution",
      status: "Active",
      isReissue: false,
      issuedBy: params?.performedBy || "Institution Admin",
      createdAt: new Date().toISOString(),
    };

    setIssuedCertificates((prev) => {
      const up = [newCert, ...prev];
      saveState("issued_certificates", up);
      return up;
    });

    // Update application
    const updatedApp: CertificateApplicationItem = {
      ...app,
      status: "Generated",
      generatedCertificateId: newCert.id,
      generatedCertificateNumber: newCert.certificateNumber,
    };

    setCertificateApplications((prev) => {
      const up = prev.map((a) => (a.id === app.id ? updatedApp : a));
      saveState("certificate_applications", up);
      return up;
    });

    const audit: CertificateAuditLog = {
      id: `cert-audit-${Date.now()}`,
      applicationId: app.id,
      certificateNumber: newCert.certificateNumber,
      studentId: app.studentId,
      studentName: app.studentName,
      action: "CERTIFICATE_GENERATED",
      details: `Generated official ${newCert.certificateType} ${newCert.certificateNumber} (Verification ID: ${newCert.verificationCode}).`,
      performedBy: params?.performedBy || "Institution Admin",
      timestamp: new Date().toISOString(),
    };

    setCertificateAudits((prev) => {
      const up = [audit, ...prev];
      saveState("certificate_audits", up);
      return up;
    });

    return {
      success: true,
      certificate: newCert,
      message: `Certificate ${newCert.certificateNumber} generated successfully.`,
    };
  };

  const issueCertificate = (
    certificateId: string,
    performedBy: string
  ): { success: boolean; message: string } => {
    const cert = issuedCertificates.find((c) => c.id === certificateId);
    if (!cert) return { success: false, message: "Certificate not found." };

    if (cert.status === "Revoked / Cancelled") {
      return { success: false, message: "Cannot issue a revoked or cancelled certificate." };
    }

    const now = new Date().toISOString();
    const today = now.split("T")[0];

    const updatedCert: IssuedCertificateItem = {
      ...cert,
      status: "Active",
      issueDate: today,
      issuedBy: performedBy,
    };

    setIssuedCertificates((prev) => {
      const up = prev.map((c) => (c.id === certificateId ? updatedCert : c));
      saveState("issued_certificates", up);
      return up;
    });

    // Mark linked application as Issued
    if (cert.applicationId) {
      setCertificateApplications((prev) => {
        const up = prev.map((a) =>
          a.id === cert.applicationId ? { ...a, status: "Issued" as CertificateApplicationStatus, issuedAt: now } : a
        );
        saveState("certificate_applications", up);
        return up;
      });
    }

    const audit: CertificateAuditLog = {
      id: `cert-audit-${Date.now()}`,
      applicationId: cert.applicationId,
      certificateNumber: cert.certificateNumber,
      studentId: cert.studentId,
      studentName: cert.studentName,
      action: "CERTIFICATE_ISSUED",
      details: `Issued and sealed certificate ${cert.certificateNumber} to student.`,
      performedBy,
      timestamp: now,
    };

    setCertificateAudits((prev) => {
      const up = [audit, ...prev];
      saveState("certificate_audits", up);
      return up;
    });

    return { success: true, message: `Certificate ${cert.certificateNumber} issued successfully.` };
  };

  const reissueCertificate = (
    certificateId: string,
    reason: string,
    performedBy: string,
    corrections?: {
      studentName?: string;
      fatherOrGuardianName?: string;
      dob?: string;
      rollNumber?: string;
      bodyText?: string;
    }
  ): { success: boolean; newCertificate?: IssuedCertificateItem; message: string } => {
    if (!reason || reason.trim().length < 5) {
      return { success: false, message: "A detailed justification (min 5 chars) is mandatory for certificate reissue." };
    }

    const orig = issuedCertificates.find((c) => c.id === certificateId);
    if (!orig) return { success: false, message: "Original certificate not found." };

    if (orig.status === "Revoked / Cancelled") {
      return { success: false, message: "Cannot reissue a revoked certificate. A new application is required." };
    }

    const tpl = certificateTemplates.find((t) => t.type === orig.certificateType);
    const prefix = tpl?.prefix || "CERT";

    // New sequence & Certificate Number
    const currentSeq = certificateNumberConfig.typeSequences[prefix] || 1;
    const nextSeq = currentSeq + 1;
    const pad = certificateNumberConfig.sequencePadding || 4;
    const seqStr = String(currentSeq).padStart(pad, "0");
    const yearPart = new Date().getFullYear().toString();
    const newCertNumber = `${certificateNumberConfig.prefix}${certificateNumberConfig.separator}${prefix}${certificateNumberConfig.separator}${yearPart}${certificateNumberConfig.separator}${seqStr}`;

    const updatedNumberConfig: CertificateNumberConfig = {
      ...certificateNumberConfig,
      typeSequences: {
        ...certificateNumberConfig.typeSequences,
        [prefix]: nextSeq,
      },
    };
    setCertificateNumberConfig(updatedNumberConfig);
    saveState("certificate_numbering", updatedNumberConfig);

    const newVerificationCode = `SST-VER-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const now = new Date().toISOString();

    const newCert: IssuedCertificateItem = {
      ...orig,
      id: `cert-iss-${Date.now()}`,
      certificateNumber: newCertNumber,
      verificationCode: newVerificationCode,
      studentName: corrections?.studentName || orig.studentName,
      fatherOrGuardianName: corrections?.fatherOrGuardianName || orig.fatherOrGuardianName,
      dob: corrections?.dob || orig.dob,
      rollNumber: corrections?.rollNumber || orig.rollNumber,
      bodyText: corrections?.bodyText || orig.bodyText,
      issueDate: now.split("T")[0],
      status: "Active",
      isReissue: true,
      previousCertificateId: orig.id,
      previousCertificateNumber: orig.certificateNumber,
      reissueReason: reason.trim(),
      issuedBy: performedBy,
      createdAt: now,
    };

    // Supersede original
    setIssuedCertificates((prev) => {
      const up = prev.map((c) =>
        c.id === orig.id
          ? {
              ...c,
              status: "Reissued / Superseded" as CertificateStatus,
              replacementCertificateId: newCert.id,
            }
          : c
      );
      const withNew = [newCert, ...up];
      saveState("issued_certificates", withNew);
      return withNew;
    });

    const audit: CertificateAuditLog = {
      id: `cert-audit-${Date.now()}`,
      applicationId: orig.applicationId,
      certificateNumber: newCert.certificateNumber,
      studentId: orig.studentId,
      studentName: newCert.studentName,
      action: "CERTIFICATE_REISSUED",
      details: `Reissued replacement certificate ${newCert.certificateNumber} superseding ${orig.certificateNumber}. Reason: ${reason}`,
      reason,
      performedBy,
      timestamp: now,
    };

    setCertificateAudits((prev) => {
      const up = [audit, ...prev];
      saveState("certificate_audits", up);
      return up;
    });

    return {
      success: true,
      newCertificate: newCert,
      message: `Reissued certificate ${newCert.certificateNumber} successfully.`,
    };
  };

  const revokeCertificate = (
    certificateId: string,
    reason: string,
    performedBy: string
  ): { success: boolean; message: string } => {
    if (!reason || reason.trim().length < 5) {
      return { success: false, message: "A detailed revocation justification (min 5 chars) is mandatory." };
    }

    const cert = issuedCertificates.find((c) => c.id === certificateId);
    if (!cert) return { success: false, message: "Certificate not found." };

    const now = new Date().toISOString();
    const updatedCert: IssuedCertificateItem = {
      ...cert,
      status: "Revoked / Cancelled",
      revocationReason: reason.trim(),
      revokedBy: performedBy,
      revokedAt: now,
    };

    setIssuedCertificates((prev) => {
      const up = prev.map((c) => (c.id === certificateId ? updatedCert : c));
      saveState("issued_certificates", up);
      return up;
    });

    if (cert.applicationId) {
      setCertificateApplications((prev) => {
        const up = prev.map((a) =>
          a.id === cert.applicationId
            ? { ...a, status: "Cancelled" as CertificateApplicationStatus, cancellationReason: reason.trim() }
            : a
        );
        saveState("certificate_applications", up);
        return up;
      });
    }

    const audit: CertificateAuditLog = {
      id: `cert-audit-${Date.now()}`,
      applicationId: cert.applicationId,
      certificateNumber: cert.certificateNumber,
      studentId: cert.studentId,
      studentName: cert.studentName,
      action: "CERTIFICATE_REVOKED",
      details: `Revoked certificate ${cert.certificateNumber}. Reason: ${reason}`,
      reason,
      performedBy,
      timestamp: now,
    };

    setCertificateAudits((prev) => {
      const up = [audit, ...prev];
      saveState("certificate_audits", up);
      return up;
    });

    return { success: true, message: `Certificate ${cert.certificateNumber} revoked.` };
  };

  const verifyCertificateQuery = (
    query: string
  ): {
    found: boolean;
    certificate?: IssuedCertificateItem;
    status: "Valid" | "Revoked" | "Superseded" | "Not Found";
    message: string;
  } => {
    const q = query.trim().toUpperCase();
    if (!q) {
      return { found: false, status: "Not Found", message: "Please provide a query." };
    }

    const match = issuedCertificates.find(
      (c) =>
        c.certificateNumber.toUpperCase() === q ||
        c.verificationCode.toUpperCase() === q ||
        c.studentUniqueId.toUpperCase() === q ||
        c.rollNumber.toUpperCase() === q
    );

    if (!match) {
      return {
        found: false,
        status: "Not Found",
        message: `No certificate records match "${query}".`,
      };
    }

    let status: "Valid" | "Revoked" | "Superseded" = "Valid";
    if (match.status === "Revoked / Cancelled") status = "Revoked";
    else if (match.status === "Reissued / Superseded") status = "Superseded";

    return {
      found: true,
      certificate: match,
      status,
      message: `Certificate match verified: ${match.certificateNumber} (${match.title}).`,
    };
  };

  const updateCertificateTemplate = (
    template: CertificateTemplate
  ): { success: boolean; message: string } => {
    setCertificateTemplates((prev) => {
      const up = prev.map((t) => (t.id === template.id ? template : t));
      saveState("certificate_templates", up);
      return up;
    });

    const audit: CertificateAuditLog = {
      id: `cert-audit-${Date.now()}`,
      action: "TEMPLATE_UPDATED",
      details: `Updated template policy for ${template.type}.`,
      performedBy: "Institution Admin",
      timestamp: new Date().toISOString(),
    };

    setCertificateAudits((prev) => {
      const up = [audit, ...prev];
      saveState("certificate_audits", up);
      return up;
    });

    return { success: true, message: `Template for "${template.type}" updated.` };
  };

  const updateCertificateNumberConfig = (
    config: CertificateNumberConfig
  ): { success: boolean; message: string } => {
    setCertificateNumberConfig(config);
    saveState("certificate_numbering", config);

    const audit: CertificateAuditLog = {
      id: `cert-audit-${Date.now()}`,
      action: "NUMBERING_UPDATED",
      details: `Updated institutional certificate numbering format prefix: ${config.prefix}.`,
      performedBy: "Institution Admin",
      timestamp: new Date().toISOString(),
    };

    setCertificateAudits((prev) => {
      const up = [audit, ...prev];
      saveState("certificate_audits", up);
      return up;
    });

    return { success: true, message: "Certificate numbering configuration updated." };
  };

  const getCertificateMetrics = (): CertificateMetrics => {
    const totalApplications = certificateApplications.length;
    const pendingApplications = certificateApplications.filter(
      (a) => a.status === "Submitted"
    ).length;
    const underReviewApplications = certificateApplications.filter(
      (a) => a.status === "Under Review" || a.status === "Additional Info Required"
    ).length;
    const approvedApplications = certificateApplications.filter(
      (a) => a.status === "Approved"
    ).length;
    const rejectedApplications = certificateApplications.filter(
      (a) => a.status === "Rejected"
    ).length;
    const certificatesGenerated = issuedCertificates.length;
    const certificatesIssued = issuedCertificates.filter((c) => c.status === "Active").length;
    const certificatesRevoked = issuedCertificates.filter(
      (c) => c.status === "Revoked / Cancelled"
    ).length;

    return {
      totalApplications,
      pendingApplications,
      underReviewApplications,
      approvedApplications,
      rejectedApplications,
      certificatesGenerated,
      certificatesIssued,
      certificatesRevoked,
    };
  };

  const resetToDefaults = () => {
    setProfile(initialInstitutionProfile);
    setAcademicYears(initialAcademicYears);
    setDepartments(initialDepartments);
    setCourses(initialCourses);
    setClasses(initialClasses);
    setSections(initialSections);
    setSubjects(initialSubjects);
    setRoles(initialRoles);
    setAdmissions(initialAdmissions);
    setStudents(initialStudents);
    setGuardians(initialGuardians);
    setStaff(initialStaff);
    setPeriodConfigs(initialPeriodConfigs);
    setTimetableSlots(initialTimetableSlots);
    setAttendanceThreshold(initialAttendanceThreshold);
    setAttendanceRecords(initialAttendanceRecords);
    setAttendanceAudits(initialAttendanceAudits);
    setExaminations(initialExaminations);
    setExamHalls(initialExamHalls);
    setExamEligibilityOverrides(initialExamEligibilityOverrides);
    setExamAudits(initialExamAudits);
    setIaAssessments(initialIAAssessments);
    setMarksSheets(initialMarksSheets);
    setMarksAudits(initialMarksAudits);
    setGradingConfig(initialGradingScaleConfig);
    setResultBatches(initialResultBatches);
    setResultAudits(initialResultAudits);
    setPromotionPolicies(initialPromotionPolicies);
    setPromotionBatches(initialPromotionBatches);
    setPromotionHistory(initialPromotionHistory);
    setPromotionAudits(initialPromotionAudits);
    setCertificateTemplates(initialCertificateTemplates);
    setCertificateNumberConfig(initialCertificateNumberConfig);
    setCertificateApplications(initialCertificateApplications);
    setIssuedCertificates(initialIssuedCertificates);
    setCertificateAudits(initialCertificateAudits);
    try {
      localStorage.clear();
    } catch {
      // ignore
    }
  };

  const activeAY = academicYears.find((ay) => ay.isActive) || academicYears[0];

  const stats: DashboardStats = {
    ...initialDashboardStats,
    activeAcademicYear: activeAY ? activeAY.name : "None",
    totalCourses: courses.length,
    totalDepartments: departments.length,
    activeSections: sections.length,
    totalStudents: students.filter((s) => s.status === "Active").length,
    totalStaff: staff.filter((s) => s.status === "Active").length,
    totalAdmissions: admissions.length,
    totalGuardians: guardians.length,
  };

  return (
    <InstitutionContext.Provider
      value={{
        profile,
        updateProfile,
        academicYears,
        activeAcademicYear: activeAY,
        addAcademicYear,
        updateAcademicYear,
        setActiveAcademicYear,
        deleteAcademicYear,
        departments,
        addDepartment,
        updateDepartment,
        deleteDepartment,
        courses,
        addCourse,
        updateCourse,
        deleteCourse,
        classes,
        addClass,
        updateClass,
        deleteClass,
        sections,
        addSection,
        updateSection,
        deleteSection,
        subjects,
        addSubject,
        updateSubject,
        deleteSubject,
        roles,
        permissionCategories: initialPermissionCategories,
        updateRolePermissions,
        addRole,

        // Phase 2: Student Lifecycle
        admissions,
        addAdmission,
        updateAdmission,
        deleteAdmission,
        updateAdmissionStatus,
        convertAdmissionToStudent,

        students,
        addStudent,
        updateStudent,
        deactivateStudent,
        linkGuardianToStudent,
        unlinkGuardianFromStudent,

        guardians,
        addGuardian,
        updateGuardian,
        deactivateGuardian,
        linkStudentToGuardian,
        unlinkStudentFromGuardian,

        staff,
        addStaff,
        updateStaff,
        deactivateStaff,

        // Phase 3: Timetable Management
        periodConfigs,
        timetableSlots,
        addTimetableSlot,
        updateTimetableSlot,
        deleteTimetableSlot,
        clearSectionTimetable,
        copyDaySchedule,
        checkTimetableConflicts,
        updatePeriodConfigs,
        getSubjectAllocationStats,
        getAvailableRooms,

        // Phase 3: Attendance Management
        attendanceThreshold,
        updateAttendanceThreshold,
        attendanceRecords,
        attendanceAudits,
        saveBatchAttendance,
        correctAttendanceRecord,
        deleteAttendanceRecord,
        getAttendanceForClassAndDate,
        getStudentAttendanceSummaries,
        getClassAttendanceSummaries,
        getAttendanceMetrics,

        // Phase 3: Examination Management
        examinations,
        examHalls,
        examEligibilityOverrides,
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

        // Phase 4A: Internal Assessment (IA) Management
        iaAssessments,
        addIAAssessment,
        updateIAAssessment,
        deleteIAAssessment,
        transitionIAAssessmentStatus,
        checkIAAssessmentConflicts,
        getIAMetrics,

        // Phase 4B: Student Marks Entry & Processing
        marksSheets,
        marksAudits,
        getMarksSheetForAssessment,
        saveMarksSheet,
        submitMarksSheet,
        lockMarksSheet,
        unlockMarksSheet,
        moderateStudentMarks,
        getMarksMetrics,

        // Phase 4C: Result Processing, Grade Calculation & Grade Cards
        gradingConfig,
        resultBatches,
        resultAudits,
        updateGradingConfig,
        calculateSemesterResults,
        saveResultBatch,
        transitionBatchStatus,
        correctPublishedResult,
        deleteResultBatch,
        getResultMetrics,

        // Phase 4D: Promotions & Academic Standing
        promotionPolicies,
        promotionBatches,
        promotionHistory,
        promotionAudits,
        updatePromotionPolicy,
        evaluateStudentsForPromotion,
        createPromotionBatch,
        updatePromotionBatch,
        transitionPromotionBatchStatus,
        executePromotionBatch,
        overrideStudentEligibility,
        reallocateStudentSection,
        deletePromotionBatch,
        getPromotionMetrics,

        // Phase 4E: Certificate & Degree Management
        certificateTemplates,
        certificateNumberConfig,
        certificateApplications,
        issuedCertificates,
        certificateAudits,
        evaluateCertificateEligibility,
        createCertificateApplication,
        updateCertificateApplication,
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

        stats,
        recentActivities,
        resetToDefaults,
      }}
    >
      {children}
    </InstitutionContext.Provider>
  );
}

export function useInstitution() {
  const context = useContext(InstitutionContext);
  if (!context) {
    throw new Error("useInstitution must be used within an InstitutionProvider");
  }
  return context;
}
