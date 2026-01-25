import { api } from "@/services/api";
import { endpoints } from "@/services/endpoints";
import { saveSession, getSession, type Session } from "@/lib/session";

/**
 * Auth API wrapper
 * - login: normal email/password login
 * - guestCreate: create a guest session (no email/password)
 * - guestUpgrade: upgrade a guest to a full customer account
 */
export const authApi = {
  async login(email: string, password: string): Promise<Session> {
    const res: any = await api.post(endpoints.auth.login, { email, password }, { auth: false });
    const token = res?.token || res?.accessToken || res?.data?.token || res?.data?.accessToken;
    const user = res?.user || res?.data?.user;
    if (!token) throw new Error("Login failed. Please try again.");
    const session: Session = { accessToken: token, user };
    saveSession(session);
    return session;
  },

  async registerCustomer(input: { name: string; email: string; phone: string; password: string }) {
    return api.post(endpoints.auth.registerCustomer, input, { auth: false });
  },

  async guestCreate(input: { name: string; phone: string }): Promise<Session> {
    const res: any = await api.post(endpoints.auth.guestCreate, input, { auth: false });
    const token = res?.token || res?.accessToken || res?.data?.token || res?.data?.accessToken;
    const user = res?.user || res?.data?.user || { ...input, isGuest: true };
    if (!token) throw new Error("Unable to start a guest session. Please try again.");
    const session: Session = { accessToken: token, user: { ...user, isGuest: true } };
    saveSession(session);
    return session;
  },

  // Guest Upgrade does NOT return a new token (it only triggers OTP verification).
  // Keep it simple and let the UI redirect to /verify-otp.
  async guestUpgrade(input: { name?: string; email: string; password: string }): Promise<{ userId: string; message: string }> {
    return api.post(endpoints.auth.guestUpgrade, input, { auth: true });
  },

  async resendVerificationEmail(email: string) {
    return api.post(endpoints.auth.resendVerification, { email }, { auth: true });
  },

  async requestPasswordReset(email: string) {
    return api.post(endpoints.auth.requestPasswordReset, { email }, { auth: false });
  },

  async verifyPasswordResetToken(email: string, token: string) {
    return api.post(endpoints.auth.verifyPasswordToken, { email, token }, { auth: false });
  },

  async resetPassword(email: string, token: string, newPassword: string) {
    return api.post(endpoints.auth.resetPassword, { email, token, newPassword }, { auth: false });
  }
};

// ✅ Correct overloads + implementation signature
export async function ensureSessionForOrder(input: { name: string; phone: string }): Promise<Session>;
export async function ensureSessionForOrder(name: string, phone: string): Promise<Session>;
export async function ensureSessionForOrder(
  arg1: { name: string; phone: string } | string,
  arg2?: string
): Promise<Session> {
  const existing = getSession();
  if (existing?.accessToken) return existing;

  const name = (typeof arg1 === "string" ? arg1 : arg1?.name || "Guest").trim() || "Guest";
  const phone = String(typeof arg1 === "string" ? (arg2 || "") : (arg1?.phone || "")).trim();

  if (!phone) throw new Error("Phone number is required to continue as a guest.");

  return authApi.guestCreate({ name, phone });
}