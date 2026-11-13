"use client";

import React, { useEffect, useState } from "react";
import { PortalLayout } from "@/components/layout/PortalLayout";
import { Card } from "@/components/shared/Card";
import { Badge } from "@/components/shared/Badge";
import { Button } from "@/components/shared/Button";
import { Modal } from "@/components/shared/Modal";
import { FormInput } from "@/components/shared/FormInput";
import { Table } from "@/components/shared/Table";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  FileText,
  Lock,
  Edit3,
  CheckCircle2,
  Clock,
  ShieldAlert,
} from "lucide-react";

export default function StudentProfilePage() {
  const [student, setStudent] = useState<any>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Correction form state
  const [proposedPhone, setProposedPhone] = useState("");
  const [proposedAddress, setProposedAddress] = useState("");
  const [reason, setReason] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const [profileRes, requestsRes] = await Promise.all([
        fetch("/api/student/profile").then((r) => r.json()),
        fetch("/api/student/profile/requests").then((r) => r.json()),
      ]);

      if (profileRes.success) setStudent(profileRes.data);
      if (requestsRes.success) setRequests(requestsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmitCorrection = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch("/api/student/profile/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Contact & Address Information Correction",
          details: {
            proposedEmergencyContact: proposedPhone,
            proposedAddressLine: proposedAddress,
            reason,
          },
        }),
      });

      const json = await res.json();
      if (json.success) {
        setMessage("Correction request submitted for administrative approval.");
        setIsModalOpen(false);
        setProposedPhone("");
        setProposedAddress("");
        setReason("");
        fetchData();
      } else {
        alert(json.error || "Failed to submit correction request.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <PortalLayout portalType="STUDENT" pageTitle="Student Profile">
        <div className="py-20 text-center text-sm text-[#64748B]">Loading profile...</div>
      </PortalLayout>
    );
  }

  const enrollment = student?.enrollments?.[0];

  return (
    <PortalLayout portalType="STUDENT" pageTitle="Student Profile & Identification">
      {message && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-[#16A34A] shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Profile Header Bar */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-sm mb-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#153B66] text-white flex items-center justify-center font-bold text-xl shadow-md">
            {student?.firstName?.[0]}
            {student?.lastName?.[0]}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-[#1E293B]">
                {student?.firstName} {student?.lastName}
              </h2>
              <Badge variant="success" size="sm">
                {student?.status}
              </Badge>
            </div>
            <p className="text-xs text-[#64748B] mt-0.5">
              Roll No: <span className="font-semibold text-[#1E293B]">{student?.rollNumber}</span> • Admission:{" "}
              <span className="font-semibold text-[#1E293B]">{student?.admissionNumber}</span>
            </p>
            <p className="text-xs text-[#2563EB] font-medium mt-0.5">
              {enrollment?.course?.name} ({enrollment?.course?.code})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsModalOpen(true)}
            icon={<Edit3 className="w-4 h-4 text-[#2563EB]" />}
          >
            Request Profile Correction
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Personal & Contact Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Details */}
          <Card title="Personal Information">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <p className="text-[#64748B] font-medium">Full Name</p>
                <p className="font-semibold text-[#1E293B] text-sm mt-0.5">
                  {student?.firstName} {student?.lastName}
                </p>
              </div>
              <div>
                <p className="text-[#64748B] font-medium">Date of Birth</p>
                <p className="font-semibold text-[#1E293B] text-sm mt-0.5">
                  {student?.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-[#64748B] font-medium">Gender</p>
                <p className="font-semibold text-[#1E293B] text-sm mt-0.5">{student?.gender}</p>
              </div>
              <div>
                <p className="text-[#64748B] font-medium">Blood Group</p>
                <p className="font-semibold text-[#1E293B] text-sm mt-0.5">{student?.bloodGroup || "O+"}</p>
              </div>
              <div>
                <p className="text-[#64748B] font-medium">Institutional Email</p>
                <p className="font-semibold text-[#1E293B] text-sm mt-0.5">{student?.user?.email}</p>
              </div>
              <div>
                <p className="text-[#64748B] font-medium">Emergency Phone</p>
                <p className="font-semibold text-[#1E293B] text-sm mt-0.5">{student?.emergencyContact || "N/A"}</p>
              </div>
            </div>
          </Card>

          {/* Address Details */}
          <Card title="Permanent & Residential Address">
            <div className="space-y-3 text-xs">
              <div>
                <p className="text-[#64748B] font-medium">Address Line</p>
                <p className="font-semibold text-[#1E293B] text-sm mt-0.5">{student?.addressLine || "N/A"}</p>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-[#64748B] font-medium">City</p>
                  <p className="font-semibold text-[#1E293B] text-sm mt-0.5">{student?.city || "Bangalore"}</p>
                </div>
                <div>
                  <p className="text-[#64748B] font-medium">State</p>
                  <p className="font-semibold text-[#1E293B] text-sm mt-0.5">{student?.state || "Karnataka"}</p>
                </div>
                <div>
                  <p className="text-[#64748B] font-medium">Postal Pincode</p>
                  <p className="font-semibold text-[#1E293B] text-sm mt-0.5">{student?.pincode || "560103"}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Profile Correction Requests Workflow */}
          <Card
            title="Profile Correction Requests"
            subtitle="Admin review workflow for protected record corrections"
          >
            {requests.length === 0 ? (
              <p className="text-xs text-[#64748B]">No correction requests submitted.</p>
            ) : (
              <Table
                columns={[
                  {
                    header: "Request Title",
                    accessorKey: "title",
                  },
                  {
                    header: "Submitted Date",
                    cell: (item: any) => new Date(item.createdAt).toLocaleDateString(),
                  },
                  {
                    header: "Workflow Status",
                    cell: (item: any) => (
                      <Badge
                        variant={
                          item.status === "APPROVED"
                            ? "success"
                            : item.status === "REJECTED"
                            ? "error"
                            : "warning"
                        }
                        size="sm"
                      >
                        {item.status}
                      </Badge>
                    ),
                  },
                  {
                    header: "Admin Remarks",
                    cell: (item: any) => item.adminRemarks || "Pending admin review",
                  },
                ]}
                data={requests}
              />
            )}
          </Card>
        </div>

        {/* Right Column: Protected Academic Details & Documents */}
        <div className="space-y-6">
          {/* Protected Admission Details */}
          <Card
            title={
              <div className="flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-[#64748B]" />
                <span>Protected Academic Data</span>
              </div>
            }
            subtitle="Modifications require institutional registrar approval"
          >
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
                <p className="text-[#64748B]">Current Academic Year</p>
                <p className="font-bold text-[#153B66] text-sm">
                  {enrollment?.academicYear?.name || "2025-2026"}
                </p>
              </div>
              <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
                <p className="text-[#64748B]">Department & Course</p>
                <p className="font-bold text-[#1E293B] text-xs">
                  {enrollment?.course?.department}
                </p>
                <p className="text-[11px] text-[#64748B] mt-0.5">
                  {enrollment?.course?.name}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
                  <p className="text-[#64748B]">Semester</p>
                  <p className="font-bold text-[#1E293B] text-sm">
                    Sem {student?.currentSemester}
                  </p>
                </div>
                <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
                  <p className="text-[#64748B]">Section</p>
                  <p className="font-bold text-[#1E293B] text-sm">
                    Section {student?.currentSection}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Linked Guardians */}
          <Card title="Linked Guardians">
            <div className="space-y-3">
              {student?.guardianLinks?.map((link: any) => (
                <div
                  key={link.id}
                  className="p-3 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-between"
                >
                  <div>
                    <span className="text-xs font-semibold text-[#1E293B] block">
                      {link.guardianAccount.fullName} ({link.relationship})
                    </span>
                    <span className="text-[11px] text-[#64748B] block mt-0.5">
                      Phone: {link.guardianAccount.phone}
                    </span>
                  </div>
                  <Badge variant={link.isVerified ? "success" : "neutral"} size="sm">
                    {link.isVerified ? "Verified" : "Pending"}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>

          {/* Profile Documents */}
          <Card title="Identity & Academic Documents">
            <div className="space-y-2.5">
              {student?.documents?.map((doc: any) => (
                <div
                  key={doc.id}
                  className="p-3 rounded-lg border border-[#E2E8F0] bg-white flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#2563EB]" />
                    <span className="font-medium text-[#1E293B]">{doc.title}</span>
                  </div>
                  <Badge variant="brand" size="sm">
                    Verified
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Profile Correction Request Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Submit Profile Correction Request"
        subtitle="Requested changes will be reviewed and approved by Institution Admin"
      >
        <form onSubmit={handleSubmitCorrection} className="space-y-4">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900 flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" />
            <span>
              Per Section 7, students may not directly mutate protected identity or academic data.
              Submissions enter the institution admin approval engine.
            </span>
          </div>

          <FormInput
            label="Proposed Emergency Contact Phone"
            value={proposedPhone}
            onChange={(e) => setProposedPhone(e.target.value)}
            placeholder="+91 98765 00000"
          />

          <FormInput
            label="Proposed Address Line"
            value={proposedAddress}
            onChange={(e) => setProposedAddress(e.target.value)}
            placeholder="New flat/street address"
          />

          <div>
            <label className="block text-[13px] font-medium text-[#1E293B] mb-1">
              Reason for Update <span className="text-[#DC2626]">*</span>
            </label>
            <textarea
              className="w-full px-3.5 py-2 text-xs border border-[#E2E8F0] rounded-lg focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Relocated to new apartment, or updated emergency guardian phone"
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={submitting}>
              Submit Request
            </Button>
          </div>
        </form>
      </Modal>
    </PortalLayout>
  );
}

