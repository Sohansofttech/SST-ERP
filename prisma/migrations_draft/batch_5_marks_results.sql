-- CreateEnum
CREATE TYPE "MarkAttendanceStatus" AS ENUM ('PRESENT', 'ABSENT', 'MALPRACTICE', 'EXEMPTED', 'WITHHELD');

-- CreateEnum
CREATE TYPE "ResultBatchStatus" AS ENUM ('DRAFT', 'PROCESSING', 'GENERATED', 'UNDER_REVIEW', 'APPROVED', 'PUBLISHED', 'REJECTED', 'WITHHELD');

-- CreateEnum
CREATE TYPE "ResultType" AS ENUM ('REGULAR', 'REVALUATION', 'SUPPLEMENTARY', 'SPECIAL');

-- CreateEnum
CREATE TYPE "SemesterResultStatus" AS ENUM ('PASS', 'FAIL', 'PROMOTED_WITH_BACKLOG', 'WITHHELD', 'ABSENT');

-- CreateTable
CREATE TABLE "StudentAssessmentMark" (
    "id" UUID NOT NULL,
    "institutionId" UUID NOT NULL,
    "marksSheetId" UUID NOT NULL,
    "studentId" UUID NOT NULL,
    "attendance" "MarkAttendanceStatus" NOT NULL DEFAULT 'PRESENT',
    "marksObtained" DECIMAL(5,2),
    "maxMarks" DECIMAL(5,2) NOT NULL,
    "percentage" DECIMAL(5,2),
    "isPassed" BOOLEAN,
    "graceMarks" DECIMAL(5,2) DEFAULT 0.00,
    "isModerated" BOOLEAN NOT NULL DEFAULT false,
    "moderatedMarks" DECIMAL(5,2),
    "moderationReason" TEXT,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentAssessmentMark_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentComponentScore" (
    "id" UUID NOT NULL,
    "institutionId" UUID NOT NULL,
    "assessmentMarkId" UUID NOT NULL,
    "componentId" UUID NOT NULL,
    "studentId" UUID NOT NULL,
    "marksObtained" DECIMAL(5,2),
    "maxMarks" DECIMAL(5,2) NOT NULL,
    "isAbsent" BOOLEAN NOT NULL DEFAULT false,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentComponentScore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarksAuditLog" (
    "id" UUID NOT NULL,
    "institutionId" UUID NOT NULL,
    "assessmentMarkId" UUID NOT NULL,
    "action" TEXT NOT NULL,
    "previousMarks" DECIMAL(5,2),
    "newMarks" DECIMAL(5,2),
    "previousAttendance" "MarkAttendanceStatus",
    "newAttendance" "MarkAttendanceStatus",
    "reason" TEXT NOT NULL,
    "changedByUserId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MarksAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GradingScale" (
    "id" UUID NOT NULL,
    "institutionId" UUID NOT NULL,
    "courseId" UUID,
    "name" TEXT NOT NULL,
    "grade" TEXT NOT NULL,
    "minPercentage" DECIMAL(5,2) NOT NULL,
    "maxPercentage" DECIMAL(5,2) NOT NULL,
    "gradePoint" DECIMAL(4,2) NOT NULL,
    "description" TEXT,
    "isPassing" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GradingScale_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResultBatch" (
    "id" UUID NOT NULL,
    "institutionId" UUID NOT NULL,
    "academicYearId" UUID NOT NULL,
    "academicTermId" UUID,
    "courseId" UUID NOT NULL,
    "classId" UUID NOT NULL,
    "examinationId" UUID,
    "batchName" TEXT NOT NULL,
    "batchNumber" TEXT NOT NULL,
    "resultType" "ResultType" NOT NULL DEFAULT 'REGULAR',
    "status" "ResultBatchStatus" NOT NULL DEFAULT 'DRAFT',
    "totalStudents" INTEGER NOT NULL DEFAULT 0,
    "passedStudents" INTEGER NOT NULL DEFAULT 0,
    "failedStudents" INTEGER NOT NULL DEFAULT 0,
    "passPercentage" DECIMAL(5,2),
    "processedAt" TIMESTAMP(3),
    "publishedAt" TIMESTAMP(3),
    "approvedByUserId" UUID,
    "approvedAt" TIMESTAMP(3),
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ResultBatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentSemesterResult" (
    "id" UUID NOT NULL,
    "institutionId" UUID NOT NULL,
    "resultBatchId" UUID NOT NULL,
    "studentId" UUID NOT NULL,
    "academicYearId" UUID NOT NULL,
    "academicTermId" UUID,
    "courseId" UUID NOT NULL,
    "classId" UUID NOT NULL,
    "sectionId" UUID,
    "semester" INTEGER NOT NULL,
    "totalCreditsOffered" DECIMAL(5,2) NOT NULL,
    "totalCreditsEarned" DECIMAL(5,2) NOT NULL,
    "totalQualityPoints" DECIMAL(7,2) NOT NULL,
    "sgpa" DECIMAL(4,2) NOT NULL,
    "cgpa" DECIMAL(4,2),
    "status" "SemesterResultStatus" NOT NULL DEFAULT 'PASS',
    "classification" TEXT,
    "backlogsCount" INTEGER NOT NULL DEFAULT 0,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentSemesterResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentSubjectResult" (
    "id" UUID NOT NULL,
    "institutionId" UUID NOT NULL,
    "semesterResultId" UUID NOT NULL,
    "studentId" UUID NOT NULL,
    "subjectId" UUID NOT NULL,
    "internalMarks" DECIMAL(5,2),
    "externalMarks" DECIMAL(5,2),
    "totalMarks" DECIMAL(5,2) NOT NULL,
    "maxMarks" DECIMAL(5,2) NOT NULL,
    "percentage" DECIMAL(5,2) NOT NULL,
    "grade" TEXT NOT NULL,
    "gradePoint" DECIMAL(4,2) NOT NULL,
    "credits" INTEGER NOT NULL,
    "qualityPoints" DECIMAL(6,2) NOT NULL,
    "isPassed" BOOLEAN NOT NULL DEFAULT true,
    "attemptsCount" INTEGER NOT NULL DEFAULT 1,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentSubjectResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResultAuditLog" (
    "id" UUID NOT NULL,
    "institutionId" UUID NOT NULL,
    "resultBatchId" UUID,
    "semesterResultId" UUID,
    "action" TEXT NOT NULL,
    "previousStatus" TEXT,
    "newStatus" TEXT,
    "previousSgpa" DECIMAL(4,2),
    "newSgpa" DECIMAL(4,2),
    "reason" TEXT NOT NULL,
    "changedByUserId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ResultAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StudentAssessmentMark_studentId_institutionId_idx" ON "StudentAssessmentMark"("studentId", "institutionId");

-- CreateIndex
CREATE INDEX "StudentAssessmentMark_marksSheetId_institutionId_idx" ON "StudentAssessmentMark"("marksSheetId", "institutionId");

-- CreateIndex
CREATE INDEX "StudentAssessmentMark_institutionId_attendance_idx" ON "StudentAssessmentMark"("institutionId", "attendance");

-- CreateIndex
CREATE UNIQUE INDEX "StudentAssessmentMark_id_institutionId_key" ON "StudentAssessmentMark"("id", "institutionId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentAssessmentMark_marksSheetId_studentId_key" ON "StudentAssessmentMark"("marksSheetId", "studentId");

-- CreateIndex
CREATE INDEX "StudentComponentScore_componentId_institutionId_idx" ON "StudentComponentScore"("componentId", "institutionId");

-- CreateIndex
CREATE INDEX "StudentComponentScore_studentId_institutionId_idx" ON "StudentComponentScore"("studentId", "institutionId");

-- CreateIndex
CREATE INDEX "StudentComponentScore_assessmentMarkId_institutionId_idx" ON "StudentComponentScore"("assessmentMarkId", "institutionId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentComponentScore_id_institutionId_key" ON "StudentComponentScore"("id", "institutionId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentComponentScore_assessmentMarkId_componentId_key" ON "StudentComponentScore"("assessmentMarkId", "componentId");

-- CreateIndex
CREATE INDEX "MarksAuditLog_assessmentMarkId_institutionId_idx" ON "MarksAuditLog"("assessmentMarkId", "institutionId");

-- CreateIndex
CREATE INDEX "MarksAuditLog_changedByUserId_idx" ON "MarksAuditLog"("changedByUserId");

-- CreateIndex
CREATE INDEX "MarksAuditLog_institutionId_createdAt_idx" ON "MarksAuditLog"("institutionId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "MarksAuditLog_id_institutionId_key" ON "MarksAuditLog"("id", "institutionId");

-- CreateIndex
CREATE INDEX "GradingScale_institutionId_isActive_idx" ON "GradingScale"("institutionId", "isActive");

-- CreateIndex
CREATE INDEX "GradingScale_courseId_institutionId_idx" ON "GradingScale"("courseId", "institutionId");

-- CreateIndex
CREATE UNIQUE INDEX "GradingScale_id_institutionId_key" ON "GradingScale"("id", "institutionId");

-- CreateIndex
CREATE UNIQUE INDEX "GradingScale_institutionId_courseId_grade_key" ON "GradingScale"("institutionId", "courseId", "grade");

-- CreateIndex
CREATE INDEX "ResultBatch_institutionId_status_idx" ON "ResultBatch"("institutionId", "status");

-- CreateIndex
CREATE INDEX "ResultBatch_academicYearId_institutionId_idx" ON "ResultBatch"("academicYearId", "institutionId");

-- CreateIndex
CREATE INDEX "ResultBatch_courseId_classId_idx" ON "ResultBatch"("courseId", "classId");

-- CreateIndex
CREATE INDEX "ResultBatch_examinationId_institutionId_idx" ON "ResultBatch"("examinationId", "institutionId");

-- CreateIndex
CREATE INDEX "ResultBatch_approvedByUserId_idx" ON "ResultBatch"("approvedByUserId");

-- CreateIndex
CREATE UNIQUE INDEX "ResultBatch_id_institutionId_key" ON "ResultBatch"("id", "institutionId");

-- CreateIndex
CREATE UNIQUE INDEX "ResultBatch_institutionId_batchNumber_key" ON "ResultBatch"("institutionId", "batchNumber");

-- CreateIndex
CREATE INDEX "StudentSemesterResult_studentId_academicYearId_semester_idx" ON "StudentSemesterResult"("studentId", "academicYearId", "semester");

-- CreateIndex
CREATE INDEX "StudentSemesterResult_institutionId_status_idx" ON "StudentSemesterResult"("institutionId", "status");

-- CreateIndex
CREATE INDEX "StudentSemesterResult_courseId_classId_sectionId_idx" ON "StudentSemesterResult"("courseId", "classId", "sectionId");

-- CreateIndex
CREATE INDEX "StudentSemesterResult_resultBatchId_institutionId_idx" ON "StudentSemesterResult"("resultBatchId", "institutionId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentSemesterResult_id_institutionId_key" ON "StudentSemesterResult"("id", "institutionId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentSemesterResult_resultBatchId_studentId_key" ON "StudentSemesterResult"("resultBatchId", "studentId");

-- CreateIndex
CREATE INDEX "StudentSubjectResult_studentId_subjectId_idx" ON "StudentSubjectResult"("studentId", "subjectId");

-- CreateIndex
CREATE INDEX "StudentSubjectResult_subjectId_institutionId_idx" ON "StudentSubjectResult"("subjectId", "institutionId");

-- CreateIndex
CREATE INDEX "StudentSubjectResult_semesterResultId_institutionId_idx" ON "StudentSubjectResult"("semesterResultId", "institutionId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentSubjectResult_id_institutionId_key" ON "StudentSubjectResult"("id", "institutionId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentSubjectResult_semesterResultId_subjectId_key" ON "StudentSubjectResult"("semesterResultId", "subjectId");

-- CreateIndex
CREATE INDEX "ResultAuditLog_resultBatchId_institutionId_idx" ON "ResultAuditLog"("resultBatchId", "institutionId");

-- CreateIndex
CREATE INDEX "ResultAuditLog_semesterResultId_institutionId_idx" ON "ResultAuditLog"("semesterResultId", "institutionId");

-- CreateIndex
CREATE INDEX "ResultAuditLog_changedByUserId_idx" ON "ResultAuditLog"("changedByUserId");

-- CreateIndex
CREATE INDEX "ResultAuditLog_institutionId_createdAt_idx" ON "ResultAuditLog"("institutionId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ResultAuditLog_id_institutionId_key" ON "ResultAuditLog"("id", "institutionId");

-- AddForeignKey
ALTER TABLE "StudentAssessmentMark" ADD CONSTRAINT "StudentAssessmentMark_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentAssessmentMark" ADD CONSTRAINT "StudentAssessmentMark_marksSheetId_institutionId_fkey" FOREIGN KEY ("marksSheetId", "institutionId") REFERENCES "MarksSheet"("id", "institutionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentAssessmentMark" ADD CONSTRAINT "StudentAssessmentMark_studentId_institutionId_fkey" FOREIGN KEY ("studentId", "institutionId") REFERENCES "Student"("id", "institutionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentComponentScore" ADD CONSTRAINT "StudentComponentScore_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentComponentScore" ADD CONSTRAINT "StudentComponentScore_assessmentMarkId_institutionId_fkey" FOREIGN KEY ("assessmentMarkId", "institutionId") REFERENCES "StudentAssessmentMark"("id", "institutionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentComponentScore" ADD CONSTRAINT "StudentComponentScore_componentId_institutionId_fkey" FOREIGN KEY ("componentId", "institutionId") REFERENCES "IAComponent"("id", "institutionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentComponentScore" ADD CONSTRAINT "StudentComponentScore_studentId_institutionId_fkey" FOREIGN KEY ("studentId", "institutionId") REFERENCES "Student"("id", "institutionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarksAuditLog" ADD CONSTRAINT "MarksAuditLog_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarksAuditLog" ADD CONSTRAINT "MarksAuditLog_assessmentMarkId_institutionId_fkey" FOREIGN KEY ("assessmentMarkId", "institutionId") REFERENCES "StudentAssessmentMark"("id", "institutionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarksAuditLog" ADD CONSTRAINT "MarksAuditLog_changedByUserId_fkey" FOREIGN KEY ("changedByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GradingScale" ADD CONSTRAINT "GradingScale_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GradingScale" ADD CONSTRAINT "GradingScale_courseId_institutionId_fkey" FOREIGN KEY ("courseId", "institutionId") REFERENCES "Course"("id", "institutionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResultBatch" ADD CONSTRAINT "ResultBatch_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResultBatch" ADD CONSTRAINT "ResultBatch_academicYearId_institutionId_fkey" FOREIGN KEY ("academicYearId", "institutionId") REFERENCES "AcademicYear"("id", "institutionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResultBatch" ADD CONSTRAINT "ResultBatch_academicTermId_institutionId_fkey" FOREIGN KEY ("academicTermId", "institutionId") REFERENCES "AcademicTerm"("id", "institutionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResultBatch" ADD CONSTRAINT "ResultBatch_courseId_institutionId_fkey" FOREIGN KEY ("courseId", "institutionId") REFERENCES "Course"("id", "institutionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResultBatch" ADD CONSTRAINT "ResultBatch_classId_institutionId_fkey" FOREIGN KEY ("classId", "institutionId") REFERENCES "Class"("id", "institutionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResultBatch" ADD CONSTRAINT "ResultBatch_examinationId_institutionId_fkey" FOREIGN KEY ("examinationId", "institutionId") REFERENCES "Examination"("id", "institutionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResultBatch" ADD CONSTRAINT "ResultBatch_approvedByUserId_fkey" FOREIGN KEY ("approvedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentSemesterResult" ADD CONSTRAINT "StudentSemesterResult_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentSemesterResult" ADD CONSTRAINT "StudentSemesterResult_resultBatchId_institutionId_fkey" FOREIGN KEY ("resultBatchId", "institutionId") REFERENCES "ResultBatch"("id", "institutionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentSemesterResult" ADD CONSTRAINT "StudentSemesterResult_studentId_institutionId_fkey" FOREIGN KEY ("studentId", "institutionId") REFERENCES "Student"("id", "institutionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentSemesterResult" ADD CONSTRAINT "StudentSemesterResult_academicYearId_institutionId_fkey" FOREIGN KEY ("academicYearId", "institutionId") REFERENCES "AcademicYear"("id", "institutionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentSemesterResult" ADD CONSTRAINT "StudentSemesterResult_academicTermId_institutionId_fkey" FOREIGN KEY ("academicTermId", "institutionId") REFERENCES "AcademicTerm"("id", "institutionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentSemesterResult" ADD CONSTRAINT "StudentSemesterResult_courseId_institutionId_fkey" FOREIGN KEY ("courseId", "institutionId") REFERENCES "Course"("id", "institutionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentSemesterResult" ADD CONSTRAINT "StudentSemesterResult_classId_institutionId_fkey" FOREIGN KEY ("classId", "institutionId") REFERENCES "Class"("id", "institutionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentSemesterResult" ADD CONSTRAINT "StudentSemesterResult_sectionId_institutionId_fkey" FOREIGN KEY ("sectionId", "institutionId") REFERENCES "Section"("id", "institutionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentSubjectResult" ADD CONSTRAINT "StudentSubjectResult_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentSubjectResult" ADD CONSTRAINT "StudentSubjectResult_semesterResultId_institutionId_fkey" FOREIGN KEY ("semesterResultId", "institutionId") REFERENCES "StudentSemesterResult"("id", "institutionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentSubjectResult" ADD CONSTRAINT "StudentSubjectResult_studentId_institutionId_fkey" FOREIGN KEY ("studentId", "institutionId") REFERENCES "Student"("id", "institutionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentSubjectResult" ADD CONSTRAINT "StudentSubjectResult_subjectId_institutionId_fkey" FOREIGN KEY ("subjectId", "institutionId") REFERENCES "Subject"("id", "institutionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResultAuditLog" ADD CONSTRAINT "ResultAuditLog_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResultAuditLog" ADD CONSTRAINT "ResultAuditLog_resultBatchId_institutionId_fkey" FOREIGN KEY ("resultBatchId", "institutionId") REFERENCES "ResultBatch"("id", "institutionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResultAuditLog" ADD CONSTRAINT "ResultAuditLog_semesterResultId_institutionId_fkey" FOREIGN KEY ("semesterResultId", "institutionId") REFERENCES "StudentSemesterResult"("id", "institutionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResultAuditLog" ADD CONSTRAINT "ResultAuditLog_changedByUserId_fkey" FOREIGN KEY ("changedByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;



-- ============================================================================
-- BATCH 5 INTEGRITY ENHANCEMENTS & BUSINESS CONSTRAINTS
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. StudentAssessmentMark & StudentComponentScore Value Bounds
-- ----------------------------------------------------------------------------

-- Maximum marks must be positive
ALTER TABLE "StudentAssessmentMark" ADD CONSTRAINT "check_assessment_mark_max_marks_positive" CHECK (
  "maxMarks" > 0
);

-- Marks obtained bounds and attendance consistency:
-- If PRESENT, marksObtained must be >= 0 and <= maxMarks.
-- If ABSENT, MALPRACTICE, or WITHHELD, marksObtained must be NULL.
ALTER TABLE "StudentAssessmentMark" ADD CONSTRAINT "check_assessment_mark_attendance_consistency" CHECK (
  (
    "attendance" = 'PRESENT'::"MarkAttendanceStatus" AND
    "marksObtained" IS NOT NULL AND
    "marksObtained" >= 0 AND
    "marksObtained" <= "maxMarks"
  ) OR (
    "attendance" IN ('ABSENT'::"MarkAttendanceStatus", 'MALPRACTICE'::"MarkAttendanceStatus", 'WITHHELD'::"MarkAttendanceStatus") AND
    "marksObtained" IS NULL
  ) OR (
    "attendance" = 'EXEMPTED'::"MarkAttendanceStatus"
  )
);

-- Grace marks non-negative
ALTER TABLE "StudentAssessmentMark" ADD CONSTRAINT "check_assessment_mark_grace_marks_non_negative" CHECK (
  "graceMarks" IS NULL OR "graceMarks" >= 0
);

-- Moderation consistency: if isModerated is true, moderatedMarks must be provided and valid
ALTER TABLE "StudentAssessmentMark" ADD CONSTRAINT "check_assessment_mark_moderation_consistency" CHECK (
  ("isModerated" = false) OR (
    "isModerated" = true AND
    "moderatedMarks" IS NOT NULL AND
    "moderatedMarks" >= 0 AND
    "moderatedMarks" <= "maxMarks"
  )
);

-- Percentage between 0 and 100
ALTER TABLE "StudentAssessmentMark" ADD CONSTRAINT "check_assessment_mark_percentage_range" CHECK (
  "percentage" IS NULL OR ("percentage" >= 0 AND "percentage" <= 100.00)
);

-- StudentComponentScore max marks positive
ALTER TABLE "StudentComponentScore" ADD CONSTRAINT "check_component_score_max_marks_positive" CHECK (
  "maxMarks" > 0
);

-- StudentComponentScore absence consistency:
ALTER TABLE "StudentComponentScore" ADD CONSTRAINT "check_component_score_absence_consistency" CHECK (
  ("isAbsent" = false AND "marksObtained" IS NOT NULL AND "marksObtained" >= 0 AND "marksObtained" <= "maxMarks") OR
  ("isAbsent" = true AND "marksObtained" IS NULL)
);

-- ----------------------------------------------------------------------------
-- 2. GradingScale Percentage Bounds & Grade Point Ranges
-- ----------------------------------------------------------------------------

-- Percentage bounds: 0.00 <= minPercentage <= maxPercentage <= 100.00
ALTER TABLE "GradingScale" ADD CONSTRAINT "check_grading_scale_percentage_bounds" CHECK (
  "minPercentage" >= 0.00 AND
  "maxPercentage" <= 100.00 AND
  "minPercentage" <= "maxPercentage"
);

-- Grade point range: 0.00 to 10.00
ALTER TABLE "GradingScale" ADD CONSTRAINT "check_grading_scale_grade_point_range" CHECK (
  "gradePoint" >= 0.00 AND "gradePoint" <= 10.00
);

-- Display order positive
ALTER TABLE "GradingScale" ADD CONSTRAINT "check_grading_scale_display_order_positive" CHECK (
  "displayOrder" >= 1
);

-- Ensure institution-wide default grades are unique when courseId IS NULL
CREATE UNIQUE INDEX "idx_grading_scale_institution_default_grade"
ON "GradingScale" ("institutionId", "grade")
WHERE "courseId" IS NULL;

-- Ensure course-specific grades are unique when courseId IS NOT NULL
CREATE UNIQUE INDEX "idx_grading_scale_course_specific_grade"
ON "GradingScale" ("institutionId", "courseId", "grade")
WHERE "courseId" IS NOT NULL;

-- ----------------------------------------------------------------------------
-- 3. ResultBatch Processing & Workflow State CHECK Constraints
-- ----------------------------------------------------------------------------

-- Student counts non-negative and consistent
ALTER TABLE "ResultBatch" ADD CONSTRAINT "check_result_batch_counts_consistency" CHECK (
  "totalStudents" >= 0 AND
  "passedStudents" >= 0 AND
  "failedStudents" >= 0 AND
  ("passedStudents" + "failedStudents" <= "totalStudents")
);

-- Pass percentage range: 0.00 to 100.00
ALTER TABLE "ResultBatch" ADD CONSTRAINT "check_result_batch_pass_percentage_range" CHECK (
  "passPercentage" IS NULL OR ("passPercentage" >= 0.00 AND "passPercentage" <= 100.00)
);

-- Approval workflow consistency: if APPROVED or PUBLISHED, approvedByUserId and approvedAt must be set
ALTER TABLE "ResultBatch" ADD CONSTRAINT "check_result_batch_approval_consistency" CHECK (
  ("status" NOT IN ('APPROVED'::"ResultBatchStatus", 'PUBLISHED'::"ResultBatchStatus")) OR
  ("approvedByUserId" IS NOT NULL AND "approvedAt" IS NOT NULL)
);

-- Publication workflow consistency: if PUBLISHED, publishedAt must be set
ALTER TABLE "ResultBatch" ADD CONSTRAINT "check_result_batch_publication_consistency" CHECK (
  ("status" <> 'PUBLISHED'::"ResultBatchStatus") OR ("publishedAt" IS NOT NULL)
);

-- ----------------------------------------------------------------------------
-- 4. StudentSemesterResult & StudentSubjectResult Metrics Bounds
-- ----------------------------------------------------------------------------

-- Semester positive
ALTER TABLE "StudentSemesterResult" ADD CONSTRAINT "check_semester_result_semester_positive" CHECK (
  "semester" >= 1
);

-- Credits offered and earned consistency
ALTER TABLE "StudentSemesterResult" ADD CONSTRAINT "check_semester_result_credits_consistency" CHECK (
  "totalCreditsOffered" >= 0.00 AND
  "totalCreditsEarned" >= 0.00 AND
  "totalCreditsEarned" <= "totalCreditsOffered"
);

-- Quality points non-negative
ALTER TABLE "StudentSemesterResult" ADD CONSTRAINT "check_semester_result_quality_points_non_negative" CHECK (
  "totalQualityPoints" >= 0.00
);

-- SGPA and CGPA bounds: 0.00 to 10.00
ALTER TABLE "StudentSemesterResult" ADD CONSTRAINT "check_semester_result_sgpa_range" CHECK (
  "sgpa" >= 0.00 AND "sgpa" <= 10.00
);

ALTER TABLE "StudentSemesterResult" ADD CONSTRAINT "check_semester_result_cgpa_range" CHECK (
  "cgpa" IS NULL OR ("cgpa" >= 0.00 AND "cgpa" <= 10.00)
);

-- Backlogs count non-negative
ALTER TABLE "StudentSemesterResult" ADD CONSTRAINT "check_semester_result_backlogs_non_negative" CHECK (
  "backlogsCount" >= 0
);

-- StudentSubjectResult marks bounds:
ALTER TABLE "StudentSubjectResult" ADD CONSTRAINT "check_subject_result_marks_bounds" CHECK (
  "maxMarks" > 0 AND
  "totalMarks" >= 0.00 AND
  "totalMarks" <= "maxMarks" AND
  ("internalMarks" IS NULL OR ("internalMarks" >= 0.00 AND "internalMarks" <= "maxMarks")) AND
  ("externalMarks" IS NULL OR ("externalMarks" >= 0.00 AND "externalMarks" <= "maxMarks")) AND
  "percentage" >= 0.00 AND
  "percentage" <= 100.00 AND
  "gradePoint" >= 0.00 AND
  "gradePoint" <= 10.00 AND
  "credits" >= 0 AND
  "qualityPoints" >= 0.00 AND
  "attemptsCount" >= 1
);

-- ----------------------------------------------------------------------------
-- 5. Student Alignment & Result Integrity Triggers
-- ----------------------------------------------------------------------------

-- Trigger Function: Enforce StudentComponentScore studentId AND IAAssessment alignment
CREATE OR REPLACE FUNCTION fn_validate_component_score_alignment()
RETURNS TRIGGER AS $$
DECLARE
  v_mark_student UUID;
  v_mark_sheet_id UUID;
  v_sheet_context "AssessmentContext";
  v_sheet_ia_id UUID;
  v_comp_ia_id UUID;
BEGIN
  -- 1. Verify studentId matches parent StudentAssessmentMark
  SELECT "studentId", "marksSheetId"
  INTO v_mark_student, v_mark_sheet_id
  FROM "StudentAssessmentMark"
  WHERE "id" = NEW."assessmentMarkId"
    AND "institutionId" = NEW."institutionId";

  IF v_mark_student <> NEW."studentId" THEN
    RAISE EXCEPTION 'Integrity violation: StudentComponentScore studentId % does not match parent assessmentMark studentId %',
      NEW."studentId", v_mark_student;
  END IF;

  -- 2. Verify parent MarksSheet context is INTERNAL_ASSESSMENT
  SELECT "contextType", "iaAssessmentId"
  INTO v_sheet_context, v_sheet_ia_id
  FROM "MarksSheet"
  WHERE "id" = v_mark_sheet_id
    AND "institutionId" = NEW."institutionId";

  IF v_sheet_context <> 'INTERNAL_ASSESSMENT'::"AssessmentContext" THEN
    RAISE EXCEPTION 'Integrity violation: StudentComponentScore cannot be added to a MarksSheet with context % (only INTERNAL_ASSESSMENT supported)',
      v_sheet_context;
  END IF;

  -- 3. Verify IAComponent belongs to the parent MarksSheet's IAAssessment
  SELECT "assessmentId" INTO v_comp_ia_id
  FROM "IAComponent"
  WHERE "id" = NEW."componentId"
    AND "institutionId" = NEW."institutionId";

  IF v_comp_ia_id <> v_sheet_ia_id THEN
    RAISE EXCEPTION 'Integrity violation: IAComponent % belongs to IAAssessment % but MarksSheet belongs to %',
      NEW."componentId", v_comp_ia_id, v_sheet_ia_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "trg_check_component_score_alignment"
BEFORE INSERT OR UPDATE OF "assessmentMarkId", "componentId", "studentId" ON "StudentComponentScore"
FOR EACH ROW EXECUTE FUNCTION fn_validate_component_score_alignment();

-- Trigger Function: Enforce StudentSubjectResult studentId matches parent semesterResult studentId
CREATE OR REPLACE FUNCTION fn_validate_subject_result_student()
RETURNS TRIGGER AS $$
DECLARE
  v_sem_student UUID;
BEGIN
  SELECT "studentId" INTO v_sem_student
  FROM "StudentSemesterResult"
  WHERE "id" = NEW."semesterResultId"
    AND "institutionId" = NEW."institutionId";

  IF v_sem_student <> NEW."studentId" THEN
    RAISE EXCEPTION 'Integrity violation: StudentSubjectResult studentId % does not match parent semesterResult studentId %',
      NEW."studentId", v_sem_student;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "trg_check_subject_result_student"
BEFORE INSERT OR UPDATE OF "semesterResultId", "studentId" ON "StudentSubjectResult"
FOR EACH ROW EXECUTE FUNCTION fn_validate_subject_result_student();

-- Trigger Function: Prevent altering published results without audit trail
CREATE OR REPLACE FUNCTION fn_protect_published_result_batch()
RETURNS TRIGGER AS $$
BEGIN
  -- If batch was PUBLISHED and an update attempts to change status without approved audit
  IF OLD."status" = 'PUBLISHED'::"ResultBatchStatus" AND NEW."status" <> 'PUBLISHED'::"ResultBatchStatus" THEN
    IF NOT EXISTS (
      SELECT 1 FROM "ResultAuditLog"
      WHERE "resultBatchId" = OLD."id"
        AND "createdAt" >= NOW() - INTERVAL '5 minutes'
    ) THEN
      RAISE EXCEPTION 'Security violation: Cannot revert or modify a PUBLISHED ResultBatch without an accompanying ResultAuditLog entry';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "trg_protect_published_result_batch"
BEFORE UPDATE ON "ResultBatch"
FOR EACH ROW EXECUTE FUNCTION fn_protect_published_result_batch();

-- ----------------------------------------------------------------------------
-- 6. Audit Log Immutability Triggers (MarksAuditLog & ResultAuditLog)
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION fn_prevent_audit_log_modification()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Audit log immutability violation: Modifications and deletions of % records are strictly prohibited', TG_TABLE_NAME;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "trg_protect_marks_audit_log_immutability"
BEFORE UPDATE OR DELETE ON "MarksAuditLog"
FOR EACH ROW EXECUTE FUNCTION fn_prevent_audit_log_modification();

CREATE TRIGGER "trg_protect_result_audit_log_immutability"
BEFORE UPDATE OR DELETE ON "ResultAuditLog"
FOR EACH ROW EXECUTE FUNCTION fn_prevent_audit_log_modification();

-- ----------------------------------------------------------------------------
-- 7. ResultBatch Academic Hierarchy Consistency Trigger
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION fn_validate_result_batch_hierarchy()
RETURNS TRIGGER AS $$
DECLARE
  v_class_course UUID;
  v_class_year UUID;
  v_term_year UUID;
  v_exam_year UUID;
  v_exam_term UUID;
BEGIN
  -- 1. Validate Class belongs to Course and AcademicYear
  SELECT "courseId", "academicYearId"
  INTO v_class_course, v_class_year
  FROM "Class"
  WHERE "id" = NEW."classId"
    AND "institutionId" = NEW."institutionId";

  IF v_class_course <> NEW."courseId" THEN
    RAISE EXCEPTION 'ResultBatch hierarchy violation: Class % does not belong to Course %',
      NEW."classId", NEW."courseId";
  END IF;

  IF v_class_year <> NEW."academicYearId" THEN
    RAISE EXCEPTION 'ResultBatch hierarchy violation: Class % does not belong to AcademicYear %',
      NEW."classId", NEW."academicYearId";
  END IF;

  -- 2. Validate AcademicTerm belongs to AcademicYear if term is specified
  IF NEW."academicTermId" IS NOT NULL THEN
    SELECT "academicYearId" INTO v_term_year
    FROM "AcademicTerm"
    WHERE "id" = NEW."academicTermId"
      AND "institutionId" = NEW."institutionId";

    IF v_term_year <> NEW."academicYearId" THEN
      RAISE EXCEPTION 'ResultBatch hierarchy violation: AcademicTerm % does not belong to AcademicYear %',
        NEW."academicTermId", NEW."academicYearId";
    END IF;
  END IF;

  -- 3. Validate Examination belongs to AcademicYear and AcademicTerm if exam is specified
  IF NEW."examinationId" IS NOT NULL THEN
    SELECT "academicYearId", "academicTermId"
    INTO v_exam_year, v_exam_term
    FROM "Examination"
    WHERE "id" = NEW."examinationId"
      AND "institutionId" = NEW."institutionId";

    IF v_exam_year <> NEW."academicYearId" THEN
      RAISE EXCEPTION 'ResultBatch hierarchy violation: Examination % does not belong to AcademicYear %',
        NEW."examinationId", NEW."academicYearId";
    END IF;

    IF NEW."academicTermId" IS NOT NULL AND v_exam_term IS NOT NULL AND v_exam_term <> NEW."academicTermId" THEN
      RAISE EXCEPTION 'ResultBatch hierarchy violation: Examination term % does not match batch term %',
        v_exam_term, NEW."academicTermId";
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "trg_check_result_batch_hierarchy"
BEFORE INSERT OR UPDATE OF "academicYearId", "academicTermId", "courseId", "classId", "examinationId"
ON "ResultBatch"
FOR EACH ROW EXECUTE FUNCTION fn_validate_result_batch_hierarchy();

-- ----------------------------------------------------------------------------
-- 8. StudentSemesterResult Hierarchy Consistency Trigger
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION fn_validate_semester_result_hierarchy()
RETURNS TRIGGER AS $$
DECLARE
  v_batch_year UUID;
  v_batch_term UUID;
  v_batch_course UUID;
  v_batch_class UUID;
  v_section_class UUID;
BEGIN
  -- 1. Validate SemesterResult matches parent ResultBatch placement
  SELECT "academicYearId", "academicTermId", "courseId", "classId"
  INTO v_batch_year, v_batch_term, v_batch_course, v_batch_class
  FROM "ResultBatch"
  WHERE "id" = NEW."resultBatchId"
    AND "institutionId" = NEW."institutionId";

  IF v_batch_year <> NEW."academicYearId" OR v_batch_course <> NEW."courseId" OR v_batch_class <> NEW."classId" THEN
    RAISE EXCEPTION 'StudentSemesterResult mismatch: Result placement does not match parent ResultBatch placement';
  END IF;

  IF v_batch_term IS NOT NULL AND (NEW."academicTermId" IS NULL OR v_batch_term <> NEW."academicTermId") THEN
    RAISE EXCEPTION 'StudentSemesterResult mismatch: AcademicTerm does not match parent ResultBatch term';
  END IF;

  -- 2. Validate Section belongs to Class if section is specified
  IF NEW."sectionId" IS NOT NULL THEN
    SELECT "classId" INTO v_section_class
    FROM "Section"
    WHERE "id" = NEW."sectionId"
      AND "institutionId" = NEW."institutionId";

    IF v_section_class <> NEW."classId" THEN
      RAISE EXCEPTION 'StudentSemesterResult violation: Section % does not belong to Class %',
        NEW."sectionId", NEW."classId";
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "trg_check_semester_result_hierarchy"
BEFORE INSERT OR UPDATE OF "resultBatchId", "academicYearId", "academicTermId", "courseId", "classId", "sectionId"
ON "StudentSemesterResult"
FOR EACH ROW EXECUTE FUNCTION fn_validate_semester_result_hierarchy();
