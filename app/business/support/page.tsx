"use client";
import React from "react";
import { Headset, MessageCircle, PlusCircle, RefreshCw, Send, TicketCheck } from "lucide-react";
import { BusinessShell, Pill } from "@/components/business/BusinessShell";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/Glass";
import { Input } from "@/components/ui/Input";
import { businessApi, dateTime, statusTone, labelize } from "@/services/business";
import { useAuth } from "@/state/auth";

const fieldClass = "w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm font-semibold text-white placeholder:text-slate-400 outline-none focus:border-gas-teal";
const selectClass = `${fieldClass} bg-black text-white`;

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-1 block text-[11px] font-extrabold uppercase tracking-wider text-slate-300">{label}</span>{children}</label>;
}

function ChatBubble({ message, currentUserId }: { message: any; currentUserId?: string }) {
  const mine = Boolean(currentUserId && String(message.senderId || message.sender?._id || message.sender?.id || "") === String(currentUserId));
  return (
    <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[82%] rounded-2xl border px-4 py-3 text-sm ${mine ? "border-gas-teal/30 bg-gas-teal/15 text-white" : "border-white/10 bg-white/5 text-slate-100"}`}>
        <div className="mb-1 text-[10px] uppercase tracking-widest text-slate-400">{mine ? "You" : "PrimeJet Support"} · {dateTime(message.createdAt)}</div>
        <div className="whitespace-pre-wrap leading-relaxed">{message.text}</div>
      </div>
    </div>
  );
}

export default function BusinessSupportPage() {
  const { session } = useAuth();
  const currentUserId = session?.user?.id || session?.user?._id;
  const [rows, setRows] = React.useState<any[]>([]);
  const [selected, setSelected] = React.useState<any>(null);
  const [messages, setMessages] = React.useState<any[]>([]);
  const [error, setError] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [newText, setNewText] = React.useState("");
  const [form, setForm] = React.useState<any>({ subject: "", category: "GENERAL_ENQUIRY", priority: "MEDIUM", description: "" });
  const [showForm, setShowForm] = React.useState(false);

  const load = React.useCallback(async () => {
    setError("");
    try {
      const res = await businessApi.supportTickets();
      const list = res?.rows || [];
      setRows(list);
      if (!selected && list[0]) setSelected(list[0]);
    } catch (e: any) {
      setError(e?.message || "Unable to load support tickets.");
    }
  }, [selected]);

  React.useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  React.useEffect(() => {
    let active = true;
    let timer: any = null;
    const loadMessages = () => {
      if (!selected?.id) return;
      businessApi.supportMessages(selected.id)
        .then((res) => { if (active) setMessages(res?.rows || res?.messages || []); })
        .catch(() => { if (active) setMessages([]); });
    };
    loadMessages();
    if (selected?.id) timer = setInterval(loadMessages, 10000);
    return () => { active = false; if (timer) clearInterval(timer); };
  }, [selected?.id]);

  const create = async () => {
    setError(""); setMessage("");
    try {
      const res = await businessApi.createSupportTicket(form);
      setMessage("Support ticket created. PrimeJet support can now track and respond.");
      setShowForm(false);
      setForm({ subject: "", category: "GENERAL_ENQUIRY", priority: "MEDIUM", description: "" });
      setSelected(res?.ticket || null);
      await load();
    } catch (e: any) {
      setError(e?.message || "Unable to create support ticket.");
    }
  };

  const send = async () => {
    if (!selected?.id || !newText.trim()) return;
    setError("");
    try {
      await businessApi.sendSupportMessage(selected.id, newText.trim());
      setNewText("");
      const res = await businessApi.supportMessages(selected.id);
      setMessages(res?.rows || res?.messages || []);
      await load();
    } catch (e: any) {
      setError(e?.message || "Unable to send message.");
    }
  };

  return (
    <BusinessShell activeHref="/business/support">
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-xs uppercase tracking-widest text-gas-teal">Business Support</div>
          <h1 className="text-3xl font-black text-white">Support & Complaints</h1>
          <p className="mt-1 text-sm text-slate-400">Raise and track delivery, billing, quantity, safety or account-service complaints.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={load}><RefreshCw className="h-4 w-4" /> Refresh</Button>
          <Button onClick={() => setShowForm((v) => !v)}><PlusCircle className="h-4 w-4" /> New Ticket</Button>
        </div>
      </div>
      {error && <div className="mb-4 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">{error}</div>}
      {message && <div className="mb-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-200">{message}</div>}

      {showForm && (
        <GlassCard className="mb-6 p-5">
          <h2 className="mb-4 font-extrabold text-white"><TicketCheck className="mr-2 inline h-5 w-5 text-gas-teal" /> Create Support Ticket</h2>
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="Subject"><Input placeholder="Example: Delivery arrived late" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} /></Field>
            <Field label="Issue category"><select className={selectClass} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>{['GENERAL_ENQUIRY','DELIVERY_DELAY','PAYMENT_ISSUE','BILLING_DISPUTE','QUANTITY_DISPUTE','SAFETY_CONCERN','DRIVER_CONDUCT','CORPORATE_ACCOUNT','OTHER'].map((v) => <option key={v} value={v}>{labelize(v)}</option>)}</select></Field>
            <Field label="Priority"><select className={selectClass} value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>{['LOW','MEDIUM','HIGH','URGENT'].map((v) => <option key={v} value={v}>{labelize(v)}</option>)}</select></Field>
            <Field label="Description"><textarea className={`${fieldClass} min-h-[120px] md:col-span-2`} placeholder="Describe the issue clearly. Include delivery/site/invoice reference if available." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
          </div>
          <div className="mt-4"><Button onClick={create} disabled={!form.subject || !form.description}>Submit Ticket</Button></div>
        </GlassCard>
      )}

      <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <GlassCard className="p-4">
          <h2 className="mb-4 font-extrabold text-white"><Headset className="mr-2 inline h-5 w-5 text-gas-teal" /> Tickets</h2>
          <div className="space-y-2">
            {rows.map((t) => <button key={t.id} onClick={() => setSelected(t)} className={`w-full rounded-2xl border p-4 text-left transition ${selected?.id === t.id ? 'border-gas-teal/40 bg-gas-teal/10' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}><div className="flex items-start justify-between gap-2"><div className="font-bold text-white">{t.subject}</div><Pill tone={statusTone(t.status)}>{labelize(t.status)}</Pill></div><div className="mt-1 text-xs text-slate-400">{t.ticketNo} · {labelize(t.category)} · {dateTime(t.createdAt)}</div></button>)}
            {!rows.length && <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-400">No tickets yet.</div>}
          </div>
        </GlassCard>
        <GlassCard className="p-5">
          <h2 className="mb-4 font-extrabold text-white"><MessageCircle className="mr-2 inline h-5 w-5 text-gas-teal" /> Conversation</h2>
          {selected ? <>
            <div className="mb-4 rounded-2xl border border-white/10 bg-white/5 p-4"><div className="font-bold text-white">{selected.subject}</div><div className="mt-1 text-sm text-slate-400">{selected.description}</div></div>
            <div className="max-h-[460px] min-h-[260px] space-y-3 overflow-y-auto rounded-2xl border border-white/10 bg-slate-950/40 p-4 pr-3">{messages.map((m) => <ChatBubble key={m.id || m._id || m.createdAt} message={m} currentUserId={currentUserId} />)}{!messages.length && <p className="text-center text-sm text-slate-400">No messages yet. PrimeJet Support will reply here.</p>}</div>
            <div className="mt-4 flex flex-col gap-2 md:flex-row"><Input placeholder="Type a message to PrimeJet Support..." value={newText} onChange={(e) => setNewText(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') send(); }} /><Button onClick={send} disabled={!newText.trim()}><Send className="h-4 w-4" /> Send</Button></div>
          </> : <div className="p-8 text-center text-slate-400">Select a ticket to view messages.</div>}
        </GlassCard>
      </div>
    </BusinessShell>
  );
}
