"use client";

import React, { useState } from "react";
import { useInstitution } from "@/lib/store";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Alert } from "@/components/ui/alert";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableEmpty } from "@/components/ui/table";
import {
  BookMarked,
  Plus,
  Edit2,
  Trash2,
  UserCheck,
  Filter,
} from "lucide-react";
import { SubjectItem, SubjectType } from "@/types/institution";

export default function SubjectsPage() {
  const { subjects, courses, classes, departments, addSubject, updateSubject, deleteSubject } =
    useInstitution();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<SubjectItem | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [credits, setCredits] = useState(4);
  const [hoursPerWeek, setHoursPerWeek] = useState(4);
  const [type, setType] = useState<SubjectType>("Core Theory");
  const [courseId, setCourseId] = useState("");
  const [classId, setClassId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [semester, setSemester] = useState(5);
  const [allocatedTeacherName, setAllocatedTeacherName] = useState("");
  const [formError, setFormError] = useState("");

  // Filters
  const [filterType, setFilterType] = useState<string>("all");
  const [filterCourse, setFilterCourse] = useState<string>("all");

  const handleOpenAddModal = () => {
    setEditingSubject(null);
    setName("");
    setCode("");
    setCredits(4);
    setHoursPerWeek(4);
    setType("Core Theory");
    setCourseId(courses[0]?.id || "");
    setClassId(classes[0]?.id || "");
    setDepartmentId(departments[0]?.id || "");
    setSemester(5);
    setAllocatedTeacherName("");
    setFormError("");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (subj: SubjectItem) => {
    setEditingSubject(subj);
    setName(subj.name);
    setCode(subj.code);
    setCredits(subj.credits);
    setHoursPerWeek(subj.hoursPerWeek);
    setType(subj.type);
    setCourseId(subj.courseId);
    setClassId(subj.classId || "");
    setDepartmentId(subj.departmentId);
    setSemester(subj.semester);
    setAllocatedTeacherName(subj.allocatedTeacherName || "");
    setFormError("");
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!name.trim() || !code.trim()) {
      setFormError("Subject name and code are required.");
      return;
    }
    if (!courseId) {
      setFormError("Course mapping is required.");
      return;
    }
    if (credits <= 0) {
      setFormError("Credits must be a positive integer.");
      return;
    }

    if (editingSubject) {
      updateSubject(editingSubject.id, {
        name,
        code: code.toUpperCase(),
        credits: Number(credits),
        hoursPerWeek: Number(hoursPerWeek),
        type,
        courseId,
        classId,
        departmentId,
        semester: Number(semester),
        allocatedTeacherName,
      });
    } else {
      addSubject({
        name,
        code: code.toUpperCase(),
        credits: Number(credits),
        hoursPerWeek: Number(hoursPerWeek),
        type,
        courseId,
        classId,
        departmentId,
        semester: Number(semester),
        allocatedTeacherName,
        status: "Active",
      });
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string, subjName: string) => {
    if (confirm(`Are you sure you want to delete subject "${subjName}"?`)) {
      deleteSubject(id);
    }
  };

  const courseOptions = courses.map((c) => ({
    value: c.id,
    label: `${c.name} (${c.code})`,
  }));

  const classOptions = [
    { value: "", label: "No Specific Class Binding" },
    ...classes.map((c) => ({
      value: c.id,
      label: `${c.name} [Sem ${c.semester}]`,
    })),
  ];

  const deptOptions = departments.map((d) => ({
    value: d.id,
    label: `${d.name} (${d.code})`,
  }));

  const subjectTypeOptions = [
    { value: "Core Theory", label: "Core Theory Subject" },
    { value: "Practical / Lab", label: "Practical / Laboratory" },
    { value: "Department Elective", label: "Departmental Elective (DE)" },
    { value: "Open Elective", label: "Open / Institutional Elective (OE)" },
    { value: "Project / Seminar", label: "Capstone Project / Seminar" },
  ];

  const filteredSubjects = subjects.filter((s) => {
    if (filterType !== "all" && s.type !== filterType) return false;
    if (filterCourse !== "all" && s.courseId !== filterCourse) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E2E8F0]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">
              Academics Architecture
            </span>
            <span className="text-[#CBD5E1]">•</span>
            <span className="text-xs font-bold text-[#14B8A6] uppercase tracking-wider">
              Curriculum Catalog
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#1E293B]">
            Subject Master & Allocation
          </h1>
          <p className="text-sm text-[#64748B] mt-1">
            Configure curriculum subjects, credits, syllabus types, and designate primary teaching faculty.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={handleOpenAddModal}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Create Subject
        </Button>
      </div>

      {/* Filter Controls Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-white rounded-xl border border-[#E2E8F0] shadow-xs">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-[#64748B] font-semibold">
            <Filter className="w-4 h-4" /> Filters:
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="text-xs border border-[#CBD5E1] rounded-lg px-2.5 py-1.5 bg-white text-[#1E293B]"
          >
            <option value="all">All Subject Types</option>
            <option value="Core Theory">Core Theory</option>
            <option value="Practical / Lab">Practical / Lab</option>
            <option value="Department Elective">Department Elective</option>
            <option value="Open Elective">Open Elective</option>
          </select>

          <select
            value={filterCourse}
            onChange={(e) => setFilterCourse(e.target.value)}
            className="text-xs border border-[#CBD5E1] rounded-lg px-2.5 py-1.5 bg-white text-[#1E293B]"
          >
            <option value="all">All Associated Programs</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code} - {c.name}
              </option>
            ))}
          </select>
        </div>

        <span className="text-xs font-medium text-[#64748B]">
          Showing <strong>{filteredSubjects.length}</strong> of {subjects.length} Subjects
        </span>
      </div>

      {/* Subjects Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BookMarked className="w-5 h-5 text-[#2563EB]" />
            <CardTitle>Subject Master Register</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Subject Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Credits & Load</TableHead>
                <TableHead>Program & Semester</TableHead>
                <TableHead>Allocated Instructor</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubjects.map((subj) => (
                <TableRow key={subj.id}>
                  <TableCell>
                    <span className="font-mono text-xs font-bold bg-[#153B66] text-white px-2 py-0.5 rounded">
                      {subj.code}
                    </span>
                  </TableCell>
                  <TableCell className="font-bold text-[#1E293B]">
                    {subj.name}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        subj.type === "Core Theory"
                          ? "navy"
                          : subj.type === "Practical / Lab"
                          ? "teal"
                          : "info"
                      }
                      size="sm"
                    >
                      {subj.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs font-semibold text-[#153B66]">
                      {subj.credits} Credits ({subj.hoursPerWeek} hrs/wk)
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs space-y-0.5">
                      <span className="font-medium text-[#2563EB] block">
                        {subj.courseName || "General"}
                      </span>
                      <span className="text-[11px] text-[#64748B]">
                        Semester {subj.semester}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-xs">
                      <UserCheck className="w-3.5 h-3.5 text-[#16A34A]" />
                      <span className="font-semibold text-[#1E293B]">
                        {subj.allocatedTeacherName || (
                          <span className="text-[#DC2626] font-normal italic">Unallocated</span>
                        )}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right space-x-1.5">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenEditModal(subj)}
                      title="Edit Subject"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-[#2563EB]" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(subj.id, subj.name)}
                      title="Delete Subject"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-[#DC2626]" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filteredSubjects.length === 0 && (
                <TableEmpty colSpan={7} message="No subjects match selected filters." />
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal: Create / Edit Subject */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSubject ? `Edit Subject (${editingSubject.code})` : "Create Academic Subject"}
        description="Define course curriculum subject, weekly load, credits, and teaching assignment."
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
              {editingSubject ? "Update Subject" : "Save Subject"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {formError && (
            <Alert variant="error" title="Validation">
              {formError}
            </Alert>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Input
                label="Subject Title"
                required
                placeholder="e.g. Database Management Systems & SQL Engines"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <Input
              label="Subject Code"
              required
              placeholder="e.g. CS501"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />

            <Select
              label="Subject Category / Type"
              required
              value={type}
              options={subjectTypeOptions}
              onChange={(e) => setType(e.target.value as SubjectType)}
            />

            <Select
              label="Program / Degree Association"
              required
              value={courseId}
              options={courseOptions}
              onChange={(e) => setCourseId(e.target.value)}
            />

            <Select
              label="Administering Department"
              required
              value={departmentId}
              options={deptOptions}
              onChange={(e) => setDepartmentId(e.target.value)}
            />

            <Select
              label="Target Class (Optional)"
              value={classId}
              options={classOptions}
              onChange={(e) => setClassId(e.target.value)}
            />

            <Input
              label="Semester / Term Number"
              type="number"
              required
              value={semester}
              onChange={(e) => setSemester(Number(e.target.value))}
            />

            <Input
              label="Academic Credits"
              type="number"
              required
              value={credits}
              onChange={(e) => setCredits(Number(e.target.value))}
            />

            <Input
              label="Teaching Hours / Week"
              type="number"
              required
              value={hoursPerWeek}
              onChange={(e) => setHoursPerWeek(Number(e.target.value))}
            />

            <div className="sm:col-span-2 pt-2 border-t border-[#F1F5F9]">
              <Input
                label="Designated Faculty / Subject Instructor"
                placeholder="e.g. Prof. Sudha Murthy"
                value={allocatedTeacherName}
                onChange={(e) => setAllocatedTeacherName(e.target.value)}
                leftIcon={<UserCheck className="w-4 h-4" />}
                helperText="Primary instructor responsible for curriculum delivery and continuous grading"
              />
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
