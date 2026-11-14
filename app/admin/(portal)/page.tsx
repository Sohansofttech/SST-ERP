import { AdminDashboard } from "@/components/super-admin/admin-dashboard";
import { getDashboardSummary } from "@/lib/super-admin/dashboard";
import { getDashboardDemoData, isDashboardDemoEnabled } from "@/lib/super-admin/dashboard-demo-data";
import { connection } from "next/server";

export const instant = false;

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ from?: string | string[]; to?: string | string[] }> }) {
  await connection();
  if (isDashboardDemoEnabled()) {
    return <AdminDashboard summary={null} demoData={getDashboardDemoData()} />;
  }

  let summary = null;
  let unavailable = false;
  const params = await searchParams;
  const fromInput = Array.isArray(params.from) ? params.from[0] : params.from;
  const toInput = Array.isArray(params.to) ? params.to[0] : params.to;
  const datePattern = /^\d{4}-\d{2}-\d{2}$/;
  const validFrom = fromInput && datePattern.test(fromInput) ? new Date(`${fromInput}T00:00:00.000Z`) : undefined;
  const validToDate = toInput && datePattern.test(toInput) ? new Date(`${toInput}T00:00:00.000Z`) : undefined;
  const validDates = (!validFrom || !Number.isNaN(validFrom.getTime())) && (!validToDate || !Number.isNaN(validToDate.getTime())) && (!validFrom || !validToDate || validFrom <= validToDate);
  const until = validToDate ? new Date(validToDate.getTime() + 86400000) : undefined;
  try {
    if (validDates) summary = await getDashboardSummary({ from: validFrom, until });
    else unavailable = true;
  } catch {
    unavailable = true;
  }
  return <AdminDashboard summary={summary} unavailable={unavailable} filters={{ from: fromInput ?? "", to: toInput ?? "" }} />;
}
