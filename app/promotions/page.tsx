"use client";
import React from "react";
import { TopNav } from "@/components/layout/TopNav";
import { AppShell } from "@/components/layout/AppShell";
import { GlassCard } from "@/components/ui/Glass";

export default function Page() {
  return (
    <div>
      <TopNav />
      <AppShell activeHref="/promotions">
        <GlassCard className="p-6">
          <h1 className="text-3xl font-extrabold">Promotions</h1>
          <p className="mt-1 text-sm text-slate-600">Promo codes, offers, and referrals (if enabled).</p>
          <p className="mt-4 text-xs text-slate-500">
            This page is wired in the sitemap and styled correctly; next iteration will connect it fully to backend endpoints.
          </p>
        </GlassCard>
      </AppShell>
    </div>
  );
}
