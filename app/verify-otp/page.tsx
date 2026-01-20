"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { TopNav } from "@/components/layout/TopNav";
import { GlassCard } from "@/components/ui/Glass";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { api } from "@/services/api";
import { endpoints } from "@/services/endpoints";
import { useAuth } from "@/state/auth";
import { Loader2, CheckCircle2 } from "lucide-react";

// 1. ISOLATE LOGIC: Move everything using searchParams into this component
function VerifyOtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams(); // This causes the build error if not suspended
  const email = searchParams.get("email");
  const { setSession } = useAuth(); 

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!email) {
      // Optional: Handle missing email gracefully or redirect
      // router.push("/login"); 
    }
  }, [email, router]);

  const onVerify = async () => {
    setLoading(true); setError(null);
    try {
      await api.post(endpoints.auth.verifyOtp, { email, otp });
      setSuccess(true);
      
      setTimeout(() => {
        router.push("/login");
      }, 2000);

    } catch (e: any) {
      setError(e?.message || "Invalid code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <GlassCard className="p-8 text-center">
      {success ? (
        <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300">
            <CheckCircle2 size={64} className="text-emerald-400 mb-4" />
            <h1 className="text-2xl font-bold text-white">Verified!</h1>
            <p className="text-slate-400 mt-2">Redirecting you to login...</p>
        </div>
      ) : (
        <>
            <h1 className="text-2xl font-bold text-white mb-2">Check your Email</h1>
            <p className="text-sm text-slate-400 mb-6">
                We sent a 4-digit code to <br/> <span className="text-white font-mono">{email || "your email"}</span>
            </p>

            <div className="space-y-4">
                <Input 
                    placeholder="Enter 4-digit Code" 
                    value={otp} 
                    onChange={(e) => setOtp(e.target.value)} 
                    className="text-center text-lg tracking-[0.5em] font-bold"
                    maxLength={4}
                />
                
                {error && <div className="text-sm text-red-400 bg-red-500/10 p-2 rounded-lg">{error}</div>}

                <Button onClick={onVerify} disabled={loading || otp.length < 4} className="w-full h-12 bg-gas-teal text-gas-navy hover:bg-white">
                    {loading ? <Loader2 className="animate-spin" /> : "Verify Account"}
                </Button>
            </div>
        </>
      )}
    </GlassCard>
  );
}

// 2. MAIN PAGE: Wrap the content in Suspense to fix the build error
export default function VerifyOtpPage() {
  return (
    <div>
      <TopNav />
      <main className="mx-auto max-w-md px-4 pt-32">
        <Suspense fallback={
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-gas-teal" />
          </div>
        }>
          <VerifyOtpContent />
        </Suspense>
      </main>
    </div>
  );
}