import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function NewInvoicePage() {
  const s = await createClient();
  const { data: { claims } } = await s.auth.getClaims();
  if (!claims?.sub) redirect("/auth");
  const { data: m } = await s.from("workspace_members").select("workspace_id").eq("user_id", claims.sub).limit(1).maybeSingle();
  if (!m) redirect("/onboarding");
  const { data: clients } = await s.from("clients").select("id,name").eq("workspace_id", m.workspace_id).order("name");

  async function createInvoice(formData: FormData) {
    "use server";
    const sup = await createClient();
    const { data: { claims: c } } = await sup.auth.getClaims();
    if (!c?.sub) redirect("/auth");
    const { data: member } = await sup.from("workspace_members").select("workspace_id").eq("user_id", c.sub).limit(1).maybeSingle();
    if (!member) redirect("/onboarding");
    const cid = String(formData.get("client_id") || "");
    const amount = Number(formData.get("amount"));
    const due = String(formData.get("due_date") || "");
    if (!cid || !Number.isFinite(amount) || amount <= 0 || !due) return;
    const { data: client } = await sup.from("clients").select("id").eq("id", cid).eq("workspace_id", member.workspace_id).maybeSingle();
    if (!client) return;
    const { data: invoice } = await sup.from("invoices").insert({
      workspace_id: member.workspace_id, client_id: cid,
      invoice_number: String(formData.get("invoice_number") || "") || null,
      amount, currency: String(formData.get("currency") || "EUR"),
      issue_date: String(formData.get("issue_date") || new Date().toISOString().slice(0, 10)),
      due_date: due, status: "pending",
      description: String(formData.get("description") || "") || null,
      notes: String(formData.get("notes") || "") || null,
    }).select("id").single();
    if (invoice) await sup.from("activities").insert({
      workspace_id: member.workspace_id, client_id: cid, type: "invoice_created",
      title: "Invoice created", description: "Invoice " + String(formData.get("invoice_number") || ""), created_by: c.sub,
    });
    redirect("/app/payments");
  }

  return <main className="px-6 py-10"><div className="mx-auto max-w-2xl"><a href="/app/payments" className="text-sm text-slate-500">← Payments</a><h1 className="mt-4 text-4xl font-semibold text-[#0b1736]">Add invoice</h1><form action={createInvoice} className="mt-8 space-y-4 rounded-3xl border bg-white p-6"><select name="client_id" required className="w-full rounded-xl border px-4 py-3"><option value="">Select client *</option>{clients?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select><input name="invoice_number" placeholder="Invoice number" className="w-full rounded-xl border px-4 py-3" /><div className="grid gap-4 sm:grid-cols-2"><input name="amount" type="number" step="0.01" min="0.01" required placeholder="Amount *" className="w-full rounded-xl border px-4 py-3" /><input name="currency" defaultValue="EUR" placeholder="Currency" className="w-full rounded-xl border px-4 py-3" /></div><div className="grid gap-4 sm:grid-cols-2"><input name="issue_date" type="date" defaultValue={new Date().toISOString().slice(0, 10)} required className="w-full rounded-xl border px-4 py-3" /><input name="due_date" type="date" required className="w-full rounded-xl border px-4 py-3" /></div><textarea name="description" placeholder="Description" className="min-h-24 w-full rounded-xl border px-4 py-3" /><textarea name="notes" placeholder="Notes" className="min-h-20 w-full rounded-xl border px-4 py-3" /><button className="rounded-xl bg-[#0b1736] px-5 py-3 font-semibold text-white">Create invoice</button></form></div></main>;
}
