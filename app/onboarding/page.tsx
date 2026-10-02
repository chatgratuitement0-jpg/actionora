import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import OnboardingForm from "@/components/onboarding/onboarding-form";

export default async function OnboardingPage(){
  const supabase=await createClient();
  const {data:{claims}}=await supabase.auth.getClaims();
  if(!claims?.sub) redirect("/auth");

  const {data:membership}=await supabase.from("workspace_members").select("workspace_id").eq("user_id",claims.sub).limit(1).maybeSingle();
  if(membership?.workspace_id) redirect("/app/today");

  return <main className="min-h-screen bg-[#f7f9fc] px-6 py-12"><div className="mx-auto max-w-2xl"><p className="text-sm font-semibold text-blue-600">Set up your workspace</p><h1 className="mt-2 text-4xl font-semibold text-[#0b1736]">Let’s get your first action set up.</h1><p className="mt-3 text-slate-500">You can change these choices later.</p><OnboardingForm/></div></main>;
}