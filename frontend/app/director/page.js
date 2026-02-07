"use client";

import { useState, useRef } from "react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Tabs from "@/components/ui/Tabs";
import { useStore } from "@/lib/store";
import { parseScript, formatTime, validateScriptPack } from "@/lib/parser";
import { generateMockEDL } from "@/lib/mock-generator";
import { exportJSON, exportTXT } from "@/lib/exporters";

export default function DirectorPage() {
  const { state, dispatch } = useStore();
  const [tab, setTab] = useState("scenes");
  const [importMsg, setImportMsg] = useState(null);
  const fileRef = useRef(null);

  // --- Acciones principales ---

  function handleImportScriptPack() {
    const text = state.script.raw.trim();
    if (!text) return;

    try {
      const obj = JSON.parse(text);
      const result = validateScriptPack(obj);
      if (result.valid) {
        dispatch({ type: "IMPORT_SCRIPTPACK", payload: result.data });
        setImportMsg({ ok: true, text: `ScriptPack importado: ${result.data.scenes.length} escenas` });
        return;
      }
      setImportMsg({ ok: false, text: result.error });
    } catch {
      setImportMsg({ ok: false, text: "No es JSON valido. Usa 'Detectar escenas' para texto plano." });
    }
  }

  function handleDetect() {
    setImportMsg(null);
    const scenes = parseScript(state.script.raw, state.project.durationSec);
    dispatch({ type: "SET_SCENES", payload: scenes });
    if (scenes.length > 0) {
      setImportMsg({ ok: true, text: `${scenes.length} escenas detectadas` });
    } else {
      setImportMsg({ ok: false, text: "No se detectaron escenas. Verifica el texto." });
    }
  }

  function handleGenerateEDL() {
    if (state.script.scenes.length === 0) return;
    const edl = generateMockEDL(state.script.scenes);
    dispatch({ type: "SET_EDL", payload: edl });
    setTab("edl");
    setImportMsg({ ok: true, text: `EDL generado: ${edl.length} entries` });
  }

  function handleFileImport(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result;
      if (typeof content === "string") {
        dispatch({ type: "SET_SCRIPT_RAW", payload: content });
        setImportMsg({ ok: true, text: `Archivo cargado: ${file.name}` });
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  function handleReset() {
    dispatch({ type: "SET_SCRIPT", payload: { raw: "", scenes: [] } });
    dispatch({ type: "SET_EDL", payload: [] });
    setTab("scenes");
    setImportMsg(null);
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
          }}>KEY</span>
        </div>
        <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#e5e5e5", margin: 0, letterSpacing: "-0.5px" }}>
          Mapa de edicion
        </h1>
        <p style={{ fontSize: "12px", color: "#444", margin: "4px 0 0" }}>
          Importa guion (texto o ScriptPack JSON) &rarr; detecta escenas &rarr; genera EDL &rarr; exporta.
        </p>
      </div>

      {/* 2-panel layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", alignItems: "start" }}>
        {/* === LEFT PANEL === */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <SectionLabel>Guion</SectionLabel>
            <button
              onClick={() => fileRef.current?.click()}
              style={{
                fontSize: "10px",
                color: "#555",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontFamily: "inherit",
                textDecoration: "underline",
              }}
            >
              Cargar archivo
            </button>
            <input
              ref={fileRef}
              type="file"
              accept=".json,.txt,.md"
              onChange={handleFileImport}
              style={{ display: "none" }}
            />
          </div>

          <textarea
            value={state.script.raw}
            onChange={(e) => {
              dispatch({ type: "SET_SCRIPT_RAW", payload: e.target.value });
              setImportMsg(null);
            }}
            placeholder={"Pega tu guion aca.\n\nTexto plano con timestamps:\n[0:00] Escena uno...\n[0:15] Escena dos...\n\nO ScriptPack JSON:\n{ \"_format\": \"celeste_scriptpack_v1\", ... }\n\nO simplemente parrafos."}
            rows={16}
            style={textareaStyle}
          />

          {/* Mensaje de feedback */}
          {importMsg && (
            <div style={{
              fontSize: "10px",
              color: importMsg.ok ? "#10b981" : "#ef4444",
              padding: "6px 10px",
              background: importMsg.ok ? "#10b98110" : "#ef444410",
              borderRadius: "6px",
              border: `1px solid ${importMsg.ok ? "#10b98120" : "#ef444420"}`,
            }}>
              {importMsg.text}
            </div>
          )}

          {/* Action buttons */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            <Button
              size="sm"
              variant="secondary"
              onClick={handleImportScriptPack}
              disabled={!state.script.raw.trim()}
            >
              Importar ScriptPack
            </Button>
            <Button
              size="sm"
              onClick={handleDetect}
              disabled={!state.script.raw.trim()}
            >
              Detectar escenas
            </Button>
            <Button
              size="sm"
              onClick={handleGenerateEDL}
              disabled={!hasScenes}
            >
              Generar EDL
            </Button>
            <Button size="sm" variant="ghost" onClick={handleReset}>
              Limpiar
            </Button>
          </div>

          {/* Stats */}
          {hasScenes && (
            <Card>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
                <Stat label="Escenas" value={state.script.scenes.length} />
                <Stat label="EDL" value={state.edl.length || "\u2014"} />
                <Stat
                  label="Duracion"
                  value={
                    state.script.scenes.length > 0
                      ? formatTime(state.script.scenes[state.script.scenes.length - 1].endSec)
                      : "\u2014"
                  }
                />
              </div>
            </Card>
          )}
        </div>

        {/* === RIGHT PANEL === */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <Tabs
            tabs={[
              { id: "scenes", label: "Escenas", count: state.script.scenes.length || undefined },
              { id: "edl", label: "EDL", count: state.edl.length || undefined },
              { id: "export", label: "Export" },
            ]}
            active={tab}
            onChange={setTab}
          />

          {/* --- Tab: Escenas --- */}
          {tab === "scenes" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {!hasScenes && (
                <EmptyState>
                  Pega un guion a la izquierda y presiona &quot;Detectar escenas&quot;.
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

          {/* --- Tab: EDL --- */}
          {tab === "edl" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {!hasEDL && (
                <EmptyState>
                  Detecta escenas primero, luego presiona &quot;Generar EDL&quot;.
                </EmptyState>
              )}
              {state.edl.map((entry) => (
                <EDLCard key={entry.id} entry={entry} />
              ))}
            </div>
          )}

          {/* --- Tab: Export --- */}
          {tab === "export" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {!hasScenes && !hasEDL && (
                <EmptyState>
                  Necesitas escenas o EDL para exportar.
                </EmptyState>
              )}
              {(hasScenes || hasEDL) && (
                <>
                  <Card>
                    <SectionLabel>Resumen del proyecto</SectionLabel>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "10px", marginTop: "10px" }}>
                      <Stat label="Titulo" value={state.project.title || "Sin titulo"} />
                      <Stat label="Escenas" value={state.script.scenes.length} />
                      <Stat label="EDL" value={state.edl.length || "\u2014"} />
                      <Stat label="Tono" value={state.project.tone} />
                    </div>
                  </Card>

                  <div style={{ display: "flex", gap: "8px" }}>
                    <Button onClick={() => exportJSON(state.project, state.script, state.edl)}>
                      Exportar JSON
                    </Button>
                    <Button variant="secondary" onClick={() => exportTXT(state.project, state.script, state.edl)}>
                      Exportar TXT
                    </Button>
                  </div>

                  {hasEDL && (
                    <>
                      <SectionLabel>Shopping lists</SectionLabel>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                        <Card>
                          <div style={{ fontSize: "10px", fontWeight: 700, color: "#6366f1", marginBottom: "8px" }}>
                            B-Roll a buscar ({state.edl.length})
                          </div>
                          {state.edl.map((e, i) => (
                            <div key={i} style={{ fontSize: "10px", color: "#888", marginBottom: "4px", display: "flex", gap: "6px" }}>
                              <span style={{ color: "#333" }}>{i + 1}.</span>
                              <span>[{e.brollTimestamp}] {e.brollQuery}</span>
                            </div>
                          ))}
                        </Card>
                        <Card>
                          <div style={{ fontSize: "10px", fontWeight: 700, color: "#10b981", marginBottom: "8px" }}>
                            SFX necesarios
                          </div>
                          {[...new Set(state.edl.map((e) => `${e.sfx.efecto} (${e.sfx.intensidad})`))].map((s, i) => (
                            <div key={i} style={{ fontSize: "10px", color: "#888", marginBottom: "4px", display: "flex", gap: "6px" }}>
                              <span style={{ color: "#333" }}>{i + 1}.</span>
                              <span>{s}</span>
                            </div>
                          ))}
                        </Card>
                      </div>
                    </>
                  )}
                </>
              )}
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
      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "10px", flexWrap: "wrap" }}>
        <Badge color="#ec4899">#{entry.id}</Badge>
        <Badge color="#8b5cf6">
          {formatTime(entry.startSec)} - {formatTime(entry.endSec)}
        </Badge>
        <Badge color="#f59e0b">{entry.motionLabel}</Badge>
        <span style={{
          fontSize: "8px",
          color: "#555",
          background: "#ffffff08",
          padding: "2px 6px",
          borderRadius: "3px",
        }}>
          {entry.motionType}
        </span>
      </div>

      <Row label="Motion">
        <span style={{ color: "#ccc" }}>{entry.motionLabel}</span>
        {entry.motionParams.from !== undefined && (
          <span style={{ color: "#555", fontSize: "10px", marginLeft: "6px" }}>
            {entry.motionParams.from} &rarr; {entry.motionParams.to}
          </span>
        )}
        <Reason>{entry.motionReason}</Reason>
      </Row>

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

      <Row label="SFX">
        <span style={{ color: "#ccc" }}>{entry.sfx.efecto}</span>
        <span style={{ color: "#555", fontSize: "9px", marginLeft: "4px" }}>
          ({entry.sfx.intensidad})
        </span>
      </Row>

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
    <div style={{
      fontSize: "10px",
      fontWeight: 700,
      color: "#555",
      letterSpacing: "0.5px",
      textTransform: "uppercase",
    }}>
      {children}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: "9px", color: "#444", textTransform: "uppercase", marginBottom: "2px" }}>
        {label}
      </div>
      <div style={{ fontSize: "12px", color: "#999", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {value}
      </div>
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
  minHeight: "300px",
};
