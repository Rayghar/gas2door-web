"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/state/auth";

/**
 * Root entry point.
 * Decides where the user goes:
 * - Known session → /dashboard
 * - Guest → / (marketing home)
 */
export default function AppEntry() {
  const router = useRouter();
  const { session, hydrated } = useAuth();

  useEffect(() => {
    if (!hydrated) return;

    if (session) {
      router.replace("/dashboard");
    }
  }, [hydrated, session, router]);

  // While deciding, render nothing (no flicker)
  return null;
}
