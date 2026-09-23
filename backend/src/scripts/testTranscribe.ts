import path from "path";
import fs from "fs";
import { transcribeAudio } from "../services/transcriptionService";

const CALLS = [
  {
    audioName: "AUD-20260923-WA0007.m4a",
    outputName: "call2.txt",
    label: "Audio Call 2",
  },
  {
    audioName: "AUD-20260923-WA0008.m4a",
    outputName: "call3.txt",
    label: "Audio Call 3",
  },
];

async function main() {
  console.log("=== Transcribing Real Audio Files with Groq Whisper ===\n");

  for (const call of CALLS) {
    const audioPath = path.resolve(__dirname, `../../../audio/${call.audioName}`);
    const outputPath = path.resolve(__dirname, `../../../transcripts/${call.outputName}`);

    console.log(`[${call.label}] Transcribing: ${call.audioName}...`);

    try {
      const result = await transcribeAudio(audioPath);
      console.log(`[${call.label}] Done in ${(result.latencyMs / 1000).toFixed(1)}s!`);

      // Write transcript file
      fs.writeFileSync(outputPath, result.text, "utf-8");
      console.log(`Saved to: transcripts/${call.outputName}`);
      console.log(`Preview: "${result.text.slice(0, 160)}..."\n`);
    } catch (err) {
      console.error(` Failed to transcribe ${call.audioName}:`, err);
    }
  }

  console.log(" All audio calls transcribed successfully!");
}

main().catch(console.error);
