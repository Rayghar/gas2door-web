"use client";
import React from "react";
import { useParams, useRouter } from "next/navigation";
import Script from "next/script"; 
import Link from "next/link";
import { TopNav } from "@/components/layout/TopNav";
import { AppShell } from "@/components/layout/AppShell";
import { GlassCard, GlassPanel } from "@/components/ui/Glass";
import { Button } from "@/components/ui/Button";
import { api } from "@/services/api";
import { endpoints } from "@/services/endpoints";
import { useAuth } from "@/state/auth";
import { Loader2, AlertCircle, CreditCard } from "lucide-react";

declare global {
  interface Window {
    MonnifySDK: any;
  }
}

export default function PaymentPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const router = useRouter();
  const { session } = useAuth();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const payWithMonnify = async () => {
    setLoading(true); 
    setError(null);
    
    try {
      if (!session?.accessToken) { 
        router.push(`/login?redirect=/payment/${orderId}`); 
        return; 
      }

      // 1. Get Config (Send platform: 'web' to get JSON config instead of Redirect URL)
      const res: any = await api.post(endpoints.payments.initialize, { 
        orderId, 
        platform: 'web' // <--- ✅ FIX: This tells backend to send Popup Config
      });

      // 2. Handle Response
      if (res.monnifyConfig) {
        // Option A: Popup Flow (Preferred)
        if (window.MonnifySDK) {
          window.MonnifySDK.initialize({
            ...res.monnifyConfig,
            onComplete: function (response: any) {
              console.log("Monnify Complete:", response);
              router.push(`/track/${orderId}`);
            },
            onClose: function (data: any) {
              console.log("Payment Closed");
              setLoading(false);
            }
          });
        } else {
          throw new Error("Payment SDK not loaded. Please refresh.");
        }
      } else if (res.checkoutUrl) {
        // Option B: Fallback Redirect Flow
        window.location.href = res.checkoutUrl;
      } else {
        throw new Error("Failed to load payment configuration.");
      }

    } catch (e: any) {
      console.error("Payment Init Error:", e);
      setError(e?.message || "Failed to initialize payment.");
      setLoading(false);
    }
  };

  return (
    <div>
      <Script src="https://sdk.monnify.com/plugin/monnify.js" strategy="lazyOnload" />

      <TopNav />
      <AppShell>
        <div className="max-w-xl mx-auto pt-20 px-4">
            <GlassCard className="p-8">
            <h1 className="text-3xl font-extrabold text-white">Complete Payment</h1>
            <p className="mt-2 text-sm text-gas-slate">
                Finalize your order to start delivery.
            </p>

            <div className="mt-8 space-y-4">
                <GlassPanel className="p-6">
                <div className="flex flex-col gap-3">
                    <Button 
                        size="lg" 
                        onClick={payWithMonnify} 
                        disabled={loading}
                        className="w-full bg-gas-teal text-gas-navy hover:bg-white"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                                Connecting...
                            </>
                        ) : (
                            <>
                                <CreditCard className="mr-2 h-4 w-4" /> Pay Now
                            </>
                        )}
                    </Button>
                    
                    <Button 
                        variant="ghost" 
                        onClick={() => router.push('/dashboard')}
                        className="text-gas-slate hover:text-white"
                    >
                        Cancel
                    </Button>
                </div>
                </GlassPanel>
            </div>

            {error && (
                <div className="mt-6 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 flex items-start gap-3">
                    <AlertCircle className="text-rose-400 shrink-0" size={18} />
                    <div className="text-sm text-rose-200">{error}</div>
                </div>
            )}
            </GlassCard>
        </div>
      </AppShell>
    </div>
  );
}