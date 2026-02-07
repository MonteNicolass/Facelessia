"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { useStore } from "@/lib/store";
import { generateMockScript, generateMockEDL } from "@/lib/mock-generator";
import { formatTime } from "@/lib/parser";
import { exportJSON, exportTXT } from "@/lib/exporters";

const TONES = ["informativo", "dramatico", "motivacional", "casual", "educativo"];
const DURATIONS = [30, 45, 60, 90];

export default function AutoVideosPage() {
  const { state, dispatch } = useStore();
  const [step, setStep] = useState(1);

  // === PASO 1: Config ===
  function StepConfig() {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* Tema */}
        <div>
          <Label>Tema del video</Label>
          <textarea
            value={state.project.title}
            onChange={(e) => dispatch({ type: "SET_PROJECT", payload: { title: e.target.value } })}
            placeholder="Ej: La caida del Imperio Romano"
            rows={3}
            style={inputStyle}
          />
        </div>

        {/* Duracion */}
        <div>
          <Label>Duracion (segundos)</Label>
          <div style={{ display: "flex", gap: "6px" }}>
            {DURATIONS.map((d) => (
              <button
                key={d}
                onClick={() => dispatch({ type: "SET_PROJECT", payload: { durationSec: d } })}
                style={{
                  flex: 1,
                  padding: "8px 0",
                  fontSize: "12px",
                  fontWeight: 600,
                  fontFamily: "inherit",
                  background: state.project.durationSec === d ? "#8b5cf615" : "#111116",
                  color: state.project.durationSec === d ? "#8b5cf6" : "#555",
                  border: state.project.durationSec === d ? "1px solid #8b5cf640" : "1px solid #1a1a22",
                  borderRadius: "6px",
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                {d}s
              </button>
            ))}
          </div>
        </div>

        {/* Tono */}
        <div>
          <Label>Tono</Label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            {TONES.map((t) => (
              <button
                key={t}
                onClick={() => dispatch({ type: "SET_PROJECT", payload: { tone: t } })}
                style={{
                  padding: "6px 14px",
                  fontSize: "11px",
                  fontFamily: "inherit",
                  background: state.project.tone === t ? "#8b5cf612" : "#111116",
                  color: state.project.tone === t ? "#8b5cf6" : "#666",
                  border: state.project.tone === t ? "1px solid #8b5cf630" : "1px solid #1a1a22",
                  borderRadius: "20px",
                  cursor: "pointer",
                  transition: "all 0.15s",
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
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div style={{ display: "flex", gap: "8px" }}>
          <Button onClick={handleGenerate}>Generar guion mock</Button>
          {state.script.scenes.length > 0 && (
            <Badge color="#10b981" style={{ alignSelf: "center" }}>
              {state.script.scenes.length} escenas
            </Badge>
          )}
        </div>

        <textarea
          value={state.script.raw}
          onChange={(e) => dispatch({ type: "SET_SCRIPT_RAW", payload: e.target.value })}
          placeholder="Aca aparece el guion generado. Tambien podes escribir el tuyo."
          rows={12}
          style={{ ...inputStyle, minHeight: "200px" }}
        />

        {/* Lista de escenas */}
        {state.script.scenes.length > 0 && (
          <div>
            <Label>Escenas detectadas</Label>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              {state.script.scenes.map((s) => (
                <Card key={s.id}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <Badge color="#8b5cf6">
                      {formatTime(s.startSec)}-{formatTime(s.endSec)}
                    </Badge>
                    <span style={{ fontSize: "11px", color: "#888", flex: 1 }}>
                      {s.narration.slice(0, 80)}{s.narration.length > 80 ? "..." : ""}
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: "flex", gap: "8px" }}>
          <Button variant="secondary" onClick={() => setStep(1)}>&larr; Anterior</Button>
          <Button
            disabled={state.script.scenes.length === 0}
            onClick={() => {
              const edl = generateMockEDL(state.script.scenes);
              dispatch({ type: "SET_EDL", payload: edl });
              setStep(3);
            }}
          >
            Siguiente &rarr;
          </Button>
        </div>
      </div>
    );
  }

  // === PASO 3: Salida ===
  function StepOutput() {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {/* Resumen */}
        <Card>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "10px" }}>
            {[
              { label: "Escenas", value: state.script.scenes.length },
              { label: "EDL entries", value: state.edl.length },
              { label: "Duracion", value: `${state.project.durationSec}s` },
              { label: "Tono", value: state.project.tone },
            ].map((item, i) => (
              <div key={i}>
                <div style={{ fontSize: "9px", color: "#444", textTransform: "uppercase", marginBottom: "2px" }}>
                  {item.label}
                </div>
                <div style={{ fontSize: "13px", color: "#999", fontWeight: 600 }}>
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Escenas con prompts */}
        <Label>Escenas + prompts visuales</Label>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {state.script.scenes.map((s) => {
            const edlEntry = state.edl.find((e) => e.id === s.id);
            return (
              <Card key={s.id}>
                <div style={{ display: "flex", gap: "10px", marginBottom: "6px" }}>
                  <Badge color="#8b5cf6">{formatTime(s.startSec)}-{formatTime(s.endSec)}</Badge>
                  {edlEntry && <Badge color="#f59e0b">{edlEntry.motion}</Badge>}
                </div>
                <div style={{ fontSize: "11px", color: "#888", marginBottom: "6px" }}>{s.narration}</div>
                {s.visualPrompt && (
                  <div style={{ fontSize: "10px", color: "#555", fontStyle: "italic", background: "#111116", padding: "6px 10px", borderRadius: "4px" }}>
                    {s.visualPrompt}
                  </div>
                )}
              </Card>
            );
          })}
        </div>

        {/* Exports */}
        <div style={{ display: "flex", gap: "8px" }}>
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

  // === Render ===
  return (
    <div style={{ padding: "40px 48px", maxWidth: "760px" }}>
      {/* Header */}
      <div style={{ marginBottom: "32px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
          <Badge color="#8b5cf6">AUTOVIDEOS</Badge>
          <span style={{ fontSize: "11px", color: "#333" }}>
            Paso {step} de 3
          </span>
        </div>
        <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#e5e5e5", margin: 0, letterSpacing: "-0.5px" }}>
          {step === 1 && "Configurar proyecto"}
          {step === 2 && "Guion"}
          {step === 3 && "Salida"}
        </h1>
        <p style={{ fontSize: "12px", color: "#444", margin: "4px 0 0" }}>
          {step === 1 && "Defini el tema, duracion y tono del video."}
          {step === 2 && "Genera un guion mock o escribi el tuyo. Editable."}
          {step === 3 && "Revision final y exportacion de archivos."}
        </p>
      </div>

      {/* Steps */}
      <div style={{ display: "flex", gap: "4px", marginBottom: "24px" }}>
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            style={{
              flex: 1,
              height: "3px",
              borderRadius: "2px",
              background: s <= step ? "#8b5cf6" : "#1a1a22",
              transition: "background 0.2s",
            }}
          />
        ))}
      </div>

      {step === 1 && <StepConfig />}
      {step === 2 && <StepScript />}
      {step === 3 && <StepOutput />}
    </div>
  );
}

// Helpers
function Label({ children }) {
  return (
    <label
      style={{
        fontSize: "10px",
        fontWeight: 700,
        color: "#555",
        letterSpacing: "0.5px",
        textTransform: "uppercase",
        marginBottom: "6px",
        display: "block",
      }}
    >
      {children}
    </label>
  );
}

const inputStyle = {
  width: "100%",
  background: "#111116",
  border: "1px solid #1a1a22",
  borderRadius: "8px",
  padding: "10px 14px",
  fontSize: "13px",
  color: "#ccc",
  fontFamily: "inherit",
  outline: "none",
  resize: "vertical",
  transition: "border-color 0.15s",
};
