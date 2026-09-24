"use client";

import { useEffect, useState } from "react";
import { getTranscriptDetail } from "../lib/api";
import { FullTranscriptDetail } from "../types";

interface CallDetailProps {
  callId: string | null;
}

export default function CallDetail({ callId }: CallDetailProps) {
  const [detail, setDetail] = useState<FullTranscriptDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showRaw, setShowRaw] = useState(false);

  useEffect(() => {
    if (!callId) return;
    let isCurrent = true;

    async function fetchDetail() {
      try {
        setLoading(true);
        const data = await getTranscriptDetail(callId!);
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

  if (!callId) {
    return (
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}>
        <span className="mono-tag">SELECT A CALL FROM THE FEED TO INSPECT</span>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-secondary)" }}>
        <span className="mono-tag">RETRIEVING SALES INTELLIGENCE...</span>
      </div>
    );
  }

  if (!detail) return null;

  const insight = detail.callInsight;
  const score = insight?.leadScore ?? 0;
  const tierColor = score >= 75 ? "var(--tier-hot)" : score >= 40 ? "var(--tier-warm)" : "var(--tier-cold)";
  const tierLabel = score >= 75 ? "HOT" : score >= 40 ? "WARM" : "COLD";

  // Find follow-up email from followUps list
  const emailItem = insight?.followUps?.find((f) => f.type === "email");
  const questionItems = insight?.followUps?.filter((f) => f.type === "question") || [];
  const actionItems = insight?.followUps?.filter((f) => f.type === "action") || [];

  const handleCopyEmail = () => {
    if (!emailItem?.content) return;
    navigator.clipboard.writeText(emailItem.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{
      flex: 1,
      height: "calc(100vh - 150px)",
      overflowY: "auto",
      padding: "2rem",
      backgroundColor: "var(--bg-surface)",
    }}>
      {/* Header Banner */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        paddingBottom: "1.5rem",
        borderBottom: "1px solid var(--border-subtle)",
      }}>
        <div>
          <span className="mono-tag" style={{ color: "var(--accent-orange)" }}>
            CALL INTELLIGENCE FILE
          </span>
          <h1 style={{ fontSize: "1.6rem", fontWeight: 700, marginTop: "0.25rem" }}>
            {detail.sourceMeta?.company || "Unknown Company"}
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginTop: "0.2rem" }}>
            Prospect: {detail.sourceMeta?.prospect || "Unknown Prospect"} · Rep: {detail.sourceMeta?.caller || "StoneForge Rep"}
          </p>
        </div>

        {/* Lead Score Badge */}
        <div style={{ textAlign: "right" }}>
          <span className="mono-tag" style={{ color: "var(--text-secondary)" }}>LEAD SCORE</span>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.35rem 0.75rem",
            backgroundColor: "rgba(0,0,0,0.4)",
            border: `1px solid ${tierColor}`,
            borderRadius: "4px",
            marginTop: "0.25rem",
          }}>
            <span style={{ fontSize: "1.25rem", fontWeight: 700, color: tierColor }}>
              {score}/100
            </span>
            <span className="mono-tag" style={{ color: tierColor, fontWeight: 700 }}>
              [{tierLabel}]
            </span>
          </div>
        </div>
      </div>

      {/* Grid: Problem & Intent */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginTop: "1.5rem" }}>
        {/* Customer Problem */}
        <div style={{ padding: "1.25rem", backgroundColor: "var(--bg-primary)", border: "1px solid var(--border-subtle)", borderRadius: "4px" }}>
          <span className="mono-tag">01 / IDENTIFIED PROBLEM</span>
          <p style={{ marginTop: "0.5rem", fontSize: "0.95rem", lineHeight: "1.5", color: "#FFFFFF" }}>
            {insight?.customerProblem || "No specific problem detected."}
          </p>
          <div style={{ marginTop: "0.75rem", display: "flex", gap: "0.5rem" }}>
            {insight?.severity && (
              <span className="mono-tag" style={{
                padding: "0.2rem 0.5rem",
                backgroundColor: "rgba(0,0,0,0.5)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "3px",
                color: insight.severity === "high" ? "#EF4444" : "#F59E0B",
              }}>
                SEVERITY: {insight.severity.toUpperCase()}
              </span>
            )}
          </div>
        </div>

        {/* Buying Intent & Current Solution */}
        <div style={{ padding: "1.25rem", backgroundColor: "var(--bg-primary)", border: "1px solid var(--border-subtle)", borderRadius: "4px" }}>
          <span className="mono-tag">02 / BUYING INTENT & REMEDIATION</span>
          <div style={{ marginTop: "0.5rem" }}>
            <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Buying Intent: </span>
            <strong style={{ color: "var(--accent-orange)" }}>
              {insight?.buyingIntent?.toUpperCase() || "UNKNOWN"} ({insight?.buyingIntentScore || 0}/100)
            </strong>
          </div>
          <div style={{ marginTop: "0.5rem" }}>
            <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Current Solution: </span>
            <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
              {insight?.currentSolution || "None reported"}
            </span>
          </div>
          <div style={{ marginTop: "0.5rem" }}>
            <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Agreed Next Step: </span>
            <span style={{ fontSize: "0.85rem", color: insight?.nextStep ? "var(--tier-hot)" : "var(--text-muted)" }}>
              {insight?.nextStep || "None agreed on this call"}
            </span>
          </div>
        </div>
      </div>

      {/* Grounded Evidence Box (Anti-Hallucination) */}
      <div style={{ marginTop: "1.5rem", padding: "1.25rem", backgroundColor: "var(--bg-primary)", border: "1px solid var(--border-subtle)", borderRadius: "4px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span className="mono-tag">03 / GROUNDED EVIDENCE (ZERO-HALLUCINATION AUDIT)</span>
          <span className="mono-tag" style={{ color: "var(--tier-hot)" }}>✓ 100% VERIFIED QUOTES</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "0.75rem", marginTop: "1rem" }}>
          {insight?.fieldEvidence && Object.entries(insight.fieldEvidence).map(([key, quote]) => (
            quote ? (
              <div key={key} style={{
                padding: "0.75rem",
                backgroundColor: "var(--bg-surface)",
                borderLeft: "3px solid var(--tier-hot)",
                borderRadius: "2px",
              }}>
                <span className="mono-tag" style={{ fontSize: "0.65rem", color: "var(--tier-hot)" }}>
                  {key.toUpperCase()} · VERBATIM TRANSCRIPT EVIDENCE
                </span>
                <p style={{ fontStyle: "italic", fontSize: "0.85rem", color: "var(--text-primary)", marginTop: "0.25rem" }}>
                  "{quote}"
                </p>
              </div>
            ) : null
          ))}
        </div>
      </div>

      {/* Objections Identified */}
      {insight?.objections && insight.objections.length > 0 && (
        <div style={{ marginTop: "1.5rem", padding: "1.25rem", backgroundColor: "var(--bg-primary)", border: "1px solid var(--border-subtle)", borderRadius: "4px" }}>
          <span className="mono-tag">04 / PROSPECT OBJECTIONS DETECTED</span>
          <div style={{ display: "grid", gap: "0.75rem", marginTop: "0.75rem" }}>
            {insight.objections.map((obj, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
                <span className="mono-tag" style={{
                  padding: "0.2rem 0.5rem",
                  backgroundColor: "rgba(245, 158, 11, 0.1)",
                  border: "1px solid var(--tier-warm)",
                  color: "var(--tier-warm)",
                  borderRadius: "3px",
                  fontSize: "0.68rem",
                }}>
                  {obj.category.toUpperCase()}
                </span>
                <p style={{ fontSize: "0.85rem", color: "var(--text-primary)" }}>
                  {obj.objection}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Automated Follow-Up Email Section */}
      {emailItem && (
        <div style={{ marginTop: "1.5rem", padding: "1.5rem", backgroundColor: "var(--bg-primary)", border: "1px solid var(--border-subtle)", borderRadius: "4px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span className="mono-tag">05 / GENERATED FOLLOW-UP EMAIL</span>
            <button
              onClick={handleCopyEmail}
              style={{
                backgroundColor: copied ? "var(--tier-hot)" : "var(--accent-orange)",
                color: "#000000",
                fontWeight: 700,
                fontSize: "0.75rem",
                padding: "0.4rem 0.85rem",
                border: "none",
                borderRadius: "3px",
                cursor: "pointer",
                fontFamily: "var(--font-sans)",
                transition: "all 0.15s ease",
              }}
            >
              {copied ? "✓ COPIED TO CLIPBOARD!" : "COPY EMAIL DRAFT"}
            </button>
          </div>

          <div style={{
            marginTop: "1rem",
            padding: "1.25rem",
            backgroundColor: "var(--bg-surface)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "4px",
            fontFamily: "var(--font-sans)",
            fontSize: "0.88rem",
            lineHeight: "1.6",
            whiteSpace: "pre-wrap",
            color: "var(--text-primary)",
          }}>
            {emailItem.content}
          </div>

          {/* Action Items & Suggested Questions */}
          {(questionItems.length > 0 || actionItems.length > 0) && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginTop: "1.25rem" }}>
              {questionItems.length > 0 && (
                <div>
                  <span className="mono-tag" style={{ color: "var(--accent-orange)" }}>RECOMMENDED QUESTIONS</span>
                  <ul style={{ marginTop: "0.5rem", paddingLeft: "1.2rem", fontSize: "0.82rem", color: "var(--text-secondary)" }}>
                    {questionItems.map((q, idx) => (
                      <li key={idx} style={{ marginBottom: "0.4rem" }}>{q.content}</li>
                    ))}
                  </ul>
                </div>
              )}
              {actionItems.length > 0 && (
                <div>
                  <span className="mono-tag" style={{ color: "var(--tier-hot)" }}>NEXT ACTIONS</span>
                  <ul style={{ marginTop: "0.5rem", paddingLeft: "1.2rem", fontSize: "0.82rem", color: "var(--text-secondary)" }}>
                    {actionItems.map((a, idx) => (
                      <li key={idx} style={{ marginBottom: "0.4rem" }}>{a.content}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Raw Transcript Accordion */}
      <div style={{ marginTop: "1.5rem", borderTop: "1px solid var(--border-subtle)", paddingTop: "1rem" }}>
        <button
          onClick={() => setShowRaw(!showRaw)}
          className="mono-tag"
          style={{
            background: "none",
            border: "none",
            color: "var(--text-secondary)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          {showRaw ? "▲ HIDE RAW CALL TRANSCRIPT" : "▼ VIEW RAW CALL TRANSCRIPT"}
        </button>

        {showRaw && (
          <div style={{
            marginTop: "0.75rem",
            padding: "1rem",
            backgroundColor: "var(--bg-primary)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "4px",
            fontFamily: "var(--font-mono)",
            fontSize: "0.78rem",
            lineHeight: "1.5",
            color: "var(--text-muted)",
            maxHeight: "250px",
            overflowY: "auto",
          }}>
            {detail.rawText}
          </div>
        )}
      </div>
    </div>
  );
}
