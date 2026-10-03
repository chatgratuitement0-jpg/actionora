import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Client follow-ups, payments and next actions",
  description:
    "Stay ahead of client follow-ups, overdue payments and pending work. Actionora brings context together and helps you decide what needs your attention.",
  alternates: { canonical: "/" },
};

const actions = [
  { client: "Sarah", detail: "€850 overdue · 8 days", action: "Follow up today", tone: "urgent" },
  { client: "Ahmed Studio", detail: "Proposal · waiting 5 days", action: "Check in tomorrow", tone: "attention" },
  { client: "Nova Agency", detail: "€1,400 · last contact 6 days", action: "Review situation", tone: "normal" },
];

export default function Home() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://actionora.com";
  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Actionora — Client follow-ups, payments and next actions",
    url: siteUrl,
    description:
      "Stay ahead of client follow-ups, overdue payments and pending work with Actionora.",
    isPartOf: { "@type": "WebSite", name: "Actionora", url: siteUrl },
  };

  return (
    <main className="min-h-screen overflow-hidden">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }} />
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-8">
        <a href="/" className="flex items-center gap-2 text-lg font-bold tracking-tight text-[#0b1736]">
          <span className="grid size-9 place-items-center rounded-xl bg-[#0b1736] text-sm text-white">A</span>
          Actionora
        </a>
        <div className="hidden items-center gap-8 text-sm text-slate-600 md:flex">
          <a href="#product" className="hover:text-[#2563eb]">Product</a>
          <a href="/tools" className="hover:text-[#2563eb]">Tools</a>
          <a href="/resources" className="hover:text-[#2563eb]">Resources</a>
          <a href="/pricing" className="hover:text-[#2563eb]">Pricing</a>
        </div>
        <div className="flex items-center gap-3">
          <a href="/auth" className="hidden px-3 py-2 text-sm font-medium text-slate-700 sm:block">Log in</a>
          <a href="/try" className="rounded-xl bg-[#0b1736] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#162650]">Try it free</a>
        </div>
      </nav>

      <section className="mx-auto grid max-w-7xl gap-16 px-6 pb-24 pt-16 lg:grid-cols-[1fr_0.95fr] lg:items-center lg:px-8 lg:pt-24">
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
            Client action intelligence
          </div>
          <h1 className="max-w-3xl text-5xl font-semibold leading-[1.03] tracking-[-0.045em] text-[#0b1736] sm:text-6xl lg:text-7xl">
            Know what needs your attention.
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-600">
            Stay ahead of clients, payments and follow-ups — without keeping everything in your head.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <a href="/try" className="rounded-xl bg-[#2563eb] px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5">Try it free</a>
            <a href="#product" className="rounded-xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-semibold text-[#0b1736] transition hover:border-slate-300">See how it works</a>
          </div>
          <p className="mt-4 text-xs text-slate-500">No setup required to explore the experience.</p>
        </div>

        <div className="relative">
          <div className="absolute -inset-8 -z-10 rounded-[3rem] bg-blue-50/70 blur-3xl" />
          <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-2xl shadow-slate-900/10">
            <div className="rounded-2xl bg-[#f7f9fc] p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Today</p>
                  <h2 className="mt-1 text-xl font-semibold text-[#0b1736]">What needs your attention</h2>
                </div>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-500">3 actions</span>
              </div>
              <div className="mt-5 space-y-3">
                {actions.map((item) => (
                  <div key={item.client} className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-md">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold text-[#0b1736]">{item.client}</p>
                        <p className="mt-1 text-sm text-slate-500">{item.detail}</p>
                      </div>
                      <span className={item.tone === "urgent" ? "rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600" : item.tone === "attention" ? "rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700" : "rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700"}>
                        {item.tone === "urgent" ? "High" : item.tone === "attention" ? "Waiting" : "Review"}
                      </span>
                    </div>
                    <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                      <span className="text-sm font-medium text-slate-700">Recommended action</span>
                      <span className="text-sm font-semibold text-[#2563eb]">{item.action} →</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="product" className="border-y border-slate-100 bg-[#f7f9fc]">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
          <p className="text-sm font-semibold text-blue-600">The problem</p>
          <h2 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight text-[#0b1736] sm:text-4xl">
            The hard part isn’t knowing everything. It’s knowing what matters now.
          </h2>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {["Clients everywhere", "Payments everywhere", "Tasks everywhere", "Context gets lost"].map((item) => (
              <div key={item} className="rounded-2xl border border-slate-200 bg-white p-6">
                <div className="mb-8 size-2 rounded-full bg-[#2563eb]" />
                <p className="font-semibold text-[#0b1736]">{item}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 grid gap-3 text-center text-sm font-semibold text-slate-600 sm:grid-cols-4">
            {["Client activity", "Context", "Intelligence", "Next action"].map((item, i) => (
              <div key={item} className="rounded-xl bg-white p-4 shadow-sm">
                <span className="text-blue-600">{String(i + 1).padStart(2, "0")}</span>
                <p className="mt-1">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-10 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between lg:px-8">
        <span>© 2026 Actionora. Built for clear next actions.</span>
        <div className="flex gap-5">
          <a href="/security" className="hover:text-[#0b1736]">Security</a>
          <a href="/privacy" className="hover:text-[#0b1736]">Privacy</a>
          <a href="/terms" className="hover:text-[#0b1736]">Terms</a>
        </div>
      </footer>
    </main>
  );
}
