// services/api.ts
"use client";

type ApiFetchOptions = RequestInit & {
  auth?: boolean;
};

function trimTrailingSlash(value: string) {
  return String(value || "").replace(/\/+$/, "");
}

function getConfiguredBaseUrl() {
  const raw =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    ""; // same-origin fallback

  return trimTrailingSlash(raw);
}

function splitApiBase(base: string) {
  const normalized = trimTrailingSlash(base);
  const match = normalized.match(/^(.*?)(\/api\/v\d+)$/);
  if (!match) return { origin: normalized, versionPrefix: "" };
  return { origin: match[1], versionPrefix: match[2] };
}

function buildApiUrl(path: string) {
  if (path.startsWith("http")) return path;

  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const base = getConfiguredBaseUrl();

  // No backend base configured: keep same-origin behaviour.
  if (!base) return cleanPath;

  const { origin, versionPrefix } = splitApiBase(base);

  // Important fix:
  // Some environments configure NEXT_PUBLIC_API_BASE_URL as http://localhost:3000/api/v1
  // because most legacy web endpoints are v1 and are called as /auth/login, /orders, etc.
  // Corporate Business endpoints are explicit v2 paths (/api/v2/business/...).
  // In that case we must NOT create /api/v1/api/v2/business/...; we must call /api/v2 directly.
  if (cleanPath.startsWith("/api/v1") || cleanPath.startsWith("/api/v2")) {
    return `${origin || base}${cleanPath}`;
  }

  // Legacy relative endpoints such as /auth/login should continue to use the configured
  // API version prefix when present, e.g. http://localhost:3000/api/v1/auth/login.
  return `${base}${cleanPath}`;
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
      // ignore corrupt/non-JSON sessions
    }
  }
  return null;
}

export async function apiFetch<T = any>(
  path: string,
  options: ApiFetchOptions = {}
): Promise<T> {
  const url = buildApiUrl(path);

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
    if (!isJson && typeof payload === "string" && payload.includes("<title>404")) {
      throw new Error(
        `API route not found (HTTP ${res.status}). Called '${url}'. Check NEXT_PUBLIC_API_BASE_URL / NEXT_PUBLIC_API_URL and backend route registration.`
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
  patch: <T = any>(path: string, body?: any, options: ApiFetchOptions = {}) =>
    apiFetch<T>(path, {
      ...options,
      method: "PATCH",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),
  del: <T = any>(path: string, options: ApiFetchOptions = {}) =>
    apiFetch<T>(path, { ...options, method: "DELETE" }),
};
