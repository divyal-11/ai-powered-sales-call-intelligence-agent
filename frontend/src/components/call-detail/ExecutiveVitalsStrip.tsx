"use client";

import { CallInsight } from "../../types";

interface ExecutiveVitalsStripProps {
  insight: CallInsight | null | undefined;
}

export default function ExecutiveVitalsStrip({ insight }: ExecutiveVitalsStripProps) {
  const isHighSeverity = insight?.severity === "high";

  return (
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
              backgroundColor: isHighSeverity ? "rgba(239, 68, 68, 0.12)" : "rgba(245, 158, 11, 0.12)",
              border: `1px solid ${isHighSeverity ? "rgba(239, 68, 68, 0.35)" : "rgba(245, 158, 11, 0.35)"}`,
              color: isHighSeverity ? "var(--tier-hot-text)" : "var(--tier-warm-text)",
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
            backgroundColor: "var(--border-medium)",
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
  );
}
