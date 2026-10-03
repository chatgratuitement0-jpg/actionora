import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://actionora.com";

const guides = {
  "how-to-follow-up-overdue-invoice": {
    title: "How to Follow Up on an Overdue Invoice Without Damaging the Relationship",
    description: "A practical framework for following up on an overdue invoice clearly, professionally and without unnecessary friction.",
    intro: "An overdue invoice needs a clear next step, not an emotional message. Start with the facts, make the requested action easy to understand, and give the client a simple way to respond.",
    sections: [
      ["Start with the facts", "Confirm the invoice number, amount, due date and the last relevant communication before writing. This prevents a follow-up from becoming vague or accusatory."],
      ["Make one clear request", "A useful payment follow-up asks for a concrete update: confirmation of payment, an expected payment date, or an explanation of what is blocking payment. Avoid stacking several unrelated requests into one message."],
      ["Keep the tone professional", "You can be direct without being aggressive. State what is outstanding, reference the agreed timing, and ask for the next step. The goal is clarity."],
      ["Decide what happens next", "If there is no response, do not rely on memory. Record when you followed up and decide when the next review should happen. The important operational question is not only whether an invoice is overdue, but what you should do about it next."],
    ],
    tool: ["/tools/invoice-follow-up-generator", "Use the free Invoice Follow-up Generator"],
  },
  "client-stops-responding": {
    title: "What to Do When a Client Stops Responding",
    description: "A practical way to handle client silence by separating waiting from action and keeping the relevant context together.",
    intro: "When a client stops responding, the right next step depends on what you are waiting for, when you last heard from them, what was promised, and what happens if nothing moves.",
    sections: [
      ["Check the last commitment", "Look at the last message, meeting or agreed deadline. A client who has been silent for two days after a non-urgent question is different from a client who has missed a project-critical commitment."],
      ["Separate waiting from action", "Not every unanswered message requires another message immediately. Record the situation and choose a reasonable follow-up point. This keeps your workflow from turning into repeated, unplanned reminders."],
      ["Explain why the next step matters", "Your follow-up should make the decision easy. Mention what you need, why it matters to the project or payment, and what kind of response would unblock the situation."],
      ["Keep a timeline", "Record the contact date and the outcome. Over time, a timeline gives you context that a simple task list cannot: what happened, what was tried, and what still needs attention."],
    ],
    tool: ["/tools/client-follow-up-generator", "Create a free client follow-up"],
  },
  "task-list-vs-client-context": {
    title: "Why a Task List Is Not Enough for Client Operations",
    description: "Understand the difference between a simple task and an action that includes client context, reason and next step.",
    intro: "A task such as “call Sarah” tells you what to do. It does not tell you why now, what happened before, what amount is involved, or what a successful outcome looks like.",
    sections: [
      ["Tasks describe activity", "Traditional task lists are useful for remembering work. They become less useful when the work depends on a relationship, a payment, a previous promise or a conversation."],
      ["Context explains the decision", "Client operations need the surrounding facts: last activity, outstanding amount, due date, project status and previous follow-ups. Without context, you spend time reconstructing the situation before acting."],
      ["An action connects context to a next step", "A stronger action looks like: “Sarah — €850 overdue — follow up today — ask for a payment date.” The action contains enough context to make the decision understandable."],
      ["Keep the system focused", "The goal is not to create a larger dashboard. It is to reduce the number of situations where you have to remember what happened and decide from scratch every time."],
    ],
    tool: ["/try", "Try Actionora with a client situation"],
  },
  "simple-client-follow-up-system": {
    title: "How to Build a Simple Client Follow-Up System",
    description: "A practical client follow-up workflow built around context, timing, actions and a clear daily review.",
    intro: "A useful follow-up system does not need dozens of fields. It needs enough context to understand the situation, a reliable record of activity, and a clear next action.",
    sections: [
      ["Capture the essential context", "Keep the client, the situation, relevant payment or project information, the latest activity and any important notes together."],
      ["Give every pending situation a next review point", "If you are waiting for someone, record when you will review it again. This prevents waiting situations from disappearing from your attention."],
      ["Review attention items daily", "Start the day with situations that actually need action. Separate urgent work from items that are simply waiting."],
      ["Record outcomes", "When you complete an action, record what happened. A history of actions and outcomes makes future decisions faster and more reliable."],
    ],
    tool: ["/tools/follow-up-templates", "Browse free follow-up templates"],
  },
} as const;

export function generateStaticParams() {
  return Object.keys(guides).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const guide = guides[slug as keyof typeof guides];
  if (!guide) return {};
  return {
    title: guide.title,
    description: guide.description,
    alternates: { canonical: `/guides/${slug}` },
    openGraph: {
      type: "article",
      title: guide.title,
      description: guide.description,
      url: `${siteUrl}/guides/${slug}`,
    },
  };
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = guides[slug as keyof typeof guides];
  if (!guide) notFound();

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guide.title,
    description: guide.description,
    url: `${siteUrl}/guides/${slug}`,
    author: { "@type": "Organization", name: "Actionora", url: siteUrl },
    publisher: { "@type": "Organization", name: "Actionora", url: siteUrl },
  };
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
      { "@type": "ListItem", position: 2, name: "Guides", item: `${siteUrl}/guides` },
      { "@type": "ListItem", position: 3, name: guide.title, item: `${siteUrl}/guides/${slug}` },
    ],
  };

  return (
    <main className="min-h-screen bg-[#f8fafc] px-6 py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([articleSchema, breadcrumbSchema]) }} />
      <article className="mx-auto max-w-3xl">
        <Link href="/guides" className="text-sm font-semibold text-slate-500">← Guides</Link>
        <p className="mt-10 text-sm font-semibold text-blue-600">Actionora guide</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[#0b1736] sm:text-5xl">{guide.title}</h1>
        <p className="mt-6 text-lg leading-8 text-slate-600">{guide.intro}</p>
        <div className="mt-10 space-y-8">
          {guide.sections.map(([heading, body]) => (
            <section key={heading}>
              <h2 className="text-2xl font-semibold text-[#0b1736]">{heading}</h2>
              <p className="mt-3 leading-8 text-slate-700">{body}</p>
            </section>
          ))}
        </div>
        <aside className="mt-12 rounded-3xl border border-blue-100 bg-blue-50 p-7">
          <h2 className="text-xl font-semibold text-[#0b1736]">Put this into practice</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">Use a free Actionora tool to turn the guidance into a concrete next step.</p>
          <Link href={guide.tool[0]} className="mt-5 inline-block rounded-xl bg-[#0b1736] px-5 py-3 text-sm font-semibold text-white">{guide.tool[1]} →</Link>
        </aside>
      </article>
    </main>
  );
}
