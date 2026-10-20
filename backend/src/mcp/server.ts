import dotenv from "dotenv";
dotenv.config();

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import prisma from "../db/prisma";
import { executeNaturalLanguageQuery } from "../services/nlpQueryService";
import { calculateLeadScore } from "../pipeline/leadScoring";
import { Extraction } from "../pipeline/extractionSchema";

// Create modern McpServer instance
export const mcpServer = new McpServer({
  name: "sales-intelligence-mcp-server",
  version: "1.0.0",
});

// =========================================================================
// Tool 1: query_sales_insights
// Translates natural language to SQL, enforces AST security guardrail,
// and executes read-only query against call_intelligence_view.
// =========================================================================
mcpServer.tool(
  "query_sales_insights",
  "Translate a natural language question into safe SQL, validate it with an AST guardrail, and query the sales intelligence database.",
  {
    question: z
      .string()
      .describe(
        "Natural language question about calls (e.g. 'Show all hot leads with budget objections' or 'Which accounts have high severity problems?')"
      ),
  },
  async ({ question }) => {
    try {
      const result = await executeNaturalLanguageQuery(question);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                question: result.question,
                executedSql: result.sql,
                rowCount: result.rowCount,
                latencyMs: result.latencyMs,
                records: result.results,
              },
              null,
              2
            ),
          },
        ],
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: "text",
            text: `Query error: ${error.message || String(error)}`,
          },
        ],
        isError: true,
      };
    }
  }
);

// =========================================================================
// Tool 2: get_lead_score
// Calculates explainable deterministic 0-100 lead qualification score & tier.
// =========================================================================
mcpServer.tool(
  "get_lead_score",
  "Calculate an explainable deterministic 0-100 lead score and tier (HOT, WARM, COLD) based on buying intent, severity, next steps, and grounding verifier penalties.",
  {
    transcript_id: z
      .string()
      .optional()
      .describe("Optional transcript ID to score an existing call in the database"),
    buying_intent: z
      .enum(["high", "medium", "low"])
      .optional()
      .describe("Buying intent level"),
    severity: z
      .enum(["high", "medium", "low"])
      .optional()
      .describe("Problem severity level"),
    next_step: z
      .string()
      .nullable()
      .optional()
      .describe("Committed next step action (e.g. 'Schedule on-site demo next Tuesday')"),
    customer_problem: z
      .string()
      .optional()
      .describe("Core customer pain point"),
    current_solution: z
      .string()
      .nullable()
      .optional()
      .describe("Incumbent vendor / software currently in use"),
    objections_count: z
      .number()
      .int()
      .min(0)
      .max(20)
      .optional()
      .describe("Number of prospect objections raised"),
    low_confidence_fields: z
      .array(z.string())
      .optional()
      .describe("Array of fields that failed the 2-pass grounding verification check"),
  },
  async ({
    transcript_id,
    buying_intent,
    severity,
    next_step,
    customer_problem,
    current_solution,
    objections_count = 0,
    low_confidence_fields = [],
  }) => {
    try {
      // If a transcript_id is provided, read existing insight from database
      if (transcript_id) {
        const transcript = await prisma.transcript.findUnique({
          where: { id: transcript_id },
          include: {
            callInsight: {
              include: { objections: true },
            },
          },
        });

        if (!transcript || !transcript.callInsight) {
          return {
            content: [
              {
                type: "text",
                text: `Transcript with ID '${transcript_id}' not found or has no analyzed insight.`,
              },
            ],
            isError: true,
          };
        }

        const insight = transcript.callInsight;
        const extraction: Extraction = {
          customer_problem: insight.customerProblem || "",
          severity: (insight.severity as any) || "medium",
          current_solution: insight.currentSolution,
          buying_intent: (insight.buyingIntent as any) || "low",
          buying_intent_score: insight.buyingIntentScore || 20,
          next_step: insight.nextStep,
          is_complete: insight.isComplete,
          missing_fields: insight.missingFields,
          field_evidence: (insight.fieldEvidence as any) || {},
          objections: insight.objections.map((o) => ({
            objection: o.objection,
            category: o.category as any,
          })),
        };

        const result = calculateLeadScore(extraction, low_confidence_fields);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  transcriptId: transcript_id,
                  score: result.score,
                  tier: result.tier,
                  breakdown: result.breakdown,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      // Otherwise, calculate score from user-supplied parameters
      const syntheticObjections = Array.from({ length: objections_count }, (_, i) => ({
        objection: `Objection #${i + 1}`,
        category: "other" as const,
      }));

      const syntheticExtraction: Extraction = {
        customer_problem: customer_problem || "General business pain point",
        severity: severity || "medium",
        current_solution: current_solution ?? null,
        buying_intent: buying_intent || "low",
        buying_intent_score: buying_intent === "high" ? 80 : buying_intent === "medium" ? 50 : 20,
        next_step: next_step ?? null,
        is_complete: true,
        missing_fields: [],
        field_evidence: {
          customer_problem: customer_problem || "General business pain point",
          severity: severity || "medium",
          current_solution: current_solution ?? null,
          buying_intent: buying_intent || "low",
          next_step: next_step ?? null,
        },
        objections: syntheticObjections,
      };

      const result = calculateLeadScore(syntheticExtraction, low_confidence_fields);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                score: result.score,
                tier: result.tier,
                breakdown: result.breakdown,
              },
              null,
              2
            ),
          },
        ],
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: "text",
            text: `Scoring error: ${error.message || String(error)}`,
          },
        ],
        isError: true,
      };
    }
  }
);

// =========================================================================
// Resource 1: sales://calls/hot-leads
// Exposes real-time list of hot leads (lead_score >= 70) as an MCP Resource
// =========================================================================
mcpServer.resource(
  "hot_leads",
  "sales://calls/hot-leads",
  async (uri) => {
    try {
      const hotLeads = await prisma.$queryRawUnsafe<any[]>(
        `SELECT transcript_id, company, prospect, customer_problem, severity, lead_score, next_step, created_at 
         FROM "call_intelligence_view" 
         WHERE lead_score >= 70 
         ORDER BY lead_score DESC 
         LIMIT 25;`
      );

      return {
        contents: [
          {
            uri: uri.href,
            text: JSON.stringify(hotLeads, null, 2),
            mimeType: "application/json",
          },
        ],
      };
    } catch (error: any) {
      return {
        contents: [
          {
            uri: uri.href,
            text: JSON.stringify({ error: error.message || String(error) }),
            mimeType: "application/json",
          },
        ],
      };
    }
  }
);

// Connect over Stdio
export async function runServer() {
  const transport = new StdioServerTransport();
  await mcpServer.connect(transport);
  // Note: Stdio requires stdout to be pure JSON-RPC, so all server logs MUST go to stderr.
  console.error("Sales Intelligence MCP Server connected over stdio");
}

if (require.main === module) {
  runServer().catch((error) => {
    console.error("Fatal MCP Server Error:", error);
    process.exit(1);
  });
}
