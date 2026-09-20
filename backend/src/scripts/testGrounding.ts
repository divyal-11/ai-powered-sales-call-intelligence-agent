import fs from "fs";
import path from "path";
import { verifyFieldEvidence } from "../pipeline/grounding";

async function runTest() {
  console.log("=== Testing Grounding Verifier ===\n");

  // load the real transcript
  const transcriptPath = path.resolve(__dirname, "../../../transcripts/call1.txt");
  const rawTranscript = fs.readFileSync(transcriptPath, "utf-8");

  // Test 1: real quotes that actually exist in call1.txt
  console.log("Test 1: Real quotes from call1.txt...");
  const realEvidence = {
    customer_problem: "Very open the witness. You know, leakages and leakages. Once the property is finished.",
    severity: "There are multiple issues because of which the leak. Age is happening in every engineering project.",
    buying_intent: "definitely, I, I. Feel it should be very, very useful.",
    next_step: "9, 10th or 11th any day. We can fix it. Up. We can meet in Bangalore.",
  };

  const result1 = verifyFieldEvidence(realEvidence, rawTranscript);
  console.log("Field Results:", result1.fieldResults);
  console.log("Low Confidence:", result1.lowConfidenceFields);
  console.log("All Passed?:", result1.allPassed);

  if (!result1.allPassed) {
    console.error("❌ Test 1 FAILED — expected all real quotes to pass!");
    process.exit(1);
  }
  console.log("✅ Test 1 PASSED\n");

  // Test 2: add a fabricated quote that does NOT exist in the transcript
  console.log("Test 2: Fabricated quote...");
  const fakeEvidence = {
    ...realEvidence,
    fake_budget: "We have approved a budget of 50 lakhs for scanner procurement.",
  };

  const result2 = verifyFieldEvidence(fakeEvidence, rawTranscript);
  console.log("Field Results:", result2.fieldResults);
  console.log("Low Confidence:", result2.lowConfidenceFields);
  console.log("All Passed?:", result2.allPassed);

  if (result2.allPassed || !result2.lowConfidenceFields.includes("fake_budget")) {
    console.error("❌ Test 2 FAILED — fabricated quote was not caught!");
    process.exit(1);
  }
  console.log("✅ Test 2 PASSED\n");

  console.log("🎉 ALL GROUNDING TESTS PASSED!");
}

runTest().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
