"use client";
import React from "react";
import Link from "next/link";
import { CheckCircle2, PlusCircle, RefreshCw, XCircle } from "lucide-react";
import { BusinessShell, Pill } from "@/components/business/BusinessShell";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/Glass";
import { businessApi, dateTime, kg, money, statusTone } from "@/services/business";
import { useAuth } from "@/state/auth";

export default function BusinessRequestsPage() {
  const { session } = useAuth();
  const canApprove = ["corporate_admin", "corporate_approver"].includes(session?.user?.role);
  const [rows, setRows] = React.useState<any[]>([]);
  const [status, setStatus] = React.useState("");
  const [error, setError] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [loading, setLoading] = React.useState(true);

  const load = React.useCallback(async () => {
    setLoading(true); setError("");
    try { setRows((await businessApi.requests(status ? { status } : undefined))?.rows || []); }
    catch (e: any) { setError(e?.message || "Unable to load requests."); }
    finally { setLoading(false); }
  }, [status]);

  React.useEffect(() => { load(); }, [load]);

  const approve = async (id: string) => {
    setMessage(""); setError("");
    try { await businessApi.approveRequest(id); setMessage("Request approved and submitted to PrimeJet."); await load(); }
    catch (e: any) { setError(e?.message || "Unable to approve request."); }
  };
  const cancel = async (id: string) => {
    setMessage(""); setError("");
    try { await businessApi.cancelRequest(id, "Cancelled from business portal."); setMessage("Request cancelled."); await load(); }
    catch (e: any) { setError(e?.message || "Unable to cancel request."); }
  };

  return (
    <BusinessShell activeHref="/business/requests">
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div><h1 className="text-3xl font-black text-white">Corporate Requests</h1><p className="mt-1 text-sm text-slate-400">Track submitted, approved, scheduled and delivered LPG requests.</p></div>
        <div className="flex gap-2"><Button variant="outline" onClick={load}><RefreshCw className="h-4 w-4" /> Refresh</Button><Link href="/business/requests/new"><Button><PlusCircle className="h-4 w-4" /> New Request</Button></Link></div>
      </div>
      {error && <div className="mb-4 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">{error}</div>}
      {message && <div className="mb-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-200">{message}</div>}
      <GlassCard className="mb-4 p-4"><select className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white" value={status} onChange={(e) => setStatus(e.target.value)}><option value="">All statuses</option>{['DRAFT','SUBMITTED','UNDER_REVIEW','QUOTED','APPROVED','SCHEDULED','IN_TRANSIT','DELIVERED','CANCELLED','REJECTED'].map((s) => <option key={s} value={s}>{s}</option>)}</select></GlassCard>
      {loading && <div className="text-sm text-slate-300">Loading requests…</div>}
      <div className="space-y-3">
        {rows.map((r) => (
          <GlassCard key={r.id} className="p-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="text-lg font-extrabold text-white">{r.requestCode || "Corporate Request"}</div>
                <div className="mt-1 text-sm text-slate-400">{r.siteName || "No site"} · {kg(r.requestedKg)} · {r.requestType} · {dateTime(r.requestedDeliveryDate)}</div>
                {r.poNumber && <div className="mt-1 text-xs text-slate-500">PO/Ref: {r.poNumber}</div>}
              </div>
              <Pill tone={statusTone(r.status)}>{r.status}</Pill>
            </div>
            <div className="mt-4 grid gap-3 text-sm text-slate-300 md:grid-cols-4">
              <span>Priority: <b className="text-white">{r.priority}</b></span>
              <span>Est. amount: <b className="text-white">{money(r.estimatedAmount)}</b></span>
              <span>Payment: <b className="text-white">{r.paymentType}</b></span>
              <span>Created: <b className="text-white">{dateTime(r.createdAt)}</b></span>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {canApprove && r.requiresClientApproval && <Button onClick={() => approve(r.id)}><CheckCircle2 className="h-4 w-4" /> Approve</Button>}
              {!['SCHEDULED','IN_TRANSIT','DELIVERED','CANCELLED','REJECTED'].includes(r.status) && <Button variant="outline" onClick={() => cancel(r.id)}><XCircle className="h-4 w-4" /> Cancel</Button>}
            </div>
          </GlassCard>
        ))}
        {!loading && !rows.length && <GlassCard className="p-8 text-center text-slate-400">No corporate requests found.</GlassCard>}
      </div>
    </BusinessShell>
  );
}
