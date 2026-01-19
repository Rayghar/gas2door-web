"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, MapPin, Minus, Plus, ShieldCheck, Zap, CreditCard, Banknote, Loader2, AlertCircle } from "lucide-react";

import AddressAutocomplete from "@/components/address/AddressAutocomplete";
import AppShell from "@/components/layout/AppShell";
import { TopNav } from "@/components/layout/TopNav";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { GlassPanel, GlassCard } from "@/components/ui/Glass";
import { formatNaira } from "@/lib/money"; 
import { useAuth } from "@/state/auth";
import { ensureSessionForOrder } from "@/services/auth";
import { orderApi, type CreateOrderPayload } from "@/services/orders";
import { addressApi, type ResolvedPlace } from "@/services/addresses";
import { api } from "@/services/api";
import { endpoints } from "@/services/endpoints";

// --- HELPER COMPONENTS ---
function InfoItem({ icon, title, desc }: any) {
  return (
    <div className="flex gap-4">
      <div className="w-12 h-12 bg-white/5 rounded-2xl shadow-sm flex items-center justify-center text-gas-teal border border-white/10 shrink-0">
        {React.cloneElement(icon, { size: 22 })}
      </div>
      <div>
        <h4 className="font-bold text-white">{title}</h4>
        <p className="text-sm text-gas-slate leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

function Line({ label, value }: any) {
  return (
    <div className="flex items-center justify-between text-sm">
      <div className="text-gas-slate">{label}</div>
      <div className="text-white font-semibold">{value}</div>
    </div>
  );
}

function FieldLabel({ label, helper }: { label: string, helper?: string }) {
    return (
        <div className="mb-1.5 flex items-center justify-between">
            <label className="text-xs font-bold uppercase text-gas-slate tracking-wider">{label}</label>
            {helper && <span className="text-[10px] text-gas-teal/80">{helper}</span>}
        </div>
    )
}

// --- TYPES ---
type CylinderOption = { id: string; name: string; kg: number; unitPrice: number };
const STANDARD_SIZES = [6, 12.5, 25, 50];
const formatKobo = (kobo: number) => formatNaira(kobo / 100);

export default function NewOrderPage() {
  const router = useRouter();
  const { session, setSession } = useAuth(); 

  // -- STATE --
  const [configLoading, setConfigLoading] = useState(true);
  
  // Configuration State
  const [cylinderSettings, setCylinderSettings] = useState<any[]>([]);
  const [gasPricePerKg, setGasPricePerKg] = useState(110000); 
  const [baseDeliveryFee, setBaseDeliveryFee] = useState(100000); 
  const [expressSurcharge, setExpressSurcharge] = useState(50000); 
  const [vatRate, setVatRate] = useState(0.075); 
  const [serviceFeeRate, setServiceFeeRate] = useState(0.0); 

  // Order Inputs
  const [cylinderId, setCylinderId] = useState(""); 
  const [qty, setQty] = useState(1);
  const [express, setExpress] = useState(false);
  const [payMethod, setPayMethod] = useState<"payOnPickup" | "card">("payOnPickup");

  // User & Address
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [addressInput, setAddressInput] = useState(""); 
  const [landmark, setLandmark] = useState("");
  const [resolved, setResolved] = useState<ResolvedPlace | null>(null);

  // UI State
  const [busy, setBusy] = useState(false);
  const [statusMsg, setStatusMsg] = useState(""); 
  const [error, setError] = useState<string | null>(null);

  // -- FETCH CONFIGURATION --
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const conf: any = await api.get(endpoints.config.get || "/config");
        const fees = conf?.feeSettings || conf; 
        const cylinders = conf?.cylinderSettings || [];

        if (fees) {
          if (fees.baseDeliveryFee) setBaseDeliveryFee(Number(fees.baseDeliveryFee));
          if (fees.expressDeliverySurcharge) setExpressSurcharge(Number(fees.expressDeliverySurcharge));
          if (fees.gasPricePerKg) setGasPricePerKg(Number(fees.gasPricePerKg));
          if (fees.vatPercentage !== undefined) setVatRate(Number(fees.vatPercentage) / 100);
          if (fees.serviceFeePercentage !== undefined) setServiceFeeRate(Number(fees.serviceFeePercentage) / 100);
        }

        if (cylinders && cylinders.length > 0) {
            const activeCylinders = cylinders.filter((c: any) => c.isActive !== false);
            setCylinderSettings(activeCylinders);
            const defaultCyl = activeCylinders.find((c:any) => c.name.includes("12.5")) || activeCylinders[0];
            if (defaultCyl) setCylinderId(defaultCyl.id);
        } else {
            setCylinderId("c-12.5"); 
        }

      } catch (e) {
        console.warn("Using defaults", e);
        setCylinderId("c-12.5");
      } finally {
        setConfigLoading(false);
      }
    };
    fetchConfig();
  }, []);

  // -- CALCULATIONS --
  const cylinderOptions: CylinderOption[] = useMemo(() => {
    if (cylinderSettings.length > 0) {
      return cylinderSettings.map((c: any) => {
        let weight = Number(c.weightKg) || 0;
        if (weight === 0) {
            const match = c.name.match(/(\d+(\.\d+)?)\s*kg/i);
            if (match) weight = parseFloat(match[1]);
        }
        return {
            id: c.id,
            name: c.name,
            kg: weight || 1, 
            unitPrice: c.price 
        };
      });
    }
    return STANDARD_SIZES.map(kg => ({
      id: `c-${kg}`,
      name: `${kg}kg Cylinder`,
      kg: kg,
      unitPrice: kg * gasPricePerKg
    }));
  }, [cylinderSettings, gasPricePerKg]);

  const selectedCylinder = useMemo(
    () => cylinderOptions.find((c) => c.id === cylinderId) ?? cylinderOptions[0], 
    [cylinderId, cylinderOptions]
  );

  const itemsTotal = (selectedCylinder?.unitPrice || 0) * qty;
  const deliveryFee = express ? (baseDeliveryFee + expressSurcharge) : baseDeliveryFee;
  const serviceCharge = itemsTotal * serviceFeeRate;
  const vat = itemsTotal * vatRate;
  const grandTotal = itemsTotal + deliveryFee + serviceCharge + vat;

  // -- PREFILL --
  useEffect(() => {
    const u: any = session?.user;
    if (!u) return;
    if (!name) setName(u?.name || u?.fullName || "");
    if (!phone) setPhone(u?.phone || "");
  }, [session]);

  const handleAddressResolved = (place: ResolvedPlace | null) => {
    setResolved(place);
    if (place) {
      setAddressInput(place.fullAddress);
      setError(null);
    }
  };

  async function handleOrderSubmission() {
    if (!name.trim()) { setError("Full name is required."); return; }
    if (!phone.trim()) { setError("Phone number is required."); return; }
    if (!addressInput.trim()) { setError("Please enter a delivery address."); return; }

    setError(null);
    setBusy(true);
    setStatusMsg("Creating order...");

    try {
        const s = await ensureSessionForOrder({ name, phone });
        setSession?.(s);

        const createdAddress = await addressApi.create({
            label: "Checkout Address",
            fullAddress: resolved?.fullAddress || addressInput,
            street: resolved?.street || addressInput,
            city: resolved?.city || "Lagos",
            state: "Lagos",
            country: "Nigeria",
            latitude: resolved?.latitude || 0,
            longitude: resolved?.longitude || 0,
            landmark: landmark.trim(),
        });

        const deliveryAddressId = createdAddress?.id || createdAddress?.data?.id || createdAddress?._id; 
        if (!deliveryAddressId) throw new Error("Could not save delivery address.");

        const backendPaymentMethod = payMethod === "card" ? "paystack" : "payOnPickup";

        const orderPayload: CreateOrderPayload = {
            deliveryAddressId,
            recipientName: name,
            recipientPhone: phone,
            isExpress: express,
            paymentMethod: backendPaymentMethod as any, 
            items: [{
                cylinderId: selectedCylinder.id,
                productName: selectedCylinder.name,
                quantity: qty,
                unitPrice: selectedCylinder.unitPrice, 
            }],
        };

        const createdOrder = await orderApi.create(orderPayload);
        const orderId = createdOrder?.id || createdOrder?._id || createdOrder?.order?.id || createdOrder?.data?.id;

        if (!orderId) throw new Error("Order creation failed.");

        // ✅ REDIRECT LOGIC
        if (payMethod === "card") {
            // Go to Checkout Screen
            router.push(`/payment/${orderId}`);
        } else {
            // Order placed, go to tracking
            router.push(`/track/${orderId}`);
        }
    } catch (e: any) {
        setError(e?.message || "Something went wrong.");
        setBusy(false);
    }
  }

  return (
    <div>
      <TopNav />

      <div className="pb-16 pt-6"> 
        <AppShell>
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              
              {/* Left Column (Inputs) */}
              <div className="space-y-8">
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">
                    Secure your <br />
                    <span className="text-gas-teal">Kitchen Energy</span>
                  </h1>
                  <p className="text-gas-slate mt-4 max-w-lg">
                    Choose your cylinder, enter your delivery address, and we’ll handle the rest.
                  </p>
                </div>

                <div className="space-y-4">
                  <InfoItem icon={<ShieldCheck />} title="Weight Guaranteed" desc="We bring a digital scale." />
                  <InfoItem icon={<Zap />} title="Express Mode" desc="Prioritize your order for faster delivery." />
                </div>

                <GlassCard className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-gas-teal/15 text-gas-teal flex items-center justify-center shrink-0">
                      <MapPin size={18} />
                    </div>
                    <div className="flex-1 w-full">
                      <h3 className="text-white font-semibold mb-6">Delivery Details</h3>
                      
                      <div className="mb-4">
                        <FieldLabel label="Recipient Name" helper="Who is receiving?" />
                        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter full name" />
                      </div>

                      <div className="mb-4">
                        <FieldLabel label="Phone Number" helper="For updates" />
                        <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="080..." />
                      </div>

                      <div className="mb-4">
                        <FieldLabel label="Street Address" helper="Search or type" />
                        <AddressAutocomplete 
                          value={addressInput}
                          onChangeText={setAddressInput}
                          onResolved={handleAddressResolved}
                          placeholder="Search for your street..."
                        />
                      </div>

                      {resolved && (
                        <div className="mb-4 text-xs font-medium text-emerald-400 flex items-center gap-1 animate-pulse">
                          <MapPin size={12} /> Service Zone Confirmed
                        </div>
                      )}

                      <div>
                        <FieldLabel label="Landmark (Optional)" helper="Help the rider" />
                        <Input value={landmark} onChange={(e) => setLandmark(e.target.value)} placeholder="e.g. Black Gate" />
                      </div>
                    </div>
                  </div>
                </GlassCard>

                {error && (
                  <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-red-200 text-sm flex items-start gap-3">
                    <AlertCircle size={18} className="text-red-400 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}
              </div>

              {/* Right Column (Cart) */}
              <div className="lg:sticky lg:top-28 h-fit">
                <GlassPanel className="p-7">
                  <p className="text-xs font-bold text-gas-slate uppercase tracking-widest">Order Summary</p>

                  <div className="mt-4 space-y-4">
                    <div>
                      <label className="text-gas-slate text-xs font-bold uppercase">Cylinder Size</label>
                      <select
                        value={cylinderId}
                        onChange={(e) => setCylinderId(e.target.value)}
                        className="mt-2 w-full bg-[#050a14] border border-white/10 rounded-xl px-4 py-3 text-white outline-none ring-1 ring-white/5 focus:ring-gas-teal appearance-none"
                      >
                        {cylinderOptions.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name} — {formatKobo(c.unitPrice)}
                          </option>
                        ))}
                      </select>
                      
                      {selectedCylinder && (
                          <div className="mt-2 text-sm text-gas-slate">
                              <span className="font-semibold text-white">
                                  {formatNaira((selectedCylinder.unitPrice / 100) / (selectedCylinder.kg))}
                              </span> per kg
                          </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-white font-semibold">Quantity</div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" onClick={() => setQty((q) => Math.max(1, q - 1))}><Minus size={16} /></Button>
                        <div className="min-w-10 text-center text-white font-bold">{qty}</div>
                        <Button variant="outline" size="icon" onClick={() => setQty((q) => q + 1)}><Plus size={16} /></Button>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setExpress((v) => !v)}
                      className={`w-full rounded-2xl border px-4 py-4 text-left transition ${
                        express ? "border-gas-teal/50 bg-gas-teal/10" : "border-white/10 bg-white/5 hover:bg-white/10"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-white font-semibold">Express Option</div>
                        <div className="text-gas-slate text-sm">Priority handling (+{formatKobo(expressSurcharge)}).</div>
                      </div>
                      <div className={`mt-2 text-xs font-bold px-3 py-1 rounded-full w-fit ${express ? "bg-gas-teal text-gas-navy" : "bg-white/10 text-white"}`}>
                        {express ? "ENABLED" : "OFF"}
                      </div>
                    </button>

                    <div>
                      <label className="text-gas-slate text-xs font-bold uppercase mb-2 block">Payment Method</label>
                      <div className="grid grid-cols-2 gap-3">
                        <button type="button" onClick={() => setPayMethod("payOnPickup")} className={`flex flex-col items-center justify-center gap-2 rounded-xl border p-4 transition ${payMethod === "payOnPickup" ? "border-gas-teal bg-gas-teal/10 text-white" : "border-white/10 bg-white/5 text-slate-400 hover:bg-white/10"}`}>
                          <Banknote size={24} /><span className="text-xs font-bold">Pay on Delivery</span>
                        </button>
                        <button type="button" onClick={() => setPayMethod("card")} className={`flex flex-col items-center justify-center gap-2 rounded-xl border p-4 transition ${payMethod === "card" ? "border-gas-teal bg-gas-teal/10 text-white" : "border-white/10 bg-white/5 text-slate-400 hover:bg-white/10"}`}>
                          <CreditCard size={24} /><span className="text-xs font-bold">Pay Online</span>
                        </button>
                      </div>
                    </div>

                    <div className="border-t border-white/10 pt-5 space-y-2 text-sm">
                      <Line label="Items" value={formatKobo(itemsTotal)} />
                      <Line label="Delivery" value={formatKobo(deliveryFee)} />
                      {serviceFeeRate > 0 && <Line label="Service Charge" value={formatKobo(serviceCharge)} />}
                      {vatRate > 0 && <Line label={`VAT (${(vatRate * 100).toFixed(1)}%)`} value={formatKobo(vat)} />}
                      <div className="flex items-center justify-between pt-3 border-t border-white/10 mt-3">
                        <div className="text-white font-bold text-lg">Total</div>
                        <div className="text-white font-bold text-2xl">
                          {configLoading ? <Loader2 className="animate-spin h-5 w-5" /> : formatKobo(grandTotal)}
                        </div>
                      </div>
                    </div>

                    <Button className="w-full h-12 text-base font-bold bg-gas-teal text-gas-navy hover:bg-white" onClick={handleOrderSubmission} disabled={busy || configLoading}>
                      {busy ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {statusMsg}</> : <>Place Order <ArrowRight size={18} className="ml-2" /></>}
                    </Button>
                  </div>
                </GlassPanel>
              </div>
            </div>
          </div>
        </AppShell>
      </div>
    </div>
  );
}