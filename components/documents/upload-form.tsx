"use client";

import { useState } from "react";

export default function DocumentUploadForm({ clients }: { clients: { id: string; name: string }[] }) {
  const [clientId, setClientId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setBusy(true);
    setStatus("");
    const form = new FormData();
    form.set("file", file);
    if (clientId) form.set("client_id", clientId);
    const response = await fetch("/api/documents/upload", { method: "POST", body: form });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) setStatus(data.error ?? "Upload failed.");
    else { setStatus("Uploaded successfully."); setTimeout(() => window.location.reload(), 500); }
    setBusy(false);
  }

  return (
    <form onSubmit={submit} className="mt-8 rounded-2xl border bg-white p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <input required type="file" accept=".pdf,.docx,.xlsx,application/pdf" onChange={e => setFile(e.target.files?.[0] ?? null)} className="rounded-xl border p-3 text-sm" />
        <select value={clientId} onChange={e => setClientId(e.target.value)} className="rounded-xl border px-3 py-2.5 text-sm">
          <option value="">No client link</option>
          {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button disabled={!file || busy} className="rounded-xl bg-[#0b1736] px-5 py-3 text-sm font-semibold text-white disabled:opacity-50">{busy ? "Uploading…" : "Upload document"}</button>
        <span className="text-xs text-slate-500">PDF, DOCX or XLSX · max 10 MB</span>
      </div>
      {status && <p className="mt-3 text-sm text-slate-600">{status}</p>}
    </form>
  );
}