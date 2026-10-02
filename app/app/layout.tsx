import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppSidebar, MobileNav } from "@/components/navigation/app-sidebar";

export default async function AppLayout({children}:{children:React.ReactNode}) {
  const s=await createClient();
  const {data:{claims}}=await s.auth.getClaims();
  if(!claims?.sub) redirect("/auth");
  const {data:m}=await s.from("workspace_members").select("workspace_id").eq("user_id",claims.sub).limit(1).maybeSingle();
  if(!m) redirect("/onboarding");
  return <div className="min-h-screen bg-[#f7f9fc]"><div className="flex"><AppSidebar/><section className="min-w-0 flex-1 pb-16 md:pb-0">{children}</section></div><MobileNav/></div>;
}