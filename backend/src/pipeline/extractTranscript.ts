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

SPEAKER ROLES & PERSPECTIVE:
- "Vardan" or "Me" is the StoneForge sales rep / engineer pitching the scanner.
- The other speaker is the PROSPECT / CUSTOMER (a senior project leader at Prestige Group).
- CRITICAL: "customer_problem", "buying_intent", and "objections" MUST reflect what the CUSTOMER said, NOT what Vardan pitched! Do not quote Vardan for the customer's problem.

You MUST return a JSON object with this EXACT structure:
{
  "customer_problem": "description of the customer's structural or seepage problem in their buildings",
  "severity": "high" | "medium" | "low",
  "current_solution": "what remediation they already tried or currently do, or null if none",
  "buying_intent": "high" | "medium" | "low",
  "buying_intent_score": <number between 1 and 100>,
  "next_step": "agreed next action, e.g. follow-up call, demo date, meeting",
  "is_complete": true | false,
  "missing_fields": ["list of any qualification fields not addressed, like budget"],
  "field_evidence": {
    "customer_problem": "exact quote from the CUSTOMER proving their problem",
    "severity": "exact quote proving urgency or severity",
    "current_solution": "exact quote proving current solution or repairs tried",
    "buying_intent": "exact quote from the CUSTOMER proving their willingness or intent to buy/demo",
    "next_step": "exact quote agreeing on the next step"
  },
  "objections": [
    {
      "objection": "description of objection",
      "category": "price" | "timing" | "trust" | "competitor" | "technical" | "other"
    }
  ]
}

CRITICAL RULES:
1. Noisy Speech-to-Text: The transcript is messy audio speech-to-text. Map phonetic mistakes to reality (e.g. "See face" or "the steepest" = seepage, "Versan" = Vardan, "Prestige" = Prestige Group).
2. Verbatim Quotes: Every field in "field_evidence" MUST be an exact quote from the transcript text.
3. Objections: If no objections were raised, return an empty array [].
4. Return ONLY valid JSON.`;


    const userPrompt = `Return ONLY a valid JSON object extracting the intelligence from this sales transcript according to the schema. Start directly with "{" and end with "}":\n\n${transcript.rawText}`;

    //call groq
    const response = await groq.chat.completions.create({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      max_completion_tokens: 2048,
      temperature: 0,
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
    //transaction = perform a group of databse operations as one unit
    //if any fails = rollback all the operations
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
