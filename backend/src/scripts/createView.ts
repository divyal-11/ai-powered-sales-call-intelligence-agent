import dotenv from "dotenv";
dotenv.config();
import prisma from "../db/prisma";

async function seedSampleCallsIfEmpty() {
  const count = await prisma.transcript.count();
  if (count > 0) {
    console.log(`Database already contains ${count} transcripts. Skipping seed.`);
    return;
  }

  console.log("Database is empty. Seeding 3 realistic sample calls...");

  // Call 1: High severity seepage, hot lead, high buying intent
  await prisma.transcript.create({
    data: {
      rawText: "Sales: Hi Rahul, thanks for connecting today. Can you tell me about the water ingress?\nProspect: Yes, we have severe basement water seepage and structural wall cracks across Tower B. It is affecting our electrical switchgear.\nSales: That is critical. Are you looking to solve this immediately?\nProspect: Absolutely, we have budget signed off if you can start within two weeks.",
      sourceMeta: { company: "Prestige Estates", prospect: "Rahul Verma" },
      status: "completed",
      callInsight: {
        create: {
          customerProblem: "Severe basement water seepage and structural wall cracks affecting foundation",
          severity: "high",
          currentSolution: "Temporary polyurethane patch repairs",
          buyingIntent: "high",
          buyingIntentScore: 92,
          nextStep: "Schedule onsite engineering audit for Friday 10 AM",
          leadScore: 88,
          isComplete: true,
          missingFields: [],
          objections: {
            create: [
              { objection: "Commercial pricing is 15% above unorganized contractors", category: "price" },
              { objection: "Need delivery completion within 3 weeks", category: "timing" },
            ],
          },
        },
      },
    },
  });

  // Call 2: Medium severity, warm lead, medium buying intent, budget objection
  await prisma.transcript.create({
    data: {
      rawText: "Sales: Hello Anita, how are things at Brigade Tech Gardens?\nProspect: We noticed minor water infiltration in basement parking level 2 during monsoon rains. Sump pumps handle it for now.\nSales: Would a preventive crystalline coating help avoid long-term slab deterioration?\nProspect: We are open to it, but our quarterly budget cap is tight right now.",
      sourceMeta: { company: "Brigade Tech Gardens", prospect: "Anita Desai" },
      status: "completed",
      callInsight: {
        create: {
          customerProblem: "Periodic water infiltration in basement parking level 2",
          severity: "medium",
          currentSolution: "Sump pumps and manual water vacuuming",
          buyingIntent: "medium",
          buyingIntentScore: 65,
          nextStep: "Send revised proposal with milestone-based payment structure",
          leadScore: 58,
          isComplete: true,
          missingFields: [],
          objections: {
            create: [
              { objection: "Budget cap reached for current fiscal quarter", category: "price" },
            ],
          },
        },
      },
    },
  });

  // Call 3: Low severity, cold lead, low buying intent
  await prisma.transcript.create({
    data: {
      rawText: "Sales: Hi Sameer, following up on Godrej Living facade maintenance.\nProspect: We just had cosmetic paint peeling on an external stairwell. In-house crew touched it up.\nSales: Understood, do you have any active waterproofing projects planned?\nProspect: Not at this time. No budget allocated until next calendar year.",
      sourceMeta: { company: "Godrej Living", prospect: "Sameer Mehta" },
      status: "completed",
      callInsight: {
        create: {
          customerProblem: "Minor cosmetic paint peeling on external stairwell",
          severity: "low",
          currentSolution: "Annual maintenance touch-up by internal crew",
          buyingIntent: "low",
          buyingIntentScore: 25,
          nextStep: "Follow up in Q4 before monsoon planning",
          leadScore: 28,
          isComplete: true,
          missingFields: [],
          objections: {
            create: [
              { objection: "No allocated budget for preventative waterproofing", category: "price" },
            ],
          },
        },
      },
    },
  });

  console.log("3 sample calls seeded successfully.");
}

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

  // Grant SELECT on call_intelligence_view to readonly_user if the role exists
  await prisma.$executeRawUnsafe(`
    DO $$
    BEGIN
      IF EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'readonly_user') THEN
        GRANT SELECT ON "call_intelligence_view" TO readonly_user;
      END IF;
    END
    $$;
  `);
  console.log("Granted SELECT on call_intelligence_view to readonly_user.");

  // Seed sample data if database is fresh
  await seedSampleCallsIfEmpty();

  // Quick verification: fetch records from the view
  const sampleRows: any[] = await prisma.$queryRawUnsafe(`
    SELECT company, lead_score, severity, buying_intent, customer_problem 
    FROM call_intelligence_view 
    LIMIT 5;
  `);
  console.log("Verification sample rows:", sampleRows);
}

main()
  .catch((err) => {
    console.error("Failed to create view:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

