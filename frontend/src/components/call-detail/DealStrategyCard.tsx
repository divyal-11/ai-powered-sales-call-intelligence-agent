"use client";

import { CallInsight, FollowUpItem } from "../../types";

interface DealStrategyCardProps {
  insight: CallInsight | null | undefined;
  questionItems: FollowUpItem[];
  actionItems: FollowUpItem[];
  uniqueQuotes: { label: string; quote: string }[];
}

export default function DealStrategyCard({
  insight,
  questionItems,
  actionItems,
  uniqueQuotes,
}: DealStrategyCardProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Card: Verified Spoken Citations */}
      <div style={{
        backgroundColor: "var(--bg-surface)",
        border: "1px solid var(--border-subtle)",
        borderRadius: "var(--radius-md)",
        padding: "1.25rem 1.5rem",
        boxShadow: "var(--shadow-sm)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--accent-orange)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
            <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
          </svg>
          <span className="label-secondary" style={{ color: "var(--accent-orange)" }}>
            VERIFIED SPOKEN CITATIONS
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
          {uniqueQuotes.length > 0 ? (
            uniqueQuotes.map((item, idx) => (
              <div
                key={idx}
                style={{
                  backgroundColor: "var(--bg-surface-elevated)",
                  border: "1px solid var(--border-subtle)",
                  borderLeft: "3px solid var(--accent-orange)",
                  borderRadius: "0 var(--radius-sm) var(--radius-sm) 0",
                  padding: "0.8rem 1rem",
                }}
              >
                <span className="label-muted" style={{ display: "block", marginBottom: "0.3rem", fontSize: "0.62rem", color: "var(--accent-orange)" }}>
                  {item.label}
                </span>
                <p style={{
                  fontStyle: "italic",
                  fontSize: "0.85rem",
                  lineHeight: 1.55,
                  color: "var(--text-primary)",
                }}>
                  &ldquo;{item.quote}&rdquo;
                </p>
              </div>
            ))
          ) : (
            <p style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>No direct quote citations recorded.</p>
          )}
        </div>
      </div>

      {/* Card: Key Objections & Resistance Points */}
      {insight?.objections && insight.objections.length > 0 && (
        <div style={{
          backgroundColor: "var(--bg-surface)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "var(--radius-md)",
          padding: "1.25rem 1.5rem",
          boxShadow: "var(--shadow-sm)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.85rem" }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--tier-warm-text)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span className="label-secondary" style={{ color: "var(--tier-warm-text)" }}>
              KEY OBJECTIONS & RESISTANCE POINTS ({insight.objections.length})
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.55rem" }}>
            {insight.objections.map((obj, i) => (
              <div key={i} style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "0.65rem",
                padding: "0.55rem 0.75rem",
                borderRadius: "var(--radius-sm)",
                backgroundColor: "var(--bg-surface-elevated)",
                border: "1px solid var(--border-subtle)",
              }}>
                <span style={{
                  fontSize: "0.65rem",
                  fontWeight: 700,
                  color: "var(--tier-warm-text)",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                  backgroundColor: "rgba(245, 158, 11, 0.12)",
                  padding: "0.15rem 0.45rem",
                  borderRadius: "var(--radius-xs)",
                  flexShrink: 0,
                }}>
                  {obj.category}
                </span>
                <p style={{ fontSize: "0.82rem", color: "var(--text-primary)", lineHeight: 1.45 }}>
                  {obj.objection}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Card: Discovery Questions & Rep Actions */}
      {(questionItems.length > 0 || actionItems.length > 0) && (
        <div style={{
          backgroundColor: "var(--bg-surface)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "var(--radius-md)",
          padding: "1.25rem 1.5rem",
          boxShadow: "var(--shadow-sm)",
          display: "flex",
          flexDirection: "column",
          gap: "1.25rem",
        }}>
          {questionItems.length > 0 && (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.45rem", marginBottom: "0.6rem" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                <span className="label-secondary">RECOMMENDED DISCOVERY QUESTIONS</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.45rem" }}>
                {questionItems.map((q, idx) => (
                  <div key={idx} style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "0.6rem",
                    fontSize: "0.82rem",
                    color: "var(--text-primary)",
                    lineHeight: 1.5,
                  }}>
                    <span style={{ color: "var(--accent-orange)", fontSize: "0.85rem", lineHeight: 1 }}>•</span>
                    <span>{q.content}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {actionItems.length > 0 && (
            <div style={{ borderTop: questionItems.length > 0 ? "1px solid var(--border-subtle)" : "none", paddingTop: questionItems.length > 0 ? "1rem" : "0" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.45rem", marginBottom: "0.6rem" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 11 12 14 22 4" />
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                </svg>
                <span className="label-secondary">REP ACTION CHECKLIST</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.45rem" }}>
                {actionItems.map((a, idx) => (
                  <div key={idx} style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "0.6rem",
                    fontSize: "0.82rem",
                    color: "var(--text-primary)",
                    lineHeight: 1.5,
                  }}>
                    <span style={{ color: "#34D399", fontSize: "0.85rem", lineHeight: 1 }}>✓</span>
                    <span>{a.content}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
