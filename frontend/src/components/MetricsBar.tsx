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

  calls.forEach((c) => {
    const score = c.callInsight?.leadScore ?? 0;
    if (score >= 75) hotCount++;
    else if (score >= 40) warmCount++;
    else if (score > 0) coldCount++;
  });

  const hotPct = total > 0 ? Math.round((hotCount / total) * 100) : 0;
  const warmPct = total > 0 ? Math.round((warmCount / total) * 100) : 0;

  const cards = [
    {
      title: "TOTAL CALLS",
      value: total,
      subtext: "Logged & Transcribed",
      badge: "Pipeline",
      color: "var(--text-primary)",
      borderColor: "var(--border-subtle)",
      bgGlow: "transparent",
      dotColor: "var(--text-muted)",
    },
    {
      title: "HOT LEADS",
      value: hotCount,
      subtext: `${hotPct}% high-conviction pipeline`,
      badge: "Score 75-100",
      color: "var(--tier-hot-text)",
      borderColor: "var(--tier-hot-border)",
      bgGlow: "var(--tier-hot-bg)",
      dotColor: "var(--tier-hot-text)",
      pulse: true,
    },
    {
      title: "WARM PROSPECTS",
      value: warmCount,
      subtext: `${warmPct}% follow-up qualified`,
      badge: "Score 40-74",
      color: "var(--tier-warm-text)",
      borderColor: "var(--tier-warm-border)",
      bgGlow: "var(--tier-warm-bg)",
      dotColor: "var(--tier-warm-text)",
      pulse: false,
    },
    {
      title: "COLD / DISQUALIFIED",
      value: coldCount,
      subtext: "Low purchase intent",
      badge: "Score <40",
      color: "var(--tier-cold-text)",
      borderColor: "var(--border-subtle)",
      bgGlow: "transparent",
      dotColor: "var(--tier-cold-text)",
      pulse: false,
    },
  ];

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(4, 1fr)",
      gap: "1rem",
      padding: "1.25rem 2rem",
      flexShrink: 0,
      borderBottom: "1px solid var(--border-subtle)",
    }}>
      {cards.map((card) => (
        <div
          key={card.title}
          style={{
            backgroundColor: "var(--bg-surface)",
            backgroundImage: card.bgGlow !== "transparent" ? `radial-gradient(ellipse at 10% 0%, ${card.bgGlow}, transparent 70%)` : undefined,
            border: `1px solid ${card.borderColor}`,
            borderRadius: "var(--radius-md)",
            padding: "1rem 1.15rem",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            transition: "transform var(--transition-fast), border-color var(--transition-fast)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <span
                className={card.pulse ? "indicator-pulse" : ""}
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  backgroundColor: card.dotColor,
                  display: "inline-block",
                }}
              />
              <span className="label-muted" style={{ fontSize: "0.65rem" }}>
                {card.title}
              </span>
            </div>
            <span style={{
              fontSize: "0.62rem",
              fontWeight: 500,
              padding: "0.15rem 0.45rem",
              borderRadius: "var(--radius-xs)",
              backgroundColor: "rgba(255, 255, 255, 0.04)",
              color: "var(--text-muted)",
              letterSpacing: "0.02em",
            }}>
              {card.badge}
            </span>
          </div>

          <div style={{
            fontSize: "1.85rem",
            fontWeight: 700,
            color: card.color,
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            fontFamily: "var(--font-sans)",
          }}>
            {card.value}
          </div>

          <div style={{
            fontSize: "0.72rem",
            color: "var(--text-secondary)",
            marginTop: "0.4rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}>
            <span>{card.subtext}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
