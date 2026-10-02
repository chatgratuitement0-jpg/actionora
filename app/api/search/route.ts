import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const s = await createClient();
  const { data: { claims } } = await s.auth.getClaims();
  if (!claims?.sub) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: membership } = await s.from("workspace_members")
    .select("workspace_id").eq("user_id", claims.sub).limit(1).maybeSingle();
  if (!membership) return NextResponse.json({ error: "No workspace" }, { status: 403 });

  const q = new URL(request.url).searchParams.get("q")?.trim() || "";
  if (q.length < 2) return NextResponse.json({ clients: [], actions: [], invoices: [] });

  const escaped = q.replace(/[%_]/g, "\\$&");
  const pattern = "%" + escaped + "%";

  const [clients, actions, invoices] = await Promise.all([
    s.from("clients").select("id,name,company_name").eq("workspace_id", membership.workspace_id)
      .or("name.ilike." + pattern + ",company_name.ilike." + pattern).limit(8),
    s.from("actions").select("id,title,status,priority,client_id,clients(name)")
      .eq("workspace_id", membership.workspace_id).ilike("title", pattern).limit(8),
    s.from("invoices").select("id,invoice_number,status,amount,currency,client_id,clients(name)")
      .eq("workspace_id", membership.workspace_id).ilike("invoice_number", pattern).limit(8)
  ]);

  return NextResponse.json({
    clients: clients.data || [],
    actions: actions.data || [],
    invoices: invoices.data || []
  });
}