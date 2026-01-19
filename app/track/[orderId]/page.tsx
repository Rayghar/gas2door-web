"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { TopNav } from "@/components/layout/TopNav";
import { AppShell } from "@/components/layout/AppShell";
import { GlassCard, GlassPanel } from "@/components/ui/Glass";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Timeline } from "@/components/orders/Timeline";
import { api } from "@/services/api";
import { endpoints } from "@/services/endpoints";
import { useAuth } from "@/state/auth";
import { Phone, MessageCircle, ChevronLeft, ShieldCheck, MapPin } from "lucide-react";
import { formatNaira } from "@/lib/money";

export default function TrackingDetail() {
  const { orderId } = useParams<{ orderId: string }>(); // Validated param
  const router = useRouter();
  const { session } = useAuth();
  
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!session?.accessToken) { router.push("/login"); return; }
    
    setLoading(true);
    api.get(endpoints.orders.byId(orderId))
      .then((res: any) => {
        // Handle { order: ... } vs raw object
        setOrder(res.order || res); 
      })
      .catch((e) => setError(e.message || "Failed to load order"))
      .finally(() => setLoading(false));
  }, [orderId, session, router]);

  if (loading) return <div className="p-20 text-center text-slate-400">Loading tracking info...</div>;
  if (error) return <div className="p-20 text-center text-red-400">Error: {error}</div>;
  if (!order) return null;

  const driver = order.driver || order.rider;

  return (
    <div>
      <TopNav />
      <AppShell activeHref="/track">
        <div className="mx-auto max-w-3xl space-y-6">
          
          <Link href="/dashboard" className="inline-flex items-center text-sm text-slate-400 hover:text-white transition">
            <ChevronLeft size={16} className="mr-1" /> Back to Dashboard
          </Link>

          {/* Status Header */}
          <GlassCard className="p-8 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gas-teal to-transparent opacity-50" />
            
            <Badge className="mb-4 bg-gas-teal/10 text-gas-teal border-gas-teal/20 text-sm py-1 px-4">
              {order.status}
            </Badge>
            
            <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2">
              {order.status === "Delivered" ? "Arrived Safely" : "On the way"}
            </h1>
            <p className="text-slate-400 max-w-md mx-auto">
              Order #{orderId.slice(0,8)} • {formatNaira(order.totalAmount || order.total)}
            </p>

            <div className="mt-8">
              <Timeline status={order.status} />
            </div>
          </GlassCard>

          <div className="grid md:grid-cols-2 gap-6">
            
            {/* Driver Card */}
            <GlassCard className="p-6">
              <h3 className="text-xs font-bold uppercase text-slate-500 tracking-widest mb-4">Delivery Partner</h3>
              
              {driver ? (
                <>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="h-14 w-14 rounded-full bg-slate-700 flex items-center justify-center text-xl font-bold">
                      {driver.name?.[0] || "D"}
                    </div>
                    <div>
                      <div className="font-bold text-lg text-white">{driver.name}</div>
                      <div className="flex items-center gap-1 text-xs text-emerald-400 font-medium">
                        <ShieldCheck size={12} /> Verified Partner
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" className="h-10"><Phone size={16} className="mr-2"/> Call</Button>
                    <Button variant="outline" className="h-10"><MessageCircle size={16} className="mr-2"/> Chat</Button>
                  </div>
                </>
              ) : (
                <div className="py-6 text-center">
                  <div className="animate-pulse mb-2 text-gas-teal font-bold">Matching Driver...</div>
                  <p className="text-xs text-slate-500">We are assigning the nearest rider to you.</p>
                </div>
              )}
            </GlassCard>

            {/* Details Card */}
            <GlassCard className="p-6">
              <h3 className="text-xs font-bold uppercase text-slate-500 tracking-widest mb-4">Delivery Details</h3>
              
              <div className="space-y-4">
                <div className="flex gap-3">
                  <MapPin className="text-gas-teal shrink-0" size={20} />
                  <div>
                    <div className="text-sm text-slate-400">Destination</div>
                    <div className="text-sm font-medium text-white leading-snug">
                      {order.deliveryAddress?.fullAddress || "Address on file"}
                    </div>
                  </div>
                </div>

                <div className="h-px bg-white/5" />

                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Items</span>
                  <span className="text-white font-medium">{order.items?.length || 1} Cylinders</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Payment</span>
                  <span className="text-white font-medium capitalize">{order.paymentMethod === 'payOnPickup' ? 'Cash/Transfer on Delivery' : order.paymentMethod}</span>
                </div>
              </div>
            </GlassCard>
          </div>

        </div>
      </AppShell>
    </div>
  );
}