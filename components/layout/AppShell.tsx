"use client";

import React from "react";
import Link from "next/link";
import {
  LayoutGrid,
  ShoppingBag,
  MapPin,
  Wallet,
  Tag,
  MessageCircle,
  User,
  Map,
  Bell,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { GlassCard } from "@/components/ui/Glass";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { href: "/order/new", label: "New Order", icon: ShoppingBag },
  { href: "/orders", label: "Orders", icon: Map },
  { href: "/track", label: "Tracking", icon: MapPin },
  { href: "/wallet", label: "Wallet", icon: Wallet },
  { href: "/promotions", label: "Promotions", icon: Tag },
  { href: "/support", label: "Support", icon: MessageCircle },
  { href: "/profile", label: "Profile", icon: User },
  { href: "/notifications", label: "Notifications", icon: Bell },
];

export function AppShell({
  children,
  activeHref,
}: {
  children: React.ReactNode;
  activeHref?: string;
}) {
  return (
    <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 pb-16 md:grid-cols-[260px_1fr]">
      <GlassCard className="h-fit p-4 md:sticky md:top-24">
        {/* Lighter label color for readability */}
        <div className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400 px-3">
          Menu
        </div>

        <nav className="space-y-1">
          {nav.map((item) => {
            const Icon = item.icon;
            const active = activeHref === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-bold transition-all duration-200",
                  active
                    ? "bg-gas-teal text-gas-navy shadow-lg shadow-gas-teal/20" // Active: Teal background, Dark text
                    : "text-white hover:bg-white/10 hover:text-gas-teal"       // Inactive: White text (FIXED), Hover: Light overlay
                )}
              >
                <Icon className={cn("h-5 w-5", active ? "text-gas-navy" : "text-gas-teal")} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </GlassCard>

      <div>{children}</div>
    </div>
  );
}

export default AppShell;