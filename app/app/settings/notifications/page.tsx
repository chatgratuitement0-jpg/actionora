import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import NotificationsForm from "@/components/settings/notifications-form";

export default async function NotificationSettings(){
 const s=await createClient();const { data: claimsData } = await s.auth.getClaims(); const claims = claimsData?.claims;if(!claims?.sub)redirect("/auth");
 const {data:p}=await s.from("notification_preferences").select("email_enabled,in_app_enabled,action_due,overdue,payment_received,weekly_summary,quiet_hours_start,quiet_hours_end").eq("user_id",claims.sub).maybeSingle();
 return <main className="px-6 py-10"><div className="mx-auto max-w-3xl"><p className="text-sm font-semibold text-blue-600">Settings</p><h1 className="mt-2 text-3xl font-semibold text-[#0b1736]">Notifications</h1><p className="mt-2 text-slate-500">Choose what Actionora should notify you about.</p><div className="mt-8 rounded-2xl border bg-white p-6"><NotificationsForm initial={p}/></div></div></main>;
}