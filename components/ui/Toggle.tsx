"use client";
import React from "react";
import { cn } from "@/lib/cn";

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={cn("inline-flex items-center gap-3 rounded-2xl border border-slate-200 bg-white/60 px-4 py-3 text-sm font-semibold hover:bg-white/80")}
    >
      <span className="text-slate-800">{label}</span>
      <span className={cn("relative h-6 w-11 rounded-full transition", checked ? "bg-gas-teal" : "bg-slate-300/70")}>
        <span className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition", checked ? "left-5" : "left-0.5")} />
      </span>
    </button>
  );
}
