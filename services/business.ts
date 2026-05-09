import { api } from "@/services/api";

export const businessApi = {
  me: () => api.get<any>("/api/v2/business/me"),
  dashboard: () => api.get<any>("/api/v2/business/dashboard"),
  sites: () => api.get<any>("/api/v2/business/sites"),
  createSite: (payload: any) => api.post<any>("/api/v2/business/sites", payload),
  requests: (params?: { status?: string; siteId?: string; search?: string }) => {
    const q = new URLSearchParams();
    Object.entries(params || {}).forEach(([key, value]) => {
      if (value) q.set(key, String(value));
    });
    return api.get<any>(`/api/v2/business/requests${q.toString() ? `?${q.toString()}` : ""}`);
  },
  createRequest: (payload: any) => api.post<any>("/api/v2/business/requests", payload),
  request: (requestId: string) => api.get<any>(`/api/v2/business/requests/${encodeURIComponent(requestId)}`),
  approveRequest: (requestId: string) => api.post<any>(`/api/v2/business/requests/${encodeURIComponent(requestId)}/approve`, {}),
  cancelRequest: (requestId: string, note?: string) => api.patch<any>(`/api/v2/business/requests/${encodeURIComponent(requestId)}/cancel`, { note }),
  deliveries: () => api.get<any>("/api/v2/business/deliveries"),
  confirmDelivery: (fulfilmentId: string, note?: string) => api.post<any>(`/api/v2/business/deliveries/${encodeURIComponent(fulfilmentId)}/confirm`, { note }),
  billing: () => api.get<any>("/api/v2/business/billing"),
  invoices: () => api.get<any>("/api/v2/business/invoices"),
  statements: () => api.get<any>("/api/v2/business/statements"),
  wallet: () => api.get<any>("/api/v2/business/wallet"),
  promotions: () => api.get<any>("/api/v2/business/promotions"),
  supportTickets: () => api.get<any>("/api/v2/business/support/tickets"),
  createSupportTicket: (payload: any) => api.post<any>("/api/v2/business/support/tickets", payload),
  supportMessages: (ticketId: string) => api.get<any>(`/api/v2/business/support/tickets/${encodeURIComponent(ticketId)}/messages`),
  sendSupportMessage: (ticketId: string, text: string) => api.post<any>(`/api/v2/business/support/tickets/${encodeURIComponent(ticketId)}/messages`, { text }),
  initializeInvoicePayment: (fulfilmentId: string) => api.post<any>(`/api/v2/business/payments/fulfilments/${encodeURIComponent(fulfilmentId)}/initialize`, {}),
};

export const money = (v: any) => `₦${Math.round(Number(v || 0)).toLocaleString()}`;
export const kg = (v: any) => `${Math.round(Number(v || 0)).toLocaleString()}kg`;
export const dateTime = (v: any) => (v ? new Date(v).toLocaleString() : "—");
export const labelize = (value: any) => String(value || '').replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (m) => m.toUpperCase());
export const dateOnly = (v: any) => (v ? new Date(v).toLocaleDateString() : "—");

export const statusTone = (status = "") => {
  if (["ACTIVE", "DELIVERED", "APPROVED", "PAID", "ON_TIME"].includes(status)) return "border-emerald-400/30 bg-emerald-400/10 text-emerald-200";
  if (["SUBMITTED", "UNDER_REVIEW", "QUOTED", "SCHEDULED", "IN_TRANSIT", "AT_RISK"].includes(status)) return "border-blue-400/30 bg-blue-400/10 text-blue-200";
  if (["DRAFT", "UNPAID", "PART_PAID"].includes(status)) return "border-amber-400/30 bg-amber-400/10 text-amber-200";
  if (["CANCELLED", "REJECTED", "FAILED", "LATE", "MISSED", "DELAYED"].includes(status)) return "border-red-400/30 bg-red-400/10 text-red-200";
  return "border-white/10 bg-white/5 text-slate-300";
};
