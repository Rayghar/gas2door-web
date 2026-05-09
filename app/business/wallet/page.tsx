"use client";
import React from "react";
import { RefreshCw, WalletCards } from "lucide-react";
import { BusinessShell, StatCard } from "@/components/business/BusinessShell";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/Glass";
import { businessApi, dateTime, money } from "@/services/business";

export default function BusinessWalletPage() {
  const [data, setData] = React.useState<any>({ transactions: [] });
  const [error, setError] = React.useState("");
  const load = React.useCallback(async () => { setError(""); try { setData(await businessApi.wallet()); } catch (e: any) { setError(e?.message || "Unable to load wallet."); } }, []);
  React.useEffect(() => { load(); }, [load]);
  const rows = data?.transactions || [];
  return <BusinessShell activeHref="/business/wallet"><div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between"><div><h1 className="text-3xl font-black text-white">Corporate Wallet</h1><p className="mt-1 text-sm text-slate-400">Wallet balance and recent transaction history for this portal user.</p></div><Button variant="outline" onClick={load}><RefreshCw className="h-4 w-4" /> Refresh</Button></div>{error && <div className="mb-4 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">{error}</div>}<div className="mb-6 grid gap-4 md:grid-cols-3"><StatCard label="Wallet balance" value={money(data?.walletBalance)} /><StatCard label="Credit limit" value={money(data?.client?.creditLimit)} /><StatCard label="Transactions shown" value={rows.length} /></div><GlassCard className="p-5"><h2 className="mb-4 font-extrabold text-white"><WalletCards className="mr-2 inline h-5 w-5 text-gas-teal" /> Recent wallet transactions</h2><div className="space-y-3">{rows.map((r: any) => <div key={r.id || r._id} className="rounded-2xl border border-white/10 bg-white/5 p-4"><div className="flex items-center justify-between"><div><div className="font-bold text-white">{r.description || r.type || 'Wallet transaction'}</div><div className="mt-1 text-xs text-slate-400">{dateTime(r.createdAt)} · {r.status}</div></div><div className="font-extrabold text-white">{money(r.amount)}</div></div></div>)}{!rows.length && <p className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-400">No wallet transactions yet.</p>}</div></GlassCard></BusinessShell>;
}
