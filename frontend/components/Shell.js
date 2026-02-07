"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";

export default function Shell({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
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
          .shell-main { margin-left: 0 !important; }
          .shell-hamburger { display: flex !important; }
        }
        @media (min-width: 769px) {
          .shell-backdrop { display: none !important; }
        }
      `}</style>

      <div style={{ display: "flex", minHeight: "100vh" }}>
        <button
          className="shell-hamburger"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open menu"
          style={{
            display: "none", position: "fixed", top: "var(--sp-3)", left: "var(--sp-3)",
            zIndex: 1000, width: 36, height: 36, alignItems: "center", justifyContent: "center",
            background: "var(--panel)", border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-md)", color: "var(--text-secondary)", cursor: "pointer",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        <div className="shell-backdrop" onClick={() => setSidebarOpen(false)}
          style={{ display: sidebarOpen ? "block" : "none", position: "fixed", inset: 0, zIndex: 850, background: "rgba(10,8,6,0.6)", backdropFilter: "blur(2px)" }}
        />

        <aside
          className={`shell-sidebar${sidebarOpen ? " open" : ""}`}
          style={{
            width: "var(--sidebar-width)", flexShrink: 0, background: "var(--panel)",
            borderRight: "1px solid var(--border-subtle)", display: "flex", flexDirection: "column",
            position: "fixed", top: 0, left: 0, bottom: 0, overflowY: "auto", zIndex: 900,
            transition: "transform var(--transition-base)",
          }}
        >
          <div style={{ padding: "var(--sp-5) var(--sp-4) var(--sp-3)", borderBottom: "1px solid var(--border-subtle)" }}>
            <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--accent)", letterSpacing: "1.5px", textTransform: "uppercase", fontFamily: "var(--font-mono)", lineHeight: 1 }}>
              CELESTE
            </div>
            <div style={{ fontSize: "10px", color: "var(--dim)", letterSpacing: "0.5px", marginTop: "3px" }}>
              editor v0.7
            </div>
          </div>

          <div style={{ flex: 1 }}>
            <Sidebar />
          </div>

          <div style={{ padding: "var(--sp-3) var(--sp-4)", borderTop: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "10px", color: "var(--dim)", fontFamily: "var(--font-mono)" }}>v0.7</span>
            <div style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "10px", color: "var(--dim)" }}>
              <span style={{ width: 6, height: 6, borderRadius: "var(--radius-full)", background: "#4ade80", display: "inline-block", boxShadow: "0 0 6px rgba(74,222,128,0.4)" }} />
              local
            </div>
          </div>
        </aside>

        <main className="shell-main" style={{ flex: 1, marginLeft: "var(--sidebar-width)", minHeight: "100vh", background: "var(--bg)" }}>
          <div style={{ padding: "var(--sp-8)", maxWidth: 1100, position: "relative", zIndex: 1 }}>
            {children}
          </div>
        </main>
      </div>
    </>
  );
}
