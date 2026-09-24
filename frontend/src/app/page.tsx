"use client";

import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import TopNav from "../components/TopNav";
import MetricsBar from "../components/MetricsBar";
import AnalyticsCharts from "../components/AnalyticsCharts";
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
  const [activeTab, setActiveTab] = useState("dashboard");

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

  const hotCount = calls.filter((c) => (c.callInsight?.leadScore ?? 0) >= 75).length;

  return (
    <div style={{
      display: "flex",
      minHeight: "100vh",
      backgroundColor: "var(--bg-primary)",
      color: "var(--text-primary)",
    }}>
      {/* ── Left Sidebar (Nexus Navigation) ── */}
      <Sidebar
        onOpenUpload={() => setIsUploadOpen(true)}
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
        hotCount={hotCount}
      />

      {/* ── Main Content Area ── */}
      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        minWidth: 0,
        height: "100vh",
        overflowY: "auto",
      }}>
        {/* Top Navigation Header */}
        <TopNav
          onOpenUpload={() => setIsUploadOpen(true)}
          searchValue={search}
          onSearchChange={(val) => setSearch(val)}
          totalCallsCount={calls.length}
        />

        {/* Dashboard Title & Quick Toolbar (Nexus style) */}
        <div style={{
          padding: "1.5rem 2rem 0.25rem 2rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
          <div>
            <h1 style={{
              fontSize: "1.35rem",
              fontWeight: 700,
              color: "var(--text-primary)",
              letterSpacing: "-0.02em",
            }}>
              Executive Intelligence Dashboard
            </h1>
            <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "2px" }}>
              Live monitoring of customer pain points, buying intent, and lead qualification
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{
              fontSize: "0.75rem",
              fontWeight: 500,
              padding: "0.4rem 0.75rem",
              borderRadius: "var(--radius-sm)",
              backgroundColor: "var(--bg-surface)",
              border: "1px solid var(--border-subtle)",
              color: "var(--text-secondary)",
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
            }}>
              <span>📅</span>
              <span>All Active Pipeline</span>
            </span>

            <button
              onClick={() => setIsUploadOpen(true)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.45rem",
                padding: "0.42rem 0.9rem",
                borderRadius: "var(--radius-sm)",
                backgroundColor: "var(--accent-primary)",
                backgroundImage: "var(--accent-primary-gradient)",
                color: "#FFFFFF",
                fontSize: "0.78rem",
                fontWeight: 600,
                border: "none",
                cursor: "pointer",
                fontFamily: "var(--font-sans)",
                boxShadow: "0 2px 6px rgba(99, 102, 241, 0.25)",
              }}
            >
              <span>+</span>
              <span>Analyze New Call</span>
            </button>
          </div>
        </div>

        {/* Loading / Error States */}
        {loading ? (
          <div style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.75rem",
            minHeight: "300px",
          }}>
            <div className="indicator-pulse" style={{
              width: "12px",
              height: "12px",
              borderRadius: "50%",
              backgroundColor: "var(--accent-primary)",
            }} />
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
              Loading intelligence corpus...
            </p>
          </div>
        ) : error ? (
          <div style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "300px",
          }}>
            <p style={{ color: "#EF4444", fontSize: "0.9rem", fontWeight: 600 }}>{error}</p>
            <p style={{ marginTop: "0.4rem", fontSize: "0.78rem", color: "var(--text-secondary)" }}>
              Ensure backend server is running on http://localhost:3001
            </p>
          </div>
        ) : (
          <>
            {/* Top KPI Metrics Row (Nexus style) */}
            <MetricsBar calls={calls} />

            {/* Interactive Visual Charts Row (Bar Chart + Donut Chart) */}
            <AnalyticsCharts calls={calls} />

            {/* Recent Sales Calls Table (Nexus "List of Integration" style) */}
            <CallsList calls={calls} externalSearch={search} />
          </>
        )}
      </div>

      {/* Audio / Text Upload Modal */}
      <AudioUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadSuccess={async () => {
          const freshCalls = await getTranscripts();
          setCalls(freshCalls);
        }}
      />
    </div>
  );
}
