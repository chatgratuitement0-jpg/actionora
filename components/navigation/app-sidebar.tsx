"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items=[["/app/today","Today"],["/app/clients","Clients"],["/app/actions","Actions"],["/app/payments","Payments"],["/app/activity","Activity"],["/app/analytics","Analytics"],["/app/settings","Settings"]];

function NavLink({href,label}:{href:string;label:string}){
 const pathname=usePathname(); const active=pathname===href||pathname.startsWith(href+"/");
 return <Link href={href} className={"block rounded-xl px-3 py-2.5 text-sm font-medium transition "+(active?"bg-blue-50 text-blue-700":"text-slate-600 hover:bg-slate-100 hover:text-[#0b1736]")}>{label}</Link>;
}

export function AppSidebar(){return <aside className="hidden min-h-screen w-64 shrink-0 border-r bg-white p-5 md:block"><Link href="/app/today" className="block px-3 py-4 text-xl font-bold tracking-tight text-[#0b1736]">Actionora</Link><nav className="mt-6 space-y-1">{items.map(([href,label])=><NavLink key={href} href={href} label={label}/>)}</nav></aside>}

export function MobileNav(){return <nav className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-5 border-t bg-white/95 p-2 backdrop-blur md:hidden">{items.slice(0,5).map(([href,label])=><NavLink key={href} href={href} label={label}/>)}</nav>}
