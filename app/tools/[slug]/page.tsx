import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ToolInteractive from "@/components/tools/tool-interactive";

const tools: Record<string, { title: string; description: string; intro: string }> = {
  "invoice-follow-up-generator": { title: "Invoice Follow-up Generator", description: "Generate a clear, professional invoice follow-up message.", intro: "Create a concise payment follow-up from a few simple details." },
  "payment-due-calculator": { title: "Payment Due Calculator", description: "Calculate an invoice due date quickly.", intro: "Use a simple day count to calculate an invoice due date." },
  "client-follow-up-generator": { title: "Client Follow-up Generator", description: "Create a professional client follow-up message.", intro: "Turn a situation into a clear message you can edit and send yourself." },
  "late-payment-calculator": { title: "Late Payment Calculator", description: "Calculate how many days an invoice is overdue.", intro: "Enter the overdue day count and get a simple result." },
  "follow-up-templates": { title: "Follow-up Templates", description: "Free client follow-up templates for common situations.", intro: "Start with practical templates for payments, proposals, no-response situations and projects." },
};

export async function generateStaticParams() {
  return Object.keys(tools).map(slug => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const tool = tools[slug];
  if (!tool) return {};
  return { title: tool.title, description: tool.description, alternates: { canonical: `/tools/${slug}` } };
}

export default async function ToolPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tool = tools[slug];
  if (!tool) notFound();
  return (
    <main className="min-h-screen bg-[#f8fafc] px-6 py-16">
      <div className="mx-auto max-w-4xl">
        <a href="/tools" className="text-sm font-semibold text-slate-500">← Free tools</a>
        <p className="mt-10 text-sm font-semibold text-blue-600">Free Actionora tool</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight text-[#0b1736]">{tool.title}</h1>
        <p className="mt-4 max-w-2xl text-lg text-slate-600">{tool.intro}</p>
        <div className="mt-8"><ToolInteractive slug={slug} /></div>
        <section className="mt-12 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border bg-white p-6"><h2 className="font-semibold text-[#0b1736]">How it works</h2><p className="mt-3 text-sm leading-6 text-slate-600">Enter only the information needed for this tool, review the result, and edit it before using it. The tool is designed to be useful without requiring an account.</p></div>
          <div className="rounded-2xl border bg-white p-6"><h2 className="font-semibold text-[#0b1736]">Need context, not just a message?</h2><p className="mt-3 text-sm leading-6 text-slate-600">Actionora keeps client history, payments and next actions together so you can decide what needs attention.</p><a href="/try" className="mt-4 inline-block text-sm font-semibold text-blue-700">Try Actionora →</a></div>
        </section>
      </div>
    </main>
  );
}
