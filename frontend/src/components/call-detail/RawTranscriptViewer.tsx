"use client";

import { useState } from "react";

interface RawTranscriptViewerProps {
  rawText: string | null | undefined;
}

export default function RawTranscriptViewer({ rawText }: RawTranscriptViewerProps) {
  const [showTranscript, setShowTranscript] = useState(false);

  return (
    <div style={{
      backgroundColor: "var(--bg-surface)",
      border: "1px solid var(--border-subtle)",
      borderRadius: "var(--radius-md)",
      padding: "0.85rem 1.25rem",
      boxShadow: "var(--shadow-sm)",
    }}>
      <button
        onClick={() => setShowTranscript(!showTranscript)}
        style={{
          width: "100%",
          background: "none",
          border: "none",
          color: "var(--text-secondary)",
          cursor: "pointer",
          fontSize: "0.78rem",
          fontWeight: 600,
          fontFamily: "var(--font-sans)",
          padding: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          transition: "color var(--transition-fast)",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              transform: showTranscript ? "rotate(90deg)" : "rotate(0deg)",
              transition: "transform var(--transition-fast)",
            }}
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
          <span>ORIGINAL CALL TRANSCRIPT</span>
        </div>
        <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: 400 }}>
          {showTranscript ? "Click to collapse" : "Click to view full text"}
        </span>
      </button>

      {showTranscript && (
        <div style={{
          marginTop: "0.85rem",
          padding: "0.85rem",
          backgroundColor: "var(--bg-surface-elevated)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "var(--radius-sm)",
          fontSize: "0.78rem",
          lineHeight: 1.65,
          color: "var(--text-secondary)",
          whiteSpace: "pre-wrap",
          maxHeight: "300px",
          overflowY: "auto",
          fontFamily: "var(--font-sans)",
        }}>
          {rawText || "No raw transcript text recorded for this call."}
        </div>
      )}
    </div>
  );
}
