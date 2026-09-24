"use client";

import Image from "next/image";
import Link from "next/link";
import { useTheme } from "../lib/theme";

interface HeaderProps {
  onOpenUpload: () => void;
  search?: string;
  onSearchChange?: (val: string) => void;
}

export default function Header({
  onOpenUpload,
  search = "",
  onSearchChange,
}: HeaderProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header style={{
      padding: "0 1.5rem",
      height: "58px",
      backgroundColor: "var(--bg-surface)",
      borderBottom: "1px solid var(--border-subtle)",
      position: "sticky",
      top: 0,
      zIndex: 30,
      flexShrink: 0,
      transition: "background-color var(--transition-normal), border-color var(--transition-normal)",
    }}>
      <div style={{
        maxWidth: "1140px",
        margin: "0 auto",
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
      {/* Brand Identity */}
      <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <div style={{
          width: "30px",
          height: "30px",
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
            width={22}
            height={22}
            style={{ objectFit: "contain" }}
          />
        </div>
        <div>
          <div style={{
            fontWeight: 700,
            fontSize: "0.9rem",
            letterSpacing: "0.04em",
            color: "var(--text-primary)",
            lineHeight: 1.1,
          }}>
            STONEFORGE
          </div>
          <div style={{
            fontSize: "0.68rem",
            color: "var(--text-secondary)",
            letterSpacing: "0.02em",
            marginTop: "1px",
          }}>
            Sales Call Intelligence
          </div>
        </div>
      </Link>

      {/* Real Search Bar */}
      {onSearchChange && (
        <div style={{ position: "relative", width: "100%", maxWidth: "360px" }}>
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--text-muted)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              position: "absolute",
              left: "0.85rem",
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
            placeholder="Search accounts, pain points, contacts..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            style={{
              width: "100%",
              backgroundColor: "var(--bg-surface-elevated)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-md)",
              padding: "0.48rem 2.2rem 0.48rem 2.3rem",
              color: "var(--text-primary)",
              fontSize: "0.82rem",
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
              onClick={() => onSearchChange("")}
              style={{
                position: "absolute",
                right: "0.6rem",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                color: "var(--text-muted)",
                cursor: "pointer",
                fontSize: "0.75rem",
                padding: "2px",
              }}
            >
              ✕
            </button>
          )}
        </div>
      )}

      {/* Right Controls: Theme Toggle & + Analyze Call */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
        {/* Theme Switcher Button */}
        <button
          onClick={toggleTheme}
          title={`Switch to ${theme === "light" ? "Dark" : "Light"} Mode`}
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "var(--radius-md)",
            backgroundColor: "var(--bg-surface-elevated)",
            border: "1px solid var(--border-subtle)",
            color: "var(--text-secondary)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "0.95rem",
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
          {theme === "light" ? "🌙" : "☀️"}
        </button>

        {/* Primary CTA */}
        <button
          onClick={onOpenUpload}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.45rem",
            backgroundColor: "var(--accent-orange)",
            color: "#FFFFFF",
            fontWeight: 600,
            fontSize: "0.82rem",
            padding: "0.48rem 1rem",
            border: "none",
            borderRadius: "var(--radius-sm)",
            cursor: "pointer",
            fontFamily: "var(--font-sans)",
            letterSpacing: "0.01em",
            boxShadow: "0 2px 8px var(--accent-orange-glow)",
            transition: "background-color var(--transition-fast), transform var(--transition-fast)",
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
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Analyze Call
        </button>
      </div>
    </div>
  </header>
  );
}
