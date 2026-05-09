import React from "react";
import { cn } from "@/lib/cn";

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm font-semibold text-white placeholder:text-slate-400 outline-none",
        "focus:border-gas-teal focus:ring-4 focus:ring-gas-teal/10",
        props.className
      )}
    />
  );
}
