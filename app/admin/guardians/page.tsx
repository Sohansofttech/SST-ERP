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
  HeartHandshake,
  Plus,
  Search,
  UserCheck,
  UserX,
  Eye,
  Edit2,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  ShieldAlert,
  UserPlus,
  X,
  CheckCircle2,
  GraduationCap,
  Building,
  Users,
} from "lucide-react";
import { GuardianItem, GuardianRelationship } from "@/types/institution";

export default function GuardiansPage() {
  const {
    guardians,
    students,
    addGuardian,
    updateGuardian,
    deactivateGuardian,
    linkStudentToGuardian,
    unlinkStudentFromGuardian,
  } = useInstitution();

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [relationshipFilter, setRelationshipFilter] = useState("ALL");
  const [emergencyFilter, setEmergencyFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Modals
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingGuardian, setEditingGuardian] = useState<GuardianItem | null>(null);
  const [viewingGuardian, setViewingGuardian] = useState<GuardianItem | null>(null);
  const [linkingGuardian, setLinkingGuardian] = useState<GuardianItem | null>(null);
  const [selectedStudentToLink, setSelectedStudentToLink] = useState("");

  // Notification feedback
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
    const total = guardians.length;
    const active = guardians.filter((g) => g.status === "Active").length;
    const emergency = guardians.filter((g) => g.isEmergencyContact).length;
    const multiChild = guardians.filter((g) => g.studentIds && g.studentIds.length > 1).length;

    return { total, active, emergency, multiChild };
  }, [guardians]);

  // Filtered Guardians List
  const filteredGuardians = useMemo(() => {
    return guardians.filter((g) => {
      // Find linked students for search matching
      const linkedStudents = students.filter(
        (s) => g.studentIds.includes(s.id) || g.studentIds.includes(s.studentId)
      );
      const studentNames = linkedStudents.map((s) => s.fullName.toLowerCase()).join(" ");
      const studentRolls = linkedStudents.map((s) => s.rollNumber.toLowerCase()).join(" ");

      const matchesSearch =
        searchQuery === "" ||
        g.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.guardianId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.phone.includes(searchQuery) ||
        g.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.occupation.toLowerCase().includes(searchQuery.toLowerCase()) ||
        studentNames.includes(searchQuery.toLowerCase()) ||
        studentRolls.includes(searchQuery.toLowerCase());

      const matchesRelationship =
        relationshipFilter === "ALL" || g.relationship === relationshipFilter;

      const matchesEmergency =
        emergencyFilter === "ALL" ||
        (emergencyFilter === "YES" && g.isEmergencyContact) ||
        (emergencyFilter === "NO" && !g.isEmergencyContact);

      const matchesStatus = statusFilter === "ALL" || g.status === statusFilter;

      return matchesSearch && matchesRelationship && matchesEmergency && matchesStatus;
    });
  }, [guardians, students, searchQuery, relationshipFilter, emergencyFilter, statusFilter]);

  // Form State
  const initialFormData = {
    fullName: "",
    relationship: "Father" as GuardianRelationship,
    phone: "",
    alternatePhone: "",
    email: "",
    addressLine: "",
    city: "",
    state: "Tamil Nadu",
    postalCode: "",
    occupation: "",
    company: "",
    isEmergencyContact: false,
    status: "Active" as "Active" | "Inactive",
    initialStudentId: "",
  };

  const [formData, setFormData] = useState(initialFormData);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const openAddModal = () => {
    setEditingGuardian(null);
    setFormData(initialFormData);
    setFormErrors({});
    setIsFormModalOpen(true);
  };

  const openEditModal = (g: GuardianItem) => {
    setEditingGuardian(g);
    setFormData({
      fullName: g.fullName,
      relationship: g.relationship,
      phone: g.phone,
      alternatePhone: g.alternatePhone || "",
      email: g.email,
      addressLine: g.addressLine,
      city: g.city,
      state: g.state,
      postalCode: g.postalCode,
      occupation: g.occupation,
      company: g.company || "",
      isEmergencyContact: g.isEmergencyContact,
      status: g.status,
      initialStudentId: "",
    });
    setFormErrors({});
    setIsFormModalOpen(true);
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.fullName.trim()) errors.fullName = "Full name is required";
    if (!formData.phone.trim()) errors.phone = "Primary phone number is required";
    else if (!/^\+?[0-9\s-]{10,15}$/.test(formData.phone.trim())) {
      errors.phone = "Enter a valid 10-15 digit phone number";
    }
    if (!formData.email.trim()) errors.email = "Email address is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = "Enter a valid email address";
    }
    if (!formData.addressLine.trim()) errors.addressLine = "Residential address is required";
    if (!formData.city.trim()) errors.city = "City is required";
    if (!formData.occupation.trim()) errors.occupation = "Occupation is required";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveGuardian = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (editingGuardian) {
      updateGuardian(editingGuardian.id, {
        fullName: formData.fullName.trim(),
        relationship: formData.relationship,
        phone: formData.phone.trim(),
        alternatePhone: formData.alternatePhone.trim() || undefined,
        email: formData.email.trim().toLowerCase(),
        addressLine: formData.addressLine.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        postalCode: formData.postalCode.trim(),
        occupation: formData.occupation.trim(),
        company: formData.company.trim() || undefined,
        isEmergencyContact: formData.isEmergencyContact,
        status: formData.status,
      });
      showToast("success", `Guardian "${formData.fullName}" updated successfully.`);
    } else {
      const studentIds = formData.initialStudentId ? [formData.initialStudentId] : [];
      const created = addGuardian({
        fullName: formData.fullName.trim(),
        relationship: formData.relationship,
        phone: formData.phone.trim(),
        alternatePhone: formData.alternatePhone.trim() || undefined,
        email: formData.email.trim().toLowerCase(),
        addressLine: formData.addressLine.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        postalCode: formData.postalCode.trim(),
        occupation: formData.occupation.trim(),
        company: formData.company.trim() || undefined,
        isEmergencyContact: formData.isEmergencyContact,
        status: formData.status,
        studentIds,
      });
      showToast("success", `Guardian "${created.fullName}" registered with ID: ${created.guardianId}`);
    }

    setIsFormModalOpen(false);
  };

  const handleToggleStatus = (g: GuardianItem) => {
    deactivateGuardian(g.id);
    const action = g.status === "Active" ? "deactivated" : "activated";
    showToast("info", `Guardian "${g.fullName}" ${action}. Associated student records are preserved.`);
  };

  const handleOpenLinkModal = (g: GuardianItem) => {
    setLinkingGuardian(g);
    setSelectedStudentToLink("");
  };

  const handleConfirmLinkStudent = () => {
    if (!linkingGuardian || !selectedStudentToLink) return;

    // Check duplicate
    const alreadyLinked = linkingGuardian.studentIds.includes(selectedStudentToLink);
    if (alreadyLinked) {
      showToast("error", "This student is already linked to this guardian.");
      return;
    }

    const studentObj = students.find(
      (s) => s.id === selectedStudentToLink || s.studentId === selectedStudentToLink
    );
    linkStudentToGuardian(linkingGuardian.id, selectedStudentToLink);

    showToast(
      "success",
      `Student ${studentObj?.fullName || selectedStudentToLink} linked to guardian ${linkingGuardian.fullName}.`
    );
    setLinkingGuardian(null);
  };

  const handleUnlinkStudent = (guardianId: string, studentId: string, studentName: string) => {
    if (
      window.confirm(
        `Are you sure you want to unlink student "${studentName}" from this guardian?`
      )
    ) {
      unlinkStudentFromGuardian(guardianId, studentId);
      showToast("info", `Unlinked student "${studentName}" from guardian.`);
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
              Student Lifecycle
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs text-slate-500">Parent & Guardian Registry</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1 flex items-center gap-2.5">
            <HeartHandshake className="h-6 w-6 text-[#153B66]" />
            Guardian Management
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Maintain verified parent, emergency contact, and legal guardian relationships with multi-student linking.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/admin/students">
            <Button variant="outline" size="sm" className="gap-2">
              <GraduationCap className="h-4 w-4 text-slate-600" />
              View Students
            </Button>
          </Link>
          <Button
            onClick={openAddModal}
            className="gap-2 bg-[#153B66] hover:bg-[#153B66]/90 text-white shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Register Guardian
          </Button>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-slate-200 shadow-sm bg-white hover:border-slate-300 transition-colors">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Total Guardians
              </p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats.total}</h3>
              <p className="text-xs text-slate-500 mt-0.5">Registered family contacts</p>
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
                Active Contacts
              </p>
              <h3 className="text-2xl font-bold text-teal-600 mt-1">{stats.active}</h3>
              <p className="text-xs text-slate-500 mt-0.5">Verified communication status</p>
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
                Emergency Contacts
              </p>
              <h3 className="text-2xl font-bold text-amber-600 mt-1">{stats.emergency}</h3>
              <p className="text-xs text-slate-500 mt-0.5">Designated urgent responder</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <ShieldAlert className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm bg-white hover:border-slate-300 transition-colors">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Multi-Child Guardians
              </p>
              <h3 className="text-2xl font-bold text-indigo-600 mt-1">{stats.multiChild}</h3>
              <p className="text-xs text-slate-500 mt-0.5">2+ enrolled siblings linked</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <HeartHandshake className="h-6 w-6" />
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
                placeholder="Search guardian by name, ID, phone, email, occupation, or student name..."
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

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <select
                value={relationshipFilter}
                onChange={(e) => setRelationshipFilter(e.target.value)}
                className="text-xs font-medium bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#153B66]"
              >
                <option value="ALL">All Relationships</option>
                <option value="Father">Father</option>
                <option value="Mother">Mother</option>
                <option value="Local Guardian">Local Guardian</option>
                <option value="Legal Guardian">Legal Guardian</option>
              </select>

              <select
                value={emergencyFilter}
                onChange={(e) => setEmergencyFilter(e.target.value)}
                className="text-xs font-medium bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#153B66]"
              >
                <option value="ALL">All Emergency Roles</option>
                <option value="YES">Emergency Contact (Yes)</option>
                <option value="NO">Standard Contact (No)</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs font-medium bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#153B66] col-span-2 sm:col-span-1"
              >
                <option value="ALL">All Status</option>
                <option value="Active">Active Only</option>
                <option value="Inactive">Inactive Only</option>
              </select>
            </div>
          </div>

          {/* Active filters pill display */}
          {(searchQuery ||
            relationshipFilter !== "ALL" ||
            emergencyFilter !== "ALL" ||
            statusFilter !== "ALL") && (
            <div className="flex items-center gap-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
              <span className="font-semibold">Filtered results: {filteredGuardians.length}</span>
              <span className="text-slate-300">•</span>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setRelationshipFilter("ALL");
                  setEmergencyFilter("ALL");
                  setStatusFilter("ALL");
                }}
                className="text-blue-600 hover:underline font-medium"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Guardians Master Table */}
      <Card className="border-slate-200 shadow-sm bg-white overflow-hidden">
        <CardHeader className="p-4 border-b border-slate-100 flex flex-row items-center justify-between">
          <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
            <span>Guardian Directory</span>
            <span className="text-xs font-normal text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
              {filteredGuardians.length} records
            </span>
          </CardTitle>
          <div className="text-xs text-slate-500">
            Click on any guardian to view complete profile and linked students
          </div>
        </CardHeader>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/80">
                <TableHead className="w-[120px]">Guardian ID</TableHead>
                <TableHead>Full Name</TableHead>
                <TableHead>Relationship</TableHead>
                <TableHead>Contact Information</TableHead>
                <TableHead>Occupation & Company</TableHead>
                <TableHead>Linked Students</TableHead>
                <TableHead className="text-center">Emergency</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredGuardians.length === 0 ? (
                <TableEmpty colSpan={9} message="No guardian records match your query." />
              ) : (
                filteredGuardians.map((g) => {
                  const linkedStudentList = students.filter(
                    (s) => g.studentIds.includes(s.id) || g.studentIds.includes(s.studentId)
                  );

                  return (
                    <TableRow key={g.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* ID */}
                      <TableCell className="font-mono text-xs font-semibold text-[#153B66]">
                        {g.guardianId}
                      </TableCell>

                      {/* Name & Initials */}
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-slate-100 text-[#153B66] font-bold text-xs flex items-center justify-center border border-slate-200 shrink-0">
                            {g.fullName
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .slice(0, 2)
                              .toUpperCase()}
                          </div>
                          <div>
                            <button
                              onClick={() => setViewingGuardian(g)}
                              className="font-medium text-slate-900 text-sm hover:text-blue-600 transition-colors text-left"
                            >
                              {g.fullName}
                            </button>
                            <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                              <MapPin className="h-3 w-3 text-slate-400" />
                              <span>{g.city}, {g.state}</span>
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      {/* Relationship */}
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            g.relationship === "Father"
                              ? "bg-blue-50 text-blue-700 border border-blue-200"
                              : g.relationship === "Mother"
                              ? "bg-purple-50 text-purple-700 border border-purple-200"
                              : g.relationship === "Legal Guardian"
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : "bg-slate-100 text-slate-700 border border-slate-200"
                          }`}
                        >
                          {g.relationship}
                        </span>
                      </TableCell>

                      {/* Contact */}
                      <TableCell>
                        <div className="space-y-0.5 text-xs">
                          <div className="flex items-center gap-1.5 text-slate-700">
                            <Phone className="h-3 w-3 text-slate-400" />
                            <span>{g.phone}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-500">
                            <Mail className="h-3 w-3 text-slate-400" />
                            <span className="truncate max-w-[170px]" title={g.email}>
                              {g.email}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      {/* Occupation */}
                      <TableCell>
                        <div className="text-xs text-slate-800 font-medium">
                          {g.occupation}
                        </div>
                        {g.company && (
                          <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                            <Building className="h-3 w-3 text-slate-400" />
                            <span className="truncate max-w-[150px]">{g.company}</span>
                          </div>
                        )}
                      </TableCell>

                      {/* Linked Students */}
                      <TableCell>
                        {linkedStudentList.length === 0 ? (
                          <span className="text-xs text-slate-400 italic">No students linked</span>
                        ) : (
                          <div className="flex flex-wrap gap-1 max-w-[200px]">
                            {linkedStudentList.map((st) => (
                              <span
                                key={st.id}
                                title={`${st.fullName} (${st.rollNumber}) - ${st.className}`}
                                className="inline-flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs px-2 py-0.5 rounded transition-colors"
                              >
                                <GraduationCap className="h-3 w-3 text-slate-500" />
                                <span className="font-medium truncate max-w-[120px]">{st.fullName}</span>
                              </span>
                            ))}
                          </div>
                        )}
                      </TableCell>

                      {/* Emergency */}
                      <TableCell className="text-center">
                        {g.isEmergencyContact ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
                            <ShieldAlert className="h-3 w-3 text-red-600" />
                            Primary
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">Secondary</span>
                        )}
                      </TableCell>

                      {/* Status */}
                      <TableCell className="text-center">
                        <Badge variant={g.status === "Active" ? "success" : "neutral"}>
                          {g.status}
                        </Badge>
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setViewingGuardian(g)}
                            title="View Full Profile"
                            className="h-8 w-8 p-0 text-slate-600 hover:text-blue-600"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenLinkModal(g)}
                            title="Link Student"
                            className="h-8 w-8 p-0 text-teal-600 hover:text-teal-700 hover:bg-teal-50"
                          >
                            <UserPlus className="h-4 w-4" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditModal(g)}
                            title="Edit Details"
                            className="h-8 w-8 p-0 text-slate-600 hover:text-slate-900"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleStatus(g)}
                            title={g.status === "Active" ? "Deactivate Guardian" : "Activate Guardian"}
                            className={`h-8 w-8 p-0 ${
                              g.status === "Active"
                                ? "text-slate-400 hover:text-amber-600 hover:bg-amber-50"
                                : "text-teal-600 hover:text-teal-700 hover:bg-teal-50"
                            }`}
                          >
                            {g.status === "Active" ? (
                              <UserX className="h-4 w-4" />
                            ) : (
                              <UserCheck className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* =========================================================================
          MODAL 1: ADD / EDIT GUARDIAN
      ========================================================================= */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={editingGuardian ? `Edit Guardian (${editingGuardian.guardianId})` : "Register New Guardian"}
        maxWidth="lg"
      >
        <form onSubmit={handleSaveGuardian} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Legal Name <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="e.g. Ramesh Krishnan"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className={formErrors.fullName ? "border-red-500" : ""}
              />
              {formErrors.fullName && (
                <p className="text-xs text-red-500 mt-1">{formErrors.fullName}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Relationship to Student <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.relationship}
                onChange={(e) =>
                  setFormData({ ...formData, relationship: e.target.value as GuardianRelationship })
                }
                className="w-full h-10 px-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#153B66]"
              >
                <option value="Father">Father</option>
                <option value="Mother">Mother</option>
                <option value="Local Guardian">Local Guardian</option>
                <option value="Legal Guardian">Legal Guardian</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Primary Phone Number <span className="text-red-500">*</span>
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

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Alternate Phone Number
              </label>
              <Input
                placeholder="+91 98765 00000"
                value={formData.alternatePhone}
                onChange={(e) => setFormData({ ...formData, alternatePhone: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email Address <span className="text-red-500">*</span>
            </label>
            <Input
              type="email"
              placeholder="ramesh.krishnan@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className={formErrors.email ? "border-red-500" : ""}
            />
            {formErrors.email && (
              <p className="text-xs text-red-500 mt-1">{formErrors.email}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Occupation / Profession <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="e.g. Senior Software Architect"
                value={formData.occupation}
                onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                className={formErrors.occupation ? "border-red-500" : ""}
              />
              {formErrors.occupation && (
                <p className="text-xs text-red-500 mt-1">{formErrors.occupation}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Employer / Organization Name
              </label>
              <Input
                placeholder="e.g. Tata Consultancy Services"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Residential Street Address <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="e.g. 142 Anna Salai, Guindy"
              value={formData.addressLine}
              onChange={(e) => setFormData({ ...formData, addressLine: e.target.value })}
              className={formErrors.addressLine ? "border-red-500" : ""}
            />
            {formErrors.addressLine && (
              <p className="text-xs text-red-500 mt-1">{formErrors.addressLine}</p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                City <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="Chennai"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className={formErrors.city ? "border-red-500" : ""}
              />
              {formErrors.city && (
                <p className="text-xs text-red-500 mt-1">{formErrors.city}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">State</label>
              <Input
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Postal Code</label>
              <Input
                placeholder="600032"
                value={formData.postalCode}
                onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
              />
            </div>
          </div>

          {/* Initial Student Link (when adding new guardian) */}
          {!editingGuardian && (
            <div className="pt-2 border-t border-slate-100">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Link to Student (Optional)
              </label>
              <select
                value={formData.initialStudentId}
                onChange={(e) => setFormData({ ...formData, initialStudentId: e.target.value })}
                className="w-full h-10 px-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#153B66]"
              >
                <option value="">-- Do not link right now (link later) --</option>
                {students.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.fullName} ({st.rollNumber}) — {st.className}
                  </option>
                ))}
              </select>
              <p className="text-xs text-slate-500 mt-1">
                You can link one or more students at any time after registration.
              </p>
            </div>
          )}

          {/* Checkboxes for Emergency & Status */}
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isEmergencyContact}
                onChange={(e) =>
                  setFormData({ ...formData, isEmergencyContact: e.target.checked })
                }
                className="rounded border-slate-300 text-[#153B66] focus:ring-[#153B66] h-4 w-4"
              />
              <span className="text-xs font-semibold text-slate-800">
                Designate as Primary Emergency Contact for automated notifications & campus alerts
              </span>
            </label>

            {editingGuardian && (
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.status === "Active"}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.checked ? "Active" : "Inactive",
                    })
                  }
                  className="rounded border-slate-300 text-teal-600 focus:ring-teal-600 h-4 w-4"
                />
                <span className="text-xs font-medium text-slate-700">
                  Guardian status is Active
                </span>
              </label>
            )}
          </div>

          {/* Modal Actions */}
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
              {editingGuardian ? "Update Guardian" : "Register Guardian"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* =========================================================================
          MODAL 2: 360-DEGREE GUARDIAN PROFILE VIEW
      ========================================================================= */}
      {viewingGuardian && (
        <Modal
          isOpen={true}
          onClose={() => setViewingGuardian(null)}
          title={`Guardian Profile: ${viewingGuardian.fullName}`}
          maxWidth="lg"
        >
          <div className="space-y-6">
            {/* Header Card */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-[#153B66] text-white font-bold text-base flex items-center justify-center shrink-0">
                  {viewingGuardian.fullName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">{viewingGuardian.fullName}</h3>
                  <div className="flex items-center gap-2 text-xs text-slate-600 mt-0.5">
                    <span className="font-mono text-[#153B66] font-semibold">
                      {viewingGuardian.guardianId}
                    </span>
                    <span>•</span>
                    <span className="font-medium text-slate-700">{viewingGuardian.relationship}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {viewingGuardian.isEmergencyContact && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold bg-red-100 text-red-800 border border-red-200">
                    <ShieldAlert className="h-3.5 w-3.5" />
                    Emergency Contact
                  </span>
                )}
                <Badge variant={viewingGuardian.status === "Active" ? "success" : "neutral"}>
                  {viewingGuardian.status}
                </Badge>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Contact Information */}
              <div className="border border-slate-200 rounded-lg p-4 space-y-3 bg-white">
                <h4 className="font-semibold text-slate-900 uppercase tracking-wider text-[11px] text-[#153B66] flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5" />
                  Contact Information
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Primary Phone:</span>
                    <span className="font-medium text-slate-800">{viewingGuardian.phone}</span>
                  </div>
                  {viewingGuardian.alternatePhone && (
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">Alternate Phone:</span>
                      <span className="font-medium text-slate-800">{viewingGuardian.alternatePhone}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Email Address:</span>
                    <span className="font-medium text-slate-800">{viewingGuardian.email}</span>
                  </div>
                  <div className="py-1">
                    <span className="text-slate-500 block mb-0.5">Address:</span>
                    <span className="font-medium text-slate-800 leading-relaxed">
                      {viewingGuardian.addressLine}, {viewingGuardian.city}, {viewingGuardian.state} - {viewingGuardian.postalCode}
                    </span>
                  </div>
                </div>
              </div>

              {/* Professional & Registry Info */}
              <div className="border border-slate-200 rounded-lg p-4 space-y-3 bg-white">
                <h4 className="font-semibold text-slate-900 uppercase tracking-wider text-[11px] text-[#153B66] flex items-center gap-1.5">
                  <Briefcase className="h-3.5 w-3.5" />
                  Professional Profile
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Occupation:</span>
                    <span className="font-medium text-slate-800">{viewingGuardian.occupation}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Employer / Org:</span>
                    <span className="font-medium text-slate-800">{viewingGuardian.company || "Self-Employed / Independent"}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Relationship:</span>
                    <span className="font-medium text-slate-800">{viewingGuardian.relationship}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Registered On:</span>
                    <span className="font-medium text-slate-800">
                      {new Date(viewingGuardian.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Linked Students Section */}
            <div className="border border-slate-200 rounded-lg p-4 bg-white space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h4 className="font-semibold text-slate-900 uppercase tracking-wider text-[11px] text-[#153B66] flex items-center gap-1.5">
                  <GraduationCap className="h-3.5 w-3.5" />
                  Linked Students & Wards ({viewingGuardian.studentIds.length})
                </h4>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    handleOpenLinkModal(viewingGuardian);
                  }}
                  className="text-xs h-7 gap-1 border-teal-300 text-teal-700 hover:bg-teal-50"
                >
                  <Plus className="h-3 w-3" />
                  Link Student
                </Button>
              </div>

              {viewingGuardian.studentIds.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-500">
                  No students are currently linked to this guardian record.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {students
                    .filter(
                      (s) =>
                        viewingGuardian.studentIds.includes(s.id) ||
                        viewingGuardian.studentIds.includes(s.studentId)
                    )
                    .map((child) => (
                      <div
                        key={child.id}
                        className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-xs font-bold text-[#153B66]">
                              {child.rollNumber}
                            </span>
                            <Badge variant={child.status === "Active" ? "success" : "neutral"}>
                              {child.status}
                            </Badge>
                          </div>
                          <h5 className="font-semibold text-slate-900 text-sm mt-1">
                            {child.fullName}
                          </h5>
                          <p className="text-xs text-slate-600 mt-0.5">
                            {child.className} {child.sectionName ? `(${child.sectionName})` : ""}
                          </p>
                          <p className="text-xs text-slate-500">
                            {child.departmentName}
                          </p>
                        </div>

                        <div className="mt-3 pt-2 border-t border-slate-200/80 flex items-center justify-between">
                          <span className="text-[11px] text-slate-500">
                            Adm: {child.admissionNumber}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              handleUnlinkStudent(viewingGuardian.id, child.id, child.fullName)
                            }
                            className="text-xs text-red-600 hover:text-red-800 font-medium hover:underline"
                          >
                            Unlink Student
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const g = viewingGuardian;
                  setViewingGuardian(null);
                  openEditModal(g);
                }}
                className="gap-1.5"
              >
                <Edit2 className="h-3.5 w-3.5" />
                Edit Guardian
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewingGuardian(null)}
              >
                Close Profile
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* =========================================================================
          MODAL 3: LINK STUDENT TO GUARDIAN
      ========================================================================= */}
      {linkingGuardian && (
        <Modal
          isOpen={true}
          onClose={() => setLinkingGuardian(null)}
          title={`Link Student to Guardian: ${linkingGuardian.fullName}`}
          maxWidth="md"
        >
          <div className="space-y-4">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800">
              Select an enrolled student to establish a verified guardian-student relationship. A guardian can be linked to multiple children/wards.
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Select Student <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedStudentToLink}
                onChange={(e) => setSelectedStudentToLink(e.target.value)}
                className="w-full h-10 px-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#153B66]"
              >
                <option value="">-- Choose student from active directory --</option>
                {students
                  .filter(
                    (st) =>
                      !linkingGuardian.studentIds.includes(st.id) &&
                      !linkingGuardian.studentIds.includes(st.studentId)
                  )
                  .map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.fullName} ({st.rollNumber}) — {st.className} ({st.departmentName})
                    </option>
                  ))}
              </select>
            </div>

            {students.filter(
              (st) =>
                !linkingGuardian.studentIds.includes(st.id) &&
                !linkingGuardian.studentIds.includes(st.studentId)
            ).length === 0 && (
              <p className="text-xs text-amber-600 bg-amber-50 p-2.5 rounded border border-amber-200">
                All currently registered students are already linked to this guardian.
              </p>
            )}

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
              <Button
                variant="outline"
                onClick={() => setLinkingGuardian(null)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmLinkStudent}
                disabled={!selectedStudentToLink}
                className="bg-[#153B66] hover:bg-[#153B66]/90 text-white"
              >
                Confirm Link
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
