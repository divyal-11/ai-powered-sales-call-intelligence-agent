import { Router,Request,Response } from "express";
import prisma from "../db/prisma"

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

export default router;