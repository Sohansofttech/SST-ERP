import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Institutional ERP — Student & Parent Portal",
  description: "Next.js Institutional ERP Student and Parent Portal with Multi-Tenant Architecture",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={cn("h-full", "antialiased", "font-sans", inter.variable)}>
      <body className="min-h-full flex flex-col bg-[#F8FAFC] text-[#1E293B]">
        {children}
      </body>
    </html>
  );
}
