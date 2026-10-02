import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function NewClientPage(){
 const s=await createClient(); const { data: claimsData } = await s.auth.getClaims(); const claims = claimsData?.claims; if(!claims?.sub) redirect("/auth");
 const {data:m}=await s.from("workspace_members").select("workspace_id").eq("user_id",claims.sub).limit(1).maybeSingle(); if(!m) redirect("/onboarding");
 async function createClientAction(formData:FormData){
   "use server";
   const sup=await createClient(); const {data:{claims:c}}=await sup.auth.getClaims(); if(!c?.sub) redirect("/auth");
   const {data:member}=await sup.from("workspace_members").select("workspace_id").eq("user_id",c.sub).limit(1).maybeSingle(); if(!member) redirect("/onboarding");
   const name=String(formData.get("name")||"").trim(); if(!name) return;
   await sup.from("clients").insert({workspace_id:member.workspace_id,name,company_name:String(formData.get("company_name")||"").trim()||null,email:String(formData.get("email")||"").trim()||null,phone:String(formData.get("phone")||"").trim()||null,notes:String(formData.get("notes")||"").trim()||null,status:"on_track"});
   redirect("/app/clients");
 }
 return <main className="min-h-screen px-6 py-10"><div className="mx-auto max-w-2xl"><a href="/app/clients" className="text-sm text-slate-500">← Back to clients</a><h1 className="mt-4 text-4xl font-semibold text-[#0b1736]">Add a client</h1><form action={createClientAction} className="mt-8 space-y-4 rounded-3xl border bg-white p-6"><input name="name" required placeholder="Client name *" className="w-full rounded-xl border px-4 py-3"/><input name="company_name" placeholder="Company" className="w-full rounded-xl border px-4 py-3"/><input name="email" type="email" placeholder="Email" className="w-full rounded-xl border px-4 py-3"/><input name="phone" placeholder="Phone" className="w-full rounded-xl border px-4 py-3"/><textarea name="notes" placeholder="Notes" className="min-h-28 w-full rounded-xl border px-4 py-3"/><button className="rounded-xl bg-[#0b1736] px-5 py-3 font-semibold text-white">Create client</button></form></div></main>
}
