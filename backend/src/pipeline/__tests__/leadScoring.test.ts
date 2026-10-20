import { describe, it, expect } from "vitest";
import { calculateLeadScore } from "../leadScoring";
import { Extraction } from "../extractionSchema";

describe("leadScoring - Deterministic Scoring Engine", () => {
  const baseExtraction: Extraction = {
    customer_problem: "Basement leakage causing foundation risk",
    severity: "high",
    current_solution: "Manual visual inspection",
    buying_intent: "high",
    buying_intent_score: 85,
    next_step: "Schedule on-site demo next Tuesday",
    is_complete: true,
    missing_fields: [],
    field_evidence: {
      customer_problem: "leakage causing foundation risk",
      severity: "high",
      current_solution: "Manual visual inspection",
      buying_intent: "high",
      next_step: "Schedule on-site demo",
    },
    objections: [],
  };

  it("should score a fully qualified call with high intent and demo as a HOT lead (>= 70)", () => {
    // Intent(30) + Severity(25) + NextStep(20) + Completeness(15) - Objections(0) - Grounding(0) = 90
    const result = calculateLeadScore(baseExtraction, []);

    expect(result.score).toBe(90);
    expect(result.tier).toBe("HOT");
    expect(result.breakdown.intentPoints).toBe(30);
    expect(result.breakdown.severityPoints).toBe(25);
    expect(result.breakdown.nextStepPoints).toBe(20);
    expect(result.breakdown.completenessPoints).toBe(15);
  });

  it("should deduct 5 points per objection up to a maximum cap of 20 points", () => {
    const extractionWith5Objections: Extraction = {
      ...baseExtraction,
      objections: [
        { objection: "Too expensive", category: "price" },
        { objection: "Timeline too long", category: "timing" },
        { objection: "Need committee approval", category: "trust" },
        { objection: "Using competitor tool", category: "competitor" },
        { objection: "Complex installation", category: "technical" },
      ],
    };

    const result = calculateLeadScore(extractionWith5Objections, []);

    // 5 objections * 5 = 25, but capped at 20 deduction.
    // 90 - 20 = 70
    expect(result.breakdown.objectionDeductions).toBe(20);
    expect(result.score).toBe(70);
  });

  it("should apply severe penalty (-15 pts) when core fields are in lowConfidenceFields", () => {
    // Flagging core customer_problem as hallucination:
    const result = calculateLeadScore(baseExtraction, ["customer_problem"]);

    // 90 - 15 = 75
    expect(result.breakdown.groundingDeductions).toBe(15);
    expect(result.score).toBe(75);
  });

  it("should apply lower penalty (-5 pts) for non-core low-confidence fields", () => {
    // Flagging non-core current_solution:
    const result = calculateLeadScore(baseExtraction, ["current_solution"]);

    // 90 - 5 = 85
    expect(result.breakdown.groundingDeductions).toBe(5);
    expect(result.score).toBe(85);
  });

  it("should classify low intent and vague next steps as COLD tier (< 40)", () => {
    const coldExtraction: Extraction = {
      ...baseExtraction,
      customer_problem: "",
      severity: "low",
      current_solution: null,
      buying_intent: "low",
      next_step: "none",
    };

    // Intent(5) + Severity(5) + NextStep(5) + Completeness(0) = 15
    const result = calculateLeadScore(coldExtraction, []);

    expect(result.score).toBe(15);
    expect(result.tier).toBe("COLD");
  });

  it("should clamp final score strictly between 0 and 100", () => {
    const ultraPenalized: Extraction = {
      ...baseExtraction,
      buying_intent: "low", // 5
      severity: "low", // 5
      next_step: "none", // 5
      customer_problem: "", // 0
      current_solution: null, // 0
      objections: [
        { objection: "Expensive", category: "price" },
        { objection: "Bad timing", category: "timing" },
        { objection: "No budget", category: "price" },
        { objection: "No need", category: "other" },
      ], // -20
    };

    // Raw score = 5 + 5 + 5 + 0 - 20 - 20 (grounding deductions) = -25 => clamped to 0
    const result = calculateLeadScore(ultraPenalized, ["customer_problem", "current_solution"]);

    expect(result.score).toBe(0);
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });
});
