"use client";

import PipelineNav from "./PipelineNav";

// Layout principal: sidebar fija + área de contenido
export default function Shell({ children }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* === SIDEBAR === */}
      <aside
        style={{
          width: "220px",
          flexShrink: 0,
          background: "#0a0a0e",
          borderRight: "1px solid #141418",
          display: "flex",
          flexDirection: "column",
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          overflowY: "auto",
        }}
      >
        {/* Logo */}
        <div
          style={{
            padding: "20px 16px 16px",
            borderBottom: "1px solid #141418",
          }}
        >
          <div
            style={{
              fontSize: "15px",
              fontWeight: 800,
              background: "linear-gradient(135deg, #8b5cf6, #ec4899)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              letterSpacing: "-0.5px",
            }}
          >
            Celeste
          </div>
          <div style={{ fontSize: "10px", color: "#333", marginTop: "3px" }}>
            Video faceless pipeline
          </div>
        </div>

        {/* Navegación */}
        <div style={{ flex: 1, padding: "12px 6px" }}>
          <PipelineNav />
        </div>

        {/* Footer sidebar */}
        <div
          style={{
            padding: "12px 16px",
            borderTop: "1px solid #141418",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span style={{ fontSize: "9px", color: "#2a2a2a" }}>v0.1</span>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "5px",
              fontSize: "9px",
              color: "#333",
            }}
          >
            <span
              style={{
                width: "5px",
                height: "5px",
                borderRadius: "50%",
                background: "#10b981",
                display: "inline-block",
              }}
            />
            local
          </div>
        </div>
      </aside>

      {/* === MAIN === */}
      <main
        style={{
          flex: 1,
          marginLeft: "220px",
          minHeight: "100vh",
          background: "#08080c",
        }}
      >
        {children}
      </main>
    </div>
  );
}
