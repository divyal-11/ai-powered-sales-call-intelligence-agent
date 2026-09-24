"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TranscriptListItem } from "../types";

interface CallsListProps {
  calls: TranscriptListItem[];
}

export default function CallsList({ calls }: CallsListProps) {
  const [search, setSearch] = useState("");
  const [filterTier, setFilterTier] = useState<"ALL" | "HOT" | "WARM" | "COLD">("ALL");
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const router = useRouter();

  const filteredCalls = calls.filter((c) => {
    const company = c.sourceMeta?.company?.toLowerCase() || "";
    const prospect = c.sourceMeta?.prospect?.toLowerCase() || "";
    const problem = c.callInsight?.customerProblem?.toLowerCase() || "";
    const nextStep = c.callInsight?.nextStep?.toLowerCase() || "";
    const matchesSearch =
      company.includes(search.toLowerCase()) ||
      prospect.includes(search.toLowerCase()) ||
      problem.includes(search.toLowerCase()) ||
      nextStep.includes(search.toLowerCase());

    const score = c.callInsight?.leadScore ?? 0;
    if (filterTier === "HOT") return matchesSearch && score >= 75;
    if (filterTier === "WARM") return matchesSearch && score >= 40 && score < 75;
    if (filterTier === "COLD") return matchesSearch && score < 40;
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
    { key: "HOT", label: "Hot", count: hotCount },
    { key: "WARM", label: "Warm", count: warmCount },
    { key: "COLD", label: "Cold", count: coldCount },
  ];

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
      {/* Search and Filters Toolbar */}
      <div style={{
        padding: "0.85rem 2rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: "1px solid var(--border-subtle)",
        backgroundColor: "rgba(17, 19, 24, 0.4)",
      }}>
        {/* Search */}
        <div style={{ position: "relative", width: "100%", maxWidth: "340px" }}>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--text-muted)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              position: "absolute",
              left: "0.8rem",
              top: "50%",
              transform: "translateY(-50%)",
              pointerEvents: "none",
            }}
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Filter by company, prospect, pain point..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              backgroundColor: "var(--bg-surface)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-sm)",
              padding: "0.48rem 0.8rem 0.48rem 2.2rem",
              color: "var(--text-primary)",
              fontSize: "0.8rem",
              fontFamily: "var(--font-sans)",
              outline: "none",
              transition: "border-color var(--transition-fast), box-shadow var(--transition-fast)",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "var(--accent-orange)";
              e.currentTarget.style.boxShadow = "0 0 0 2px var(--accent-orange-muted)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "var(--border-subtle)";
              e.currentTarget.style.boxShadow = "none";
            }}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              style={{
                position: "absolute",
                right: "0.6rem",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                color: "var(--text-muted)",
                cursor: "pointer",
                fontSize: "0.8rem",
                padding: "2px",
              }}
            >
              ✕
            </button>
          )}
        </div>

        {/* Filter Pills with Counts */}
        <div style={{
          display: "flex",
          gap: "0.35rem",
          backgroundColor: "var(--bg-surface)",
          padding: "0.2rem",
          borderRadius: "var(--radius-sm)",
          border: "1px solid var(--border-subtle)",
        }}>
          {tierFilters.map(({ key, label, count }) => {
            const isActive = filterTier === key;
            return (
              <button
                key={key}
                onClick={() => setFilterTier(key)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  padding: "0.3rem 0.75rem",
                  backgroundColor: isActive ? "var(--bg-surface-elevated)" : "transparent",
                  border: isActive ? "1px solid var(--border-medium)" : "1px solid transparent",
                  color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
                  borderRadius: "var(--radius-xs)",
                  cursor: "pointer",
                  fontSize: "0.75rem",
                  fontWeight: isActive ? 600 : 400,
                  fontFamily: "var(--font-sans)",
                  transition: "all var(--transition-fast)",
                }}
              >
                <span>{label}</span>
                <span style={{
                  fontSize: "0.65rem",
                  padding: "0.1rem 0.35rem",
                  borderRadius: "var(--radius-full)",
                  backgroundColor: isActive ? "rgba(255, 255, 255, 0.1)" : "rgba(255, 255, 255, 0.04)",
                  color: isActive ? "var(--text-primary)" : "var(--text-muted)",
                }}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Table Header */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "260px 1fr 220px 100px 140px 85px",
        padding: "0.65rem 2rem",
        borderBottom: "1px solid var(--border-subtle)",
        backgroundColor: "rgba(10, 11, 14, 0.6)",
        alignItems: "center",
      }}>
        <span className="label-muted">ACCOUNT / PROSPECT</span>
        <span className="label-muted">DETECTED PAIN POINT & SEVERITY</span>
        <span className="label-muted">INTENT & NEXT STEP</span>
        <span className="label-muted">TIER</span>
        <span className="label-muted">LEAD SCORE</span>
        <span className="label-muted" style={{ textAlign: "right" }}>DATE</span>
      </div>

      {/* Call Rows List */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {filteredCalls.length === 0 ? (
          <div style={{
            textAlign: "center",
            padding: "5rem 2rem",
            color: "var(--text-secondary)",
          }}>
            <div style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              backgroundColor: "var(--bg-surface)",
              border: "1px solid var(--border-subtle)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1rem",
              color: "var(--text-muted)",
            }}>
              🔍
            </div>
            <p style={{ fontSize: "0.9rem", fontWeight: 500, color: "var(--text-primary)" }}>No matching calls found</p>
            <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
              Try adjusting your search terms or filter criteria.
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
            const buyingIntent = c.callInsight?.buyingIntent;
            const intentScore = c.callInsight?.buyingIntentScore;
            const nextStep = c.callInsight?.nextStep;
            const isHovered = hoveredId === c.id;

            return (
              <div
                key={c.id}
                onClick={() => router.push(`/calls/${c.id}`)}
                onMouseEnter={() => setHoveredId(c.id)}
                onMouseLeave={() => setHoveredId(null)}
                style={{
                  display: "grid",
                  gridTemplateColumns: "260px 1fr 220px 100px 140px 85px",
                  padding: "0.95rem 2rem",
                  borderBottom: "1px solid var(--border-subtle)",
                  cursor: "pointer",
                  backgroundColor: isHovered ? "var(--bg-surface-elevated)" : "transparent",
                  borderLeft: isHovered ? "3px solid var(--accent-orange)" : "3px solid transparent",
                  transition: "all var(--transition-fast)",
                  alignItems: "center",
                  gap: "0.75rem",
                }}
              >
                {/* 1. Account & Prospect */}
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", minWidth: 0 }}>
                  <div style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "var(--radius-sm)",
                    backgroundColor: "var(--bg-surface)",
                    border: "1px solid var(--border-subtle)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    color: isHot ? "var(--accent-orange)" : "var(--text-primary)",
                    flexShrink: 0,
                    boxShadow: isHot ? "0 0 10px rgba(249, 87, 22, 0.15)" : "none",
                  }}>
                    {initial}
                  </div>
                  <div style={{ minWidth: 0, overflow: "hidden" }}>
                    <div style={{
                      fontWeight: 600,
                      fontSize: "0.88rem",
                      color: "var(--text-primary)",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}>
                      {company}
                    </div>
                    <div style={{
                      fontSize: "0.74rem",
                      color: "var(--text-secondary)",
                      marginTop: "2px",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}>
                      {prospect}
                    </div>
                  </div>
                </div>

                {/* 2. Detected Pain Point & Severity */}
                <div style={{ minWidth: 0, paddingRight: "1rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.45rem", marginBottom: "3px" }}>
                    {severity && (
                      <span style={{
                        fontSize: "0.62rem",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.04em",
                        padding: "0.1rem 0.45rem",
                        borderRadius: "var(--radius-xs)",
                        backgroundColor: severity === "high" ? "rgba(239, 68, 68, 0.15)" : "rgba(245, 158, 11, 0.15)",
                        border: `1px solid ${severity === "high" ? "rgba(239, 68, 68, 0.3)" : "rgba(245, 158, 11, 0.3)"}`,
                        color: severity === "high" ? "#FCA5A5" : "#FCD34D",
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
                      lineHeight: 1.3,
                    }}>
                      {problem || "No explicit customer problem logged"}
                    </span>
                  </div>
                </div>

                {/* 3. Intent & Next Step */}
                <div style={{ minWidth: 0, paddingRight: "0.5rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <span style={{
                      fontSize: "0.72rem",
                      fontWeight: 600,
                      color: buyingIntent === "high" ? "var(--accent-orange)" : "var(--text-secondary)",
                    }}>
                      {buyingIntent ? `${buyingIntent.toUpperCase()} INTENT` : "INTENT PENDING"}
                    </span>
                    {intentScore !== null && intentScore !== undefined && (
                      <span style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>
                        ({intentScore}%)
                      </span>
                    )}
                  </div>
                  <div style={{
                    fontSize: "0.72rem",
                    color: nextStep ? "var(--text-secondary)" : "var(--text-muted)",
                    marginTop: "2px",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}>
                    {nextStep ? `↳ ${nextStep}` : "↳ No next step recorded"}
                  </div>
                </div>

                {/* 4. Tier Badge */}
                <div>
                  <span style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.35rem",
                    padding: "0.22rem 0.65rem",
                    borderRadius: "var(--radius-full)",
                    backgroundColor: tierBg,
                    border: `1px solid ${tierBorder}`,
                    fontSize: "0.72rem",
                    fontWeight: 600,
                    color: tierColor,
                    letterSpacing: "0.02em",
                  }}>
                    <span style={{
                      width: "5px",
                      height: "5px",
                      borderRadius: "50%",
                      backgroundColor: tierColor,
                    }} />
                    {tierLabel}
                  </span>
                </div>

                {/* 5. Lead Score with Visual Progress Meter */}
                <div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "0.25rem", marginBottom: "4px" }}>
                    <span style={{
                      fontSize: "0.95rem",
                      fontWeight: 700,
                      color: tierColor,
                      fontFamily: "var(--font-mono)",
                    }}>
                      {score}
                    </span>
                    <span style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>/ 100</span>
                  </div>
                  {/* Mini Progress Bar */}
                  <div style={{
                    width: "80px",
                    height: "4px",
                    borderRadius: "2px",
                    backgroundColor: "rgba(255, 255, 255, 0.08)",
                    overflow: "hidden",
                  }}>
                    <div style={{
                      width: `${Math.min(score, 100)}%`,
                      height: "100%",
                      backgroundColor: tierColor,
                      borderRadius: "2px",
                      boxShadow: isHot ? "0 0 6px rgba(249, 87, 22, 0.4)" : "none",
                    }} />
                  </div>
                </div>

                {/* 6. Date & Arrow */}
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  gap: "0.5rem",
                }}>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", whiteSpace: "nowrap" }}>
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
