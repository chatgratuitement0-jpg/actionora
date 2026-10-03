import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const TYPES = {
  "application/pdf": { ext: ".pdf", signature: "%PDF-" },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": { ext: ".docx" },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": { ext: ".xlsx" },
} as const;
const MAX_BYTES = 10 * 1024 * 1024;

async function hasValidSignature(file: File) {
  const bytes = new Uint8Array(await file.slice(0, 8).arrayBuffer());
  if (file.type === "application/pdf") return new TextDecoder().decode(bytes).startsWith("%PDF-");
  return bytes[0] === 0x50 && bytes[1] === 0x4b;
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims(); const claims = claimsData?.claims;
  if (!claims?.sub) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  const { data: member } = await supabase.from("workspace_members").select("workspace_id,role").eq("user_id", claims.sub).limit(1).maybeSingle();
  if (!member) return NextResponse.json({ error: "Workspace not found." }, { status: 403 });
  if (!["owner","admin","member"].includes(member.role)) return NextResponse.json({ error: "You do not have permission to upload documents." }, { status: 403 });

  const form = await request.formData();
  const file = form.get("file");
  const clientId = String(form.get("client_id") || "");
  if (!(file instanceof File)) return NextResponse.json({ error: "A file is required." }, { status: 400 });
  const type = TYPES[file.type as keyof typeof TYPES];
  if (!type) return NextResponse.json({ error: "Unsupported file type." }, { status: 415 });
  if (file.size <= 0 || file.size > MAX_BYTES) return NextResponse.json({ error: "File must be between 1 byte and 10 MB." }, { status: 400 });
  const lowerName = file.name.toLowerCase();
  if (!lowerName.endsWith(type.ext)) return NextResponse.json({ error: "The file extension does not match its declared type." }, { status: 400 });
  if (!(await hasValidSignature(file))) return NextResponse.json({ error: "The file signature could not be verified." }, { status: 415 });

  if (clientId) {
    const { data: client } = await supabase.from("clients").select("id").eq("id", clientId).eq("workspace_id", member.workspace_id).maybeSingle();
    if (!client) return NextResponse.json({ error: "Client not found." }, { status: 404 });
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-180);
  const path = `${member.workspace_id}/${crypto.randomUUID()}-${safeName}`;
  const { error: uploadError } = await supabase.storage.from("documents").upload(path, file, { contentType: file.type, upsert: false });
  if (uploadError) return NextResponse.json({ error: "The file could not be uploaded." }, { status: 500 });

  const { data: document, error: documentError } = await supabase.from("documents").insert({
    workspace_id: member.workspace_id, client_id: clientId || null, uploaded_by: claims.sub, file_name: file.name,
    storage_path: path, mime_type: file.type, file_size: file.size, status: "uploaded",
  }).select("id,file_name,status,created_at").single();

  if (documentError || !document) {
    await supabase.storage.from("documents").remove([path]);
    return NextResponse.json({ error: "The document record could not be created." }, { status: 500 });
  }
  const { error: jobError } = await supabase.from("document_processing_jobs").insert({ document_id: document.id, status: "queued" });
  if (jobError) {
    await supabase.from("documents").delete().eq("id", document.id).eq("workspace_id", member.workspace_id);
    await supabase.storage.from("documents").remove([path]);
    return NextResponse.json({ error: "The processing job could not be created." }, { status: 500 });
  }
  await supabase.from("audit_logs").insert({
    actor_user_id: claims.sub, workspace_id: member.workspace_id, action: "document_uploaded", target_type: "document", target_id: document.id,
    metadata: { file_name: document.file_name, mime_type: file.type, file_size: file.size },
  });
  return NextResponse.json({ document });
}
