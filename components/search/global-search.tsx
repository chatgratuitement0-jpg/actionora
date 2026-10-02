"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Result = { clients:any[]; actions:any[]; invoices:any[] };

export function GlobalSearch() {
 const router=useRouter(); const [open,setOpen]=useState(false); const [q,setQ]=useState(""); const [data,setData]=useState<Result>({clients:[],actions:[],invoices:[]}); const input=useRef<HTMLInputElement>(null);
 useEffect(()=>{const onKey=(e:KeyboardEvent)=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==="k"){e.preventDefault();setOpen(true);setTimeout(()=>input.current?.focus(),0)} if(e.key==="Escape")setOpen(false)};window.addEventListener("keydown",onKey);return()=>window.removeEventListener("keydown",onKey)},[]);
 useEffect(()=>{if(q.trim().length<2){setData({clients:[],actions:[],invoices:[]});return} const t=setTimeout(async()=>{const r=await fetch("/api/search?q="+encodeURIComponent(q));if(r.ok)setData(await r.json())},180);return()=>clearTimeout(t)},[q]);
 const go=(path:string)=>{setOpen(false);setQ("");router.push(path)};
 return <><button onClick={()=>{setOpen(true);setTimeout(()=>input.current?.focus(),0)}} className="hidden w-72 items-center justify-between rounded-xl border bg-slate-50 px-3 py-2 text-left text-sm text-slate-400 md:flex"><span>Search clients, actions, invoices...</span><kbd className="rounded border bg-white px-1.5 py-0.5 text-[10px]">⌘K</kbd></button>
 {open&&<div className="fixed inset-0 z-50 bg-slate-950/30 p-4 backdrop-blur-sm" onMouseDown={()=>setOpen(false)}><div className="mx-auto mt-16 max-w-2xl overflow-hidden rounded-2xl border bg-white shadow-2xl" onMouseDown={e=>e.stopPropagation()}><input ref={input} value={q} onChange={e=>setQ(e.target.value)} onKeyDown={e=>e.key==="Escape"&&setOpen(false)} placeholder="Search clients, actions, invoices..." className="w-full border-b px-5 py-4 text-base outline-none"/><div className="max-h-[60vh] overflow-y-auto p-3">{q.length<2?<p className="p-5 text-sm text-slate-500">Type at least 2 characters.</p>:!data.clients.length&&!data.actions.length&&!data.invoices.length?<p className="p-5 text-sm text-slate-500">No results found.</p>:<div className="space-y-4">
 {data.clients.length>0&&<section><p className="px-2 text-xs font-bold uppercase text-slate-400">Clients</p>{data.clients.map(x=><button key={x.id} onClick={()=>go("/app/clients/"+x.id)} className="mt-1 block w-full rounded-xl px-3 py-2 text-left hover:bg-slate-50"><span className="font-medium">{x.name}</span>{x.company_name&&<span className="ml-2 text-sm text-slate-400">{x.company_name}</span>}</button>)}</section>}
 {data.actions.length>0&&<section><p className="px-2 text-xs font-bold uppercase text-slate-400">Actions</p>{data.actions.map(x=><button key={x.id} onClick={()=>go("/app/actions/"+x.id)} className="mt-1 block w-full rounded-xl px-3 py-2 text-left hover:bg-slate-50"><span className="font-medium">{x.title}</span><span className="ml-2 text-xs text-slate-400">{x.clients?.name||""}</span></button>)}</section>}
 {data.invoices.length>0&&<section><p className="px-2 text-xs font-bold uppercase text-slate-400">Invoices</p>{data.invoices.map(x=><button key={x.id} onClick={()=>go("/app/payments/"+x.id)} className="mt-1 block w-full rounded-xl px-3 py-2 text-left hover:bg-slate-50"><span className="font-medium">{x.invoice_number||"Invoice"}</span><span className="ml-2 text-sm text-slate-400">{x.clients?.name||""}</span></button>)}</section>}
 </div>}</div></div></div>}
 </>;
}