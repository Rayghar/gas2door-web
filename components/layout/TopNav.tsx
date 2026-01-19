"use client";
import React from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { useAuth } from "@/state/auth";
import { GlassPanel } from "@/components/ui/Glass";
import { Button } from "@/components/ui/Button";

export function TopNav() {
  const { session, logout } = useAuth();
  const name = session?.user?.name || session?.user?.fullName || "Customer";
  const isGuest = Boolean(session?.user?.isGuest);

  return (
    // ✅ REMOVED: shadow-2xl for a cleaner look
    <GlassPanel className="sticky top-3 z-50 mx-auto mb-6 flex w-full max-w-6xl items-center justify-between px-5 py-3 border-white/10">
      <Link href="/" className="font-extrabold tracking-tight text-xl">
        <span className="text-gas-teal">Gas</span>
        <span className="text-white">2Door</span>
      </Link>

      <div className="flex items-center gap-4">
        <Link href="/notifications" className="rounded-full border border-white/10 bg-white/5 p-2.5 hover:bg-white/10 transition-colors">
          <Bell className="h-5 w-5 text-gas-teal" />
        </Link>

        {session ? (
          <>
            {/* ✅ FIXED: Text is now pure white */}
            <div className="hidden sm:flex items-center gap-2 text-sm text-white">
              Hi, <span className="font-bold">{name.split(" ")[0]}</span>
              {isGuest && (
                <Link
                  href="/upgrade-account"
                  className="ml-2 rounded-full border border-gas-teal/30 bg-gas-teal/10 px-3 py-1 text-xs font-bold text-gas-teal hover:bg-gas-teal/20 transition"
                >
                  Upgrade
                </Link>
              )}
            </div>

            {/* ✅ FIXED: Logout button is white */}
            <Button variant="ghost" className="text-white hover:bg-white/10" onClick={logout}>
              Logout
            </Button>
          </>
        ) : (
          <Link href="/login">
            <Button size="sm" className="bg-white text-gas-navy hover:bg-gas-teal hover:text-white border-0 font-bold">
              Login
            </Button>
          </Link>
        )}
      </div>
    </GlassPanel>
  );
}