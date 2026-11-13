export type UserRole = "SUPER_ADMIN" | "ADMIN" | "TEACHER" | "STUDENT" | "PARENT";

export interface SessionUser {
  userId: string;
  email: string;
  fullName: string;
  role: UserRole;
  institutionId: string;
  institutionName: string;
  studentId?: string; // Present if role is STUDENT
  guardianId?: string; // Present if role is PARENT
  activeChildId?: string; // Currently active child for PARENT
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface AttendanceSummary {
  overallPercentage: number;
  totalClasses: number;
  attendedClasses: number;
  absentClasses: number;
  lateClasses: number;
  subjectWise: {
    subjectId: string;
    subjectCode: string;
    subjectName: string;
    totalClasses: number;
    attended: number;
    percentage: number;
  }[];
}

export interface TimetableSlotView {
  id: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  roomNumber: string;
  subject: {
    code: string;
    name: string;
    isElective: boolean;
  };
  teacher?: {
    fullName: string;
  };
}

export interface FeeSummary {
  totalFee: number;
  totalPaid: number;
  totalOutstanding: number;
  invoices: {
    id: string;
    invoiceNumber: string;
    title: string;
    dueDate: string;
    totalAmount: number;
    paidAmount: number;
    outstandingAmount: number;
    status: string;
    items: {
      description: string;
      amount: number;
    }[];
  }[];
  recentPayments: {
    id: string;
    amount: number;
    paymentMethod: string;
    transactionRef: string;
    status: string;
    createdAt: string;
    receipt?: {
      receiptNumber: string;
      issuedDate: string;
    };
  }[];
}

