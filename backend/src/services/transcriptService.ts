import prisma from "../db/prisma";
import { Extraction } from "../pipeline/extractionSchema";

//Fetches a transcript by its unique ID.

export async function getTranscriptById(transcriptId: string) {
  return prisma.transcript.findUnique({
    where: { id: transcriptId },
  });
}

/**
 * Updates the lifecycle status of a transcript.
 */
export async function updateTranscriptStatus(
  transcriptId: string,
  status: "pending" | "processing" | "completed" | "failed"
) {
  return prisma.transcript.update({
    where: { id: transcriptId },
    data: { status },
  });
}

/**
 * Logs an execution step into the AgentRun audit table.
 */
export async function logAgentRun(data: {
  transcriptId: string;
  step: string;
  inputSnapshot: any;
  outputRaw: any;
  model: string;
  latencyMs: number;
}) {
  return prisma.agentRun.create({
    data: {
      transcriptId: data.transcriptId,
      step: data.step,
      inputSnapshot: data.inputSnapshot,
      outputRaw: data.outputRaw,
      model: data.model,
      latencyMs: data.latencyMs,
    },
  });
}

//Saves extracted insights and objections atomically in a Prisma transaction,
// and marks the transcript as completed.
export async function saveExtractionToDB(
  transcriptId: string,
  extraction: Extraction,
  leadScore: number,
) {
  return prisma.$transaction(async (tx) => {
    // 1. Upsert call insight
    const insight = await tx.callInsight.upsert({
      where: { transcriptId },
      update: {
        customerProblem: extraction.customer_problem,
        severity: extraction.severity,
        currentSolution: extraction.current_solution,
        buyingIntent: extraction.buying_intent,
        buyingIntentScore: extraction.buying_intent_score,
        nextStep: extraction.next_step,
        leadScore:leadScore ?? undefined,
        isComplete: extraction.is_complete,
        missingFields: extraction.missing_fields,
        fieldEvidence: extraction.field_evidence,
      },
      create: {
        transcriptId,
        customerProblem: extraction.customer_problem,
        severity: extraction.severity,
        currentSolution: extraction.current_solution,
        buyingIntent: extraction.buying_intent,
        buyingIntentScore: extraction.buying_intent_score,
        nextStep: extraction.next_step,
        leadScore:leadScore ?? undefined,
        isComplete: extraction.is_complete,
        missingFields: extraction.missing_fields,
        fieldEvidence: extraction.field_evidence,
      },
    });

    // 2. Clear old objections and insert new ones
    await tx.objection.deleteMany({ where: { insightId: insight.id } });

    if (extraction.objections.length > 0) {
      await tx.objection.createMany({
        data: extraction.objections.map((obj) => ({
          insightId: insight.id,
          objection: obj.objection,
          category: obj.category,
        })),
      });
    }

    // 3. Mark transcript as completed
    await tx.transcript.update({
      where: { id: transcriptId },
      data: { status: "completed" },
    });

    return insight;
  });
}

import {FollowUpResult} from "../pipeline/generateFollowUp";

//Saves generated follow-ups to database
export async function saveFollowUpsToDB(
  insightId: string,
  followUpResult: FollowUpResult
){
  //clear any existing fllow ups for this insight
  await prisma.followUp.deleteMany({where: {insightId}});

  const records = [
    {
      insightId,
      type: "email",
      content: `Subject: ${followUpResult.emailSubject}\n\n${followUpResult.emailBody}`,
    },
    ...followUpResult.suggestedQuestions.map((q) => ({
      insightId,
      type: "question",
      content: q,
    })),
    ...followUpResult.actionItems.map((a) => ({
      insightId,
      type: "action_item",
      content: a,
    })),
  ];

  await prisma.followUp.createMany({
    data: records,
  });
  return prisma.followUp.findMany({ where: { insightId } });

}