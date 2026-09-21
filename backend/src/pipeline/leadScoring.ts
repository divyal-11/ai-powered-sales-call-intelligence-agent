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
  //buying intent(0 to 40)
  const intentPoints = Math.round(
    (Math.max(0, Math.min(100, extraction.buying_intent_score)) / 100) * 40,
  );

  //problem severity
  let severityPoints = 5;
  if (extraction.severity === "high") {
    severityPoints = 25;
  } else if (extraction.severity === "medium") {
    severityPoints = 15;
  }

  //next step actionabilitty
  const nextStepLower = (extraction.next_step || "").toLocaleLowerCase();
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

  //completeness
  let completenessPoints = 15;
  if (!extraction.is_complete && extraction.missing_fields?.length > 0) {
    completenessPoints = Math.max(0, 15 - extraction.missing_fields.length * 5);
  }

  //deductions -5 per objection
  const objectionDeductions = Math.min(
    20,
    (extraction.objections?.length || 0) * 5,
  );

  //deductions for hallucinated or low confidence fields
  let groundingDeductions = 0;
  if (
    lowConfidenceFields.includes("buying_intent") ||
    lowConfidenceFields.includes("customer_problem")
  ) {
    groundingDeductions += 15; // heavily penalise if primary signals were ungrounded
  }

  const otherLowConfCount = lowConfidenceFields.filter(
    (f) => f !== "buying_intent" && f !== "customer_problem",
  ).length;
  groundingDeductions += otherLowConfCount * 5;
  // Calculate total and clamp between 0 and 100
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
