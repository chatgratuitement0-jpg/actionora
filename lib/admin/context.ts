import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function getAdminContext() {
  const s = await createClient();
  const { data: { user } } = await s.auth.getUser();
  if (!user) redirect("/auth");
  const { data: member } = await s.from("workspace_members").select("workspace_id,role").eq("user_id", user.id).in("role", ["owner","admin"]).limit(1).maybeSingle();
  if (!member) redirect("/app/today");
  return { s, user, workspaceId: member.workspace_id };
}
