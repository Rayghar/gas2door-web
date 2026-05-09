"use client";
import React from "react";
import { useRouter } from "next/navigation";

export default function BusinessLoginRedirect() {
  const router = useRouter();
  React.useEffect(() => { router.replace("/login"); }, [router]);
  return <div className="px-4 pt-24 text-center text-white">Opening secure login…</div>;
}
