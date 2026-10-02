import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { buildActionContext, validateActionAnalysis } from "@/lib/ai/action-analysis";
import { analyzeWithProvider } from "@/lib/ai/provider";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { claims } } = await supabase.auth.getClaims();
  if (!claims?.sub) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null) as { client_id?: string; action_id?: string } | null;
  if (!body?.client_id) return NextResponse.json({ error: "client_id is required" }, { status: 400 });

  const { data: member } = await supabase
    .from("workspace_members")
    .select("workspace_id")
    .eq("user_id", claims.sub)
    .limit(1)
    .maybeSingle();
  if (!member) return NextResponse.json({ error: "Workspace not found" }, { status: 403 });

  const [{ data: client }, { data: invoice }, { data: activity }, { data: action }, { data: profile }] = await Promise.all([
    supabase.from("clients").select("id,name,notes").eq("id", body.client_id).eq("workspace_id", member.workspace_id).maybeSingle(),
    supabase.from("invoices").select("amount,currency,due_date,status").eq("client_id", body.client_id).eq("workspace_id", member.workspace_id).in("status", ["pending","partially_paid","overdue"]).order("due_date", { ascending: true }).limit(1).maybeSingle(),
    supabase.from("activities").select("created_at").eq("client_id", body.client_id).eq("workspace_id", member.workspace_id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
    body.action_id ? supabase.from("actions").select("title,description,reason,priority,status,due_at").eq("id", body.action_id).eq("client_id", body.client_id).eq("workspace_id", member.workspace_id).maybeSingle() : Promise.resolve({ data: null }),
    supabase.from("profiles").select("ai_mode,ai_suggest_messages,ai_suggest_priorities").eq("id", claims.sub).maybeSingle(),
  ]);

  if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404 });
  if (body.action_id && !action) return NextResponse.json({ error: "Action not found" }, { status: 404 });

  const context = buildActionContext({
    clientName: client.name,
    invoiceAmount: invoice?.amount,
    currency: invoice?.currency,
    dueDate: invoice?.due_date,
    lastActivity: activity?.created_at,
    notes: client.notes ?? undefined,
    currentAction: action ? {
      title: action.title,
      description: action.description ?? undefined,
      reason: action.reason ?? undefined,
      priority: action.priority,
      status: action.status,
      dueAt: action.due_at ?? undefined,
    } : undefined,
    aiMode: profile?.ai_mode ?? "balanced",
  });

  const providerInput = {
    clientName: client.name,
    waiting: action?.title ?? (invoice ? "the outstanding invoice" : "the current client situation"),
    amount: invoice ? String(invoice.amount) + " " + invoice.currency : undefined,
    due: invoice?.due_date ?? action?.due_at ?? undefined,
    responded: action?.status === "waiting" ? "No" : undefined,
    notes: client.notes ?? undefined,
    context: JSON.stringify(context),
  };

  let analysis;
  try {
    analysis = await analyzeWithProvider(providerInput);
  } catch {
    return NextResponse.json({ error: "The AI service is temporarily unavailable. No changes were made." }, { status: 503 });
  }

  const validated = validateActionAnalysis(analysis);
  if (!validated) return NextResponse.json({ error: "The AI response was invalid. No changes were made." }, { status: 502 });

  const { data: saved, error: analysisError } = await supabase.from("ai_analyses").insert({
    workspace_id: member.workspace_id,
    user_id: claims.sub,
    client_id: client.id,
    context,
    status: "completed",
    completed_at: new Date().toISOString(),
  }).select("id").single();

  if (analysisError || !saved) return NextResponse.json({ error: "The analysis could not be saved." }, { status: 500 });

  const { error: recommendationError } = await supabase.from("ai_recommendations").insert({
    analysis_id: saved.id,
    workspace_id: member.workspace_id,
    action_type: "follow_up",
    priority: validated.priority,
    reason: validated.reason,
    recommendation: validated.recommendation,
    confidence: 0.9,
  });
  if (recommendationError) return NextResponse.json({ error: "The recommendation could not be saved." }, { status: 500 });

  if (profile?.ai_suggest_messages !== false) {
    await supabase.from("ai_messages").insert({
      workspace_id: member.workspace_id,
      client_id: client.id,
      analysis_id: saved.id,
      tone: profile?.ai_mode ?? "balanced",
      content: validated.suggested_message,
    });
  }

  return NextResponse.json({ analysis: validated, analysis_id: saved.id });
}