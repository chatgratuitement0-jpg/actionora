import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function resultFor(body: Record<string,string>) {
  const overdue = !!body.due && !Number.isNaN(Date.parse(body.due)) && new Date(body.due) < new Date();
  const priority = overdue ? "high" : body.responded === "No" ? "medium" : "low";
  const reason = overdue ? "The due date has passed, so this situation needs attention." : body.responded === "No" ? "There has been no response, so a clear follow-up may be appropriate." : "There is an active client situation that may need a next step.";
  return { priority, reason, recommendation: priority === "high" ? "Follow up today with a clear, professional message." : "Review the context and decide on the next appropriate follow-up.", suggested_message: `Hi ${body.client}, just following up on ${body.waiting}. Please let me know when you have an update. Thank you.` };
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as Record<string,string> | null;
  if (!body?.client || !body?.waiting) return NextResponse.json({ error: "Client and situation are required." }, { status: 400 });
  const supabase = await createClient();
  const token = crypto.randomUUID();
  const { data: session, error: sessionError } = await supabase.from("trial_sessions").insert({ session_token: token, expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() }).select("id,session_token").single();
  if (sessionError || !session) return NextResponse.json({ error: "Trial session could not be created." }, { status: 500 });
  const result = resultFor(body);
  const { error: analysisError } = await supabase.from("trial_analyses").insert({ trial_session_id: session.id, input_data: body, result_data: result });
  if (analysisError) return NextResponse.json({ error: "Trial analysis could not be saved." }, { status: 500 });
  const response = NextResponse.json({ ...result, trial_token: session.session_token });
  response.cookies.set("actionora_trial", session.session_token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 60 * 60 * 24, path: "/" });
  return response;
}