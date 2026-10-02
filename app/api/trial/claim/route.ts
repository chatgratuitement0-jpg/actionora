import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST() {
  const supabase = await createClient();
  const admin = createAdminClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  const token = (await import("next/headers")).cookies().then(c => c.get("actionora_trial")?.value);
  const trialToken = await token;
  if (!trialToken) return NextResponse.json({ claimed: false });

  const { data: session } = await admin
    .from("trial_sessions")
    .select("id, expires_at")
    .eq("session_token", trialToken)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();

  if (!session) return NextResponse.json({ claimed: false });

  const { data: analysis } = await admin
    .from("trial_analyses")
    .select("input_data,result_data")
    .eq("trial_session_id", session.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!analysis) return NextResponse.json({ claimed: false });

  const { data: workspace } = await supabase
    .from("workspaces")
    .select("id")
    .eq("created_by", user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!workspace) return NextResponse.json({ claimed: false, reason: "onboarding_required" });

  const input = analysis.input_data as Record<string,string>;
  const result = analysis.result_data as Record<string,string>;

  const { data: client, error: clientError } = await supabase
    .from("clients")
    .insert({ workspace_id: workspace.id, name: input.client, notes: input.notes || null, status: result.priority === "high" ? "attention" : "on_track" })
    .select("id")
    .single();

  if (clientError || !client) return NextResponse.json({ error: "Could not save the trial client." }, { status: 500 });

  const { error: actionError } = await supabase.from("actions").insert({
    workspace_id: workspace.id,
    client_id: client.id,
    title: result.recommendation,
    description: input.waiting,
    reason: result.reason,
    priority: result.priority,
    status: "pending",
    created_by: user.id
  });

  if (actionError) return NextResponse.json({ error: "Could not save the trial action." }, { status: 500 });

  await supabase.from("activities").insert({
    workspace_id: workspace.id,
    client_id: client.id,
    type: "action_created",
    title: "Trial situation added",
    description: result.recommendation,
    created_by: user.id
  });

  const response = NextResponse.json({ claimed: true, client_id: client.id });
  response.cookies.delete("actionora_trial");
  return response;
}