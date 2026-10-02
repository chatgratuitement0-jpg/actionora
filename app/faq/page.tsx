import type { Metadata } from "next";
export const metadata: Metadata = { title: "FAQ", description: "Answers about Actionora, AI assistance, privacy, payments and accounts.", alternates: { canonical: "/faq" } };
const items=[
["What is Actionora?","Actionora is a client-operations workspace focused on helping you see what needs attention and decide the next action."],
["Does Actionora send messages automatically?","No. AI suggestions are reviewed by the user. Sensitive communication is not automatically sent by default."],
["Can I try Actionora before creating an account?","Yes. The public trial provides a limited experience with sample data or a client situation you enter."],
["How is workspace data protected?","Workspace data is authenticated and isolated with server-side authorization and database row-level security."],
["Does Actionora replace accounting software?","No. The product focuses on client context, actions and payment-related workflow rather than becoming a full accounting system."],
["Can I delete my account?","The product is designed to provide explicit account and data controls. Production deletion/export flows should be completed and verified before launch."],
];
export default function FAQ(){return <main className="min-h-screen bg-[#f8fafc] px-6 py-16"><div className="mx-auto max-w-4xl"><p className="font-semibold text-blue-600">FAQ</p><h1 className="mt-2 text-4xl font-semibold text-[#0b1736]">Questions, answered.</h1><div className="mt-10 space-y-4">{items.map(([q,a])=><section key={q} className="rounded-2xl border bg-white p-6"><h2 className="font-semibold text-[#0b1736]">{q}</h2><p className="mt-3 text-sm leading-6 text-slate-600">{a}</p></section>)}</div></div></main>}
