"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getTranscriptDetail } from "../../../lib/api";
import { FullTranscriptDetail } from "../../../types";
import CallDetailHeader from "../../../components/call-detail/CallDetailHeader";
import ExecutiveVitalsStrip from "../../../components/call-detail/ExecutiveVitalsStrip";
import DealStrategyCard from "../../../components/call-detail/DealStrategyCard";
import FollowUpEmailCard from "../../../components/call-detail/FollowUpEmailCard";
import RawTranscriptViewer from "../../../components/call-detail/RawTranscriptViewer";

export default function CallDetailPage() {
  const params = useParams();
  const router = useRouter();
  const callId = params.id as string;

  const [detail, setDetail] = useState<FullTranscriptDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!callId) return;
    let isCurrent = true;

    async function fetchDetail() {
      try {
        setLoading(true);
        const data = await getTranscriptDetail(callId);
        if (isCurrent) setDetail(data);
      } catch (err) {
        console.error("Failed to load call detail:", err);
      } finally {
        if (isCurrent) setLoading(false);
      }
    }

    fetchDetail();
    return () => { isCurrent = false; };
  }, [callId]);

  if (loading) {
    return (
      <div style={{
        height: "100vh",
        backgroundColor: "var(--bg-primary)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.75rem",
      }}>
        <div className="indicator-pulse" style={{
          width: "12px",
          height: "12px",
          borderRadius: "50%",
          backgroundColor: "var(--accent-orange)",
        }} />
        <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", letterSpacing: "0.02em" }}>
          Synthesizing call intelligence...
        </p>
      </div>
    );
  }

  if (!detail) {
    return (
      <div style={{
        height: "100vh",
        backgroundColor: "var(--bg-primary)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "1rem",
      }}>
        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Call intelligence record not found</p>
        <button
          onClick={() => router.push("/")}
          style={{
            backgroundColor: "var(--bg-surface-elevated)",
            border: "1px solid var(--border-subtle)",
            color: "var(--text-primary)",
            padding: "0.45rem 1rem",
            borderRadius: "var(--radius-sm)",
            cursor: "pointer",
            fontSize: "0.8rem",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.4rem",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          <span>Back</span>
        </button>
      </div>
    );
  }

  const insight = detail.callInsight;
  const emailItem = insight?.followUps?.find((f) => f.type === "email");
  const questionItems = insight?.followUps?.filter((f) => f.type === "question") || [];
  const actionItems = insight?.followUps?.filter((f) => f.type === "action") || [];

  const handleCopyEmail = () => {
    if (!emailItem?.content) return;
    navigator.clipboard.writeText(emailItem.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // De-duplicate evidence quotes so identical sentences aren't repeated
  const uniqueQuotes: { label: string; quote: string }[] = [];
  if (insight?.fieldEvidence) {
    const seenQuotes = new Set<string>();
    for (const [key, quote] of Object.entries(insight.fieldEvidence)) {
      if (quote && typeof quote === "string") {
        const trimmed = quote.trim();
        if (!seenQuotes.has(trimmed)) {
          seenQuotes.add(trimmed);
          uniqueQuotes.push({
            label: key.replace(/_/g, " ").toUpperCase(),
            quote: trimmed,
          });
        }
      }
    }
  }

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "var(--bg-primary)",
      display: "flex",
      flexDirection: "column",
      fontFamily: "var(--font-sans)",
      color: "var(--text-primary)",
    }}>
      {/* ── Top Header Navigation Bar ── */}
      <CallDetailHeader
        detail={detail}
        copied={copied}
        onCopyEmail={handleCopyEmail}
        hasEmail={!!emailItem}
      />

      {/* ── Main Scrollable Body Container ── */}
      <main style={{
        flex: 1,
        maxWidth: "1400px",
        width: "100%",
        margin: "0 auto",
        padding: "1.75rem 2rem 3rem 2rem",
        display: "flex",
        flexDirection: "column",
        gap: "1.5rem",
      }}>
        {/* ── ROW 1: Executive Deal Vitals Strip (4 Glass Tiles) ── */}
        <ExecutiveVitalsStrip insight={insight} />

        {/* ── ROW 2: Deep-Dive Intelligence & Rep Execution (2-Column Grid) ── */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1.15fr 1fr",
          gap: "1.5rem",
          alignItems: "start",
        }}>
          {/* Left Column: Grounded Evidence & Rep Discovery Strategy */}
          <DealStrategyCard
            insight={insight}
            questionItems={questionItems}
            actionItems={actionItems}
            uniqueQuotes={uniqueQuotes}
          />

          {/* Right Column: Ready-to-Send Follow-up Email & Full Transcript */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <FollowUpEmailCard
              emailItem={emailItem}
              copied={copied}
              onCopyEmail={handleCopyEmail}
            />
            <RawTranscriptViewer rawText={detail.rawText} />
          </div>
        </div>
      </main>
    </div>
  );
}
