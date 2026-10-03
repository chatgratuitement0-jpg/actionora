import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { cookies } from "next/headers";

const MAX={client:120,waiting:500,amount:80,due:40,lastContact:80,responded:10,notes:2000};

function resultFor(body: Record<string,string>) {
  const overdue = !!body.due && !Number.isNaN(Date.parse(body.due)) && new Date(body.due) < new Date();
  const priority = overdue ? "high" : body.responded === "No" ? "medium" : "low";
  const reason = overdue ? "The due date has passed, so this situation needs attention." : body.responded === "No" ? "There has been no response, so a clear follow-up may be appropriate." : "There is an active client situation that may need a next step.";
  return { priority, reason, recommendation: priority === "high" ? "Follow up today with a clear, professional message." : "Review the context and decide on the next appropriate follow-up.", suggested_message: `Hi ${body.client}, just following up on ${body.waiting}. Please let me know when you have an update. Thank you.` };
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as Record<string,string> | null;
  if (!body || typeof body.client !== "string" || typeof body.waiting !== "string") return NextResponse.json({ error: "Client and situation are required." }, { status: 400 });
  for (const [key,limit] of Object.entries(MAX)) {
    if (typeof body[key] !== "string" || body[key].length > limit) return NextResponse.json({ error: `The ${key} field is invalid or too long.` }, { status: 400 });
  }
  if (!["Yes","No"].includes(body.responded)) return NextResponse.json({ error: "Response status is invalid." }, { status: 400 });
  body.client=body.client.trim(); body.waiting=body.waiting.trim(); body.amount=body.amount.trim(); body.due=body.due.trim(); body.lastContact=body.lastContact.trim(); body.notes=body.notes.trim();
  if (!body.client || !body.waiting) return NextResponse.json({ error: "Client and situation are required." }, { status: 400 });

  const supabase = createAdminClient();
  const cookieStore = await cookies();
  const existingToken = cookieStore.get("actionora_trial")?.value;
  let session: { id: string; session_token: string } | null = null;

  if (existingToken) {
    const { data: existing } = await supabase.from("trial_sessions").select("id,session_token").eq("session_token", existingToken).gt("expires_at", new Date().toISOString()).maybeSingle();
    if (existing) {
      const since = new Date(); since.setHours(0,0,0,0);
      const { count } = await supabase.from("trial_analyses").select("id",{count:"exact",head:true}).eq("trial_session_id",existing.id).gte("created_at",since.toISOString());
      if ((count??0)>=3) return NextResponse.json({error:"You have reached the 3 free analyses for today. Create an account to continue."},{status:429});
      session=existing;
    }
  }
  if (!session) {
    const token=crypto.randomUUID();
    const {data:created,error:sessionError}=await supabase.from("trial_sessions").insert({session_token:token,expires_at:new Date(Date.now()+24*60*60*1000).toISOString()}).select("id,session_token").single();
    if(sessionError||!created)return NextResponse.json({error:"Trial session could not be created."},{status:500});
    session=created;
  }
  const result=resultFor(body);
  const {error:analysisError}=await supabase.from("trial_analyses").insert({trial_session_id:session.id,input_data:body,result_data:result});
  if(analysisError)return NextResponse.json({error:"Trial analysis could not be saved."},{status:500});
  const response=NextResponse.json(result);
  response.cookies.set("actionora_trial",session.session_token,{httpOnly:true,sameSite:"lax",secure:process.env.NODE_ENV==="production",maxAge:86400,path:"/"});
  return response;
}
