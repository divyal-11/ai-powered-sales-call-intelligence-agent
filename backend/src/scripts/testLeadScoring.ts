import { calculateLeadScore } from "../pipeline/leadScoring";
import { Extraction } from "../pipeline/extractionSchema";

function runLeadScoringTests() {
  console.log("=== Testing Lead Scoring Engine ===\n");

  // Scenario 1: Call 1 (Prestige Group - Hot Deal)
  const call1Extraction: Extraction = {
    customer_problem: "Leakage and moisture in finished buildings",
    severity: "high",
    current_solution: "Bosch detect 200c and moisture meters",
    buying_intent: "high",
    buying_intent_score: 80,
    next_step: "We can meet in Bangalore between 9th and 11th",
    is_complete: false,
    missing_fields: ["budget"],
    field_evidence: {
      customer_problem: "The source has to be identified.",
      severity: "Once the property is finished.",
      current_solution: "You might use the detect 200c from Bosch.",
      buying_intent: "I think a demo would be great for us as well.",
      next_step: "We can meet in Bangalore.",
    },
    objections: [],
  };

  const result1 = calculateLeadScore(call1Extraction, []);
  console.log("Scenario 1 (Prestige Group - Real Call 1):");
  console.log("Score:", `${result1.score}/100`, `(${result1.tier})`);
  console.log("Breakdown:", result1.breakdown);

  if (result1.score < 70 || result1.tier !== "HOT") {
    console.error("❌ Scenario 1 Failed: Expected a HOT lead score >= 70");
    process.exit(1);
  }
  console.log("✅ Scenario 1 PASSED\n");

  // Scenario 2: Heavy Objections + Cold Lead
  const coldExtraction: Extraction = {
    customer_problem: "Minor seepage in basement",
    severity: "low",
    current_solution: "Waterproofing contractor handles it",
    buying_intent: "low",
    buying_intent_score: 20,
    next_step: "None",
    is_complete: false,
    missing_fields: ["budget", "timeline", "authority"],
    field_evidence: {
      customer_problem: "Not a big deal right now.",
      severity: "Just minor.",
      current_solution: null,
      buying_intent: "Not interested this quarter.",
      next_step: "None.",
    },
    objections: [
      { objection: "Too expensive", category: "price" },
      { objection: "We already have a contractor", category: "competitor" },
    ],
  };

  const result2 = calculateLeadScore(coldExtraction, []);
  console.log("Scenario 2 (Low Intent + 2 Objections):");
  console.log("Score:", `${result2.score}/100`, `(${result2.tier})`);
  console.log("Breakdown:", result2.breakdown);

  if (result2.tier !== "COLD") {
    console.error("❌ Scenario 2 Failed: Expected COLD lead");
    process.exit(1);
  }
  console.log("✅ Scenario 2 PASSED\n");

  // Scenario 3: Call 1 with Fake / Hallucinated Quotes Penalty
  const result3 = calculateLeadScore(call1Extraction, [
    "buying_intent",
    "customer_problem",
  ]);
  console.log("Scenario 3 (Prestige Call but with Hallucinated Evidence):");
  console.log("Score with Grounding Penalty:", `${result3.score}/100`);
  console.log("Grounding Deductions:", result3.breakdown.groundingDeductions);

  if (result3.score >= result1.score) {
    console.error("❌ Scenario 3 Failed: Grounding penalty was not applied");
    process.exit(1);
  }
  console.log("✅ Scenario 3 PASSED\n");

  console.log("🎉 ALL LEAD SCORING TESTS PASSED!");
}

runLeadScoringTests();
