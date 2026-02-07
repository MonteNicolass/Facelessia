"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Tabs from "@/components/ui/Tabs";
import { useStore } from "@/lib/store";
import { parseScript, formatTime } from "@/lib/parser";
import { generateMockEDL } from "@/lib/mock-generator";
import { exportJSON, exportTXT } from "@/lib/exporters";

export default function DirectorPage() {
  const { state, dispatch } = useStore();
  const [tab, setTab] = useState("scenes");

  function handleDetect() {
    const scenes = parseScript(state.script.raw, state.project.durationSec);
    dispatch({ type: "SET_SCENES", payload: scenes });
  }

  function handleGenerateEDL() {
    if (state.script.scenes.length === 0) return;
    const edl = generateMockEDL(state.script.scenes);
    dispatch({ type: "SET_EDL", payload: edl });
    setTab("edl");
  }

  function handleReset() {
    dispatch({ type: "SET_SCRIPT", payload: { raw: "", scenes: [] } });
    dispatch({ type: "SET_EDL", payload: [] });
    setTab("scenes");
  }

  const hasScenes = state.script.scenes.length > 0;
  const hasEDL = state.edl.length > 0;

  return (
    <div style={{ padding: "40px 48px", maxWidth: "1100px" }}>
      {/* Header */}
      <div style={{ marginBottom: "28px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
          <Badge color="#ec4899">DIRECTOR</Badge>
          <span style={{
            fontSize: "8px",
            fontWeight: 700,
            background: "#ec489920",
            color: "#ec4899",
            padding: "2px 6px",
            borderRadius: "3px",
          }}>
            KEY
          </span>
        </div>
        <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#e5e5e5", margin: 0, letterSpacing: "-0.5px" }}>
          Mapa de edicion
        </h1>
        <p style={{ fontSize: "12px", color: "#444", margin: "4px 0 0" }}>
          Pega un guion, detecta escenas y genera el EDL completo.
        </p>
      </div>

      {/* 2-panel layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", alignItems: "start" }}>
        {/* === LEFT PANEL: Input === */}
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <SectionLabel>Guion</SectionLabel>
          <textarea
            value={state.script.raw}
            onChange={(e) => dispatch({ type: "SET_SCRIPT_RAW", payload: e.target.value })}
            placeholder={"Pega tu guion aca (con o sin timestamps).\n\nEjemplos de formatos:\n[0:00] Escena uno...\n(0:15) Escena dos...\n0:30 - Escena tres...\n\nO simplemente parrafos separados."}
            rows={18}
            style={textareaStyle}
          />

          {/* Action buttons */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            <Button
              onClick={handleDetect}
              disabled={!state.script.raw.trim()}
            >
              Detectar escenas
            </Button>
            <Button
              variant="secondary"
              onClick={handleGenerateEDL}
              disabled={!hasScenes}
            >
              Generar EDL
            </Button>
            <Button variant="ghost" onClick={handleReset}>
              Limpiar
            </Button>
          </div>

          {/* Stats */}
          {hasScenes && (
            <Card>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
                <Stat label="Escenas" value={state.script.scenes.length} />
                <Stat label="EDL entries" value={state.edl.length} />
                <Stat
                  label="Duracion total"
                  value={
                    state.script.scenes.length > 0
                      ? formatTime(state.script.scenes[state.script.scenes.length - 1].endSec)
                      : "\u2014"
                  }
                />
              </div>
            </Card>
          )}

          {/* Export buttons */}
          {hasEDL && (
            <div style={{ display: "flex", gap: "8px" }}>
              <Button size="sm" onClick={() => exportJSON(state.project, state.script, state.edl)}>
                Exportar JSON
              </Button>
              <Button size="sm" variant="secondary" onClick={() => exportTXT(state.project, state.script, state.edl)}>
                Exportar TXT
              </Button>
            </div>
          )}
        </div>

        {/* === RIGHT PANEL: Results === */}
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <Tabs
            tabs={[
              { id: "scenes", label: "Escenas", count: state.script.scenes.length || undefined },
              { id: "edl", label: "EDL", count: state.edl.length || undefined },
            ]}
            active={tab}
            onChange={setTab}
          />

          {/* Scenes tab */}
          {tab === "scenes" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {!hasScenes && (
                <EmptyState>
                  Pega un guion a la izquierda y presiona &quot;Detectar escenas&quot; para comenzar.
                </EmptyState>
              )}
              {state.script.scenes.map((s) => (
                <Card key={s.id}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                    <Badge color="#ec4899">#{s.id}</Badge>
                    <Badge color="#8b5cf6">
                      {formatTime(s.startSec)} - {formatTime(s.endSec)}
                    </Badge>
                    <span style={{ fontSize: "9px", color: "#333" }}>
                      {s.endSec - s.startSec}s
                    </span>
                  </div>
                  <div style={{ fontSize: "11px", color: "#888", lineHeight: "1.5" }}>
                    {s.narration}
                  </div>
                  {s.visualPrompt && (
                    <div style={{
                      fontSize: "10px",
                      color: "#555",
                      fontStyle: "italic",
                      background: "#111116",
                      padding: "6px 10px",
                      borderRadius: "4px",
                      marginTop: "6px",
                    }}>
                      {s.visualPrompt}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}

          {/* EDL tab */}
          {tab === "edl" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {!hasEDL && (
                <EmptyState>
                  Primero detecta escenas, luego presiona &quot;Generar EDL&quot;.
                </EmptyState>
              )}
              {state.edl.map((entry) => (
                <EDLCard key={entry.id} entry={entry} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// --- EDL Card ---
function EDLCard({ entry }) {
  return (
    <Card>
      {/* Header row */}
      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "10px", flexWrap: "wrap" }}>
        <Badge color="#ec4899">#{entry.id}</Badge>
        <Badge color="#8b5cf6">
          {formatTime(entry.startSec)} - {formatTime(entry.endSec)}
        </Badge>
        <Badge color="#f59e0b">{entry.motion}</Badge>
        <Badge color="#10b981">{entry.motionSpeed}</Badge>
      </div>

      {/* Motion */}
      <Row label="Motion">
        <span style={{ color: "#ccc" }}>{entry.motion}</span>
        <span style={{ color: "#555", fontSize: "10px", marginLeft: "6px" }}>
          {entry.motionFrom} &rarr; {entry.motionTo}
        </span>
        <Reason>{entry.motionReason}</Reason>
      </Row>

      {/* B-Roll */}
      <Row label="B-Roll">
        <span style={{ color: "#8b5cf6", fontSize: "10px" }}>{entry.brollTimestamp}</span>
        <div style={{
          fontSize: "10px",
          color: "#ccc",
          background: "#111116",
          padding: "4px 8px",
          borderRadius: "4px",
          marginTop: "3px",
          fontFamily: "monospace",
        }}>
          {entry.brollQuery}
        </div>
        <Reason>{entry.brollReason}</Reason>
      </Row>

      {/* SFX */}
      <Row label="SFX">
        <span style={{ color: "#ccc" }}>{entry.sfx.efecto}</span>
        <span style={{ color: "#555", fontSize: "9px", marginLeft: "4px" }}>
          ({entry.sfx.intensidad})
        </span>
      </Row>

      {/* Transition */}
      <Row label="Transicion">
        <span style={{ color: "#ccc" }}>{entry.transition.tipo}</span>
        {entry.transition.duracion > 0 && (
          <span style={{ color: "#555", fontSize: "9px", marginLeft: "4px" }}>
            {entry.transition.duracion}s
          </span>
        )}
      </Row>
    </Card>
  );
}

// --- Helpers ---
function SectionLabel({ children }) {
  return (
    <label style={{
      fontSize: "10px",
      fontWeight: 700,
      color: "#555",
      letterSpacing: "0.5px",
      textTransform: "uppercase",
      display: "block",
    }}>
      {children}
    </label>
  );
}

function Stat({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: "9px", color: "#444", textTransform: "uppercase", marginBottom: "2px" }}>
        {label}
      </div>
      <div style={{ fontSize: "13px", color: "#999", fontWeight: 600 }}>{value}</div>
    </div>
  );
}

function Row({ label, children }) {
  return (
    <div style={{ marginBottom: "8px" }}>
      <span style={{ fontSize: "9px", color: "#444", textTransform: "uppercase", marginRight: "6px", fontWeight: 700 }}>
        {label}:
      </span>
      <div style={{ fontSize: "11px", color: "#888", marginTop: "2px" }}>{children}</div>
    </div>
  );
}

function Reason({ children }) {
  return (
    <div style={{ fontSize: "9px", color: "#555", fontStyle: "italic", marginTop: "2px" }}>
      {children}
    </div>
  );
}

function EmptyState({ children }) {
  return (
    <div style={{
      padding: "40px 20px",
      textAlign: "center",
      fontSize: "12px",
      color: "#333",
      border: "1px dashed #1a1a22",
      borderRadius: "10px",
    }}>
      {children}
    </div>
  );
}

const textareaStyle = {
  width: "100%",
  background: "#111116",
  border: "1px solid #1a1a22",
  borderRadius: "8px",
  padding: "12px 14px",
  fontSize: "12px",
  color: "#ccc",
  fontFamily: "inherit",
  outline: "none",
  resize: "vertical",
  lineHeight: "1.6",
  transition: "border-color 0.15s",
  minHeight: "320px",
};
