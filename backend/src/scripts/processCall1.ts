import dotenv from "dotenv";
dotenv.config();

import fs from "node:fs";
import path from "node:path";

import prisma from "../db/prisma";
import { extractTranscript } from "../pipeline/extractTranscript";

async function main() {
  //read the call transcript
  const transcriptPath = path.resolve(
    __dirname,
    "../../../transcripts/call1.txt",
  );

  console.log("Reading transcript from:", transcriptPath);
  const rawText = fs.readFileSync(transcriptPath, "utf-8");

  //ingest the raw transcript to supabase
  console.log("\n=== 1. Ingesting the real call into postgres ===");
  const transcript = await prisma.transcript.create({
    data: {
      rawText,
      sourceMeta: {
        company: "prestige grp",
        caller: "vardhan",
        prospect: "senior project Leader(prestige)",
        filename: "call1.txt",
      },
      status: "pending",
    },
  });

  console.log(`Saved transcript ID: ${transcript.id}`);

  //run the ai extraction pipeline
  console.log("\n=== 2. Running extraction pipeline ===");
  const result = await extractTranscript(transcript.id);
  console.log(`extraction completed in ${result.latencyMs}ms!\n`);

  //print the extracted data
  console.log("==========================================");
  console.log(" EXTRACTED SALES INTELLIGENCE");
  console.log("==========================================");
  console.log("Customer Problem   :", result.extraction.customer_problem);
  console.log("Severity           :", result.extraction.severity);
  console.log("Current Solution   :", result.extraction.current_solution);
  console.log("Buying Intent      :", result.extraction.buying_intent);
  console.log(
    "Buying Intent Score:",
    `${result.extraction.buying_intent_score}/100`,
  );
  console.log("Next Step          :", result.extraction.next_step);
  console.log("Is Complete        :", result.extraction.is_complete);
  console.log("Missing Fields     :", result.extraction.missing_fields);
  console.log("\n--- Grounded Evidence (Exact Quotes) ---");
  console.log(JSON.stringify(result.extraction.field_evidence, null, 2));
  console.log("\n--- Objections Identified ---");
  console.log(JSON.stringify(result.extraction.objections, null, 2));
  console.log("\n==========================================");
  console.log("✅ Verified and saved in Supabase!");
  console.log("==========================================");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());