// services/api.ts
"use client";

type ApiFetchOptions = RequestInit & {
  auth?: boolean;
};

function getBaseUrl() {
  // Prefer an explicit backend base URL, but default to same-origin.
  // In dev/prod, Next rewrites (see next.config.mjs) can proxy common paths
  // like `/auth/*`, `/orders/*`, etc. to your backend.
  const raw =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    ""; // same-origin fallback

  // If empty => same-origin
  if (!raw) return "";
  return raw.replace(/\/$/, "");
}

function safeGetSessionToken(): string | null {
  if (typeof window === "undefined") return null;

  // We’ve used a few keys across iterations; try all of them.
  const keys = [
    "gas2door_session_v1",
    "gas2door_session",
    "g2d:session_v1",
    "g2d:session",
  ];

  for (const k of keys) {
    try {
      const raw = localStorage.getItem(k);
      if (!raw) continue;
      const s = JSON.parse(raw);
      const token = s?.accessToken || s?.token || s?.jwt || s?.data?.token || null;
      if (token) return token;
    } catch {
      // ignore
    }
  }
  return null;
}

export async function apiFetch<T = any>(
  path: string,
  options: ApiFetchOptions = {}
): Promise<T> {
  const base = getBaseUrl();
  const url = path.startsWith("http") ? path : `${base}${path.startsWith("/") ? "" : "/"}${path}`;

  const headers = new Headers(options.headers || {});
  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }

  // Attach auth token if requested
  if (options.auth !== false) {
    const token = safeGetSessionToken();
    if (token && !headers.has("Authorization")) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  const res = await fetch(url, {
    ...options,
    headers,
  });

  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");

  if (!res.ok) {
    const payload = isJson ? await res.json().catch(() => null) : await res.text().catch(() => "");
    // Helpful hint when the backend path is not proxied and Next returns an HTML 404.
    if (!isJson && typeof payload === "string" && payload.includes("<title>404")) {
      throw new Error(
        `API route not found (HTTP ${res.status}). This usually means the frontend is calling a same-origin path like '${path}', but your Next proxy/rewrite to the backend isn't configured. Set NEXT_PUBLIC_API_BASE_URL or API_BASE_URL, or ensure next.config.mjs rewrites are active.`
      );
    }
    const msg =
      (payload && (payload.message || payload.error)) ||
      (typeof payload === "string" && payload) ||
      `Request failed (${res.status})`;
    throw new Error(msg);
  }

  if (res.status === 204) return undefined as any;
  return (isJson ? await res.json() : ((await res.text()) as any)) as T;
}

/**
 * Back-compat convenience wrapper.
 * Some parts of the app import { api } (get/post/put/delete) instead of apiFetch.
 */
export const api = {
  get: <T = any>(path: string, options: ApiFetchOptions = {}) =>
    apiFetch<T>(path, { ...options, method: "GET" }),
  post: <T = any>(path: string, body?: any, options: ApiFetchOptions = {}) =>
    apiFetch<T>(path, {
      ...options,
      method: "POST",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),
  put: <T = any>(path: string, body?: any, options: ApiFetchOptions = {}) =>
    apiFetch<T>(path, {
      ...options,
      method: "PUT",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),
  del: <T = any>(path: string, options: ApiFetchOptions = {}) =>
    apiFetch<T>(path, { ...options, method: "DELETE" }),
};
