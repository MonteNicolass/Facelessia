"use client";

import { useState, useCallback } from "react";
import { useStore } from "@/lib/store";
import {
  parseToSegments,
  generateEditMap,
  exportDirectorJSON,
  exportDirectorTXT,
  copyDirectorToClipboard,
} from "@/lib/director";

// ── Motion presets for the editable dropdown ──
const MOTION_TYPES = [
  { type: "slow_zoom_in", label: "Slow Zoom In" },
  { type: "slow_zoom_out", label: "Slow Zoom Out" },
  { type: "pan_left_soft", label: "Pan Left Soft" },
  { type: "pan_right_soft", label: "Pan Right Soft" },
  { type: "push_in_fast", label: "Push In Fast" },
  { type: "hold_static", label: "Hold Static" },
  { type: "micro_shake", label: "Micro Shake" },
  { type: "whip_pan_soft", label: "Whip Pan Soft" },
  { type: "parallax_soft", label: "Parallax Soft" },
];

// ── Emotion → CSS color mapping ──
const EMOTION_COLORS = {
  impacto: "var(--danger)",
  tension: "var(--warning)",
  revelacion: "var(--accent)",
  calma: "var(--success)",
  energia: "var(--pink)",
  cierre: "var(--muted)",
  default: "var(--dim)",
};

// ── Time formatting helper ──
function fmtTime(sec) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// ═══════════════════════════════════════════════════════════════
// DIRECTOR PAGE
// ═══════════════════════════════════════════════════════════════

export default function DirectorPage() {
  const { state, dispatch } = useStore();
  const [toast, setToast] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const { raw, format, duration, segments, selectedId } = state.director;
  const hasSegments = segments.length > 0;
  const totalDuration = hasSegments ? segments[segments.length - 1].end : 0;

  // ── Actions ─────────────────────────────────────────────────

  const handleAnalyze = useCallback(() => {
    if (!raw.trim()) return;
    setIsAnalyzing(true);
    try {
      const parsed = parseToSegments(raw, format, duration);
      const enriched = generateEditMap(parsed);
      dispatch({ type: "SET_DIR_SEGMENTS", payload: enriched });
      if (enriched.length > 0) {
        dispatch({ type: "SET_DIR_SELECTED", payload: enriched[0].id });
      }
    } finally {
      setIsAnalyzing(false);
    }
  }, [raw, format, duration, dispatch]);

  function showToast(text) {
    setToast(text);
    setTimeout(() => setToast(null), 1800);
  }

  function handleCopy() {
    copyDirectorToClipboard(segments).then(() => showToast("Copiado"));
  }

  function handleSaveRun() {
    dispatch({
      type: "SAVE_RUN",
      payload: {
        type: "director",
        name: `Director ${new Date().toLocaleDateString("es-AR")}`,
        input: { raw, format, duration },
        output: { segments },
      },
    });
    showToast("Run guardado");
  }

  function updateSegment(id, changes) {
    dispatch({ type: "UPDATE_DIR_SEGMENT", payload: { id, ...changes } });
  }

  // ── Render ──────────────────────────────────────────────────

  return (
    <div style={{ position: "relative" }}>
      {/* ════ Toast ════ */}
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: "var(--sp-6)",
            right: "var(--sp-6)",
            background: "var(--success)",
            color: "#fff",
            fontFamily: "var(--font-body)",
            fontSize: "13px",
            fontWeight: 600,
            padding: "var(--sp-2) var(--sp-5)",
            borderRadius: "var(--radius-md)",
            boxShadow: "var(--shadow-lg)",
            zIndex: 9999,
            animation: "fadeIn 0.15s ease",
          }}
        >
          {toast}
        </div>
      )}

      {/* ════ Header ════ */}
      <div style={{ marginBottom: "var(--sp-6)" }}>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 400,
            fontSize: "28px",
            color: "var(--text)",
            lineHeight: 1.15,
            margin: "0 0 var(--sp-2) 0",
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
            maxWidth: "560px",
          }}
        >
          Pega un guion, configura el formato y analiza. El Director genera
          decisiones de edicion automaticas por segmento: motion, b-roll, SFX,
          texto en pantalla y notas.
        </p>
      </div>

      {/* ════ Two-Panel Grid ════ */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "var(--sp-8)",
          alignItems: "start",
        }}
      >
        {/* ──────── LEFT PANEL: Input + Controls ──────── */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--sp-4)",
          }}
        >
          {/* Textarea */}
          <textarea
            value={raw}
            onChange={(e) =>
              dispatch({ type: "SET_DIR_RAW", payload: e.target.value })
            }
            placeholder={
              "Peg\u00e1 tu gui\u00f3n ac\u00e1...\n\n[0:00] Primera escena...\n[0:08] Segunda escena..."
            }
            style={{
              width: "100%",
              minHeight: "200px",
              resize: "vertical",
              fontFamily: "var(--font-mono)",
              fontSize: "13px",
              lineHeight: 1.7,
              color: "var(--text)",
              background: "var(--panel-2)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-md)",
              padding: "var(--sp-4)",
              outline: "none",
              transition: "border-color var(--transition-fast)",
              boxSizing: "border-box",
            }}
            onFocus={(e) =>
              (e.target.style.borderColor = "var(--accent-border)")
            }
            onBlur={(e) =>
              (e.target.style.borderColor = "var(--border)")
            }
          />

          {/* Controls row */}
          <div
            style={{
              display: "flex",
              gap: "var(--sp-3)",
              alignItems: "flex-end",
            }}
          >
            {/* Format select */}
            <div style={{ flex: 1 }}>
              <label
                style={{
                  display: "block",
                  fontSize: "10px",
                  fontWeight: 600,
                  fontFamily: "var(--font-body)",
                  color: "var(--dim)",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginBottom: "var(--sp-1)",
                }}
              >
                Formato
              </label>
              <select
                value={format}
                onChange={(e) =>
                  dispatch({ type: "SET_DIR_FORMAT", payload: e.target.value })
                }
                style={{
                  width: "100%",
                  fontFamily: "var(--font-body)",
                  fontSize: "13px",
                  color: "var(--text)",
                  background: "var(--panel-2)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-md)",
                  padding: "var(--sp-2) var(--sp-3)",
                  outline: "none",
                  cursor: "pointer",
                  appearance: "auto",
                }}
              >
                <option value="short">Short ~60s</option>
                <option value="long">Long ~180s</option>
                <option value="reels">Reels ~30s</option>
              </select>
            </div>

            {/* Duration input */}
            <div style={{ width: "110px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "10px",
                  fontWeight: 600,
                  fontFamily: "var(--font-body)",
                  color: "var(--dim)",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginBottom: "var(--sp-1)",
                }}
              >
                Duracion
              </label>
              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <input
                  type="number"
                  min={15}
                  max={300}
                  value={duration}
                  onChange={(e) =>
                    dispatch({
                      type: "SET_DIR_DURATION",
                      payload: Math.max(15, Math.min(300, Number(e.target.value) || 15)),
                    })
                  }
                  style={{
                    width: "70px",
                    fontFamily: "var(--font-mono)",
                    fontSize: "13px",
                    color: "var(--text)",
                    background: "var(--panel-2)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius-md)",
                    padding: "var(--sp-2) var(--sp-2)",
                    outline: "none",
                    textAlign: "center",
                  }}
                />
                <span
                  style={{
                    fontSize: "12px",
                    fontFamily: "var(--font-mono)",
                    color: "var(--muted)",
                  }}
                >
                  s
                </span>
              </div>
            </div>
          </div>

          {/* Analyze button */}
          <button
            onClick={handleAnalyze}
            disabled={!raw.trim() || isAnalyzing}
            style={{
              width: "100%",
              padding: "var(--sp-3) var(--sp-5)",
              fontFamily: "var(--font-body)",
              fontSize: "14px",
              fontWeight: 600,
              color: "#fff",
              background: !raw.trim() || isAnalyzing
                ? "var(--accent-muted)"
                : "var(--accent)",
              border: "none",
              borderRadius: "var(--radius-md)",
              cursor: !raw.trim() || isAnalyzing ? "not-allowed" : "pointer",
              transition: "background var(--transition-fast)",
              opacity: !raw.trim() || isAnalyzing ? 0.5 : 1,
            }}
            onMouseEnter={(e) => {
              if (raw.trim() && !isAnalyzing)
                e.target.style.background = "var(--accent-hover)";
            }}
            onMouseLeave={(e) => {
              if (raw.trim() && !isAnalyzing)
                e.target.style.background = "var(--accent)";
            }}
          >
            {isAnalyzing ? "Analizando..." : "Analizar Script"}
          </button>

          {/* Export bar */}
          {hasSegments && (
            <div
              style={{
                display: "flex",
                gap: "var(--sp-2)",
                flexWrap: "wrap",
                padding: "var(--sp-3) var(--sp-4)",
                background: "var(--surface)",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <ExportBtn onClick={() => exportDirectorJSON(segments, format, duration)}>
                JSON
              </ExportBtn>
              <ExportBtn onClick={() => exportDirectorTXT(segments, format)}>
                TXT
              </ExportBtn>
              <ExportBtn onClick={handleCopy}>Copiar</ExportBtn>
              <ExportBtn onClick={handleSaveRun} accent>
                Guardar Run
              </ExportBtn>
            </div>
          )}
        </div>

        {/* ──────── RIGHT PANEL: EDL Results ──────── */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--sp-4)",
          }}
        >
          {/* Empty state */}
          {!hasSegments && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "240px",
                background: "var(--surface)",
                border: "1px dashed var(--border)",
                borderRadius: "var(--radius-lg)",
                padding: "var(--sp-8)",
              }}
            >
              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "14px",
                  color: "var(--muted)",
                  textAlign: "center",
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                Peg&aacute; un gui&oacute;n y hac&eacute; click en Analizar
              </p>
            </div>
          )}

          {/* Summary bar */}
          {hasSegments && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--sp-3)",
                padding: "var(--sp-2) var(--sp-4)",
                background: "var(--surface)",
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
                {segments.length} segmentos
              </span>
              <span style={{ color: "var(--dim)", fontSize: "10px" }}>
                &middot;
              </span>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "12px",
                  color: "var(--accent)",
                }}
              >
                {totalDuration}s
              </span>
              <span style={{ color: "var(--dim)", fontSize: "10px" }}>
                &middot;
              </span>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "12px",
                  color: "var(--muted)",
                }}
              >
                {format}
              </span>
            </div>
          )}

          {/* Segment list */}
          {hasSegments && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "var(--sp-2)",
                maxHeight: "70vh",
                overflowY: "auto",
                paddingRight: "var(--sp-1)",
              }}
            >
              {segments.map((seg, idx) => {
                const isSelected = seg.id === selectedId;
                const emotionColor =
                  EMOTION_COLORS[seg.emotion] || EMOTION_COLORS.default;

                return (
                  <div key={seg.id}>
                    {/* Segment card */}
                    <div
                      onClick={() =>
                        dispatch({ type: "SET_DIR_SELECTED", payload: seg.id })
                      }
                      style={{
                        padding: "var(--sp-3) var(--sp-4)",
                        background: isSelected
                          ? "var(--surface-2)"
                          : "var(--surface)",
                        border: isSelected
                          ? "1px solid var(--accent-border)"
                          : "1px solid var(--border-subtle)",
                        borderRadius: "var(--radius-md)",
                        cursor: "pointer",
                        transition: "all var(--transition-fast)",
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected)
                          e.currentTarget.style.background =
                            "var(--panel-hover)";
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected)
                          e.currentTarget.style.background = "var(--surface)";
                      }}
                    >
                      {/* Header row */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "var(--sp-2)",
                          marginBottom: "var(--sp-2)",
                          flexWrap: "wrap",
                        }}
                      >
                        {/* Segment # badge */}
                        <span
                          style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: "10px",
                            fontWeight: 700,
                            color: "var(--text)",
                            background: "var(--panel-2)",
                            padding: "1px 8px",
                            borderRadius: "var(--radius-sm)",
                            lineHeight: "18px",
                          }}
                        >
                          #{idx + 1}
                        </span>

                        {/* Time range */}
                        <span
                          style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: "11px",
                            color: "var(--accent)",
                            fontWeight: 600,
                          }}
                        >
                          {fmtTime(seg.start)}&ndash;{fmtTime(seg.end)}
                        </span>

                        {/* Emotion badge */}
                        <span
                          style={{
                            fontSize: "10px",
                            fontWeight: 600,
                            fontFamily: "var(--font-body)",
                            color: emotionColor,
                            background: `color-mix(in srgb, ${emotionColor} 12%, transparent)`,
                            border: `1px solid color-mix(in srgb, ${emotionColor} 22%, transparent)`,
                            padding: "1px 8px",
                            borderRadius: "var(--radius-sm)",
                            lineHeight: "18px",
                            textTransform: "capitalize",
                          }}
                        >
                          {seg.emotion || "default"}
                        </span>
                      </div>

                      {/* Text preview */}
                      <p
                        style={{
                          fontFamily: "var(--font-body)",
                          fontSize: "12px",
                          color: "var(--text-secondary)",
                          lineHeight: 1.5,
                          margin: "0 0 var(--sp-2) 0",
                          overflow: "hidden",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                        }}
                      >
                        {seg.text.length > 100
                          ? seg.text.slice(0, 100) + "..."
                          : seg.text}
                      </p>

                      {/* Keywords pills */}
                      {seg.keywords && seg.keywords.length > 0 && (
                        <div
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "4px",
                            marginBottom: "var(--sp-2)",
                          }}
                        >
                          {seg.keywords.map((kw, ki) => (
                            <span
                              key={ki}
                              style={{
                                fontSize: "10px",
                                fontFamily: "var(--font-body)",
                                color: "var(--text-secondary)",
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

                      {/* Motion */}
                      {seg.motion && (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "baseline",
                            gap: "var(--sp-2)",
                            marginBottom: "var(--sp-1)",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "10px",
                              fontWeight: 700,
                              fontFamily: "var(--font-body)",
                              color: "var(--warning)",
                              textTransform: "uppercase",
                              letterSpacing: "0.05em",
                              flexShrink: 0,
                            }}
                          >
                            Motion
                          </span>
                          <span
                            style={{
                              fontSize: "11px",
                              fontFamily: "var(--font-body)",
                              color: "var(--text-secondary)",
                              fontWeight: 600,
                            }}
                          >
                            {seg.motion.label}
                          </span>
                          <span
                            style={{
                              fontSize: "10px",
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
                        <div
                          style={{
                            fontSize: "11px",
                            fontFamily: "var(--font-body)",
                            color: "var(--text-secondary)",
                            fontStyle: "italic",
                            marginBottom: "var(--sp-1)",
                          }}
                        >
                          <span
                            style={{
                              fontWeight: 700,
                              color: "var(--pink)",
                              fontStyle: "normal",
                              fontSize: "10px",
                              textTransform: "uppercase",
                              letterSpacing: "0.05em",
                              marginRight: "var(--sp-2)",
                            }}
                          >
                            B-Roll
                          </span>
                          &ldquo;{seg.broll.query}&rdquo;
                        </div>
                      )}

                      {/* SFX */}
                      {seg.sfx && seg.sfx.effect && (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "var(--sp-2)",
                            marginBottom: "var(--sp-1)",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "10px",
                              fontWeight: 700,
                              fontFamily: "var(--font-body)",
                              color: "var(--success)",
                              textTransform: "uppercase",
                              letterSpacing: "0.05em",
                            }}
                          >
                            SFX
                          </span>
                          <span
                            style={{
                              fontSize: "11px",
                              fontFamily: "var(--font-body)",
                              color: "var(--text-secondary)",
                            }}
                          >
                            {seg.sfx.effect}
                          </span>
                          <span
                            style={{
                              fontSize: "9px",
                              fontWeight: 600,
                              fontFamily: "var(--font-body)",
                              color: "var(--dim)",
                              background: "var(--panel-2)",
                              padding: "1px 6px",
                              borderRadius: "var(--radius-sm)",
                              lineHeight: "16px",
                            }}
                          >
                            {seg.sfx.intensity}
                          </span>
                        </div>
                      )}

                      {/* On-Screen Text */}
                      {seg.onScreenText && (
                        <div
                          style={{
                            fontSize: "11px",
                            fontFamily: "var(--font-body)",
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
                    </div>

                    {/* ── Expanded edit panel for selected segment ── */}
                    {isSelected && (
                      <div
                        style={{
                          marginTop: "var(--sp-1)",
                          padding: "var(--sp-4)",
                          background: "var(--surface-2)",
                          border: "1px solid var(--accent-border)",
                          borderTop: "none",
                          borderRadius: "0 0 var(--radius-md) var(--radius-md)",
                          display: "flex",
                          flexDirection: "column",
                          gap: "var(--sp-3)",
                        }}
                      >
                        <FieldLabel>Motion type</FieldLabel>
                        <select
                          value={seg.motion?.type || "slow_zoom_in"}
                          onChange={(e) => {
                            const preset = MOTION_TYPES.find(
                              (m) => m.type === e.target.value
                            );
                            updateSegment(seg.id, {
                              motion: {
                                ...seg.motion,
                                type: e.target.value,
                                label: preset ? preset.label : e.target.value,
                              },
                            });
                          }}
                          style={{
                            width: "100%",
                            fontFamily: "var(--font-body)",
                            fontSize: "12px",
                            color: "var(--text)",
                            background: "var(--panel-2)",
                            border: "1px solid var(--border)",
                            borderRadius: "var(--radius-sm)",
                            padding: "var(--sp-2) var(--sp-3)",
                            outline: "none",
                            cursor: "pointer",
                          }}
                        >
                          {MOTION_TYPES.map((m) => (
                            <option key={m.type} value={m.type}>
                              {m.label}
                            </option>
                          ))}
                        </select>

                        <FieldLabel>B-roll query</FieldLabel>
                        <input
                          type="text"
                          value={seg.broll?.query || ""}
                          onChange={(e) =>
                            updateSegment(seg.id, {
                              broll: { ...seg.broll, query: e.target.value },
                            })
                          }
                          placeholder="B-roll search query..."
                          style={{
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
                          }}
                        />

                        <FieldLabel>SFX effect</FieldLabel>
                        <input
                          type="text"
                          value={seg.sfx?.effect || ""}
                          onChange={(e) =>
                            updateSegment(seg.id, {
                              sfx: { ...seg.sfx, effect: e.target.value },
                            })
                          }
                          placeholder="SFX effect name..."
                          style={{
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
                          }}
                        />

                        <FieldLabel>Notas</FieldLabel>
                        <textarea
                          value={seg.notes || ""}
                          onChange={(e) =>
                            updateSegment(seg.id, { notes: e.target.value })
                          }
                          placeholder="Notas adicionales para el editor..."
                          rows={2}
                          style={{
                            width: "100%",
                            fontFamily: "var(--font-body)",
                            fontSize: "12px",
                            color: "var(--text)",
                            background: "var(--panel-2)",
                            border: "1px solid var(--border)",
                            borderRadius: "var(--radius-sm)",
                            padding: "var(--sp-2) var(--sp-3)",
                            outline: "none",
                            resize: "vertical",
                            lineHeight: 1.6,
                            boxSizing: "border-box",
                          }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Reset button */}
          {hasSegments && (
            <button
              onClick={() => dispatch({ type: "DIR_RESET" })}
              style={{
                alignSelf: "flex-start",
                padding: "var(--sp-2) var(--sp-4)",
                fontFamily: "var(--font-body)",
                fontSize: "12px",
                fontWeight: 600,
                color: "var(--danger)",
                background: "var(--danger-muted)",
                border: "1px solid color-mix(in srgb, var(--danger) 25%, transparent)",
                borderRadius: "var(--radius-md)",
                cursor: "pointer",
                transition: "all var(--transition-fast)",
                marginTop: "var(--sp-2)",
              }}
              onMouseEnter={(e) =>
                (e.target.style.background = "color-mix(in srgb, var(--danger) 20%, var(--surface))")
              }
              onMouseLeave={(e) =>
                (e.target.style.background = "var(--danger-muted)")
              }
            >
              Limpiar Todo
            </button>
          )}
        </div>
      </div>

      {/* ════ Mobile stacking override (via inline @media) ════ */}
      <style>{`
        @media (max-width: 768px) {
          div[style*="grid-template-columns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// HELPER COMPONENTS
// ═══════════════════════════════════════════════════════════════

function FieldLabel({ children }) {
  return (
    <div
      style={{
        fontSize: "10px",
        fontWeight: 600,
        fontFamily: "var(--font-body)",
        color: "var(--muted)",
        textTransform: "uppercase",
        letterSpacing: "0.06em",
      }}
    >
      {children}
    </div>
  );
}

function ExportBtn({ children, onClick, accent }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "var(--sp-1) var(--sp-3)",
        fontFamily: "var(--font-body)",
        fontSize: "12px",
        fontWeight: 600,
        color: accent ? "var(--accent)" : "var(--text-secondary)",
        background: accent ? "var(--accent-muted)" : "var(--panel-2)",
        border: accent
          ? "1px solid var(--accent-border)"
          : "1px solid var(--border)",
        borderRadius: "var(--radius-sm)",
        cursor: "pointer",
        transition: "all var(--transition-fast)",
        lineHeight: "20px",
      }}
      onMouseEnter={(e) => {
        e.target.style.background = accent
          ? "color-mix(in srgb, var(--accent) 20%, var(--surface))"
          : "var(--panel-hover)";
      }}
      onMouseLeave={(e) => {
        e.target.style.background = accent
          ? "var(--accent-muted)"
          : "var(--panel-2)";
      }}
    >
      {children}
    </button>
  );
}
