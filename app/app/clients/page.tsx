import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function ClientsPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string }> }) {
  const params = await searchParams;
  const q = (params.q || "").trim();
  const status = params.status || "all";
  const s = await createClient();
  const { data: { claims } } = await s.auth.getClaims();
  if (!claims?.sub) redirect("/auth");
  const { data: m } = await s.from("workspace_members").select("workspace_id").eq("user_id", claims.sub).limit(1).maybeSingle();
  if (!m) redirect("/onboarding");

  let query = s.from("clients").select("id,name,company_name,status,email,created_at").eq("workspace_id", m.workspace_id).order("created_at", { ascending: false });
  if (q) query = query.or(`name.ilike.%${q}%,company_name.ilike.%${q}%,email.ilike.%${q}%`);
  if (status !== "all") query = query.eq("status", status);
  const { data: clients } = await query;

  return <main className="min-h-screen bg-[#f7f9fc] px-6 py-10"><div className="mx-auto max-w-7xl">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-semibold text-blue-600">Clients</p><h1 className="mt-2 text-4xl font-semibold text-[#0b1736]">Keep every relationship in context.</h1></div><a href="/app/clients/new" className="rounded-xl bg-[#0b1736] px-4 py-3 text-sm font-semibold text-white">+ Add client</a></div>
    <form className="mt-8 flex flex-col gap-3 sm:flex-row"><input name="q" defaultValue={q} placeholder="Search clients..." className="flex-1 rounded-xl border bg-white px-4 py-3 text-sm"/><select name="status" defaultValue={status} className="rounded-xl border bg-white px-4 py-3 text-sm"><option value="all">All statuses</option><option value="attention">Needs attention</option><option value="waiting">Waiting</option><option value="on_track">On track</option><option value="overdue">Overdue</option></select><button className="rounded-xl border bg-white px-5 py-3 text-sm font-semibold">Search</button></form>
    <div className="mt-6 overflow-hidden rounded-3xl border bg-white">{clients?.length?<div className="divide-y">{clients.map(c=><a href={"/app/clients/"+c.id} key={c.id} className="flex flex-col gap-2 p-5 hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-semibold text-[#0b1736]">{c.name}</p><p className="text-sm text-slate-500">{c.company_name||c.email||"No contact details"}</p></div><span className="w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold">{c.status}</span></a>)}</div>:<div className="p-12 text-center"><p className="font-semibold text-[#0b1736]">{q || status !== "all" ? "No matching clients." : "No clients yet."}</p><p className="mt-2 text-sm text-slate-500">{q || status !== "all" ? "Try another search or filter." : "Add your first client to start building context."}</p></div>}</div>
  </div></main>;
}