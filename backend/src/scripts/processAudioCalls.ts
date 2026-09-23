import dotenv from "dotenv";
dotenv.config();

import fs from "node:fs";
import path from "node:path";
import prisma from "../db/prisma";
import { extractTranscript } from "../pipeline/extractTranscript";

const CALLS_TO_PROCESS = [
  {
    filename: "call2.txt",
    company: "Commercial / Residential Construction (Goa Project)",
    prospect: "Project Site Engineer",
    caller: "StoneForge Sales Rep",
  },
  {
    filename: "call3.txt",
    company: "Industrial Silo & Cement Plant Infrastructure",
    prospect: "Industrial Concrete & Silo Specialist",
    caller: "StoneForge Sales Rep",
  },
];

async function main() {
  console.log("=== Processing Audio Call Transcripts Through Sales Pipeline ===\n");

  for (const callMeta of CALLS_TO_PROCESS) {
    const transcriptPath = path.resolve(
      __dirname,
      `../../../transcripts/${callMeta.filename}`
    );

    if (!fs.existsSync(transcriptPath)) {
      console.error(`File not found: ${transcriptPath}`);
      continue;
    }

    const rawText = fs.readFileSync(transcriptPath, "utf-8");
    console.log(`\n==================================================`);
    console.log(`▶ Ingesting: ${callMeta.filename} (${callMeta.company})`);
    console.log(`==================================================`);

    //ingest transcript into database
    const transcript = await prisma.transcript.create({
      data: {
        rawText,
        sourceMeta: {
          company: callMeta.company,
          caller: callMeta.caller,
          prospect: callMeta.prospect,
          filename: callMeta.filename,
        },
        status: "pending",
      },
    });

    console.log(`Created Transcript ID: ${transcript.id}`);

    //run end-to-end extraction pipeline
    console.log(`Running AI extraction & intelligence pipeline...`);
    const result = await extractTranscript(transcript.id);

    console.log(`Completed in ${result.latencyMs}ms!`);
    console.log(`\n--- Lead Intelligence ---`);
    console.log(`Customer Problem : ${result.extraction.customer_problem}`);
    console.log(`Severity         : ${result.extraction.severity}`);
    console.log(`Buying Intent    : ${result.extraction.buying_intent} (${result.extraction.buying_intent_score}/100)`);
    console.log(`Next Step        : ${result.extraction.next_step}`);
    console.log(`Lead Score       : ${result.leadScore.score}/100 [${result.leadScore.tier}]`);
    console.log(`Grounding Status : All Passed = ${result.grounding.allPassed}`);

    if (result.extraction.objections.length > 0) {
      console.log(`Objections       :`);
      result.extraction.objections.forEach((o, i) =>
        console.log(`   ${i + 1}. [${o.category}] "${o.objection}"`)
      );

    }

    console.log(`\nEmail Draft Subject: "${result.followUp.emailSubject}"`);
  }

  console.log("\n All audio calls processed and stored in Supabase!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
