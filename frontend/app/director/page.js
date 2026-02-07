"use client";

import { useState, useRef } from "react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Tabs from "@/components/ui/Tabs";
import Textarea from "@/components/ui/Textarea";
import InlineNotice from "@/components/ui/InlineNotice";
import EmptyState from "@/components/ui/EmptyState";
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

  function copyToClipboard(text) {
    navigator.clipboard.writeText(text).catch(() => {});
  }

  const hasScenes = state.script.scenes.length > 0;
  const hasEDL = state.edl.length > 0;

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "var(--sp-6)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-2)", marginBottom: "var(--sp-2)" }}>
          <Badge color="var(--pink)">DIRECTOR</Badge>
          <Badge color="var(--pink)" style={{ fontSize: "9px", padding: "1px 6px" }}>PRO</Badge>
        </div>
        <h1 style={{ fontSize: "22px", marginBottom: "var(--sp-1)" }}>
          Mapa de edicion
        </h1>
        <p style={{ fontSize: "13px" }}>
          Importa guion (texto o ScriptPack JSON) &rarr; detecta escenas &rarr; genera EDL &rarr; exporta.
        </p>
      </div>

      {/* 2-panel layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--sp-6)", alignItems: "start" }}>
        {/* === LEFT PANEL === */}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-3)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <SectionLabel>Guion</SectionLabel>
            <button
              onClick={() => fileRef.current?.click()}
              style={{
                fontSize: "11px",
                color: "var(--muted)",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontFamily: "inherit",
                padding: "2px 0",
                transition: "color var(--transition-fast)",
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

          <Textarea
            value={state.script.raw}
            onChange={(e) => {
              dispatch({ type: "SET_SCRIPT_RAW", payload: e.target.value });
              setImportMsg(null);
            }}
            placeholder={"Pega tu guion aca.\n\nTexto plano con timestamps:\n[0:00] Escena uno...\n[0:15] Escena dos...\n\nO ScriptPack JSON:\n{ \"_format\": \"celeste_scriptpack_v1\", ... }\n\nO simplemente parrafos."}
            rows={16}
            style={{ minHeight: "300px" }}
          />

          {/* Feedback */}
          {importMsg && (
            <InlineNotice variant={importMsg.ok ? "success" : "error"}>
              {importMsg.text}
            </InlineNotice>
          )}

          {/* Action buttons */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--sp-2)" }}>
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
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "var(--sp-3)" }}>
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
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-3)" }}>
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
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-2)" }}>
              {!hasScenes && (
                <EmptyState
                  icon={
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                  }
                >
                  Pega un guion a la izquierda y presiona &quot;Detectar escenas&quot;.
                </EmptyState>
              )}
              {state.script.scenes.map((s) => (
                <Card key={s.id} style={{ padding: "var(--sp-3)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-2)", marginBottom: "var(--sp-2)" }}>
                    <Badge color="var(--pink)">#{s.id}</Badge>
                    <Badge color="var(--accent)">
                      {formatTime(s.startSec)} - {formatTime(s.endSec)}
                    </Badge>
                    <span style={{ fontSize: "10px", color: "var(--dim)", marginLeft: "auto" }}>
                      {s.endSec - s.startSec}s
                    </span>
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.6 }}>
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
                      marginTop: "var(--sp-2)",
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
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-2)" }}>
              {!hasEDL && (
                <EmptyState
                  icon={
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                      <path d="m17 2-5 5-5-5" />
                    </svg>
                  }
                >
                  Detecta escenas primero, luego presiona &quot;Generar EDL&quot;.
                </EmptyState>
              )}
              {state.edl.map((entry) => (
                <EDLCard key={entry.id} entry={entry} onCopy={copyToClipboard} />
              ))}
            </div>
          )}

          {/* --- Tab: Export --- */}
          {tab === "export" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-3)" }}>
              {!hasScenes && !hasEDL && (
                <EmptyState
                  icon={
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                  }
                >
                  Necesitas escenas o EDL para exportar.
                </EmptyState>
              )}
              {(hasScenes || hasEDL) && (
                <>
                  <Card>
                    <SectionLabel>Resumen del proyecto</SectionLabel>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "var(--sp-3)", marginTop: "var(--sp-3)" }}>
                      <Stat label="Titulo" value={state.project.title || "Sin titulo"} />
                      <Stat label="Escenas" value={state.script.scenes.length} />
                      <Stat label="EDL" value={state.edl.length || "\u2014"} />
                      <Stat label="Tono" value={state.project.tone} />
                    </div>
                  </Card>

                  <div style={{ display: "flex", gap: "var(--sp-2)" }}>
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
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--sp-3)" }}>
                        <Card>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--sp-3)" }}>
                            <div style={{ fontSize: "10px", fontWeight: 700, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.3px" }}>
                              B-Roll a buscar ({state.edl.length})
                            </div>
                            <CopyBtn onClick={() => copyToClipboard(state.edl.map((e, i) => `${i + 1}. [${e.brollTimestamp}] ${e.brollQuery}`).join("\n"))} />
                          </div>
                          {state.edl.map((e, i) => (
                            <div key={i} style={{ fontSize: "11px", color: "var(--text-secondary)", marginBottom: "var(--sp-1)", display: "flex", gap: "var(--sp-2)" }}>
                              <span style={{ color: "var(--dim)", flexShrink: 0 }}>{i + 1}.</span>
                              <span><span className="mono" style={{ color: "var(--muted)", fontSize: "10px" }}>[{e.brollTimestamp}]</span> {e.brollQuery}</span>
                            </div>
                          ))}
                        </Card>
                        <Card>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--sp-3)" }}>
                            <div style={{ fontSize: "10px", fontWeight: 700, color: "var(--success)", textTransform: "uppercase", letterSpacing: "0.3px" }}>
                              SFX necesarios
                            </div>
                            <CopyBtn onClick={() => copyToClipboard([...new Set(state.edl.map((e) => `${e.sfx.efecto} (${e.sfx.intensidad})`))].join("\n"))} />
                          </div>
                          {[...new Set(state.edl.map((e) => `${e.sfx.efecto} (${e.sfx.intensidad})`))].map((s, i) => (
                            <div key={i} style={{ fontSize: "11px", color: "var(--text-secondary)", marginBottom: "var(--sp-1)", display: "flex", gap: "var(--sp-2)" }}>
                              <span style={{ color: "var(--dim)", flexShrink: 0 }}>{i + 1}.</span>
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
function EDLCard({ entry, onCopy }) {
  return (
    <Card style={{ padding: "var(--sp-3)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-2)", marginBottom: "var(--sp-3)", flexWrap: "wrap" }}>
        <Badge color="var(--pink)">#{entry.id}</Badge>
        <Badge color="var(--accent)">
          {formatTime(entry.startSec)} - {formatTime(entry.endSec)}
        </Badge>
        <Badge color="var(--warning)">{entry.motionLabel}</Badge>
        <span style={{
          fontSize: "9px",
          color: "var(--muted)",
          background: "var(--panel-2)",
          padding: "2px 6px",
          borderRadius: "var(--radius-sm)",
        }}>
          {entry.motionType}
        </span>
      </div>

      {/* EDL table rows */}
      <div style={{ display: "grid", gap: "var(--sp-2)" }}>
        <Row label="Motion">
          <span style={{ color: "var(--text-secondary)" }}>{entry.motionLabel}</span>
          {entry.motionParams.from !== undefined && (
            <span className="mono" style={{ color: "var(--muted)", fontSize: "10px", marginLeft: "var(--sp-2)" }}>
              {entry.motionParams.from} &rarr; {entry.motionParams.to}
            </span>
          )}
          <Reason>{entry.motionReason}</Reason>
        </Row>

        <Row label="B-Roll">
          <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-2)" }}>
            <span className="mono" style={{ color: "var(--accent)", fontSize: "10px" }}>{entry.brollTimestamp}</span>
            <CopyBtn onClick={() => onCopy(entry.brollQuery)} />
          </div>
          <div style={{
            fontSize: "11px",
            color: "var(--text-secondary)",
            background: "var(--panel-2)",
            padding: "var(--sp-1) var(--sp-2)",
            borderRadius: "var(--radius-sm)",
            marginTop: "var(--sp-1)",
          }} className="mono">
            {entry.brollQuery}
          </div>
          <Reason>{entry.brollReason}</Reason>
        </Row>

        <Row label="SFX">
          <span style={{ color: "var(--text-secondary)" }}>{entry.sfx.efecto}</span>
          <span style={{ color: "var(--muted)", fontSize: "10px", marginLeft: "var(--sp-1)" }}>
            ({entry.sfx.intensidad})
          </span>
        </Row>

        <Row label="Transicion">
          <span style={{ color: "var(--text-secondary)" }}>{entry.transition.tipo}</span>
          {entry.transition.duracion > 0 && (
            <span style={{ color: "var(--muted)", fontSize: "10px", marginLeft: "var(--sp-1)" }}>
              {entry.transition.duracion}s
            </span>
          )}
        </Row>
      </div>
    </Card>
  );
}

// --- Copy button ---
function CopyBtn({ onClick }) {
  return (
    <button
      onClick={onClick}
      title="Copiar"
      style={{
        background: "none",
        border: "none",
        cursor: "pointer",
        color: "var(--dim)",
        padding: "2px",
        display: "flex",
        alignItems: "center",
        transition: "color var(--transition-fast)",
      }}
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
      </svg>
    </button>
  );
}

// --- Helpers ---
function SectionLabel({ children }) {
  return (
    <div style={{
      fontSize: "11px",
      fontWeight: 600,
      color: "var(--dim)",
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
      <div style={{ fontSize: "10px", color: "var(--dim)", textTransform: "uppercase", marginBottom: "2px", fontWeight: 600, letterSpacing: "0.3px" }}>
        {label}
      </div>
      <div style={{ fontSize: "13px", color: "var(--text-secondary)", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {value}
      </div>
    </div>
  );
}

function Row({ label, children }) {
  return (
    <div style={{ padding: "var(--sp-1) 0", borderBottom: "1px solid var(--border-subtle)" }}>
      <span style={{ fontSize: "9px", color: "var(--dim)", textTransform: "uppercase", marginRight: "var(--sp-2)", fontWeight: 700, letterSpacing: "0.3px" }}>
        {label}
      </span>
      <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>{children}</div>
    </div>
  );
}

function Reason({ children }) {
  return (
    <div style={{ fontSize: "10px", color: "var(--muted)", fontStyle: "italic", marginTop: "2px" }}>
      {children}
    </div>
  );
}
