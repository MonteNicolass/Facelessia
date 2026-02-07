"use client";

export const dynamic = "force-dynamic";

import { useState, useCallback } from "react";
import { useStore } from "@/lib/store";
import { hasApiKeys } from "@/lib/storage";
import { mockEDL } from "@/lib/mock";
import { generateSRT, generateShotlist } from "@/lib/srt";
import Topbar from "@/components/Topbar";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Textarea from "@/components/ui/Textarea";
import TimelineRow from "@/components/ui/TimelineRow";
import EmptyState from "@/components/ui/EmptyState";

export default function DirectorPage() {
  const { state, dispatch } = useStore();
  const { raw, edl, loading } = state.director;
  const keysOk = hasApiKeys(state.settings);
  const segments = edl?.segments || [];
  const hasEDL = segments.length > 0;

  const [toast, setToast] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  function showToast(msg) { setToast(msg); setTimeout(() => setToast(null), 2000); }

  /* ── Generate EDL from raw script ── */
  const handleGenerate = useCallback(async () => {
    if (!raw.trim()) return;
    dispatch({ type: "SET_DIR_LOADING", payload: true });

    try {
      if (keysOk) {
        const fakeScript = { text: raw, segments: raw.split("\n").filter(Boolean).map((t, i) => ({ id: `seg-${i + 1}`, text: t })) };
        const res = await fetch("/api/llm/director", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ script: fakeScript, idea: { topic: "Director", duration: 60 }, settings: state.settings }),
        });
        if (!res.ok) throw new Error("API error");
        const data = await res.json();
        dispatch({ type: "SET_DIR_EDL", payload: data });
      } else {
        // Demo mode
        await delay(400);
        const fakeScript = { text: raw, segments: raw.split("\n").filter(Boolean).map((t, i) => ({ id: `seg-${i + 1}`, text: t })) };
        const data = mockEDL(fakeScript, { topic: "Director", duration: 60 });
        dispatch({ type: "SET_DIR_EDL", payload: data });
      }
      showToast("EDL generado");
    } catch (err) {
      dispatch({ type: "SET_DIR_LOADING", payload: false });
      showToast("Error: " + err.message);
    }
  }, [raw, keysOk, state.settings, dispatch]);

  /* ── Export JSON ── */
  function handleExportJSON() {
    const json = JSON.stringify(edl, null, 2);
    downloadFile(json, "edl.json", "application/json");
    showToast("EDL JSON exportado");
  }

  /* ── Export SRT ── */
  function handleExportSRT() {
    const srt = generateSRT(segments);
    downloadFile(srt, "subtitles.srt", "text/plain");
    showToast("SRT exportado");
  }

  /* ── Export Shotlist ── */
  function handleExportShotlist() {
    const txt = generateShotlist(segments);
    downloadFile(txt, "shotlist.txt", "text/plain");
    showToast("Shotlist exportado");
  }

  /* ── Save project ── */
  function handleSave() {
    dispatch({
      type: "SAVE_PROJECT",
      payload: {
        mode: "director",
        name: `Director ${new Date().toLocaleDateString("es-AR")}`,
        data: { raw, edl },
      },
    });
    showToast("Proyecto guardado");
  }

  /* ══════ RENDER ══════ */

  return (
    <div style={{ position: "relative" }}>
      <style>{`
        .dir-grid { display: grid; grid-template-columns: 300px 1fr; gap: var(--sp-5); align-items: start; }
        @media (max-width: 768px) { .dir-grid { grid-template-columns: 1fr; } }
        @keyframes toastIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
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

      <Topbar title="Director" badge={keysOk ? "API" : "demo"}>
        {hasEDL && (
          <>
            <Button variant="ghost" size="sm" onClick={handleExportJSON}>JSON</Button>
            <Button variant="ghost" size="sm" onClick={handleExportSRT}>SRT</Button>
            <Button variant="ghost" size="sm" onClick={handleExportShotlist}>Shotlist</Button>
            <Button variant="ghost" size="sm" onClick={handleSave}>Guardar</Button>
          </>
        )}
      </Topbar>

      <div className="dir-grid">
        {/* ── LEFT: Script Input ── */}
        <Card style={{ display: "flex", flexDirection: "column", gap: "var(--sp-3)" }}>
          <Textarea
            label="Script / Guion"
            value={raw}
            onChange={(e) => dispatch({ type: "SET_DIR_RAW", payload: e.target.value })}
            placeholder={"Pega tu guion aca...\n\nPrimera escena del video\nSegunda escena con mas detalle\nTercer bloque narrativo"}
            rows={12}
          />

          <Button variant="primary" size="lg" disabled={!raw.trim() || loading} onClick={handleGenerate} style={{ width: "100%" }}>
            {loading ? "Generando..." : "Generar EDL"}
          </Button>

          {hasEDL && (
            <Button variant="danger" size="sm" onClick={() => dispatch({ type: "DIR_RESET" })} style={{ width: "100%" }}>
              Limpiar
            </Button>
          )}
        </Card>

        {/* ── RIGHT: Timeline ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-3)", minHeight: 400, minWidth: 0 }}>
          {loading && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 200, gap: "var(--sp-4)" }}>
              <div style={{ width: 36, height: 36, borderRadius: "var(--radius-full)", border: "3px solid var(--border)", borderTopColor: "var(--accent)", animation: "spin 0.8s linear infinite" }} />
              <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)" }}>Generando EDL...</span>
            </div>
          )}

          {!loading && !hasEDL && (
            <EmptyState
              icon={
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="2" />
                  <path d="M7 2v20" /><path d="M17 2v20" /><path d="M2 12h20" />
                  <path d="M2 7h5" /><path d="M2 17h5" /><path d="M17 7h5" /><path d="M17 17h5" />
                </svg>
              }
              title="Sin EDL"
              description="Pega un guion y hace click en Generar EDL para ver el timeline"
            />
          )}

          {!loading && hasEDL && (
            <>
              {/* Summary */}
              <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-3)", padding: "var(--sp-2) var(--sp-4)", background: "var(--panel)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--text-secondary)", fontWeight: 600 }}>
                  {segments.length} segmentos
                </span>
                <span style={{ color: "var(--dim)", fontSize: "10px" }}>&middot;</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--accent)" }}>
                  {edl.duration_sec}s
                </span>
                {edl.title && <Badge color="muted">{edl.title}</Badge>}
              </div>

              {/* Segment list */}
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-2)", maxHeight: "calc(100vh - 220px)", overflowY: "auto", paddingRight: "var(--sp-1)" }}>
                {segments.map((seg, i) => (
                  <TimelineRow
                    key={seg.id}
                    segment={seg}
                    index={i}
                    selected={seg.id === selectedId}
                    onSelect={() => setSelectedId(seg.id === selectedId ? null : seg.id)}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
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

function delay(ms) { return new Promise((r) => setTimeout(r, ms)); }
