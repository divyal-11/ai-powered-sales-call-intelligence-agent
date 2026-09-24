"use client";

import { useEffect, useState } from "react";
import Header from "../components/Header";
import MetricsBar from "../components/MetricsBar";
import CallsList from "../components/CallsList";
import { getTranscripts } from "../lib/api";
import { TranscriptListItem } from "../types";
import AudioUploadModal from "@/components/AudioUploadModal";

export default function Dashboard() {
  const [calls, setCalls] = useState<TranscriptListItem[]>([]);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    <main style={{ minHeight: "100vh", backgroundColor: "var(--bg-primary)", display: "flex", flexDirection: "column" }}>
      <Header onOpenUpload={() => setIsUploadOpen(true)} />

      <MetricsBar calls={calls} />

      {loading ? (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-secondary)" }}>
          <p style={{ fontSize: "0.85rem" }}>Loading calls...</p>
        </div>
      ) : error ? (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <p style={{ color: "#EF4444", fontSize: "0.85rem" }}>{error}</p>
          <p style={{ marginTop: "0.5rem", fontSize: "0.78rem", color: "var(--text-secondary)" }}>
            Make sure your backend is running on http://localhost:3001
          </p>
        </div>
      ) : (
        <CallsList calls={calls} />
      )}

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
