"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Zap, Weight, ChevronRight, Loader2, Timer } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/Glass";
import { TopNav } from "@/components/layout/TopNav";
import { AppShell } from "@/components/layout/AppShell";
import { api } from "@/services/api";
import { endpoints } from "@/services/endpoints";
import { formatNaira } from "@/lib/money";

export default function HomePage() {
  const [loading, setLoading] = useState(true);
  const [pricePerKgNaira, setPricePerKgNaira] = useState(1100); 
  const [baseDeliveryFee, setBaseDeliveryFee] = useState(100000); 
  
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const conf: any = await api.get(endpoints.config.get || "/config");
        const fees = conf?.feeSettings || conf;
        const cylinders = conf?.cylinderSettings || [];

        if (fees) {
          if (fees.baseDeliveryFee) setBaseDeliveryFee(Number(fees.baseDeliveryFee));
        }

        if (cylinders && cylinders.length > 0) {
            const refCylinder = cylinders.find((c: any) => c.name.includes("12.5")) || cylinders[0];
            
            if (refCylinder) {
                const priceKobo = Number(refCylinder.price);
                const weight = Number(refCylinder.weightKg) || 12.5; 
                
                const rateNaira = (priceKobo / 100) / weight;
                setPricePerKgNaira(rateNaira);
            }
        }
      } catch (e) {
        console.warn("Using default pricing");
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, []);

  const deliveryNaira = baseDeliveryFee / 100;

  return (
    <div>
      <TopNav />
      
      {/* ✅ LAYOUT FIX: 
        Applied the exact dimensions from New Order Screen.
        - pb-16 pt-6: Standard vertical spacing.
        - max-w-6xl: Tighter width matching the form.
      */}
      <div className="pb-16 pt-6">
        <AppShell>
          <div className="max-w-6xl mx-auto px-4">
            
            {/* ✅ ALIGNMENT FIX: 
              - grid-cols-2: Standard split.
              - items-start: forces top alignment (removed items-center).
              - gap-10: Standard gap.
            */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
              
              {/* Left Content */}
              <div className="space-y-8 pt-4">
                
                <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-gas-teal/10 text-gas-teal text-xs font-bold uppercase tracking-widest border border-gas-teal/20 backdrop-blur-md">
                  <span className="w-2 h-2 rounded-full bg-gas-teal mr-2 animate-pulse"></span>
                  Now Serving Lekki & Ajah
                </div>
                
                <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-[1.1]">
                  Lagos Cooking. <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-gas-teal to-emerald-400 py-1">
                    Uninterrupted.
                  </span>
                </h1>
                
                <p className="text-lg text-slate-300 max-w-lg leading-relaxed">
                  We don't just deliver gas; we deliver peace of mind. 
                  Get <span className="text-white font-semibold">digital weight checks</span> on arrival, 
                  <span className="text-white font-semibold"> express delivery</span> when you're low, 
                  and <span className="text-white font-semibold">fair market pricing</span> every time.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 pt-2 w-full sm:w-auto">
                  <Link href="/order/new" className="w-full sm:w-auto">
                    <Button size="lg" className="w-full sm:w-auto bg-gas-teal text-gas-navy hover:bg-white transition-all shadow-lg shadow-gas-teal/20 h-14 text-base px-8 font-bold">
                      Refill Now <ArrowRight size={18} className="ml-2" />
                    </Button>
                  </Link>
                  <Button size="lg" variant="outline" className="w-full sm:w-auto border-white/10 text-white hover:bg-white/5 h-14 text-base px-8">
                    Get the App
                  </Button>
                </div>

                <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
                   <MiniFeature icon={<Weight size={18} />} label="Full Weight" />
                   <MiniFeature icon={<Zap size={18} />} label="Fast Delivery" />
                   <MiniFeature icon={<ShieldCheck size={18} />} label="Secure Pay" />
                </div>
              </div>

              {/* Right Content (Price Card) */}
              {/* Added sticky positioning to match the behavior of the Order Summary on the other page */}
              <div className="relative w-full max-w-lg lg:max-w-none mx-auto lg:sticky lg:top-28 h-fit hidden lg:block">
                {/* Glow Effect */}
                <div className="absolute -inset-1 bg-gradient-to-tr from-gas-teal/30 to-blue-600/30 rounded-[2.5rem] blur-2xl opacity-40 pointer-events-none" />
                
                <GlassCard className="p-8 md:p-10 relative border-white/10 shadow-2xl">
                  
                  <div className="text-center mb-8 border-b border-white/10 pb-8">
                    <div className="text-xs font-bold text-gas-teal uppercase tracking-widest mb-3">Current Market Rate</div>
                    <div className="flex items-baseline justify-center gap-1">
                        <span className="text-3xl font-bold text-white align-top mt-2">₦</span>
                        <span className="text-6xl sm:text-7xl font-extrabold text-white tracking-tighter">
                            {loading ? <Loader2 className="animate-spin h-16 w-16 text-gas-teal"/> : formatNaira(pricePerKgNaira).replace('₦', '')}
                        </span>
                        <span className="text-xl text-slate-400 font-medium">/ kg</span>
                    </div>
                    <p className="text-sm text-slate-400 mt-3">Standard market rate. No hidden markups.</p>
                  </div>

                  <div className="space-y-6 mb-8">
                    <BenefitRow 
                        icon={<Weight className="text-emerald-400" size={24} />}
                        title="Digital Scale Verification"
                        desc="We weigh it in front of you."
                    />
                    <BenefitRow 
                        icon={<Timer className="text-amber-400" size={24} />}
                        title="35-45 Minute Delivery"
                        desc="Fastest dispatch in your zone."
                    />
                    <BenefitRow 
                        icon={<ShieldCheck className="text-blue-400" size={24} />}
                        title="Safety Guaranteed"
                        desc="Tamper-proof seals on every cylinder."
                    />
                  </div>

                  <Link href="/order/new" className="block">
                    <Button className="w-full bg-white text-gas-navy hover:bg-gas-teal hover:text-white border-0 h-14 rounded-xl text-lg font-bold transition-all transform hover:scale-[1.02] shadow-xl">
                      Order Refill <ChevronRight size={20} className="ml-1" />
                    </Button>
                  </Link>
                  
                  <div className="mt-5 text-center">
                    <span className="text-xs text-slate-500 font-medium tracking-wide">
                        Delivery from {formatNaira(1500)}
                    </span>
                  </div>

                </GlassCard>
              </div>

            </div>
          </div>
        </AppShell>
      </div>
    </div>
  );
}

// --- Helper Components ---

function MiniFeature({ icon, label }: { icon: any, label: string }) {
    return (
        <div className="flex items-center justify-center sm:justify-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5 backdrop-blur-sm">
            <div className="text-gas-teal shrink-0">{icon}</div>
            <div className="text-sm font-bold text-white whitespace-nowrap">{label}</div>
        </div>
    )
}

function BenefitRow({ icon, title, desc }: { icon: any, title: string, desc: string }) {
    return (
        <div className="flex items-start gap-5">
            <div className="p-3 rounded-xl bg-white/5 border border-white/5 shrink-0">
                {icon}
            </div>
            <div>
                <div className="text-white font-bold text-base">{title}</div>
                <div className="text-slate-400 text-sm mt-0.5 leading-snug">{desc}</div>
            </div>
        </div>
    )
}