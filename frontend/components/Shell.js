"use client";

import { usePathname } from "next/navigation";
import PipelineNav from "./PipelineNav";
import { useStore } from "@/lib/store";

export default function Shell({ children }) {
  const pathname = usePathname();
  const { state } = useStore();
  const projectTitle = state.project.title;

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar */}
      <aside
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
        }}
      >
        {/* Brand */}
        <div style={{ padding: "var(--sp-5) var(--sp-4) var(--sp-4)" }}>
          <div style={{ fontSize: "16px", fontWeight: 700, color: "var(--text)", letterSpacing: "-0.5px" }}>
            Celeste
          </div>
          <div style={{ fontSize: "11px", color: "var(--dim)", marginTop: "2px" }}>
            Video faceless pipeline
          </div>
        </div>

        {/* Project context */}
        {projectTitle && (
          <div
            style={{
              margin: "0 var(--sp-3)",
              padding: "var(--sp-2) var(--sp-3)",
              background: "var(--panel-2)",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border-subtle)",
              marginBottom: "var(--sp-3)",
            }}
          >
            <div style={{ fontSize: "10px", color: "var(--dim)", textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.3px" }}>
              Proyecto
            </div>
            <div style={{
              fontSize: "12px",
              color: "var(--text-secondary)",
              fontWeight: 500,
              marginTop: "2px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}>
              {projectTitle}
            </div>
            <div style={{ fontSize: "10px", color: "var(--dim)", marginTop: "2px" }}>
              {state.project.durationSec}s &middot; {state.project.tone}
            </div>
          </div>
        )}

        {/* Nav */}
        <div style={{ flex: 1, padding: "0 var(--sp-2)", display: "flex", flexDirection: "column" }}>
          <PipelineNav />
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "var(--sp-3) var(--sp-4)",
            borderTop: "1px solid var(--border-subtle)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span style={{ fontSize: "10px", color: "var(--dim)" }}>v0.3</span>
          <div style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "10px", color: "var(--dim)" }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--success)", display: "inline-block" }} />
            local
          </div>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, marginLeft: "var(--sidebar-width)", minHeight: "100vh", background: "var(--bg)" }}>
        <div style={{ padding: "var(--sp-8)", maxWidth: "1100px" }}>
          {children}
        </div>
      </main>
    </div>
  );
}
