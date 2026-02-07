"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { isAIConnected } from "@/lib/aiProvidersConfig";
import Topbar from "@/components/Topbar";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Textarea from "@/components/ui/Textarea";
import EmptyState from "@/components/ui/EmptyState";
import Link from "next/link";

export default function DirectorPage() {
  const router = useRouter();

  const [claudeConnected, setClaudeConnected] = useState(false);
  const [script, setScript] = useState("");
  const [decisions, setDecisions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  }

  // Guard: verificar si Claude está conectado
  useEffect(() => {
    const connected = isAIConnected("claude");
    setClaudeConnected(connected);
  }, []);

  // Cargar último análisis desde localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("director_last_analysis");
      if (saved) {
        const { script: savedScript, decisions: savedDecisions } = JSON.parse(saved);
        setScript(savedScript || "");
        setDecisions(savedDecisions || []);
      }
    } catch {}
  }, []);

  // Analizar guion con Claude
  async function handleAnalyze() {
    if (!script.trim()) {
      showToast("Pegá un guion primero");
      return;
    }

    setLoading(true);
    setDecisions([]);

    try {
      const res = await fetch("/api/director/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ script }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Error al analizar");
      }

      const data = await res.json();
      setDecisions(data.decisions);

      // Guardar en localStorage
      localStorage.setItem(
        "director_last_analysis",
        JSON.stringify({ script, decisions: data.decisions })
      );

      showToast("Análisis completado");
    } catch (err) {
      showToast("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  // Exportar TXT para editor
  function handleExportTXT() {
    const lines = ["DIRECTOR IA — MAPA DE EDICIÓN", "=".repeat(60), ""];

    decisions.forEach((d) => {
      lines.push(`BEAT ${d.beat}  [${d.start}s - ${d.end}s]  (${d.end - d.start}s)`);
      lines.push(`  PLANO: ${d.plano}`);
      lines.push(`  MOTION: ${d.motion}`);
      lines.push(`  B-ROLL: ${d.broll}`);
      lines.push(`  NOTA: ${d.nota}`);
      lines.push("");
    });

    lines.push(`Total: ${decisions.length} decisiones editoriales`);

    downloadFile(lines.join("\n"), "mapa-edicion.txt", "text/plain");
    showToast("TXT exportado");
  }

  // Exportar JSON
  function handleExportJSON() {
    const json = JSON.stringify(decisions, null, 2);
    downloadFile(json, "decisiones-editorial.json", "application/json");
    showToast("JSON exportado");
  }

  // Limpiar
  function handleClear() {
    setScript("");
    setDecisions([]);
    localStorage.removeItem("director_last_analysis");
  }

  /* ══════ RENDER ══════ */

  // Bloqueo si Claude no está conectado
  if (!claudeConnected) {
    return (
      <div style={{ maxWidth: 600, margin: "0 auto" }}>
        <Topbar title="Director IA" badge="bloqueado" />
        <Card
          style={{
            padding: "var(--sp-8) var(--sp-6)",
            textAlign: "center",
            background: "color-mix(in srgb, var(--danger) 5%, var(--panel))",
            borderColor: "color-mix(in srgb, var(--danger) 20%, transparent)",
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              background: "color-mix(in srgb, var(--danger) 12%, transparent)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto var(--sp-4)",
            }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--danger)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0110 0v4" />
            </svg>
          </div>
          <h2 style={{ fontSize: "18px", fontWeight: 600, color: "var(--danger)", marginBottom: "var(--sp-2)" }}>
            Director IA bloqueado
          </h2>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: "var(--sp-5)" }}>
            Necesitás conectar Claude (Anthropic) para usar Director IA.
            <br />
            Claude es obligatorio para generar decisiones editoriales.
          </p>
          <Link href="/settings/ai">
            <Button variant="primary" size="lg">
              Conectar Claude ahora
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ position: "relative" }}>
      <style>{`
        .dir-grid { display: grid; grid-template-columns: 380px 1fr; gap: var(--sp-5); align-items: start; }
        @media (max-width: 1024px) { .dir-grid { grid-template-columns: 1fr; } }
        @keyframes toastIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* Toast */}
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: "var(--sp-6)",
            right: "var(--sp-6)",
            background: "var(--success)",
            color: "#fff",
            fontSize: "12px",
            fontWeight: 600,
            padding: "var(--sp-2) var(--sp-5)",
            borderRadius: "var(--radius-md)",
            boxShadow: "var(--shadow-lg)",
            zIndex: 9999,
            animation: "toastIn 0.15s ease",
            pointerEvents: "none",
          }}
        >
          {toast}
        </div>
      )}

      <Topbar title="Director IA" badge="v1">
        {decisions.length > 0 && (
          <>
            <Button variant="ghost" size="sm" onClick={handleExportTXT}>
              Export TXT
            </Button>
            <Button variant="ghost" size="sm" onClick={handleExportJSON}>
              Export JSON
            </Button>
          </>
        )}
      </Topbar>

      <div className="dir-grid">
        {/* ── LEFT: Input ── */}
        <Card style={{ display: "flex", flexDirection: "column", gap: "var(--sp-3)" }}>
          <Textarea
            label="Guion completo"
            value={script}
            onChange={(e) => setScript(e.target.value)}
            placeholder={
              "Pegá tu guion acá...\n\nCada línea debería ser un beat/escena del video.\nClaude va a analizar el ritmo, timing y decisiones visuales."
            }
            rows={14}
          />

          <Button
            variant="primary"
            size="lg"
            disabled={!script.trim() || loading}
            onClick={handleAnalyze}
            style={{ width: "100%" }}
          >
            {loading ? "Analizando..." : "Analizar guion"}
          </Button>

          {decisions.length > 0 && (
            <Button variant="danger" size="sm" onClick={handleClear} style={{ width: "100%" }}>
              Limpiar
            </Button>
          )}

          <div
            style={{
              fontSize: "11px",
              color: "var(--muted)",
              lineHeight: 1.5,
              padding: "var(--sp-2)",
              background: "var(--panel-2)",
              borderRadius: "var(--radius-sm)",
            }}
          >
            <strong style={{ color: "var(--text-secondary)" }}>Tip:</strong> El Director IA analiza tu
            guion y genera decisiones editoriales: motions, planos, b-roll, notas. Pensado para editores
            humanos.
          </div>
        </Card>

        {/* ── RIGHT: Decisiones editoriales ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-3)", minWidth: 0 }}>
          {loading && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                minHeight: 300,
                gap: "var(--sp-4)",
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "var(--radius-full)",
                  border: "3px solid var(--border)",
                  borderTopColor: "var(--accent)",
                  animation: "spin 0.8s linear infinite",
                }}
              />
              <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)" }}>
                Claude está analizando el guion...
              </span>
              <span style={{ fontSize: "11px", color: "var(--dim)" }}>
                Generando decisiones editoriales
              </span>
            </div>
          )}

          {!loading && decisions.length === 0 && (
            <EmptyState
              icon={
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
                </svg>
              }
              title="Sin análisis"
              description="Pegá un guion y hace click en Analizar para obtener decisiones editoriales"
            />
          )}

          {!loading && decisions.length > 0 && (
            <>
              {/* Header bar */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--sp-3)",
                  padding: "var(--sp-2) var(--sp-4)",
                  background: "var(--panel)",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "12px",
                    color: "var(--text-secondary)",
                    fontWeight: 600,
                  }}
                >
                  {decisions.length} decisiones
                </span>
                <span style={{ color: "var(--dim)", fontSize: "10px" }}>&middot;</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--accent)" }}>
                  {decisions[decisions.length - 1]?.end || 0}s total
                </span>
                <Badge color="success">Listo para editor</Badge>
              </div>

              {/* Tabla de decisiones */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "var(--sp-2)",
                  maxHeight: "calc(100vh - 240px)",
                  overflowY: "auto",
                  paddingRight: "var(--sp-1)",
                }}
              >
                {decisions.map((d, i) => (
                  <DecisionCard key={i} decision={d} index={i} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Decision Card ── */
function DecisionCard({ decision, index }) {
  const dur = decision.end - decision.start;

  return (
    <Card
      style={{
        padding: "var(--sp-3) var(--sp-4)",
        borderLeft: "3px solid var(--accent)",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--sp-2)",
          marginBottom: "var(--sp-2)",
        }}
      >
        <Badge color="accent" style={{ fontFamily: "var(--font-mono)" }}>
          BEAT {decision.beat}
        </Badge>
        <span
          style={{
            fontSize: "10px",
            fontFamily: "var(--font-mono)",
            color: "var(--text-secondary)",
            fontWeight: 600,
          }}
        >
          {decision.start}s — {decision.end}s
        </span>
        <span style={{ fontSize: "10px", fontFamily: "var(--font-mono)", color: "var(--dim)" }}>
          ({dur}s)
        </span>
      </div>

      {/* Plano + Motion */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "var(--sp-2)",
          marginBottom: "var(--sp-2)",
        }}
      >
        <div>
          <div
            style={{
              fontSize: "9px",
              fontWeight: 700,
              color: "var(--dim)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              marginBottom: "var(--sp-1)",
            }}
          >
            Plano
          </div>
          <Badge color="muted">{decision.plano}</Badge>
        </div>
        <div>
          <div
            style={{
              fontSize: "9px",
              fontWeight: 700,
              color: "var(--dim)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              marginBottom: "var(--sp-1)",
            }}
          >
            Motion
          </div>
          <Badge color="warning">{decision.motion}</Badge>
        </div>
      </div>

      {/* B-roll */}
      <div style={{ marginBottom: "var(--sp-2)" }}>
        <div
          style={{
            fontSize: "9px",
            fontWeight: 700,
            color: "var(--dim)",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            marginBottom: "var(--sp-1)",
          }}
        >
          B-Roll
        </div>
        <div style={{ fontSize: "12px", color: "var(--text)", lineHeight: 1.5 }}>{decision.broll}</div>
      </div>

      {/* Nota editorial */}
      <div>
        <div
          style={{
            fontSize: "9px",
            fontWeight: 700,
            color: "var(--dim)",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            marginBottom: "var(--sp-1)",
          }}
        >
          Nota Editorial
        </div>
        <div
          style={{
            fontSize: "11px",
            color: "var(--text-secondary)",
            lineHeight: 1.6,
            fontStyle: "italic",
          }}
        >
          {decision.nota}
        </div>
      </div>
    </Card>
  );
}

/* ── Helpers ── */

function downloadFile(content, filename, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
