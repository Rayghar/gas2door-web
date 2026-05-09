"use client";
import React from "react";
import Link from "next/link";
import { AlertTriangle, BadgePercent, ClipboardList, FileText, Headset, MapPin, PackageCheck, PlusCircle, WalletCards } from "lucide-react";
import { BusinessShell, Pill, StatCard } from "@/components/business/BusinessShell";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/Glass";
import { businessApi, dateTime, kg, money, statusTone } from "@/services/business";

export default function BusinessDashboardPage() {
  const [data, setData] = React.useState<any>(null);
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(true);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError("");
    try { setData(await businessApi.dashboard()); }
    catch (e: any) { setError(e?.message || "Unable to load business dashboard."); }
    finally { setLoading(false); }
  }, []);

  React.useEffect(() => { load(); }, [load]);

  const metrics = data?.metrics || {};
  const client = data?.client || {};
  const analytics = data?.analytics || {};
  const recentRequests = data?.recentRequests || [];
  const recentFulfilments = data?.recentFulfilments || [];

  return (
    <BusinessShell activeHref="/business/dashboard">
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-xs uppercase tracking-widest text-gas-teal">{client.companyName || "Corporate Account"}</div>
          <h1 className="text-3xl font-black text-white">Business Dashboard</h1>
          <p className="mt-1 text-sm text-slate-400">Requests, deliveries, outstanding exposure and site-level visibility for your corporate LPG account.</p>
        </div>
        <Link href="/business/requests/new"><Button><PlusCircle className="h-4 w-4" /> New Request</Button></Link>
      </div>

      {error && <div className="mb-4 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">{error}</div>}
      {loading && <div className="mb-4 text-sm text-slate-300">Loading corporate account…</div>}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Open Requests" value={metrics.openRequests || 0} hint={`${metrics.pendingApproval || 0} pending approval`} />
        <StatCard label="Delivered KG" value={kg(metrics.deliveredKg)} hint={`${metrics.deliveredCount || 0} completed deliveries`} />
        <StatCard label="Outstanding" value={money(metrics.outstandingAmount)} hint={`Credit available ${money(metrics.creditAvailable)}`} />
        <StatCard label="On-time Rate" value={`${Math.round(Number(metrics.onTimeDeliveryRate || 0))}%`} hint={`${metrics.siteCount || 0} delivery sites`} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <GlassCard className="p-5">
          <div className="mb-4 flex items-center justify-between"><h2 className="font-extrabold text-white"><ClipboardList className="mr-2 inline h-5 w-5 text-gas-teal" /> Recent Requests</h2><Link className="text-sm font-bold text-gas-teal" href="/business/requests">View all</Link></div>
          <div className="space-y-3">
            {recentRequests.slice(0, 6).map((r: any) => (
              <div key={r.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-start justify-between gap-3"><div><div className="font-bold text-white">{r.requestCode || "Request"}</div><div className="text-xs text-slate-400">{r.siteName || "No site"} · {kg(r.requestedKg)} · {dateTime(r.requestedDeliveryDate)}</div></div><Pill tone={statusTone(r.status)}>{r.status}</Pill></div>
              </div>
            ))}
            {!recentRequests.length && <p className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-400">No requests yet. Submit your first corporate request.</p>}
          </div>
        </GlassCard>

        <GlassCard className="p-5">
          <div className="mb-4 flex items-center justify-between"><h2 className="font-extrabold text-white"><PackageCheck className="mr-2 inline h-5 w-5 text-gas-teal" /> Recent Deliveries</h2><Link className="text-sm font-bold text-gas-teal" href="/business/deliveries">View all</Link></div>
          <div className="space-y-3">
            {recentFulfilments.slice(0, 6).map((f: any) => (
              <div key={f.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-start justify-between gap-3"><div><div className="font-bold text-white">{f.orderCode || f.invoiceNumber || "Delivery"}</div><div className="text-xs text-slate-400">{f.deliverySiteName || f.deliveryAddress || "Delivery site"} · {kg(f.deliveredKg || f.requestedKg)} · {money(f.revenue)}</div></div><Pill tone={statusTone(f.status)}>{f.status}</Pill></div>
                {f.slaStatus && <div className="mt-2 text-xs text-slate-400"><AlertTriangle className="mr-1 inline h-3 w-3" /> SLA: {f.slaStatus}</div>}
              </div>
            ))}
            {!recentFulfilments.length && <p className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-400">Deliveries will appear once PrimeJet schedules or completes fulfilments.</p>}
          </div>
        </GlassCard>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <Link href="/business/sites"><GlassCard className="p-5 hover:ring-1 hover:ring-gas-teal/40"><MapPin className="mb-2 h-6 w-6 text-gas-teal" /><div className="font-extrabold text-white">Manage Sites</div><p className="mt-1 text-sm text-slate-400">View approved corporate delivery locations.</p></GlassCard></Link>
        <Link href="/business/invoices"><GlassCard className="p-5 hover:ring-1 hover:ring-gas-teal/40"><FileText className="mb-2 h-6 w-6 text-gas-teal" /><div className="font-extrabold text-white">Invoices</div><p className="mt-1 text-sm text-slate-400">Review invoices, outstanding balances and statements.</p></GlassCard></Link>
        <Link href="/business/requests/new"><GlassCard className="p-5 hover:ring-1 hover:ring-gas-teal/40"><PlusCircle className="mb-2 h-6 w-6 text-gas-teal" /><div className="font-extrabold text-white">New Gas Request</div><p className="mt-1 text-sm text-slate-400">Submit bulk LPG or cylinder refill requests.</p></GlassCard></Link>
        <Link href="/business/wallet"><GlassCard className="p-5 hover:ring-1 hover:ring-gas-teal/40"><WalletCards className="mb-2 h-6 w-6 text-gas-teal" /><div className="font-extrabold text-white">Wallet</div><p className="mt-1 text-sm text-slate-400">View wallet balance and recent credits.</p></GlassCard></Link>
        <Link href="/business/promotions"><GlassCard className="p-5 hover:ring-1 hover:ring-gas-teal/40"><BadgePercent className="mb-2 h-6 w-6 text-gas-teal" /><div className="font-extrabold text-white">Promotions</div><p className="mt-1 text-sm text-slate-400">See available business promos and offers.</p></GlassCard></Link>
        <Link href="/business/support"><GlassCard className="p-5 hover:ring-1 hover:ring-gas-teal/40"><Headset className="mb-2 h-6 w-6 text-gas-teal" /><div className="font-extrabold text-white">Support</div><p className="mt-1 text-sm text-slate-400">Raise delivery, billing or service complaints.</p></GlassCard></Link>
      </div>

      {!!(analytics?.bySite || []).length && <GlassCard className="mt-6 p-5"><h2 className="mb-4 font-extrabold text-white">Site Consumption Snapshot</h2><div className="grid gap-3 md:grid-cols-2">{analytics.bySite.slice(0, 6).map((s: any) => <div key={s.id || s.siteName} className="rounded-2xl border border-white/10 bg-white/5 p-4"><div className="font-bold text-white">{s.siteName}</div><div className="mt-2 grid grid-cols-3 gap-2 text-xs text-slate-300"><span>Requested <b className="block text-white">{kg(s.requestedKg)}</b></span><span>Delivered <b className="block text-white">{kg(s.deliveredKg)}</b></span><span>Spend <b className="block text-white">{money(s.spend)}</b></span></div></div>)}</div></GlassCard>}
    </BusinessShell>
  );
}
