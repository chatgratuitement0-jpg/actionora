import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function ActivityPage(){
 const s=await createClient(); const { data: claimsData } = await s.auth.getClaims(); const claims = claimsData?.claims; if(!claims?.sub)redirect("/auth");
 const {data:m}=await s.from("workspace_members").select("workspace_id").eq("user_id",claims.sub).limit(1).maybeSingle(); if(!m)redirect("/onboarding");
 const {data:events}=await s.from("activities").select("id,type,title,description,created_at,clients(name)").eq("workspace_id",m.workspace_id).order("created_at",{ascending:false}).limit(100);
 return <main className="px-6 py-10"><div className="mx-auto max-w-5xl"><p className="text-sm font-semibold text-blue-600">Activity</p><h1 className="mt-2 text-4xl font-semibold text-[#0b1736]">Everything happening across your workspace.</h1><div className="mt-8 rounded-3xl border bg-white p-6"><div className="space-y-6">{events?.length?events.map((e:any)=><div key={e.id} className="relative border-l-2 border-slate-200 pl-5"><span className="absolute -left-[5px] top-1 h-2 w-2 rounded-full bg-blue-600"/><p className="font-semibold text-[#0b1736]">{e.title}</p><p className="mt-1 text-sm text-slate-500">{e.clients?.name||"Workspace"} · {e.description||e.type}</p><p className="mt-1 text-xs text-slate-400">{new Date(e.created_at).toLocaleString()}</p></div>):<div className="py-12 text-center text-sm text-slate-500">No activity yet.</div>}</div></div></div></main>
}
