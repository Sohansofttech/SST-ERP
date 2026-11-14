import Link from "next/link";
import { Building2, Search } from "lucide-react";
import { prisma } from "@/lib/super-admin/prisma";
import { Prisma } from "@prisma/client";
import { requireSuperAdmin } from "@/lib/super-admin/require-super-admin";
import { CreateInstitutionForm } from "@/components/super-admin/create-institution-form";

const pageSize = 20;
export const instant = false;
async function fetchInstitutions(where: Prisma.PlatformInstitutionWhereInput, skip: number) {
  return prisma.platformInstitution.findMany({ where, orderBy: { createdAt: "desc" }, skip, take: pageSize, include: { _count: { select: { memberships: true, subscriptions: true } } } });
}

export default async function InstitutionsPage({ searchParams }: { searchParams: Promise<{ q?: string | string[]; page?: string | string[]; type?: string | string[]; status?: string | string[] }> }) {
  await requireSuperAdmin();
  const params = await searchParams;
  const search = (Array.isArray(params.q) ? params.q[0] : params.q)?.trim().slice(0, 100) ?? "";
  const page = Math.max(1, Number(Array.isArray(params.page) ? params.page[0] : params.page) || 1);
  const rawType = Array.isArray(params.type) ? params.type[0] : params.type;
  const rawStatus = Array.isArray(params.status) ? params.status[0] : params.status;
  const type = ["SCHOOL", "COLLEGE", "OTHER"].includes(rawType ?? "") ? rawType as "SCHOOL" | "COLLEGE" | "OTHER" : undefined;
  const status = ["PENDING", "ACTIVE", "SUSPENDED"].includes(rawStatus ?? "") ? rawStatus as "PENDING" | "ACTIVE" | "SUSPENDED" : undefined;
  const where = {
    archivedAt: null,
    ...(type ? { type } : {}),
    ...(status ? { status } : {}),
    ...(search ? { OR: [{ name: { contains: search, mode: "insensitive" as const } }, { slug: { contains: search, mode: "insensitive" as const } }, { code: { contains: search, mode: "insensitive" as const } }] } : {}),
  };
  let rows: Awaited<ReturnType<typeof fetchInstitutions>> = [];
  let total = 0;
  let unavailable = false;
  try {
    [rows, total] = await Promise.all([
      fetchInstitutions(where, (page - 1) * pageSize),
      prisma.platformInstitution.count({ where }),
    ]);
  } catch { unavailable = true; }
  return <div className="sa-module-page">
    <div className="sa-page-intro"><div><h2>Institution Management</h2><p>Register institutions and monitor their platform status.</p></div></div>
    <CreateInstitutionForm />
    <section className="sa-card sa-module-panel">
      <form className="sa-search-form" action="/admin/institutions"><label className="sa-search-box"><Search size={16} /><input name="q" defaultValue={search} placeholder="Search name, code or slug" aria-label="Search institutions" /></label><select name="type" className="sa-filter-select" defaultValue={type ?? ""} aria-label="Filter by type"><option value="">All types</option><option value="SCHOOL">School</option><option value="COLLEGE">College</option><option value="OTHER">Other</option></select><select name="status" className="sa-filter-select" defaultValue={status ?? ""} aria-label="Filter by status"><option value="">All statuses</option><option value="PENDING">Pending</option><option value="ACTIVE">Active</option><option value="SUSPENDED">Suspended</option></select><button className="sa-button sa-button-secondary">Apply</button></form>
      {unavailable ? <p className="sa-data-error" role="alert">Institution data is unavailable. Check the database connection and approved migrations.</p> : rows.length === 0 ? <div className="sa-empty-state"><Building2 size={20} /><strong>No institutions found</strong><span>{search ? "Try another search." : "Create an institution using the form above."}</span></div> : <div className="sa-table-wrap"><table className="sa-table"><thead><tr><th>Institution</th><th>Type</th><th>Status</th><th>Members</th><th>Subscriptions</th><th>Registered</th><th /></tr></thead><tbody>{rows.map((row) => <tr key={row.id}><td><Link href={`/admin/institutions/${row.id}`} className="sa-table-link">{row.name}</Link><small>{row.code ?? row.slug}</small></td><td>{row.type}</td><td><span className={`sa-status-badge sa-status-${row.status.toLowerCase()}`}>{row.status}</span></td><td>{row._count.memberships}</td><td>{row._count.subscriptions}</td><td>{row.createdAt.toLocaleDateString("en-IN")}</td><td><Link href={`/admin/institutions/${row.id}`} className="sa-small-link">View</Link></td></tr>)}</tbody></table></div>}
      {!unavailable && total > pageSize && <div className="sa-pagination"><span>{total} institutions · page {page} of {Math.ceil(total / pageSize)}</span><div>{page > 1 && <Link className="sa-button sa-button-secondary" href={`/admin/institutions?q=${encodeURIComponent(search)}&type=${type ?? ""}&status=${status ?? ""}&page=${page - 1}`}>Previous</Link>}{page < Math.ceil(total / pageSize) && <Link className="sa-button sa-button-secondary" href={`/admin/institutions?q=${encodeURIComponent(search)}&type=${type ?? ""}&status=${status ?? ""}&page=${page + 1}`}>Next</Link>}</div></div>}
    </section>
  </div>;
}
