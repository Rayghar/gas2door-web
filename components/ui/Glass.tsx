import React from "react";
import { cn } from "@/lib/cn";

export function GlassCard({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn(
      // ✅ CHANGED: High-Contrast Dark Navy (#0B1221) with 95% opacity.
      // This ensures white text pops, while keeping the glass feel.
      "rounded-3xl border border-white/10 bg-[#0B1221]/95 backdrop-blur-xl shadow-2xl ring-1 ring-white/5",
      className
    )}>
      {children}
    </div>
  );
}

export function GlassPanel({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn(
      // ✅ CHANGED: Darker background for inner panels (Menu, Stats)
      "rounded-2xl border border-white/5 bg-[#131B2D]/90 backdrop-blur-lg shadow-lg",
      className
    )}>
      {children}
    </div>
  );
}