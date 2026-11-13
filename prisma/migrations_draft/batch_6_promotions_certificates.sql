-- CreateEnum
CREATE TYPE "PromotionBatchStatus" AS ENUM ('DRAFT', 'ELIGIBILITY_CHECKED', 'UNDER_REVIEW', 'APPROVED', 'EXECUTING', 'COMPLETED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PromotionDecision" AS ENUM ('PROMOTED', 'PROMOTED_WITH_BACKLOG', 'DETAINED', 'HELD', 'DISCONTINUED', 'REPEAT_SEMESTER');

-- CreateEnum
CREATE TYPE "PromotionRecordStatus" AS ENUM ('PENDING', 'APPROVED', 'OVERRIDDEN', 'REJECTED', 'EXECUTED');

-- CreateEnum
CREATE TYPE "CertificateType" AS ENUM ('BONAFIDE', 'TRANSFER_CERTIFICATE', 'COURSE_COMPLETION', 'PROVISIONAL_DEGREE', 'DEGREE_CERTIFICATE', 'MIGRATION_CERTIFICATE', 'CHARACTER_CERTIFICATE', 'RANK_CERTIFICATE', 'TRANSCRIPT_SUMMARY', 'OTHER');

-- CreateEnum
CREATE TYPE "CertificateApplicationStatus" AS ENUM ('SUBMITTED', 'UNDER_VERIFICATION', 'DOCUMENTS_REQUIRED', 'APPROVED', 'REJECTED', 'ISSUED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "IssuedCertificateStatus" AS ENUM ('ACTIVE', 'REISSUED', 'REVOKED', 'EXPIRED');

-- CreateTable
CREATE TABLE "PromotionPolicy" (
    "id" UUID NOT NULL,
    "institutionId" UUID NOT NULL,
    "courseId" UUID,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "minCgpa" DECIMAL(4,2),
    "minSgpa" DECIMAL(4,2),
    "maxBacklogsAllowed" INTEGER NOT NULL DEFAULT 0,
    "maxConditionalBacklogs" INTEGER DEFAULT 2,
    "minCreditsPercentage" DECIMAL(5,2),
    "minAttendancePercentage" DECIMAL(5,2),
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PromotionPolicy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PromotionBatch" (
    "id" UUID NOT NULL,
    "institutionId" UUID NOT NULL,
    "policyId" UUID,
    "batchName" TEXT NOT NULL,
    "batchNumber" TEXT NOT NULL,
    "sourceAcademicYearId" UUID NOT NULL,
    "sourceCourseId" UUID NOT NULL,
    "sourceClassId" UUID NOT NULL,
    "sourceSectionId" UUID,
    "targetAcademicYearId" UUID NOT NULL,
    "targetCourseId" UUID NOT NULL,
    "targetClassId" UUID NOT NULL,
    "targetSectionId" UUID,
    "status" "PromotionBatchStatus" NOT NULL DEFAULT 'DRAFT',
    "totalStudents" INTEGER NOT NULL DEFAULT 0,
    "promotedCount" INTEGER NOT NULL DEFAULT 0,
    "conditionallyPromotedCount" INTEGER NOT NULL DEFAULT 0,
    "detainedCount" INTEGER NOT NULL DEFAULT 0,
    "heldCount" INTEGER NOT NULL DEFAULT 0,
    "processedAt" TIMESTAMP(3),
    "approvedByUserId" UUID,
    "approvedAt" TIMESTAMP(3),
    "executedByUserId" UUID,
    "executedAt" TIMESTAMP(3),
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PromotionBatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PromotionStudentRecord" (
    "id" UUID NOT NULL,
    "institutionId" UUID NOT NULL,
    "promotionBatchId" UUID NOT NULL,
    "studentId" UUID NOT NULL,
    "cgpa" DECIMAL(4,2),
    "sgpa" DECIMAL(4,2),
    "creditsEarned" DECIMAL(5,2),
    "creditsRequired" DECIMAL(5,2),
    "backlogsCount" INTEGER NOT NULL DEFAULT 0,
    "attendancePercentage" DECIMAL(5,2),
    "isEligible" BOOLEAN NOT NULL DEFAULT true,
    "systemRecommendation" "PromotionDecision" NOT NULL,
    "finalDecision" "PromotionDecision" NOT NULL,
    "status" "PromotionRecordStatus" NOT NULL DEFAULT 'PENDING',
    "isOverridden" BOOLEAN NOT NULL DEFAULT false,
    "overrideReason" TEXT,
    "overriddenByUserId" UUID,
    "targetClassId" UUID,
    "targetSectionId" UUID,
    "remarks" TEXT,
    "isExecuted" BOOLEAN NOT NULL DEFAULT false,
    "executedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PromotionStudentRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PromotionHistory" (
    "id" UUID NOT NULL,
    "institutionId" UUID NOT NULL,
    "promotionBatchId" UUID NOT NULL,
    "promotionRecordId" UUID NOT NULL,
    "studentId" UUID NOT NULL,
    "fromAcademicYearId" UUID NOT NULL,
    "fromCourseId" UUID NOT NULL,
    "fromClassId" UUID NOT NULL,
    "fromSectionId" UUID,
    "toAcademicYearId" UUID NOT NULL,
    "toCourseId" UUID NOT NULL,
    "toClassId" UUID NOT NULL,
    "toSectionId" UUID,
    "decision" "PromotionDecision" NOT NULL,
    "cgpaSnapshot" DECIMAL(4,2),
    "backlogsSnapshot" INTEGER NOT NULL DEFAULT 0,
    "promotedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "executedByUserId" UUID,
    "remarks" TEXT,

    CONSTRAINT "PromotionHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PromotionAuditLog" (
    "id" UUID NOT NULL,
    "institutionId" UUID NOT NULL,
    "promotionBatchId" UUID,
    "studentId" UUID,
    "action" TEXT NOT NULL,
    "previousState" TEXT,
    "newState" TEXT,
    "reason" TEXT NOT NULL,
    "performedByUserId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PromotionAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CertificateTemplate" (
    "id" UUID NOT NULL,
    "institutionId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" "CertificateType" NOT NULL,
    "description" TEXT,
    "templateBody" TEXT NOT NULL,
    "headerHtml" TEXT,
    "footerHtml" TEXT,
    "requiresApproval" BOOLEAN NOT NULL DEFAULT true,
    "validityMonths" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CertificateTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CertificateNumberConfig" (
    "id" UUID NOT NULL,
    "institutionId" UUID NOT NULL,
    "templateId" UUID,
    "certificateType" "CertificateType" NOT NULL,
    "prefix" TEXT NOT NULL,
    "suffix" TEXT,
    "includeYear" BOOLEAN NOT NULL DEFAULT true,
    "delimiter" TEXT NOT NULL DEFAULT '/',
    "sequenceLength" INTEGER NOT NULL DEFAULT 4,
    "currentSequence" INTEGER NOT NULL DEFAULT 0,
    "resetPeriod" TEXT DEFAULT 'YEARLY',
    "lastResetYear" INTEGER,
    "lastResetMonth" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CertificateNumberConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CertificateApplication" (
    "id" UUID NOT NULL,
    "institutionId" UUID NOT NULL,
    "templateId" UUID NOT NULL,
    "studentId" UUID NOT NULL,
    "applicationNumber" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "additionalData" TEXT,
    "status" "CertificateApplicationStatus" NOT NULL DEFAULT 'SUBMITTED',
    "feeCleared" BOOLEAN NOT NULL DEFAULT true,
    "duesCleared" BOOLEAN NOT NULL DEFAULT true,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedByUserId" UUID,
    "reviewedAt" TIMESTAMP(3),
    "approvedByUserId" UUID,
    "approvedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CertificateApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IssuedCertificate" (
    "id" UUID NOT NULL,
    "institutionId" UUID NOT NULL,
    "applicationId" UUID,
    "templateId" UUID NOT NULL,
    "studentId" UUID NOT NULL,
    "certificateNumber" TEXT NOT NULL DEFAULT '',
    "verificationCode" TEXT NOT NULL,
    "certificateType" "CertificateType" NOT NULL,
    "title" TEXT NOT NULL,
    "contentSnapshot" TEXT NOT NULL,
    "status" "IssuedCertificateStatus" NOT NULL DEFAULT 'ACTIVE',
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "issuedByUserId" UUID NOT NULL,
    "isRevoked" BOOLEAN NOT NULL DEFAULT false,
    "revokedAt" TIMESTAMP(3),
    "revokedByUserId" UUID,
    "revocationReason" TEXT,
    "reissuedFromId" UUID,
    "reissueReason" TEXT,
    "qrCodePayload" TEXT,
    "pdfUrl" TEXT,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IssuedCertificate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CertificateAuditLog" (
    "id" UUID NOT NULL,
    "institutionId" UUID NOT NULL,
    "applicationId" UUID,
    "issuedCertificateId" UUID,
    "studentId" UUID,
    "action" TEXT NOT NULL,
    "previousStatus" TEXT,
    "newStatus" TEXT,
    "reason" TEXT NOT NULL,
    "performedByUserId" UUID NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CertificateAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PromotionPolicy_institutionId_isActive_idx" ON "PromotionPolicy"("institutionId", "isActive");

-- CreateIndex
CREATE INDEX "PromotionPolicy_courseId_institutionId_idx" ON "PromotionPolicy"("courseId", "institutionId");

-- CreateIndex
CREATE UNIQUE INDEX "PromotionPolicy_id_institutionId_key" ON "PromotionPolicy"("id", "institutionId");

-- CreateIndex
CREATE INDEX "PromotionBatch_institutionId_status_idx" ON "PromotionBatch"("institutionId", "status");

-- CreateIndex
CREATE INDEX "PromotionBatch_sourceAcademicYearId_sourceClassId_idx" ON "PromotionBatch"("sourceAcademicYearId", "sourceClassId");

-- CreateIndex
CREATE INDEX "PromotionBatch_targetAcademicYearId_targetClassId_idx" ON "PromotionBatch"("targetAcademicYearId", "targetClassId");

-- CreateIndex
CREATE INDEX "PromotionBatch_approvedByUserId_idx" ON "PromotionBatch"("approvedByUserId");

-- CreateIndex
CREATE INDEX "PromotionBatch_executedByUserId_idx" ON "PromotionBatch"("executedByUserId");

-- CreateIndex
CREATE UNIQUE INDEX "PromotionBatch_id_institutionId_key" ON "PromotionBatch"("id", "institutionId");

-- CreateIndex
CREATE UNIQUE INDEX "PromotionBatch_institutionId_batchNumber_key" ON "PromotionBatch"("institutionId", "batchNumber");

-- CreateIndex
CREATE INDEX "PromotionStudentRecord_institutionId_status_idx" ON "PromotionStudentRecord"("institutionId", "status");

-- CreateIndex
CREATE INDEX "PromotionStudentRecord_studentId_institutionId_idx" ON "PromotionStudentRecord"("studentId", "institutionId");

-- CreateIndex
CREATE INDEX "PromotionStudentRecord_targetClassId_institutionId_idx" ON "PromotionStudentRecord"("targetClassId", "institutionId");

-- CreateIndex
CREATE INDEX "PromotionStudentRecord_targetSectionId_institutionId_idx" ON "PromotionStudentRecord"("targetSectionId", "institutionId");

-- CreateIndex
CREATE INDEX "PromotionStudentRecord_overriddenByUserId_idx" ON "PromotionStudentRecord"("overriddenByUserId");

-- CreateIndex
CREATE UNIQUE INDEX "PromotionStudentRecord_id_institutionId_key" ON "PromotionStudentRecord"("id", "institutionId");

-- CreateIndex
CREATE UNIQUE INDEX "PromotionStudentRecord_promotionBatchId_studentId_key" ON "PromotionStudentRecord"("promotionBatchId", "studentId");

-- CreateIndex
CREATE UNIQUE INDEX "PromotionHistory_promotionRecordId_key" ON "PromotionHistory"("promotionRecordId");

-- CreateIndex
CREATE INDEX "PromotionHistory_studentId_fromAcademicYearId_idx" ON "PromotionHistory"("studentId", "fromAcademicYearId");

-- CreateIndex
CREATE INDEX "PromotionHistory_studentId_toAcademicYearId_idx" ON "PromotionHistory"("studentId", "toAcademicYearId");

-- CreateIndex
CREATE INDEX "PromotionHistory_promotionBatchId_institutionId_idx" ON "PromotionHistory"("promotionBatchId", "institutionId");

-- CreateIndex
CREATE INDEX "PromotionHistory_institutionId_promotedAt_idx" ON "PromotionHistory"("institutionId", "promotedAt");

-- CreateIndex
CREATE UNIQUE INDEX "PromotionHistory_id_institutionId_key" ON "PromotionHistory"("id", "institutionId");

-- CreateIndex
CREATE UNIQUE INDEX "PromotionHistory_promotionRecordId_institutionId_key" ON "PromotionHistory"("promotionRecordId", "institutionId");

-- CreateIndex
CREATE INDEX "PromotionAuditLog_promotionBatchId_institutionId_idx" ON "PromotionAuditLog"("promotionBatchId", "institutionId");

-- CreateIndex
CREATE INDEX "PromotionAuditLog_studentId_institutionId_idx" ON "PromotionAuditLog"("studentId", "institutionId");

-- CreateIndex
CREATE INDEX "PromotionAuditLog_performedByUserId_idx" ON "PromotionAuditLog"("performedByUserId");

-- CreateIndex
CREATE INDEX "PromotionAuditLog_institutionId_createdAt_idx" ON "PromotionAuditLog"("institutionId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "PromotionAuditLog_id_institutionId_key" ON "PromotionAuditLog"("id", "institutionId");

-- CreateIndex
CREATE INDEX "CertificateTemplate_institutionId_type_idx" ON "CertificateTemplate"("institutionId", "type");

-- CreateIndex
CREATE INDEX "CertificateTemplate_institutionId_isActive_idx" ON "CertificateTemplate"("institutionId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "CertificateTemplate_id_institutionId_key" ON "CertificateTemplate"("id", "institutionId");

-- CreateIndex
CREATE UNIQUE INDEX "CertificateTemplate_institutionId_code_key" ON "CertificateTemplate"("institutionId", "code");

-- CreateIndex
CREATE INDEX "CertificateNumberConfig_templateId_institutionId_idx" ON "CertificateNumberConfig"("templateId", "institutionId");

-- CreateIndex
CREATE INDEX "CertificateNumberConfig_institutionId_isActive_idx" ON "CertificateNumberConfig"("institutionId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "CertificateNumberConfig_id_institutionId_key" ON "CertificateNumberConfig"("id", "institutionId");

-- CreateIndex
CREATE UNIQUE INDEX "CertificateNumberConfig_institutionId_certificateType_templ_key" ON "CertificateNumberConfig"("institutionId", "certificateType", "templateId");

-- CreateIndex
CREATE INDEX "CertificateApplication_institutionId_status_idx" ON "CertificateApplication"("institutionId", "status");

-- CreateIndex
CREATE INDEX "CertificateApplication_studentId_institutionId_idx" ON "CertificateApplication"("studentId", "institutionId");

-- CreateIndex
CREATE INDEX "CertificateApplication_templateId_institutionId_idx" ON "CertificateApplication"("templateId", "institutionId");

-- CreateIndex
CREATE INDEX "CertificateApplication_reviewedByUserId_idx" ON "CertificateApplication"("reviewedByUserId");

-- CreateIndex
CREATE INDEX "CertificateApplication_approvedByUserId_idx" ON "CertificateApplication"("approvedByUserId");

-- CreateIndex
CREATE UNIQUE INDEX "CertificateApplication_id_institutionId_key" ON "CertificateApplication"("id", "institutionId");

-- CreateIndex
CREATE UNIQUE INDEX "CertificateApplication_institutionId_applicationNumber_key" ON "CertificateApplication"("institutionId", "applicationNumber");

-- CreateIndex
CREATE UNIQUE INDEX "IssuedCertificate_verificationCode_key" ON "IssuedCertificate"("verificationCode");

-- CreateIndex
CREATE INDEX "IssuedCertificate_studentId_institutionId_idx" ON "IssuedCertificate"("studentId", "institutionId");

-- CreateIndex
CREATE INDEX "IssuedCertificate_templateId_institutionId_idx" ON "IssuedCertificate"("templateId", "institutionId");

-- CreateIndex
CREATE INDEX "IssuedCertificate_applicationId_institutionId_idx" ON "IssuedCertificate"("applicationId", "institutionId");

-- CreateIndex
CREATE INDEX "IssuedCertificate_institutionId_status_idx" ON "IssuedCertificate"("institutionId", "status");

-- CreateIndex
CREATE INDEX "IssuedCertificate_issuedByUserId_idx" ON "IssuedCertificate"("issuedByUserId");

-- CreateIndex
CREATE INDEX "IssuedCertificate_revokedByUserId_idx" ON "IssuedCertificate"("revokedByUserId");

-- CreateIndex
CREATE INDEX "IssuedCertificate_reissuedFromId_institutionId_idx" ON "IssuedCertificate"("reissuedFromId", "institutionId");

-- CreateIndex
CREATE UNIQUE INDEX "IssuedCertificate_id_institutionId_key" ON "IssuedCertificate"("id", "institutionId");

-- CreateIndex
CREATE UNIQUE INDEX "IssuedCertificate_institutionId_certificateNumber_key" ON "IssuedCertificate"("institutionId", "certificateNumber");

-- CreateIndex
CREATE INDEX "CertificateAuditLog_applicationId_institutionId_idx" ON "CertificateAuditLog"("applicationId", "institutionId");

-- CreateIndex
CREATE INDEX "CertificateAuditLog_issuedCertificateId_institutionId_idx" ON "CertificateAuditLog"("issuedCertificateId", "institutionId");

-- CreateIndex
CREATE INDEX "CertificateAuditLog_studentId_institutionId_idx" ON "CertificateAuditLog"("studentId", "institutionId");

-- CreateIndex
CREATE INDEX "CertificateAuditLog_performedByUserId_idx" ON "CertificateAuditLog"("performedByUserId");

-- CreateIndex
CREATE INDEX "CertificateAuditLog_institutionId_createdAt_idx" ON "CertificateAuditLog"("institutionId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "CertificateAuditLog_id_institutionId_key" ON "CertificateAuditLog"("id", "institutionId");

-- AddForeignKey
ALTER TABLE "PromotionPolicy" ADD CONSTRAINT "PromotionPolicy_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromotionPolicy" ADD CONSTRAINT "PromotionPolicy_courseId_institutionId_fkey" FOREIGN KEY ("courseId", "institutionId") REFERENCES "Course"("id", "institutionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromotionBatch" ADD CONSTRAINT "PromotionBatch_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromotionBatch" ADD CONSTRAINT "PromotionBatch_policyId_institutionId_fkey" FOREIGN KEY ("policyId", "institutionId") REFERENCES "PromotionPolicy"("id", "institutionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromotionBatch" ADD CONSTRAINT "PromotionBatch_sourceAcademicYearId_institutionId_fkey" FOREIGN KEY ("sourceAcademicYearId", "institutionId") REFERENCES "AcademicYear"("id", "institutionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromotionBatch" ADD CONSTRAINT "PromotionBatch_sourceCourseId_institutionId_fkey" FOREIGN KEY ("sourceCourseId", "institutionId") REFERENCES "Course"("id", "institutionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromotionBatch" ADD CONSTRAINT "PromotionBatch_sourceClassId_institutionId_fkey" FOREIGN KEY ("sourceClassId", "institutionId") REFERENCES "Class"("id", "institutionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromotionBatch" ADD CONSTRAINT "PromotionBatch_sourceSectionId_institutionId_fkey" FOREIGN KEY ("sourceSectionId", "institutionId") REFERENCES "Section"("id", "institutionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromotionBatch" ADD CONSTRAINT "PromotionBatch_targetAcademicYearId_institutionId_fkey" FOREIGN KEY ("targetAcademicYearId", "institutionId") REFERENCES "AcademicYear"("id", "institutionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromotionBatch" ADD CONSTRAINT "PromotionBatch_targetCourseId_institutionId_fkey" FOREIGN KEY ("targetCourseId", "institutionId") REFERENCES "Course"("id", "institutionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromotionBatch" ADD CONSTRAINT "PromotionBatch_targetClassId_institutionId_fkey" FOREIGN KEY ("targetClassId", "institutionId") REFERENCES "Class"("id", "institutionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromotionBatch" ADD CONSTRAINT "PromotionBatch_targetSectionId_institutionId_fkey" FOREIGN KEY ("targetSectionId", "institutionId") REFERENCES "Section"("id", "institutionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromotionBatch" ADD CONSTRAINT "PromotionBatch_approvedByUserId_fkey" FOREIGN KEY ("approvedByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromotionBatch" ADD CONSTRAINT "PromotionBatch_executedByUserId_fkey" FOREIGN KEY ("executedByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromotionStudentRecord" ADD CONSTRAINT "PromotionStudentRecord_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromotionStudentRecord" ADD CONSTRAINT "PromotionStudentRecord_promotionBatchId_institutionId_fkey" FOREIGN KEY ("promotionBatchId", "institutionId") REFERENCES "PromotionBatch"("id", "institutionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromotionStudentRecord" ADD CONSTRAINT "PromotionStudentRecord_studentId_institutionId_fkey" FOREIGN KEY ("studentId", "institutionId") REFERENCES "Student"("id", "institutionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromotionStudentRecord" ADD CONSTRAINT "PromotionStudentRecord_overriddenByUserId_fkey" FOREIGN KEY ("overriddenByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromotionStudentRecord" ADD CONSTRAINT "PromotionStudentRecord_targetClassId_institutionId_fkey" FOREIGN KEY ("targetClassId", "institutionId") REFERENCES "Class"("id", "institutionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromotionStudentRecord" ADD CONSTRAINT "PromotionStudentRecord_targetSectionId_institutionId_fkey" FOREIGN KEY ("targetSectionId", "institutionId") REFERENCES "Section"("id", "institutionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromotionHistory" ADD CONSTRAINT "PromotionHistory_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromotionHistory" ADD CONSTRAINT "PromotionHistory_promotionBatchId_institutionId_fkey" FOREIGN KEY ("promotionBatchId", "institutionId") REFERENCES "PromotionBatch"("id", "institutionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromotionHistory" ADD CONSTRAINT "PromotionHistory_promotionRecordId_institutionId_fkey" FOREIGN KEY ("promotionRecordId", "institutionId") REFERENCES "PromotionStudentRecord"("id", "institutionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromotionHistory" ADD CONSTRAINT "PromotionHistory_studentId_institutionId_fkey" FOREIGN KEY ("studentId", "institutionId") REFERENCES "Student"("id", "institutionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromotionHistory" ADD CONSTRAINT "PromotionHistory_fromAcademicYearId_institutionId_fkey" FOREIGN KEY ("fromAcademicYearId", "institutionId") REFERENCES "AcademicYear"("id", "institutionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromotionHistory" ADD CONSTRAINT "PromotionHistory_fromCourseId_institutionId_fkey" FOREIGN KEY ("fromCourseId", "institutionId") REFERENCES "Course"("id", "institutionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromotionHistory" ADD CONSTRAINT "PromotionHistory_fromClassId_institutionId_fkey" FOREIGN KEY ("fromClassId", "institutionId") REFERENCES "Class"("id", "institutionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromotionHistory" ADD CONSTRAINT "PromotionHistory_fromSectionId_institutionId_fkey" FOREIGN KEY ("fromSectionId", "institutionId") REFERENCES "Section"("id", "institutionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromotionHistory" ADD CONSTRAINT "PromotionHistory_toAcademicYearId_institutionId_fkey" FOREIGN KEY ("toAcademicYearId", "institutionId") REFERENCES "AcademicYear"("id", "institutionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromotionHistory" ADD CONSTRAINT "PromotionHistory_toCourseId_institutionId_fkey" FOREIGN KEY ("toCourseId", "institutionId") REFERENCES "Course"("id", "institutionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromotionHistory" ADD CONSTRAINT "PromotionHistory_toClassId_institutionId_fkey" FOREIGN KEY ("toClassId", "institutionId") REFERENCES "Class"("id", "institutionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromotionHistory" ADD CONSTRAINT "PromotionHistory_toSectionId_institutionId_fkey" FOREIGN KEY ("toSectionId", "institutionId") REFERENCES "Section"("id", "institutionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromotionHistory" ADD CONSTRAINT "PromotionHistory_executedByUserId_fkey" FOREIGN KEY ("executedByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromotionAuditLog" ADD CONSTRAINT "PromotionAuditLog_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromotionAuditLog" ADD CONSTRAINT "PromotionAuditLog_promotionBatchId_institutionId_fkey" FOREIGN KEY ("promotionBatchId", "institutionId") REFERENCES "PromotionBatch"("id", "institutionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromotionAuditLog" ADD CONSTRAINT "PromotionAuditLog_studentId_institutionId_fkey" FOREIGN KEY ("studentId", "institutionId") REFERENCES "Student"("id", "institutionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromotionAuditLog" ADD CONSTRAINT "PromotionAuditLog_performedByUserId_fkey" FOREIGN KEY ("performedByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CertificateTemplate" ADD CONSTRAINT "CertificateTemplate_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CertificateNumberConfig" ADD CONSTRAINT "CertificateNumberConfig_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CertificateNumberConfig" ADD CONSTRAINT "CertificateNumberConfig_templateId_institutionId_fkey" FOREIGN KEY ("templateId", "institutionId") REFERENCES "CertificateTemplate"("id", "institutionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CertificateApplication" ADD CONSTRAINT "CertificateApplication_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CertificateApplication" ADD CONSTRAINT "CertificateApplication_templateId_institutionId_fkey" FOREIGN KEY ("templateId", "institutionId") REFERENCES "CertificateTemplate"("id", "institutionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CertificateApplication" ADD CONSTRAINT "CertificateApplication_studentId_institutionId_fkey" FOREIGN KEY ("studentId", "institutionId") REFERENCES "Student"("id", "institutionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CertificateApplication" ADD CONSTRAINT "CertificateApplication_reviewedByUserId_fkey" FOREIGN KEY ("reviewedByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CertificateApplication" ADD CONSTRAINT "CertificateApplication_approvedByUserId_fkey" FOREIGN KEY ("approvedByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IssuedCertificate" ADD CONSTRAINT "IssuedCertificate_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IssuedCertificate" ADD CONSTRAINT "IssuedCertificate_applicationId_institutionId_fkey" FOREIGN KEY ("applicationId", "institutionId") REFERENCES "CertificateApplication"("id", "institutionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IssuedCertificate" ADD CONSTRAINT "IssuedCertificate_templateId_institutionId_fkey" FOREIGN KEY ("templateId", "institutionId") REFERENCES "CertificateTemplate"("id", "institutionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IssuedCertificate" ADD CONSTRAINT "IssuedCertificate_studentId_institutionId_fkey" FOREIGN KEY ("studentId", "institutionId") REFERENCES "Student"("id", "institutionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IssuedCertificate" ADD CONSTRAINT "IssuedCertificate_issuedByUserId_fkey" FOREIGN KEY ("issuedByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IssuedCertificate" ADD CONSTRAINT "IssuedCertificate_revokedByUserId_fkey" FOREIGN KEY ("revokedByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IssuedCertificate" ADD CONSTRAINT "IssuedCertificate_reissuedFromId_institutionId_fkey" FOREIGN KEY ("reissuedFromId", "institutionId") REFERENCES "IssuedCertificate"("id", "institutionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CertificateAuditLog" ADD CONSTRAINT "CertificateAuditLog_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CertificateAuditLog" ADD CONSTRAINT "CertificateAuditLog_applicationId_institutionId_fkey" FOREIGN KEY ("applicationId", "institutionId") REFERENCES "CertificateApplication"("id", "institutionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CertificateAuditLog" ADD CONSTRAINT "CertificateAuditLog_issuedCertificateId_institutionId_fkey" FOREIGN KEY ("issuedCertificateId", "institutionId") REFERENCES "IssuedCertificate"("id", "institutionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CertificateAuditLog" ADD CONSTRAINT "CertificateAuditLog_studentId_institutionId_fkey" FOREIGN KEY ("studentId", "institutionId") REFERENCES "Student"("id", "institutionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CertificateAuditLog" ADD CONSTRAINT "CertificateAuditLog_performedByUserId_fkey" FOREIGN KEY ("performedByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;



-- ============================================================================
-- BATCH 6 INTEGRITY ENHANCEMENTS & BUSINESS CONSTRAINTS
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Value Bounds & Range Validation
-- ----------------------------------------------------------------------------

-- PromotionPolicy bounds:
ALTER TABLE "PromotionPolicy" ADD CONSTRAINT "check_promotion_policy_cgpa_range" CHECK (
  "minCgpa" IS NULL OR ("minCgpa" >= 0.00 AND "minCgpa" <= 10.00)
);

ALTER TABLE "PromotionPolicy" ADD CONSTRAINT "check_promotion_policy_sgpa_range" CHECK (
  "minSgpa" IS NULL OR ("minSgpa" >= 0.00 AND "minSgpa" <= 10.00)
);

ALTER TABLE "PromotionPolicy" ADD CONSTRAINT "check_promotion_policy_backlogs_non_negative" CHECK (
  "maxBacklogsAllowed" >= 0
);

ALTER TABLE "PromotionPolicy" ADD CONSTRAINT "check_promotion_policy_conditional_backlogs" CHECK (
  "maxConditionalBacklogs" IS NULL OR "maxConditionalBacklogs" >= "maxBacklogsAllowed"
);

ALTER TABLE "PromotionPolicy" ADD CONSTRAINT "check_promotion_policy_credits_percentage_range" CHECK (
  "minCreditsPercentage" IS NULL OR ("minCreditsPercentage" >= 0.00 AND "minCreditsPercentage" <= 100.00)
);

ALTER TABLE "PromotionPolicy" ADD CONSTRAINT "check_promotion_policy_attendance_percentage_range" CHECK (
  "minAttendancePercentage" IS NULL OR ("minAttendancePercentage" >= 0.00 AND "minAttendancePercentage" <= 100.00)
);

-- PromotionStudentRecord bounds:
ALTER TABLE "PromotionStudentRecord" ADD CONSTRAINT "check_promotion_record_cgpa_range" CHECK (
  "cgpa" IS NULL OR ("cgpa" >= 0.00 AND "cgpa" <= 10.00)
);

ALTER TABLE "PromotionStudentRecord" ADD CONSTRAINT "check_promotion_record_sgpa_range" CHECK (
  "sgpa" IS NULL OR ("sgpa" >= 0.00 AND "sgpa" <= 10.00)
);

ALTER TABLE "PromotionStudentRecord" ADD CONSTRAINT "check_promotion_record_credits_non_negative" CHECK (
  ("creditsEarned" IS NULL OR "creditsEarned" >= 0.00) AND
  ("creditsRequired" IS NULL OR "creditsRequired" >= 0.00)
);

ALTER TABLE "PromotionStudentRecord" ADD CONSTRAINT "check_promotion_record_backlogs_non_negative" CHECK (
  "backlogsCount" >= 0
);

ALTER TABLE "PromotionStudentRecord" ADD CONSTRAINT "check_promotion_record_attendance_range" CHECK (
  "attendancePercentage" IS NULL OR ("attendancePercentage" >= 0.00 AND "attendancePercentage" <= 100.00)
);

-- CertificateNumberConfig bounds:
ALTER TABLE "CertificateNumberConfig" ADD CONSTRAINT "check_cert_number_seq_length" CHECK (
  "sequenceLength" >= 1 AND "sequenceLength" <= 12
);

ALTER TABLE "CertificateNumberConfig" ADD CONSTRAINT "check_cert_number_current_seq_non_negative" CHECK (
  "currentSequence" >= 0
);

ALTER TABLE "CertificateNumberConfig" ADD CONSTRAINT "check_cert_number_reset_period" CHECK (
  "resetPeriod" IN ('YEARLY', 'MONTHLY', 'ACADEMIC_YEAR', 'NEVER')
);

ALTER TABLE "CertificateNumberConfig" ADD CONSTRAINT "check_cert_number_last_reset_month" CHECK (
  "lastResetMonth" IS NULL OR ("lastResetMonth" >= 1 AND "lastResetMonth" <= 12)
);

-- CertificateTemplate bounds:
ALTER TABLE "CertificateTemplate" ADD CONSTRAINT "check_cert_template_validity_months" CHECK (
  "validityMonths" IS NULL OR "validityMonths" > 0
);

-- ----------------------------------------------------------------------------
-- 2. Partial Unique Indexes
-- ----------------------------------------------------------------------------

-- Unique default PromotionPolicy per institution (when courseId IS NULL)
CREATE UNIQUE INDEX "PromotionPolicy_institutionId_default_global_idx"
ON "PromotionPolicy"("institutionId")
WHERE "courseId" IS NULL AND "isDefault" = true AND "isActive" = true;

-- Unique default PromotionPolicy per institution and course (when courseId IS NOT NULL)
CREATE UNIQUE INDEX "PromotionPolicy_institution_course_default_idx"
ON "PromotionPolicy"("institutionId", "courseId")
WHERE "courseId" IS NOT NULL AND "isDefault" = true AND "isActive" = true;

-- Unique CertificateNumberConfig when templateId IS NULL (global fallback per type)
CREATE UNIQUE INDEX "CertificateNumberConfig_inst_type_null_template_idx"
ON "CertificateNumberConfig"("institutionId", "certificateType")
WHERE "templateId" IS NULL;

-- Unique PromotionHistory per student from a given academic year (prevents double promotion)
CREATE UNIQUE INDEX "PromotionHistory_unique_student_from_year_idx"
ON "PromotionHistory"("institutionId", "studentId", "fromAcademicYearId");

-- Single active reissued certificate per original (prevents multiple active replacements)
CREATE UNIQUE INDEX "IssuedCertificate_single_active_reissue_idx"
ON "IssuedCertificate"("institutionId", "reissuedFromId")
WHERE "reissuedFromId" IS NOT NULL AND "status" = 'ACTIVE'::"IssuedCertificateStatus";

-- ----------------------------------------------------------------------------
-- 3. Workflow & State Machine Consistency Constraints
-- ----------------------------------------------------------------------------

-- PromotionBatch: non-negative counts
ALTER TABLE "PromotionBatch" ADD CONSTRAINT "check_promotion_batch_counts_non_negative" CHECK (
  "totalStudents" >= 0 AND
  "promotedCount" >= 0 AND
  "conditionallyPromotedCount" >= 0 AND
  "detainedCount" >= 0 AND
  "heldCount" >= 0
);

-- PromotionBatch: approval consistency
ALTER TABLE "PromotionBatch" ADD CONSTRAINT "check_promotion_batch_approval_consistency" CHECK (
  ("status" NOT IN ('APPROVED'::"PromotionBatchStatus", 'EXECUTING'::"PromotionBatchStatus", 'COMPLETED'::"PromotionBatchStatus")) OR
  ("approvedByUserId" IS NOT NULL AND "approvedAt" IS NOT NULL)
);

-- PromotionBatch: execution consistency
ALTER TABLE "PromotionBatch" ADD CONSTRAINT "check_promotion_batch_execution_consistency" CHECK (
  ("status" <> 'COMPLETED'::"PromotionBatchStatus") OR
  ("executedByUserId" IS NOT NULL AND "executedAt" IS NOT NULL AND "approvedByUserId" IS NOT NULL)
);

-- PromotionBatch: source and target academic years must differ
ALTER TABLE "PromotionBatch" ADD CONSTRAINT "check_promotion_batch_years_differ" CHECK (
  "sourceAcademicYearId" <> "targetAcademicYearId"
);

-- PromotionStudentRecord: override consistency
ALTER TABLE "PromotionStudentRecord" ADD CONSTRAINT "check_promotion_record_override_consistency" CHECK (
  ("isOverridden" = false) OR
  ("isOverridden" = true AND "overrideReason" IS NOT NULL AND "overriddenByUserId" IS NOT NULL)
);

-- PromotionStudentRecord: execution eligibility and consistency
ALTER TABLE "PromotionStudentRecord" ADD CONSTRAINT "check_promotion_record_execution_eligibility" CHECK (
  ("isExecuted" = false AND "status" <> 'EXECUTED'::"PromotionRecordStatus") OR
  ("isExecuted" = true AND "status" = 'EXECUTED'::"PromotionRecordStatus" AND "executedAt" IS NOT NULL)
);

-- CertificateApplication: review & approval consistency
ALTER TABLE "CertificateApplication" ADD CONSTRAINT "check_cert_application_verification_consistency" CHECK (
  ("status" NOT IN ('UNDER_VERIFICATION'::"CertificateApplicationStatus", 'DOCUMENTS_REQUIRED'::"CertificateApplicationStatus")) OR
  ("reviewedByUserId" IS NOT NULL)
);

ALTER TABLE "CertificateApplication" ADD CONSTRAINT "check_cert_application_approval_consistency" CHECK (
  ("status" NOT IN ('APPROVED'::"CertificateApplicationStatus", 'ISSUED'::"CertificateApplicationStatus")) OR
  ("approvedByUserId" IS NOT NULL AND "approvedAt" IS NOT NULL)
);

ALTER TABLE "CertificateApplication" ADD CONSTRAINT "check_cert_application_rejection_consistency" CHECK (
  ("status" <> 'REJECTED'::"CertificateApplicationStatus") OR
  ("rejectionReason" IS NOT NULL)
);

-- IssuedCertificate: revocation consistency
ALTER TABLE "IssuedCertificate" ADD CONSTRAINT "check_issued_cert_revocation_consistency" CHECK (
  (
    "isRevoked" = false AND
    "status" <> 'REVOKED'::"IssuedCertificateStatus" AND
    "revokedAt" IS NULL AND
    "revokedByUserId" IS NULL AND
    "revocationReason" IS NULL
  ) OR (
    "isRevoked" = true AND
    "status" = 'REVOKED'::"IssuedCertificateStatus" AND
    "revokedAt" IS NOT NULL AND
    "revokedByUserId" IS NOT NULL AND
    "revocationReason" IS NOT NULL
  )
);

-- IssuedCertificate: reissue reason and relationship consistency
ALTER TABLE "IssuedCertificate" ADD CONSTRAINT "check_issued_cert_reissue_consistency" CHECK (
  ("reissuedFromId" IS NULL AND "reissueReason" IS NULL) OR
  ("reissuedFromId" IS NOT NULL AND "reissueReason" IS NOT NULL)
);

-- IssuedCertificate: prevent self-reissue
ALTER TABLE "IssuedCertificate" ADD CONSTRAINT "check_issued_cert_no_self_reissue" CHECK (
  "reissuedFromId" IS NULL OR "reissuedFromId" <> "id"
);

-- ----------------------------------------------------------------------------
-- 4. Append-Only Immutability Triggers (PromotionHistory & Audit Logs)
-- ----------------------------------------------------------------------------

-- PromotionHistory Immutability
CREATE OR REPLACE FUNCTION fn_prevent_promotion_history_modification()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'PromotionHistory is strictly append-only: updates and deletions are prohibited';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "trg_prevent_promotion_history_update"
BEFORE UPDATE ON "PromotionHistory"
FOR EACH ROW EXECUTE FUNCTION fn_prevent_promotion_history_modification();

CREATE TRIGGER "trg_prevent_promotion_history_delete"
BEFORE DELETE ON "PromotionHistory"
FOR EACH ROW EXECUTE FUNCTION fn_prevent_promotion_history_modification();

-- PromotionAuditLog Immutability
CREATE OR REPLACE FUNCTION fn_prevent_promotion_audit_log_modification()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'PromotionAuditLog is strictly append-only: updates and deletions are prohibited';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "trg_prevent_promotion_audit_log_update"
BEFORE UPDATE ON "PromotionAuditLog"
FOR EACH ROW EXECUTE FUNCTION fn_prevent_promotion_audit_log_modification();

CREATE TRIGGER "trg_prevent_promotion_audit_log_delete"
BEFORE DELETE ON "PromotionAuditLog"
FOR EACH ROW EXECUTE FUNCTION fn_prevent_promotion_audit_log_modification();

-- CertificateAuditLog Immutability
CREATE OR REPLACE FUNCTION fn_prevent_cert_audit_log_modification()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'CertificateAuditLog is strictly append-only: updates and deletions are prohibited';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "trg_prevent_cert_audit_log_update"
BEFORE UPDATE ON "CertificateAuditLog"
FOR EACH ROW EXECUTE FUNCTION fn_prevent_cert_audit_log_modification();

CREATE TRIGGER "trg_prevent_cert_audit_log_delete"
BEFORE DELETE ON "CertificateAuditLog"
FOR EACH ROW EXECUTE FUNCTION fn_prevent_cert_audit_log_modification();

-- ----------------------------------------------------------------------------
-- 5. Promotion Execution Lifecycle & Record Guard Triggers
-- ----------------------------------------------------------------------------

-- PromotionBatch Lifecycle Guard
CREATE OR REPLACE FUNCTION fn_guard_promotion_batch_lifecycle()
RETURNS TRIGGER AS $$
BEGIN
  -- Terminal state protection
  IF OLD."status" = 'COMPLETED'::"PromotionBatchStatus" AND NEW."status" <> 'COMPLETED'::"PromotionBatchStatus" THEN
    RAISE EXCEPTION 'Completed PromotionBatch cannot be modified or re-opened';
  END IF;

  IF OLD."status" IN ('REJECTED'::"PromotionBatchStatus", 'CANCELLED'::"PromotionBatchStatus") AND NEW."status" NOT IN ('REJECTED'::"PromotionBatchStatus", 'CANCELLED'::"PromotionBatchStatus") THEN
    RAISE EXCEPTION 'Terminal PromotionBatch cannot change status';
  END IF;

  -- Execution prerequisite: must be approved before executing or completing
  IF NEW."status" = 'EXECUTING'::"PromotionBatchStatus" AND OLD."status" NOT IN ('APPROVED'::"PromotionBatchStatus", 'EXECUTING'::"PromotionBatchStatus") THEN
    RAISE EXCEPTION 'PromotionBatch must be in APPROVED status prior to execution';
  END IF;

  IF NEW."status" = 'COMPLETED'::"PromotionBatchStatus" AND OLD."status" NOT IN ('APPROVED'::"PromotionBatchStatus", 'EXECUTING'::"PromotionBatchStatus") THEN
    RAISE EXCEPTION 'PromotionBatch can only complete from APPROVED or EXECUTING status';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "trg_guard_promotion_batch_lifecycle"
BEFORE UPDATE OF "status" ON "PromotionBatch"
FOR EACH ROW EXECUTE FUNCTION fn_guard_promotion_batch_lifecycle();

-- PromotionStudentRecord Execution Immutability Guard
CREATE OR REPLACE FUNCTION fn_guard_promotion_record_execution()
RETURNS TRIGGER AS $$
BEGIN
  -- 1. Prevent un-executing
  IF OLD."isExecuted" = true AND NEW."isExecuted" = false THEN
    RAISE EXCEPTION 'Executed PromotionStudentRecord cannot be un-executed';
  END IF;

  -- 2. Execution entry prerequisite:
  -- Only records in APPROVED or OVERRIDDEN status can enter execution
  IF OLD."isExecuted" = false AND NEW."isExecuted" = true THEN
    IF OLD."status" NOT IN ('APPROVED'::"PromotionRecordStatus", 'OVERRIDDEN'::"PromotionRecordStatus") THEN
      RAISE EXCEPTION 'PromotionStudentRecord % must be in APPROVED or OVERRIDDEN status to enter execution (current status: %)',
        OLD."id", OLD."status";
    END IF;

    IF NEW."status" <> 'EXECUTED'::"PromotionRecordStatus" THEN
      RAISE EXCEPTION 'PromotionStudentRecord % must transition to status EXECUTED when executed',
        NEW."id";
    END IF;

    IF NEW."executedAt" IS NULL THEN
      RAISE EXCEPTION 'Executed PromotionStudentRecord % must have a non-null executedAt timestamp upon execution',
        NEW."id";
    END IF;
  END IF;

  -- 3. Prevent altering core decision fields once executed (immutability)
  IF OLD."isExecuted" = true AND NEW."isExecuted" = true THEN
    IF OLD."studentId" <> NEW."studentId" OR
       OLD."promotionBatchId" <> NEW."promotionBatchId" OR
       OLD."finalDecision" <> NEW."finalDecision" OR
       OLD."targetClassId" IS DISTINCT FROM NEW."targetClassId" OR
       OLD."targetSectionId" IS DISTINCT FROM NEW."targetSectionId" OR
       OLD."status" <> NEW."status" THEN
      RAISE EXCEPTION 'Executed PromotionStudentRecord is immutable';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "trg_guard_promotion_record_execution"
BEFORE UPDATE ON "PromotionStudentRecord"
FOR EACH ROW EXECUTE FUNCTION fn_guard_promotion_record_execution();

-- ----------------------------------------------------------------------------
-- 6. Academic Hierarchy & Promotion Placement Consistency Triggers
-- ----------------------------------------------------------------------------

-- Validate PromotionBatch source and target academic structure
CREATE OR REPLACE FUNCTION fn_validate_promotion_batch_hierarchy()
RETURNS TRIGGER AS $$
DECLARE
  v_source_class_course UUID;
  v_source_class_year UUID;
  v_target_class_course UUID;
  v_target_class_year UUID;
  v_source_section_class UUID;
  v_target_section_class UUID;
BEGIN
  -- 1. Validate source class belongs to source course and source academic year
  SELECT "courseId", "academicYearId"
  INTO v_source_class_course, v_source_class_year
  FROM "Class"
  WHERE "id" = NEW."sourceClassId"
    AND "institutionId" = NEW."institutionId";

  IF v_source_class_course <> NEW."sourceCourseId" THEN
    RAISE EXCEPTION 'PromotionBatch violation: Source Class % does not belong to Source Course %',
      NEW."sourceClassId", NEW."sourceCourseId";
  END IF;

  IF v_source_class_year <> NEW."sourceAcademicYearId" THEN
    RAISE EXCEPTION 'PromotionBatch violation: Source Class % does not belong to Source AcademicYear %',
      NEW."sourceClassId", NEW."sourceAcademicYearId";
  END IF;

  -- 2. Validate target class belongs to target course and target academic year
  SELECT "courseId", "academicYearId"
  INTO v_target_class_course, v_target_class_year
  FROM "Class"
  WHERE "id" = NEW."targetClassId"
    AND "institutionId" = NEW."institutionId";

  IF v_target_class_course <> NEW."targetCourseId" THEN
    RAISE EXCEPTION 'PromotionBatch violation: Target Class % does not belong to Target Course %',
      NEW."targetClassId", NEW."targetCourseId";
  END IF;

  IF v_target_class_year <> NEW."targetAcademicYearId" THEN
    RAISE EXCEPTION 'PromotionBatch violation: Target Class % does not belong to Target AcademicYear %',
      NEW."targetClassId", NEW."targetAcademicYearId";
  END IF;

  -- 3. Validate source section if provided
  IF NEW."sourceSectionId" IS NOT NULL THEN
    SELECT "classId" INTO v_source_section_class
    FROM "Section"
    WHERE "id" = NEW."sourceSectionId"
      AND "institutionId" = NEW."institutionId";

    IF v_source_section_class <> NEW."sourceClassId" THEN
      RAISE EXCEPTION 'PromotionBatch violation: Source Section % does not belong to Source Class %',
        NEW."sourceSectionId", NEW."sourceClassId";
    END IF;
  END IF;

  -- 4. Validate target section if provided
  IF NEW."targetSectionId" IS NOT NULL THEN
    SELECT "classId" INTO v_target_section_class
    FROM "Section"
    WHERE "id" = NEW."targetSectionId"
      AND "institutionId" = NEW."institutionId";

    IF v_target_section_class <> NEW."targetClassId" THEN
      RAISE EXCEPTION 'PromotionBatch violation: Target Section % does not belong to Target Class %',
        NEW."targetSectionId", NEW."targetClassId";
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "trg_check_promotion_batch_hierarchy"
BEFORE INSERT OR UPDATE OF "sourceAcademicYearId", "sourceCourseId", "sourceClassId", "sourceSectionId",
                          "targetAcademicYearId", "targetCourseId", "targetClassId", "targetSectionId"
ON "PromotionBatch"
FOR EACH ROW EXECUTE FUNCTION fn_validate_promotion_batch_hierarchy();

-- Validate PromotionHistory placement matches Student current state and Batch targets
CREATE OR REPLACE FUNCTION fn_validate_promotion_history_placement()
RETURNS TRIGGER AS $$
DECLARE
  v_student RECORD;
  v_batch RECORD;
  v_record RECORD;
BEGIN
  -- 1. Fetch Student current placement
  SELECT "currentAcademicYearId", "currentCourseId", "currentClassId", "currentSectionId"
  INTO v_student
  FROM "Student"
  WHERE "id" = NEW."studentId"
    AND "institutionId" = NEW."institutionId";

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Student % not found in institution %', NEW."studentId", NEW."institutionId";
  END IF;

  -- 2. Verify source placement in history matches the student's actual current placement
  IF NEW."fromAcademicYearId" <> v_student."currentAcademicYearId" OR
     NEW."fromCourseId" <> v_student."currentCourseId" OR
     NEW."fromClassId" <> v_student."currentClassId" THEN
    RAISE EXCEPTION 'PromotionHistory source placement mismatch for student %: expected [%, %, %] but got [%, %, %]',
      NEW."studentId",
      v_student."currentAcademicYearId", v_student."currentCourseId", v_student."currentClassId",
      NEW."fromAcademicYearId", NEW."fromCourseId", NEW."fromClassId";
  END IF;

  -- 3. Fetch PromotionBatch
  SELECT "targetAcademicYearId", "targetCourseId", "targetClassId", "targetSectionId"
  INTO v_batch
  FROM "PromotionBatch"
  WHERE "id" = NEW."promotionBatchId"
    AND "institutionId" = NEW."institutionId";

  IF NOT FOUND THEN
    RAISE EXCEPTION 'PromotionBatch % not found in institution %', NEW."promotionBatchId", NEW."institutionId";
  END IF;

  -- 4. Fetch PromotionStudentRecord to check for class/section overrides
  SELECT "targetClassId", "targetSectionId", "isOverridden"
  INTO v_record
  FROM "PromotionStudentRecord"
  WHERE "id" = NEW."promotionRecordId"
    AND "institutionId" = NEW."institutionId";

  IF NOT FOUND THEN
    RAISE EXCEPTION 'PromotionStudentRecord % not found in institution %', NEW."promotionRecordId", NEW."institutionId";
  END IF;

  -- Validate destination year and course
  IF NEW."toAcademicYearId" <> v_batch."targetAcademicYearId" THEN
    RAISE EXCEPTION 'PromotionHistory target academic year does not match batch target';
  END IF;

  IF NEW."toCourseId" <> v_batch."targetCourseId" THEN
    RAISE EXCEPTION 'PromotionHistory target course does not match batch target';
  END IF;

  -- Validate destination class (respecting student record override if present)
  IF v_record."isOverridden" = true AND v_record."targetClassId" IS NOT NULL THEN
    IF NEW."toClassId" <> v_record."targetClassId" THEN
      RAISE EXCEPTION 'PromotionHistory destination class does not match student record authorized override class';
    END IF;
  ELSE
    IF NEW."toClassId" <> v_batch."targetClassId" THEN
      RAISE EXCEPTION 'PromotionHistory destination class does not match batch target class';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "trg_check_promotion_history_placement"
BEFORE INSERT ON "PromotionHistory"
FOR EACH ROW EXECUTE FUNCTION fn_validate_promotion_history_placement();

-- ----------------------------------------------------------------------------
-- 7. Certificate Lifecycle & Reissue Guard Trigger
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION fn_guard_certificate_lifecycle()
RETURNS TRIGGER AS $$
DECLARE
  v_orig RECORD;
  v_app RECORD;
  v_template_type "CertificateType";
BEGIN
  -- Validate template exists and type matches
  SELECT "type" INTO v_template_type
  FROM "CertificateTemplate"
  WHERE "id" = NEW."templateId"
    AND "institutionId" = NEW."institutionId";

  IF NOT FOUND THEN
    RAISE EXCEPTION 'CertificateTemplate % does not exist in institution %',
      NEW."templateId", NEW."institutionId";
  END IF;

  IF v_template_type <> NEW."certificateType" THEN
    RAISE EXCEPTION 'IssuedCertificate type % does not match template type %',
      NEW."certificateType", v_template_type;
  END IF;

  -- Validate Application consistency if applicationId is present
  IF NEW."applicationId" IS NOT NULL THEN
    SELECT "studentId", "templateId", "status"
    INTO v_app
    FROM "CertificateApplication"
    WHERE "id" = NEW."applicationId"
      AND "institutionId" = NEW."institutionId";

    IF NOT FOUND THEN
      RAISE EXCEPTION 'CertificateApplication % does not exist in institution %',
        NEW."applicationId", NEW."institutionId";
    END IF;

    IF v_app."studentId" <> NEW."studentId" THEN
      RAISE EXCEPTION 'IssuedCertificate student % does not match application student %',
        NEW."studentId", v_app."studentId";
    END IF;

    IF v_app."templateId" <> NEW."templateId" THEN
      RAISE EXCEPTION 'IssuedCertificate template % does not match application template %',
        NEW."templateId", v_app."templateId";
    END IF;

    IF v_app."status" NOT IN ('APPROVED'::"CertificateApplicationStatus", 'ISSUED'::"CertificateApplicationStatus") THEN
      RAISE EXCEPTION 'CertificateApplication % is not in APPROVED or ISSUED status (current: %)',
        NEW."applicationId", v_app."status";
    END IF;
  END IF;

  -- Handling INSERT: Reissue validation
  IF TG_OP = 'INSERT' THEN
    IF NEW."reissuedFromId" IS NOT NULL THEN
      SELECT "status", "studentId", "certificateType", "templateId"
      INTO v_orig
      FROM "IssuedCertificate"
      WHERE "id" = NEW."reissuedFromId"
        AND "institutionId" = NEW."institutionId";

      IF NOT FOUND THEN
        RAISE EXCEPTION 'Original certificate % for reissue does not exist in institution %',
          NEW."reissuedFromId", NEW."institutionId";
      END IF;

      IF v_orig."studentId" <> NEW."studentId" THEN
        RAISE EXCEPTION 'Replacement certificate student % does not match original certificate student %',
          NEW."studentId", v_orig."studentId";
      END IF;

      IF v_orig."certificateType" <> NEW."certificateType" THEN
        RAISE EXCEPTION 'Replacement certificate type % does not match original certificate type %',
          NEW."certificateType", v_orig."certificateType";
      END IF;

      IF v_orig."status" NOT IN ('REISSUED'::"IssuedCertificateStatus", 'REVOKED'::"IssuedCertificateStatus") THEN
        RAISE EXCEPTION 'Original certificate % must be in REISSUED or REVOKED status before replacement can be active (current: %)',
          NEW."reissuedFromId", v_orig."status";
      END IF;
    END IF;
  END IF;

  -- Handling UPDATE: State machine reactivation guard
  IF TG_OP = 'UPDATE' THEN
    IF OLD."status" = 'REVOKED'::"IssuedCertificateStatus" AND NEW."status" <> 'REVOKED'::"IssuedCertificateStatus" THEN
      RAISE EXCEPTION 'Revoked certificate % cannot be reactivated', OLD."id";
    END IF;

    IF OLD."status" = 'REISSUED'::"IssuedCertificateStatus" AND NEW."status" <> 'REISSUED'::"IssuedCertificateStatus" THEN
      RAISE EXCEPTION 'Reissued certificate % cannot be reactivated', OLD."id";
    END IF;

    IF OLD."status" = 'EXPIRED'::"IssuedCertificateStatus" AND NEW."status" = 'ACTIVE'::"IssuedCertificateStatus" THEN
      RAISE EXCEPTION 'Expired certificate % cannot be directly reactivated; a replacement certificate must be issued', OLD."id";
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "trg_guard_certificate_lifecycle"
BEFORE INSERT OR UPDATE ON "IssuedCertificate"
FOR EACH ROW EXECUTE FUNCTION fn_guard_certificate_lifecycle();

-- ----------------------------------------------------------------------------
-- 8. Authoritative Certificate Number Assignment & Overflow Guard
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION fn_assign_certificate_number()
RETURNS TRIGGER AS $$
DECLARE
  v_config RECORD;
  v_next_seq INT;
  v_max_allowed INT;
  v_seq_str TEXT;
  v_formatted_num TEXT;
  v_current_year INT := EXTRACT(YEAR FROM CURRENT_DATE)::INT;
  v_current_month INT := EXTRACT(MONTH FROM CURRENT_DATE)::INT;
  v_reset_needed BOOLEAN := false;
BEGIN
  -- Database-generated certificate numbering is authoritative.
  -- The trigger executes unconditionally on INSERT, ensuring caller-supplied
  -- manual strings cannot bypass sequence allocation or audit standards.

  -- 1. Lock active configuration row with pessimistic concurrency control (FOR UPDATE)
  SELECT * INTO v_config
  FROM "CertificateNumberConfig"
  WHERE "institutionId" = NEW."institutionId"
    AND "certificateType" = NEW."certificateType"
    AND ("templateId" = NEW."templateId" OR "templateId" IS NULL)
    AND "isActive" = true
  ORDER BY "templateId" NULLS LAST
  LIMIT 1
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'No active CertificateNumberConfig found for institution %, type %, and template %',
      NEW."institutionId", NEW."certificateType", NEW."templateId";
  END IF;

  -- 2. Determine if reset is required based on supported resetPeriod
  IF v_config."resetPeriod" = 'YEARLY' THEN
    IF v_config."lastResetYear" IS NULL OR v_config."lastResetYear" < v_current_year THEN
      v_reset_needed := true;
    END IF;
  ELSIF v_config."resetPeriod" = 'MONTHLY' THEN
    IF v_config."lastResetYear" IS NULL OR v_config."lastResetYear" < v_current_year OR
       (v_config."lastResetYear" = v_current_year AND (v_config."lastResetMonth" IS NULL OR v_config."lastResetMonth" < v_current_month)) THEN
      v_reset_needed := true;
    END IF;
  END IF;

  -- 3. Calculate next sequence number
  IF v_reset_needed THEN
    v_next_seq := 1;
    UPDATE "CertificateNumberConfig"
    SET "currentSequence" = 1,
        "lastResetYear" = v_current_year,
        "lastResetMonth" = v_current_month,
        "updatedAt" = CURRENT_TIMESTAMP
    WHERE "id" = v_config."id";
  ELSE
    v_next_seq := v_config."currentSequence" + 1;

    -- 4. Prevent sequence overflow and truncation beyond configured sequenceLength
    v_max_allowed := (10 ^ v_config."sequenceLength") - 1;
    IF v_next_seq > v_max_allowed THEN
      RAISE EXCEPTION 'Certificate sequence overflow: next sequence % exceeds configured sequenceLength % (max allowed: %) for institution % and type %',
        v_next_seq, v_config."sequenceLength", v_max_allowed, NEW."institutionId", NEW."certificateType";
    END IF;

    UPDATE "CertificateNumberConfig"
    SET "currentSequence" = v_next_seq,
        "updatedAt" = CURRENT_TIMESTAMP
    WHERE "id" = v_config."id";
  END IF;

  -- 5. Format sequence with zero padding
  v_seq_str := LPAD(v_next_seq::TEXT, v_config."sequenceLength", '0');

  -- 6. Construct authoritative formatted certificate number
  v_formatted_num := v_config."prefix";
  IF v_config."includeYear" THEN
    v_formatted_num := v_formatted_num || v_config."delimiter" || v_current_year::TEXT;
  END IF;
  v_formatted_num := v_formatted_num || v_config."delimiter" || v_seq_str;
  IF v_config."suffix" IS NOT NULL AND v_config."suffix" <> '' THEN
    v_formatted_num := v_formatted_num || v_config."delimiter" || v_config."suffix";
  END IF;

  -- Authoritatively set the generated number
  NEW."certificateNumber" := v_formatted_num;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "trg_assign_issued_certificate_number"
BEFORE INSERT ON "IssuedCertificate"
FOR EACH ROW EXECUTE FUNCTION fn_assign_certificate_number();
