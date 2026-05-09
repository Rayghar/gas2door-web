"use client";
import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Send } from "lucide-react";
import { BusinessShell } from "@/components/business/BusinessShell";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/Glass";
import { Input } from "@/components/ui/Input";
import { businessApi, kg, labelize, money } from "@/services/business";

const fieldClass = "w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white outline-none placeholder:text-slate-500 focus:border-gas-teal option:bg-slate-950 option:text-white";

export default function NewBusinessRequestPage() {
  const router = useRouter();
  const [sites, setSites] = React.useState<any[]>([]);
  const [client, setClient] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [form, setForm] = React.useState<any>({
    siteId: "",
    requestType: "BULK_REFILL",
    priority: "NORMAL",
    requestedKg: "",
    requestedDeliveryDate: "",
    preferredDeliveryWindow: "",
    paymentType: "ACCOUNT_TERMS",
    poNumber: "",
    deliveryContactName: "",
    deliveryContactPhone: "",
    notes: "",
  });

  React.useEffect(() => {
    let active = true;
    Promise.all([businessApi.sites(), businessApi.me()])
      .then(([siteRes, me]) => {
        if (!active) return;
        const rows = siteRes?.rows || [];
        setSites(rows);
        setClient(me?.client || null);
        if (rows[0]) setForm((f: any) => ({ ...f, siteId: rows[0].id, preferredDeliveryWindow: rows[0].preferredDeliveryWindow || "", deliveryContactName: rows[0].siteContactName || "", deliveryContactPhone: rows[0].siteContactPhone || "" }));
      })
      .catch((e) => setError(e?.message || "Unable to load business setup."));
    return () => { active = false; };
  }, []);

  const selectedSite = sites.find((s) => s.id === form.siteId);
  const estimated = Number(form.requestedKg || 0) * Number(client?.agreedPricePerKg || 0);

  const update = (key: string, value: any) => {
    const next = { ...form, [key]: value };
    if (key === "siteId") {
      const site = sites.find((s) => s.id === value);
      next.preferredDeliveryWindow = site?.preferredDeliveryWindow || "";
      next.deliveryContactName = site?.siteContactName || "";
      next.deliveryContactPhone = site?.siteContactPhone || "";
    }
    setForm(next);
  };

  const submit = async () => {
    setLoading(true);
    setError("");
    try {
      const payload = { ...form, requestedKg: Number(form.requestedKg || 0), requestedDeliveryDate: form.requestedDeliveryDate ? new Date(form.requestedDeliveryDate).toISOString() : undefined };
      const res = await businessApi.createRequest(payload);
      router.push(`/business/requests?created=${encodeURIComponent(res?.request?.requestCode || "1")}`);
    } catch (e: any) {
      setError(e?.message || "Unable to submit corporate request.");
      setLoading(false);
    }
  };

  return (
    <BusinessShell activeHref="/business/requests/new">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <Link href="/business/dashboard" className="mb-2 inline-flex items-center gap-1 text-sm font-bold text-gas-teal"><ArrowLeft className="h-4 w-4" /> Dashboard</Link>
          <h1 className="text-3xl font-black text-white">New Corporate Gas Request</h1>
          <p className="mt-1 text-sm text-slate-400">Submit a bulk LPG or cylinder request for an approved business delivery site.</p>
        </div>
      </div>

      {error && <div className="mb-4 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">{error}</div>}

      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <GlassCard className="p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm font-bold text-slate-300">Delivery site
              <select className={fieldClass} value={form.siteId} onChange={(e) => update("siteId", e.target.value)}>
                <option value="">Select approved site</option>
                {sites.map((s) => <option key={s.id} value={s.id}>{s.siteName}</option>)}
              </select>
            </label>
            <label className="text-sm font-bold text-slate-300">Request type
              <select className={fieldClass} value={form.requestType} onChange={(e) => update("requestType", e.target.value)}>
                {['BULK_REFILL','CYLINDER_REFILL','CYLINDER_EXCHANGE','EQUIPMENT_SUPPLY','RECURRING_REFILL','OTHER'].map((v) => <option key={v} value={v}>{labelize(v)}</option>)}
              </select>
            </label>
            <label className="text-sm font-bold text-slate-300">Requested KG<Input className="mt-1 bg-white/5 text-white border-white/10" type="number" value={form.requestedKg} onChange={(e) => update("requestedKg", e.target.value)} placeholder="e.g. 500" /></label>
            <label className="text-sm font-bold text-slate-300">Priority
              <select className={fieldClass} value={form.priority} onChange={(e) => update("priority", e.target.value)}>{['NORMAL','HIGH','URGENT','SCHEDULED_CONTRACT'].map((v) => <option key={v} value={v}>{labelize(v)}</option>)}</select>
            </label>
            <label className="text-sm font-bold text-slate-300">Preferred delivery date/time<Input className="mt-1 bg-white/5 text-white border-white/10" type="datetime-local" value={form.requestedDeliveryDate} onChange={(e) => update("requestedDeliveryDate", e.target.value)} /></label>
            <label className="text-sm font-bold text-slate-300">Preferred delivery window<Input className="mt-1 bg-white/5 text-white border-white/10" value={form.preferredDeliveryWindow} onChange={(e) => update("preferredDeliveryWindow", e.target.value)} placeholder="e.g. 9am–12pm" /></label>
            <label className="text-sm font-bold text-slate-300">PO / internal reference<Input className="mt-1 bg-white/5 text-white border-white/10" value={form.poNumber} onChange={(e) => update("poNumber", e.target.value)} /></label>
            <label className="text-sm font-bold text-slate-300">Payment type
              <select className={fieldClass} value={form.paymentType} onChange={(e) => update("paymentType", e.target.value)}>{['ACCOUNT_TERMS','PREPAID','PAY_ON_DELIVERY','CREDIT'].map((v) => <option key={v} value={v}>{labelize(v)}</option>)}</select>
            </label>
            <label className="text-sm font-bold text-slate-300">Delivery contact<Input className="mt-1 bg-white/5 text-white border-white/10" value={form.deliveryContactName} onChange={(e) => update("deliveryContactName", e.target.value)} /></label>
            <label className="text-sm font-bold text-slate-300">Contact phone<Input className="mt-1 bg-white/5 text-white border-white/10" value={form.deliveryContactPhone} onChange={(e) => update("deliveryContactPhone", e.target.value)} /></label>
            <label className="text-sm font-bold text-slate-300 md:col-span-2">Delivery notes<textarea className={`${fieldClass} mt-1 min-h-[110px]`} value={form.notes} onChange={(e) => update("notes", e.target.value)} placeholder="Access instructions, safety notes, cylinder details, delivery constraints…" /></label>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button onClick={submit} disabled={loading || !form.siteId || !form.requestedKg}>{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Submit Request</Button>
            <Link href="/business/requests"><Button variant="outline">View Requests</Button></Link>
          </div>
        </GlassCard>

        <GlassCard className="h-fit p-5">
          <h2 className="font-extrabold text-white">Request Summary</h2>
          <div className="mt-4 space-y-3 text-sm text-slate-300">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3"><b className="text-white">Site:</b> {selectedSite?.siteName || "—"}<div className="mt-1 text-xs text-slate-400">{selectedSite?.address || "Select an approved site"}</div></div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3"><b className="text-white">Requested volume:</b> {kg(form.requestedKg)}</div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3"><b className="text-white">Indicative amount:</b> {money(estimated)}<div className="mt-1 text-xs text-slate-400">Final invoice subject to PrimeJet confirmation and delivered KG.</div></div>
          </div>
        </GlassCard>
      </div>
    </BusinessShell>
  );
}
