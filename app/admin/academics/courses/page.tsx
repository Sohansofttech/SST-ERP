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
  BookOpen,
  Plus,
  Edit2,
  Trash2,
  Building,
} from "lucide-react";
import { Course, DegreeType } from "@/types/institution";

export default function CoursesPage() {
  const { courses, departments, addCourse, updateCourse, deleteCourse } = useInstitution();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [degreeType, setDegreeType] = useState<DegreeType>("Undergraduate");
  const [departmentId, setDepartmentId] = useState("");
  const [durationYears, setDurationYears] = useState(4);
  const [totalSemesters, setTotalSemesters] = useState(8);
  const [totalCredits, setTotalCredits] = useState(160);
  const [description, setDescription] = useState("");
  const [formError, setFormError] = useState("");

  const handleOpenAddModal = () => {
    setEditingCourse(null);
    setName("");
    setCode("");
    setDegreeType("Undergraduate");
    setDepartmentId(departments[0]?.id || "");
    setDurationYears(4);
    setTotalSemesters(8);
    setTotalCredits(160);
    setDescription("");
    setFormError("");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (course: Course) => {
    setEditingCourse(course);
    setName(course.name);
    setCode(course.code);
    setDegreeType(course.degreeType);
    setDepartmentId(course.departmentId);
    setDurationYears(course.durationYears);
    setTotalSemesters(course.totalSemesters);
    setTotalCredits(course.totalCredits);
    setDescription(course.description || "");
    setFormError("");
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!name.trim() || !code.trim()) {
      setFormError("Program title and course code are required.");
      return;
    }
    if (!departmentId) {
      setFormError("Department association is mandatory.");
      return;
    }
    if (durationYears <= 0 || totalSemesters <= 0) {
      setFormError("Duration and semesters must be positive numbers.");
      return;
    }

    if (editingCourse) {
      updateCourse(editingCourse.id, {
        name,
        code: code.toUpperCase(),
        degreeType,
        departmentId,
        durationYears: Number(durationYears),
        totalSemesters: Number(totalSemesters),
        totalCredits: Number(totalCredits),
        description,
      });
    } else {
      addCourse({
        name,
        code: code.toUpperCase(),
        degreeType,
        departmentId,
        durationYears: Number(durationYears),
        totalSemesters: Number(totalSemesters),
        totalCredits: Number(totalCredits),
        status: "Active",
        description,
      });
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string, courseName: string) => {
    if (confirm(`Are you sure you want to delete course "${courseName}"?`)) {
      deleteCourse(id);
    }
  };

  const departmentOptions = departments.map((d) => ({
    value: d.id,
    label: `${d.name} (${d.code})`,
  }));

  const degreeOptions = [
    { value: "Undergraduate", label: "Undergraduate (UG / Bachelor)" },
    { value: "Postgraduate", label: "Postgraduate (PG / Master)" },
    { value: "Diploma", label: "Diploma / Polytechnic" },
    { value: "Doctoral", label: "Doctoral (Ph.D. / Research)" },
    { value: "Certificate", label: "Certificate / Skill Program" },
  ];

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
            <Badge variant="teal" size="sm">
              Programs & Degrees
            </Badge>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#1E293B]">
            Courses & Programs Management
          </h1>
          <p className="text-sm text-[#64748B] mt-1">
            Define academic degrees, program codes, department associations, duration, and credit rules.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={handleOpenAddModal}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Create Course
        </Button>
      </div>

      {/* Quick Overview Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 bg-white">
          <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">
            Total Degree Programs
          </span>
          <h4 className="text-2xl font-bold text-[#153B66] mt-1">{courses.length}</h4>
          <span className="text-[11px] text-[#16A34A] font-medium">All active and approved</span>
        </Card>
        <Card className="p-4 bg-white">
          <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">
            Undergraduate Programs
          </span>
          <h4 className="text-2xl font-bold text-[#2563EB] mt-1">
            {courses.filter((c) => c.degreeType === "Undergraduate").length}
          </h4>
          <span className="text-[11px] text-[#64748B]">B.Tech / Bachelor streams</span>
        </Card>
        <Card className="p-4 bg-white">
          <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">
            Postgraduate Programs
          </span>
          <h4 className="text-2xl font-bold text-[#14B8A6] mt-1">
            {courses.filter((c) => c.degreeType === "Postgraduate").length}
          </h4>
          <span className="text-[11px] text-[#64748B]">M.Tech / MBA streams</span>
        </Card>
      </div>

      {/* Courses Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#2563EB]" />
              <CardTitle>Configured Academic Programs</CardTitle>
            </div>
            <span className="text-xs text-[#64748B]">
              Showing {courses.length} Courses
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Program Title</TableHead>
                <TableHead>Degree Level</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Duration & Sems</TableHead>
                <TableHead>Total Credits</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses.map((course) => (
                <TableRow key={course.id}>
                  <TableCell>
                    <span className="font-mono text-xs font-bold bg-[#153B66] text-white px-2 py-1 rounded">
                      {course.code}
                    </span>
                  </TableCell>
                  <TableCell className="font-semibold text-[#1E293B]">
                    {course.name}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        course.degreeType === "Undergraduate"
                          ? "navy"
                          : course.degreeType === "Postgraduate"
                          ? "teal"
                          : "info"
                      }
                      size="sm"
                    >
                      {course.degreeType}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
                      <Building className="w-3.5 h-3.5 text-[#2563EB]" />
                      <span>{course.departmentName || "General"}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs font-medium text-[#1E293B]">
                      {course.durationYears} Years • {course.totalSemesters} Semesters
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs font-bold text-[#153B66]">
                      {course.totalCredits} Credits
                    </span>
                  </TableCell>
                  <TableCell className="text-right space-x-1.5">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenEditModal(course)}
                      title="Edit Course"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-[#2563EB]" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(course.id, course.name)}
                      title="Delete Course"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-[#DC2626]" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {courses.length === 0 && (
                <TableEmpty colSpan={7} message="No courses or programs configured yet." />
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal: Create / Edit Course */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCourse ? `Edit Course (${editingCourse.code})` : "Create Academic Course"}
        description="Define course title, code, department association, and duration."
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
              {editingCourse ? "Update Course" : "Save Course"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {formError && (
            <Alert variant="error" title="Input Validation Error">
              {formError}
            </Alert>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Input
                label="Course / Program Full Title"
                required
                placeholder="e.g. Bachelor of Technology in Computer Science & Engineering"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <Input
              label="Course Code / Prefix"
              required
              placeholder="e.g. BTECH-CSE"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              helperText="Unique uppercase identifier"
            />

            <Select
              label="Degree Level / Type"
              required
              value={degreeType}
              options={degreeOptions}
              onChange={(e) => setDegreeType(e.target.value as DegreeType)}
            />

            <div className="sm:col-span-2">
              <Select
                label="Associated Department"
                required
                value={departmentId}
                options={departmentOptions}
                onChange={(e) => setDepartmentId(e.target.value)}
                helperText="Primary academic department administering this curriculum"
              />
            </div>

            <Input
              label="Program Duration (Years)"
              type="number"
              required
              value={durationYears}
              onChange={(e) => setDurationYears(Number(e.target.value))}
            />

            <Input
              label="Total Semesters / Terms"
              type="number"
              required
              value={totalSemesters}
              onChange={(e) => setTotalSemesters(Number(e.target.value))}
            />

            <Input
              label="Total Graduation Credits"
              type="number"
              required
              value={totalCredits}
              onChange={(e) => setTotalCredits(Number(e.target.value))}
            />

            <div className="sm:col-span-2">
              <label className="block text-[13px] font-medium text-[#1E293B] mb-1">
                Program Description (Optional)
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Summary of course objectives, career prospects, and industry accreditation"
                className="w-full rounded-lg border border-[#CBD5E1] p-2.5 text-xs text-[#1E293B] focus:border-[#2563EB] focus:outline-none"
              />
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
