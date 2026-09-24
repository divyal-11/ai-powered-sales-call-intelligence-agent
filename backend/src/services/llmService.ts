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
    max_completion_tokens: 4096,
    temperature: 0,
    seed: 42
  });

  const latencyMs = Date.now() - startTime;
  const rawContent = response.choices[0].message.content;

  if (!rawContent) {
    throw new Error("Received empty response from LLM");
  }

  const parsedJson = JSON.parse(rawContent) as any;
    if (typeof parsedJson?.severity === "string") {
    const s = parsedJson.severity.toLowerCase().trim();
    if (s.includes("high") || s.includes("crit") || s.includes("sever") || s.includes("urg") || s.includes("extrem")) {
      parsedJson.severity = "high";
    } else if (s.includes("low") || s.includes("min") || s.includes("none")) {
      parsedJson.severity = "low";
    } else {
      parsedJson.severity = "medium";
    }
  } else {
    parsedJson.severity = "medium";
  }

  
  if (typeof parsedJson?.buying_intent === "string") {
    const b = parsedJson.buying_intent.toLowerCase().trim();
    if (b.includes("high") || b.includes("hot") || b.includes("strong")) {
      parsedJson.buying_intent = "high";
    } else if (b.includes("low") || b.includes("cold") || b.includes("none") || b.includes("uninterested")) {
      parsedJson.buying_intent = "low";
    } else {
      parsedJson.buying_intent = "medium";
    }
  } else {
    parsedJson.buying_intent = "low";
  }
  const extraction = ExtractionSchema.parse(parsedJson);

  return {
    extraction,
    latencyMs,
    model,
  };
}
