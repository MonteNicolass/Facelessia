"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { generateMockScenes, generateMockCasting } from "@/lib/mockGenerate";
import { exportJSON } from "@/lib/exporters";
import { fmtTime } from "@/lib/scriptParse";
import Topbar from "@/components/Topbar";
import Panel from "@/components/Panel";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";

const DURATION_OPTIONS = [
  { value: 30, label: "Short", sub: "30s" },
  { value: 60, label: "Estandar", sub: "60s" },
  { value: 90, label: "Long", sub: "90s" },
];
const STYLE_OPTIONS = [
  { value: "epica", label: "Epica" },
  { value: "educativo", label: "Educativo" },
  { value: "drama", label: "Drama" },
  { value: "tech", label: "Tech" },
];
const LANG_OPTIONS = [
  { value: "es", label: "Espanol" },
  { value: "en", label: "English" },
];

export default function StudioPage() {
  const { state, dispatch } = useStore();
  const router = useRouter();
  const { config, scenes, casting, loading } = state.studio;
  const hasOutput = scenes.length > 0;

  const [toast, setToast] = useState(null);
  function showToast(msg) { setToast(msg); setTimeout(() => setToast(null), 2000); }

  /* ── Generate ── */
  const handleGenerate = useCallback(() => {
    if (!config.topic.trim()) return;
    dispatch({ type: "SET_STUDIO_LOADING", payload: true });
    setTimeout(() => {
      const sc = generateMockScenes(config);
      const ca = generateMockCasting(config);
      dispatch({ type: "SET_STUDIO_SCENES", payload: sc });
      dispatch({ type: "SET_STUDIO_CASTING", payload: ca });
    }, 250);
  }, [config, dispatch]);

  /* ── Send to Director ── */
  const handleSendToDirector = useCallback(() => {
    if (!scenes.length) return;
    const text = scenes
      .map((s) => `[${fmtTime(s.start)}-${fmtTime(s.end)}] ${s.voiceover}`)
      .join("\n");
    dispatch({ type: "SET_DIR_RAW", payload: text });
    router.push("/director");
  }, [scenes, dispatch, router]);

  /* ── Export JSON ── */
  function handleExportJSON() {
    exportJSON(scenes, { topic: config.topic, duration: config.duration, style: config.style });
    showToast("JSON exportado");
  }

  /* ── Save project ── */
  function handleSave() {
    dispatch({
      type: "SAVE_PROJECT",
      payload: { type: "studio", name: config.topic || "Studio Project", data: { config, scenes, casting } },
    });
    showToast("Guardado");
  }

  /* ── Scene inline edit ── */
  function updateScene(id, changes) {
    dispatch({ type: "UPDATE_STUDIO_SCENE", payload: { id, ...changes } });
  }

  /* ══════ RENDER ══════ */

  return (
    <div style={{ position: "relative" }}>
      <style>{`
        .studio-grid { display: grid; grid-template-columns: 280px 1fr 240px; gap: var(--sp-5); align-items: start; }
        @media (max-width: 1024px) { .studio-grid { grid-template-columns: 260px 1fr; } .studio-actions { display: none; } }
        @media (max-width: 768px) { .studio-grid { grid-template-columns: 1fr; } .studio-actions { display: flex; } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes toastIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", bottom: "var(--sp-6)", right: "var(--sp-6)", background: "var(--success)",
          color: "#fff", fontSize: "12px", fontWeight: 600, padding: "var(--sp-2) var(--sp-5)",
          borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-lg)", zIndex: 9999,
          animation: "toastIn 0.15s ease", pointerEvents: "none",
        }}>{toast}</div>
      )}

      <Topbar title="AI Video Studio" badge="mock">
        {hasOutput && <Button variant="ghost" size="sm" onClick={() => dispatch({ type: "STUDIO_RESET" })}>Nuevo</Button>}
      </Topbar>

      {/* ── Loading ── */}
      {loading && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 300, gap: "var(--sp-4)" }}>
          <div style={{ width: 40, height: 40, borderRadius: "var(--radius-full)", border: "3px solid var(--border)", borderTopColor: "var(--accent)", animation: "spin 0.8s linear infinite" }} />
          <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-secondary)" }}>Generando...</span>
        </div>
      )}

      {/* ── 3-Column Grid ── */}
      {!loading && (
        <div className="studio-grid">
          {/* ── LEFT: Input ── */}
          <Panel title="Input">
            {/* Topic */}
            <div>
              <Label>Tema</Label>
              <textarea
                rows={3}
                value={config.topic}
                onChange={(e) => dispatch({ type: "SET_STUDIO_CONFIG", payload: { topic: e.target.value } })}
                placeholder="Ej: La historia oculta del Coliseo Romano"
                style={taStyle}
                onFocus={(e) => (e.target.style.borderColor = "var(--accent-border)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
              />
            </div>

            {/* Duration */}
            <div>
              <Label>Duracion</Label>
              <div style={{ display: "flex", gap: "var(--sp-2)" }}>
                {DURATION_OPTIONS.map((o) => (
                  <Chip key={o.value} active={config.duration === o.value}
                    onClick={() => dispatch({ type: "SET_STUDIO_CONFIG", payload: { duration: o.value } })}>
                    <div style={{ fontSize: "12px", fontWeight: 600, color: config.duration === o.value ? "var(--accent)" : "var(--text)" }}>{o.label}</div>
                    <div style={{ fontSize: "10px", fontFamily: "var(--font-mono)", color: config.duration === o.value ? "var(--accent)" : "var(--muted)" }}>{o.sub}</div>
                  </Chip>
                ))}
              </div>
            </div>

            {/* Style */}
            <div>
              <Label>Estilo</Label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--sp-2)" }}>
                {STYLE_OPTIONS.map((o) => (
                  <Chip key={o.value} active={config.style === o.value}
                    onClick={() => dispatch({ type: "SET_STUDIO_CONFIG", payload: { style: o.value } })}>
                    <div style={{ fontSize: "12px", fontWeight: 600, color: config.style === o.value ? "var(--accent)" : "var(--text)" }}>{o.label}</div>
                  </Chip>
                ))}
              </div>
            </div>

            {/* Language */}
            <div>
              <Label>Idioma</Label>
              <div style={{ display: "flex", gap: "var(--sp-2)" }}>
                {LANG_OPTIONS.map((o) => (
                  <Chip key={o.value} active={config.language === o.value}
                    onClick={() => dispatch({ type: "SET_STUDIO_CONFIG", payload: { language: o.value } })}>
                    <div style={{ fontSize: "12px", fontWeight: 600, color: config.language === o.value ? "var(--accent)" : "var(--text)" }}>{o.label}</div>
                  </Chip>
                ))}
              </div>
            </div>

            <Button variant="primary" size="lg" onClick={handleGenerate} disabled={loading || !config.topic.trim()} style={{ width: "100%" }}>
              Generar Paquete
            </Button>
          </Panel>

          {/* ── CENTER: Outputs ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-4)", minWidth: 0 }}>
            {!hasOutput ? (
              <div style={{ padding: "var(--sp-10) var(--sp-6)", textAlign: "center", border: "1px dashed var(--border)", borderRadius: "var(--radius-lg)", background: "var(--bg-raised)" }}>
                <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "var(--sp-2)" }}>Sin output</div>
                <div style={{ fontSize: "12px", color: "var(--muted)" }}>Configura y genera para ver escenas, prompts y casting</div>
              </div>
            ) : (
              <>
                {/* Summary */}
                <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-3)", padding: "var(--sp-2) var(--sp-4)", background: "var(--panel)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--text-secondary)", fontWeight: 600 }}>{scenes.length} escenas</span>
                  <span style={{ color: "var(--dim)", fontSize: "10px" }}>&middot;</span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--accent)" }}>{config.duration}s</span>
                  <span style={{ color: "var(--dim)", fontSize: "10px" }}>&middot;</span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--muted)" }}>{config.style}</span>
                </div>

                {/* Scene list */}
                <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-2)", maxHeight: "calc(100vh - 200px)", overflowY: "auto", paddingRight: "var(--sp-1)" }}>
                  {scenes.map((sc) => (
                    <SceneCard key={sc.id} scene={sc} onUpdate={(changes) => updateScene(sc.id, changes)} />
                  ))}
                </div>

                {/* Casting */}
                {casting.length > 0 && (
                  <div>
                    <div style={{ fontSize: "10px", fontWeight: 700, fontFamily: "var(--font-mono)", color: "var(--dim)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "var(--sp-2)" }}>
                      Casting
                    </div>
                    <div style={{ display: "flex", gap: "var(--sp-2)", flexWrap: "wrap" }}>
                      {casting.map((c) => (
                        <Card key={c.id} style={{ padding: "var(--sp-2) var(--sp-3)", flex: "1 1 200px" }}>
                          <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text)" }}>{c.name}</div>
                          <div style={{ fontSize: "10px", color: "var(--muted)" }}>{c.role} — {c.description}</div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* ── RIGHT: Actions ── */}
          <div className="studio-actions" style={{ display: "flex", flexDirection: "column", gap: "var(--sp-3)" }}>
            {hasOutput && (
              <Panel title="Acciones">
                <Button variant="primary" size="md" onClick={handleSendToDirector} style={{ width: "100%" }}>
                  Enviar a Director Pro
                </Button>
                <Button variant="secondary" size="md" onClick={handleExportJSON} style={{ width: "100%" }}>
                  Export JSON
                </Button>
                <Button variant="ghost" size="sm" onClick={handleSave} style={{ width: "100%" }}>
                  Guardar Proyecto
                </Button>
                <Button variant="ghost" size="sm" onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(scenes, null, 2)).then(() => showToast("Copiado"));
                }} style={{ width: "100%" }}>
                  Copiar JSON
                </Button>
              </Panel>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Scene Card ── */
function SceneCard({ scene, onUpdate }) {
  const [expanded, setExpanded] = useState(false);
  const sc = scene;
  return (
    <div>
      <Card
        onClick={() => setExpanded(!expanded)}
        style={{
          cursor: "pointer", padding: "var(--sp-3) var(--sp-4)",
          borderLeft: expanded ? "3px solid var(--accent)" : "3px solid var(--border)",
          borderRadius: expanded ? "var(--radius-md) var(--radius-md) 0 0" : "var(--radius-md)",
          background: expanded ? "var(--bg-raised)" : undefined,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-2)", marginBottom: "var(--sp-2)", flexWrap: "wrap" }}>
          <Badge color="accent">#{sc.id}</Badge>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--text-secondary)", fontWeight: 600 }}>
            {fmtTime(sc.start)}&ndash;{fmtTime(sc.end)}
          </span>
          <Badge color="warning">{sc.motion_suggestion}</Badge>
          {sc.sfx_suggestion && sc.sfx_suggestion !== "none" && <Badge color="success">{sc.sfx_suggestion}</Badge>}
        </div>
        <p style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.55, margin: 0 }}>
          {sc.voiceover.length > 140 ? sc.voiceover.slice(0, 140) + "..." : sc.voiceover}
        </p>
        {sc.broll_query && (
          <div style={{ fontSize: "11px", color: "var(--muted)", marginTop: "var(--sp-1)" }}>
            <span style={{ fontWeight: 700, color: "var(--pink)", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.05em", marginRight: "var(--sp-2)" }}>B-ROLL:</span>
            <span style={{ fontStyle: "italic" }}>{sc.broll_query}</span>
          </div>
        )}
        {sc.on_screen_text && (
          <div style={{ marginTop: "var(--sp-1)", fontFamily: "var(--font-mono)", fontSize: "10px", fontWeight: 600, color: "var(--warning)" }}>
            OST: {sc.on_screen_text}
          </div>
        )}
      </Card>

      {expanded && (
        <div style={{ padding: "var(--sp-4)", background: "var(--panel)", border: "1px solid var(--accent-border)", borderTop: "none", borderRadius: "0 0 var(--radius-md) var(--radius-md)", display: "flex", flexDirection: "column", gap: "var(--sp-3)" }}>
          <Field label="Voiceover">
            <textarea value={sc.voiceover} onChange={(e) => onUpdate({ voiceover: e.target.value })} rows={3} style={taStyle} />
          </Field>
          <Field label="Visual Prompt">
            <textarea value={sc.visual_prompt} onChange={(e) => onUpdate({ visual_prompt: e.target.value })} rows={2} style={taStyle} />
          </Field>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--sp-3)" }}>
            <Field label="B-Roll Query">
              <input type="text" value={sc.broll_query} onChange={(e) => onUpdate({ broll_query: e.target.value })} style={inpStyle} />
            </Field>
            <Field label="On-Screen Text">
              <input type="text" value={sc.on_screen_text || ""} onChange={(e) => onUpdate({ on_screen_text: e.target.value })} style={inpStyle} />
            </Field>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Small helpers ── */
function Label({ children }) {
  return <div style={{ fontSize: "10px", fontWeight: 700, fontFamily: "var(--font-body)", color: "var(--dim)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "var(--sp-2)" }}>{children}</div>;
}
function Field({ label, children }) {
  return <div><div style={{ fontSize: "10px", fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "var(--sp-1)" }}>{label}</div>{children}</div>;
}
function Chip({ active, onClick, children }) {
  return (
    <div onClick={onClick} style={{
      flex: 1, minWidth: 0, padding: "var(--sp-2) var(--sp-3)", textAlign: "center", cursor: "pointer",
      background: active ? "var(--accent-muted)" : "var(--panel-2)",
      border: active ? "1px solid var(--accent-border)" : "1px solid var(--border)",
      borderRadius: "var(--radius-md)", transition: "all var(--transition-fast)",
    }}>{children}</div>
  );
}

const inpStyle = {
  width: "100%", fontFamily: "var(--font-body)", fontSize: "12px", color: "var(--text)",
  background: "var(--panel-2)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)",
  padding: "var(--sp-2) var(--sp-3)", outline: "none", boxSizing: "border-box",
};
const taStyle = { ...inpStyle, resize: "vertical", lineHeight: 1.6, minHeight: 48 };
