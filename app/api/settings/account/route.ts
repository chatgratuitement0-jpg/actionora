import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(request:Request){
 const s=await createClient();const {data:{claims}}=await s.auth.getClaims();if(!claims?.sub)return NextResponse.json({error:"Unauthorized"},{status:401});
 const body=await request.json();const full_name=typeof body.full_name==="string"?body.full_name.trim():"";const avatar_url=typeof body.avatar_url==="string"?body.avatar_url.trim():"";
 if(full_name.length>120)return NextResponse.json({error:"Invalid name"},{status:400});
 const {error}=await s.from("profiles").update({full_name:full_name||null,avatar_url:avatar_url||null,updated_at:new Date().toISOString()}).eq("id",claims.sub);
 if(error)return NextResponse.json({error:"Could not save profile"},{status:500});
 return NextResponse.json({ok:true});
}