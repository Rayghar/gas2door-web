import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "./services/**/*.{ts,tsx}",
    "./state/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Poppins", "ui-sans-serif", "system-ui", "Segoe UI", "Roboto", "Arial"],
      },
      colors: {
        gas: {
          teal: "#14b8a6",
          slate: "#f8fafc",
          ink: "#1f2937",
          navy: "#0A192F",
        },
      },
      boxShadow: {
        glass: "0 10px 30px rgba(2, 6, 23, 0.08)",
        glow: "0 0 0 1px rgba(20, 184, 166, 0.25), 0 12px 40px rgba(20, 184, 166, 0.12)",
      },
      backdropBlur: {
        glass: "18px",
      },
    },
  },
  plugins: [],
} satisfies Config;
