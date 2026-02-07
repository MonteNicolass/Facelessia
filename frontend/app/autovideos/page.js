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

export default function AutoVideosPage() {
  const { state, dispatch } = useStore();
  const [step, setStep] = useState(1);
  const [openScene, setOpenScene] = useState(null);

  // === PASO 1: Config ===
  function StepConfig() {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-5)" }}>
        <div>
          <Label>Tema del video</Label>
          <Textarea
            value={state.project.title}
            onChange={(e) => dispatch({ type: "SET_PROJECT", payload: { title: e.target.value } })}
            placeholder="Ej: La caida del Imperio Romano"
            rows={3}
          />
        </div>

        <div>
          <Label>Duracion (segundos)</Label>
          <div style={{ display: "flex", gap: "var(--sp-2)" }}>
            {DURATIONS.map((d) => (
              <button
                key={d}
                onClick={() => dispatch({ type: "SET_PROJECT", payload: { durationSec: d } })}
                style={{
                  flex: 1,
                  padding: "var(--sp-2) 0",
                  fontSize: "12px",
                  fontWeight: 600,
                  fontFamily: "inherit",
                  background: state.project.durationSec === d ? "var(--accent-muted)" : "var(--panel-2)",
                  color: state.project.durationSec === d ? "var(--accent)" : "var(--muted)",
                  border: state.project.durationSec === d ? "1px solid var(--accent-border)" : "1px solid var(--border)",
                  borderRadius: "var(--radius-md)",
                  cursor: "pointer",
                  transition: "all var(--transition-fast)",
                }}
              >
                {d}s
              </button>
            ))}
          </div>
        </div>

        <div>
          <Label>Tono</Label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--sp-2)" }}>
            {TONES.map((t) => (
              <button
                key={t}
                onClick={() => dispatch({ type: "SET_PROJECT", payload: { tone: t } })}
                style={{
                  padding: "6px 14px",
                  fontSize: "11px",
                  fontFamily: "inherit",
                  background: state.project.tone === t ? "var(--accent-muted)" : "var(--panel-2)",
                  color: state.project.tone === t ? "var(--accent)" : "var(--muted)",
                  border: state.project.tone === t ? "1px solid var(--accent-border)" : "1px solid var(--border)",
                  borderRadius: "var(--radius-full)",
                  cursor: "pointer",
                  transition: "all var(--transition-fast)",
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <Button
          disabled={!state.project.title.trim()}
          onClick={() => setStep(2)}
          size="lg"
        >
          Siguiente &rarr;
        </Button>
      </div>
    );
  }

  // === PASO 2: Guion ===
  function StepScript() {
    function handleGenerate() {
      const result = generateMockScript(state.project);
      dispatch({ type: "SET_SCRIPT", payload: result });
    }

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-4)" }}>
        <div style={{ display: "flex", gap: "var(--sp-2)", alignItems: "center" }}>
          <Button onClick={handleGenerate} size="sm">Generar guion mock</Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => dispatch({ type: "SET_SCRIPT", payload: { raw: "", scenes: [] } })}
          >
            Limpiar
          </Button>
          {state.script.scenes.length > 0 && (
            <Badge color="var(--success)" style={{ marginLeft: "auto" }}>
              {state.script.scenes.length} escenas
            </Badge>
          )}
        </div>

        <Textarea
          value={state.script.raw}
          onChange={(e) => dispatch({ type: "SET_SCRIPT_RAW", payload: e.target.value })}
          placeholder="Aca aparece el guion generado. Tambien podes escribir el tuyo."
          rows={12}
          style={{ minHeight: "200px" }}
        />

        {state.script.scenes.length > 0 && (
          <div>
            <Label>Escenas detectadas</Label>
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-1)" }}>
              {state.script.scenes.map((s) => (
                <Card key={s.id} style={{ padding: "var(--sp-2) var(--sp-3)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-2)" }}>
                    <Badge color="var(--accent)">
                      {formatTime(s.startSec)}-{formatTime(s.endSec)}
                    </Badge>
                    <span style={{ fontSize: "12px", color: "var(--text-secondary)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {s.narration.slice(0, 80)}{s.narration.length > 80 ? "..." : ""}
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: "flex", gap: "var(--sp-2)" }}>
          <Button variant="secondary" onClick={() => setStep(1)}>&larr; Anterior</Button>
          <Button
            disabled={state.script.scenes.length === 0}
            onClick={() => {
              const edl = generateMockEDL(state.script.scenes);
              dispatch({ type: "SET_EDL", payload: edl });
              setStep(3);
            }}
          >
            Generar EDL y continuar &rarr;
          </Button>
        </div>
      </div>
    );
  }

  // === PASO 3: Salida ===
  function StepOutput() {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-4)" }}>
        {/* Summary stats */}
        <Card>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "var(--sp-3)" }}>
            {[
              { label: "Escenas", value: state.script.scenes.length },
              { label: "EDL entries", value: state.edl.length },
              { label: "Duracion", value: `${state.project.durationSec}s` },
              { label: "Tono", value: state.project.tone },
            ].map((item, i) => (
              <div key={i}>
                <div style={{ fontSize: "10px", color: "var(--dim)", textTransform: "uppercase", marginBottom: "2px", fontWeight: 600, letterSpacing: "0.3px" }}>
                  {item.label}
                </div>
                <div style={{ fontSize: "13px", color: "var(--text-secondary)", fontWeight: 600 }}>
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Scene accordion */}
        <Label>Escenas + prompts visuales</Label>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-2)" }}>
          {state.script.scenes.map((s) => {
            const edlEntry = state.edl.find((e) => e.id === s.id);
            const isOpen = openScene === s.id;
            return (
              <Card key={s.id} style={{ padding: 0, overflow: "hidden" }}>
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
                    fontFamily: "inherit",
                    textAlign: "left",
                  }}
                >
                  <svg
                    width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--dim)"
                    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    style={{ transition: "transform var(--transition-fast)", transform: isOpen ? "rotate(90deg)" : "rotate(0deg)", flexShrink: 0 }}
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                  <Badge color="var(--accent)">{formatTime(s.startSec)}-{formatTime(s.endSec)}</Badge>
                  {edlEntry && <Badge color="var(--warning)">{edlEntry.motionLabel}</Badge>}
                  <span style={{ fontSize: "12px", color: "var(--text-secondary)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {s.narration.slice(0, 60)}{s.narration.length > 60 ? "..." : ""}
                  </span>
                </button>
                {/* Accordion body */}
                {isOpen && (
                  <div style={{ padding: "0 var(--sp-3) var(--sp-3)", borderTop: "1px solid var(--border-subtle)" }}>
                    <div style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.6, padding: "var(--sp-3) 0 var(--sp-2)" }}>
                      {s.narration}
                    </div>
                    {s.visualPrompt && (
                      <div style={{
                        fontSize: "11px",
                        color: "var(--muted)",
                        fontStyle: "italic",
                        background: "var(--panel-2)",
                        padding: "var(--sp-2) var(--sp-3)",
                        borderRadius: "var(--radius-sm)",
                        marginBottom: "var(--sp-2)",
                      }}>
                        {s.visualPrompt}
                      </div>
                    )}
                    {edlEntry && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--sp-3)", fontSize: "11px", color: "var(--muted)" }}>
                        <span><strong style={{ color: "var(--text-secondary)" }}>Motion:</strong> {edlEntry.motionLabel}</span>
                        <span><strong style={{ color: "var(--text-secondary)" }}>B-Roll:</strong> {edlEntry.brollQuery}</span>
                        <span><strong style={{ color: "var(--text-secondary)" }}>SFX:</strong> {edlEntry.sfx.efecto}</span>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: "var(--sp-2)", flexWrap: "wrap" }}>
          <Button variant="secondary" onClick={() => setStep(2)}>&larr; Anterior</Button>
          <Button onClick={() => exportJSON(state.project, state.script, state.edl)}>
            Exportar JSON
          </Button>
          <Button variant="secondary" onClick={() => exportTXT(state.project, state.script, state.edl)}>
            Exportar TXT
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              dispatch({ type: "RESET" });
              setStep(1);
            }}
          >
            Nuevo proyecto
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "720px" }}>
      {/* Header */}
      <div style={{ marginBottom: "var(--sp-6)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-2)", marginBottom: "var(--sp-2)" }}>
          <Badge color="var(--accent)">AUTOVIDEOS</Badge>
        </div>
        <h1 style={{ fontSize: "22px", marginBottom: "var(--sp-1)" }}>
          {step === 1 && "Configurar proyecto"}
          {step === 2 && "Guion"}
          {step === 3 && "Salida"}
        </h1>
        <p style={{ fontSize: "13px" }}>
          {step === 1 && "Defini el tema, duracion y tono del video."}
          {step === 2 && "Genera un guion mock o escribi el tuyo. Editable."}
          {step === 3 && "Revision final y exportacion de archivos."}
        </p>
      </div>

      {/* Stepper */}
      <div style={{ display: "flex", gap: "var(--sp-2)", marginBottom: "var(--sp-6)", alignItems: "center" }}>
        {STEPS.map((s, i) => (
          <div key={s.num} style={{ display: "flex", alignItems: "center", gap: "var(--sp-2)", flex: i < STEPS.length - 1 ? 1 : "none" }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--sp-2)",
              padding: "6px 12px",
              borderRadius: "var(--radius-full)",
              background: s.num === step ? "var(--accent-muted)" : s.num < step ? "var(--success-muted)" : "var(--panel-2)",
              border: `1px solid ${s.num === step ? "var(--accent-border)" : s.num < step ? "var(--success)20" : "var(--border)"}`,
              transition: "all var(--transition-base)",
            }}>
              <span style={{
                width: "18px",
                height: "18px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "10px",
                fontWeight: 700,
                background: s.num === step ? "var(--accent)" : s.num < step ? "var(--success)" : "var(--border)",
                color: s.num <= step ? "#fff" : "var(--dim)",
              }}>
                {s.num < step ? (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : s.num}
              </span>
              <span style={{
                fontSize: "11px",
                fontWeight: 600,
                color: s.num === step ? "var(--accent)" : s.num < step ? "var(--success)" : "var(--dim)",
              }}>
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div style={{
                flex: 1,
                height: "1px",
                background: s.num < step ? "var(--success)" : "var(--border)",
                transition: "background var(--transition-base)",
              }} />
            )}
          </div>
        ))}
      </div>

      {step === 1 && <StepConfig />}
      {step === 2 && <StepScript />}
      {step === 3 && <StepOutput />}
    </div>
  );
}

function Label({ children }) {
  return (
    <label style={{
      fontSize: "10px",
      fontWeight: 700,
      color: "var(--dim)",
      letterSpacing: "0.5px",
      textTransform: "uppercase",
      marginBottom: "var(--sp-2)",
      display: "block",
    }}>
      {children}
    </label>
  );
}
