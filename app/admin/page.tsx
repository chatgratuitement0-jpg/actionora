import Link from "next/link";
import { getPlatformAdminContext } from "@/lib/admin/platform-context";

export default async function Admin() {
  const { admin, role } = await getPlatformAdminContext();
  const [users, workspaces, trials, feedback, errors] = await Promise.all([
    admin.from("profiles").select("id",{count:"exact",head:true}),
    admin.from("workspaces").select("id",{count:"exact",head:true}),
    admin.from("trial_sessions").select("id",{count:"exact",head:true}),
    admin.from("feedback").select("id",{count:"exact",head:true}),
    admin.from("system_events").select("id",{count:"exact",head:true}),
  ]);
  const links=[["Users","/admin/users"],["Workspaces","/admin/workspaces"],["Trials","/admin/trials"],["Feedback","/admin/feedback"],["Audit logs","/admin/audit-logs"],["System","/admin/system"]];
  return <main className="px-6 py-10"><div className="mx-auto max-w-7xl"><p className="text-sm font-semibold text-blue-600">Platform admin</p><div className="mt-2"><h1 className="text-4xl font-semibold text-[#0b1736]">Operations overview</h1><p className="mt-2 text-slate-500">Role: {role}. Platform access is separate from workspace membership.</p></div><div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">{[["Users",users.count],["Workspaces",workspaces.count],["Trials",trials.count],["Feedback",feedback.count],["System events",errors.count]].map(([label,count])=><div key={String(label)} className="rounded-2xl border bg-white p-5"><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-3xl font-semibold text-[#0b1736]">{count??0}</p></div>)}</div><div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{links.map(([label,href])=><Link key={href} href={href} className="rounded-2xl border bg-white p-5 font-semibold text-[#0b1736] hover:border-blue-200">{label} →</Link>)}</div><p className="mt-8 text-xs text-slate-500">Sensitive workspace content is not displayed by default. Access should remain need-based and audited.</p></div></main>;
}
