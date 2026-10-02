import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function DocumentsPage() {
  const s = await createClient();
  const { data: { claims } } = await s.auth.getClaims();
  if (!claims?.sub) redirect("/auth");
  const { data: member } = await s.from("workspace_members").select("workspace_id").eq("user_id", claims.sub).limit(1).maybeSingle();
  if (!member) redirect("/onboarding");

  const { data: documents } = await s.from("documents")
    .select("id,file_name,mime_type,file_size,status,created_at,client_id,clients(name)")
    .eq("workspace_id", member.workspace_id)
    .order("created_at", { ascending: false })
    .limit(50);

  async function upload(formData: FormData) {
    "use server";
    const file = formData.get("file");
    if (!(file instanceof File) || file.size === 0) redirect("/app/documents");
    const form = new FormData();
    form.set("file", file);
    const clientId = String(formData.get("client_id") || "");
    if (clientId) form.set("client_id", clientId);
    const origin = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    await fetch(new URL("/api/documents/upload", origin), { method: "POST", body: form, headers: { cookie: (await import("next/headers")).headers().then(h => h.get("cookie") || "") } }).catch(() => null);
    redirect("/app/documents");
  }

  const { data: clients } = await s.from("clients").select("id,name").eq("workspace_id", member.workspace_id).order("name").limit(200);

  return (
    <main className="px-6 py-10">
      <div className="mx-auto max-w-5xl">
        <p className="text-sm font-semibold text-blue-600">Documents</p>
        <h1 className="mt-2 text-3xl font-semibold text-[#0b1736]">Private workspace documents.</h1>
        <p className="mt-2 text-slate-500">PDF, DOCX and XLSX files stay in private storage and are linked to your workspace.</p>
        <form action={upload} className="mt-8 rounded-2xl border bg-white p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <input required name="file" type="file" accept=".pdf,.docx,.xlsx,application/pdf" className="rounded-xl border p-3 text-sm" />
            <select name="client_id" className="rounded-xl border px-3 py-2.5 text-sm">
              <option value="">No client link</option>
              {clients?.map((c:any)=><option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <button className="mt-4 rounded-xl bg-[#0b1736] px-5 py-3 text-sm font-semibold text-white">Upload document</button>
        </form>
        <div className="mt-8 space-y-3">
          {documents?.map((d:any)=><div key={d.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-white p-4"><div><p className="font-semibold text-[#0b1736]">{d.file_name}</p><p className="text-xs text-slate-500">{d.clients?.name || "No client"} · {Math.ceil(d.file_size/1024)} KB</p></div><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase">{d.status}</span></div>)}
          {!documents?.length && <div className="rounded-2xl border bg-white p-8 text-center text-sm text-slate-500">No documents yet.</div>}
        </div>
      </div>
    </main>
  );
}