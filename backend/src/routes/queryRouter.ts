import { Router, Request, Response } from "express";
import { executeNaturalLanguageQuery } from "../services/nlpQueryService";

const router = Router();


// POST /query
// Body: { question: string }

router.post("/", async (req: Request, res: Response) => {
  try {
    const { question } = req.body;

    if (!question || typeof question !== "string" || !question.trim()) {
      return res.status(400).json({
        success: false,
        error: "A non-empty 'question' string is required.",
      });
    }

    const result = await executeNaturalLanguageQuery(question);

    return res.json({
      success: true,
      ...result,
    });
  } catch (err: any) {
    console.error("NLP query execution error:", err);
    return res.status(500).json({
      success: false,
      error: err.message || "Failed to execute query.",
    });
  }
});

export default router;
