"use client";
import React from "react";
import Link from "next/link";
import { Building2, CalendarClock, ClipboardCheck, FileText, MapPin, ShieldCheck, Truck } from "lucide-react";
import { TopNav } from "@/components/layout/TopNav";
import { GlassCard } from "@/components/ui/Glass";
import { Button } from "@/components/ui/Button";

const benefits = [
  { icon: ClipboardCheck, title: "Swift BMA onboarding", text: "Your Gas2Door relationship manager creates your business account and issues secure login credentials." },
  { icon: MapPin, title: "Multi-site delivery", text: "Manage approved delivery locations for kitchens, hotels, estates, restaurants and offices." },
  { icon: CalendarClock, title: "Scheduled requests", text: "Submit bulk LPG requests with preferred delivery dates, windows, PO numbers and delivery notes." },
  { icon: Truck, title: "Delivery tracking", text: "Track request status from submission to scheduling, dispatch, delivery and confirmation." },
  { icon: FileText, title: "Invoices & statements", text: "View invoices, outstanding balances, delivered KG and account-level activity." },
  { icon: ShieldCheck, title: "Controlled access", text: "Corporate users are scoped to their company account and assigned portal roles." },
];

export default function BusinessLandingPage() {
  return (
    <div>
      <TopNav />
      <main className="mx-auto max-w-6xl px-4 pb-24 pt-8">
        <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <div className="mb-4 inline-flex rounded-full border border-gas-teal/30 bg-gas-teal/10 px-4 py-2 text-sm font-bold text-gas-teal">Gas2Door Business</div>
            <h1 className="text-4xl font-black tracking-tight text-white md:text-6xl">Corporate LPG requests, tracking and account control.</h1>
            <p className="mt-5 max-w-2xl text-lg text-slate-300">For restaurants, hotels, estates, schools, offices and high-volume LPG customers that need reliable supply, visibility, account control and relationship-manager support.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/login"><Button size="lg">Login to Business Portal</Button></Link>
              <Link href="/support"><Button size="lg" variant="outline">Request Corporate Setup</Button></Link>
            </div>
            <p className="mt-4 text-sm text-slate-400">Corporate accounts are created by Gas2Door inside the BMA for faster onboarding. Your login details will be provided by your account manager.</p>
          </div>
          <GlassCard className="p-6">
            <Building2 className="mb-5 h-12 w-12 text-gas-teal" />
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                ["Bulk LPG", "Request KG volumes"],
                ["Approved sites", "Deliver to multiple locations"],
                ["Account terms", "Prepaid, POD or credit"],
                ["SLA visibility", "Track delivery performance"],
              ].map(([title, text]) => (
                <div key={title} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="font-extrabold text-white">{title}</div>
                  <div className="mt-1 text-xs text-slate-400">{text}</div>
                </div>
              ))}
            </div>
          </GlassCard>
        </section>

        <section className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {benefits.map((item) => {
            const Icon = item.icon;
            return (
              <GlassCard key={item.title} className="p-5">
                <Icon className="mb-3 h-7 w-7 text-gas-teal" />
                <h3 className="font-extrabold text-white">{item.title}</h3>
                <p className="mt-2 text-sm text-slate-400">{item.text}</p>
              </GlassCard>
            );
          })}
        </section>
      </main>
    </div>
  );
}
