import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Client operations software for clear next actions",
  description: "See how Actionora brings client context, payments, follow-ups and activity into one action-focused workspace.",
  alternates: { canonical: "/product" },
};
import Link from "next/link";

export default function ProductPage() {
  return <main className="min-h-screen bg-white px-6 py-16"><div className="mx-auto max-w-6xl">
    <Link href="/" className="font-bold text-[#0b1736]">Actionora</Link>
    <div className="mt-20 max-w-3xl"><p className="text-sm font-semibold text-blue-600">Product</p><h1 className="mt-3 text-5xl font-semibold tracking-tight text-[#0b1736]">Turn pending client situations into clear next actions.</h1><p className="mt-6 text-lg leading-8 text-slate-600">Actionora brings client context, payments, follow-ups and activity into one action-focused workspace.</p></div>
    <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-4">{["Today’s actions","Client context","Payment context","AI assistance"].map((x)=><div key={x} className="rounded-2xl border bg-slate-50 p-6"><h2 className="font-semibold text-[#0b1736]">{x}</h2><p className="mt-2 text-sm leading-6 text-slate-600">See the information you need to decide what to do next.</p></div>)}</div>
    <Link href="/try" className="mt-10 inline-block rounded-xl bg-[#0b1736] px-5 py-3 text-sm font-semibold text-white">Try Actionora</Link>
  </div></main>;
}