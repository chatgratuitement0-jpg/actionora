import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function NewActionPage({searchParams}:{searchParams:Promise<{client?:string}>}){
 const {client:clientId}=await searchParams; const s=await createClient(); const { data: claimsData } = await s.auth.getClaims(); const claims = claimsData?.claims; if(!claims?.sub) redirect("/auth");
 const {data:m}=await s.from("workspace_members").select("workspace_id").eq("user_id",claims.sub).limit(1).maybeSingle(); if(!m) redirect("/onboarding");
 const {data:clients}=await s.from("clients").select("id,name").eq("workspace_id",m.workspace_id).order("name");
 const selectedClient=clientId&&clients?.some(c=>c.id===clientId)?clientId:"";
 async function createAction(formData:FormData){ "use server";
   const sup=await createClient(); const {data:{claims:c}}=await sup.auth.getClaims(); if(!c?.sub) redirect("/auth");
   const {data:member}=await sup.from("workspace_members").select("workspace_id").eq("user_id",c.sub).limit(1).maybeSingle(); if(!member) redirect("/onboarding");
   const cid=String(formData.get("client_id")||""); const title=String(formData.get("title")||"").trim(); if(!cid||!title) return;
   const {data:client}=await sup.from("clients").select("id").eq("id",cid).eq("workspace_id",member.workspace_id).maybeSingle(); if(!client)return;
   const due=String(formData.get("due_at")||""); const {data:action}=await sup.from("actions").insert({workspace_id:member.workspace_id,client_id:cid,title,reason:String(formData.get("reason")||"").trim()||null,priority:String(formData.get("priority")||"medium") as any,status:"pending",due_at:due?new Date(due).toISOString():null,created_by:c.sub}).select("id").single();
   if(action) await sup.from("activities").insert({workspace_id:member.workspace_id,client_id:cid,type:"action_created",title:"Action created",description:title,created_by:c.sub});
   redirect("/app/actions");
 }
 return <main className="px-6 py-10"><div className="mx-auto max-w-2xl"><a href="/app/actions" className="text-sm text-slate-500">← Actions</a><h1 className="mt-4 text-4xl font-semibold text-[#0b1736]">Create an action</h1><form action={createAction} className="mt-8 space-y-4 rounded-3xl border bg-white p-6"><select name="client_id" defaultValue={selectedClient} required className="w-full rounded-xl border px-4 py-3"><option value="">Select client *</option>{clients?.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select><input name="title" required placeholder="What needs to happen? *" className="w-full rounded-xl border px-4 py-3"/><textarea name="reason" placeholder="Why does it matter?" className="min-h-24 w-full rounded-xl border px-4 py-3"/><input name="due_at" type="datetime-local" className="w-full rounded-xl border px-4 py-3"/><select name="priority" defaultValue="medium" className="w-full rounded-xl border px-4 py-3"><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select><button className="rounded-xl bg-[#0b1736] px-5 py-3 font-semibold text-white">Create action</button></form></div></main>
}
