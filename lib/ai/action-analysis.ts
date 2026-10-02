export type ActionAnalysis = {
  priority: "low" | "medium" | "high";
  reason: string;
  recommendation: string;
  suggested_message: string;
};

export type ActionContext = {
  client: string;
  invoice: { amount: number; currency: string } | null;
  due_date: string | null;
  last_activity: string | null;
  notes: string | null;
  current_action?: {
    title: string;
    description?: string;
    reason?: string;
    priority: string;
    status: string;
    dueAt?: string;
  };
  ai_mode?: string;
};

export function validateActionAnalysis(value: unknown): ActionAnalysis | null {
  if (!value || typeof value !== "object") return null;
  const v = value as Record<string, unknown>;
  if (!["low", "medium", "high"].includes(String(v.priority))) return null;
  if (![v.reason, v.recommendation, v.suggested_message].every(
    (x) => typeof x === "string" && x.trim().length > 0 && x.trim().length <= 4000
  )) return null;
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
  currentAction?: ActionContext["current_action"];
  aiMode?: string;
}): ActionContext {
  return {
    client: input.clientName,
    invoice: input.invoiceAmount != null ? { amount: input.invoiceAmount, currency: input.currency ?? "" } : null,
    due_date: input.dueDate ?? null,
    last_activity: input.lastActivity ?? null,
    notes: input.notes ?? null,
    current_action: input.currentAction,
    ai_mode: input.aiMode,
  };
}
