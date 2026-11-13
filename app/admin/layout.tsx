import type { Metadata } from "next";
import { AdminLayout } from "@/components/layout/AdminLayout";

export const metadata: Metadata = {
  title: "Institution Admin Portal — SST ERP",
  description: "Administrative governance, academic setup, and institutional controls for SST ERP",
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayout>{children}</AdminLayout>;
}
