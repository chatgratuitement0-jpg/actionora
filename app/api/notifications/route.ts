import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims(); const claims = claimsData?.claims;
  if (!claims?.sub) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data } = await supabase.from("notifications").select("id,title,message,created_at,read_at,metadata").eq("user_id", claims.sub).order("created_at", { ascending: false }).limit(20);
  return NextResponse.json(data ?? []);
}