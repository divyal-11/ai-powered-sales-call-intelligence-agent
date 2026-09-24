"use client";

import { useTheme } from "../lib/theme";

interface TopNavProps {
  onOpenUpload: () => void;
  searchValue: string;
  onSearchChange: (val: string) => void;
  totalCallsCount?: number;
}

export default function TopNav({
  onOpenUpload,
  searchValue,
  onSearchChange,
  totalCallsCount = 0,
}: TopNavProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header style={{
      height: "64px",
      padding: "0 2rem",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      borderBottom: "1px solid var(--border-subtle)",
      backgroundColor: "var(--bg-surface)",
      flexShrink: 0,
      position: "sticky",
      top: 0,
      zIndex: 25,
      transition: "background-color var(--transition-normal), border-color var(--transition-normal)",
    }}>
      {/* Left: Global Search (Nexus style) */}
      <div style={{ position: "relative", width: "100%", maxWidth: "380px" }}>
        <svg
          width="16"
          height="16"
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
          placeholder="Search accounts, pain points, objections..."
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          style={{
            width: "100%",
            backgroundColor: "var(--bg-surface-elevated)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-md)",
            padding: "0.55rem 3.2rem 0.55rem 2.4rem",
            color: "var(--text-primary)",
            fontSize: "0.82rem",
            fontFamily: "var(--font-sans)",
            outline: "none",
            transition: "border-color var(--transition-fast), box-shadow var(--transition-fast), background-color var(--transition-normal)",
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "var(--accent-primary)";
            e.currentTarget.style.boxShadow = "0 0 0 2px var(--accent-primary-muted)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "var(--border-subtle)";
            e.currentTarget.style.boxShadow = "none";
          }}
        />

        <div style={{
          position: "absolute",
          right: "0.65rem",
          top: "50%",
          transform: "translateY(-50%)",
          display: "flex",
          alignItems: "center",
          gap: "0.2rem",
          fontSize: "0.68rem",
          color: "var(--text-muted)",
          backgroundColor: "var(--bg-surface)",
          border: "1px solid var(--border-subtle)",
          padding: "0.15rem 0.35rem",
          borderRadius: "var(--radius-xs)",
          pointerEvents: "none",
        }}>
          <span>⌘</span>
          <span>F</span>
        </div>
      </div>

      {/* Right: Actions, Theme Toggle, Profile */}
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        {/* Live Engine Indicator */}
        <div style={{
          display: "none",
          alignItems: "center",
          gap: "0.45rem",
          padding: "0.3rem 0.7rem",
          borderRadius: "var(--radius-full)",
          backgroundColor: "var(--accent-emerald-bg)",
          border: "1px solid rgba(16, 185, 129, 0.2)",
        }}
        className="md-flex"
        >
          <span className="indicator-pulse" style={{
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            backgroundColor: "var(--accent-green)",
          }} />
          <span style={{ fontSize: "0.7rem", fontWeight: 600, color: "var(--accent-emerald-text)" }}>
            Engine Active
          </span>
        </div>

        {/* Light / Dark Mode Toggle */}
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
          {theme === "light" ? (
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          ) : (
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

        {/* Notifications Icon (Nexus style) */}
        <div style={{
          width: "36px",
          height: "36px",
          borderRadius: "var(--radius-md)",
          backgroundColor: "var(--bg-surface-elevated)",
          border: "1px solid var(--border-subtle)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--text-secondary)",
          cursor: "pointer",
          position: "relative",
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          <span style={{
            position: "absolute",
            top: "7px",
            right: "7px",
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            backgroundColor: "var(--accent-orange)",
          }} />
        </div>

        <div style={{
          width: "1px",
          height: "22px",
          backgroundColor: "var(--border-subtle)",
        }} />

        {/* User Profile Chip (Nexus style) */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "0.6rem",
          cursor: "pointer",
          padding: "0.25rem 0.5rem",
          borderRadius: "var(--radius-md)",
          transition: "background-color var(--transition-fast)",
        }}>
          <div style={{
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            backgroundColor: "var(--accent-primary-gradient)",
            backgroundImage: "var(--accent-primary-gradient)",
            color: "#FFFFFF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 700,
            fontSize: "0.8rem",
            boxShadow: "0 2px 5px rgba(99, 102, 241, 0.2)",
          }}>
            YA
          </div>
          <div>
            <div style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--text-primary)", lineHeight: 1.1 }}>
              Young Alaska
            </div>
            <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", marginTop: "1px" }}>
              Enterprise Lead
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
