"use client";

import React, { useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation"; // ✅ Added for redirection
import { TopNav } from "@/components/layout/TopNav";
import { AppShell } from "@/components/layout/AppShell";
import { GlassCard, GlassPanel } from "@/components/ui/Glass";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Timeline } from "@/components/orders/Timeline";
import { useAuth } from "@/state/auth";
import { api } from "@/services/api";
import { endpoints } from "@/services/endpoints";
import { useQuery } from "@tanstack/react-query";
import { extractArray, getId } from "../../lib/utils"; 
import { 
  Plus, MapPin, Tag, Bell, Wallet, 
  ArrowRight, Loader2, Package, Clock, CreditCard, UserPlus
} from "lucide-react";
import { formatNaira } from "@/lib/money";

export default function DashboardPage() {
  const { session } = useAuth();
  const router = useRouter(); // ✅ Init router
  
  // ✅ FIX: Redirect to login if no session is found (Logout handling)
  useEffect(() => {
    // If session is null (logged out), force redirect to login
    if (!session) {
      router.replace("/login");
    }
  }, [session, router]);

  // 1. Fetch Data (Only if session exists)
  const { data: user } = useQuery({ 
    queryKey: ["user", "me"], 
    queryFn: () => api.get(endpoints.user.me),
    enabled: !!session 
  });

  const { data: rawOrders, isLoading } = useQuery({ 
    queryKey: ["orders", "mine"], 
    queryFn: () => api.get(endpoints.orders.mine),
    enabled: !!session
  });

  const { data: wallet } = useQuery({ 
    queryKey: ["wallet"], 
    queryFn: () => api.get(endpoints.wallet.get),
    enabled: !!session
  });

  // 2. Normalize Data
  const orders = useMemo(() => extractArray(rawOrders), [rawOrders]);
  const name = (user?.name || user?.fullName || "Neighbor").split(" ")[0];
  
  // Check if Guest (Email contains 'guest' or is missing)
  const isGuest = user?.email?.includes('guest') || !user?.email;

  // Find active order
  const activeOrder = orders.find((o: any) => {
    const s = (o.status || "").toLowerCase();
    return s && !["delivered", "cancelled", "canceled", "completed"].includes(s);
  });

  const activeIsPending = activeOrder?.status === 'Pending Payment' || activeOrder?.paymentStatus === 'Pending';

  const greeting = useMemo(() => {
    const hr = new Date().getHours();
    if (hr < 12) return "Good morning";
    if (hr < 18) return "Good afternoon";
    return "Good evening";
  }, []);

  // ✅ FIX: Show a clean loading spinner while checking session/redirecting
  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#020617]">
        <Loader2 className="h-10 w-10 animate-spin text-gas-teal" />
      </div>
    );
  }

  return (
    <div>
      <TopNav />
      <AppShell activeHref="/dashboard">
        <div className="space-y-8">
          
          {/* Hero Section */}
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="text-sm font-medium text-gas-teal/80 uppercase tracking-wider mb-1">
                {greeting}, {name}
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-white">
                Kitchen Status: <span className="text-emerald-400">Secured</span>
              </h1>
            </div>
            <Link href="/order/new">
              <Button className="w-full md:w-auto shadow-lg shadow-gas-teal/20" size="lg">
                <Plus className="mr-2 h-5 w-5" /> Refill Gas
              </Button>
            </Link>
          </div>

          {/* ✅ GUEST UPGRADE BANNER */}
          {isGuest && (
            <GlassCard className="p-4 bg-gradient-to-r from-indigo-900/50 to-purple-900/50 border-indigo-500/30">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-300">
                            <UserPlus size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-white">Create an Account</h3>
                            <p className="text-sm text-indigo-200">Save your addresses and get access to wallet features.</p>
                        </div>
                    </div>
                    <Link href="/upgrade-account">
                        <Button variant="outline" size="sm" className="border-indigo-400 text-indigo-100 hover:bg-indigo-500/20">
                            Upgrade Now
                        </Button>
                    </Link>
                </div>
            </GlassCard>
          )}

          <div className="grid gap-6 lg:grid-cols-3">
            
            {/* --- LEFT COLUMN (Main) --- */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Active Order Card */}
              {isLoading ? (
                <SkeletonCard />
              ) : activeOrder ? (
                <GlassCard className="border-l-4 border-l-gas-teal p-6 relative overflow-hidden group">
                  <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gas-teal/10 blur-3xl group-hover:bg-gas-teal/20 transition duration-700" />

                  <div className="relative z-10 flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gas-teal opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-gas-teal"></span>
                        </span>
                        <h3 className="text-lg font-bold text-white">
                            {activeIsPending ? "Payment Pending" : "Order in Progress"}
                        </h3>
                      </div>
                      <p className="text-slate-400 text-sm mt-1">
                        ID: <span className="font-mono text-gas-teal">#{getId(activeOrder).slice(0,8)}</span>
                      </p>
                    </div>
                    
                    {/* ✅ SMART ACTION BUTTON */}
                    <Link href={activeIsPending ? `/payment/${getId(activeOrder)}` : `/track/${getId(activeOrder)}`}>
                      <Button variant={activeIsPending ? "default" : "outline"} size="sm" className={activeIsPending ? "bg-gas-teal text-gas-navy" : ""}>
                        {activeIsPending ? (
                            <> <CreditCard className="mr-2 h-4 w-4"/> Pay Now </>
                        ) : (
                            "Track Live"
                        )}
                      </Button>
                    </Link>
                  </div>

                  <div className="mt-6">
                    <GlassPanel className="p-4 bg-black/20 border-white/5">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-sm text-slate-300 font-medium">Status</span>
                        <Badge className="bg-gas-teal text-gas-navy border-none font-bold">
                          {activeOrder.status}
                        </Badge>
                      </div>
                      <Timeline status={activeOrder.status} />
                    </GlassPanel>
                  </div>
                </GlassCard>
              ) : (
                <div className="rounded-3xl border border-dashed border-white/10 bg-white/5 p-8 text-center hover:bg-white/10 transition cursor-pointer group">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gas-teal/10 text-gas-teal group-hover:scale-110 transition">
                    <Package size={32} />
                  </div>
                  <h3 className="text-lg font-bold text-white">No active orders</h3>
                  <p className="text-slate-400 text-sm mt-1 mb-6">
                    Your kitchen is running smoothly. Need a top-up?
                  </p>
                  <Link href="/order/new">
                    <Button variant="outline">Start New Order</Button>
                  </Link>
                </div>
              )}

              {/* Recent Orders */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white">Recent History</h3>
                  <Link href="/orders" className="text-sm text-gas-teal hover:underline flex items-center">
                    View All <ArrowRight size={14} className="ml-1" />
                  </Link>
                </div>
                
                <div className="space-y-3">
                  {isLoading ? (
                    <>
                      <SkeletonRow />
                      <SkeletonRow />
                    </>
                  ) : orders.slice(0, 3).map((o: any) => {
                    const isPending = o.status === 'Pending Payment' || o.paymentStatus === 'Pending';
                    return (
                        <Link key={getId(o)} href={isPending ? `/payment/${getId(o)}` : `/track/${getId(o)}`}>
                        <GlassCard className="p-4 hover:bg-white/10 transition flex items-center justify-between group">
                            <div className="flex items-center gap-4">
                            <div className={`h-10 w-10 rounded-full flex items-center justify-center transition ${isPending ? 'bg-gas-teal/20 text-gas-teal' : 'bg-white/5 text-slate-400'}`}>
                                {isPending ? <CreditCard size={18} /> : <Clock size={18} />}
                            </div>
                            <div>
                                <div className="text-sm font-bold text-white">
                                {o.items?.[0]?.productName || "Gas Refill"} 
                                {o.items?.length > 1 && ` +${o.items.length - 1}`}
                                </div>
                                <div className="text-xs text-slate-500">
                                {new Date(o.createdAt).toLocaleDateString()} • {formatNaira(o.grandTotal || o.totalAmount || o.total)}
                                </div>
                            </div>
                            </div>
                            <Badge className={o.status === 'Delivered' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : ''}>
                            {o.status}
                            </Badge>
                        </GlassCard>
                        </Link>
                    );
                  })}
                  
                  {!isLoading && orders.length === 0 && (
                    <div className="text-center py-8 text-slate-500 text-sm">
                      No past orders found.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* --- RIGHT COLUMN (Stats & Actions) --- */}
            <div className="space-y-6">
              
              {/* Wallet Widget */}
              <GlassCard className="p-6 bg-gradient-to-br from-gas-navy via-[#0F172A] to-[#0F172A] border-gas-teal/20">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold uppercase text-slate-400 tracking-widest">Wallet</span>
                  <Wallet className="h-5 w-5 text-gas-teal" />
                </div>
                <div className="text-3xl font-extrabold text-white mb-6">
                  {formatNaira(wallet?.balance || 0)}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" className="w-full text-xs h-9">History</Button>
                  <Button className="w-full text-xs h-9 bg-white/10 hover:bg-white/20 border-0">Top Up</Button>
                </div>
              </GlassCard>

              {/* Quick Actions */}
              <GlassCard className="p-5">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Quick Links</div>
                <div className="grid grid-cols-2 gap-3">
                  <QuickLink href="/addresses" icon={<MapPin size={18}/>} label="Addresses" />
                  <QuickLink href="/promotions" icon={<Tag size={18}/>} label="Promos" />
                  <QuickLink href="/notifications" icon={<Bell size={18}/>} label="Alerts" />
                  <QuickLink href="/support" icon={<ArrowRight size={18}/>} label="Support" />
                </div>
              </GlassCard>

            </div>
          </div>
        </div>
      </AppShell>
    </div>
  );
}

// -- Sub Components --

function QuickLink({ href, icon, label }: { href: string; icon: any; label: string }) {
  return (
    <Link href={href} className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-white/5 p-4 hover:bg-white/10 border border-white/5 transition hover:scale-105 active:scale-95">
      <div className="text-gas-teal">{icon}</div>
      <div className="text-xs font-medium text-slate-300">{label}</div>
    </Link>
  );
}

function SkeletonCard() {
  return <div className="h-48 w-full animate-pulse rounded-3xl bg-white/5" />;
}

function SkeletonRow() {
  return <div className="h-16 w-full animate-pulse rounded-3xl bg-white/5" />;
}