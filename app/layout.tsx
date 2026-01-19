import "./globals.css";
import { Providers } from "./providers";
import { AuthProvider } from "@/state/auth";

export const metadata = {
  title: "Gas2Door — Soft Life Gas Delivery",
  description: "Order cooking gas in Lagos. Fast, trusted, and transparent."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gas-bg text-white antialiased">
        <Providers>
          <AuthProvider>
            {children}
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}
