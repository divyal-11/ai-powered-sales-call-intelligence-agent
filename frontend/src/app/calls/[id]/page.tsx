"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getTranscriptDetail } from "../../../lib/api";
import { FullTranscriptDetail } from "../../../types";
import { useTheme } from "../../../lib/theme";

export default function CallDetailPage() {
  const params = useParams();
  const router = useRouter();
  const callId = params.id as string;
  const { theme, toggleTheme } = useTheme();

  const [detail, setDetail] = useState<FullTranscriptDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);

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
            padding: "0.4rem 0.9rem",
            borderRadius: "var(--radius-sm)",
            cursor: "pointer",
            fontSize: "0.8rem",
          }}
        >
          ← Return to Pipeline
        </button>
      </div>
    );
  }

  const insight = detail.callInsight;
  const score = insight?.leadScore ?? 0;
  const isHot = score >= 75;
  const isWarm = score >= 40 && score < 75;
  const tierLabel = isHot ? "Hot Lead" : isWarm ? "Warm Prospect" : "Cold";
  const tierColor = isHot
    ? "var(--tier-hot-text)"
    : isWarm
    ? "var(--tier-warm-text)"
    : "var(--tier-cold-text)";
  const tierBg = isHot
    ? "var(--tier-hot-bg)"
    : isWarm
    ? "var(--tier-warm-bg)"
    : "var(--tier-cold-bg)";
  const tierBorder = isHot
    ? "var(--tier-hot-border)"
    : isWarm
    ? "var(--tier-warm-border)"
    : "var(--tier-cold-border)";

  const emailItem = insight?.followUps?.find((f) => f.type === "email");
  const questionItems = insight?.followUps?.filter((f) => f.type === "question") || [];
  const actionItems = insight?.followUps?.filter((f) => f.type === "action") || [];

  const company = detail.sourceMeta?.company || "Unknown Company";
  const initial = company.charAt(0).toUpperCase();

  const handleCopyEmail = () => {
    if (!emailItem?.content) return;
    navigator.clipboard.writeText(emailItem.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Circular score gauge calculation
  const circleRadius = 18;
  const circleCircumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset = circleCircumference - (Math.min(score, 100) / 100) * circleCircumference;

  return (
    <div style={{
      height: "100vh",
      backgroundColor: "var(--bg-primary)",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
    }}>
      {/* ── Top Header Navigation Bar ── */}
      <div style={{
        padding: "0 2rem",
        height: "58px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: "1px solid var(--border-subtle)",
        backgroundColor: "var(--bg-surface)",
        flexShrink: 0,
        zIndex: 20,
        transition: "background-color var(--transition-normal), border-color var(--transition-normal)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
          {/* Back Button */}
          <button
            onClick={() => router.push("/")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              background: "var(--bg-surface)",
              border: "1px solid var(--border-subtle)",
              color: "var(--text-secondary)",
              cursor: "pointer",
              fontSize: "0.75rem",
              fontWeight: 500,
              fontFamily: "var(--font-sans)",
              padding: "0.35rem 0.7rem",
              borderRadius: "var(--radius-sm)",
              transition: "all var(--transition-fast)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "var(--text-primary)";
              e.currentTarget.style.borderColor = "var(--border-medium)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "var(--text-secondary)";
              e.currentTarget.style.borderColor = "var(--border-subtle)";
            }}
          >
            ← Pipeline
          </button>

          {/* Account Title & Prospect */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div style={{
              width: "32px",
              height: "32px",
              borderRadius: "var(--radius-sm)",
              backgroundColor: "var(--bg-surface-elevated)",
              border: "1px solid var(--border-subtle)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: "0.85rem",
              color: isHot ? "var(--accent-orange)" : "var(--text-primary)",
            }}>
              {initial}
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--text-primary)" }}>
                  {company}
                </span>
                <span style={{
                  display: "inline-block",
                  padding: "0.15rem 0.45rem",
                  borderRadius: "var(--radius-xs)",
                  backgroundColor: tierBg,
                  border: `1px solid ${tierBorder}`,
                  fontSize: "0.68rem",
                  fontWeight: 600,
                  color: tierColor,
                }}>
                  {tierLabel}
                </span>
              </div>
              <div style={{ fontSize: "0.72rem", color: "var(--text-secondary)", marginTop: "1px" }}>
                {detail.sourceMeta?.prospect || "Unspecified Contact"} · {new Date(detail.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Actions, Theme Toggle & Circular Lead Scorecard */}
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          {/* Light / Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            title={`Switch to ${theme === "light" ? "Dark" : "Light"} Mode`}
            style={{
              width: "34px",
              height: "34px",
              borderRadius: "var(--radius-sm)",
              backgroundColor: "var(--bg-surface-elevated)",
              border: "1px solid var(--border-subtle)",
              color: "var(--text-secondary)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.9rem",
              transition: "all var(--transition-fast)",
            }}
          >
            {theme === "light" ? "🌙" : "☀️"}
          </button>

          {emailItem && (
            <button
              onClick={handleCopyEmail}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.45rem",
                backgroundColor: copied ? "var(--bg-surface-elevated)" : "var(--bg-surface)",
                color: copied ? "var(--accent-green)" : "var(--text-primary)",
                fontWeight: 500,
                fontSize: "0.75rem",
                padding: "0.38rem 0.8rem",
                border: copied ? "1px solid rgba(16, 185, 129, 0.4)" : "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-sm)",
                cursor: "pointer",
                fontFamily: "var(--font-sans)",
                transition: "all var(--transition-fast)",
              }}
              onMouseEnter={(e) => {
                if (!copied) e.currentTarget.style.borderColor = "var(--border-medium)";
              }}
              onMouseLeave={(e) => {
                if (!copied) e.currentTarget.style.borderColor = "var(--border-subtle)";
              }}
            >
              <span>{copied ? "✓" : "📋"}</span>
              <span>{copied ? "Email Copied to Clipboard" : "Copy Follow-up Email"}</span>
            </button>
          )}

          {/* Sleek Circular Score Gauge */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            padding: "0.3rem 0.75rem",
            borderRadius: "var(--radius-sm)",
            backgroundColor: "var(--bg-surface)",
            border: "1px solid var(--border-subtle)",
          }}>
            <div style={{ position: "relative", width: "42px", height: "42px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="42" height="42" style={{ transform: "rotate(-90deg)" }}>
                <circle
                  cx="21"
                  cy="21"
                  r={circleRadius}
                  stroke="rgba(255, 255, 255, 0.08)"
                  strokeWidth="3.5"
                  fill="none"
                />
                <circle
                  cx="21"
                  cy="21"
                  r={circleRadius}
                  stroke={tierColor}
                  strokeWidth="3.5"
                  strokeDasharray={circleCircumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="none"
                  style={{ transition: "stroke-dashoffset 0.8s ease" }}
                />
              </svg>
              <div style={{
                position: "absolute",
                fontSize: "0.82rem",
                fontWeight: 700,
                color: tierColor,
                fontFamily: "var(--font-mono)",
              }}>
                {score}
              </div>
            </div>
            <div>
              <div className="label-muted" style={{ fontSize: "0.6rem" }}>LEAD SCORE</div>
              <div style={{ fontSize: "0.72rem", fontWeight: 600, color: "var(--text-primary)" }}>
                {score}/100 Index
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Single-Screen Content Grid (100% at a glance) ── */}
      <div style={{
        flex: 1,
        display: "grid",
        gridTemplateColumns: "1.15fr 1fr",
        overflow: "hidden",
        backgroundColor: "var(--bg-primary)",
      }}>
        {/* ── Left Column: Deal Intelligence & Strategy ── */}
        <div style={{
          borderRight: "1px solid var(--border-subtle)",
          padding: "1.25rem 1.75rem",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}>
          {/* Card 1: Core Problem & Pain Point */}
          <div style={{
            backgroundColor: "var(--bg-surface)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-md)",
            padding: "1.1rem 1.25rem",
            position: "relative",
            boxShadow: "var(--shadow-sm)",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
              <span className="label-secondary" style={{ color: "var(--accent-orange)" }}>
                CUSTOMER PROBLEM & PAIN INTENSITY
              </span>
              {insight?.severity && (
                <span style={{
                  fontSize: "0.65rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  padding: "0.15rem 0.55rem",
                  borderRadius: "var(--radius-xs)",
                  backgroundColor: insight.severity === "high" ? "rgba(239, 68, 68, 0.15)" : "rgba(245, 158, 11, 0.15)",
                  border: `1px solid ${insight.severity === "high" ? "rgba(239, 68, 68, 0.35)" : "rgba(245, 158, 11, 0.35)"}`,
                  color: insight.severity === "high" ? "#FCA5A5" : "#FCD34D",
                }}>
                  {insight.severity} Severity
                </span>
              )}
            </div>
            <p style={{
              fontSize: "0.92rem",
              lineHeight: 1.55,
              color: "var(--text-primary)",
              fontWeight: 500,
            }}>
              {insight?.customerProblem || "No explicit customer pain point diagnosed."}
            </p>
          </div>

          {/* Card 2: Buying Intent & Current Setup (Two Sub-tiles) */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "0.85rem",
          }}>
            {/* Buying Intent */}
            <div style={{
              backgroundColor: "var(--bg-surface)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-md)",
              padding: "1rem",
            }}>
              <span className="label-secondary">BUYING INTENT</span>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginTop: "0.4rem" }}>
                <span style={{
                  fontSize: "1.05rem",
                  fontWeight: 700,
                  color: insight?.buyingIntent === "high" ? "var(--accent-orange)" : "var(--text-primary)",
                }}>
                  {insight?.buyingIntent ? insight.buyingIntent.toUpperCase() : "UNKNOWN"}
                </span>
                <span style={{ fontSize: "0.8rem", fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>
                  {insight?.buyingIntentScore ?? 0}%
                </span>
              </div>
              {/* Intent Progress Meter */}
              <div style={{
                width: "100%",
                height: "4px",
                backgroundColor: "rgba(255, 255, 255, 0.08)",
                borderRadius: "2px",
                marginTop: "0.5rem",
                overflow: "hidden",
              }}>
                <div style={{
                  width: `${insight?.buyingIntentScore ?? (insight?.buyingIntent === "high" ? 85 : insight?.buyingIntent === "medium" ? 50 : 25)}%`,
                  height: "100%",
                  backgroundColor: insight?.buyingIntent === "high" ? "var(--accent-orange)" : "var(--accent-cyan)",
                  borderRadius: "2px",
                }} />
              </div>
            </div>

            {/* Current Solution */}
            <div style={{
              backgroundColor: "var(--bg-surface)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-md)",
              padding: "1rem",
            }}>
              <span className="label-secondary">CURRENT SOLUTION IN PLACE</span>
              <p style={{
                marginTop: "0.4rem",
                fontSize: "0.82rem",
                lineHeight: 1.45,
                color: insight?.currentSolution ? "var(--text-primary)" : "var(--text-muted)",
                fontWeight: 500,
              }}>
                {insight?.currentSolution || "No existing tool or competitor reported"}
              </p>
            </div>
          </div>

          {/* Card 3: Agreed Next Step */}
          <div style={{
            backgroundColor: "var(--bg-surface)",
            border: insight?.nextStep ? "1px solid rgba(16, 185, 129, 0.3)" : "1px solid var(--border-subtle)",
            backgroundImage: insight?.nextStep ? "radial-gradient(ellipse at 5% 0%, rgba(16, 185, 129, 0.08), transparent 70%)" : undefined,
            borderRadius: "var(--radius-md)",
            padding: "1rem 1.25rem",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.45rem", marginBottom: "0.35rem" }}>
              <span style={{ color: insight?.nextStep ? "#34D399" : "var(--text-muted)", fontSize: "0.85rem" }}>✓</span>
              <span className="label-secondary" style={{ color: insight?.nextStep ? "#34D399" : "var(--text-secondary)" }}>
                AGREED NEXT STEP & COMMITMENT
              </span>
            </div>
            <p style={{
              fontSize: "0.88rem",
              lineHeight: 1.5,
              color: insight?.nextStep ? "var(--text-primary)" : "var(--text-muted)",
              fontWeight: 500,
            }}>
              {insight?.nextStep || "No definitive next step scheduled on this call"}
            </p>
          </div>

          {/* Card 4: Objections Encountered */}
          {insight?.objections && insight.objections.length > 0 && (
            <div style={{
              backgroundColor: "var(--bg-surface)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-md)",
              padding: "1rem 1.25rem",
            }}>
              <span className="label-secondary" style={{ color: "var(--tier-warm-text)" }}>
                KEY OBJECTIONS & RESISTANCE POINTS ({insight.objections.length})
              </span>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "0.5rem" }}>
                {insight.objections.map((obj, i) => (
                  <div key={i} style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "0.6rem",
                    padding: "0.4rem 0.6rem",
                    borderRadius: "var(--radius-sm)",
                    backgroundColor: "rgba(255, 255, 255, 0.02)",
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

          {/* Card 5: Discovery Questions & Rep Actions */}
          {(questionItems.length > 0 || actionItems.length > 0) && (
            <div style={{
              display: "grid",
              gridTemplateColumns: questionItems.length > 0 && actionItems.length > 0 ? "1fr 1fr" : "1fr",
              gap: "0.85rem",
            }}>
              {questionItems.length > 0 && (
                <div style={{
                  backgroundColor: "var(--bg-surface)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "var(--radius-md)",
                  padding: "0.85rem 1rem",
                }}>
                  <span className="label-secondary">DISCOVERY QUESTIONS</span>
                  <ul style={{ marginTop: "0.4rem", paddingLeft: "1.1rem", display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                    {questionItems.map((q, idx) => (
                      <li key={idx} style={{ fontSize: "0.78rem", color: "var(--text-secondary)", lineHeight: 1.45 }}>
                        {q.content}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {actionItems.length > 0 && (
                <div style={{
                  backgroundColor: "var(--bg-surface)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "var(--radius-md)",
                  padding: "0.85rem 1rem",
                }}>
                  <span className="label-secondary">REP ACTION CHECKLIST</span>
                  <ul style={{ marginTop: "0.4rem", paddingLeft: "1.1rem", display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                    {actionItems.map((a, idx) => (
                      <li key={idx} style={{ fontSize: "0.78rem", color: "var(--text-secondary)", lineHeight: 1.45 }}>
                        {a.content}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Right Column: Grounded Evidence & Email Composer ── */}
        <div style={{
          padding: "1.25rem 1.75rem",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}>
          {/* Card 1: Grounded Spoken Evidence */}
          <div style={{
            backgroundColor: "var(--bg-surface)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-md)",
            padding: "1.1rem 1.25rem",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
              <span className="label-secondary" style={{ color: "var(--accent-orange)" }}>
                VERIFIED SPOKEN EVIDENCE
              </span>
              <span style={{
                fontSize: "0.65rem",
                fontWeight: 600,
                color: "#34D399",
                backgroundColor: "rgba(16, 185, 129, 0.1)",
                padding: "0.15rem 0.45rem",
                borderRadius: "var(--radius-xs)",
                border: "1px solid rgba(16, 185, 129, 0.25)",
              }}>
                ✓ 100% Spoken Grounding
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {insight?.fieldEvidence && Object.entries(insight.fieldEvidence).map(([key, quote]) =>
                quote ? (
                  <div key={key} style={{
                    backgroundColor: "rgba(255, 255, 255, 0.02)",
                    border: "1px solid var(--border-subtle)",
                    borderLeft: "3px solid var(--accent-orange)",
                    borderRadius: "0 var(--radius-sm) var(--radius-sm) 0",
                    padding: "0.65rem 0.85rem",
                  }}>
                    <span className="label-muted" style={{ display: "block", marginBottom: "0.25rem", fontSize: "0.62rem", color: "var(--accent-orange)" }}>
                      {key.replace(/_/g, " ")}
                    </span>
                    <p style={{
                      fontStyle: "italic",
                      fontSize: "0.82rem",
                      lineHeight: 1.5,
                      color: "var(--text-primary)",
                    }}>
                      &ldquo;{quote}&rdquo;
                    </p>
                  </div>
                ) : null
              )}
              {(!insight?.fieldEvidence || Object.values(insight.fieldEvidence).every(v => !v)) && (
                <p style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>No direct quote citations recorded.</p>
              )}
            </div>
          </div>

          {/* Card 2: Generated Follow-up Email */}
          {emailItem && (
            <div style={{
              backgroundColor: "var(--bg-surface)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-md)",
              padding: "1.1rem 1.25rem",
              display: "flex",
              flexDirection: "column",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.65rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.45rem" }}>
                  <span style={{ fontSize: "0.85rem" }}>✉️</span>
                  <span className="label-secondary">
                    READY-TO-SEND FOLLOW-UP EMAIL
                  </span>
                </div>
                <button
                  onClick={handleCopyEmail}
                  style={{
                    background: "none",
                    border: "none",
                    color: copied ? "var(--accent-green)" : "var(--accent-orange)",
                    fontSize: "0.72rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "var(--font-sans)",
                    padding: 0,
                  }}
                >
                  {copied ? "✓ Copied!" : "Copy Full Text"}
                </button>
              </div>

              <div style={{
                backgroundColor: "var(--bg-surface-elevated)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-sm)",
                padding: "0.9rem",
                fontSize: "0.8rem",
                lineHeight: 1.6,
                whiteSpace: "pre-wrap",
                color: "var(--text-secondary)",
                maxHeight: "185px",
                overflowY: "auto",
                fontFamily: "var(--font-sans)",
              }}>
                {emailItem.content}
              </div>
            </div>
          )}

          {/* Card 3: Collapsible Transcript Drawer */}
          <div style={{
            backgroundColor: "var(--bg-surface)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-md)",
            padding: "0.75rem 1.25rem",
          }}>
            <button
              onClick={() => setShowTranscript(!showTranscript)}
              style={{
                width: "100%",
                background: "none",
                border: "none",
                color: "var(--text-secondary)",
                cursor: "pointer",
                fontSize: "0.75rem",
                fontWeight: 600,
                fontFamily: "var(--font-sans)",
                padding: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                transition: "color var(--transition-fast)",
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = "var(--text-primary)"}
              onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-secondary)"}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.45rem" }}>
                <span>{showTranscript ? "▼" : "▶"}</span>
                <span>ORIGINAL CALL TRANSCRIPT</span>
              </div>
              <span style={{ fontSize: "0.68rem", color: "var(--text-muted)", fontWeight: 400 }}>
                {showTranscript ? "Click to collapse" : "Click to view full text"}
              </span>
            </button>

            {showTranscript && (
              <div style={{
                marginTop: "0.75rem",
                padding: "0.75rem",
                backgroundColor: "var(--bg-surface-elevated)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-sm)",
                fontSize: "0.78rem",
                lineHeight: 1.65,
                color: "var(--text-secondary)",
                whiteSpace: "pre-wrap",
                maxHeight: "220px",
                overflowY: "auto",
                fontFamily: "var(--font-mono)",
              }}>
                {detail.rawText || "No raw transcript text recorded for this call."}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
