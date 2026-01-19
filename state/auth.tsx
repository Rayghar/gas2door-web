"use client";

import React from "react";
import { clearSession, getSession, saveSession, type Session } from "@/lib/session";

type AuthState = {
  /** null = guest, object = logged in / identified */
  session: Session | null;

  /** True after localStorage session has been loaded once */
  hydrated: boolean;

  setSession: (s: Session | null) => void;
  logout: () => void;

  /** Global auth modal state */
  authOpen: boolean;
  setAuthOpen: (v: boolean) => void;
  openAuth: () => void;
  closeAuth: () => void;
};

const Ctx = React.createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSessionState] = React.useState<Session | null>(null);
  const [hydrated, setHydrated] = React.useState(false);

  const [authOpen, setAuthOpen] = React.useState(false);

  // ✅ Load session exactly once (client-side)
  React.useEffect(() => {
    try {
      const s = getSession();
      setSessionState(s);
    } finally {
      setHydrated(true);
    }
  }, []);

  // ✅ One setter that always persists (or clears)
  const setSession = React.useCallback((s: Session | null) => {
    setSessionState(s);
    if (!s) clearSession();
    else saveSession(s);
  }, []);

  const logout = React.useCallback(() => {
    setSession(null);
  }, [setSession]);

  const openAuth = React.useCallback(() => setAuthOpen(true), []);
  const closeAuth = React.useCallback(() => setAuthOpen(false), []);

  const value = React.useMemo<AuthState>(
    () => ({
      session,
      hydrated,
      setSession,
      logout,
      authOpen,
      setAuthOpen,
      openAuth,
      closeAuth,
    }),
    [session, hydrated, setSession, logout, authOpen]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const v = React.useContext(Ctx);
  if (!v) throw new Error("useAuth must be used within AuthProvider");
  return v;
}
