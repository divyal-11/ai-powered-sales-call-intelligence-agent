import { runExtractionLLM } from "../services/llmService";
import {
  getTranscriptById,
  updateTranscriptStatus,
  logAgentRun,
  saveExtractionToDB,
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
      transcript.rawText
    );

    // 4. Verify that extracted insights are grounded in the transcript
    const groundingResults = verifyFieldEvidence(
      extraction.field_evidence,
      transcript.rawText
    );

    // 5. Log LLM run into AgentRun audit table
    await logAgentRun({
      transcriptId,
      step: "extraction",
      inputSnapshot: { transcriptLength: transcript.rawText.length },
      outputRaw:{
        extraction,
        groundingResults,
      },
      model,
      latencyMs,
    });

    // 6. Save insights and objections in a database transaction
    const savedInsight = await saveExtractionToDB(transcriptId, extraction);

    return {
      success: true,
      insight: savedInsight,
      extraction,
      grounding: groundingResults,
      latencyMs,
    };
  } catch (error) {
    // If anything fails, mark transcript as failed
    await updateTranscriptStatus(transcriptId, "failed");
    throw error;
  }
}
