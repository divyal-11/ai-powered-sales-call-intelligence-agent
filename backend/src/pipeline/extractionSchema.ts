import { z } from "zod";

const FieldEvidenceSchema = z.object({
    customer_problem: z.string(),
    severity: z.string(),
    current_solution: z.string().nullable(),
    
    buying_intent: z.string().nullable(),
    next_step: z.string().nullable()
})

const ObjectionSchema = z.object({
    objection: z.string(),
    category: z.enum(["price", "timing", "trust", "competitor", "technical", "other"]),
    //strength: z.number().min(1).max(5)
})

export const ExtractionSchema = z.object({
    customer_problem: z.string(),
    severity: z.enum(["high","medium","low"]),
    current_solution: z.string().nullable(),
    buying_intent: z.enum(["high","medium","low"]),
    buying_intent_score: z.number().int().min(1).max(100),
    next_step: z.string().nullable(),
    is_complete: z.boolean(),
    missing_fields: z.array(z.string()),
    field_evidence: FieldEvidenceSchema,
    objections: z.array(ObjectionSchema),
    
    follow_up: z.array(z.object({
        type: z.enum(["email","call"]),
        content: z.string()
    })).optional(),

    
})

export type Extraction = z.infer<typeof ExtractionSchema>