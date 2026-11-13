"use client";

import React, { useEffect, useState } from "react";
import { PortalLayout } from "@/components/layout/PortalLayout";
import { Card } from "@/components/shared/Card";
import { Badge } from "@/components/shared/Badge";
import { Button } from "@/components/shared/Button";
import { Modal } from "@/components/shared/Modal";
import { Table } from "@/components/shared/Table";
import { Award, Calendar, QrCode, Download, ShieldCheck, CheckCircle2, AlertCircle } from "lucide-react";

export default function ExaminationsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmitCardOpen, setIsAdmitCardOpen] = useState(false);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const res = await fetch("/api/student/examinations");
        const json = await res.json();
        if (json.success) setData(json.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchExams();
  }, []);

  if (loading) {
    return (
      <PortalLayout portalType="STUDENT" pageTitle="Examinations & Results">
        <div className="py-20 text-center text-sm text-[#64748B]">Loading examination records...</div>
      </PortalLayout>
    );
  }

  const { schedules, admitCard, results, cgpa, supplementaryExams } = data || {};

  return (
    <PortalLayout portalType="STUDENT" pageTitle="Examinations, Hall Ticket & Results">
      {/* Top Banner: Hall Ticket Quick Access & CGPA */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="md:col-span-2 bg-gradient-to-r from-[#153B66] to-[#1E4F8A] text-white p-6 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Badge variant="brand" className="bg-white/20 text-white border-white/30 text-xs">
              Admit Card Ready
            </Badge>
            <h3 className="text-xl font-bold mt-2 text-white">
              End Semester Examinations (Nov/Dec 2025)
            </h3>
            <p className="text-xs text-white/80 mt-1">
              Hall Ticket: <span className="font-semibold text-white">{admitCard?.hallTicketNo || "Generated"}</span> • Status: <span className="text-[#14B8A6] font-semibold">Eligible (Attendance cleared)</span>
            </p>
          </div>
          {admitCard && (
            <Button
              variant="secondary"
              onClick={() => setIsAdmitCardOpen(true)}
              icon={<QrCode className="w-4 h-4" />}
              className="shrink-0"
            >
              View Hall Ticket
            </Button>
          )}
        </div>

        <div className="bg-white border border-[#E2E8F0] p-6 rounded-2xl shadow-sm flex flex-col justify-center">
          <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">
            Cumulative Grade Point (CGPA)
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#153B66]">{cgpa}</span>
            <span className="text-xs text-[#64748B]">/ 10.00</span>
          </div>
          <Badge variant="success" size="sm" className="mt-2 w-fit">
            First Class Distinction
          </Badge>
        </div>
      </div>

      <div className="space-y-6">
        {/* Exam Timetable Schedule */}
        <Card title="Official Examination Timetable">
          {schedules?.map((sch: any) => (
            <div key={sch.id} className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2">
                <span className="text-sm font-bold text-[#1E293B]">{sch.title}</span>
                <Badge variant="error" size="sm">{sch.examType}</Badge>
              </div>

              <Table
                columns={[
                  {
                    header: "Date",
                    cell: (slot: any) => new Date(slot.examDate).toLocaleDateString(),
                  },
                  {
                    header: "Timing",
                    cell: (slot: any) => `${slot.startTime} - ${slot.endTime}`,
                  },
                  {
                    header: "Subject Code",
                    accessorKey: "subjectCode",
                  },
                  {
                    header: "Course Subject",
                    accessorKey: "subjectName",
                  },
                  {
                    header: "Exam Hall / Room",
                    accessorKey: "roomNumber",
                  },
                ]}
                data={sch.slots}
              />
            </div>
          ))}
        </Card>

        {/* Examination Results History */}
        <Card title="Published Examination Results & Grades">
          <Table
            columns={[
              {
                header: "Exam Session",
                accessorKey: "examName",
              },
              {
                header: "Subject Code",
                accessorKey: "subjectCode",
              },
              {
                header: "Subject Name",
                accessorKey: "subjectName",
              },
              {
                header: "Internal (50)",
                accessorKey: "internalMarks",
              },
              {
                header: "External (50)",
                accessorKey: "externalMarks",
              },
              {
                header: "Total (100)",
                cell: (item: any) => (
                  <span className="font-bold text-[#1E293B]">{item.totalMarks}</span>
                ),
              },
              {
                header: "Letter Grade",
                cell: (item: any) => (
                  <Badge variant={item.grade === "A+" || item.grade === "A" ? "success" : "brand"} size="sm">
                    {item.grade}
                  </Badge>
                ),
              },
              {
                header: "Grade Point",
                accessorKey: "gradePoint",
              },
              {
                header: "Credits",
                accessorKey: "credits",
              },
              {
                header: "Status",
                cell: (item: any) => (
                  <Badge variant={item.isPassed ? "success" : "error"} size="sm">
                    {item.isPassed ? "PASS" : "RE-APPEAR"}
                  </Badge>
                ),
              },
            ]}
            data={results || []}
          />
        </Card>

        {/* Supplementary Examination Details */}
        <Card
          title="Supplementary Examination Records"
          subtitle="Arrear clearance and supplementary paper attempts"
        >
          {supplementaryExams?.length === 0 ? (
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" />
              <span>Clean Academic Record: Zero supplementary or arrear papers recorded!</span>
            </div>
          ) : (
            <Table
              columns={[
                { header: "Subject Code", accessorKey: "subjectCode" },
                { header: "Subject Name", accessorKey: "subjectName" },
                { header: "Attempt Number", accessorKey: "attemptNumber" },
                { header: "Status", accessorKey: "grade" },
              ]}
              data={supplementaryExams}
            />
          )}
        </Card>
      </div>

      {/* Hall Ticket Modal */}
      {admitCard && (
        <Modal
          isOpen={isAdmitCardOpen}
          onClose={() => setIsAdmitCardOpen(false)}
          title="Official Examination Hall Ticket / Admit Card"
          subtitle="Apex Institute of Technology • Controller of Examinations"
          maxWidth="2xl"
          footer={
            <div className="flex justify-between w-full items-center">
              <span className="text-[11px] text-[#64748B]">
                Carry a printed physical copy along with student institutional ID card.
              </span>
              <Button
                variant="primary"
                size="sm"
                onClick={() => window.print()}
                icon={<Download className="w-4 h-4" />}
              >
                Print / Save PDF
              </Button>
            </div>
          }
        >
          <div className="border border-[#153B66] rounded-xl p-5 bg-white space-y-4">
            {/* Header */}
            <div className="text-center border-b border-[#E2E8F0] pb-3">
              <h2 className="text-lg font-bold text-[#153B66]">APEX INSTITUTE OF TECHNOLOGY</h2>
              <p className="text-xs text-[#64748B]">Autonomous Institution • Affiliated to Tech University</p>
              <h3 className="text-sm font-semibold text-[#1E293B] mt-1">{admitCard.examTitle}</h3>
            </div>

            {/* Student metadata */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-[#F8FAFC] p-3 rounded-lg border border-[#E2E8F0]">
              <div>
                <span className="text-[#64748B] block">Candidate Name:</span>
                <span className="font-bold text-[#1E293B]">{admitCard.student.name}</span>
              </div>
              <div>
                <span className="text-[#64748B] block">Hall Ticket No:</span>
                <span className="font-bold text-[#2563EB]">{admitCard.hallTicketNo}</span>
              </div>
              <div>
                <span className="text-[#64748B] block">Roll Number:</span>
                <span className="font-bold text-[#1E293B]">{admitCard.student.rollNumber}</span>
              </div>
              <div>
                <span className="text-[#64748B] block">Semester:</span>
                <span className="font-bold text-[#1E293B]">Semester {admitCard.student.semester}</span>
              </div>
            </div>

            {/* Exam paper schedule */}
            <div>
              <p className="text-xs font-bold text-[#153B66] uppercase tracking-wider mb-2">
                Eligible Examination Schedule
              </p>
              <div className="space-y-1.5 text-xs">
                {admitCard.slots?.map((slot: any) => (
                  <div key={slot.id} className="p-2 border border-[#E2E8F0] rounded flex justify-between">
                    <div>
                      <span className="font-bold text-[#1E293B]">{slot.subjectCode}</span>: {slot.subjectName}
                    </div>
                    <div className="text-[#64748B]">
                      {new Date(slot.examDate).toLocaleDateString()} ({slot.startTime} - {slot.endTime}) • {slot.roomNumber}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* QR verification code & Instructions */}
            <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#F1F5F9] rounded border border-[#E2E8F0]">
                  <QrCode className="w-10 h-10 text-[#153B66]" />
                </div>
                <div>
                  <p className="text-[10px] text-[#64748B] font-mono break-all max-w-xs">
                    Verification Digest: {admitCard.qrCodeData}
                  </p>
                  <p className="text-[11px] text-[#16A34A] font-semibold mt-0.5">
                    Verified Digital Signature Valid
                  </p>
                </div>
              </div>

              <div className="text-right">
                <div className="w-24 border-b border-[#1E293B] mb-1"></div>
                <span className="text-[10px] text-[#64748B] font-semibold">Controller of Examinations</span>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </PortalLayout>
  );
}

