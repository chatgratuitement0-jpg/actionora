import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next");

  if (!code) return NextResponse.redirect(new URL("/auth?error=callback", url.origin));

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) return NextResponse.redirect(new URL("/auth?error=callback", url.origin));

  const { data: claimsData } = await supabase.auth.getClaims(); const claims = claimsData?.claims;
  if (!claims?.sub) return NextResponse.redirect(new URL("/auth?error=session", url.origin));

  const { data: membership } = await supabase
    .from("workspace_members")
    .select("workspace_id")
    .eq("user_id", claims.sub)
    .limit(1)
    .maybeSingle();

  const destination = next === "/app/today" && membership ? "/app/today" : membership ? "/app/today" : "/onboarding";
  return NextResponse.redirect(new URL(destination, url.origin));
}
