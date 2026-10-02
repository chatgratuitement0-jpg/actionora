import { validateActionAnalysis, type ActionAnalysis } from "./action-analysis";

export type ActionAIInput = {
  clientName: string;
  waiting: string;
  amount?: string;
  due?: string;
  responded?: string;
  notes?: string;
  context?: string;
};

function fallback(input: ActionAIInput): ActionAnalysis {
  const overdue =
    !!input.due &&
    !Number.isNaN(Date.parse(input.due)) &&
    new Date(input.due).getTime() < Date.now();

  const priority: ActionAnalysis["priority"] = overdue
    ? "high"
    : input.responded === "No"
      ? "medium"
      : "low";

  return {
    priority,
    reason: overdue
      ? "The due date has passed."
      : input.responded === "No"
        ? "There has been no response."
        : "The situation has an active next step.",
    recommendation: overdue
      ? "Follow up today with a clear professional message."
      : "Review the context and decide on the next appropriate follow-up.",
    suggested_message: `Hi ${input.clientName}, just following up on ${input.waiting}. Please let me know when you have an update. Thank you.`,
  };
}

export async function analyzeWithProvider(input: ActionAIInput): Promise<ActionAnalysis> {
  const endpoint = process.env.AI_PROVIDER_URL;
  const key = process.env.AI_API_KEY;

  if (!endpoint || !key) return fallback(input);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({ input }),
      signal: controller.signal,
      cache: "no-store",
    });

    if (!response.ok) throw new Error(`AI provider returned ${response.status}`);

    const data = await response.json();
    const analysis = validateActionAnalysis(data);
    if (!analysis) throw new Error("AI provider returned an invalid analysis.");

    return analysis;
  } finally {
    clearTimeout(timeout);
  }
}