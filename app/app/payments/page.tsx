import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function PaymentsPage() {
  const s=await createClient();
  const {data:{claims}}=await s.auth.getClaims();
  if(!claims?.sub) redirect("/auth");
  const {data:m}=await s.from("workspace_members").select("workspace_id").eq("user_id",claims.sub).limit(1).maybeSingle();
  if(!m) redirect("/onboarding");
  const {data:invoices}=await s.from("invoices").select("id,invoice_number,amount,currency,due_date,status,clients(name)").eq("workspace_id",m.workspace_id).order("due_date",{ascending:true});
  return <main className="min-h-screen bg-[#f7f9fc] px-6 py-10"><div className="mx-auto max-w-7xl"><p className="text-sm font-semibold text-blue-600">Payments</p><h1 className="mt-2 text-4xl font-semibold text-[#0b1736]">Track what’s paid, pending, and overdue.</h1><div className="mt-8 rounded-3xl border bg-white overflow-hidden">{invoices?.length?<div className="divide-y">{invoices.map((i:any)=><div key={i.id} className="flex flex-col gap-2 p-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-semibold">{i.clients?.name||"Client"}</p><p className="text-sm text-slate-500">{i.invoice_number||"Invoice"} · {i.amount} {i.currency}</p></div><span className="text-xs font-semibold uppercase text-blue-600">{i.status}</span></div>)}</div>:<div className="p-12 text-center text-sm text-slate-500">No invoices yet.</div>}</div></div></main>