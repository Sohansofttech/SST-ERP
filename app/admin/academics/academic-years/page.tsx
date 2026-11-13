"use client";

import React, { useState } from "react";
import { useInstitution } from "@/lib/store";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Alert } from "@/components/ui/alert";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableEmpty } from "@/components/ui/table";
import {
  Calendar,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  CalendarDays,
} from "lucide-react";
import { AcademicYear, Term } from "@/types/institution";
import { formatDate } from "@/lib/utils";

export default function AcademicYearsPage() {
  const {
    academicYears,
    activeAcademicYear,
    addAcademicYear,
    updateAcademicYear,
    setActiveAcademicYear,
    deleteAcademicYear,
  } = useInstitution();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAY, setEditingAY] = useState<AcademicYear | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isActive, setIsActive] = useState(false);
  const [terms, setTerms] = useState<Term[]>([
    { id: "t1", name: "Odd Semester / Fall", startDate: "", endDate: "", isCurrent: true },
    { id: "t2", name: "Even Semester / Spring", startDate: "", endDate: "", isCurrent: false },
  ]);
  const [formError, setFormError] = useState("");

  const handleOpenAddModal = () => {
    setEditingAY(null);
    setName("2027-2028");
    setStartDate("2027-08-01");
    setEndDate("2028-05-31");
    setIsActive(false);
    setTerms([
      { id: "t1", name: "Odd Semester / Term 1", startDate: "2027-08-01", endDate: "2027-12-20", isCurrent: true },
      { id: "t2", name: "Even Semester / Term 2", startDate: "2028-01-10", endDate: "2028-05-31", isCurrent: false },
    ]);
    setFormError("");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (ay: AcademicYear) => {
    setEditingAY(ay);
    setName(ay.name);
    setStartDate(ay.startDate);
    setEndDate(ay.endDate);
    setIsActive(ay.isActive);
    setTerms(ay.terms || []);
    setFormError("");
    setIsModalOpen(true);
  };

  const handleTermChange = (index: number, field: keyof Term, value: string | boolean) => {
    setTerms((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleAddTerm = () => {
    const termNum = terms.length + 1;
    setTerms((prev) => [
      ...prev,
      {
        id: `term-${Date.now()}`,
        name: `Term ${termNum}`,
        startDate: "",
        endDate: "",
        isCurrent: false,
      },
    ]);
  };

  const handleRemoveTerm = (index: number) => {
    if (terms.length <= 1) {
      alert("At least one term must be configured.");
      return;
    }
    setTerms((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    // Date validation
    if (!startDate || !endDate) {
      setFormError("Start date and End date are required.");
      return;
    }
    if (new Date(startDate) >= new Date(endDate)) {
      setFormError("Academic year start date must be strictly before end date.");
      return;
    }

    // Terms validation
    for (const t of terms) {
      if (!t.name.trim()) {
        setFormError("Every term must have a valid title.");
        return;
      }
      if (t.startDate && t.endDate && new Date(t.startDate) >= new Date(t.endDate)) {
        setFormError(`Term "${t.name}" start date must precede its end date.`);
        return;
      }
    }

    if (editingAY) {
      updateAcademicYear(editingAY.id, {
        name,
        startDate,
        endDate,
        isActive,
        terms,
      });
    } else {
      addAcademicYear({
        name,
        startDate,
        endDate,
        isActive,
        terms,
      });
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string, ayName: string) => {
    if (confirm(`Are you sure you want to delete Academic Year "${ayName}"?`)) {
      deleteAcademicYear(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E2E8F0]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">
              Academics Architecture
            </span>
            <span className="text-[#CBD5E1]">•</span>
            <Badge variant="teal" size="sm">
              Calendar & Terms
            </Badge>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#1E293B]">
            Academic Year Management
          </h1>
          <p className="text-sm text-[#64748B] mt-1">
            Configure institutional calendar cycles, active academic years, and semester/term boundaries.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={handleOpenAddModal}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Create Academic Year
        </Button>
      </div>

      {/* Current Active Indicator Card */}
      <Card className="border-l-4 border-l-[#16A34A] bg-[#F0FDF4]/40">
        <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center font-bold">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs uppercase font-bold text-[#16A34A] tracking-wider block">
                Current System Active Year
              </span>
              <h4 className="text-lg font-bold text-[#153B66]">
                AY {activeAcademicYear?.name || "None Selected"}
              </h4>
              <p className="text-xs text-[#64748B]">
                Valid: {formatDate(activeAcademicYear?.startDate || "")} to {formatDate(activeAcademicYear?.endDate || "")} • {activeAcademicYear?.terms.length || 0} Terms
              </p>
            </div>
          </div>
          <div className="text-xs text-[#16A34A] font-semibold bg-white px-3 py-1.5 rounded-lg border border-[#BBF7D0] shadow-xs">
            All student enrollments and fee dues scope to this cycle
          </div>
        </CardContent>
      </Card>

      {/* Academic Years Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-[#2563EB]" />
              <CardTitle>Configured Academic Years</CardTitle>
            </div>
            <span className="text-xs text-[#64748B]">
              Total: {academicYears.length} Cycles
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Academic Cycle</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Terms Breakdown</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {academicYears.map((ay) => (
                <TableRow key={ay.id}>
                  <TableCell className="font-bold text-[#153B66]">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#2563EB]" />
                      <span>AY {ay.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{formatDate(ay.startDate)}</TableCell>
                  <TableCell>{formatDate(ay.endDate)}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1.5">
                      {ay.terms.map((term) => (
                        <span
                          key={term.id}
                          className={`text-[11px] px-2 py-0.5 rounded font-medium border ${
                            term.isCurrent
                              ? "bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE]"
                              : "bg-[#F8FAFC] text-[#64748B] border-[#E2E8F0]"
                          }`}
                        >
                          {term.name} {term.isCurrent && "★"}
                        </span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    {ay.isActive ? (
                      <Badge variant="success" size="md">
                        ● Active Calendar
                      </Badge>
                    ) : (
                      <Badge variant="neutral" size="md">
                        Inactive
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    {!ay.isActive && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setActiveAcademicYear(ay.id)}
                        className="text-[#2563EB] border-[#2563EB]/30 hover:bg-[#EFF6FF]"
                      >
                        Set as Active
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenEditModal(ay)}
                      title="Edit Year"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-[#2563EB]" />
                    </Button>
                    {!ay.isActive && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(ay.id, ay.name)}
                        title="Delete Year"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-[#DC2626]" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {academicYears.length === 0 && (
                <TableEmpty colSpan={6} message="No academic years configured yet." />
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal: Create / Edit Academic Year */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingAY ? `Edit Academic Year (${editingAY.name})` : "Create New Academic Year"}
        description="Define session duration, terms, and activation status."
        maxWidth="lg"
        footer={
          <>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="button" variant="primary" size="sm" onClick={handleSubmit}>
              {editingAY ? "Update Academic Year" : "Save Academic Year"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {formError && (
            <Alert variant="error" title="Validation Inconsistency">
              {formError}
            </Alert>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Input
                label="Academic Year Label"
                required
                placeholder="e.g. 2027-2028"
                value={name}
                onChange={(e) => setName(e.target.value)}
                helperText="Follow standard notation: YYYY-YYYY"
              />
            </div>

            <Input
              label="Session Start Date"
              type="date"
              required
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />

            <Input
              label="Session End Date"
              type="date"
              required
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <div className="pt-2 border-t border-[#F1F5F9]">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="rounded border-[#CBD5E1] text-[#2563EB] focus:ring-[#2563EB] w-4 h-4 cursor-pointer"
              />
              <span className="text-xs font-semibold text-[#1E293B]">
                Set this as the Active Academic Year immediately upon saving
              </span>
            </label>
            <p className="text-[11px] text-[#64748B] ml-6 mt-0.5">
              Only one academic year can be active at any given moment.
            </p>
          </div>

          {/* Terms Configuration */}
          <div className="pt-3 border-t border-[#F1F5F9] space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-[#1E293B] uppercase tracking-wider">
                  Term & Semester Sub-Divisions
                </h4>
                <p className="text-[11px] text-[#64748B]">
                  Break down year into Odd/Even semesters or terms
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddTerm}
                leftIcon={<Plus className="w-3.5 h-3.5" />}
              >
                Add Term
              </Button>
            </div>

            <div className="space-y-2.5">
              {terms.map((t, idx) => (
                <div
                  key={t.id}
                  className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <input
                      type="text"
                      placeholder="Term Name (e.g. Odd Semester)"
                      value={t.name}
                      onChange={(e) => handleTermChange(idx, "name", e.target.value)}
                      className="text-xs font-bold text-[#153B66] bg-white border border-[#CBD5E1] rounded px-2 py-1 flex-1"
                    />
                    <label className="flex items-center gap-1.5 text-[11px] text-[#64748B] cursor-pointer">
                      <input
                        type="radio"
                        name="currentTerm"
                        checked={t.isCurrent}
                        onChange={() => {
                          setTerms((prev) =>
                            prev.map((item, i) => ({
                              ...item,
                              isCurrent: i === idx,
                            }))
                          );
                        }}
                      />
                      <span>Current</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => handleRemoveTerm(idx)}
                      className="text-[#DC2626] hover:text-[#991B1B] p-1 text-xs cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-[#64748B] block">Term Start</span>
                      <input
                        type="date"
                        value={t.startDate}
                        onChange={(e) => handleTermChange(idx, "startDate", e.target.value)}
                        className="w-full bg-white border border-[#CBD5E1] rounded px-2 py-1 text-xs"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-[#64748B] block">Term End</span>
                      <input
                        type="date"
                        value={t.endDate}
                        onChange={(e) => handleTermChange(idx, "endDate", e.target.value)}
                        className="w-full bg-white border border-[#CBD5E1] rounded px-2 py-1 text-xs"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
