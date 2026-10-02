"use client";

import { useEffect, useState } from "react";

type Notification = { id: string; title: string; message: string; created_at: string; read_at: string | null };

export function NotificationCenter() {
  const [items, setItems] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  async function load() { const response = await fetch("/api/notifications"); if (response.ok) setItems(await response.json()); }
  async function markRead(id: string) { await fetch("/api/notifications/read", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) }); setItems((current) => current.map((item) => item.id === id ? { ...item, read_at: new Date().toISOString() } : item)); }
  useEffect(() => { load(); }, []);
  const unread = items.filter((item) => !item.read_at).length;
  return <div className="relative"><button onClick={() => setOpen((value) => !value)} className="relative rounded-xl border bg-white px-3 py-2 text-sm font-semibold">Notifications {unread > 0 && <span className="ml-2 rounded-full bg-red-600 px-2 py-0.5 text-[10px] text-white">{unread}</span>}</button>{open && <div className="absolute right-0 z-50 mt-2 w-80 rounded-2xl border bg-white p-2 shadow-xl"><p className="px-3 py-2 text-sm font-semibold">Your notifications</p>{items.length ? items.map((item) => <button key={item.id} onClick={() => markRead(item.id)} className="block w-full rounded-xl p-3 text-left hover:bg-slate-50"><p className="text-sm font-semibold">{item.title}</p><p className="mt-1 text-xs text-slate-500">{item.message}</p></button>) : <p className="p-3 text-xs text-slate-500">You are all caught up.</p>}</div>}</div>;
}