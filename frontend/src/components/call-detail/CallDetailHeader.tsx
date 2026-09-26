"use client";

import { useRouter } from "next/navigation";
import { FullTranscriptDetail } from "../../types";
import { useTheme } from "../../lib/theme";

interface CallDetailHeaderProps {
  detail: FullTranscriptDetail;
  copied: boolean;
  onCopyEmail: () => void;
  hasEmail: boolean;
}

export default function CallDetailHeader({
  detail,
  copied,
  onCopyEmail,
  hasEmail,
}: CallDetailHeaderProps) {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

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

  const company = detail.sourceMeta?.company || "Unknown Company";
  const initial = company.charAt(0).toUpperCase();

  // Circular score gauge calculation
  const circleRadius = 18;
  const circleCircumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset = circleCircumference - (Math.min(score, 100) / 100) * circleCircumference;

  return (
    <header style={{
      position: "sticky",
      top: 0,
      zIndex: 30,
      height: "60px",
      backgroundColor: "var(--bg-surface)",
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
        {/* Theme Toggle */}
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
        {hasEmail && (
          <button
            onClick={onCopyEmail}
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
                stroke="var(--border-medium)"
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
  );
}
