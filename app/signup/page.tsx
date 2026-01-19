"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TopNav } from "@/components/layout/TopNav";
import { GlassCard } from "@/components/ui/Glass";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { api } from "@/services/api";
import { endpoints } from "@/services/endpoints";
import { useAuth } from "@/state/auth";
import { AlertCircle, Loader2 } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const { setSession } = useAuth();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [referralCode, setReferralCode] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    setLoading(true); 
    setError(null);
    try {
      const res: any = await api.post(endpoints.auth.registerCustomer, { 
        name: fullName, 
        phone, 
        email, 
        password,
        referralCode 
      });

      // Redirect to OTP Verification
      router.push(`/verify-otp?email=${encodeURIComponent(email)}`);
      
    } catch (e: any) {
      setError(e?.message || "Signup failed. Please try again.");
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <div>
      <TopNav />
      <main className="mx-auto max-w-lg px-4 pt-24 pb-24">
        <GlassCard className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-white">Create Account</h1>
            <p className="mt-2 text-sm text-slate-400">Join for faster checkout and rewards.</p>
          </div>

          <div className="space-y-4">
            <Input placeholder="Full Name" value={fullName} onChange={(e)=>setFullName(e.target.value)} />
            <Input placeholder="Phone Number" value={phone} onChange={(e)=>setPhone(e.target.value)} />
            <Input placeholder="Email Address" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} />
            <Input placeholder="Create Password" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} />
            <Input placeholder="Referral Code (Optional)" value={referralCode} onChange={(e)=>setReferralCode(e.target.value)} />
          </div>

          {error && (
            <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-200 flex items-center gap-2">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <div className="mt-6">
            <Button className="w-full h-12 text-base font-bold bg-gas-teal text-gas-navy hover:bg-white" onClick={onSubmit} disabled={loading}>
              {loading ? <Loader2 className="animate-spin h-5 w-5" /> : "Create Account"}
            </Button>
          </div>

          <div className="mt-6 text-center text-sm text-slate-400">
            Already have an account? <Link className="font-bold text-gas-teal hover:underline" href="/login">Login</Link>
          </div>
        </GlassCard>
      </main>
    </div>
  );
}