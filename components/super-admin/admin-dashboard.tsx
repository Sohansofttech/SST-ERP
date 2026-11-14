import { Activity, AlertTriangle, Building2, CreditCard, GraduationCap, HardDrive, Users, Megaphone, CircleDollarSign, Clock3, Layers3, UserRound } from "lucide-react";
import Link from "next/link";
import type { DashboardSummary } from "@/lib/super-admin/dashboard";
import type { DashboardDemoData } from "@/lib/super-admin/dashboard-demo-data";

const numberFormat = new Intl.NumberFormat("en-IN");

function formatBytes(bytes: number | null) {
  if (bytes === null) return "Not measured";
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const unit = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** unit).toFixed(unit > 1 ? 1 : 0)} ${units[unit]}`;
}

function formatMoney(amount: number, currency: string) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);
}

function formatDate(date: Date | null) {
  if (!date) return "No expiry date";
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(date);
}

function DemoDashboard({ data }: { data: DashboardDemoData }) {
  const stats = [
    { label: "Total Institutions", value: numberFormat.format(data.statistics.totalInstitutions), note: `${numberFormat.format(data.statistics.activeInstitutions)} active`, icon: Building2, color: "#2563eb", background: "#eff6ff" },
    { label: "Active Institutions", value: numberFormat.format(data.statistics.activeInstitutions), note: "Currently operational", icon: Building2, color: "#16a34a", background: "#f0fdf4" },
    { label: "Suspended Institutions", value: numberFormat.format(data.statistics.suspendedInstitutions), note: "Access temporarily paused", icon: AlertTriangle, color: "#dc2626", background: "#fef2f2" },
    { label: "Pending Onboarding", value: numberFormat.format(data.statistics.pendingOnboarding), note: "Awaiting setup completion", icon: Clock3, color: "#f59e0b", background: "#fffbeb" },
    { label: "Total Students", value: numberFormat.format(data.statistics.totalStudents), note: "Across all institutions", icon: GraduationCap, color: "#2563eb", background: "#eff6ff" },
    { label: "Total Teachers", value: numberFormat.format(data.statistics.totalTeachers), note: "Across all institutions", icon: UserRound, color: "#7c3aed", background: "#f5f3ff" },
    { label: "Active Subscriptions", value: numberFormat.format(data.statistics.activeSubscriptions), note: "Currently subscribed", icon: CreditCard, color: "#14b8a6", background: "#f0fdfa" },
    { label: "Monthly Revenue", value: formatMoney(data.statistics.monthlyRevenue, "INR"), note: "Illustrative recurring revenue", icon: CircleDollarSign, color: "#f59e0b", background: "#fffbeb" },
    { label: "Pending Payments", value: numberFormat.format(data.statistics.pendingPayments), note: "Awaiting settlement", icon: CreditCard, color: "#dc2626", background: "#fef2f2" },
    { label: "Storage Usage", value: formatBytes(data.statistics.storageBytes), note: "Combined institution storage", icon: HardDrive, color: "#153b66", background: "#eff6ff" },
  ];
  const maxGrowth = Math.max(...data.institutionGrowth.map((point) => point.institutions));
  const maxRevenue = Math.max(...data.monthlyRevenue.map((point) => point.amount));
  const totalPlanSubscriptions = data.planDistribution.reduce((total, plan) => total + plan.subscriptions, 0);
  const totalInstitutionStatuses = data.institutionStatus.reduce((total, item) => total + item.institutions, 0);

  return (
    <>
      <section className="sa-welcome" aria-labelledby="welcome-title">
        <div><h2 id="welcome-title">Welcome to your platform overview</h2><p>A development preview of platform operations and institution activity.</p></div>
        <div className="sa-demo-badge" role="status"><span className="sa-demo-dot" /> DEMO DATA</div>
      </section>
      <section className="sa-stats sa-demo-stats" aria-label="Demo platform statistics">
        {stats.map(({ label, value, note, icon: Icon, color, background }) => (
          <article className="sa-card sa-stat" key={label}>
            <div className="sa-stat-top"><span className="sa-stat-label">{label}</span><span className="sa-stat-icon" style={{ color, background }}><Icon size={18} /></span></div>
            <div className="sa-stat-value">{value}</div><div className="sa-stat-note">{note}</div>
          </article>
        ))}
      </section>
      <section className="sa-demo-chart-grid" aria-label="Demo platform charts">
        <article className="sa-card sa-panel sa-demo-chart-card">
          <div className="sa-panel-heading"><div><h3>Institution Growth</h3><div className="sa-panel-subtitle">Cumulative registered institutions · demo</div></div><Building2 size={18} color="#2563eb" /></div>
          <div className="sa-bar-chart" role="img" aria-label="Institution growth chart showing cumulative demo institution totals">
            {data.institutionGrowth.map((point) => <div className="sa-bar-column" key={point.month}><span className="sa-bar-value">{point.institutions}</span><div className="sa-bar-track"><span className="sa-bar-fill" style={{ height: `${Math.max(8, point.institutions / maxGrowth * 100)}%` }} /></div><span className="sa-bar-label">{point.month}</span></div>)}
          </div>
        </article>
        <article className="sa-card sa-panel sa-demo-chart-card">
          <div className="sa-panel-heading"><div><h3>Monthly Revenue</h3><div className="sa-panel-subtitle">Illustrative INR recurring revenue</div></div><CircleDollarSign size={18} color="#14b8a6" /></div>
          <div className="sa-bar-chart sa-revenue-chart" role="img" aria-label="Monthly demo revenue chart in Indian rupees">
            {data.monthlyRevenue.map((point) => <div className="sa-bar-column" key={point.month}><span className="sa-bar-value">{(point.amount / 100000).toFixed(1)}L</span><div className="sa-bar-track"><span className="sa-bar-fill sa-bar-fill-teal" style={{ height: `${Math.max(8, point.amount / maxRevenue * 100)}%` }} /></div><span className="sa-bar-label">{point.month}</span></div>)}
          </div>
        </article>
        <article className="sa-card sa-panel sa-demo-chart-card">
          <div className="sa-panel-heading"><div><h3>Subscription Plan Distribution</h3><div className="sa-panel-subtitle">{totalPlanSubscriptions} demo active subscriptions</div></div><Layers3 size={18} color="#153b66" /></div>
          <div className="sa-distribution-list">{data.planDistribution.map((item) => <div className="sa-distribution-row" key={item.plan}><div><span>{item.plan}</span><strong>{item.subscriptions}</strong></div><div className="sa-distribution-track"><span style={{ width: `${item.subscriptions / totalPlanSubscriptions * 100}%` }} /></div></div>)}</div>
        </article>
        <article className="sa-card sa-panel sa-demo-chart-card">
          <div className="sa-panel-heading"><div><h3>Institution Status</h3><div className="sa-panel-subtitle">{totalInstitutionStatuses} demo institutions</div></div><Activity size={18} color="#14b8a6" /></div>
          <div className="sa-distribution-list">{data.institutionStatus.map((item) => <div className="sa-distribution-row" key={item.status}><div><span className="sa-status-label"><i style={{ background: item.color }} />{item.status}</span><strong>{item.institutions}</strong></div><div className="sa-distribution-track"><span style={{ width: `${item.institutions / totalInstitutionStatuses * 100}%`, background: item.color }} /></div></div>)}</div>
        </article>
      </section>
      <section className="sa-demo-record-grid" aria-label="Demo platform records">
        <article className="sa-card sa-panel sa-demo-wide-panel">
          <div className="sa-panel-heading"><div><h3>Recently Registered Institutions</h3><div className="sa-panel-subtitle">Sample onboarding records · demo only</div></div></div>
          <div className="sa-table-wrap"><table className="sa-table"><thead><tr><th>Institution</th><th>Plan</th><th>Status</th><th>Registered</th></tr></thead><tbody>{data.institutions.map((institution) => <tr key={institution.name}><td><strong>{institution.name}</strong><small>{institution.type} · {institution.location}</small></td><td>{institution.plan}</td><td><span className={`sa-status-badge sa-status-${institution.status.toLowerCase()}`}>{institution.status}</span></td><td>{formatDate(institution.registeredAt)}</td></tr>)}</tbody></table></div>
        </article>
        <article className="sa-card sa-panel">
          <div className="sa-panel-heading"><div><h3>Recent Platform Activities</h3><div className="sa-panel-subtitle">Illustrative activity feed</div></div></div>
          <div className="sa-data-list">{data.activities.map((entry) => <div className="sa-data-row" key={entry.id}><span className="sa-list-icon sa-list-icon-teal"><Activity size={16} /></span><div className="sa-data-main"><strong>{entry.action}</strong><span>{entry.actor} · {entry.institution}</span></div><time className="sa-data-time">{formatDate(entry.occurredAt)}</time></div>)}</div>
        </article>
        <article className="sa-card sa-panel sa-demo-wide-panel">
          <div className="sa-panel-heading"><div><h3>Pending Support Tickets</h3><div className="sa-panel-subtitle">Sample support queue · demo only</div></div><span className="sa-panel-demo">DEMO</span></div>
          <div className="sa-table-wrap"><table className="sa-table"><thead><tr><th>Ticket</th><th>Institution</th><th>Priority</th><th>Status</th><th>Opened</th></tr></thead><tbody>{data.supportTickets.map((ticket) => <tr key={ticket.id}><td><strong>{ticket.subject}</strong><small>{ticket.id}</small></td><td>{ticket.institution}</td><td><span className={`sa-priority sa-priority-${ticket.priority.toLowerCase()}`}>{ticket.priority}</span></td><td>{ticket.status}</td><td>{formatDate(ticket.createdAt)}</td></tr>)}</tbody></table></div>
        </article>
        <article className="sa-card sa-panel">
          <div className="sa-panel-heading"><div><h3>Recent Notifications</h3><div className="sa-panel-subtitle">Sample platform announcements</div></div><Megaphone size={18} color="#14b8a6" /></div>
          <div className="sa-data-list">{data.notifications.map((notice) => <div className="sa-data-row" key={notice.id}><span className="sa-list-icon sa-list-icon-teal"><Megaphone size={16} /></span><div className="sa-data-main"><strong>{notice.title}</strong><span>{notice.audience} · {formatDate(notice.sentAt)}</span></div><span className="sa-status-badge sa-status-active">{notice.status}</span></div>)}</div>
        </article>
      </section>
      <p className="sa-demo-footnote">All figures, charts and records on this page are illustrative development demo data. They are not read from or written to the database.</p>
    </>
  );
}

export function AdminDashboard({ summary, demoData, unavailable = false, filters = { from: "", to: "" } }: { summary: DashboardSummary | null; demoData?: DashboardDemoData; unavailable?: boolean; filters?: { from: string; to: string } }) {
  if (demoData) return <DemoDashboard data={demoData} />;

  if (unavailable || !summary) {
    return (
      <section className="sa-data-error" role="alert">
        <AlertTriangle size={20} />
        <div><strong>Dashboard data is unavailable</strong><p>Check the database connection and confirm that the approved Prisma migrations have been applied. No demo figures are being shown.</p></div>
      </section>
    );
  }

  const revenue = summary.monthlyRecurringRevenue
    ? formatMoney(summary.monthlyRecurringRevenue.amount, summary.monthlyRecurringRevenue.currency)
    : "Multiple currencies";
  const stats = [
    { label: "Institutions", value: numberFormat.format(summary.totalInstitutions), note: `${numberFormat.format(summary.activeInstitutions)} active · ${numberFormat.format(summary.pendingInstitutions)} pending`, icon: Building2, color: "#2563eb", background: "#eff6ff" },
    { label: "Active Subscriptions", value: numberFormat.format(summary.activeSubscriptions), note: `${numberFormat.format(summary.expiredSubscriptions)} expired`, icon: CreditCard, color: "#14b8a6", background: "#f0fdfa" },
    { label: "Registered Users", value: numberFormat.format(summary.totalUsers), note: "All platform accounts", icon: Users, color: "#7c3aed", background: "#f5f3ff" },
    { label: "Monthly Recurring Revenue", value: revenue, note: summary.monthlyRecurringRevenue ? "Calculated from active plans" : "Separate currencies are not combined", icon: Activity, color: "#f59e0b", background: "#fffbeb" },
  ];

  return (
    <>
      <form className="sa-date-filter" action="/admin"><div><strong>Dashboard activity period</strong><span>Institution registrations and audit activity are filtered; headline totals remain platform-wide.</span></div><label>From<input type="date" name="from" defaultValue={filters.from} /></label><label>To<input type="date" name="to" defaultValue={filters.to} /></label><button className="sa-button sa-button-secondary">Apply</button><Link className="sa-small-link" href="/admin">Clear</Link></form>
      <section className="sa-welcome" aria-labelledby="welcome-title">
        <div><h2 id="welcome-title">Welcome to your platform overview</h2><p>Live platform metrics from the SST-ERP database.</p></div>
        <div className="sa-live-badge"><span className="sa-live-dot" /> LIVE DATA</div>
      </section>
      <section className="sa-stats" aria-label="Live platform statistics">
        {stats.map(({ label, value, note, icon: Icon, color, background }, index) => (
          <Link className="sa-card sa-stat sa-stat-link" key={label} href={["/admin/institutions", "/admin/billing", "/admin/users", "/admin/billing"][index]}>
            <div className="sa-stat-top"><span className="sa-stat-label">{label}</span><span className="sa-stat-icon" style={{ color, background }}><Icon size={18} /></span></div>
            <div className="sa-stat-value">{value}</div><div className="sa-stat-note">{note}</div>
          </Link>
        ))}
      </section>
      <section className="sa-panels sa-dashboard-panels" aria-label="Platform activity and alerts">
        <article className="sa-card sa-panel">
          <div className="sa-panel-heading"><div><h3>Recent Institutions</h3><div className="sa-panel-subtitle">Latest registrations</div></div></div>
          {summary.recentInstitutions.length === 0 ? <div className="sa-empty-state">No institutions have been registered yet.</div> : (
            <div className="sa-data-list">
              {summary.recentInstitutions.map((institution) => (
                <div className="sa-data-row" key={institution.id}>
                  <span className="sa-list-icon"><Building2 size={16} /></span>
                  <div className="sa-data-main"><strong>{institution.name}</strong><span>{institution.type.toLowerCase()} · {formatDate(institution.createdAt)}</span></div>
                  <span className={`sa-status-badge sa-status-${institution.status.toLowerCase()}`}>{institution.status}</span>
                </div>
              ))}
            </div>
          )}
        </article>
        <article className="sa-card sa-panel">
          <div className="sa-panel-heading"><div><h3>Recent Platform Activity</h3><div className="sa-panel-subtitle">Audit events recorded by the platform</div></div></div>
          {summary.recentAuditLogs.length === 0 ? <div className="sa-empty-state">No audit activity has been recorded yet.</div> : (
            <div className="sa-data-list">
              {summary.recentAuditLogs.map((entry) => (
                <div className="sa-data-row" key={entry.id}>
                  <span className="sa-list-icon sa-list-icon-teal"><Activity size={16} /></span>
                  <div className="sa-data-main"><strong>{entry.action.replaceAll("_", " ")}</strong><span>{entry.user?.name ?? entry.user?.email ?? "System"} · {entry.entity}{entry.institution ? ` · ${entry.institution.name}` : ""}</span></div>
                  <time className="sa-data-time" dateTime={entry.createdAt.toISOString()}>{formatDate(entry.createdAt)}</time>
                </div>
              ))}
            </div>
          )}
        </article>
        <article className="sa-card sa-panel">
          <div className="sa-panel-heading"><div><h3>Operational Alerts</h3><div className="sa-panel-subtitle">Items that may need attention</div></div></div>
          <div className="sa-alert-list">
            <div className="sa-alert-row"><span className="sa-alert-number">{summary.expiringSubscriptions.length}</span><div><strong>Subscriptions expiring soon</strong><span>Within the next 30 days</span></div></div>
            <div className="sa-alert-row"><span className="sa-alert-number sa-alert-warning">{summary.failedPayments}</span><div><strong>Failed payments</strong><span>Payment records currently marked failed</span></div></div>
            <div className="sa-alert-row"><span className="sa-alert-number">{summary.openSupportTickets}</span><div><strong>Open support tickets</strong><span>Not yet resolved or closed</span></div></div>
            <div className="sa-alert-row"><span className="sa-list-icon"><HardDrive size={16} /></span><div><strong>Recorded storage usage</strong><span>{formatBytes(summary.storageBytes)}{summary.storageBytes === null ? " · no measurements recorded" : " across recorded metrics"}</span></div></div>
          </div>
          {summary.expiringSubscriptions.length > 0 && <div className="sa-expiry-list">{summary.expiringSubscriptions.map((subscription) => <div key={subscription.id}>{subscription.institution.name} · {formatDate(subscription.endsAt)}</div>)}</div>}
        </article>
      </section>
      <section className="sa-card sa-panel sa-notification-overview"><div className="sa-panel-heading"><div><h3>Platform notifications</h3><div className="sa-panel-subtitle">Published in the platform; no external delivery is implied</div></div><Link className="sa-small-link" href="/admin/notifications">Manage</Link></div>{summary.recentNotifications.length === 0 ? <div className="sa-empty-state">No platform announcements have been published.</div> : <div className="sa-data-list">{summary.recentNotifications.map((notice) => <div className="sa-data-row" key={notice.id}><span className="sa-list-icon sa-list-icon-teal"><Megaphone size={16} /></span><div className="sa-data-main"><strong>{notice.title}</strong><span>{notice.status} · {formatDate(notice.createdAt)}</span></div></div>)}</div>}</section>
    </>
  );
}
