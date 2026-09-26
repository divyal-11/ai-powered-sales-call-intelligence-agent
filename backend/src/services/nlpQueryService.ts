import dotenv from "dotenv";
dotenv.config();
import Groq from "groq-sdk";
import prisma from "../db/prisma";
import { validateAndSanitizeSql } from "../pipeline/sqlValidator";


const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export interface QueryExecutionResult {
  question: string;
  sql: string;
  results: any[];
  rowCount: number;
  latencyMs: number;
}

const SYSTEM_PROMPT = `You are a PostgreSQL expert for a Sales Call Intelligence System.
Your job is to translate a user's natural language question into a safe PostgreSQL SELECT query.

DATABASE SCHEMA:
You have access to EXACTLY ONE read-only view named "call_intelligence_view".
Columns in "call_intelligence_view":
- transcript_id (text): unique call ID
- company (text): client company name
- prospect (text): contact name
- customer_problem (text): the core pain point identified in the call
- severity (text): 'high', 'medium', or 'low'
- current_solution (text): what tool or process they currently use
- buying_intent (text): 'positive', 'neutral', or 'negative'
- buying_intent_score (integer): 0 to 100
- next_step (text): planned next follow-up action
- lead_score (integer): 0 to 100 deterministic qualification score
- is_complete (boolean): true if call analysis is complete
- created_at (timestamp): call ingestion timestamp
- objections (text): semicolon-separated list of objections

STRICT RULES:
1. ONLY return a single valid SELECT statement.
2. Query ONLY "call_intelligence_view". Do not reference any other tables.
3. Output raw SQL only. Do NOT use markdown code fences (\`\`\`sql ... \`\`\`), backticks, or commentary.
4. For lead score classifications:
   - "hot lead" or "high priority" means lead_score >= 70
   - "warm lead" means lead_score >= 40 AND lead_score < 70
   - "cold lead" means lead_score < 40
5. For text searches, use case-insensitive matching with ILIKE (e.g. company ILIKE '%prestige%' or customer_problem ILIKE '%seepage%').
6. By default, ORDER BY lead_score DESC NULLS LAST.
7. Include a reasonable LIMIT (default 25 if unspecified).

FEW-SHOT EXAMPLES:
Question: "Show me all hot leads"
SQL: SELECT transcript_id, company, prospect, customer_problem, severity, lead_score, next_step, created_at FROM "call_intelligence_view" WHERE lead_score >= 70 ORDER BY lead_score DESC LIMIT 25

Question: "Which accounts had high severity problems?"
SQL: SELECT transcript_id, company, prospect, customer_problem, severity, current_solution, lead_score FROM "call_intelligence_view" WHERE severity = 'high' ORDER BY lead_score DESC NULLS LAST LIMIT 25

Question: "Find calls mentioning budget objections"
SQL: SELECT transcript_id, company, prospect, objections, lead_score FROM "call_intelligence_view" WHERE objections ILIKE '%budget%' ORDER BY lead_score DESC NULLS LAST LIMIT 25
`;

// Translates a user's natural language question into SQL,
// validates it against the AST security guardrail,
// and executes it with a 3-second statement timeout.
 
export async function executeNaturalLanguageQuery(
  question: string
): Promise<QueryExecutionResult> {
  const startTime = Date.now();

  // 1. Ask Groq to generate the SQL
  const completion = await groq.chat.completions.create({
    model: "openai/gpt-oss-120b",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: `Question: "${question}"\nSQL:` },
    ],
    temperature: 0.1, // low temperature for deterministic code generation
    max_tokens: 300,
  });

  const rawSql = completion.choices[0]?.message?.content?.trim() || "";
  if (!rawSql) {
    throw new Error("LLM failed to generate a SQL query.");
  }

  // 2. Validate and sanitize generated SQL via AST parser
  const validation = validateAndSanitizeSql(rawSql);
  if (!validation.isValid || !validation.sanitizedSql) {
    throw new Error(
      `Generated SQL failed security validation: ${validation.error || "Unknown validation error"}`
    );
  }

  const safeSql = validation.sanitizedSql;

  // 3. Execute inside a transaction with 3000ms statement timeout
  const results = await prisma.$transaction(async (tx) => {
    // Apply local 3s timeout for this connection only
    await tx.$executeRawUnsafe("SET LOCAL statement_timeout = '3000ms';");
    return await tx.$queryRawUnsafe<any[]>(safeSql);
  });

  const latencyMs = Date.now() - startTime;

  return {
    question,
    sql: safeSql,
    results,
    rowCount: results.length,
    latencyMs,
  };
}
