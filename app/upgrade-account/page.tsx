"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { TopNav } from "@/components/layout/TopNav";
import { AppShell } from "@/components/layout/AppShell";
import { GlassCard } from "@/components/ui/Glass";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/state/auth";
import { api } from "@/services/api";
import { endpoints } from "@/services/endpoints";
import { AlertCircle, Loader2 } from "lucide-react";

export default function UpgradeAccountPage() {
  const router = useRouter();
  const { session } = useAuth();
  const isGuest = Boolean(session?.user?.isGuest);

  // Pre-fill existing guest name
  const [name, setName] = useState(session?.user?.name || "");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    setError(null);
    if (!email.trim() || password.length < 8) {
      setError("Please provide a valid email and a password (min 8 chars).");
      return;
    }

    setBusy(true);
    try {
      // ✅ FIX: Use 'guestUpgrade' (matches endpoints.ts)
      await api.post(endpoints.auth.guestUpgrade, {
        name: name.trim() || undefined,
        email: email.trim(),
        password,
      });

      // Redirect to Verify OTP Page
      router.push(`/verify-otp?email=${encodeURIComponent(email)}&mode=upgrade`);
      
    } catch (e: any) {
      setError(e?.message || "Upgrade failed. This email might already be taken.");
    } finally {
      setBusy(false);
    }
  };

  if (!session || !isGuest) {
    return (
      <div>
        <TopNav />
        <AppShell>
            <GlassCard className="p-8 text-center">
                <h2 className="text-xl font-bold text-white">Already Upgraded</h2>
                <p className="mt-2 text-slate-400">Your account is already a full customer account.</p>
                <div className="mt-6">
                    <Button onClick={() => router.push("/dashboard")}>Go to Dashboard</Button>
                </div>
            </GlassCard>
        </AppShell>
      </div>
    );
  }

  return (
    <div>
      <TopNav />
      <AppShell activeHref="/profile">
        <GlassCard className="p-8 max-w-xl mx-auto">
          <h1 className="text-3xl font-extrabold text-white">Upgrade Account</h1>
          <p className="mt-2 text-sm text-slate-400">
            Secure your account to enable password reset, order history, and faster support.
          </p>

          <div className="mt-8 space-y-5">
            <div>
                <label className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-2 block">Name</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your Name" />
            </div>
            
            <div>
                <label className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-2 block">Phone (Linked)</label>
                <Input value={session?.user?.phone || ""} disabled className="opacity-50 cursor-not-allowed" />
            </div>

            <div>
                <label className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-2 block">Email Address</label>
                <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" type="email" />
            </div>

            <div>
                <label className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-2 block">Create Password</label>
                <Input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 8 characters" type="password" />
            </div>

            {error && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-200 flex items-center gap-2">
                <AlertCircle size={16} /> {error}
              </div>
            )}

            <div className="pt-2 flex flex-col gap-3">
              <Button onClick={onSubmit} disabled={busy} className="w-full h-12 text-base font-bold bg-gas-teal text-gas-navy hover:bg-white">
                {busy ? <Loader2 className="animate-spin" /> : "Complete Upgrade"}
              </Button>

              <Button variant="ghost" onClick={() => router.push("/profile")} className="text-slate-400 hover:text-white">
                Cancel
              </Button>
            </div>
          </div>
        </GlassCard>
      </AppShell>
    </div>
  );
}