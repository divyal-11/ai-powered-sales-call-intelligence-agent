import { Extraction } from "./extractionSchema";

export interface LeadScoreBreakdown {
  intentPoints: number;
  severityPoints: number;
  nextStepPoints: number;
  completenessPoints: number;
  objectionDeductions: number;
  groundingDeductions: number;
  finalScore: number;
}

export interface LeadScoreResult {
  score: number;
  tier: "HOT" | "WARM" | "COLD";
  breakdown: LeadScoreBreakdown;
}

//pure deterministic lead score calc.
export function calculateLeadScore(
  extraction: Extraction,
  lowConfidenceFields: string[] = [],
): LeadScoreResult {
  // 1. Buying Intent Points (Deterministic: High = 30, Medium = 15, Low = 5)
  let intentPoints = 5;
  if (extraction.buying_intent === "high") {
    intentPoints = 30;
  } else if (extraction.buying_intent === "medium") {
    intentPoints = 15;
  }

  // 2. Problem Severity Points (High = 25, Medium = 15, Low = 5)
  let severityPoints = 5;
  if (extraction.severity === "high") {
    severityPoints = 25;
  } else if (extraction.severity === "medium") {
    severityPoints = 15;
  }

  // 3. Next Step Actionability Points (Concrete commitment = 20, None/Passive = 5)
  const nextStepLower = (extraction.next_step || "").toLowerCase();
  const hasConcreteNextStep =
    !nextStepLower.includes("none") &&
    !nextStepLower.includes("n/a") &&
    (nextStepLower.includes("meet") ||
      nextStepLower.includes("demo") ||
      nextStepLower.includes("call") ||
      nextStepLower.includes("follow") ||
      nextStepLower.includes("send") ||
      nextStepLower.includes("visit"));

  const nextStepPoints = hasConcreteNextStep ? 20 : 5;

  // 4. Qualification & Completeness Points (Objective signals, not LLM guess)
  let completenessPoints = 0;
  if (extraction.customer_problem && extraction.customer_problem.trim().length > 0) {
    completenessPoints += 5; // Valid customer problem identified
  }
  if (extraction.current_solution && extraction.current_solution.trim().length > 0) {
    completenessPoints += 5; // Incumbent workflow/competitor identified
  }
  if (hasConcreteNextStep) {
    completenessPoints += 5; // Timeline / action committed
  }

  // 5. Objection Deductions (-5 pts per objection, max 20)
  const objectionDeductions = Math.min(
    20,
    (extraction.objections?.length || 0) * 5,
  );

  // 6. Hallucination / Grounding Penalty
  let groundingDeductions = 0;
  if (
    lowConfidenceFields.includes("buying_intent") ||
    lowConfidenceFields.includes("customer_problem")
  ) {
    groundingDeductions += 15;
  }
  const otherLowConfCount = lowConfidenceFields.filter(
    (f) => f !== "buying_intent" && f !== "customer_problem",
  ).length;
  groundingDeductions += otherLowConfCount * 5;

  // 7. Calculate Final Score clamped between 0 and 100
  const rawScore =
    intentPoints +
    severityPoints +
    nextStepPoints +
    completenessPoints -
    objectionDeductions -
    groundingDeductions;

  const finalScore = Math.max(0, Math.min(100, rawScore));

  // Determine Tier
  let tier: "HOT" | "WARM" | "COLD" = "COLD";
  if (finalScore >= 70) tier = "HOT";
  else if (finalScore >= 40) tier = "WARM";

  return {
    score: finalScore,
    tier,
    breakdown: {
      intentPoints,
      severityPoints,
      nextStepPoints,
      completenessPoints,
      objectionDeductions,
      groundingDeductions,
      finalScore,
    },
  };
}

