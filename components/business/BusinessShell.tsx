"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BarChart3, Building2, ClipboardList, FileText, Headset, LogOut, MapPin, PackageCheck, PlusCircle, WalletCards, BadgePercent } from "lucide-react";
import { TopNav } from "@/components/layout/TopNav";
import { GlassCard } from "@/components/ui/Glass";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { useAuth } from "@/state/auth";
import { businessApi } from "@/services/business";

const nav = [
  { href: "/business/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/business/requests/new", label: "New Request", icon: PlusCircle },
  { href: "/business/requests", label: "Requests", icon: ClipboardList },
  { href: "/business/deliveries", label: "Deliveries", icon: PackageCheck },
  { href: "/business/sites", label: "Sites", icon: MapPin },
  { href: "/business/invoices", label: "Billing", icon: FileText },
  { href: "/business/wallet", label: "Wallet", icon: WalletCards },
  { href: "/business/promotions", label: "Promotions", icon: BadgePercent },
  { href: "/business/support", label: "Support Chat", icon: Headset },
];

export function BusinessShell({ children, activeHref }: { children: React.ReactNode; activeHref: string }) {
  const router = useRouter();
  const { session, hydrated, logout } = useAuth();
  const user = session?.user;
  const isCorporate = typeof user?.role === "string" && user.role.startsWith("corporate_");
  const [profile, setProfile] = React.useState<any>(null);

  React.useEffect(() => {
    if (hydrated && !session) router.push("/login");
  }, [hydrated, session, router]);

  React.useEffect(() => {
    let active = true;
    if (!hydrated || !session || !isCorporate) return;
    businessApi.me()
      .then((res) => { if (active) setProfile(res); })
      .catch(() => { /* keep shell usable even if profile refresh fails */ });
    return () => { active = false; };
  }, [hydrated, session, isCorporate]);

  if (!hydrated) {
    return <div className="min-h-screen px-4 pt-24 text-center text-white">Loading Business Portal…</div>;
  }

  if (!session) return null;

  if (!isCorporate) {
    return (
      <div>
        <TopNav />
        <main className="mx-auto max-w-3xl px-4 pb-20">
          <GlassCard className="p-8 text-center">
            <Building2 className="mx-auto mb-4 h-10 w-10 text-gas-teal" />
            <h1 className="text-2xl font-extrabold text-white">Business portal access required</h1>
            <p className="mt-3 text-sm text-slate-300">This area is reserved for corporate accounts created by Gas2Door. Ask your relationship manager to create your business login from the BMA.</p>
            <div className="mt-6 flex justify-center gap-3">
              <Link href="/dashboard"><Button variant="outline">Go to Customer Dashboard</Button></Link>
              <Button variant="ghost" onClick={logout}><LogOut className="h-4 w-4" /> Logout</Button>
            </div>
          </GlassCard>
        </main>
      </div>
    );
  }

  return (
    <div>
      <TopNav />
      <main className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 pb-20 md:grid-cols-[270px_1fr]">
        <GlassCard className="h-fit p-4 md:sticky md:top-24">
          <div className="mb-4 rounded-2xl border border-gas-teal/20 bg-gas-teal/10 p-4">
            <div className="text-xs uppercase tracking-widest text-gas-teal">Gas2Door Business</div>
            <div className="mt-1 font-extrabold text-white">{profile?.client?.companyName || user?.corporateClientName || "Corporate Account"}</div>
            <div className="mt-1 text-xs text-slate-400">{profile?.client?.clientCode ? `${profile.client.clientCode} · ` : ""}{user?.corporateRole || user?.role}</div>
          </div>
          <nav className="space-y-1">
            {nav.map((item) => {
              const Icon = item.icon;
              const active = activeHref === item.href;
              return (
                <Link key={item.href} href={item.href} className={cn("flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-bold transition", active ? "bg-gas-teal text-gas-navy" : "text-white hover:bg-white/10 hover:text-gas-teal")}>
                  <Icon className={cn("h-5 w-5", active ? "text-gas-navy" : "text-gas-teal")} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </GlassCard>
        <section>{children}</section>
      </main>
    </div>
  );
}

export function StatCard({ label, value, hint }: { label: string; value: React.ReactNode; hint?: string }) {
  return (
    <GlassCard className="p-5">
      <div className="text-xs uppercase tracking-widest text-slate-400">{label}</div>
      <div className="mt-2 text-2xl font-extrabold text-white">{value}</div>
      {hint && <div className="mt-1 text-xs text-slate-400">{hint}</div>}
    </GlassCard>
  );
}

export function Pill({ children, tone = "border-white/10 bg-white/5 text-slate-300" }: { children: React.ReactNode; tone?: string }) {
  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-bold ${tone}`}>{children}</span>;
}
