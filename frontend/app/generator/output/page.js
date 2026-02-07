"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { exportGeneratorJSON } from "@/lib/generator-pipeline";

// ============================================================
// GENERATOR OUTPUT PAGE — Step 5 of 5
// ============================================================

export default function GeneratorOutputPage() {
  const { state, dispatch } = useStore();
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const [promptsExpanded, setPromptsExpanded] = useState(false);

  const { output, config } = state.generator;

  // ── No output: redirect prompt ──
  if (!output) {
    return (
      <div style={{ maxWidth: "600px" }}>
        <StepIndicator step={5} total={5} label="Output" progress={100} color="var(--success)" />

        <div
          style={{
            background: "var(--panel)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)",
            padding: "var(--sp-8)",
            textAlign: "center",
            marginTop: "var(--sp-6)",
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "14px",
              color: "var(--text-secondary)",
              margin: "0 0 var(--sp-4)",
              lineHeight: 1.6,
            }}
          >
            No hay output generado
          </p>
          <Link
            href="/generator/input"
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "13px",
              fontWeight: 600,
              color: "var(--accent)",
              textDecoration: "none",
              padding: "var(--sp-2) var(--sp-4)",
              borderRadius: "var(--radius-md)",
              background: "var(--accent-muted)",
              border: "1px solid var(--accent-border)",
              transition: "all var(--transition-fast)",
              display: "inline-block",
            }}
          >
            Ir a Input
          </Link>
        </div>
      </div>
    );
  }

  const { script, prompts, casting, metadata } = output;

  // ── Actions ──

  function handleExport() {
    exportGeneratorJSON(config, output);
  }

  function handleSaveRun() {
    dispatch({
      type: "SAVE_RUN",
      payload: {
        type: "generator",
        name: config.topic,
        input: config,
        output: output,
      },
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handleNewProject() {
    dispatch({ type: "GEN_RESET" });
    router.push("/generator/input");
  }

  function fmtTime(sec) {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  // ── Render ──
  return (
    <div style={{ maxWidth: "820px" }}>
      <StepIndicator step={5} total={5} label="Output" progress={100} color="var(--success)" />

      {/* ══════════ Metadata Card ══════════ */}
      <div style={{ marginTop: "var(--sp-6)" }}>
        <SectionLabel style={{ marginBottom: "var(--sp-4)" }}>Metadata</SectionLabel>

        <div
          style={{
            background: "var(--panel)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)",
            padding: "var(--sp-5)",
            display: "flex",
            flexDirection: "column",
            gap: "var(--sp-4)",
          }}
        >
          {/* Title */}
          <div>
            <FieldLabel>Titulo</FieldLabel>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "18px",
                fontWeight: 400,
                color: "var(--text)",
                lineHeight: 1.4,
              }}
            >
              {metadata.title}
            </div>
          </div>

          {/* Description */}
          <div>
            <FieldLabel>Descripcion</FieldLabel>
            <div
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "13px",
                color: "var(--text-secondary)",
                lineHeight: 1.7,
                background: "var(--panel-2)",
                padding: "var(--sp-3) var(--sp-4)",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              {metadata.description}
            </div>
          </div>

          {/* Tags */}
          <div>
            <FieldLabel>Tags</FieldLabel>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--sp-1)" }}>
              {metadata.tags.map((tag, i) => (
                <span
                  key={i}
                  style={{
                    fontSize: "11px",
                    fontWeight: 500,
                    fontFamily: "var(--font-body)",
                    color: "var(--accent)",
                    background: "color-mix(in srgb, var(--accent) 10%, transparent)",
                    border: "1px solid color-mix(in srgb, var(--accent) 18%, transparent)",
                    padding: "2px 10px",
                    borderRadius: "var(--radius-sm)",
                    lineHeight: "18px",
                    display: "inline-block",
                    whiteSpace: "nowrap",
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Hashtags */}
          <div>
            <FieldLabel>Hashtags</FieldLabel>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--sp-1)" }}>
              {metadata.hashtags.map((ht, i) => (
                <span
                  key={i}
                  style={{
                    fontSize: "11px",
                    fontWeight: 500,
                    fontFamily: "var(--font-body)",
                    color: "var(--success)",
                    background: "var(--success-muted)",
                    border: "1px solid color-mix(in srgb, var(--success) 20%, transparent)",
                    padding: "2px 10px",
                    borderRadius: "var(--radius-sm)",
                    lineHeight: "18px",
                    display: "inline-block",
                    whiteSpace: "nowrap",
                  }}
                >
                  {ht}
                </span>
              ))}
            </div>
          </div>

          {/* Thumbnail prompt */}
          <div>
            <FieldLabel>Thumbnail Prompt</FieldLabel>
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
              {metadata.thumbPrompt}
            </div>
          </div>
        </div>
      </div>

      {/* ══════════ Script Section ══════════ */}
      <div style={{ marginTop: "var(--sp-8)" }}>
        <SectionLabel style={{ marginBottom: "var(--sp-4)" }}>
          Script
          <span
            style={{
              marginLeft: "var(--sp-2)",
              fontSize: "10px",
              fontWeight: 400,
              color: "var(--dim)",
              textTransform: "none",
              letterSpacing: 0,
            }}
          >
            ({script.scenes.length} escenas)
          </span>
        </SectionLabel>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--sp-3)",
          }}
        >
          {script.scenes.map((scene) => (
            <div
              key={scene.id}
              style={{
                background: "var(--panel)",
                border: "1px solid var(--border)",
                borderLeft: "3px solid color-mix(in srgb, var(--accent) 40%, transparent)",
                borderRadius: "var(--radius-md)",
                padding: "var(--sp-4)",
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
                <span
                  style={{
                    fontSize: "10px",
                    fontWeight: 700,
                    fontFamily: "var(--font-mono)",
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                    padding: "2px 8px",
                    borderRadius: "var(--radius-sm)",
                    background: "color-mix(in srgb, var(--accent) 12%, transparent)",
                    color: "var(--accent)",
                  }}
                >
                  #{scene.id}
                </span>
                <span
                  style={{
                    fontSize: "10px",
                    fontWeight: 600,
                    fontFamily: "var(--font-mono)",
                    padding: "2px 8px",
                    borderRadius: "var(--radius-sm)",
                    background: "color-mix(in srgb, var(--accent) 8%, transparent)",
                    color: "var(--accent)",
                  }}
                >
                  {fmtTime(scene.startSec)} &ndash; {fmtTime(scene.endSec)}
                </span>
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

              {/* On-screen text */}
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
            </div>
          ))}
        </div>
      </div>

      {/* ══════════ Prompts Section (collapsible) ══════════ */}
      <div style={{ marginTop: "var(--sp-8)" }}>
        <button
          onClick={() => setPromptsExpanded(!promptsExpanded)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--sp-2)",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
            marginBottom: "var(--sp-4)",
            fontFamily: "var(--font-body)",
          }}
        >
          <SectionLabel style={{ margin: 0 }}>
            Visual Prompts
            <span
              style={{
                marginLeft: "var(--sp-2)",
                fontSize: "10px",
                fontWeight: 400,
                color: "var(--dim)",
                textTransform: "none",
                letterSpacing: 0,
              }}
            >
              ({prompts.length})
            </span>
          </SectionLabel>
          <span
            style={{
              fontSize: "12px",
              color: "var(--muted)",
              transition: "transform var(--transition-fast)",
              transform: promptsExpanded ? "rotate(180deg)" : "rotate(0deg)",
              display: "inline-block",
            }}
          >
            &#9660;
          </span>
        </button>

        {promptsExpanded && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "var(--sp-3)",
              maxHeight: "500px",
              overflowY: "auto",
              paddingRight: "var(--sp-2)",
            }}
          >
            {prompts.map((p, idx) => (
              <div
                key={idx}
                style={{
                  background: "var(--panel)",
                  border: "1px solid var(--border)",
                  borderLeft: "3px solid color-mix(in srgb, var(--accent) 50%, transparent)",
                  borderRadius: "var(--radius-md)",
                  padding: "var(--sp-4)",
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
                  <span
                    style={{
                      fontSize: "10px",
                      fontWeight: 700,
                      fontFamily: "var(--font-mono)",
                      letterSpacing: "0.04em",
                      textTransform: "uppercase",
                      padding: "2px 8px",
                      borderRadius: "var(--radius-sm)",
                      background: "color-mix(in srgb, var(--accent) 12%, transparent)",
                      color: "var(--accent)",
                    }}
                  >
                    Scene {p.sceneId}
                  </span>
                  <span
                    style={{
                      fontSize: "10px",
                      fontWeight: 600,
                      fontFamily: "var(--font-mono)",
                      padding: "2px 8px",
                      borderRadius: "var(--radius-sm)",
                      background: "color-mix(in srgb, var(--accent) 8%, transparent)",
                      color: "var(--accent)",
                    }}
                  >
                    {p.time}
                  </span>
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
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ══════════ Casting Section ══════════ */}
      <div style={{ marginTop: "var(--sp-8)" }}>
        <SectionLabel style={{ marginBottom: "var(--sp-4)" }}>
          Casting
          <span
            style={{
              marginLeft: "var(--sp-2)",
              fontSize: "10px",
              fontWeight: 400,
              color: "var(--dim)",
              textTransform: "none",
              letterSpacing: 0,
            }}
          >
            ({casting.length})
          </span>
        </SectionLabel>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--sp-3)",
          }}
        >
          {casting.map((c, idx) => (
            <div
              key={idx}
              style={{
                background: "var(--panel)",
                border: "1px solid var(--border)",
                borderLeft: "3px solid color-mix(in srgb, var(--accent) 40%, transparent)",
                borderRadius: "var(--radius-md)",
                padding: "var(--sp-4)",
              }}
            >
              {/* Name + role badge */}
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
                    fontWeight: 600,
                    color: "var(--text)",
                  }}
                >
                  {c.name}
                </span>
                <span
                  style={{
                    fontSize: "10px",
                    fontWeight: 700,
                    fontFamily: "var(--font-mono)",
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                    padding: "2px 8px",
                    borderRadius: "var(--radius-sm)",
                    background: "color-mix(in srgb, var(--accent) 12%, transparent)",
                    color: "var(--accent)",
                  }}
                >
                  {c.role}
                </span>
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
            </div>
          ))}
        </div>
      </div>

      {/* ══════════ Action Bar ══════════ */}
      <div
        style={{
          marginTop: "var(--sp-8)",
          paddingTop: "var(--sp-5)",
          borderTop: "1px solid var(--border-subtle)",
          display: "flex",
          alignItems: "center",
          gap: "var(--sp-3)",
          flexWrap: "wrap",
        }}
      >
        {/* Export JSON */}
        <button
          onClick={handleExport}
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "13px",
            fontWeight: 600,
            color: "var(--text-secondary)",
            background: "var(--panel)",
            border: "1px solid var(--border)",
            padding: "var(--sp-2) var(--sp-4)",
            borderRadius: "var(--radius-md)",
            cursor: "pointer",
            transition: "all var(--transition-fast)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "var(--accent-border)";
            e.currentTarget.style.color = "var(--accent)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "var(--border)";
            e.currentTarget.style.color = "var(--text-secondary)";
          }}
        >
          Exportar JSON
        </button>

        {/* Save Run */}
        <button
          onClick={handleSaveRun}
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "13px",
            fontWeight: 600,
            color: saved ? "var(--success)" : "var(--bg)",
            background: saved ? "var(--success-muted)" : "var(--accent)",
            border: saved
              ? "1px solid color-mix(in srgb, var(--success) 30%, transparent)"
              : "1px solid var(--accent)",
            padding: "var(--sp-2) var(--sp-4)",
            borderRadius: "var(--radius-md)",
            cursor: "pointer",
            transition: "all var(--transition-fast)",
            minWidth: "120px",
          }}
          onMouseEnter={(e) => {
            if (!saved) e.currentTarget.style.background = "var(--accent-hover)";
          }}
          onMouseLeave={(e) => {
            if (!saved) e.currentTarget.style.background = "var(--accent)";
          }}
        >
          {saved ? "Guardado" : "Guardar Run"}
        </button>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* New Project */}
        <button
          onClick={handleNewProject}
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "13px",
            fontWeight: 600,
            color: "var(--muted)",
            background: "none",
            border: "1px solid var(--border-subtle)",
            padding: "var(--sp-2) var(--sp-4)",
            borderRadius: "var(--radius-md)",
            cursor: "pointer",
            transition: "all var(--transition-fast)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "var(--border)";
            e.currentTarget.style.color = "var(--text-secondary)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "var(--border-subtle)";
            e.currentTarget.style.color = "var(--muted)";
          }}
        >
          Nuevo Proyecto
        </button>
      </div>
    </div>
  );
}

// ============================================================
// HELPER COMPONENTS
// ============================================================

function StepIndicator({ step, total, label, progress, color }) {
  return (
    <div style={{ marginBottom: "var(--sp-2)" }}>
      <div
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "12px",
          fontWeight: 600,
          color: "var(--text-secondary)",
          marginBottom: "var(--sp-2)",
          letterSpacing: "0.02em",
        }}
      >
        Paso {step} de {total} &mdash; {label}
      </div>
      <div
        style={{
          width: "100%",
          height: "4px",
          background: "var(--panel-2)",
          borderRadius: "var(--radius-full)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${progress}%`,
            height: "100%",
            background: color || "var(--accent)",
            borderRadius: "var(--radius-full)",
            transition: "width var(--transition-base)",
          }}
        />
      </div>
    </div>
  );
}

function SectionLabel({ children, style: extraStyle }) {
  return (
    <div
      style={{
        fontSize: "11px",
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
