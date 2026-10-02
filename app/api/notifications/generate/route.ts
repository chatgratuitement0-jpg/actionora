import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  const supabase = await createClient();
  const { data: { claims } } = await supabase.auth.getClaims();
  if (!claims?.sub) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  const userId = claims.sub as string;
  const { data: membership } = await supabase
    .from("workspace_members")
    .select("workspace_id")
    .eq("user_id", userId)
    .limit(1)
    .maybeSingle();

  if (!membership) return NextResponse.json({ error: "Workspace not found." }, { status: 404 });

  const workspaceId = membership.workspace_id as string;
  const { data: preferences } = await supabase
    .from("notification_preferences")
    .select("in_app_enabled,action_due,overdue")
    .eq("user_id", userId)
    .maybeSingle();

  if (preferences?.in_app_enabled === false) return NextResponse.json({ created: 0 });

  let created = 0;

  if (preferences?.action_due !== false) {
    const { data: actions } = await supabase
      .from("actions")
      .select("id,title,due_at")
      .eq("workspace_id", workspaceId)
      .in("status", ["pending", "scheduled"])
      .lte("due_at", new Date().toISOString())
      .limit(50);

    for (const action of actions || []) {
      const { data: existing } = await supabase
        .from("notifications")
        .select("id")
        .eq("user_id", userId)
         .eq("type", "action_due")
        .eq("metadata->>entity_id", action.id)
        .limit(1)
        .maybeSingle();

      if (existing) continue;

      const { error } = await supabase.from("notifications").insert({
        workspace_id: workspaceId,
        user_id: userId,
        type: "action_due",
        title: "Action needs your attention",
        message: action.title,
        metadata: { href: "/app/actions/" + action.id, entity_type: "action", entity_id: action.id }
      });

      if (!error) created++;
    }
  }

  if (preferences?.overdue !== false) {
    const { data: overdueInvoices } = await supabase
      .from("invoices")
      .select("id,invoice_number,amount,currency")
      .eq("workspace_id", workspaceId)
      .eq("status", "overdue")
      .limit(50);

    for (const invoice of overdueInvoices || []) {
      const { data: existing } = await supabase
        .from("notifications")
        .select("id")
        .eq("user_id", userId)
         .eq("type", "payment_overdue")
        .eq("metadata->>entity_id", invoice.id)
        .limit(1)
        .maybeSingle();

      if (existing) continue;

      const { error } = await supabase.from("notifications").insert({
        workspace_id: workspaceId,
        user_id: userId,
        type: "payment_overdue",
        title: "Payment is overdue",
        message: invoice.invoice_number ? "Invoice " + invoice.invoice_number + " is overdue." : "An invoice is overdue.",
        metadata: { href: "/app/payments/" + invoice.id, entity_type: "invoice", entity_id: invoice.id }
      });

      if (!error) created++;
    }
  }

  return NextResponse.json({ created });
}
