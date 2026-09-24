"use client";

import { TranscriptListItem } from "../types";

interface MetricsBarProps {
  calls: TranscriptListItem[];
  activeFilter?: "ALL" | "HOT" | "WARM" | "COLD";
  onFilterChange?: (filter: "ALL" | "HOT" | "WARM" | "COLD") => void;
}

export default function MetricsBar({
  calls,
  activeFilter = "ALL",
  onFilterChange,
}: MetricsBarProps) {
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
      key: "ALL" as const,
      title: "TOTAL CALLS",
      value: total,
      subtext: "Full analyzed corpus",
      badge: "Corpus",
      color: "var(--text-primary)",
      borderColor: "var(--border-subtle)",
      bgGlow: "transparent",
      dotColor: "var(--text-muted)",
    },
    {
      key: "HOT" as const,
      title: "HOT LEADS",
      value: hotCount,
      subtext: `${hotPct}% high-conviction pipeline`,
      badge: "Score 75+",
      color: "var(--tier-hot-text)",
      borderColor: "var(--tier-hot-border)",
      bgGlow: "var(--tier-hot-bg)",
      dotColor: "var(--tier-hot-text)",
      pulse: true,
    },
    {
      key: "WARM" as const,
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
      key: "COLD" as const,
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
      padding: 0,
      flexShrink: 0,
    }}>
      {cards.map((card) => {
        const isSelected = activeFilter === card.key;
        return (
          <div
            key={card.key}
            onClick={() => onFilterChange && onFilterChange(card.key)}
            style={{
              backgroundColor: "var(--bg-surface)",
              backgroundImage: card.bgGlow !== "transparent" ? `radial-gradient(ellipse at 10% 0%, ${card.bgGlow}, transparent 70%)` : undefined,
              border: isSelected
                ? "2px solid var(--accent-orange)"
                : `1px solid ${card.borderColor}`,
              borderRadius: "var(--radius-md)",
              padding: "1rem 1.15rem",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              cursor: "pointer",
              transition: "transform var(--transition-fast), border-color var(--transition-fast), box-shadow var(--transition-fast)",
              boxShadow: isSelected ? "0 0 10px var(--accent-orange-muted)" : "var(--shadow-sm)",
              position: "relative",
              overflow: "hidden",
            }}
            onMouseEnter={(e) => {
              if (!isSelected) e.currentTarget.style.borderColor = "var(--border-medium)";
            }}
            onMouseLeave={(e) => {
              if (!isSelected) e.currentTarget.style.borderColor = card.borderColor;
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
                fontWeight: 600,
                padding: "0.15rem 0.45rem",
                borderRadius: "var(--radius-xs)",
                backgroundColor: isSelected ? "var(--accent-orange-muted)" : "var(--bg-surface-elevated)",
                color: isSelected ? "var(--accent-orange)" : "var(--text-muted)",
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
              {isSelected && (
                <span style={{ fontSize: "0.65rem", color: "var(--accent-orange)", fontWeight: 600 }}>
                  Active Filter
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
