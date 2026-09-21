import { runExtractionLLM } from "../services/llmService";
import { calculateLeadScore } from "./leadScoring";
import { generateFollowUp } from "./generateFollowUp";
import {
  getTranscriptById,
  updateTranscriptStatus,
  logAgentRun,
  saveExtractionToDB,
  saveFollowUpsToDB,
} from "../services/transcriptService";
import { verifyFieldEvidence } from "./grounding";

//Main Extraction Pipeline Orchestrator:
// 1. Fetches transcript from DB & marks status as "processing"
// 2. Calls LLM with extraction prompt & validates with Zod
// 3. Logs the execution into AgentRun audit table
// 4. Saves CallInsight & Objections atomically in Postgres

export async function extractTranscript(transcriptId: string) {
  // 1. Fetch transcript from DB
  const transcript = await getTranscriptById(transcriptId);
  if (!transcript) {
    throw new Error(`No transcript found with ID ${transcriptId}`);
  }

  // 2. Update status to processing
  await updateTranscriptStatus(transcriptId, "processing");

  try {
    // 3. Call LLM with tuned prompt and parse with Zod
    const { extraction, latencyMs, model } = await runExtractionLLM(
      transcript.rawText,
    );

    // 4. Verify that extracted insights are grounded in the transcript
    const groundingResults = verifyFieldEvidence(
      extraction.field_evidence,
      transcript.rawText,
    );

    //5.calc deterministic lead score(with grounding pennalties)
    const leadScoreResult = calculateLeadScore(
      extraction,
      groundingResults.lowConfidenceFields,
    );

    // 6. Log LLM run into AgentRun audit table
    await logAgentRun({
      transcriptId,
      step: "extraction",
      inputSnapshot: { transcriptLength: transcript.rawText.length },
      outputRaw: {
        extraction,
        groundingResults,
        leadScore: leadScoreResult,
      },
      model,
      latencyMs,
    });

    // 7. Save insights and objections in a database transaction
    const savedInsight = await saveExtractionToDB(
      transcriptId,
      extraction,
      leadScoreResult.score,
    );

    //8.Generate and save follow-ups
    const followUpData = await generateFollowUp(extraction);

    // 9. Log follow-up LLM run into AgentRun audit table
    await logAgentRun({
      transcriptId,
      step: "follow_up",
      inputSnapshot: { insightId: savedInsight.id },
      outputRaw: followUpData.result,
      model: followUpData.model,
      latencyMs: followUpData.latencyMs,
    });

    await saveFollowUpsToDB(savedInsight.id, followUpData.result);

    return {
      success: true,
      insight: savedInsight,
      extraction,
      grounding: groundingResults,
      leadScore: leadScoreResult,
      followUp: followUpData.result,
      latencyMs,
    };
  } catch (error) {
    // If anything fails, mark transcript as failed
    await updateTranscriptStatus(transcriptId, "failed");
    throw error;
  }
}
