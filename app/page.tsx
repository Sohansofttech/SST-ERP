import Image from "next/image";
import Link from "next/link";
import { Building2, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-16 px-8 sm:px-16 bg-white dark:bg-black sm:items-start space-y-10">
        <div className="flex items-center justify-between w-full">
          <Image
            className="dark:invert h-5 w-[100px]"
            src="/next.svg"
            alt="Next.js logo"
            width={100}
            height={20}
            priority
          />
          <span className="text-xs font-mono font-bold text-[#14B8A6] bg-[#CCFBF1] px-2.5 py-1 rounded-full border border-[#99F6E4]">
            SST ERP Multi-Portal
          </span>
        </div>

        {/* Institution Admin Portal Launcher Card (Non-Destructive) */}
        <div className="w-full p-6 rounded-2xl bg-gradient-to-r from-[#153B66] to-[#1E4D82] text-white shadow-xl space-y-4 border border-[#1E4D82]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-[#2563EB] flex items-center justify-center text-white font-bold shadow-xs">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] uppercase tracking-wider font-bold text-[#14B8A6] flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> Institution Governance
                </span>
                <h2 className="text-xl font-bold text-white">
                  Institution Admin Portal
                </h2>
              </div>
            </div>
            <span className="text-xs font-bold bg-[#14B8A6] text-white px-2.5 py-0.5 rounded-full">
              Active Portal
            </span>
          </div>

          <p className="text-xs text-[#E2E8F0] leading-relaxed">
            Administrative governance dashboard, institution settings, academic cycles & terms, degree courses, departments, classes & sections, curriculum subjects, and RBAC security matrix.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-white/10">
            <div className="flex items-center gap-1 text-[11px] text-[#93C5FD]">
              <ShieldCheck className="w-4 h-4 text-[#14B8A6]" />
              <span>Enterprise Governance • Multi-Tenant Administration</span>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Link
                href="/admin/login"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1d4ed8] text-white text-xs font-bold shadow-md transition-all group"
              >
                <span>Institution Login</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/admin"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition-all"
              >
                <span>Dashboard</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Shared Repository Base Content (Preserved) */}
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            To get started, edit the{" "}
            <code className="rounded bg-black/[.06] px-1.5 py-0.5 font-mono text-[0.9em] dark:bg-white/[.08]">
              page.tsx
            </code>{" "}
            file.
          </h1>
          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            Looking for a starting point or more instructions? Head over to{" "}
            <a
              href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              className="font-medium text-zinc-950 dark:text-zinc-50"
            >
              Templates
            </a>{" "}
            or the{" "}
            <a
              href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              className="font-medium text-zinc-950 dark:text-zinc-50"
            >
              Learning
            </a>{" "}
            center.
          </p>
        </div>
        <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
          <a
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc] md:w-[158px]"
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              className="dark:invert h-[14px] w-4"
              src="/vercel.svg"
              alt="Vercel logomark"
              width={16}
              height={14}
            />
            Deploy Now
          </a>
          <a
            className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-black/[.08] px-5 transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a] md:w-[158px]"
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            Documentation
          </a>
        </div>
      </main>
    </div>
  );
}
