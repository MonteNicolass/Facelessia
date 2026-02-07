import PipelineView from "@/components/PipelineView";

export default function Home() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <header
        style={{
          height: "48px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 24px",
          borderBottom: "1px solid #141418",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span
            style={{
              fontSize: "14px",
              fontWeight: 800,
              background: "linear-gradient(135deg, #ff6b6b, #ffa500)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              letterSpacing: "-0.5px",
            }}
          >
            FacelessAI
          </span>
        </div>
        <div
          style={{
            fontSize: "10px",
            color: "#333",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <span
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: "#10b981",
              display: "inline-block",
            }}
          />
          local
        </div>
      </header>

      {/* Main */}
      <main
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "48px 16px 32px",
        }}
      >
        {/* Tagline */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <h1
            style={{
              fontSize: "22px",
              fontWeight: 800,
              color: "#e5e5e5",
              letterSpacing: "-0.5px",
              margin: "0 0 6px 0",
            }}
          >
            De una idea a un video casi listo
          </h1>
          <p style={{ fontSize: "12px", color: "#444", margin: 0 }}>
            Pipeline completo: tema &rarr; script &rarr; assets &rarr; video con
            motions + gu&iacute;a de edici&oacute;n
          </p>
        </div>

        {/* Pipeline */}
        <PipelineView />
      </main>

      {/* Footer */}
      <footer
        style={{
          height: "40px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderTop: "1px solid #141418",
          flexShrink: 0,
        }}
      >
        <span style={{ fontSize: "10px", color: "#2a2a2a" }}>
          FacelessAI &middot; herramienta interna &middot; v0.1
        </span>
      </footer>
    </div>
  );
}
