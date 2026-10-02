import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { claims } } = await supabase.auth.getClaims();
  if (!claims?.sub) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => null) as { id?: string } | null;
  if (!body?.id) return NextResponse.json({ error: "Missing notification id" }, { status: 400 });
  const { error } = await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("id", body.id).eq("user_id", claims.sub);
  if (error) return NextResponse.json({ error: "Could not mark notification as read" }, { status: 500 });
  return NextResponse.json({ ok: true });
}