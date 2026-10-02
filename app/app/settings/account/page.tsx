import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AccountForm from "@/components/settings/account-form";

export default async function AccountSettings(){
 const s=await createClient(); const { data: claimsData } = await s.auth.getClaims(); const claims = claimsData?.claims; if(!claims?.sub)redirect("/auth");
 const {data:profile}=await s.from("profiles").select("full_name,avatar_url").eq("id",claims.sub).maybeSingle();
 const {data:{user}}=await s.auth.getUser();
 return <main className="px-6 py-10"><div className="mx-auto max-w-3xl"><p className="text-sm font-semibold text-blue-600">Settings</p><h1 className="mt-2 text-3xl font-semibold text-[#0b1736]">Account</h1><p className="mt-2 text-slate-500">Manage your profile and sign-in details.</p><div className="mt-8 rounded-2xl border bg-white p-6"><AccountForm userId={claims.sub} email={user?.email||""} initialName={profile?.full_name||""} initialAvatar={profile?.avatar_url||""}/></div></div></main>;
}