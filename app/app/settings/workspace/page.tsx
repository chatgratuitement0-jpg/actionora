import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import WorkspaceForm from "@/components/settings/workspace-form";

export default async function WorkspaceSettings(){
 const s=await createClient();
 const {data:{claims}}=await s.auth.getClaims();
 if(!claims?.sub) redirect("/auth");
 const {data:m}=await s.from("workspace_members").select("workspace_id,role").eq("user_id",claims.sub).limit(1).maybeSingle();
 if(!m) redirect("/onboarding");
 const {data:w}=await s.from("workspaces").select("id,name,industry,team_size,timezone,language").eq("id",m.workspace_id).single();
 return <main className="px-6 py-10"><div className="mx-auto max-w-3xl"><p className="text-sm font-semibold text-blue-600">Settings</p><h1 className="mt-2 text-3xl font-semibold text-[#0b1736]">Workspace</h1><p className="mt-2 text-slate-500">Configure how your workspace works.</p><div className="mt-8 rounded-2xl border bg-white p-6"><WorkspaceForm workspace={w} canEdit={m.role==="owner"||m.role==="admin"}/></div></div></main>;
}