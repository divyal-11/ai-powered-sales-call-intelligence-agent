import dotenv from "dotenv";
dotenv.config();
import Groq from "groq-sdk";

import { ExtractionSchema, Extraction } from "../pipeline/extractionSchema";
import {
  EXTRACTION_SYSTEM_PROMPT,
  buildExtractionUserPrompt,
} from "../pipeline/prompts";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export const EXTRACTION_MODEL = "openai/gpt-oss-20b";

export interface ExtractionLLMResult {
  extraction: Extraction;
  latencyMs: number;
  model: string;
}

//Calls Groq LLM with the extraction prompt and validates response against ExtractionSchema.
 
export async function runExtractionLLM(
  rawText: string
): Promise<ExtractionLLMResult> {
  const startTime = Date.now();
  const model = EXTRACTION_MODEL;

  const response = await groq.chat.completions.create({
    model,
    messages: [
      { role: "system", content: EXTRACTION_SYSTEM_PROMPT },
      { role: "user", content: buildExtractionUserPrompt(rawText) },
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

  const parsedJson = JSON.parse(rawContent) as any;
  if (typeof parsedJson?.severity === "string") {
    parsedJson.severity = parsedJson.severity.toLowerCase().trim();
  }
  if (typeof parsedJson?.buying_intent === "string") {
    parsedJson.buying_intent = parsedJson.buying_intent.toLowerCase().trim();
  }
  const extraction = ExtractionSchema.parse(parsedJson);

  return {
    extraction,
    latencyMs,
    model,
  };
}
