import {NextResponse} from "next/server";
import {createClient} from "@/lib/supabase/server";
export async function PATCH(req:Request){
 const s=await createClient();const {data:{claims}}=await s.auth.getClaims();if(!claims?.sub)return NextResponse.json({error:"Unauthorized"},{status:401});
 const b=await req.json();if(typeof b.id!=="string"||typeof b.name!=="string"||!b.name.trim())return NextResponse.json({error:"Invalid workspace"},{status:400});
 const {data:m}=await s.from("workspace_members").select("workspace_id,role").eq("user_id",claims.sub).eq("workspace_id",b.id).limit(1).maybeSingle();if(!m||!["owner","admin"].includes(m.role))return NextResponse.json({error:"Forbidden"},{status:403});
 const allowed={name:b.name.trim().slice(0,120),industry:typeof b.industry==="string"?b.industry.trim().slice(0,120):null,team_size:typeof b.team_size==="string"?b.team_size.trim().slice(0,40):null,timezone:typeof b.timezone==="string"?b.timezone.trim().slice(0,80):null,language:["en","fr","ar"].includes(b.language)?b.language:"en",updated_at:new Date().toISOString()};
 const {error}=await s.from("workspaces").update(allowed).eq("id",b.id);if(error)return NextResponse.json({error:"Could not save workspace"},{status:500});return NextResponse.json({ok:true});
}