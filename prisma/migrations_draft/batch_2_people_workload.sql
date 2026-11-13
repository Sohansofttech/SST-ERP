-- ============================================================================
-- SST ERP Migration Draft - Batch 2: People & Workload
-- Scope: AdmissionApplication, Staff, Student, StudentEnrollmentHistory, Guardian, StudentGuardian, FacultySubjectAssignment
-- Date: 2026-11-13
-- Author: Antigravity (Batch 2 Implementation)
-- Note: Do NOT apply directly to shared Supabase without team synchronization.
-- ============================================================================

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateEnum
CREATE TYPE "AdmissionApplicationStatus" AS ENUM ('SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'WAITLISTED', 'ENROLLED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('PENDING', 'PARTIALLY_SUBMITTED', 'VERIFIED', 'REJECTED');

-- CreateEnum
CREATE TYPE "StaffEmploymentType" AS ENUM ('FULL_TIME', 'PART_TIME', 'CONTRACT', 'VISITING');

-- CreateEnum
CREATE TYPE "StaffStatus" AS ENUM ('ACTIVE', 'ON_LEAVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "StudentStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'ALUMNI', 'TRANSFERRED', 'DROPOUT');

-- CreateEnum
CREATE TYPE "EnrollmentStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'PROMOTED', 'DETAINED', 'DISCONTINUED');

-- CreateEnum
CREATE TYPE "GuardianRelationship" AS ENUM ('FATHER', 'MOTHER', 'LOCAL_GUARDIAN', 'LEGAL_GUARDIAN', 'OTHER');

-- CreateEnum
CREATE TYPE "GuardianStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateTable
CREATE TABLE "AdmissionApplication" (
    "id" UUID NOT NULL,
    "institutionId" UUID NOT NULL,
    "academicYearId" UUID NOT NULL,
    "courseId" UUID NOT NULL,
    "applicationNumber" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "dob" TIMESTAMP(3) NOT NULL,
    "gender" "Gender" NOT NULL,
    "addressLine" TEXT,
    "city" TEXT,
    "state" TEXT,
    "postalCode" TEXT,
    "guardianName" TEXT,
    "guardianRelationship" TEXT,
    "guardianPhone" TEXT,
    "guardianEmail" TEXT,
    "status" "AdmissionApplicationStatus" NOT NULL DEFAULT 'SUBMITTED',
    "documentStatus" "DocumentStatus" NOT NULL DEFAULT 'PENDING',
    "convertedStudentId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdmissionApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Staff" (
    "id" UUID NOT NULL,
    "institutionId" UUID NOT NULL,
    "userId" UUID,
    "staffEmployeeId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "departmentId" UUID NOT NULL,
    "designation" TEXT NOT NULL,
    "employmentType" "StaffEmploymentType" NOT NULL DEFAULT 'FULL_TIME',
    "qualification" TEXT,
    "joiningDate" TIMESTAMP(3),
    "gender" "Gender",
    "status" "StaffStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Staff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Student" (
    "id" UUID NOT NULL,
    "institutionId" UUID NOT NULL,
    "userId" UUID,
    "studentUniqueId" TEXT NOT NULL,
    "rollNumber" TEXT NOT NULL,
    "admissionNumber" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "dob" TIMESTAMP(3) NOT NULL,
    "gender" "Gender" NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "institutionalEmail" TEXT,
    "bloodGroup" TEXT,
    "category" TEXT,
    "emergencyPhone" TEXT,
    "addressLine" TEXT,
    "city" TEXT,
    "state" TEXT,
    "postalCode" TEXT,
    "admissionDate" TIMESTAMP(3) NOT NULL,
    "currentAcademicYearId" UUID NOT NULL,
    "currentCourseId" UUID NOT NULL,
    "currentDepartmentId" UUID NOT NULL,
    "currentClassId" UUID NOT NULL,
    "currentSectionId" UUID NOT NULL,
    "batch" TEXT NOT NULL,
    "status" "StudentStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentEnrollmentHistory" (
    "id" UUID NOT NULL,
    "institutionId" UUID NOT NULL,
    "studentId" UUID NOT NULL,
    "academicYearId" UUID NOT NULL,
    "classId" UUID NOT NULL,
    "sectionId" UUID,
    "semester" INTEGER NOT NULL,
    "enrolledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "EnrollmentStatus" NOT NULL DEFAULT 'ACTIVE',
    "promotionDecision" TEXT,
    "sgpa" DECIMAL(4,2),
    "cgpa" DECIMAL(4,2),
    "carriedBacklogsCount" INTEGER DEFAULT 0,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudentEnrollmentHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Guardian" (
    "id" UUID NOT NULL,
    "institutionId" UUID NOT NULL,
    "userId" UUID,
    "guardianUniqueId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "relationship" "GuardianRelationship" NOT NULL DEFAULT 'OTHER',
    "phone" TEXT NOT NULL,
    "alternatePhone" TEXT,
    "email" TEXT,
    "addressLine" TEXT,
    "city" TEXT,
    "state" TEXT,
    "postalCode" TEXT,
    "occupation" TEXT,
    "company" TEXT,
    "status" "GuardianStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Guardian_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentGuardian" (
    "studentId" UUID NOT NULL,
    "guardianId" UUID NOT NULL,
    "institutionId" UUID NOT NULL,
    "relationship" "GuardianRelationship" NOT NULL DEFAULT 'OTHER',
    "isEmergencyContact" BOOLEAN NOT NULL DEFAULT false,
    "canPickup" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudentGuardian_pkey" PRIMARY KEY ("studentId","guardianId")
);

-- CreateTable
CREATE TABLE "FacultySubjectAssignment" (
    "id" UUID NOT NULL,
    "institutionId" UUID NOT NULL,
    "academicYearId" UUID NOT NULL,
    "staffId" UUID NOT NULL,
    "subjectId" UUID NOT NULL,
    "sectionId" UUID NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT true,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FacultySubjectAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AdmissionApplication_convertedStudentId_key" ON "AdmissionApplication"("convertedStudentId");

-- CreateIndex
CREATE INDEX "AdmissionApplication_institutionId_status_idx" ON "AdmissionApplication"("institutionId", "status");

-- CreateIndex
CREATE INDEX "AdmissionApplication_academicYearId_institutionId_idx" ON "AdmissionApplication"("academicYearId", "institutionId");

-- CreateIndex
CREATE INDEX "AdmissionApplication_courseId_institutionId_idx" ON "AdmissionApplication"("courseId", "institutionId");

-- CreateIndex
CREATE UNIQUE INDEX "AdmissionApplication_institutionId_applicationNumber_key" ON "AdmissionApplication"("institutionId", "applicationNumber");

-- CreateIndex
CREATE UNIQUE INDEX "AdmissionApplication_id_institutionId_key" ON "AdmissionApplication"("id", "institutionId");

-- CreateIndex
CREATE UNIQUE INDEX "Staff_userId_key" ON "Staff"("userId");

-- CreateIndex
CREATE INDEX "Staff_institutionId_status_idx" ON "Staff"("institutionId", "status");

-- CreateIndex
CREATE INDEX "Staff_departmentId_institutionId_idx" ON "Staff"("departmentId", "institutionId");

-- CreateIndex
CREATE UNIQUE INDEX "Staff_institutionId_staffEmployeeId_key" ON "Staff"("institutionId", "staffEmployeeId");

-- CreateIndex
CREATE UNIQUE INDEX "Staff_institutionId_email_key" ON "Staff"("institutionId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "Staff_id_institutionId_key" ON "Staff"("id", "institutionId");

-- CreateIndex
CREATE UNIQUE INDEX "Student_userId_key" ON "Student"("userId");

-- CreateIndex
CREATE INDEX "Student_institutionId_status_idx" ON "Student"("institutionId", "status");

-- CreateIndex
CREATE INDEX "Student_currentAcademicYearId_institutionId_idx" ON "Student"("currentAcademicYearId", "institutionId");

-- CreateIndex
CREATE INDEX "Student_currentCourseId_institutionId_idx" ON "Student"("currentCourseId", "institutionId");

-- CreateIndex
CREATE INDEX "Student_currentDepartmentId_institutionId_idx" ON "Student"("currentDepartmentId", "institutionId");

-- CreateIndex
CREATE INDEX "Student_currentClassId_institutionId_idx" ON "Student"("currentClassId", "institutionId");

-- CreateIndex
CREATE INDEX "Student_currentSectionId_institutionId_idx" ON "Student"("currentSectionId", "institutionId");

-- CreateIndex
CREATE UNIQUE INDEX "Student_institutionId_studentUniqueId_key" ON "Student"("institutionId", "studentUniqueId");

-- CreateIndex
CREATE UNIQUE INDEX "Student_institutionId_rollNumber_key" ON "Student"("institutionId", "rollNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Student_institutionId_admissionNumber_key" ON "Student"("institutionId", "admissionNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Student_id_institutionId_key" ON "Student"("id", "institutionId");

-- CreateIndex
CREATE INDEX "StudentEnrollmentHistory_studentId_academicYearId_idx" ON "StudentEnrollmentHistory"("studentId", "academicYearId");

-- CreateIndex
CREATE INDEX "StudentEnrollmentHistory_institutionId_classId_idx" ON "StudentEnrollmentHistory"("institutionId", "classId");

-- CreateIndex
CREATE INDEX "StudentEnrollmentHistory_studentId_semester_idx" ON "StudentEnrollmentHistory"("studentId", "semester");

-- CreateIndex
CREATE UNIQUE INDEX "StudentEnrollmentHistory_id_institutionId_key" ON "StudentEnrollmentHistory"("id", "institutionId");

-- CreateIndex
CREATE UNIQUE INDEX "Guardian_userId_key" ON "Guardian"("userId");

-- CreateIndex
CREATE INDEX "Guardian_institutionId_status_idx" ON "Guardian"("institutionId", "status");

-- CreateIndex
CREATE INDEX "Guardian_institutionId_phone_idx" ON "Guardian"("institutionId", "phone");

-- CreateIndex
CREATE UNIQUE INDEX "Guardian_institutionId_guardianUniqueId_key" ON "Guardian"("institutionId", "guardianUniqueId");

-- CreateIndex
CREATE UNIQUE INDEX "Guardian_id_institutionId_key" ON "Guardian"("id", "institutionId");

-- CreateIndex
CREATE INDEX "StudentGuardian_guardianId_institutionId_idx" ON "StudentGuardian"("guardianId", "institutionId");

-- CreateIndex
CREATE INDEX "StudentGuardian_studentId_institutionId_idx" ON "StudentGuardian"("studentId", "institutionId");

-- CreateIndex
CREATE INDEX "FacultySubjectAssignment_staffId_academicYearId_idx" ON "FacultySubjectAssignment"("staffId", "academicYearId");

-- CreateIndex
CREATE INDEX "FacultySubjectAssignment_institutionId_academicYearId_idx" ON "FacultySubjectAssignment"("institutionId", "academicYearId");

-- CreateIndex
CREATE INDEX "FacultySubjectAssignment_subjectId_institutionId_idx" ON "FacultySubjectAssignment"("subjectId", "institutionId");

-- CreateIndex
CREATE INDEX "FacultySubjectAssignment_sectionId_institutionId_idx" ON "FacultySubjectAssignment"("sectionId", "institutionId");

-- CreateIndex
CREATE UNIQUE INDEX "FacultySubjectAssignment_academicYearId_staffId_subjectId_s_key" ON "FacultySubjectAssignment"("academicYearId", "staffId", "subjectId", "sectionId");

-- CreateIndex
CREATE UNIQUE INDEX "FacultySubjectAssignment_id_institutionId_key" ON "FacultySubjectAssignment"("id", "institutionId");

-- AddForeignKey
ALTER TABLE "Department" ADD CONSTRAINT "Department_hodStaffId_institutionId_fkey" FOREIGN KEY ("hodStaffId", "institutionId") REFERENCES "Staff"("id", "institutionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Section" ADD CONSTRAINT "Section_classTeacherStaffId_institutionId_fkey" FOREIGN KEY ("classTeacherStaffId", "institutionId") REFERENCES "Staff"("id", "institutionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdmissionApplication" ADD CONSTRAINT "AdmissionApplication_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdmissionApplication" ADD CONSTRAINT "AdmissionApplication_academicYearId_institutionId_fkey" FOREIGN KEY ("academicYearId", "institutionId") REFERENCES "AcademicYear"("id", "institutionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdmissionApplication" ADD CONSTRAINT "AdmissionApplication_courseId_institutionId_fkey" FOREIGN KEY ("courseId", "institutionId") REFERENCES "Course"("id", "institutionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdmissionApplication" ADD CONSTRAINT "AdmissionApplication_convertedStudentId_fkey" FOREIGN KEY ("convertedStudentId") REFERENCES "Student"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Staff" ADD CONSTRAINT "Staff_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Staff" ADD CONSTRAINT "Staff_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Staff" ADD CONSTRAINT "Staff_departmentId_institutionId_fkey" FOREIGN KEY ("departmentId", "institutionId") REFERENCES "Department"("id", "institutionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_currentAcademicYearId_institutionId_fkey" FOREIGN KEY ("currentAcademicYearId", "institutionId") REFERENCES "AcademicYear"("id", "institutionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_currentCourseId_institutionId_fkey" FOREIGN KEY ("currentCourseId", "institutionId") REFERENCES "Course"("id", "institutionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_currentDepartmentId_institutionId_fkey" FOREIGN KEY ("currentDepartmentId", "institutionId") REFERENCES "Department"("id", "institutionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_currentClassId_institutionId_fkey" FOREIGN KEY ("currentClassId", "institutionId") REFERENCES "Class"("id", "institutionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_currentSectionId_institutionId_fkey" FOREIGN KEY ("currentSectionId", "institutionId") REFERENCES "Section"("id", "institutionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentEnrollmentHistory" ADD CONSTRAINT "StudentEnrollmentHistory_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentEnrollmentHistory" ADD CONSTRAINT "StudentEnrollmentHistory_studentId_institutionId_fkey" FOREIGN KEY ("studentId", "institutionId") REFERENCES "Student"("id", "institutionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentEnrollmentHistory" ADD CONSTRAINT "StudentEnrollmentHistory_academicYearId_institutionId_fkey" FOREIGN KEY ("academicYearId", "institutionId") REFERENCES "AcademicYear"("id", "institutionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentEnrollmentHistory" ADD CONSTRAINT "StudentEnrollmentHistory_classId_institutionId_fkey" FOREIGN KEY ("classId", "institutionId") REFERENCES "Class"("id", "institutionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentEnrollmentHistory" ADD CONSTRAINT "StudentEnrollmentHistory_sectionId_institutionId_fkey" FOREIGN KEY ("sectionId", "institutionId") REFERENCES "Section"("id", "institutionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Guardian" ADD CONSTRAINT "Guardian_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Guardian" ADD CONSTRAINT "Guardian_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentGuardian" ADD CONSTRAINT "StudentGuardian_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentGuardian" ADD CONSTRAINT "StudentGuardian_studentId_institutionId_fkey" FOREIGN KEY ("studentId", "institutionId") REFERENCES "Student"("id", "institutionId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentGuardian" ADD CONSTRAINT "StudentGuardian_guardianId_institutionId_fkey" FOREIGN KEY ("guardianId", "institutionId") REFERENCES "Guardian"("id", "institutionId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FacultySubjectAssignment" ADD CONSTRAINT "FacultySubjectAssignment_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FacultySubjectAssignment" ADD CONSTRAINT "FacultySubjectAssignment_academicYearId_institutionId_fkey" FOREIGN KEY ("academicYearId", "institutionId") REFERENCES "AcademicYear"("id", "institutionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FacultySubjectAssignment" ADD CONSTRAINT "FacultySubjectAssignment_staffId_institutionId_fkey" FOREIGN KEY ("staffId", "institutionId") REFERENCES "Staff"("id", "institutionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FacultySubjectAssignment" ADD CONSTRAINT "FacultySubjectAssignment_subjectId_institutionId_fkey" FOREIGN KEY ("subjectId", "institutionId") REFERENCES "Subject"("id", "institutionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FacultySubjectAssignment" ADD CONSTRAINT "FacultySubjectAssignment_sectionId_institutionId_fkey" FOREIGN KEY ("sectionId", "institutionId") REFERENCES "Section"("id", "institutionId") ON DELETE RESTRICT ON UPDATE CASCADE;
