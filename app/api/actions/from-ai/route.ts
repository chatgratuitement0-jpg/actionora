import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { claims } } = await supabase.auth.getClaims();
  if (!claims?.sub) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => null) as { client_id?: string; recommendation?: string; reason?: string; priority?: string } | null;
  if (!body?.client_id || !body.recommendation) return NextResponse.json({ error: "Missing action data" }, { status: 400 });
  const { data: member } = await supabase.from("workspace_members").select("workspace_id").eq("user_id", claims.sub).limit(1).maybeSingle();
  if (!member) return NextResponse.json({ error: "Workspace not found" }, { status: 403 });
  const { data: client } = await supabase.from("clients").select("id").eq("id", body.client_id).eq("workspace_id", member.workspace_id).maybeSingle();
  if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404 });
  const priority = ["low", "medium", "high"].includes(body.priority ?? "") ? body.priority : "medium";
  const { data: action, error } = await supabase.from("actions").insert({ workspace_id: member.workspace_id, client_id: client.id, title: body.recommendation.trim(), reason: body.reason?.trim() || "Recommended by Actionora AI.", priority, status: "pending", created_by: claims.sub }).select("id").single();
  if (error || !action) return NextResponse.json({ error: "We could not create the action." }, { status: 500 });
  await supabase.from("activities").insert({ workspace_id: member.workspace_id, client_id: client.id, type: "action_created", title: "AI-recommended action created", description: body.recommendation.trim(), created_by: claims.sub });
  return NextResponse.json({ action_id: action.id });
}