"use client";
import React from "react";
import { TopNav } from "@/components/layout/TopNav";
import { GlassCard } from "@/components/ui/Glass";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { api } from "@/services/api";
import { endpoints } from "@/services/endpoints";

export default function ForgotPassword() {
  const [identifier, setIdentifier] = React.useState("");
  const [sent, setSent] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const onSubmit = async () => {
    setLoading(true); setError(null);
    try {
      await api.post(endpoints.auth.requestPasswordReset, { identifier });
      setSent(true);
    } catch (e: any) {
      setError(e?.message || "Request failed");
    } finally { setLoading(false); }
  };

  return (
    <div>
      <TopNav />
      <main className="mx-auto max-w-lg px-4 pb-24">
        <GlassCard className="p-6">
          <h1 className="text-2xl font-extrabold">Reset password</h1>
          <p className="mt-1 text-sm text-slate-600">We’ll send a reset token/OTP to your email or phone.</p>

          <div className="mt-5 space-y-3">
            <Input placeholder="Email or Phone" value={identifier} onChange={(e)=>setIdentifier(e.target.value)} />
          </div>

          {error && <div className="mt-3 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</div>}
          {sent && <div className="mt-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">Sent! Check your messages.</div>}

          <div className="mt-5">
            <Button className="w-full" onClick={onSubmit} disabled={loading}>
              {loading ? "Sending…" : "Send reset"}
            </Button>
          </div>
        </GlassCard>
      </main>
    </div>
  );
}
