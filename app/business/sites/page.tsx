"use client";
import React from "react";
import { MapPin, PlusCircle, RefreshCw } from "lucide-react";
import { BusinessShell, Pill } from "@/components/business/BusinessShell";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/Glass";
import { Input } from "@/components/ui/Input";
import { businessApi, kg, statusTone } from "@/services/business";
import { useAuth } from "@/state/auth";

export default function BusinessSitesPage() {
  const { session } = useAuth();
  const isAdmin = session?.user?.role === "corporate_admin";
  const [rows, setRows] = React.useState<any[]>([]);
  const [error, setError] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [showForm, setShowForm] = React.useState(false);
  const [form, setForm] = React.useState<any>({ siteName: "", siteType: "OTHER", address: "", siteContactName: "", siteContactPhone: "", preferredDeliveryWindow: "", estimatedMonthlyKg: "" });

  const load = React.useCallback(async () => {
    setError("");
    try { setRows((await businessApi.sites())?.rows || []); }
    catch (e: any) { setError(e?.message || "Unable to load sites."); }
  }, []);
  React.useEffect(() => { load(); }, [load]);

  const submit = async () => {
    setError(""); setMessage("");
    try { await businessApi.createSite({ ...form, estimatedMonthlyKg: Number(form.estimatedMonthlyKg || 0) }); setMessage("Delivery site submitted for review."); setShowForm(false); setForm({ siteName: "", siteType: "OTHER", address: "", siteContactName: "", siteContactPhone: "", preferredDeliveryWindow: "", estimatedMonthlyKg: "" }); await load(); }
    catch (e: any) { setError(e?.message || "Unable to submit site."); }
  };

  return (
    <BusinessShell activeHref="/business/sites">
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div><h1 className="text-3xl font-black text-white">Delivery Sites</h1><p className="mt-1 text-sm text-slate-400">Approved corporate delivery locations linked to your company account.</p></div>
        <div className="flex gap-2"><Button variant="outline" onClick={load}><RefreshCw className="h-4 w-4" /> Refresh</Button>{isAdmin && <Button onClick={() => setShowForm((v) => !v)}><PlusCircle className="h-4 w-4" /> Request Site</Button>}</div>
      </div>
      {error && <div className="mb-4 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">{error}</div>}
      {message && <div className="mb-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-200">{message}</div>}

      {showForm && <GlassCard className="mb-6 p-5"><h2 className="mb-4 font-extrabold text-white">Request New Delivery Site</h2><div className="grid gap-3 md:grid-cols-2"><Input placeholder="Site name" value={form.siteName} onChange={(e) => setForm({ ...form, siteName: e.target.value })} /><Input placeholder="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /><Input placeholder="Site contact" value={form.siteContactName} onChange={(e) => setForm({ ...form, siteContactName: e.target.value })} /><Input placeholder="Contact phone" value={form.siteContactPhone} onChange={(e) => setForm({ ...form, siteContactPhone: e.target.value })} /><Input placeholder="Preferred delivery window" value={form.preferredDeliveryWindow} onChange={(e) => setForm({ ...form, preferredDeliveryWindow: e.target.value })} /><Input type="number" placeholder="Estimated monthly KG" value={form.estimatedMonthlyKg} onChange={(e) => setForm({ ...form, estimatedMonthlyKg: e.target.value })} /></div><div className="mt-4"><Button onClick={submit} disabled={!form.siteName || !form.address}>Submit Site</Button></div></GlassCard>}

      <div className="grid gap-4 md:grid-cols-2">
        {rows.map((s) => <GlassCard key={s.id} className="p-5"><div className="flex items-start justify-between gap-3"><div><MapPin className="mb-2 h-6 w-6 text-gas-teal" /><div className="font-extrabold text-white">{s.siteName}</div><div className="mt-1 text-sm text-slate-400">{s.address}</div></div><Pill tone={statusTone(s.status)}>{s.status}</Pill></div><div className="mt-4 grid gap-2 text-sm text-slate-300 md:grid-cols-2"><span>Type: <b className="text-white">{s.siteType}</b></span><span>Monthly est.: <b className="text-white">{kg(s.estimatedMonthlyKg)}</b></span><span>Contact: <b className="text-white">{s.siteContactName || '—'}</b></span><span>Window: <b className="text-white">{s.preferredDeliveryWindow || '—'}</b></span></div></GlassCard>)}
        {!rows.length && <GlassCard className="p-8 text-center text-slate-400 md:col-span-2">No delivery sites visible. Ask your relationship manager to add approved corporate sites in the BMA.</GlassCard>}
      </div>
    </BusinessShell>
  );
}
