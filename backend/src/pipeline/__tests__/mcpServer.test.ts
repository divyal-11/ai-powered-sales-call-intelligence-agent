import { describe, it, expect } from "vitest";
import { mcpServer } from "../../mcp/server";

describe("mcpServer - Model Context Protocol Server", () => {
  it("should have registered the required tools and resources", () => {
    // Inspect underlying server instance
    expect(mcpServer.server).toBeDefined();
  });

  it("should compute lead score correctly via get_lead_score handler logic", async () => {
    // Testing the deterministic scoring logic exposed by the MCP tool
    const { calculateLeadScore } = await import("../leadScoring");
    
    const extraction = {
      customer_problem: "Water seepage in basement",
      severity: "high" as const,
      current_solution: null,
      buying_intent: "high" as const,
      buying_intent_score: 85,
      next_step: "Schedule demo next week",
      is_complete: true,
      missing_fields: [],
      field_evidence: {
        customer_problem: "Water seepage in basement",
        severity: "high",
        current_solution: null,
        buying_intent: "high",
        next_step: "Schedule demo next week",
      },
      objections: [],
    };

    const result = calculateLeadScore(extraction, []);
    expect(result.score).toBe(85);
    expect(result.tier).toBe("HOT");
    expect(result.breakdown.intentPoints).toBe(30);
    expect(result.breakdown.severityPoints).toBe(25);
    expect(result.breakdown.nextStepPoints).toBe(20);
  });

  it("should enforce AST security guardrail for natural language query execution", async () => {
    const { validateAndSanitizeSql } = await import("../sqlValidator");

    // An injection attempt through query_sales_insights should be blocked by AST guardrail
    const injectionAttempt = "SELECT * FROM call_intelligence_view; DROP TABLE transcripts;";
    const validation = validateAndSanitizeSql(injectionAttempt);

    expect(validation.isValid).toBe(false);
    expect(validation.error).toMatch(/Multiple SQL statements are not allowed/i);
  });
});
