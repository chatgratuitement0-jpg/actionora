"use client";

import { useState } from "react";

type Analysis = {
  priority: "low" | "medium" | "high";
  reason: string;
  recommendation: string;
  suggested_message: string;
};

export function AIInsight({ clientId }: { clientId: string }) {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);\n  const [analysisId, setAnalysisId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [created, setCreated] = useState(false);

  async function analyze() {
    setLoading(true);
    setError(null);
    const response = await fetch("/api/ai/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ client_id: clientId }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      setError(data.error ?? "We couldn't analyze this situation.");
      setLoading(false);
      return;
    }
    setAnalysis(data.analysis);\n    setAnalysisId(data.analysis_id ?? null);
    setLoading(false);
  }

  async function createAction() {\n    if (!analysis) return;\n    const confirmed = window.confirm("Create this recommended action?");\n    if (!confirmed) return;\n    setCreating(true);\n    setError(null);\n    const response = await fetch("/api/actions/from-ai", {\n      method: "POST",\n      headers: { "Content-Type": "application/json" },\n      body: JSON.stringify({ analysis_id: analysisId, confirm: true }),\n    });\n    const data = await response.json().catch(() => ({}));\n    if (!response.ok) setError(data.error ?? "We could not create the action.");\n    else setCreated(true);\n    setCreating(false);\n  }\n\n  return (
    <section className="rounded-2xl border border-blue-100 bg-blue-50/60 p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">AI assistance</p>
          <h2 className="mt-1 text-lg font-semibold text-slate-950">What needs your attention?</h2>
        </div>
        <button onClick={analyze} disabled={loading} className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
          {loading ? "Analyzing…" : "Analyze situation"}
        </button>
      </div>
      {error && <p className="mt-4 text-sm text-red-700">{error}</p>}
      {analysis && (
        <div className="mt-5 space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">Priority</span>
            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase">{analysis.priority}</span>
          </div>
          <div><p className="text-sm font-semibold">Why</p><p className="mt-1 text-sm text-slate-600">{analysis.reason}</p></div>
          <div><p className="text-sm font-semibold">Recommended next action</p><p className="mt-1 text-sm text-slate-600">{analysis.recommendation}</p></div>
          <div>
            <div className="flex items-center justify-between"><p className="text-sm font-semibold">Suggested message</p><button onClick={() => navigator.clipboard?.writeText(analysis.suggested_message)} className="text-xs font-semibold text-blue-700">Copy</button></div>
            <p className="mt-1 rounded-xl bg-white p-4 text-sm leading-6 text-slate-700">{analysis.suggested_message}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3"><button onClick={createAction} disabled={creating||!analysisId||created} className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{created ? "Action created" : creating ? "Creating…" : "Create recommended action"}</button><p className="text-xs text-slate-500">AI recommends. You decide. Nothing is sent automatically.</p></div>
        </div>
      )}
    </section>
  );
}
