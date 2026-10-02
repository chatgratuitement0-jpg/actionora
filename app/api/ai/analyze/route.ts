import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { buildActionContext, validateActionAnalysis } from "@/lib/ai/action-analysis";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { claims } } = await supabase.auth.getClaims();
  if (!claims?.sub) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null) as { client_id?: string } | null;
  if (!body?.client_id) return NextResponse.json({ error: "client_id is required" }, { status: 400 });

  const { data: member } = await supabase.from("workspace_members")
    .select("workspace_id").eq("user_id", claims.sub).limit(1).maybeSingle();
  if (!member) return NextResponse.json({ error: "Workspace not found" }, { status: 403 });

  const { data: client } = await supabase.from("clients")
    .select("id,name,notes").eq("id", body.client_id)
    .eq("workspace_id", member.workspace_id).maybeSingle();
  if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404 });

  const { data: invoice } = await supabase.from("invoices")
    .select("amount,currency,due_date,status").eq("client_id", client.id)
    .eq("workspace_id", member.workspace_id)
    .in("status", ["pending","partially_paid","overdue"])
    .order("due_date", { ascending: true }).limit(1).maybeSingle();

  const { data: activity } = await supabase.from("activities")
    .select("created_at").eq("client_id", client.id)
    .eq("workspace_id", member.workspace_id)
    .order("created_at", { ascending: false }).limit(1).maybeSingle();

  const context = buildActionContext({
    clientName: client.name,
    invoiceAmount: invoice?.amount,
    currency: invoice?.currency,
    dueDate: invoice?.due_date,
    lastActivity: activity?.created_at,
    notes: client.notes ?? undefined,
  });

  const overdue = invoice?.status === "overdue";
  const analysis = validateActionAnalysis({
    priority: overdue ? "high" : "medium",
    reason: overdue
      ? "The client has an outstanding invoice past its due date."
      : "The client has an outstanding situation that may need follow-up.",
    recommendation: overdue
      ? "Review the payment status and follow up with the client."
      : "Review the client timeline and decide whether a follow-up is needed.",
    suggested_message: overdue
      ? "Hi " + client.name + ", I’m following up regarding the outstanding payment. Could you please let me know when we can expect it? Thank you."
      : "Hi " + client.name + ", I’m following up on the current situation. Do you have an update for me? Thank you.",
  });
  if (!analysis) return NextResponse.json({ error: "Invalid analysis" }, { status: 500 });

  const { data: saved } = await supabase.from("ai_analyses").insert({
    workspace_id: member.workspace_id,
    user_id: claims.sub,
    client_id: client.id,
    context,
    status: "completed",
    completed_at: new Date().toISOString(),
  }).select("id").single();

  if (saved) {
    await supabase.from("ai_recommendations").insert({
      analysis_id: saved.id,
      workspace_id: member.workspace_id,
      action_type: "follow_up",
      priority: analysis.priority,
      reason: analysis.reason,
      recommendation: analysis.recommendation,
      confidence: 0.9,
    });
  }

  return NextResponse.json({ analysis, analysis_id: saved?.id ?? null });
}