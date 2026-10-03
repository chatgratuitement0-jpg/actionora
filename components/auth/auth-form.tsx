"use client";
import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function AuthForm() {
  const supabase = createClient();
  const [mode,setMode] = useState<"signin"|"signup">(() => new URLSearchParams(window.location.search).get("mode") === "signin" ? "signin" : "signup");
  const [email,setEmail] = useState(""); const [password,setPassword] = useState(""); const [name,setName] = useState("");
  const [message,setMessage] = useState(""); const [busy,setBusy] = useState(false); const [terms,setTerms] = useState(false);
  async function submit(e:FormEvent){
    e.preventDefault(); setBusy(true); setMessage("");
    if(mode==="signup" && !terms){setMessage("Please accept the Terms and Privacy Policy.");setBusy(false);return;}
    const r=mode==="signup"?await supabase.auth.signUp({email,password,options:{data:{full_name:name}}}):await supabase.auth.signInWithPassword({email,password});
    setBusy(false); if(r.error){setMessage(r.error.message);return;}
    if(mode==="signup"&&!r.data.session){setMessage("Check your email to confirm your account.");return;}
    window.location.href="/onboarding";
  }
  async function oauth(provider:"google"|"apple"){
    setMessage("");
    if(!terms){setMessage("Please accept the Terms and Privacy Policy before continuing.");return;}
    const {error}=await supabase.auth.signInWithOAuth({provider,options:{redirectTo:window.location.origin+"/auth/callback"}});
    if(error)setMessage(error.message);
  }
  return <div className="mt-7"><div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1"><button type="button" onClick={()=>setMode("signup")} className={"rounded-lg px-3 py-2 text-sm font-semibold "+(mode==="signup"?"bg-white":"")}>Create account</button><button type="button" onClick={()=>setMode("signin")} className={"rounded-lg px-3 py-2 text-sm "+(mode==="signin"?"bg-white font-semibold":"")}>Log in</button></div><div className="mt-5 grid grid-cols-2 gap-3"><button type="button" onClick={()=>oauth("google")} className="rounded-xl border px-4 py-3 text-sm font-semibold">Google</button><button type="button" onClick={()=>oauth("apple")} className="rounded-xl border px-4 py-3 text-sm font-semibold">Apple</button></div><form onSubmit={submit} className="mt-5 space-y-4">{mode==="signup"&&<input required value={name} onChange={e=>setName(e.target.value)} placeholder="Name" className="w-full rounded-xl border p-3"/>}<input required type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" className="w-full rounded-xl border p-3"/><input required minLength={8} type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" className="w-full rounded-xl border p-3"/>{mode==="signin"&&<a href="/auth/forgot-password" className="block text-xs font-medium text-blue-700 hover:underline">Forgot your password?</a>}{mode==="signup"&&<label className="flex items-start gap-2 text-xs text-slate-500"><input type="checkbox" checked={terms} onChange={e=>setTerms(e.target.checked)} className="mt-0.5"/><span>I agree to the <a href="/terms" className="underline">Terms</a> and <a href="/privacy" className="underline">Privacy Policy</a>.</span></label>}<button disabled={busy|| (mode==="signup"&&!terms)} className="w-full rounded-xl bg-[#0b1736] p-3.5 font-semibold text-white disabled:opacity-40">{busy?"Please wait…":mode==="signup"?"Create account":"Log in"}</button></form>{message&&<p className="mt-4 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">{message}</p>}<p className="mt-5 text-xs text-slate-400">By continuing, you agree to the Terms and Privacy Policy.</p></div>;
}
