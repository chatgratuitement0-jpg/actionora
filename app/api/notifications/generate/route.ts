import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  const supabase = await createClient();
  const { data: { claims } } = await supabase.auth.getClaims();
  if (!claims?.sub) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const userId = claims.sub as string;
  const { data: membership } = await supabase.from("workspace_members").select("workspace_id").eq("user_id", userId).limit(1).maybeSingle();
  if (!membership) return NextResponse.json({ error: "Workspace not found." }, { status: 404 });
  const workspaceId = membership.workspace_id as string;
  const { data: actions } = await supabase.from("actions").select("id,title,due_at").eq("workspace_id", workspaceId).in("status", ["pending","scheduled"]).lte("due_at", new Date().toISOString()).limit(50);
  let created = 0;
  for (const action of actions || []) {
    const { data: existing } = await supabase.from("notifications").select("id").eq("user_id", userId).eq("type", "action_due").eq("message", "ACTION:" + action.id).limit(1).maybeSingle();
    if (existing) continue;
    const { error } = await supabase.from("notifications").insert({ workspace_id: workspaceId, user_id: userId, type: "action_due", title: "Action needs your attention", message: "ACTION:" + action.id });
    if (!error) created++;
  }
  return NextResponse.json({ created });
}
