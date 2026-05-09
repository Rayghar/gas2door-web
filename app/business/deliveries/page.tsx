"use client";
import React from "react";
import { CheckCircle2, PackageCheck, RefreshCw } from "lucide-react";
import { BusinessShell, Pill, StatCard } from "@/components/business/BusinessShell";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/Glass";
import { businessApi, dateTime, kg, money, statusTone } from "@/services/business";

export default function BusinessDeliveriesPage() {
  const [rows, setRows] = React.useState<any[]>([]);
  const [error, setError] = React.useState("");
  const [message, setMessage] = React.useState("");
  const load = React.useCallback(async () => {
    setError("");
    try { setRows((await businessApi.deliveries())?.rows || []); }
    catch (e: any) { setError(e?.message || "Unable to load deliveries."); }
  }, []);
  React.useEffect(() => { load(); }, [load]);

  const confirm = async (id: string) => {
    setError(""); setMessage("");
    try { await businessApi.confirmDelivery(id, "Confirmed from Gas2Door Business portal."); setMessage("Delivery confirmed."); await load(); }
    catch (e: any) { setError(e?.message || "Unable to confirm delivery."); }
  };
  const open = rows.filter((r) => !['DELIVERED','CANCELLED','FAILED'].includes(r.status)).length;
  const delivered = rows.filter((r) => r.status === 'DELIVERED');

  return (
    <BusinessShell activeHref="/business/deliveries">
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between"><div><h1 className="text-3xl font-black text-white">Deliveries</h1><p className="mt-1 text-sm text-slate-400">Track scheduled, in-transit and delivered corporate LPG fulfilments.</p></div><Button variant="outline" onClick={load}><RefreshCw className="h-4 w-4" /> Refresh</Button></div>
      {error && <div className="mb-4 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">{error}</div>}
      {message && <div className="mb-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-200">{message}</div>}
      <div className="mb-6 grid gap-4 md:grid-cols-3"><StatCard label="Open deliveries" value={open} /><StatCard label="Delivered" value={delivered.length} /><StatCard label="Delivered volume" value={kg(delivered.reduce((sum, r) => sum + Number(r.deliveredKg || 0), 0))} /></div>
      <div className="space-y-3">
        {rows.map((r) => <GlassCard key={r.id} className="p-5"><div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between"><div><PackageCheck className="mb-2 h-6 w-6 text-gas-teal" /><div className="text-lg font-extrabold text-white">{r.orderCode || r.invoiceNumber || "Delivery"}</div><div className="mt-1 text-sm text-slate-400">{r.deliverySiteName || r.deliveryAddress || 'Delivery site'} · {kg(r.deliveredKg || r.requestedKg)} · {money(r.revenue)}</div></div><Pill tone={statusTone(r.status)}>{r.status}</Pill></div><div className="mt-4 grid gap-2 text-sm text-slate-300 md:grid-cols-4"><span>Scheduled: <b className="text-white">{dateTime(r.scheduledAt)}</b></span><span>Delivered: <b className="text-white">{dateTime(r.actualDeliveredAt)}</b></span><span>SLA: <b className="text-white">{r.slaStatus || '—'}</b></span><span>Driver: <b className="text-white">{r.driverName || '—'}</b></span></div>{r.status === 'DELIVERED' && !r.customerConfirmed && <div className="mt-4"><Button onClick={() => confirm(r.id)}><CheckCircle2 className="h-4 w-4" /> Confirm Delivery</Button></div>}{r.customerConfirmed && <div className="mt-4 text-sm font-bold text-emerald-300">Customer confirmed</div>}</GlassCard>)}
        {!rows.length && <GlassCard className="p-8 text-center text-slate-400">No deliveries found yet.</GlassCard>}
      </div>
    </BusinessShell>
  );
}
