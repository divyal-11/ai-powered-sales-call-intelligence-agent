"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarProps {
  onOpenUpload: () => void;
  activeTab?: string;
  onSelectTab?: (tab: string) => void;
  hotCount?: number;
}

export default function Sidebar({
  onOpenUpload,
  activeTab = "dashboard",
  onSelectTab,
  hotCount = 0,
}: SidebarProps) {
  const pathname = usePathname();

  const navGeneral = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
        </svg>
      ),
      badge: null,
    },
    {
      id: "hot_leads",
      label: "Hot Leads",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
        </svg>
      ),
      badge: hotCount > 0 ? hotCount.toString() : null,
      badgeColor: "var(--accent-orange)",
    },
    {
      id: "all_calls",
      label: "Call Archive",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
        </svg>
      ),
      badge: null,
    },
  ];

  const navAnalytics = [
    {
      id: "intent_radar",
      label: "Buying Intent",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
      ),
      badge: null,
    },
    {
      id: "objections",
      label: "Objection Radar",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      ),
      badge: "AI",
      badgeColor: "var(--accent-primary)",
    },
    {
      id: "grounding",
      label: "Spoken Grounding",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      ),
      badge: "100%",
      badgeColor: "var(--accent-green)",
    },
  ];

  const navTools = [
    {
      id: "ingestion",
      label: "Audio Ingestion",
      onClick: onOpenUpload,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
          <line x1="12" y1="19" x2="12" y2="23" />
          <line x1="8" y1="23" x2="16" y2="23" />
        </svg>
      ),
      badge: null,
    },
  ];

  return (
    <aside style={{
      width: "240px",
      backgroundColor: "var(--bg-sidebar)",
      borderRight: "1px solid var(--border-subtle)",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      flexShrink: 0,
      height: "100vh",
      position: "sticky",
      top: 0,
      zIndex: 30,
      transition: "background-color var(--transition-normal), border-color var(--transition-normal)",
    }}>
      {/* Top Brand Header */}
      <div>
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "1.25rem 1.25rem 1.25rem 1.4rem",
          borderBottom: "1px solid var(--border-subtle)",
        }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div style={{
              width: "32px",
              height: "32px",
              borderRadius: "var(--radius-md)",
              backgroundColor: "var(--accent-primary-muted)",
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
                fontSize: "0.95rem",
                letterSpacing: "-0.01em",
                color: "var(--text-primary)",
                lineHeight: 1.1,
              }}>
                StoneForge
              </div>
              <div style={{
                fontSize: "0.68rem",
                color: "var(--text-muted)",
                letterSpacing: "0.02em",
              }}>
                Intelligence OS
              </div>
            </div>
          </Link>

          <span style={{
            fontSize: "0.75rem",
            color: "var(--text-muted)",
            padding: "0.2rem 0.4rem",
            borderRadius: "var(--radius-xs)",
            backgroundColor: "var(--bg-hover)",
          }}>
            ⌘S
          </span>
        </div>

        {/* Navigation Sections */}
        <div style={{ padding: "1.25rem 0.85rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {/* Group 1: General */}
          <div>
            <div className="label-muted" style={{ padding: "0 0.6rem 0.45rem", fontSize: "0.62rem" }}>
              GENERAL
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
              {navGeneral.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectTab && onSelectTab(item.id)}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "0.5rem 0.75rem",
                      borderRadius: "var(--radius-md)",
                      backgroundColor: isActive ? "var(--bg-surface-elevated)" : "transparent",
                      border: "none",
                      color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
                      fontWeight: isActive ? 600 : 500,
                      fontSize: "0.82rem",
                      cursor: "pointer",
                      fontFamily: "var(--font-sans)",
                      transition: "all var(--transition-fast)",
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = "var(--bg-hover)";
                        e.currentTarget.style.color = "var(--text-primary)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = "transparent";
                        e.currentTarget.style.color = "var(--text-secondary)";
                      }
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
                      <span style={{ color: isActive ? "var(--accent-primary)" : "var(--text-muted)" }}>
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                    </div>

                    {item.badge && (
                      <span style={{
                        fontSize: "0.65rem",
                        fontWeight: 600,
                        padding: "0.1rem 0.45rem",
                        borderRadius: "var(--radius-full)",
                        backgroundColor: item.badgeColor ? `${item.badgeColor}20` : "var(--bg-hover)",
                        color: item.badgeColor || "var(--text-primary)",
                      }}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Group 2: Analytics */}
          <div>
            <div className="label-muted" style={{ padding: "0 0.6rem 0.45rem", fontSize: "0.62rem" }}>
              ANALYTICS & SIGNALS
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
              {navAnalytics.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectTab && onSelectTab(item.id)}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "0.5rem 0.75rem",
                      borderRadius: "var(--radius-md)",
                      backgroundColor: isActive ? "var(--bg-surface-elevated)" : "transparent",
                      border: "none",
                      color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
                      fontWeight: isActive ? 600 : 500,
                      fontSize: "0.82rem",
                      cursor: "pointer",
                      fontFamily: "var(--font-sans)",
                      transition: "all var(--transition-fast)",
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = "var(--bg-hover)";
                        e.currentTarget.style.color = "var(--text-primary)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = "transparent";
                        e.currentTarget.style.color = "var(--text-secondary)";
                      }
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
                      <span style={{ color: isActive ? "var(--accent-primary)" : "var(--text-muted)" }}>
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                    </div>

                    {item.badge && (
                      <span style={{
                        fontSize: "0.62rem",
                        fontWeight: 600,
                        padding: "0.1rem 0.4rem",
                        borderRadius: "var(--radius-full)",
                        backgroundColor: item.badgeColor ? `${item.badgeColor}20` : "var(--bg-hover)",
                        color: item.badgeColor || "var(--text-primary)",
                      }}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Group 3: Tools */}
          <div>
            <div className="label-muted" style={{ padding: "0 0.6rem 0.45rem", fontSize: "0.62rem" }}>
              TOOLS
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
              {navTools.map((item) => (
                <button
                  key={item.id}
                  onClick={item.onClick}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0.5rem 0.75rem",
                    borderRadius: "var(--radius-md)",
                    backgroundColor: "transparent",
                    border: "none",
                    color: "var(--text-secondary)",
                    fontWeight: 500,
                    fontSize: "0.82rem",
                    cursor: "pointer",
                    fontFamily: "var(--font-sans)",
                    transition: "all var(--transition-fast)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "var(--bg-hover)";
                    e.currentTarget.style.color = "var(--text-primary)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color = "var(--text-secondary)";
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
                    <span style={{ color: "var(--accent-orange)" }}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Profile / Team Card (Nexus style) */}
      <div style={{
        padding: "1rem",
        borderTop: "1px solid var(--border-subtle)",
        display: "flex",
        flexDirection: "column",
        gap: "0.75rem",
      }}>
        {/* Team Card */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0.55rem 0.7rem",
          backgroundColor: "var(--bg-surface-elevated)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "var(--radius-md)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.55rem" }}>
            <div style={{
              width: "26px",
              height: "26px",
              borderRadius: "var(--radius-sm)",
              backgroundColor: "var(--accent-primary)",
              color: "#FFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: "0.72rem",
            }}>
              SF
            </div>
            <div>
              <div style={{ fontSize: "0.76rem", fontWeight: 600, color: "var(--text-primary)" }}>
                StoneForge Team
              </div>
              <div style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>
                Enterprise Tier
              </div>
            </div>
          </div>
          <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>▾</span>
        </div>

        {/* Upload Action Button */}
        <button
          onClick={onOpenUpload}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.45rem",
            padding: "0.5rem",
            borderRadius: "var(--radius-md)",
            backgroundColor: "var(--accent-primary)",
            backgroundImage: "var(--accent-primary-gradient)",
            color: "#FFFFFF",
            border: "none",
            fontSize: "0.78rem",
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "var(--font-sans)",
            boxShadow: "0 2px 6px rgba(99, 102, 241, 0.25)",
            transition: "transform var(--transition-fast), opacity var(--transition-fast)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = "0.92";
            e.currentTarget.style.transform = "translateY(-1px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = "1";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          <span>+</span>
          <span>Analyze Call</span>
        </button>

        <div style={{
          textAlign: "center",
          fontSize: "0.62rem",
          color: "var(--text-muted)",
        }}>
          © 2026 StoneForge OS
        </div>
      </div>
    </aside>
  );
}
