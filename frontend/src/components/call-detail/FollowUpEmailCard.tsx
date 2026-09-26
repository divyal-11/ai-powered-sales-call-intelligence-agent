"use client";

import { FollowUpItem } from "../../types";

interface FollowUpEmailCardProps {
  emailItem: FollowUpItem | undefined;
  copied: boolean;
  onCopyEmail: () => void;
}

export default function FollowUpEmailCard({
  emailItem,
  copied,
  onCopyEmail,
}: FollowUpEmailCardProps) {
  if (!emailItem) return null;

  return (
    <div style={{
      backgroundColor: "var(--bg-surface)",
      border: "1px solid var(--border-subtle)",
      borderRadius: "var(--radius-md)",
      padding: "1.25rem 1.5rem",
      boxShadow: "var(--shadow-sm)",
      display: "flex",
      flexDirection: "column",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.85rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
          <span className="label-secondary">
            READY-TO-SEND FOLLOW-UP EMAIL
          </span>
        </div>
        <button
          onClick={onCopyEmail}
          style={{
            background: "none",
            border: "none",
            color: copied ? "#34D399" : "var(--accent-orange)",
            fontSize: "0.75rem",
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "var(--font-sans)",
            padding: 0,
            display: "inline-flex",
            alignItems: "center",
            gap: "0.35rem",
          }}
        >
          {copied ? (
            <>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>Copied!</span>
            </>
          ) : (
            <>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              <span>Copy Full Text</span>
            </>
          )}
        </button>
      </div>

      <div style={{
        backgroundColor: "var(--bg-surface-elevated)",
        border: "1px solid var(--border-subtle)",
        borderRadius: "var(--radius-sm)",
        padding: "1rem 1.15rem",
        fontSize: "0.84rem",
        lineHeight: 1.65,
        whiteSpace: "pre-wrap",
        color: "var(--text-primary)",
        maxHeight: "360px",
        overflowY: "auto",
        fontFamily: "var(--font-sans)",
      }}>
        {emailItem.content}
      </div>
    </div>
  );
}
