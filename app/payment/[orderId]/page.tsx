"use client";

import React, { useEffect, useState } from "react";
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
import { formatNaira } from "@/lib/money";
import { Loader2, AlertCircle, Lock, MapPin, Receipt, CheckCircle2, Zap, User, Phone } from "lucide-react";

// --- HELPERS ---

// Safe number extractor (handles strings, nulls, undefined)
const getVal = (val: any) => {
  if (val === undefined || val === null || val === "") return 0;
  const num = Number(val);
  return isNaN(num) ? 0 : num;
};

// Consistent row for the price breakdown
function SummaryLine({ label, value, isTotal = false, isDiscount = false }: { label: string, value: string, isTotal?: boolean, isDiscount?: boolean }) {
  return (
    <div className={`flex justify-between items-center ${isTotal ? 'text-lg mt-4 pt-4 border-t border-white/10' : 'text-sm'}`}>
      <span className={isTotal ? "text-white font-bold" : "text-gas-slate font-medium"}>{label}</span>
      <span className={`${isTotal ? "text-white font-extrabold text-xl" : "text-white font-semibold"} ${isDiscount ? "text-emerald-400" : ""}`}>
        {value}
      </span>
    </div>
  );
}

declare global {
  interface Window {
    MonnifySDK: any;
  }
}

export default function PaymentPage() {
  const params = useParams();
  const orderId = params?.orderId as string;
  const router = useRouter();
  const { session } = useAuth();
  
  const [order, setOrder] = useState<any>(null);
  const [loadingOrder, setLoadingOrder] = useState(true);
  const [initializing, setInitializing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 1. Fetch Order Details
  useEffect(() => {
    if (!session?.accessToken || !orderId) return;
    const fetchOrder = async () => {
        try {
            const res: any = await api.get(`/orders/${orderId}`);
            // Robustly handle response structure
            const data = res?.order || res?.data || res;
            if (data) {
                setOrder(data);
            } else {
                throw new Error("Order not found");
            }
        } catch (e) {
            console.error(e);
            setError("Could not load order details.");
        } finally {
            setLoadingOrder(false);
        }
    }
    fetchOrder();
  }, [orderId, session?.accessToken]);

  // 2. Trigger Monnify (Embedded Popup)
  const payWithMonnify = async () => {
    setInitializing(true); 
    setError(null);
    
    try {
      if (!window.MonnifySDK) {
         throw new Error("Payment gateway is loading. Please check your internet.");
      }

      // Initialize Payment on Backend
      const res: any = await api.post(endpoints.payments.initialize, { orderId });
      const config = res.monnifyConfig;

      if (config) {
        window.MonnifySDK.initialize({
          ...config,
          onComplete: function (response: any) {
            // Redirect to tracking on success
            router.push(`/track/${orderId}`);
          },
          onClose: function (data: any) {
            setInitializing(false);
          }
        });
      } else if (res.checkoutUrl) {
        // Fallback redirect
        window.location.href = res.checkoutUrl;
      } else {
        throw new Error("Invalid payment configuration received from server.");
      }

    } catch (e: any) {
      console.error("Payment Init Error:", e);
      setError(e?.message || "Failed to initialize payment.");
      setInitializing(false);
    }
  };

  if (loadingOrder) {
      return (
          <div className="min-h-screen bg-[#020617] flex items-center justify-center">
              <Loader2 className="text-gas-teal animate-spin" size={40} />
          </div>
      )
  }

  // --- CALCULATION LOGIC (Enhanced) ---
  // Amounts are assumed to be in KOBO (from backend). We divide by 100 for display.
  
  // 1. Calculate Items Total (Fallback if missing in root object)
  const calculatedItemsTotal = order?.items?.reduce((acc: number, item: any) => {
      const price = getVal(item.unitPrice) || getVal(item.price);
      const qty = getVal(item.quantity);
      return acc + (price * qty);
  }, 0) || 0;

  // Check all possible field names for Subtotal
  const itemsTotal = getVal(order?.itemsTotal) || getVal(order?.itemsSubtotal) || getVal(order?.subTotal) || calculatedItemsTotal;
  
  // 2. Fees
  const deliveryFee = getVal(order?.deliveryFee) || 0;
  
  // Check common field names for Service Charge (serviceFeeAmount matches Flutter app)
  const serviceCharge = getVal(order?.serviceCharge) || getVal(order?.serviceFee) || getVal(order?.serviceFeeAmount) || 0; 
  
  // Check common field names for VAT (vatAmount matches Flutter app)
  const vat = getVal(order?.vat) || getVal(order?.vatAmount) || getVal(order?.tax) || 0;
  
  // 3. Final Total
  // Use backend total if available, otherwise sum the parts manually
  const totalAmount = getVal(order?.totalAmount) || getVal(order?.finalAmountPaid) || (itemsTotal + deliveryFee + serviceCharge + vat);

  return (
    <div>
      <Script src="https://sdk.monnify.com/plugin/monnify.js" strategy="lazyOnload" />
      
      <TopNav />
      
      <div className="pt-24 pb-16">
        <AppShell>
            <div className="max-w-5xl mx-auto px-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
                    
                    {/* LEFT COLUMN: Order Details */}
                    <div className="space-y-6">
                        <div>
                            <div className="flex items-center gap-2 text-gas-teal mb-2">
                                <Receipt size={20} />
                                <span className="text-xs font-bold uppercase tracking-widest">Payment</span>
                            </div>
                            <h1 className="text-3xl font-extrabold text-white">Review & Pay</h1>
                            <p className="text-gas-slate mt-2">Complete your payment securely to start delivery.</p>
                        </div>

                        {/* Delivery Info Card */}
                        <GlassCard className="p-6">
                            <h3 className="text-white font-bold mb-4 flex items-center gap-2 border-b border-white/10 pb-3">
                                <MapPin size={18} className="text-gas-teal"/> Delivery Details
                            </h3>
                            <div className="space-y-4 text-sm">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3 text-gas-slate">
                                        <User size={16} /> Recipient
                                    </div>
                                    <div className="text-white font-medium text-right">{order?.recipientName}</div>
                                </div>
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3 text-gas-slate">
                                        <Phone size={16} /> Phone
                                    </div>
                                    <div className="text-white font-medium text-right">{order?.recipientPhone}</div>
                                </div>
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3 text-gas-slate shrink-0">
                                        <MapPin size={16} /> Address
                                    </div>
                                    <div className="text-white font-medium text-right max-w-[200px]">
                                        {order?.deliveryAddress?.fullAddress || order?.deliveryAddress?.street || "Address provided"}
                                        {order?.deliveryAddress?.landmark && (
                                            <div className="text-gas-teal/80 text-xs mt-1 italic">Near: {order?.deliveryAddress?.landmark}</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </GlassCard>

                        {/* Order Items List */}
                        <div className="space-y-3">
                            <h3 className="text-xs font-bold text-gas-slate uppercase tracking-widest px-1">Items in Order</h3>
                            {order?.items?.map((item: any, i: number) => (
                                <GlassPanel key={i} className="p-4 flex items-center justify-between group hover:bg-white/5 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-full bg-gas-teal/10 flex items-center justify-center text-gas-teal font-bold text-sm">
                                            {item.quantity}x
                                        </div>
                                        <div>
                                            <div className="text-white font-bold">{item.productName}</div>
                                            <div className="text-xs text-gas-slate">
                                                {formatNaira((getVal(item.unitPrice) || getVal(item.price))/100)} / unit
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-white font-mono font-medium">
                                        {formatNaira(((getVal(item.unitPrice) || getVal(item.price)) * getVal(item.quantity))/100)}
                                    </div>
                                </GlassPanel>
                            ))}
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Payment Card */}
                    <div className="lg:sticky lg:top-28">
                        <GlassCard className="p-8 border-gas-teal/20 relative overflow-hidden">
                             {/* Background Ambient Glow */}
                             <div className="absolute top-0 right-0 w-64 h-64 bg-gas-teal/10 blur-[80px] rounded-full pointer-events-none -mr-16 -mt-16"></div>

                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="text-gas-slate font-medium text-sm">Order ID</div>
                                    <div className="font-mono text-white bg-white/10 px-2 py-1 rounded text-xs tracking-wider">
                                        #{String(order?.id || order?._id || orderId).substring(0,8).toUpperCase()}
                                    </div>
                                </div>

                                {/* Price Breakdown Section */}
                                <div className="space-y-3 pb-2">
                                    <SummaryLine label="Items Total" value={formatNaira(itemsTotal/100)} />
                                    
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gas-slate font-medium">Delivery Fee</span>
                                        <div className="text-right">
                                            <span className="text-white font-semibold">{formatNaira(deliveryFee/100)}</span>
                                            {order?.isExpress && (
                                                <div className="text-[10px] text-amber-400 flex items-center justify-end gap-1 mt-0.5">
                                                    <Zap size={10} fill="currentColor" /> Express included
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    
                                    {/* ✅ Service Charge (if > 0) */}
                                    {serviceCharge > 0 && (
                                        <SummaryLine label="Service Charge" value={formatNaira(serviceCharge/100)} />
                                    )}

                                    {/* ✅ VAT (if > 0) */}
                                    {vat > 0 && (
                                        <SummaryLine label="VAT (7.5%)" value={formatNaira(vat/100)} />
                                    )}

                                    <SummaryLine label="Total to Pay" value={formatNaira(totalAmount/100)} isTotal />
                                </div>

                                {/* Pay Button */}
                                <div className="mt-8">
                                    <Button 
                                        size="lg" 
                                        onClick={payWithMonnify}
                                        disabled={initializing} 
                                        className="w-full h-14 text-base font-bold bg-gas-teal text-gas-navy hover:bg-white shadow-lg shadow-gas-teal/20 transition-all"
                                    >
                                        {initializing ? (
                                            <>
                                                <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Processing...
                                            </>
                                        ) : (
                                            <>
                                                Pay Securely <Lock size={18} className="ml-2 opacity-70" />
                                            </>
                                        )}
                                    </Button>
                                </div>

                                <div className="mt-4 flex items-center justify-center gap-2 text-[10px] text-gas-slate uppercase tracking-wider">
                                    <CheckCircle2 size={12} className="text-gas-teal" /> Secured by Monnify
                                </div>

                                {error && (
                                    <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 text-xs flex items-start gap-2">
                                        <AlertCircle size={14} className="shrink-0 mt-0.5" />
                                        {error}
                                    </div>
                                )}
                            </div>
                        </GlassCard>

                        <div className="mt-6 text-center">
                            <Link href="/dashboard" className="text-sm text-gas-slate hover:text-white transition-colors underline decoration-dotted underline-offset-4">
                                Cancel and return to dashboard
                            </Link>
                        </div>
                    </div>

                </div>
            </div>
        </AppShell>
      </div>
    </div>
  );
}