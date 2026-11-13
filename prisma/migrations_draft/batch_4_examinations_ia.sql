-- CreateEnum
CREATE TYPE "ExamType" AS ENUM ('INTERNAL', 'MID_TERM', 'END_TERM', 'SUPPLEMENTARY', 'PRACTICAL', 'MODEL');

-- CreateEnum
CREATE TYPE "ExamStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'ONGOING', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "OverrideType" AS ENUM ('ATTENDANCE_CONDONATION', 'FEE_CONCESSION', 'DISCIPLINARY_CLEARANCE', 'ACADEMIC_EXEMPTION', 'OTHER');

-- CreateEnum
CREATE TYPE "OverrideStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "IAAssessmentType" AS ENUM ('THEORY_TEST', 'PRACTICAL_LAB', 'ASSIGNMENT', 'QUIZ', 'PROJECT_SEMINAR', 'VIVA');

-- CreateEnum
CREATE TYPE "IAAssessmentStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'ACTIVE', 'SUBMITTED', 'LOCKED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "MarksSheetStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'LOCKED');

-- CreateEnum
CREATE TYPE "AssessmentContext" AS ENUM ('EXAMINATION', 'INTERNAL_ASSESSMENT');

-- CreateTable
CREATE TABLE "Examination" (
    "id" UUID NOT NULL,
    "institutionId" UUID NOT NULL,
    "academicYearId" UUID NOT NULL,
    "academicTermId" UUID,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" "ExamType" NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "registrationDeadline" TIMESTAMP(3),
    "status" "ExamStatus" NOT NULL DEFAULT 'DRAFT',
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Examination_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExamSubjectSlot" (
    "id" UUID NOT NULL,
    "institutionId" UUID NOT NULL,
    "examinationId" UUID NOT NULL,
    "subjectId" UUID NOT NULL,
    "classId" UUID NOT NULL,
    "sectionId" UUID,
    "examHallId" UUID,
    "invigilatorStaffId" UUID,
    "examDate" DATE NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "durationMinutes" INTEGER NOT NULL,
    "maxMarks" DECIMAL(5,2) NOT NULL,
    "passingMarks" DECIMAL(5,2) NOT NULL,
    "session" TEXT,
    "status" "ExamStatus" NOT NULL DEFAULT 'SCHEDULED',
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExamSubjectSlot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExamEligibilityOverride" (
    "id" UUID NOT NULL,
    "institutionId" UUID NOT NULL,
    "examinationId" UUID NOT NULL,
    "examSubjectSlotId" UUID,
    "studentId" UUID NOT NULL,
    "type" "OverrideType" NOT NULL,
    "reason" TEXT NOT NULL,
    "previousStatus" TEXT,
    "status" "OverrideStatus" NOT NULL DEFAULT 'PENDING',
    "requestedByUserId" UUID NOT NULL,
    "approvedByUserId" UUID,
    "approvedAt" TIMESTAMP(3),
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExamEligibilityOverride_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IAAssessment" (
    "id" UUID NOT NULL,
    "institutionId" UUID NOT NULL,
    "academicYearId" UUID NOT NULL,
    "academicTermId" UUID,
    "courseId" UUID NOT NULL,
    "classId" UUID NOT NULL,
    "sectionId" UUID NOT NULL,
    "subjectId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" "IAAssessmentType" NOT NULL,
    "assessmentDate" DATE NOT NULL,
    "maxMarks" DECIMAL(5,2) NOT NULL,
    "passingMarks" DECIMAL(5,2),
    "weightagePercentage" DECIMAL(5,2),
    "status" "IAAssessmentStatus" NOT NULL DEFAULT 'DRAFT',
    "createdById" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IAAssessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IAComponent" (
    "id" UUID NOT NULL,
    "institutionId" UUID NOT NULL,
    "assessmentId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT,
    "maxMarks" DECIMAL(5,2) NOT NULL,
    "weightagePercentage" DECIMAL(5,2) NOT NULL,
    "passingMarks" DECIMAL(5,2),
    "displayOrder" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IAComponent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarksSheet" (
    "id" UUID NOT NULL,
    "institutionId" UUID NOT NULL,
    "contextType" "AssessmentContext" NOT NULL,
    "examinationId" UUID,
    "examSubjectSlotId" UUID,
    "iaAssessmentId" UUID,
    "academicYearId" UUID NOT NULL,
    "academicTermId" UUID,
    "courseId" UUID NOT NULL,
    "classId" UUID NOT NULL,
    "sectionId" UUID NOT NULL,
    "subjectId" UUID NOT NULL,
    "evaluatedByStaffId" UUID NOT NULL,
    "submittedByUserId" UUID,
    "reviewedByUserId" UUID,
    "status" "MarksSheetStatus" NOT NULL DEFAULT 'DRAFT',
    "submittedAt" TIMESTAMP(3),
    "reviewedAt" TIMESTAMP(3),
    "isLocked" BOOLEAN NOT NULL DEFAULT false,
    "lockedAt" TIMESTAMP(3),
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MarksSheet_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Examination_institutionId_status_idx" ON "Examination"("institutionId", "status");

-- CreateIndex
CREATE INDEX "Examination_academicYearId_institutionId_idx" ON "Examination"("academicYearId", "institutionId");

-- CreateIndex
CREATE INDEX "Examination_academicTermId_institutionId_idx" ON "Examination"("academicTermId", "institutionId");

-- CreateIndex
CREATE UNIQUE INDEX "Examination_institutionId_code_key" ON "Examination"("institutionId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "Examination_id_institutionId_key" ON "Examination"("id", "institutionId");

-- CreateIndex
CREATE INDEX "ExamSubjectSlot_examinationId_institutionId_idx" ON "ExamSubjectSlot"("examinationId", "institutionId");

-- CreateIndex
CREATE INDEX "ExamSubjectSlot_subjectId_institutionId_idx" ON "ExamSubjectSlot"("subjectId", "institutionId");

-- CreateIndex
CREATE INDEX "ExamSubjectSlot_classId_institutionId_idx" ON "ExamSubjectSlot"("classId", "institutionId");

-- CreateIndex
CREATE INDEX "ExamSubjectSlot_sectionId_institutionId_idx" ON "ExamSubjectSlot"("sectionId", "institutionId");

-- CreateIndex
CREATE INDEX "ExamSubjectSlot_examHallId_institutionId_idx" ON "ExamSubjectSlot"("examHallId", "institutionId");

-- CreateIndex
CREATE INDEX "ExamSubjectSlot_invigilatorStaffId_institutionId_idx" ON "ExamSubjectSlot"("invigilatorStaffId", "institutionId");

-- CreateIndex
CREATE INDEX "ExamSubjectSlot_institutionId_examDate_idx" ON "ExamSubjectSlot"("institutionId", "examDate");

-- CreateIndex
CREATE INDEX "ExamSubjectSlot_examHallId_examDate_startTime_idx" ON "ExamSubjectSlot"("examHallId", "examDate", "startTime");

-- CreateIndex
CREATE INDEX "ExamSubjectSlot_classId_sectionId_examDate_startTime_idx" ON "ExamSubjectSlot"("classId", "sectionId", "examDate", "startTime");

-- CreateIndex
CREATE UNIQUE INDEX "ExamSubjectSlot_id_institutionId_key" ON "ExamSubjectSlot"("id", "institutionId");

-- CreateIndex
CREATE UNIQUE INDEX "ExamSubjectSlot_id_examinationId_institutionId_key" ON "ExamSubjectSlot"("id", "examinationId", "institutionId");

-- CreateIndex
CREATE INDEX "ExamEligibilityOverride_institutionId_status_idx" ON "ExamEligibilityOverride"("institutionId", "status");

-- CreateIndex
CREATE INDEX "ExamEligibilityOverride_examinationId_studentId_idx" ON "ExamEligibilityOverride"("examinationId", "studentId");

-- CreateIndex
CREATE INDEX "ExamEligibilityOverride_studentId_institutionId_idx" ON "ExamEligibilityOverride"("studentId", "institutionId");

-- CreateIndex
CREATE INDEX "ExamEligibilityOverride_examSubjectSlotId_institutionId_idx" ON "ExamEligibilityOverride"("examSubjectSlotId", "institutionId");

-- CreateIndex
CREATE INDEX "ExamEligibilityOverride_requestedByUserId_idx" ON "ExamEligibilityOverride"("requestedByUserId");

-- CreateIndex
CREATE INDEX "ExamEligibilityOverride_approvedByUserId_idx" ON "ExamEligibilityOverride"("approvedByUserId");

-- CreateIndex
CREATE UNIQUE INDEX "ExamEligibilityOverride_id_institutionId_key" ON "ExamEligibilityOverride"("id", "institutionId");

-- CreateIndex
CREATE INDEX "IAAssessment_institutionId_status_idx" ON "IAAssessment"("institutionId", "status");

-- CreateIndex
CREATE INDEX "IAAssessment_academicYearId_institutionId_idx" ON "IAAssessment"("academicYearId", "institutionId");

-- CreateIndex
CREATE INDEX "IAAssessment_courseId_classId_sectionId_idx" ON "IAAssessment"("courseId", "classId", "sectionId");

-- CreateIndex
CREATE INDEX "IAAssessment_subjectId_institutionId_idx" ON "IAAssessment"("subjectId", "institutionId");

-- CreateIndex
CREATE INDEX "IAAssessment_createdById_institutionId_idx" ON "IAAssessment"("createdById", "institutionId");

-- CreateIndex
CREATE UNIQUE INDEX "IAAssessment_sectionId_subjectId_code_key" ON "IAAssessment"("sectionId", "subjectId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "IAAssessment_id_institutionId_key" ON "IAAssessment"("id", "institutionId");

-- CreateIndex
CREATE INDEX "IAComponent_assessmentId_institutionId_idx" ON "IAComponent"("assessmentId", "institutionId");

-- CreateIndex
CREATE INDEX "IAComponent_institutionId_isActive_idx" ON "IAComponent"("institutionId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "IAComponent_assessmentId_name_key" ON "IAComponent"("assessmentId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "IAComponent_id_institutionId_key" ON "IAComponent"("id", "institutionId");

-- CreateIndex
CREATE INDEX "MarksSheet_institutionId_status_idx" ON "MarksSheet"("institutionId", "status");

-- CreateIndex
CREATE INDEX "MarksSheet_academicYearId_institutionId_idx" ON "MarksSheet"("academicYearId", "institutionId");

-- CreateIndex
CREATE INDEX "MarksSheet_courseId_classId_sectionId_idx" ON "MarksSheet"("courseId", "classId", "sectionId");

-- CreateIndex
CREATE INDEX "MarksSheet_subjectId_institutionId_idx" ON "MarksSheet"("subjectId", "institutionId");

-- CreateIndex
CREATE INDEX "MarksSheet_evaluatedByStaffId_institutionId_idx" ON "MarksSheet"("evaluatedByStaffId", "institutionId");

-- CreateIndex
CREATE INDEX "MarksSheet_examinationId_institutionId_idx" ON "MarksSheet"("examinationId", "institutionId");

-- CreateIndex
CREATE INDEX "MarksSheet_examSubjectSlotId_institutionId_idx" ON "MarksSheet"("examSubjectSlotId", "institutionId");

-- CreateIndex
CREATE INDEX "MarksSheet_iaAssessmentId_institutionId_idx" ON "MarksSheet"("iaAssessmentId", "institutionId");

-- CreateIndex
CREATE INDEX "MarksSheet_submittedByUserId_idx" ON "MarksSheet"("submittedByUserId");

-- CreateIndex
CREATE INDEX "MarksSheet_reviewedByUserId_idx" ON "MarksSheet"("reviewedByUserId");

-- CreateIndex
CREATE UNIQUE INDEX "MarksSheet_id_institutionId_key" ON "MarksSheet"("id", "institutionId");

-- AddForeignKey
ALTER TABLE "Examination" ADD CONSTRAINT "Examination_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Examination" ADD CONSTRAINT "Examination_academicYearId_institutionId_fkey" FOREIGN KEY ("academicYearId", "institutionId") REFERENCES "AcademicYear"("id", "institutionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Examination" ADD CONSTRAINT "Examination_academicTermId_institutionId_fkey" FOREIGN KEY ("academicTermId", "institutionId") REFERENCES "AcademicTerm"("id", "institutionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamSubjectSlot" ADD CONSTRAINT "ExamSubjectSlot_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamSubjectSlot" ADD CONSTRAINT "ExamSubjectSlot_examinationId_institutionId_fkey" FOREIGN KEY ("examinationId", "institutionId") REFERENCES "Examination"("id", "institutionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamSubjectSlot" ADD CONSTRAINT "ExamSubjectSlot_subjectId_institutionId_fkey" FOREIGN KEY ("subjectId", "institutionId") REFERENCES "Subject"("id", "institutionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamSubjectSlot" ADD CONSTRAINT "ExamSubjectSlot_classId_institutionId_fkey" FOREIGN KEY ("classId", "institutionId") REFERENCES "Class"("id", "institutionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamSubjectSlot" ADD CONSTRAINT "ExamSubjectSlot_sectionId_institutionId_fkey" FOREIGN KEY ("sectionId", "institutionId") REFERENCES "Section"("id", "institutionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamSubjectSlot" ADD CONSTRAINT "ExamSubjectSlot_examHallId_institutionId_fkey" FOREIGN KEY ("examHallId", "institutionId") REFERENCES "ExamHall"("id", "institutionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamSubjectSlot" ADD CONSTRAINT "ExamSubjectSlot_invigilatorStaffId_institutionId_fkey" FOREIGN KEY ("invigilatorStaffId", "institutionId") REFERENCES "Staff"("id", "institutionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamEligibilityOverride" ADD CONSTRAINT "ExamEligibilityOverride_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamEligibilityOverride" ADD CONSTRAINT "ExamEligibilityOverride_examinationId_institutionId_fkey" FOREIGN KEY ("examinationId", "institutionId") REFERENCES "Examination"("id", "institutionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamEligibilityOverride" ADD CONSTRAINT "ExamEligibilityOverride_examSubjectSlotId_examinationId_in_fkey" FOREIGN KEY ("examSubjectSlotId", "examinationId", "institutionId") REFERENCES "ExamSubjectSlot"("id", "examinationId", "institutionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamEligibilityOverride" ADD CONSTRAINT "ExamEligibilityOverride_studentId_institutionId_fkey" FOREIGN KEY ("studentId", "institutionId") REFERENCES "Student"("id", "institutionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamEligibilityOverride" ADD CONSTRAINT "ExamEligibilityOverride_requestedByUserId_fkey" FOREIGN KEY ("requestedByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamEligibilityOverride" ADD CONSTRAINT "ExamEligibilityOverride_approvedByUserId_fkey" FOREIGN KEY ("approvedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IAAssessment" ADD CONSTRAINT "IAAssessment_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IAAssessment" ADD CONSTRAINT "IAAssessment_academicYearId_institutionId_fkey" FOREIGN KEY ("academicYearId", "institutionId") REFERENCES "AcademicYear"("id", "institutionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IAAssessment" ADD CONSTRAINT "IAAssessment_academicTermId_institutionId_fkey" FOREIGN KEY ("academicTermId", "institutionId") REFERENCES "AcademicTerm"("id", "institutionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IAAssessment" ADD CONSTRAINT "IAAssessment_courseId_institutionId_fkey" FOREIGN KEY ("courseId", "institutionId") REFERENCES "Course"("id", "institutionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IAAssessment" ADD CONSTRAINT "IAAssessment_classId_institutionId_fkey" FOREIGN KEY ("classId", "institutionId") REFERENCES "Class"("id", "institutionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IAAssessment" ADD CONSTRAINT "IAAssessment_sectionId_institutionId_fkey" FOREIGN KEY ("sectionId", "institutionId") REFERENCES "Section"("id", "institutionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IAAssessment" ADD CONSTRAINT "IAAssessment_subjectId_institutionId_fkey" FOREIGN KEY ("subjectId", "institutionId") REFERENCES "Subject"("id", "institutionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IAAssessment" ADD CONSTRAINT "IAAssessment_createdById_institutionId_fkey" FOREIGN KEY ("createdById", "institutionId") REFERENCES "Staff"("id", "institutionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IAComponent" ADD CONSTRAINT "IAComponent_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IAComponent" ADD CONSTRAINT "IAComponent_assessmentId_institutionId_fkey" FOREIGN KEY ("assessmentId", "institutionId") REFERENCES "IAAssessment"("id", "institutionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarksSheet" ADD CONSTRAINT "MarksSheet_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarksSheet" ADD CONSTRAINT "MarksSheet_examinationId_institutionId_fkey" FOREIGN KEY ("examinationId", "institutionId") REFERENCES "Examination"("id", "institutionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarksSheet" ADD CONSTRAINT "MarksSheet_examSubjectSlotId_examinationId_institutionId_fkey" FOREIGN KEY ("examSubjectSlotId", "examinationId", "institutionId") REFERENCES "ExamSubjectSlot"("id", "examinationId", "institutionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarksSheet" ADD CONSTRAINT "MarksSheet_iaAssessmentId_institutionId_fkey" FOREIGN KEY ("iaAssessmentId", "institutionId") REFERENCES "IAAssessment"("id", "institutionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarksSheet" ADD CONSTRAINT "MarksSheet_academicYearId_institutionId_fkey" FOREIGN KEY ("academicYearId", "institutionId") REFERENCES "AcademicYear"("id", "institutionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarksSheet" ADD CONSTRAINT "MarksSheet_academicTermId_institutionId_fkey" FOREIGN KEY ("academicTermId", "institutionId") REFERENCES "AcademicTerm"("id", "institutionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarksSheet" ADD CONSTRAINT "MarksSheet_courseId_institutionId_fkey" FOREIGN KEY ("courseId", "institutionId") REFERENCES "Course"("id", "institutionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarksSheet" ADD CONSTRAINT "MarksSheet_classId_institutionId_fkey" FOREIGN KEY ("classId", "institutionId") REFERENCES "Class"("id", "institutionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarksSheet" ADD CONSTRAINT "MarksSheet_sectionId_institutionId_fkey" FOREIGN KEY ("sectionId", "institutionId") REFERENCES "Section"("id", "institutionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarksSheet" ADD CONSTRAINT "MarksSheet_subjectId_institutionId_fkey" FOREIGN KEY ("subjectId", "institutionId") REFERENCES "Subject"("id", "institutionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarksSheet" ADD CONSTRAINT "MarksSheet_evaluatedByStaffId_institutionId_fkey" FOREIGN KEY ("evaluatedByStaffId", "institutionId") REFERENCES "Staff"("id", "institutionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarksSheet" ADD CONSTRAINT "MarksSheet_submittedByUserId_fkey" FOREIGN KEY ("submittedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarksSheet" ADD CONSTRAINT "MarksSheet_reviewedByUserId_fkey" FOREIGN KEY ("reviewedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;



-- ============================================================================
-- BATCH 4 INTEGRITY ENHANCEMENTS & SAFETY REVIEWS
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. MarksSheet Context & Workflow State CHECK Constraints
-- ----------------------------------------------------------------------------

-- Enforce MarksSheet assessment context exclusivity:
-- Context EXAMINATION requires examSubjectSlotId and examinationId; iaAssessmentId must be NULL.
-- Context INTERNAL_ASSESSMENT requires iaAssessmentId; examinationId and examSubjectSlotId must be NULL.
ALTER TABLE "MarksSheet" ADD CONSTRAINT "check_markssheet_context_validity" CHECK (
  (
    "contextType" = 'EXAMINATION'::"AssessmentContext" AND
    "examSubjectSlotId" IS NOT NULL AND
    "examinationId" IS NOT NULL AND
    "iaAssessmentId" IS NULL
  ) OR (
    "contextType" = 'INTERNAL_ASSESSMENT'::"AssessmentContext" AND
    "iaAssessmentId" IS NOT NULL AND
    "examinationId" IS NULL AND
    "examSubjectSlotId" IS NULL
  )
);

-- Locking consistency: if isLocked is true, lockedAt must be provided.
ALTER TABLE "MarksSheet" ADD CONSTRAINT "check_markssheet_lock_consistency" CHECK (
  ("isLocked" = false) OR ("isLocked" = true AND "lockedAt" IS NOT NULL)
);

-- Submission consistency: once submitted/under review/approved/locked, submittedAt must be provided.
ALTER TABLE "MarksSheet" ADD CONSTRAINT "check_markssheet_submission_consistency" CHECK (
  ("status" = 'DRAFT'::"MarksSheetStatus") OR ("submittedAt" IS NOT NULL)
);

-- Review consistency: if status is approved or rejected, reviewedAt must be provided.
ALTER TABLE "MarksSheet" ADD CONSTRAINT "check_markssheet_review_consistency" CHECK (
  ("status" NOT IN ('APPROVED'::"MarksSheetStatus", 'REJECTED'::"MarksSheetStatus")) OR ("reviewedAt" IS NOT NULL)
);

-- ----------------------------------------------------------------------------
-- 2. ExamEligibilityOverride Approval Audit & Separation of Duties
-- ----------------------------------------------------------------------------

-- Approval fields: if status is APPROVED or REJECTED, approvedByUserId and approvedAt must be set.
ALTER TABLE "ExamEligibilityOverride" ADD CONSTRAINT "check_override_approval_fields" CHECK (
  (
    "status" IN ('APPROVED'::"OverrideStatus", 'REJECTED'::"OverrideStatus") AND
    "approvedByUserId" IS NOT NULL AND
    "approvedAt" IS NOT NULL
  ) OR (
    "status" IN ('PENDING'::"OverrideStatus", 'CANCELLED'::"OverrideStatus")
  )
);

-- Separation of duties: requester and approver must be different users.
ALTER TABLE "ExamEligibilityOverride" ADD CONSTRAINT "check_override_segregation_of_duties" CHECK (
  "approvedByUserId" IS NULL OR "approvedByUserId" <> "requestedByUserId"
);

-- Active override partial unique index (Examination-wide scope):
-- Enforces that a student cannot have duplicate PENDING or APPROVED overrides for the entire examination.
-- Historical REJECTED or CANCELLED records remain unaffected.
CREATE UNIQUE INDEX "idx_exam_override_active_exam_wide"
ON "ExamEligibilityOverride" ("institutionId", "examinationId", "studentId", "type")
WHERE "examSubjectSlotId" IS NULL AND "status" IN ('PENDING', 'APPROVED');

-- Active override partial unique index (Slot/Subject-specific scope):
-- Enforces that a student cannot have duplicate PENDING or APPROVED overrides for a specific subject slot.
-- Historical REJECTED or CANCELLED records remain unaffected.
CREATE UNIQUE INDEX "idx_exam_override_active_slot_specific"
ON "ExamEligibilityOverride" ("institutionId", "examinationId", "examSubjectSlotId", "studentId", "type")
WHERE "examSubjectSlotId" IS NOT NULL AND "status" IN ('PENDING', 'APPROVED');

-- ----------------------------------------------------------------------------
-- 3. ExamSubjectSlot Timing, Duration, and Marks CHECK Constraints
-- ----------------------------------------------------------------------------

-- Timing validity: startTime must be strictly earlier than endTime.
ALTER TABLE "ExamSubjectSlot" ADD CONSTRAINT "check_exam_slot_time_validity" CHECK (
  "startTime" < "endTime"
);

-- Duration positive: durationMinutes must be greater than zero.
ALTER TABLE "ExamSubjectSlot" ADD CONSTRAINT "check_exam_slot_duration_positive" CHECK (
  "durationMinutes" > 0
);

-- Maximum marks: must be greater than zero.
ALTER TABLE "ExamSubjectSlot" ADD CONSTRAINT "check_exam_slot_max_marks_positive" CHECK (
  "maxMarks" > 0
);

-- Passing marks: must be non-negative and not exceed maximum marks.
ALTER TABLE "ExamSubjectSlot" ADD CONSTRAINT "check_exam_slot_passing_marks_range" CHECK (
  "passingMarks" >= 0 AND "passingMarks" <= "maxMarks"
);

-- ----------------------------------------------------------------------------
-- 4. IAAssessment Marks and Weightage CHECK Constraints
-- ----------------------------------------------------------------------------

-- Maximum marks: must be greater than zero.
ALTER TABLE "IAAssessment" ADD CONSTRAINT "check_ia_assessment_max_marks_positive" CHECK (
  "maxMarks" > 0
);

-- Passing marks: if specified, must be non-negative and not exceed maximum marks.
ALTER TABLE "IAAssessment" ADD CONSTRAINT "check_ia_assessment_passing_marks_range" CHECK (
  "passingMarks" IS NULL OR ("passingMarks" >= 0 AND "passingMarks" <= "maxMarks")
);

-- Weightage percentage: if specified, must be between 0.00 and 100.00.
ALTER TABLE "IAAssessment" ADD CONSTRAINT "check_ia_assessment_weightage_percentage_range" CHECK (
  "weightagePercentage" IS NULL OR ("weightagePercentage" >= 0 AND "weightagePercentage" <= 100.00)
);

-- ----------------------------------------------------------------------------
-- 5. IAComponent Marks, Weightage, and Order CHECK Constraints
-- ----------------------------------------------------------------------------

-- Maximum marks: must be greater than zero.
ALTER TABLE "IAComponent" ADD CONSTRAINT "check_ia_component_max_marks_positive" CHECK (
  "maxMarks" > 0
);

-- Passing marks: if specified, must be non-negative and not exceed maximum marks.
ALTER TABLE "IAComponent" ADD CONSTRAINT "check_ia_component_passing_marks_range" CHECK (
  "passingMarks" IS NULL OR ("passingMarks" >= 0 AND "passingMarks" <= "maxMarks")
);

-- Weightage percentage: must be between 0.00 and 100.00.
ALTER TABLE "IAComponent" ADD CONSTRAINT "check_ia_component_weightage_range" CHECK (
  "weightagePercentage" >= 0 AND "weightagePercentage" <= 100.00
);

-- Display order: must be a positive integer (>= 1).
ALTER TABLE "IAComponent" ADD CONSTRAINT "check_ia_component_display_order_positive" CHECK (
  "displayOrder" >= 1
);

-- ----------------------------------------------------------------------------
-- 6. Academic Hierarchy Validation Triggers
-- ----------------------------------------------------------------------------

-- Trigger Function: Validate Academic Term & Year consistency for Examination, IAAssessment, and MarksSheet
CREATE OR REPLACE FUNCTION fn_validate_academic_hierarchy_batch4()
RETURNS TRIGGER AS $$
BEGIN
  -- If academicTermId is present, verify that it belongs to academicYearId and institutionId
  IF NEW."academicTermId" IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM "AcademicTerm"
      WHERE "id" = NEW."academicTermId"
        AND "academicYearId" = NEW."academicYearId"
        AND "institutionId" = NEW."institutionId"
    ) THEN
      RAISE EXCEPTION 'Academic hierarchy violation: AcademicTerm % does not belong to AcademicYear % in Institution %',
        NEW."academicTermId", NEW."academicYearId", NEW."institutionId";
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "trg_check_examination_term_year"
BEFORE INSERT OR UPDATE OF "academicTermId", "academicYearId" ON "Examination"
FOR EACH ROW EXECUTE FUNCTION fn_validate_academic_hierarchy_batch4();

CREATE TRIGGER "trg_check_ia_assessment_term_year"
BEFORE INSERT OR UPDATE OF "academicTermId", "academicYearId" ON "IAAssessment"
FOR EACH ROW EXECUTE FUNCTION fn_validate_academic_hierarchy_batch4();

CREATE TRIGGER "trg_check_markssheet_term_year"
BEFORE INSERT OR UPDATE OF "academicTermId", "academicYearId" ON "MarksSheet"
FOR EACH ROW EXECUTE FUNCTION fn_validate_academic_hierarchy_batch4();

-- Trigger Function: Validate ExamSubjectSlot section belongs to class
CREATE OR REPLACE FUNCTION fn_validate_exam_slot_class_section()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW."sectionId" IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM "Section"
      WHERE "id" = NEW."sectionId"
        AND "classId" = NEW."classId"
        AND "institutionId" = NEW."institutionId"
    ) THEN
      RAISE EXCEPTION 'Academic hierarchy violation: Section % does not belong to Class % in Institution %',
        NEW."sectionId", NEW."classId", NEW."institutionId";
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "trg_check_exam_slot_class_section"
BEFORE INSERT OR UPDATE OF "sectionId", "classId" ON "ExamSubjectSlot"
FOR EACH ROW EXECUTE FUNCTION fn_validate_exam_slot_class_section();

-- Trigger Function: Validate IAAssessment hierarchy (Course -> Class -> Section and Subject alignment)
CREATE OR REPLACE FUNCTION fn_validate_ia_assessment_hierarchy()
RETURNS TRIGGER AS $$
BEGIN
  -- Verify Section belongs to Class
  IF NOT EXISTS (
    SELECT 1 FROM "Section"
    WHERE "id" = NEW."sectionId"
      AND "classId" = NEW."classId"
      AND "institutionId" = NEW."institutionId"
  ) THEN
    RAISE EXCEPTION 'IAAssessment hierarchy violation: Section % does not belong to Class %',
      NEW."sectionId", NEW."classId";
  END IF;

  -- Verify Class belongs to Course and AcademicYear
  IF NOT EXISTS (
    SELECT 1 FROM "Class"
    WHERE "id" = NEW."classId"
      AND "courseId" = NEW."courseId"
      AND "academicYearId" = NEW."academicYearId"
      AND "institutionId" = NEW."institutionId"
  ) THEN
    RAISE EXCEPTION 'IAAssessment hierarchy violation: Class % does not belong to Course % and AcademicYear %',
      NEW."classId", NEW."courseId", NEW."academicYearId";
  END IF;

  -- Verify Subject belongs to Course if Subject has courseId specified
  IF EXISTS (
    SELECT 1 FROM "Subject"
    WHERE "id" = NEW."subjectId"
      AND "courseId" IS NOT NULL
      AND "courseId" <> NEW."courseId"
  ) THEN
    RAISE EXCEPTION 'IAAssessment hierarchy violation: Subject % is course-specific and does not match Course %',
      NEW."subjectId", NEW."courseId";
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "trg_check_ia_assessment_hierarchy"
BEFORE INSERT OR UPDATE OF "sectionId", "classId", "courseId", "academicYearId", "subjectId" ON "IAAssessment"
FOR EACH ROW EXECUTE FUNCTION fn_validate_ia_assessment_hierarchy();

-- Trigger Function: Validate MarksSheet hierarchy and context alignment
CREATE OR REPLACE FUNCTION fn_validate_markssheet_hierarchy()
RETURNS TRIGGER AS $$
DECLARE
  v_slot_subject UUID;
  v_slot_class UUID;
  v_slot_section UUID;
  v_ia_subject UUID;
  v_ia_class UUID;
  v_ia_section UUID;
  v_ia_course UUID;
  v_ia_year UUID;
BEGIN
  -- Verify Section belongs to Class
  IF NOT EXISTS (
    SELECT 1 FROM "Section"
    WHERE "id" = NEW."sectionId"
      AND "classId" = NEW."classId"
      AND "institutionId" = NEW."institutionId"
  ) THEN
    RAISE EXCEPTION 'MarksSheet hierarchy violation: Section % does not belong to Class %',
      NEW."sectionId", NEW."classId";
  END IF;

  -- Verify Class belongs to Course and AcademicYear
  IF NOT EXISTS (
    SELECT 1 FROM "Class"
    WHERE "id" = NEW."classId"
      AND "courseId" = NEW."courseId"
      AND "academicYearId" = NEW."academicYearId"
      AND "institutionId" = NEW."institutionId"
  ) THEN
    RAISE EXCEPTION 'MarksSheet hierarchy violation: Class % does not belong to Course % and AcademicYear %',
      NEW."classId", NEW."courseId", NEW."academicYearId";
  END IF;

  -- If context is EXAMINATION, verify slot matches subject, class, and section
  IF NEW."contextType" = 'EXAMINATION'::"AssessmentContext" THEN
    SELECT "subjectId", "classId", "sectionId"
    INTO v_slot_subject, v_slot_class, v_slot_section
    FROM "ExamSubjectSlot"
    WHERE "id" = NEW."examSubjectSlotId"
      AND "institutionId" = NEW."institutionId";

    IF v_slot_subject <> NEW."subjectId" THEN
      RAISE EXCEPTION 'MarksSheet context mismatch: Subject % does not match ExamSubjectSlot subject %',
        NEW."subjectId", v_slot_subject;
    END IF;
    IF v_slot_class <> NEW."classId" THEN
      RAISE EXCEPTION 'MarksSheet context mismatch: Class % does not match ExamSubjectSlot class %',
        NEW."classId", v_slot_class;
    END IF;
    IF v_slot_section IS NOT NULL AND v_slot_section <> NEW."sectionId" THEN
      RAISE EXCEPTION 'MarksSheet context mismatch: Section % does not match ExamSubjectSlot section %',
        NEW."sectionId", v_slot_section;
    END IF;
  END IF;

  -- If context is INTERNAL_ASSESSMENT, verify assessment matches subject, class, section, course, and year
  IF NEW."contextType" = 'INTERNAL_ASSESSMENT'::"AssessmentContext" THEN
    SELECT "subjectId", "classId", "sectionId", "courseId", "academicYearId"
    INTO v_ia_subject, v_ia_class, v_ia_section, v_ia_course, v_ia_year
    FROM "IAAssessment"
    WHERE "id" = NEW."iaAssessmentId"
      AND "institutionId" = NEW."institutionId";

    IF v_ia_subject <> NEW."subjectId" OR v_ia_class <> NEW."classId" OR v_ia_section <> NEW."sectionId" OR v_ia_course <> NEW."courseId" OR v_ia_year <> NEW."academicYearId" THEN
      RAISE EXCEPTION 'MarksSheet context mismatch: MarksSheet attributes do not match IAAssessment attributes';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "trg_check_markssheet_hierarchy"
BEFORE INSERT OR UPDATE OF "sectionId", "classId", "courseId", "academicYearId", "subjectId", "examSubjectSlotId", "iaAssessmentId" ON "MarksSheet"
FOR EACH ROW EXECUTE FUNCTION fn_validate_markssheet_hierarchy();

-- Trigger Function: Prevent changing AcademicTerm.academicYearId if referenced by existing exams or assessments
CREATE OR REPLACE FUNCTION fn_prevent_academic_term_year_mutation()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD."academicYearId" <> NEW."academicYearId" THEN
    IF EXISTS (SELECT 1 FROM "Examination" WHERE "academicTermId" = OLD."id") THEN
      RAISE EXCEPTION 'Cannot change academicYearId of AcademicTerm % because it is referenced by existing Examinations', OLD."id";
    END IF;
    IF EXISTS (SELECT 1 FROM "IAAssessment" WHERE "academicTermId" = OLD."id") THEN
      RAISE EXCEPTION 'Cannot change academicYearId of AcademicTerm % because it is referenced by existing IA Assessments', OLD."id";
    END IF;
    IF EXISTS (SELECT 1 FROM "MarksSheet" WHERE "academicTermId" = OLD."id") THEN
      RAISE EXCEPTION 'Cannot change academicYearId of AcademicTerm % because it is referenced by existing MarksSheets', OLD."id";
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "trg_prevent_academic_term_year_mutation"
BEFORE UPDATE OF "academicYearId" ON "AcademicTerm"
FOR EACH ROW EXECUTE FUNCTION fn_prevent_academic_term_year_mutation();

-- ----------------------------------------------------------------------------
-- 7. ExamSubjectSlot Scheduling Concurrency & Collision Prevention Trigger
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION fn_check_exam_slot_scheduling_conflicts()
RETURNS TRIGGER AS $$
DECLARE
  v_conflict_id UUID;
BEGIN
  -- Skip collision checks if the slot is CANCELLED
  IF NEW."status" = 'CANCELLED'::"ExamStatus" THEN
    RETURN NEW;
  END IF;

  -- 1. Pessimistic row-level locking on scheduled resources to eliminate concurrent race conditions
  IF NEW."examHallId" IS NOT NULL THEN
    PERFORM 1 FROM "ExamHall" WHERE "id" = NEW."examHallId" FOR UPDATE;
  END IF;
  IF NEW."invigilatorStaffId" IS NOT NULL THEN
    PERFORM 1 FROM "Staff" WHERE "id" = NEW."invigilatorStaffId" FOR UPDATE;
  END IF;
  IF NEW."sectionId" IS NOT NULL THEN
    PERFORM 1 FROM "Section" WHERE "id" = NEW."sectionId" FOR UPDATE;
  END IF;

  -- 2. Check Hall collision (overlapping time on same date in same hall)
  IF NEW."examHallId" IS NOT NULL THEN
    SELECT "id" INTO v_conflict_id
    FROM "ExamSubjectSlot"
    WHERE "institutionId" = NEW."institutionId"
      AND "examHallId" = NEW."examHallId"
      AND "examDate" = NEW."examDate"
      AND "status" <> 'CANCELLED'::"ExamStatus"
      AND "id" <> NEW."id"
      AND (NEW."startTime" < "endTime" AND NEW."endTime" > "startTime")
    LIMIT 1;

    IF v_conflict_id IS NOT NULL THEN
      RAISE EXCEPTION 'Schedule conflict: ExamHall % is already booked on % between overlapping time window for slot %',
        NEW."examHallId", NEW."examDate", v_conflict_id;
    END IF;
  END IF;

  -- 3. Check Invigilator collision (overlapping time on same date for same invigilator)
  IF NEW."invigilatorStaffId" IS NOT NULL THEN
    SELECT "id" INTO v_conflict_id
    FROM "ExamSubjectSlot"
    WHERE "institutionId" = NEW."institutionId"
      AND "invigilatorStaffId" = NEW."invigilatorStaffId"
      AND "examDate" = NEW."examDate"
      AND "status" <> 'CANCELLED'::"ExamStatus"
      AND "id" <> NEW."id"
      AND (NEW."startTime" < "endTime" AND NEW."endTime" > "startTime")
    LIMIT 1;

    IF v_conflict_id IS NOT NULL THEN
      RAISE EXCEPTION 'Schedule conflict: Invigilator % is already assigned on % during overlapping time window for slot %',
        NEW."invigilatorStaffId", NEW."examDate", v_conflict_id;
    END IF;
  END IF;

  -- 4. Check Section collision (same section cannot take overlapping exams)
  IF NEW."sectionId" IS NOT NULL THEN
    SELECT "id" INTO v_conflict_id
    FROM "ExamSubjectSlot"
    WHERE "institutionId" = NEW."institutionId"
      AND "sectionId" = NEW."sectionId"
      AND "examDate" = NEW."examDate"
      AND "status" <> 'CANCELLED'::"ExamStatus"
      AND "id" <> NEW."id"
      AND (NEW."startTime" < "endTime" AND NEW."endTime" > "startTime")
    LIMIT 1;

    IF v_conflict_id IS NOT NULL THEN
      RAISE EXCEPTION 'Schedule conflict: Section % already has an active examination on % during overlapping time window for slot %',
        NEW."sectionId", NEW."examDate", v_conflict_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "trg_check_exam_slot_scheduling_conflicts"
BEFORE INSERT OR UPDATE OF "examHallId", "invigilatorStaffId", "sectionId", "examDate", "startTime", "endTime", "status"
ON "ExamSubjectSlot"
FOR EACH ROW EXECUTE FUNCTION fn_check_exam_slot_scheduling_conflicts();

-- ----------------------------------------------------------------------------
-- 8. ExamEligibilityOverride Approval Preservation & Audit Trigger
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION fn_audit_override_status_transitions()
RETURNS TRIGGER AS $$
BEGIN
  -- When transitioning to CANCELLED:
  IF NEW."status" = 'CANCELLED'::"OverrideStatus" THEN
    -- If it was previously APPROVED, preserve approval history and record previousStatus
    IF OLD."status" = 'APPROVED'::"OverrideStatus" THEN
      NEW."previousStatus" := 'APPROVED';
      NEW."approvedByUserId" := OLD."approvedByUserId";
      NEW."approvedAt" := OLD."approvedAt";
    ELSIF OLD."status" = 'REJECTED'::"OverrideStatus" THEN
      NEW."previousStatus" := 'REJECTED';
      NEW."approvedByUserId" := OLD."approvedByUserId";
      NEW."approvedAt" := OLD."approvedAt";
    ELSIF OLD."status" = 'PENDING'::"OverrideStatus" THEN
      NEW."previousStatus" := 'PENDING';
    END IF;
  END IF;

  -- Prevent modifying approval history once approved or rejected
  IF OLD."status" IN ('APPROVED'::"OverrideStatus", 'REJECTED'::"OverrideStatus") AND NEW."status" = OLD."status" THEN
    IF NEW."approvedByUserId" <> OLD."approvedByUserId" OR NEW."approvedAt" <> OLD."approvedAt" THEN
      RAISE EXCEPTION 'Cannot modify approval history for an override that is already %', OLD."status";
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "trg_audit_override_status_transitions"
BEFORE UPDATE ON "ExamEligibilityOverride"
FOR EACH ROW EXECUTE FUNCTION fn_audit_override_status_transitions();
