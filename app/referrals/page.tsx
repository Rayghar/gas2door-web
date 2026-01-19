"use client";
import React from "react";
import Link from "next/link";
import { TopNav } from "@/components/layout/TopNav";
import { AppShell } from "@/components/layout/AppShell";
import { GlassCard, GlassPanel } from "@/components/ui/Glass";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Gift, Copy, ArrowRight } from "lucide-react";

export default function ReferralsPage() {
  const [copied, setCopied] = React.useState(false);
  const code = "G2D-NEIGHBOR";

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  return (
    <div>
      <TopNav />
      <AppShell activeHref="/referrals">
        <div className="grid gap-6 lg:grid-cols-2">
          <GlassCard className="p-6">
            <Badge pulse className="mb-3">Earn while you cook</Badge>
            <h1 className="text-3xl font-extrabold">Refer & earn wallet credit.</h1>
            <p className="mt-2 text-sm text-slate-600">Share your code with neighbors. When they place their first order, you get rewarded.</p>

            <div className="mt-6 rounded-3xl bg-gradient-to-br from-gas-teal to-blue-500 p-1">
              <div className="rounded-[1.6rem] bg-white/70 p-6 backdrop-blur-glass">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-white/80 p-3 text-gas-teal shadow-sm">
                    <Gift className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase tracking-widest text-slate-500">Your code</div>
                    <div className="text-2xl font-extrabold tracking-tight">{code}</div>
                  </div>
                </div>

                <div className="mt-5 flex gap-2">
                  <Button onClick={copy} className="flex-1 gap-2">
                    <Copy className="h-4 w-4" /> {copied ? "Copied!" : "Copy code"}
                  </Button>
                  <Link href="/order/new" className="flex-1">
                    <Button variant="outline" className="w-full gap-2">
                      Place an order <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            <GlassPanel className="mt-5 p-4 text-sm text-slate-600">
              Suggestion: Drop your code in estate WhatsApp groups, or share with your concierge/security team.
            </GlassPanel>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="text-sm font-bold">How it works</div>
            <div className="mt-4 space-y-3 text-sm">
              <Step n="1" title="Share your code" desc="Send it to friends, neighbors, or your office group." />
              <Step n="2" title="They place first order" desc="They order on the web or app with the code." />
              <Step n="3" title="You get credit" desc="Wallet credit lands instantly after successful delivery." />
            </div>
          </GlassCard>
        </div>
      </AppShell>
    </div>
  );
}

function Step({ n, title, desc }: { n: string; title: string; desc: string }) {
  return (
    <div className="rounded-3xl border border-white/60 bg-white/55 p-4">
      <div className="flex items-start gap-3">
        <div className="h-8 w-8 shrink-0 rounded-2xl bg-gas-teal/10 text-gas-teal flex items-center justify-center font-extrabold">{n}</div>
        <div>
          <div className="font-bold">{title}</div>
          <div className="mt-1 text-slate-600">{desc}</div>
        </div>
      </div>
    </div>
  );
}
