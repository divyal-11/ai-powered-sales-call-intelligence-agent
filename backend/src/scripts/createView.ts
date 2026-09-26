import dotenv from "dotenv";
dotenv.config();
import prisma from "../db/prisma";

async function main() {
  console.log("Creating restricted Postgres view: call_intelligence_view...");

  const sql = `
    CREATE OR REPLACE VIEW call_intelligence_view AS
    SELECT 
      t.id AS transcript_id,
      COALESCE(t."sourceMeta"->>'company', 'Unknown') AS company,
      COALESCE(t."sourceMeta"->>'prospect', 'Unspecified Contact') AS prospect,
      ci."customerProblem" AS customer_problem,
      ci.severity,
      ci."currentSolution" AS current_solution,
      ci."buyingIntent" AS buying_intent,
      ci."buyingIntentScore" AS buying_intent_score,
      ci."nextStep" AS next_step,
      ci."leadScore" AS lead_score,
      ci."isComplete" AS is_complete,
      t."createdAt" AS created_at,
      COALESCE(
        (
          SELECT string_agg(o.objection || ' [' || COALESCE(o.category, 'general') || ']', '; ')
          FROM "Objection" o
          WHERE o."insightId" = ci.id
        ),
        'None'
      ) AS objections
    FROM "Transcript" t
    JOIN "CallInsight" ci ON ci."transcriptId" = t.id
    WHERE t.status = 'completed';
  `;

  await prisma.$executeRawUnsafe(sql);
  console.log("call_intelligence_view created successfully.");

  // Quick verification: fetch 3 records from the view
  const sampleRows: any[] = await prisma.$queryRawUnsafe(`
    SELECT company, lead_score, severity, customer_problem 
    FROM call_intelligence_view 
    LIMIT 3;
  `);
  console.log("Verification sample rows:", sampleRows);
}

main()
  .catch((err) => {
    console.error("Failed to create view:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
