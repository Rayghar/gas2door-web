import React from "react";
import { cn } from "@/lib/cn";

export function Badge({ children, pulse, className }: { children: React.ReactNode; pulse?: boolean; className?: string }) {
  return (
    <span className={cn(
      "inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/60 px-3 py-1 text-xs font-semibold text-slate-700",
      pulse ? "relative" : "",
      className
    )}>
      {pulse && <span className="absolute -left-1.5 -top-1.5 h-2.5 w-2.5 rounded-full bg-gas-teal animate-ping opacity-60" />}
      {pulse && <span className="h-2 w-2 rounded-full bg-gas-teal" />}
      {children}
    </span>
  );
}
