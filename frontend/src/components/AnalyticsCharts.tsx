"use client";

import { useState } from "react";
import { TranscriptListItem } from "../types";

interface AnalyticsChartsProps {
  calls: TranscriptListItem[];
}

export default function AnalyticsCharts({ calls }: AnalyticsChartsProps) {
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);

  // Group calls into score bands
  const bands = [
    { label: "80-100", title: "Hot / Ready to Close", count: 0, color: "var(--accent-orange)" },
    { label: "60-79", title: "Warm Qualified", count: 0, color: "#6366F1" },
    { label: "40-59", title: "Discovery Phase", count: 0, color: "#06B6D4" },
    { label: "20-39", title: "Low Velocity", count: 0, color: "#94A3B8" },
    { label: "<20", title: "Unqualified", count: 0, color: "#CBD5E1" },
  ];

  calls.forEach((c) => {
    const s = c.callInsight?.leadScore ?? 0;
    if (s >= 80) bands[0].count++;
    else if (s >= 60) bands[1].count++;
    else if (s >= 40) bands[2].count++;
    else if (s >= 20) bands[3].count++;
    else bands[4].count++;
  });

  const maxCount = Math.max(...bands.map((b) => b.count), 1);

  // Categorize customer problem topics for the Donut chart
  let seepageCount = 0;
  let mixCount = 0;
  let generalCount = 0;

  calls.forEach((c) => {
    const text = (c.callInsight?.customerProblem || "").toLowerCase();
    if (text.includes("water") || text.includes("seep") || text.includes("leak") || text.includes("moisture")) {
      seepageCount++;
    } else if (text.includes("concrete") || text.includes("mix") || text.includes("silo") || text.includes("plant")) {
      mixCount++;
    } else {
      generalCount++;
    }
  });

  const totalProblemCount = seepageCount + mixCount + generalCount || 1;
  const seepPct = Math.round((seepageCount / totalProblemCount) * 100);
  const mixPct = Math.round((mixCount / totalProblemCount) * 100);
  const genPct = Math.max(100 - seepPct - mixPct, 0);

  // Donut SVG circumference calculation
  const radius = 55;
  const circumference = 2 * Math.PI * radius;
  const stroke1 = (seepPct / 100) * circumference;
  const stroke2 = (mixPct / 100) * circumference;
  const stroke3 = (genPct / 100) * circumference;

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "1.45fr 1fr",
      gap: "1.25rem",
      padding: "0 2rem 1.25rem 2rem",
    }}>
      {/* ── Left Chart: Score Distribution & Pipeline Velocity (Nexus style) ── */}
      <div className="nexus-card" style={{ padding: "1.25rem 1.5rem", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div>
          {/* Header */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "0.85rem" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.45rem" }}>
                <span style={{ fontSize: "0.85rem" }}>📊</span>
                <span style={{ fontSize: "0.88rem", fontWeight: 700, color: "var(--text-primary)" }}>
                  Pipeline Score Distribution
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem", marginTop: "0.4rem" }}>
                <span style={{ fontSize: "1.65rem", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
                  {calls.length} <span style={{ fontSize: "0.82rem", fontWeight: 500, color: "var(--text-secondary)" }}>Total Calls</span>
                </span>
                <span style={{
                  fontSize: "0.68rem",
                  fontWeight: 600,
                  padding: "0.15rem 0.45rem",
                  borderRadius: "var(--radius-full)",
                  backgroundColor: "var(--accent-emerald-bg)",
                  color: "var(--accent-emerald-text)",
                }}>
                  15.8% ↗ High Conviction
                </span>
              </div>
            </div>

            <div style={{ display: "flex", gap: "0.4rem" }}>
              <span style={{
                fontSize: "0.72rem",
                padding: "0.25rem 0.55rem",
                borderRadius: "var(--radius-sm)",
                backgroundColor: "var(--bg-surface-elevated)",
                border: "1px solid var(--border-subtle)",
                color: "var(--text-secondary)",
                cursor: "pointer",
              }}>
                Filter ▾
              </span>
              <span style={{
                fontSize: "0.72rem",
                padding: "0.25rem 0.55rem",
                borderRadius: "var(--radius-sm)",
                backgroundColor: "var(--bg-surface-elevated)",
                border: "1px solid var(--border-subtle)",
                color: "var(--text-secondary)",
                cursor: "pointer",
              }}>
                Weekly ▾
              </span>
            </div>
          </div>

          {/* Bar Chart Visualization */}
          <div style={{
            height: "170px",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            paddingTop: "1.5rem",
            paddingBottom: "0.5rem",
            borderBottom: "1px solid var(--border-subtle)",
            position: "relative",
          }}>
            {bands.map((band, idx) => {
              const heightPct = Math.max((band.count / maxCount) * 100, 12);
              const isHovered = hoveredBar === idx;
              return (
                <div
                  key={band.label}
                  onMouseEnter={() => setHoveredBar(idx)}
                  onMouseLeave={() => setHoveredBar(null)}
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    height: "100%",
                    justifyContent: "flex-end",
                    cursor: "pointer",
                    position: "relative",
                  }}
                >
                  {/* Tooltip on hover */}
                  {isHovered && (
                    <div style={{
                      position: "absolute",
                      top: "-28px",
                      backgroundColor: "var(--text-primary)",
                      color: "var(--bg-primary)",
                      padding: "0.2rem 0.45rem",
                      borderRadius: "var(--radius-xs)",
                      fontSize: "0.68rem",
                      fontWeight: 600,
                      whiteSpace: "nowrap",
                      zIndex: 10,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                    }}>
                      {band.count} Calls ({band.title})
                    </div>
                  )}

                  {/* Bar */}
                  <div style={{
                    width: "36px",
                    height: `${heightPct}%`,
                    borderRadius: "6px 6px 2px 2px",
                    backgroundColor: band.color,
                    backgroundImage: idx === 0
                      ? "linear-gradient(180deg, #FF783D 0%, #EA580C 100%)"
                      : idx === 1
                      ? "linear-gradient(180deg, #818CF8 0%, #6366F1 100%)"
                      : "none",
                    opacity: isHovered ? 1 : 0.88,
                    transform: isHovered ? "scaleY(1.04)" : "none",
                    transformOrigin: "bottom",
                    transition: "all var(--transition-fast)",
                    boxShadow: isHovered ? `0 0 12px ${band.color}40` : "none",
                  }} />

                  {/* Count label on top of bar */}
                  <span style={{
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    color: "var(--text-primary)",
                    marginTop: "0.35rem",
                  }}>
                    {band.count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend / X-Axis */}
        <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "0.65rem" }}>
          {bands.map((band) => (
            <div key={band.label} style={{ flex: 1, textAlign: "center" }}>
              <span style={{ fontSize: "0.72rem", color: "var(--text-secondary)", fontWeight: 500 }}>
                {band.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right Chart: Donut Breakdown (Nexus "Sales Distribution" style) ── */}
      <div className="nexus-card" style={{ padding: "1.25rem 1.5rem", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div>
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.85rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.45rem" }}>
              <span style={{ fontSize: "0.85rem" }}>🎯</span>
              <span style={{ fontSize: "0.88rem", fontWeight: 700, color: "var(--text-primary)" }}>
                Core Problem Distribution
              </span>
            </div>
            <span style={{
              fontSize: "0.72rem",
              padding: "0.2rem 0.5rem",
              borderRadius: "var(--radius-sm)",
              backgroundColor: "var(--bg-surface-elevated)",
              border: "1px solid var(--border-subtle)",
              color: "var(--text-secondary)",
            }}>
              Monthly ▾
            </span>
          </div>

          {/* Metric Figures Row */}
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
            <div>
              <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#6366F1" }} />
                Water Ingress
              </div>
              <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)", marginTop: "2px" }}>
                {seepPct}%
              </div>
            </div>

            <div>
              <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#06B6D4" }} />
                Mix & Silo
              </div>
              <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)", marginTop: "2px" }}>
                {mixPct}%
              </div>
            </div>

            <div>
              <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#94A3B8" }} />
                Other / Gen
              </div>
              <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)", marginTop: "2px" }}>
                {genPct}%
              </div>
            </div>
          </div>
        </div>

        {/* Donut Chart SVG */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", position: "relative", height: "135px" }}>
          <svg width="135" height="135" viewBox="0 0 140 140" style={{ transform: "rotate(-90deg)" }}>
            {/* Background ring */}
            <circle
              cx="70"
              cy="70"
              r={radius}
              stroke="var(--bg-surface-elevated)"
              strokeWidth="14"
              fill="none"
            />
            {/* Segment 1: Water Ingress (#6366F1) */}
            <circle
              cx="70"
              cy="70"
              r={radius}
              stroke="#6366F1"
              strokeWidth="14"
              strokeDasharray={`${stroke1} ${circumference}`}
              strokeDashoffset="0"
              fill="none"
              strokeLinecap="round"
            />
            {/* Segment 2: Mix & Silo (#06B6D4) */}
            <circle
              cx="70"
              cy="70"
              r={radius}
              stroke="#06B6D4"
              strokeWidth="14"
              strokeDasharray={`${stroke2} ${circumference}`}
              strokeDashoffset={`-${stroke1}`}
              fill="none"
              strokeLinecap="round"
            />
            {/* Segment 3: General (#94A3B8) */}
            <circle
              cx="70"
              cy="70"
              r={radius}
              stroke="#94A3B8"
              strokeWidth="14"
              strokeDasharray={`${stroke3} ${circumference}`}
              strokeDashoffset={`-${stroke1 + stroke2}`}
              fill="none"
              strokeLinecap="round"
            />
          </svg>

          {/* Center text inside Donut */}
          <div style={{
            position: "absolute",
            textAlign: "center",
          }}>
            <div style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text-primary)" }}>
              {calls.length}
            </div>
            <div style={{ fontSize: "0.62rem", color: "var(--text-muted)", letterSpacing: "0.02em" }}>
              Total Cases
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
