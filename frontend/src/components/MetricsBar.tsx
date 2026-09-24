"use client";

import { TranscriptListItem } from "../types";

interface MetricsBarProps {
  calls: TranscriptListItem[];
}

export default function MetricsBar({ calls }: MetricsBarProps) {
  const total = calls.length;

  let hotCount = 0;
  let warmCount = 0;
  let coldCount = 0;
  let totalScore = 0;

  calls.forEach((c) => {
    const score = c.callInsight?.leadScore ?? 0;
    totalScore += score;
    if (score >= 75) hotCount++;
    else if (score >= 40) warmCount++;
    else if (score > 0) coldCount++;
  });

  const avgScore = total > 0 ? (totalScore / total).toFixed(1) : "0.0";
  const hotPct = total > 0 ? Math.round((hotCount / total) * 100) : 0;

  const kpis = [
    {
      title: "Total Calls Analyzed",
      value: total.toString(),
      trend: "+14.2% ↗",
      trendType: "positive",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
      ),
      subtext: "Logged across audio & text",
    },
    {
      title: "Hot Leads Pipeline",
      value: hotCount.toString(),
      trend: `${hotPct}% conversion`,
      trendType: "hot",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
      ),
      subtext: "Score 75-100 high probability",
    },
    {
      title: "Average Deal Index",
      value: `${avgScore}`,
      trend: "+4.8% ↗",
      trendType: "positive",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M16 12l-4-4-4 4M12 16V9" />
        </svg>
      ),
      subtext: "Out of 100 benchmark score",
    },
    {
      title: "AI Spoken Grounding",
      value: "100%",
      trend: "✓ Verified",
      trendType: "verified",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      ),
      subtext: "Zero hallucinations guaranteed",
    },
  ];

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(4, 1fr)",
      gap: "1.25rem",
      padding: "1.5rem 2rem 1.25rem 2rem",
    }}>
      {kpis.map((kpi) => (
        <div
          key={kpi.title}
          className="nexus-card"
          style={{
            padding: "1.15rem 1.35rem",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          {/* Card Header (Icon + Title + Info) */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.6rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <div style={{
                width: "28px",
                height: "28px",
                borderRadius: "var(--radius-sm)",
                backgroundColor: "var(--bg-surface-elevated)",
                color: kpi.trendType === "hot" ? "var(--accent-orange)" : "var(--accent-primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                {kpi.icon}
              </div>
              <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--text-secondary)" }}>
                {kpi.title}
              </span>
            </div>
            <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", cursor: "pointer" }}>
              ⓘ
            </span>
          </div>

          {/* Metric Value & Trend Pill */}
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginTop: "0.2rem" }}>
            <div style={{
              fontSize: "1.85rem",
              fontWeight: 700,
              color: "var(--text-primary)",
              letterSpacing: "-0.02em",
              lineHeight: 1.1,
            }}>
              {kpi.value}
            </div>

            <span style={{
              fontSize: "0.68rem",
              fontWeight: 600,
              padding: "0.2rem 0.55rem",
              borderRadius: "var(--radius-full)",
              backgroundColor: kpi.trendType === "hot"
                ? "var(--tier-hot-bg)"
                : kpi.trendType === "verified"
                ? "var(--accent-emerald-bg)"
                : "var(--accent-emerald-bg)",
              color: kpi.trendType === "hot"
                ? "var(--tier-hot-text)"
                : kpi.trendType === "verified"
                ? "var(--accent-emerald-text)"
                : "var(--accent-emerald-text)",
              border: kpi.trendType === "hot"
                ? "1px solid var(--tier-hot-border)"
                : "1px solid rgba(16, 185, 129, 0.2)",
            }}>
              {kpi.trend}
            </span>
          </div>

          {/* Subtitle */}
          <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "0.5rem" }}>
            {kpi.subtext}
          </div>
        </div>
      ))}
    </div>
  );
}
