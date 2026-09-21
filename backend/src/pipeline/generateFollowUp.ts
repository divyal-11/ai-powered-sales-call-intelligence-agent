import dotenv from "dotenv";
dotenv.config();
import Groq from "groq-sdk";
import { z } from "zod";
import { Extraction } from "./extractionSchema";
import { FOLLOW_UP_SYSTEM_PROMPT, buildFollowUpUserPrompt } from "./prompts";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

//zod schema to validate the llm's follow up outputs
export const FollowUpResultSchema = z.object({
  emailSubject: z.string(),
  emailBody: z.string(),
  suggestedQuestions: z.array(z.string()),
  actionItems: z.array(z.string()),
});

export type FollowUpResult = z.infer<typeof FollowUpResultSchema>;

export type GeneratedFollowUps = {
  result: FollowUpResult;
  latencyMs: number;
  model: string;
};

//calls groq llm to gnerate a personalised email draft, suggested ques and action items
export async function generateFollowUp(
  extraction: Extraction
): Promise<GeneratedFollowUps> {
  const startTime = Date.now();
  const model = "openai/gpt-oss-20b";
  const response = await groq.chat.completions.create({
    model,
    messages: [
      { role: "system", content: FOLLOW_UP_SYSTEM_PROMPT },
      {
        role: "user",
        content: buildFollowUpUserPrompt({
          customer_problem: extraction.customer_problem,
          current_solution: extraction.current_solution,
          next_step: extraction.next_step,
          missing_fields: extraction.missing_fields,
          objections: extraction.objections,
        }),
      },
    ],
    response_format: { type: "json_object" },
    max_completion_tokens: 2048,
    temperature: 0.2,
  });
  const latencyMs = Date.now() - startTime;
  const rawContent = response.choices[0].message.content;
  if (!rawContent) {
    throw new Error("No response content from FollowUp LLM");
  }
  const parsed = JSON.parse(rawContent);
  const validated = FollowUpResultSchema.parse(parsed);
  return {
    result: validated,
    latencyMs,
    model,
  };
}
