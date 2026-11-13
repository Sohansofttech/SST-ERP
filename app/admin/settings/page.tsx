"use client";

import React, { useState } from "react";
import { useInstitution } from "@/lib/store";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Alert } from "@/components/ui/alert";
import {
  Building2,
  Upload,
  Check,
  RotateCcw,
  Globe,
  Mail,
  Phone,
  Palette,
  ShieldCheck,
  Image as ImageIcon,
} from "lucide-react";

export default function InstitutionSettingsPage() {
  const { profile, updateProfile, resetToDefaults } = useInstitution();
  const [formData, setFormData] = useState(profile);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [logoPreview, setLogoPreview] = useState(profile.logoUrl || "");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setLogoPreview(result);
        setFormData((prev) => ({ ...prev, logoUrl: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setLogoPreview("");
    setFormData((prev) => ({ ...prev, logoUrl: "" }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 4000);
  };

  const institutionTypeOptions = [
    { value: "Engineering & Technology", label: "Engineering & Technology" },
    { value: "University", label: "State / Central / Deemed University" },
    { value: "Arts & Science", label: "Arts & Science College" },
    { value: "Polytechnic / Diploma", label: "Polytechnic / Diploma College" },
    { value: "Medical & Health Sciences", label: "Medical & Allied Health Sciences" },
    { value: "K-12 School", label: "K-12 Higher Secondary School" },
  ];

  const calendarTypeOptions = [
    { value: "Semester", label: "Semester-Based (Odd / Even Terms)" },
    { value: "Annual", label: "Annual / Yearly System" },
    { value: "Trimester", label: "Trimester (3 Terms / Year)" },
  ];

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E2E8F0]">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#1E293B]">
            Institution Settings
          </h1>
          <p className="text-sm text-[#64748B] mt-1">
            Configure institutional metadata, accreditation, contact profiles, and branding.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              if (confirm("Reset all settings and data back to initial default values?")) {
                resetToDefaults();
                window.location.reload();
              }
            }}
            leftIcon={<RotateCcw className="w-4 h-4 text-[#64748B]" />}
          >
            Reset Defaults
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            leftIcon={<Check className="w-4 h-4" />}
          >
            Save Changes
          </Button>
        </div>
      </div>

      {saveSuccess && (
        <Alert variant="success" title="Settings Saved Successfully">
          Institutional profile and branding preferences have been updated and persisted to local state.
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Basic Profile & Logo (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* General Institutional Information */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#2563EB]" />
                <CardTitle>Institutional Identity</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <Input
                    label="Institution Legal Name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    helperText="Official registered title printed on reports and transcripts"
                  />
                </div>

                <Input
                  label="Institution Code / Alias"
                  name="code"
                  required
                  value={formData.code}
                  onChange={handleInputChange}
                  helperText="Unique identifier code (e.g. SST-BLR-01)"
                />

                <Select
                  label="Institution Type"
                  name="type"
                  required
                  value={formData.type}
                  options={institutionTypeOptions}
                  onChange={handleInputChange}
                />

                <Input
                  label="University Affiliation"
                  name="affiliation"
                  value={formData.affiliation}
                  onChange={handleInputChange}
                  placeholder="e.g. VTU, Anna University, CBSE"
                />

                <Input
                  label="Accreditation / Approvals"
                  name="accreditation"
                  value={formData.accreditation}
                  onChange={handleInputChange}
                  placeholder="e.g. NAAC A++, NBA, AICTE"
                />

                <Input
                  label="Established Year"
                  name="establishedYear"
                  type="number"
                  value={formData.establishedYear}
                  onChange={handleInputChange}
                />

                <Select
                  label="Academic Calendar System"
                  name="academicCalendarType"
                  value={formData.academicCalendarType}
                  options={calendarTypeOptions}
                  onChange={handleInputChange}
                />
              </div>
            </CardContent>
          </Card>

          {/* Campus Address & Geography */}
          <Card>
            <CardHeader>
              <CardTitle>Campus Physical Address</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Address Line 1"
                name="addressLine1"
                required
                value={formData.addressLine1}
                onChange={handleInputChange}
                placeholder="Building, Street, Landmark"
              />

              <Input
                label="Address Line 2 (Optional)"
                name="addressLine2"
                value={formData.addressLine2 || ""}
                onChange={handleInputChange}
                placeholder="Area / Campus Extension"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Input
                  label="City"
                  name="city"
                  required
                  value={formData.city}
                  onChange={handleInputChange}
                />

                <Input
                  label="State / Province"
                  name="state"
                  required
                  value={formData.state}
                  onChange={handleInputChange}
                />

                <Input
                  label="Postal Code (PIN)"
                  name="postalCode"
                  required
                  value={formData.postalCode}
                  onChange={handleInputChange}
                />

                <Input
                  label="Country"
                  name="country"
                  required
                  value={formData.country}
                  onChange={handleInputChange}
                />
              </div>
            </CardContent>
          </Card>

          {/* Official Contact Points */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information & Communications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Administrative Email"
                  name="email"
                  type="email"
                  required
                  leftIcon={<Mail className="w-4 h-4" />}
                  value={formData.email}
                  onChange={handleInputChange}
                />

                <Input
                  label="Primary Telephone"
                  name="phone"
                  required
                  leftIcon={<Phone className="w-4 h-4" />}
                  value={formData.phone}
                  onChange={handleInputChange}
                />

                <Input
                  label="Alternate Mobile / Helpline"
                  name="alternatePhone"
                  leftIcon={<Phone className="w-4 h-4" />}
                  value={formData.alternatePhone || ""}
                  onChange={handleInputChange}
                />

                <Input
                  label="Official Website URL"
                  name="website"
                  type="url"
                  leftIcon={<Globe className="w-4 h-4" />}
                  value={formData.website}
                  onChange={handleInputChange}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Branding, Logo & Preview (1 Col) */}
        <div className="space-y-6">
          {/* Logo Interface */}
          <Card>
            <CardHeader>
              <CardTitle>Institutional Crest & Logo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-[#CBD5E1] rounded-2xl bg-[#F8FAFC]">
                {logoPreview ? (
                  <div className="relative group text-center space-y-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={logoPreview}
                      alt="Institution Logo Preview"
                      className="w-28 h-28 object-contain rounded-xl border border-[#E2E8F0] bg-white p-2 shadow-xs mx-auto"
                    />
                    <Button
                      type="button"
                      variant="danger"
                      size="sm"
                      onClick={handleRemoveLogo}
                    >
                      Remove Logo
                    </Button>
                  </div>
                ) : (
                  <div className="text-center space-y-2">
                    <div className="w-16 h-16 rounded-full bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center mx-auto">
                      <ImageIcon className="w-8 h-8" />
                    </div>
                    <div className="text-xs text-[#1E293B] font-semibold">
                      No logo uploaded
                    </div>
                    <p className="text-[11px] text-[#64748B]">
                      PNG, JPG or SVG (Max 1MB recommended)
                    </p>
                  </div>
                )}

                <label className="mt-4 cursor-pointer">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    leftIcon={<Upload className="w-4 h-4" />}
                    onClick={() => document.getElementById("logo-file-input")?.click()}
                  >
                    Browse Image
                  </Button>
                  <input
                    id="logo-file-input"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLogoUpload}
                  />
                </label>
              </div>

              <Input
                label="Or Enter Logo Image URL"
                name="logoUrl"
                placeholder="https://domain.com/logo.png"
                value={formData.logoUrl || ""}
                onChange={(e) => {
                  handleInputChange(e);
                  setLogoPreview(e.target.value);
                }}
                helperText="Direct public image URL"
              />
            </CardContent>
          </Card>

          {/* Design System & Branding Tokens */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-[#14B8A6]" />
                <CardTitle>Design System Tokens</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <label className="text-[13px] font-medium text-[#1E293B] block mb-1">
                    Primary Navy
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#153B66] border border-[#CBD5E1] shadow-xs" />
                    <span className="text-xs font-mono font-semibold text-[#1E293B]">#153B66</span>
                    <span className="text-[11px] text-[#64748B] ml-auto">Fixed Brand Standard</span>
                  </div>
                </div>

                <div>
                  <label className="text-[13px] font-medium text-[#1E293B] block mb-1">
                    Primary Blue
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#2563EB] border border-[#CBD5E1] shadow-xs" />
                    <span className="text-xs font-mono font-semibold text-[#1E293B]">#2563EB</span>
                    <span className="text-[11px] text-[#64748B] ml-auto">Action Standard</span>
                  </div>
                </div>

                <div>
                  <label className="text-[13px] font-medium text-[#1E293B] block mb-1">
                    Secondary Teal
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#14B8A6] border border-[#CBD5E1] shadow-xs" />
                    <span className="text-xs font-mono font-semibold text-[#1E293B]">#14B8A6</span>
                    <span className="text-[11px] text-[#64748B] ml-auto">Accent Standard</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#F1F5F9]">
                  <Input
                    label="Financial Currency Symbol"
                    name="currencySymbol"
                    value={formData.currencySymbol}
                    onChange={handleInputChange}
                    helperText="Default currency symbol for invoices & fees"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <div className="flex items-center gap-2 text-xs text-[#16A34A] font-semibold">
                <ShieldCheck className="w-4 h-4" />
                <span>Compliant with common UI design tokens</span>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </form>
  );
}
