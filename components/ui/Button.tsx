"use client";

import * as React from "react";

type Variant = "primary" | "outline" | "ghost";
type Size = "sm" | "md" | "lg" | "icon";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-2xl font-bold transition " +
  "disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-gas-teal/40";

const variants: Record<Variant, string> = {
  primary: "bg-gas-teal text-gas-navy hover:brightness-110 shadow-glow",
  outline:
    "border border-white/15 bg-white/5 text-white hover:bg-white/10 hover:border-white/25",
  ghost: "text-white hover:bg-white/10",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-4 text-sm",
  lg: "h-12 px-5 text-base",
  icon: "h-10 w-10 p-0",
};

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    />
  );
}
