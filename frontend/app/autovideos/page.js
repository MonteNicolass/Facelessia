"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Textarea from "@/components/ui/Textarea";
import { useStore } from "@/lib/store";
import { generateMockScript, generateMockEDL } from "@/lib/mock-generator";
import { formatTime } from "@/lib/parser";
import { exportJSON, exportTXT } from "@/lib/exporters";

const TONES = ["informativo", "dramatico", "motivacional", "casual", "educativo"];
const DURATIONS = [30, 45, 60, 90];

const STEPS = [
  { num: 1, label: "Configurar" },
  { num: 2, label: "Guion" },
  { num: 3, label: "Salida" },
];

const STEP_TITLES = {
  1: "Configurar proyecto",
  2: "Editar guion",
  3: "Revision y salida",
};

const STEP_DESCRIPTIONS = {
  1: "Defini el tema, duracion y tono del video.",
  2: "Genera un guion mock o escribi el tuyo. Editable.",
  3: "Revision final y exportacion de archivos.",
};

/* ── tiny check SVG ── */
function CheckIcon({ size = 10, color = "currentColor" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

/* ── chevron SVG ── */
function ChevronIcon({ open }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="var(--dim)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        transition: "transform var(--transition-fast)",
        transform: open ? "rotate(90deg)" : "rotate(0deg)",
        flexShrink: 0,
      }}
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

/* ─────────────────────────────────────────────
   Label — editorial uppercase micro-label
   ───────────────────────────────────────────── */
function Label({ children }) {
  return (
    <label
      style={{
        fontSize: "10px",
        fontWeight: 700,
        fontFamily: "var(--font-body)",
        color: "var(--dim)",
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        marginBottom: "var(--sp-2)",
        display: "block",
      }}
    >
      {children}
    </label>
  );
}

/* ─────────────────────────────────────────────
   Stepper — editorial circles + connecting line
   ───────────────────────────────────────────── */
function Stepper({ step }) {
  return (
    <div
      className="reveal-d1"
      style={{
        display: "flex",
        alignItems: "center",
        marginBottom: "var(--sp-7)",
      }}
    >
      {STEPS.map((s, i) => {
        const isActive = s.num === step;
        const isCompleted = s.num < step;
        const isPending = s.num > step;

        /* circle color */
        const circleBg = isActive
          ? "var(--accent)"
          : isCompleted
          ? "var(--success)"
          : "var(--panel-2)";

        const circleBorder = isActive
          ? "2px solid var(--accent)"
          : isCompleted
          ? "2px solid var(--success)"
          : "2px solid var(--border)";

        const circleColor = isPending ? "var(--dim)" : "#fff";

        /* label color */
        const labelColor = isActive
          ? "var(--accent)"
          : isCompleted
          ? "var(--success)"
          : "var(--dim)";

        /* connector line */
        const lineBg = isCompleted
          ? "var(--success)"
          : "var(--border)";

        return (
          <div
            key={s.num}
            style={{
              display: "flex",
              alignItems: "center",
              flex: i < STEPS.length - 1 ? 1 : "none",
            }}
          >
            {/* step node */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--sp-2)",
                padding: "var(--sp-1) var(--sp-3) var(--sp-1) var(--sp-1)",
                borderRadius: "var(--radius-full)",
                background: isActive
                  ? "var(--accent-muted)"
                  : isCompleted
                  ? "color-mix(in srgb, var(--success) 8%, transparent)"
                  : "transparent",
                border: isActive
                  ? "1px solid var(--accent-border)"
                  : isCompleted
                  ? "1px solid color-mix(in srgb, var(--success) 20%, transparent)"
                  : "1px solid var(--border)",
                transition: "all var(--transition-base)",
              }}
            >
              {/* number circle */}
              <span
                style={{
                  width: "24px",
                  height: "24px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "11px",
                  fontWeight: 700,
                  fontFamily: "var(--font-body)",
                  background: circleBg,
                  border: circleBorder,
                  color: circleColor,
                  transition: "all var(--transition-base)",
                }}
              >
                {isCompleted ? <CheckIcon size={11} /> : s.num}
              </span>

              {/* label */}
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: 600,
                  fontFamily: "var(--font-body)",
                  color: labelColor,
                  transition: "color var(--transition-base)",
                }}
              >
                {s.label}
              </span>
            </div>

            {/* connecting line */}
            {i < STEPS.length - 1 && (
              <div
                style={{
                  flex: 1,
                  height: "1px",
                  margin: "0 var(--sp-2)",
                  background: lineBg,
                  transition: "background var(--transition-base)",
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ═════════════════════════════════════════════
   Main Page
   ═════════════════════════════════════════════ */
export default function AutoVideosPage() {
  const { state, dispatch } = useStore();
  const [step, setStep] = useState(1);
  const [openScene, setOpenScene] = useState(null);

  /* ── PASO 1: Config ── */
  function StepConfig() {
    return (
      <div
        className="reveal-d2"
        style={{ display: "flex", flexDirection: "column", gap: "var(--sp-6)" }}
      >
        {/* Tema */}
        <div className="reveal-d2">
          <Label>Tema del video</Label>
          <Textarea
            value={state.project.title}
            onChange={(e) =>
              dispatch({ type: "SET_PROJECT", payload: { title: e.target.value } })
            }
            placeholder="Ej: La caida del Imperio Romano"
            rows={3}
            style={{
              fontFamily: "var(--font-body)",
              borderRadius: "var(--radius-lg)",
            }}
          />
        </div>

        {/* Duracion */}
        <div className="reveal-d3">
          <Label>Duracion (segundos)</Label>
          <div style={{ display: "flex", gap: "var(--sp-2)" }}>
            {DURATIONS.map((d) => {
              const selected = state.project.durationSec === d;
              return (
                <button
                  key={d}
                  onClick={() =>
                    dispatch({ type: "SET_PROJECT", payload: { durationSec: d } })
                  }
                  style={{
                    flex: 1,
                    padding: "var(--sp-3) 0",
                    fontSize: "13px",
                    fontWeight: 600,
                    fontFamily: "var(--font-body)",
                    background: selected
                      ? "var(--accent-muted)"
                      : "var(--panel-2)",
                    color: selected ? "var(--accent)" : "var(--muted)",
                    border: selected
                      ? "1px solid var(--accent-border)"
                      : "1px solid var(--border)",
                    borderRadius: "var(--radius-md)",
                    cursor: "pointer",
                    transition: "all var(--transition-fast)",
                    letterSpacing: "0.02em",
                  }}
                >
                  {d}s
                </button>
              );
            })}
          </div>
        </div>

        {/* Tono */}
        <div className="reveal-d4">
          <Label>Tono</Label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--sp-2)" }}>
            {TONES.map((t) => {
              const selected = state.project.tone === t;
              return (
                <button
                  key={t}
                  onClick={() =>
                    dispatch({ type: "SET_PROJECT", payload: { tone: t } })
                  }
                  style={{
                    padding: "6px 16px",
                    fontSize: "12px",
                    fontFamily: "var(--font-body)",
                    fontWeight: 500,
                    background: selected
                      ? "var(--accent-muted)"
                      : "var(--panel-2)",
                    color: selected ? "var(--accent)" : "var(--muted)",
                    border: selected
                      ? "1px solid var(--accent-border)"
                      : "1px solid var(--border)",
                    borderRadius: "var(--radius-full)",
                    cursor: "pointer",
                    transition: "all var(--transition-fast)",
                    textTransform: "capitalize",
                  }}
                >
                  {t}
                </button>
              );
            })}
          </div>
        </div>

        {/* CTA */}
        <div className="reveal-d5">
          <Button
            disabled={!state.project.title.trim()}
            onClick={() => setStep(2)}
            size="lg"
            style={{ width: "100%", padding: "14px 0", fontSize: "15px" }}
          >
            Siguiente &rarr;
          </Button>
        </div>
      </div>
    );
  }

  /* ── PASO 2: Guion ── */
  function StepScript() {
    function handleGenerate() {
      const result = generateMockScript(state.project);
      dispatch({ type: "SET_SCRIPT", payload: result });
    }

    return (
      <div
        className="reveal-d2"
        style={{ display: "flex", flexDirection: "column", gap: "var(--sp-5)" }}
      >
        {/* Actions row */}
        <div
          className="reveal-d2"
          style={{
            display: "flex",
            gap: "var(--sp-2)",
            alignItems: "center",
          }}
        >
          <Button onClick={handleGenerate} size="sm">
            Generar guion mock
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() =>
              dispatch({ type: "SET_SCRIPT", payload: { raw: "", scenes: [] } })
            }
          >
            Limpiar
          </Button>
          {state.script.scenes.length > 0 && (
            <Badge
              color="var(--success)"
              style={{ marginLeft: "auto", fontFamily: "var(--font-body)" }}
            >
              {state.script.scenes.length} escenas
            </Badge>
          )}
        </div>

        {/* Textarea */}
        <div className="reveal-d3">
          <Textarea
            value={state.script.raw}
            onChange={(e) =>
              dispatch({ type: "SET_SCRIPT_RAW", payload: e.target.value })
            }
            placeholder="Aca aparece el guion generado. Tambien podes escribir el tuyo."
            rows={12}
            style={{
              minHeight: "220px",
              fontFamily: "var(--font-body)",
              borderRadius: "var(--radius-lg)",
              lineHeight: 1.7,
            }}
          />
        </div>

        {/* Detected scenes */}
        {state.script.scenes.length > 0 && (
          <div className="reveal-d4">
            <Label>Escenas detectadas</Label>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "var(--sp-1)",
              }}
            >
              {state.script.scenes.map((s, idx) => (
                <Card
                  key={s.id}
                  style={{
                    padding: "var(--sp-2) var(--sp-3)",
                    borderRadius: "var(--radius-md)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "var(--sp-2)",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "10px",
                        fontWeight: 700,
                        fontFamily: "var(--font-body)",
                        color: "var(--dim)",
                        minWidth: "16px",
                      }}
                    >
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <Badge color="var(--accent)">
                      {formatTime(s.startSec)}-{formatTime(s.endSec)}
                    </Badge>
                    <span
                      style={{
                        fontSize: "12px",
                        fontFamily: "var(--font-body)",
                        color: "var(--text-secondary)",
                        flex: 1,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {s.narration.slice(0, 80)}
                      {s.narration.length > 80 ? "..." : ""}
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div
          className="reveal-d5"
          style={{ display: "flex", gap: "var(--sp-2)" }}
        >
          <Button variant="secondary" onClick={() => setStep(1)}>
            &larr; Anterior
          </Button>
          <Button
            disabled={state.script.scenes.length === 0}
            onClick={() => {
              const edl = generateMockEDL(state.script.scenes);
              dispatch({ type: "SET_EDL", payload: edl });
              setStep(3);
            }}
            style={{ flex: 1 }}
          >
            Generar EDL y continuar &rarr;
          </Button>
        </div>
      </div>
    );
  }

  /* ── PASO 3: Salida ── */
  function StepOutput() {
    return (
      <div
        className="reveal-d2"
        style={{ display: "flex", flexDirection: "column", gap: "var(--sp-5)" }}
      >
        {/* Summary stats */}
        <Card
          highlight
          color="var(--accent)"
          style={{ borderRadius: "var(--radius-lg)" }}
        >
          <div
            className="reveal-d2"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr 1fr",
              gap: "var(--sp-4)",
            }}
          >
            {[
              { label: "Escenas", value: state.script.scenes.length },
              { label: "EDL entries", value: state.edl.length },
              { label: "Duracion", value: `${state.project.durationSec}s` },
              { label: "Tono", value: state.project.tone },
            ].map((item, i) => (
              <div key={i} style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontSize: "10px",
                    fontFamily: "var(--font-body)",
                    color: "var(--dim)",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    fontWeight: 700,
                    marginBottom: "var(--sp-1)",
                  }}
                >
                  {item.label}
                </div>
                <div
                  style={{
                    fontSize: "16px",
                    fontFamily: "var(--font-display)",
                    fontWeight: 400,
                    color: "var(--text)",
                  }}
                >
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Scene accordion */}
        <div className="reveal-d3">
          <Label>Escenas + prompts visuales</Label>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "var(--sp-2)",
            }}
          >
            {state.script.scenes.map((s, idx) => {
              const edlEntry = state.edl.find((e) => e.id === s.id);
              const isOpen = openScene === s.id;
              return (
                <Card
                  key={s.id}
                  style={{
                    padding: 0,
                    overflow: "hidden",
                    borderRadius: "var(--radius-md)",
                  }}
                >
                  {/* Accordion header */}
                  <button
                    onClick={() => setOpenScene(isOpen ? null : s.id)}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      gap: "var(--sp-2)",
                      padding: "var(--sp-3)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontFamily: "var(--font-body)",
                      textAlign: "left",
                    }}
                  >
                    <ChevronIcon open={isOpen} />
                    <span
                      style={{
                        fontSize: "10px",
                        fontWeight: 700,
                        fontFamily: "var(--font-mono)",
                        color: "var(--dim)",
                        minWidth: "20px",
                      }}
                    >
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <Badge color="var(--accent)">
                      {formatTime(s.startSec)}-{formatTime(s.endSec)}
                    </Badge>
                    {edlEntry && (
                      <Badge color="var(--warning)">
                        {edlEntry.motionLabel}
                      </Badge>
                    )}
                    <span
                      style={{
                        fontSize: "12px",
                        fontFamily: "var(--font-body)",
                        color: "var(--text-secondary)",
                        flex: 1,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {s.narration.slice(0, 60)}
                      {s.narration.length > 60 ? "..." : ""}
                    </span>
                  </button>

                  {/* Accordion body */}
                  {isOpen && (
                    <div
                      style={{
                        padding: "0 var(--sp-4) var(--sp-4)",
                        borderTop: "1px solid var(--border-subtle)",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "13px",
                          fontFamily: "var(--font-body)",
                          color: "var(--text-secondary)",
                          lineHeight: 1.7,
                          padding: "var(--sp-3) 0 var(--sp-2)",
                        }}
                      >
                        {s.narration}
                      </div>

                      {s.visualPrompt && (
                        <div
                          style={{
                            fontSize: "12px",
                            fontFamily: "var(--font-mono)",
                            color: "var(--muted)",
                            fontStyle: "italic",
                            background: "var(--panel-2)",
                            padding: "var(--sp-3)",
                            borderRadius: "var(--radius-sm)",
                            marginBottom: "var(--sp-3)",
                            borderLeft: "2px solid var(--accent-border)",
                            lineHeight: 1.6,
                          }}
                        >
                          {s.visualPrompt}
                        </div>
                      )}

                      {edlEntry && (
                        <div
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "var(--sp-4)",
                            fontSize: "12px",
                            fontFamily: "var(--font-body)",
                            color: "var(--muted)",
                            padding: "var(--sp-2) 0 0",
                            borderTop: "1px solid var(--border-subtle)",
                          }}
                        >
                          <span>
                            <strong
                              style={{
                                color: "var(--text-secondary)",
                                fontWeight: 600,
                              }}
                            >
                              Motion:
                            </strong>{" "}
                            {edlEntry.motionLabel}
                          </span>
                          <span>
                            <strong
                              style={{
                                color: "var(--text-secondary)",
                                fontWeight: 600,
                              }}
                            >
                              B-Roll:
                            </strong>{" "}
                            {edlEntry.brollQuery}
                          </span>
                          <span>
                            <strong
                              style={{
                                color: "var(--text-secondary)",
                                fontWeight: 600,
                              }}
                            >
                              SFX:
                            </strong>{" "}
                            {edlEntry.sfx.efecto}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div
          className="reveal-d4"
          style={{
            display: "flex",
            gap: "var(--sp-2)",
            flexWrap: "wrap",
            paddingTop: "var(--sp-2)",
          }}
        >
          <Button variant="secondary" onClick={() => setStep(2)}>
            &larr; Anterior
          </Button>
          <Button
            onClick={() =>
              exportJSON(state.project, state.script, state.edl)
            }
          >
            Exportar JSON
          </Button>
          <Button
            variant="secondary"
            onClick={() =>
              exportTXT(state.project, state.script, state.edl)
            }
          >
            Exportar TXT
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              dispatch({ type: "RESET" });
              setStep(1);
            }}
            style={{ marginLeft: "auto" }}
          >
            Nuevo proyecto
          </Button>
        </div>
      </div>
    );
  }

  /* ── Render ── */
  return (
    <div style={{ maxWidth: "720px" }}>
      {/* Header */}
      <div className="reveal" style={{ marginBottom: "var(--sp-5)" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--sp-3)",
            marginBottom: "var(--sp-3)",
          }}
        >
          <Badge
            color="var(--accent)"
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "10px",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              fontWeight: 700,
            }}
          >
            AUTOVIDEOS
          </Badge>
        </div>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 400,
            fontSize: "28px",
            color: "var(--text)",
            marginBottom: "var(--sp-1)",
            lineHeight: 1.2,
          }}
        >
          {STEP_TITLES[step]}
        </h1>
        <p
          style={{
            fontSize: "14px",
            fontFamily: "var(--font-body)",
            color: "var(--text-secondary)",
            lineHeight: 1.5,
          }}
        >
          {STEP_DESCRIPTIONS[step]}
        </p>
      </div>

      {/* Stepper */}
      <Stepper step={step} />

      {/* Step content */}
      {step === 1 && <StepConfig />}
      {step === 2 && <StepScript />}
      {step === 3 && <StepOutput />}
    </div>
  );
}
