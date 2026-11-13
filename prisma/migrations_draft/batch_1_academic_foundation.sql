-- ============================================================================
-- SST ERP Migration Draft - Batch 1: Academic Foundation
-- Scope: AcademicYear, AcademicTerm, Department, Course, Class, Section, Subject
-- Date: 2026-11-13
-- Author: Antigravity (Batch 1 Implementation)
-- Note: Do NOT apply directly to shared Supabase without team synchronization.
-- ============================================================================

-- CreateEnum
CREATE TYPE "AcademicYearStatus" AS ENUM ('UPCOMING', 'ACTIVE', 'COMPLETED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "TermStatus" AS ENUM ('UPCOMING', 'ACTIVE', 'COMPLETED');

-- CreateEnum
CREATE TYPE "DepartmentStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "DegreeType" AS ENUM ('UNDERGRADUATE', 'POSTGRADUATE', 'DIPLOMA', 'DOCTORAL', 'CERTIFICATE');

-- CreateEnum
CREATE TYPE "CourseStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "SectionStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "SubjectType" AS ENUM ('CORE_THEORY', 'PRACTICAL_LAB', 'DEPARTMENT_ELECTIVE', 'OPEN_ELECTIVE', 'PROJECT_SEMINAR');

-- CreateEnum
CREATE TYPE "SubjectStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'ARCHIVED');

-- CreateTable
CREATE TABLE "AcademicYear" (
    "id" UUID NOT NULL,
    "institutionId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "status" "AcademicYearStatus" NOT NULL DEFAULT 'UPCOMING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AcademicYear_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AcademicTerm" (
    "id" UUID NOT NULL,
    "institutionId" UUID NOT NULL,
    "academicYearId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "status" "TermStatus" NOT NULL DEFAULT 'UPCOMING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AcademicTerm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Department" (
    "id" UUID NOT NULL,
    "institutionId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "hodStaffId" UUID,
    "studentCapacity" INTEGER DEFAULT 0,
    "status" "DepartmentStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Course" (
    "id" UUID NOT NULL,
    "institutionId" UUID NOT NULL,
    "departmentId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "degreeType" "DegreeType" NOT NULL DEFAULT 'UNDERGRADUATE',
    "durationYears" INTEGER NOT NULL DEFAULT 4,
    "totalSemesters" INTEGER NOT NULL DEFAULT 8,
    "totalCredits" INTEGER NOT NULL DEFAULT 160,
    "description" TEXT,
    "status" "CourseStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Class" (
    "id" UUID NOT NULL,
    "institutionId" UUID NOT NULL,
    "courseId" UUID NOT NULL,
    "academicYearId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "semester" INTEGER NOT NULL,
    "year" INTEGER,
    "stream" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Class_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Section" (
    "id" UUID NOT NULL,
    "institutionId" UUID NOT NULL,
    "classId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "batchName" TEXT,
    "maxCapacity" INTEGER NOT NULL DEFAULT 60,
    "roomNumber" TEXT,
    "classTeacherStaffId" UUID,
    "status" "SectionStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Section_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subject" (
    "id" UUID NOT NULL,
    "institutionId" UUID NOT NULL,
    "departmentId" UUID NOT NULL,
    "courseId" UUID,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" "SubjectType" NOT NULL DEFAULT 'CORE_THEORY',
    "credits" INTEGER NOT NULL DEFAULT 3,
    "hoursPerWeek" INTEGER NOT NULL DEFAULT 3,
    "semester" INTEGER,
    "description" TEXT,
    "status" "SubjectStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subject_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AcademicYear_institutionId_status_idx" ON "AcademicYear"("institutionId", "status");

-- CreateIndex
CREATE INDEX "AcademicYear_institutionId_isCurrent_idx" ON "AcademicYear"("institutionId", "isCurrent");

-- CreateIndex
CREATE UNIQUE INDEX "AcademicYear_institutionId_code_key" ON "AcademicYear"("institutionId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "AcademicYear_institutionId_name_key" ON "AcademicYear"("institutionId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "AcademicYear_id_institutionId_key" ON "AcademicYear"("id", "institutionId");

-- CreateIndex
CREATE INDEX "AcademicTerm_institutionId_isCurrent_idx" ON "AcademicTerm"("institutionId", "isCurrent");

-- CreateIndex
CREATE INDEX "AcademicTerm_academicYearId_institutionId_idx" ON "AcademicTerm"("academicYearId", "institutionId");

-- CreateIndex
CREATE UNIQUE INDEX "AcademicTerm_academicYearId_name_key" ON "AcademicTerm"("academicYearId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "AcademicTerm_id_institutionId_key" ON "AcademicTerm"("id", "institutionId");

-- CreateIndex
CREATE INDEX "Department_institutionId_status_idx" ON "Department"("institutionId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Department_institutionId_code_key" ON "Department"("institutionId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "Department_id_institutionId_key" ON "Department"("id", "institutionId");

-- CreateIndex
CREATE INDEX "Course_institutionId_status_idx" ON "Course"("institutionId", "status");

-- CreateIndex
CREATE INDEX "Course_departmentId_institutionId_idx" ON "Course"("departmentId", "institutionId");

-- CreateIndex
CREATE UNIQUE INDEX "Course_institutionId_code_key" ON "Course"("institutionId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "Course_id_institutionId_key" ON "Course"("id", "institutionId");

-- CreateIndex
CREATE INDEX "Class_institutionId_isActive_idx" ON "Class"("institutionId", "isActive");

-- CreateIndex
CREATE INDEX "Class_courseId_institutionId_idx" ON "Class"("courseId", "institutionId");

-- CreateIndex
CREATE INDEX "Class_academicYearId_institutionId_idx" ON "Class"("academicYearId", "institutionId");

-- CreateIndex
CREATE UNIQUE INDEX "Class_courseId_academicYearId_code_key" ON "Class"("courseId", "academicYearId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "Class_id_institutionId_key" ON "Class"("id", "institutionId");

-- CreateIndex
CREATE INDEX "Section_institutionId_status_idx" ON "Section"("institutionId", "status");

-- CreateIndex
CREATE INDEX "Section_classId_institutionId_idx" ON "Section"("classId", "institutionId");

-- CreateIndex
CREATE UNIQUE INDEX "Section_classId_name_key" ON "Section"("classId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Section_id_institutionId_key" ON "Section"("id", "institutionId");

-- CreateIndex
CREATE INDEX "Subject_institutionId_status_idx" ON "Subject"("institutionId", "status");

-- CreateIndex
CREATE INDEX "Subject_departmentId_institutionId_idx" ON "Subject"("departmentId", "institutionId");

-- CreateIndex
CREATE INDEX "Subject_courseId_institutionId_idx" ON "Subject"("courseId", "institutionId");

-- CreateIndex
CREATE UNIQUE INDEX "Subject_institutionId_code_key" ON "Subject"("institutionId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "Subject_id_institutionId_key" ON "Subject"("id", "institutionId");

-- AddForeignKey
ALTER TABLE "AcademicYear" ADD CONSTRAINT "AcademicYear_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AcademicTerm" ADD CONSTRAINT "AcademicTerm_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AcademicTerm" ADD CONSTRAINT "AcademicTerm_academicYearId_institutionId_fkey" FOREIGN KEY ("academicYearId", "institutionId") REFERENCES "AcademicYear"("id", "institutionId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Department" ADD CONSTRAINT "Department_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_departmentId_institutionId_fkey" FOREIGN KEY ("departmentId", "institutionId") REFERENCES "Department"("id", "institutionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Class" ADD CONSTRAINT "Class_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Class" ADD CONSTRAINT "Class_courseId_institutionId_fkey" FOREIGN KEY ("courseId", "institutionId") REFERENCES "Course"("id", "institutionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Class" ADD CONSTRAINT "Class_academicYearId_institutionId_fkey" FOREIGN KEY ("academicYearId", "institutionId") REFERENCES "AcademicYear"("id", "institutionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Section" ADD CONSTRAINT "Section_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Section" ADD CONSTRAINT "Section_classId_institutionId_fkey" FOREIGN KEY ("classId", "institutionId") REFERENCES "Class"("id", "institutionId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subject" ADD CONSTRAINT "Subject_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subject" ADD CONSTRAINT "Subject_departmentId_institutionId_fkey" FOREIGN KEY ("departmentId", "institutionId") REFERENCES "Department"("id", "institutionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subject" ADD CONSTRAINT "Subject_courseId_institutionId_fkey" FOREIGN KEY ("courseId", "institutionId") REFERENCES "Course"("id", "institutionId") ON DELETE RESTRICT ON UPDATE CASCADE;
