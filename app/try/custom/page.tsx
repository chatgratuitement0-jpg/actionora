import type { Metadata } from "next";

export const metadata: Metadata = { robots: { index: false, follow: true } };

"use client";

import { useState } from "react";

type TryForm = { client: string; waiting: string; amount: string; due: string; lastContact: string; responded: string; notes: string };

export default function CustomTryPage() {
  const [form, setForm] = useState<TryForm>({ client: "", waiting: "", amount: "", due: "", lastContact: "", responded: "No", notes: "" });
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [terms, setTerms] = useState(false);

  async function analyze(e: React.FormEvent) {
    e.preventDefault();
    if (!terms) { setError("Please accept the Terms and Privacy Policy before analyzing."); return; }
    setBusy(true); setError("");
    try {
      const r = await fetch("/api/trial/analyze", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) setError(d.error || "We could not analyze this situation."); else setResult(d);
    } catch { setError("We could not analyze this situation."); } finally { setBusy(false); }
  }

  return <main className="min-h-screen bg-[#f7f9fc] px-6 py-12"><div className="mx-auto max-w-2xl"><a href="/try" className="text-sm font-semibold text-[#0b1736]">← Try Actionora</a><div className="mt-8 rounded-3xl border bg-white p-7 shadow-sm"><p className="text-sm font-semibold text-blue-600">Your situation</p><h1 className="mt-2 text-3xl font-semibold text-[#0b1736]">What needs your attention?</h1><form onSubmit={analyze} className="mt-6 space-y-4">{([["client","Client name"],["waiting","What are you waiting for?"],["amount","Amount (optional)"],["due","Due date (optional)"],["lastContact","Last contact (optional)"],["notes","Anything else?"]] as const).map(([key,label]) => <input key={key} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} placeholder={label} className="w-full rounded-xl border px-4 py-3 text-sm" />)}<select value={form.responded} onChange={(e) => setForm({ ...form, responded: e.target.value })} className="w-full rounded-xl border px-4 py-3 text-sm"><option value="No">No response</option><option value="Yes">Yes</option></select>{error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}<label className="flex items-start gap-2 text-xs text-slate-500"><input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} className="mt-0.5" /><span>I agree to the <a href="/terms" className="underline">Terms</a> and <a href="/privacy" className="underline">Privacy Policy</a>.</span></label><button disabled={!form.client || !form.waiting || !terms || busy} className="w-full rounded-xl bg-[#0b1736] px-4 py-3 font-semibold text-white disabled:opacity-40">{busy ? "Analyzing…" : "Analyze situation"}</button></form>{result && <div className="mt-7 rounded-2xl border bg-slate-50 p-5"><p className="text-xs font-bold uppercase text-blue-600">Recommendation</p><h2 className="mt-2 text-xl font-semibold">{result.priority} priority</h2><p className="mt-3 text-sm text-slate-600">{result.reason}</p><p className="mt-3 font-semibold text-[#0b1736]">{result.recommendation}</p><div className="mt-4 rounded-xl bg-white p-4 text-sm">{result.suggested_message}</div><a href="/auth" className="mt-5 inline-block rounded-xl bg-blue-700 px-4 py-3 text-sm font-semibold text-white">Save this with Actionora</a></div>}</div></div></main>;
}
