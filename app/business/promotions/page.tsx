"use client";
import React from "react";
import { BadgePercent, RefreshCw } from "lucide-react";
import { BusinessShell, Pill } from "@/components/business/BusinessShell";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/Glass";
import { businessApi, dateOnly, money, labelize } from "@/services/business";

export default function BusinessPromotionsPage() {
  const [rows, setRows] = React.useState<any[]>([]);
  const [error, setError] = React.useState("");
  const load = React.useCallback(async () => { setError(""); try { setRows((await businessApi.promotions())?.rows || []); } catch (e: any) { setError(e?.message || "Unable to load promotions."); } }, []);
  React.useEffect(() => { load(); }, [load]);
  return <BusinessShell activeHref="/business/promotions"><div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between"><div><h1 className="text-3xl font-black text-white">Promotions & Offers</h1><p className="mt-1 text-sm text-slate-400">Active Gas2Door promotions that may apply to eligible orders or campaigns.</p></div><Button variant="outline" onClick={load}><RefreshCw className="h-4 w-4" /> Refresh</Button></div>{error && <div className="mb-4 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">{error}</div>}<div className="grid gap-4 md:grid-cols-2">{rows.map((p: any) => <GlassCard key={p.id || p.promoCode} className="p-5"><div className="flex items-start justify-between gap-3"><div><BadgePercent className="mb-2 h-6 w-6 text-gas-teal" /><div className="text-xl font-extrabold text-white">{p.promoCode || p.name}</div><div className="mt-1 text-sm text-slate-400">{p.description || 'Active promotion'}</div></div><Pill>{labelize(p.type)}</Pill></div><div className="mt-4 grid gap-2 text-sm text-slate-300 md:grid-cols-3"><span>Value <b className="block text-white">{p.type === 'Percentage Discount' ? `${p.value}%` : money(p.value)}</b></span><span>Min order <b className="block text-white">{money(p.minOrderAmount)}</b></span><span>Valid until <b className="block text-white">{dateOnly(p.validUntil)}</b></span></div></GlassCard>)}{!rows.length && <GlassCard className="p-8 text-center text-slate-400 md:col-span-2">No active promotions right now.</GlassCard>}</div></BusinessShell>;
}
