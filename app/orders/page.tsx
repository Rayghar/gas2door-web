"use client";
import React from "react";
import Link from "next/link";
import { TopNav } from "@/components/layout/TopNav";
import { AppShell } from "@/components/layout/AppShell";
import { GlassCard, GlassPanel } from "@/components/ui/Glass";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { api } from "@/services/api";
import { endpoints } from "@/services/endpoints";
import { useAuth } from "@/state/auth";
import { ArrowRight } from "lucide-react";

export default function OrdersPage() {
  const { session } = useAuth();
  const [q, setQ] = React.useState("");
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

  const filtered = orders.filter((o) => String(o.id || o.orderId || "").toLowerCase().includes(q.toLowerCase()));

  return (
    <div>
      <TopNav />
      <AppShell activeHref="/orders">
        <GlassCard className="p-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="text-3xl font-extrabold text-white">Orders</h1>
              <p className="mt-1 text-sm text-gas-slate">Search, view details, reorder.</p>
            </div>
            <div className="w-full sm:w-72">
              <Input placeholder="Search by order id…" value={q} onChange={(e)=>setQ(e.target.value)} />
            </div>
          </div>

          <div className="mt-5 space-y-2">
            {loading && <div className="h-24 animate-pulse rounded-2xl bg-white/5" />}
            
            {!loading && filtered.map((o) => {
               // ✅ LOGIC: If payment is pending, redirect to Payment Page
               const isPending = o.status === 'Pending Payment' || o.paymentStatus === 'Pending';
               const targetHref = isPending ? `/payment/${o.id || o.orderId}` : `/orders/${o.id || o.orderId}`;
               
               return (
                <Link key={o.id || o.orderId} href={targetHref}>
                  <GlassPanel className={`p-4 hover:bg-white/5 transition group relative overflow-hidden ${isPending ? 'border-l-4 border-l-gas-teal' : ''}`}>
                    <div className="flex items-center justify-between relative z-10">
                      <div>
                        <div className="text-sm font-semibold text-white group-hover:text-gas-teal transition-colors">
                            Order #{String(o.id || o.orderId).substring(0, 8)}...
                        </div>
                        <div className="text-xs text-gas-slate">
                            {o.createdAt || o.orderDate ? new Date(o.createdAt || o.orderDate).toLocaleDateString() : ""}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        {isPending && (
                            <div className="hidden sm:flex items-center gap-1 text-xs font-bold text-gas-teal animate-pulse">
                                Pay Now <ArrowRight size={12} />
                            </div>
                        )}
                        <Badge className={isPending ? "bg-gas-teal text-gas-navy hover:bg-gas-teal" : "border-gas-teal/20 text-gas-teal"}>
                            {o.status || "—"}
                        </Badge>
                      </div>
                    </div>
                  </GlassPanel>
                </Link>
              );
            })}
            
            {!loading && filtered.length === 0 && <div className="text-sm text-gas-slate">No matching orders found.</div>}
          </div>
        </GlassCard>
      </AppShell>
    </div>
  );
}