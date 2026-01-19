"use client";

import React, { useMemo, useState } from "react";
import { X, UserRound, Lock, Phone, Mail } from "lucide-react";
import { useAuth } from "@/state/auth";
import { ensureSessionForOrder, authApi } from "@/services/auth";
import { Button } from "@/components/ui/Button";

export function AuthModal() {
  const { authOpen, closeAuth, setSession } = useAuth();
  const [mode, setMode] = useState<"guest" | "login" | "register">("guest");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Guest fields
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");

  // Login fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Register fields (reuse some from guest/login)
  const [regName, setRegName] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");

  const canGuest = useMemo(() => guestName.trim().length >= 2 && guestPhone.trim().length >= 8, [guestName, guestPhone]);
  const canLogin = useMemo(() => email.trim().includes("@") && password.trim().length >= 6, [email, password]);
  const canRegister = useMemo(
    () => regName.trim().length >= 2 && regPhone.trim().length >= 8 && regEmail.trim().includes("@") && regPassword.trim().length >= 6,
    [regName, regPhone, regEmail, regPassword]
  );

  if (!authOpen) return null;

  const onClose = () => {
    if (busy) return;
    setErr(null);
    closeAuth();
  };

  const handleGuest = async () => {
    setBusy(true);
    setErr(null);
    try {
      const session = await ensureSessionForOrder(guestName.trim(), guestPhone.trim());
      setSession(session);
      closeAuth();
    } catch (e: any) {
      setErr(e?.message || "Could not continue. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const handleLogin = async () => {
    setBusy(true);
    setErr(null);
    try {
      const session = await authApi.login(email.trim(), password);
      setSession(session);
      closeAuth();
    } catch (e: any) {
      setErr(e?.message || "Login failed. Please check your details.");
    } finally {
      setBusy(false);
    }
  };

  const handleRegister = async () => {
    setBusy(true);
    setErr(null);
    try {
      await authApi.registerCustomer({
        name: regName.trim(),
        email: regEmail.trim(),
        phone: regPhone.trim(),
        password: regPassword,
      });
      // Auto-login after successful registration
      const session = await authApi.login(regEmail.trim(), regPassword);
      setSession(session);
      closeAuth();
    } catch (e: any) {
      setErr(e?.message || "Registration failed. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg rounded-3xl border border-white/10 bg-gas-navy/90 p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gas-slate">Checkout access</div>
            <h2 className="text-2xl font-display font-bold text-white">Continue in seconds</h2>
          </div>
          <button
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-gas-slate hover:text-white"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="mt-5 grid grid-cols-3 rounded-2xl border border-white/10 bg-white/5 p-1">
          <button
            onClick={() => setMode("guest")}
            className={
              "rounded-2xl px-4 py-3 text-sm font-semibold transition " +
              (mode === "guest" ? "bg-gas-teal text-gas-navy" : "text-gas-white/80 hover:text-white")
            }
          >
            Guest
          </button>
          <button
            onClick={() => setMode("login")}
            className={
              "rounded-2xl px-4 py-3 text-sm font-semibold transition " +
              (mode === "login" ? "bg-gas-teal text-gas-navy" : "text-gas-white/80 hover:text-white")
            }
          >
            Log in
          </button>
          <button
            onClick={() => setMode("register")}
            className={
              "rounded-2xl px-4 py-3 text-sm font-semibold transition " +
              (mode === "register" ? "bg-gas-teal text-gas-navy" : "text-gas-white/80 hover:text-white")
            }
          >
            Register
          </button>
        </div>

        {err && (
          <div className="mt-4 rounded-2xl border border-gas-red/30 bg-gas-red/10 p-3 text-sm text-gas-white">
            {err}
          </div>
        )}

        {mode === "guest" ? (
          <div className="mt-5 space-y-4">
            <Field
              icon={<UserRound size={18} />}
              label="Full name"
              placeholder="e.g., Chidinma Okafor"
              value={guestName}
              onChange={(v) => setGuestName(v)}
            />
            <Field
              icon={<Phone size={18} />}
              label="Phone number"
              placeholder="e.g., 0803 123 4567"
              value={guestPhone}
              onChange={(v) => setGuestPhone(v)}
            />
            <div className="text-xs text-gas-slate">
              We’ll save these details on this device so you can reorder without signing in.
            </div>

            <Button
              onClick={handleGuest}
              disabled={!canGuest || busy}
              className="w-full"
              size="lg"
            >
              {busy ? "Please wait…" : "Continue"}
            </Button>
          </div>
        ) : mode === "login" ? (
          <div className="mt-5 space-y-4">
            <Field
              icon={<Mail size={18} />}
              label="Email"
              placeholder="you@example.com"
              value={email}
              onChange={(v) => setEmail(v)}
            />
            <Field
              icon={<Lock size={18} />}
              label="Password"
              placeholder="••••••••"
              value={password}
              onChange={(v) => setPassword(v)}
              type="password"
            />
            <Button
              onClick={handleLogin}
              disabled={!canLogin || busy}
              className="w-full"
              size="lg"
            >
              {busy ? "Signing in…" : "Log in"}
            </Button>
            <div className="text-xs text-gas-slate">
              Tip: If you previously ordered as Guest on this device, you don’t need to log in.
            </div>
          </div>
        ) : (
          <div className="mt-5 space-y-4">
            <Field
              icon={<UserRound size={18} />}
              label="Full name"
              placeholder="e.g., Chidinma Okafor"
              value={regName}
              onChange={(v) => setRegName(v)}
            />
            <Field
              icon={<Phone size={18} />}
              label="Phone number"
              placeholder="e.g., 0803 123 4567"
              value={regPhone}
              onChange={(v) => setRegPhone(v)}
            />
            <Field
              icon={<Mail size={18} />}
              label="Email"
              placeholder="you@example.com"
              value={regEmail}
              onChange={(v) => setRegEmail(v)}
            />
            <Field
              icon={<Lock size={18} />}
              label="Password"
              placeholder="••••••••"
              value={regPassword}
              onChange={(v) => setRegPassword(v)}
              type="password"
            />
            <Button
              onClick={handleRegister}
              disabled={!canRegister || busy}
              className="w-full"
              size="lg"
            >
              {busy ? "Registering…" : "Register"}
            </Button>
            <div className="text-xs text-gas-slate">
              By registering, you agree to our terms and privacy policy.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Field(props: {
  icon: React.ReactNode;
  label: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <label className="block">
      <div className="mb-2 text-xs font-bold uppercase tracking-widest text-gas-slate">{props.label}</div>
      <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-gas-white">
        <div className="text-gas-teal">{props.icon}</div>
        <input
          type={props.type || "text"}
          value={props.value}
          onChange={(e) => props.onChange(e.target.value)}
          placeholder={props.placeholder}
          className="w-full bg-transparent outline-none placeholder:text-gas-slate"
        />
      </div>
    </label>
  );
}