"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { TopNav } from "@/components/layout/TopNav";
import { AppShell } from "@/components/layout/AppShell";
import { GlassCard } from "@/components/ui/Glass";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/state/auth";
import { api } from "@/services/api";
import { endpoints } from "@/services/endpoints";
import { Loader2, CheckCircle2, AlertTriangle, User } from "lucide-react";

export default function ProfilePage() {
  const { session, setSession } = useAuth();
  const [userData, setUserData] = useState<any>(session?.user || null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (session?.user) setUserData(session.user);
  }, [session]);

  // ✅ FIX: Fetch latest profile to sync guest status
  useEffect(() => {
    const fetchProfile = async () => {
      if (!session?.accessToken) return;
      setLoading(true);
      try {
        const res: any = await api.get(endpoints.user.me);
        const freshUser = res?.user || res?.data || res;
        setUserData(freshUser);
        setSession({ ...session, user: freshUser });
      } catch (e) {
        console.error("Profile Fetch Error:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const isGuest = Boolean(userData?.isGuest) || (userData?.email || "").endsWith('@guest.gas2door.ng');
  const isVerified = Boolean(userData?.isVerified);

  const resend = async () => {
    setMsg(null);
    setBusy(true);
    try {
        await api.post(endpoints.auth.resendVerification, { email: userData?.email });
        setMsg({ type: 'success', text: "Verification code sent to your email." });
    } catch (e: any) {
        setMsg({ type: 'error', text: e?.message || "Failed to send code." });
    } finally {
        setBusy(false);
    }
  };

  return (
    <div>
      <TopNav />
      <AppShell activeHref="/profile">
        <div className="grid gap-6">
          <GlassCard className="p-8">
            <div className="flex items-center gap-4 mb-6">
                <div className="h-16 w-16 rounded-full bg-gas-teal/10 flex items-center justify-center text-gas-teal border border-gas-teal/20">
                    <User size={32} />
                </div>
                <div>
                    <h1 className="text-2xl font-extrabold text-white">My Profile</h1>
                    <p className="text-sm text-slate-400">Manage account details</p>
                </div>
                {loading && <Loader2 className="animate-spin text-gas-teal ml-auto" />}
            </div>

            <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                    <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Name</label>
                    <div className="text-lg font-semibold text-white mt-1">{userData?.name || "Guest"}</div>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                    <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Phone</label>
                    <div className="text-lg font-semibold text-white mt-1">{userData?.phone || "—"}</div>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                    <div className="flex justify-between items-start">
                        <div>
                            <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Email</label>
                            <div className="text-lg font-semibold text-white mt-1 break-all">{userData?.email || "—"}</div>
                        </div>
                        {isGuest ? (
                            <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 text-xs font-bold border border-amber-500/20">Guest</span>
                        ) : isVerified ? (
                            <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20 flex items-center gap-1">
                                <CheckCircle2 size={12} /> Verified
                            </span>
                        ) : (
                            <span className="px-3 py-1 rounded-full bg-red-500/10 text-red-400 text-xs font-bold border border-red-500/20 flex items-center gap-1">
                                <AlertTriangle size={12} /> Unverified
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className="mt-8 border-t border-white/10 pt-6">
                {isGuest ? (
                    <div className="bg-gradient-to-r from-gas-teal/20 to-blue-600/20 p-5 rounded-2xl border border-gas-teal/20">
                        <h3 className="font-bold text-white mb-1">Upgrade your account</h3>
                        <p className="text-sm text-slate-300 mb-4">Secure your account with a password to access history and support.</p>
                        <Link href="/upgrade-account">
                            <Button className="w-full bg-gas-teal text-gas-navy hover:bg-white">Upgrade Now</Button>
                        </Link>
                    </div>
                ) : !isVerified ? (
                    <div className="bg-red-500/10 p-5 rounded-2xl border border-red-500/20">
                        <h3 className="font-bold text-red-200 mb-1">Verify your email</h3>
                        <p className="text-sm text-red-200/70 mb-4">You must verify your email to place orders securely.</p>
                        <Button onClick={resend} disabled={busy} variant="outline" className="w-full border-red-500/30 text-red-200 hover:bg-red-500/20">
                            {busy ? "Sending..." : "Resend Verification Code"}
                        </Button>
                        {msg && <p className={`mt-3 text-sm ${msg.type === 'error' ? 'text-red-400' : 'text-emerald-400'}`}>{msg.text}</p>}
                    </div>
                ) : null}
            </div>

          </GlassCard>
        </div>
      </AppShell>
    </div>
  );
}