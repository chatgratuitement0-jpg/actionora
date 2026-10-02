import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppSidebar, MobileNav } from "@/components/navigation/app-sidebar";
import { NotificationCenter } from "@/components/notifications/notification-center";
import { GlobalSearch } from "@/components/search/global-search";

export default async function AppLayout({children}:{children:React.ReactNode}) {
  const s=await createClient();
  const { data: claimsData } = await s.auth.getClaims(); const claims = claimsData?.claims;
  if(!claims?.sub) redirect("/auth");
  const {data:m}=await s.from("workspace_members").select("workspace_id").eq("user_id",claims.sub).limit(1).maybeSingle();
  if(!m) redirect("/onboarding");
  return <div className="min-h-screen bg-[#f7f9fc]"><div className="flex"><AppSidebar/><section className="min-w-0 flex-1 pb-16 md:pb-0"><header className="flex h-16 items-center justify-end border-b bg-white/90 px-6 backdrop-blur"><div className="flex items-center gap-3"><GlobalSearch/><NotificationCenter/></div></header>{children}</section></div><MobileNav/></div>;
}