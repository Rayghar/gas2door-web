'use client';

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, MapPin, Truck, CreditCard, AlertCircle, Loader2 } from "lucide-react";
import { TopNav } from "@/components/layout/TopNav";
import { AppShell } from "@/components/layout/AppShell";
import { GlassCard, GlassPanel } from "@/components/ui/Glass";
import { Button } from "@/components/ui/Button";
import { orderApi } from "@/services/orders";
import { formatNaira } from "@/lib/money";

// 1. Move the logic that uses searchParams into this child component
function SummaryContent() {
  const sp = useSearchParams();
  const orderId = sp.get("orderId");

  const [order, setOrder] = useState<any | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) return;
    setErr(null);
    orderApi
      .getById(orderId)
      .then((res: any) => setOrder(res.order || res.data || res))
      .catch((e: any) => setErr(e?.message || "Failed to load order"));
  }, [orderId]);

  const isPending = order?.status === 'Pending Payment' || order?.paymentStatus === 'Pending';

  return (
    <div className="max-w-3xl mx-auto px-4 pt-10">
      <GlassCard className="p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${isPending ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-400'}`}>
              {isPending ? "Payment Required" : "Order Placed"}
            </div>
            <h1 className="mt-3 text-3xl font-extrabold text-white">Order Summary</h1>
            <p className="mt-2 text-gas-slate">
              {isPending 
                ? "Your order has been created but not paid for yet." 
                : "Your order is now in our system. You can track it live."}
            </p>
          </div>
          {isPending ? (
            <AlertCircle size={42} className="text-amber-500" />
          ) : (
            <CheckCircle2 size={42} className="text-emerald-500" />
          )}
        </div>

        {err && <div className="mt-5 text-sm font-semibold text-red-400">{err}</div>}

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Stat label="Order ID" value={orderId ? `#${orderId.substring(0,8)}` : "—"} />
          <Stat label="Status" value={order?.status || "Pending"} />
          <Stat
            label="Total"
            value={order?.grandTotal ? formatNaira(order.grandTotal) : "—"}
          />
        </div>

        <div className="mt-7 grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Action Card */}
          <GlassPanel className="p-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-gas-teal/10 text-gas-teal grid place-items-center">
                {isPending ? <CreditCard size={18} /> : <Truck size={18} />}
              </div>
              <div>
                <div className="font-extrabold text-white">Next Step</div>
                <div className="text-sm text-gas-slate">
                  {isPending ? "Complete payment to start delivery." : "Track rider status & ETA."}
                </div>
              </div>
            </div>

            <div className="mt-4">
              {isPending ? (
                <Link href={`/payment/${orderId}`}>
                  <Button className="w-full bg-gas-teal text-gas-navy hover:bg-white">
                    Pay Now
                  </Button>
                </Link>
              ) : (
                <Link href={orderId ? `/track/${orderId}` : "/orders"}>
                  <Button className="w-full">Track Order</Button>
                </Link>
              )}
            </div>
          </GlassPanel>

          {/* Address Card */}
          <GlassPanel className="p-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-white/5 text-slate-300 grid place-items-center">
                <MapPin size={18} />
              </div>
              <div>
                <div className="font-extrabold text-white">Delivery Address</div>
                <div className="text-sm text-gas-slate truncate max-w-[150px]">
                  {order?.deliveryAddressSnapshot?.fullAddress || order?.deliveryAddress?.addressLine || "—"}
                </div>
              </div>
            </div>

            <div className="mt-4">
              <Link href="/addresses">
                <Button variant="outline" className="w-full">
                  Manage Addresses
                </Button>
              </Link>
            </div>
          </GlassPanel>
        </div>

        <div className="mt-6 text-sm text-gas-slate">
          Need help?{" "}
          <Link className="text-gas-teal font-semibold hover:underline" href="/support">
            Contact support
          </Link>.
        </div>
      </GlassCard>
    </div>
  );
}

// 2. Wrap the content in Suspense to fix the build error
export default function OrderSummaryPage() {
  return (
    <div>
      <TopNav />
      <AppShell>
        <Suspense fallback={
          <div className="flex min-h-[50vh] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-gas-teal" />
          </div>
        }>
          <SummaryContent />
        </Suspense>
      </AppShell>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <GlassPanel className="p-5">
      <div className="text-[11px] font-bold text-gas-slate uppercase tracking-wider">
        {label}
      </div>
      <div className="text-lg font-extrabold text-white mt-1">{value}</div>
    </GlassPanel>
  );
}