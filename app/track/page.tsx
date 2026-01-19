"use client";
import React from "react";
import Link from "next/link";
import { TopNav } from "@/components/layout/TopNav";
import { AppShell } from "@/components/layout/AppShell";
import { GlassCard, GlassPanel } from "@/components/ui/Glass";
import { Badge } from "@/components/ui/Badge";
import { Timeline } from "@/components/orders/Timeline";
import { api } from "@/services/api";
import { endpoints } from "@/services/endpoints";
import { useAuth } from "@/state/auth";

export default function TrackingHub() {
  const { session } = useAuth();
  const [orders, setOrders] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    (async () => {
      if (!session?.accessToken) { window.location.href="/login"; return; }
      try {
        const res: any = await api.get(endpoints.orders.mine);
        setOrders(res?.orders || res?.data || res || []);
      } finally { setLoading(false); }
    })();
  }, [session?.accessToken]);

  const active = orders.filter((o) => {
    const s = (o?.status || "").toLowerCase();
    return s && !["delivered","cancelled","canceled"].includes(s);
  }).slice(0, 6);

  return (
    <div>
      <TopNav />
      <AppShell activeHref="/track">
        <GlassCard className="p-6">
          <h1 className="text-3xl font-extrabold">Live Tracking</h1>
          <p className="mt-1 text-sm text-slate-600">Status cards first — no map anxiety.</p>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {loading && <div className="h-28 animate-pulse rounded-2xl bg-slate-200/60" />}
            {!loading && active.map((o) => (
              <Link key={o.id || o.orderId} href={`/track/${o.id || o.orderId}`}>
                <GlassPanel className="p-5 hover:bg-white/70">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold">Order #{o.id || o.orderId}</div>
                    <Badge className="border-gas-teal/20 text-gas-teal">{o.status}</Badge>
                  </div>
                  <div className="mt-4">
                    <Timeline status={o.status} />
                  </div>
                </GlassPanel>
              </Link>
            ))}
            {!loading && active.length === 0 && <div className="text-sm text-slate-600">No active orders right now.</div>}
          </div>
        </GlassCard>
      </AppShell>
    </div>
  );
}
