import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AIInsight } from "@/components/ai/ai-insight";

export default async function ClientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const s = await createClient();
  const { data: { claims } } = await s.auth.getClaims();
  if (!claims?.sub) redirect("/auth");

  const { data: m } = await s.from("workspace_members").select("workspace_id").eq("user_id", claims.sub).limit(1).maybeSingle();
  if (!m) redirect("/onboarding");

  const { data: client } = await s.from("clients")
    .select("id,name,company_name,email,phone,status,notes,created_at")
    .eq("id", id).eq("workspace_id", m.workspace_id).maybeSingle();
  if (!client) redirect("/app/clients");

  const { data: actions } = await s.from("actions")
    .select("id,title,reason,priority,status,due_at")
    .eq("client_id", id).eq("workspace_id", m.workspace_id).order("due_at", { ascending: true });

  const { data: activities } = await s.from("activities")
    .select("id,type,title,description,created_at")
    .eq("client_id", id).eq("workspace_id", m.workspace_id).order("created_at", { ascending: false }).limit(30);

  const { data: invoices } = await s.from("invoices")
    .select("id,invoice_number,amount,currency,due_date,status,created_at,payments(id,amount,payment_date)")
    .eq("client_id", id).eq("workspace_id", m.workspace_id).order("created_at", { ascending: false }).limit(30);

  const timeline = [
    ...(activities ?? []).map((e) => ({ id: "a-" + e.id, date: e.created_at, title: e.title, description: e.description || e.type })),
    ...(invoices ?? []).map((i: any) => ({
      id: "i-" + i.id, date: i.created_at, title: "Invoice " + (i.invoice_number || ""),
      description: `${Number(i.amount).toFixed(2)} ${i.currency} · ${i.status} · due ${i.due_date}`,
    })),
    ...(invoices ?? []).flatMap((i: any) =>
      (i.payments ?? []).map((p: any) => ({
        id: "p-" + p.id, date: p.payment_date, title: "Payment received",
        description: `${Number(p.amount).toFixed(2)} ${i.currency} · ${i.invoice_number || "Invoice"}`,
      })),
    ),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 50);

  return (
    <main className="px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <a href="/app/clients" className="text-sm text-slate-500">← Clients</a>
        <div className="mt-5 rounded-3xl border bg-white p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div><h1 className="text-3xl font-semibold text-[#0b1736]">{client.name}</h1><p className="mt-1 text-slate-500">{client.company_name || client.email || "No contact details"}</p></div>
            <a href={"/app/actions/new?client=" + client.id} className="rounded-xl bg-[#0b1736] px-4 py-3 text-sm font-semibold text-white">+ Create action</a>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs text-slate-500">Status</p><p className="mt-1 font-semibold">{client.status}</p></div>
            <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs text-slate-500">Open actions</p><p className="mt-1 font-semibold">{actions?.filter((a) => a.status !== "completed").length || 0}</p></div>
            <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs text-slate-500">Contact</p><p className="mt-1 font-semibold">{client.email || "—"}</p></div>
          </div>
        </div>
        <div className="mt-6"><AIInsight clientId={client.id} /></div>
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <section className="rounded-3xl border bg-white p-6">
            <h2 className="text-xl font-semibold">Next actions</h2>
            <div className="mt-4 space-y-3">{actions?.length ? actions.map((a) => <div key={a.id} className="rounded-2xl border p-4"><div className="flex justify-between gap-3"><p className="font-semibold">{a.title}</p><span className="text-xs uppercase text-blue-600">{a.priority}</span></div><p className="mt-1 text-sm text-slate-500">{a.reason || "No reason added"} · {a.status}</p></div>) : <p className="py-6 text-sm text-slate-500">No actions yet.</p>}</div>
          </section>
          <section className="rounded-3xl border bg-white p-6">
            <h2 className="text-xl font-semibold">Client timeline</h2>
            <p className="mt-1 text-sm text-slate-500">Actions, invoices, payments and activity in one history.</p>
            <div className="mt-5 space-y-5">{timeline.length ? timeline.map((e) => <div key={e.id} className="relative border-l-2 border-slate-200 pl-5"><span className="absolute -left-[5px] top-1 h-2 w-2 rounded-full bg-blue-600" /><p className="font-medium">{e.title}</p><p className="text-sm text-slate-500">{e.description}</p><p className="mt-1 text-xs text-slate-400">{new Date(e.date).toLocaleString()}</p></div>) : <p className="py-6 text-sm text-slate-500">No history yet.</p>}</div>
          </section>
        </div>
      </div>
    </main>
  );
}
