"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { TopNav } from "@/components/layout/TopNav";
import { GlassCard } from "@/components/ui/Glass";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { api } from "@/services/api";
import { endpoints } from "@/services/endpoints";
import { useAuth } from "@/state/auth";
import { Loader2, CheckCircle2 } from "lucide-react";

export default function VerifyOtpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const { setSession } = useAuth(); // Update session if verified

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!email) router.push("/login");
  }, [email, router]);

  const onVerify = async () => {
    setLoading(true); setError(null);
    try {
      // Backend: /api/v1/auth/verify-otp
      const res: any = await api.post(endpoints.auth.verifyOtp, { email, otp });
      setSuccess(true);
      
      // If the backend returns a new token (optional), update session. 
      // Usually after verification, user logs in, but we can redirect to login.
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
    <div>
      <TopNav />
      <main className="mx-auto max-w-md px-4 pt-32">
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
                    We sent a 4-digit code to <br/> <span className="text-white font-mono">{email}</span>
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
      </main>
    </div>
  );
}