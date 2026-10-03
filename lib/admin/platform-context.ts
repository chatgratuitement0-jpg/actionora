import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function getPlatformAdminContext() {
  const auth = await createClient();
  const { data: claimsData } = await auth.auth.getClaims();
  const userId = claimsData?.claims?.sub;
  if (!userId) redirect("/auth");

  const admin = createAdminClient();
  const { data: platformAdmin } = await admin.from("platform_admins").select("role").eq("user_id", userId).maybeSingle();
  if (!platformAdmin) redirect("/app/today");

  return { admin, userId, role: platformAdmin.role };
}
