import React from "react";
import { cn } from "@/lib/cn";

const steps = ["Order Placed", "Processing", "Driver Assigned", "Refilling/In Transit", "Out for Delivery", "Delivered"];

export function Timeline({ status }: { status: string }) {
  const idx = Math.max(0, steps.findIndex(s => s.toLowerCase() === (status || "").toLowerCase()));
  return (
    <div className="grid grid-cols-6 gap-2">
      {steps.map((s, i) => (
        <div key={s} className="flex flex-col items-center gap-2">
          <div className={cn("h-2.5 w-full rounded-full", i <= idx ? "bg-gas-teal" : "bg-slate-200")} />
          <div className={cn("text-[10px] font-semibold text-center leading-tight", i <= idx ? "text-slate-800" : "text-slate-400")}>
            {s}
          </div>
        </div>
      ))}
    </div>
  );
}
