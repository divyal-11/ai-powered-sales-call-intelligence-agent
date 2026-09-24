"use client";

import { useEffect, useState } from "react";
import Header from "../components/Header";
import MetricsBar from "../components/MetricsBar";
import CallsList from "../components/CallsList";
import AudioUploadModal from "../components/AudioUploadModal";
import { getTranscripts } from "../lib/api";
import { TranscriptListItem } from "../types";

export default function Dashboard() {
  const [calls, setCalls] = useState<TranscriptListItem[]>([]);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<"ALL" | "HOT" | "WARM" | "COLD">("ALL");

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
        onSearchChange={(val) => setSearch(val)}
      />

      {/* Interactive KPI Cards: Total, Hot, Warm, Cold with live filtering */}
      <MetricsBar
        calls={calls}
        activeFilter={activeFilter}
        onFilterChange={(filter) => setActiveFilter(filter)}
      />

      {/* Main Content: Real Call Intelligence Pipeline Table */}
      {loading ? (
        <div style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.75rem",
          minHeight: "350px",
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
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "350px",
        }}>
          <p style={{ color: "#EF4444", fontSize: "0.9rem", fontWeight: 600 }}>{error}</p>
          <p style={{ marginTop: "0.4rem", fontSize: "0.78rem", color: "var(--text-secondary)" }}>
            Make sure your backend server is running on http://localhost:3001
          </p>
        </div>
      ) : (
        <CallsList
          calls={calls}
          externalSearch={search}
          filterTier={activeFilter}
          onFilterChange={(filter) => setActiveFilter(filter)}
        />
      )}

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
