import type { Metadata } from "next";
export const metadata: Metadata = { title: "Follow-up Templates", description: "Free practical templates for payment, proposal, no-response and project follow-ups.", alternates: { canonical: "/templates" } };
const templates=[
["Payment follow-up","Hi [Client], I’m following up regarding the outstanding payment. Could you let me know when we can expect it? Thank you."],
["Proposal follow-up","Hi [Client], I wanted to follow up on the proposal we shared. Do you have any questions or an update on next steps?"],
["No-response follow-up","Hi [Client], just checking in on my previous message. When you have a moment, could you let me know where things stand?"],
["Project check-in","Hi [Client], I’m checking in on the project and wanted to confirm the next step and timeline. Thanks."],
];
export default function Templates(){return <main className="min-h-screen bg-[#f8fafc] px-6 py-16"><div className="mx-auto max-w-5xl"><p className="font-semibold text-blue-600">Resources</p><h1 className="mt-2 text-4xl font-semibold text-[#0b1736]">Follow-up templates.</h1><p className="mt-4 text-slate-600">Starting points you can edit for your own relationship and context.</p><div className="mt-10 grid gap-4 md:grid-cols-2">{templates.map(([title,text])=><article key={title} className="rounded-2xl border bg-white p-6"><h2 className="font-semibold text-[#0b1736]">{title}</h2><p className="mt-3 text-sm leading-6 text-slate-600">{text}</p></article>)}</div></div></main>}