import { describe, expect, it } from "vitest";
import { buildActionContext, validateActionAnalysis } from "../../lib/ai/action-analysis";

describe("Actionora AI analysis validation", () => {
  it("accepts a valid structured recommendation", () => {
    expect(validateActionAnalysis({
      priority: "high",
      reason: "The invoice is overdue.",
      recommendation: "Follow up today.",
      suggested_message: "Hi Sarah, following up on the outstanding invoice.",
    })).toEqual({
      priority: "high",
      reason: "The invoice is overdue.",
      recommendation: "Follow up today.",
      suggested_message: "Hi Sarah, following up on the outstanding invoice.",
    });
  });

  it("rejects unsupported priorities and empty output", () => {
    expect(validateActionAnalysis({ priority: "urgent", reason: "x", recommendation: "y", suggested_message: "z" })).toBeNull();
    expect(validateActionAnalysis({ priority: "low", reason: "", recommendation: "y", suggested_message: "z" })).toBeNull();
  });

  it("rejects oversized model output", () => {
    expect(validateActionAnalysis({
      priority: "medium",
      reason: "x".repeat(4001),
      recommendation: "y",
      suggested_message: "z",
    })).toBeNull();
  });

  it("builds context without inventing missing facts", () => {
    expect(buildActionContext({ clientName: "Sarah" })).toEqual({
      client: "Sarah",
      invoice: null,
      due_date: null,
      last_activity: null,
      notes: null,
      current_action: undefined,
      ai_mode: undefined,
    });
  });
});
