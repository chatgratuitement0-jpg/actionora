import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function ActionsPage() {
  const s = await createClient();
  const { data: { claims } } = await s.auth.getClaims();
  if (!claims?.sub) redirect("/auth");

  const { data: m } = await s.from("workspace_members").select("workspace_id").eq("user_id", claims.sub).limit(1).maybeSingle();
  if (!m) redirect("/onboarding");

  const { data: actions } = await s.from("actions")
    .select("id,title,reason,priority,status,due_at,clients(name)")
    .eq("workspace_id", m.workspace_id)
    .order("due_at", { ascending: true });

  return (
    <main className="min-h-screen bg-[#f7f9fc] px-6 py-10">
      <div className="mx-auto max-w-7xl">
        <p className="text-sm font-semibold text-blue-600">Actions</p>
        <h1 className="mt-2 text-4xl font-semibold text-[#0b1736]">Know what needs to happen next.</h1>
        <div className="mt-8 grid gap-3">
          {actions?.length ? actions.map((a: any) => (
            <a href={"/app/actions/"+a.id} key={a.id} className="block rounded-2xl border bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-sm">
              <div className="flex justify-between gap-4">
                <div>
                  <p className="font-semibold text-[#0b1736]">{a.title}</p>
                  <p className="mt-1 text-sm text-slate-500">{a.clients?.name || "Client"}{a.reason ? " · " + a.reason : ""}</p>
                </div>
                <span className="text-xs font-semibold uppercase text-blue-600">{a.priority} · {a.status}</span>
              </div>
            </div>
          )) : (
            <div className="rounded-3xl border bg-white p-12 text-center text-sm text-slate-500">No actions yet. Your next actions will appear here.</div>
          )}
        </div>
      </div>
    </main>
  );
}