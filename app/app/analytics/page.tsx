import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function AnalyticsPage(){
 const s=await createClient(); const { data: claimsData } = await s.auth.getClaims(); const claims = claimsData?.claims; if(!claims?.sub)redirect("/auth");
 const {data:m}=await s.from("workspace_members").select("workspace_id").eq("user_id",claims.sub).limit(1).maybeSingle(); if(!m)redirect("/onboarding");
 const [actionsRes,invoicesRes]=await Promise.all([
   s.from("actions").select("status,priority,created_at,completed_at,due_at").eq("workspace_id",m.workspace_id),
   s.from("invoices").select("amount,status,due_date,payments(amount)").eq("workspace_id",m.workspace_id)
 ]);
 const actions=actionsRes.data||[]; const invoices=invoicesRes.data||[];
 const completed=actions.filter((a:any)=>a.status==="completed").length;
 const waiting=actions.filter((a:any)=>a.status==="waiting").length;
 const overdueActions=actions.filter((a:any)=>a.status!=="completed"&&a.due_at&&new Date(a.due_at)<new Date()).length;
 const completionRate=actions.length?Math.round(completed/actions.length*100):0;
 const money=invoices.reduce((acc:any,i:any)=>{const paid=(i.payments||[]).reduce((x:number,p:any)=>x+Number(p.amount),0);const remaining=Math.max(0,Number(i.amount)-paid);acc.outstanding+=remaining;acc.paid+=paid;if(i.status==="overdue")acc.overdue+=remaining;return acc;},{outstanding:0,paid:0,overdue:0});
 return <main className="px-6 py-10"><div className="mx-auto max-w-7xl"><p className="text-sm font-semibold text-blue-600">Analytics</p><h1 className="mt-2 text-4xl font-semibold text-[#0b1736]">Understand your workflow over time.</h1><p className="mt-2 text-slate-500">A factual view of actions and payments in this workspace.</p>
 <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[["Actions",actions.length],["Completed",completed],["Waiting",waiting],["Completion rate",completionRate+"%"]].map(([label,value])=><div key={String(label)} className="rounded-2xl border bg-white p-5"><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-3xl font-semibold text-[#0b1736]">{value}</p></div>)}</section>
 <section className="mt-8 grid gap-4 lg:grid-cols-3">{[["Outstanding",money.outstanding],["Overdue",money.overdue],["Paid",money.paid]].map(([label,value])=><div key={String(label)} className="rounded-2xl border bg-white p-5"><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-2xl font-semibold text-[#0b1736]">{Number(value).toFixed(2)}</p><p className="mt-1 text-xs text-slate-400">Based on recorded invoice payments.</p></div>)}</section>
 <section className="mt-8 rounded-2xl border bg-white p-6"><h2 className="text-lg font-semibold text-[#0b1736]">Action priorities</h2><div className="mt-4 grid gap-3 sm:grid-cols-3">{["high","medium","low"].map((p)=>{const n=actions.filter((a:any)=>a.priority===p).length;return <div key={p} className="rounded-xl bg-slate-50 p-4"><p className="text-xs font-bold uppercase text-slate-500">{p}</p><p className="mt-1 text-2xl font-semibold">{n}</p></div>})}</div></section>
 </div></main>;
}