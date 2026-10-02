export type ActionAnalysis = {
  priority: "low" | "medium" | "high";
  reason: string;
  recommendation: string;
  suggested_message: string;
};

export function validateActionAnalysis(value: unknown): ActionAnalysis | null {
  if (!value || typeof value !== "object") return null;
  const v = value as Record<string, unknown>;
  if (!["low","medium","high"].includes(String(v.priority))) return null;
  if (![v.reason,v.recommendation,v.suggested_message].every(x => typeof x === "string" && x.trim().length > 0)) return null;
  return {
    priority: v.priority as ActionAnalysis["priority"],
    reason: String(v.reason).trim(),
    recommendation: String(v.recommendation).trim(),
    suggested_message: String(v.suggested_message).trim(),
  };
}

export function buildActionContext(input: {
  clientName: string;
  invoiceAmount?: number;
  currency?: string;
  dueDate?: string;
  lastActivity?: string;
  notes?: string;
}) {
  return {
    client: input.clientName,
    invoice: input.invoiceAmount != null ? { amount: input.invoiceAmount, currency: input.currency ?? "" } : null,
    due_date: input.dueDate ?? null,
    last_activity: input.lastActivity ?? null,
    notes: input.notes ?? null,
  };
}