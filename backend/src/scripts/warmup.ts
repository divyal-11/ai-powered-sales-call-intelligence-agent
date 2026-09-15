import Groq from "groq-sdk";
import { z } from "zod";
import dotenv from "dotenv";
dotenv.config();

const ExtractionSchema = z.object({
  customer_problem: z.string().describe(""),
  severity: z.enum(["low", "medium", "high"]),
  buying_intent: z.enum(["low", "medium", "high"]),
  next_step: z.string(),
});

const sampleTranscript = `
Sales: Hi, thanks for calling. How can I help you today?
Customer: Yes, we've been having serious water seepage in our basement for about 3 years now. 
We've tried patch repairs twice but it keeps coming back. It's affecting our electrical systems now.
Sales: That sounds urgent. Have you considered a proper diagnosis before the next repair?
Customer: Yes, that's exactly what we need. What's your process and how soon can you come?
`;

async function runWarmup() {
  const client = new Groq({
    apiKey: process.env.GROQ_API_KEY,
  });
  console.log("Calling Groq API...\n");
  const response = await client.chat.completions.create({
model: "openai/gpt-oss-20b",
    messages: [
      {
        role: "system",
        content: `You are a sales call analyst. Extract structured information from the transcript.
Return ONLY valid JSON with these exact fields:
- customer_problem: string (what problem does the customer have)
- severity: "low" | "medium" | "high" (how urgent is it)
- buying_intent: "low" | "medium" | "high" (how likely to buy)
- next_step: string (what should the sales rep do next)`,
      },
      {
        role: "user",
        content: `Extract information from this transcript:\n\n${sampleTranscript}`,
      },
    ],
    response_format: { type: "json_object" },
  });

  const rawContent = response.choices[0].message.content;
  console.log("Raw LLM response:");
  console.log(rawContent);
  console.log("\n---\n");

  const parsed = JSON.parse(rawContent!);
  const validated = ExtractionSchema.parse(parsed);
  console.log("Validated result:");
  console.log(validated);
  console.log("\nTokens used:", response.usage?.total_tokens);
}
runWarmup().catch(console.error);
