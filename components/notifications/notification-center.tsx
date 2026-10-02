"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Notification = { id: string; title: string; message: string; created_at: string; read_at: string | null; type?: string };

function target(item: Notification) {
  if (item.type === "action_due") return "/app/actions";
  if (item.type === "payment_overdue") return "/app/payments";
  if (item.type === "payment_received") return "/app/payments";
  return "/app/today";
}

export function NotificationCenter() {
  const [items, setItems] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  async function load() {
    const response = await fetch("/api/notifications", { cache: "no-store" });
    if (response.ok) setItems(await response.json());
  }

  async function markRead(id: string) {
    await fetch("/api/notifications/read", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    setItems((current) => current.map((item) => item.id === id ? { ...item, read_at: new Date().toISOString() } : item));
  }

  async function openNotification(item: Notification) {
    await markRead(item.id);
    router.push(target(item));
    setOpen(false);
  }

  useEffect(() => { load(); }, []);

  const unread = items.filter((item) => !item.read_at).length;

  return <div className="relative">
    <button aria-label="Open notifications" onClick={() => setOpen((value) => !value)} className="relative rounded-xl border bg-white px-3 py-2 text-sm font-semibold">
      Notifications {unread > 0 && <span className="ml-2 rounded-full bg-red-600 px-2 py-0.5 text-[10px] text-white">{unread}</span>}
    </button>
    {open && <div className="absolute right-0 z-50 mt-2 w-80 rounded-2xl border bg-white p-2 shadow-xl">
      <p className="px-3 py-2 text-sm font-semibold">Your notifications</p>
      {items.length ? items.map((item) => <button key={item.id} onClick={() => openNotification(item)} className="block w-full rounded-xl p-3 text-left hover:bg-slate-50">
        <p className="text-sm font-semibold">{item.title}</p><p className="mt-1 text-xs text-slate-500">{item.message}</p>
      </button>) : <p className="p-3 text-xs text-slate-500">You are all caught up.</p>}
    </div>}
  </div>;
}