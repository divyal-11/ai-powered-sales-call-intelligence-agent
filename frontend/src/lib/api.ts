import { TranscriptListItem, FullTranscriptDetail } from "../types";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

//fetch all transcripts with lead scores and company metadata
export async function getTranscripts(): Promise<TranscriptListItem[]> {
  const res = await fetch(`${API_BASE_URL}/transcripts`, {
    cache: "no-store", // always fetch fresh data
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch calls: ${res.statusText}`);
  }
  return res.json();
}

//fetch a single transcript with details
export async function getTranscriptDetail(id: string): Promise<FullTranscriptDetail> {
  const res = await fetch(`${API_BASE_URL}/transcripts/${id}`, {
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch call details: ${res.statusText}`);
  }
  return res.json();
}

//upload an audio file and start transcription + analysis pipeline
export async function uploadAudioCall(
  file: File,
  meta: { company?: string; prospect?: string; caller?: string }
) {
  const formData = new FormData();
  formData.append("audio", file);
  if (meta.company) formData.append("company", meta.company);
  if (meta.prospect) formData.append("prospect", meta.prospect);
  if (meta.caller) formData.append("caller", meta.caller);
  const res = await fetch(`${API_BASE_URL}/transcripts/upload-audio`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Audio upload & analysis failed");
  }
  return res.json();
}

//submit raw text transcript and run analysis pipeline
export async function submitTextTranscript(
  rawText: string,
  meta: { company?: string; prospect?: string; caller?: string }
) {
  // Step 1: Create the transcript record
  const createRes = await fetch(`${API_BASE_URL}/transcripts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      rawText,
      sourceMeta: {
        company: meta.company || undefined,
        prospect: meta.prospect || undefined,
        caller: meta.caller || undefined,
      },
    }),
  });
  if (!createRes.ok) {
    const errorData = await createRes.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to save transcript");
  }
  const transcript = await createRes.json();

  // Step 2: Trigger analysis pipeline
  const analyzeRes = await fetch(`${API_BASE_URL}/transcripts/${transcript.id}/analyze`, {
    method: "POST",
  });
  if (!analyzeRes.ok) {
    const errorData = await analyzeRes.json().catch(() => ({}));
    throw new Error(errorData.error || "Analysis pipeline failed");
  }

  return { transcriptId: transcript.id };
}

export interface QueryResponse {
  success: boolean;
  question: string;
  sql: string;
  results: any[];
  rowCount: number;
  latencyMs: number;
  error?: string;
}

// Execute natural language query (NLP to SQL) against PostgreSQL
export async function queryIntelligence(question: string): Promise<QueryResponse> {
  const res = await fetch(`${API_BASE_URL}/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to execute query");
  }
  return res.json();
}

