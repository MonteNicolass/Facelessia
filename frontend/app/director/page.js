"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, Component } from "react";
import { getAIValue } from "@/lib/aiProvidersConfig";
import Topbar from "@/components/Topbar";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Textarea from "@/components/ui/Textarea";
import Link from "next/link";

const PRESETS = [
  { id: "epic", label: "Short Épico" },
  { id: "educational", label: "Educativo" },
  { id: "calm", label: "Storytelling Calmado" },
];

const CHAR_WARNING = 3000;
const CHAR_LIMIT = 5000;
const CHAR_MIN = 50;

const DEMO_SCRIPT = `¿Sabías que tu cerebro puede procesar una imagen en solo 13 milisegundos?
Mientras leés esto, tu mente está creando conexiones a velocidad luz.
Pero acá viene lo loco.
Cada vez que aprendés algo nuevo, tu cerebro físicamente cambia.
Se llama neuroplasticidad.
Es como un músculo que se fortalece con el uso.
Los científicos descubrieron que incluso a los 90 años podés crear nuevas neuronas.
Tu cerebro nunca deja de evolucionar.
Nunca es tarde para cambiar.
El límite no está en tu edad.
Está en tu decisión de seguir aprendiendo.`;  // ~500 chars, 11 líneas

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Director Error Boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "var(--sp-6)", maxWidth: 600, margin: "0 auto" }}>
          <Card style={{ padding: "var(--sp-5)", textAlign: "center" }}>
            <div style={{ fontSize: "48px", marginBottom: "var(--sp-4)" }}>⚠️</div>
            <h2 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "var(--sp-2)", color: "var(--text)" }}>
              Ocurrió un error al analizar el guion
            </h2>
            <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "var(--sp-4)" }}>
              {this.state.error?.message || "Error desconocido"}
            </p>
            <Button variant="primary" onClick={() => window.location.reload()}>
              Reintentar análisis
            </Button>
          </Card>
        </div>
      );
    }
    return this.props.children;
  }
}

function DirectorPageContent() {
  const [script, setScript] = useState("");
  const [decisions, setDecisions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [preset, setPreset] = useState("epic");
  const [errorState, setErrorState] = useState(null);
  const [abortController, setAbortController] = useState(null);

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  }

  useEffect(() => {
    try {
      const saved = localStorage.getItem("director_last_analysis");
      if (saved) {
        const parsed = JSON.parse(saved);
        // Version check - solo cargar si es v1.0 o superior
        if (parsed?.version === "1.0") {
          const savedScript = parsed?.script || "";
          const savedPreset = parsed?.preset || "epic";
          const savedDecisionsRaw = Array.isArray(parsed?.decisionsRaw) ? parsed.decisionsRaw : [];

          setScript(savedScript);
          setPreset(savedPreset);

          // Re-aplicar preset a las decisiones crudas
          if (savedDecisionsRaw.length > 0) {
            const processedDecisions = applyPreset(savedDecisionsRaw, savedPreset);
            setDecisions(processedDecisions);
          }
        }
      }
    } catch {}
  }, []);

  async function handleAnalyze() {
    if (!script?.trim()) {
      showToast("Pegá un guion primero");
      return;
    }

    // Validación de mínimo caracteres
    if (script.length < CHAR_MIN) {
      setErrorState({
        type: "too_short",
        message: "Necesitás al menos 3–4 líneas de guion",
      });
      showToast("Guion muy corto");
      return;
    }

    // Validación de límite de caracteres
    if (script.length > CHAR_LIMIT) {
      setErrorState({
        type: "char_limit",
        message: "Acortá el guion o dividilo en partes",
      });
      showToast("Script muy largo");
      return;
    }

    const claudeKey = getAIValue("claude");
    if (!claudeKey) {
      setErrorState({
        type: "no_key",
        message: "Falta tu clave de Claude",
      });
      return;
    }

    // Crear AbortController para poder cancelar
    const controller = new AbortController();
    setAbortController(controller);

    setLoading(true);
    setDecisions([]);
    setErrorState(null);

    try {
      const rawDecisions = await analyzeWithClaudeRetry(script, claudeKey, controller.signal);
      const processedDecisions = applyPreset(rawDecisions, preset);
      setDecisions(processedDecisions);

      // Guardar con versión + timestamp + decisiones crudas
      localStorage.setItem(
        "director_last_analysis",
        JSON.stringify({
          version: "1.0",
          script,
          preset,
          decisionsRaw: rawDecisions,
          timestamp: new Date().toISOString(),
        })
      );

      showToast("Análisis completado");
    } catch (err) {
      // Si fue cancelado, no mostrar error
      if (err?.name === "AbortError") {
        showToast("Análisis cancelado");
        return;
      }

      const errorCode = err?.code;
      if (errorCode === 401) {
        setErrorState({
          type: "auth",
          message: "Falta tu clave de Claude",
        });
      } else if (errorCode === 429) {
        setErrorState({
          type: "rate_limit",
          message: "Claude saturado, intentá de nuevo en unos segundos",
        });
      } else {
        setErrorState({
          type: "unknown",
          message: err?.message || "Error al analizar el guion",
        });
      }
      showToast("Error: " + (err?.message || "Desconocido"));
    } finally {
      setLoading(false);
      setAbortController(null);
    }
  }

  function handleCancelAnalysis() {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
      setLoading(false);
    }
  }

  function handleLoadExample() {
    setScript(DEMO_SCRIPT);
    setErrorState(null);
    // Auto-ejecutar análisis después de cargar el ejemplo
    setTimeout(() => {
      handleAnalyze();
    }, 100);
  }

  function handleExportTXT() {
    if (!Array.isArray(decisions) || decisions.length === 0) return;

    const shotlistContent = generateShotlistContent(decisions, preset);
    downloadFile(shotlistContent, "shotlist-director.txt", "text/plain");
    showToast("Shotlist exportado");
  }

  async function handleCopyShotlist() {
    if (!Array.isArray(decisions) || decisions.length === 0) return;

    const shotlistContent = generateShotlistContent(decisions, preset);
    try {
      await navigator.clipboard.writeText(shotlistContent);
      showToast("Shotlist copiado");
    } catch {
      showToast("Error al copiar");
    }
  }

  function generateShotlistContent(decisions, preset) {
    const timestamp = new Date().toISOString().split("T")[0];
    const totalDuration = estimateDuration(decisions);

    const lines = [
      "DIRECTOR IA — SHOTLIST PRO",
      "=".repeat(60),
      `Preset: ${preset.toUpperCase()} | Duración estimada: ${totalDuration}s | ${timestamp}`,
      "",
    ];

    decisions.forEach((d, i) => {
      const motionLabel = (d?.motion || "static").toUpperCase().replace(/_/g, " ");
      lines.push(`SHOT ${i + 1} | ${d?.t || "—"} | ${motionLabel}`);
      lines.push(`B-roll: ${d?.broll || "—"}`);
      lines.push(`Motion: ${d?.motion || "static"}`);
      lines.push(`Nota: ${d?.note || "—"}`);
      lines.push("---");
    });

    return lines.join("\n");
  }

  function estimateDuration(decisions) {
    // Extraer último timestamp (ej: "45-50s" → 50)
    const lastDecision = decisions[decisions.length - 1];
    const timeStr = lastDecision?.t || "0-0s";
    const match = timeStr.match(/(\d+)s$/);
    return match ? parseInt(match[1], 10) : 60;
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

  const hasDecisions = Array.isArray(decisions) && decisions.length > 0;
  const charCount = script.length;
  const isOverWarning = charCount > CHAR_WARNING;
  const isOverLimit = charCount > CHAR_LIMIT;
  const isTooShort = charCount > 0 && charCount < CHAR_MIN;
  const isSingleLine = script.trim() && !script.includes("\n");
  const canAnalyze = script?.trim() && !isOverLimit && !isTooShort && !loading;

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
            <Button variant="ghost" size="sm" onClick={handleCopyShotlist}>
              Copiar Shotlist
            </Button>
            <Button variant="ghost" size="sm" onClick={handleExportTXT}>
              Descargar TXT
            </Button>
            <Button variant="ghost" size="sm" onClick={handleExportJSON}>
              Export JSON
            </Button>
          </>
        )}
      </Topbar>

      <div className="dir-grid">
        <Card style={{ display: "flex", flexDirection: "column", gap: "var(--sp-3)" }}>
          <div>
            <Textarea
              label="Guion completo"
              value={script}
              onChange={(e) => setScript(e.target.value)}
              placeholder={
                "Pegá tu guion acá...\n\nCada línea debería ser un beat/escena del video.\nClaude va a analizar el ritmo y decisiones visuales."
              }
              rows={14}
            />
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "var(--sp-1)",
                marginTop: "var(--sp-2)",
                fontSize: "11px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span
                  style={{
                    color: isOverLimit
                      ? "var(--danger)"
                      : isTooShort
                      ? "var(--danger)"
                      : isOverWarning
                      ? "var(--warning)"
                      : "var(--dim)",
                    fontWeight: isOverWarning || isTooShort ? 600 : 400,
                  }}
                >
                  {charCount} / {CHAR_LIMIT} caracteres
                </span>
                {isOverLimit && (
                  <span style={{ color: "var(--danger)", fontWeight: 600 }}>
                    Acortá el guion o dividilo en partes
                  </span>
                )}
                {isTooShort && (
                  <span style={{ color: "var(--danger)", fontWeight: 600 }}>
                    Necesitás al menos 3–4 líneas
                  </span>
                )}
              </div>
              {isSingleLine && !isTooShort && (
                <span style={{ color: "var(--warning)", fontSize: "10px", fontStyle: "italic" }}>
                  Tip: separalo en 3–4 líneas para mejores cortes
                </span>
              )}
            </div>
          </div>

          {errorState && (
            <div
              style={{
                padding: "var(--sp-3)",
                background: "color-mix(in srgb, var(--danger) 8%, var(--panel))",
                border: "1px solid color-mix(in srgb, var(--danger) 20%, transparent)",
                borderRadius: "var(--radius-md)",
                fontSize: "12px",
              }}
            >
              <div style={{ fontWeight: 600, color: "var(--danger)", marginBottom: "var(--sp-1)" }}>
                {errorState.message}
              </div>
              {errorState.type === "no_key" || errorState.type === "auth" ? (
                <Link
                  href="/settings/ai"
                  style={{
                    color: "var(--accent)",
                    textDecoration: "underline",
                    fontSize: "11px",
                  }}
                >
                  Ir a conectar Claude →
                </Link>
              ) : null}
            </div>
          )}

          <div>
            <div
              style={{
                fontSize: "10px",
                fontWeight: 700,
                color: "var(--dim)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: "var(--sp-2)",
              }}
            >
              Preset editorial
            </div>
            <div style={{ display: "flex", gap: "var(--sp-2)" }}>
              {PRESETS.map((p) => (
                <PresetChip
                  key={p.id}
                  active={preset === p.id}
                  onClick={() => setPreset(p.id)}
                  label={p.label}
                />
              ))}
            </div>
          </div>

          <Button
            variant="primary"
            size="lg"
            disabled={!canAnalyze}
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
            <strong style={{ color: "var(--text-secondary)" }}>Tip:</strong> El Director analiza tu guion
            con Claude y aplica el preset editorial seleccionado.
          </div>
        </Card>

        <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-3)", minWidth: 0 }}>
          {loading && (
            <Card style={{ padding: "var(--sp-5)", textAlign: "center" }}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
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
                <div>
                  <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--text)", marginBottom: "var(--sp-1)" }}>
                    Analizando con Claude (~15–20 segundos)
                  </div>
                  <div style={{ fontSize: "11px", color: "var(--muted)" }}>
                    Estamos armando tu shotlist y motions
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={handleCancelAnalysis}>
                  Cancelar
                </Button>
              </div>
            </Card>
          )}

          {!loading && !hasDecisions && (
            <Card style={{ padding: "var(--sp-6)", textAlign: "center" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "var(--sp-4)" }}>
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--dim)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
                </svg>
                <div>
                  <div style={{ fontSize: "15px", fontWeight: 600, color: "var(--text)", marginBottom: "var(--sp-1)" }}>
                    Sin análisis
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "var(--sp-3)" }}>
                    Pegá un guion y hace click en Analizar para obtener decisiones editoriales
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={handleLoadExample}>
                  Ver ejemplo
                </Button>
              </div>
            </Card>
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
                      <th
                        style={{
                          padding: "var(--sp-2) var(--sp-3)",
                          textAlign: "left",
                          fontWeight: 700,
                          fontSize: "10px",
                          color: "var(--dim)",
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                        }}
                      >
                        Time
                      </th>
                      <th
                        style={{
                          padding: "var(--sp-2) var(--sp-3)",
                          textAlign: "left",
                          fontWeight: 700,
                          fontSize: "10px",
                          color: "var(--dim)",
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                        }}
                      >
                        Motion
                      </th>
                      <th
                        style={{
                          padding: "var(--sp-2) var(--sp-3)",
                          textAlign: "left",
                          fontWeight: 700,
                          fontSize: "10px",
                          color: "var(--dim)",
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                        }}
                      >
                        B-roll
                      </th>
                      <th
                        style={{
                          padding: "var(--sp-2) var(--sp-3)",
                          textAlign: "left",
                          fontWeight: 700,
                          fontSize: "10px",
                          color: "var(--dim)",
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                        }}
                      >
                        Nota
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {decisions.map((d, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                        <td
                          style={{
                            padding: "var(--sp-3)",
                            fontFamily: "var(--font-mono)",
                            fontWeight: 600,
                            color: "var(--accent)",
                          }}
                        >
                          {d?.t || "—"}
                        </td>
                        <td style={{ padding: "var(--sp-3)" }}>
                          <Badge color="warning" style={{ fontSize: "10px" }}>
                            {d?.motion || "—"}
                          </Badge>
                        </td>
                        <td style={{ padding: "var(--sp-3)", color: "var(--text-secondary)", maxWidth: 300 }}>
                          {d?.broll || "—"}
                        </td>
                        <td
                          style={{
                            padding: "var(--sp-3)",
                            color: "var(--muted)",
                            fontSize: "11px",
                            fontStyle: "italic",
                          }}
                        >
                          {d?.note || "—"}
                        </td>
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

function PresetChip({ active, onClick, label }) {
  return (
    <div
      onClick={onClick}
      style={{
        flex: 1,
        padding: "var(--sp-2) var(--sp-3)",
        textAlign: "center",
        cursor: "pointer",
        background: active ? "var(--accent-muted)" : "var(--panel-2)",
        border: active ? "1px solid var(--accent-border)" : "1px solid var(--border)",
        borderRadius: "var(--radius-md)",
        fontSize: "11px",
        fontWeight: 600,
        color: active ? "var(--accent)" : "var(--text-secondary)",
        transition: "all var(--transition-fast)",
      }}
    >
      {label}
    </div>
  );
}

async function analyzeWithClaude(script, apiKey, signal) {
  const systemPrompt = `Sos un director de shorts/reels. Analizá el guion y devolvé SOLO un array JSON (sin markdown).

Formato: [{ "t": "0-3s", "motion": "zoom_in", "broll": "persona con celular de noche", "note": "hook fuerte" }]

Motions: zoom_in, zoom_out, pan_left, pan_right, ken_burns, static
B-roll: específico y buscable
Note: por qué funciona editorialmente`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      system: systemPrompt,
      messages: [{ role: "user", content: script }],
    }),
    signal, // AbortController signal
  });

  if (!res.ok) {
    const error = new Error(`Claude error ${res.status}`);
    error.code = res.status;
    throw error;
  }

  const data = await res.json();
  const content = data.content?.[0]?.text;
  if (!content) throw new Error("Sin respuesta de Claude");

  const jsonMatch = content.match(/\[[\s\S]*\]/);
  if (!jsonMatch) throw new Error("Claude no devolvió JSON");

  const decisions = JSON.parse(jsonMatch[0]);
  if (!Array.isArray(decisions) || !decisions.length) throw new Error("JSON inválido");

  return decisions;
}

async function analyzeWithClaudeRetry(script, apiKey, signal, maxRetries = 2) {
  let lastError = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await analyzeWithClaude(script, apiKey, signal);
    } catch (err) {
      lastError = err;

      // Si fue cancelado, lanzar inmediatamente
      if (err?.name === "AbortError") throw err;

      // Solo reintentar en rate limit (429)
      if (err?.code === 429 && attempt < maxRetries) {
        const backoffMs = Math.pow(2, attempt) * 1000; // 1s, 2s
        await new Promise((resolve) => setTimeout(resolve, backoffMs));
        continue;
      }

      // Otros errores o max retries alcanzado
      throw err;
    }
  }

  throw lastError;
}

function applyPreset(decisions, preset) {
  const presetConfig = {
    epic: {
      motions: { zoom_out: "zoom_in", pan_left: "zoom_in", pan_right: "zoom_in", static: "ken_burns" },
      notePrefix: "Impacto",
    },
    educational: {
      motions: { zoom_in: "pan_left", zoom_out: "pan_right", static: "ken_burns" },
      notePrefix: "Explicativo",
    },
    calm: {
      motions: { zoom_in: "ken_burns", zoom_out: "static", pan_left: "ken_burns", pan_right: "static" },
      notePrefix: "Reflexivo",
    },
  };

  const config = presetConfig[preset];
  if (!config) return decisions;

  return decisions.map((d) => {
    const newMotion = config.motions[d.motion] || d.motion;
    const newNote = `${config.notePrefix} — ${d.note}`;
    return { ...d, motion: newMotion, note: newNote };
  });
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

export default function DirectorPage() {
  return (
    <ErrorBoundary>
      <DirectorPageContent />
    </ErrorBoundary>
  );
}
