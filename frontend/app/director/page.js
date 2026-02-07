"use client";

import { useState, useRef, useEffect } from "react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Textarea from "@/components/ui/Textarea";
import Input from "@/components/ui/Input";
import InlineNotice from "@/components/ui/InlineNotice";
import EmptyState from "@/components/ui/EmptyState";
import { useStore } from "@/lib/store";
import { parseToSegments, generateEditMap, exportEditMapJSON, fmtTime } from "@/lib/edit-map";

// ── Motion presets for cycling ──
const MOTION_PRESETS = [
  { type: "slow_zoom_in", label: "Slow Zoom In" },
  { type: "slow_zoom_out", label: "Slow Zoom Out" },
  { type: "push_in_fast", label: "Push In Fast" },
  { type: "pan_left_soft", label: "Pan Left Soft" },
  { type: "micro_shake", label: "Micro Shake" },
  { type: "whip_pan_soft", label: "Whip Pan Soft" },
];

export default function DirectorPage() {
  const { state, dispatch } = useStore();
  const [analyzeNotice, setAnalyzeNotice] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [source, setSource] = useState(null);
  const importRef = useRef(null);
  const loadedRef = useRef(false);

  const segments = state.editMap.segments || [];
  const selectedSeg = segments.find((s) => s.id === state.editMap.selectedId) || null;
  const hasSegments = segments.length > 0;

  // Load project from URL param
  useEffect(() => {
    if (loadedRef.current) return;
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    if (!id) return;
    const project = state.projects.find((p) => p.id === Number(id));
    if (project && project.type === "director" && project.data?.editMap) {
      dispatch({ type: "SET_EDITMAP_RAW", payload: project.data.editMap.raw || "" });
      dispatch({ type: "SET_EDITMAP_FORMAT", payload: project.data.editMap.format || "short" });
      dispatch({ type: "SET_EDITMAP_SEGMENTS", payload: project.data.editMap.segments || [] });
      if (project.data.editMap.segments?.length > 0) {
        dispatch({ type: "SET_EDITMAP_SELECTED", payload: project.data.editMap.segments[0].id });
      }
      loadedRef.current = true;
    }
  }, [state.projects]);

  // ── Actions ──

  async function handleAnalyze() {
    const raw = (state.editMap.raw || "").trim();
    if (!raw) return;
    setIsAnalyzing(true);
    setSource(null);
    try {
      const fmt = state.editMap.format || "short";
      const dur = fmt === "long" ? 180 : fmt === "reels" ? 30 : 60;
      const res = await fetch("/api/director/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scriptText: raw, format: fmt, targetDurationSec: dur }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      const enriched = data.segments || [];
      dispatch({ type: "SET_EDITMAP_SEGMENTS", payload: enriched });
      setSource(data.source);
      if (enriched.length > 0) {
        dispatch({ type: "SET_EDITMAP_SELECTED", payload: enriched[0].id });
        setAnalyzeNotice({ ok: true, text: `${enriched.length} segmentos analizados (${data.source})` });
      } else {
        setAnalyzeNotice({ ok: false, text: "No se detectaron segmentos. Verifica el texto." });
      }
    } catch {
      try {
        const fmt = state.editMap.format || "short";
        const dur = fmt === "long" ? 180 : fmt === "reels" ? 30 : 60;
        const segs = parseToSegments(raw, fmt, dur);
        const enriched = generateEditMap(segs);
        dispatch({ type: "SET_EDITMAP_SEGMENTS", payload: enriched });
        setSource("mock");
        if (enriched.length > 0) {
          dispatch({ type: "SET_EDITMAP_SELECTED", payload: enriched[0].id });
          setAnalyzeNotice({ ok: true, text: `${enriched.length} segmentos analizados (mock)` });
        } else {
          setAnalyzeNotice({ ok: false, text: "No se detectaron segmentos." });
        }
      } catch {
        setAnalyzeNotice({ ok: false, text: "Error al analizar el texto." });
      }
    } finally {
      setIsAnalyzing(false);
    }
  }

  function handleExport() {
    if (!hasSegments) return;
    exportEditMapJSON(segments, state.editMap.format);
  }

  function handleSave() {
    const name = hasSegments
      ? segments[0].text.slice(0, 40).trim() || "Edit Map"
      : "Edit Map";
    dispatch({
      type: "SAVE_PROJECT",
      payload: {
        type: "director",
        name,
        data: { editMap: state.editMap },
      },
    });
  }

  function handleReset() {
    dispatch({ type: "EDITMAP_RESET" });
    setAnalyzeNotice(null);
    setSource(null);
  }

  function handleImportFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (data.segments && Array.isArray(data.segments)) {
          dispatch({ type: "SET_EDITMAP_SEGMENTS", payload: data.segments });
          if (data.segments.length > 0) {
            dispatch({ type: "SET_EDITMAP_SELECTED", payload: data.segments[0].id });
          }
          setSource("import");
          setAnalyzeNotice({ ok: true, text: `${data.segments.length} segmentos importados` });
        } else if (data.script?.scenes || data.output?.script?.scenes) {
          const scenes = data.script?.scenes || data.output?.script?.scenes || [];
          const raw = scenes.map((s) => s.narration).join("\n\n");
          dispatch({ type: "SET_EDITMAP_RAW", payload: raw });
          setAnalyzeNotice({ ok: true, text: `Script importado (${scenes.length} escenas). Presiona Analizar.` });
        }
      } catch {
        setAnalyzeNotice({ ok: false, text: "Archivo JSON invalido." });
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  function updateSeg(id, changes) {
    dispatch({ type: "UPDATE_SEGMENT", payload: { id, ...changes } });
  }

  function cycleMotion(seg) {
    const currentIdx = MOTION_PRESETS.findIndex((p) => p.type === seg.motion.type);
    const nextIdx = (currentIdx + 1) % MOTION_PRESETS.length;
    const next = MOTION_PRESETS[nextIdx];
    updateSeg(seg.id, {
      motion: { ...seg.motion, type: next.type, label: next.label },
    });
  }

  // ── Helpers ──

  function truncate(text, max = 60) {
    if (!text) return "";
    return text.length > max ? text.slice(0, max) + "..." : text;
  }

  function totalDuration() {
    if (!hasSegments) return 0;
    return segments[segments.length - 1].end;
  }

  // ── Render ──

  return (
    <div>
      {/* ════════════ HEADER ════════════ */}
      <div className="reveal" style={{ marginBottom: "var(--sp-8)" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--sp-3)",
            marginBottom: "var(--sp-2)",
          }}
        >
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 400,
              fontSize: "28px",
              color: "var(--text)",
              lineHeight: 1.15,
              margin: 0,
            }}
          >
            Director
          </h1>
          <Badge
            color="var(--pink)"
            style={{
              fontSize: "10px",
              padding: "2px 10px",
              fontWeight: 700,
              letterSpacing: "0.08em",
            }}
          >
            EDIT MAP
          </Badge>
          <Badge
            color="var(--accent)"
            style={{
              fontSize: "9px",
              padding: "1px 7px",
              fontWeight: 700,
              letterSpacing: "0.06em",
            }}
          >
            PRO
          </Badge>
        </div>
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "13px",
            color: "var(--muted)",
            lineHeight: 1.6,
            maxWidth: "580px",
            margin: 0,
          }}
        >
          Pega un guion, elige el formato y analiza. El Edit Map genera decisiones de
          edicion automaticas: movimiento de camara, b-roll, SFX, texto en pantalla y
          notas para el editor.
        </p>
      </div>

      {/* ════════════ TWO-COLUMN LAYOUT ════════════ */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1.5fr)",
          gap: "var(--sp-8)",
          alignItems: "start",
        }}
      >
        {/* ──────── LEFT: INPUT PANEL ──────── */}
        <div
          className="reveal-d1"
          style={{ display: "flex", flexDirection: "column", gap: "var(--sp-4)" }}
        >
          <SectionLabel>Script</SectionLabel>

          {/* Script textarea */}
          <Textarea
            value={state.editMap.raw || ""}
            onChange={(e) => {
              dispatch({ type: "SET_EDITMAP_RAW", payload: e.target.value });
              setAnalyzeNotice(null);
            }}
            placeholder={
              "Pega tu guion aqui.\n\nCon timestamps:\n[0:00-0:08] Intro hook...\n[0:08-0:20] Desarrollo...\n\nO simplemente parrafos separados por linea en blanco."
            }
            rows={16}
            style={{
              minHeight: "340px",
              fontFamily: "var(--font-body)",
              fontSize: "13px",
              lineHeight: 1.7,
            }}
          />

          {/* Format selector */}
          <div>
            <SectionLabel style={{ marginBottom: "var(--sp-2)" }}>Formato</SectionLabel>
            <div style={{ display: "flex", gap: "var(--sp-2)" }}>
              {[
                { id: "short", label: "Short", dur: "~60s" },
                { id: "long", label: "Long", dur: "~3min" },
                { id: "reels", label: "Reels", dur: "~30s" },
              ].map((fmt) => {
                const isActive = state.editMap.format === fmt.id;
                return (
                  <button
                    key={fmt.id}
                    onClick={() =>
                      dispatch({ type: "SET_EDITMAP_FORMAT", payload: fmt.id })
                    }
                    style={{
                      flex: 1,
                      padding: "var(--sp-2) var(--sp-3)",
                      background: isActive
                        ? "color-mix(in srgb, var(--accent) 12%, var(--panel))"
                        : "var(--panel-2)",
                      border: isActive
                        ? "1px solid var(--accent-border)"
                        : "1px solid var(--border)",
                      borderRadius: "var(--radius-md)",
                      cursor: "pointer",
                      transition: "all var(--transition-fast)",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "2px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "12px",
                        fontWeight: 600,
                        fontFamily: "var(--font-body)",
                        color: isActive ? "var(--accent)" : "var(--text-secondary)",
                      }}
                    >
                      {fmt.label}
                    </span>
                    <span
                      style={{
                        fontSize: "10px",
                        fontFamily: "var(--font-mono)",
                        color: isActive ? "var(--accent)" : "var(--dim)",
                      }}
                    >
                      {fmt.dur}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Analyze button */}
          <Button
            variant="primary"
            onClick={handleAnalyze}
            disabled={!(state.editMap.raw || "").trim() || isAnalyzing}
            style={{ width: "100%" }}
          >
            {isAnalyzing ? "Analizando..." : "Analizar y generar Edit Map"}
          </Button>

          {/* Feedback */}
          {analyzeNotice && (
            <InlineNotice variant={analyzeNotice.ok ? "success" : "error"}>
              {analyzeNotice.text}
            </InlineNotice>
          )}

          {/* Stats card */}
          {hasSegments && (
            <Card
              highlight
              color="var(--accent)"
              style={{ padding: "var(--sp-4) var(--sp-5)" }}
            >
              {source && (
                <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-2)", marginBottom: "var(--sp-3)" }}>
                  <span style={{ fontSize: "10px", fontFamily: "var(--font-body)", color: "var(--dim)" }}>Fuente:</span>
                  <Badge
                    color={source === "mock" || source === "import" ? "var(--dim)" : "var(--success)"}
                    style={{ fontSize: "9px", padding: "1px 7px" }}
                  >
                    {source.toUpperCase()}
                  </Badge>
                </div>
              )}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: "var(--sp-4)",
                }}
              >
                <StatBlock
                  label="Segmentos"
                  value={segments.length}
                  color="var(--accent)"
                />
                <StatBlock
                  label="Duracion total"
                  value={fmtTime(totalDuration())}
                  color="var(--pink)"
                />
                <StatBlock
                  label="Formato"
                  value={
                    state.editMap.format === "short"
                      ? "Short"
                      : state.editMap.format === "long"
                        ? "Long"
                        : "Reels"
                  }
                  color="var(--warning)"
                />
              </div>
            </Card>
          )}
        </div>

        {/* ──────── RIGHT: TIMELINE + DETAIL ──────── */}
        <div
          className="reveal-d2"
          style={{ display: "flex", flexDirection: "column", gap: "var(--sp-5)" }}
        >
          {/* ── C) Empty state ── */}
          {!hasSegments && (
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
                  <rect x="2" y="3" width="20" height="14" rx="2" />
                  <path d="M8 21h8" />
                  <path d="M12 17v4" />
                  <path d="m10 9 4-2v6" />
                </svg>
              }
            >
              Pega un guion en el panel izquierdo, selecciona el formato y presiona
              &quot;Analizar&quot; para generar el Edit Map con decisiones de edicion
              automaticas.
            </EmptyState>
          )}

          {/* ── A) Timeline ── */}
          {hasSegments && (
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "var(--sp-3)",
                }}
              >
                <SectionLabel>Timeline</SectionLabel>
                <span
                  style={{
                    fontSize: "10px",
                    fontFamily: "var(--font-mono)",
                    color: "var(--dim)",
                  }}
                >
                  {segments.length} segmentos &middot; {fmtTime(totalDuration())}
                </span>
              </div>

              <div
                style={{
                  maxHeight: "380px",
                  overflowY: "auto",
                  display: "flex",
                  flexDirection: "column",
                  gap: "var(--sp-1)",
                  paddingRight: "var(--sp-2)",
                }}
              >
                {segments.map((seg) => {
                  const isSelected = seg.id === state.editMap.selectedId;
                  return (
                    <button
                      key={seg.id}
                      onClick={() =>
                        dispatch({
                          type: "SET_EDITMAP_SELECTED",
                          payload: seg.id,
                        })
                      }
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "var(--sp-3)",
                        padding: "var(--sp-3) var(--sp-4)",
                        background: isSelected
                          ? "color-mix(in srgb, var(--accent) 8%, var(--panel))"
                          : "var(--panel)",
                        border: "1px solid",
                        borderColor: isSelected
                          ? "var(--accent-border)"
                          : "var(--border-subtle)",
                        borderLeft: isSelected
                          ? "3px solid var(--accent)"
                          : "3px solid transparent",
                        borderRadius: "var(--radius-md)",
                        cursor: "pointer",
                        transition: "all var(--transition-fast)",
                        textAlign: "left",
                        width: "100%",
                        fontFamily: "var(--font-body)",
                      }}
                    >
                      {/* Segment number */}
                      <span
                        style={{
                          fontSize: "10px",
                          fontWeight: 700,
                          fontFamily: "var(--font-mono)",
                          color: isSelected ? "var(--accent)" : "var(--dim)",
                          minWidth: "18px",
                          flexShrink: 0,
                        }}
                      >
                        {seg.id}
                      </span>

                      {/* Time badge */}
                      <Badge
                        color="var(--accent)"
                        style={{
                          fontSize: "9px",
                          padding: "1px 6px",
                          flexShrink: 0,
                          fontFamily: "var(--font-mono)",
                        }}
                      >
                        {fmtTime(seg.start)}-{fmtTime(seg.end)}
                      </Badge>

                      {/* Text preview */}
                      <span
                        style={{
                          flex: 1,
                          fontSize: "12px",
                          color: isSelected
                            ? "var(--text)"
                            : "var(--text-secondary)",
                          lineHeight: 1.4,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {truncate(seg.text, 60)}
                      </span>

                      {/* Motion chip */}
                      <Badge
                        color="var(--warning)"
                        style={{
                          fontSize: "9px",
                          padding: "1px 6px",
                          flexShrink: 0,
                        }}
                      >
                        {seg.motion.label}
                      </Badge>

                      {/* SFX chip */}
                      {seg.sfx && seg.sfx.effect && (
                        <Badge
                          color="var(--success)"
                          style={{
                            fontSize: "9px",
                            padding: "1px 6px",
                            flexShrink: 0,
                          }}
                        >
                          {seg.sfx.effect.length > 12
                            ? seg.sfx.effect.slice(0, 12) + "..."
                            : seg.sfx.effect}
                        </Badge>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── B) Detail Panel ── */}
          {hasSegments && selectedSeg && (
            <div>
              <SectionLabel style={{ marginBottom: "var(--sp-3)" }}>
                Detalle del segmento #{selectedSeg.id}
              </SectionLabel>

              <Card
                highlight
                color="var(--accent)"
                style={{ padding: "var(--sp-5)" }}
              >
                {/* ── Full text ── */}
                <div style={{ marginBottom: "var(--sp-5)" }}>
                  <FieldLabel>Texto completo</FieldLabel>
                  <div
                    style={{
                      fontSize: "13px",
                      fontFamily: "var(--font-body)",
                      color: "var(--text)",
                      lineHeight: 1.7,
                      background: "var(--panel-2)",
                      padding: "var(--sp-3) var(--sp-4)",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid var(--border-subtle)",
                    }}
                  >
                    {selectedSeg.text}
                  </div>
                </div>

                {/* ── Detail grid ── */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "var(--sp-5)",
                  }}
                >
                  {/* Motion */}
                  <div>
                    <FieldLabel>Motion</FieldLabel>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "var(--sp-2)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "var(--sp-2)",
                        }}
                      >
                        <Badge color="var(--warning)" style={{ fontSize: "10px" }}>
                          {selectedSeg.motion.type}
                        </Badge>
                        <span
                          style={{
                            fontSize: "12px",
                            fontFamily: "var(--font-body)",
                            color: "var(--text-secondary)",
                            fontWeight: 600,
                          }}
                        >
                          {selectedSeg.motion.label}
                        </span>
                      </div>
                      <div
                        style={{
                          fontSize: "11px",
                          fontFamily: "var(--font-body)",
                          color: "var(--muted)",
                          fontStyle: "italic",
                          lineHeight: 1.5,
                        }}
                      >
                        {selectedSeg.motion.reason}
                      </div>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => cycleMotion(selectedSeg)}
                        style={{ alignSelf: "flex-start", fontSize: "11px" }}
                      >
                        Cambiar motion
                      </Button>
                    </div>
                  </div>

                  {/* B-Roll */}
                  <div>
                    <FieldLabel>B-Roll</FieldLabel>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "var(--sp-2)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "var(--sp-2)",
                          marginBottom: "var(--sp-1)",
                        }}
                      >
                        <Badge
                          color="var(--accent)"
                          style={{ fontSize: "9px", padding: "1px 6px" }}
                        >
                          {selectedSeg.broll?.type || "stock"}
                        </Badge>
                      </div>
                      <Input
                        value={selectedSeg.broll?.query || ""}
                        onChange={(e) =>
                          updateSeg(selectedSeg.id, {
                            broll: {
                              ...selectedSeg.broll,
                              query: e.target.value,
                            },
                          })
                        }
                        placeholder="Search query para b-roll..."
                        style={{ fontSize: "12px" }}
                      />
                    </div>
                  </div>

                  {/* SFX */}
                  <div>
                    <FieldLabel>SFX</FieldLabel>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "var(--sp-2)",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "12px",
                          fontFamily: "var(--font-body)",
                          color: "var(--text-secondary)",
                        }}
                      >
                        {selectedSeg.sfx?.effect || "Sin SFX"}
                      </div>
                      <Input
                        value={selectedSeg.sfx?.intensity || ""}
                        onChange={(e) =>
                          updateSeg(selectedSeg.id, {
                            sfx: {
                              ...selectedSeg.sfx,
                              intensity: e.target.value,
                            },
                          })
                        }
                        placeholder="Intensidad (sutil, medio, fuerte)"
                        style={{ fontSize: "12px" }}
                      />
                    </div>
                  </div>

                  {/* On-screen text */}
                  <div>
                    <FieldLabel>Texto en pantalla</FieldLabel>
                    <Input
                      value={selectedSeg.onScreenText || ""}
                      onChange={(e) =>
                        updateSeg(selectedSeg.id, {
                          onScreenText: e.target.value,
                        })
                      }
                      placeholder="Texto que aparecera en pantalla..."
                      style={{ fontSize: "12px" }}
                    />
                  </div>
                </div>

                {/* Editor notes - full width */}
                <div style={{ marginTop: "var(--sp-5)" }}>
                  <FieldLabel>Notas del editor</FieldLabel>
                  <Textarea
                    value={selectedSeg.notes || ""}
                    onChange={(e) =>
                      updateSeg(selectedSeg.id, { notes: e.target.value })
                    }
                    placeholder="Notas adicionales para el editor..."
                    rows={2}
                    style={{ fontSize: "12px", minHeight: "auto" }}
                  />
                </div>

                {/* Keywords */}
                {selectedSeg.keywords && selectedSeg.keywords.length > 0 && (
                  <div style={{ marginTop: "var(--sp-4)" }}>
                    <FieldLabel>Keywords</FieldLabel>
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "var(--sp-1)",
                      }}
                    >
                      {selectedSeg.keywords.map((kw, i) => (
                        <Badge
                          key={i}
                          color="var(--pink)"
                          style={{
                            fontSize: "10px",
                            padding: "1px 7px",
                          }}
                        >
                          {kw}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* ════════════ BOTTOM ACTIONS BAR ════════════ */}
      {hasSegments && (
        <div
          style={{
            marginTop: "var(--sp-8)",
            paddingTop: "var(--sp-5)",
            borderTop: "1px solid var(--border-subtle)",
            display: "flex",
            alignItems: "center",
            gap: "var(--sp-3)",
          }}
        >
          <Button variant="primary" onClick={handleExport}>
            Export Edit Map JSON
          </Button>
          <Button variant="secondary" onClick={() => importRef.current?.click()}>
            Import JSON
          </Button>
          <input
            ref={importRef}
            type="file"
            accept=".json"
            onChange={handleImportFile}
            style={{ display: "none" }}
          />
          <Button variant="secondary" onClick={handleSave}>
            Guardar proyecto
          </Button>
          <div style={{ flex: 1 }} />
          <Button variant="ghost" onClick={handleReset}>
            Reset
          </Button>
        </div>
      )}

      {/* Reset when no segments too */}
      {!hasSegments && (state.editMap.raw || "").trim() && (
        <div
          style={{
            marginTop: "var(--sp-6)",
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <Button variant="ghost" size="sm" onClick={handleReset}>
            Reset
          </Button>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// HELPER COMPONENTS
// ════════════════════════════════════════════════════════════

function SectionLabel({ children, style: extraStyle }) {
  return (
    <div
      style={{
        fontSize: "10px",
        fontWeight: 700,
        fontFamily: "var(--font-body)",
        color: "var(--dim)",
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        ...extraStyle,
      }}
    >
      {children}
    </div>
  );
}

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
        marginBottom: "var(--sp-2)",
      }}
    >
      {children}
    </div>
  );
}

function StatBlock({ label, value, color }) {
  return (
    <div>
      <div
        style={{
          fontSize: "10px",
          fontFamily: "var(--font-body)",
          color: "var(--dim)",
          textTransform: "uppercase",
          marginBottom: "4px",
          fontWeight: 600,
          letterSpacing: "0.06em",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: "15px",
          fontFamily: "var(--font-body)",
          color: color || "var(--text-secondary)",
          fontWeight: 600,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          lineHeight: 1.3,
        }}
      >
        {value}
      </div>
    </div>
  );
}
