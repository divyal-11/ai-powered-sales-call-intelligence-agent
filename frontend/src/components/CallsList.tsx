"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TranscriptListItem } from "../types";

interface CallsListProps {
  calls: TranscriptListItem[];
  externalSearch?: string;
  filterTier?: "ALL" | "HOT" | "WARM" | "COLD";
  onFilterChange?: (tier: "ALL" | "HOT" | "WARM" | "COLD") => void;
}

export default function CallsList({
  calls,
  externalSearch = "",
  filterTier = "ALL",
  onFilterChange,
}: CallsListProps) {
  const [internalFilterTier, setInternalFilterTier] = useState<"ALL" | "HOT" | "WARM" | "COLD">("ALL");
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const router = useRouter();

  const currentTier = onFilterChange ? filterTier : internalFilterTier;
  const setTier = onFilterChange || setInternalFilterTier;

  const filteredCalls = calls.filter((c) => {
    const company = c.sourceMeta?.company?.toLowerCase() || "";
    const prospect = c.sourceMeta?.prospect?.toLowerCase() || "";
    const problem = c.callInsight?.customerProblem?.toLowerCase() || "";
    const matchesSearch =
      company.includes(externalSearch.toLowerCase()) ||
      prospect.includes(externalSearch.toLowerCase()) ||
      problem.includes(externalSearch.toLowerCase());

    const score = c.callInsight?.leadScore ?? 0;
    if (currentTier === "HOT") return matchesSearch && score >= 75;
    if (currentTier === "WARM") return matchesSearch && score >= 40 && score < 75;
    if (currentTier === "COLD") return matchesSearch && score < 40;
    return matchesSearch;
  });

  const hotCount = calls.filter((c) => (c.callInsight?.leadScore ?? 0) >= 75).length;
  const warmCount = calls.filter((c) => {
    const s = c.callInsight?.leadScore ?? 0;
    return s >= 40 && s < 75;
  }).length;
  const coldCount = calls.filter((c) => (c.callInsight?.leadScore ?? 0) < 40).length;

  const tierFilters: Array<{ key: "ALL" | "HOT" | "WARM" | "COLD"; label: string; count: number }> = [
    { key: "ALL", label: "All Calls", count: calls.length },
    { key: "HOT", label: "Hot Leads", count: hotCount },
    { key: "WARM", label: "Warm Leads", count: warmCount },
    { key: "COLD", label: "Cold", count: coldCount },
  ];

  return (
    <div style={{
      backgroundColor: "var(--bg-surface)",
      border: "1px solid var(--border-subtle)",
      borderRadius: "var(--radius-md)",
      boxShadow: "var(--shadow-card)",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
    }}>
      {/* Tier Filter Tabs Toolbar */}
      <div style={{
        padding: "0.75rem 1.5rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: "1px solid var(--border-subtle)",
        backgroundColor: "var(--bg-surface)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
          {tierFilters.map(({ key, label, count }) => {
            const isActive = currentTier === key;
            return (
              <button
                key={key}
                onClick={() => setTier(key)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.35rem",
                  padding: "0.3rem 0.75rem",
                  backgroundColor: isActive ? "var(--bg-surface-elevated)" : "transparent",
                  border: isActive ? "1px solid var(--border-medium)" : "1px solid transparent",
                  color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
                  borderRadius: "var(--radius-sm)",
                  cursor: "pointer",
                  fontSize: "0.76rem",
                  fontWeight: isActive ? 600 : 500,
                  fontFamily: "var(--font-sans)",
                  transition: "all var(--transition-fast)",
                }}
              >
                <span>{label}</span>
                <span style={{
                  fontSize: "0.65rem",
                  padding: "0.1rem 0.35rem",
                  borderRadius: "var(--radius-full)",
                  backgroundColor: isActive ? "var(--accent-orange-muted)" : "var(--bg-hover)",
                  color: isActive ? "var(--accent-orange)" : "var(--text-muted)",
                  fontWeight: 600,
                }}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
          {filteredCalls.length} of {calls.length} calls
        </span>
      </div>

      {/* Table Column Headers (4 Clean Focused Columns) */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "280px 1fr 140px 95px",
        padding: "0.6rem 1.5rem",
        borderBottom: "1px solid var(--border-subtle)",
        backgroundColor: "var(--bg-surface-elevated)",
        alignItems: "center",
      }}>
        <span className="label-muted">COMPANY NAME</span>
        <span className="label-muted">KEY TOPIC</span>
        <span className="label-muted">LEAD SCORE</span>
        <span className="label-muted" style={{ textAlign: "right" }}>DATE</span>
      </div>

      {/* Rows Container */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {filteredCalls.length === 0 ? (
          <div style={{ textAlign: "center", padding: "4rem 2rem", color: "var(--text-secondary)" }}>
            <p style={{ fontSize: "0.88rem", fontWeight: 600, color: "var(--text-primary)" }}>
              No calls match your criteria
            </p>
            <p style={{ fontSize: "0.76rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
              {externalSearch ? `No matches found for "${externalSearch}".` : "No calls logged in this filter."}
            </p>
          </div>
        ) : (
          filteredCalls.map((c) => {
            const score = c.callInsight?.leadScore ?? 0;
            const isHot = score >= 75;
            const isWarm = score >= 40 && score < 75;
            const tierLabel = isHot ? "Hot" : isWarm ? "Warm" : "Cold";
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

            const company = c.sourceMeta?.company || "Unknown Company";
            const initial = company.charAt(0).toUpperCase();
            const prospect = c.sourceMeta?.prospect || "Unspecified Contact";
            const problem = c.callInsight?.customerProblem;
            const severity = c.callInsight?.severity;
            const isHovered = hoveredId === c.id;

            return (
              <div
                key={c.id}
                onClick={() => router.push(`/calls/${c.id}`)}
                onMouseEnter={() => setHoveredId(c.id)}
                onMouseLeave={() => setHoveredId(null)}
                style={{
                  display: "grid",
                  gridTemplateColumns: "280px 1fr 140px 95px",
                  padding: "0.85rem 1.5rem",
                  borderBottom: "1px solid var(--border-subtle)",
                  cursor: "pointer",
                  backgroundColor: isHovered ? "var(--bg-hover)" : "transparent",
                  borderLeft: isHovered ? "3px solid var(--accent-orange)" : "3px solid transparent",
                  transition: "all var(--transition-fast)",
                  alignItems: "center",
                  gap: "1rem",
                }}
              >
                {/* 1. COMPANY NAME */}
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", minWidth: 0 }}>
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
                    fontSize: "0.82rem",
                    color: isHot ? "var(--accent-orange)" : "var(--text-primary)",
                    flexShrink: 0,
                  }}>
                    {initial}
                  </div>
                  <div style={{ minWidth: 0, overflow: "hidden" }}>
                    <div style={{
                      fontWeight: 600,
                      fontSize: "0.86rem",
                      color: "var(--text-primary)",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}>
                      {company}
                    </div>
                    <div style={{
                      fontSize: "0.72rem",
                      color: "var(--text-secondary)",
                      marginTop: "1px",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}>
                      {prospect}
                    </div>
                  </div>
                </div>

                {/* 2. KEY TOPIC */}
                <div style={{ minWidth: 0, paddingRight: "1rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.45rem" }}>
                    {severity && (
                      <span style={{
                        fontSize: "0.62rem",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.04em",
                        padding: "0.12rem 0.45rem",
                        borderRadius: "var(--radius-xs)",
                        backgroundColor: severity === "high" ? "#FEE2E2" : "#FEF3C7",
                        color: severity === "high" ? "#DC2626" : "#D97706",
                        flexShrink: 0,
                      }}>
                        {severity}
                      </span>
                    )}
                    <span style={{
                      fontSize: "0.8rem",
                      color: problem ? "var(--text-primary)" : "var(--text-muted)",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      lineHeight: 1.35,
                    }}>
                      {problem || "General discovery call"}
                    </span>
                  </div>
                </div>

                {/* 3. LEAD SCORE */}
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.45rem", marginBottom: "4px" }}>
                    <span style={{
                      fontSize: "0.92rem",
                      fontWeight: 700,
                      color: tierColor,
                      fontFamily: "var(--font-mono)",
                    }}>
                      {score}
                    </span>
                    <span style={{
                      fontSize: "0.65rem",
                      fontWeight: 600,
                      padding: "0.1rem 0.4rem",
                      borderRadius: "var(--radius-full)",
                      backgroundColor: tierBg,
                      border: `1px solid ${tierBorder}`,
                      color: tierColor,
                    }}>
                      {tierLabel}
                    </span>
                  </div>
                  <div style={{
                    width: "70px",
                    height: "3.5px",
                    borderRadius: "2px",
                    backgroundColor: "var(--bg-surface-elevated)",
                    overflow: "hidden",
                  }}>
                    <div style={{
                      width: `${Math.min(score, 100)}%`,
                      height: "100%",
                      backgroundColor: tierColor,
                      borderRadius: "2px",
                    }} />
                  </div>
                </div>

                {/* 4. DATE */}
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  gap: "0.45rem",
                }}>
                  <span style={{ fontSize: "0.74rem", color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                    {new Date(c.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                  <span style={{
                    fontSize: "0.85rem",
                    color: isHovered ? "var(--accent-orange)" : "var(--text-muted)",
                    transform: isHovered ? "translateX(2px)" : "none",
                    transition: "all var(--transition-fast)",
                  }}>
                    →
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
