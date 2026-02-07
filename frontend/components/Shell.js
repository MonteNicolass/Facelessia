"use client";

import { usePathname } from "next/navigation";
import PipelineNav from "./PipelineNav";
import { useStore } from "@/lib/store";
import { useState } from "react";

/* ── Grain overlay SVG as inline data URI ─────────────────────────── */
const GRAIN_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)' opacity='0.04'/%3E%3C/svg%3E")`;

export default function Shell({ children }) {
  const pathname = usePathname();
  const { state } = useStore();
  const projectTitle = state.project.title;
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      {/* ── Responsive + grain keyframe styles ──────────────────── */}
      <style>{`
        @media (max-width: 768px) {
          .shell-sidebar {
            transform: translateX(-100%) !important;
            z-index: 900 !important;
            box-shadow: none !important;
          }
          .shell-sidebar.open {
            transform: translateX(0) !important;
            box-shadow: var(--shadow-lg) !important;
          }
          .shell-main {
            margin-left: 0 !important;
          }
          .shell-hamburger {
            display: flex !important;
          }
        }
        @media (min-width: 769px) {
          .shell-backdrop {
            display: none !important;
          }
        }
      `}</style>

      <div style={{ display: "flex", minHeight: "100vh", position: "relative" }}>

        {/* ── Mobile hamburger button ─────────────────────────── */}
        <button
          className="shell-hamburger"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open menu"
          style={{
            display: "none",
            position: "fixed",
            top: "var(--sp-3)",
            left: "var(--sp-3)",
            zIndex: 1000,
            width: 40,
            height: 40,
            alignItems: "center",
            justifyContent: "center",
            background: "var(--panel)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-md)",
            color: "var(--accent)",
            cursor: "pointer",
            boxShadow: "var(--shadow-sm)",
            transition: "background var(--transition-fast)",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        {/* ── Mobile backdrop ────────────────────────────────── */}
        <div
          className="shell-backdrop"
          onClick={() => setSidebarOpen(false)}
          style={{
            display: sidebarOpen ? "block" : "none",
            position: "fixed",
            inset: 0,
            zIndex: 850,
            background: "rgba(10, 8, 6, 0.65)",
            backdropFilter: "blur(2px)",
            transition: "opacity var(--transition-base)",
          }}
        />

        {/* ── Sidebar ────────────────────────────────────────── */}
        <aside
          className={`shell-sidebar${sidebarOpen ? " open" : ""}`}
          style={{
            width: "var(--sidebar-width)",
            flexShrink: 0,
            background: "var(--panel)",
            borderRight: "1px solid var(--border-subtle)",
            display: "flex",
            flexDirection: "column",
            position: "fixed",
            top: 0,
            left: 0,
            bottom: 0,
            overflowY: "auto",
            zIndex: 900,
            transition: "transform var(--transition-base), box-shadow var(--transition-base)",
          }}
        >
          {/* ── Brand ────────────────────────────────────────── */}
          <div style={{
            padding: "var(--sp-6) var(--sp-5) var(--sp-4)",
            borderBottom: "1px solid var(--border-subtle)",
          }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: "var(--sp-2)" }}>
              <span style={{
                fontFamily: "var(--font-display)",
                fontSize: "18px",
                fontWeight: 700,
                color: "var(--accent)",
                letterSpacing: "-0.3px",
                lineHeight: 1,
              }}>
                Celeste
              </span>
            </div>
            <div style={{
              fontSize: "10px",
              color: "var(--dim)",
              textTransform: "uppercase",
              letterSpacing: "1.8px",
              fontWeight: 500,
              marginTop: "4px",
              fontFamily: "var(--font-body)",
            }}>
              film lab
            </div>
          </div>

          {/* ── Project context card ─────────────────────────── */}
          {projectTitle && (
            <div style={{
              margin: "var(--sp-4) var(--sp-3) 0",
              padding: "var(--sp-3) var(--sp-3)",
              background: "var(--panel-2)",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border)",
              position: "relative",
              overflow: "hidden",
            }}>
              {/* Amber left accent stripe */}
              <div style={{
                position: "absolute",
                top: 0,
                left: 0,
                bottom: 0,
                width: "3px",
                background: "var(--accent)",
                borderRadius: "var(--radius-md) 0 0 var(--radius-md)",
                opacity: 0.7,
              }} />

              <div style={{
                paddingLeft: "var(--sp-2)",
              }}>
                <div style={{
                  fontSize: "9px",
                  color: "var(--dim)",
                  textTransform: "uppercase",
                  fontWeight: 600,
                  letterSpacing: "0.6px",
                  fontFamily: "var(--font-body)",
                }}>
                  Proyecto
                </div>
                <div style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "13px",
                  color: "var(--text)",
                  fontWeight: 600,
                  marginTop: "3px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  lineHeight: 1.3,
                }}>
                  {projectTitle}
                </div>
                <div style={{
                  fontSize: "10px",
                  color: "var(--muted)",
                  marginTop: "3px",
                  fontFamily: "var(--font-mono)",
                  letterSpacing: "0.2px",
                }}>
                  {state.project.durationSec}s &middot; {state.project.tone}
                </div>
              </div>
            </div>
          )}

          {/* ── Navigation ───────────────────────────────────── */}
          <div style={{
            flex: 1,
            padding: "var(--sp-3) var(--sp-2) 0",
            display: "flex",
            flexDirection: "column",
          }}>
            <PipelineNav />
          </div>

          {/* ── Footer ───────────────────────────────────────── */}
          <div style={{
            padding: "var(--sp-3) var(--sp-4)",
            borderTop: "1px solid var(--border-subtle)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}>
            <span style={{
              fontSize: "10px",
              color: "var(--dim)",
              fontFamily: "var(--font-mono)",
              letterSpacing: "0.3px",
            }}>
              v0.5
            </span>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "5px",
              fontSize: "10px",
              color: "var(--dim)",
            }}>
              <span style={{
                width: "6px",
                height: "6px",
                borderRadius: "var(--radius-full)",
                background: "#4ade80",
                display: "inline-block",
                boxShadow: "0 0 6px rgba(74, 222, 128, 0.4)",
              }} />
              local
            </div>
          </div>
        </aside>

        {/* ── Main content ───────────────────────────────────── */}
        <main
          className="shell-main"
          style={{
            flex: 1,
            marginLeft: "var(--sidebar-width)",
            minHeight: "100vh",
            background: "var(--bg)",
            position: "relative",
          }}
        >
          {/* Film grain texture overlay */}
          <div
            aria-hidden="true"
            style={{
              position: "fixed",
              inset: 0,
              pointerEvents: "none",
              zIndex: 9999,
              backgroundImage: GRAIN_SVG,
              backgroundRepeat: "repeat",
              backgroundSize: "256px 256px",
              opacity: 1,
              mixBlendMode: "overlay",
            }}
          />

          <div style={{
            padding: "var(--sp-8)",
            maxWidth: "1100px",
            position: "relative",
            zIndex: 1,
          }}>
            {children}
          </div>
        </main>
      </div>
    </>
  );
}
