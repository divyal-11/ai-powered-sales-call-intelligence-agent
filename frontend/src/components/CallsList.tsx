"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TranscriptListItem } from "../types";

interface CallsListProps {
  calls: TranscriptListItem[];
  externalSearch?: string;
}

export default function CallsList({ calls, externalSearch = "" }: CallsListProps) {
  const [localSearch, setLocalSearch] = useState("");
  const [filterTier, setFilterTier] = useState<"ALL" | "HOT" | "WARM" | "COLD">("ALL");
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const router = useRouter();

  const activeSearch = externalSearch || localSearch;

  const filteredCalls = calls.filter((c) => {
    const company = c.sourceMeta?.company?.toLowerCase() || "";
    const prospect = c.sourceMeta?.prospect?.toLowerCase() || "";
    const problem = c.callInsight?.customerProblem?.toLowerCase() || "";
    const nextStep = c.callInsight?.nextStep?.toLowerCase() || "";
    const matchesSearch =
      company.includes(activeSearch.toLowerCase()) ||
      prospect.includes(activeSearch.toLowerCase()) ||
      problem.includes(activeSearch.toLowerCase()) ||
      nextStep.includes(activeSearch.toLowerCase());

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
    <div style={{ padding: "0 2rem 2rem 2rem" }}>
      <div className="nexus-card" style={{ overflow: "hidden" }}>
        {/* Table Card Header (Nexus "List of Integration" style) */}
        <div style={{
          padding: "1rem 1.5rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid var(--border-subtle)",
          backgroundColor: "var(--bg-surface)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <span style={{ fontSize: "0.95rem" }}>📑</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: "0.92rem", color: "var(--text-primary)" }}>
                Active Call Intelligence Pipeline
              </div>
              <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                Real-time lead qualification & objection radar
              </div>
            </div>
          </div>

          {/* Filter Pills with Counts */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "0.35rem",
            backgroundColor: "var(--bg-surface-elevated)",
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
                    gap: "0.35rem",
                    padding: "0.28rem 0.65rem",
                    backgroundColor: isActive ? "var(--bg-surface)" : "transparent",
                    border: isActive ? "1px solid var(--border-subtle)" : "1px solid transparent",
                    color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
                    borderRadius: "var(--radius-xs)",
                    cursor: "pointer",
                    fontSize: "0.75rem",
                    fontWeight: isActive ? 600 : 500,
                    fontFamily: "var(--font-sans)",
                    boxShadow: isActive ? "0 1px 2px rgba(0,0,0,0.05)" : "none",
                    transition: "all var(--transition-fast)",
                  }}
                >
                  <span>{label}</span>
                  <span style={{
                    fontSize: "0.65rem",
                    padding: "0.1rem 0.35rem",
                    borderRadius: "var(--radius-full)",
                    backgroundColor: isActive ? "var(--accent-primary-muted)" : "rgba(0,0,0,0.05)",
                    color: isActive ? "var(--accent-primary)" : "var(--text-muted)",
                    fontWeight: 600,
                  }}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Column Headers */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "260px 1fr 180px 110px 120px 80px",
          padding: "0.65rem 1.5rem",
          borderBottom: "1px solid var(--border-subtle)",
          backgroundColor: "var(--bg-surface-elevated)",
          alignItems: "center",
        }}>
          <span className="label-muted">ACCOUNT / PROSPECT</span>
          <span className="label-muted">DETECTED PAIN POINT</span>
          <span className="label-muted">BUYING INTENT</span>
          <span className="label-muted">LEAD TIER</span>
          <span className="label-muted">LEAD SCORE</span>
          <span className="label-muted" style={{ textAlign: "right" }}>DATE</span>
        </div>

        {/* Table Rows */}
        <div>
          {filteredCalls.length === 0 ? (
            <div style={{ textAlign: "center", padding: "4rem 2rem", color: "var(--text-secondary)" }}>
              <p style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--text-primary)" }}>No calls match your criteria</p>
              <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                Try searching for another account name, problem, or change the filter tab.
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
              const isHovered = hoveredId === c.id;

              return (
                <div
                  key={c.id}
                  onClick={() => router.push(`/calls/${c.id}`)}
                  onMouseEnter={() => setHoveredId(c.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "260px 1fr 180px 110px 120px 80px",
                    padding: "0.85rem 1.5rem",
                    borderBottom: "1px solid var(--border-subtle)",
                    cursor: "pointer",
                    backgroundColor: isHovered ? "var(--bg-hover)" : "transparent",
                    transition: "all var(--transition-fast)",
                    alignItems: "center",
                    gap: "0.75rem",
                  }}
                >
                  {/* Account / Prospect */}
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
                      color: isHot ? "var(--accent-orange)" : "var(--accent-primary)",
                      flexShrink: 0,
                    }}>
                      {initial}
                    </div>
                    <div style={{ minWidth: 0, overflow: "hidden" }}>
                      <div style={{
                        fontWeight: 600,
                        fontSize: "0.85rem",
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

                  {/* Detected Pain Point */}
                  <div style={{ minWidth: 0, paddingRight: "1rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                      {severity && (
                        <span style={{
                          fontSize: "0.62rem",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          padding: "0.1rem 0.4rem",
                          borderRadius: "var(--radius-xs)",
                          backgroundColor: severity === "high" ? "#FEE2E2" : "#FEF3C7",
                          color: severity === "high" ? "#DC2626" : "#D97706",
                          flexShrink: 0,
                        }}>
                          {severity}
                        </span>
                      )}
                      <span style={{
                        fontSize: "0.78rem",
                        color: problem ? "var(--text-primary)" : "var(--text-muted)",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}>
                        {problem || "No problem statement detected"}
                      </span>
                    </div>
                  </div>

                  {/* Buying Intent (with Nexus progress bar) */}
                  <div style={{ minWidth: 0, paddingRight: "0.5rem" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "3px" }}>
                      <span style={{ fontSize: "0.72rem", fontWeight: 600, color: "var(--text-secondary)" }}>
                        {buyingIntent ? buyingIntent.toUpperCase() : "INTENT"}
                      </span>
                      <span style={{ fontSize: "0.72rem", fontWeight: 600, color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>
                        {intentScore ?? (buyingIntent === "high" ? 85 : buyingIntent === "medium" ? 50 : 20)}%
                      </span>
                    </div>
                    <div style={{
                      width: "100%",
                      height: "4px",
                      borderRadius: "2px",
                      backgroundColor: "var(--bg-surface-elevated)",
                      overflow: "hidden",
                    }}>
                      <div style={{
                        width: `${intentScore ?? (buyingIntent === "high" ? 85 : buyingIntent === "medium" ? 50 : 20)}%`,
                        height: "100%",
                        backgroundColor: buyingIntent === "high" ? "var(--accent-orange)" : "var(--accent-primary)",
                        borderRadius: "2px",
                      }} />
                    </div>
                  </div>

                  {/* Lead Tier */}
                  <div>
                    <span style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.35rem",
                      padding: "0.18rem 0.55rem",
                      borderRadius: "var(--radius-full)",
                      backgroundColor: tierBg,
                      border: `1px solid ${tierBorder}`,
                      fontSize: "0.72rem",
                      fontWeight: 600,
                      color: tierColor,
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

                  {/* Lead Score */}
                  <div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: "0.25rem" }}>
                      <span style={{
                        fontSize: "0.92rem",
                        fontWeight: 700,
                        color: tierColor,
                        fontFamily: "var(--font-mono)",
                      }}>
                        {score}
                      </span>
                      <span style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>/ 100</span>
                    </div>
                  </div>

                  {/* Date & Hover Arrow */}
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-end",
                    gap: "0.4rem",
                  }}>
                    <span style={{ fontSize: "0.74rem", color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                      {new Date(c.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                    <span style={{
                      fontSize: "0.85rem",
                      color: isHovered ? "var(--accent-primary)" : "var(--text-muted)",
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
    </div>
  );
}
