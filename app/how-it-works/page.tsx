import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How Actionora works",
  description: "See how Actionora turns scattered client context into one clear next action.",
  alternates: { canonical: "/how-it-works" },
};
import Link from "next/link";

const steps=[["01","Capture","Add a client, invoice, action or activity."],["02","Understand","Actionora keeps the relevant context together."],["03","Decide","Review why something needs attention and the suggested next step."],["04","Act","Edit, schedule or complete the action yourself."]];
export default function HowItWorksPage(){return <main className="min-h-screen bg-[#f7f9fc] px-6 py-16"><div className="mx-auto max-w-6xl"><Link href="/" className="font-bold text-[#0b1736]">Actionora</Link><div className="mt-20 max-w-3xl"><p className="text-sm font-semibold text-blue-600">How it works</p><h1 className="mt-3 text-5xl font-semibold tracking-tight text-[#0b1736]">From scattered client context to one clear next step.</h1></div><div className="mt-14 grid gap-4 md:grid-cols-2">{steps.map(([n,t,d])=><div key={n} className="rounded-3xl border bg-white p-7"><span className="text-sm font-bold text-blue-600">{n}</span><h2 className="mt-4 text-xl font-semibold text-[#0b1736]">{t}</h2><p className="mt-2 text-slate-600">{d}</p></div>)}</div><p className="mt-8 text-sm text-slate-500">AI recommendations are optional and require your confirmation before an action is created. Actionora does not automatically send sensitive communications.</p></div></main>}