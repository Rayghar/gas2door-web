"use client";
import React from "react";
import { CreditCard, FileText, RefreshCw } from "lucide-react";
import { BusinessShell, Pill, StatCard } from "@/components/business/BusinessShell";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/Glass";
import { businessApi, dateOnly, kg, money, statusTone } from "@/services/business";

export default function BusinessInvoicesPage() {
  const [rows, setRows] = React.useState<any[]>([]);
  const [summary, setSummary] = React.useState<any>({});
  const [statement, setStatement] = React.useState<any>({ lines: [] });
  const [error, setError] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [payingId, setPayingId] = React.useState("");

  const load = React.useCallback(async () => {
    setError("");
    try { const res = await businessApi.billing(); setRows(res?.invoices || res?.rows || []); setSummary(res?.summary || {}); setStatement(res?.statement || { lines: [] }); }
    catch (e: any) { setError(e?.message || "Unable to load invoices."); }
  }, []);
  React.useEffect(() => { load(); }, [load]);

  const payOnline = async (row: any) => {
    const id = row?.id;
    if (!id) return;
    setPayingId(id);
    setError("");
    setMessage("");
    try {
      const res = await businessApi.initializeInvoicePayment(id);
      if (res?.checkoutUrl) {
        window.location.href = res.checkoutUrl;
        return;
      }
      setMessage(res?.message || "No payment is required for this invoice.");
      await load();
    } catch (e: any) {
      setError(e?.message || "Unable to initialize corporate online payment.");
    } finally {
      setPayingId("");
    }
  };

  const outstanding = Number(summary.outstanding ?? rows.reduce((sum, r) => sum + Number(r.outstandingAmount || 0), 0));
  const revenue = Number(summary.totalInvoiceValue ?? rows.reduce((sum, r) => sum + Number(r.revenue || 0), 0));
  const deliveredKg = Number(summary.deliveredKg ?? rows.reduce((sum, r) => sum + Number(r.deliveredKg || 0), 0));

  return (
    <BusinessShell activeHref="/business/invoices">
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-black text-white">Invoices, Statements & Credit</h1>
          <p className="mt-1 text-sm text-slate-400">Corporate billing, statement lines, payment status, outstanding exposure and available credit.</p>
        </div>
        <Button variant="outline" onClick={load}><RefreshCw className="h-4 w-4" /> Refresh</Button>
      </div>
      {error && <div className="mb-4 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">{error}</div>}
      {message && <div className="mb-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-200">{message}</div>}
      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <StatCard label="Total invoice value" value={money(revenue)} />
        <StatCard label="Outstanding" value={money(outstanding)} />
        <StatCard label="Delivered volume" value={kg(deliveredKg)} />
        <StatCard label="Available credit" value={money(summary.availableCredit)} hint={`${summary.creditUtilizationPct || 0}% utilised`} />
      </div>
      <GlassCard className="mb-6 p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-extrabold text-white">Account Statement</h2>
          <Pill>{statement?.lines?.length || 0} lines</Pill>
        </div>
        <div className="space-y-2">
          {(statement?.lines || []).slice(0, 8).map((line: any) => (
            <div key={line.id} className="grid gap-2 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300 md:grid-cols-[1fr_1fr_100px_100px_100px]">
              <span><b className="block text-white">{line.reference}</b>{dateOnly(line.date)}</span>
              <span>{line.description}</span>
              <span>Debit <b className="block text-white">{money(line.debit)}</b></span>
              <span>Credit <b className="block text-white">{money(line.credit)}</b></span>
              <span>Balance <b className="block text-white">{money(line.balance)}</b></span>
            </div>
          ))}
          {!(statement?.lines || []).length && <p className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-400">No statement lines yet.</p>}
        </div>
      </GlassCard>
      <div className="space-y-3">
        {rows.map((r) => {
          const canPay = Number(r.outstandingAmount || 0) > 0 && r.paymentStatus !== "PAID";
          return (
            <GlassCard key={r.id} className="p-5">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <FileText className="mb-2 h-6 w-6 text-gas-teal" />
                  <div className="text-lg font-extrabold text-white">{r.invoiceNumber || r.orderCode || "Pending invoice"}</div>
                  <div className="mt-1 text-sm text-slate-400">{r.deliverySiteName || r.deliveryAddress || "Delivery"} · Due {dateOnly(r.paymentDueDate)}</div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Pill tone={statusTone(r.paymentStatus)}>{r.paymentStatus || "UNPAID"}</Pill>
                  {canPay && (
                    <Button size="sm" onClick={() => payOnline(r)} disabled={payingId === r.id}>
                      <CreditCard className="h-4 w-4" /> {payingId === r.id ? "Starting…" : "Pay Online"}
                    </Button>
                  )}
                </div>
              </div>
              <div className="mt-4 grid gap-2 text-sm text-slate-300 md:grid-cols-4">
                <span>Revenue: <b className="text-white">{money(r.revenue)}</b></span>
                <span>Paid: <b className="text-white">{money(r.amountPaid)}</b></span>
                <span>Outstanding: <b className="text-white">{money(r.outstandingAmount)}</b></span>
                <span>Delivered: <b className="text-white">{kg(r.deliveredKg)}</b></span>
              </div>
              {canPay && <p className="mt-3 text-xs text-slate-400">Online payment uses the existing gateway flow and updates this corporate invoice after payment webhook confirmation.</p>}
            </GlassCard>
          );
        })}
        {!rows.length && <GlassCard className="p-8 text-center text-slate-400">No invoices or statement lines yet.</GlassCard>}
      </div>
    </BusinessShell>
  );
}
