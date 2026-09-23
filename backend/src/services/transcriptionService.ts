import dotenv from "dotenv"
dotenv.config()

import fs from "fs";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export interface TranscriptionResult {
  text: string;
  latencyMs: number;
  model: string;
}


// transcribes an audio file using groq whisperr
export async function transcribeAudio(
    filePath: string
):Promise<TranscriptionResult>{
    const startTime = Date.now();
    const model = "whisper-large-v3";

    if(!fs.existsSync(filePath)){
        throw new Error(`Audio file not found at:${filePath}`);
    }

    const response = await groq.audio.transcriptions.create({
        file : fs.createReadStream(filePath),
        model,
        prompt : 
            "StoneForge, Prestige Group, DLF, Sobha, seepage, Bosch Detect 200c, waterproofing, concrete, moisture meter, thermal scanner, grouting",
        response_format: "json",
        temperature: 0.0,
    })

    const latencyMs = Date.now() - startTime;

    if (!response.text) {
        throw new Error("Whisper transcription returned empty text");
    }

    return {
        text: response.text,
        latencyMs,
        model,
    }
}