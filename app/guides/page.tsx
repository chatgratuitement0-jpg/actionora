import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Guides for client follow-ups, payments and next actions",
  description: "Practical guides for overdue invoices, client follow-ups, client silence and building a simple next-action workflow.",
  alternates: { canonical: "/guides" },
};

const guides = [
  ["how-to-follow-up-overdue-invoice", "How to follow up on an overdue invoice without damaging the relationship", "A practical framework for clear, professional payment follow-ups."],
  ["client-stops-responding", "What to do when a client stops responding", "Separate waiting from action and keep the relevant context together."],
  ["task-list-vs-client-context", "Why a task list is not enough for client operations", "Understand the difference between a task and a context-rich next action."],
  ["simple-client-follow-up-system", "How to build a simple client follow-up system", "A practical workflow for context, timing, actions and daily review."],
];

export default function Guides() {
  return (
    <main className="min-h-screen bg-[#f8fafc] px-6 py-16">
      <div className="mx-auto max-w-5xl">
        <p className="font-semibold text-blue-600">Resources</p>
        <h1 className="mt-2 text-4xl font-semibold text-[#0b1736]">Guides for better client operations.</h1>
        <p className="mt-4 max-w-2xl text-slate-600">Practical guidance for client follow-ups, payments, waiting situations and deciding what needs attention next.</p>
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {guides.map(([slug, title, summary]) => (
            <article key={slug} className="rounded-2xl border bg-white p-6">
              <h2 className="text-xl font-semibold text-[#0b1736]"><Link href={`/guides/${slug}`} className="hover:text-blue-700">{title}</Link></h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">{summary}</p>
              <Link href={`/guides/${slug}`} className="mt-4 inline-block text-sm font-semibold text-blue-700">Read guide →</Link>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
