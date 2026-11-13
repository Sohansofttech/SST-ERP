"use client";

import React, { useState } from "react";
import { useInstitution } from "@/lib/store";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Alert } from "@/components/ui/alert";
import {
  Plus,
  Edit2,
  Trash2,
  Mail,
  Phone,
  UserCheck,
} from "lucide-react";
import { Department } from "@/types/institution";

export default function DepartmentsPage() {
  const { departments, addDepartment, updateDepartment, deleteDepartment, courses } =
    useInstitution();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);

  // Form State
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [headOfDepartment, setHeadOfDepartment] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [facultyCount, setFacultyCount] = useState(25);
  const [studentCapacity, setStudentCapacity] = useState(360);
  const [description, setDescription] = useState("");
  const [formError, setFormError] = useState("");

  const handleOpenAddModal = () => {
    setEditingDept(null);
    setCode("");
    setName("");
    setHeadOfDepartment("");
    setEmail("");
    setPhone("+91 80 ");
    setFacultyCount(20);
    setStudentCapacity(300);
    setDescription("");
    setFormError("");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (dept: Department) => {
    setEditingDept(dept);
    setCode(dept.code);
    setName(dept.name);
    setHeadOfDepartment(dept.headOfDepartment);
    setEmail(dept.email);
    setPhone(dept.phone);
    setFacultyCount(dept.facultyCount);
    setStudentCapacity(dept.studentCapacity);
    setDescription(dept.description || "");
    setFormError("");
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!code.trim() || !name.trim()) {
      setFormError("Department code and name are required.");
      return;
    }
    if (!headOfDepartment.trim()) {
      setFormError("Head of Department (HOD) is required.");
      return;
    }

    if (editingDept) {
      updateDepartment(editingDept.id, {
        code: code.toUpperCase(),
        name,
        headOfDepartment,
        email,
        phone,
        facultyCount: Number(facultyCount),
        studentCapacity: Number(studentCapacity),
        description,
      });
    } else {
      addDepartment({
        code: code.toUpperCase(),
        name,
        headOfDepartment,
        email,
        phone,
        facultyCount: Number(facultyCount),
        studentCapacity: Number(studentCapacity),
        description,
      });
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string, deptName: string) => {
    const linkedCourses = courses.filter((c) => c.departmentId === id);
    if (linkedCourses.length > 0) {
      alert(
        `Cannot delete department "${deptName}" because it is currently linked to ${linkedCourses.length} active courses.`
      );
      return;
    }
    if (confirm(`Are you sure you want to delete department "${deptName}"?`)) {
      deleteDepartment(id);
    }
  };

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
              Academic Units
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#1E293B]">
            Department Management
          </h1>
          <p className="text-sm text-[#64748B] mt-1">
            Configure academic branches, designated Heads of Department (HOD), faculty allocations, and contact channels.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={handleOpenAddModal}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Create Department
        </Button>
      </div>

      {/* Departments Cards Grid Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {departments.map((dept) => {
          const linkedCourses = courses.filter((c) => c.departmentId === dept.id);
          return (
            <Card key={dept.id} className="border-t-4 border-t-[#153B66]">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between w-full">
                  <span className="font-mono text-xs font-bold bg-[#153B66] text-white px-2 py-0.5 rounded">
                    {dept.code}
                  </span>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenEditModal(dept)}
                      title="Edit Department"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-[#2563EB]" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(dept.id, dept.name)}
                      title="Delete Department"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-[#DC2626]" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                <h3 className="text-base font-bold text-[#1E293B] leading-tight">
                  {dept.name}
                </h3>

                <div className="p-2.5 rounded-lg bg-[#F8FAFC] border border-[#F1F5F9] space-y-1.5 text-xs">
                  <div className="flex items-center gap-2 text-[#1E293B]">
                    <UserCheck className="w-4 h-4 text-[#2563EB] shrink-0" />
                    <span className="font-semibold">{dept.headOfDepartment}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#64748B]">
                    <Mail className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{dept.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#64748B]">
                    <Phone className="w-3.5 h-3.5 shrink-0" />
                    <span>{dept.phone}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-[#F1F5F9]">
                  <span className="text-[#64748B]">Faculty: <strong className="text-[#1E293B]">{dept.facultyCount}</strong></span>
                  <span className="text-[#64748B]">Capacity: <strong className="text-[#153B66]">{dept.studentCapacity}</strong></span>
                  <span className="font-semibold text-[#2563EB]">{linkedCourses.length} Programs</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Modal: Create / Edit Department */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingDept ? `Edit Department (${editingDept.code})` : "Create New Department"}
        description="Configure department identifier, HOD, and contact credentials."
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
              {editingDept ? "Update Department" : "Save Department"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {formError && (
            <Alert variant="error" title="Input Validation">
              {formError}
            </Alert>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Department Code"
              required
              placeholder="e.g. CSE, ECE, ME"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />

            <Input
              label="Department Title / Full Name"
              required
              placeholder="e.g. Computer Science & Engineering"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <div className="sm:col-span-2">
              <Input
                label="Head of Department (HOD)"
                required
                placeholder="e.g. Dr. Rameshwar Sharma, Ph.D."
                value={headOfDepartment}
                onChange={(e) => setHeadOfDepartment(e.target.value)}
                leftIcon={<UserCheck className="w-4 h-4" />}
              />
            </div>

            <Input
              label="Official Department Email"
              type="email"
              required
              placeholder="hod.cse@sohansoft.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="w-4 h-4" />}
            />

            <Input
              label="Department Contact Phone"
              required
              placeholder="+91 80 2845 7100"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              leftIcon={<Phone className="w-4 h-4" />}
            />

            <Input
              label="Sanctioned Faculty Count"
              type="number"
              value={facultyCount}
              onChange={(e) => setFacultyCount(Number(e.target.value))}
            />

            <Input
              label="Annual Student Capacity"
              type="number"
              value={studentCapacity}
              onChange={(e) => setStudentCapacity(Number(e.target.value))}
            />

            <div className="sm:col-span-2">
              <label className="block text-[13px] font-medium text-[#1E293B] mb-1">
                Department Overview & Research Focus
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Summary of research laboratories, specialization areas, and objectives"
                className="w-full rounded-lg border border-[#CBD5E1] p-2.5 text-xs text-[#1E293B] focus:border-[#2563EB] focus:outline-none"
              />
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
