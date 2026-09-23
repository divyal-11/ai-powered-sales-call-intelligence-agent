import { Router,Request,Response } from "express";
import { extractTranscript } from "../pipeline/extractTranscript";
import prisma from "../db/prisma";
import fs from "node:fs";
import path from "node:path";
import multer from "multer";
import { transcribeAudio } from "../services/transcriptionService";
import { success } from "zod";

// Ensure temp upload directory exists
const uploadDir = path.resolve(__dirname, "../../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure Multer storage to keep the original file extension (.m4a, .mp3, etc.)
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.random().toString(36).substring(2, 9)}${ext}`);
  },
});

// Groq Whisper supports audio up to 25MB
const upload = multer({
  storage, //use the storage engine!
  limits: { fileSize: 25 * 1024 * 1024 },
});



const router = Router()

router.post("/", async (req: Request, res: Response) => {
  const { rawText, sourceMeta } = req.body;
  // Basic validation — rawText is required
  if (!rawText || typeof rawText !== "string") {
    res.status(400).json({ error: "rawText is required and must be a string" });
    return;
  }
  try {
    const transcript = await prisma.transcript.create({
      data: {
        rawText,
        sourceMeta: sourceMeta ?? null, // optional metadata (filename, etc.)
        status: "pending",
      },
    });
    res.status(201).json(transcript);
  } catch (error) {
    console.error("Failed to create transcript:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


// GET /transcripts — list all transcripts
router.get("/", async (req: Request, res: Response) => {
  try {
    const transcripts = await prisma.transcript.findMany({
      orderBy: { createdAt: "desc" }, // newest first
      select: {
        id: true,
        status: true,
        sourceMeta: true,
        createdAt: true,
        callInsight:{
          select:{
            leadScore: true,
            severity: true,
            buyingIntent: true,
            buyingIntentScore: true,
            customerProblem: true,
          }
        }
        // rawText intentionally excluded — it can be huge, don't send in list view
      },
    });
    res.json(transcripts);
  } catch (error) {
    console.error("Failed to fetch transcripts:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /transcripts/:id — fetch one transcript with full rawText
router.get("/:id", async (req: Request, res: Response) => {
  const id  = req.params.id as string;

  try {
    const transcript = await prisma.transcript.findUnique({
      where: { id },
      include:{
        callInsight:{
          include:{
            objections: true,
            followUps:true
          }
        }
      }
    });

    if (!transcript) {
      res.status(404).json({ error: "Transcript not found" });
      return;
    }

    res.json(transcript);
  } catch (error) {
    console.error("Failed to fetch transcript:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /transcripts/:id/analyze — trigger extraction pipeline
router.post("/:id/analyze", async (req: Request, res: Response) => {
  const id = req.params.id as string;

  try {
    const result = await extractTranscript(id);
    res.json(result);
  } catch (error: any) {
    console.error("Extraction failed:", error);
    res.status(500).json({ error: error.message || "Extraction failed" });
  }
});

router.post("/upload-audio",upload.single("audio"),async(req:Request,res:Response)=>{
  if (!req.file) {
    res.status(400).json({ error: "No audio file provided in the 'audio' field" });
    return;
  }

  const filePath = req.file.path;
  const originalFilename = req.file.originalname;
  const {company,prospect,caller} = req.body;

  try{
    //send audio to whisper
    const transcription = await transcribeAudio(filePath)

    //save transcript in db
    const transcript = await prisma.transcript.create({
      data:{
        rawText: transcription.text,
        sourceMeta:{
          company: company || "Unknown Company",
          prospect: prospect || "Unknown Prospect",
          caller: caller || "StoneForge Sales Rep",
          filename: originalFilename,
          transcriptionModel: transcription.model,
          transcriptionLatencyMs: transcription.latencyMs,
        },
        status: "pending",

      }
    });

    //delete the temporary audio
    fs.unlinkSync(filePath);

    //start extraction pipeline
    const analysis = await extractTranscript(transcript.id);

    //return the result
    res.status(201).json({
      success: true,
      transcriptId: transcript.id,
      transcription:{
        text: transcription.text,
        latencyMs: transcription.latencyMs,
      },
      analysis,
    });

  }catch (error: any){
    //cleanup temp file if exists
    if(fs.existsSync(filePath)){
      fs.unlinkSync(filePath);
    }

    //log error
    console.error("Audio processing faild:",error);

    //send error
    res.status(500).json({
      success: false,
      error: error.message || "Transcription and analysis failed",
    });
  }

})


export default router;