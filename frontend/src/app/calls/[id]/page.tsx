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
      <header style={{
        position: "sticky",
        top: 0,
        zIndex: 30,
        height: "60px",
        backgroundColor: "rgba(18, 20, 26, 0.95)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--border-subtle)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 2rem",
      }}>
        {/* Left: Back button + Company Breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
          <button
            onClick={() => router.push("/")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.45rem",
              backgroundColor: "var(--bg-surface-elevated)",
              border: "1px solid var(--border-subtle)",
              color: "var(--text-secondary)",
              cursor: "pointer",
              fontSize: "0.78rem",
              fontWeight: 500,
              padding: "0.4rem 0.8rem",
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
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            <span>Back</span>
          </button>

          <div style={{ width: "1px", height: "24px", backgroundColor: "var(--border-subtle)" }} />

          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div style={{
              width: "34px",
              height: "34px",
              borderRadius: "var(--radius-sm)",
              backgroundColor: "var(--bg-surface-elevated)",
              border: "1px solid var(--border-subtle)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: "0.88rem",
              color: isHot ? "var(--accent-orange)" : "var(--text-primary)",
              boxShadow: isHot ? "0 0 12px var(--accent-orange-muted)" : "none",
            }}>
              {initial}
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.55rem" }}>
                <span style={{ fontWeight: 700, fontSize: "1rem", color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
                  {company}
                </span>
                <span style={{
                  display: "inline-block",
                  padding: "0.15rem 0.5rem",
                  borderRadius: "var(--radius-xs)",
                  backgroundColor: tierBg,
                  border: `1px solid ${tierBorder}`,
                  fontSize: "0.68rem",
                  fontWeight: 600,
                  color: tierColor,
                  letterSpacing: "0.02em",
                }}>
                  {tierLabel}
                </span>
              </div>
              <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "1px" }}>
                {detail.sourceMeta?.prospect || "Contact"} · {new Date(detail.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Actions, Theme & Score Widget */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
          {/* Theme Toggle (Clean SVG) */}
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
              transition: "all var(--transition-fast)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--border-medium)";
              e.currentTarget.style.color = "var(--text-primary)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--border-subtle)";
              e.currentTarget.style.color = "var(--text-secondary)";
            }}
          >
            {theme === "light" ? (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            ) : (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            )}
          </button>

          {/* Quick Copy Follow-up Email */}
          {emailItem && (
            <button
              onClick={handleCopyEmail}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.45rem",
                backgroundColor: copied ? "rgba(16, 185, 129, 0.12)" : "var(--bg-surface-elevated)",
                color: copied ? "#34D399" : "var(--text-primary)",
                fontWeight: 500,
                fontSize: "0.76rem",
                padding: "0.42rem 0.85rem",
                border: copied ? "1px solid rgba(16, 185, 129, 0.35)" : "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-sm)",
                cursor: "pointer",
                transition: "all var(--transition-fast)",
              }}
              onMouseEnter={(e) => {
                if (!copied) e.currentTarget.style.borderColor = "var(--border-medium)";
              }}
              onMouseLeave={(e) => {
                if (!copied) e.currentTarget.style.borderColor = "var(--border-subtle)";
              }}
            >
              {copied ? (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
              )}
              <span>{copied ? "Copied to Clipboard" : "Copy Follow-up Email"}</span>
            </button>
          )}

          {/* Lead Scorecard Gauge */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            padding: "0.25rem 0.75rem",
            borderRadius: "var(--radius-sm)",
            backgroundColor: "var(--bg-surface-elevated)",
            border: "1px solid var(--border-subtle)",
          }}>
            <div style={{ position: "relative", width: "40px", height: "40px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="40" height="40" style={{ transform: "rotate(-90deg)" }}>
                <circle
                  cx="20"
                  cy="20"
                  r={circleRadius}
                  stroke="rgba(255, 255, 255, 0.08)"
                  strokeWidth="3.2"
                  fill="none"
                />
                <circle
                  cx="20"
                  cy="20"
                  r={circleRadius}
                  stroke={tierColor}
                  strokeWidth="3.2"
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
              <div className="label-muted" style={{ fontSize: "0.58rem" }}>LEAD SCORE</div>
              <div style={{ fontSize: "0.72rem", fontWeight: 600, color: "var(--text-primary)" }}>
                {score}/100 Index
              </div>
            </div>
          </div>
        </div>
      </header>

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
        <div style={{
          display: "grid",
          gridTemplateColumns: "1.4fr 1fr 1fr 1.1fr",
          gap: "1rem",
        }}>
          {/* Tile 1: Primary Pain Point */}
          <div style={{
            backgroundColor: "var(--bg-surface)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-md)",
            padding: "1.1rem 1.25rem",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            boxShadow: "var(--shadow-sm)",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
              <span className="label-secondary" style={{ color: "var(--accent-orange)" }}>
                PRIMARY CUSTOMER PROBLEM
              </span>
              {insight?.severity && (
                <span style={{
                  fontSize: "0.62rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                  padding: "0.15rem 0.5rem",
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
              fontSize: "0.88rem",
              lineHeight: 1.5,
              color: "var(--text-primary)",
              fontWeight: 500,
            }}>
              {insight?.customerProblem || "No explicit customer pain point diagnosed."}
            </p>
          </div>

          {/* Tile 2: Buying Intent */}
          <div style={{
            backgroundColor: "var(--bg-surface)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-md)",
            padding: "1.1rem 1.25rem",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            boxShadow: "var(--shadow-sm)",
          }}>
            <span className="label-secondary">BUYING INTENT</span>
            <div style={{ marginTop: "0.4rem" }}>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
                <span style={{
                  fontSize: "1.15rem",
                  fontWeight: 700,
                  color: insight?.buyingIntent === "high" ? "var(--accent-orange)" : "var(--text-primary)",
                  letterSpacing: "0.01em",
                }}>
                  {insight?.buyingIntent ? insight.buyingIntent.toUpperCase() : "UNKNOWN"}
                </span>
                <span style={{ fontSize: "0.82rem", fontFamily: "var(--font-mono)", color: "var(--text-secondary)" }}>
                  {insight?.buyingIntentScore ?? (insight?.buyingIntent === "high" ? 85 : insight?.buyingIntent === "medium" ? 50 : 20)}%
                </span>
              </div>
              <div style={{
                width: "100%",
                height: "5px",
                backgroundColor: "rgba(255, 255, 255, 0.08)",
                borderRadius: "3px",
                marginTop: "0.6rem",
                overflow: "hidden",
              }}>
                <div style={{
                  width: `${insight?.buyingIntentScore ?? (insight?.buyingIntent === "high" ? 85 : insight?.buyingIntent === "medium" ? 50 : 20)}%`,
                  height: "100%",
                  backgroundColor: insight?.buyingIntent === "high" ? "var(--accent-orange)" : "var(--accent-cyan)",
                  borderRadius: "3px",
                }} />
              </div>
            </div>
          </div>

          {/* Tile 3: Current Solution */}
          <div style={{
            backgroundColor: "var(--bg-surface)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-md)",
            padding: "1.1rem 1.25rem",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            boxShadow: "var(--shadow-sm)",
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

          {/* Tile 4: Agreed Next Step */}
          <div style={{
            backgroundColor: "var(--bg-surface)",
            border: insight?.nextStep ? "1px solid rgba(16, 185, 129, 0.3)" : "1px solid var(--border-subtle)",
            backgroundImage: insight?.nextStep ? "radial-gradient(ellipse at 5% 0%, rgba(16, 185, 129, 0.08), transparent 70%)" : undefined,
            borderRadius: "var(--radius-md)",
            padding: "1.1rem 1.25rem",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            boxShadow: "var(--shadow-sm)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={insight?.nextStep ? "#34D399" : "var(--text-muted)"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span className="label-secondary" style={{ color: insight?.nextStep ? "#34D399" : "var(--text-secondary)" }}>
                AGREED NEXT STEP
              </span>
            </div>
            <p style={{
              marginTop: "0.4rem",
              fontSize: "0.82rem",
              lineHeight: 1.45,
              color: insight?.nextStep ? "var(--text-primary)" : "var(--text-muted)",
              fontWeight: 500,
            }}>
              {insight?.nextStep || "No definitive next step scheduled on this call"}
            </p>
          </div>
        </div>

        {/* ── ROW 2: Deep-Dive Intelligence & Rep Execution (2-Column Grid) ── */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1.15fr 1fr",
          gap: "1.5rem",
          alignItems: "start",
        }}>
          {/* ── Left Column: Grounded Evidence & Rep Discovery Strategy ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {/* Card: Verified Spoken Citations (Clean, NO 100% Spoken Grounding badge) */}
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
                          color: "var(--text-secondary)",
                          lineHeight: 1.45,
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
                          color: "var(--text-secondary)",
                          lineHeight: 1.45,
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

          {/* ── Right Column: Ready-to-Send Follow-up Email & Full Transcript ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {/* Card: Ready-to-Send Follow-up Email */}
            {emailItem && (
              <div style={{
                backgroundColor: "var(--bg-surface)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-md)",
                padding: "1.25rem 1.5rem",
                boxShadow: "var(--shadow-sm)",
                display: "flex",
                flexDirection: "column",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.85rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                    <span className="label-secondary">
                      READY-TO-SEND FOLLOW-UP EMAIL
                    </span>
                  </div>
                  <button
                    onClick={handleCopyEmail}
                    style={{
                      background: "none",
                      border: "none",
                      color: copied ? "#34D399" : "var(--accent-orange)",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      fontFamily: "var(--font-sans)",
                      padding: 0,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.35rem",
                    }}
                  >
                    {copied ? (
                      <>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                        </svg>
                        <span>Copy Full Text</span>
                      </>
                    )}
                  </button>
                </div>

                <div style={{
                  backgroundColor: "var(--bg-surface-elevated)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "var(--radius-sm)",
                  padding: "1rem 1.15rem",
                  fontSize: "0.82rem",
                  lineHeight: 1.65,
                  whiteSpace: "pre-wrap",
                  color: "var(--text-secondary)",
                  maxHeight: "360px",
                  overflowY: "auto",
                  fontFamily: "var(--font-sans)",
                }}>
                  {emailItem.content}
                </div>
              </div>
            )}

            {/* Card: Collapsible Transcript Drawer */}
            <div style={{
              backgroundColor: "var(--bg-surface)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-md)",
              padding: "0.85rem 1.25rem",
              boxShadow: "var(--shadow-sm)",
            }}>
              <button
                onClick={() => setShowTranscript(!showTranscript)}
                style={{
                  width: "100%",
                  background: "none",
                  border: "none",
                  color: "var(--text-secondary)",
                  cursor: "pointer",
                  fontSize: "0.78rem",
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
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{
                      transform: showTranscript ? "rotate(90deg)" : "rotate(0deg)",
                      transition: "transform var(--transition-fast)",
                    }}
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                  <span>ORIGINAL CALL TRANSCRIPT</span>
                </div>
                <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: 400 }}>
                  {showTranscript ? "Click to collapse" : "Click to view full text"}
                </span>
              </button>

              {showTranscript && (
                <div style={{
                  marginTop: "0.85rem",
                  padding: "0.85rem",
                  backgroundColor: "var(--bg-surface-elevated)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "var(--radius-sm)",
                  fontSize: "0.78rem",
                  lineHeight: 1.65,
                  color: "var(--text-secondary)",
                  whiteSpace: "pre-wrap",
                  maxHeight: "300px",
                  overflowY: "auto",
                  fontFamily: "var(--font-sans)",
                }}>
                  {detail.rawText || "No raw transcript text recorded for this call."}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
