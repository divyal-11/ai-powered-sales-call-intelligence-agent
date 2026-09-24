export interface Objection {
  id: string;
  objection: string;
  category: "price" | "timing" | "trust" | "competitor" | "technical" | "other";
}

export interface FollowUpItem {
  id: string;
  type: string;
  content: string;
}

export interface CallInsight {
  id: string;
  customerProblem: string | null;
  severity: "high" | "medium" | "low" | null;
  currentSolution: string | null;
  buyingIntent: "high" | "medium" | "low" | null;
  buyingIntentScore: number | null;
  nextStep: string | null;
  leadScore: number | null;
  isComplete: boolean;
  missingFields: string[];
  fieldEvidence: Record<string, string | null> | null;
  objections?: Objection[];
  followUps?: FollowUpItem[];
}

export interface TranscriptListItem {
  id: string;
  status: string;
  createdAt: string;
  sourceMeta: {
    company?: string;
    prospect?: string;
    caller?: string;
    filename?: string;
    transcriptionModel?: string;
    transcriptionLatencyMs?: number;
  } | null;
  callInsight: {
    leadScore: number | null;
    severity: string | null;
    buyingIntent: string | null;
    buyingIntentScore: number | null;
    customerProblem: string | null;
    nextStep?: string | null;
  } | null;
}

export interface FullTranscriptDetail extends TranscriptListItem {
  rawText: string;
  callInsight: (CallInsight & {
    objections: Objection[];
    followUps: FollowUpItem[];
  }) | null;
}
