"use client";

import { useEffect, useState } from "react";
import Header from "../components/Header";
import MetricsBar from "../components/MetricsBar";
import CallsList from "../components/CallsList";
import AudioUploadModal from "../components/AudioUploadModal";
import { getTranscripts, queryIntelligence, QueryResponse } from "../lib/api";
import { TranscriptListItem } from "../types";

export default function Dashboard() {
  const [calls, setCalls] = useState<TranscriptListItem[]>([]);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<"ALL" | "HOT" | "WARM" | "COLD">("ALL");

  // AI Natural Language Query (NLP to SQL) state
  const [aiQueryResult, setAiQueryResult] = useState<QueryResponse | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const data = await getTranscripts();
        setCalls(data);
      } catch (err: any) {
        setError(err.message || "Failed to load calls");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  async function handleAiQuery(question: string) {
    if (!question.trim()) return;
    try {
      setIsAiLoading(true);
      setAiError(null);
      const result = await queryIntelligence(question);
      setAiQueryResult(result);
    } catch (err: any) {
      setAiError(err.message || "Failed to execute AI query.");
    } finally {
      setIsAiLoading(false);
    }
  }

  function handleResetAiQuery() {
    setAiQueryResult(null);
    setAiError(null);
    setSearch("");
  }

  // If AI query is active, filter calls to matched transcript IDs
  const displayedCalls = aiQueryResult
    ? calls.filter((c) =>
        aiQueryResult.results.some((r: any) => r.transcript_id === c.id)
      )
    : calls;

  return (
    <main style={{
      minHeight: "100vh",
      backgroundColor: "var(--bg-primary)",
      display: "flex",
      flexDirection: "column",
    }}>
      {/* Top Header: Brand, Live Search, Theme Switcher & Analyze Call */}
      <Header
        onOpenUpload={() => setIsUploadOpen(true)}
        search={search}
        onSearchChange={(val) => {
          setSearch(val);
          if (!val && aiQueryResult) {
            setAiQueryResult(null);
          }
        }}
        onAiQuery={handleAiQuery}
        isAiLoading={isAiLoading}
      />

      {/* Center Compact Container */}
      <div style={{
        maxWidth: "1140px",
        margin: "0 auto",
        width: "100%",
        padding: "1.5rem 1.5rem 3rem 1.5rem",
        display: "flex",
        flexDirection: "column",
        gap: "1.25rem",
      }}>
        {/* Interactive KPI Cards: Total, Hot, Warm, Cold with live filtering */}
        <MetricsBar
          calls={calls}
          activeFilter={activeFilter}
          onFilterChange={(filter) => setActiveFilter(filter)}
        />

        {/* Clean Results Indicator */}
        {aiQueryResult && (
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: "var(--bg-surface)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-md)",
            padding: "0.6rem 1rem",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
              <span style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>
                Showing results for
              </span>
              <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-primary)" }}>
                &ldquo;{aiQueryResult.question}&rdquo;
              </span>
              <span style={{ fontSize: "0.76rem", color: "var(--text-muted)" }}>
                ({displayedCalls.length} {displayedCalls.length === 1 ? "call" : "calls"})
              </span>
            </div>
            <button
              onClick={handleResetAiQuery}
              style={{
                background: "none",
                border: "1px solid var(--border-medium)",
                color: "var(--text-secondary)",
                borderRadius: "var(--radius-sm)",
                padding: "2px 8px",
                fontSize: "0.72rem",
                cursor: "pointer",
                fontFamily: "var(--font-sans)",
              }}
            >
              Clear
            </button>
          </div>
        )}

        {aiError && (
          <div style={{
            backgroundColor: "rgba(239, 68, 68, 0.08)",
            border: "1px solid rgba(239, 68, 68, 0.25)",
            borderRadius: "var(--radius-sm)",
            padding: "0.6rem 1rem",
            color: "#EF4444",
            fontSize: "0.8rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}>
            <span>{aiError}</span>
            <button
              onClick={() => setAiError(null)}
              style={{ background: "none", border: "none", color: "#EF4444", cursor: "pointer", fontSize: "0.75rem" }}
            >
              ✕
            </button>
          </div>
        )}

        {/* Main Content: Real Call Intelligence Pipeline Table */}
        {loading ? (
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.75rem",
            padding: "5rem 0",
          }}>
            <div className="indicator-pulse" style={{
              width: "12px",
              height: "12px",
              borderRadius: "50%",
              backgroundColor: "var(--accent-orange)",
            }} />
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
              Loading sales call intelligence...
            </p>
          </div>
        ) : error ? (
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "4rem 0",
          }}>
            <p style={{ color: "#EF4444", fontSize: "0.9rem", fontWeight: 600 }}>{error}</p>
            <p style={{ marginTop: "0.4rem", fontSize: "0.78rem", color: "var(--text-secondary)" }}>
              Make sure your backend server is running on http://localhost:3001
            </p>
          </div>
        ) : (
          <CallsList
            calls={displayedCalls}
            externalSearch={aiQueryResult ? "" : search}
            filterTier={activeFilter}
            onFilterChange={(filter) => setActiveFilter(filter)}
          />
        )}
      </div>

      {/* Audio & Text Ingestion Modal */}
      <AudioUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadSuccess={async () => {
          const freshCalls = await getTranscripts();
          setCalls(freshCalls);
        }}
      />
    </main>
  );
}
