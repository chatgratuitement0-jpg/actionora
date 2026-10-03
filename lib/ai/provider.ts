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

function extractJsonText(data: unknown): unknown {
  if (!data || typeof data !== "object") return data;
  const root = data as Record<string, unknown>;

  if (root.analysis) return root.analysis;
  if (typeof root.output_text === "string") {
    try {
      return JSON.parse(root.output_text);
    } catch {
      return null;
    }
  }

  const steps = Array.isArray(root.steps) ? root.steps : [];
  for (const step of steps) {
    if (!step || typeof step !== "object") continue;
    const content = Array.isArray((step as Record<string, unknown>).content)
      ? ((step as Record<string, unknown>).content as unknown[])
      : [];

    for (const part of content) {
      if (!part || typeof part !== "object") continue;
      const text = (part as Record<string, unknown>).text;
      if (typeof text === "string") {
        try {
          return JSON.parse(text);
        } catch {
          // Continue looking for a valid model output block.
        }
      }
    }
  }

  return data;
}

function buildGeminiPrompt(input: ActionAIInput): string {
  return [
    "Analyze this client situation for Actionora.",
    "Recommend one practical next action.",
    "Use only the supplied facts. Never invent facts.",
    "Keep the suggested message professional, concise, and non-aggressive.",
    "",
    JSON.stringify(input, null, 2),
  ].join("\n");
}

export async function analyzeWithProvider(input: ActionAIInput): Promise<ActionAnalysis> {
  const key = process.env.GEMINI_API_KEY ?? process.env.AI_API_KEY;
  const endpoint =
    process.env.AI_PROVIDER_URL ??
    "https://generativelanguage.googleapis.com/v1beta/interactions";
  const model = process.env.AI_MODEL ?? "gemini-3.6-flash";

  if (!key) return fallback(input);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": key,
      },
      body: JSON.stringify({
        model,
        input: buildGeminiPrompt(input),
        response_format: {
          type: "text",
          mime_type: "application/json",
          schema: {
            type: "object",
            properties: {
              priority: { type: "string", enum: ["low", "medium", "high"] },
              reason: { type: "string" },
              recommendation: { type: "string" },
              suggested_message: { type: "string" },
            },
            required: ["priority", "reason", "recommendation", "suggested_message"],
          },
        },
      }),
      signal: controller.signal,
      cache: "no-store",
    });

    if (!response.ok) throw new Error(`AI provider returned ${response.status}`);

    const data = await response.json();
    const analysis = validateActionAnalysis(extractJsonText(data));
    if (!analysis) throw new Error("AI provider returned an invalid analysis.");

    return analysis;
  } finally {
    clearTimeout(timeout);
  }
}
