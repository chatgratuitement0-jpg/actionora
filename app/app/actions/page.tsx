import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function ActionsPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string; priority?: string }> }) {
  const params = await searchParams;
  const q = (params.q || "").trim();
  const status = params.status || "all";
  const priority = params.priority || "all";
  const s = await createClient();
  const { data: { claims } } = await s.auth.getClaims();
  if (!claims?.sub) redirect("/auth");
  const { data: m } = await s.from("workspace_members").select("workspace_id").eq("user_id", claims.sub).limit(1).maybeSingle();
  if (!m) redirect("/onboarding");

  let query = s.from("actions").select("id,title,reason,priority,status,due_at,clients(name)").eq("workspace_id", m.workspace_id).order("due_at", { ascending: true });
  if (q) query = query.or(`title.ilike.%${q}%,reason.ilike.%${q}%`);
  if (status !== "all") query = query.eq("status", status);
  if (priority !== "all") query = query.eq("priority", priority);
  const { data: actions } = await query;

  return <main className="min-h-screen bg-[#f7f9fc] px-6 py-10"><div className="mx-auto max-w-7xl">
    <p className="text-sm font-semibold text-blue-600">Actions</p><h1 className="mt-2 text-4xl font-semibold text-[#0b1736]">Know what needs to happen next.</h1>
    <form className="mt-8 flex flex-col gap-3 lg:flex-row"><input name="q" defaultValue={q} placeholder="Search actions..." className="flex-1 rounded-xl border bg-white px-4 py-3 text-sm"/><select name="status" defaultValue={status} className="rounded-xl border bg-white px-4 py-3 text-sm"><option value="all">All statuses</option><option value="pending">Pending</option><option value="scheduled">Scheduled</option><option value="waiting">Waiting</option><option value="completed">Completed</option><option value="dismissed">Dismissed</option></select><select name="priority" defaultValue={priority} className="rounded-xl border bg-white px-4 py-3 text-sm"><option value="all">All priorities</option><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option></select><button className="rounded-xl border bg-white px-5 py-3 text-sm font-semibold">Filter</button></form>
    <div className="mt-6 grid gap-3">{actions?.length ? actions.map((a:any)=><a href={"/app/actions/"+a.id} key={a.id} className="block rounded-2xl border bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-sm"><div className="flex justify-between gap-4"><div><p className="font-semibold text-[#0b1736]">{a.title}</p><p className="mt-1 text-sm text-slate-500">{a.clients?.name || "Client"}{a.reason ? " · " + a.reason : ""}</p></div><span className="text-xs font-semibold uppercase text-blue-600">{a.priority} · {a.status}</span></div></a>) : <div className="rounded-3xl border bg-white p-12 text-center text-sm text-slate-500">{q || status !== "all" || priority !== "all" ? "No matching actions. Try another filter." : "No actions yet. Your next actions will appear here."}</div>}</div>
  </div></main>;
}