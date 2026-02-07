"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Tabs from "@/components/ui/Tabs";
import Textarea from "@/components/ui/Textarea";
import Input from "@/components/ui/Input";
import InlineNotice from "@/components/ui/InlineNotice";
import EmptyState from "@/components/ui/EmptyState";
import { useStore } from "@/lib/store";
import { generateStudioOutput, exportStudioJSON } from "@/lib/studio-generator";

// ============================================================
// MODES & DURATIONS
// ============================================================

const MODES = [
  { id: "short_epico", label: "Short Epico" },
  { id: "consistencia", label: "Consistencia" },
  { id: "educativo", label: "Educativo" },
];

const DURATIONS = [
  { value: 30, label: "30s" },
  { value: 60, label: "60s" },
  { value: 90, label: "90s" },
  { value: "custom", label: "Custom" },
];

// ============================================================
// STUDIO PAGE
// ============================================================

export default function StudioPage() {
  const { state, dispatch } = useStore();
  const [outputTab, setOutputTab] = useState("script");
  const [durationMode, setDurationMode] = useState(
    [30, 60, 90].includes(state.studio.duration) ? state.studio.duration : "custom"
  );
  const [customDuration, setCustomDuration] = useState(
    [30, 60, 90].includes(state.studio.duration) ? "" : String(state.studio.duration)
  );
  const [batchRunning, setBatchRunning] = useState(false);

  const output = state.studio.output;

  // --- Config helpers ---

  function updateConfig(patch) {
    dispatch({ type: "SET_STUDIO_CONFIG", payload: patch });
  }

  function handleDurationSelect(val) {
    setDurationMode(val);
    if (val !== "custom") {
      updateConfig({ duration: val });
      setCustomDuration("");
    }
  }

  function handleCustomDuration(e) {
    const v = e.target.value;
    setCustomDuration(v);
    const num = parseInt(v, 10);
    if (num > 0 && num <= 600) {
      updateConfig({ duration: num });
    }
  }

  // --- Generate ---

  function handleGenerate() {
    const config = {
      topic: state.studio.topic,
      mode: state.studio.mode,
      duration: state.studio.duration,
      audience: state.studio.audience,
      hasCTA: state.studio.hasCTA,
    };
    const result = generateStudioOutput(config);
    dispatch({ type: "SET_STUDIO_OUTPUT", payload: result });
    setOutputTab("script");
  }

  // --- Batch ---

  function handleAddToBatch() {
    if (!state.studio.topic.trim()) return;
    dispatch({ type: "STUDIO_ADD_BATCH", payload: state.studio.topic.trim() });
  }

  function handleSimulateBatch() {
    const pending = state.studio.batch.filter((j) => j.status === "pending");
    if (pending.length === 0 || batchRunning) return;
    setBatchRunning(true);

    pending.forEach((job, idx) => {
      // Set to running
      setTimeout(() => {
        dispatch({ type: "STUDIO_UPDATE_BATCH", payload: { id: job.id, status: "running" } });
      }, idx * 1200);

      // Set to done
      setTimeout(() => {
        try {
          const jobOutput = generateStudioOutput({
            topic: job.topic,
            mode: state.studio.mode,
            duration: state.studio.duration,
            audience: state.studio.audience,
            hasCTA: state.studio.hasCTA,
          });
          dispatch({
            type: "STUDIO_UPDATE_BATCH",
            payload: { id: job.id, status: "done", output: jobOutput },
          });
        } catch {
          dispatch({
            type: "STUDIO_UPDATE_BATCH",
            payload: { id: job.id, status: "error" },
          });
        }

        // If last job, unlock button
        if (idx === pending.length - 1) {
          setBatchRunning(false);
        }
      }, idx * 1200 + 1000);
    });
  }

  function handleClearCompleted() {
    const done = state.studio.batch.filter((j) => j.status === "done" || j.status === "error");
    done.forEach((j) => dispatch({ type: "STUDIO_REMOVE_BATCH", payload: j.id }));
  }

  // --- Export / Save / Reset ---

  function handleExportJSON() {
    if (!output) return;
    const config = {
      mode: state.studio.mode,
      topic: state.studio.topic,
      duration: state.studio.duration,
      audience: state.studio.audience,
    };
    exportStudioJSON(config, output);
  }

  function handleSaveProject() {
    dispatch({
      type: "SAVE_PROJECT",
      payload: {
        name: state.studio.topic || "Proyecto Studio",
        type: "studio",
        data: {
          config: {
            mode: state.studio.mode,
            topic: state.studio.topic,
            duration: state.studio.duration,
            audience: state.studio.audience,
            hasCTA: state.studio.hasCTA,
          },
          output: state.studio.output,
        },
      },
    });
  }

  function handleReset() {
    dispatch({ type: "STUDIO_RESET" });
    setOutputTab("script");
    setDurationMode(60);
    setCustomDuration("");
  }

  // --- Helpers ---

  function fmtTime(sec) {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  const batchStatusColor = {
    pending: "var(--dim)",
    running: "var(--warning)",
    done: "var(--success)",
    error: "var(--danger)",
  };

  const batchStatusLabel = {
    pending: "Pendiente",
    running: "Ejecutando...",
    done: "Completado",
    error: "Error",
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div>
      {/* ======== HEADER ======== */}
      <div className="reveal" style={{ marginBottom: "var(--sp-8)" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--sp-3)",
            marginBottom: "var(--sp-3)",
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
            Studio
          </h1>
          <Badge
            color="var(--accent)"
            style={{
              fontSize: "10px",
              padding: "2px 8px",
              fontWeight: 700,
              letterSpacing: "0.08em",
            }}
          >
            AI VIDEO
          </Badge>
        </div>
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "13px",
            color: "var(--muted)",
            lineHeight: 1.6,
            maxWidth: "540px",
            margin: 0,
          }}
        >
          Generador de video AI. Configura tema, modo y duracion &rarr; genera guion, prompts visuales, casting y metadata.
        </p>
      </div>

      {/* ======== TWO-COLUMN LAYOUT ======== */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1.4fr)",
          gap: "var(--sp-8)",
          alignItems: "start",
        }}
      >
        {/* === LEFT: INPUT PANEL === */}
        <div
          className="reveal"
          style={{ display: "flex", flexDirection: "column", gap: "var(--sp-5)" }}
        >
          {/* Topic */}
          <div>
            <SectionLabel style={{ marginBottom: "var(--sp-2)" }}>Tema del video</SectionLabel>
            <Textarea
              value={state.studio.topic}
              onChange={(e) => updateConfig({ topic: e.target.value })}
              placeholder="Ej: Los secretos ocultos del antiguo Egipto..."
              rows={3}
              style={{ fontSize: "13px", lineHeight: 1.7 }}
            />
          </div>

          {/* Mode */}
          <div>
            <SectionLabel style={{ marginBottom: "var(--sp-2)" }}>Modo</SectionLabel>
            <div style={{ display: "flex", gap: "var(--sp-2)" }}>
              {MODES.map((m) => (
                <button
                  key={m.id}
                  onClick={() => updateConfig({ mode: m.id })}
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "12px",
                    fontWeight: 600,
                    padding: "6px 14px",
                    borderRadius: "var(--radius-md)",
                    border:
                      state.studio.mode === m.id
                        ? "1px solid var(--accent)"
                        : "1px solid var(--border)",
                    background:
                      state.studio.mode === m.id
                        ? "var(--accent-muted)"
                        : "var(--panel-2)",
                    color:
                      state.studio.mode === m.id
                        ? "var(--accent)"
                        : "var(--text-secondary)",
                    cursor: "pointer",
                    transition: "all var(--transition-fast)",
                    lineHeight: 1,
                  }}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Duration */}
          <div>
            <SectionLabel style={{ marginBottom: "var(--sp-2)" }}>Duracion</SectionLabel>
            <div style={{ display: "flex", gap: "var(--sp-2)", alignItems: "center" }}>
              {DURATIONS.map((d) => (
                <button
                  key={d.value}
                  onClick={() => handleDurationSelect(d.value)}
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "12px",
                    fontWeight: 600,
                    padding: "6px 14px",
                    borderRadius: "var(--radius-md)",
                    border:
                      durationMode === d.value
                        ? "1px solid var(--accent)"
                        : "1px solid var(--border)",
                    background:
                      durationMode === d.value
                        ? "var(--accent-muted)"
                        : "var(--panel-2)",
                    color:
                      durationMode === d.value
                        ? "var(--accent)"
                        : "var(--text-secondary)",
                    cursor: "pointer",
                    transition: "all var(--transition-fast)",
                    lineHeight: 1,
                  }}
                >
                  {d.label}
                </button>
              ))}
              {durationMode === "custom" && (
                <Input
                  type="number"
                  value={customDuration}
                  onChange={handleCustomDuration}
                  placeholder="seg"
                  style={{ width: "80px", textAlign: "center" }}
                />
              )}
            </div>
          </div>

          {/* Audience */}
          <div>
            <SectionLabel style={{ marginBottom: "var(--sp-2)" }}>
              Audiencia{" "}
              <span style={{ color: "var(--dim)", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>
                (opcional)
              </span>
            </SectionLabel>
            <Input
              value={state.studio.audience}
              onChange={(e) => updateConfig({ audience: e.target.value })}
              placeholder="Ej: jovenes 18-30, curiosos de historia..."
            />
          </div>

          {/* CTA Toggle */}
          <div>
            <SectionLabel style={{ marginBottom: "var(--sp-2)" }}>Call-to-Action</SectionLabel>
            <button
              onClick={() => updateConfig({ hasCTA: !state.studio.hasCTA })}
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "12px",
                fontWeight: 600,
                padding: "6px 16px",
                borderRadius: "var(--radius-md)",
                border: state.studio.hasCTA
                  ? "1px solid var(--accent)"
                  : "1px solid var(--border)",
                background: state.studio.hasCTA
                  ? "var(--accent-muted)"
                  : "var(--panel-2)",
                color: state.studio.hasCTA
                  ? "var(--accent)"
                  : "var(--muted)",
                cursor: "pointer",
                transition: "all var(--transition-fast)",
                lineHeight: 1,
              }}
            >
              {state.studio.hasCTA ? "CTA: ON" : "CTA: OFF"}
            </button>
          </div>

          {/* Generate Button */}
          <Button
            variant="primary"
            size="lg"
            disabled={!state.studio.topic.trim()}
            onClick={handleGenerate}
            style={{ width: "100%", marginTop: "var(--sp-2)" }}
          >
            Generar video
          </Button>

          {/* Config summary */}
          {output && (
            <Card
              highlight
              color="var(--accent)"
              style={{ padding: "var(--sp-4) var(--sp-5)" }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: "var(--sp-4)",
                }}
              >
                <Stat label="Escenas" value={output.script.scenes.length} color="var(--accent)" />
                <Stat label="Prompts" value={output.prompts.length} color="var(--pink)" />
                <Stat
                  label="Duracion"
                  value={`${state.studio.duration}s`}
                  color="var(--warning)"
                />
              </div>
            </Card>
          )}
        </div>

        {/* === RIGHT: OUTPUT PANEL === */}
        <div
          className="reveal"
          style={{ display: "flex", flexDirection: "column", gap: "var(--sp-4)" }}
        >
          {!output && (
            <EmptyState
              icon={
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polygon points="23 7 16 12 23 17 23 7" />
                  <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                </svg>
              }
            >
              Configura el tema y presiona &quot;Generar video&quot; para ver el resultado.
            </EmptyState>
          )}

          {output && (
            <>
              {/* Tabs */}
              <Tabs
                tabs={[
                  { id: "script", label: "Script", count: output.script.scenes.length },
                  { id: "prompts", label: "Prompts", count: output.prompts.length },
                  { id: "casting", label: "Casting", count: output.casting.length },
                  { id: "metadata", label: "Metadata" },
                ]}
                active={outputTab}
                onChange={setOutputTab}
              />

              {/* ---- Tab: Script ---- */}
              {outputTab === "script" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-3)" }}>
                  {output.script.scenes.map((scene) => (
                    <Card
                      key={scene.id}
                      style={{
                        padding: "var(--sp-4)",
                        borderLeft: "3px solid color-mix(in srgb, var(--accent) 40%, transparent)",
                      }}
                    >
                      {/* Top badges */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "var(--sp-2)",
                          marginBottom: "var(--sp-3)",
                          flexWrap: "wrap",
                        }}
                      >
                        <Badge
                          color="var(--pink)"
                          style={{ fontSize: "10px", padding: "1px 7px" }}
                        >
                          #{scene.id}
                        </Badge>
                        <Badge color="var(--accent)">
                          {fmtTime(scene.startSec)} &ndash; {fmtTime(scene.endSec)}
                        </Badge>
                        <span
                          style={{
                            fontSize: "10px",
                            fontFamily: "var(--font-mono)",
                            color: "var(--dim)",
                            marginLeft: "auto",
                            background: "var(--panel-2)",
                            padding: "2px 8px",
                            borderRadius: "var(--radius-sm)",
                          }}
                        >
                          {scene.endSec - scene.startSec}s
                        </span>
                      </div>

                      {/* Narration */}
                      <div
                        style={{
                          fontFamily: "var(--font-body)",
                          fontSize: "13px",
                          color: "var(--text-secondary)",
                          lineHeight: 1.65,
                        }}
                      >
                        {scene.narration}
                      </div>

                      {/* On-screen text chip */}
                      {scene.onScreenText && (
                        <div
                          style={{
                            marginTop: "var(--sp-3)",
                            display: "inline-block",
                            fontSize: "11px",
                            fontFamily: "var(--font-body)",
                            fontWeight: 600,
                            color: "var(--accent)",
                            background: "var(--accent-muted)",
                            border: "1px solid var(--accent-border)",
                            padding: "3px 10px",
                            borderRadius: "var(--radius-sm)",
                            letterSpacing: "0.02em",
                          }}
                        >
                          {scene.onScreenText}
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              )}

              {/* ---- Tab: Prompts ---- */}
              {outputTab === "prompts" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-3)" }}>
                  {output.prompts.map((p) => (
                    <Card
                      key={p.sceneId}
                      style={{
                        padding: "var(--sp-4)",
                        borderLeft: "3px solid color-mix(in srgb, var(--pink) 50%, transparent)",
                      }}
                    >
                      {/* Header */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "var(--sp-2)",
                          marginBottom: "var(--sp-3)",
                        }}
                      >
                        <Badge
                          color="var(--pink)"
                          style={{ fontSize: "10px", padding: "1px 7px" }}
                        >
                          Scene {p.sceneId}
                        </Badge>
                        <Badge color="var(--accent)">
                          {p.time}
                        </Badge>
                      </div>

                      {/* Prompt text */}
                      <div
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "12px",
                          color: "var(--accent)",
                          background: "color-mix(in srgb, var(--accent) 5%, var(--panel-2))",
                          border: "1px solid color-mix(in srgb, var(--accent) 12%, transparent)",
                          padding: "var(--sp-3)",
                          borderRadius: "var(--radius-sm)",
                          lineHeight: 1.6,
                          marginBottom: "var(--sp-3)",
                        }}
                      >
                        {p.prompt}
                      </div>

                      {/* Style & Negative */}
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: "var(--sp-3)",
                        }}
                      >
                        <div>
                          <span
                            style={{
                              fontSize: "9px",
                              fontWeight: 700,
                              fontFamily: "var(--font-body)",
                              color: "var(--dim)",
                              textTransform: "uppercase",
                              letterSpacing: "0.06em",
                            }}
                          >
                            Style
                          </span>
                          <div
                            style={{
                              fontSize: "11px",
                              fontFamily: "var(--font-body)",
                              color: "var(--text-secondary)",
                              marginTop: "4px",
                              lineHeight: 1.5,
                            }}
                          >
                            {p.style}
                          </div>
                        </div>
                        <div>
                          <span
                            style={{
                              fontSize: "9px",
                              fontWeight: 700,
                              fontFamily: "var(--font-body)",
                              color: "var(--dim)",
                              textTransform: "uppercase",
                              letterSpacing: "0.06em",
                            }}
                          >
                            Negative
                          </span>
                          <div
                            style={{
                              fontSize: "11px",
                              fontFamily: "var(--font-body)",
                              color: "var(--muted)",
                              marginTop: "4px",
                              lineHeight: 1.5,
                            }}
                          >
                            {p.negativePrompt}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              {/* ---- Tab: Casting ---- */}
              {outputTab === "casting" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-3)" }}>
                  {output.casting.length === 0 && (
                    <EmptyState>No hay personajes generados para esta configuracion.</EmptyState>
                  )}
                  {output.casting.map((c, idx) => (
                    <Card
                      key={idx}
                      highlight
                      color="var(--pink)"
                      style={{ padding: "var(--sp-4)" }}
                    >
                      {/* Name & role */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "var(--sp-2)",
                          marginBottom: "var(--sp-3)",
                        }}
                      >
                        <span
                          style={{
                            fontFamily: "var(--font-display)",
                            fontSize: "16px",
                            fontWeight: 400,
                            color: "var(--text)",
                          }}
                        >
                          {c.name}
                        </span>
                        <Badge color="var(--pink)" style={{ fontSize: "10px", padding: "1px 7px" }}>
                          {c.role}
                        </Badge>
                      </div>

                      {/* Description */}
                      <div
                        style={{
                          fontFamily: "var(--font-body)",
                          fontSize: "13px",
                          color: "var(--text-secondary)",
                          lineHeight: 1.6,
                          marginBottom: "var(--sp-3)",
                        }}
                      >
                        {c.desc}
                      </div>

                      {/* Consistency prompt */}
                      <div
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "11px",
                          color: "var(--accent)",
                          background: "color-mix(in srgb, var(--accent) 5%, var(--panel-2))",
                          border: "1px solid color-mix(in srgb, var(--accent) 12%, transparent)",
                          padding: "var(--sp-2) var(--sp-3)",
                          borderRadius: "var(--radius-sm)",
                          lineHeight: 1.6,
                        }}
                      >
                        {c.consistencyPrompt}
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              {/* ---- Tab: Metadata ---- */}
              {outputTab === "metadata" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-4)" }}>
                  {/* Title */}
                  <div>
                    <SectionLabel style={{ marginBottom: "var(--sp-2)" }}>Titulo</SectionLabel>
                    <div
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "18px",
                        fontWeight: 400,
                        color: "var(--text)",
                        lineHeight: 1.4,
                      }}
                    >
                      {output.metadata.title}
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <SectionLabel style={{ marginBottom: "var(--sp-2)" }}>Descripcion</SectionLabel>
                    <Textarea
                      value={output.metadata.description}
                      onChange={() => {}}
                      rows={4}
                      disabled
                      style={{
                        fontSize: "13px",
                        lineHeight: 1.7,
                        opacity: 0.85,
                        cursor: "default",
                      }}
                    />
                  </div>

                  {/* Tags */}
                  <div>
                    <SectionLabel style={{ marginBottom: "var(--sp-2)" }}>Tags</SectionLabel>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--sp-1)" }}>
                      {output.metadata.tags.map((tag, i) => (
                        <Chip key={i} color="var(--accent)">
                          {tag}
                        </Chip>
                      ))}
                    </div>
                  </div>

                  {/* Hashtags */}
                  <div>
                    <SectionLabel style={{ marginBottom: "var(--sp-2)" }}>Hashtags</SectionLabel>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--sp-1)" }}>
                      {output.metadata.hashtags.map((ht, i) => (
                        <Chip key={i} color="var(--pink)">
                          {ht}
                        </Chip>
                      ))}
                    </div>
                  </div>

                  {/* Thumb prompt */}
                  <div>
                    <SectionLabel style={{ marginBottom: "var(--sp-2)" }}>Thumbnail Prompt</SectionLabel>
                    <div
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "12px",
                        color: "var(--accent)",
                        background: "color-mix(in srgb, var(--accent) 5%, var(--panel-2))",
                        border: "1px solid color-mix(in srgb, var(--accent) 12%, transparent)",
                        padding: "var(--sp-3)",
                        borderRadius: "var(--radius-sm)",
                        lineHeight: 1.6,
                      }}
                    >
                      {output.metadata.thumbPrompt}
                    </div>
                  </div>
                </div>
              )}

              {/* ---- Actions bar ---- */}
              <div
                style={{
                  display: "flex",
                  gap: "var(--sp-2)",
                  flexWrap: "wrap",
                  marginTop: "var(--sp-3)",
                  paddingTop: "var(--sp-4)",
                  borderTop: "1px solid var(--border-subtle)",
                }}
              >
                <Button variant="secondary" size="sm" onClick={handleExportJSON}>
                  Export JSON
                </Button>
                <Button variant="primary" size="sm" onClick={handleSaveProject}>
                  Guardar proyecto
                </Button>
                <Button variant="ghost" size="sm" onClick={handleReset}>
                  Reset
                </Button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ======== BATCH QUEUE ======== */}
      <div
        className="reveal"
        style={{
          marginTop: "var(--sp-10)",
          paddingTop: "var(--sp-6)",
          borderTop: "1px solid var(--border-subtle)",
        }}
      >
        <SectionLabel style={{ marginBottom: "var(--sp-4)" }}>Cola de tareas</SectionLabel>

        {/* Batch actions */}
        <div style={{ display: "flex", gap: "var(--sp-2)", marginBottom: "var(--sp-4)", flexWrap: "wrap" }}>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleAddToBatch}
            disabled={!state.studio.topic.trim()}
          >
            Agregar a cola
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSimulateBatch}
            disabled={batchRunning || state.studio.batch.filter((j) => j.status === "pending").length === 0}
          >
            {batchRunning ? "Ejecutando..." : "Simular batch"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearCompleted}
            disabled={state.studio.batch.filter((j) => j.status === "done" || j.status === "error").length === 0}
          >
            Limpiar completados
          </Button>
        </div>

        {/* Batch list */}
        {state.studio.batch.length === 0 && (
          <EmptyState>
            No hay tareas en la cola. Escribe un tema y presiona &quot;Agregar a cola&quot;.
          </EmptyState>
        )}

        {state.studio.batch.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-2)" }}>
            {state.studio.batch.map((job) => (
              <div
                key={job.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--sp-3)",
                  padding: "var(--sp-3) var(--sp-4)",
                  background: "var(--panel)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-md)",
                }}
              >
                <Badge
                  color={batchStatusColor[job.status] || "var(--dim)"}
                  style={{ fontSize: "10px", padding: "1px 8px", flexShrink: 0 }}
                >
                  {batchStatusLabel[job.status] || job.status}
                </Badge>
                <span
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "13px",
                    color: "var(--text-secondary)",
                    flex: 1,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {job.topic}
                </span>
                <button
                  onClick={() => dispatch({ type: "STUDIO_REMOVE_BATCH", payload: job.id })}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--dim)",
                    padding: "4px",
                    display: "flex",
                    alignItems: "center",
                    transition: "color var(--transition-fast)",
                    flexShrink: 0,
                  }}
                  title="Eliminar"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// HELPER COMPONENTS
// ============================================================

function SectionLabel({ children, style: extraStyle }) {
  return (
    <div
      style={{
        fontSize: "10px",
        fontWeight: 600,
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

function Stat({ label, value, color }) {
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
          fontSize: "14px",
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

function Chip({ children, color = "var(--accent)" }) {
  return (
    <span
      style={{
        fontSize: "11px",
        fontWeight: 500,
        fontFamily: "var(--font-body)",
        color: color,
        background: `color-mix(in srgb, ${color} 10%, transparent)`,
        border: `1px solid color-mix(in srgb, ${color} 18%, transparent)`,
        padding: "2px 10px",
        borderRadius: "var(--radius-sm)",
        lineHeight: "18px",
        display: "inline-block",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}
