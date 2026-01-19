"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { AuthProvider } from "@/state/auth";
import { AuthModal } from "@/components/auth/AuthModal"; // ✅ FIXED

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = React.useState(() => new QueryClient());

  return (
    <QueryClientProvider client={client}>
      <AuthProvider>
        {children}
        {/* Global modal (Login inside checkout, optional) */}
        <AuthModal />
      </AuthProvider>
    </QueryClientProvider>
  );
}
