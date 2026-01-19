# Gas2Door Web (Customer)

Glassmorphism teal/white customer web experience aligned to your mobile backend APIs.

## Quick start
1. Copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_API_BASE`
2. Install deps: `npm install`
3. Run: `npm run dev`

## Routes
- `/` Landing
- `/login`, `/signup`, `/forgot-password`
- `/dashboard`
- `/order/new` → `/order/summary` → `/payment/[orderId]`
- `/orders`, `/orders/[orderId]`
- `/track`, `/track/[orderId]`
