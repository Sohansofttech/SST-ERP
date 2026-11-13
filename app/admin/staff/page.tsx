"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useInstitution } from "@/lib/store";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
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
  Users,
  Plus,
  Search,
  UserCheck,
  UserX,
  Eye,
  Edit2,
  Phone,
  Mail,
  Briefcase,
  Building,
  ShieldCheck,
  GraduationCap,
  Clock,
  CheckCircle2,
  X,
  Award,
} from "lucide-react";
import { StaffItem, StaffEmploymentType, StaffStatus } from "@/types/institution";

export default function StaffPage() {
  const {
    staff,
    addStaff,
    updateStaff,
    deactivateStaff,
    departments,
    roles,
  } = useInstitution();

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [deptFilter, setDeptFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [roleFilter, setRoleFilter] = useState("ALL");

  // Modals
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffItem | null>(null);
  const [viewingStaff, setViewingStaff] = useState<StaffItem | null>(null);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);

  const showToast = (type: "success" | "error" | "info", text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4500);
  };

  // KPI Calculations
  const stats = useMemo(() => {
    const total = staff.length;
    const active = staff.filter((s) => s.status === "Active").length;
    const onLeave = staff.filter((s) => s.status === "On Leave").length;
    const fullTime = staff.filter((s) => s.employmentType === "Full-Time").length;

    return { total, active, onLeave, fullTime };
  }, [staff]);

  // Filtered Staff
  const filteredStaff = useMemo(() => {
    return staff.filter((st) => {
      const matchesSearch =
        searchQuery === "" ||
        st.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        st.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        st.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        st.phone.includes(searchQuery) ||
        st.designation.toLowerCase().includes(searchQuery.toLowerCase()) ||
        st.qualification.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (st.specialization && st.specialization.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesDept = deptFilter === "ALL" || st.departmentId === deptFilter;
      const matchesType = typeFilter === "ALL" || st.employmentType === typeFilter;
      const matchesStatus = statusFilter === "ALL" || st.status === statusFilter;
      const matchesRole = roleFilter === "ALL" || st.assignedRoleId === roleFilter;

      return matchesSearch && matchesDept && matchesType && matchesStatus && matchesRole;
    });
  }, [staff, searchQuery, deptFilter, typeFilter, statusFilter, roleFilter]);

  // Form State
  const initialFormData = {
    employeeId: "",
    firstName: "",
    lastName: "",
    gender: "Male" as "Male" | "Female" | "Other",
    dob: "1988-06-15",
    email: "",
    phone: "",
    designation: "Assistant Professor",
    departmentId: departments[0]?.id || "dept-cse",
    employmentType: "Full-Time" as StaffEmploymentType,
    joiningDate: new Date().toISOString().split("T")[0],
    qualification: "",
    specialization: "",
    assignedRoleId: roles[0]?.id || "role-faculty",
    status: "Active" as StaffStatus,
    addressLine: "",
  };

  const [formData, setFormData] = useState(initialFormData);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const openAddModal = () => {
    setEditingStaff(null);
    setFormData(initialFormData);
    setFormErrors({});
    setIsFormModalOpen(true);
  };

  const openEditModal = (st: StaffItem) => {
    setEditingStaff(st);
    setFormData({
      employeeId: st.employeeId,
      firstName: st.firstName,
      lastName: st.lastName,
      gender: st.gender,
      dob: st.dob || "1988-06-15",
      email: st.email,
      phone: st.phone,
      designation: st.designation,
      departmentId: st.departmentId,
      employmentType: st.employmentType,
      joiningDate: st.joiningDate,
      qualification: st.qualification,
      specialization: st.specialization || "",
      assignedRoleId: st.assignedRoleId,
      status: st.status,
      addressLine: st.addressLine || "",
    });
    setFormErrors({});
    setIsFormModalOpen(true);
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.firstName.trim()) errors.firstName = "First name is required";
    if (!formData.lastName.trim()) errors.lastName = "Last name is required";
    if (!formData.email.trim()) errors.email = "Email address is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = "Enter a valid email address";
    }
    if (!formData.phone.trim()) errors.phone = "Phone number is required";
    if (!formData.designation.trim()) errors.designation = "Designation is required";
    if (!formData.qualification.trim()) errors.qualification = "Highest qualification is required";
    if (!formData.joiningDate) errors.joiningDate = "Joining date is required";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const deptObj = departments.find((d) => d.id === formData.departmentId);
    const roleObj = roles.find((r) => r.id === formData.assignedRoleId);

    const deptName = deptObj ? deptObj.name : "General Department";
    const roleName = roleObj ? roleObj.name : "Faculty Member";

    if (editingStaff) {
      updateStaff(editingStaff.id, {
        employeeId: formData.employeeId.trim(),
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        fullName: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
        gender: formData.gender,
        dob: formData.dob,
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        designation: formData.designation.trim(),
        departmentId: formData.departmentId,
        departmentName: deptName,
        employmentType: formData.employmentType,
        joiningDate: formData.joiningDate,
        qualification: formData.qualification.trim(),
        specialization: formData.specialization.trim() || undefined,
        assignedRoleId: formData.assignedRoleId,
        assignedRoleName: roleName,
        status: formData.status,
        addressLine: formData.addressLine.trim() || undefined,
      });
      showToast("success", `Staff record for "${formData.firstName} ${formData.lastName}" updated.`);
    } else {
      const created = addStaff({
        employeeId: formData.employeeId.trim(),
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        fullName: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
        gender: formData.gender,
        dob: formData.dob,
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        designation: formData.designation.trim(),
        departmentId: formData.departmentId,
        departmentName: deptName,
        employmentType: formData.employmentType,
        joiningDate: formData.joiningDate,
        qualification: formData.qualification.trim(),
        specialization: formData.specialization.trim() || undefined,
        assignedRoleId: formData.assignedRoleId,
        assignedRoleName: roleName,
        status: formData.status,
        addressLine: formData.addressLine.trim() || undefined,
      });
      showToast("success", `Staff member added successfully with Employee ID: ${created.employeeId}`);
    }

    setIsFormModalOpen(false);
  };

  const handleToggleStatus = (st: StaffItem) => {
    deactivateStaff(st.id);
    const nextStatus = st.status === "Active" ? "Inactive" : "Active";
    showToast("info", `Staff member "${st.fullName}" status updated to ${nextStatus}.`);
  };

  const handleSetStatus = (stId: string, status: StaffStatus) => {
    updateStaff(stId, { status });
    showToast("info", `Status updated to ${status}.`);
    if (viewingStaff && viewingStaff.id === stId) {
      setViewingStaff({ ...viewingStaff, status });
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 max-w-md animate-in fade-in slide-in-from-top-4 duration-200">
          <Alert
            variant={
              toastMessage.type === "success"
                ? "success"
                : toastMessage.type === "error"
                ? "error"
                : "info"
            }
          >
            {toastMessage.text}
          </Alert>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-teal-600 bg-teal-50 px-2 py-0.5 rounded">
              People & Governance
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs text-slate-500">Academic & Administrative Staff</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1 flex items-center gap-2.5">
            <Briefcase className="h-6 w-6 text-[#153B66]" />
            Staff Management
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Maintain institutional faculty directory, department chairs, employment designations, and access roles.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/admin/roles">
            <Button variant="outline" size="sm" className="gap-2">
              <ShieldCheck className="h-4 w-4 text-slate-600" />
              Roles & Permissions
            </Button>
          </Link>
          <Button
            onClick={openAddModal}
            className="gap-2 bg-[#153B66] hover:bg-[#153B66]/90 text-white shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Add Staff Member
          </Button>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-slate-200 shadow-sm bg-white hover:border-slate-300 transition-colors">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Total Staff
              </p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats.total}</h3>
              <p className="text-xs text-slate-500 mt-0.5">Faculty & administrative personnel</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm bg-white hover:border-slate-300 transition-colors">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Active Staff
              </p>
              <h3 className="text-2xl font-bold text-teal-600 mt-1">{stats.active}</h3>
              <p className="text-xs text-slate-500 mt-0.5">Currently on duty</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm bg-white hover:border-slate-300 transition-colors">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Full-Time Staff
              </p>
              <h3 className="text-2xl font-bold text-indigo-600 mt-1">{stats.fullTime}</h3>
              <p className="text-xs text-slate-500 mt-0.5">Permanent institutional faculty</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Award className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm bg-white hover:border-slate-300 transition-colors">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                On Leave / Inactive
              </p>
              <h3 className="text-2xl font-bold text-amber-600 mt-1">
                {stats.onLeave + (stats.total - stats.active - stats.onLeave)}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Sabbatical or inactive status</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card className="border-slate-200 shadow-sm bg-white">
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search staff by name, employee ID, email, designation, qualification, or domain..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-slate-50 border-slate-200 focus:bg-white text-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {/* Department */}
              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="text-xs font-medium bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#153B66]"
              >
                <option value="ALL">All Departments</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.code} - {d.name}
                  </option>
                ))}
              </select>

              {/* Employment Type */}
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="text-xs font-medium bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#153B66]"
              >
                <option value="ALL">All Employment Types</option>
                <option value="Full-Time">Full-Time</option>
                <option value="Part-Time">Part-Time</option>
                <option value="Contract">Contract</option>
                <option value="Visiting">Visiting</option>
              </select>

              {/* Assigned Role */}
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="text-xs font-medium bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#153B66]"
              >
                <option value="ALL">All Access Roles</option>
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>

              {/* Status */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs font-medium bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#153B66]"
              >
                <option value="ALL">All Status</option>
                <option value="Active">Active Only</option>
                <option value="On Leave">On Leave</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Active filters pill display */}
          {(searchQuery ||
            deptFilter !== "ALL" ||
            typeFilter !== "ALL" ||
            statusFilter !== "ALL" ||
            roleFilter !== "ALL") && (
            <div className="flex items-center gap-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
              <span className="font-semibold">Filtered results: {filteredStaff.length}</span>
              <span className="text-slate-300">•</span>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setDeptFilter("ALL");
                  setTypeFilter("ALL");
                  setStatusFilter("ALL");
                  setRoleFilter("ALL");
                }}
                className="text-blue-600 hover:underline font-medium"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Staff Master Directory Table */}
      <Card className="border-slate-200 shadow-sm bg-white overflow-hidden">
        <CardHeader className="p-4 border-b border-slate-100 flex flex-row items-center justify-between">
          <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
            <span>Staff Directory</span>
            <span className="text-xs font-normal text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
              {filteredStaff.length} personnel
            </span>
          </CardTitle>
          <div className="text-xs text-slate-500">
            Click on any staff member to view comprehensive profile & academic details
          </div>
        </CardHeader>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/80">
                <TableHead className="w-[120px]">Employee ID</TableHead>
                <TableHead>Staff Member</TableHead>
                <TableHead>Designation & Department</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Assigned Role</TableHead>
                <TableHead>Contact Details</TableHead>
                <TableHead>Joining Date</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStaff.length === 0 ? (
                <TableEmpty colSpan={9} message="No staff records match your criteria." />
              ) : (
                filteredStaff.map((st) => (
                  <TableRow key={st.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* ID */}
                    <TableCell className="font-mono text-xs font-semibold text-[#153B66]">
                      {st.employeeId}
                    </TableCell>

                    {/* Name & Initials */}
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-[#153B66]/10 text-[#153B66] font-bold text-xs flex items-center justify-center shrink-0 border border-slate-200">
                          {st.firstName[0]}
                          {st.lastName[0]}
                        </div>
                        <div>
                          <button
                            onClick={() => setViewingStaff(st)}
                            className="font-medium text-slate-900 text-sm hover:text-blue-600 transition-colors text-left"
                          >
                            {st.fullName}
                          </button>
                          <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                            <span className="truncate max-w-[200px]" title={st.qualification}>
                              {st.qualification}
                            </span>
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    {/* Designation & Dept */}
                    <TableCell>
                      <div className="text-xs font-medium text-slate-800">
                        {st.designation}
                      </div>
                      <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <Building className="h-3 w-3 text-slate-400" />
                        <span className="truncate max-w-[170px]" title={st.departmentName}>
                          {st.departmentName}
                        </span>
                      </div>
                    </TableCell>

                    {/* Type */}
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          st.employmentType === "Full-Time"
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : st.employmentType === "Visiting"
                            ? "bg-purple-50 text-purple-700 border border-purple-200"
                            : "bg-slate-100 text-slate-700 border border-slate-200"
                        }`}
                      >
                        {st.employmentType}
                      </span>
                    </TableCell>

                    {/* Assigned Role */}
                    <TableCell>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200">
                        <ShieldCheck className="h-3 w-3 text-[#153B66]" />
                        {st.assignedRoleName}
                      </span>
                    </TableCell>

                    {/* Contact */}
                    <TableCell>
                      <div className="space-y-0.5 text-xs">
                        <div className="flex items-center gap-1.5 text-slate-700">
                          <Phone className="h-3 w-3 text-slate-400" />
                          <span>{st.phone}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <Mail className="h-3 w-3 text-slate-400" />
                          <span className="truncate max-w-[160px]" title={st.email}>
                            {st.email}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    {/* Joining Date */}
                    <TableCell className="text-xs text-slate-600">
                      {new Date(st.joiningDate).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </TableCell>

                    {/* Status */}
                    <TableCell className="text-center">
                      <Badge
                        variant={
                          st.status === "Active"
                            ? "success"
                            : st.status === "On Leave"
                            ? "warning"
                            : "neutral"
                        }
                      >
                        {st.status}
                      </Badge>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setViewingStaff(st)}
                          title="View Full Profile"
                          className="h-8 w-8 p-0 text-slate-600 hover:text-blue-600"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditModal(st)}
                          title="Edit Details"
                          className="h-8 w-8 p-0 text-slate-600 hover:text-slate-900"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleStatus(st)}
                          title={st.status === "Active" ? "Deactivate / Set Inactive" : "Set Active"}
                          className={`h-8 w-8 p-0 ${
                            st.status === "Active"
                              ? "text-slate-400 hover:text-amber-600 hover:bg-amber-50"
                              : "text-teal-600 hover:text-teal-700 hover:bg-teal-50"
                          }`}
                        >
                          {st.status === "Active" ? (
                            <UserX className="h-4 w-4" />
                          ) : (
                            <UserCheck className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* =========================================================================
          MODAL 1: ADD / EDIT STAFF MEMBER
      ========================================================================= */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={editingStaff ? `Edit Staff Member (${editingStaff.employeeId})` : "Add Staff Member"}
        maxWidth="lg"
      >
        <form onSubmit={handleSaveStaff} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Employee ID
              </label>
              <Input
                placeholder="Auto-generated if empty"
                value={formData.employeeId}
                onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                className="font-mono text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                First Name <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="e.g. Rameshwar"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className={formErrors.firstName ? "border-red-500" : ""}
              />
              {formErrors.firstName && (
                <p className="text-xs text-red-500 mt-1">{formErrors.firstName}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Last Name <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="e.g. Sharma"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className={formErrors.lastName ? "border-red-500" : ""}
              />
              {formErrors.lastName && (
                <p className="text-xs text-red-500 mt-1">{formErrors.lastName}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
              <select
                value={formData.gender}
                onChange={(e) =>
                  setFormData({ ...formData, gender: e.target.value as "Male" | "Female" | "Other" })
                }
                className="w-full h-10 px-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#153B66]"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Date of Birth</label>
              <Input
                type="date"
                value={formData.dob}
                onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Joining Date <span className="text-red-500">*</span>
              </label>
              <Input
                type="date"
                value={formData.joiningDate}
                onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                className={formErrors.joiningDate ? "border-red-500" : ""}
              />
              {formErrors.joiningDate && (
                <p className="text-xs text-red-500 mt-1">{formErrors.joiningDate}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Institutional Email Address <span className="text-red-500">*</span>
              </label>
              <Input
                type="email"
                placeholder="faculty.name@sohansoft.in"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={formErrors.email ? "border-red-500" : ""}
              />
              {formErrors.email && (
                <p className="text-xs text-red-500 mt-1">{formErrors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Contact Phone Number <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className={formErrors.phone ? "border-red-500" : ""}
              />
              {formErrors.phone && (
                <p className="text-xs text-red-500 mt-1">{formErrors.phone}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Department <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.departmentId}
                onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                className="w-full h-10 px-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#153B66]"
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Designation <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="e.g. Associate Professor & Lab Head"
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                className={formErrors.designation ? "border-red-500" : ""}
              />
              {formErrors.designation && (
                <p className="text-xs text-red-500 mt-1">{formErrors.designation}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Employment Type
              </label>
              <select
                value={formData.employmentType}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    employmentType: e.target.value as StaffEmploymentType,
                  })
                }
                className="w-full h-10 px-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#153B66]"
              >
                <option value="Full-Time">Full-Time</option>
                <option value="Part-Time">Part-Time</option>
                <option value="Contract">Contract</option>
                <option value="Visiting">Visiting</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Assigned Access Role
              </label>
              <select
                value={formData.assignedRoleId}
                onChange={(e) => setFormData({ ...formData, assignedRoleId: e.target.value })}
                className="w-full h-10 px-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#153B66]"
              >
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value as StaffStatus })
                }
                className="w-full h-10 px-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#153B66]"
              >
                <option value="Active">Active</option>
                <option value="On Leave">On Leave</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Highest Qualification <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="e.g. Ph.D. in Computer Science (IIT Bombay)"
                value={formData.qualification}
                onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                className={formErrors.qualification ? "border-red-500" : ""}
              />
              {formErrors.qualification && (
                <p className="text-xs text-red-500 mt-1">{formErrors.qualification}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Specialization / Domain
              </label>
              <Input
                placeholder="e.g. Cloud Computing, Distributed Systems"
                value={formData.specialization}
                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Residential / Campus Address
            </label>
            <Input
              placeholder="e.g. Faculty Quarters, Block B, Tech Campus, Whitefield"
              value={formData.addressLine}
              onChange={(e) => setFormData({ ...formData, addressLine: e.target.value })}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsFormModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-[#153B66] hover:bg-[#153B66]/90 text-white"
            >
              {editingStaff ? "Save Changes" : "Register Staff Member"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* =========================================================================
          MODAL 2: 360-DEGREE STAFF PROFILE VIEW
      ========================================================================= */}
      {viewingStaff && (
        <Modal
          isOpen={true}
          onClose={() => setViewingStaff(null)}
          title={`Staff Profile: ${viewingStaff.fullName}`}
          maxWidth="lg"
        >
          <div className="space-y-6">
            {/* Header Banner */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-[#153B66] text-white font-bold text-base flex items-center justify-center shrink-0">
                  {viewingStaff.firstName[0]}
                  {viewingStaff.lastName[0]}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">{viewingStaff.fullName}</h3>
                  <div className="flex items-center gap-2 text-xs text-slate-600 mt-0.5">
                    <span className="font-mono text-[#153B66] font-semibold">
                      {viewingStaff.employeeId}
                    </span>
                    <span>•</span>
                    <span className="font-medium text-slate-700">{viewingStaff.designation}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  {viewingStaff.assignedRoleName}
                </span>
                <Badge
                  variant={
                    viewingStaff.status === "Active"
                      ? "success"
                      : viewingStaff.status === "On Leave"
                      ? "warning"
                      : "neutral"
                  }
                >
                  {viewingStaff.status}
                </Badge>
              </div>
            </div>

            {/* Quick Status Bar */}
            <div className="flex items-center justify-between p-3 bg-slate-50/80 rounded-lg border border-slate-200 text-xs">
              <span className="text-slate-600 font-medium">Quick Status Adjustment:</span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleSetStatus(viewingStaff.id, "Active")}
                  className={`px-2.5 py-1 rounded font-medium transition-colors ${
                    viewingStaff.status === "Active"
                      ? "bg-teal-600 text-white"
                      : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  Active
                </button>
                <button
                  type="button"
                  onClick={() => handleSetStatus(viewingStaff.id, "On Leave")}
                  className={`px-2.5 py-1 rounded font-medium transition-colors ${
                    viewingStaff.status === "On Leave"
                      ? "bg-amber-600 text-white"
                      : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  On Leave
                </button>
                <button
                  type="button"
                  onClick={() => handleSetStatus(viewingStaff.id, "Inactive")}
                  className={`px-2.5 py-1 rounded font-medium transition-colors ${
                    viewingStaff.status === "Inactive"
                      ? "bg-slate-700 text-white"
                      : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  Inactive
                </button>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Academic Placement */}
              <div className="border border-slate-200 rounded-lg p-4 space-y-3 bg-white">
                <h4 className="font-semibold text-slate-900 uppercase tracking-wider text-[11px] text-[#153B66] flex items-center gap-1.5">
                  <Building className="h-3.5 w-3.5" />
                  Academic & Institutional Placement
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Department:</span>
                    <span className="font-medium text-slate-800 text-right">{viewingStaff.departmentName}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Designation:</span>
                    <span className="font-medium text-slate-800">{viewingStaff.designation}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Employment Type:</span>
                    <span className="font-medium text-slate-800">{viewingStaff.employmentType}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Joining Date:</span>
                    <span className="font-medium text-slate-800">
                      {new Date(viewingStaff.joiningDate).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Security Role:</span>
                    <span className="font-medium text-slate-800">{viewingStaff.assignedRoleName}</span>
                  </div>
                </div>
              </div>

              {/* Qualifications & Specialization */}
              <div className="border border-slate-200 rounded-lg p-4 space-y-3 bg-white">
                <h4 className="font-semibold text-slate-900 uppercase tracking-wider text-[11px] text-[#153B66] flex items-center gap-1.5">
                  <GraduationCap className="h-3.5 w-3.5" />
                  Qualifications & Domain Expertise
                </h4>
                <div className="space-y-2">
                  <div className="py-1 border-b border-slate-100">
                    <span className="text-slate-500 block mb-0.5">Highest Qualification:</span>
                    <span className="font-medium text-slate-800 leading-relaxed">
                      {viewingStaff.qualification}
                    </span>
                  </div>
                  <div className="py-1 border-b border-slate-100">
                    <span className="text-slate-500 block mb-0.5">Domain / Specialization:</span>
                    <span className="font-medium text-slate-800">
                      {viewingStaff.specialization || "General Academic Teaching"}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Gender:</span>
                    <span className="font-medium text-slate-800">{viewingStaff.gender}</span>
                  </div>
                  {viewingStaff.dob && (
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">Date of Birth:</span>
                      <span className="font-medium text-slate-800">{viewingStaff.dob}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Contact Details */}
            <div className="border border-slate-200 rounded-lg p-4 bg-white space-y-3 text-xs">
              <h4 className="font-semibold text-slate-900 uppercase tracking-wider text-[11px] text-[#153B66] flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" />
                Contact & Address
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Institutional Email:</span>
                    <span className="font-medium text-slate-800">{viewingStaff.email}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Phone Number:</span>
                    <span className="font-medium text-slate-800">{viewingStaff.phone}</span>
                  </div>
                </div>

                <div>
                  <span className="text-slate-500 block mb-1">Campus / Residential Address:</span>
                  <span className="font-medium text-slate-800 leading-relaxed block bg-slate-50 p-2.5 rounded border border-slate-200">
                    {viewingStaff.addressLine || "No campus quarters registered"}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const st = viewingStaff;
                  setViewingStaff(null);
                  openEditModal(st);
                }}
                className="gap-1.5"
              >
                <Edit2 className="h-3.5 w-3.5" />
                Edit Staff Details
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewingStaff(null)}
              >
                Close Profile
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
