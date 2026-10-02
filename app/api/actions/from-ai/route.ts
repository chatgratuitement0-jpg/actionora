import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { claims } } = await supabase.auth.getClaims();
  if (!claims?.sub) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => null) as { analysis_id?: string; confirm?: boolean } | null;
  if (!body?.analysis_id || body.confirm !== true) return NextResponse.json({ error: "analysis_id and confirmation are required" }, { status: 400 });
  const { data: member } = await supabase.from("workspace_members").select("workspace_id").eq("user_id", claims.sub).limit(1).maybeSingle();
  if (!member) return NextResponse.json({ error: "Workspace not found" }, { status: 403 });
  const { data: analysis } = await supabase.from("ai_analyses").select("id,client_id").eq("id", body.analysis_id).eq("workspace_id", member.workspace_id).eq("user_id", claims.sub).maybeSingle();
  if (!analysis) return NextResponse.json({ error: "Analysis not found" }, { status: 404 });
  const { data: recommendation } = await supabase.from("ai_recommendations").select("priority,reason,recommendation").eq("analysis_id", analysis.id).eq("workspace_id", member.workspace_id).maybeSingle();
  if (!recommendation) return NextResponse.json({ error: "Recommendation not found" }, { status: 404 });
  const { data: client } = await supabase.from("clients").select("id").eq("id", analysis.client_id).eq("workspace_id", member.workspace_id).maybeSingle();
  if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404 });
  const { data: action, error } = await supabase.from("actions").insert({
    workspace_id: member.workspace_id, client_id: client.id, title: recommendation.recommendation,
    reason: recommendation.reason, priority: recommendation.priority, status: "pending", created_by: claims.sub
  }).select("id").single();
  if (error || !action) return NextResponse.json({ error: "We could not create the action." }, { status: 500 });
  await supabase.from("activities").insert({
    workspace_id: member.workspace_id, client_id: client.id, type: "action_created",
    title: "AI-recommended action created", description: recommendation.recommendation, created_by: claims.sub
  });
  return NextResponse.json({ action_id: action.id });
}