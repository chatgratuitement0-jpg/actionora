"use client";

import { useEffect } from "react";

export default function AppError({error,reset}:{error:Error&{digest?:string};reset:()=>void}){
 useEffect(()=>{console.error(error)},[error]);
 return <main className="px-6 py-16"><div className="mx-auto max-w-xl rounded-2xl border bg-white p-8 text-center"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">!</div><h1 className="mt-5 text-2xl font-semibold text-[#0b1736]">Something went wrong.</h1><p className="mt-2 text-slate-500">We couldn't load this page. No changes were made to your data.</p><button onClick={reset} className="mt-6 rounded-xl bg-[#0b1736] px-5 py-3 text-sm font-semibold text-white hover:opacity-90">Try again</button></div></main>
}