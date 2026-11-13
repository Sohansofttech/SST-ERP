"use client";

import React, { useState } from "react";
import { useInstitution } from "@/lib/store";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Alert } from "@/components/ui/alert";
import {
  ShieldAlert,
  Plus,
  Users,
  CheckSquare,
  Square,
  Shield,
} from "lucide-react";

export default function RolesPermissionsPage() {
  const { roles, permissionCategories, updateRolePermissions, addRole } = useInstitution();

  const [selectedRoleId, setSelectedRoleId] = useState<string>(roles[0]?.id || "");
  const [isNewRoleModalOpen, setIsNewRoleModalOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleCode, setNewRoleCode] = useState("");
  const [newRoleDesc, setNewRoleDesc] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  const selectedRole = roles.find((r) => r.id === selectedRoleId) || roles[0];

  const handleTogglePermission = (permissionId: string) => {
    if (!selectedRole) return;
    const currentPermissions = selectedRole.permissions;
    const updated = currentPermissions.includes(permissionId)
      ? currentPermissions.filter((p) => p !== permissionId)
      : [...currentPermissions, permissionId];

    updateRolePermissions(selectedRole.id, updated);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleToggleCategory = (categoryPermissions: { id: string }[]) => {
    if (!selectedRole) return;
    const catIds = categoryPermissions.map((p) => p.id);
    const allSelected = catIds.every((id) => selectedRole.permissions.includes(id));

    let updated: string[];
    if (allSelected) {
      updated = selectedRole.permissions.filter((p) => !catIds.includes(p));
    } else {
      updated = Array.from(new Set([...selectedRole.permissions, ...catIds]));
    }

    updateRolePermissions(selectedRole.id, updated);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleCreateRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim() || !newRoleCode.trim()) return;

    addRole({
      name: newRoleName,
      code: newRoleCode.toUpperCase(),
      description: newRoleDesc,
      permissions: [],
    });

    setIsNewRoleModalOpen(false);
    setNewRoleName("");
    setNewRoleCode("");
    setNewRoleDesc("");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E2E8F0]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">
              Governance & Security
            </span>
            <span className="text-[#CBD5E1]">•</span>
            <span className="text-xs font-bold text-[#14B8A6] uppercase tracking-wider">
              Access Control
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#1E293B]">
            Roles & Permissions (RBAC)
          </h1>
          <p className="text-sm text-[#64748B] mt-1">
            Configure institutional security roles, granular permission matrices, and departmental access grants.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsNewRoleModalOpen(true)}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Create Custom Role
        </Button>
      </div>

      {/* Security Governance Callout */}
      <Alert
        variant="info"
        title="Role-Based Access Control (RBAC) Governance"
        icon={<ShieldAlert className="w-5 h-5 text-[#2563EB]" />}
      >
        <p className="text-xs leading-relaxed text-[#1E293B]">
          Institutional roles establish granular permission boundaries across academic management, student operations, and administrative functions. Updates made to role permissions take effect across assigned staff and faculty members upon their next active session.
        </p>
      </Alert>

      {saveSuccess && (
        <Alert variant="success" title="Permission Grant Updated">
          Role permissions for <strong>{selectedRole.name}</strong> were updated and persisted.
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Roles Selector (4 Cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-bold text-[#1E293B] uppercase tracking-wider">
              Security Roles ({roles.length})
            </h3>
            <span className="text-xs text-[#64748B]">Select to edit</span>
          </div>

          <div className="space-y-2">
            {roles.map((role) => {
              const isSelected = role.id === selectedRole?.id;
              return (
                <div
                  key={role.id}
                  onClick={() => setSelectedRoleId(role.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#153B66] text-white border-[#153B66] shadow-md ring-2 ring-[#2563EB]/40"
                      : "bg-white text-[#1E293B] border-[#E2E8F0] hover:border-[#2563EB]/40 hover:bg-[#F8FAFC]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm">{role.name}</span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                        isSelected ? "bg-white/20 text-white" : "bg-[#F1F5F9] text-[#64748B]"
                      }`}
                    >
                      {role.code}
                    </span>
                  </div>

                  <p
                    className={`text-xs mt-1 line-clamp-2 ${
                      isSelected ? "text-[#E2E8F0]" : "text-[#64748B]"
                    }`}
                  >
                    {role.description}
                  </p>

                  <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-current/10">
                    <span className="flex items-center gap-1 font-medium">
                      <Users className="w-3.5 h-3.5" />
                      {role.userCount} Assigned Staff
                    </span>
                    <span className="font-semibold">
                      {role.permissions.length} Grants
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Permission Categories Matrix (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          <Card>
            <CardHeader className="bg-[#F8FAFC]">
              <div className="flex items-center justify-between w-full">
                <div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-[#2563EB]" />
                    <CardTitle>Permissions Granted to {selectedRole.name}</CardTitle>
                  </div>
                  <p className="text-xs text-[#64748B] mt-0.5">
                    {selectedRole.permissions.length} total permissions enabled for this role
                  </p>
                </div>
                <Badge variant={selectedRole.isSystemRole ? "navy" : "teal"} size="md">
                  {selectedRole.isSystemRole ? "System Built-In Role" : "Custom User Role"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {permissionCategories.map((cat) => {
                const catIds = cat.permissions.map((p) => p.id);
                const selectedCount = catIds.filter((id) =>
                  selectedRole.permissions.includes(id)
                ).length;
                const allSelected = selectedCount === catIds.length;

                return (
                  <div
                    key={cat.id}
                    className="p-4 rounded-xl border border-[#E2E8F0] bg-white space-y-3"
                  >
                    <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-2">
                      <div>
                        <h4 className="text-sm font-bold text-[#153B66]">{cat.name}</h4>
                        <p className="text-xs text-[#64748B]">{cat.description}</p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleCategory(cat.permissions)}
                        className="text-xs text-[#2563EB]"
                      >
                        {allSelected ? "Deselect All" : "Select Category"}
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
                      {cat.permissions.map((perm) => {
                        const isGranted = selectedRole.permissions.includes(perm.id);
                        return (
                          <div
                            key={perm.id}
                            onClick={() => handleTogglePermission(perm.id)}
                            className={`p-2.5 rounded-lg border transition-all cursor-pointer flex items-start gap-2.5 ${
                              isGranted
                                ? "bg-[#EFF6FF] border-[#BFDBFE] text-[#1E40AF]"
                                : "bg-[#F8FAFC] border-[#E2E8F0] text-[#64748B] hover:bg-[#F1F5F9]"
                            }`}
                          >
                            <div className="mt-0.5">
                              {isGranted ? (
                                <CheckSquare className="w-4 h-4 text-[#2563EB] shrink-0" />
                              ) : (
                                <Square className="w-4 h-4 text-[#CBD5E1] shrink-0" />
                              )}
                            </div>
                            <div className="space-y-0.5 text-xs">
                              <span className="font-bold text-[#1E293B] block">
                                {perm.name}
                              </span>
                              <span className="text-[11px] leading-tight block text-[#64748B]">
                                {perm.description}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal: Create Custom Role */}
      <Modal
        isOpen={isNewRoleModalOpen}
        onClose={() => setIsNewRoleModalOpen(false)}
        title="Create Custom Security Role"
        description="Define a new role with a specific permission ceiling."
        maxWidth="md"
        footer={
          <>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsNewRoleModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="button" variant="primary" size="sm" onClick={handleCreateRole}>
              Create Role
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Role Display Name"
            required
            placeholder="e.g. Lab Superintendent, Assistant Registrar"
            value={newRoleName}
            onChange={(e) => setNewRoleName(e.target.value)}
          />

          <Input
            label="Role Unique Identifier Code"
            required
            placeholder="e.g. ROLE_LAB_SUPER"
            value={newRoleCode}
            onChange={(e) => setNewRoleCode(e.target.value)}
            helperText="Prefixed with ROLE_ in uppercase"
          />

          <div>
            <label className="block text-[13px] font-medium text-[#1E293B] mb-1">
              Role Purpose / Description
            </label>
            <textarea
              rows={3}
              value={newRoleDesc}
              onChange={(e) => setNewRoleDesc(e.target.value)}
              placeholder="Scope of authority, assigned duties, and security boundaries"
              className="w-full rounded-lg border border-[#CBD5E1] p-2.5 text-xs text-[#1E293B] focus:border-[#2563EB] focus:outline-none"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
