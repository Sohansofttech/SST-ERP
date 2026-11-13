"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useInstitution } from "@/lib/store";
import { Card, CardContent } from "@/components/ui/card";
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
  UserPlus,
  Plus,
  Search,
  CheckCircle2,
  FileText,
  UserCheck,
  Eye,
  Edit2,
  Trash2,
  GraduationCap,
  Phone,
  Mail,
  MapPin,
  Check,
  X,
  History,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import {
  AdmissionApplication,
  AdmissionStatus,
  DocumentSubmissionStatus,
} from "@/types/institution";

export default function AdmissionsPage() {
  const {
    admissions,
    addAdmission,
    updateAdmission,
    deleteAdmission,
    updateAdmissionStatus,
    convertAdmissionToStudent,
    departments,
    courses,
    academicYears,
    activeAcademicYear,
    classes,
    sections,
  } = useInstitution();

  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [deptFilter, setDeptFilter] = useState<string>("ALL");
  const [courseFilter, setCourseFilter] = useState<string>("ALL");

  // Modal States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<AdmissionApplication | null>(null);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<AdmissionApplication | null>(null);

  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [statusToUpdate, setStatusToUpdate] = useState<AdmissionStatus>("Approved");
  const [statusRemarks, setStatusRemarks] = useState("");

  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedSectionId, setSelectedSectionId] = useState("");
  const [customRollNumber, setCustomRollNumber] = useState("");
  const [convertResult, setConvertResult] = useState<{ success: boolean; message: string; studentId?: string } | null>(null);

  // Form State
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dob, setDob] = useState("2008-05-15");
  const [gender, setGender] = useState<"Male" | "Female" | "Other">("Male");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("+91 ");
  const [addressLine, setAddressLine] = useState("");
  const [city, setCity] = useState("Bengaluru");
  const [state, setState] = useState("Karnataka");
  const [postalCode, setPostalCode] = useState("560001");

  const [guardianName, setGuardianName] = useState("");
  const [guardianRelation, setGuardianRelation] = useState<"Father" | "Mother" | "Local Guardian" | "Legal Guardian">("Father");
  const [guardianPhone, setGuardianPhone] = useState("+91 ");
  const [guardianEmail, setGuardianEmail] = useState("");
  const [guardianOccupation, setGuardianOccupation] = useState("");

  const [selectedDeptId, setSelectedDeptId] = useState(departments[0]?.id || "");
  const [selectedCourseId, setSelectedCourseId] = useState(courses[0]?.id || "");
  const [selectedAYId, setSelectedAYId] = useState(activeAcademicYear?.id || academicYears[0]?.id || "");

  const [prevSchool, setPrevSchool] = useState("");
  const [prevBoard, setPrevBoard] = useState("CBSE Class 12");
  const [prevScore, setPrevScore] = useState("85.5");
  const [passingYear, setPassingYear] = useState("2026");

  const [documents, setDocuments] = useState<DocumentSubmissionStatus[]>([
    { documentName: "10th Grade Marksheet", isSubmitted: true },
    { documentName: "12th Grade Marksheet", isSubmitted: true },
    { documentName: "Transfer Certificate (TC)", isSubmitted: false },
    { documentName: "Aadhaar Card / ID Proof", isSubmitted: true },
  ]);

  const [formError, setFormError] = useState("");

  // Filtered Admissions List
  const filteredAdmissions = useMemo(() => {
    return admissions.filter((app) => {
      const matchesSearch =
        searchQuery === "" ||
        app.applicantFullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.applicationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.phone.includes(searchQuery);

      const matchesStatus = statusFilter === "ALL" || app.status === statusFilter;
      const matchesDept = deptFilter === "ALL" || app.departmentId === deptFilter;
      const matchesCourse = courseFilter === "ALL" || app.courseId === courseFilter;

      return matchesSearch && matchesStatus && matchesDept && matchesCourse;
    });
  }, [admissions, searchQuery, statusFilter, deptFilter, courseFilter]);

  // Statistics
  const stats = useMemo(() => {
    return {
      total: admissions.length,
      submitted: admissions.filter((a) => a.status === "Submitted").length,
      underReview: admissions.filter((a) => a.status === "Under Review").length,
      approved: admissions.filter((a) => a.status === "Approved").length,
      rejected: admissions.filter((a) => a.status === "Rejected").length,
      waitlisted: admissions.filter((a) => a.status === "Waitlisted").length,
      enrolled: admissions.filter((a) => a.isConvertedToStudent).length,
    };
  }, [admissions]);

  // Open Add Application Modal
  const handleOpenAddModal = () => {
    setEditingApp(null);
    setFirstName("");
    setLastName("");
    setDob("2008-05-15");
    setGender("Male");
    setEmail("");
    setPhone("+91 ");
    setAddressLine("");
    setCity("Bengaluru");
    setState("Karnataka");
    setPostalCode("560001");

    setGuardianName("");
    setGuardianRelation("Father");
    setGuardianPhone("+91 ");
    setGuardianEmail("");
    setGuardianOccupation("");

    setSelectedDeptId(departments[0]?.id || "");
    setSelectedCourseId(courses[0]?.id || "");
    setSelectedAYId(activeAcademicYear?.id || academicYears[0]?.id || "");

    setPrevSchool("");
    setPrevBoard("CBSE Class 12");
    setPrevScore("85.5");
    setPassingYear("2026");

    setDocuments([
      { documentName: "10th Grade Marksheet", isSubmitted: true },
      { documentName: "12th Grade Marksheet", isSubmitted: true },
      { documentName: "Transfer Certificate (TC)", isSubmitted: false },
      { documentName: "Aadhaar Card / ID Proof", isSubmitted: true },
    ]);

    setFormError("");
    setIsFormModalOpen(true);
  };

  // Open Edit Application Modal
  const handleOpenEditModal = (app: AdmissionApplication) => {
    setEditingApp(app);
    setFirstName(app.applicantFirstName);
    setLastName(app.applicantLastName);
    setDob(app.dob);
    setGender(app.gender);
    setEmail(app.email);
    setPhone(app.phone);
    setAddressLine(app.addressLine);
    setCity(app.city);
    setState(app.state);
    setPostalCode(app.postalCode);

    setGuardianName(app.guardianName);
    setGuardianRelation(app.guardianRelation);
    setGuardianPhone(app.guardianPhone);
    setGuardianEmail(app.guardianEmail);
    setGuardianOccupation(app.guardianOccupation);

    setSelectedDeptId(app.departmentId);
    setSelectedCourseId(app.courseId);
    setSelectedAYId(app.academicYearId);

    setPrevSchool(app.previousSchoolOrCollege);
    setPrevBoard(app.previousBoardOrUniversity);
    setPrevScore(String(app.previousScorePercentage));
    setPassingYear(String(app.passingYear));

    setDocuments(app.documents || []);
    setFormError("");
    setIsFormModalOpen(true);
  };

  // Open View Details Modal
  const handleOpenDetails = (app: AdmissionApplication) => {
    setSelectedApp(app);
    setIsDetailModalOpen(true);
  };

  // Open Change Status Modal
  const handleOpenStatusModal = (app: AdmissionApplication) => {
    setSelectedApp(app);
    setStatusToUpdate(app.status);
    setStatusRemarks(app.reviewRemarks || "");
    setIsStatusModalOpen(true);
  };

  // Save Status Change
  const handleSaveStatus = () => {
    if (selectedApp) {
      updateAdmissionStatus(selectedApp.id, statusToUpdate, statusRemarks);
      setIsStatusModalOpen(false);
      // update selectedApp in view if open
      setSelectedApp((prev) =>
        prev
          ? {
              ...prev,
              status: statusToUpdate,
              reviewRemarks: statusRemarks,
            }
          : null
      );
    }
  };

  // Open Convert to Student Modal
  const handleOpenConvertModal = (app: AdmissionApplication) => {
    setSelectedApp(app);
    setConvertResult(null);

    // Pick a matching class for the course
    const matchingClass = classes.find((c) => c.courseId === app.courseId) || classes[0];
    const matchingSection = sections.find((s) => s.classId === matchingClass?.id) || sections[0];

    setSelectedClassId(matchingClass?.id || "");
    setSelectedSectionId(matchingSection?.id || "");
    setCustomRollNumber("");
    setIsConvertModalOpen(true);
  };

  // Execute Student Conversion
  const handleExecuteConvert = () => {
    if (!selectedApp) return;

    const result = convertAdmissionToStudent(selectedApp.id, {
      classId: selectedClassId,
      sectionId: selectedSectionId,
      rollNumber: customRollNumber.trim() ? customRollNumber.trim() : undefined,
    });

    setConvertResult(result);

    if (result.success) {
      // Refresh current selectedApp
      setSelectedApp((prev) =>
        prev
          ? {
              ...prev,
              status: "Approved",
              isConvertedToStudent: true,
              convertedStudentId: result.studentId,
            }
          : null
      );
    }
  };

  // Form Submission (Add or Edit)
  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!firstName.trim() || !lastName.trim()) {
      setFormError("Applicant first and last name are required.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setFormError("A valid applicant email address is required.");
      return;
    }
    if (!phone.trim() || phone.trim() === "+91") {
      setFormError("Applicant phone number is required.");
      return;
    }
    if (!guardianName.trim()) {
      setFormError("Parent/Guardian name is required.");
      return;
    }

    const deptObj = departments.find((d) => d.id === selectedDeptId);
    const courseObj = courses.find((c) => c.id === selectedCourseId);
    const ayObj = academicYears.find((ay) => ay.id === selectedAYId);

    if (editingApp) {
      updateAdmission(editingApp.id, {
        applicantFirstName: firstName.trim(),
        applicantLastName: lastName.trim(),
        dob,
        gender,
        email: email.trim(),
        phone: phone.trim(),
        addressLine: addressLine.trim(),
        city: city.trim(),
        state: state.trim(),
        postalCode: postalCode.trim(),
        guardianName: guardianName.trim(),
        guardianRelation,
        guardianPhone: guardianPhone.trim(),
        guardianEmail: guardianEmail.trim(),
        guardianOccupation: guardianOccupation.trim(),
        departmentId: selectedDeptId,
        departmentName: deptObj?.name || "Department",
        courseId: selectedCourseId,
        courseName: courseObj?.name || "Course",
        academicYearId: selectedAYId,
        academicYearName: ayObj?.name || "2026-2027",
        previousSchoolOrCollege: prevSchool.trim(),
        previousBoardOrUniversity: prevBoard.trim(),
        previousScorePercentage: parseFloat(prevScore) || 0,
        passingYear: parseInt(passingYear) || 2026,
        documents,
      });
    } else {
      addAdmission({
        applicantFirstName: firstName.trim(),
        applicantLastName: lastName.trim(),
        applicantFullName: `${firstName.trim()} ${lastName.trim()}`,
        dob,
        gender,
        email: email.trim(),
        phone: phone.trim(),
        addressLine: addressLine.trim(),
        city: city.trim(),
        state: state.trim(),
        postalCode: postalCode.trim(),
        guardianName: guardianName.trim(),
        guardianRelation,
        guardianPhone: guardianPhone.trim(),
        guardianEmail: guardianEmail.trim(),
        guardianOccupation: guardianOccupation.trim(),
        departmentId: selectedDeptId,
        departmentName: deptObj?.name || "Department",
        courseId: selectedCourseId,
        courseName: courseObj?.name || "Course",
        academicYearId: selectedAYId,
        academicYearName: ayObj?.name || "2026-2027",
        previousSchoolOrCollege: prevSchool.trim(),
        previousBoardOrUniversity: prevBoard.trim(),
        previousScorePercentage: parseFloat(prevScore) || 0,
        passingYear: parseInt(passingYear) || 2026,
        documents,
        status: "Submitted",
      });
    }

    setIsFormModalOpen(false);
  };

  // Toggle Document Submission
  const handleToggleDocument = (index: number) => {
    setDocuments((prev) => {
      const copy = [...prev];
      copy[index] = {
        ...copy[index],
        isSubmitted: !copy[index].isSubmitted,
        verifiedAt: !copy[index].isSubmitted ? new Date().toISOString().split("T")[0] : undefined,
      };
      return copy;
    });
  };

  // Helper Badge Color
  const getStatusBadge = (status: AdmissionStatus) => {
    switch (status) {
      case "Approved":
        return <Badge variant="success">Approved</Badge>;
      case "Under Review":
        return <Badge variant="warning">Under Review</Badge>;
      case "Submitted":
        return <Badge variant="info">Submitted</Badge>;
      case "Rejected":
        return <Badge variant="error">Rejected</Badge>;
      case "Waitlisted":
        return <Badge variant="navy">Waitlisted</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E2E8F0]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">
              Student Lifecycle
            </span>
            <span className="text-[#CBD5E1]">•</span>
            <span className="text-xs font-bold text-[#14B8A6] uppercase tracking-wider">
              Admissions Desk
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#1E293B]">
            Admission Management
          </h1>
          <p className="text-sm text-[#64748B] mt-1">
            Process candidate applications, track verification checklists, manage statuses, and register approved applicants as students.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={handleOpenAddModal}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          New Application
        </Button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
        <Card className="border-l-4 border-l-[#2563EB]">
          <CardContent className="p-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
              Total Applications
            </span>
            <h3 className="text-2xl font-black text-[#1E293B] mt-1">{stats.total}</h3>
            <p className="text-[11px] text-[#64748B] mt-0.5">{stats.submitted} New Submissions</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#F59E0B]">
          <CardContent className="p-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#D97706]">
              Under Review
            </span>
            <h3 className="text-2xl font-black text-[#D97706] mt-1">{stats.underReview}</h3>
            <p className="text-[11px] text-[#64748B] mt-0.5">Verification in Progress</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#16A34A]">
          <CardContent className="p-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#16A34A]">
              Approved
            </span>
            <h3 className="text-2xl font-black text-[#16A34A] mt-1">{stats.approved}</h3>
            <p className="text-[11px] text-[#16A34A] font-semibold mt-0.5">
              {stats.enrolled} Enrolled as Students
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#8B5CF6]">
          <CardContent className="p-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#7C3AED]">
              Waitlisted
            </span>
            <h3 className="text-2xl font-black text-[#7C3AED] mt-1">{stats.waitlisted}</h3>
            <p className="text-[11px] text-[#64748B] mt-0.5">Round 2 Candidates</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#DC2626]">
          <CardContent className="p-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#DC2626]">
              Rejected
            </span>
            <h3 className="text-2xl font-black text-[#DC2626] mt-1">{stats.rejected}</h3>
            <p className="text-[11px] text-[#64748B] mt-0.5">Cutoff / Documents</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-3 text-[#64748B]" />
              <input
                type="text"
                placeholder="Search by applicant name, Application ID, email, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-[#E2E8F0] focus:border-[#2563EB] focus:outline-none"
              />
            </div>

            {/* Dropdown Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 text-xs rounded-lg border border-[#E2E8F0] bg-white text-[#1E293B] focus:border-[#2563EB] focus:outline-none"
              >
                <option value="ALL">All Statuses</option>
                <option value="Submitted">Submitted</option>
                <option value="Under Review">Under Review</option>
                <option value="Approved">Approved</option>
                <option value="Waitlisted">Waitlisted</option>
                <option value="Rejected">Rejected</option>
              </select>

              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="px-3 py-2 text-xs rounded-lg border border-[#E2E8F0] bg-white text-[#1E293B] focus:border-[#2563EB] focus:outline-none max-w-[160px] truncate"
              >
                <option value="ALL">All Departments</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.code} - {d.name}
                  </option>
                ))}
              </select>

              <select
                value={courseFilter}
                onChange={(e) => setCourseFilter(e.target.value)}
                className="px-3 py-2 text-xs rounded-lg border border-[#E2E8F0] bg-white text-[#1E293B] focus:border-[#2563EB] focus:outline-none max-w-[160px] truncate"
              >
                <option value="ALL">All Programs</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code}
                  </option>
                ))}
              </select>

              {(searchQuery || statusFilter !== "ALL" || deptFilter !== "ALL" || courseFilter !== "ALL") && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("ALL");
                    setDeptFilter("ALL");
                    setCourseFilter("ALL");
                  }}
                  className="text-xs text-[#DC2626]"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Applications Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Application ID</TableHead>
                <TableHead>Applicant</TableHead>
                <TableHead>Desired Program</TableHead>
                <TableHead>Prior Score</TableHead>
                <TableHead>Documents</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Student Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAdmissions.length === 0 ? (
                <TableEmpty
                  colSpan={8}
                  message="No admission applications found matching your criteria."
                />
              ) : (
                filteredAdmissions.map((app) => {
                  const verifiedDocs = app.documents.filter((d) => d.isSubmitted).length;
                  const totalDocs = app.documents.length;

                  return (
                    <TableRow key={app.id}>
                      {/* Application ID */}
                      <TableCell>
                        <span className="font-mono text-xs font-bold text-[#153B66] bg-[#EFF6FF] px-2 py-0.5 rounded border border-[#BFDBFE]">
                          {app.applicationNumber}
                        </span>
                        <span className="block text-[10px] text-[#94A3B8] mt-0.5">
                          {app.appliedDate}
                        </span>
                      </TableCell>

                      {/* Applicant */}
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-[#153B66] text-white flex items-center justify-center font-bold text-xs shrink-0">
                            {app.applicantFirstName[0]}
                            {app.applicantLastName[0]}
                          </div>
                          <div>
                            <span className="font-semibold text-[#1E293B] block">
                              {app.applicantFullName}
                            </span>
                            <span className="text-[11px] text-[#64748B] block">
                              {app.gender} • {app.dob}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      {/* Desired Program */}
                      <TableCell>
                        <span className="font-semibold text-[#1E293B] block text-xs truncate max-w-[200px]" title={app.courseName}>
                          {app.courseName}
                        </span>
                        <span className="text-[11px] text-[#64748B] block">
                          {app.departmentName}
                        </span>
                      </TableCell>

                      {/* Prior Score */}
                      <TableCell>
                        <span className="font-bold text-[#153B66] text-xs">
                          {app.previousScorePercentage}%
                        </span>
                        <span className="block text-[10px] text-[#64748B] truncate max-w-[130px]">
                          {app.previousBoardOrUniversity}
                        </span>
                      </TableCell>

                      {/* Documents Status */}
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <div className="w-16 bg-[#E2E8F0] rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-[#14B8A6] h-full"
                              style={{ width: `${(verifiedDocs / totalDocs) * 100}%` }}
                            />
                          </div>
                          <span className="text-[11px] text-[#64748B] font-mono">
                            {verifiedDocs}/{totalDocs}
                          </span>
                        </div>
                      </TableCell>

                      {/* Application Status */}
                      <TableCell>{getStatusBadge(app.status)}</TableCell>

                      {/* Student Enrollment Status */}
                      <TableCell>
                        {app.isConvertedToStudent ? (
                          <div className="flex items-center gap-1 text-[11px] font-bold text-[#16A34A] bg-[#DCFCE7] px-2 py-0.5 rounded-md border border-[#BBF7D0] w-fit">
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>{app.convertedStudentId}</span>
                          </div>
                        ) : app.status === "Approved" ? (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleOpenConvertModal(app)}
                            className="text-[11px] py-1 px-2 h-auto"
                            leftIcon={<UserPlus className="w-3 h-3" />}
                          >
                            Enroll Student
                          </Button>
                        ) : (
                          <span className="text-[11px] text-[#94A3B8]">Pending Approval</span>
                        )}
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenDetails(app)}
                            className="p-1.5 rounded text-[#64748B] hover:text-[#2563EB] hover:bg-[#EFF6FF] transition-colors cursor-pointer"
                            title="View Full Application"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleOpenStatusModal(app)}
                            className="p-1.5 rounded text-[#64748B] hover:text-[#D97706] hover:bg-[#FEF3C7] transition-colors cursor-pointer"
                            title="Update Status / Add Review Remarks"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleOpenEditModal(app)}
                            className="p-1.5 rounded text-[#64748B] hover:text-[#1E293B] hover:bg-[#F1F5F9] transition-colors cursor-pointer"
                            title="Edit Application"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => {
                              if (confirm(`Delete application ${app.applicationNumber} for ${app.applicantFullName}?`)) {
                                deleteAdmission(app.id);
                              }
                            }}
                            className="p-1.5 rounded text-[#DC2626] hover:bg-[#FEE2E2] transition-colors cursor-pointer"
                            title="Delete Application"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* ================================================================= */}
      {/* 1. APPLICATION DETAILS MODAL                                      */}
      {/* ================================================================= */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title={selectedApp ? `Application: ${selectedApp.applicationNumber}` : "Application Details"}
        description="Comprehensive applicant credentials, document checklist, and status history."
        maxWidth="2xl"
        footer={
          selectedApp ? (
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                {selectedApp.status === "Approved" && !selectedApp.isConvertedToStudent && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      setIsDetailModalOpen(false);
                      handleOpenConvertModal(selectedApp);
                    }}
                    leftIcon={<UserPlus className="w-4 h-4" />}
                  >
                    Register as Enrolled Student
                  </Button>
                )}
                {selectedApp.isConvertedToStudent && (
                  <Link href="/admin/students">
                    <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                      View in Student Directory ({selectedApp.convertedStudentId})
                    </Button>
                  </Link>
                )}
              </div>
              <Button variant="outline" size="sm" onClick={() => setIsDetailModalOpen(false)}>
                Close
              </Button>
            </div>
          ) : undefined
        }
      >
        {selectedApp && (
          <div className="space-y-6">
            {/* Top Status & Program Bar */}
            <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block">
                  Target Degree Program
                </span>
                <h4 className="text-base font-bold text-[#153B66]">{selectedApp.courseName}</h4>
                <p className="text-xs text-[#64748B]">
                  {selectedApp.departmentName} • Academic Year {selectedApp.academicYearName}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(selectedApp.status)}
                {selectedApp.isConvertedToStudent ? (
                  <Badge variant="success">Enrolled Student</Badge>
                ) : (
                  <Badge variant="neutral">Not Enrolled</Badge>
                )}
              </div>
            </div>

            {/* Grid: Applicant & Guardian */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Applicant Card */}
              <div className="p-4 rounded-xl border border-[#E2E8F0] space-y-2.5">
                <h5 className="text-xs font-bold text-[#153B66] uppercase tracking-wider flex items-center gap-1.5 border-b border-[#F1F5F9] pb-2">
                  <UserCheck className="w-4 h-4 text-[#2563EB]" />
                  <span>Applicant Personal Details</span>
                </h5>
                <div className="text-xs space-y-1.5 text-[#1E293B]">
                  <p><span className="text-[#64748B] font-medium">Full Name:</span> {selectedApp.applicantFullName}</p>
                  <p><span className="text-[#64748B] font-medium">Gender / DOB:</span> {selectedApp.gender} • {selectedApp.dob}</p>
                  <p className="flex items-center gap-1"><Mail className="w-3.5 h-3.5 text-[#64748B]" /> {selectedApp.email}</p>
                  <p className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-[#64748B]" /> {selectedApp.phone}</p>
                  <p className="flex items-start gap-1"><MapPin className="w-3.5 h-3.5 text-[#64748B] shrink-0 mt-0.5" /> {selectedApp.addressLine}, {selectedApp.city}, {selectedApp.state} - {selectedApp.postalCode}</p>
                </div>
              </div>

              {/* Guardian Card */}
              <div className="p-4 rounded-xl border border-[#E2E8F0] space-y-2.5">
                <h5 className="text-xs font-bold text-[#153B66] uppercase tracking-wider flex items-center gap-1.5 border-b border-[#F1F5F9] pb-2">
                  <ShieldCheck className="w-4 h-4 text-[#14B8A6]" />
                  <span>Parent / Guardian Information</span>
                </h5>
                <div className="text-xs space-y-1.5 text-[#1E293B]">
                  <p><span className="text-[#64748B] font-medium">Guardian Name:</span> {selectedApp.guardianName} ({selectedApp.guardianRelation})</p>
                  <p><span className="text-[#64748B] font-medium">Occupation:</span> {selectedApp.guardianOccupation || "Not specified"}</p>
                  <p className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-[#64748B]" /> {selectedApp.guardianPhone}</p>
                  <p className="flex items-center gap-1"><Mail className="w-3.5 h-3.5 text-[#64748B]" /> {selectedApp.guardianEmail || "Not provided"}</p>
                </div>
              </div>
            </div>

            {/* Academic Qualification & Documents Checklist */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Prior Qualification */}
              <div className="p-4 rounded-xl border border-[#E2E8F0] space-y-2.5">
                <h5 className="text-xs font-bold text-[#153B66] uppercase tracking-wider flex items-center gap-1.5 border-b border-[#F1F5F9] pb-2">
                  <GraduationCap className="w-4 h-4 text-[#2563EB]" />
                  <span>Prior Academic Record</span>
                </h5>
                <div className="text-xs space-y-1.5 text-[#1E293B]">
                  <p><span className="text-[#64748B] font-medium">Institution:</span> {selectedApp.previousSchoolOrCollege || "N/A"}</p>
                  <p><span className="text-[#64748B] font-medium">Board / Exam:</span> {selectedApp.previousBoardOrUniversity}</p>
                  <p><span className="text-[#64748B] font-medium">Score / CGPA:</span> <strong className="text-[#153B66] text-sm">{selectedApp.previousScorePercentage}%</strong></p>
                  <p><span className="text-[#64748B] font-medium">Passing Year:</span> {selectedApp.passingYear}</p>
                </div>
              </div>

              {/* Document Checklist */}
              <div className="p-4 rounded-xl border border-[#E2E8F0] space-y-2.5">
                <h5 className="text-xs font-bold text-[#153B66] uppercase tracking-wider flex items-center gap-1.5 border-b border-[#F1F5F9] pb-2">
                  <FileText className="w-4 h-4 text-[#14B8A6]" />
                  <span>Submitted Certificates</span>
                </h5>
                <div className="space-y-1.5">
                  {selectedApp.documents.map((doc, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 rounded-lg bg-[#F8FAFC] text-xs"
                    >
                      <span>{doc.documentName}</span>
                      {doc.isSubmitted ? (
                        <span className="flex items-center gap-1 text-[11px] font-semibold text-[#16A34A]">
                          <Check className="w-3.5 h-3.5" /> Verified
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[11px] font-semibold text-[#DC2626]">
                          <X className="w-3.5 h-3.5" /> Pending
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Audit & Status History */}
            <div className="p-4 rounded-xl border border-[#E2E8F0] space-y-2.5">
              <h5 className="text-xs font-bold text-[#153B66] uppercase tracking-wider flex items-center gap-1.5 border-b border-[#F1F5F9] pb-2">
                <History className="w-4 h-4 text-[#2563EB]" />
                <span>Application Timeline & Review Log</span>
              </h5>
              <div className="space-y-2">
                {selectedApp.statusHistory?.map((h, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs">
                    <div className="w-2 h-2 rounded-full bg-[#2563EB] mt-1.5 shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-[#1E293B]">
                          Status set to: <strong>{h.status}</strong>
                        </span>
                        <span className="text-[10px] text-[#94A3B8]">{h.changedAt}</span>
                      </div>
                      <p className="text-[11px] text-[#64748B]">
                        Action by: {h.changedBy} {h.remarks ? `— "${h.remarks}"` : ""}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* ================================================================= */}
      {/* 2. CHANGE STATUS MODAL                                            */}
      {/* ================================================================= */}
      <Modal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        title="Update Application Status"
        description={selectedApp ? `Applicant: ${selectedApp.applicantFullName} (${selectedApp.applicationNumber})` : "Application Status"}
        maxWidth="md"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setIsStatusModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSaveStatus}>
              Save Status
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#1E293B] uppercase tracking-wider mb-1.5">
              Select Decision Status
            </label>
            <select
              value={statusToUpdate}
              onChange={(e) => setStatusToUpdate(e.target.value as AdmissionStatus)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-[#E2E8F0] bg-white text-[#1E293B] focus:border-[#2563EB] focus:outline-none"
            >
              <option value="Submitted">Submitted (Under Initial Review)</option>
              <option value="Under Review">Under Review (Document Verification)</option>
              <option value="Approved">Approved (Eligible for Enrollment)</option>
              <option value="Waitlisted">Waitlisted (Round 2)</option>
              <option value="Rejected">Rejected (Ineligible)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1E293B] uppercase tracking-wider mb-1.5">
              Review Notes / Decision Remarks
            </label>
            <textarea
              rows={3}
              value={statusRemarks}
              onChange={(e) => setStatusRemarks(e.target.value)}
              placeholder="e.g. Approved merit quota seat; document verification complete."
              className="w-full p-2.5 text-xs rounded-lg border border-[#E2E8F0] focus:border-[#2563EB] focus:outline-none"
            />
          </div>
        </div>
      </Modal>

      {/* ================================================================= */}
      {/* 3. CONVERT APPLICATION TO STUDENT MODAL                           */}
      {/* ================================================================= */}
      <Modal
        isOpen={isConvertModalOpen}
        onClose={() => setIsConvertModalOpen(false)}
        title="Register Applicant as Student"
        description="Convert approved admission application into an active student record with cohort allocation."
        maxWidth="lg"
        footer={
          convertResult?.success ? (
            <Button variant="primary" size="sm" onClick={() => setIsConvertModalOpen(false)}>
              Done
            </Button>
          ) : (
            <>
              <Button variant="outline" size="sm" onClick={() => setIsConvertModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleExecuteConvert}
                leftIcon={<UserCheck className="w-4 h-4" />}
              >
                Confirm & Enroll Student
              </Button>
            </>
          )
        }
      >
        {selectedApp && (
          <div className="space-y-4">
            {convertResult && (
              <Alert
                variant={convertResult.success ? "success" : "error"}
                title={convertResult.success ? "Enrollment Successful" : "Enrollment Blocked"}
              >
                {convertResult.message}
              </Alert>
            )}

            {!convertResult?.success && (
              <>
                {/* Candidate Summary */}
                <div className="p-3.5 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] text-xs space-y-1">
                  <p className="font-bold text-[#153B66]">Candidate Summary:</p>
                  <p className="text-[#1E3A8A]">
                    <strong>{selectedApp.applicantFullName}</strong> • Application ID: {selectedApp.applicationNumber}
                  </p>
                  <p className="text-[#64748B]">
                    Course: <strong>{selectedApp.courseName}</strong> ({selectedApp.departmentName})
                  </p>
                  <p className="text-[#64748B]">
                    Guardian: <strong>{selectedApp.guardianName}</strong> ({selectedApp.guardianRelation}) — will be automatically linked as primary guardian.
                  </p>
                </div>

                {/* Cohort Placement */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#1E293B] uppercase tracking-wider mb-1.5">
                      Assign to Class *
                    </label>
                    <select
                      value={selectedClassId}
                      onChange={(e) => setSelectedClassId(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-[#E2E8F0] bg-white text-[#1E293B] focus:border-[#2563EB] focus:outline-none"
                    >
                      {classes
                        .filter((c) => c.courseId === selectedApp.courseId)
                        .map((cls) => (
                          <option key={cls.id} value={cls.id}>
                            {cls.name} ({cls.code})
                          </option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1E293B] uppercase tracking-wider mb-1.5">
                      Assign Section *
                    </label>
                    <select
                      value={selectedSectionId}
                      onChange={(e) => setSelectedSectionId(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-[#E2E8F0] bg-white text-[#1E293B] focus:border-[#2563EB] focus:outline-none"
                    >
                      {sections
                        .filter((s) => s.classId === selectedClassId)
                        .map((sec) => (
                          <option key={sec.id} value={sec.id}>
                            {sec.name} ({sec.batchName}) - Room {sec.roomNumber}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

                <div>
                  <Input
                    label="Assigned Roll Number (Auto-Generated if blank)"
                    placeholder="e.g. 26CSE042"
                    value={customRollNumber}
                    onChange={(e) => setCustomRollNumber(e.target.value)}
                    helperText="Leave blank to use the institutional sequence allocator"
                  />
                </div>

                <div className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-xs text-[#64748B] flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#14B8A6] shrink-0 mt-0.5" />
                  <span>
                    Duplicate prevention: SST ERP checks against existing student registration numbers and institutional email handles before committing.
                  </span>
                </div>
              </>
            )}
          </div>
        )}
      </Modal>

      {/* ================================================================= */}
      {/* 4. ADD / EDIT APPLICATION MODAL                                   */}
      {/* ================================================================= */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={editingApp ? `Edit Application: ${editingApp.applicationNumber}` : "New Admission Application"}
        description="Enter applicant credentials, guardian contacts, previous scores, and certificate checklists."
        maxWidth="2xl"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setIsFormModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSubmitForm}>
              {editingApp ? "Save Changes" : "Submit Application"}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmitForm} className="space-y-5">
          {formError && (
            <Alert variant="error" title="Validation Incomplete">
              {formError}
            </Alert>
          )}

          {/* Section 1: Applicant Details */}
          <div>
            <h4 className="text-xs font-bold text-[#153B66] uppercase tracking-wider mb-2.5 pb-1 border-b border-[#F1F5F9]">
              1. Applicant Personal & Contact Information
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="First Name *"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="e.g. Aarav"
              />
              <Input
                label="Last Name *"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="e.g. Sharma"
              />
              <Input
                label="Date of Birth *"
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
              />
              <div>
                <label className="block text-xs font-bold text-[#1E293B] uppercase tracking-wider mb-1.5">
                  Gender *
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as "Male" | "Female" | "Other")}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#E2E8F0] bg-white text-[#1E293B] focus:border-[#2563EB] focus:outline-none"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <Input
                label="Email Address *"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="aarav.sharma@gmail.com"
              />
              <Input
                label="Phone Number *"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98450 11223"
              />
              <div className="sm:col-span-2">
                <Input
                  label="Address Line"
                  value={addressLine}
                  onChange={(e) => setAddressLine(e.target.value)}
                  placeholder="Street address, Flat number"
                />
              </div>
              <Input
                label="City"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
              <Input
                label="State"
                value={state}
                onChange={(e) => setState(e.target.value)}
              />
            </div>
          </div>

          {/* Section 2: Parent / Guardian Details */}
          <div>
            <h4 className="text-xs font-bold text-[#153B66] uppercase tracking-wider mb-2.5 pb-1 border-b border-[#F1F5F9]">
              2. Parent or Guardian Information
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Parent / Guardian Name *"
                value={guardianName}
                onChange={(e) => setGuardianName(e.target.value)}
                placeholder="Rajesh Sharma"
              />
              <div>
                <label className="block text-xs font-bold text-[#1E293B] uppercase tracking-wider mb-1.5">
                  Relationship *
                </label>
                <select
                  value={guardianRelation}
                  onChange={(e) => setGuardianRelation(e.target.value as "Father" | "Mother" | "Local Guardian" | "Legal Guardian")}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#E2E8F0] bg-white text-[#1E293B] focus:border-[#2563EB] focus:outline-none"
                >
                  <option value="Father">Father</option>
                  <option value="Mother">Mother</option>
                  <option value="Local Guardian">Local Guardian</option>
                  <option value="Legal Guardian">Legal Guardian</option>
                </select>
              </div>
              <Input
                label="Guardian Phone Number *"
                value={guardianPhone}
                onChange={(e) => setGuardianPhone(e.target.value)}
                placeholder="+91 98450 11224"
              />
              <Input
                label="Guardian Email"
                type="email"
                value={guardianEmail}
                onChange={(e) => setGuardianEmail(e.target.value)}
                placeholder="rajesh.sharma@example.com"
              />
              <div className="sm:col-span-2">
                <Input
                  label="Occupation / Employer"
                  value={guardianOccupation}
                  onChange={(e) => setGuardianOccupation(e.target.value)}
                  placeholder="e.g. Senior Software Architect, Infosys"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Desired Program */}
          <div>
            <h4 className="text-xs font-bold text-[#153B66] uppercase tracking-wider mb-2.5 pb-1 border-b border-[#F1F5F9]">
              3. Desired Program & Academic Department
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#1E293B] uppercase tracking-wider mb-1.5">
                  Department *
                </label>
                <select
                  value={selectedDeptId}
                  onChange={(e) => setSelectedDeptId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#E2E8F0] bg-white text-[#1E293B] focus:border-[#2563EB] focus:outline-none"
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.code} - {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1E293B] uppercase tracking-wider mb-1.5">
                  Degree Program *
                </label>
                <select
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#E2E8F0] bg-white text-[#1E293B] focus:border-[#2563EB] focus:outline-none"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1E293B] uppercase tracking-wider mb-1.5">
                  Academic Year *
                </label>
                <select
                  value={selectedAYId}
                  onChange={(e) => setSelectedAYId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#E2E8F0] bg-white text-[#1E293B] focus:border-[#2563EB] focus:outline-none"
                >
                  {academicYears.map((ay) => (
                    <option key={ay.id} value={ay.id}>
                      AY {ay.name} {ay.isActive ? "(Active)" : ""}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 4: Prior Qualification */}
          <div>
            <h4 className="text-xs font-bold text-[#153B66] uppercase tracking-wider mb-2.5 pb-1 border-b border-[#F1F5F9]">
              4. Prior Academic Qualifications
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Previous School / College"
                value={prevSchool}
                onChange={(e) => setPrevSchool(e.target.value)}
                placeholder="e.g. Delhi Public School"
              />
              <Input
                label="Board / Qualifying Examination"
                value={prevBoard}
                onChange={(e) => setPrevBoard(e.target.value)}
                placeholder="e.g. CBSE Class 12 / Karnataka PU"
              />
              <Input
                label="Percentage or CGPA *"
                value={prevScore}
                onChange={(e) => setPrevScore(e.target.value)}
                placeholder="e.g. 92.4"
              />
              <Input
                label="Passing Year"
                value={passingYear}
                onChange={(e) => setPassingYear(e.target.value)}
                placeholder="2026"
              />
            </div>
          </div>

          {/* Section 5: Documents Checklist */}
          <div>
            <h4 className="text-xs font-bold text-[#153B66] uppercase tracking-wider mb-2.5 pb-1 border-b border-[#F1F5F9]">
              5. Document Submission Status
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {documents.map((doc, idx) => (
                <label
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] cursor-pointer hover:bg-[#F1F5F9] transition-colors"
                >
                  <span className="text-xs text-[#1E293B] font-medium">{doc.documentName}</span>
                  <input
                    type="checkbox"
                    checked={doc.isSubmitted}
                    onChange={() => handleToggleDocument(idx)}
                    className="w-4 h-4 rounded text-[#2563EB] border-[#CBD5E1] focus:ring-[#2563EB]"
                  />
                </label>
              ))}
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
