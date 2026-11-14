import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/super-admin/prisma";
import { requireSuperAdmin } from "@/lib/super-admin/require-super-admin";
import { PrintButton } from "@/components/super-admin/print-button";

export const instant = false;

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  await requireSuperAdmin();
  const { id } = await params;
  const invoice = await prisma.invoice.findUnique({ where: { id }, include: { institution: true, payments: { orderBy: { createdAt: "desc" } } } });
  if (!invoice) notFound();
  const money = (amount: unknown) => new Intl.NumberFormat("en-IN", { style: "currency", currency: invoice.currency, maximumFractionDigits: 2 }).format(Number(amount));
  return <main className="sa-invoice-page"><div className="sa-invoice-controls"><Link href="/admin/billing" className="sa-small-link">Back to billing</Link><PrintButton /></div><article className="sa-invoice-document"><header><div><div className="sa-login-kicker">SST-ERP PLATFORM</div><h1>Invoice</h1></div><span className={`sa-status-badge sa-status-${invoice.status.toLowerCase()}`}>{invoice.status}</span></header><section className="sa-invoice-grid"><div><span>Invoice number</span><strong>{invoice.invoiceNumber}</strong></div><div><span>Institution</span><strong>{invoice.institution.name}</strong></div><div><span>Issued</span><strong>{invoice.issuedAt?.toLocaleDateString("en-IN") ?? "Draft"}</strong></div><div><span>Due date</span><strong>{invoice.dueAt?.toLocaleDateString("en-IN") ?? "Not issued"}</strong></div><div><span>Bill to</span><strong>{invoice.institution.email ?? "No billing email on file"}</strong></div><div><span>Institution address</span><strong>{[invoice.institution.address, invoice.institution.city, invoice.institution.state, invoice.institution.postalCode, invoice.institution.country].filter(Boolean).join(", ") || "No address on file"}</strong></div></section><table className="sa-table sa-invoice-table"><thead><tr><th>Description</th><th>Subtotal</th><th>Tax</th><th>Total</th></tr></thead><tbody><tr><td>Platform subscription charges</td><td>{money(invoice.subtotal)}</td><td>{money(invoice.tax)}</td><td><strong>{money(invoice.total)}</strong></td></tr></tbody></table><h2>Payment history</h2>{invoice.payments.length ? <div className="sa-table-wrap"><table className="sa-table"><thead><tr><th>Status</th><th>Amount</th><th>Provider</th><th>Recorded at</th></tr></thead><tbody>{invoice.payments.map((payment) => <tr key={payment.id}><td>{payment.status}</td><td>{money(payment.amount)}</td><td>{payment.provider ?? "Not recorded"}</td><td>{payment.createdAt.toLocaleString("en-IN")}</td></tr>)}</tbody></table></div> : <p className="sa-muted-copy">No payment is recorded. This invoice does not confirm that payment was made.</p>}</article></main>;
}
