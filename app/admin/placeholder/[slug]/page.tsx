import React, { Suspense } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";
import {
  Compass,
  ArrowLeft,
  Calendar,
  Layers,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

interface PlaceholderDetails {
  title: string;
  category: string;
  description: string;
  features: string[];
  integrations: string[];
}

const moduleDetails: Record<string, PlaceholderDetails> = {
  admissions: {
    title: "Admissions Pipeline",
    category: "Student Lifecycle",
    description: "End-to-end applicant tracking, verification, admission quota management, and enrollment generation.",
    features: ["Online Application Intake", "Document Verification Workflow", "Merit List Generation", "Enrollment & Roll No Allocation"],
    integrations: ["Classes & Cohort Sections", "Fee Schedules & Concessions", "Student Master Directory"],
  },
  students: {
    title: "Students Directory & Records",
    category: "Student Lifecycle",
    description: "Comprehensive 360-degree student record administration, status transitions, and ID cards.",
    features: ["Student Master Directory", "Academic Progress History", "Transfer Certificate (TC) Engine", "Batch Promotions"],
    integrations: ["Academic Years & Terms", "Classes & Sections", "Attendance Registers"],
  },
  guardians: {
    title: "Guardians & Family Contacts",
    category: "Student Lifecycle",
    description: "Parent and guardian contact registry, emergency contacts, sibling linkages, and communication channels.",
    features: ["Guardian Master Records", "Sibling Linkage Detection", "Emergency Contact Dispatch", "Secure Communication Tokens"],
    integrations: ["Student Master Records", "Notice Broadcast", "Attendance Notifications"],
  },
  staff: {
    title: "Staff & Faculty Administration",
    category: "Institutional Governance",
    description: "Institutional faculty governance, designation hierarchy, departmental allocations, and workload balancing.",
    features: ["Faculty & Staff Master Directory", "Department Allocations", "Teaching Workload Tracker", "Credential Management"],
    integrations: ["Departments & Subjects", "Roles & Permissions (RBAC)", "Class Mentorship"],
  },
  timetable: {
    title: "Timetable & Scheduling",
    category: "Academic Operations",
    description: "Class timetable generation, teacher period allocation, classroom optimization, and substitution management.",
    features: ["Weekly Master Timetable Grid", "Teacher Workload & Conflict Resolver", "Room Allocation Engine", "Daily Substitution Dispatch"],
    integrations: ["Classes, Sections & Subjects", "Faculty Directory", "Academic Calendar"],
  },
  attendance: {
    title: "Attendance Management",
    category: "Academic Operations",
    description: "Daily and period-wise student attendance registers, biometric integration, and automated absence alerts.",
    features: ["Daily Session & Period Registers", "Biometric Sync Interface", "Low Attendance Defaulter Alerts", "Leave Application Workflow"],
    integrations: ["Students & Cohort Sections", "Notice & SMS Alerts", "Academic Terms"],
  },
  examinations: {
    title: "Examinations Management",
    category: "Examinations & Grading",
    description: "Examination session planning, hall ticket generation, exam venue seating charts, and exam invigilator assignments.",
    features: ["Exam Schedule & Timetable Master", "Automated Hall Ticket Generator", "Seating Arrangement Allocator", "Question Paper Distribution Vault"],
    integrations: ["Courses & Subjects", "Student Directory", "Academic Calendar"],
  },
  "internal-assessments": {
    title: "Internal Assessments & Grading",
    category: "Examinations & Grading",
    description: "Continuous internal assessment (CIA) rubrics, teacher marks entry approval, and GPA/marks calculations.",
    features: ["Rubrics & Assessment Configurations", "Faculty Marks Entry & Moderation", "Grace Marks & Committee Review", "Semester Grade Computations"],
    integrations: ["Subjects Catalog", "Faculty Allocation", "Class Batches"],
  },
  promotions: {
    title: "Student Promotions",
    category: "Student Lifecycle",
    description: "Year-end batch promotion criteria, carry-forward backlogs, detentions, and academic year progression.",
    features: ["Promotion Eligibility Checker", "Batch Promotion Execution", "Detention & Carryover Management", "Section Re-allocation"],
    integrations: ["Academic Years & Classes", "Examination Results", "Student Directory"],
  },
  certificates: {
    title: "Certificates Issuance",
    category: "Institutional Records",
    description: "Automated generation of Transfer Certificates (TC), Study/Conduct Certificates, and Bonafide certificates with QR verification.",
    features: ["Certificate Template Designer", "Sequential Serial Number Allocator", "PDF Generation with Signed QR", "Certificate Vault & Revocation"],
    integrations: ["Student Master Records", "Fee Clearance Verification", "Institution Branding & Signatures"],
  },
  "fees-finance": {
    title: "Fees & Finance Management",
    category: "Campus Services & Finance",
    description: "Fee structures, installment scheduling, cashier counter collections, cash denomination closures, and dues aging.",
    features: ["Fee Category & Component Builder", "Cashier Counter (Denomination Breakdown)", "Daily Register Closure & Variance", "Thermal 80mm & A4 Receipts", "Dues Aging Dashboard (0-90+ Days)"],
    integrations: ["Classes & Student Cohorts", "Bank Account & Payment Gateways", "Concession Approvals"],
  },
  hostel: {
    title: "Hostel & Residential Facilities",
    category: "Campus Services & Finance",
    description: "Hostel building management, room bed allocations, warden assignments, and mess fee billing.",
    features: ["Hostel Blocks & Room Bed Matrix", "Student Check-in / Room Allocation", "Warden Registry & Night Roll Call", "Mess Billing Integration"],
    integrations: ["Student Directory", "Fee Structures", "Gate Management"],
  },
  transport: {
    title: "Transport & Fleet Management",
    category: "Campus Services & Finance",
    description: "Bus routes, stops, vehicle tracking, driver profiles, and student transport fee allocations.",
    features: ["Bus Route & Pickup Stop Builder", "Vehicle & Driver Compliance Tracker", "Student Route Allocation", "Transport Pass Issuance"],
    integrations: ["Student Directory", "Fee Structures", "Emergency Communications"],
  },
  "events-resources": {
    title: "Events & Campus Resources",
    category: "Campus Operations",
    description: "Institutional calendar, event approvals, auditorium/lab reservations, and inventory management.",
    features: ["Institutional Master Calendar", "Resource Booking & Conflict Checker", "Event Budgeting & Approval", "Lab Equipment Inventory"],
    integrations: ["Departments", "Academic Calendar", "Campus Facilities"],
  },
  "gate-management": {
    title: "Gate Management & Campus Security",
    category: "Campus Operations",
    description: "Visitor management, student out-passes, staff vehicle entry logs, and physical campus security tracking.",
    features: ["Visitor Gate Pass Printing", "Student Out-Pass Workflow with Parent Consent", "Vehicle Entry Sticker Registry", "Security Incident Logging"],
    integrations: ["Guardians & Students", "Staff Directory", "Security Personnel Roles"],
  },
  communication: {
    title: "Communication & Notice Broadcast",
    category: "Institutional Communication",
    description: "Institutional circulars, SMS/email announcements, targeted student/faculty notices, and emergency broadcasts.",
    features: ["Circular & Bulletin Board Composer", "SMS / Communication Gateway Dispatcher", "Audience Targeting (By Class/Dept)", "Delivery Outbox & Read Receipts"],
    integrations: ["Student & Staff Directory", "Emergency Contacts", "Notice Boards"],
  },
  approvals: {
    title: "Approvals & Administrative Workflows",
    category: "Institutional Governance",
    description: "Centralized approval desk for fee concessions, student leaves, staff leaves, budget requests, and certificate requests.",
    features: ["Unified Approval Inbox", "Multi-Tier Approval Hierarchy", "Digital Signature / Approval Timestamps", "Approval Delegation during Absence"],
    integrations: ["Roles & Permissions", "Fee Concessions", "Leave Registers"],
  },
  "audit-logs": {
    title: "Audit Logs & Security Trail",
    category: "Security & Governance",
    description: "Immutable, searchable record of all administrative actions, financial mutations, access grants, and security events.",
    features: ["Chronological Audit Event Stream", "IP, User, & Action Filters", "Export to CSV/Compliance PDF", "Privilege Escalation & Security Alerts"],
    integrations: ["All Administrative Operations", "RBAC Permissions", "Institutional Security"],
  },
};

export function generateStaticParams() {
  return Object.keys(moduleDetails).map((slug) => ({ slug }));
}

async function PlaceholderContent({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const details = moduleDetails[slug] || {
    title: slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    category: "Enterprise Module",
    description: "This institutional module is scheduled for upcoming deployment in SST ERP.",
    features: ["Module Scaffolding", "Functional Interfaces", "Shared System Integration"],
    integrations: ["Academic Setup", "Institutional Administration"],
  };

  return (
    <div className="space-y-6">
      {/* Navigation Breadcrumb / Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E2E8F0]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/admin"
              className="text-xs font-semibold text-[#2563EB] hover:underline flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Dashboard
            </Link>
            <span className="text-[#CBD5E1]">/</span>
            <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">
              {details.category}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-[#1E293B]">{details.title}</h2>
            <Badge variant="teal" size="md">
              Coming Soon
            </Badge>
            <Badge variant="navy" size="md">
              {details.category}
            </Badge>
          </div>
        </div>
        <Link href="/admin">
          <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Back to Dashboard
          </Button>
        </Link>
      </div>

      {/* Live Module Banner if available */}
      {slug === "attendance" && (
        <Alert
          variant="success"
          title="Attendance Management Module is Active"
          icon={<CheckCircle2 className="w-5 h-5 text-[#16A34A]" />}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-1">
            <span className="text-sm">The complete Attendance Management module is now fully deployed and operational.</span>
            <Link href="/admin/attendance">
              <Button size="sm" variant="primary">
                Open Attendance Management
              </Button>
            </Link>
          </div>
        </Alert>
      )}

      {slug === "examinations" && (
        <Alert
          variant="success"
          title="Examination Management Module is Active"
          icon={<CheckCircle2 className="w-5 h-5 text-[#16A34A]" />}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-1">
            <span className="text-sm">The complete Examination Management module (Cycles, Timetable Scheduling, Halls, Invigilators, and Eligibility) is fully deployed and operational.</span>
            <Link href="/admin/examinations">
              <Button size="sm" variant="primary">
                Open Examination Management
              </Button>
            </Link>
          </div>
        </Alert>
      )}

      {slug === "internal-assessments" && (
        <Alert
          variant="success"
          title="Internal Assessment (IA) Management Module is Active"
          icon={<CheckCircle2 className="w-5 h-5 text-[#16A34A]" />}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-1">
            <span className="text-sm">The Phase 4A Internal Assessment (IA) Management module (Assessments, Multi-Component Rubrics, Weightage Validation, Academic Mapping, and Lifecycle Status) is fully deployed and operational.</span>
            <Link href="/admin/ia">
              <Button size="sm" variant="primary">
                Open Internal Assessment Management
              </Button>
            </Link>
          </div>
        </Alert>
      )}

      {/* Informative Status Banner */}
      <Alert
        variant="info"
        title="Module Status: Scheduled for Upcoming Release"
        icon={<Compass className="w-5 h-5 text-[#2563EB]" />}
      >
        This module is part of the extended SST ERP institutional suite. The foundational academic architecture (Academic Years, Courses, Departments, Classes, Sections, Subjects, and Roles & Permissions) is currently active and can be configured below.
      </Alert>

      {/* Specifications Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-2 text-[#153B66] font-semibold text-base">
              <Calendar className="w-5 h-5 text-[#2563EB]" />
              <h4>Planned Capabilities & Scope</h4>
            </div>
            <p className="text-sm text-[#64748B] leading-relaxed">
              {details.description}
            </p>

            <div className="pt-2">
              <h5 className="text-xs font-bold text-[#1E293B] uppercase tracking-wider mb-2">
                Planned Features:
              </h5>
              <ul className="space-y-2">
                {details.features.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-[#1E293B]">
                    <CheckCircle2 className="w-4 h-4 text-[#14B8A6] shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-2 text-[#153B66] font-semibold text-base">
              <Layers className="w-5 h-5 text-[#2563EB]" />
              <h4>Active System Integrations</h4>
            </div>
            <p className="text-sm text-[#64748B] leading-relaxed">
              Upon enablement, this module connects seamlessly with current institutional entities:
            </p>

            <ul className="space-y-2.5 pt-1">
              {details.integrations.map((point, idx) => (
                <li
                  key={idx}
                  className="p-2.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-xs font-medium text-[#1E293B] flex items-center justify-between"
                >
                  <span>{point}</span>
                  <Badge variant="teal" size="sm">
                    Integrated Architecture
                  </Badge>
                </li>
              ))}
            </ul>

            <div className="p-3 rounded-lg bg-[#EFF6FF] border border-[#BFDBFE] text-xs text-[#1E3A8A] flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" />
              <span>
                Tenant isolation and role authorization boundaries are maintained across all institutional modules.
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Active Modules Quick Access Bar */}
      <Card>
        <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#F8FAFC]">
          <div>
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#14B8A6]" />
              <h4 className="text-sm font-bold text-[#1E293B]">
                Explore Active Administration Modules
              </h4>
            </div>
            <p className="text-xs text-[#64748B] mt-0.5">
              Access the core academic and governance configuration screens available now:
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link href="/admin/settings">
              <Button variant="outline" size="sm">
                Institution Settings
              </Button>
            </Link>
            <Link href="/admin/academics/academic-years">
              <Button variant="outline" size="sm">
                Academic Years
              </Button>
            </Link>
            <Link href="/admin/academics/courses">
              <Button variant="outline" size="sm">
                Courses
              </Button>
            </Link>
            <Link href="/admin/academics/departments">
              <Button variant="outline" size="sm">
                Departments
              </Button>
            </Link>
            <Link href="/admin/academics/classes">
              <Button variant="outline" size="sm">
                Classes & Sections
              </Button>
            </Link>
            <Link href="/admin/academics/subjects">
              <Button variant="outline" size="sm">
                Subjects
              </Button>
            </Link>
            <Link href="/admin/roles-permissions">
              <Button variant="accent" size="sm">
                Roles & Permissions
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}

function PlaceholderLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-10 bg-slate-200 rounded-lg w-1/3" />
      <div className="h-20 bg-slate-100 rounded-xl" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="h-64 bg-slate-100 rounded-xl" />
        <div className="h-64 bg-slate-100 rounded-xl" />
      </div>
      <div className="h-24 bg-slate-100 rounded-xl" />
    </div>
  );
}

export default function PlaceholderPage({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <Suspense fallback={<PlaceholderLoading />}>
      <PlaceholderContent params={params} />
    </Suspense>
  );
}
