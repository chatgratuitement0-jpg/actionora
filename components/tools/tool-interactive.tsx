"use client";

import { useMemo, useState } from "react";

export default function ToolInteractive({ slug }: { slug: string }) {
  const [amount, setAmount] = useState("");
  const [days, setDays] = useState("");
  const [tone, setTone] = useState("professional");
  const [client, setClient] = useState("there");
  const [situation, setSituation] = useState("an update");
  const [result, setResult] = useState("");

  const calculated = useMemo(() => {
    const n = Number(days);
    return Number.isFinite(n) && n >= 0 ? n : null;
  }, [days]);

  function generate() {
    if (slug === "payment-due-calculator") {
      const date = new Date();
      date.setDate(date.getDate() + Math.max(0, Number(days) || 0));
      setResult(`If the invoice is issued today, the calculated due date is ${date.toLocaleDateString()}.`);
      return;
    }
    if (slug === "late-payment-calculator") {
      setResult(calculated === null ? "Enter the number of overdue days." : `The invoice is ${calculated} day${calculated === 1 ? "" : "s"} overdue.`);
      return;
    }
    const opening = tone === "friendly" ? "Hi" : tone === "firm" ? "Hello" : "Hi";
    const money = amount ? ` regarding the ${amount} invoice` : "";
    setResult(`${opening} ${client}, just following up${money} about ${situation}. Could you please let me know when you have an update? Thank you.`);
  }

  if (slug === "follow-up-templates") {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {[
          ["Payment", "Hi [Client], I’m following up on the outstanding payment. Could you let me know when we can expect it? Thank you."],
          ["Proposal", "Hi [Client], I wanted to follow up on the proposal we shared. Do you have any questions or an update on next steps?"],
          ["No response", "Hi [Client], just checking in on my previous message. When you have a moment, could you let me know where things stand?"],
          ["Project", "Hi [Client], I’m checking in on the project and wanted to confirm the next step and timeline. Thanks."],
        ].map(([title, text]) => (
          <article key={title} className="rounded-2xl border bg-white p-5">
            <h2 className="font-semibold text-[#0b1736]">{title}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">{text}</p>
            <button onClick={() => navigator.clipboard?.writeText(text)} className="mt-4 text-sm font-semibold text-blue-700">Copy template</button>
          </article>
        ))}
      </div>
    );
  }

  return (
    <div className="rounded-3xl border bg-white p-6 shadow-sm">
      <div className="grid gap-4 md:grid-cols-2">
        {slug === "payment-due-calculator" || slug === "late-payment-calculator" ? (
          <label className="text-sm font-medium">Days
            <input type="number" min="0" value={days} onChange={e => setDays(e.target.value)} className="mt-2 w-full rounded-xl border px-4 py-3" placeholder="30" />
          </label>
        ) : (
          <>
            <label className="text-sm font-medium">Client name
              <input value={client} onChange={e => setClient(e.target.value)} className="mt-2 w-full rounded-xl border px-4 py-3" />
            </label>
            <label className="text-sm font-medium">Situation
              <input value={situation} onChange={e => setSituation(e.target.value)} className="mt-2 w-full rounded-xl border px-4 py-3" placeholder="the proposal" />
            </label>
            <label className="text-sm font-medium">Amount (optional)
              <input value={amount} onChange={e => setAmount(e.target.value)} className="mt-2 w-full rounded-xl border px-4 py-3" placeholder="€850" />
            </label>
            <label className="text-sm font-medium">Tone
              <select value={tone} onChange={e => setTone(e.target.value)} className="mt-2 w-full rounded-xl border px-4 py-3">
                <option value="professional">Professional</option>
                <option value="friendly">Friendly</option>
                <option value="firm">Firm</option>
              </select>
            </label>
          </>
        )}
      </div>
      <button onClick={generate} className="mt-5 rounded-xl bg-[#0b1736] px-5 py-3 text-sm font-semibold text-white">Generate result</button>
      {result && <div className="mt-5 rounded-2xl bg-slate-50 p-5 text-sm leading-6 text-slate-700"><p>{result}</p><button onClick={() => navigator.clipboard?.writeText(result)} className="mt-3 font-semibold text-blue-700">Copy</button></div>}
    </div>
  );
}
