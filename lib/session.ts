export type Session = { accessToken: string; user?: any; lastSeen?: string; };
const KEY = "gas2door_session_v1";

export function saveSession(s: Session) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify({ ...s, lastSeen: new Date().toISOString() }));
}
export function getSession(): Session | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(KEY);
  if (!raw) return null;
  try { return JSON.parse(raw) as Session; } catch { return null; }
}
export function clearSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY);
}
export function getAccessToken(): string | null {
  return getSession()?.accessToken ?? null;
}
