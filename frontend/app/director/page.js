"use client";

import { useState, useCallback } from "react";
import { useStore } from "@/lib/store";
import { parseScript, recalculateDurations, fmtTime } from "@/lib/scriptParse";
import { exportJSON, exportCSV, exportTXT } from "@/lib/exporters";
import Topbar from "@/components/Topbar";
import Panel from "@/components/Panel";
import TimelineClip from "@/components/TimelineClip";
import Shotlist from "@/components/Shotlist";
import ExportButtons from "@/components/ExportButtons";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";

const MODE_OPTIONS = [
  { value: "short_epico", label: "Short Epico", sub: "~60s" },
  { value: "consistencia", label: "Consistencia", sub: "~60s" },
  { value: "educativo", label: "Educativo", sub: "~90s" },
];

export default function DirectorPage() {
  const { state, dispatch } = useStore();
  const { raw, mode, detectTimestamps, clips, selectedId } = state.director;
  const hasClips = clips.length > 0;
  const totalDuration = hasClips ? clips[clips.length - 1].end : 0;

  const [toast, setToast] = useState(null);
  function showToast(msg) { setToast(msg); setTimeout(() => setToast(null), 1800); }

  /* ── Analyze ── */
  const handleAnalyze = useCallback(() => {
    if (!raw.trim()) return;
    const parsed = parseScript(raw, { detectTimestamps, mode });
    dispatch({ type: "SET_DIR_CLIPS", payload: parsed });
    if (parsed.length > 0) dispatch({ type: "SET_DIR_SELECTED", payload: parsed[0].id });
  }, [raw, mode, detectTimestamps, dispatch]);

  /* ── Recalculate durations ── */
  function handleRecalculate() {
    if (!hasClips) return;
    const dur = mode === "educativo" ? 90 : 60;
    const updated = recalculateDurations(clips, dur);
    dispatch({ type: "SET_DIR_CLIPS", payload: updated });
    showToast("Duraciones recalculadas");
  }

  /* ── Clip update ── */
  function updateClip(id, changes) {
    dispatch({ type: "UPDATE_DIR_CLIP", payload: { id, ...changes } });
  }

  /* ── Save ── */
  function handleSave() {
    dispatch({
      type: "SAVE_PROJECT",
      payload: { type: "director", name: `Director ${new Date().toLocaleDateString("es-AR")}`, data: { raw, mode, clips } },
    });
    showToast("Proyecto guardado");
  }

  /* ══════ RENDER ══════ */

  return (
    <div style={{ position: "relative" }}>
      <style>{`
        .dir-grid { display: grid; grid-template-columns: 300px 1fr 240px; gap: var(--sp-5); align-items: start; }
        @media (max-width: 1024px) { .dir-grid { grid-template-columns: 280px 1fr; } .dir-right { display: none !important; } }
        @media (max-width: 768px) { .dir-grid { grid-template-columns: 1fr; } .dir-right { display: flex !important; } }
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

      <Topbar title="Director Pro">
        {hasClips && (
          <>
            <ExportButtons clips={clips} meta={{ topic: "Director Pro", duration: totalDuration }} onToast={showToast} />
            <Button variant="ghost" size="sm" onClick={handleSave}>Guardar</Button>
          </>
        )}
      </Topbar>

      <div className="dir-grid">
        {/* ── LEFT: Script Ingest ── */}
        <Panel title="Script Ingest">
          <textarea
            value={raw}
            onChange={(e) => dispatch({ type: "SET_DIR_RAW", payload: e.target.value })}
            placeholder={"Pega tu guion aca...\n\n[0:00] Primera escena del video\n[0:08] Segunda escena con mas detalle\n[0:15] Tercer bloque narrativo"}
            style={{
              width: "100%", minHeight: 220, resize: "vertical",
              fontFamily: "var(--font-mono)", fontSize: "12px", lineHeight: 1.75,
              color: "var(--text)", background: "var(--panel-2)",
              border: "1px solid var(--border)", borderRadius: "var(--radius-md)",
              padding: "var(--sp-4)", outline: "none", boxSizing: "border-box",
              transition: "border-color var(--transition-fast)",
            }}
            onFocus={(e) => (e.target.style.borderColor = "var(--accent-border)")}
            onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
          />

          {/* Timestamp toggle */}
          <div
            onClick={() => dispatch({ type: "SET_DIR_DETECT_TS", payload: !detectTimestamps })}
            style={{ display: "flex", alignItems: "center", gap: "var(--sp-2)", cursor: "pointer", padding: "var(--sp-1) 0" }}
          >
            <div style={{
              width: 32, height: 18, borderRadius: 9, background: detectTimestamps ? "var(--accent)" : "var(--border)",
              position: "relative", transition: "background var(--transition-fast)",
            }}>
              <div style={{
                width: 14, height: 14, borderRadius: 7, background: "#fff",
                position: "absolute", top: 2, left: detectTimestamps ? 16 : 2,
                transition: "left var(--transition-fast)",
              }} />
            </div>
            <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>Detectar timestamps</span>
          </div>

          {/* Mode selector */}
          <div>
            <div style={{ fontSize: "10px", fontWeight: 600, color: "var(--dim)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "var(--sp-2)" }}>
              Formato
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-1)" }}>
              {MODE_OPTIONS.map((o) => (
                <div
                  key={o.value}
                  onClick={() => dispatch({ type: "SET_DIR_MODE", payload: o.value })}
                  style={{
                    padding: "var(--sp-2) var(--sp-3)", borderRadius: "var(--radius-sm)", cursor: "pointer",
                    background: mode === o.value ? "var(--accent-muted)" : "transparent",
                    border: mode === o.value ? "1px solid var(--accent-border)" : "1px solid transparent",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    transition: "all var(--transition-fast)",
                  }}
                >
                  <span style={{ fontSize: "12px", fontWeight: 600, color: mode === o.value ? "var(--accent)" : "var(--text)" }}>{o.label}</span>
                  <span style={{ fontSize: "10px", fontFamily: "var(--font-mono)", color: mode === o.value ? "var(--accent)" : "var(--dim)" }}>{o.sub}</span>
                </div>
              ))}
            </div>
          </div>

          <Button variant="primary" size="lg" disabled={!raw.trim()} onClick={handleAnalyze} style={{ width: "100%" }}>
            Analizar Guion
          </Button>

          {hasClips && (
            <>
              <Button variant="secondary" size="sm" onClick={handleRecalculate} style={{ width: "100%" }}>
                Recalcular Duraciones
              </Button>
              <Button variant="danger" size="sm" onClick={() => dispatch({ type: "DIR_RESET" })} style={{ width: "100%" }}>
                Limpiar
              </Button>
            </>
          )}
        </Panel>

        {/* ── CENTER: Timeline ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-3)", minHeight: 400, minWidth: 0 }}>
          {!hasClips ? (
            <EmptyState
              icon={
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="2" />
                  <path d="M7 2v20" /><path d="M17 2v20" /><path d="M2 12h20" />
                  <path d="M2 7h5" /><path d="M2 17h5" /><path d="M17 7h5" /><path d="M17 17h5" />
                </svg>
              }
              title="Sin clips"
              description="Pega un guion y hace click en Analizar para generar el timeline"
            />
          ) : (
            <>
              {/* Summary */}
              <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-3)", padding: "var(--sp-2) var(--sp-4)", background: "var(--panel)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--text-secondary)", fontWeight: 600 }}>{clips.length} clips</span>
                <span style={{ color: "var(--dim)", fontSize: "10px" }}>&middot;</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--accent)" }}>{totalDuration}s</span>
                <span style={{ color: "var(--dim)", fontSize: "10px" }}>&middot;</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--muted)" }}>{mode}</span>
              </div>

              {/* Clip list */}
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-2)", maxHeight: "calc(100vh - 200px)", overflowY: "auto", paddingRight: "var(--sp-1)" }}>
                {clips.map((clip) => (
                  <TimelineClip
                    key={clip.id}
                    clip={clip}
                    selected={clip.id === selectedId}
                    onSelect={() => dispatch({ type: "SET_DIR_SELECTED", payload: clip.id === selectedId ? null : clip.id })}
                    onUpdate={(changes) => updateClip(clip.id, changes)}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* ── RIGHT: Shotlist ── */}
        <div className="dir-right" style={{ display: "flex", flexDirection: "column", gap: "var(--sp-4)" }}>
          <Panel title="Shotlist">
            {hasClips ? (
              <Shotlist clips={clips} />
            ) : (
              <div style={{ fontSize: "11px", color: "var(--muted)", fontStyle: "italic" }}>
                Analiza un guion para ver el shotlist
              </div>
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
}
