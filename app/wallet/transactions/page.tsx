"use client";
import React from "react";
import Link from "next/link";
import { TopNav } from "@/components/layout/TopNav";
import { AppShell } from "@/components/layout/AppShell";
import { GlassCard, GlassPanel } from "@/components/ui/Glass";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { CreditCard, ArrowLeft } from "lucide-react";

const MOCK = [
  { id: "TX-88412", type: "Top up", amount: 10000, status: "Success", date: "Today, 10:22" },
  { id: "TX-77301", type: "Refund", amount: 2500, status: "Success", date: "Dec 12, 09:14" },
  { id: "TX-66019", type: "Debit", amount: -13750, status: "Success", date: "Dec 01, 18:02" }
];

export default function WalletTransactionsPage() {
  return (
    <div>
      <TopNav />
      <AppShell activeHref="/wallet">
        <div className="grid gap-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-extrabold">Wallet Transactions</h1>
              <p className="mt-1 text-sm text-slate-600">Track top-ups, refunds, and order debits.</p>
            </div>
            <Link href="/wallet">
              <Button variant="ghost" className="gap-2"><ArrowLeft className="h-4 w-4" /> Back</Button>
            </Link>
          </div>

          <GlassCard className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="rounded-2xl bg-gas-teal/10 p-2 text-gas-teal"><CreditCard className="h-5 w-5" /></div>
                <div className="text-sm font-bold">Recent</div>
              </div>
              <Badge>Secure • Instant updates</Badge>
            </div>

            <div className="mt-5 overflow-hidden rounded-2xl border border-white/60">
              <table className="w-full text-sm">
                <thead className="bg-white/60">
                  <tr className="text-left text-slate-600">
                    <th className="px-4 py-3">Transaction</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white/40">
                  {MOCK.map((t) => (
                    <tr key={t.id} className="border-t border-white/60">
                      <td className="px-4 py-3 font-semibold">{t.id}</td>
                      <td className="px-4 py-3">{t.type}</td>
                      <td className="px-4 py-3 font-bold">{t.amount < 0 ? "-" : ""}₦{Math.abs(t.amount).toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-gas-teal/10 px-3 py-1 text-xs font-bold text-gas-teal">{t.status}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{t.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <GlassPanel className="mt-5 p-4 text-sm text-slate-600">
              Tip: When you earn a referral bonus or get a refund, it lands here instantly and can be used on your next order.
            </GlassPanel>
          </GlassCard>
        </div>
      </AppShell>
    </div>
  );
}
