import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Actionora security",
  description: "Learn how Actionora approaches authentication, workspace isolation, private files, authorization and AI assistance.",
  alternates: { canonical: "/security" },
};
export default function Security(){return <main className="mx-auto max-w-3xl px-6 py-16"><h1 className="text-4xl font-semibold text-[#0b1736]">Security</h1><p className="mt-4 text-slate-600">Actionora is designed around private-by-default workspace data, authenticated access, server-side authorization and auditable sensitive operations.</p><div className="prose prose-slate mt-10 max-w-none"><h2>Access control</h2><p>Authentication identifies the user. Workspace membership and role determine what the user can access.</p><h2>Data isolation</h2><p>Workspace records are protected with server-side authorization and database row-level security.</p><h2>Files</h2><p>Sensitive files should remain in private storage and be served only after authorization.</p><h2>AI</h2><p>AI recommendations are assistance. Users review and confirm sensitive actions.</p></div></main>
}
