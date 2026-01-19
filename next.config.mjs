/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    const base =
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      process.env.API_BASE_URL ||
      "";

    if (!base) return [];

    const api = base.replace(/\/$/, "");

    // One proxy per resource group; keeps rewrites future-proof.
    return [
      { source: "/auth/:path*", destination: `${api}/auth/:path*` },
      { source: "/users/:path*", destination: `${api}/users/:path*` },
      { source: "/admin/:path*", destination: `${api}/admin/:path*` },
      { source: "/orders/:path*", destination: `${api}/orders/:path*` },
      { source: "/payments/:path*", destination: `${api}/payments/:path*` },
      { source: "/wallet/:path*", destination: `${api}/wallet/:path*` },
      { source: "/chat/:path*", destination: `${api}/chat/:path*` },
      { source: "/promotions/:path*", destination: `${api}/promotions/:path*` },
      { source: "/reports/:path*", destination: `${api}/reports/:path*` },
      { source: "/config", destination: `${api}/config` },
      { source: "/addresses/:path*", destination: `${api}/addresses/:path*` },
      { source: "/price/:path*", destination: `${api}/price/:path*` },
      { source: "/health", destination: `${api}/health` }
    ];
  }
};

export default nextConfig;
