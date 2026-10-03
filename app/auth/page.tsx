import AuthForm from "@/components/auth/auth-form";

export default async function AuthPage({ searchParams }: { searchParams: Promise<{ mode?: string }> }) {
  const params = await searchParams;
  const initialMode = params.mode === "signin" ? "signin" : "signup";
  return <main className="min-h-screen bg-[#f7f9fc] px-6 py-16"><div className="mx-auto max-w-md"><a href="/" className="font-bold text-[#0b1736]">Actionora</a><div className="mt-10 rounded-3xl border border-slate-200 bg-white p-7 shadow-xl"><h1 className="text-3xl font-semibold text-[#0b1736]">Welcome to Actionora</h1><p className="mt-2 text-sm text-slate-500">Create an account or continue with your existing one.</p><AuthForm initialMode={initialMode} /></div></div></main>; 
}