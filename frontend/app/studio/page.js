"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { generateStudioOutput } from "@/lib/studio-generator";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import SectionHeader from "@/components/ui/SectionHeader";

// ── Config maps ──
const DURATION_MAP = { short: 30, "60": 60, long: 180 };
const MODE_MAP = {
  epica: "short_epico",
  educacion: "educativo",
  tutorial: "educativo",
  marketing: "consistencia",
};
const DURATION_OPTIONS = [
  { value: "short", label: "Short", sub: "30s" },
  { value: "60", label: "Estandar", sub: "60s" },
  { value: "long", label: "Long", sub: "180s" },
];
const STYLE_OPTIONS = [
  { value: "epica", label: "Epica" },
  { value: "educacion", label: "Educacion" },
  { value: "tutorial", label: "Tutorial" },
  { value: "marketing", label: "Marketing" },
];
const LANGUAGE_OPTIONS = [
  { value: "es", label: "Espanol" },
  { value: "en", label: "English" },
];

function fmtTime(sec) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

const labelStyle = {
  display: "block", fontSize: "10px", fontWeight: 700, fontFamily: "var(--font-body)",
  color: "var(--dim)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "var(--sp-3)",
};

const monoBoxStyle = {
  fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--muted)", lineHeight: 1.6,
  background: "var(--panel-2)", padding: "var(--sp-3) var(--sp-4)", borderRadius: "var(--radius-sm)",
  border: "1px solid var(--border-subtle)",
};

const tinyLabel = {
  fontSize: "9px", fontWeight: 700, textTransform: "uppercase",
  letterSpacing: "0.06em", color: "var(--dim)", display: "block", marginBottom: "var(--sp-1)",
};

// =================================================================
// STUDIO PAGE
// =================================================================

export default function StudioPage() {
  const { state, dispatch } = useStore();
  const router = useRouter();
  const { config, output, loading } = state.studio;
  const [toast, setToast] = useState(null);
  const [error, setError] = useState(null);

  function showToast(text) {
    setToast(text);
    setTimeout(() => setToast(null), 2000);
  }

  // ── Generate handler ──
  const handleGenerate = useCallback(() => {
    if (!config.topic.trim()) { setError("Ingresa un tema para generar el paquete."); return; }
    setError(null);
    dispatch({ type: "SET_STUDIO_LOADING", payload: true });
    setTimeout(() => {
      try {
        const result = generateStudioOutput({
          topic: config.topic.trim(), mode: MODE_MAP[config.style] || "short_epico",
          duration: DURATION_MAP[config.duration] || 60, audience: "", hasCTA: true,
        });
        dispatch({ type: "SET_STUDIO_OUTPUT", payload: result });
      } catch {
        dispatch({ type: "SET_STUDIO_LOADING", payload: false });
        setError("Error al generar el paquete. Intenta de nuevo.");
      }
    }, 300);
  }, [config, dispatch]);

  // ── Copy JSON to clipboard ──
  const handleCopyJSON = useCallback(() => {
    navigator.clipboard.writeText(JSON.stringify(output, null, 2))
      .then(() => showToast("Copiado")).catch(() => showToast("Error al copiar"));
  }, [output]);

  // ── Download as JSON file ──
  const handleDownload = useCallback(() => {
    const blob = new Blob([JSON.stringify(output, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `celeste-studio_${Date.now()}.json`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast("Descargado");
  }, [output]);

  // ── Send formatted text to Director ──
  const handleSendToDirector = useCallback(() => {
    if (!output?.script?.scenes) return;
    const text = output.script.scenes
      .map((s) => `[${fmtTime(s.startSec)}-${fmtTime(s.endSec)}] ${s.narration}`)
      .join("\n");
    dispatch({ type: "SET_DIR_RAW", payload: text });
    router.push("/director");
  }, [output, dispatch, router]);

  // ── Save to projects store ──
  const handleSaveProject = useCallback(() => {
    dispatch({
      type: "SAVE_PROJECT",
      payload: { type: "studio", name: config.topic || "Studio Project", data: { config, output } },
    });
    showToast("Guardado");
  }, [config, output, dispatch]);

  // ── Selectable option card (used for Duration, Style, Language) ──
  function SelectableCard({ active, onClick, children }) {
    return (
      <div
        onClick={onClick}
        style={{
          flex: 1, minWidth: 0, padding: "var(--sp-3) var(--sp-4)", textAlign: "center",
          background: active ? "var(--accent-muted)" : "var(--panel)",
          border: active ? "1px solid var(--accent-border)" : "1px solid var(--border)",
          borderRadius: "var(--radius-md)", cursor: "pointer", transition: "all var(--transition-fast)",
        }}
        onMouseEnter={(e) => {
          if (!active) e.currentTarget.style.borderColor = "var(--border)";
          e.currentTarget.style.background = active ? "var(--accent-muted)" : "var(--panel-hover)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = active ? "var(--accent-border)" : "var(--border)";
          e.currentTarget.style.background = active ? "var(--accent-muted)" : "var(--panel)";
        }}
      >{children}</div>
    );
  }

  function OptionLabel({ active, label }) {
    return (
      <div style={{
        fontSize: "13px", fontWeight: 600, fontFamily: "var(--font-body)",
        color: active ? "var(--accent)" : "var(--text)",
      }}>{label}</div>
    );
  }

  // ─── RENDER ────────────────────────────────────────────────────

  return (
    <div style={{ maxWidth: "860px", position: "relative" }}>
      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", bottom: "var(--sp-6)", right: "var(--sp-6)", background: "var(--success)",
          color: "#fff", fontFamily: "var(--font-body)", fontSize: "13px", fontWeight: 600,
          padding: "var(--sp-2) var(--sp-5)", borderRadius: "var(--radius-md)",
          boxShadow: "var(--shadow-lg)", zIndex: 9999,
        }}>{toast}</div>
      )}

      {/* ════════ CONFIG FORM ════════ */}
      {output === null && !loading && (
        <>
          <div style={{ marginBottom: "var(--sp-8)" }}>
            <h1 style={{
              fontFamily: "var(--font-display)", fontWeight: 400, fontSize: "28px",
              color: "var(--text)", lineHeight: 1.15, margin: "0 0 var(--sp-2) 0", letterSpacing: "-0.02em",
            }}>AI Video Studio</h1>
            <p style={{
              fontFamily: "var(--font-body)", fontSize: "13px", color: "var(--muted)",
              lineHeight: 1.6, margin: 0, maxWidth: "520px",
            }}>Genera paquetes completos para video faceless: guion, prompts visuales, casting y metadata.</p>
          </div>

          <Card padding="var(--sp-6) var(--sp-7)">
            {/* Topic */}
            <div style={{ marginBottom: "var(--sp-6)" }}>
              <label style={labelStyle}>Tema</label>
              <textarea
                rows={4} value={config.topic}
                onChange={(e) => dispatch({ type: "SET_STUDIO_CONFIG", payload: { topic: e.target.value } })}
                placeholder="Ej: La historia oculta del Coliseo Romano — lo que no te contaron en la escuela"
                style={{
                  width: "100%", fontFamily: "var(--font-body)", fontSize: "13px", lineHeight: 1.7,
                  color: "var(--text)", background: "var(--panel-2)", border: "1px solid var(--border)",
                  borderRadius: "var(--radius-md)", padding: "var(--sp-3) var(--sp-4)", outline: "none",
                  resize: "vertical", boxSizing: "border-box", transition: "border-color var(--transition-fast)",
                }}
                onFocus={(e) => (e.target.style.borderColor = "var(--accent-border)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
              />
            </div>

            {/* Duration */}
            <div style={{ marginBottom: "var(--sp-6)" }}>
              <label style={labelStyle}>Duracion</label>
              <div style={{ display: "flex", gap: "var(--sp-3)" }}>
                {DURATION_OPTIONS.map((opt) => (
                  <SelectableCard key={opt.value} active={config.duration === opt.value}
                    onClick={() => dispatch({ type: "SET_STUDIO_CONFIG", payload: { duration: opt.value } })}>
                    <OptionLabel active={config.duration === opt.value} label={opt.label} />
                    <div style={{
                      fontSize: "11px", fontFamily: "var(--font-mono)",
                      color: config.duration === opt.value ? "var(--accent)" : "var(--muted)",
                    }}>{opt.sub}</div>
                  </SelectableCard>
                ))}
              </div>
            </div>

            {/* Style */}
            <div style={{ marginBottom: "var(--sp-6)" }}>
              <label style={labelStyle}>Estilo</label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "var(--sp-3)" }}>
                {STYLE_OPTIONS.map((opt) => (
                  <SelectableCard key={opt.value} active={config.style === opt.value}
                    onClick={() => dispatch({ type: "SET_STUDIO_CONFIG", payload: { style: opt.value } })}>
                    <OptionLabel active={config.style === opt.value} label={opt.label} />
                  </SelectableCard>
                ))}
              </div>
            </div>

            {/* Language */}
            <div style={{ marginBottom: "var(--sp-8)" }}>
              <label style={labelStyle}>Idioma</label>
              <div style={{ display: "flex", gap: "var(--sp-3)", maxWidth: "320px" }}>
                {LANGUAGE_OPTIONS.map((opt) => (
                  <SelectableCard key={opt.value} active={config.language === opt.value}
                    onClick={() => dispatch({ type: "SET_STUDIO_CONFIG", payload: { language: opt.value } })}>
                    <OptionLabel active={config.language === opt.value} label={opt.label} />
                  </SelectableCard>
                ))}
              </div>
            </div>

            {error && (
              <div style={{ fontSize: "12px", fontFamily: "var(--font-body)", color: "var(--danger)", marginBottom: "var(--sp-4)" }}>
                {error}
              </div>
            )}

            <Button variant="primary" size="lg" onClick={handleGenerate} disabled={loading} style={{ width: "100%" }}>
              Generar Paquete
            </Button>
          </Card>
        </>
      )}

      {/* ════════ LOADING STATE ════════ */}
      {loading && (
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center",
          justifyContent: "center", minHeight: "400px", gap: "var(--sp-4)",
        }}>
          <div style={{
            width: "40px", height: "40px", borderRadius: "var(--radius-full)",
            border: "3px solid var(--border)", borderTopColor: "var(--accent)",
            animation: "spin 0.8s linear infinite",
          }} />
          <span style={{
            fontFamily: "var(--font-body)", fontSize: "14px", fontWeight: 600, color: "var(--text-secondary)",
          }}>Generando paquete...</span>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {/* ════════ OUTPUT VIEW ════════ */}
      {output !== null && !loading && (
        <>
          {/* Top bar */}
          <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-3)", marginBottom: "var(--sp-6)" }}>
            <h1 style={{
              fontFamily: "var(--font-display)", fontWeight: 400, fontSize: "28px",
              color: "var(--text)", lineHeight: 1.15, margin: 0, letterSpacing: "-0.02em", flex: 1,
            }}>Paquete Generado</h1>
            <Badge color="muted">mock</Badge>
            <Button variant="ghost" size="sm" onClick={() => dispatch({ type: "STUDIO_RESET" })}>Nuevo</Button>
          </div>

          {/* Metadata */}
          <Card padding="var(--sp-5) var(--sp-6)" style={{ marginBottom: "var(--sp-6)" }}>
            <h2 style={{
              fontFamily: "var(--font-display)", fontWeight: 500, fontSize: "18px",
              color: "var(--text)", margin: "0 0 var(--sp-2) 0", lineHeight: 1.3,
            }}>{output.metadata.title}</h2>
            <p style={{
              fontFamily: "var(--font-body)", fontSize: "13px", color: "var(--text-secondary)",
              lineHeight: 1.6, margin: "0 0 var(--sp-4) 0",
            }}>{output.metadata.description}</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--sp-2)", marginBottom: "var(--sp-3)" }}>
              {output.metadata.tags.map((tag) => <Badge key={tag} color="accent">{tag}</Badge>)}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--sp-2)", marginBottom: "var(--sp-4)" }}>
              {output.metadata.hashtags.map((ht) => <Badge key={ht} color="success">{ht}</Badge>)}
            </div>
            <div style={monoBoxStyle}>
              <span style={tinyLabel}>Thumbnail Prompt</span>
              {output.metadata.thumbPrompt}
            </div>
          </Card>

          {/* Script */}
          <div style={{ marginBottom: "var(--sp-6)" }}>
            <SectionHeader title="Guion" subtitle={`${output.script.scenes.length} escenas`} />
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-3)" }}>
              {output.script.scenes.map((scene) => (
                <Card key={scene.id} padding="var(--sp-3) var(--sp-4)">
                  <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-2)", marginBottom: "var(--sp-2)" }}>
                    <Badge color="accent">#{scene.id}</Badge>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", fontWeight: 600, color: "var(--accent)" }}>
                      {fmtTime(scene.startSec)}&ndash;{fmtTime(scene.endSec)}
                    </span>
                  </div>
                  <p style={{
                    fontFamily: "var(--font-body)", fontSize: "13px", color: "var(--text)", lineHeight: 1.6, margin: 0,
                  }}>{scene.narration}</p>
                  {scene.onScreenText && (
                    <div style={{
                      marginTop: "var(--sp-2)", fontFamily: "var(--font-mono)", fontSize: "11px", fontWeight: 600,
                      color: "var(--warning)", background: "var(--panel-2)", padding: "var(--sp-1) var(--sp-3)",
                      borderRadius: "var(--radius-sm)", display: "inline-block",
                    }}>ON SCREEN: {scene.onScreenText}</div>
                  )}
                </Card>
              ))}
            </div>
          </div>

          {/* Prompts */}
          <div style={{ marginBottom: "var(--sp-6)" }}>
            <SectionHeader title="Prompts Visuales" subtitle={`${output.prompts.length} prompts`} />
            <div style={{
              display: "flex", flexDirection: "column", gap: "var(--sp-3)",
              maxHeight: "480px", overflowY: "auto", paddingRight: "var(--sp-1)",
            }}>
              {output.prompts.map((p) => (
                <Card key={p.sceneId} padding="var(--sp-3) var(--sp-4)">
                  <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-2)", marginBottom: "var(--sp-2)" }}>
                    <Badge color="accent">Scene {p.sceneId}</Badge>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--muted)" }}>{p.time}</span>
                  </div>
                  <p style={{
                    fontFamily: "var(--font-body)", fontSize: "13px", color: "var(--text)",
                    lineHeight: 1.6, margin: "0 0 var(--sp-2) 0", fontStyle: "italic",
                  }}>{p.prompt}</p>
                  <div style={{ fontSize: "11px", fontFamily: "var(--font-body)", color: "var(--text-secondary)" }}>
                    <span style={{ fontWeight: 700, fontSize: "9px", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--dim)", marginRight: "var(--sp-1)" }}>Style</span>
                    {p.style}
                  </div>
                  <div style={{ fontSize: "11px", fontFamily: "var(--font-body)", color: "var(--muted)", marginTop: "var(--sp-1)" }}>
                    <span style={{ fontWeight: 700, fontSize: "9px", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--danger)", marginRight: "var(--sp-1)" }}>Negative</span>
                    {p.negativePrompt}
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Casting */}
          {output.casting.length > 0 && (
            <div style={{ marginBottom: "var(--sp-8)" }}>
              <SectionHeader title="Casting" subtitle={`${output.casting.length} personajes`} />
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "var(--sp-3)" }}>
                {output.casting.map((char) => (
                  <Card key={char.name} padding="var(--sp-4) var(--sp-5)">
                    <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-2)", marginBottom: "var(--sp-2)" }}>
                      <span style={{ fontSize: "14px", fontWeight: 600, fontFamily: "var(--font-body)", color: "var(--text)" }}>{char.name}</span>
                      <Badge color="warning">{char.role}</Badge>
                    </div>
                    <p style={{
                      fontFamily: "var(--font-body)", fontSize: "12px", color: "var(--text-secondary)",
                      lineHeight: 1.6, margin: "0 0 var(--sp-3) 0",
                    }}>{char.desc}</p>
                    <div style={{ ...monoBoxStyle, fontSize: "10px", padding: "var(--sp-2) var(--sp-3)" }}>
                      <span style={{ ...tinyLabel, marginBottom: "2px" }}>Consistency Prompt</span>
                      {char.consistencyPrompt}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Action Bar */}
          <Card padding="var(--sp-4) var(--sp-5)" style={{ position: "sticky", bottom: "var(--sp-4)", zIndex: 100, boxShadow: "var(--shadow-lg)" }}>
            <div style={{ display: "flex", gap: "var(--sp-3)", flexWrap: "wrap", alignItems: "center" }}>
              <Button variant="secondary" size="md" onClick={handleCopyJSON}>Copiar JSON</Button>
              <Button variant="secondary" size="md" onClick={handleDownload}>Descargar Paquete</Button>
              <div style={{ flex: 1 }} />
              <Button variant="ghost" size="md" onClick={handleSaveProject}>Guardar Proyecto</Button>
              <Button variant="primary" size="md" onClick={handleSendToDirector}>Enviar a Director</Button>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
