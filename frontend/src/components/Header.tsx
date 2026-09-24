"use client";

import Image from "next/image";

interface HeaderProps {
  onOpenUpload: () => void;
}

export default function Header({ onOpenUpload }: HeaderProps) {
  return (
    <header style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 2rem",
      height: "58px",
      backgroundColor: "rgba(9, 10, 13, 0.8)",
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
      borderBottom: "1px solid var(--border-subtle)",
      position: "sticky",
      top: 0,
      zIndex: 40,
      flexShrink: 0,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{
            width: "28px",
            height: "28px",
            borderRadius: "var(--radius-sm)",
            backgroundColor: "var(--bg-surface-elevated)",
            border: "1px solid var(--border-subtle)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}>
            <Image
              src="/logo.webp"
              alt="StoneForge Logo"
              width={20}
              height={20}
              style={{ objectFit: "contain" }}
            />
          </div>
          <div>
            <div style={{
              fontWeight: 700,
              fontSize: "0.85rem",
              letterSpacing: "0.05em",
              color: "var(--text-primary)",
              lineHeight: 1.1,
            }}>
              STONEFORGE
            </div>
            <div style={{
              fontSize: "0.68rem",
              color: "var(--text-secondary)",
              letterSpacing: "0.04em",
              lineHeight: 1,
              marginTop: "2px",
            }}>
              Sales Intelligence OS
            </div>
          </div>
        </div>

        <div style={{
          width: "1px",
          height: "22px",
          backgroundColor: "var(--border-subtle)",
          margin: "0 0.25rem",
        }} />

        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.45rem",
          padding: "0.2rem 0.6rem",
          backgroundColor: "rgba(16, 185, 129, 0.08)",
          border: "1px solid rgba(16, 185, 129, 0.22)",
          borderRadius: "var(--radius-full)",
        }}>
          <span className="indicator-pulse" style={{
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            backgroundColor: "var(--accent-green)",
            boxShadow: "0 0 8px rgba(16, 185, 129, 0.6)",
          }} />
          <span style={{
            fontSize: "0.68rem",
            fontWeight: 500,
            color: "#34D399",
            letterSpacing: "0.02em",
          }}>
            AI Grounding Engine Active
          </span>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <button
          onClick={onOpenUpload}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.45rem",
            backgroundColor: "var(--accent-orange)",
            backgroundImage: "linear-gradient(180deg, rgba(255,255,255,0.12) 0%, rgba(0,0,0,0.08) 100%)",
            color: "#FFFFFF",
            fontWeight: 600,
            fontSize: "0.8rem",
            padding: "0.45rem 1rem",
            border: "1px solid var(--accent-orange-border)",
            borderRadius: "var(--radius-sm)",
            cursor: "pointer",
            fontFamily: "var(--font-sans)",
            letterSpacing: "0.01em",
            boxShadow: "0 2px 8px var(--accent-orange-glow)",
            transition: "all var(--transition-fast)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "var(--accent-orange-hover)";
            e.currentTarget.style.transform = "translateY(-1px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "var(--accent-orange)";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Analyze Call
        </button>
      </div>
    </header>
  );
}
