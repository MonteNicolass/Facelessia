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

  useEffect(() => {
    const connected = isAIConnected("claude");
    setClaudeConnected(connected);
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("director_last_analysis");
      if (saved) {
        const parsed = JSON.parse(saved);
        setScript(parsed?.script || "");
        setDecisions(Array.isArray(parsed?.decisions) ? parsed.decisions : []);
      }
    } catch {}
  }, []);

  async function handleAnalyze() {
    if (!script?.trim()) {
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
        throw new Error(err?.error || "Error al analizar");
      }

      const data = await res.json();
      const newDecisions = Array.isArray(data?.decisions) ? data.decisions : [];
      setDecisions(newDecisions);

      localStorage.setItem(
        "director_last_analysis",
        JSON.stringify({ script, decisions: newDecisions })
      );

      showToast("Análisis completado");
    } catch (err) {
      showToast("Error: " + (err?.message || "Desconocido"));
    } finally {
      setLoading(false);
    }
  }

  function handleExportTXT() {
    if (!Array.isArray(decisions) || decisions.length === 0) return;

    const lines = ["DIRECTOR IA — MAPA DE EDICIÓN", "=".repeat(50), ""];
    decisions.forEach((d, i) => {
      lines.push(`${i + 1}. ${d?.t || "—"}`);
      lines.push(`   Motion: ${d?.motion || "—"}`);
      lines.push(`   B-roll: ${d?.broll || "—"}`);
      lines.push(`   Nota: ${d?.note || "—"}`);
      lines.push("");
    });
    downloadFile(lines.join("\n"), "mapa-edicion.txt", "text/plain");
    showToast("TXT exportado");
  }

  function handleExportJSON() {
    if (!Array.isArray(decisions) || decisions.length === 0) return;

    const json = JSON.stringify(decisions, null, 2);
    downloadFile(json, "decisiones-editorial.json", "application/json");
    showToast("JSON exportado");
  }

  function handleClear() {
    setScript("");
    setDecisions([]);
    localStorage.removeItem("director_last_analysis");
  }

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

  const hasDecisions = Array.isArray(decisions) && decisions.length > 0;

  return (
    <div style={{ position: "relative" }}>
      <style>{`
        .dir-grid { display: grid; grid-template-columns: 380px 1fr; gap: var(--sp-5); align-items: start; }
        @media (max-width: 1024px) { .dir-grid { grid-template-columns: 1fr; } }
        @keyframes toastIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

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
        {hasDecisions && (
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
            disabled={!script?.trim() || loading}
            onClick={handleAnalyze}
            style={{ width: "100%" }}
          >
            {loading ? "Analizando..." : "Analizar guion"}
          </Button>

          {hasDecisions && (
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

          {!loading && !hasDecisions && (
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

          {!loading && hasDecisions && (
            <Card style={{ padding: 0, overflow: "hidden" }}>
              <div
                style={{
                  padding: "var(--sp-2) var(--sp-4)",
                  background: "var(--panel-2)",
                  borderBottom: "1px solid var(--border-subtle)",
                  display: "flex",
                  gap: "var(--sp-3)",
                  alignItems: "center",
                }}
              >
                <Badge color="success">{decisions.length} decisiones</Badge>
              </div>
              <div style={{ maxHeight: "calc(100vh - 280px)", overflowY: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
                  <thead>
                    <tr style={{ background: "var(--panel-2)", borderBottom: "1px solid var(--border)" }}>
                      <th style={{ padding: "var(--sp-2) var(--sp-3)", textAlign: "left", fontWeight: 700, fontSize: "10px", color: "var(--dim)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Time</th>
                      <th style={{ padding: "var(--sp-2) var(--sp-3)", textAlign: "left", fontWeight: 700, fontSize: "10px", color: "var(--dim)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Motion</th>
                      <th style={{ padding: "var(--sp-2) var(--sp-3)", textAlign: "left", fontWeight: 700, fontSize: "10px", color: "var(--dim)", textTransform: "uppercase", letterSpacing: "0.06em" }}>B-roll</th>
                      <th style={{ padding: "var(--sp-2) var(--sp-3)", textAlign: "left", fontWeight: 700, fontSize: "10px", color: "var(--dim)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Nota</th>
                    </tr>
                  </thead>
                  <tbody>
                    {decisions.map((d, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                        <td style={{ padding: "var(--sp-3)", fontFamily: "var(--font-mono)", fontWeight: 600, color: "var(--accent)" }}>{d?.t || "—"}</td>
                        <td style={{ padding: "var(--sp-3)" }}>
                          <Badge color="warning" style={{ fontSize: "10px" }}>{d?.motion || "—"}</Badge>
                        </td>
                        <td style={{ padding: "var(--sp-3)", color: "var(--text-secondary)", maxWidth: 300 }}>{d?.broll || "—"}</td>
                        <td style={{ padding: "var(--sp-3)", color: "var(--muted)", fontSize: "11px", fontStyle: "italic" }}>{d?.note || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

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
