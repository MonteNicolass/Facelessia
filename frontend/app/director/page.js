"use client";

import { useState, useCallback, useRef } from "react";
import { useStore } from "@/lib/store";
import {
  parseToSegments,
  generateEditMap,
  fmtTime,
  exportDirectorJSON,
  exportDirectorTXT,
  copyDirectorToClipboard,
} from "@/lib/director";
import { MOTION_PRESETS, SFX_PRESETS } from "@/lib/presets";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import SectionHeader from "@/components/ui/SectionHeader";
import EmptyState from "@/components/ui/EmptyState";

// ── Emotion to CSS color mapping ──────────────────────────────
const EMOTION_COLOR = {
  impacto: "var(--danger)",
  tension: "var(--warning)",
  revelacion: "var(--accent)",
  calma: "var(--success)",
  energia: "var(--pink)",
  cierre: "var(--muted)",
};

const EMOTION_BADGE_NAME = {
  impacto: "danger",
  tension: "warning",
  revelacion: "accent",
  calma: "success",
  energia: "pink",
  cierre: "muted",
};

const SFX_INTENSITY_COLOR = {
  sutil: "success",
  medio: "warning",
  fuerte: "danger",
};

// ═══════════════════════════════════════════════════════════════
// DIRECTOR PAGE — Three-column NLE-style layout
// ═══════════════════════════════════════════════════════════════

export default function DirectorPage() {
  const { state, dispatch } = useStore();
  const { raw, mode, segments, selectedId } = state.director;
  const hasSegments = segments.length > 0;
  const totalDuration = hasSegments ? segments[segments.length - 1].end : 0;

  const [toast, setToast] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef(null);

  // ── Toast helper ────────────────────────────────────────────
  function showToast(text) {
    setToast(text);
    setTimeout(() => setToast(null), 1800);
  }

  // ── Analyze ─────────────────────────────────────────────────
  const handleAnalyze = useCallback(() => {
    if (!raw.trim()) return;
    setIsAnalyzing(true);
    try {
      const duration = mode === "short" ? 60 : 180;
      const parsed = parseToSegments(raw, mode, duration);
      const enriched = generateEditMap(parsed);
      dispatch({ type: "SET_DIR_SEGMENTS", payload: enriched });
      if (enriched.length > 0) {
        dispatch({ type: "SET_DIR_SELECTED", payload: enriched[0].id });
      }
    } finally {
      setIsAnalyzing(false);
    }
  }, [raw, mode, dispatch]);

  // ── Import JSON ─────────────────────────────────────────────
  function handleImportJSON(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (data.scenes && Array.isArray(data.scenes)) {
          const formatted = data.scenes
            .map((sc, i) => {
              const ts = sc.start != null ? fmtTime(sc.start) : fmtTime(i * 8);
              return `[${ts}] ${sc.text || sc.narration || sc.description || ""}`;
            })
            .join("\n");
          dispatch({ type: "SET_DIR_RAW", payload: formatted });
          showToast("JSON importado");
        } else if (data.segments && Array.isArray(data.segments)) {
          const formatted = data.segments
            .map((seg) => `[${fmtTime(seg.start || 0)}] ${seg.text || ""}`)
            .join("\n");
          dispatch({ type: "SET_DIR_RAW", payload: formatted });
          showToast("JSON importado");
        }
      } catch {
        showToast("Error al leer JSON");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  // ── Export actions ──────────────────────────────────────────
  function handleExportJSON() {
    const duration = mode === "short" ? 60 : 180;
    exportDirectorJSON(segments, mode, duration);
    showToast("JSON exportado");
  }

  function handleExportTXT() {
    exportDirectorTXT(segments, mode);
    showToast("TXT exportado");
  }

  function handleCopy() {
    copyDirectorToClipboard(segments).then(() => showToast("Copiado al portapapeles"));
  }

  function handleSave() {
    dispatch({
      type: "SAVE_PROJECT",
      payload: {
        type: "director",
        name: `Director ${new Date().toLocaleDateString("es-AR")}`,
        data: { raw, mode, segments },
      },
    });
    showToast("Proyecto guardado");
  }

  // ── Segment editing ─────────────────────────────────────────
  function updateSegment(id, changes) {
    dispatch({ type: "UPDATE_DIR_SEGMENT", payload: { id, ...changes } });
  }

  function handleCopyBlock(seg) {
    const lines = [
      `[${fmtTime(seg.start)}\u2013${fmtTime(seg.end)}] ${seg.text.slice(0, 80)}`,
    ];
    if (seg.motion) lines.push(`  Motion: ${seg.motion.label} \u2014 ${seg.motion.reason}`);
    if (seg.broll) lines.push(`  B-Roll: "${seg.broll.query}"`);
    if (seg.sfx) lines.push(`  SFX: ${seg.sfx.effect} (${seg.sfx.intensity})`);
    if (seg.onScreenText) lines.push(`  On-Screen: ${seg.onScreenText}`);
    if (seg.notes) lines.push(`  Notes: ${seg.notes}`);
    navigator.clipboard.writeText(lines.join("\n")).then(() => showToast("Bloque copiado"));
  }

  function handleCopyPresetName(name) {
    navigator.clipboard.writeText(name).then(() => showToast(`"${name}" copiado`));
  }

  // ── Render ──────────────────────────────────────────────────

  return (
    <div style={{ position: "relative" }}>
      {/* ═══ Responsive inline styles ═══ */}
      <style>{`
        .dir-grid {
          display: grid;
          grid-template-columns: 300px 1fr 220px;
          gap: var(--sp-5);
          align-items: start;
        }
        .dir-grid > .dir-left { min-width: 0; }
        .dir-grid > .dir-center { min-width: 0; }
        .dir-grid > .dir-right { min-width: 0; }
        @media (max-width: 1024px) {
          .dir-grid {
            grid-template-columns: 280px 1fr;
          }
          .dir-grid > .dir-right { display: none; }
        }
        @media (max-width: 768px) {
          .dir-grid {
            grid-template-columns: 1fr;
          }
          .dir-grid > .dir-right { display: flex; }
        }
        .dir-segment-card:hover {
          border-color: var(--border) !important;
        }
        .dir-preset-item:hover {
          background: var(--panel-hover) !important;
        }
        @keyframes dirToastIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* ═══ Toast notification ═══ */}
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: "var(--sp-6)",
            right: "var(--sp-6)",
            background: "var(--success)",
            color: "#fff",
            fontFamily: "var(--font-body)",
            fontSize: "12px",
            fontWeight: 600,
            padding: "var(--sp-2) var(--sp-5)",
            borderRadius: "var(--radius-md)",
            boxShadow: "var(--shadow-lg)",
            zIndex: 9999,
            animation: "dirToastIn 0.15s ease",
            pointerEvents: "none",
          }}
        >
          {toast}
        </div>
      )}

      {/* ═══ Hidden file input for JSON import ═══ */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        onChange={handleImportJSON}
        style={{ display: "none" }}
      />

      {/* ═══ Page header ═══ */}
      <div style={{ marginBottom: "var(--sp-6)" }}>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 400,
            fontSize: "28px",
            color: "var(--text)",
            lineHeight: 1.15,
            margin: "0 0 var(--sp-2) 0",
            letterSpacing: "-0.02em",
          }}
        >
          Editing Director
        </h1>
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "13px",
            color: "var(--muted)",
            lineHeight: 1.6,
            margin: 0,
            maxWidth: 560,
          }}
        >
          Pega un guion con timestamps, configura el formato y analiza.
          El Director genera decisiones de edicion por segmento: motion, b-roll,
          SFX, texto en pantalla y notas para el editor.
        </p>
      </div>

      {/* ═══════════════ THREE-COLUMN GRID ═══════════════ */}
      <div className="dir-grid">

        {/* ────────────────────────────────────────────────
            LEFT PANEL — Input + Controls
        ──────────────────────────────────────────────── */}
        <div
          className="dir-left"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--sp-4)",
            background: "var(--panel)",
            borderRadius: "var(--radius-lg)",
            padding: "var(--sp-5)",
            border: "1px solid var(--border-subtle)",
          }}
        >
          {/* Section title */}
          <div
            style={{
              fontSize: "10px",
              fontWeight: 700,
              fontFamily: "var(--font-mono)",
              color: "var(--dim)",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
            }}
          >
            Script Input
          </div>

          {/* Textarea */}
          <textarea
            value={raw}
            onChange={(e) => dispatch({ type: "SET_DIR_RAW", payload: e.target.value })}
            placeholder={
              "Peg\u00e1 tu gui\u00f3n ac\u00e1...\n\n[0:00] Primera escena del video\n[0:08] Segunda escena con m\u00e1s detalle\n[0:15] Tercer bloque narrativo"
            }
            style={{
              width: "100%",
              minHeight: 250,
              resize: "vertical",
              fontFamily: "var(--font-mono)",
              fontSize: "12px",
              lineHeight: 1.75,
              color: "var(--text)",
              background: "var(--panel-2)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-md)",
              padding: "var(--sp-4)",
              outline: "none",
              transition: "border-color var(--transition-fast)",
              boxSizing: "border-box",
            }}
            onFocus={(e) => (e.target.style.borderColor = "var(--accent-border)")}
            onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
          />

          {/* Import JSON button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
          >
            Importar JSON
          </Button>

          {/* Mode selector */}
          <div>
            <div
              style={{
                fontSize: "10px",
                fontWeight: 600,
                fontFamily: "var(--font-body)",
                color: "var(--dim)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: "var(--sp-2)",
              }}
            >
              Formato
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--sp-2)" }}>
              <ModeCard
                active={mode === "short"}
                label="Shorts"
                detail="~60s"
                onClick={() => dispatch({ type: "SET_DIR_MODE", payload: "short" })}
              />
              <ModeCard
                active={mode === "long"}
                label="Long Form"
                detail="~180s"
                onClick={() => dispatch({ type: "SET_DIR_MODE", payload: "long" })}
              />
            </div>
          </div>

          {/* Analyze button */}
          <Button
            variant="primary"
            size="lg"
            disabled={!raw.trim() || isAnalyzing}
            onClick={handleAnalyze}
            style={{ width: "100%" }}
          >
            {isAnalyzing ? "Analizando..." : "Analizar Gui\u00f3n"}
          </Button>

          {/* Export bar */}
          {hasSegments && (
            <div
              style={{
                display: "flex",
                gap: "var(--sp-2)",
                flexWrap: "wrap",
                padding: "var(--sp-3)",
                background: "var(--panel-2)",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <Button variant="secondary" size="sm" onClick={handleExportJSON}>
                JSON
              </Button>
              <Button variant="secondary" size="sm" onClick={handleExportTXT}>
                TXT
              </Button>
              <Button variant="ghost" size="sm" onClick={handleCopy}>
                Copiar
              </Button>
              <Button variant="ghost" size="sm" onClick={handleSave}>
                Guardar
              </Button>
            </div>
          )}

          {/* Reset */}
          {hasSegments && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => dispatch({ type: "DIR_RESET" })}
            >
              Limpiar
            </Button>
          )}
        </div>

        {/* ────────────────────────────────────────────────
            CENTER PANEL — Timeline / Segment List
        ──────────────────────────────────────────────── */}
        <div
          className="dir-center"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--sp-3)",
            minHeight: 400,
          }}
        >
          {!hasSegments ? (
            <EmptyState
              icon={
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="2" />
                  <path d="M7 2v20" />
                  <path d="M17 2v20" />
                  <path d="M2 12h20" />
                  <path d="M2 7h5" />
                  <path d="M2 17h5" />
                  <path d="M17 7h5" />
                  <path d="M17 17h5" />
                </svg>
              }
              title="Sin segmentos"
              description="Peg\u00e1 un gui\u00f3n y hac\u00e9 click en Analizar para generar el edit map"
            />
          ) : (
            <>
              {/* Summary bar */}
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
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--text-secondary)", fontWeight: 600 }}>
                  {segments.length} segmentos
                </span>
                <span style={{ color: "var(--dim)", fontSize: "10px" }}>&middot;</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--accent)" }}>
                  {totalDuration}s
                </span>
                <span style={{ color: "var(--dim)", fontSize: "10px" }}>&middot;</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--muted)" }}>
                  {mode === "short" ? "Short" : "Long Form"}
                </span>
              </div>

              {/* Scrollable segment list */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "var(--sp-2)",
                  maxHeight: "calc(100vh - 180px)",
                  overflowY: "auto",
                  paddingRight: "var(--sp-1)",
                }}
              >
                {segments.map((seg, idx) => {
                  const isSelected = seg.id === selectedId;
                  const emotionKey = seg.emotion || "default";
                  const borderColor = EMOTION_COLOR[emotionKey] || "var(--border)";
                  const badgeColor = EMOTION_BADGE_NAME[emotionKey] || "muted";

                  return (
                    <div key={seg.id}>
                      {/* Segment card */}
                      <Card
                        className="dir-segment-card"
                        onClick={() => dispatch({ type: "SET_DIR_SELECTED", payload: isSelected ? null : seg.id })}
                        style={{
                          cursor: "pointer",
                          padding: "var(--sp-3) var(--sp-4)",
                          borderLeft: isSelected
                            ? `3px solid var(--accent)`
                            : `3px solid ${borderColor}`,
                          borderColor: isSelected ? "var(--accent-border)" : undefined,
                          background: isSelected ? "var(--bg-raised)" : undefined,
                          transition: "all var(--transition-fast)",
                        }}
                      >
                        {/* Header row: # + time range + emotion */}
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "var(--sp-2)",
                            marginBottom: "var(--sp-2)",
                            flexWrap: "wrap",
                          }}
                        >
                          <Badge color="accent">#{idx + 1}</Badge>
                          <span
                            style={{
                              fontFamily: "var(--font-mono)",
                              fontSize: "11px",
                              color: "var(--text-secondary)",
                              fontWeight: 600,
                            }}
                          >
                            {fmtTime(seg.start)}&ndash;{fmtTime(seg.end)}
                          </span>
                          <Badge color={badgeColor}>
                            {emotionKey}
                          </Badge>
                        </div>

                        {/* Text preview (first 120 chars) */}
                        <p
                          style={{
                            fontFamily: "var(--font-body)",
                            fontSize: "12px",
                            color: "var(--text-secondary)",
                            lineHeight: 1.55,
                            margin: "0 0 var(--sp-2) 0",
                          }}
                        >
                          {seg.text.length > 120 ? seg.text.slice(0, 120) + "..." : seg.text}
                        </p>

                        {/* Keywords pills */}
                        {seg.keywords && seg.keywords.length > 0 && (
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginBottom: "var(--sp-2)" }}>
                            {seg.keywords.map((kw, ki) => (
                              <span
                                key={ki}
                                style={{
                                  fontSize: "10px",
                                  fontFamily: "var(--font-body)",
                                  color: "var(--dim)",
                                  background: "var(--panel-2)",
                                  padding: "1px 7px",
                                  borderRadius: "var(--radius-sm)",
                                  lineHeight: "16px",
                                }}
                              >
                                {kw}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Motion row */}
                        {seg.motion && (
                          <div style={{ display: "flex", alignItems: "baseline", gap: "var(--sp-2)", marginBottom: "var(--sp-1)" }}>
                            <Badge color="warning" style={{ flexShrink: 0 }}>
                              {seg.motion.label}
                            </Badge>
                            <span
                              style={{
                                fontSize: "11px",
                                fontFamily: "var(--font-body)",
                                color: "var(--muted)",
                                fontStyle: "italic",
                              }}
                            >
                              {seg.motion.reason}
                            </span>
                          </div>
                        )}

                        {/* B-Roll */}
                        {seg.broll && seg.broll.query && (
                          <div style={{ fontSize: "11px", fontFamily: "var(--font-body)", color: "var(--text-secondary)", marginBottom: "var(--sp-1)" }}>
                            <span
                              style={{
                                fontWeight: 700,
                                color: "var(--pink)",
                                fontSize: "10px",
                                textTransform: "uppercase",
                                letterSpacing: "0.05em",
                                marginRight: "var(--sp-2)",
                              }}
                            >
                              B-ROLL:
                            </span>
                            <span style={{ fontStyle: "italic" }}>&ldquo;{seg.broll.query}&rdquo;</span>
                          </div>
                        )}

                        {/* SFX */}
                        {seg.sfx && seg.sfx.effect && (
                          <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-2)", marginBottom: "var(--sp-1)" }}>
                            <span
                              style={{
                                fontSize: "10px",
                                fontWeight: 700,
                                color: "var(--success)",
                                textTransform: "uppercase",
                                letterSpacing: "0.05em",
                              }}
                            >
                              SFX:
                            </span>
                            <span style={{ fontSize: "11px", fontFamily: "var(--font-body)", color: "var(--text-secondary)" }}>
                              {seg.sfx.effect}
                            </span>
                            <Badge color={SFX_INTENSITY_COLOR[seg.sfx.intensity] || "muted"}>
                              {seg.sfx.intensity}
                            </Badge>
                          </div>
                        )}

                        {/* On-Screen Text */}
                        {seg.onScreenText && (
                          <div
                            style={{
                              fontSize: "11px",
                              fontFamily: "var(--font-mono)",
                              fontWeight: 600,
                              color: "var(--accent)",
                              marginBottom: "var(--sp-1)",
                            }}
                          >
                            {seg.onScreenText}
                          </div>
                        )}

                        {/* Notes */}
                        {seg.notes && (
                          <div
                            style={{
                              fontSize: "11px",
                              fontFamily: "var(--font-body)",
                              color: "var(--muted)",
                              fontStyle: "italic",
                            }}
                          >
                            {seg.notes}
                          </div>
                        )}
                      </Card>

                      {/* ── Expanded editor panel ── */}
                      {isSelected && (
                        <div
                          style={{
                            marginTop: "1px",
                            padding: "var(--sp-4)",
                            background: "var(--panel)",
                            border: "1px solid var(--accent-border)",
                            borderTop: "none",
                            borderRadius: "0 0 var(--radius-md) var(--radius-md)",
                            display: "flex",
                            flexDirection: "column",
                            gap: "var(--sp-3)",
                          }}
                        >
                          {/* Motion select */}
                          <FieldGroup label="Motion Type">
                            <select
                              value={seg.motion?.type || ""}
                              onChange={(e) => {
                                const preset = MOTION_PRESETS.find((p) => p.id === e.target.value);
                                if (preset) {
                                  updateSegment(seg.id, {
                                    motion: { type: preset.id, label: preset.name, reason: preset.desc },
                                  });
                                }
                              }}
                              style={selectStyle}
                            >
                              {MOTION_PRESETS.map((p) => (
                                <option key={p.id} value={p.id}>
                                  {p.id} — {p.name}
                                </option>
                              ))}
                            </select>
                          </FieldGroup>

                          {/* B-Roll query input */}
                          <FieldGroup label="B-Roll Query">
                            <input
                              type="text"
                              value={seg.broll?.query || ""}
                              onChange={(e) =>
                                updateSegment(seg.id, {
                                  broll: { ...seg.broll, query: e.target.value },
                                })
                              }
                              placeholder="Busqueda de b-roll..."
                              style={inputStyle}
                            />
                          </FieldGroup>

                          {/* SFX select */}
                          <FieldGroup label="SFX">
                            <select
                              value={SFX_PRESETS.find((p) => p.name === seg.sfx?.effect)?.id || ""}
                              onChange={(e) => {
                                const preset = SFX_PRESETS.find((p) => p.id === e.target.value);
                                if (preset) {
                                  updateSegment(seg.id, {
                                    sfx: { effect: preset.name, intensity: preset.intensity },
                                  });
                                }
                              }}
                              style={selectStyle}
                            >
                              {SFX_PRESETS.map((p) => (
                                <option key={p.id} value={p.id}>
                                  {p.name} ({p.intensity})
                                </option>
                              ))}
                            </select>
                          </FieldGroup>

                          {/* Notes textarea */}
                          <FieldGroup label="Notas">
                            <textarea
                              value={seg.notes || ""}
                              onChange={(e) => updateSegment(seg.id, { notes: e.target.value })}
                              placeholder="Notas para el editor..."
                              rows={2}
                              style={{
                                ...inputStyle,
                                resize: "vertical",
                                lineHeight: 1.6,
                                minHeight: 48,
                              }}
                            />
                          </FieldGroup>

                          {/* Copy block */}
                          <Button variant="ghost" size="sm" onClick={() => handleCopyBlock(seg)}>
                            Copiar Bloque
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* ────────────────────────────────────────────────
            RIGHT PANEL — Presets Reference
        ──────────────────────────────────────────────── */}
        <div
          className="dir-right"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--sp-5)",
            background: "var(--panel)",
            borderRadius: "var(--radius-lg)",
            padding: "var(--sp-4)",
            border: "1px solid var(--border-subtle)",
          }}
        >
          {/* Motion Presets */}
          <div>
            <SectionHeader
              title="Motion Presets"
              style={{ marginBottom: "var(--sp-3)" }}
            />
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "var(--sp-1)",
                maxHeight: "calc(50vh - 120px)",
                overflowY: "auto",
              }}
            >
              {MOTION_PRESETS.map((p) => (
                <div
                  key={p.id}
                  className="dir-preset-item"
                  onClick={() => handleCopyPresetName(p.name)}
                  style={{
                    padding: "var(--sp-2) var(--sp-3)",
                    borderRadius: "var(--radius-sm)",
                    cursor: "pointer",
                    transition: "background var(--transition-fast)",
                    background: "transparent",
                  }}
                >
                  <div
                    style={{
                      fontSize: "11px",
                      fontWeight: 600,
                      fontFamily: "var(--font-body)",
                      color: "var(--text)",
                      marginBottom: "2px",
                    }}
                  >
                    {p.name}
                  </div>
                  <div
                    style={{
                      fontSize: "10px",
                      fontFamily: "var(--font-body)",
                      color: "var(--muted)",
                      lineHeight: 1.4,
                    }}
                  >
                    {p.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SFX Presets */}
          <div>
            <SectionHeader
              title="SFX Presets"
              style={{ marginBottom: "var(--sp-3)" }}
            />
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "var(--sp-1)",
                maxHeight: "calc(50vh - 120px)",
                overflowY: "auto",
              }}
            >
              {SFX_PRESETS.map((p) => (
                <div
                  key={p.id}
                  className="dir-preset-item"
                  onClick={() => handleCopyPresetName(p.name)}
                  style={{
                    padding: "var(--sp-2) var(--sp-3)",
                    borderRadius: "var(--radius-sm)",
                    cursor: "pointer",
                    transition: "background var(--transition-fast)",
                    background: "transparent",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "var(--sp-2)",
                      marginBottom: "2px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 600,
                        fontFamily: "var(--font-body)",
                        color: "var(--text)",
                      }}
                    >
                      {p.name}
                    </span>
                    <Badge color={SFX_INTENSITY_COLOR[p.intensity] || "muted"}>
                      {p.intensity}
                    </Badge>
                  </div>
                  <div
                    style={{
                      fontSize: "10px",
                      fontFamily: "var(--font-body)",
                      color: "var(--muted)",
                      lineHeight: 1.4,
                    }}
                  >
                    {p.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// INTERNAL COMPONENTS
// ═══════════════════════════════════════════════════════════════

/** Mode selection card (Shorts / Long Form) */
function ModeCard({ active, label, detail, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        padding: "var(--sp-3)",
        borderRadius: "var(--radius-md)",
        border: active ? "1.5px solid var(--accent)" : "1px solid var(--border)",
        background: active ? "var(--accent-muted)" : "var(--panel-2)",
        cursor: "pointer",
        transition: "all var(--transition-fast)",
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontSize: "12px",
          fontWeight: 600,
          fontFamily: "var(--font-body)",
          color: active ? "var(--accent)" : "var(--text)",
          marginBottom: "2px",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: "10px",
          fontFamily: "var(--font-mono)",
          color: active ? "var(--accent)" : "var(--dim)",
        }}
      >
        {detail}
      </div>
    </div>
  );
}

/** Labeled field group for the expanded segment editor */
function FieldGroup({ label, children }) {
  return (
    <div>
      <div
        style={{
          fontSize: "10px",
          fontWeight: 600,
          fontFamily: "var(--font-body)",
          color: "var(--muted)",
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          marginBottom: "var(--sp-1)",
        }}
      >
        {label}
      </div>
      {children}
    </div>
  );
}

// ── Shared inline style objects ──────────────────────────────

const inputStyle = {
  width: "100%",
  fontFamily: "var(--font-body)",
  fontSize: "12px",
  color: "var(--text)",
  background: "var(--panel-2)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius-sm)",
  padding: "var(--sp-2) var(--sp-3)",
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color var(--transition-fast)",
};

const selectStyle = {
  ...inputStyle,
  cursor: "pointer",
  appearance: "auto",
};
