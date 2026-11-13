-- ============================================================================
-- SST ERP Migration Draft - Batch 3: Operations & Attendance
-- Scope: PeriodConfig, TimetableSlot, AttendanceThresholdConfig, StudentAttendance, AttendanceCorrectionAudit, FacultyAttendance, ExamHall
-- Date: 2026-11-13
-- Author: Antigravity (Batch 3 Implementation)
-- Note: Do NOT apply directly to shared Supabase without team synchronization.
-- ============================================================================

-- CreateEnum
CREATE TYPE "PeriodType" AS ENUM ('TEACHING', 'BREAK', 'ASSEMBLY', 'LAB');

-- CreateEnum
CREATE TYPE "DayOfWeek" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');

-- CreateEnum
CREATE TYPE "TimetableSlotStatus" AS ENUM ('ACTIVE', 'CANCELLED', 'RESCHEDULED');

-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('PRESENT', 'ABSENT', 'LATE', 'HALF_DAY', 'ON_LEAVE', 'EXCUSED');

-- CreateEnum
CREATE TYPE "FacultyAttendanceStatus" AS ENUM ('PRESENT', 'ABSENT', 'ON_LEAVE', 'HALF_DAY', 'LATE');

-- CreateEnum
CREATE TYPE "ExamHallStatus" AS ENUM ('AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'INACTIVE');

-- CreateTable
CREATE TABLE "PeriodConfig" (
    "id" UUID NOT NULL,
    "institutionId" UUID NOT NULL,
    "academicYearId" UUID NOT NULL,
    "academicTermId" UUID,
    "periodNumber" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "durationMinutes" INTEGER NOT NULL,
    "type" "PeriodType" NOT NULL DEFAULT 'TEACHING',
    "isBreak" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PeriodConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimetableSlot" (
    "id" UUID NOT NULL,
    "institutionId" UUID NOT NULL,
    "academicYearId" UUID NOT NULL,
    "academicTermId" UUID,
    "sectionId" UUID NOT NULL,
    "subjectId" UUID NOT NULL,
    "staffId" UUID NOT NULL,
    "periodConfigId" UUID NOT NULL,
    "dayOfWeek" "DayOfWeek" NOT NULL,
    "roomNumber" TEXT,
    "status" "TimetableSlotStatus" NOT NULL DEFAULT 'ACTIVE',
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TimetableSlot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AttendanceThresholdConfig" (
    "id" UUID NOT NULL,
    "institutionId" UUID NOT NULL,
    "academicYearId" UUID,
    "academicTermId" UUID,
    "courseId" UUID,
    "classId" UUID,
    "minAttendancePercentage" DECIMAL(5,2) NOT NULL DEFAULT 75.00,
    "warningAttendancePercentage" DECIMAL(5,2) NOT NULL DEFAULT 65.00,
    "medicalConcessionPercentage" DECIMAL(5,2),
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AttendanceThresholdConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentAttendance" (
    "id" UUID NOT NULL,
    "institutionId" UUID NOT NULL,
    "studentId" UUID NOT NULL,
    "academicYearId" UUID NOT NULL,
    "academicTermId" UUID,
    "classId" UUID NOT NULL,
    "sectionId" UUID NOT NULL,
    "subjectId" UUID,
    "timetableSlotId" UUID,
    "periodConfigId" UUID,
    "markedByStaffId" UUID NOT NULL,
    "date" DATE NOT NULL,
    "status" "AttendanceStatus" NOT NULL DEFAULT 'PRESENT',
    "session" TEXT,
    "remarks" TEXT,
    "isCorrected" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentAttendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AttendanceCorrectionAudit" (
    "id" UUID NOT NULL,
    "institutionId" UUID NOT NULL,
    "attendanceId" UUID NOT NULL,
    "previousStatus" "AttendanceStatus" NOT NULL,
    "newStatus" "AttendanceStatus" NOT NULL,
    "reason" TEXT NOT NULL,
    "correctedByUserId" UUID NOT NULL,
    "correctedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AttendanceCorrectionAudit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FacultyAttendance" (
    "id" UUID NOT NULL,
    "institutionId" UUID NOT NULL,
    "staffId" UUID NOT NULL,
    "date" DATE NOT NULL,
    "checkInTime" TIMESTAMP(3),
    "checkOutTime" TIMESTAMP(3),
    "workingMinutes" INTEGER,
    "status" "FacultyAttendanceStatus" NOT NULL DEFAULT 'PRESENT',
    "remarks" TEXT,
    "verifiedByUserId" UUID,
    "verificationNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FacultyAttendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExamHall" (
    "id" UUID NOT NULL,
    "institutionId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "building" TEXT NOT NULL,
    "floor" TEXT,
    "capacity" INTEGER NOT NULL,
    "facilities" TEXT,
    "status" "ExamHallStatus" NOT NULL DEFAULT 'AVAILABLE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExamHall_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PeriodConfig_institutionId_isActive_idx" ON "PeriodConfig"("institutionId", "isActive");

-- CreateIndex
CREATE INDEX "PeriodConfig_academicYearId_institutionId_idx" ON "PeriodConfig"("academicYearId", "institutionId");

-- CreateIndex
CREATE INDEX "PeriodConfig_academicTermId_institutionId_idx" ON "PeriodConfig"("academicTermId", "institutionId");

-- CreateIndex
CREATE UNIQUE INDEX "PeriodConfig_academicYearId_periodNumber_key" ON "PeriodConfig"("academicYearId", "periodNumber");

-- CreateIndex
CREATE UNIQUE INDEX "PeriodConfig_id_institutionId_key" ON "PeriodConfig"("id", "institutionId");

-- CreateIndex
CREATE INDEX "TimetableSlot_institutionId_academicYearId_idx" ON "TimetableSlot"("institutionId", "academicYearId");

-- CreateIndex
CREATE INDEX "TimetableSlot_sectionId_institutionId_idx" ON "TimetableSlot"("sectionId", "institutionId");

-- CreateIndex
CREATE INDEX "TimetableSlot_staffId_institutionId_idx" ON "TimetableSlot"("staffId", "institutionId");

-- CreateIndex
CREATE INDEX "TimetableSlot_subjectId_institutionId_idx" ON "TimetableSlot"("subjectId", "institutionId");

-- CreateIndex
CREATE INDEX "TimetableSlot_periodConfigId_institutionId_idx" ON "TimetableSlot"("periodConfigId", "institutionId");

-- CreateIndex
CREATE INDEX "TimetableSlot_academicYearId_roomNumber_dayOfWeek_periodCon_idx" ON "TimetableSlot"("academicYearId", "roomNumber", "dayOfWeek", "periodConfigId");

-- CreateIndex
CREATE UNIQUE INDEX "TimetableSlot_academicYearId_staffId_dayOfWeek_periodConfig_key" ON "TimetableSlot"("academicYearId", "staffId", "dayOfWeek", "periodConfigId");

-- CreateIndex
CREATE UNIQUE INDEX "TimetableSlot_academicYearId_sectionId_dayOfWeek_periodConf_key" ON "TimetableSlot"("academicYearId", "sectionId", "dayOfWeek", "periodConfigId");

-- CreateIndex
CREATE UNIQUE INDEX "TimetableSlot_id_institutionId_key" ON "TimetableSlot"("id", "institutionId");

-- CreateIndex
CREATE INDEX "AttendanceThresholdConfig_institutionId_isActive_idx" ON "AttendanceThresholdConfig"("institutionId", "isActive");

-- CreateIndex
CREATE INDEX "AttendanceThresholdConfig_institutionId_courseId_classId_idx" ON "AttendanceThresholdConfig"("institutionId", "courseId", "classId");

-- CreateIndex
CREATE UNIQUE INDEX "AttendanceThresholdConfig_id_institutionId_key" ON "AttendanceThresholdConfig"("id", "institutionId");

-- CreateIndex
CREATE INDEX "StudentAttendance_institutionId_classId_sectionId_date_idx" ON "StudentAttendance"("institutionId", "classId", "sectionId", "date");

-- CreateIndex
CREATE INDEX "StudentAttendance_studentId_date_idx" ON "StudentAttendance"("studentId", "date");

-- CreateIndex
CREATE INDEX "StudentAttendance_markedByStaffId_date_idx" ON "StudentAttendance"("markedByStaffId", "date");

-- CreateIndex
CREATE INDEX "StudentAttendance_subjectId_institutionId_idx" ON "StudentAttendance"("subjectId", "institutionId");

-- CreateIndex
CREATE INDEX "StudentAttendance_timetableSlotId_institutionId_idx" ON "StudentAttendance"("timetableSlotId", "institutionId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentAttendance_id_institutionId_key" ON "StudentAttendance"("id", "institutionId");

-- CreateIndex
CREATE INDEX "AttendanceCorrectionAudit_attendanceId_institutionId_idx" ON "AttendanceCorrectionAudit"("attendanceId", "institutionId");

-- CreateIndex
CREATE INDEX "AttendanceCorrectionAudit_institutionId_correctedAt_idx" ON "AttendanceCorrectionAudit"("institutionId", "correctedAt");

-- CreateIndex
CREATE INDEX "AttendanceCorrectionAudit_correctedByUserId_idx" ON "AttendanceCorrectionAudit"("correctedByUserId");

-- CreateIndex
CREATE UNIQUE INDEX "AttendanceCorrectionAudit_id_institutionId_key" ON "AttendanceCorrectionAudit"("id", "institutionId");

-- CreateIndex
CREATE INDEX "FacultyAttendance_institutionId_date_idx" ON "FacultyAttendance"("institutionId", "date");

-- CreateIndex
CREATE INDEX "FacultyAttendance_staffId_institutionId_idx" ON "FacultyAttendance"("staffId", "institutionId");

-- CreateIndex
CREATE UNIQUE INDEX "FacultyAttendance_staffId_date_key" ON "FacultyAttendance"("staffId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "FacultyAttendance_id_institutionId_key" ON "FacultyAttendance"("id", "institutionId");

-- CreateIndex
CREATE INDEX "ExamHall_institutionId_status_idx" ON "ExamHall"("institutionId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "ExamHall_institutionId_code_key" ON "ExamHall"("institutionId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "ExamHall_id_institutionId_key" ON "ExamHall"("id", "institutionId");

-- AddForeignKey
ALTER TABLE "PeriodConfig" ADD CONSTRAINT "PeriodConfig_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PeriodConfig" ADD CONSTRAINT "PeriodConfig_academicYearId_institutionId_fkey" FOREIGN KEY ("academicYearId", "institutionId") REFERENCES "AcademicYear"("id", "institutionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PeriodConfig" ADD CONSTRAINT "PeriodConfig_academicTermId_institutionId_fkey" FOREIGN KEY ("academicTermId", "institutionId") REFERENCES "AcademicTerm"("id", "institutionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimetableSlot" ADD CONSTRAINT "TimetableSlot_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimetableSlot" ADD CONSTRAINT "TimetableSlot_academicYearId_institutionId_fkey" FOREIGN KEY ("academicYearId", "institutionId") REFERENCES "AcademicYear"("id", "institutionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimetableSlot" ADD CONSTRAINT "TimetableSlot_academicTermId_institutionId_fkey" FOREIGN KEY ("academicTermId", "institutionId") REFERENCES "AcademicTerm"("id", "institutionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimetableSlot" ADD CONSTRAINT "TimetableSlot_sectionId_institutionId_fkey" FOREIGN KEY ("sectionId", "institutionId") REFERENCES "Section"("id", "institutionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimetableSlot" ADD CONSTRAINT "TimetableSlot_subjectId_institutionId_fkey" FOREIGN KEY ("subjectId", "institutionId") REFERENCES "Subject"("id", "institutionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimetableSlot" ADD CONSTRAINT "TimetableSlot_staffId_institutionId_fkey" FOREIGN KEY ("staffId", "institutionId") REFERENCES "Staff"("id", "institutionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimetableSlot" ADD CONSTRAINT "TimetableSlot_periodConfigId_institutionId_fkey" FOREIGN KEY ("periodConfigId", "institutionId") REFERENCES "PeriodConfig"("id", "institutionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceThresholdConfig" ADD CONSTRAINT "AttendanceThresholdConfig_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceThresholdConfig" ADD CONSTRAINT "AttendanceThresholdConfig_academicYearId_institutionId_fkey" FOREIGN KEY ("academicYearId", "institutionId") REFERENCES "AcademicYear"("id", "institutionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceThresholdConfig" ADD CONSTRAINT "AttendanceThresholdConfig_academicTermId_institutionId_fkey" FOREIGN KEY ("academicTermId", "institutionId") REFERENCES "AcademicTerm"("id", "institutionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceThresholdConfig" ADD CONSTRAINT "AttendanceThresholdConfig_courseId_institutionId_fkey" FOREIGN KEY ("courseId", "institutionId") REFERENCES "Course"("id", "institutionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceThresholdConfig" ADD CONSTRAINT "AttendanceThresholdConfig_classId_institutionId_fkey" FOREIGN KEY ("classId", "institutionId") REFERENCES "Class"("id", "institutionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentAttendance" ADD CONSTRAINT "StudentAttendance_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentAttendance" ADD CONSTRAINT "StudentAttendance_studentId_institutionId_fkey" FOREIGN KEY ("studentId", "institutionId") REFERENCES "Student"("id", "institutionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentAttendance" ADD CONSTRAINT "StudentAttendance_academicYearId_institutionId_fkey" FOREIGN KEY ("academicYearId", "institutionId") REFERENCES "AcademicYear"("id", "institutionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentAttendance" ADD CONSTRAINT "StudentAttendance_academicTermId_institutionId_fkey" FOREIGN KEY ("academicTermId", "institutionId") REFERENCES "AcademicTerm"("id", "institutionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentAttendance" ADD CONSTRAINT "StudentAttendance_classId_institutionId_fkey" FOREIGN KEY ("classId", "institutionId") REFERENCES "Class"("id", "institutionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentAttendance" ADD CONSTRAINT "StudentAttendance_sectionId_institutionId_fkey" FOREIGN KEY ("sectionId", "institutionId") REFERENCES "Section"("id", "institutionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentAttendance" ADD CONSTRAINT "StudentAttendance_subjectId_institutionId_fkey" FOREIGN KEY ("subjectId", "institutionId") REFERENCES "Subject"("id", "institutionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentAttendance" ADD CONSTRAINT "StudentAttendance_timetableSlotId_institutionId_fkey" FOREIGN KEY ("timetableSlotId", "institutionId") REFERENCES "TimetableSlot"("id", "institutionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentAttendance" ADD CONSTRAINT "StudentAttendance_periodConfigId_institutionId_fkey" FOREIGN KEY ("periodConfigId", "institutionId") REFERENCES "PeriodConfig"("id", "institutionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentAttendance" ADD CONSTRAINT "StudentAttendance_markedByStaffId_institutionId_fkey" FOREIGN KEY ("markedByStaffId", "institutionId") REFERENCES "Staff"("id", "institutionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceCorrectionAudit" ADD CONSTRAINT "AttendanceCorrectionAudit_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceCorrectionAudit" ADD CONSTRAINT "AttendanceCorrectionAudit_attendanceId_institutionId_fkey" FOREIGN KEY ("attendanceId", "institutionId") REFERENCES "StudentAttendance"("id", "institutionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceCorrectionAudit" ADD CONSTRAINT "AttendanceCorrectionAudit_correctedByUserId_fkey" FOREIGN KEY ("correctedByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FacultyAttendance" ADD CONSTRAINT "FacultyAttendance_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FacultyAttendance" ADD CONSTRAINT "FacultyAttendance_staffId_institutionId_fkey" FOREIGN KEY ("staffId", "institutionId") REFERENCES "Staff"("id", "institutionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FacultyAttendance" ADD CONSTRAINT "FacultyAttendance_verifiedByUserId_fkey" FOREIGN KEY ("verifiedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamHall" ADD CONSTRAINT "ExamHall_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;
