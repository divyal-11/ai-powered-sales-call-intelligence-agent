import dotenv from "dotenv";
dotenv.config();
import Groq from "groq-sdk";

import prisma from "../db/prisma";
import { ExtractionSchema } from "./extractionSchema";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function extractTranscript(transcriptId: string) {
  //fetch transcript from db
  const transcript = await prisma.transcript.findUnique({
    where: { id: transcriptId },
  });

  //if transcript is not found
  if (!transcript) {
    throw new Error(`No transcript found with ID ${transcriptId}`);
  }

  //update status
  await prisma.transcript.update({
    where: { id: transcriptId },
    data: { status: "processing" },
  });

  const startTime = Date.now();
  const model = "openai/gpt-oss-20b";

  try {
    //prompt
    const systemPrompt = `You are an expert sales call intelligence analyst for StoneForge.
StoneForge sells portable electromagnetic imaging devices that detect subsurface water seepage and moisture defects in structures non-destructively.
Typical prospects are commercial developers, property managers, facility directors, and waterproofing contractors.
INSTRUCTIONS:
1. The transcript may be noisy speech-to-text output. Ignore conversational filler (um, uh, like), stutters, and phonetic misspellings (e.g. "Sunfo" or "Stone Ford" = StoneForge, "C page" = seepage).
2. Grounding is mandatory: In "field_evidence", provide the EXACT verbatim quote from the transcript that proves your extraction for each field.
3. Objections: Capture any hesitation regarding price, timing, trust, competitor, technical feasibility, or other concerns.
4. Completeness: Set is_complete to false if the call ended abruptly or key qualification details (budget, timeline, problem scope) were never addressed. List those in missing_fields.
5. Return ONLY a valid JSON object matching the required schema.`;

    const userPrompt = `Analyze the following sales call transcript and extract structured insights:\n\n${transcript.rawText}`;

    //call groq
    const response = await groq.chat.completions.create({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
    });

    const latencyMs = Date.now() - startTime;
    const rawContent = response.choices[0].message.content;

    if (!rawContent) {
      throw new Error("Received empty response from LLM");
    }

    //parse json and validate with zod schema
    const parsedJson = JSON.parse(rawContent) as unknown;
    const extraction = ExtractionSchema.parse(parsedJson);

    //log the llm call into agentrun
    await prisma.agentRun.create({
      data: {
        transcriptId,
        step: "extraction",
        inputSnapshot: { transcriptLength: transcript.rawText.length },
        outputRaw: extraction,
        model,
        latencyMs,
      },
    });

    //save insights and objections in a single databse
    const savedInsight = await prisma.$transaction(async (tx) => {
      // Upsert call insight
      const insight = await tx.callInsight.upsert({
        where: { transcriptId },
        update: {
          customerProblem: extraction.customer_problem,
          severity: extraction.severity,
          currentSolution: extraction.current_solution,
          buyingIntent: extraction.buying_intent,
          buyingIntentScore: extraction.buying_intent_score,
          nextStep: extraction.next_step,
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
          isComplete: extraction.is_complete,
          missingFields: extraction.missing_fields,
          fieldEvidence: extraction.field_evidence,
        },
      });

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
      // Mark transcript status as completed
      await tx.transcript.update({
        where: { id: transcriptId },
        data: { status: "completed" },
      });
      return insight;
    });
    return {
      success: true,
      insight: savedInsight,
      extraction,
      latencyMs,
    };
  } catch (error) {
    //if anything fails, mark transcrpt as failed
    await prisma.transcript.update({
      where: { id: transcriptId },
      data: { status: "failed" },
    });
    //rethrow
    throw error;
  }
}
